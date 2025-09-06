/**
 * PromptLint Rules Engine - Core Analysis Package
 * 
 * This package provides the core lint analysis functionality for PromptLint.
 * It analyzes prompts and returns structured lint results with issues and scores.
 * 
 * Performance Requirement: All analysis must complete within 50ms
 * 
 * @packageDocumentation
 */

export { analyzePrompt } from './analyzer.js';
export { LintEngine } from './engine.js';
export * from './rules/index.js';
export * from './scoring.js';
export * from './utils.js';

// Re-export commonly used types from shared-types
export type {
  LintResult,
  LintIssue,
  LintRuleType,
  LintIssueSeverity,
  LintEngineConfig
} from '@promptlint/shared-types';
