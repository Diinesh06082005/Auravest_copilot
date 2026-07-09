import { investmentGraph } from './graph/investment.graph';
import { InvestmentState } from './types';
import { logger } from '../shared/logger';

/**
 * Runs the complete LangGraph investment research workflow.
 */
export async function runInvestmentResearch(company: string): Promise<InvestmentState> {
  const startTime = Date.now();
  logger.info(`[GraphRunner] Graph Started for company: "${company}"`);

  try {
    const initialState: any = {
      company,
      profile: null,
      financials: null,
      stock: null,
      news: [],
      newsStatistics: null,
      newsCategories: {},
      competitors: [],
      competitorComparisons: null,
      marketRanking: null,
      relativePerformance: null,
      validatedData: null,
      validationReport: null,
      risk: null,
      swot: null,
      thesis: null,
      investmentScore: null,
      recommendation: null,
      confidence: 0,
      investmentReport: null,
      report: '',
      metadata: {},
      errors: [],
    };

    const finalState = await investmentGraph.invoke(initialState);
    const duration = Date.now() - startTime;
    
    if (finalState.errors && finalState.errors.length > 0) {
      logger.error(`[GraphRunner] Graph Completed with failures in ${duration}ms: ${finalState.errors.join(', ')}`);
    } else {
      logger.info(`[GraphRunner] Graph Completed successfully in ${duration}ms`);
    }

    return finalState as InvestmentState;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(`[GraphRunner] Graph Failed in ${duration}ms: ${error.message}`);
    throw error;
  }
}
