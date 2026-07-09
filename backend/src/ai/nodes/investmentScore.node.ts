import { GraphState } from '../state';
import { InvestmentScoreService } from '../services/investmentScore/investmentScore.service';
import { logger } from '../../shared/logger';

let scoreServiceInstance: InvestmentScoreService | null = null;

/**
 * Lazy resolver for InvestmentScoreService.
 */
function getScoreService(): InvestmentScoreService {
  if (!scoreServiceInstance) {
    scoreServiceInstance = new InvestmentScoreService();
  }
  return scoreServiceInstance;
}

/**
 * LangGraph node that computes the deterministic investment scoring breakdown.
 */
export async function investmentScoreNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const symbol = state.company;
  logger.info(`investmentScoreNode: Starting Score calculations for: "${symbol}"`);

  try {
    const service = getScoreService();
    const scoreResult = service.calculateScores(state);

    return {
      investmentScore: scoreResult,
      errors: [],
    };
  } catch (error: any) {
    logger.error(`investmentScoreNode failed for symbol "${symbol}": ${error.message}`);
    return {
      errors: [error.message],
    };
  }
}
