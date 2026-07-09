import YahooFinance from 'yahoo-finance2';
import { FinancialAnalysis } from '../../types';
import { logger } from '../../../shared/logger';
import { calculateHealthScore } from './financial.mapper';
import { apiCache } from '../../../shared/utils/cache';

// yahoo-finance2 v3: default export is the CLASS — must instantiate with new
const yf = new YahooFinance();

export class FinancialService {
  constructor() {}

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
   * Main analysis compiler fetching statements, ratios, metrics, and computing the final health score.
   */
  public async analyzeFinancials(symbol: string): Promise<FinancialAnalysis> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new Error('Ticker symbol cannot be empty.');
    }

    const cacheKey = `yf:financials:${cleanSymbol}`;
    const cached = apiCache.get<FinancialAnalysis>(cacheKey);
    if (cached) {
      logger.info(`[FinancialService] Cache HIT for financials of: "${cleanSymbol}"`);
      return cached;
    }

    try {
      logger.info(`[FinancialService] Initiating multi-stage Yahoo Finance fetch for: "${cleanSymbol}"`);
      
      const summaryRaw = await this.executeWithTimeout(
        yf.quoteSummary(cleanSymbol, {
          modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail', 'incomeStatementHistory'],
        })
      );

      const val = (x: any) => {
        if (x === undefined || x === null) return 0;
        return typeof x === 'object' && 'raw' in x ? x.raw : x;
      };

      const financialData = (summaryRaw as any).financialData || {};
      const defaultKeyStatistics = (summaryRaw as any).defaultKeyStatistics || {};
      const summaryDetail = (summaryRaw as any).summaryDetail || {};
      const incomeStatementHistory = (summaryRaw as any).incomeStatementHistory?.incomeStatementHistory || [];
      const primaryStatement = incomeStatementHistory[0] || {};

      const revenue = val(primaryStatement.totalRevenue) || val(financialData.totalRevenue) || 0;
      const netIncome = val(primaryStatement.netIncome) || 0;
      const grossProfit = val(primaryStatement.grossProfit) || 0;

      // Yahoo Finance returns fractional values for margins, growth, and returns, multiply by 100 for percentages
      const revenueGrowth = +(val(financialData.revenueGrowth) * 100).toFixed(2);
      const grossMargin = +(val(financialData.grossMargins) * 100).toFixed(2);
      const operatingMargin = +(val(financialData.operatingMargins) * 100).toFixed(2);
      const ebitda = val(financialData.ebitda) || 0;
      const ebitdaMargin = revenue ? +((ebitda / revenue) * 100).toFixed(2) : 0;
      
      const operatingCashFlow = val(financialData.operatingCashflow) || 0;
      const freeCashFlow = val(financialData.freeCashflow) || 0;
      const eps = val(defaultKeyStatistics.trailingEps) || 0;
      
      const peRatio = +(val(summaryDetail.trailingPE) || val(summaryDetail.forwardPE) || val(defaultKeyStatistics.trailingPE) || 0).toFixed(2);
      const pegRatio = +(val(defaultKeyStatistics.pegRatio) || 0).toFixed(2);
      
      const roe = +(val(financialData.returnOnEquity) * 100).toFixed(2);
      const roa = +(val(financialData.returnOnAssets) * 100).toFixed(2);
      // ROIC approximation: return on equity * 0.8
      const roic = +(roe * 0.8).toFixed(2);

      // Yahoo Finance returns debtToEquity as e.g. 142.34 (142.34% of equity). FMP has it as e.g. 1.42. Divide by 100.
      const debtToEquity = +(val(financialData.debtToEquity) / 100).toFixed(2);
      const currentRatio = +(val(financialData.currentRatio) || 0).toFixed(2);
      const quickRatio = +(val(financialData.quickRatio) || 0).toFixed(2);
      
      const marketCapitalization = val(summaryDetail.marketCap) || val(defaultKeyStatistics.marketCap) || 0;
      const enterpriseValue = val(defaultKeyStatistics.enterpriseValue) || 0;
      const sharesOutstanding = val(defaultKeyStatistics.sharesOutstanding) || 0;

      const baseAnalysis = {
        revenue,
        revenueGrowth,
        netIncome,
        grossProfit,
        grossMargin,
        operatingMargin,
        ebitda,
        ebitdaMargin,
        operatingCashFlow,
        freeCashFlow,
        eps,
        peRatio,
        pegRatio,
        roe,
        roa,
        roic,
        debtToEquity,
        currentRatio,
        quickRatio,
        marketCapitalization,
        enterpriseValue,
        sharesOutstanding,
      };

      const healthScore = calculateHealthScore(baseAnalysis);
      const finalResult = {
        ...baseAnalysis,
        healthScore,
      };

      apiCache.set(cacheKey, finalResult);
      return finalResult;

    } catch (error: any) {
      logger.error(`[FinancialService] Yahoo Finance live analysis failed for "${cleanSymbol}":`, error);
      throw new Error(`Yahoo Finance search failed: ${error.message}`);
    }
  }
}
