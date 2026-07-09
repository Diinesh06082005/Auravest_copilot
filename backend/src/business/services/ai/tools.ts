import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// ==============================================================================
// 1. Company Profile Tool
// ==============================================================================
export const companyTool = tool(
  async ({ ticker }) => {
    const mockCompanyData: Record<string, any> = {
      AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', website: 'https://apple.com', description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.' },
      MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software—Infrastructure', website: 'https://microsoft.com', description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.' },
      GOOGL: { name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Internet Content & Information', website: 'https://abc.xyz', description: 'Alphabet Inc. provides Google search, ads, maps, play, YouTube, and hardware products globally.' },
    };

    const data = mockCompanyData[ticker.toUpperCase()] || {
      name: `${ticker.toUpperCase()} Corporation`,
      sector: 'General Industries',
      industry: 'Miscellaneous Business',
      website: `https://www.${ticker.toLowerCase()}.com`,
      description: `A publicly listed entity trading under the ticker symbol: ${ticker.toUpperCase()}`,
    };

    return JSON.stringify(data);
  },
  {
    name: 'get_company_info',
    description: 'Retrieve corporate profile, business description, sector, and industry details for a given company ticker.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol of the company, e.g., AAPL'),
    }),
  }
);

// ==============================================================================
// 2. Financial Metrics Tool
// ==============================================================================
export const financeTool = tool(
  async ({ ticker }) => {
    const mockFinanceData: Record<string, any> = {
      AAPL: { revenue: 385700000000, netIncome: 97000000000, peRatio: 30.5, eps: 6.13, debtToEquity: 1.4 },
      MSFT: { revenue: 211900000000, netIncome: 72400000000, peRatio: 34.2, eps: 9.72, debtToEquity: 1.1 },
    };

    const data = mockFinanceData[ticker.toUpperCase()] || {
      revenue: 120000000000,
      netIncome: 15000000000,
      peRatio: 22.0,
      eps: 4.5,
      debtToEquity: 0.8,
    };

    return JSON.stringify(data);
  },
  {
    name: 'get_financial_metrics',
    description: 'Retrieve balance sheet and income statement metrics (revenue, net income, P/E ratio, EPS, Debt/Equity) for a company.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol of the company, e.g., MSFT'),
    }),
  }
);

// ==============================================================================
// 3. News Extraction Tool
// ==============================================================================
export const newsTool = tool(
  async ({ ticker, limit }) => {
    const limitVal = limit || 3;
    const articles = [
      {
        title: `${ticker.toUpperCase()} launches new generative artificial intelligence models`,
        source: 'Bloomberg',
        summary: `${ticker.toUpperCase()} stock surges following updates to its cloud AI pipelines and partnerships.`,
        date: new Date().toISOString(),
      },
      {
        title: `Wall Street analysts adjust ratings for ${ticker.toUpperCase()}`,
        source: 'Reuters',
        summary: `Three financial institutions updated price targets on ${ticker.toUpperCase()} following latest earnings guidance report.`,
        date: new Date().toISOString(),
      },
    ];

    return JSON.stringify(articles.slice(0, limitVal));
  },
  {
    name: 'get_company_news',
    description: 'Get the latest corporate news headlines, summaries, and publications regarding a company.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., TSLA'),
      limit: z.number().optional().default(3).describe('Maximum number of news articles to return'),
    }),
  }
);

// ==============================================================================
// 4. Custom Financial Search Tool
// ==============================================================================
export const searchTool = tool(
  async ({ query }) => {
    const results = [
      {
        title: `SEC Regulatory filings search results for query: ${query}`,
        snippet: `Public reporting database filings, quarterly report summaries, and press release texts relevant to "${query}".`,
        url: 'https://sec.gov/edgar/searchedgar/companysearch',
      },
    ];
    return JSON.stringify(results);
  },
  {
    name: 'search_financial_web',
    description: 'Query search databases or public databases for custom financial and market information.',
    schema: z.object({
      query: z.string().describe('The search query string, e.g., AAPL revenue growth 2025'),
    }),
  }
);

// ==============================================================================
// 5. Risk Assessment Tool
// ==============================================================================
export const riskTool = tool(
  async ({ ticker }) => {
    const data = {
      riskLevel: 'medium',
      description: `Analysis shows a moderate risk profile for ${ticker.toUpperCase()} across macro and operational factors.`,
      keyRisks: [
        'Geopolitical impacts on supply chain logistical pipelines.',
        'Market share contestability from lower-cost industry competitors.',
      ],
    };
    return JSON.stringify(data);
  },
  {
    name: 'get_risk_profile',
    description: 'Assesses financial, geopolitical, operational, and market risk parameters for a specific stock.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., AMZN'),
    }),
  }
);

// ==============================================================================
// 6. SWOT Matrix Tool
// ==============================================================================
export const swotTool = tool(
  async ({ ticker }) => {
    const data = {
      strengths: ['Global brand recognition', 'Exceptional cash flow margins'],
      weaknesses: ['Concentrated revenue segments', 'Complex corporate organizational structure'],
      opportunities: ['Transitioning legacy platforms to cloud SaaS models', 'Untapped international market corridors'],
      threats: ['Technological obsolescence risk', 'Increasing domestic compliance and privacy regulations'],
    };
    return JSON.stringify(data);
  },
  {
    name: 'get_swot_matrix',
    description: 'Generate a SWOT analysis matrix (Strengths, Weaknesses, Opportunities, Threats) for a company.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol, e.g., NVDA'),
    }),
  }
);
