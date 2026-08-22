import { GraphState } from '../../state';
import { ScoreBreakdown } from '../../types';
import { logger } from '../../../shared/logger';
import { InvestmentScoreValidator } from './investmentScore.validator';
import * as utils from './investmentScore.utils';
import { customModelService } from '../customModel.service';

export class InvestmentScoreService {
  private readonly validator = new InvestmentScoreValidator();

  /**
   * Evaluates the corporate dimension scores and aggregates a single, weighted investment grade.
   */
  public calculateScores(state: GraphState): ScoreBreakdown {
    const company = state.company;
    logger.info(`[InvestmentScoreService] Commencing scoring calculations for: "${company}"`);

    // 1. Calculate each score detail
    const financialHealth = utils.calculateFinancialHealth(state);
    const growth = utils.calculateGrowth(state);
    const profitability = utils.calculateProfitability(state);
    const valuation = utils.calculateValuation(state);
    const marketPerformance = utils.calculateMarketPerformance(state);
    const competitiveStrength = utils.calculateCompetitiveStrength(state);
    const newsSentiment = utils.calculateNewsSentiment(state);
    const risk = utils.calculateRisk(state);
    const management = utils.calculateManagement(state);
    const innovation = utils.calculateInnovation(state);

    // Run Custom ML Model Inference
    const mlPrediction = customModelService.predict({
      peRatio: state.financials?.peRatio || 20,
      debtToEquity: state.financials?.debtToEquity || 1.2,
      profitMargin: state.financials?.operatingMargin || 0.15,
      revenueGrowth: state.financials?.revenueGrowth || 0.10,
      beta: state.stock?.beta || 1.1,
    });
    logger.info(`[CustomMLModel] Inference output for "${company}": Score=${mlPrediction.predictedQuantScore}, Grade=${mlPrediction.financialGrade}, BankruptcyProb=${mlPrediction.bankruptcyProbability}%`);

    // 2. Weighted overall score calculation
    const weightedSum = 
      (financialHealth.value * financialHealth.weight) +
      (growth.value * growth.weight) +
      (profitability.value * profitability.weight) +
      (valuation.value * valuation.weight) +
      (marketPerformance.value * marketPerformance.weight) +
      (competitiveStrength.value * competitiveStrength.weight) +
      (newsSentiment.value * newsSentiment.weight) +
      (risk.value * risk.weight) +
      (management.value * management.weight) +
      (innovation.value * innovation.weight);

    const overallScore = Math.round(weightedSum);
    const grade = utils.calculateGrade(overallScore);

    const scoreBreakdown: ScoreBreakdown = {
      financialHealth,
      growth,
      profitability,
      valuation,
      marketPerformance,
      competitiveStrength,
      newsSentiment,
      risk,
      management,
      innovation,
      overallScore,
      grade,
      mlPrediction,
    };

    // 3. Validation check
    const isValid = this.validator.validate(scoreBreakdown);
    if (!isValid) {
      throw new Error(`[InvestmentScoreService] Generated score breakdown failed validation checks for symbol: "${company}"`);
    }

    logger.info(`[InvestmentScoreService] Successfully computed investment score for "${company}": ${overallScore} (Grade: ${grade})`);

    return scoreBreakdown;
  }
}
