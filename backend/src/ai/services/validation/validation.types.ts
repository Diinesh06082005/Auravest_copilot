import { ValidatedData, ValidationReport } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  data: ValidatedData;
  report: ValidationReport;
}
