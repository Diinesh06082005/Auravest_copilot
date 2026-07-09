import { geminiService } from '../../business/services/ai/gemini.service';
import { logger } from '../../shared/logger';

export const formatTicker = (ticker: string): string => {
  return ticker.toUpperCase().trim();
};

/**
 * Request text content from Gemini and parse it cleanly into a JSON object.
 */
export async function generateGeminiJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const raw = await geminiService.generateText(prompt);
    // Strip markdown json blocks if present
    const clean = raw.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(clean) as T;
  } catch (err: any) {
    logger.warn('Failed to parse JSON response from Gemini, using fallback:', err.message);
    return fallback;
  }
}
