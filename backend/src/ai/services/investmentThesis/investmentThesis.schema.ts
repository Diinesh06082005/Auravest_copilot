import { z } from 'zod';

export const thesisSectionSchema = z.object({
  title: z.string().describe('Clear, professional headline for this section.'),
  explanation: z.string().describe('In-depth analytical explanation of the section theme backed by data.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence score from 0 to 100 based on data quality.'),
  supportingEvidence: z.array(z.string()).describe('Bullet points containing specific metrics or facts supporting this thesis.'),
});

export const investmentThesisSchema = z.object({
  executiveSummary: thesisSectionSchema,
  businessModel: thesisSectionSchema,
  competitiveAdvantage: thesisSectionSchema,
  growthDrivers: thesisSectionSchema,
  financialStrengths: thesisSectionSchema,
  financialWeaknesses: thesisSectionSchema,
  industryOutlook: thesisSectionSchema,
  futureCatalysts: thesisSectionSchema,
  majorConcerns: thesisSectionSchema,
  longTermOutlook: thesisSectionSchema,
  investmentThesis: thesisSectionSchema,
});

export type InvestmentThesisType = z.infer<typeof investmentThesisSchema>;
