export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  edgeId?: string;
  title: string;
  message: string;
  severity: ValidationSeverity;
  category: 'structure' | 'connectivity' | 'property' | 'logic' | 'integration';
}

export interface ValidationReport {
  isValid: boolean;
  errorsCount: number;
  warningsCount: number;
  issues: ValidationIssue[];
  timestamp: string;
}
