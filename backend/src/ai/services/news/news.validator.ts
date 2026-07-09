import { z } from 'zod';

export const tavilySearchResultSchema = z.object({
  title: z.string().catch('No Title'),
  url: z.string().catch(''),
  content: z.string().catch(''),
  score: z.number().catch(0.5),
  published_date: z.string().optional().catch(undefined),
});

export const tavilySearchResponseSchema = z.object({
  results: z.array(tavilySearchResultSchema).catch([]),
});
