import { GraphState } from '../state';
import { logger } from '../../shared/logger';
import { InvestmentReport } from '../types';

export async function reportGenerationNode(state: GraphState): Promise<Partial<GraphState>> {
  if (state.errors && state.errors.length > 0) {
    return {
      report: `# Investment Analysis Error\n\nFailed to compile investment research report: ${state.errors.join(', ')}`,
    };
  }

  const ticker = state.company;
  logger.info(`reportGenerationNode: Generating final report and structured object for '${ticker}'`);

  const profile = state.validatedData?.profile || state.profile;
  const financials = state.validatedData?.financials || state.financials;
  const stock = state.validatedData?.stock || state.stock;
  const news = state.validatedData?.news || state.news || [];
  const competitors = state.validatedData?.competitors || state.competitors || [];
  const risk = state.risk;
  const swot = state.swot;
  const thesis = state.thesis;
  const scores = state.investmentScore;
  const rec = state.recommendation;
  const confidence = state.confidence;

  const reportObj: InvestmentReport = {
    companyOverview: {
      name: profile?.name || ticker,
      symbol: profile?.symbol || ticker,
      ceo: profile?.ceo || 'N/A',
      industry: profile?.industry || 'N/A',
      sector: profile?.sector || 'N/A',
      hq: profile?.headquarters || 'N/A',
      description: profile?.businessDescription || 'N/A',
    },
    financialSummary: {
      revenue: financials?.revenue || 0,
      netIncome: financials?.netIncome || 0,
      grossMargin: financials?.grossMargin || 0,
      operatingMargin: financials?.operatingMargin || 0,
      eps: financials?.eps || 0,
      peRatio: financials?.peRatio || 0,
      financialHealthScore: financials?.healthScore || 0,
    },
    stockSummary: {
      currentPrice: stock?.currentPrice || 0,
      changePercent: stock?.dailyChangePercent || 0,
      fiftyTwoWeekHigh: stock?.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: stock?.fiftyTwoWeekLow || 0,
      beta: stock?.beta || 1.0,
    },
    newsSummary: {
      articleCount: news.length,
      categories: state.newsCategories || {},
      recentNews: news.slice(0, 3).map((n: any) => ({
        title: n.title,
        sentiment: n.sentiment === 'positive' ? 'Positive' : n.sentiment === 'negative' ? 'Negative' : 'Neutral',
        impact: n.confidence || 3,
        source: n.source || 'News API',
        time: 'Recent'
      }))
    },
    competitorSummary: {
      competitors: competitors.map(c => ({
        name: c.name,
        symbol: c.symbol,
        marketCap: c.marketCap || 0,
        revenue: c.revenue || 0,
      })),
    },
    riskSummary: {
      overallRiskScore: risk?.overallRiskScore || 0,
      overallRiskLevel: risk?.overallRiskLevel || 'Medium',
      majorRisks: risk?.majorRiskFactors || [],
    },
    swot: swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    thesis: thesis || {
      executiveSummary: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      businessModel: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      competitiveAdvantage: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      growthDrivers: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      financialStrengths: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      financialWeaknesses: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      industryOutlook: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      futureCatalysts: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      majorConcerns: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      longTermOutlook: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
      investmentThesis: { title: '', explanation: '', confidenceScore: 0, supportingEvidence: [] },
    },
    scores: scores || {
      financialHealth: { value: 0, weight: 0.15, explanation: '', calculationDetails: '' },
      growth: { value: 0, weight: 0.15, explanation: '', calculationDetails: '' },
      profitability: { value: 0, weight: 0.15, explanation: '', calculationDetails: '' },
      valuation: { value: 0, weight: 0.1, explanation: '', calculationDetails: '' },
      marketPerformance: { value: 0, weight: 0.1, explanation: '', calculationDetails: '' },
      competitiveStrength: { value: 0, weight: 0.1, explanation: '', calculationDetails: '' },
      newsSentiment: { value: 0, weight: 0.05, explanation: '', calculationDetails: '' },
      risk: { value: 0, weight: 0.1, explanation: '', calculationDetails: '' },
      management: { value: 0, weight: 0.05, explanation: '', calculationDetails: '' },
      innovation: { value: 0, weight: 0.05, explanation: '', calculationDetails: '' },
      overallScore: 0,
      grade: 'D',
    },
    recommendation: rec || {
      rating: 'HOLD',
      targetPrice: 'N/A',
      horizon: '12 Months',
      rationale: [],
    },
    confidence: confidence,
    sources: [
      'Yahoo Finance API (via yahoo-finance2)',
      'Tavily Search API',
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  const markdown = `
# AI Investment Research Report: ${reportObj.companyOverview.name} (${reportObj.companyOverview.symbol})
*Generated by AI Investment Research Copilot on ${new Date().toLocaleDateString()}*

---

## 1. Executive Summary & AI Recommendation
*   **AI Target Rating:** **${reportObj.recommendation.rating}**
*   **Target Price:** ${reportObj.recommendation.targetPrice} (Current Price: $${reportObj.stockSummary.currentPrice})
*   **Investment Horizon:** ${reportObj.recommendation.horizon}
*   **AI Confidence Score:** **${reportObj.confidence}%**

### Key Rationale:
${(reportObj.recommendation.rationale || []).map(r => `*   ${r}`).join('\n')}

---

## 2. Investment Score Grade: ${reportObj.scores.grade} (Overall Score: ${reportObj.scores.overallScore}/100)
| Dimension | Score | Weight | Explanation |
| :--- | :---: | :---: | :--- |
| **Financial Health** | ${reportObj.scores.financialHealth.value} | ${reportObj.scores.financialHealth.weight} | ${reportObj.scores.financialHealth.explanation} |
| **Growth** | ${reportObj.scores.growth.value} | ${reportObj.scores.growth.weight} | ${reportObj.scores.growth.explanation} |
| **Profitability** | ${reportObj.scores.profitability.value} | ${reportObj.scores.profitability.weight} | ${reportObj.scores.profitability.explanation} |
| **Valuation** | ${reportObj.scores.valuation.value} | ${reportObj.scores.valuation.weight} | ${reportObj.scores.valuation.explanation} |
| **Market Performance** | ${reportObj.scores.marketPerformance.value} | ${reportObj.scores.marketPerformance.weight} | ${reportObj.scores.marketPerformance.explanation} |
| **Competitive Strength** | ${reportObj.scores.competitiveStrength.value} | ${reportObj.scores.competitiveStrength.weight} | ${reportObj.scores.competitiveStrength.explanation} |
| **News Sentiment** | ${reportObj.scores.newsSentiment.value} | ${reportObj.scores.newsSentiment.weight} | ${reportObj.scores.newsSentiment.explanation} |
| **Risk Control** | ${reportObj.scores.risk.value} | ${reportObj.scores.risk.weight} | ${reportObj.scores.risk.explanation} |
| **Management** | ${reportObj.scores.management.value} | ${reportObj.scores.management.weight} | ${reportObj.scores.management.explanation} |
| **Innovation** | ${reportObj.scores.innovation.value} | ${reportObj.scores.innovation.weight} | ${reportObj.scores.innovation.explanation} |

---

## 3. SWOT Analysis
### Strengths:
${(reportObj.swot.strengths || []).map(item => `*   **${item.title}** (Confidence: ${item.confidenceScore}%): ${item.explanation}`).join('\n')}

### Weaknesses:
${(reportObj.swot.weaknesses || []).map(item => `*   **${item.title}** (Confidence: ${item.confidenceScore}%): ${item.explanation}`).join('\n')}

### Opportunities:
${(reportObj.swot.opportunities || []).map(item => `*   **${item.title}** (Confidence: ${item.confidenceScore}%): ${item.explanation}`).join('\n')}

### Threats:
${(reportObj.swot.threats || []).map(item => `*   **${item.title}** (Confidence: ${item.confidenceScore}%): ${item.explanation}`).join('\n')}

---

## 4. Investment Thesis
### ${reportObj.thesis.investmentThesis.title}
${reportObj.thesis.investmentThesis.explanation}

*   **Executive Summary:** ${reportObj.thesis.executiveSummary.explanation}
*   **Business Model:** ${reportObj.thesis.businessModel.explanation}
*   **Competitive Advantage:** ${reportObj.thesis.competitiveAdvantage.explanation}
*   **Growth Drivers:** ${reportObj.thesis.growthDrivers.explanation}
*   **Long-Term Outlook:** ${reportObj.thesis.longTermOutlook.explanation}

---

## 5. Multi-Variable Risk Assessment
*   **Overall Risk Score (0-100):** **${reportObj.riskSummary.overallRiskScore}** (Risk Level: **${reportObj.riskSummary.overallRiskLevel}**)
*   **Major Risk Factors:**
${reportObj.riskSummary.majorRisks.map(r => `    *   ${r}`).join('\n')}

---

## 6. Competitors Benchmarking
| Ticker | Name | Market Cap | Revenue |
| :--- | :--- | :--- | :--- |
${reportObj.competitorSummary.competitors.map(c => `| **${c.symbol}** | ${c.name} | $${(c.marketCap / 1e9).toFixed(2)}B | $${(c.revenue / 1e9).toFixed(2)}B |`).join('\n')}
`;

  return {
    investmentReport: reportObj,
    report: markdown.trim(),
  };
}
