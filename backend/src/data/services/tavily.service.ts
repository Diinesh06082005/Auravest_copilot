import { z } from 'zod';
import { config } from '../../shared/config';
import { fetchWithRetry } from '../../shared/utils/fetch';
import { logger } from '../../shared/logger';
import { apiCache } from '../../shared/utils/cache';

// Schema validating the Tavily Search API payload
const tavilyResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      content: z.string(),
      score: z.number().optional(),
    })
  ),
});

export interface ITavilySearchResult {
  title: string;
  url: string;
  content: string;
}

export class TavilyService {
  private apiKey = config.tavily.apiKey;
  private baseUrl = 'https://api.tavily.com/search';

  /**
   * Executes an AI-optimized search query
   */
  public async search(query: string, maxResults = 5): Promise<ITavilySearchResult[]> {
    const cleanQuery = z.string().min(1).max(200).parse(query);
    const cacheKey = `tavily:${cleanQuery}:${maxResults}`;
    const cached = apiCache.get<ITavilySearchResult[]>(cacheKey);
    if (cached) {
      logger.info(`[TavilyService] Cache HIT for: "${cleanQuery}"`);
      return cached;
    }

    if (!this.apiKey) {
      logger.warn(`Tavily API Key is missing. Returning mock web search results for "${cleanQuery}".`);
      return [
        {
          title: `Mock Web Search Results: "${cleanQuery}"`,
          content: 'This result is a mock fallback. Configure TAVILY_API_KEY in the environment to connect to live web search indexing.',
          url: 'https://example.com/mock-search',
        },
      ];
    }

    try {
      const response = await fetchWithRetry(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: cleanQuery,
          search_depth: 'basic',
          max_results: maxResults,
        }),
      });

      const rawData = await response.json();
      const parsed = tavilyResponseSchema.parse(rawData);

      const results = parsed.results.map((res) => ({
        title: res.title,
        url: res.url,
        content: res.content,
      }));

      apiCache.set(cacheKey, results);
      return results;
    } catch (error: any) {
      logger.error(`TavilyService.search failed for "${cleanQuery}":`, error);
      throw new Error(`Failed to execute Tavily search: ${error.message}`);
    }
  }
}

export const tavilyService = new TavilyService();
