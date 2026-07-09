import { GraphState } from '../../state';
import { RiskAnalysisResult } from './risk.types';
import { runRiskAnalysis } from './risk.mapper';
import { riskFactorsSchema } from './risk.validator';
import { logger } from '../../../shared/logger';

export class RiskService {
  /**
   * Evaluates risk profiles deterministically based on the validated input state.
   */
  public async analyzeRisk(state: GraphState): Promise<RiskAnalysisResult> {
    logger.info(`[RiskService] Commencing risk intelligence calculations for symbol: "${state.company}"`);

    const profile = state.validatedData?.profile || state.profile;
    const financials = state.validatedData?.financials || state.financials;
    const stock = state.validatedData?.stock || state.stock;
    const news = state.validatedData?.news || state.news || [];
    const competitors = state.validatedData?.competitors || state.competitors || [];

    const rawProfile = runRiskAnalysis(profile, financials, stock, news, competitors);

    // Validate format using Zod
    const riskProfile = riskFactorsSchema.parse(rawProfile);

    return {
      riskProfile,
    };
  }
}
