const OpenAI = require('openai');
const aiConfig = require('../../config/ai');

let groqClient = null;
let currentKey = null;

// Circuit Breaker State
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 30000;

function checkCircuitBreaker() {
  if (failureCount >= FAILURE_THRESHOLD) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_RESET_MS) {
      throw new Error(`CIRCUIT_OPEN: Groq AI Provider paused due to consecutive errors. Retry in ${Math.ceil((CIRCUIT_RESET_MS - timeSinceLastFailure) / 1000)}s.`);
    } else {
      failureCount = 0;
    }
  }
}

function recordSuccess() {
  failureCount = 0;
}

function recordFailure() {
  failureCount++;
  lastFailureTime = Date.now();
}

/**
 * Checks if HTTP error status code is transient & retryable
 */
function isTransientError(error) {
  const status = error.status || error.statusCode;
  if (!status) return true;
  return [429, 500, 502, 503, 504].includes(status);
}

/**
 * Exponential Backoff Delay with Jitter
 */
async function sleepWithJitter(attempt) {
  const baseMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
  const jitter = Math.random() * 500;
  const delay = baseMs + jitter;
  await new Promise(resolve => setTimeout(resolve, delay));
}

function getClient() {
  const apiKey = aiConfig.apiKey;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not configured');
  }
  if (!groqClient || currentKey !== apiKey) {
    currentKey = apiKey;
    groqClient = new OpenAI({
      apiKey,
      baseURL: aiConfig.baseURL,
      timeout: aiConfig.requestTimeoutMs,
    });
  }
  return groqClient;
}

const FALLBACK_MODEL = 'llama-3.1-8b-instant';

const groqProvider = {
  async generate(messages, options = {}) {
    checkCircuitBreaker();
    const client = getClient();
    const primaryModel = aiConfig.model;
    
    let response;
    let usedModel = primaryModel;
    let fallbackAttempted = false;
    let retryCount = 0;

    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          retryCount = attempt;
          await sleepWithJitter(attempt);
        }

        response = await client.chat.completions.create({
          model: primaryModel,
          messages,
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
        });
        recordSuccess();
        break; // Success! Break retry loop
      } catch (primaryError) {
        if (attempt < maxRetries && isTransientError(primaryError)) {
          console.warn(`[Attempt ${attempt + 1}/${maxRetries}] Transient error (${primaryError.message}). Retrying with exponential backoff...`);
          continue;
        }

        // Retries exhausted or non-transient error: try fallback model once
        if (isTransientError(primaryError)) {
          console.warn(`[RequestId: ${options.requestId || 'N/A'}] Primary model retries exhausted. Attempting fallback model ${FALLBACK_MODEL}...`);
          try {
            fallbackAttempted = true;
            usedModel = FALLBACK_MODEL;
            response = await client.chat.completions.create({
              model: FALLBACK_MODEL,
              messages,
              temperature: aiConfig.temperature,
              max_tokens: aiConfig.maxTokens,
            });
            recordSuccess();
            break;
          } catch (fallbackError) {
            recordFailure();
            console.error(`[RequestId: ${options.requestId || 'N/A'}] Fallback model also failed:`, fallbackError.message);
            throw fallbackError;
          }
        } else {
          recordFailure();
          console.error(`[RequestId: ${options.requestId || 'N/A'}] Non-transient error (${primaryError.status || 400}):`, primaryError.message);
          throw primaryError;
        }
      }
    }

    const text = response.choices?.[0]?.message?.content || '';
    const usage = response.usage || {};
    const promptTokens = usage.prompt_tokens || 300;
    const completionTokens = usage.completion_tokens || 150;
    const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
    const estimatedCostUsd = parseFloat((totalTokens * 0.0000001).toFixed(6));

    return {
      text,
      usedModel,
      fallbackAttempted,
      retryCount,
      tokenAnalytics: {
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCostUsd
      }
    };
  },

  async stream(messages, signal, options = {}) {
    checkCircuitBreaker();
    const client = getClient();
    try {
      const stream = await client.chat.completions.create(
        {
          model: aiConfig.model,
          messages,
          temperature: aiConfig.temperature,
          max_tokens: aiConfig.maxTokens,
          stream: true,
        },
        { signal }
      );

      recordSuccess();

      async function* tokenGenerator() {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        }
      }

      return tokenGenerator();
    } catch (error) {
      if (!isTransientError(error)) {
        console.error(`[RequestId: ${options.requestId || 'N/A'}] Non-transient stream error:`, error.message);
      } else {
        recordFailure();
      }
      throw error;
    }
  }
};

module.exports = groqProvider;
