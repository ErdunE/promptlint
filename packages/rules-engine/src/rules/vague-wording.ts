/**
 * Rule: Vague Wording
 * 
 * Detects vague terms that make prompts unclear and ambiguous.
 * Based on Product Spec examples: "just", "maybe", "somehow", "something like"
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index.js';

/**
 * Vague words and phrases that should be avoided in prompts
 */
const VAGUE_TERMS = [
  // Primary vague terms from Product Spec
  { term: 'just', replacement: 'specifically' },
  { term: 'maybe', replacement: 'optionally' },
  { term: 'somehow', replacement: 'using a specific method' },
  { term: 'something like', replacement: 'similar to' },
  
  // Additional vague terms
  { term: 'kind of', replacement: 'type of' },
  { term: 'sort of', replacement: 'type of' },
  { term: 'pretty much', replacement: 'essentially' },
  { term: 'basically', replacement: 'specifically' },
  { term: 'probably', replacement: 'likely' },
  { term: 'might', replacement: 'could' },
  { term: 'stuff', replacement: 'items' },
  { term: 'things', replacement: 'elements' },
  { term: 'whatever', replacement: 'any appropriate' },
  { term: 'some kind of', replacement: 'a specific type of' },
  { term: 'or something', replacement: 'or similar' },
  { term: 'and stuff', replacement: 'and related items' }
];

/**
 * Hedge words that weaken prompts
 */
const HEDGE_WORDS = [
  'perhaps', 'possibly', 'presumably', 'supposedly', 'apparently', 'seemingly',
  'roughly', 'approximately', 'about', 'around', 'kinda', 'sorta'
];

export class VagueWordingRule implements LintRule {
  type = LintRuleType.VAGUE_WORDING;
  name = 'Vague Wording';
  description = 'Detects vague terms that make prompts unclear and ambiguous';

  analyze(input: string): RuleAnalysisResult {
    const foundVagueTerms: string[] = [];
    const positions: Array<{start: number, end: number}> = [];
    
    // Check for vague terms and phrases
    for (const { term } of VAGUE_TERMS) {
      const regex = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(input)) !== null) {
        foundVagueTerms.push(term);
        positions.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }
    
    // Check for hedge words
    for (const word of HEDGE_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(input)) !== null) {
        foundVagueTerms.push(word);
        positions.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }
    
    if (foundVagueTerms.length === 0) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Create message with found terms
    const uniqueTerms = [...new Set(foundVagueTerms)];
    const termsList = uniqueTerms.map(term => `"${term}"`).join(', ');
    
    const result: RuleAnalysisResult = {
      hasIssue: true,
      message: `Vague terms detected: ${termsList}`,
      suggestion: 'Replace vague terms with specific, precise language'
    };
    
    if (positions.length > 0) {
      result.position = positions[0];
    }
    
    return result;
  }
}
