/**
 * Template Engine - Main Index - ES Module
 * 
 * Public API exports for template engine
 * Chrome Extension Compatible - ES Module syntax only
 */

// Main orchestration class
export { TemplateEngine } from './TemplateEngine.js';

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
