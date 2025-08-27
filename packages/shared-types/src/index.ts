// ===== src/index.ts (FIXED) =====
/**
 * Consolidated exports for shared types package
 */

// Lint types
export * from './lint-types';

// LLM service types  
export * from './llm-types';

// UI types
export * from './ui-types';

// Site adapter types
export * from './site-types';

// Rephrase service types
export * from './rephrase-types';

// Configuration types
export * from './config-types';

// Re-export commonly used types for convenience
export type {
  LintResult,
  LintIssue
} from './lint-types';

// Export enum as value (not type)
export { LintRuleType } from './lint-types';

export type {
  RephraseResult,
  RephraseCandidate,
  RephraseRequest,
  RephraseApproach,
  RephraseConfig,
  RephraseServiceStatus,
  IRephraseService,
  IApiKeyStorage
} from './rephrase-types';

export {
  RephraseError,
  RephraseErrorType
} from './rephrase-types';

export type {
    ExtensionUIState
} from './ui-types';