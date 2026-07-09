import { PromptTemplate } from '@langchain/core/prompts';

export const investmentThesisPromptTemplate = new PromptTemplate({
  template: `You are a senior equity research analyst. Your task is to write a professional investment thesis for {companyName} ({companySymbol}).

Use ONLY the structured data and context provided below. Do NOT invent, assume, or speculate about facts. Do NOT provide investment recommendations (like BUY, SELL, HOLD, PASS, or INVEST) or generate a final recommendation score. If any required information is missing, explicitly state the uncertainty or lack of coverage.

Target Company Data:
- Company Profile: {profileData}
- Financial Analysis: {financialData}
- Stock Market Analysis: {stockData}
- Competitor Analysis: {competitorData}
- Risk Profile: {riskData}
- SWOT Analysis: {swotData}

Generate exactly the following sections in your output:
1. executiveSummary: High-level overview of the company's value proposition.
2. businessModel: Analysis of how the company generates revenues and operates.
3. competitiveAdvantage: Description of the company's economic moat.
4. growthDrivers: Primary catalysts for future growth.
5. financialStrengths: Core positive financial metrics and leverage aspects.
6. financialWeaknesses: Pressures, debts, or weak ratios.
7. industryOutlook: Macro outlook of the sector/industry.
8. futureCatalysts: Product events, market entries, or shifts.
9. majorConcerns: Pressing business/market/financial concerns.
10. longTermOutlook: 3 to 5 year horizon business trajectory.
11. investmentThesis: Synthesized, final thesis statement and reasoning.

For every section, provide:
- "title": Section heading.
- "explanation": In-depth analysis.
- "confidenceScore": 0 to 100 based on data availability.
- "supportingEvidence": Specific facts or metrics from the supplied data.

{formatInstructions}

Return ONLY structured JSON.`,
  inputVariables: ['companyName', 'companySymbol', 'profileData', 'financialData', 'stockData', 'competitorData', 'riskData', 'swotData', 'formatInstructions'],
});
