import { config } from '../../../shared/config';
import { logger } from '../../../shared/logger';
import { fetchWithRetry } from '../../../shared/utils/fetch';

export class GrokService {
  /**
   * Check if Grok / Groq API key is configured.
   */
  public isConfigured(): boolean {
    return Boolean(config.grok.apiKey);
  }

  /**
   * Generate text via Grok / Groq OpenAI-compatible endpoint.
   * Auto-detects Groq (`gsk_` prefix) vs xAI (`xai-` / generic prefix).
   */
  public async generateText(prompt: string, options: { modelName?: string; temperature?: number } = {}): Promise<string> {
    const apiKey = config.grok.apiKey;
    if (!apiKey) {
      throw new Error('[GrokService] GROK_API_KEY is not configured.');
    }

    const isGroq = apiKey.startsWith('gsk_');
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.x.ai/v1/chat/completions';

    const model = options.modelName || (isGroq ? 'groq/compound' : 'grok-2-latest');
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;

    const providerName = isGroq ? 'Groq' : 'Grok (xAI)';
    logger.info(`[GrokService] Falling back to ${providerName} API using model "${model}"...`);

    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      logger.error(`[GrokService] ${providerName} API request failed with status ${response.status}: ${errText}`);
      throw new Error(`[GrokService] ${providerName} HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error(`[GrokService] Received empty content from ${providerName} API response.`);
    }

    return text;
  }

  /**
   * Request structured JSON output from Grok / Groq API.
   */
  public async generateJson<T>(prompt: string, schema?: any, options: { modelName?: string; temperature?: number } = {}): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object strictly adhering to the schema. Do not include markdown codeblocks or extra text.`;
    const rawResponse = await this.generateText(jsonPrompt, options);

    // Clean potential markdown blocks if present
    const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      logger.error('[GrokService] Failed to parse JSON response from LLM model', {
        rawResponse: cleaned.substring(0, 300),
        error: err.message,
      });
      throw new Error(`JSON parsing failed: ${err.message}`);
    }
  }
}

export const grokService = new GrokService();
