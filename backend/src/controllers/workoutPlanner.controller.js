const crypto = require('crypto');
const pino = require('pino');
const logger = pino();

const GeneratedWorkoutPlan = require('../models/GeneratedWorkoutPlan');
const UserPreference = require('../models/UserPreference');
const WorkoutLog = require('../models/WorkoutLog');
const BodyWeight = require('../models/BodyWeight');

const aiProvider = require('../services/aiProvider');
const aiConfig = require('../config/ai');
const systemPrompt = require('../prompts/workoutPlanner.system');
const { processPlanPipeline, extractJsonObject } = require('../services/workoutPlanPipeline.service');
const { renderMarkdownFromSchedule, renderCSVFromSchedule } = require('../services/markdownRenderer.service');
const { getDeterministicSplit } = require('../services/deterministicSplit.service');
const { generateDeterministicExplanation, validateAndMapExercise } = require('../services/exerciseValidation.service');
const eventBus = require('../services/eventBus.service');
const { isFeatureEnabled } = require('../config/featureFlags');
const { toPlanDTO, toPlanSummaryDTO } = require('../dto/workoutPlan.dto');

/**
 * Enforce single active plan ownership for a user
 */
async function enforceSingleActivePlan(userId, activePlanId) {
  await GeneratedWorkoutPlan.updateMany(
    { userId, _id: { $ne: activePlanId }, status: 'active', isDeleted: false },
    { $set: { status: 'draft', archivedAt: new Date() } }
  );
}

/**
 * Helper to get user preference memory
 */
async function getUserPref(userId) {
  let pref = await UserPreference.findOne({ userId });
  if (!pref) {
    pref = await UserPreference.create({ userId });
  }
  return pref;
}

/**
 * Calculate Muscle Volume Analytics from Schedule
 */
function calculateMuscleVolumeAnalytics(schedule) {
  const muscleVolume = {};
  if (Array.isArray(schedule)) {
    schedule.forEach(day => {
      (day.exercises || []).forEach(ex => {
        const meta = validateAndMapExercise(ex.exerciseName).metadata;
        const target = meta.primaryMuscle || 'General';
        muscleVolume[target] = (muscleVolume[target] || 0) + (ex.sets || 3);
      });
    });
  }
  return muscleVolume;
}

/**
 * Security Audit Logger Helper
 */
function auditLog(action, userId, planId, details = {}) {
  logger.info({
    event: 'SECURITY_AUDIT_LOG',
    action,
    userId,
    planId,
    details,
    timestamp: new Date().toISOString(),
  }, `[AUDIT] Action: ${action}`);
}

/**
 * Public Simple Health Check (/health)
 */
const getPublicHealth = async (req, res) => {
  res.json({ status: 'UP', service: 'FitSphere AI Workout Planner API', timestamp: new Date() });
};

/**
 * Protected Admin Metrics Endpoint (/admin/metrics) - Supports JSON & Prometheus Formats
 */
