import YahooFinance from 'yahoo-finance2';
import { StockAnalysis } from '../../types';
import { yahooQuoteSchema, yahooKeyStatsSchema, yahooHistoricalSchema } from './stock.validator';
import { normalizeStockData } from './stock.mapper';
import { logger } from '../../../shared/logger';
import { apiCache } from '../../../shared/utils/cache';

// yahoo-finance2 v3: default export is the CLASS — must instantiate with new
const yf = new YahooFinance();

export class StockService {

  /**
   * Safe execution utility wrapping calls with a timeout.
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Yahoo Finance request timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Generates mock fallback stock stats for sandbox testing.
   */
  public generateMockStockAnalysis(symbol: string): StockAnalysis {
    logger.info(`[StockService] Generating mock stock analysis for: "${symbol}"`);
    
    const generateHistory = (days: number, basePrice: number): { date: string; close: number }[] => {
      const history = [];
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
        history.push({
          date: d.toISOString().split('T')[0],
          close: +(basePrice * fluctuation).toFixed(2),
        });
      }
      return history;
    };

    const mockPrice = 185.50;
    const historyData = generateHistory(260, mockPrice);

    return {
      currentPrice: mockPrice,
      previousClose: 184.20,
      openPrice: 184.50,
      dayHigh: 186.40,
      dayLow: 183.90,
      fiftyTwoWeekHigh: 199.62,
      fiftyTwoWeekLow: 124.17,
      volume: 52000000,
      averageVolume: 58000000,
      beta: 1.28,
      dividendYield: 0.52,
      dividendRate: 0.96,
      marketCapitalization: 2950000000000,
      enterpriseValue: 3020000000000,
      sharesOutstanding: 15750000000,
      floatShares: 15720000000,
      shortInterest: 110000000,
      currency: 'USD',
      exchange: 'NASDAQ Global Select',
      marketState: 'REGULAR',
      charts: {
        oneMonth: historyData.slice(-21),
        sixMonths: historyData.slice(-126),
        oneYear: historyData.slice(-252),
        fiveYears: historyData,
      },
      dailyChangePercent: 0.71,
      weeklyChangePercent: 2.15,
      monthlyChangePercent: -1.42,
      yearlyReturnPercent: 24.18,
      volatilityScore: 42,
      momentumScore: 68,
      trendScore: 78,
    };
  }

  /**
   * Main orchestrator pulling current quotes, summaries, and historical charts.
   */
  public async analyzeStock(symbol: string): Promise<StockAnalysis> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new Error('Ticker symbol cannot be empty.');
    }

    const cacheKey = `yf:stock:${cleanSymbol}`;
    const cached = apiCache.get<StockAnalysis>(cacheKey);
    if (cached) {
      logger.info(`[StockService] Cache HIT for stock stats of: "${cleanSymbol}"`);
      return cached;
    }

    try {
      logger.info(`[StockService] Fetching yahooFinance quotes and summary stats for: "${cleanSymbol}"`);

      // Fetch quote, key stats summary, and 1 year historical charts in parallel
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const [quoteRaw, summaryRaw, chartResult] = await Promise.all([
        this.executeWithTimeout(yf.quote(cleanSymbol)),
        this.executeWithTimeout(
          yf.quoteSummary(cleanSymbol, {
            modules: ['defaultKeyStatistics', 'summaryDetail'],
          })
        ),
        this.executeWithTimeout(
          yf.chart(cleanSymbol, {
            period1: oneYearAgo.toISOString().split('T')[0],
            interval: '1d',
          })
        )
      ]);
      const historicalRaw = (chartResult as any).quotes || [];

      // Validate quote
      const quoteParsed = yahooQuoteSchema.parse(quoteRaw);

      // Validate and extract key statistics
      const stats = (summaryRaw as any).defaultKeyStatistics || {};
      const detail = (summaryRaw as any).summaryDetail || {};
      
      const statsParsed = yahooKeyStatsSchema.parse({
        beta: stats.beta,
        dividendYield: detail.dividendYield,
        dividendRate: detail.dividendRate,
        marketCap: detail.marketCap || stats.marketCap,
        enterpriseValue: stats.enterpriseValue,
        sharesOutstanding: stats.sharesOutstanding,
        floatShares: stats.floatShares,
        sharesShort: stats.sharesShort,
      });

      // Validate historical rows
      const historyParsed = yahooHistoricalSchema.parse(historicalRaw);

      logger.info(`[StockService] Feed validations successful. Compiling metrics for: "${cleanSymbol}"`);
      const finalResult = normalizeStockData(quoteParsed, statsParsed, historyParsed);
      
      apiCache.set(cacheKey, finalResult);
      return finalResult;

    } catch (error: any) {
      logger.error(`[StockService] Yahoo Finance lookup failed for "${cleanSymbol}":`, error);
      throw new Error(`Yahoo Finance lookup failed for "${cleanSymbol}": ${error.message}`);
    }
  }
}
