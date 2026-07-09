import { PromptTemplate } from '@langchain/core/prompts';

// ==============================================================================
// 1. Company Operations & Profile Prompt
// ==============================================================================
export const companyAnalysisPrompt = new PromptTemplate({
  inputVariables: ['ticker', 'companyName', 'industry', 'description'],
  template: `
Perform a strategic business analysis for the company trading under the ticker symbol: {ticker}.

Company Details:
- Name: {companyName}
- Industry: {industry}
- Description: {description}

Analyze the operational profile of the business. You must structure your assessment around:
1. Core Business Model: How the company produces value and generates revenue.
2. Market Position: Competitive advantages, market share, and entry barriers.
3. Sector Dynamics: Sector growth vectors and competitive forces.
`,
});

// ==============================================================================
// 2. Financial Metrics Assessment Prompt
// ==============================================================================
export const financialAnalysisPrompt = new PromptTemplate({
  inputVariables: ['ticker', 'financialData'],
  template: `
Perform a rigorous financial analysis of the company: {ticker}.

Financial Metrics Data:
{financialData}

Analyze the financial health of the business. You must evaluate:
1. Profitability Trends: Assessment of margins (Gross, Operating, Net) and earnings trends.
2. Balance Sheet Strength: Evaluation of debt levels, leverage ratios (Debt/Equity), and cash reserves.
3. Valuation Multiples: Contextualizing current valuation multiples (such as P/E ratio) against peers.
`,
});

// ==============================================================================
// 3. SWOT Matrix Construction Prompt
// ==============================================================================
export const swotPrompt = new PromptTemplate({
  inputVariables: ['ticker', 'companyInfo', 'financialMetrics', 'news'],
  template: `
Generate a comprehensive SWOT analysis for: {ticker}.

Contextual Context:
- Company Information: {companyInfo}
- Financial Metrics: {financialMetrics}
- Recent News: {news}

Based on this information, construct a clear SWOT matrix:
1. STRENGTHS (Internal): Structural advantages, brand power, cash reserves.
2. WEAKNESSES (Internal): Balance sheet bottlenecks, operational dependencies, margin compression.
3. OPPORTUNITIES (External): Industry tailwinds, product launches, market expansions.
4. THREATS (External): Regulatory challenges, competitor disruption, macroeconomic headwinds.
`,
});

// ==============================================================================
// 4. Headwind & Risk Assessment Prompt
// ==============================================================================
export const riskPrompt = new PromptTemplate({
  inputVariables: ['ticker', 'financialMetrics', 'news'],
  template: `
Perform a detailed risk assessment for the stock ticker: {ticker}.

Data Inputs:
- Financial Metrics: {financialMetrics}
- Recent News & Developments: {news}

Identify, evaluate, and prioritize critical risk factors:
1. Operational Risks: Supply chain vulnerability, technology risk, concentration risk.
2. Market Risks: Commodity prices, pricing compression, market share losses.
3. Financial Risks: Leverage risks, cash flow volatility, interest rate exposures.
4. Regulatory & Geopolitical Risks: Policy updates, legal suits, trade constraints.
`,
});

// ==============================================================================
// 5. Final Investment Recommendation Prompt
// ==============================================================================
export const investmentRecommendationPrompt = new PromptTemplate({
  inputVariables: ['ticker', 'companyInfo', 'financialMetrics', 'swot', 'risks'],
  template: `
Synthesize all gathered financial intelligence to formulate an investment recommendation for ticker: {ticker}.

Assembled Intelligence:
- Company Profile: {companyInfo}
- Financial Health: {financialMetrics}
- SWOT Matrix: {swot}
- Risk Assessment: {risks}

Construct:
1. Core Investment Thesis: The fundamental argument supporting the investment outcome.
2. Risk-Reward Tradeoff: Weighing the potential upside arguments against the identified risks.
3. Final Recommendation: Issue a definitive rating (BUY, HOLD, or SELL) with pricing targets.
`,
});
