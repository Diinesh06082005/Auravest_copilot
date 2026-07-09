import { PromptTemplate } from '@langchain/core/prompts';

export const swotPromptTemplate = new PromptTemplate({
  template: `You are an expert financial analyst. Your task is to perform a detailed SWOT (Strengths, Weaknesses, Opportunities, and Threats) analysis for {companyName} ({companySymbol}).

Use ONLY the structured data and context provided below. Do NOT assume, speculate, or introduce external data. Do NOT provide investment recommendations or rating guidance (like BUY, SELL, or HOLD).

Target Company Data:
- Company Profile: {profileData}
- Financial Analysis: {financialData}
- Stock Market Analysis: {stockData}
- Competitor Analysis: {competitorData}
- Risk Profile: {riskData}
- News Sentiment: {newsData}

Guidelines:
1. Strengths: Identify 3 to 6 company strengths (e.g. leverage, profit, competitive margins, ROE).
2. Weaknesses: Identify 3 to 6 company weaknesses (e.g. small capitalization, low quick ratios, low news sentiments).
3. Opportunities: Identify 3 to 6 corporate opportunities based on industry trends and company characteristics.
4. Threats: Identify 3 to 6 threats (e.g. regulatory compliance suits, cybersecurity, competitive pricing).

For every point, provide:
- A descriptive "title"
- A detailed "explanation" with data backstops where available
- A "confidenceScore" between 0 and 100 indicating how prominent/certain this factor is.

{formatInstructions}

Return ONLY structured JSON.`,
  inputVariables: ['companyName', 'companySymbol', 'profileData', 'financialData', 'stockData', 'competitorData', 'riskData', 'newsData', 'formatInstructions'],
});
