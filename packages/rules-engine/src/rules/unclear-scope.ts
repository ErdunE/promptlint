/**
 * Rule: Unclear Scope
 * 
 * Detects prompts where task boundaries are undefined or ambiguous.
 * Helps ensure the AI understands exactly what should and shouldn't be included.
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index.js';

/**
 * Indicators of overly broad or undefined scope
 */
const BROAD_SCOPE_INDICATORS = [
  'everything', 'anything', 'all', 'any', 'complete', 'full', 'entire', 'whole',
  'comprehensive', 'total', 'overall', 'general', 'generic', 'universal'
];

/**
 * Vague task descriptors that don't define clear boundaries
 */
const VAGUE_TASK_DESCRIPTORS = [
  'system', 'solution', 'program', 'app', 'application', 'tool', 'utility',
  'framework', 'platform', 'service', 'component', 'module', 'library',
  'bug', 'issue', 'problem', 'error', 'thing', 'stuff', 'it', 'something', 'anything'
];

/**
 * Words that indicate unclear requirements
 */
const UNCLEAR_REQUIREMENT_WORDS = [
  'best', 'good', 'better', 'optimal', 'efficient', 'fast', 'simple', 'easy',
  'nice', 'clean', 'proper', 'correct', 'right', 'appropriate', 'suitable'
];

/**
 * Vague references that indicate unclear scope
 */
const VAGUE_REFERENCES = [
  'this', 'that', 'these', 'those', 'the above', 'the following'
];

/**
 * Scope clarifiers that indicate well-defined boundaries
 */
const SCOPE_CLARIFIERS = [
  'only', 'just', 'specifically', 'exactly', 'precisely', 'limited to',
  'excluding', 'without', 'except', 'focus on', 'concentrate on',
  'single', 'one', 'basic', 'minimal', 'simple version'
];

export class UnclearScopeRule implements LintRule {
  type = LintRuleType.UNCLEAR_SCOPE;
  name = 'Unclear Scope';
  description = 'Detects prompts with undefined or overly broad task boundaries';

  analyze(input: string): RuleAnalysisResult {
    const cleanInput = input.toLowerCase().trim();
    const issues: string[] = [];
    
    // Check for overly broad scope indicators
    const broadScopeFound = BROAD_SCOPE_INDICATORS.some(indicator => {
      const patterns = [
        new RegExp(`\\b${indicator}\\b`),
        new RegExp(`\\bthe ${indicator}\\b`),
        new RegExp(`\\ban? ${indicator}\\b`)
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });
    
    if (broadScopeFound) {
      issues.push('overly broad scope');
    }
    
    // Check for vague task descriptors without specificity
    const hasVagueDescriptor = VAGUE_TASK_DESCRIPTORS.some(descriptor => {
      const pattern = new RegExp(`\\b${descriptor}\\b`);
      return pattern.test(cleanInput);
    });
    
    // Check if vague descriptors are accompanied by clarifiers OR specific context
    const hasScopeClarifier = SCOPE_CLARIFIERS.some(clarifier => {
      const pattern = new RegExp(`\\b${clarifier}\\b`);
      return pattern.test(cleanInput);
    });
    
    // Check for specific algorithms/data structures that provide context
    const hasSpecificContext = [
      'merge sort', 'quicksort', 'binary search', 'linked list', 'binary tree',
      'hash table', 'stack', 'queue', 'graph', 'fibonacci', 'factorial'
    ].some(context => cleanInput.includes(context.toLowerCase()));
    
    if (hasVagueDescriptor && !hasScopeClarifier && !hasSpecificContext) {
      issues.push('vague task descriptor without scope clarification');
    }
    
    // Check for unclear quality requirements
    const hasUnclearRequirements = UNCLEAR_REQUIREMENT_WORDS.some(word => {
      const patterns = [
        new RegExp(`\\bmake it ${word}\\b`),
        new RegExp(`\\bshould be ${word}\\b`),
        new RegExp(`\\bneeds to be ${word}\\b`),
        new RegExp(`\\bhas to be ${word}\\b`)
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });
    
    // Check for vague references separately (but not when used as proper relative pronouns)
    const hasVagueReferences = VAGUE_REFERENCES.some(ref => {
      if (ref === 'that') {
        // "that" is only vague when not used as a relative pronoun
        const vaguePatterns = [
          /\bdebug that\b/, /\bfix that\b/, /\boptimize that\b/, 
          /\bimprove that\b/, /\bupdate that\b/, /\bthat\s+(bug|error|issue|problem)\b/
        ];
        return vaguePatterns.some(pattern => pattern.test(cleanInput));
      } else {
        const pattern = new RegExp(`\\b${ref}\\b`);
        return pattern.test(cleanInput);
      }
    });
    
    if (hasUnclearRequirements) {
      issues.push('unclear quality requirements');
    }
    
    if (hasVagueReferences) {
      issues.push('vague references');
    }
    
    // Check for very short prompts that are likely too vague (only if they don't have clear task indicators)
    const words = cleanInput.split(/\s+/).filter(word => word.length > 0);
    const hasSpecificTask = ['quicksort', 'bubblesort', 'mergesort', 'binary search', 'factorial', 'fibonacci'].some(task => 
      cleanInput.includes(task.toLowerCase())
    );
    if (words.length <= 2 && !hasScopeClarifier && !hasSpecificTask) {
      issues.push('insufficient detail for scope definition');
    }
    
    // No scope issues found
    if (issues.length === 0) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Generate message based on issues found
    const issueList = issues.join(', ');
    
    return {
      hasIssue: true,
      message: `Task scope unclear: ${issueList}`,
      suggestion: 'Define specific boundaries for what should be included/excluded in the task'
    };
  }
}
