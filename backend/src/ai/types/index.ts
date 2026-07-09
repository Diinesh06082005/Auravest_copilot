export interface CompanyProfile {
  name: string;
  symbol: string;
  logo: string;
  industry: string;
  sector: string;
  ceo: string;
  headquarters: string;
  country: string;
  founded: string;
  employees: number;
  exchange: string;
  marketCapitalization: number;
  website: string;
  businessDescription: string;
}

export interface FinancialAnalysis {
  revenue: number;
  revenueGrowth: number;
  netIncome: number;
  grossProfit: number;
  grossMargin: number;
  operatingMargin: number;
  ebitda: number;
  ebitdaMargin: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  eps: number;
  peRatio: number;
  pegRatio: number;
  roe: number;
  roa: number;
  roic: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  marketCapitalization: number;
  enterpriseValue: number;
  sharesOutstanding: number;
  healthScore: number;
}

export interface ChartDatapoint {
  date: string;
  close: number;
}

export interface ChartDatasets {
  oneMonth: ChartDatapoint[];
  sixMonths: ChartDatapoint[];
  oneYear: ChartDatapoint[];
  fiveYears: ChartDatapoint[];
}

export interface StockAnalysis {
  currentPrice: number;
  previousClose: number;
  openPrice: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  averageVolume: number;
  beta: number;
  dividendYield: number;
  dividendRate: number;
  marketCapitalization: number;
  enterpriseValue: number;
  sharesOutstanding: number;
  floatShares: number;
  shortInterest: number;
  currency: string;
  exchange: string;
  marketState: string;
  charts: ChartDatasets;
  dailyChangePercent: number;
  weeklyChangePercent: number;
  monthlyChangePercent: number;
  yearlyReturnPercent: number;
  volatilityScore: number;
  momentumScore: number;
  trendScore: number;
}

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  category:
    | 'Earnings'
    | 'Product Launch'
    | 'Acquisition'
    | 'Management'
    | 'Regulation'
    | 'Lawsuit'
    | 'Partnership'
    | 'Investment'
    | 'Technology'
    | 'Market'
    | 'General';
  thumbnail?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface NewsStatistics {
  newsCount: number;
  positiveArticleCount: number;
  negativeArticleCount: number;
  neutralArticleCount: number;
  averageRecencyHours: number;
  sourceDiversityScore: number;
}

export type NewsCategoriesCount = Record<string, number>;

export interface CompetitorBenchmark {
  name: string;
  symbol: string;
  industry: string;
  sector: string;
  marketCap: number;
  revenue: number;
  netIncome: number;
  peRatio: number;
  revenueGrowth: number;
  eps: number;
  roe: number;
  employees: number;
  headquarters: string;
  website: string;
}

export interface MetricComparison {
  metric: string;
  targetValue: number;
  competitorAverage: number;
  differencePercent: number;
}

export interface CompetitorComparisons {
  marketCapComparison: MetricComparison;
  revenueComparison: MetricComparison;
  profitabilityComparison: MetricComparison;
  growthComparison: MetricComparison;
  valuationComparison: MetricComparison;
  employeeSizeComparison: MetricComparison;
}

export interface RankingItem {
  name: string;
  symbol: string;
  value: number;
  rank: number;
}

export interface MarketRanking {
  marketCapRankings: RankingItem[];
  revenueRankings: RankingItem[];
  profitabilityRankings: RankingItem[];
  growthRankings: RankingItem[];
  valuationRankings: RankingItem[];
  employeeSizeRankings: RankingItem[];
}

export interface RelativePerformance {
  overallScore: number;
  marketShareEstimate: number;
  strengths: string[];
  weaknesses: string[];
}

export interface RiskCategoryDetail {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  confidenceScore: number;
}

export interface RiskFactors {
  financialRisk: RiskCategoryDetail;
  businessRisk: RiskCategoryDetail;
  marketRisk: RiskCategoryDetail;
  valuationRisk: RiskCategoryDetail;
  growthRisk: RiskCategoryDetail;
  competitiveRisk: RiskCategoryDetail;
  regulatoryRisk: RiskCategoryDetail;
  technologyRisk: RiskCategoryDetail;
  managementRisk: RiskCategoryDetail;
  liquidityRisk: RiskCategoryDetail;
  overallRiskScore: number;
  overallRiskLevel: 'Low' | 'Medium' | 'High';
  riskTrend: 'Improving' | 'Stable' | 'Deteriorating';
  majorRiskFactors: string[];
  positiveFactors: string[];
  negativeFactors: string[];
}

