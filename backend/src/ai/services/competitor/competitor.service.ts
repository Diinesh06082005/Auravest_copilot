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
      const uniquePeers = Array.from(new Set(peersList)).slice(0, 5) as string[];
      
      const peerQuotesMap: Record<string, any> = {};
      const nonCachedPeers: string[] = [];

      for (const peerSymbol of uniquePeers) {
        if (typeof peerSymbol !== 'string') continue;
        const quoteCacheKey = `yf_quote_${peerSymbol}`;
        const cachedQuote = apiCache.get(quoteCacheKey);
        if (cachedQuote) {
          peerQuotesMap[peerSymbol] = cachedQuote;
        } else {
          nonCachedPeers.push(peerSymbol);
        }
      }

      if (nonCachedPeers.length > 0) {
        try {
          logger.info(`[CompetitorService] Bulk fetching quotes for peers: ${nonCachedPeers.join(', ')}`);
          const bulkQuotes = await yahooFinance.quote(nonCachedPeers);
          const quotesArray = Array.isArray(bulkQuotes) ? bulkQuotes : [bulkQuotes];
          for (const q of quotesArray) {
            if (q && q.symbol) {
              apiCache.set(`yf_quote_${q.symbol}`, q);
              peerQuotesMap[q.symbol] = q;
            }
          }
        } catch (err: any) {
          logger.warn(`[CompetitorService] Bulk peer quote fetch failed: ${err.message}. Retrying individually...`);
          for (const peerSymbol of nonCachedPeers) {
            try {
              const q = await yahooFinance.quote(peerSymbol);
              if (q) {
                apiCache.set(`yf_quote_${peerSymbol}`, q);
                peerQuotesMap[peerSymbol] = q;
              }
            } catch (singleErr: any) {
              logger.warn(`[CompetitorService] Individual fetch failed for ${peerSymbol}: ${singleErr.message}`);
            }
          }
        }
      }

      const competitorBenchmarks: CompetitorBenchmark[] = [];
      for (const peerSymbol of uniquePeers) {
        const quote = peerQuotesMap[peerSymbol];
        if (!quote) continue;
        competitorBenchmarks.push({
          name: quote.shortName || quote.longName || peerSymbol,
          symbol: peerSymbol,
          industry: industry || 'Unknown',
          sector: sector || 'Unknown',
          marketCap: quote.marketCap || 0,
          revenue: 0,
          netIncome: 0,
          peRatio: quote.trailingPE || quote.forwardPE || 0,
          revenueGrowth: 0,
          eps: quote.epsTrailingTwelveMonths || quote.epsForward || 0,
          roe: 0,
          employees: 0,
          headquarters: 'Unknown',
          website: 'Unknown'
        });
      }

      return competitorBenchmarks;

    } catch (error: any) {
      logger.error(`[CompetitorService] Peer discovery failed for "${cleanSymbol}": ${error.message}`);
      return [];
    }
  }
}

