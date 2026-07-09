import { GraphState } from '../state';
import { generateGeminiJson } from '../utils';
import { logger } from '../../shared/logger';
import { InvestmentRecommendation } from '../types';

export async function recommendationNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) return {};

  const ticker = state.company;
  logger.info(`recommendationNode: Generating final target rating and recommendation for '${ticker}'`);

  const prompt = `Perform a comprehensive equity valuation and synthesize the final investment recommendation for ${ticker} based on this compiled dataset:
  - Current Price: $${state.stock?.currentPrice} (Change: ${state.stock?.dailyChangePercent}%)
  - Investment Score: ${JSON.stringify(state.investmentScore)}
  - SWOT Quadrants: ${JSON.stringify(state.swot)}
  - Risk Assessment: ${JSON.stringify(state.risk)}
  - Investment Thesis: ${JSON.stringify(state.thesis)}
  
  Return strictly a JSON object with this shape:
  {
    "recommendation": {
      "rating": "BUY",
      "targetPrice": "$210.00",
      "horizon": "12-18 Months",
      "rationale": [
        "First key reason based on financials/growth.",
        "Second key reason based on SWOT/Opportunities.",
        "Third key reason based on risk mitigation."
      ]
    },
    "confidence": 85
  }
  Note: rating MUST be "BUY", "HOLD", or "SELL". confidence MUST be a number between 0 and 100.`;

  const defaultRecommendation: InvestmentRecommendation = {
    rating: 'HOLD',
    targetPrice: `$${state.stock?.currentPrice || '200.00'}`,
    horizon: '12 Months',
    rationale: ['Consolidation expected in current market phase.'],
  };

  const response = await generateGeminiJson<{
    recommendation: InvestmentRecommendation;
    confidence: number;
  }>(prompt, {
    recommendation: defaultRecommendation,
    confidence: 70,
  });

  return {
    recommendation: response.recommendation,
    confidence: response.confidence,
  };
}
