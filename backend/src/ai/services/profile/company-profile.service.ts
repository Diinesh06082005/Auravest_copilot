import { ICompanyProfileProvider } from './profile-provider.interface';
import { CompanyProfile } from '../../types';
import { ValidationError, ProfileServiceError } from './errors';
import { logger } from '../../../shared/logger';

export class CompanyProfileService {
  private providers: ICompanyProfileProvider[] = [];

  constructor(providers: ICompanyProfileProvider[]) {
    if (!providers || providers.length === 0) {
      throw new ValidationError('CompanyProfileService requires at least one profile provider.');
    }
    this.providers = providers;
  }

  /**
   * Resolves a stock symbol and fetches the company profile using configured providers sequentially.
   */
  public async getProfile(query: string): Promise<CompanyProfile> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new ValidationError('Company name or ticker query cannot be empty.');
    }

    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        logger.info(`[CompanyProfileService] Attempting resolution with provider: "${provider.name}"`);
        
        // 1. Resolve ticker symbol from query (name or ticker)
        const symbol = await provider.resolveSymbol(cleanQuery);
        logger.info(`[CompanyProfileService] Symbol resolved to: "${symbol}" via provider: "${provider.name}"`);

        // 2. Fetch profile metrics
        const profile = await provider.fetchProfile(symbol);
        logger.info(`[CompanyProfileService] Profile successfully retrieved via provider: "${provider.name}"`);
        
        return profile;
      } catch (err: any) {
        logger.warn(`[CompanyProfileService] Provider "${provider.name}" failed: ${err.message}`);
        lastError = err;
        // Proceed to try next provider
      }
    }

    throw new ProfileServiceError(
      `Failed to retrieve company profile from any configured providers. Last error: ${lastError?.message || 'Unknown'}`
    );
  }
}