export interface SWOTPoint {
  title: string;
  explanation: string;
  confidenceScore: number;
}

export interface SWOTAnalysis {
  strengths: SWOTPoint[];
  weaknesses: SWOTPoint[];
  opportunities: SWOTPoint[];
  threats: SWOTPoint[];
}

export interface ThesisSectionDetail {
  title: string;
  explanation: string;
  confidenceScore: number;
  supportingEvidence: string[];
}

export interface InvestmentThesis {
  executiveSummary: ThesisSectionDetail;
  businessModel: ThesisSectionDetail;
  competitiveAdvantage: ThesisSectionDetail;
  growthDrivers: ThesisSectionDetail;
  financialStrengths: ThesisSectionDetail;
  financialWeaknesses: ThesisSectionDetail;
  industryOutlook: ThesisSectionDetail;
  futureCatalysts: ThesisSectionDetail;
  majorConcerns: ThesisSectionDetail;
  longTermOutlook: ThesisSectionDetail;
  investmentThesis: ThesisSectionDetail;
}

export interface ScoreDetail {
  value: number;
  weight: number;
  explanation: string;
  calculationDetails: string;
}

export interface ScoreBreakdown {
  financialHealth: ScoreDetail;
  growth: ScoreDetail;
  profitability: ScoreDetail;
  valuation: ScoreDetail;
  marketPerformance: ScoreDetail;
  competitiveStrength: ScoreDetail;
  newsSentiment: ScoreDetail;
  risk: ScoreDetail;
  management: ScoreDetail;
  innovation: ScoreDetail;
  overallScore: number;
  grade: string;
}

export interface InvestmentReport {
  companyOverview: {
    name: string;
    symbol: string;
    ceo: string;
    industry: string;
    sector: string;
    hq: string;
    description: string;
  };
  financialSummary: {
    revenue: number;
    netIncome: number;
    grossMargin: number;
    operatingMargin: number;
    eps: number;
    peRatio: number;
    financialHealthScore: number;
  };
  stockSummary: {
    currentPrice: number;
    changePercent: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    beta: number;
  };
  newsSummary: {
    articleCount: number;
    categories: Record<string, number>;
    recentNews?: { title: string; sentiment: string; impact: number; source: string; time: string }[];
  };
  competitorSummary: {
    competitors: {
      name: string;
      symbol: string;
      marketCap: number;
      revenue: number;
    }[];
  };
  riskSummary: {
    overallRiskScore: number;
    overallRiskLevel: string;
    majorRisks: string[];
  };
  swot: SWOTAnalysis;
  thesis: InvestmentThesis;
  scores: ScoreBreakdown;
  recommendation: InvestmentRecommendation;
  confidence: number;
  sources: string[];
  metadata: {
    generatedAt: string;
    version: string;
  };
}

export interface InvestmentRecommendation {
  rating: 'BUY' | 'HOLD' | 'SELL';
  targetPrice: string;
  horizon: string;
  rationale: string[];
}

export interface ValidationReport {
  completenessScore: number;
  dataQualityScore: number;
  missingFields: string[];
  warnings: string[];
  errors: string[];
  normalizedFields: string[];
  duplicateRemovals: {
    newsCount: number;
    competitorCount: number;
  };
}

export interface ValidatedData {
  profile: CompanyProfile;
  financials: FinancialAnalysis;
  stock: StockAnalysis;
  news: NewsArticle[];
  competitors: CompetitorBenchmark[];
}

export interface InvestmentState {
  company: string;
  profile: CompanyProfile | null;
  financials: FinancialAnalysis | null;
  stock: StockAnalysis | null;
  news: NewsArticle[];
  newsStatistics: NewsStatistics | null;
  newsCategories: NewsCategoriesCount;
  competitors: CompetitorBenchmark[];
  competitorComparisons: CompetitorComparisons | null;
  marketRanking: MarketRanking | null;
  relativePerformance: RelativePerformance | null;
  validatedData: ValidatedData | null;
  validationReport: ValidationReport | null;
  risk: RiskFactors | null;
  swot: SWOTAnalysis | null;
  thesis: InvestmentThesis | null;
  investmentScore: ScoreBreakdown | null;
  recommendation: InvestmentRecommendation | null;
  confidence: number;
  investmentReport: InvestmentReport | null;
  report: string;
  metadata: Record<string, any>;
  errors: string[];
}
