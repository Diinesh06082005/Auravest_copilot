import { ScoreBreakdown } from '../../types';
import { logger } from '../../../shared/logger';

export class InvestmentScoreValidator {
  /**
   * Validates score breakdown bounds, types, and properties.
   */
  public validate(scoreBreakdown: ScoreBreakdown): boolean {
    const keys: (keyof Omit<ScoreBreakdown, 'overallScore' | 'grade' | 'mlPrediction'>)[] = [
      'financialHealth',
      'growth',
      'profitability',
      'valuation',
      'marketPerformance',
      'competitiveStrength',
      'newsSentiment',
      'risk',
      'management',
      'innovation',
    ];

    let weightsSum = 0;

    for (const key of keys) {
      const scoreObj = scoreBreakdown[key];
      if (!scoreObj) {
        logger.error(`[InvestmentScoreValidator] Missing score object for: "${key}"`);
        return false;
      }

      if (typeof scoreObj.value !== 'number' || scoreObj.value < 0 || scoreObj.value > 100) {
        logger.error(`[InvestmentScoreValidator] Score value out of bounds (0-100) for "${key}": ${scoreObj.value}`);
        return false;
      }

      if (typeof scoreObj.weight !== 'number' || scoreObj.weight < 0 || scoreObj.weight > 1.0) {
        logger.error(`[InvestmentScoreValidator] Weight out of bounds (0-1.0) for "${key}": ${scoreObj.weight}`);
        return false;
      }

      weightsSum += scoreObj.weight;
    }

    if (Math.abs(weightsSum - 1.0) > 0.001) {
      logger.error(`[InvestmentScoreValidator] Score weights sum must equal 1.0. Found: ${weightsSum}`);
      return false;
    }

    if (typeof scoreBreakdown.overallScore !== 'number' || scoreBreakdown.overallScore < 0 || scoreBreakdown.overallScore > 100) {
      logger.error(`[InvestmentScoreValidator] Overall investment score out of bounds: ${scoreBreakdown.overallScore}`);
      return false;
    }

    if (!scoreBreakdown.grade || typeof scoreBreakdown.grade !== 'string') {
      logger.error(`[InvestmentScoreValidator] Overall score grade is missing or invalid.`);
      return false;
    }

    return true;
  }
}
