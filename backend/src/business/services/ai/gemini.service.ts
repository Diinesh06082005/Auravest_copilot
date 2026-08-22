import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { config } from '../../../shared/config';
import { logger } from '../../../shared/logger';
import { getLatestSupportedModel, blacklistModel, isModelUnavailableError, geminiKeyRotator } from '../../../ai/config';
import { grokService } from './grok.service';

export class GeminiService {
  /**
   * Creates a GoogleGenerativeAI client using the next rotated API key.
   * Called per-request so each call can use a different key.
   */
  private getAiClient(): GoogleGenerativeAI {
    const apiKey = geminiKeyRotator.getNextKey();
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Executes an async operation with retries + key rotation on quota errors.
   */
  private async executeWithRetry<T>(fn: (ai: GoogleGenerativeAI) => Promise<T>, retries?: number, delay = 1000): Promise<T> {
    const totalRetries = retries !== undefined ? retries : Math.max(6, (config.gemini.apiKeys ? config.gemini.apiKeys.length : 1) * 2);
    let currentKey = geminiKeyRotator.getNextKey();
    let ai = new GoogleGenerativeAI(currentKey);

    for (let attempt = 0; attempt <= totalRetries; attempt++) {
      try {
        return await fn(ai);
      } catch (error: any) {
        const isQuota = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
        const isTransient = error.status >= 500 || error.message?.includes('500');

        if (isQuota) {
          // Mark this key as exhausted and rotate to next
          geminiKeyRotator.markQuotaExceeded(currentKey);
          if (attempt < totalRetries) {
            currentKey = geminiKeyRotator.getNextKey();
            ai = new GoogleGenerativeAI(currentKey);
            logger.warn(`[GeminiService] Quota hit. Rotating to next key. Attempt ${attempt + 1}/${totalRetries}.`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw new Error('QUOTA_EXCEEDED');
        }

        if (isTransient && attempt < totalRetries) {
          const backoff = delay * Math.pow(2, attempt);
          logger.warn(`[GeminiService] Transient error. Retrying in ${backoff}ms... (attempt ${attempt + 1}/${totalRetries})`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        throw error;
      }
    }

    throw new Error('[GeminiService] All retry attempts exhausted.');
  }

  /**
   * Generate text content from the Gemini LLM using rotated API keys.
   */
  public async generateText(
    prompt: string,
    options: {
      modelName?: string;
      temperature?: number;
      responseSchema?: any;
    } = {}
  ): Promise<string> {
    let resolvedModelName = options.modelName || await getLatestSupportedModel(config.gemini.apiKey);
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    let attempts = 0;
    const maxModelAttempts = 3;

    while (attempts < maxModelAttempts) {
      attempts++;
      try {
        return await this.executeWithRetry(async (ai) => {
          const model = ai.getGenerativeModel({
            model: resolvedModelName,
            safetySettings,
            generationConfig: {
              temperature,
              ...(options.responseSchema && {
                responseMimeType: 'application/json',
                responseSchema: options.responseSchema,
              }),
            },
          });

          const result = await model.generateContent(prompt);
          const text = result.response.text();
          if (!text) throw new Error('Received empty content from Gemini response.');
          return text;
        });
      } catch (error: any) {
        if (isModelUnavailableError(error) && attempts < maxModelAttempts) {
          logger.warn(`[GeminiService] Model "${resolvedModelName}" unavailable. Blacklisting and retrying.`);
          blacklistModel(resolvedModelName);
          resolvedModelName = await getLatestSupportedModel(config.gemini.apiKey);
        } else {
          if (grokService.isConfigured()) {
            logger.warn(`[GeminiService] Gemini calls failed (${error.message}). Attempting automatic fallback to Grok API...`);
            return await grokService.generateText(prompt, { temperature });
          }
          throw error;
        }
      }
    }

    if (grokService.isConfigured()) {
      logger.warn('[GeminiService] All Gemini model attempts failed. Falling back to Grok API...');
      return await grokService.generateText(prompt, { temperature });
    }

    throw new Error('[GeminiService] generateText failed after all model fallbacks.');
  }

  /**
   * Request structured output and return the parsed JSON object.
   */
  public async generateJson<T>(
    prompt: string,
    schema: any,
    options: { modelName?: string; temperature?: number } = {}
  ): Promise<T> {
    const rawResponse = await this.generateText(prompt, {
      ...options,
      responseSchema: schema,
    });

    try {
      return JSON.parse(rawResponse) as T;
    } catch (err: any) {
      logger.error('[GeminiService] Failed to parse structured JSON from Gemini model', {
        rawResponse: rawResponse?.substring(0, 300),
        error: err.message,
      });
      throw new Error(`JSON parsing failed: ${err.message}`);
    }
  }
}

export const geminiService = new GeminiService();
