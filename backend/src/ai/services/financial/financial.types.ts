export interface FmpIncomeStatement {
  revenue: number;
  netIncome: number;
  grossProfit: number;
  ebitda: number;
  eps: number;
  weightedAverageShsOut: number;
}

export interface FmpKeyMetrics {
  marketCap: number;
  enterpriseValue: number;
  freeCashFlow: number;
  operatingCashFlow: number;
}

export interface FmpRatios {
  grossProfitMargin: number;
  operatingProfitMargin: number;
  ebitdaMargin: number;
  currentRatio: number;
  quickRatio: number;
  debtEquityRatio: number;
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnCapitalEmployed: number;
  peRatio: number;
  pegRatio: number;
}

export interface FmpFinancialGrowth {
  revenueGrowth: number;
}
