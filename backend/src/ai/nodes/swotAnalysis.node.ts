import { GraphState } from '../state';
import { SwotService } from '../services/swot/swot.service';
import { logger } from '../../shared/logger';

let swotServiceInstance: SwotService | null = null;

/**
 * Lazy resolver for SwotService.
 */
function getSwotService(): SwotService {
  if (!swotServiceInstance) {
    swotServiceInstance = new SwotService();
  }
  return swotServiceInstance;
}

/**
 * LangGraph node that performs a comprehensive SWOT analysis
 * using the Google Gemini model.
 */
export async function swotAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const symbol = state.company;
  logger.info(`swotAnalysisNode: Starting SWOT analysis for: "${symbol}"`);

  try {
    const service = getSwotService();
    const swotResult = await service.generateSwot(state);

    return {
      swot: swotResult,
      errors: [],
    };
  } catch (error: any) {
    logger.error(`swotAnalysisNode failed for symbol "${symbol}": ${error.message}`);
    return {
      errors: [error.message],
    };
  }
}
