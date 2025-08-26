/**
 * Performance tests to validate <50ms requirement
 */

import { describe, it, expect } from 'vitest';
import { analyzePrompt } from '../analyzer';

describe('Performance Tests', () => {
  const generatePrompt = (length: number): string => {
    const words = [
      'implement', 'create', 'build', 'develop', 'write', 'function', 'algorithm',
      'quicksort', 'bubblesort', 'mergesort', 'binary', 'search', 'tree', 'graph',
      'python', 'javascript', 'java', 'cpp', 'typescript', 'array', 'list',
      'string', 'integer', 'object', 'data', 'structure', 'performance', 'optimization'
    ];
    
    let prompt = '';
    while (prompt.split(' ').length < length) {
      const word = words[Math.floor(Math.random() * words.length)];
      prompt += word + ' ';
    }
    return prompt.trim();
  };

  it('should analyze short prompts (<10 words) within 50ms', () => {
    const prompt = generatePrompt(8);
    
    const start = performance.now();
    const result = analyzePrompt(prompt);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(result).toBeDefined();
    expect(result.metadata?.processingTime).toBeLessThan(50);
  });

  it('should analyze medium prompts (10-50 words) within 50ms', () => {
    const prompt = generatePrompt(30);
    
    const start = performance.now();
    const result = analyzePrompt(prompt);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(result.metadata?.processingTime).toBeLessThan(50);
  });

  it('should analyze long prompts (50-200 words) within 50ms', () => {
    const prompt = generatePrompt(150);
    
    const start = performance.now();
    const result = analyzePrompt(prompt);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(result.metadata?.processingTime).toBeLessThan(50);
  });

  it('should analyze very long prompts (200+ words) within 50ms', () => {
    const prompt = generatePrompt(300);
    
    const start = performance.now();
    const result = analyzePrompt(prompt);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(result.metadata?.processingTime).toBeLessThan(50);
  });

  it('should handle 1000-character prompts within 50ms', () => {
    let prompt = '';
    while (prompt.length < 1000) {
      prompt += 'implement quicksort algorithm in python that takes array of integers and returns sorted array ';
    }
    prompt = prompt.substring(0, 999) + 'x'; // Ensure exactly 1000 chars
    
    const start = performance.now();
    const result = analyzePrompt(prompt);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(result.metadata?.processingTime).toBeLessThan(50);
    expect(result.metadata?.inputLength).toBe(1000);
  });

  it('should maintain performance with repeated analysis', () => {
    const prompt = 'implement quicksort algorithm in Python with proper error handling';
    const iterations = 100;
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      analyzePrompt(prompt);
    }
    
    const totalDuration = performance.now() - start;
    const avgDuration = totalDuration / iterations;
    
    expect(avgDuration).toBeLessThan(50);
  });

  it('should handle edge cases quickly', () => {
    const edgeCases = [
      '',
      ' ',
      'a',
      'implement',
      '!@#$%^&*()',
      'a'.repeat(10000),
      'maybe just somehow write something like quicksort or whatever basically'
    ];
    
    edgeCases.forEach(prompt => {
      const start = performance.now();
      const result = analyzePrompt(prompt);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(50);
      expect(result).toBeDefined();
    });
  });
});
