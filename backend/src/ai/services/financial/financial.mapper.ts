import { FmpIncomeStatement, FmpKeyMetrics, FmpRatios, FmpFinancialGrowth } from './financial.types';
import { FinancialAnalysis } from '../../types';

/**
 * Deterministically calculates a Financial Health Score (0-100) based on
 * Profitability, Liquidity, Leverage, Cash Flow, and Growth profiles.
 */
export function calculateHealthScore(data: Omit<FinancialAnalysis, 'healthScore'>): number {
  let score = 0;

  // 1. Profitability (Max 20 points)
  const roePct = data.roe; // Passed as percentage
  if (roePct >= 15) score += 7;
  else if (roePct >= 8) score += 4;
  else if (roePct > 0) score += 2;

  const grossMarginPct = data.grossMargin;
  if (grossMarginPct >= 40) score += 7;
  else if (grossMarginPct >= 20) score += 4;
  else if (grossMarginPct > 0) score += 2;

  if (data.netIncome > 0) score += 6;

  // 2. Liquidity (Max 20 points)
  if (data.currentRatio >= 1.5 && data.currentRatio <= 3.0) score += 10;
  else if (data.currentRatio >= 1.0 && data.currentRatio < 1.5) score += 5;

  if (data.quickRatio >= 1.0) score += 10;
  else if (data.quickRatio >= 0.5 && data.quickRatio < 1.0) score += 5;

  // 3. Leverage / Efficiency (Max 20 points)
  if (data.debtToEquity < 0.5) score += 10;
  else if (data.debtToEquity < 1.0) score += 8;
  else if (data.debtToEquity < 1.5) score += 5;
  else if (data.debtToEquity < 2.0) score += 2;

  const roicPct = data.roic; // Passed as percentage
  if (roicPct >= 12) score += 10;
  else if (roicPct >= 6) score += 5;

  // 4. Cash Flow (Max 20 points)
  if (data.freeCashFlow > 0) score += 10;

  if (data.netIncome > 0) {
    const ratio = data.operatingCashFlow / data.netIncome;
    if (ratio >= 1.0) score += 10;
    else if (ratio >= 0.7) score += 5;
  } else if (data.operatingCashFlow > 0) {
    score += 5;
  }

  // 5. Growth (Max 20 points)
  const growthPct = data.revenueGrowth;
  if (growthPct >= 15) score += 10;
  else if (growthPct >= 5) score += 7;
  else if (growthPct > 0) score += 4;

  const ebitdaMarginPct = data.ebitdaMargin;
  if (ebitdaMarginPct >= 20) score += 10;
  else if (ebitdaMarginPct >= 10) score += 5;

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Normalizes raw API feeds into the strongly typed FinancialAnalysis model
 */
export function normalizeFinancials(
  income: FmpIncomeStatement,
  metrics: FmpKeyMetrics,
  ratios: FmpRatios,
  growth: FmpFinancialGrowth
): FinancialAnalysis {
  const grossMargin = +(ratios.grossProfitMargin * 100).toFixed(2);
  const operatingMargin = +(ratios.operatingProfitMargin * 100).toFixed(2);
  const ebitdaMargin = +(ratios.ebitdaMargin * 100).toFixed(2);
  
  const revenueGrowth = +(growth.revenueGrowth * 100).toFixed(2);
  const roe = +(ratios.returnOnEquity * 100).toFixed(2);
  const roa = +(ratios.returnOnAssets * 100).toFixed(2);
  const roic = +(ratios.returnOnCapitalEmployed * 100).toFixed(2);

  const baseAnalysis: Omit<FinancialAnalysis, 'healthScore'> = {
    revenue: income.revenue,
    revenueGrowth,
    netIncome: income.netIncome,
    grossProfit: income.grossProfit,
    grossMargin,
    operatingMargin,
    ebitda: income.ebitda,
    ebitdaMargin,
    operatingCashFlow: metrics.operatingCashFlow,
    freeCashFlow: metrics.freeCashFlow,
    eps: income.eps,
    peRatio: +ratios.peRatio.toFixed(2),
    pegRatio: +ratios.pegRatio.toFixed(2),
    roe,
    roa,
    roic,
    debtToEquity: +ratios.debtEquityRatio.toFixed(2),
    currentRatio: +ratios.currentRatio.toFixed(2),
    quickRatio: +ratios.quickRatio.toFixed(2),
    marketCapitalization: metrics.marketCap,
    enterpriseValue: metrics.enterpriseValue,
    sharesOutstanding: income.weightedAverageShsOut,
  };

  const healthScore = calculateHealthScore({
    ...baseAnalysis,
  });

  return {
    ...baseAnalysis,
    healthScore,
  };
}
