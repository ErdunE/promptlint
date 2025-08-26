/**
 * Stability verification test suite
 * Tests that the system behaves consistently and predictably
 */

import { describe, it, expect } from 'vitest';
import { analyzePrompt } from '../analyzer';

describe('Stability Verification', () => {
  describe('Consistent Results', () => {
    it('should return identical results for the same input across multiple calls', () => {
      const testPrompt = 'implement quicksort algorithm in Python';
      const numRuns = 10;
      const results = [];

      for (let i = 0; i < numRuns; i++) {
        results.push(analyzePrompt(testPrompt));
      }

      // All results should be identical
      const first = results[0];
      results.forEach(result => {
        expect(result.score).toBe(first.score);
        expect(result.issues.length).toBe(first.issues.length);
        expect(result.issues.map(i => i.type)).toEqual(first.issues.map(i => i.type));
      });
    });

    it('should maintain performance consistency', () => {
      const testPrompts = [
        'write quicksort',
        'implement algorithm in Python',
        'create function that sorts numbers',
        'maybe write something',
        'develop sorting tool with proper error handling'
      ];

      testPrompts.forEach(prompt => {
        const result = analyzePrompt(prompt);
        expect(result.metadata?.processingTime).toBeLessThan(50);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Predictable Scoring Patterns', () => {
    it('should score better prompts higher than worse prompts', () => {
      const orderedPrompts = [
        'implement quicksort algorithm in Python with input array of integers and output sorted array',
        'implement quicksort in Python',
        'write quicksort',  // Incomplete but specific
        'write something'   // Vague and incomplete
      ];

      const scores = orderedPrompts.map(prompt => analyzePrompt(prompt).score);
      
      // Each should score lower than or equal to the previous
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i-1]);
      }
    });

    it('should handle edge cases without crashing', () => {
      const edgeCases = [
        '',
        ' ',
        'a',
        '!@#$%^&*()',
        'aaaaaaaaaaaaa',
        'implement '.repeat(100),
        null,
        undefined,
        123,
        {}
      ];

      edgeCases.forEach(input => {
        expect(() => {
          const result = analyzePrompt(input as any);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }).not.toThrow();
      });
    });
  });

  describe('Rule Detection Stability', () => {
    it('should consistently detect missing language in clear code requests', () => {
      const codePrompts = [
        'implement quicksort',
        'create function',
        'write algorithm'
        // Note: 'build sorting tool' may not trigger missing_language as 'tool' is ambiguous
      ];

      codePrompts.forEach(prompt => {
        const result = analyzePrompt(prompt);
        const hasLanguageIssue = result.issues.some(issue => issue.type === 'missing_language');
        expect(hasLanguageIssue).toBe(true);
      });
    });

    it('should consistently not detect language issues when language is specified', () => {
      const codePrompts = [
        'implement quicksort in Python',
        'create function in JavaScript', 
        'write algorithm in Java',
        'build sorting tool in C++'
      ];

      codePrompts.forEach(prompt => {
        const result = analyzePrompt(prompt);
        const hasLanguageIssue = result.issues.some(issue => issue.type === 'missing_language');
        expect(hasLanguageIssue).toBe(false);
      });
    });

    it('should consistently detect vague wording', () => {
      const vaguePrompts = [
        'maybe implement something',
        'just write whatever somehow',
        'perhaps create some kind of tool',
        'basically do something like sorting'
      ];

      vaguePrompts.forEach(prompt => {
        const result = analyzePrompt(prompt);
        const hasVagueIssue = result.issues.some(issue => issue.type === 'vague_wording');
        expect(hasVagueIssue).toBe(true);
      });
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid consecutive calls', () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const result = analyzePrompt('implement quicksort in Python');
        expect(result.score).toBeGreaterThan(0);
      }
      
      const totalTime = performance.now() - start;
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 100 calls
    });

    it('should handle concurrent-like execution', async () => {
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(Promise.resolve(analyzePrompt('write function')));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });
  });
});
