export interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketVolume?: number;
  averageDailyVolume3Month?: number;
  currency?: string;
  exchangeName?: string;
  marketState?: string;
}

export interface YahooKeyStats {
  beta?: number;
  dividendYield?: number;
  dividendRate?: number;
  marketCap?: number;
  enterpriseValue?: number;
  sharesOutstanding?: number;
  floatShares?: number;
  sharesShort?: number;
}

export interface YahooHistoricalRow {
  date: Date;
  close: number;
}
