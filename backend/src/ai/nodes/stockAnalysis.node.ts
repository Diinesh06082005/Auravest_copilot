import { GraphState } from '../state';
import { StockService } from '../services/stock/stock.service';
import { logger } from '../../shared/logger';

let stockServiceInstance: StockService | null = null;

function getStockService(): StockService {
  if (!stockServiceInstance) {
    stockServiceInstance = new StockService();
  }
  return stockServiceInstance;
}

/**
 * LangGraph node responsible for performing real-time quotes searches,
 * historical price parsing, and technical indicators calculations.
 * Falls back to mock data if Yahoo Finance is unreachable.
 */
export async function stockAnalysisNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const ticker = state.company;
  logger.info(`stockAnalysisNode: Processing market stats for stock symbol: "${ticker}"`);

  try {
    const service = getStockService();
    const stockStats = await service.analyzeStock(ticker);
    return { stock: stockStats, errors: [] };
  } catch (error: any) {
    logger.warn(`stockAnalysisNode: Live fetch failed for "${ticker}" (${error.message}). Injecting mock data.`);
    // Do NOT propagate as error — return mock data so the graph continues
    const service = getStockService();
    return {
      stock: service.generateMockStockAnalysis(ticker),
      errors: [],
    };
  }
}
