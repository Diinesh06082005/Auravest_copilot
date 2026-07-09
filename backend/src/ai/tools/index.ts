import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const tickerLookupTool = tool(
  async ({ ticker }) => {
    return `Mock data for ${ticker}`;
  },
  {
    name: 'tickerLookup',
    description: 'Lookup ticker standard profile details.',
    schema: z.object({
      ticker: z.string().describe('The stock ticker symbol'),
    }),
  }
);
