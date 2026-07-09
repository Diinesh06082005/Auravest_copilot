import { GraphState } from '../../state';
import { ValidationResult } from './validation.types';
import { runDataValidationAndMerge } from './validation.mapper';
import { logger } from '../../../shared/logger';

export class ValidationService {
  /**
   * Audit, de-duplicate, and normalize sub-channel states.
   */
  public async validateAndMerge(state: GraphState): Promise<ValidationResult> {
    logger.info(`[ValidationService] Commencing full audit & merge for symbol: "${state.company}"`);

    const result = runDataValidationAndMerge(
      state.profile,
      state.financials,
      state.stock,
      state.news || [],
      state.competitors || [],
      state.company
    );

    const isValid = result.report.errors.length === 0;

    return {
      isValid,
      data: result.data,
      report: result.report,
    };
  }
}