const getAdminMetrics = async (req, res) => {
  try {
    const { format } = req.query;
    const totalPlans = await GeneratedWorkoutPlan.countDocuments({ isDeleted: false });
    const plansWithMeta = await GeneratedWorkoutPlan.find({ isDeleted: false }, 'generationMetadata').lean();

    let totalLatency = 0;
    let validCount = 0;
    let repairCount = 0;
    let totalMapped = 0;
    let totalTokens = 0;
    let totalCostUsd = 0;

    plansWithMeta.forEach(p => {
      const meta = p.generationMetadata || {};
      totalLatency += (meta.generationTimeMs || 0);
      if (meta.validationPassed) validCount++;
      if (meta.repairAttempted) repairCount++;
      totalMapped += (meta.mappedExercises || 0);
      totalTokens += (meta.totalTokens || 0);
      totalCostUsd += (meta.estimatedCostUsd || 0);
    });

    const count = plansWithMeta.length || 1;

    if (format === 'prometheus' && isFeatureEnabled('PROMETHEUS_METRICS')) {
      res.setHeader('Content-Type', 'text/plain');
      const prometheusStr = `
# HELP fitsphere_ai_planner_total_plans Total workout plans generated
# TYPE fitsphere_ai_planner_total_plans counter
fitsphere_ai_planner_total_plans ${totalPlans}

# HELP fitsphere_ai_planner_avg_latency_ms Average generation latency in ms
# TYPE fitsphere_ai_planner_avg_latency_ms gauge
fitsphere_ai_planner_avg_latency_ms ${Math.round(totalLatency / count)}

# HELP fitsphere_ai_planner_tokens_total Total tokens consumed
# TYPE fitsphere_ai_planner_tokens_total counter
fitsphere_ai_planner_tokens_total ${totalTokens}

# HELP fitsphere_ai_planner_cost_usd Total estimated cost in USD
# TYPE fitsphere_ai_planner_cost_usd counter
fitsphere_ai_planner_cost_usd ${parseFloat(totalCostUsd.toFixed(4))}
`.trim();
      return res.send(prometheusStr);
    }

    res.json({
      success: true,
      service: 'FitSphere AI Workout Planner (SaaS Metrics)',
      timestamp: new Date(),
      metrics: {
        totalPlansGenerated: totalPlans,
        avgGenerationLatencyMs: Math.round(totalLatency / count),
        schemaValidationSuccessRatePercent: Math.round((validCount / count) * 100),
        validationRepairRatePercent: Math.round((repairCount / count) * 100),
        avgMappedExercisesPerPlan: Math.round(totalMapped / count),
        totalTokensConsumed: totalTokens,
        totalEstimatedCostUsd: parseFloat(totalCostUsd.toFixed(4)),
        avgCostPerPlanUsd: parseFloat((totalCostUsd / count).toFixed(6)),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 'ADMIN_METRICS_FAILED', message: 'Failed to retrieve admin metrics' });
  }
};

/**
 * Progress-Streamed AI Plan Generation
 */
const generatePlanStream = async (req, res) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const userId = req.user._id;
  const {
    goal = 'hypertrophy',
    experienceLevel = 'intermediate',
    daysPerWeek = 4,
    sessionDurationMinutes = 60,
    equipment = 'full_gym',
    location = 'gym',
    injuries = [],
    focusMuscles = [],
    durationWeeks = 8,
  } = req.body;

  const requestHash = crypto.createHash('sha256').update(JSON.stringify({
    userId: userId.toString(), goal, experienceLevel, daysPerWeek, equipment, durationWeeks
  })).digest('hex');

  const existingPlan = await GeneratedWorkoutPlan.findOne({
    userId,
    requestHash,
    isDeleted: false,
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  });

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('X-Request-ID', requestId);

  const writeProgress = (step) => {
    res.write(JSON.stringify({ type: 'progress', step, requestId }) + '\n');
  };

  if (existingPlan) {
    writeProgress('Reusing idempotent cached plan...');
    const derivedMarkdown = renderMarkdownFromSchedule(existingPlan.title, existingPlan.mesocycleStructure, existingPlan.structuredSchedule, existingPlan.confidence);
    res.write(JSON.stringify({
      type: 'done',
      requestId,
      planId: existingPlan._id.toString(),
      title: existingPlan.title,
      content: derivedMarkdown,
      structuredSchedule: existingPlan.structuredSchedule,
      confidence: existingPlan.confidence,
      idempotent: true,
    }) + '\n');
    return res.end();
  }

  try {
    writeProgress('Analyzing user preferences & workout logs...');
    const userPref = await getUserPref(userId);
    const recentLogs = await WorkoutLog.find({ userId }).sort({ date: -1 }).limit(10).lean();
    const splitInfo = getDeterministicSplit(daysPerWeek, goal, experienceLevel);

    writeProgress(`Selected optimal split: ${splitInfo.splitName}...`);

    const userPrompt = `
Generate a comprehensive Powerbuilding workout plan (5-6 exercises per day) with the following specifications:
- Goal: ${goal}
- Experience: ${experienceLevel}
- Days per week: ${daysPerWeek} (${splitInfo.splitName})
- Target Session Duration: ${sessionDurationMinutes} minutes
- Equipment: ${equipment} (${location})
- Reported Injuries/Limitations: ${injuries.join(', ') || 'None'}
- Focus Muscles: ${focusMuscles.join(', ') || 'General Balanced Growth'}
- Duration: ${durationWeeks} weeks
- Long-term Disliked Exercises to AVOID: ${(userPref.dislikedExercises || []).join(', ') || 'None'}
- Joint Pain Areas: ${(userPref.jointPainAreas || []).join(', ') || 'None'}
- Recent Workouts Logged: ${recentLogs.map(l => l.exerciseName).join(', ') || 'None'}

CRITICAL REQUIREMENT: Every single workout day MUST include EXACTLY 5 to 6 distinct exercises (1 Primary Heavy Compound, 1-2 Secondary Compound movements, and 2-3 Isolations/Accessories for Delts, Arms, Calves, or Core).
`;

    writeProgress('Generating structured plan with Groq AI...');
    const aiStart = Date.now();

    const result = await aiProvider.generate([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { requestId });

    const aiDurationMs = Date.now() - aiStart;

    writeProgress('Parsing & validating AJV schema...');

    let parsedJson;
    try {
      parsedJson = extractJsonObject(result.text);
    } catch (e) {
      writeProgress('Auto-repairing JSON formatting...');
      const repairResult = await aiProvider.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `The following text failed JSON parsing. Convert it into valid JSON matching the schema strictly:\n${result.text}` }
      ], { requestId });
      parsedJson = extractJsonObject(repairResult.text);
    }

    writeProgress('Validating exercise database & applying safety rules...');
    const { processedPlan, generationMetadata } = processPlanPipeline(parsedJson, aiDurationMs, result.tokenAnalytics || {});

    writeProgress('Finalizing plan & setting as active...');

    const derivedMarkdown = renderMarkdownFromSchedule(
      processedPlan.title,
      processedPlan.mesocycle,
      processedPlan.weeks,
      processedPlan.confidence
    );

    const muscleAnalytics = calculateMuscleVolumeAnalytics(processedPlan.weeks);

    const persistenceStart = Date.now();
    const newPlan = await GeneratedWorkoutPlan.create({
      userId,
      requestHash,
      title: processedPlan.title || `${durationWeeks}-Week ${goal} Plan`,
      status: 'active',
      activatedAt: new Date(),
      goal,
      experienceLevel,
      daysPerWeek,
      sessionDurationMinutes,
      equipment,
      location,
      injuries,
      focusMuscles,
      durationWeeks,
      mesocycleStructure: processedPlan.mesocycle || [],
      structuredSchedule: processedPlan.weeks || [],
      confidence: processedPlan.confidence || { score: 90, assumptions: [] },
      generationMetadata: {
        ...generationMetadata,
        retryCount: result.retryCount || 0,
        primaryModelFailed: !!result.fallbackAttempted,
        fallbackUsed: !!result.fallbackAttempted,
        fallbackModel: result.fallbackAttempted ? result.usedModel : null,
        stageTimings: {
          ...generationMetadata.stageTimings,
          persistenceMs: Date.now() - persistenceStart
        }
      },
      analytics: {
        completionRate: 100,
        totalWorkoutsLogged: 0,
        totalVolumeKg: 0,
        skippedCount: 0,
        avgRpe: 8.0,
        consistencyScore: 100,
        weeklyVolumePerMuscle: muscleAnalytics
      },
      aiMetadata: {
        provider: 'groq',
        model: result.usedModel || aiConfig.model,
        promptVersion: 'v1.0',
        generatedAt: new Date()
      },
      currentVersion: 1,
      versions: [{
        versionNumber: 1,
        title: processedPlan.title || 'Initial Plan',
        structuredSchedule: processedPlan.weeks || [],
        changedReason: 'Initial AI Plan Generation',
        authorType: 'AI',
        createdAt: new Date()
      }]
    });

    await enforceSingleActivePlan(userId, newPlan._id);
    
    // Event Driven Architecture Pub/Sub Event Dispatch
    eventBus.emit('PLAN_GENERATED', { userId, planId: newPlan._id, title: newPlan.title });
    auditLog('PLAN_GENERATED', userId, newPlan._id, { title: newPlan.title, goal });

    const responseTimeMs = Date.now() - startTime;
    logger.info({
      requestId,
      userId,
      planId: newPlan._id,
      timestamp: new Date().toISOString(),
      model: result.usedModel || aiConfig.model,
      responseTimeMs,
      completionStatus: 'success',
    }, 'AI Workout Plan generation success');

    res.write(JSON.stringify({
      type: 'done',
      requestId,
      planId: newPlan._id.toString(),
      title: newPlan.title,
      content: derivedMarkdown,
      structuredSchedule: newPlan.structuredSchedule,
      confidence: newPlan.confidence,
    }) + '\n');
    res.end();
  } catch (error) {
    logger.error({ requestId, userId, error: error.message }, 'AI Workout Plan generation failed');
    res.write(JSON.stringify({
      type: 'error',
      code: 'AI_GENERATION_FAILED',
      requestId,
      content: 'Failed to generate plan. Please try again.'
    }) + '\n');
    res.end();
  }
};

