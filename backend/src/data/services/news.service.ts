import { z } from 'zod';
import { config } from '../../shared/config';
import { fetchWithRetry } from '../../shared/utils/fetch';
import { logger } from '../../shared/logger';

// Schema validating the NewsAPI response layout
const newsApiResponseSchema = z.object({
  status: z.string(),
  articles: z.array(
    z.object({
      source: z.object({
        name: z.string().nullable().optional(),
      }),
      title: z.string(),
      description: z.string().nullable().optional(),
      url: z.string(),
      publishedAt: z.string(),
    })
  ),
});

export interface INewsArticle {
  title: string;
  source: string;
  description: string;
  url: string;
  publishedAt: string;
}

export class NewsService {
  private apiKey = config.news.apiKey;
  private baseUrl = 'https://newsapi.org/v2/everything';

  /**
   * Fetches latest news articles for a company ticker
   */
  public async getNews(ticker: string, limit = 5): Promise<INewsArticle[]> {
    const cleanTicker = z
      .string()
      .min(1)
      .max(10)
      .regex(/^[A-Z0-9.-]+$/i)
      .parse(ticker)
      .toUpperCase();

    if (!this.apiKey) {
      logger.warn(`NewsAPI Key is missing. Returning mock news articles for ${cleanTicker}.`);
      return [
        {
          title: `Market Analysis: ${cleanTicker} consolidates gains after earnings release`,
          source: 'Mock Financial Network',
          description: 'A mock article returned because no NEWS_API_KEY is configured in the environment.',
          url: `https://example.com/news/${cleanTicker.toLowerCase()}`,
          publishedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const response = await fetchWithRetry(
        `${this.baseUrl}?q=${cleanTicker}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.apiKey}`
      );
      const rawData = await response.json();
      const parsed = newsApiResponseSchema.parse(rawData);

      return parsed.articles.map((art) => ({
        title: art.title,
        source: art.source.name || 'Unknown Publisher',
        description: art.description || '',
        url: art.url,
        publishedAt: art.publishedAt,
      }));
    } catch (error: any) {
      logger.error(`NewsService.getNews failed for ${cleanTicker}:`, error);
      throw new Error(`Failed to resolve news articles: ${error.message}`);
    }
  }
}

export const newsService = new NewsService();
