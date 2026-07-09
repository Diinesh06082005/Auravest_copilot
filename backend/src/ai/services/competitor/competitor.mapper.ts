import { CompetitorBenchmark, CompanyProfile, FinancialAnalysis } from '../../types';

/**
 * Converts the target company profile and financials into a comparable benchmark object.
 */
export function mapTargetToBenchmark(
  profile: CompanyProfile,
  financials: FinancialAnalysis
): CompetitorBenchmark {
  return {
    name: profile.name,
    symbol: profile.symbol,
    industry: profile.industry,
    sector: profile.sector,
    marketCap: profile.marketCapitalization || 0,
    revenue: financials.revenue || 0,
    netIncome: financials.netIncome || 0,
    peRatio: financials.peRatio || 0,
    revenueGrowth: financials.revenueGrowth || 0,
    eps: financials.eps || 0,
    roe: financials.roe || 0,
    employees: profile.employees || 0,
    headquarters: profile.headquarters,
    website: profile.website,
  };
}