/**
 * Deterministic Token-Saving Explanation
 */
const explainPlan = async (req, res) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  try {
    if (!isFeatureEnabled('AI_EXPLANATION')) {
      return res.status(403).json({ success: false, code: 'FEATURE_DISABLED', message: 'AI Explanations are currently disabled.' });
    }

    const { id } = req.params;
    const { question } = req.body;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', requestId, message: 'Plan not found' });

    const foundEx = (plan.structuredSchedule || [])
      .flatMap(d => d.exercises || [])
      .find(ex => (question || '').toLowerCase().includes(ex.exerciseName.toLowerCase()));

    if (foundEx && isFeatureEnabled('DETERMINISTIC_CACHE')) {
      const deterministicAnalysis = generateDeterministicExplanation(foundEx.exerciseName, plan.goal);
      return res.json({ success: true, explanation: deterministicAnalysis, deterministic: true, requestId });
    }

    const prompt = `You are explaining the training design of workout plan "${plan.title}" (Goal: ${plan.goal}, Experience: ${plan.experienceLevel}). User question: "${question}". Explain the exact biomechanical, progressive overload, or fatigue management reasoning clearly with bullet points.`;

    const result = await aiProvider.generate([
      { role: 'system', content: 'You are an expert strength & conditioning coach.' },
      { role: 'user', content: prompt }
    ], { requestId });

    res.json({ success: true, explanation: result.text, deterministic: false, requestId });
  } catch (error) {
    res.status(500).json({ success: false, code: 'EXPLANATION_FAILED', requestId, message: 'Failed to generate explanation' });
  }
};

