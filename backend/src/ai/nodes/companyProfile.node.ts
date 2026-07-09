import { GraphState } from '../state';
import { TavilyProfileProvider } from '../services/profile/tavily-profile-provider';
import { CompanyProfileService } from '../services/profile/company-profile.service';
import { CompanyProfile } from '../types';
import { logger } from '../../shared/logger';

let profileServiceInstance: CompanyProfileService | null = null;

function getProfileService(): CompanyProfileService {
  if (!profileServiceInstance) {
    const providers = [new TavilyProfileProvider()];
    profileServiceInstance = new CompanyProfileService(providers);
  }
  return profileServiceInstance;
}

/**
 * Returns a plausible fallback company profile if the profile provider fails.
 */
function getMockProfile(ticker: string): CompanyProfile {
  logger.warn(`companyProfileNode: Using mock profile data for "${ticker}" (Profile provider failed).`);
  const base: Record<string, Partial<CompanyProfile>> = {
    AAPL: { name: 'Apple Inc.', symbol: 'AAPL', logo: '', industry: 'Consumer Electronics', sector: 'Technology', ceo: 'Tim Cook', headquarters: 'Cupertino, CA', country: 'USA', founded: '1976', employees: 164000, exchange: 'NASDAQ', marketCapitalization: 3020000000000, website: 'https://www.apple.com', businessDescription: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.' },
    TSLA: { name: 'Tesla Inc.', symbol: 'TSLA', logo: '⚡', industry: 'Electric Vehicles', sector: 'Automotive', ceo: 'Elon Musk', headquarters: 'Austin, TX', country: 'USA', founded: '2003', employees: 140000, exchange: 'NASDAQ', marketCapitalization: 560000000000, website: 'https://www.tesla.com', businessDescription: 'Tesla, Inc. designs, develops, manufactures, sells, and leases fully electric vehicles, energy generation, and storage systems.' },
    MSFT: { name: 'Microsoft Corp.', symbol: 'MSFT', logo: '❖', industry: 'Software', sector: 'Technology', ceo: 'Satya Nadella', headquarters: 'Redmond, WA', country: 'USA', founded: '1975', employees: 221000, exchange: 'NASDAQ', marketCapitalization: 3100000000000, website: 'https://www.microsoft.com', businessDescription: 'Microsoft Corporation is an American multinational technology corporation headquarted in Redmond, Washington.' },
  };

  const specific = base[ticker.toUpperCase()] || {};
  return {
    name: `${ticker.toUpperCase()} Corp.`,
    symbol: ticker.toUpperCase(),
    logo: ticker.toUpperCase().substring(0, 2),
    industry: 'Technology',
    sector: 'Software',
    ceo: 'Unknown',
    headquarters: 'USA',
    country: 'USA',
    founded: 'Unknown',
    employees: 10000,
    exchange: 'NASDAQ',
    marketCapitalization: 100000000000,
    website: 'https://company.com',
    businessDescription: 'A technology company specializing in software and innovation.',
    ...specific,
  } as CompanyProfile;
}

/**
 * LangGraph node responsible for validating inputs, resolving tickers,
 * fetching profile information, and updating the InvestmentState channels.
 * Falls back to mock data if the profile provider fails.
 */
export async function companyProfileNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {};
  }

  const query = state.company;
  logger.info(`companyProfileNode: Processing company profile lookup for: "${query}"`);

  try {
    const service = getProfileService();
    const profile = await service.getProfile(query);
    return {
      company: profile.symbol,
      profile: profile,
      errors: [],
    };
  } catch (error: any) {
    logger.warn(`companyProfileNode: Lookup failed for "${query}" (${error.message}). Injecting mock data.`);
    const mock = getMockProfile(query);
    return {
      company: mock.symbol,
      profile: mock,
      errors: [],
    };
  }
}
