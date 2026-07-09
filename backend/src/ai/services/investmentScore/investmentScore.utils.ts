import { GraphState } from '../../state';
import { ScoreDetail } from '../../types';
import { SCORE_WEIGHTS, GRADE_RANGES } from './investmentScore.constants';

/**
 * Calculates a letter grade based on an overall score (0-100).
 */
export function calculateGrade(score: number): string {
  for (const range of GRADE_RANGES) {
    if (score >= range.min) {
      return range.grade;
    }
  }
  return 'D';
}

/**
 * Calculates Financial Health Score.
 */
export function calculateFinancialHealth(state: GraphState): ScoreDetail {
  const financials = state.financials;
  const weight = SCORE_WEIGHTS.financialHealth;
  let value = 50;
  let details = 'Using baseline fallback due to missing financial statement information.';

  if (financials) {
    if (financials.healthScore !== undefined) {
      value = financials.healthScore;
      details = `Reused calculated financial health score of ${value}.`;
    } else {
      const cr = financials.currentRatio || 1.0;
      const qr = financials.quickRatio || 0.8;
      const de = financials.debtToEquity || 1.0;

      const crScore = Math.min(cr / 1.5, 1) * 35;
      const qrScore = Math.min(qr / 1.0, 1) * 35;
      const deScore = de <= 1.0 ? 30 : Math.max(30 - (de - 1) * 10, 0);

      value = Math.round(crScore + qrScore + deScore);
      details = `Calculated using Current Ratio (${cr.toFixed(2)}), Quick Ratio (${qr.toFixed(2)}), and Debt-to-Equity (${de.toFixed(2)}).`;
    }
  }

  return {
    value,
    weight,
    explanation: 'Measures liquidity, leverage, and solvency ratios of the target company.',
    calculationDetails: details,
  };
}

/**
 * Calculates Growth Score.
 */
export function calculateGrowth(state: GraphState): ScoreDetail {
  const financials = state.financials;
  const weight = SCORE_WEIGHTS.growth;
  let value = 50;
  let details = 'Using baseline growth rate fallback.';

  if (financials) {
    const revenueGrowth = financials.revenueGrowth || 0;
    value = Math.round(Math.max(0, Math.min(revenueGrowth * 3, 100)));
    details = `Calculated from annual Revenue Growth rate of ${revenueGrowth.toFixed(2)}%.`;
  }

  return {
    value,
    weight,
    explanation: 'Evaluates the revenue and EPS growth momentum of the company.',
    calculationDetails: details,
  };
}

/**
 * Calculates Profitability Score.
 */
export function calculateProfitability(state: GraphState): ScoreDetail {
  const financials = state.financials;
  const weight = SCORE_WEIGHTS.profitability;
  let value = 50;
  let details = 'Using baseline profitability fallback.';

  if (financials) {
    const gm = financials.grossMargin || 0;
    const om = financials.operatingMargin || 0;
    const roe = financials.roe || 0;

    const gmScore = Math.min(gm * 1.5, 50);
    const omScore = Math.min(om * 2.0, 50);
    const roeScore = Math.min(Math.max(roe, 0), 100);

    value = Math.round(0.4 * gmScore + 0.4 * omScore + 0.2 * roeScore);
    details = `Calculated using Gross Margin (${gm.toFixed(2)}%), Operating Margin (${om.toFixed(2)}%), and ROE (${roe.toFixed(2)}%).`;
  }

  return {
    value,
    weight,
    explanation: 'Assesses margins and return on equity/capital metrics.',
    calculationDetails: details,
  };
}

/**
 * Calculates Valuation Score.
 */
export function calculateValuation(state: GraphState): ScoreDetail {
  const financials = state.financials;
  const weight = SCORE_WEIGHTS.valuation;
  let value = 50;
  let details = 'Using baseline valuation ratio fallback.';

  if (financials) {
    const pe = financials.peRatio || 0;
    const peg = financials.pegRatio || 0;

    const peScore = pe <= 0 ? 50 : Math.max(100 - pe * 2, 0);
    const pegScore = peg <= 0 ? 50 : Math.max(100 - peg * 30, 0);

    value = Math.round((peScore + pegScore) / 2);
    details = `Calculated using PE Ratio (${pe.toFixed(2)}) and PEG Ratio (${peg.toFixed(2)}). Lower multiples score higher.`;
  }

  return {
    value,
    weight,
    explanation: 'Measures earnings multipliers relative to peers and growth rates.',
    calculationDetails: details,
  };
}

/**
 * Calculates Market Performance Score.
 */
export function calculateMarketPerformance(state: GraphState): ScoreDetail {
  const stock = state.stock;
  const weight = SCORE_WEIGHTS.marketPerformance;
  let value = 50;
  let details = 'Using default baseline stock momentum.';

  if (stock) {
    const mom = stock.momentumScore !== undefined ? stock.momentumScore : 50;
    const trend = stock.trendScore !== undefined ? stock.trendScore : 50;
    value = Math.round((mom + trend) / 2);
    details = `Calculated using Stock Momentum Score (${mom}) and Trend Score (${trend}).`;
  }

  return {
    value,
    weight,
    explanation: 'Analyzes technical momentum, trend indicators, and stock volatility.',
    calculationDetails: details,
  };
}

