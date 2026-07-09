import { YahooQuote, YahooKeyStats, YahooHistoricalRow } from './stock.types';
import { StockAnalysis, ChartDatapoint, ChartDatasets } from '../../types';

export function calculatePercentageChange(current: number, base: number): number {
  if (base === 0) return 0;
  return +(((current - base) / base) * 100).toFixed(2);
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period || period <= 0) return 0;
  const sum = prices.slice(-period).reduce((acc, val) => acc + val, 0);
  return +(sum / period).toFixed(2);
}

export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(calculatePercentageChange(prices[i], prices[i - 1]));
  }
  const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
  const variance = returns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / returns.length;
  return +Math.sqrt(variance).toFixed(2);
}

export function detectTrend(prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (prices.length < 50) return 'NEUTRAL';
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  if (sma20 > sma50 * 1.01) return 'BULLISH';
  if (sma20 < sma50 * 0.99) return 'BEARISH';
  return 'NEUTRAL';
}

export function calculateMomentumScore(prices: number[]): number {
  if (prices.length < 14) return 50;
  const roc = calculatePercentageChange(prices[prices.length - 1], prices[prices.length - 14]);
  const score = Math.round(50 + roc * 2.5);
  return Math.min(Math.max(score, 0), 100);
}

export function calculateTrendScore(prices: number[]): number {
  if (prices.length < 50) return 50;
  const current = prices[prices.length - 1];
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  let score = 50;
  if (current > sma20) score += 25;
  else score -= 20;
  if (sma20 > sma50) score += 25;
  else score -= 20;
  return Math.min(Math.max(score, 0), 100);
}

export function normalizeStockData(
  quote: YahooQuote,
  stats: YahooKeyStats,
  historical: YahooHistoricalRow[]
): StockAnalysis {
  const prices = historical.map(h => h.close).filter(p => p > 0);

  const toDatapoints = (rows: YahooHistoricalRow[]): ChartDatapoint[] => {
    return rows.map(r => ({
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
      close: r.close,
    }));
  };

  const len = historical.length;
  const oneMonth = toDatapoints(historical.slice(-21));
  const sixMonths = toDatapoints(historical.slice(-126));
  const oneYear = toDatapoints(historical.slice(-252));
  const fiveYears = toDatapoints(historical.slice(-1260));

  const charts: ChartDatasets = {
    oneMonth,
    sixMonths,
    oneYear,
    fiveYears,
  };

  const currentPrice = quote.regularMarketPrice || (prices.length > 0 ? prices[prices.length - 1] : 0);
  const previousClose = quote.regularMarketPreviousClose || currentPrice;

  const dailyChangePercent = calculatePercentageChange(currentPrice, previousClose);
  const weeklyChangePercent = prices.length >= 5 ? calculatePercentageChange(currentPrice, prices[prices.length - 5]) : 0;
  const monthlyChangePercent = prices.length >= 20 ? calculatePercentageChange(currentPrice, prices[prices.length - 20]) : 0;
  const yearlyReturnPercent = prices.length >= 252 ? calculatePercentageChange(currentPrice, prices[prices.length - 252]) : 0;

  const volatility = calculateVolatility(prices.slice(-20));
  const volatilityScore = Math.min(Math.round(volatility * 20), 100);
  const momentumScore = calculateMomentumScore(prices);
  const trendScore = calculateTrendScore(prices);

  return {
    currentPrice,
    previousClose,
    openPrice: quote.regularMarketOpen || currentPrice,
    dayHigh: quote.regularMarketDayHigh || currentPrice,
    dayLow: quote.regularMarketDayLow || currentPrice,
    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || currentPrice,
    fiftyTwoWeekLow: quote.fiftyTwoWeekLow || currentPrice,
    volume: quote.regularMarketVolume || 0,
    averageVolume: quote.averageDailyVolume3Month || 0,
    beta: stats.beta || 0,
    dividendYield: stats.dividendYield || 0,
    dividendRate: stats.dividendRate || 0,
    marketCapitalization: stats.marketCap || 0,
    enterpriseValue: stats.enterpriseValue || 0,
    sharesOutstanding: stats.sharesOutstanding || 0,
    floatShares: stats.floatShares || 0,
    shortInterest: stats.sharesShort || 0,
    currency: quote.currency || 'USD',
    exchange: quote.exchangeName || 'NASDAQ',
    marketState: quote.marketState || 'REGULAR',
    charts,
    dailyChangePercent,
    weeklyChangePercent,
    monthlyChangePercent,
    yearlyReturnPercent,
    volatilityScore,
    momentumScore,
    trendScore,
  };
}
