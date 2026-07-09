import { GraphState } from '../state';
import { yFinanceService } from '../../data/services/yfinance.service';
import { logger } from '../../shared/logger';

const COMPANY_TICKER_MAP: Record<string, string> = {
  'APPLE': 'AAPL',
  'MICROSOFT': 'MSFT',
  'GOOGLE': 'GOOGL',
  'ALPHABET': 'GOOGL',
  'AMAZON': 'AMZN',
  'META': 'META',
  'FACEBOOK': 'META',
  'TESLA': 'TSLA',
  'NVIDIA': 'NVDA',
  'NETFLIX': 'NFLX',
  'APPLE INC.': 'AAPL',
  'MICROSOFT CORP': 'MSFT',
  'MICROSOFT CORPORATION': 'MSFT',
};

/**
 * Validates the stock symbol or resolves a common company name to its ticker.
 */
export async function validateCompanyNode(state: GraphState): Promise<Partial<GraphState>> {
  const input = (state.company || '').toUpperCase().trim();
  logger.info(`validateCompanyNode: Validating/resolving input '${input}'`);

  if (!input) {
    return {
      errors: ['No stock symbol or company name provided.'],
    };
  }

  const ticker = COMPANY_TICKER_MAP[input] || input;

  try {
    const quote = await yFinanceService.getQuote(ticker);
    if (!quote || !quote.price) {
      return {
        errors: [`Symbol ${ticker} has no pricing data.`],
      };
    }
    return {
      company: ticker,
      errors: [],
    };
  } catch (error: any) {
    logger.error(`Validation failed for input ${input} (resolved to ${ticker}):`, error.message);
    return {
      errors: [`Failed to validate stock ticker ${ticker}: ${error.message}`],
    };
  }
}