/**
 * Get User Plans (Paginated DTO List View)
 */
const getUserPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id, isDeleted: false };
    const totalCount = await GeneratedWorkoutPlan.countDocuments(query);
    const plans = await GeneratedWorkoutPlan.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit);

    const planDTOs = plans.map(p => toPlanSummaryDTO(p));

    res.json({
      success: true,
      plans: planDTOs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 'FETCH_PLANS_FAILED', message: 'Failed to fetch plans' });
  }
};

/**
 * Get Plan By ID (Transformed DTO Object)
 */
const getPlanById = async (req, res) => {
  try {
    const plan = await GeneratedWorkoutPlan.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const derivedMarkdown = renderMarkdownFromSchedule(plan.title, plan.mesocycleStructure, plan.structuredSchedule, plan.confidence);

    res.json({
      success: true,
      plan: toPlanDTO(plan, derivedMarkdown)
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 'FETCH_PLAN_FAILED', message: 'Failed to fetch plan' });
  }
};

/**
 * Update Plan (Manual Editor with Optimistic Locking)
 */
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { structuredSchedule, title, expectedVersion } = req.body;

    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    if (expectedVersion !== undefined && plan.currentVersion !== expectedVersion) {
      return res.status(409).json({
        success: false,
        code: 'STALE_VERSION_CONFLICT',
        message: 'Plan was updated in another browser tab. Please reload.',
        currentVersion: plan.currentVersion
      });
    }

    if (structuredSchedule) {
      plan.structuredSchedule = structuredSchedule;
      plan.analytics.weeklyVolumePerMuscle = calculateMuscleVolumeAnalytics(structuredSchedule);
    }
    if (title) plan.title = title;

    plan.currentVersion += 1;
    plan.versions.push({
      versionNumber: plan.currentVersion,
      title: plan.title,
      structuredSchedule: plan.structuredSchedule,
      changedReason: 'Manual User Edit',
      authorType: 'USER',
      createdAt: new Date()
    });

    plan.markModified('structuredSchedule');
    await plan.save();

    auditLog('PLAN_MANUALLY_EDITED', req.user._id, id, { newVersion: plan.currentVersion });

    res.json({ success: true, plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'UPDATE_FAILED', message: 'Failed to update plan' });
  }
};

