/**
 * Core Template Types - Extracted to break circular dependencies
 * Moved from template-engine to shared-types for architecture stability
 */

import { LintResult, LintIssue } from './lint-types.js';

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
  /** Additional metadata for candidate */
  metadata?: {
    templateType: string;
    domainAlignment?: number;
    contextualRelevance?: number;
    originalAnalysis?: any;
    faithfulnessResult?: any;
    performanceMetrics?: any;
    warnings?: string[];
    selectionMetadata?: any;
    enhancedSelection?: boolean;
    type?: string;
    name?: string;
    description?: string;
    version?: string;
  };
}

/**
 * Enhanced domain classification result with sub-categories
 */
export interface EnhancedDomainResult {
  /** Primary domain classification */
  domain: string;
  /** Detected sub-category for enhanced context */
  subCategory: string | undefined;
  /** Classification confidence (0-100) */
  confidence: number;
  /** Domain characteristics detected */
  indicators: string[];
  /** Processing time in milliseconds */
  processingTime: number;
  /** Semantic analysis context (Phase 1.3) */
  semanticContext?: any; // PromptSemantics from SemanticTypes
}

/**
 * Template selection reasoning
 */
export interface SelectionReason {
  /** Type of reasoning applied */
  type: 'domain_alignment' | 'confidence_based' | 'lint_analysis' | 'context_match' | 'diversity_optimization' | 'domain_classification' | 'semantic_analysis' | 'context_analysis' | 'template_selection';
  /** Description of the reasoning */
  description: string;
  /** Confidence in this reasoning (0-100) */
  confidence: number;
}

/**
 * Enhanced template selection with metadata
 */
export interface EnhancedTemplateSelection {
  /** Selected template type */
  templateType: TemplateType;
  /** Overall selection confidence (0-100) */
  confidence: number;
  /** Reasoning for this selection */
  reasons: SelectionReason[];
  /** Domain alignment score (0-100) */
  domainAlignment: number;
  /** Context match score (0-100) */
  contextMatch: number;
  /** Composite score for ranking */
  compositeScore: number;
}

/**
 * Template selection metadata for feedback integration
 */
export interface TemplateSelectionMetadata {
  /** Reasoning for template selections */
  selectionReasoning: SelectionReason[];
  /** Domain classification context */
  domainContext: EnhancedDomainResult;
  /** Alternative templates considered */
  alternativeTemplates: TemplateType[];
  /** Whether user feedback integration is enabled */
  userFeedbackCapable: boolean;
  /** Selection strategy used */
  selectionStrategy: 'high_confidence' | 'moderate_confidence' | 'low_confidence_fallback' | 'semantic_aware';
}

/**
 * Template generation request parameters
 */
export interface TemplateGenerationRequest {
  /** Original prompt text */
  prompt: string;
  /** Lint analysis results */
  lintResult: LintResult;
  /** Optional template type preference */
  preferredType?: TemplateType;
  /** Maximum candidates to generate */
  maxCandidates?: number;
  /** Enable diversity in results */
  enableDiversity?: boolean;
}

/**
 * Template generation response
 */
export interface TemplateGenerationResponse {
  /** Generated template candidates */
  candidates: TemplateCandidate[];
  /** Selection metadata */
  metadata: TemplateSelectionMetadata;
  /** Generation performance metrics */
  performance: {
    totalTime: number;
    candidateCount: number;
    averageScore: number;
  };
}
