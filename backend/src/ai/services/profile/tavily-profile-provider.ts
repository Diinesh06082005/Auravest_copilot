import YahooFinance from 'yahoo-finance2';
import { ICompanyProfileProvider } from './profile-provider.interface';
import { CompanyProfile } from '../../types';
import { SymbolNotFoundError, ProfileNotFoundError, ValidationError } from './errors';
import { tavilyService } from '../../../data/services/tavily.service';
import { geminiService } from '../../../business/services/ai/gemini.service';
import { logger } from '../../../shared/logger';

// yahoo-finance2 v3: default export is the CLASS — must instantiate with new
const yf = new YahooFinance();

export class TavilyProfileProvider implements ICompanyProfileProvider {
  public readonly name = 'Tavily & Yahoo Finance Profile Provider';

  /**
   * Helper to extract domain from website URL
   */
  private getDomain(url: string): string {
    try {
      const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      return new URL(cleanUrl).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

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
   * Resolves a company name to its primary stock ticker symbol using Yahoo Finance.
   */
  public async resolveSymbol(companyName: string): Promise<string> {
    const trimmed = companyName.trim();
    if (!trimmed) {
      throw new ValidationError('Company query cannot be empty.');
    }

    if (/^[A-Z]{1,5}$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    logger.info(`[TavilyProfileProvider] Resolving symbol for: "${trimmed}"`);
    try {
      const searchResult = await this.executeWithTimeout(yf.search(trimmed)) as any;
      const symbol = searchResult.quotes?.find(
        (q: any) => q.isYahooFinance || q.quoteType === 'EQUITY'
      )?.symbol || searchResult.quotes?.[0]?.symbol;

      if (!symbol) {
        throw new SymbolNotFoundError(trimmed);
      }
      return symbol.toUpperCase();
    } catch (err: any) {
      if (err instanceof SymbolNotFoundError) throw err;
      logger.warn(`[TavilyProfileProvider] Yahoo search failed for "${trimmed}". Trying direct query: ${err.message}`);
      throw new SymbolNotFoundError(trimmed);
    }
  }

  /**
   * Fetches and compiles the company profile using Tavily, Yahoo Finance, and Gemini.
   */
  public async fetchProfile(symbol: string): Promise<CompanyProfile> {
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) {
      throw new ValidationError('Symbol cannot be empty.');
    }

    try {
      logger.info(`[TavilyProfileProvider] Fetching profile metrics for: "${cleanSymbol}"`);

      // 1. Fetch raw market cap & exchange from Yahoo Finance AND perform Tavily Search in parallel
      const tavilyQuery = `${cleanSymbol} company profile corporate facts CEO founder employees headquarters industry sector website description`;
      
      const [summaryDetail, searchResults] = await Promise.all([
        this.executeWithTimeout(
          yf.quoteSummary(cleanSymbol, { modules: ['summaryDetail', 'defaultKeyStatistics'] })
        ).catch((err) => {
          logger.warn(`[TavilyProfileProvider] Yahoo quoteSummary failed for "${cleanSymbol}": ${err.message}`);
          return null;
        }),
        tavilyService.search(tavilyQuery, 4)
      ]);

      const marketCap = (summaryDetail as any)?.summaryDetail?.marketCap || (summaryDetail as any)?.defaultKeyStatistics?.marketCap || 0;
      const rawMarketCap = typeof marketCap === 'object' && 'raw' in marketCap ? marketCap.raw : marketCap;
      const context = searchResults.map(r => `Source: ${r.title}\nContent: ${r.content}`).join('\n\n');

      // 3. Prompt Gemini to extract and structure the profile data
      const prompt = `Based on the following web search results and metadata for ticker symbol "${cleanSymbol}", extract and compile a structured company profile object.
      
      Web Search Results:
      ${context}

      Return strictly a JSON object matching this schema:
      {
        "name": "Full legal name of the company",
        "symbol": "${cleanSymbol}",
        "industry": "Industry classification",
        "sector": "Sector classification",
        "ceo": "Name of the current CEO",
        "headquarters": "City, State/Country of the headquarters",
        "country": "Country of origin/incorporation",
        "founded": "Year founded",
        "employees": 15000,
        "exchange": "Stock exchange name",
        "website": "Official corporate website URL",
        "businessDescription": "A comprehensive business description of 2-4 sentences."
      }
      
      Ensure all values are accurate and not placeholder values. Do not wrap the JSON in markdown code blocks.`;

      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          symbol: { type: 'string' },
          industry: { type: 'string' },
          sector: { type: 'string' },
          ceo: { type: 'string' },
          headquarters: { type: 'string' },
          country: { type: 'string' },
          founded: { type: 'string' },
          employees: { type: 'number' },
          exchange: { type: 'string' },
          website: { type: 'string' },
          businessDescription: { type: 'string' },
        },
        required: [
          'name', 'symbol', 'industry', 'sector', 'ceo',
          'headquarters', 'country', 'founded', 'employees', 'exchange',
          'website', 'businessDescription'
        ]
      };

      const parsedProfile = await geminiService.generateJson<any>(prompt, schema);

      const websiteDomain = this.getDomain(parsedProfile.website);
      const logoUrl = websiteDomain 
        ? `https://logo.clearbit.com/${websiteDomain}` 
        : `https://logo.clearbit.com/${cleanSymbol.toLowerCase()}.com`;

      return {
        name: parsedProfile.name || cleanSymbol,
        symbol: cleanSymbol,
        logo: logoUrl,
        industry: parsedProfile.industry || 'Unknown',
        sector: parsedProfile.sector || 'Unknown',
        ceo: parsedProfile.ceo || 'N/A',
        headquarters: parsedProfile.headquarters || 'N/A',
        country: parsedProfile.country || 'Unknown',
        founded: parsedProfile.founded || 'N/A',
        employees: Number(parsedProfile.employees) || 0,
        exchange: parsedProfile.exchange || 'Unknown',
        marketCapitalization: Number(rawMarketCap) || 0,
        website: parsedProfile.website || '',
        businessDescription: parsedProfile.businessDescription || '',
      };
    } catch (error: any) {
      logger.error(`[TavilyProfileProvider] Failed to fetch company profile for "${cleanSymbol}":`, error);
      throw new ProfileNotFoundError(cleanSymbol);
    }
  }
}
