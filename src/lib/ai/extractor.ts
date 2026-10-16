import OpenAI from 'openai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { aiExtractionSchema, type AiExtraction } from './schemas';
import { buildSystemPrompt } from './prompt';
import type { ShipmentStatus } from '../delivery/types'; // unused, keep minimal

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const EXTRACTION_TOOL = {
  type: 'function' as const,
  function: {
    name: 'extract_order',
    description: 'استخرج بيانات الطلب من رسالة العميل',
    parameters: zodToJsonSchema(aiExtractionSchema, {
      target: 'openApi3',
      $refStrategy: 'none',
    }),
  },
};

export interface ExtractionResult {
  data: AiExtraction;
  modelUsed: string;
  tokensUsed: number;
  processingMs: number;
}

export async function extractOrderFromMessage(
  message: string,
  context: {
    storeName: string;
    governoratesList: string;
    productsList: string;
    customerPhone: string;
  }
): Promise<ExtractionResult> {
  const start = Date.now();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [
      { role: 'system', content: buildSystemPrompt(context) },
      { role: 'user', content: message },
    ],
    tools: [EXTRACTION_TOOL],
    tool_choice: { type: 'function', function: { name: 'extract_order' } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== 'function') {
    throw new Error('AI_DID_NOT_CALL_TOOL');
  }

  const parsed = JSON.parse(toolCall.function.arguments);
  const validated = aiExtractionSchema.parse(parsed);

  return {
    data: validated,
    modelUsed: completion.model,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    processingMs: Date.now() - start,
  };
}
