// ===== src/index.ts (FIXED) =====
/**
 * Consolidated exports for shared types package
 */

// Lint types
export * from './lint-types.js';

// LLM service types  
export * from './llm-types.js';

// UI types
export * from './ui-types.js';

// Site adapter types
export * from './site-types.js';

// Rephrase service types
export * from './rephrase-types.js';

// Configuration types
export * from './config-types.js';

// Re-export commonly used types for convenience
export type {
  LintResult,
  LintIssue
} from './lint-types.js';

// Export enum as value (not type)
export { LintRuleType } from './lint-types.js';

export type {
  RephraseResult,
  RephraseCandidate,
  RephraseRequest,
  RephraseApproach,
  RephraseConfig,
  RephraseServiceStatus,
  IRephraseService,
  IApiKeyStorage
} from './rephrase-types.js';

export {
  RephraseError,
  RephraseErrorType
} from './rephrase-types.js';

export type {
    ExtensionUIState
} from './ui-types.js';