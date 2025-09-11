/**
 * Template Engine - Main Index - ES Module
 * 
 * Public API exports for template engine
 * Chrome Extension Compatible - ES Module syntax only
 */

// Main orchestration class
export { TemplateEngine } from './TemplateEngine.js';

// Phase 3.2 - Adaptive template engine (commented out for build compatibility)
// export { AdaptiveTemplateEngine } from './AdaptiveTemplateEngine.js';

// Template classes
export { 
  TaskIOTemplate, 
  BulletTemplate, 
  SequentialTemplate, 
  MinimalTemplate 
} from './templates/index.js';

// Validators
export { 
  FaithfulnessValidator, 
  PerformanceTimer 
} from './validators/index.js';

// Pattern matching
export { PatternMatcher } from './PatternMatcher.js';

// Analysis components
export { SemanticAnalyzer } from './analysis/SemanticAnalyzer.js';
export { ConfidenceCalibrator } from './analysis/ConfidenceCalibrator.js';
export { IntelligentTemplateSelector } from './analysis/IntelligentTemplateSelector.js';
export { SemanticRouter } from './analysis/SemanticRouter.js';

// Types and interfaces
export type {
  TemplateCandidate,
  TemplateContext,
  TemplateGenerationRequest,
  TemplateMetadata,
  FaithfulnessResult,
  FaithfulnessViolation,
  FaithfulnessViolationType,
  TimedResult,
  IBaseTemplate
} from './types/TemplateTypes.js';

export { TemplateType } from './types/TemplateTypes.js';

// Semantic analysis types
export type {
  PromptSemantics,
  IntentType,
  ComplexityLevel,
  CompletenessLevel,
  SpecificityLevel,
  ContextMarkers
} from './types/SemanticTypes.js';
