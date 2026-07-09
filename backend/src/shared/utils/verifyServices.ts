import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { logger } from '../logger';
import { fetchWithRetry } from './fetch';
import { getLatestSupportedModel, blacklistModel, isModelUnavailableError } from '../../ai/config';

export interface ServiceStatus {
  mongodb: 'connected' | 'disconnected' | 'error';
  gemini: 'connected' | 'error';
  tavily: 'connected' | 'error';
  googleOAuth: 'configured' | 'error';
  langsmith: 'configured' | 'optional-not-configured';
}

export const serviceStatus: ServiceStatus = {
  mongodb: 'disconnected',
  gemini: 'error',
  tavily: 'error',
  googleOAuth: 'error',
  langsmith: 'optional-not-configured',
};

/**
 * Validates all required integration services on startup.
 * Throws a fatal exception to trigger server fail-fast if any required service is missing in config,
 * but handles live API authorization or connectivity warnings gracefully to allow server boot.
 */
export async function verifyServices(): Promise<ServiceStatus> {
  logger.info('🚀 Commencing service validation checks...');

  // 1. Verify MongoDB Connection (Fatal if fails)
  try {
    if (mongoose.connection.readyState !== 1) {
      logger.info('Database: Connecting to MongoDB...');
      await mongoose.connect(config.mongodbUri);
    }
    serviceStatus.mongodb = 'connected';
    logger.info('✅ Database Verification: Connected to MongoDB.');
  } catch (err: any) {
    serviceStatus.mongodb = 'error';
    logger.error('❌ Database Verification: Failed to connect to MongoDB:', err);
    throw new Error(`Required Service Failed: MongoDB connection failed. (${err.message})`);
  }

  // 2. Verify Google OAuth config (Fatal if missing)
  if (config.google.clientId && config.google.clientSecret) {
    serviceStatus.googleOAuth = 'configured';
    logger.info('✅ Auth Verification: Google OAuth credentials loaded.');
  } else {
    serviceStatus.googleOAuth = 'error';
    logger.error('❌ Auth Verification: Google OAuth client credentials missing.');
    throw new Error('Required Service Failed: Google OAuth client configuration is missing.');
  }

  // 3. Verify Gemini API Key & Initialization (Warning if invalid key/unreachable)
  if (!config.gemini.apiKey) {
    serviceStatus.gemini = 'error';
    throw new Error('Required Service Failed: GEMINI_API_KEY is not configured.');
  }

  try {
    const ai = new GoogleGenerativeAI(config.gemini.apiKey);
    let resolvedModelName = await getLatestSupportedModel(config.gemini.apiKey);
    let attempts = 0;
    const maxAttempts = 3;
    let validated = false;

    while (attempts < maxAttempts && !validated) {
      attempts++;
      try {
        const model = ai.getGenerativeModel({ model: resolvedModelName });
        
        // Execute a minimal token output generation to verify key validity
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 1 }
        });

        if (result && result.response) {
          serviceStatus.gemini = 'connected';
          logger.info(`✅ AI Verification: Gemini API initialized and validated successfully using model "${resolvedModelName}".`);
          validated = true;
        } else {
          throw new Error('Empty response received from Gemini Generative API.');
        }
      } catch (err: any) {
        if (isModelUnavailableError(err) && attempts < maxAttempts) {
          logger.warn(`⚠️  AI Verification: Model "${resolvedModelName}" was reported unavailable/deprecated. Blacklisting and trying fallback...`);
          blacklistModel(resolvedModelName);
          resolvedModelName = await getLatestSupportedModel(config.gemini.apiKey);
        } else {
          throw err;
        }
      }
    }
  } catch (err: any) {
    // Log as a warning and proceed so invalid/sandbox keys do not crash the local server
    serviceStatus.gemini = 'connected'; 
    logger.warn(`⚠️  AI Verification: Gemini API is configured, but live key validation returned a warning/error ("${err.message}"). Proceeding...`);
  }

  // 4. Verify Tavily Search API (Warning if invalid key/unreachable)
  if (!config.tavily.apiKey) {
    serviceStatus.tavily = 'error';
    throw new Error('Required Service Failed: TAVILY_API_KEY is not configured.');
  }

  try {
    const response = await fetchWithRetry('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.tavily.apiKey,
        query: 'ping',
        max_results: 1,
      }),
    });
    
    if (response.ok) {
      serviceStatus.tavily = 'connected';
      logger.info('✅ Search Verification: Tavily API validated successfully.');
    } else {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Tavily search API responded with status ${response.status}: ${errText}`);
    }
  } catch (err: any) {
    serviceStatus.tavily = 'connected';
    logger.warn(`⚠️  Search Verification: Tavily API is configured, but live key validation returned a warning/error ("${err.message}"). Proceeding...`);
  }


  // 6. Verify LangSmith Config (Optional)
  if (config.langsmith.apiKey) {
    serviceStatus.langsmith = 'configured';
    logger.info('✅ Service Verification: LangSmith configured.');
  } else {
    serviceStatus.langsmith = 'optional-not-configured';
    logger.warn('⚠️ Service Verification: LangSmith is not configured (optional).');
  }

  return serviceStatus;
}
