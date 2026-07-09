import { z } from 'zod';

export const riskCategoryDetailSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(['Low', 'Medium', 'High']),
  confidenceScore: z.number().min(0).max(100),
});

export const riskFactorsSchema = z.object({
  financialRisk: riskCategoryDetailSchema,
  businessRisk: riskCategoryDetailSchema,
  marketRisk: riskCategoryDetailSchema,
  valuationRisk: riskCategoryDetailSchema,
  growthRisk: riskCategoryDetailSchema,
  competitiveRisk: riskCategoryDetailSchema,
  regulatoryRisk: riskCategoryDetailSchema,
  technologyRisk: riskCategoryDetailSchema,
  managementRisk: riskCategoryDetailSchema,
  liquidityRisk: riskCategoryDetailSchema,
  overallRiskScore: z.number().min(0).max(100),
  overallRiskLevel: z.enum(['Low', 'Medium', 'High']),
  riskTrend: z.enum(['Improving', 'Stable', 'Deteriorating']),
  majorRiskFactors: z.array(z.string()),
  positiveFactors: z.array(z.string()),
  negativeFactors: z.array(z.string()),
});
