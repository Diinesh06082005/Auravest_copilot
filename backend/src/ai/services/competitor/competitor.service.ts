import YahooFinance from 'yahoo-finance2';
import { logger } from '../../../shared/logger';
import { CompetitorBenchmark } from '../../types';
import { apiCache } from '../../../shared/utils/cache';

// yahoo-finance2 v3: default export is the CLASS — must instantiate with new
const yahooFinance = new YahooFinance();

export class CompetitorService {
  /**
   * Discovers and retrieves competitor metrics using Yahoo Finance.
   */
  public async getCompetitors(symbol: string, industry?: string, sector?: string): Promise<CompetitorBenchmark[]> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new Error('Symbol cannot be empty.');
    }

    try {
      logger.info(`[CompetitorService] Fetching peers from Yahoo Finance for symbol: "${cleanSymbol}"`);
      
      // Try to find peers using recommendations or just search (Yahoo Finance recommendationsBySymbol often returns related peers)
      const recommendationsCacheKey = `yf_recommendations_${cleanSymbol}`;
      let recs: any = apiCache.get(recommendationsCacheKey);
      
      if (!recs) {
        try {
          recs = await yahooFinance.recommendationsBySymbol(cleanSymbol);
          apiCache.set(recommendationsCacheKey, recs);
        } catch (err) {
          logger.warn(`Failed to fetch recommendations for ${cleanSymbol}`);
          recs = { recommendedSymbols: [] };
        }
      }

      const peersList = (recs.recommendedSymbols || [])
        .map((r: any) => r.symbol)
        .filter((s: string) => s !== cleanSymbol);

      if (peersList.length === 0) {
        logger.warn(`[CompetitorService] No peers returned for "${cleanSymbol}". Returning empty list.`);
        return [];
      }

      // De-duplicate and select 3 to 5 peers
      const uniquePeers = Array.from(new Set(peersList)).slice(0, 5);
      
      const peerPromises = uniquePeers.map(async (peerSymbol) => {
        if (typeof peerSymbol !== 'string') return null;
        
        try {
          logger.info(`[CompetitorService] Resolving details for peer: "${peerSymbol}"`);

          const quoteCacheKey = `yf_quote_${peerSymbol}`;
          let quote: any = apiCache.get(quoteCacheKey);
          
          if (!quote) {
            quote = await yahooFinance.quote(peerSymbol);
            apiCache.set(quoteCacheKey, quote);
          }
          
          if (!quote) return null;

          return {
            name: quote.shortName || quote.longName || peerSymbol,
            symbol: peerSymbol,
            industry: industry || 'Unknown',
            sector: sector || 'Unknown',
            marketCap: quote.marketCap || 0,
            revenue: 0, // Yahoo quote doesn't include TTM revenue directly
            netIncome: 0, // Yahoo quote doesn't include net income
            peRatio: quote.trailingPE || quote.forwardPE || 0,
            revenueGrowth: 0,
            eps: quote.epsTrailingTwelveMonths || quote.epsForward || 0,
            roe: 0,
            employees: 0,
            headquarters: 'Unknown',
            website: 'Unknown'
          };
        } catch (err: any) {
          logger.warn(`[CompetitorService] Failed to retrieve data for peer "${peerSymbol}": ${err.message}`);
          return null;
        }
      });

      const resolvedPeers = await Promise.all(peerPromises);
      const competitorBenchmarks = resolvedPeers.filter((p): p is CompetitorBenchmark => p !== null);

      return competitorBenchmarks;

    } catch (error: any) {
      logger.error(`[CompetitorService] Peer discovery failed for "${cleanSymbol}": ${error.message}`);
      return [];
    }
  }
}