/**
 * Calculates Competitive Strength Score.
 */
export function calculateCompetitiveStrength(state: GraphState): ScoreDetail {
  const competitors = state.competitors || [];
  const weight = SCORE_WEIGHTS.competitiveStrength;
  let value = 70;
  let details = 'Assigned strong default market competitiveness.';

  if (competitors.length > 0) {
    const targetCap = state.profile?.marketCapitalization || 0;
    const outperformed = competitors.filter(c => targetCap > (c.marketCap || 0)).length;
    value = Math.round((outperformed / competitors.length) * 100);
    details = `Calculated from outperforming ${outperformed} of ${competitors.length} listed industry competitors by market capitalization.`;
  }

  return {
    value,
    weight,
    explanation: 'Benchmarks corporate market cap and revenue against key sector rivals.',
    calculationDetails: details,
  };
}

/**
 * Calculates News Sentiment Score.
 */
export function calculateNewsSentiment(state: GraphState): ScoreDetail {
  const stats = state.newsStatistics;
  const weight = SCORE_WEIGHTS.newsSentiment;
  let value = 50;
  let details = 'No articles found; returning neutral score.';

  if (stats && stats.newsCount > 0) {
    const total = stats.newsCount;
    const pos = stats.positiveArticleCount || 0;
    const neg = stats.negativeArticleCount || 0;
    value = Math.round(((pos + (total - pos - neg) * 0.5) / total) * 100);
    details = `Calculated from ${total} articles: ${pos} positive, ${neg} negative, and ${total - pos - neg} neutral.`;
  }

  return {
    value,
    weight,
    explanation: 'Sentiment analysis of company press and media mentions.',
    calculationDetails: details,
  };
}

/**
 * Calculates Risk Score.
 */
export function calculateRisk(state: GraphState): ScoreDetail {
  const risk = state.risk;
  const weight = SCORE_WEIGHTS.risk;
  let value = 50;
  let details = 'Using default baseline risk profiles.';

  if (risk) {
    const riskScore = risk.overallRiskScore || 50;
    value = Math.round(100 - riskScore);
    details = `Derived inversely from overall risk exposure score of ${riskScore} (higher risk yields lower score).`;
  }

  return {
    value,
    weight,
    explanation: 'Inversely proportional to financial, business, and regulatory risks.',
    calculationDetails: details,
  };
}

/**
 * Calculates Management Score.
 */
export function calculateManagement(state: GraphState): ScoreDetail {
  const profile = state.profile;
  const financials = state.financials;
  const weight = SCORE_WEIGHTS.management;
  
  const hasCeo = profile?.ceo ? 30 : 0;
  const roic = financials?.roic || 0;
  const roicScore = Math.min(Math.max(roic, 0) * 2, 40);
  const healthScore = financials?.healthScore ? financials.healthScore * 0.3 : 15;

  const value = Math.round(Math.min(hasCeo + roicScore + healthScore, 100));
  const details = `Calculated using CEO presence (${profile?.ceo ? 'Yes' : 'No'}), ROIC (${roic.toFixed(2)}%), and corporate health factor.`;

  return {
    value,
    weight,
    explanation: 'Measures capital allocation efficiency and management stability.',
    calculationDetails: details,
  };
}

/**
 * Calculates Innovation Score.
 */
export function calculateInnovation(state: GraphState): ScoreDetail {
  const profile = state.profile;
  const swot = state.swot;
  const weight = SCORE_WEIGHTS.innovation;

  let base = 60;
  if (profile) {
    const sector = (profile.sector || '').toLowerCase();
    const ind = (profile.industry || '').toLowerCase();
    if (sector.includes('technology') || ind.includes('electronics')) {
      base = 85;
    } else if (sector.includes('healthcare') || sector.includes('biotech')) {
      base = 80;
    } else if (sector.includes('consumer') || sector.includes('cyclical')) {
      base = 70;
    }
  }

  let swotBonus = 0;
  if (swot) {
    const elements = [...swot.strengths, ...swot.opportunities];
    for (const el of elements) {
      const text = `${el.title} ${el.explanation}`.toLowerCase();
      if (text.includes('innovat') || text.includes('technology') || text.includes('r&d') || text.includes('ai ') || text.includes('artificial intelligence')) {
        swotBonus += 5;
      }
    }
  }

  const value = Math.min(base + Math.min(swotBonus, 15), 100);
  const details = `Calculated using sector classification (${profile?.sector || 'Unknown'}) and innovation keywords in SWOT profile.`;

  return {
    value,
    weight,
    explanation: 'Evaluates baseline sector technology exposure and SWOT opportunities.',
    calculationDetails: details,
  };
}
