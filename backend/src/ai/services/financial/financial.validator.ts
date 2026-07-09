import { z } from 'zod';

export const fmpIncomeStatementSchema = z.array(
  z.object({
    revenue: z.number().catch(0),
    netIncome: z.number().catch(0),
    grossProfit: z.number().catch(0),
    ebitda: z.number().catch(0),
    eps: z.number().catch(0),
    weightedAverageShsOut: z.number().catch(0),
  })
).min(1);

export const fmpKeyMetricsSchema = z.array(
  z.object({
    marketCap: z.number().catch(0),
    enterpriseValue: z.number().catch(0),
    freeCashFlow: z.number().catch(0),
    operatingCashFlow: z.number().catch(0),
  })
).min(1);

export const fmpRatiosSchema = z.array(
  z.object({
    grossProfitMargin: z.number().catch(0),
    operatingProfitMargin: z.number().catch(0),
    ebitdaMargin: z.number().catch(0),
    currentRatio: z.number().catch(0),
    quickRatio: z.number().catch(0),
    debtEquityRatio: z.number().catch(0),
    returnOnEquity: z.number().catch(0),
    returnOnAssets: z.number().catch(0),
    returnOnCapitalEmployed: z.number().catch(0),
    peRatio: z.number().catch(0),
    pegRatio: z.number().catch(0),
  })
).min(1);

export const fmpFinancialGrowthSchema = z.array(
  z.object({
    revenueGrowth: z.number().catch(0),
  })
).min(1);
