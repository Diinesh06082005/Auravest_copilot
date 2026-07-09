import { MetricComparison, RelativePerformance, RankingItem } from '../../types';

/**
 * Calculates average and percentage difference against peer averages.
 */
export function calculateMetricComparison(
  metricName: string,
  targetValue: number,
  competitorValues: number[]
): MetricComparison {
  const cleanValues = competitorValues.filter(v => typeof v === 'number' && !isNaN(v));
  const avg = cleanValues.length > 0 ? cleanValues.reduce((sum, v) => sum + v, 0) / cleanValues.length : 0;
  let diffPct = 0;
  if (avg !== 0) {
    diffPct = +(((targetValue - avg) / avg) * 100).toFixed(2);
  }
  return {
    metric: metricName,
    targetValue: +targetValue.toFixed(2),
    competitorAverage: +avg.toFixed(2),
    differencePercent: diffPct,
  };
}

/**
 * Builds sorted list rankings.
 */
export function buildRankings(
  targetItem: { name: string; symbol: string; value: number },
  competitorItems: { name: string; symbol: string; value: number }[],
  descending = true
): RankingItem[] {
  const list = [targetItem, ...competitorItems];
  list.sort((a, b) => descending ? b.value - a.value : a.value - b.value);
  return list.map((item, index) => ({
    name: item.name,
    symbol: item.symbol,
    value: +item.value.toFixed(2),
    rank: index + 1,
  }));
}

/**
 * Computes overall relative strength and identifies key strengths/weaknesses.
 */
export function buildRelativePerformance(
  comparisons: {
    marketCapComparison: MetricComparison;
    revenueComparison: MetricComparison;
    profitabilityComparison: MetricComparison;
    growthComparison: MetricComparison;
    valuationComparison: MetricComparison;
  },
  targetMarketCap: number,
  allMarketCaps: number[]
): RelativePerformance {
  let positiveScorePoints = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 1. Market Cap Comparison
  if (comparisons.marketCapComparison.differencePercent > 0) {
    positiveScorePoints += 20;
    strengths.push('Market Capitalization leads peer average.');
  } else {
    weaknesses.push('Market Capitalization is smaller than peer average.');
  }

  // 2. Revenue Comparison
  if (comparisons.revenueComparison.differencePercent > 0) {
    positiveScorePoints += 20;
    strengths.push('Revenue volume exceeds peer average.');
  } else {
    weaknesses.push('Revenue size lags peer average.');
  }

  // 3. Profitability Comparison (ROE)
  if (comparisons.profitabilityComparison.differencePercent > 0) {
    positiveScorePoints += 20;
    strengths.push('Capital efficiency (ROE) outperforms peer average.');
  } else {
    weaknesses.push('Return on Equity (ROE) underperforms peers.');
  }

  // 4. Growth Comparison (Revenue Growth)
  if (comparisons.growthComparison.differencePercent > 0) {
    positiveScorePoints += 20;
    strengths.push('Revenue growth rate is faster than peers.');
  } else {
    weaknesses.push('Revenue expansion rate lags peers.');
  }

  // 5. Valuation Comparison (lower PE is favorable)
  const peTarget = comparisons.valuationComparison.targetValue;
  const peAvg = comparisons.valuationComparison.competitorAverage;
  if (peTarget > 0 && (peTarget < peAvg || peAvg <= 0)) {
    positiveScorePoints += 20;
    strengths.push('Valuation multiple (PE Ratio) is more attractive than peers.');
  } else if (peTarget > 0) {
    weaknesses.push('Trading at a valuation premium (higher PE Ratio) relative to peers.');
  }

  // Market share estimate (based on Market Cap proportion)
  const totalMC = allMarketCaps.reduce((sum, v) => sum + v, 0);
  const marketShareEstimate = totalMC > 0 ? +((targetMarketCap / totalMC) * 100).toFixed(2) : 0;

  return {
    overallScore: positiveScorePoints,
    marketShareEstimate,
    strengths,
    weaknesses,
  };
}
