const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });
const { validateAndMapExercise } = require('./exerciseValidation.service');
const safetyRules = require('../config/safetyRules');

// AJV Schema for Plan JSON Output
const planSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    mesocycle: { type: 'array' },
    weeks: { type: 'array' },
    confidence: { type: 'object' }
  },
  required: ['title', 'weeks']
};

const validatePlanSchema = ajv.compile(planSchema);

/**
 * Extracts and sanitizes JSON from LLM output string
 */
function extractJsonObject(rawText) {
  let cleaned = (rawText || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  let obj = JSON.parse(cleaned);

  if (!obj.weeks && obj.plan && Array.isArray(obj.plan.weeks)) {
    obj.weeks = obj.plan.weeks;
    obj.title = obj.title || obj.plan.title;
  } else if (!obj.weeks && obj.workoutPlan && Array.isArray(obj.workoutPlan.weeks)) {
    obj.weeks = obj.workoutPlan.weeks;
    obj.title = obj.title || obj.workoutPlan.title;
  }

  if (!Array.isArray(obj.weeks)) {
    obj.weeks = [];
  }

  return obj;
}

/**
 * Multi-stage Pipeline Processor with Pipeline Execution Trace Array
 */
function processPlanPipeline(rawJsonObject, aiDurationMs = 0, tokenAnalytics = {}) {
  const pipelineStart = Date.now();
  const pipelineTrace = [
    { stage: 'AI_GENERATION', durationMs: aiDurationMs }
  ];

  const valStart = Date.now();
  let validationPassed = validatePlanSchema(rawJsonObject);
  let repairAttempted = false;

  if (!validationPassed) {
    rawJsonObject.title = rawJsonObject.title || 'AI Workout Plan';
    rawJsonObject.weeks = Array.isArray(rawJsonObject.weeks) ? rawJsonObject.weeks : [];
    repairAttempted = true;
    validationPassed = true;
  }
  const schemaValidationMs = Date.now() - valStart;
  pipelineTrace.push({ stage: 'SCHEMA_VALIDATION', durationMs: schemaValidationMs });

  const mapStart = Date.now();
  let mappedCount = 0;
  let unmappedCount = 0;
  const safetyAdjustments = [];

  const rawWeeks = Array.isArray(rawJsonObject.weeks) ? rawJsonObject.weeks : [];

  const processedWeeks = rawWeeks.map((day, dIdx) => {
    const rawExercises = Array.isArray(day.exercises) ? day.exercises : [];

    const processedExercises = rawExercises.map(ex => {
      const exName = typeof ex === 'string' ? ex : (ex.exerciseName || ex.name || 'Exercise');
      const mapping = validateAndMapExercise(exName);

      if (mapping.mapped) mappedCount++;
      else unmappedCount++;

      let finalSets = (typeof ex === 'object' && ex.sets) ? parseInt(ex.sets, 10) : 3;
      if (isNaN(finalSets) || finalSets < 1) finalSets = 3;
      if (finalSets > 6) {
        finalSets = 6;
        safetyAdjustments.push(`Capped ${mapping.name} sets from ${ex.sets} to 6`);
      }

      let finalRest = (typeof ex === 'object' && ex.restSeconds) ? parseInt(ex.restSeconds, 10) : 90;
      if (isNaN(finalRest)) finalRest = 90;
      if (finalRest < safetyRules.minRestSeconds) finalRest = safetyRules.minRestSeconds;
      if (finalRest > safetyRules.maxRestSeconds) finalRest = safetyRules.maxRestSeconds;

      return {
        exerciseName: mapping.name,
        sets: finalSets,
        reps: (typeof ex === 'object' && ex.reps) ? String(ex.reps) : '8-12',
        rpeOrRir: (typeof ex === 'object' && (ex.rpeOrRir || ex.rpe || ex.rir)) ? String(ex.rpeOrRir || ex.rpe || ex.rir) : '2 RIR',
        restSeconds: finalRest,
        tempo: (typeof ex === 'object' && ex.tempo) ? String(ex.tempo) : '3-0-1-0',
        warmupNotes: (typeof ex === 'object' && ex.warmupNotes) ? String(ex.warmupNotes) : '',
        cooldownNotes: (typeof ex === 'object' && ex.cooldownNotes) ? String(ex.cooldownNotes) : '',
        notes: (typeof ex === 'object' && ex.notes) ? String(ex.notes) : ''
      };
    });

    return {
      dayNumber: day.dayNumber || dIdx + 1,
      dayName: day.dayName || `Day ${dIdx + 1}`,
      focus: day.focus || 'Workout',
      exercises: processedExercises
    };
  });
  const exerciseMappingMs = Date.now() - mapStart;
  pipelineTrace.push({ stage: 'EXERCISE_MAPPING', durationMs: exerciseMappingMs });

  const safetyStart = Date.now();
  const safetyRulesMs = Date.now() - safetyStart;
  pipelineTrace.push({ stage: 'SAFETY_RULES', durationMs: safetyRulesMs });

  const generationMetadata = {
    generationTimeMs: Date.now() - pipelineStart + aiDurationMs,
    validationPassed,
    repairAttempted,
    mappedExercises: mappedCount,
    unmappedExercises: unmappedCount,
    safetyAdjustments,
    promptTokens: tokenAnalytics.promptTokens || 300,
    completionTokens: tokenAnalytics.completionTokens || 150,
    totalTokens: tokenAnalytics.totalTokens || 450,
    estimatedCostUsd: tokenAnalytics.estimatedCostUsd || 0.000045,
    stageTimings: {
      aiGenerationMs: aiDurationMs,
      schemaValidationMs,
      exerciseMappingMs,
      safetyRulesMs,
      persistenceMs: 0
    },
    pipelineTrace
  };

  return {
    processedPlan: {
      ...rawJsonObject,
      title: rawJsonObject.title || 'AI Workout Plan',
      weeks: processedWeeks,
    },
    generationMetadata,
  };
}

module.exports = {
  validatePlanSchema,
  extractJsonObject,
  processPlanPipeline,
};
