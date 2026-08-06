module.exports = {
  provider: 'groq',
  get apiKey() {
    return process.env.GROQ_API_KEY;
  },
  baseURL: 'https://api.groq.com/openai/v1',
  get model() {
    return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  },
  temperature: 0.6,
  maxTokens: 3500,
  requestTimeoutMs: 60000,
};
