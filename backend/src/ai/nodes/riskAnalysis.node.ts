import { GraphState } from '../state';
import { RiskService } from '../services/risk/risk.service';
import { logger } from '../../shared/logger';

let riskServiceInstance: RiskService | null = null;

/**
 * Lazy resolver for RiskService.
 */
function getRiskService(): RiskService {
  if (!riskServiceInstance) {
    riskServiceInstance = new RiskService();
  }
  return riskServiceInstance;
}

/**
 * LangGraph node responsible for calculating investment risk categories
 * and aggregating overall risk levels deterministically.
 */
export async function riskAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const symbol = state.company;
  logger.info(`riskAnalysisNode: Starting risk assessment for: "${symbol}"`);

  try {
    const service = getRiskService();
    const result = await service.analyzeRisk(state);

    return {
      risk: result.riskProfile,
      errors: [],
    };
  } catch (error: any) {
    logger.error(`riskAnalysisNode failed for symbol "${symbol}": ${error.message}`);
    return {
      errors: [error.message],
    };
  }
}
