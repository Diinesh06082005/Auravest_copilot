import { CompanyProfile } from '../../types';

export interface ICompanyProfileProvider {
  readonly name: string;

  /**
   * Resolves a company name into its primary stock ticker symbol.
   * Throws SymbolNotFoundError if no symbol matches.
   */
  resolveSymbol(companyName: string): Promise<string>;

  /**
   * Fetches and normalizes the company profile for the resolved stock ticker symbol.
   * Throws ProfileNotFoundError if the profile is not found or fails.
   */
  fetchProfile(symbol: string): Promise<CompanyProfile>;
}
