/**
 * Semantic Analysis Types - ES Module
 * 
 * Advanced semantic understanding for prompt analysis
 * Phase 1.3 Context-Aware Template Selection Implementation
 * Chrome Extension Compatible - Browser APIs Only
 */

/**
 * Intent types for semantic analysis
 */
export enum IntentType {
  INSTRUCTIONAL = 'instructional',    // Direct commands, how-to requests
  CREATIVE = 'creative',              // Creative writing, brainstorming
  ANALYTICAL = 'analytical',          // Analysis, evaluation, comparison
  COMPARATIVE = 'comparative',        // Compare/contrast requests
  PLANNING = 'planning',              // Project planning, organization
  DEBUGGING = 'debugging',            // Problem-solving, troubleshooting
  EXPLANATORY = 'explanatory',        // Explanation requests
  INVESTIGATIVE = 'investigative',    // Research, exploration, discovery
  GENERATIVE = 'generative'           // Content generation
}

/**
 * Complexity levels for prompt assessment
 */
export enum ComplexityLevel {
  SIMPLE = 'simple',                  // Single task, clear request
  MODERATE = 'moderate',              // Multiple related tasks
  COMPLEX = 'complex',                // Multi-step process
  EXPERT = 'expert'                   // Advanced, specialized knowledge
}

/**
 * Completeness levels for prompt evaluation
 */
export enum CompletenessLevel {
  MINIMAL = 'minimal',                // Very basic, missing details
  PARTIAL = 'partial',                // Some details present
  DETAILED = 'detailed',              // Good level of detail
  COMPREHENSIVE = 'comprehensive'     // Complete specification
}

/**
 * Specificity levels for prompt precision
 */
export enum SpecificityLevel {
  VAGUE = 'vague',                    // Unclear, ambiguous
  GENERAL = 'general',                // Broad but understandable
  SPECIFIC = 'specific',              // Clear and precise
  PRECISE = 'precise'                 // Highly detailed and exact
}

/**
 * Context markers for semantic routing
 */
export interface ContextMarkers {
  temporal: boolean;                  // Time-based context
  conditional: boolean;               // If-then conditions
  comparative: boolean;               // Comparison context
  sequential: boolean;                // Step-by-step process
  organizational: boolean;            // Planning/organization context
  technical: boolean;                 // Technical implementation
  creative: boolean;                  // Creative/artistic context
  analytical: boolean;                // Analysis/evaluation context
}

/**
 * Comprehensive semantic analysis result
 */
export interface PromptSemantics {
  intentType: IntentType;
  complexity: ComplexityLevel;
  completeness: CompletenessLevel;
  specificity: SpecificityLevel;
  context: ContextMarkers;
  confidence: number;                 // Overall semantic analysis confidence
  indicators: string[];               // Semantic indicators found
  processingTime: number;             // Analysis processing time
}

/**
 * Template selection factors for intelligent scoring
 */
export interface TemplateSelectionFactors {
  domainAlignment: number;            // How well template fits domain (0-100)
  intentMatch: number;                // How well template matches intent (0-100)
  complexityAppropriate: number;      // Template complexity vs prompt complexity (0-100)
  completenessSupport: number;        // Template supports prompt completeness (0-100)
  contextualRelevance: number;        // Template structure matches context (0-100)
  overallScore: number;               // Weighted overall score (0-100)
}

/**
 * Template score with detailed breakdown
 */
export interface TemplateScore {
  templateType: string;
  factors: TemplateSelectionFactors;
  reasoning: string[];                // Human-readable reasoning
  confidence: number;                 // Selection confidence
}

/**
 * Semantic routing result
 */
export interface TemplateRoutingResult {
  primaryTemplate: string;
  alternativeTemplates: string[];
  routingReason: string;
  semanticContext: PromptSemantics;
  confidence: number;
}

/**
 * Confidence calibration factors
 */
export interface ConfidenceCalibrationFactors {
  baseConfidence: number;
  semanticBoost: number;              // Boost from semantic analysis
  domainAlignment: number;            // Domain-template alignment
  specificityBonus: number;           // Bonus for high specificity
  contextRelevance: number;           // Context marker relevance
  finalConfidence: number;            // Calibrated final confidence
}

/**
 * Semantic analysis configuration
 */
export interface SemanticAnalysisConfig {
  enableIntentDetection: boolean;
  enableComplexityAssessment: boolean;
  enableCompletenessEvaluation: boolean;
  enableContextMarkers: boolean;
  maxProcessingTime: number;          // Max processing time in ms
  confidenceThreshold: number;        // Minimum confidence threshold
}
