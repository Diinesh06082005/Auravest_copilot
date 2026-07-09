import { GraphState } from '../state';
import { ValidationService } from '../services/validation/validation.service';
import { logger } from '../../shared/logger';

let validationServiceInstance: ValidationService | null = null;

/**
 * Lazy resolver for ValidationService.
 */
function getValidationService(): ValidationService {
  if (!validationServiceInstance) {
    validationServiceInstance = new ValidationService();
  }
  return validationServiceInstance;
}

/**
 * LangGraph node responsible for auditing sub-channel payloads, removing duplicates,
 * filling missing data with defaults, and recording validation logs.
 */
export async function validationNode(state: GraphState): Promise<Partial<GraphState>> {
  logger.info(`validationNode: Starting merge audit for symbol: "${state.company}"`);

  try {
    const service = getValidationService();
    const result = await service.validateAndMerge(state);

    const updatedErrors = [...(state.errors || [])];
    result.report.errors.forEach(err => {
      if (!updatedErrors.includes(err)) {
        updatedErrors.push(err);
      }
    });

    return {
      validatedData: result.data,
      validationReport: result.report,
      errors: updatedErrors,
      metadata: {
        ...state.metadata,
        validatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    logger.error(`validationNode failed for "${state.company}": ${error.message}`);
    return {
      errors: [error.message],
    };
  }
}
