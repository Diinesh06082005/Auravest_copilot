import { Annotation } from '@langchain/langgraph';
import { 
  CompanyProfile, FinancialAnalysis, StockAnalysis, NewsArticle, 
  NewsStatistics, NewsCategoriesCount, CompetitorBenchmark, 
  CompetitorComparisons, MarketRanking, RelativePerformance,
  ValidatedData, ValidationReport,
  RiskFactors, SWOTAnalysis, InvestmentThesis, ScoreBreakdown, InvestmentRecommendation, InvestmentReport 
} from '../types';

export const InvestmentStateAnnotation = Annotation.Root({
  company: Annotation<string>(),
  profile: Annotation<CompanyProfile | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  financials: Annotation<FinancialAnalysis | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  stock: Annotation<StockAnalysis | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  news: Annotation<NewsArticle[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  newsStatistics: Annotation<NewsStatistics | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  newsCategories: Annotation<NewsCategoriesCount>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  competitors: Annotation<CompetitorBenchmark[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  competitorComparisons: Annotation<CompetitorComparisons | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  marketRanking: Annotation<MarketRanking | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  relativePerformance: Annotation<RelativePerformance | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  validatedData: Annotation<ValidatedData | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  validationReport: Annotation<ValidationReport | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  risk: Annotation<RiskFactors | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  swot: Annotation<SWOTAnalysis | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  thesis: Annotation<InvestmentThesis | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  investmentScore: Annotation<ScoreBreakdown | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  recommendation: Annotation<InvestmentRecommendation | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  confidence: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  investmentReport: Annotation<InvestmentReport | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  report: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  metadata: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  errors: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export type GraphState = typeof InvestmentStateAnnotation.State;
