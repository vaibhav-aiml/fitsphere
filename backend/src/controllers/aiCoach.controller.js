const pino = require('pino');
const logger = pino();

const WorkoutLog = require('../models/WorkoutLog');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const aiProvider = require('../services/aiProvider');
const aiConfig = require('../config/ai');
const systemPrompt = require('../prompts/fitness.system');

/**
 * Helper to fetch sanitized user fitness context
 */
async function buildSanitizedUserContext(userId) {
  const recentWorkouts = await WorkoutLog.find({ userId })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  if (!recentWorkouts || recentWorkouts.length === 0) {
    return 'No previous workout logs found.';
  }

  const summaries = recentWorkouts.map(w => {
    return `- ${w.exerciseName}: ${w.weight}kg x ${w.reps} reps (${w.sets || 1} sets) on ${new Date(w.date).toISOString().split('T')[0]}`;
  });

  return `Recent Workout Summary:\n${summaries.join('\n')}`;
}

/**
 * Helper to find or create user's active conversation
 */
async function getOrCreateConversation(userId, firstQuestion = '') {
  let conversation = await ChatConversation.findOne({ userId }).sort({ updatedAt: -1 });

  if (!conversation) {
    const title = firstQuestion ? firstQuestion.trim().slice(0, 40) : 'Fitness Chat';
    conversation = await ChatConversation.create({
      userId,
      title,
    });
  }

  return conversation;
}

/**
 * Helper to retrieve message history within a token budget (~2000 tokens ≈ 8000 chars)
 */
async function getBudgetedMessageHistory(conversationId, charBudget = 8000) {
  const messages = await ChatMessage.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  messages.reverse();

  let accumulatedChars = 0;
  const budgeted = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const len = (msg.content || '').length;
    if (accumulatedChars + len > charBudget && budgeted.length > 0) {
      break;
    }
    accumulatedChars += len;
    budgeted.unshift({
      role: msg.role,
      content: msg.content,
    });
  }

  return budgeted;
}

/**
 * Non-streaming AI advice fallback endpoint
 */
const getAdvice = async (req, res) => {
  const startTime = Date.now();
  const { question } = req.body;
  const userId = req.user._id;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }

  try {
    const conversation = await getOrCreateConversation(userId, question);

    // Explicit Save Order: 1. Save User Message immediately
    await ChatMessage.create({
      conversationId: conversation._id,
      role: 'user',
      content: question.trim(),
    });

    const userContextStr = await buildSanitizedUserContext(userId);
    const history = await getBudgetedMessageHistory(conversation._id);

    const promptMessages = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nUser Fitness Context:\n${userContextStr}`,
      },
      ...history,
    ];

    const result = await aiProvider.generate(promptMessages);
    const responseText = result.text;

    // Explicit Save Order: 2. Save Assistant Message ONLY on completion
    await ChatMessage.create({
      conversationId: conversation._id,
      role: 'assistant',
      content: responseText,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    const responseTimeMs = Date.now() - startTime;
    logger.info({
      userId,
      timestamp: new Date().toISOString(),
      model: aiConfig.model,
      responseTimeMs,
      completionStatus: 'success',
      usage: result.usage || undefined,
    }, 'AI Coach non-stream request');

    res.json({
      success: true,
      response: responseText,
      conversationId: conversation._id,
    });
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    logger.error({
      userId,
      timestamp: new Date().toISOString(),
      model: aiConfig.model,
      responseTimeMs,
      completionStatus: 'error',
      error: error.message,
    }, 'AI Coach non-stream error');

    res.status(500).json({
      success: false,
      message: 'The AI Coach is temporarily unavailable. Please try again in a moment.',
    });
  }
};

/**
 * NDJSON Streaming AI advice endpoint
 */
const getAdviceStream = async (req, res) => {
  const startTime = Date.now();
  const { question } = req.body;
  const userId = req.user._id;

  if (!question || !question.trim()) {
    return res.status(400).json({ success: false, message: 'Question is required' });
  }

  // Set streaming headers for NDJSON
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  let isAborted = false;
  const abortController = new AbortController();

  req.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
      abortController.abort();
    }
  });

  try {
    const conversation = await getOrCreateConversation(userId, question);

    // 1. Save User Message immediately
    await ChatMessage.create({
      conversationId: conversation._id,
      role: 'user',
      content: question.trim(),
    });

    const userContextStr = await buildSanitizedUserContext(userId);
    const history = await getBudgetedMessageHistory(conversation._id);

    const promptMessages = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nUser Fitness Context:\n${userContextStr}`,
      },
      ...history,
    ];

    const tokenStream = await aiProvider.stream(promptMessages, abortController.signal);
    let fullResponseText = '';

    for await (const token of tokenStream) {
      if (isAborted) break;
      fullResponseText += token;
      res.write(JSON.stringify({ type: 'token', content: token }) + '\n');
    }

    if (!isAborted) {
      // 2. Save Assistant Message ONLY after successful complete stream
      await ChatMessage.create({
        conversationId: conversation._id,
        role: 'assistant',
        content: fullResponseText,
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      res.write(JSON.stringify({ type: 'done' }) + '\n');
      res.end();

      const responseTimeMs = Date.now() - startTime;
      logger.info({
        userId,
        timestamp: new Date().toISOString(),
        model: aiConfig.model,
        responseTimeMs,
        completionStatus: 'success',
      }, 'AI Coach stream request success');
    } else {
      const responseTimeMs = Date.now() - startTime;
      logger.info({
        userId,
        timestamp: new Date().toISOString(),
        model: aiConfig.model,
        responseTimeMs,
        completionStatus: 'aborted',
      }, 'AI Coach stream request aborted');
    }
  } catch (error) {
    if (!isAborted) {
      res.write(JSON.stringify({
        type: 'error',
        content: 'The AI Coach is temporarily unavailable. Please try again in a moment.',
      }) + '\n');
      res.end();
    }

    const responseTimeMs = Date.now() - startTime;
    logger.error({
      userId,
      timestamp: new Date().toISOString(),
      model: aiConfig.model,
      responseTimeMs,
      completionStatus: 'error',
      error: error.message,
    }, 'AI Coach stream request error');
  }
};