/**
 * Soft Delete Plan with Audit Logging & Event Emission
 */
const deletePlan = async (req, res) => {
  try {
    const plan = await GeneratedWorkoutPlan.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    plan.isDeleted = true;
    plan.deletedAt = new Date();
    await plan.save();

    eventBus.emit('PLAN_DELETED', { userId: req.user._id, planId: req.params.id });
    auditLog('PLAN_DELETED', req.user._id, req.params.id);

    res.json({ success: true, message: 'Plan soft-deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, code: 'DELETE_FAILED', message: 'Failed to delete plan' });
  }
};

/**
 * Regenerate Single Workout Day
 */
const regenerateDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayNumber, customPrompt } = req.body;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const targetDayIndex = (plan.structuredSchedule || []).findIndex(d => d.dayNumber === dayNumber);
    if (targetDayIndex === -1) return res.status(400).json({ success: false, code: 'INVALID_DAY', message: 'Day number not found' });

    const prompt = `Regenerate Day ${dayNumber} for plan "${plan.title}". Goal: ${plan.goal}, Equipment: ${plan.equipment}. User notes: ${customPrompt || 'Improve exercise variety'}. Output valid JSON for that day only matching {"dayNumber": ${dayNumber}, "dayName": "...", "focus": "...", "exercises": [...]}`;
    
    const result = await aiProvider.generate([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]);

    const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const newDayObj = JSON.parse(cleaned);

    plan.structuredSchedule[targetDayIndex] = newDayObj;
    plan.analytics.weeklyVolumePerMuscle = calculateMuscleVolumeAnalytics(plan.structuredSchedule);
    plan.currentVersion += 1;
    plan.versions.push({
      versionNumber: plan.currentVersion,
      title: plan.title,
      structuredSchedule: plan.structuredSchedule,
      changedReason: `Regenerated Day ${dayNumber}`,
      authorType: 'AI',
      createdAt: new Date()
    });

    plan.markModified('structuredSchedule');
    await plan.save();

    res.json({ success: true, plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'REGENERATE_DAY_FAILED', message: 'Failed to regenerate day' });
  }
};

/**
 * Regenerate Single Exercise
 */
const regenerateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayNumber, exerciseIndex, customReason } = req.body;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const dayObj = (plan.structuredSchedule || []).find(d => d.dayNumber === dayNumber);
    if (!dayObj || !dayObj.exercises[exerciseIndex]) {
      return res.status(400).json({ success: false, code: 'INVALID_INDEX', message: 'Invalid day or exercise index' });
    }

    const currentEx = dayObj.exercises[exerciseIndex];
    const prompt = `Propose a direct replacement for exercise "${currentEx.exerciseName}" in a ${plan.goal} routine. User reason: ${customReason || 'Equipment unavailable/knee friendly'}. Return JSON: {"replacementName": "...", "sets": ${currentEx.sets}, "reps": "${currentEx.reps}", "notes": "..."}`;

    const result = await aiProvider.generate([
      { role: 'system', content: 'Output JSON only.' },
      { role: 'user', content: prompt }
    ]);

    const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const replacement = JSON.parse(cleaned);

    dayObj.exercises[exerciseIndex] = {
      ...currentEx,
      exerciseName: replacement.replacementName || currentEx.exerciseName,
      notes: replacement.notes || currentEx.notes
    };

    plan.analytics.weeklyVolumePerMuscle = calculateMuscleVolumeAnalytics(plan.structuredSchedule);
    plan.currentVersion += 1;
    plan.versions.push({
      versionNumber: plan.currentVersion,
      title: plan.title,
      structuredSchedule: plan.structuredSchedule,
      changedReason: `Replaced exercise ${currentEx.exerciseName} with ${replacement.replacementName}`,
      authorType: 'AI',
      createdAt: new Date()
    });

    plan.markModified('structuredSchedule');
    await plan.save();

    res.json({ success: true, plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'REPLACEMENT_FAILED', message: 'Failed to replace exercise' });
  }
};

/**
 * Weekly Check-In Submission
 */
const weeklyCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekNumber, rating, feedbackNotes } = req.body;

    if (!rating || !['easy', 'good', 'difficult', 'too_hard'].includes(rating)) {
      return res.status(400).json({ success: false, code: 'INVALID_RATING', message: 'Rating must be easy, good, difficult, or too_hard' });
    }

    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    plan.weeklyCheckIns.push({ weekNumber, rating, feedbackNotes, createdAt: new Date() });

    let suggestionTitle = 'Weekly Progression Adjustment';
    let suggestionDesc = 'Adjust training variables based on your check-in feedback.';
    let proposedChanges = {};

    if (rating === 'easy') {
      suggestionTitle = '⚡ Add Weight & Volume';
      suggestionDesc = `You rated Week ${weekNumber} as easy! Coach recommends adding +2.5kg to primary compound lifts next week.`;
      proposedChanges = { type: 'weight_increase', incrementKg: 2.5 };
    } else if (rating === 'too_hard') {
      suggestionTitle = '😴 Planned Recovery Deload';
      suggestionDesc = `You rated Week ${weekNumber} as too hard. Coach recommends taking a 1-week deload with 50% set volume.`;
      proposedChanges = { type: 'deload', volumeFactor: 0.5 };
    }

    const newSuggestion = {
      id: Date.now().toString(),
      type: rating === 'too_hard' ? 'deload' : 'weight_increase',
      title: suggestionTitle,
      description: suggestionDesc,
      proposedChanges,
      status: 'pending',
      createdAt: new Date()
    };

    plan.aiSuggestions.push(newSuggestion);
    await plan.save();

    eventBus.emit('CHECKIN_SUBMITTED', { userId: req.user._id, rating });

    res.json({ success: true, message: 'Check-in saved', suggestion: newSuggestion });
  } catch (error) {
    res.status(500).json({ success: false, code: 'CHECKIN_FAILED', message: 'Failed to record check-in' });
  }
};

/**
 * Accept Suggestion (Backend Mutation with Audit Logging & Event Dispatch)
 */
