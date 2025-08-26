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

// Configuration types
export * from './config-types';

// Re-export commonly used types for convenience
export type {
  LintResult,
  LintIssue,
  LintRuleType
} from './lint-types';

export type {
  RephraseResult,
  RephraseCandidate
} from './llm-types';

export type {
    ExtensionUIState
} from './ui-types';