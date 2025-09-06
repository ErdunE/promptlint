/**
 * Rule: Missing Task Verb
 * 
 * Detects prompts that lack clear action verbs indicating what the AI should do.
 * Based on Product Spec requirement for explicit task statements.
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index.js';

/**
 * Clear action verbs that indicate specific tasks
 */
const TASK_VERBS = [
  // Primary implementation verbs
  'implement', 'create', 'build', 'develop', 'write', 'code', 'generate',
  
  // Analysis/explanation verbs  
  'explain', 'describe', 'analyze', 'review', 'document',
  
  // Debugging verbs
  'debug', 'fix', 'solve', 'resolve', 'troubleshoot',
  
  // Transformation verbs
  'convert', 'transform', 'refactor', 'optimize', 'improve',
  
  // Testing verbs
  'test', 'validate', 'verify', 'check',
  
  // Other specific actions
  'design', 'plan', 'outline', 'demonstrate', 'provide'
];

/**
 * Weak or vague verbs that don't clearly indicate the task
 */
const WEAK_VERBS = [
  'make', 'do', 'get', 'have', 'use', 'work', 'help', 'give', 'tell', 'show', 'find'
];

export class MissingTaskVerbRule implements LintRule {
  type = LintRuleType.MISSING_TASK_VERB;
  name = 'Missing Task Verb';
  description = 'Detects prompts without clear action verbs indicating what should be done';

  analyze(input: string): RuleAnalysisResult {
    const cleanInput = input.toLowerCase().trim();
    
    // Check for clear task verbs
    const hasStrongVerb = TASK_VERBS.some(verb => {
      // Look for verb at start of sentence or after common prefixes
      const patterns = [
        new RegExp(`^${verb}\\b`), // At the beginning
        new RegExp(`\\b${verb}\\b`), // Anywhere in the text
        new RegExp(`^(please |can you |could you |i need to |i want to |help me )?${verb}\\b`)
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });

    if (hasStrongVerb) {
      return {
        hasIssue: false,
        message: ''
      };
    }

    // Check for weak verbs only
    const hasWeakVerb = WEAK_VERBS.some(verb => {
      const pattern = new RegExp(`\\b${verb}\\b`);
      return pattern.test(cleanInput);
    });

    if (hasWeakVerb) {
      return {
        hasIssue: true,
        message: 'Task verb is unclear - specify a precise action like "implement", "debug", or "explain"',
        suggestion: 'Use specific action verbs: implement, create, debug, explain, analyze, etc.'
      };
    }

    // No clear task verb found
    return {
      hasIssue: true,
      message: 'No clear task verb found - specify what action should be taken',
      suggestion: 'Start with a clear action verb like "implement", "create", "debug", or "explain"'
    };
  }
}