const acceptSuggestion = async (req, res) => {
  try {
    const { id, sugId } = req.params;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const sug = (plan.aiSuggestions || []).find(s => s.id === sugId);
    if (!sug) return res.status(404).json({ success: false, code: 'SUGGESTION_NOT_FOUND', message: 'Suggestion not found' });

    sug.status = 'accepted';

    if (sug.proposedChanges?.type === 'weight_increase') {
      plan.structuredSchedule.forEach(day => {
        (day.exercises || []).forEach(ex => {
          ex.notes = `${ex.notes || ''} [Coach: +${sug.proposedChanges.incrementKg}kg applied]`.trim();
        });
      });
    }

    plan.currentVersion += 1;
    plan.versions.push({
      versionNumber: plan.currentVersion,
      title: plan.title,
      structuredSchedule: plan.structuredSchedule,
      changedReason: `Accepted AI Suggestion: ${sug.title}`,
      authorType: 'SUGGESTION_ACCEPTED',
      createdAt: new Date()
    });

    plan.markModified('structuredSchedule');
    await plan.save();

    eventBus.emit('SUGGESTION_ACCEPTED', { userId: req.user._id, planId: id });
    auditLog('SUGGESTION_ACCEPTED', req.user._id, id, { suggestionId: sugId, title: sug.title });

    res.json({ success: true, message: 'Suggestion accepted and plan updated', plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SUGGESTION_FAILED', message: 'Failed to accept suggestion' });
  }
};

/**
 * Reject Suggestion
 */
const rejectSuggestion = async (req, res) => {
  try {
    const { id, sugId } = req.params;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const sug = (plan.aiSuggestions || []).find(s => s.id === sugId);
    if (sug) sug.status = 'rejected';

    await plan.save();
    res.json({ success: true, message: 'Suggestion rejected' });
  } catch (error) {
    res.status(500).json({ success: false, code: 'REJECT_FAILED', message: 'Failed to reject suggestion' });
  }
};

/**
 * Rollback Plan Version
 */
const rollbackVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const { versionNumber } = req.body;
    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });

    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const targetVer = (plan.versions || []).find(v => v.versionNumber === versionNumber);
    if (!targetVer) return res.status(404).json({ success: false, code: 'VERSION_NOT_FOUND', message: 'Version not found' });

    plan.structuredSchedule = targetVer.structuredSchedule;
    plan.analytics.weeklyVolumePerMuscle = calculateMuscleVolumeAnalytics(targetVer.structuredSchedule);
    plan.currentVersion += 1;
    plan.versions.push({
      versionNumber: plan.currentVersion,
      title: plan.title,
      structuredSchedule: targetVer.structuredSchedule,
      changedReason: `Rolled back to Version ${versionNumber}`,
      authorType: 'ROLLBACK',
      createdAt: new Date()
    });

    plan.markModified('structuredSchedule');
    await plan.save();

    auditLog('VERSION_ROLLBACK', req.user._id, id, { targetVersion: versionNumber });

    res.json({ success: true, message: `Rolled back to Version ${versionNumber}`, plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'ROLLBACK_FAILED', message: 'Failed to rollback version' });
  }
};

/**
 * Set Active Plan (Enforces Single Active Plan)
 */
const setActivePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    plan.status = 'active';
    plan.activatedAt = new Date();
    await plan.save();

    await enforceSingleActivePlan(userId, id);
    auditLog('ACTIVE_PLAN_CHANGED', userId, id, { title: plan.title });

    res.json({ success: true, message: 'Plan set as active', plan: toPlanDTO(plan) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SET_ACTIVE_FAILED', message: 'Failed to set active plan' });
  }
};

/**
 * Duplicate Plan
 */
const duplicatePlan = async (req, res) => {
  try {
    const original = await GeneratedWorkoutPlan.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
    if (!original) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    const dup = await GeneratedWorkoutPlan.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ success: true, plan: toPlanDTO(dup) });
  } catch (error) {
    res.status(500).json({ success: false, code: 'DUPLICATE_FAILED', message: 'Failed to duplicate plan' });
  }
};

