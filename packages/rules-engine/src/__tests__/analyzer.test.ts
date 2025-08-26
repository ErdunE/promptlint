/**
 * Tests for the main analyzer function
 * Based on Product Spec Section 8 acceptance criteria
 */

import { describe, it, expect } from 'vitest';
import { analyzePrompt } from '../analyzer';
import { LintRuleType } from '@promptlint/shared-types';

describe('analyzePrompt', () => {
  describe('Product Spec Acceptance Criteria Tests', () => {
    it('should score "write quicksort" in range 20-40 with missing_language and missing_io issues', () => {
      const result = analyzePrompt('write quicksort');
      
      expect(result.score).toBeGreaterThanOrEqual(20);
      expect(result.score).toBeLessThanOrEqual(40);
      
      const issueTypes = result.issues.map(issue => issue.type);
      expect(issueTypes).toContain(LintRuleType.MISSING_LANGUAGE);
      expect(issueTypes).toContain(LintRuleType.MISSING_IO_SPECIFICATION);
    });

    it('should score well-structured Python quicksort prompt in range 85-100 with no issues', () => {
      const result = analyzePrompt('implement quicksort in Python, input array → sorted array');
      
      expect(result.score).toBeGreaterThanOrEqual(85);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.issues).toHaveLength(0);
    });

    it('should score vague prompt "maybe write something like quicksort somehow" in range 10-25', () => {
      const result = analyzePrompt('maybe write something like quicksort somehow');
      
      expect(result.score).toBeGreaterThanOrEqual(10);
      expect(result.score).toBeLessThanOrEqual(25);
      
      const issueTypes = result.issues.map(issue => issue.type);
      expect(issueTypes).toContain(LintRuleType.VAGUE_WORDING);
    });
  });

  describe('Input Validation', () => {
    it('should handle empty string input', () => {
      const result = analyzePrompt('');
      
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
      expect(result.metadata?.inputLength).toBe(0);
    });

    it('should handle null/undefined input gracefully', () => {
      const result = analyzePrompt(null as any);
      
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
    });

    it('should handle whitespace-only input', () => {
      const result = analyzePrompt('   \n\t   ');
      
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('Metadata Generation', () => {
    it('should include processing time metadata', () => {
      const result = analyzePrompt('write a function');
      
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.processingTime).toBeGreaterThan(0);
      expect(result.metadata!.processingTime).toBeLessThan(50); // Performance requirement
    });

    it('should include input length metadata', () => {
      const input = 'implement quicksort algorithm';
      const result = analyzePrompt(input);
      
      expect(result.metadata!.inputLength).toBe(input.length);
    });

    it('should include timestamp metadata', () => {
      const result = analyzePrompt('write a function');
      
      expect(result.metadata!.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Performance Requirements', () => {
    it('should complete analysis within 50ms for short prompts', () => {
      const start = performance.now();
      analyzePrompt('write a quicksort function in Python');
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
    });

    it('should complete analysis within 50ms for medium prompts', () => {
      const mediumPrompt = 'implement a quicksort algorithm in Python that takes an array of integers as input and returns a sorted array as output with proper error handling';
      
      const start = performance.now();
      analyzePrompt(mediumPrompt);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
    });

    it('should complete analysis within 50ms for long prompts', () => {
      const longPrompt = 'implement a comprehensive quicksort algorithm in Python that can handle arrays of integers, strings, and custom objects with proper error handling, input validation, and performance optimization including best-case, average-case, and worst-case scenarios with detailed documentation and unit tests'.repeat(3);
      
      const start = performance.now();
      analyzePrompt(longPrompt);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
    });
  });
});
