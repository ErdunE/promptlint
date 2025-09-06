/**
 * Rule: Redundant Language
 * 
 * Detects unnecessary repetition, filler words, and verbose expressions
 * that can be simplified without losing meaning.
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index.js';

/**
 * Common filler words that add no value
 */
const FILLER_WORDS = [
  'really', 'very', 'quite', 'rather', 'pretty', 'fairly', 'somewhat', 'actually',
  'basically', 'essentially', 'literally', 'definitely', 'absolutely', 'totally',
  'completely', 'entirely', 'obviously', 'clearly', 'certainly', 'surely'
];

/**
 * Redundant phrases that can be simplified
 */
const REDUNDANT_PHRASES = [
  { phrase: 'in order to', replacement: 'to' },
  { phrase: 'due to the fact that', replacement: 'because' },
  { phrase: 'at this point in time', replacement: 'now' },
  { phrase: 'for the purpose of', replacement: 'to' },
  { phrase: 'with regard to', replacement: 'regarding' },
  { phrase: 'in the event that', replacement: 'if' },
  { phrase: 'it is important to note that', replacement: '' },
  { phrase: 'please note that', replacement: '' },
  { phrase: 'i would like to', replacement: 'i want to' },
  { phrase: 'could you please', replacement: 'please' },
  { phrase: 'would you mind', replacement: 'please' },
  { phrase: 'if you could', replacement: 'please' }
];

/**
 * Verbose expressions that can be shortened
 */
const VERBOSE_EXPRESSIONS = [
  { expression: 'make use of', replacement: 'use' },
  { expression: 'give consideration to', replacement: 'consider' },
  { expression: 'put emphasis on', replacement: 'emphasize' },
  { expression: 'take into account', replacement: 'consider' },
  { expression: 'come to the conclusion', replacement: 'conclude' },
  { expression: 'make a decision', replacement: 'decide' },
  { expression: 'carry out', replacement: 'do' },
  { expression: 'bring to completion', replacement: 'complete' }
];

export class RedundantLanguageRule implements LintRule {
  type = LintRuleType.REDUNDANT_LANGUAGE;
  name = 'Redundant Language';
  description = 'Detects unnecessary repetition, filler words, and verbose expressions';

  analyze(input: string): RuleAnalysisResult {
    const cleanInput = input.toLowerCase().trim();
    const issues: string[] = [];
    let redundancyCount = 0;
    
    // Check for filler words
    const fillerWords = FILLER_WORDS.filter(word => {
      const pattern = new RegExp(`\\b${word}\\b`, 'g');
      const matches = cleanInput.match(pattern);
      return matches && matches.length > 0;
    });
    
    if (fillerWords.length > 0) {
      issues.push(`filler words: ${fillerWords.slice(0, 3).join(', ')}`);
      redundancyCount += fillerWords.length;
    }
    
    // Check for redundant phrases
    const foundRedundantPhrases = REDUNDANT_PHRASES.filter(({ phrase }) => {
      return cleanInput.includes(phrase.toLowerCase());
    });
    
    if (foundRedundantPhrases.length > 0) {
      issues.push('redundant phrases');
      redundancyCount += foundRedundantPhrases.length;
    }
    
    // Check for verbose expressions
    const foundVerboseExpressions = VERBOSE_EXPRESSIONS.filter(({ expression }) => {
      return cleanInput.includes(expression.toLowerCase());
    });
    
    if (foundVerboseExpressions.length > 0) {
      issues.push('verbose expressions');
      redundancyCount += foundVerboseExpressions.length;
    }
    
    // Check for word repetition (same word used multiple times close together)
    const words = cleanInput.split(/\s+/).filter(word => word.length > 3);
    const wordCounts: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const repeatedWords = Object.entries(wordCounts)
      .filter(([_, count]) => count > 2)
      .map(([word]) => word);
    
    if (repeatedWords.length > 0) {
      issues.push('repeated words');
      redundancyCount += repeatedWords.length;
    }
    
    // Check for excessive politeness/courtesy
    const courtesyWords = ['please', 'thank you', 'thanks', 'appreciate', 'grateful'];
    const courtesyCount = courtesyWords.reduce((count, word) => {
      const matches = cleanInput.match(new RegExp(`\\b${word}\\b`, 'g'));
      return count + (matches ? matches.length : 0);
    }, 0);
    
    if (courtesyCount > 2) {
      issues.push('excessive courtesy language');
      redundancyCount += courtesyCount - 2;
    }
    
    // No redundancy issues found
    if (issues.length === 0) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Only flag if there's significant redundancy (but always flag redundant phrases)
    if (redundancyCount < 2 && foundRedundantPhrases.length === 0) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    const issueList = issues.slice(0, 2).join(', '); // Limit to first 2 issues
    
    return {
      hasIssue: true,
      message: `Redundant language detected: ${issueList}`,
      suggestion: 'Remove unnecessary words and simplify expressions for clarity'
    };
  }
}
