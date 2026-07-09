export class ProfileServiceError extends Error {
  constructor(message: string, public readonly status?: number, public readonly details?: any) {
    super(message);
    this.name = 'ProfileServiceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SymbolNotFoundError extends ProfileServiceError {
  constructor(query: string) {
    super(`No ticker symbol could be resolved for company name: "${query}"`);
    this.name = 'SymbolNotFoundError';
  }
}

export class ProfileNotFoundError extends ProfileServiceError {
  constructor(symbol: string) {
    super(`Company profile not found for symbol: "${symbol}"`);
    this.name = 'ProfileNotFoundError';
  }
}

export class ValidationError extends ProfileServiceError {
  constructor(message: string, details?: any) {
    super(message, undefined, details);
    this.name = 'ValidationError';
  }
}
