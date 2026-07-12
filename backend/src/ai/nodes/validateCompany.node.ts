import { GraphState } from '../state';
import { yFinanceService } from '../../data/services/yfinance.service';
import { logger } from '../../shared/logger';
import { getGeminiClient } from '../services';

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
    logger.warn(`Initial validation failed for input ${input} (resolved to ${ticker}): ${error.message}. Attempting LLM correction...`);
    
    try {
      const client = getGeminiClient();
      const prompt = `You are a stock symbol validator and resolver. Your task is to correct typo-ridden company names, tickers, or resolve common company names to their correct stock ticker symbol on Yahoo Finance.
Input to resolve: "${input}"
Only output the corrected/resolved ticker symbol (e.g. AAPL, MSFT, NVDA, TSLA, GOOGL).
If you cannot identify the ticker or the input is completely invalid, reply with "UNKNOWN".
Do not include any explanation, quotes, or additional text. Just output the ticker symbol or "UNKNOWN".`;

      const response = await client.invoke(prompt);
      const resolvedTicker = (typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content)
      ).trim().toUpperCase().replace(/['"]/g, ''); // strip any quotes

      logger.info(`LLM resolved input "${input}" to "${resolvedTicker}"`);

      if (resolvedTicker && resolvedTicker !== 'UNKNOWN' && resolvedTicker !== ticker) {
        const quote = await yFinanceService.getQuote(resolvedTicker);
        if (quote && quote.price) {
          logger.info(`Successfully validated LLM-resolved ticker: "${resolvedTicker}"`);
          return {
            company: resolvedTicker,
            errors: [],
          };
        }
      }
    } catch (llmError: any) {
      logger.error(`LLM correction failed: ${llmError.message}`);
    }

    logger.error(`Validation failed for input ${input} (resolved to ${ticker}):`, error.message);
    return {
      errors: [`Failed to validate stock ticker ${ticker}: ${error.message}`],
    };
  }
}
