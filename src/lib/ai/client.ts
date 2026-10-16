import OpenAI from 'openai';

let client: OpenAI | null = null;

/** Initialize the provider only when an AI feature is actually called. */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for AI features.');
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}
