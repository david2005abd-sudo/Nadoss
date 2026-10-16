import { getOpenAIClient } from './client';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAIClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // token safety
  });
  return response.data[0].embedding;
}
