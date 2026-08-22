import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { getLatestSupportedModelSync, getLatestSupportedModel, blacklistModel, isModelUnavailableError, geminiKeyRotator } from '../config';
import { config } from '../../shared/config';

let apiKeyStored: string | null = null;
let currentModelName: string | null = null;
let geminiClientInstance: ChatGoogleGenerativeAI | null = null;
let geminiClientProxy: ChatGoogleGenerativeAI | null = null;

function createNewInstance(apiKey: string, modelName: string): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({ apiKey, modelName, maxOutputTokens: 8192 });
}

function createGeminiClientProxy(): ChatGoogleGenerativeAI {
  const handler: ProxyHandler<any> = {
    get(target, prop, receiver) {
      // Intercept invoke — rotate key on each call
      if (prop === 'invoke') {
        return async function (this: any, ...args: any[]) {
          let attempts = 0;
          const totalKeys = config.gemini.apiKeys ? config.gemini.apiKeys.length : 1;
          const maxAttempts = Math.max(6, totalKeys * 3); // 3 attempts per key minimum
          while (attempts < maxAttempts) {
            attempts++;
            try {
              // Get next key and reinitialize client if it changed
              const nextKey = geminiKeyRotator.getNextKey();
              if (!geminiClientInstance || nextKey !== apiKeyStored || !currentModelName) {
                apiKeyStored = nextKey;
                currentModelName = currentModelName || getLatestSupportedModelSync();
                geminiClientInstance = createNewInstance(nextKey, currentModelName);
              }
              return await (geminiClientInstance as any).invoke(...args);
            } catch (err: any) {
              const isQuota = err.status === 429 || err.message?.includes('429') || err.message?.includes('quota');
              if (isQuota && apiKeyStored) {
                geminiKeyRotator.markQuotaExceeded(apiKeyStored);
                apiKeyStored = null; // force re-init next iteration
                await new Promise((r) => setTimeout(r, 1000));
                continue;
              }
              if (isModelUnavailableError(err) && attempts < maxAttempts && apiKeyStored && currentModelName) {
                blacklistModel(currentModelName);
                const nextModel = await getLatestSupportedModel(apiKeyStored);
                currentModelName = nextModel;
                geminiClientInstance = createNewInstance(apiKeyStored, nextModel);
              } else {
                throw err;
              }
            }
          }
          throw new Error('[GeminiProxy] All key+model rotation attempts exhausted.');
        };
      }

      // Delegate all other access to the active instance
      const value = geminiClientInstance ? Reflect.get(geminiClientInstance, prop, receiver) : undefined;
      if (typeof value === 'function') {
        return value.bind(geminiClientInstance);
      }
      return value;
    },
    getPrototypeOf(target) {
      return geminiClientInstance ? Reflect.getPrototypeOf(geminiClientInstance) : null;
    },
    has(target, key) {
      return geminiClientInstance ? Reflect.has(geminiClientInstance, key) : false;
    }
  };

  return new Proxy({}, handler) as ChatGoogleGenerativeAI;
}

export function initializeGemini(apiKey: string, modelName?: string): ChatGoogleGenerativeAI {
  if (!apiKey) {
    throw new Error('API key must be provided to initialize Gemini client.');
  }
  apiKeyStored = apiKey;
  
  const resolvedModel = modelName || getLatestSupportedModelSync();
  currentModelName = resolvedModel;
  
  geminiClientInstance = new ChatGoogleGenerativeAI({
    apiKey,
    modelName: resolvedModel,
    maxOutputTokens: 8192,
  });
  
  if (!geminiClientProxy) {
    geminiClientProxy = createGeminiClientProxy();
  }
  
  return geminiClientProxy;
}

export function getGeminiClient(): ChatGoogleGenerativeAI {
  if (!geminiClientProxy) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Gemini client has not been initialized. Please call initializeGemini first.');
    }
    return initializeGemini(key);
  }
  return geminiClientProxy;
}
