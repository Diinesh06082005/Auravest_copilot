import { CompanyProfile, FinancialAnalysis, StockAnalysis, NewsArticle, CompetitorBenchmark } from '../../types';
import { REQUIRED_PROFILE_FIELDS, REQUIRED_FINANCIAL_FIELDS, REQUIRED_STOCK_FIELDS } from './validation.constants';
import { isValidTicker, normalizeDate, normalizePercentage, normalizeCurrency } from './validation.utils';

/**
 * Validates sub-channel payloads, normalizes metrics, detects duplicates, and computes quality scores.
 */
export function runDataValidationAndMerge(
  rawProfile: CompanyProfile | null,
  rawFinancials: FinancialAnalysis | null,
  rawStock: StockAnalysis | null,
  rawNews: NewsArticle[],
  rawCompetitors: CompetitorBenchmark[],
  tickerSymbol: string
): { data: any; report: any } {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const normalizedFields: string[] = [];

  // Ticker symbol validation
  if (!isValidTicker(tickerSymbol)) {
    errors.push(`Target company symbol "${tickerSymbol}" failed ticker formatting check.`);
  }

  // 1. Profile Channel Validation
  const defaultProfile: CompanyProfile = {
    name: rawProfile?.name || 'Unknown',
    symbol: rawProfile?.symbol || tickerSymbol,
    logo: rawProfile?.logo || '',
    industry: rawProfile?.industry || 'General',
    sector: rawProfile?.sector || 'General',
    ceo: rawProfile?.ceo || 'Unknown',
    headquarters: rawProfile?.headquarters || 'Unknown',
    country: rawProfile?.country || 'Unknown',
    founded: rawProfile?.founded || 'Unknown',
    employees: rawProfile?.employees || 0,
    exchange: rawProfile?.exchange || 'Unknown',
    marketCapitalization: rawProfile?.marketCapitalization || 0,
    website: rawProfile?.website || '',
    businessDescription: rawProfile?.businessDescription || '',
  };

  if (!rawProfile) {
    errors.push('Company Profile data is completely missing.');
    REQUIRED_PROFILE_FIELDS.forEach(f => missingFields.push(`profile.${f}`));
  } else {
    REQUIRED_PROFILE_FIELDS.forEach(f => {
      const val = (rawProfile as any)[f];
      if (val === undefined || val === null || val === '') {
        missingFields.push(`profile.${f}`);
        warnings.push(`Missing profile field: "${f}". Defaults applied.`);
      }
    });

    if (rawProfile.marketCapitalization) {
      defaultProfile.marketCapitalization = normalizeCurrency(rawProfile.marketCapitalization);
      normalizedFields.push('profile.marketCapitalization');
    }
  }

  // 2. Financials Channel Validation
  const defaultFinancials: FinancialAnalysis = {
    revenue: rawFinancials?.revenue || 0,
    revenueGrowth: rawFinancials?.revenueGrowth || 0,
    netIncome: rawFinancials?.netIncome || 0,
    grossProfit: rawFinancials?.grossProfit || 0,
    grossMargin: rawFinancials?.grossMargin || 0,
    operatingMargin: rawFinancials?.operatingMargin || 0,
    ebitda: rawFinancials?.ebitda || 0,
    ebitdaMargin: rawFinancials?.ebitdaMargin || 0,
    operatingCashFlow: rawFinancials?.operatingCashFlow || 0,
    freeCashFlow: rawFinancials?.freeCashFlow || 0,
    eps: rawFinancials?.eps || 0,
    peRatio: rawFinancials?.peRatio || 0,
    pegRatio: rawFinancials?.pegRatio || 0,
    roe: rawFinancials?.roe || 0,
    roa: rawFinancials?.roa || 0,
    roic: rawFinancials?.roic || 0,
    debtToEquity: rawFinancials?.debtToEquity || 0,
    currentRatio: rawFinancials?.currentRatio || 0,
    quickRatio: rawFinancials?.quickRatio || 0,
        marketCapitalization: rawFinancials?.marketCapitalization || 0,
    enterpriseValue: rawFinancials?.enterpriseValue || 0,
    sharesOutstanding: rawFinancials?.sharesOutstanding || 0,
    healthScore: rawFinancials?.healthScore || 50,
  };

  if (!rawFinancials) {
    errors.push('Financial Analysis data is completely missing.');
    REQUIRED_FINANCIAL_FIELDS.forEach(f => missingFields.push(`financials.${f}`));
  } else {
    REQUIRED_FINANCIAL_FIELDS.forEach(f => {
      const val = (rawFinancials as any)[f];
      if (val === undefined || val === null || val === '') {
        missingFields.push(`financials.${f}`);
        warnings.push(`Missing financial field: "${f}". Defaults applied.`);
      }
    });

    if (rawFinancials.healthScore < 0 || rawFinancials.healthScore > 100) {
      warnings.push(`Suspicious healthScore: "${rawFinancials.healthScore}". Capping it between 0 and 100.`);
      defaultFinancials.healthScore = Math.max(0, Math.min(100, rawFinancials.healthScore));
    }

    defaultFinancials.revenueGrowth = normalizePercentage(rawFinancials.revenueGrowth);
    defaultFinancials.roe = normalizePercentage(rawFinancials.roe);
    defaultFinancials.roa = normalizePercentage(rawFinancials.roa);
    defaultFinancials.roic = normalizePercentage(rawFinancials.roic);
    defaultFinancials.grossMargin = normalizePercentage(rawFinancials.grossMargin);
    defaultFinancials.operatingMargin = normalizePercentage(rawFinancials.operatingMargin);
    defaultFinancials.ebitdaMargin = normalizePercentage(rawFinancials.ebitdaMargin);
    
    defaultFinancials.revenue = normalizeCurrency(rawFinancials.revenue);
    defaultFinancials.netIncome = normalizeCurrency(rawFinancials.netIncome);
    defaultFinancials.grossProfit = normalizeCurrency(rawFinancials.grossProfit);
    defaultFinancials.ebitda = normalizeCurrency(rawFinancials.ebitda);
    defaultFinancials.operatingCashFlow = normalizeCurrency(rawFinancials.operatingCashFlow);
    defaultFinancials.freeCashFlow = normalizeCurrency(rawFinancials.freeCashFlow);
    defaultFinancials.marketCapitalization = normalizeCurrency(rawFinancials.marketCapitalization);
    defaultFinancials.enterpriseValue = normalizeCurrency(rawFinancials.enterpriseValue);

    normalizedFields.push('financials.currencies', 'financials.ratios');
  }

  // 3. Stock Channel Validation
  const defaultStock: StockAnalysis = {
    currentPrice: rawStock?.currentPrice || 0,
    previousClose: rawStock?.previousClose || 0,
    openPrice: rawStock?.openPrice || 0,
    dayHigh: rawStock?.dayHigh || 0,
    dayLow: rawStock?.dayLow || 0,
    fiftyTwoWeekHigh: rawStock?.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: rawStock?.fiftyTwoWeekLow || 0,
    volume: rawStock?.volume || 0,
    averageVolume: rawStock?.averageVolume || 0,
    beta: rawStock?.beta || 1.0,
    dividendYield: rawStock?.dividendYield || 0,
    dividendRate: rawStock?.dividendRate || 0,
    marketCapitalization: rawStock?.marketCapitalization || 0,
    enterpriseValue: rawStock?.enterpriseValue || 0,
    sharesOutstanding: rawStock?.sharesOutstanding || 0,
    floatShares: rawStock?.floatShares || 0,
    shortInterest: rawStock?.shortInterest || 0,
    currency: rawStock?.currency || 'USD',
    exchange: rawStock?.exchange || 'Unknown',
    marketState: rawStock?.marketState || 'REGULAR',
    charts: rawStock?.charts || { oneMonth: [], sixMonths: [], oneYear: [], fiveYears: [] },
    dailyChangePercent: rawStock?.dailyChangePercent || 0,
    weeklyChangePercent: rawStock?.weeklyChangePercent || 0,
    monthlyChangePercent: rawStock?.monthlyChangePercent || 0,
    yearlyReturnPercent: rawStock?.yearlyReturnPercent || 0,
    volatilityScore: rawStock?.volatilityScore || 50,
    momentumScore: rawStock?.momentumScore || 50,
    trendScore: rawStock?.trendScore || 50,
  };

  if (!rawStock) {
    errors.push('Stock Market data is completely missing.');
    REQUIRED_STOCK_FIELDS.forEach(f => missingFields.push(`stock.${f}`));
  } else {
    REQUIRED_STOCK_FIELDS.forEach(f => {
      const val = (rawStock as any)[f];
      if (val === undefined || val === null || val === '') {
        missingFields.push(`stock.${f}`);
        warnings.push(`Missing stock field: "${f}". Defaults applied.`);
      }
    });

    if (rawStock.currentPrice <= 0) {
      warnings.push(`Suspicious current stock price: "${rawStock.currentPrice}". Expected positive number.`);
    }

    defaultStock.currentPrice = normalizeCurrency(rawStock.currentPrice);
    defaultStock.previousClose = normalizeCurrency(rawStock.previousClose);
    defaultStock.dailyChangePercent = normalizePercentage(rawStock.dailyChangePercent);
    defaultStock.weeklyChangePercent = normalizePercentage(rawStock.weeklyChangePercent);
    defaultStock.monthlyChangePercent = normalizePercentage(rawStock.monthlyChangePercent);
    defaultStock.yearlyReturnPercent = normalizePercentage(rawStock.yearlyReturnPercent);

    normalizedFields.push('stock.price', 'stock.ratios');
  }

  // 4. News Deduplication & Formatting
  const seenNewsUrls = new Set<string>();
  const cleanNews: NewsArticle[] = [];
  let duplicateNewsCount = 0;

  for (const art of rawNews) {
    if (!art.url) {
      duplicateNewsCount++;
      continue;
    }
    const cleanUrl = art.url.trim().toLowerCase();
    if (seenNewsUrls.has(cleanUrl)) {
      duplicateNewsCount++;
      continue;
    }
    seenNewsUrls.add(cleanUrl);

    const isoDate = normalizeDate(art.publishedAt);
    cleanNews.push({
      ...art,
      publishedAt: isoDate,
      summary: art.summary || '',
      category: art.category || 'General',
      sentiment: art.sentiment || 'neutral',
    });
  }

  if (duplicateNewsCount > 0) {
    normalizedFields.push('news.publishedAt');
  }

  // 5. Competitor Deduplication & Formatting
  const seenPeers = new Set<string>();
  const cleanCompetitors: CompetitorBenchmark[] = [];
  let duplicateCompetitorCount = 0;

  for (const peer of rawCompetitors) {
    if (!peer.symbol) {
      duplicateCompetitorCount++;
      continue;
    }
    const cleanSym = peer.symbol.trim().toUpperCase();
    if (seenPeers.has(cleanSym)) {
      duplicateCompetitorCount++;
      continue;
    }
    seenPeers.add(cleanSym);

    cleanCompetitors.push({
      ...peer,
      marketCap: normalizeCurrency(peer.marketCap),
      revenue: normalizeCurrency(peer.revenue),
      netIncome: normalizeCurrency(peer.netIncome),
      peRatio: normalizeCurrency(peer.peRatio),
      revenueGrowth: normalizePercentage(peer.revenueGrowth),
      roe: normalizePercentage(peer.roe),
    });
  }

  // 6. Stats Compilation
  const totalRequiredFields =
    REQUIRED_PROFILE_FIELDS.length +
    REQUIRED_FINANCIAL_FIELDS.length +
    REQUIRED_STOCK_FIELDS.length;
  
  const presentRequiredFieldsCount = totalRequiredFields - missingFields.length;
  const completenessScore = totalRequiredFields > 0 
    ? Math.round((presentRequiredFieldsCount / totalRequiredFields) * 100) 
    : 100;

  const penalty = (warnings.length * 5) + (errors.length * 20);
  const dataQualityScore = Math.max(0, 100 - penalty);

  const report = {
    completenessScore,
    dataQualityScore,
    missingFields,
    warnings,
    errors,
    normalizedFields,
    duplicateRemovals: {
      newsCount: duplicateNewsCount,
      competitorCount: duplicateCompetitorCount,
    },
  };

  const data = {
    profile: defaultProfile,
    financials: defaultFinancials,
    stock: defaultStock,
    news: cleanNews,
    competitors: cleanCompetitors,
  };

  return { data, report };
}