/**
 * Get active chat history for user
 */
const getChatHistory = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });

    if (!conversation) {
      return res.json({ success: true, messages: [], conversationId: null });
    }

    const messages = await ChatMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      conversationId: conversation._id,
      title: conversation.title,
      messages: messages.map(m => ({
        id: m._id.toString(),
        text: m.content,
        isUser: m.role === 'user',
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve chat history' });
  }
};

/**
 * Clear chat history for user
 */
const clearChatHistory = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({ userId: req.user._id }).sort({ updatedAt: -1 });

    if (conversation) {
      await ChatMessage.deleteMany({ conversationId: conversation._id });
      await ChatConversation.deleteOne({ _id: conversation._id });
    }

    res.json({ success: true, message: 'Chat history cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear chat history' });
  }
};

/**
 * UNTOUCHED EXISTING FUNCTIONS
 */
const getFormFeedback = async (req, res) => {
  const { notes, exerciseName } = req.body;
  let feedback = "✅ Good form awareness! Keep focusing on quality reps.";
  let tips = ["Watch demo videos", "Control the eccentric", "Breathe properly"];
  
  const n = (notes || '').toLowerCase();
  if (n.includes('back') && n.includes('pain')) { feedback = "⚠️ Lower Back Pain Detected!"; tips = ["Brace your core", "Keep spine neutral", "Reduce weight"]; }
  else if (n.includes('knee') && n.includes('pain')) { feedback = "⚠️ Knee Pain Detected!"; tips = ["Knees track over toes", "Don't let knees cave in", "Try box squats"]; }
  else if (n.includes('shoulder') && n.includes('pain')) { feedback = "⚠️ Shoulder Pain Detected!"; tips = ["Keep elbows at 45°", "Add face pulls", "Strengthen rear delts"]; }
  
  res.json({ success: true, feedback, tips, exercise: exerciseName });
};

const detectPlateau = async (req, res) => {
  const workouts = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(20);
  if (workouts.length < 3) {
    return res.json({ success: true, plateauDetected: false, message: `📊 Not enough data yet! (${workouts.length} workouts logged)`, suggestions: ["Log more workouts", "Track consistently"] });
  }
  
  const exerciseGroups = {};
  workouts.forEach(w => {
    if (!exerciseGroups[w.exerciseName]) exerciseGroups[w.exerciseName] = [];
    exerciseGroups[w.exerciseName].push({ date: w.date, oneRM: w.weight * (1 + w.reps / 30) });
  });
  
  let plateauDetected = false, message = "", suggestions = [];
  for (const [exName, exWorkouts] of Object.entries(exerciseGroups)) {
    if (exWorkouts.length >= 3) {
      const sorted = exWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const last3 = sorted.slice(-3);
      const first3 = sorted.slice(0, 3);
      const avgLast3 = last3.reduce((s, w) => s + w.oneRM, 0) / last3.length;
      const avgFirst3 = first3.reduce((s, w) => s + w.oneRM, 0) / first3.length;
      const improvement = ((avgLast3 - avgFirst3) / avgFirst3) * 100;
      
      if (improvement < 2 && improvement > -2) {
        plateauDetected = true;
        message = `⚠️ PLATEAU DETECTED in ${exName}!`;
        suggestions = ["Change rep ranges", "Add exercise variations", "Take a deload week", "Increase calories by 200-300"];
        break;
      } else if (improvement < 5) {
        message = `📈 Slow progress in ${exName} (${improvement.toFixed(1)}% improvement)`;
        suggestions = ["Add 2.5kg to sets", "Get 1-2 more reps", "Ensure proper recovery"];
      } else {
        message = `🎉 Great progress in ${exName}! ${improvement.toFixed(1)}% improvement!`;
        suggestions = ["Continue progressive overload", "You're on the right track!"];
      }
    }
  }
  
  if (!plateauDetected && !message) message = "📊 No plateaus detected! Keep up the great work! 💪";
  res.json({ success: true, plateauDetected, message, suggestions });
};

const getWeightRecommendation = async (req, res) => {
  const { exerciseName } = req.query;
  const workouts = await WorkoutLog.find({ userId: req.user._id, exerciseName }).sort({ date: -1 }).limit(5);
  
  if (workouts.length === 0) {
    return res.json({ success: true, recommendedWeight: null, message: "No previous workouts. Start with light weight!" });
  }
  
  const lastWorkout = workouts[0];
  let recommendedWeight = lastWorkout.weight;
  let adjustmentReason = "";
  
  if (lastWorkout.reps >= 12) { recommendedWeight = Math.round(lastWorkout.weight * 1.05); adjustmentReason = "You crushed it! Time to increase weight."; }
  else if (lastWorkout.reps <= 6) { recommendedWeight = lastWorkout.weight; adjustmentReason = "Stay at this weight and focus on form."; }
  else { recommendedWeight = lastWorkout.weight; adjustmentReason = "Try to get more reps before increasing weight."; }
  
  res.json({ success: true, exercise: exerciseName, lastWorkout: { weight: lastWorkout.weight, reps: lastWorkout.reps }, recommendedWeight, adjustmentReason });
};

module.exports = {
  getAdvice,
  getAdviceStream,
  getChatHistory,
  clearChatHistory,
  getFormFeedback,
  detectPlateau,
  getWeightRecommendation,
};
