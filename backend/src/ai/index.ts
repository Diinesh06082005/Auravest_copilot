import { StateGraph } from '@langchain/langgraph';
import { initializeGemini } from './services';
import { InvestmentStateAnnotation } from './state';
import { logger } from '../shared/logger';
import { getLatestSupportedModel } from './config';

export * from './types';
export * from './state';
export * from './prompts';
export * from './tools';
export * from './nodes';
export * from './graph';
export * from './utils';
export * from './graphRunner';
export { getGeminiClient } from './services';

/**
 * Validates and checks the readiness of the AI layer (Gemini, LangChain, LangGraph)
 */
export async function verifyAIInfrastructure(): Promise<{
  langchain: string;
  langgraph: string;
  gemini: string;
  status: string;
}> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing environment variable: GEMINI_API_KEY');
    }
    
    const activeModel = await getLatestSupportedModel(apiKey);
    const client = initializeGemini(apiKey, activeModel);
    if (!client) {
      throw new Error('Failed to initialize ChatGoogleGenerativeAI client instance');
    }

    const builder = new StateGraph(InvestmentStateAnnotation);
    if (!builder) {
      throw new Error('Failed to build LangGraph StateGraph instance');
    }

    logger.info('✅ AI Layer foundation: LangChain, LangGraph and Gemini Generative AI are initialized successfully.');
    
    return {
      langchain: 'ready',
      langgraph: 'ready',
      gemini: 'ready',
      status: 'AI infrastructure initialized',
    };
  } catch (error: any) {
    logger.error('❌ AI Layer foundation initialization failed:', { error: error.message });
    throw error;
  }
}
