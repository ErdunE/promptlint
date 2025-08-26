/**
 * Main analysis function - the primary entry point for prompt analysis
 */

import { LintResult } from '@promptlint/shared-types';
import { LintEngine } from './engine';

/**
 * Analyzes a prompt and returns structured lint results
 * 
 * This is the main entry point for the rules engine. It must complete
 * analysis within 50ms for prompts up to 1000 characters.
 * 
 * @param input - Raw user prompt text (1-10,000 characters)
 * @returns Complete lint analysis with score, issues, and metadata
 * 
 * @example
 * ```typescript
 * const result = analyzePrompt("write a quicksort");
 * console.log(result.score); // 35
 * console.log(result.issues.length); // 3
 * ```
 */
export function analyzePrompt(input: string): LintResult {
  const startTime = performance.now();
  
  // Input validation
  if (!input || typeof input !== 'string') {
    return {
      score: 0,
      issues: [],
      suggestions: ['Please provide a valid prompt text'],
      metadata: {
        processingTime: performance.now() - startTime,
        inputLength: 0,
        timestamp: new Date()
      }
    };
  }

  // Trim whitespace but preserve internal structure
  const trimmedInput = input.trim();
  
  if (trimmedInput.length === 0) {
    return {
      score: 0,
      issues: [],
      suggestions: ['Please provide a non-empty prompt'],
      metadata: {
        processingTime: performance.now() - startTime,
        inputLength: 0,
        timestamp: new Date()
      }
    };
  }

  // Create engine instance and analyze
  const engine = new LintEngine();
  const result = engine.analyze(trimmedInput);
  
  // Add metadata
  result.metadata = {
    processingTime: performance.now() - startTime,
    inputLength: trimmedInput.length,
    timestamp: new Date()
  };

  return result;
}
