import { describe, test, expect, beforeEach } from 'vitest';
import { DomainClassifier } from '../src/DomainClassifier.js';
import { DomainType } from '../src/types/DomainTypes.js';
import { DOMAIN_TEST_CASES, TEST_CASE_STATS } from './accuracy/domain-test-cases.js';

describe('DomainClassifier', () => {
  let classifier: DomainClassifier;

  beforeEach(async () => {
    classifier = new DomainClassifier();
    await classifier.initialize();
  });

  describe('Basic Functionality', () => {
    test('should classify code domain prompts correctly', () => {
      const result = classifier.classifyDomain('implement binary search algorithm');
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test('should classify writing domain prompts correctly', () => {
      const result = classifier.classifyDomain('write blog post about productivity');
      expect(result.domain).toBe(DomainType.WRITING);
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test('should classify analysis domain prompts correctly', () => {
      const result = classifier.classifyDomain('analyze market trends data');
      expect(result.domain).toBe(DomainType.ANALYSIS);
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test('should classify research domain prompts correctly', () => {
      const result = classifier.classifyDomain('research best practices for security');
      expect(result.domain).toBe(DomainType.RESEARCH);
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test('should handle empty prompts gracefully', () => {
      const result = classifier.classifyDomain('');
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.confidence).toBe(50);
      expect(result.indicators).toEqual(['empty prompt']);
    });

    test('should handle null/undefined prompts gracefully', () => {
      const result = classifier.classifyDomain(null as any);
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.confidence).toBe(50);
    });
  });

  describe('Performance Requirements', () => {
    test('should complete classification within 20ms', () => {
      const testPrompts = [
        'implement quicksort algorithm',
        'write blog post about technology',
        'analyze customer satisfaction data',
        'research machine learning approaches'
      ];

      testPrompts.forEach(prompt => {
        const result = classifier.classifyDomain(prompt);
        expect(result.processingTime).toBeLessThan(20);
      });
    });

    test('should have consistent performance across multiple classifications', () => {
      const prompt = 'implement user authentication system';
      const results = [];

      // Run multiple classifications
      for (let i = 0; i < 10; i++) {
        results.push(classifier.classifyDomain(prompt));
      }

      // All should complete within 20ms
      results.forEach(result => {
        expect(result.processingTime).toBeLessThan(20);
      });

      // Results should be consistent
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.domain).toBe(firstResult.domain);
        expect(result.confidence).toBe(firstResult.confidence);
      });
    });
  });

  describe('Accuracy Validation', () => {
    test('should achieve 85%+ accuracy on validation dataset', () => {
      let correct = 0;
      let total = DOMAIN_TEST_CASES.length;

      DOMAIN_TEST_CASES.forEach(testCase => {
        const result = classifier.classifyDomain(testCase.prompt);
        if (result.domain === testCase.expected && result.confidence >= testCase.minConfidence) {
          correct++;
        }
      });

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThanOrEqual(0.85);
    });

    test('should achieve high accuracy for each domain individually', () => {
      const domains = [DomainType.CODE, DomainType.WRITING, DomainType.ANALYSIS, DomainType.RESEARCH];
      
      domains.forEach(domain => {
        const domainTestCases = DOMAIN_TEST_CASES.filter(tc => tc.expected === domain);
        let correct = 0;

        domainTestCases.forEach(testCase => {
          const result = classifier.classifyDomain(testCase.prompt);
          if (result.domain === testCase.expected && result.confidence >= testCase.minConfidence) {
            correct++;
          }
        });

        const accuracy = correct / domainTestCases.length;
        expect(accuracy).toBeGreaterThanOrEqual(0.80); // 80% minimum per domain
      });
    });
  });

  describe('Configuration', () => {
    test('should use default configuration', () => {
      const config = classifier.getConfig();
      expect(config.minConfidence).toBe(20);
      expect(config.maxProcessingTime).toBe(20);
      expect(config.enablePerformanceLogging).toBe(false);
    });

    test('should allow configuration updates', () => {
      classifier.updateConfig({
        minConfidence: 70,
        enablePerformanceLogging: true
      });

      const config = classifier.getConfig();
      expect(config.minConfidence).toBe(70);
      expect(config.enablePerformanceLogging).toBe(true);
      expect(config.maxProcessingTime).toBe(20); // Should remain unchanged
    });

    test('should respect minimum confidence threshold', () => {
      classifier.updateConfig({ minConfidence: 90 });
      
      const result = classifier.classifyDomain('ambiguous prompt');
      expect(result.confidence).toBeGreaterThanOrEqual(20); // Should default to minimum
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long prompts', () => {
      const longPrompt = 'implement a complex algorithm that handles multiple data structures and performs various operations including sorting, searching, and filtering with advanced optimization techniques and error handling mechanisms';
      const result = classifier.classifyDomain(longPrompt);
      
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.processingTime).toBeLessThan(20);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle prompts with special characters', () => {
      const specialPrompt = 'implement @#$%^&*() algorithm with [brackets] and {braces}';
      const result = classifier.classifyDomain(specialPrompt);
      
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.processingTime).toBeLessThan(20);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle mixed case prompts', () => {
      const mixedCasePrompt = 'IMPLEMENT Binary Search Algorithm';
      const result = classifier.classifyDomain(mixedCasePrompt);
      
      expect(result.domain).toBe(DomainType.CODE);
      expect(result.processingTime).toBeLessThan(20);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Test Case Statistics', () => {
    test('should have balanced test cases across domains', () => {
      expect(TEST_CASE_STATS.total).toBeGreaterThan(80);
      expect(TEST_CASE_STATS.byDomain[DomainType.CODE]).toBeGreaterThan(20);
      expect(TEST_CASE_STATS.byDomain[DomainType.WRITING]).toBeGreaterThan(20);
      expect(TEST_CASE_STATS.byDomain[DomainType.ANALYSIS]).toBeGreaterThan(20);
      expect(TEST_CASE_STATS.byDomain[DomainType.RESEARCH]).toBeGreaterThan(20);
    });
  });
});
