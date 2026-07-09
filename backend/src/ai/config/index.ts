import { logger } from '../../shared/logger';
import { fetchWithRetry } from '../../shared/utils/fetch';
import { config } from '../../shared/config';
export { geminiKeyRotator } from './keyRotation';

/**
 * Convenience helper — returns the next rotated API key.
 * Use this instead of config.gemini.apiKey in all AI service calls.
 */
export function getNextApiKey(): string {
  const { geminiKeyRotator } = require('./keyRotation');
  return geminiKeyRotator.getNextKey();
}


// Preferred list of models, ordered from newest/best to older/fallback
// NOTE: gemini-3.x does NOT exist. Real models as of 2025 are 2.5, 2.0, 1.5
export const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

// Set of models that are confirmed to be unavailable/failed during execution
const blacklistedModels = new Set<string>();

let cachedResolvedModel: string | null = null;

/**
 * Dynamically queries the Google AI Studio API for available models.
 * Filters the list against our preferred models.
 */
export async function getAvailableModelsFromApi(apiKey: string): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`Gemini API models endpoint returned status ${response.status}: ${response.statusText}`);
    }
    const data = (await response.json()) as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    if (!data.models || !Array.isArray(data.models)) {
      return [];
    }
    return data.models
      .filter((m) => {
        // Only keep models that support generating content
        const methods = m.supportedGenerationMethods || [];
        return methods.includes('generateContent') || methods.includes('generateMessage');
      })
      .map((m) => m.name.replace(/^models\//, ''));
  } catch (err: any) {
    logger.warn(`Could not query available models from Gemini API: ${err.message}`);
    return [];
  }
}

/**
 * Returns the best available Gemini model based on API capabilities, environment preferences, and prior run failures.
 */
export async function getLatestSupportedModel(apiKey: string): Promise<string> {
  // If we already resolved a model and it's not blacklisted, return it
  if (cachedResolvedModel && !blacklistedModels.has(cachedResolvedModel)) {
    return cachedResolvedModel;
  }

  const envModel = process.env.GEMINI_MODEL;
  if (envModel && !blacklistedModels.has(envModel)) {
    logger.info(`Using environment-configured model: ${envModel}`);
    cachedResolvedModel = envModel;
    return envModel;
  }

  const apiModels = await getAvailableModelsFromApi(apiKey);
  const activeModels = apiModels.filter((m) => !blacklistedModels.has(m));

  if (activeModels.length > 0) {
    // 1. Try to find the first preferred model in the available list
    for (const pref of PREFERRED_MODELS) {
      if (activeModels.includes(pref)) {
        logger.info(`Resolved Gemini model: ${pref} (dynamically verified from API)`);
        cachedResolvedModel = pref;
        return pref;
      }
    }

    // 2. Fall back to any model containing 'flash' that isn't blacklisted
    const fallbackFlash = activeModels.find((m) => m.includes('flash') && !m.includes('vision'));
    if (fallbackFlash) {
      logger.info(`Resolved Gemini model: ${fallbackFlash} (dynamic fallback flash)`);
      cachedResolvedModel = fallbackFlash;
      return fallbackFlash;
    }

    // 3. Fall back to the first active model from the API
    logger.info(`Resolved Gemini model: ${activeModels[0]} (first available model from API)`);
    cachedResolvedModel = activeModels[0];
    return activeModels[0];
  }

  // If the API call failed or returned empty, resolve using our hardcoded list (excluding blacklisted ones)
  const remainingPreferred = PREFERRED_MODELS.filter((m) => !blacklistedModels.has(m));
  if (remainingPreferred.length > 0) {
    const fallback = remainingPreferred[0];
    logger.info(`Resolved Gemini model: ${fallback} (hardcoded fallback priority list)`);
    cachedResolvedModel = fallback;
    return fallback;
  }

  // Absolute fallback in case everything is blacklisted
  const absoluteFallback = 'gemini-2.5-flash';
  logger.warn(`All preferred models are blacklisted. Falling back to default: ${absoluteFallback}`);
  return absoluteFallback;
}

/**
 * Returns a model synchronously if cached, otherwise returns the highest priority non-blacklisted preferred model.
 */
export function getLatestSupportedModelSync(): string {
  if (cachedResolvedModel && !blacklistedModels.has(cachedResolvedModel)) {
    return cachedResolvedModel;
  }
  const envModel = process.env.GEMINI_MODEL;
  if (envModel && !blacklistedModels.has(envModel)) {
    return envModel;
  }
  const remainingPreferred = PREFERRED_MODELS.filter((m) => !blacklistedModels.has(m));
  return remainingPreferred[0] || 'gemini-2.5-flash';
}

/**
 * Marks a model as unavailable/failed, forcing a re-evaluation on the next call.
 */
export function blacklistModel(modelName: string): void {
  if (!blacklistedModels.has(modelName)) {
    logger.warn(`Blacklisting model ${modelName} due to API/execution failure.`);
    blacklistedModels.add(modelName);
    if (cachedResolvedModel === modelName) {
      cachedResolvedModel = null;
    }
  }
}

/**
 * Checks if an error is a "model not found" or deprecated error.
 */
export function isModelUnavailableError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  const status = error?.status || error?.statusCode;
  
  // 400 or 404 indicates model not found / deprecated
  // We exclude 429 (rate limit) and other validation errors
  const isHttpModelError = status === 404 || status === 400;
  
  const hasUnavailableKeywords = 
    message.includes('not found') || 
    message.includes('not_found') || 
    message.includes('deprecated') || 
    message.includes('unsupported model') || 
    message.includes('invalid model') ||
    message.includes('does not exist') ||
    message.includes('not supported') ||
    message.includes('not available');

  return isHttpModelError || hasUnavailableKeywords;
}
