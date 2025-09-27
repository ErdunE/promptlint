/**
 * Template Engine Type Definitions - ES Module
 * 
 * Core interfaces for dynamic template generation system
 * Enforces faithfulness principles and performance requirements
 * Chrome Extension Compatible - Browser APIs Only
 * 
 * NOTE: Core types (TemplateType, TemplateCandidate) moved to @promptlint/shared-types
 * to break circular dependency with adaptive-engine
 */

import { LintResult, LintIssue } from '../../../shared-types/dist/index.js';

// Define core template types locally to avoid circular dependencies
export enum TemplateType {
  TASK_IO = 'task_io',
  BULLET = 'bullet',
  SEQUENTIAL = 'sequential',
  MINIMAL = 'minimal'
}

export interface TemplateCandidate {
  id: string;
  type: TemplateType;
  content: string;
  score: number;
  faithfulnessValidated: boolean;
  generationTime: number;
  metadata?: {
    templateType: string;
    domainAlignment?: number;
    contextualRelevance?: number;
    originalAnalysis?: any;
    selectionMetadata?: any;
    enhancedSelection?: boolean;
    faithfulnessResult?: any;
    // Allow additional properties for flexibility
    [key: string]: unknown;
  };
}

export interface EnhancedDomainResult {
  domain: string;
  subCategory: string | undefined;
  confidence: number;
  indicators: string[];
  processingTime: number;
  semanticContext?: any;
}

export interface SelectionReason {
  type: string;
  description: string;
  confidence: number;
}

export interface EnhancedTemplateSelection {
  templateType: TemplateType;
  confidence: number;
  reasons: SelectionReason[];
  domainAlignment: number;
  contextMatch: number;
  compositeScore: number;
}

export interface TemplateSelectionMetadata {
  selectionReasoning: SelectionReason[];
  domainContext: EnhancedDomainResult;
  alternativeTemplates: TemplateType[];
  userFeedbackCapable: boolean;
  selectionStrategy: string;
}

// Type aliases for backward compatibility
export type TemplateContext = TemplateGenerationContext;
export type TemplateGenerationRequest = TemplateGenerationContext;

/**
 * Template metadata for analysis results
 */
export interface TemplateMetadata {
  templateType: string;
  domainAlignment?: number;
  contextualRelevance?: number;
  originalAnalysis?: any;
  faithfulnessResult?: FaithfulnessResult;
  performanceMetrics?: PerformanceMetrics;
  warnings?: string[];
  selectionMetadata?: any;
  enhancedSelection?: boolean;
  type?: string;
}

/**
 * Faithfulness validation result
 */
export interface FaithfulnessResult {
  passed: boolean;
  issues: FaithfulnessViolation[];
  details: string;
  score?: number;
  // Backward compatibility
  isValid?: boolean;
  violations?: FaithfulnessViolation[];
  report?: string;
}

/**
 * Faithfulness violation details
 */
export interface FaithfulnessViolation {
  type: FaithfulnessViolationType;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location?: string;
}

/**
 * Types of faithfulness violations
 */
export enum FaithfulnessViolationType {
  CONTENT_DRIFT = 'content_drift',
  INTENT_CHANGE = 'intent_change',
  CONTEXT_LOSS = 'context_loss',
  SCOPE_CREEP = 'scope_creep'
}

/**
 * Performance metrics for template operations
 */
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  processingSteps: number;
}

/**
 * Timed operation result
 */
export interface TimedResult<T> {
  result: T;
  executionTime: number;
  timestamp: number;
  warnings?: string[];
  timeoutExceeded?: boolean;
}

/**
 * Template selection criteria for pattern matching
 */
export interface TemplateSelectionCriteria {
  /** Lint analysis results */
  lintResult: LintResult;
  /** Detected issues from linting */
  issues: LintIssue[];
  /** Original prompt text */
  originalPrompt?: string | undefined;
  /** Domain classification if available */
  domain?: string;
  /** Semantic analysis results if available */
  semantics?: any;
  /** Complexity level of the prompt */
  complexity?: string;
  /** Whether the prompt has vague wording */
  hasVagueWording?: boolean;
  /** Whether the prompt has sequential keywords */
  hasSequentialKeywords?: boolean;
  /** Whether the prompt needs IO specification */
  needsIOSpecification?: boolean;
  /** Whether the prompt has task structure */
  hasTaskStructure?: boolean;
}

// Duplicate FaithfulnessResult removed - using the first definition

/**
 * Template generation configuration
 */
export interface TemplateGenerationConfig {
  /** Maximum candidates to generate */
  maxCandidates: number;
  /** Enable diversity in results */
  enableDiversity: boolean;
  /** Faithfulness threshold (0-100) */
  faithfulnessThreshold: number;
  /** Performance timeout in milliseconds */
  performanceTimeout: number;
  /** Enable enhanced selection */
  enableEnhancedSelection: boolean;
}

/**
 * Template generation context
 */
export interface TemplateGenerationContext {
  /** Original prompt */
  prompt: string;
  /** Lint analysis result */
  lintResult: LintResult;
  /** Domain classification */
  domainResult?: EnhancedDomainResult;
  /** Generation configuration */
  config: TemplateGenerationConfig;
  /** User preferences (if available) */
  userPreferences?: {
    preferredTypes: TemplateType[];
    avoidedTypes: TemplateType[];
  };
  /** Additional metadata */
  metadata?: any;
}

/**
 * Template generation result
 */
export interface TemplateGenerationResult {
  /** Generated candidates */
  candidates: TemplateCandidate[];
  /** Selection metadata */
  metadata: TemplateSelectionMetadata;
  /** Performance metrics */
  performance: {
    totalTime: number;
    candidateCount: number;
    averageScore: number;
    faithfulnessRate: number;
  };
  /** Any warnings or issues */
  warnings: string[];
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  /** Template type */
  type: TemplateType;
  /** Template class constructor */
  templateClass: new () => IBaseTemplate;
  /** Template metadata */
  metadata: {
    name: string;
    description: string;
    category: string;
    complexity: 'low' | 'medium' | 'high';
    suitableFor: string[];
  };
  /** Template priority for selection */
  priority?: number;
  /** Whether template is enabled */
  enabled?: boolean;
}

/**
 * Base template interface
 */
export interface IBaseTemplate {
  /** Generate template content */
  generate(context: TemplateGenerationContext): Promise<string>;
  /** Validate template faithfulness */
  validateFaithfulness(original: string, generated: string): Promise<FaithfulnessResult>;
  /** Get template metadata */
  getMetadata(): TemplateRegistryEntry['metadata'];
}

/**
 * Template selector interface
 */
export interface ITemplateSelector {
  /** Select best template type for given context */
  selectTemplate(context: TemplateGenerationContext): Promise<EnhancedTemplateSelection>;
  /** Get multiple template suggestions */
  suggestTemplates(context: TemplateGenerationContext, count: number): Promise<EnhancedTemplateSelection[]>;
}

/**
 * Template engine interface
 */
export interface ITemplateEngine {
  /** Generate template candidates */
  generateCandidates(prompt: string, lintResult: LintResult, config?: Partial<TemplateGenerationConfig>): Promise<TemplateCandidate[]>;
  /** Get available template types */
  getAvailableTypes(): TemplateType[];
  /** Register custom template */
  registerTemplate(entry: TemplateRegistryEntry): void;
}