/**
 * Export Plan (Markdown, JSON, CSV)
 */
const exportPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    if (!['pdf', 'markdown', 'json', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({ success: false, code: 'INVALID_EXPORT_FORMAT', message: 'Export format must be pdf, markdown, json, or csv' });
    }

    const plan = await GeneratedWorkoutPlan.findOne({ _id: id, userId: req.user._id, isDeleted: false });
    if (!plan) return res.status(404).json({ success: false, code: 'PLAN_NOT_FOUND', message: 'Plan not found' });

    auditLog('PLAN_EXPORTED', req.user._id, id, { format });

    if (format === 'json') {
      return res.json({ success: true, export: toPlanDTO(plan) });
    }

    if (format === 'csv') {
      const csvStr = renderCSVFromSchedule(plan.title, plan.structuredSchedule);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${plan.title}.csv"`);
      return res.send(csvStr);
    }

    const mdStr = renderMarkdownFromSchedule(plan.title, plan.mesocycleStructure, plan.structuredSchedule, plan.confidence);
    const contentType = format === 'pdf' ? 'application/pdf' : 'text/markdown';
    const ext = format === 'pdf' ? 'pdf' : 'md';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${plan.title}.${ext}"`);
    return res.send(mdStr);
  } catch (error) {
    res.status(500).json({ success: false, code: 'EXPORT_FAILED', message: 'Failed to export plan' });
  }
};

/**
 * User Preferences Memory Endpoints
 */
const getUserPreferences = async (req, res) => {
  try {
    const pref = await getUserPref(req.user._id);
    res.json({ success: true, preferences: pref });
  } catch (error) {
    res.status(500).json({ success: false, code: 'PREF_FAILED', message: 'Failed to get preferences' });
  }
};

const updateUserPreferences = async (req, res) => {
  try {
    const pref = await getUserPref(req.user._id);
    const { dislikedExercises, preferredEquipment, jointPainAreas, maxDurationMinutes } = req.body;

    if (dislikedExercises) pref.dislikedExercises = dislikedExercises;
    if (preferredEquipment) pref.preferredEquipment = preferredEquipment;
    if (jointPainAreas) pref.jointPainAreas = jointPainAreas;
    if (maxDurationMinutes) pref.maxDurationMinutes = maxDurationMinutes;

    await pref.save();
    res.json({ success: true, preferences: pref });
  } catch (error) {
    res.status(500).json({ success: false, code: 'PREF_UPDATE_FAILED', message: 'Failed to update preferences' });
  }
};

/**
 * Recommended Plans
 */
const getRecommendedPlans = async (req, res) => {
  try {
    const recs = [
      { id: 'rec-1', title: '8-Week Hypertrophy PPL', goal: 'hypertrophy', days: 6, desc: 'Maximum muscle growth split for experienced lifters.' },
      { id: 'rec-2', title: '6-Week Powerbuilding Split', goal: 'strength', days: 4, desc: 'Combines heavy 5x5 compound strength with hypertrophy accessories.' },
      { id: 'rec-3', title: '4-Week Home Bodyweight Conditioning', goal: 'fatloss', days: 3, desc: 'Zero equipment fat loss split with high intensity conditioning.' }
    ];
    res.json({ success: true, recommendations: recs });
  } catch (error) {
    res.status(500).json({ success: false, code: 'RECS_FAILED', message: 'Failed to get recommendations' });
  }
};

module.exports = {
  generatePlanStream,
  regenerateDay,
  regenerateExercise,
  explainPlan,
  weeklyCheckIn,
  acceptSuggestion,
  rejectSuggestion,
  rollbackVersion,
  setActivePlan,
  getUserPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  duplicatePlan,
  exportPlan,
  getUserPreferences,
  updateUserPreferences,
  getRecommendedPlans,
  getPublicHealth,
  getAdminMetrics,
};
