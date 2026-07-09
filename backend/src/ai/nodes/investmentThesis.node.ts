import { GraphState } from '../state';
import { InvestmentThesisService } from '../services/investmentThesis/investmentThesis.service';
import { logger } from '../../shared/logger';

let thesisServiceInstance: InvestmentThesisService | null = null;

/**
 * Lazy resolver for InvestmentThesisService.
 */
function getThesisService(): InvestmentThesisService {
  if (!thesisServiceInstance) {
    thesisServiceInstance = new InvestmentThesisService();
  }
  return thesisServiceInstance;
}

/**
 * LangGraph node that generates a structured investment thesis
 * using the Google Gemini model.
 */
export async function investmentThesisNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const symbol = state.company;
  logger.info(`investmentThesisNode: Starting Thesis analysis for: "${symbol}"`);

  try {
    const service = getThesisService();
    const thesisResult = await service.generateThesis(state);

    return {
      thesis: thesisResult,
      errors: [],
    };
  } catch (error: any) {
    logger.error(`investmentThesisNode failed for symbol "${symbol}": ${error.message}`);
    return {
      errors: [error.message],
    };
  }
}
