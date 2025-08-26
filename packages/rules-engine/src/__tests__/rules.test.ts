/**
 * Tests for individual lint rules
 */

import { describe, it, expect } from 'vitest';
import {
  MissingTaskVerbRule,
  MissingLanguageRule,
  MissingIOSpecificationRule,
  VagueWordingRule,
  UnclearScopeRule,
  RedundantLanguageRule
} from '../rules';

describe('Individual Rule Tests', () => {
  describe('MissingTaskVerbRule', () => {
    const rule = new MissingTaskVerbRule();

    it('should detect missing task verb', () => {
      const result = rule.analyze('quicksort algorithm');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('No clear task verb found');
    });

    it('should detect weak task verbs', () => {
      const result = rule.analyze('make a sorting function');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Task verb is unclear');
    });

    it('should accept clear task verbs', () => {
      const inputs = [
        'implement quicksort',
        'create a function',
        'debug this code',
        'explain the algorithm',
        'analyze the performance'
      ];

      inputs.forEach(input => {
        const result = rule.analyze(input);
        expect(result.hasIssue).toBe(false);
      });
    });
  });

  describe('MissingLanguageRule', () => {
    const rule = new MissingLanguageRule();

    it('should detect missing language in code requests', () => {
      const result = rule.analyze('implement quicksort function');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Programming language not specified');
    });

    it('should accept specified languages', () => {
      const inputs = [
        'implement quicksort in Python',
        'create a JavaScript function',
        'write C++ code',
        'build a Java application'
      ];

      inputs.forEach(input => {
        const result = rule.analyze(input);
        expect(result.hasIssue).toBe(false);
      });
    });

    it('should skip non-code requests', () => {
      const result = rule.analyze('explain the concept of recursion');
      expect(result.hasIssue).toBe(false);
    });
  });

  describe('MissingIOSpecificationRule', () => {
    const rule = new MissingIOSpecificationRule();

    it('should detect missing I/O specification', () => {
      const result = rule.analyze('implement sorting function');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Input and output formats not specified');
    });

    it('should detect missing input only', () => {
      const result = rule.analyze('function that returns sorted array');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Input format not specified');
    });

    it('should detect missing output only', () => {
      const result = rule.analyze('function that takes array of integers');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Output format not specified');
    });

    it('should accept complete I/O specification', () => {
      const result = rule.analyze('function that takes array of integers and returns sorted array');
      expect(result.hasIssue).toBe(false);
    });
  });

  describe('VagueWordingRule', () => {
    const rule = new VagueWordingRule();

    it('should detect vague terms from Product Spec', () => {
      const testCases = [
        { input: 'just write a function', expectedTerm: 'just' },
        { input: 'maybe implement sorting', expectedTerm: 'maybe' },
        { input: 'make it work somehow', expectedTerm: 'somehow' },
        { input: 'something like quicksort', expectedTerm: 'something like' }
      ];

      testCases.forEach(({ input, expectedTerm }) => {
        const result = rule.analyze(input);
        expect(result.hasIssue).toBe(true);
        expect(result.message).toContain(expectedTerm);
      });
    });

    it('should detect hedge words', () => {
      const result = rule.analyze('perhaps you could probably implement this');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('Vague terms detected');
    });

    it('should accept precise language', () => {
      const result = rule.analyze('implement quicksort algorithm in Python');
      expect(result.hasIssue).toBe(false);
    });
  });

  describe('UnclearScopeRule', () => {
    const rule = new UnclearScopeRule();

    it('should detect overly broad scope', () => {
      const result = rule.analyze('create a complete application');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('overly broad scope');
    });

    it('should detect vague task descriptors', () => {
      const result = rule.analyze('build a system');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('vague task descriptor');
    });

    it('should detect insufficient detail', () => {
      const result = rule.analyze('write code');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('insufficient detail');
    });

    it('should accept well-scoped requests', () => {
      const result = rule.analyze('implement only the quicksort algorithm');
      expect(result.hasIssue).toBe(false);
    });
  });

  describe('RedundantLanguageRule', () => {
    const rule = new RedundantLanguageRule();

    it('should detect filler words', () => {
      const result = rule.analyze('really very basically implement this function');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('filler words');
    });

    it('should detect redundant phrases', () => {
      const result = rule.analyze('in order to implement this function');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('redundant phrases');
    });

    it('should detect verbose expressions', () => {
      const result = rule.analyze('make use of the algorithm to carry out the task');
      expect(result.hasIssue).toBe(true);
      expect(result.message).toContain('verbose expressions');
    });

    it('should accept concise language', () => {
      const result = rule.analyze('implement quicksort algorithm');
      expect(result.hasIssue).toBe(false);
    });
  });
});
