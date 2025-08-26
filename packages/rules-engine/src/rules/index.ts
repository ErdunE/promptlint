/**
 * Rule system exports and registry
 */

import { LintRuleType } from '@promptlint/shared-types';

/**
 * Result of analyzing a prompt with a single rule
 */
export interface RuleAnalysisResult {
  /** Whether this rule found an issue */
  hasIssue: boolean;
  /** Human-readable message describing the issue */
  message: string;
  /** Optional suggestion for improvement */
  suggestion?: string;
  /** Optional position highlighting in the text */
  position?: {
    start: number;
    end: number;
  };
}

/**
 * Base interface for all lint rules
 */
export interface LintRule {
  /** Rule type identifier */
  type: LintRuleType;
  /** Human-readable rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Analyze a prompt and return result */
  analyze(input: string): RuleAnalysisResult;
}

// Import all rule implementations
import { MissingTaskVerbRule } from './missing-task-verb';
import { MissingLanguageRule } from './missing-language';
import { MissingIOSpecificationRule } from './missing-io-specification';
import { VagueWordingRule } from './vague-wording';
import { UnclearScopeRule } from './unclear-scope';
import { RedundantLanguageRule } from './redundant-language';

// Export individual rules
export { MissingTaskVerbRule } from './missing-task-verb';
export { MissingLanguageRule } from './missing-language';
export { MissingIOSpecificationRule } from './missing-io-specification';
export { VagueWordingRule } from './vague-wording';
export { UnclearScopeRule } from './unclear-scope';
export { RedundantLanguageRule } from './redundant-language';

/**
 * Get all available lint rules
 * 
 * @returns Array of all implemented lint rules
 */
export function getAllRules(): LintRule[] {
  return [
    new MissingTaskVerbRule(),
    new MissingLanguageRule(),
    new MissingIOSpecificationRule(),
    new VagueWordingRule(),
    new UnclearScopeRule(),
    new RedundantLanguageRule()
  ];
}

/**
 * Get a specific rule by type
 * 
 * @param type - The rule type to retrieve
 * @returns The rule instance or undefined if not found
 */
export function getRule(type: LintRuleType): LintRule | undefined {
  return getAllRules().find(rule => rule.type === type);
}
