import { ICompanyProfileProvider } from './profile-provider.interface';
import { CompanyProfile } from '../../types';
import { SymbolNotFoundError } from './errors';
import { logger } from '../../../shared/logger';

export class MockProfileProvider implements ICompanyProfileProvider {
  public readonly name = 'Mock Profile Provider';

  /**
   * Resolves query to standard symbols for local sandbox testing.
   */
  public async resolveSymbol(companyName: string): Promise<string> {
    const query = companyName.toUpperCase().trim();
    if (/^[A-Z]{1,5}$/.test(query)) {
      return query;
    }
    if (query.includes('APPLE')) return 'AAPL';
    if (query.includes('MICROSOFT')) return 'MSFT';
    if (query.includes('GOOGLE') || query.includes('ALPHABET')) return 'GOOGL';
    
    throw new SymbolNotFoundError(companyName);
  }

  /**
   * Generates formatted profile objects.
   */
  public async fetchProfile(symbol: string): Promise<CompanyProfile> {
    logger.info(`[Mock Profile Provider] Generating mock data for symbol: "${symbol}"`);
    return {
      name: `${symbol} Corp. (Mock)`,
      symbol: symbol,
      logo: `https://financialmodelingprep.com/images-shares-brands/${symbol}.png`,
      industry: 'Software / Technology Services',
      sector: 'Technology',
      ceo: 'Satya Nadella',
      headquarters: 'Redmond, WA, USA',
      country: 'US',
      founded: '1975',
      employees: 220000,
      exchange: 'NASDAQ',
      marketCapitalization: 3000000000000,
      website: `https://${symbol.toLowerCase()}.com`,
      businessDescription: `Normalized mock profile data generated for stock symbol ${symbol} during sandbox verification.`,
    };
  }
}
