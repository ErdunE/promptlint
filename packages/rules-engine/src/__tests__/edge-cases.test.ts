/**
 * Edge case tests for the rules engine
 * Tests unusual inputs, boundary conditions, and error handling
 */

import { describe, it, expect } from 'vitest';
import { analyzePrompt } from '../analyzer';

describe('Edge Case Testing', () => {
  describe('Empty and Minimal Inputs', () => {
    it('should handle empty string', () => {
      const result = analyzePrompt('');
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
      expect(result.metadata?.inputLength).toBe(0);
      expect(result.metadata?.processingTime).toBeLessThan(50);
    });

    it('should handle whitespace-only input', () => {
      const result = analyzePrompt('   \n\t   ');
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
      expect(result.metadata?.inputLength).toBe(0);
    });

    it('should handle single character', () => {
      const result = analyzePrompt('a');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.metadata?.processingTime).toBeLessThan(50);
    });

    it('should handle single word', () => {
      const result = analyzePrompt('quicksort');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.issues).toBeDefined();
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle special characters', () => {
      const result = analyzePrompt('implement @#$%^&*()_+ algorithm!');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.metadata?.processingTime).toBeLessThan(50);
    });

    it('should handle Unicode characters', () => {
      const result = analyzePrompt('implement 快速排序 algorithm in Python');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle emojis', () => {
      const result = analyzePrompt('implement quicksort 🚀 algorithm 💻');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle mixed scripts', () => {
      const result = analyzePrompt('implement алгоритм сортировки in JavaScript');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Large Inputs', () => {
    it('should handle 1000-character input efficiently', () => {
      const longPrompt = 'implement quicksort algorithm in Python that handles arrays of integers with proper error handling and input validation and performance optimization including best-case average-case and worst-case scenarios with comprehensive documentation and unit testing and integration testing and end-to-end testing and performance benchmarking and memory profiling and security auditing and code review and continuous integration and deployment automation and monitoring and logging and alerting and disaster recovery and backup strategies and scalability planning and load balancing and caching strategies and database optimization and API design and user interface design and user experience optimization and accessibility compliance and internationalization support and localization and multi-platform compatibility and cross-browser support and mobile responsiveness and progressive web app features and offline functionality and real-time synchronization and data encryption and authentication and authorization and session management and rate limiting and API versioning and backward compatibility and forward compatibility and extensibility and maintainability and testability and debuggability and observability and traceability'.substring(0, 1000);
      
      const start = performance.now();
      const result = analyzePrompt(longPrompt);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.metadata?.inputLength).toBe(1000);
      expect(result.metadata?.processingTime).toBeLessThan(50);
    });

    it('should handle 5000-character input', () => {
      const veryLongPrompt = 'implement '.repeat(500) + 'quicksort algorithm';
      
      const start = performance.now();
      const result = analyzePrompt(veryLongPrompt);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100); // Allow slightly more time for very long inputs
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Malformed and Edge Case Inputs', () => {
    it('should handle only punctuation', () => {
      const result = analyzePrompt('!@#$%^&*()_+-=[]{}|;:,.<>?');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle only numbers', () => {
      const result = analyzePrompt('123456789');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle repeated characters', () => {
      const result = analyzePrompt('aaaaaaaaaaaaaaaaaaaaaa');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle mixed case and spacing', () => {
      const result = analyzePrompt('ImPlEmEnT    QuIcKsOrT    AlGoRiThM');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle newlines and tabs', () => {
      const result = analyzePrompt('implement\n\tquicksort\n\talgorithm\n\tin\tPython');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle null input gracefully', () => {
      const result = analyzePrompt(null as any);
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle undefined input gracefully', () => {
      const result = analyzePrompt(undefined as any);
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle non-string input gracefully', () => {
      const result = analyzePrompt(123 as any);
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
    });

    it('should handle object input gracefully', () => {
      const result = analyzePrompt({ test: 'value' } as any);
      expect(result.score).toBe(0);
      expect(result.suggestions).toBeDefined();
    });
  });
});
