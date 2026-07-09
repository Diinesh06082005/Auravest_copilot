import { z } from 'zod';

export const yahooQuoteSchema = z.object({
  regularMarketPrice: z.number().catch(0),
  regularMarketPreviousClose: z.number().catch(0),
  regularMarketOpen: z.number().catch(0),
  regularMarketDayHigh: z.number().catch(0),
  regularMarketDayLow: z.number().catch(0),
  fiftyTwoWeekHigh: z.number().catch(0),
  fiftyTwoWeekLow: z.number().catch(0),
  regularMarketVolume: z.number().catch(0),
  averageDailyVolume3Month: z.number().catch(0),
  currency: z.string().catch('USD'),
  exchangeName: z.string().catch('Unknown'),
  marketState: z.string().catch('REGULAR'),
});

export const yahooKeyStatsSchema = z.object({
  beta: z.number().catch(0),
  dividendYield: z.number().catch(0),
  dividendRate: z.number().catch(0),
  marketCap: z.number().catch(0),
  enterpriseValue: z.number().catch(0),
  sharesOutstanding: z.number().catch(0),
  floatShares: z.number().catch(0),
  sharesShort: z.number().catch(0),
});

export const yahooHistoricalRowSchema = z.object({
  date: z.date().or(z.string().transform(val => new Date(val))),
  close: z.number().catch(0),
});

export const yahooHistoricalSchema = z.array(yahooHistoricalRowSchema);
