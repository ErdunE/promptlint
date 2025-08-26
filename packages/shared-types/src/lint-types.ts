// ===== src/lint-types.ts =====
/**
 * Core lint engine interfaces and types
 * Based on Product Specification requirements
 */

/**
 * Severity levels for lint issues
 */
export type LintIssueSeverity = 'low' | 'medium' | 'high';

/**
 * Available lint rule types for MVP
 * Based on Product Spec Section 5.1
 */
export enum LintRuleType {
  MISSING_TASK_VERB = 'missing_task_verb',
  MISSING_LANGUAGE = 'missing_language', 
  MISSING_IO_SPECIFICATION = 'missing_io_specification',
  VAGUE_WORDING = 'vague_wording',
  UNCLEAR_SCOPE = 'unclear_scope',
  REDUNDANT_LANGUAGE = 'redundant_language'
}

/**
 * Individual lint issue identified in prompt
 */
export interface LintIssue {
  /** Categorized issue type */
  type: LintRuleType;
  /** Issue severity level */
  severity: LintIssueSeverity;
  /** Human-readable description */
  message: string;
  /** Optional text highlighting position */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Complete lint analysis result
 */
export interface LintResult {
  /** Composite quality score (0-100) */
  score: number;
  /** Array of identified problems */
  issues: LintIssue[];
  /** Optional improvement hints */
  suggestions?: string[];
  /** Analysis metadata */
  metadata?: {
    /** Analysis duration in milliseconds */
    processingTime: number;
    /** Input prompt length */
    inputLength: number;
    /** Timestamp of analysis */
    timestamp: Date;
  };
}

/**
 * Configuration for individual lint rules
 */
export interface LintRuleConfig {
  /** Rule identifier */
  type: LintRuleType;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Rule severity level */
  severity: LintIssueSeverity;
  /** Rule-specific configuration */
  options?: Record<string, any>;
}

/**
 * Overall lint engine configuration
 */
export interface LintEngineConfig {
  /** Individual rule configurations */
  rules: LintRuleConfig[];
  /** Global scoring weights */
  scoring: {
    /** Base score for prompt with no issues */
    baseScore: number;
    /** Score penalty per high severity issue */
    highSeverityPenalty: number;
    /** Score penalty per medium severity issue */
    mediumSeverityPenalty: number;
    /** Score penalty per low severity issue */
    lowSeverityPenalty: number;
    /** Bonus for excellent task verbs (implement, develop, etc.) */
    taskVerbQualityBonus?: number;
    /** Bonus for specific terms (algorithm, function, etc.) */
    specificityBonus?: number;
    /** Bonus for clear, well-structured prompts */
    clarityBonus?: number;
  };
  /** Performance requirements */
  performance: {
    /** Maximum allowed processing time in ms */
    maxProcessingTime: number;
  };
}
