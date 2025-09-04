/**
 * Template Engine Type Definitions - ES Module
 * 
 * Core interfaces for dynamic template generation system
 * Enforces faithfulness principles and performance requirements
 * Chrome Extension Compatible - Browser APIs Only
 */

import { LintResult, LintIssue } from '@promptlint/shared-types';

/**
 * Template types available for generation
 */
export enum TemplateType {
  TASK_IO = 'task_io',
  BULLET = 'bullet',
  SEQUENTIAL = 'sequential',
  MINIMAL = 'minimal'
}

/**
 * Generated template candidate with metadata
 */
export interface TemplateCandidate {
  /** Unique identifier for this candidate */
  id: string;
  /** Template type used for generation */
  type: TemplateType;
  /** Generated prompt content */
  content: string;
  /** Quality score (0-100) */
  score: number;
  /** Whether faithfulness validation passed */
  faithfulnessValidated: boolean;
  /** Generation time in milliseconds */
  generationTime: number;
  /** Template-specific metadata */
  metadata?: {
    /** Template type used */
    templateType: string;
    /** Faithfulness validation result */
    faithfulnessResult: FaithfulnessResult;
    /** Performance metrics */
    performanceMetrics: {
      executionTime: number;
      maxAllowedTime: number;
      warningThreshold: number;
      isAcceptable: boolean;
      isWarning: boolean;
      performanceRatio: number;
    };
    /** Performance warnings */
    warnings: string[];
  };
}

/**
 * Faithfulness validation result
 */
export interface FaithfulnessResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation score (0-100) */
  score: number;
  /** Violations found */
  violations: FaithfulnessViolation[];
  /** Detailed validation report */
  report: string;
}

/**
 * Faithfulness violation types
 */
export type FaithfulnessViolationType = 'added_requirement' | 'changed_scope' | 'added_assumption' | 'technical_addition' | 'context_assumption';

/**
 * Faithfulness violation details
 */
export interface FaithfulnessViolation {
  /** Type of violation */
  type: FaithfulnessViolationType;
  /** Description of violation */
  description: string;
  /** Original text that was changed */
  originalText?: string;
  /** Generated text that violates principles */
  generatedText?: string;
  /** Severity of violation */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Template generation request
 */
export interface TemplateGenerationRequest {
  /** Original prompt text */
  originalPrompt: string;
  /** Lint analysis result */
  lintResult: LintResult;
  /** Maximum generation time in milliseconds */
  maxGenerationTime?: number;
  /** Template types to consider */
  preferredTypes?: TemplateType[];
  /** Whether to enforce strict faithfulness */
  strictMode?: boolean;
}

/**
 * Template generation result
 */
export interface TemplateGenerationResult {
  /** Generated candidates */
  candidates: TemplateCandidate[];
  /** Total generation time */
  totalGenerationTime: number;
  /** Whether performance requirement was met */
  performanceMet: boolean;
  /** Generation metadata */
  metadata: {
    /** Templates attempted */
    templatesAttempted: TemplateType[];
    /** Templates that passed validation */
    templatesPassed: TemplateType[];
    /** Performance metrics */
    performance: {
      averageGenerationTime: number;
      slowestTemplate: TemplateType | null;
      fastestTemplate: TemplateType | null;
    };
  };
}

/**
 * Template selection criteria
 */
export interface TemplateSelectionCriteria {
  /** Lint issues to address */
  issues: LintIssue[];
  /** Prompt complexity level */
  complexity: 'simple' | 'medium' | 'complex';
  /** Whether prompt contains sequential keywords */
  hasSequentialKeywords: boolean;
  /** Whether prompt has clear task structure */
  hasTaskStructure: boolean;
  /** Whether prompt needs I/O specification */
  needsIOSpecification: boolean;
  /** Whether prompt has vague wording */
  hasVagueWording: boolean;
}

/**
 * Template application context
 */
export interface TemplateContext {
  /** Original prompt text */
  prompt: string;
  /** Lint analysis result */
  lintResult: LintResult;
  /** Template metadata */
  metadata: TemplateMetadata;
}

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /** Template type */
  type: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template version */
  version: string;
  /** Last modified timestamp */
  lastModified: number;
  /** Generation timestamp */
  timestamp?: number;
  /** Engine version */
  engine?: string;
}

/**
 * Performance timing result
 */
export interface TimedResult<T> {
  /** Result of the operation */
  result: T;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Whether timeout was exceeded */
  timeoutExceeded: boolean;
  /** Performance warnings */
  warnings: string[];
}

/**
 * Template engine configuration
 */
export interface TemplateEngineConfig {
  /** Maximum generation time per template */
  maxGenerationTime: number;
  /** Maximum total generation time */
  maxTotalGenerationTime: number;
  /** Whether to enable strict faithfulness mode */
  strictFaithfulness: boolean;
  /** Minimum score for template acceptance */
  minTemplateScore: number;
  /** Performance monitoring enabled */
  performanceMonitoring: boolean;
  /** Template-specific configurations */
  templateConfigs: {
    [K in TemplateType]: {
      enabled: boolean;
      priority: number;
      maxGenerationTime: number;
    };
  };
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  /** Template type */
  type: TemplateType;
  /** Template class constructor */
  templateClass: new () => IBaseTemplate;
  /** Template priority (higher = more preferred) */
  priority: number;
  /** Whether template is enabled */
  enabled: boolean;
  /** Template description */
  description: string;
}

/**
 * Base template interface (ES Module)
 */
export interface IBaseTemplate {
  /** Template type */
  readonly type: TemplateType;
  /** Template name */
  readonly name: string;
  /** Template description */
  readonly description: string;
  /** Apply template to generate candidate */
  apply(context: TemplateContext): TemplateCandidate;
  /** Check if template is suitable for given context */
  isSuitable(context: TemplateContext): boolean;
  /** Get template priority for given context */
  getPriority(context: TemplateContext): number;
}
