import { CompanyProfile, FinancialAnalysis, StockAnalysis, NewsArticle, CompetitorBenchmark, RiskFactors } from '../../types';
import { REGULATORY_KEYWORDS, TECH_KEYWORDS, MANAGEMENT_KEYWORDS } from './risk.constants';
import { determineRiskLevel, calculateCategoryConfidence } from './risk.utils';

/**
 * Calculates risk levels, confidence scores, and positive/negative factors
 * deterministically using sub-channel parameters.
 */
export function runRiskAnalysis(
  profile: CompanyProfile | null,
  financials: FinancialAnalysis | null,
  stock: StockAnalysis | null,
  news: NewsArticle[],
  competitors: CompetitorBenchmark[]
): RiskFactors {
  const majorRiskFactors: string[] = [];
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  // 1. Financial Risk Category
  let financialRiskScore = 15;
  let financialFieldsPresent = 0;
  if (financials) {
    financialFieldsPresent += 3;
    if (financials.debtToEquity > 1.5) {
      financialRiskScore += 40;
      negativeFactors.push('High leverage profile (Debt to Equity > 1.5).');
    } else if (financials.debtToEquity > 0.8) {
      financialRiskScore += 20;
    } else {
      positiveFactors.push('Comfortable leverage / debt-to-equity ratio.');
    }

    if (financials.currentRatio < 1.0) {
      financialRiskScore += 30;
      negativeFactors.push('Weak working capital (Current Ratio < 1.0).');
    }

    if (financials.netIncome < 0) {
      financialRiskScore += 15;
      negativeFactors.push('Operating net loss recorded.');
    } else {
      positiveFactors.push('Profitable net income operations.');
    }
  }
  financialRiskScore = Math.min(100, Math.max(0, financialRiskScore));
  const financialRisk = {
    score: financialRiskScore,
    level: determineRiskLevel(financialRiskScore),
    confidenceScore: calculateCategoryConfidence(financialFieldsPresent, 3),
  };

  // 2. Liquidity Risk Category
  let liquidityRiskScore = 20;
  let liquidityFieldsPresent = 0;
  if (financials) {
    liquidityFieldsPresent += 3;
    if (financials.currentRatio < 1.0) {
      liquidityRiskScore += 30;
    }
    if (financials.quickRatio < 0.8) {
      liquidityRiskScore += 40;
      negativeFactors.push('Severely constrained short-term solvency (Quick Ratio < 0.8).');
    } else if (financials.quickRatio < 1.2) {
      liquidityRiskScore += 20;
    } else {
      positiveFactors.push('Strong liquidity backstops (Quick Ratio > 1.2).');
    }
    if (financials.operatingCashFlow < 0) {
      liquidityRiskScore += 10;
      negativeFactors.push('Negative cash flow generated from operations.');
    }
  }
  liquidityRiskScore = Math.min(100, Math.max(0, liquidityRiskScore));
  const liquidityRisk = {
    score: liquidityRiskScore,
    level: determineRiskLevel(liquidityRiskScore),
    confidenceScore: calculateCategoryConfidence(liquidityFieldsPresent, 3),
  };

  // 3. Business Risk Category
  let businessRiskScore = 20;
  let businessFieldsPresent = 0;
  if (financials) {
    businessFieldsPresent += 1;
    if (financials.operatingMargin < 0) {
      businessRiskScore += 40;
    } else if (financials.operatingMargin < 0.05) {
      businessRiskScore += 20;
    } else {
      positiveFactors.push('Healthy operating margin profile.');
    }
  }
  if (profile) {
    businessFieldsPresent += 2;
    if (profile.marketCapitalization < 1000000000) {
      businessRiskScore += 30;
      negativeFactors.push('Small capitalization volatility exposure.');
    }
    const currentYear = new Date().getFullYear();
    const foundedYear = parseInt(profile.founded);
    if (!isNaN(foundedYear) && (currentYear - foundedYear) < 5) {
      businessRiskScore += 20;
    }
  }
  businessRiskScore = Math.min(100, Math.max(0, businessRiskScore));
  const businessRisk = {
    score: businessRiskScore,
    level: determineRiskLevel(businessRiskScore),
    confidenceScore: calculateCategoryConfidence(businessFieldsPresent, 3),
  };

  // 4. Market Risk Category
  let marketRiskScore = 20;
  let marketFieldsPresent = 0;
  if (stock) {
    marketFieldsPresent += 2;
    if (stock.beta > 1.5) {
      marketRiskScore += 40;
      negativeFactors.push('High volatility beta score relative to market.');
    } else if (stock.beta > 1.1) {
      marketRiskScore += 20;
    } else {
      positiveFactors.push('Low-beta market defensive profile.');
    }
    if (stock.volatilityScore > 70) {
      marketRiskScore += 40;
    } else if (stock.volatilityScore > 50) {
      marketRiskScore += 20;
    }
  }
  marketRiskScore = Math.min(100, Math.max(0, marketRiskScore));
  const marketRisk = {
    score: marketRiskScore,
    level: determineRiskLevel(marketRiskScore),
    confidenceScore: calculateCategoryConfidence(marketFieldsPresent, 2),
  };

  // 5. Valuation Risk Category
  let valuationRiskScore = 25;
  let valuationFieldsPresent = 0;
  if (financials) {
    valuationFieldsPresent += 2;
    if (financials.peRatio > 50) {
      valuationRiskScore += 50;
      negativeFactors.push('Extremely stretched valuation multiples (PE > 50).');
    } else if (financials.peRatio > 30) {
      valuationRiskScore += 25;
    } else if (financials.peRatio > 0 && financials.peRatio < 15) {
      positiveFactors.push('Attractive value multiples (PE < 15).');
    }
    if (financials.pegRatio > 3.0) {
      valuationRiskScore += 25;
    }
  }
  valuationRiskScore = Math.min(100, Math.max(0, valuationRiskScore));
  const valuationRisk = {
    score: valuationRiskScore,
    level: determineRiskLevel(valuationRiskScore),
    confidenceScore: calculateCategoryConfidence(valuationFieldsPresent, 2),
  };

  // 6. Growth Risk Category
  let growthRiskScore = 20;
  let growthFieldsPresent = 0;
  if (financials) {
    growthFieldsPresent += 1;
    if (financials.revenueGrowth < 0) {
      growthRiskScore += 50;
      negativeFactors.push('Revenue contraction registered.');
    } else if (financials.revenueGrowth < 5.0) {
      growthRiskScore += 25;
    } else {
      positiveFactors.push('Positive revenue expansion rate.');
    }
  }
  growthRiskScore = Math.min(100, Math.max(0, growthRiskScore));
  const growthRisk = {
    score: growthRiskScore,
    level: determineRiskLevel(growthRiskScore),
    confidenceScore: calculateCategoryConfidence(growthFieldsPresent, 1),
  };

  // 7. Competitive Risk Category
  let competitiveRiskScore = 20;
  let competitiveFieldsPresent = 0;
  if (competitors && competitors.length > 0 && financials) {
    competitiveFieldsPresent += 2;
    const peerRoes = competitors.map(c => c.roe).filter(v => !isNaN(v));
    const avgRoe = peerRoes.length > 0 ? peerRoes.reduce((sum, v) => sum + v, 0) / peerRoes.length : 0;
    if (financials.roe < avgRoe) {
      competitiveRiskScore += 40;
      negativeFactors.push('Lower capital return efficiency (ROE) than peer average.');
    } else {
      positiveFactors.push('Superior ROE efficiency vs peers.');
    }

    const peerGrowths = competitors.map(c => c.revenueGrowth).filter(v => !isNaN(v));
    const avgGrowth = peerGrowths.length > 0 ? peerGrowths.reduce((sum, v) => sum + v, 0) / peerGrowths.length : 0;
    if (financials.revenueGrowth < avgGrowth) {
      competitiveRiskScore += 40;
    }
  }
  competitiveRiskScore = Math.min(100, Math.max(0, competitiveRiskScore));
  const competitiveRisk = {
    score: competitiveRiskScore,
    level: determineRiskLevel(competitiveRiskScore),
    confidenceScore: calculateCategoryConfidence(competitiveFieldsPresent, 2),
  };

  // Keyword scanner logic
  const checkKeywords = (keywords: string[]): number => {
    let hits = 0;
    const corpus = [
      profile?.businessDescription || '',
      ...news.map(n => `${n.title} ${n.summary}`),
    ].join(' ').toLowerCase();

    for (const kw of keywords) {
      if (corpus.includes(kw.toLowerCase())) {
        hits++;
      }
    }
    return hits;
  };

  // 8. Regulatory Risk Category
  const regHits = checkKeywords(REGULATORY_KEYWORDS);
  const regulatoryRiskScore = Math.min(100, 15 + (regHits * 25));
  if (regHits >= 2) {
    negativeFactors.push('Regulatory headwinds or lawsuits detected in news feeds.');
  }
  const regulatoryRisk = {
    score: regulatoryRiskScore,
    level: determineRiskLevel(regulatoryRiskScore),
    confidenceScore: news.length > 0 ? 90 : 50,
  };

  // 9. Technology Risk Category
  const techHits = checkKeywords(TECH_KEYWORDS);
  const technologyRiskScore = Math.min(100, 15 + (techHits * 25));
  if (techHits >= 2) {
    negativeFactors.push('Cybersecurity or software risks flagged.');
  }
  const technologyRisk = {
    score: technologyRiskScore,
    level: determineRiskLevel(technologyRiskScore),
    confidenceScore: news.length > 0 ? 90 : 50,
  };

  // 10. Management Risk Category
  const mgtHits = checkKeywords(MANAGEMENT_KEYWORDS);
  const managementRiskScore = Math.min(100, 15 + (mgtHits * 35));
  if (mgtHits >= 1) {
    negativeFactors.push('Leadership changes or executive board friction detected.');
  }
  const managementRisk = {
    score: managementRiskScore,
    level: determineRiskLevel(managementRiskScore),
    confidenceScore: news.length > 0 ? 90 : 50,
  };

  // Aggregate stats
  const scores = [
    financialRisk.score,
    liquidityRisk.score,
    businessRisk.score,
    marketRisk.score,
    valuationRisk.score,
    growthRisk.score,
    competitiveRisk.score,
    regulatoryRisk.score,
    technologyRisk.score,
    managementRisk.score,
  ];

  const overallRiskScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const overallRiskLevel = determineRiskLevel(overallRiskScore);

  let riskTrend: 'Improving' | 'Stable' | 'Deteriorating' = 'Stable';
  if (overallRiskScore > 65) {
    riskTrend = 'Deteriorating';
  } else if (overallRiskScore < 30) {
    riskTrend = 'Improving';
  }

  if (negativeFactors.length > 0) {
    negativeFactors.slice(0, 4).forEach(f => majorRiskFactors.push(f));
  } else {
    majorRiskFactors.push('No critical deterministic risk factors flagged.');
  }

  return {
    financialRisk,
    businessRisk,
    marketRisk,
    valuationRisk,
    growthRisk,
    competitiveRisk,
    regulatoryRisk,
    technologyRisk,
    managementRisk,
    liquidityRisk,
    overallRiskScore,
    overallRiskLevel,
    riskTrend,
    majorRiskFactors,
    positiveFactors: positiveFactors.slice(0, 5),
    negativeFactors: negativeFactors.slice(0, 5),
  };
}
