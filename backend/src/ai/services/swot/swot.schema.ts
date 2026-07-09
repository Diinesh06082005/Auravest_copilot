import { z } from 'zod';

export const swotPointSchema = z.object({
  title: z.string().describe('Concise headline representing the strength, weakness, opportunity, or threat.'),
  explanation: z.string().describe('Detailed explanation or backing data context explaining the point.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence score indicating how strong this factor is (0-100).'),
});

export const swotAnalysisSchema = z.object({
  strengths: z.array(swotPointSchema).min(3).max(6).describe('List of 3 to 6 company strengths.'),
  weaknesses: z.array(swotPointSchema).min(3).max(6).describe('List of 3 to 6 company weaknesses.'),
  opportunities: z.array(swotPointSchema).min(3).max(6).describe('List of 3 to 6 corporate opportunities.'),
  threats: z.array(swotPointSchema).min(3).max(6).describe('List of 3 to 6 risk factors or industry threats.'),
});
export type SwotAnalysisType = z.infer<typeof swotAnalysisSchema>;
