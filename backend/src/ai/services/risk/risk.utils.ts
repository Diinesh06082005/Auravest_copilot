import { RISK_SCORE_THRESHOLDS } from './risk.constants';

/**
 * Maps numeric scores to standard High/Medium/Low levels.
 */
export function determineRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= RISK_SCORE_THRESHOLDS.HIGH) return 'High';
  if (score >= RISK_SCORE_THRESHOLDS.MEDIUM) return 'Medium';
  return 'Low';
}

/**
 * Calculates a confidence score based on the completeness of parameters.
 */
export function calculateCategoryConfidence(presentFieldsCount: number, totalRequiredFields: number): number {
  if (totalRequiredFields <= 0) return 100;
  const fraction = presentFieldsCount / totalRequiredFields;
  return Math.round(fraction * 100);
}
