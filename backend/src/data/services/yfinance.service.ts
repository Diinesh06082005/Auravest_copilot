import { z } from 'zod';
import { fetchWithRetry } from '../../shared/utils/fetch';
import { logger } from '../../shared/logger';

// Schema validating the Yahoo Finance public chart structure
const yfinanceResponseSchema = z.object({
  chart: z.object({
    result: z.array(
      z.object({
        meta: z.object({
          currency: z.string(),
          symbol: z.string(),
          exchangeName: z.string().optional(),
          regularMarketPrice: z.number(),
          chartPreviousClose: z.number().optional(),
        }),
        timestamp: z.array(z.number()).optional(),
        indicators: z.object({
          quote: z.array(
            z.object({
              close: z.array(z.number().nullable()).optional(),
              open: z.array(z.number().nullable()).optional(),
              volume: z.array(z.number().nullable()).optional(),
            })
          ),
        }),
      })
    ),
  }),
});

export interface IYFinanceQuote {
  ticker: string;
  price: number;
  currency: string;
  previousClose: number;
  history: Array<{ date: string; close: number }>;
}

export class YFinanceService {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';

  /**
   * Fetches latest quote and historical pricing points for a ticker
   */
  public async getQuote(ticker: string): Promise<IYFinanceQuote> {
    const cleanTicker = z
      .string()
      .min(1)
      .max(10)
      .regex(/^[A-Z0-9.-]+$/i)
      .parse(ticker)
      .toUpperCase();

    try {
      const response = await fetchWithRetry(`${this.baseUrl}/${cleanTicker}?interval=1d&range=1mo`);
      const rawData = await response.json();
      
      const parsed = yfinanceResponseSchema.parse(rawData);
      const result = parsed.chart.result[0];
      const meta = result.meta;
      const timestamps = result.timestamp || [];
      const closes = result.indicators.quote[0].close || [];

      const history: Array<{ date: string; close: number }> = [];
      for (let i = 0; i < timestamps.length; i++) {
        const closePrice = closes[i];
        if (closePrice !== null && closePrice !== undefined) {
          history.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            close: closePrice,
          });
        }
      }

      return {
        ticker: cleanTicker,
        price: meta.regularMarketPrice,
        currency: meta.currency,
        previousClose: meta.chartPreviousClose || meta.regularMarketPrice,
        history,
      };
    } catch (error: any) {
      logger.error(`YFinanceService.getQuote failed for ${cleanTicker}:`, error);
      throw new Error(`Failed to resolve Yahoo Finance quote: ${error.message}`);
    }
  }
}

export const yFinanceService = new YFinanceService();
