/**
 * Advanced fallback selector strategies
 * Provides intelligent fallback logic when primary selectors fail
 */

import { ElementSelector, AdapterError, AdapterErrorType } from '../types';
import { isElementVisible, isElementInteractable } from './dom-utils';

/**
 * Fallback strategy configuration
 */
export interface FallbackStrategy {
  /** Maximum number of attempts per selector */
  maxAttempts: number;
  /** Base delay between attempts (ms) */
  baseDelay: number;
  /** Use exponential backoff */
  exponentialBackoff: boolean;
  /** Maximum total timeout (ms) */
  maxTimeout: number;
  /** Validate elements before returning */
  validateElements: boolean;
}

/**
 * Default fallback strategy
 */
const DEFAULT_STRATEGY: FallbackStrategy = {
  maxAttempts: 3,
  baseDelay: 100,
  exponentialBackoff: true,
  maxTimeout: 5000,
  validateElements: true
};

/**
 * Fallback selector result
 */
export interface FallbackResult {
  /** Found element (null if not found) */
  element: Element | null;
  /** Which selector was successful */
  successfulSelector: string | null;
  /** Index of successful selector (0 = primary, 1+ = fallback) */
  selectorIndex: number;
  /** Total time taken (ms) */
  totalTime: number;
  /** Number of attempts made */
  attempts: number;
  /** Whether element passed validation */
  isValid: boolean;
  /** Error if any occurred */
  error?: Error;
}

/**
 * Enhanced selector fallback engine
 */
export class SelectorFallback {
  private strategy: FallbackStrategy;

  constructor(strategy: Partial<FallbackStrategy> = {}) {
    this.strategy = { ...DEFAULT_STRATEGY, ...strategy };
  }

  /**
   * Find element using comprehensive fallback strategy
   */
  async findElement(selector: ElementSelector): Promise<FallbackResult> {
    const startTime = performance.now();
    let totalAttempts = 0;

    // Try primary selector first
    const primaryResult = await this.trySelector(
      selector.primary,
      selector.validator,
      0
    );
    
    totalAttempts += primaryResult.attempts;
    
    if (primaryResult.element) {
      return {
        element: primaryResult.element,
        successfulSelector: selector.primary,
        selectorIndex: 0,
        totalTime: performance.now() - startTime,
        attempts: totalAttempts,
        isValid: primaryResult.isValid,
        ...(primaryResult.error && { error: primaryResult.error })
      };
    }

    // Try fallback selectors
    for (let i = 0; i < selector.fallbacks.length; i++) {
      const fallbackSelector = selector.fallbacks[i];
      const fallbackResult = await this.trySelector(
        fallbackSelector,
        selector.validator,
        i + 1
      );
      
      totalAttempts += fallbackResult.attempts;
      
      if (fallbackResult.element) {
        return {
          element: fallbackResult.element,
          successfulSelector: fallbackSelector,
          selectorIndex: i + 1,
          totalTime: performance.now() - startTime,
          attempts: totalAttempts,
          isValid: fallbackResult.isValid,
          ...(fallbackResult.error && { error: fallbackResult.error })
        };
      }

      // Check timeout
      if (performance.now() - startTime > this.strategy.maxTimeout) {
        break;
      }
    }

    // All selectors failed
    return {
      element: null,
      successfulSelector: null,
      selectorIndex: -1,
      totalTime: performance.now() - startTime,
      attempts: totalAttempts,
      isValid: false,
      error: new AdapterError(
        AdapterErrorType.ELEMENT_NOT_FOUND,
        `Failed to find element after trying ${selector.fallbacks.length + 1} selectors`,
        { 
          primarySelector: selector.primary,
          fallbackSelectors: selector.fallbacks,
          description: selector.description
        }
      )
    };
  }

  /**
   * Try a single selector with retry logic
   */
  private async trySelector(
    selector: string,
    validator?: (element: Element) => boolean,
    _selectorIndex = 0
  ): Promise<{
    element: Element | null;
    attempts: number;
    isValid: boolean;
    error?: Error;
  }> {
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts < this.strategy.maxAttempts) {
      try {
        const element = document.querySelector(selector);
        
        if (element) {
          // Validate element if strategy requires it
          if (this.strategy.validateElements) {
            if (!isElementVisible(element)) {
              attempts++;
              await this.delay(attempts);
              continue;
            }
            
            if (!isElementInteractable(element)) {
              attempts++;
              await this.delay(attempts);
              continue;
            }
          }
          
          // Run custom validator if provided
          const isValid = validator ? validator(element) : true;
          
          if (isValid) {
            return {
              element,
              attempts: attempts + 1,
              isValid: true
            };
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown selector error');
        // Invalid selector, don't retry
        break;
      }

      attempts++;
      
      if (attempts < this.strategy.maxAttempts) {
        await this.delay(attempts);
      }
    }

    return {
      element: null,
      attempts,
      isValid: false,
      ...(lastError && { error: lastError })
    };
  }

  /**
   * Calculate delay with optional exponential backoff
   */
  private async delay(attempt: number): Promise<void> {
    const delay = this.strategy.exponentialBackoff
      ? this.strategy.baseDelay * Math.pow(2, attempt - 1)
      : this.strategy.baseDelay;
    
    return new Promise(resolve => setTimeout(resolve, Math.min(delay, 1000)));
  }

  /**
   * Update strategy configuration
   */
  updateStrategy(strategy: Partial<FallbackStrategy>): void {
    this.strategy = { ...this.strategy, ...strategy };
  }

  /**
   * Get current strategy
   */
  getStrategy(): FallbackStrategy {
    return { ...this.strategy };
  }
}

/**
 * Advanced selector generation utilities
 */
export class SelectorGenerator {
  /**
   * Generate fallback selectors for input elements
   */
  static generateInputSelectors(baseSelector: string): string[] {
    const fallbacks = [
      // Generic input patterns
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'div[contenteditable="true"]',
      '[role="textbox"]',
      
      // Form-based patterns
      'form textarea:last-of-type',
      'form input:last-of-type',
      'form [contenteditable="true"]',
      
      // Common class patterns
      '.input:not([disabled])',
      '.textarea:not([disabled])',
      '.text-input:not([disabled])',
      
      // Attribute-based patterns
      '[placeholder*="message"]',
      '[placeholder*="text"]',
      '[placeholder*="input"]',
      
      // Position-based patterns
      'body textarea:last-of-type',
      'main textarea',
      'main [contenteditable="true"]'
    ];

    return [baseSelector, ...fallbacks];
  }

  /**
   * Generate fallback selectors for button elements
   */
  static generateButtonSelectors(baseSelector: string): string[] {
    const fallbacks = [
      // Generic button patterns
      'button[type="submit"]',
      'input[type="submit"]',
      'button:not([disabled])',
      
      // Form-based patterns
      'form button:last-child',
      'form button:last-of-type',
      'form input[type="submit"]',
      
      // Common class patterns
      '.btn',
      '.button',
      '.submit',
      '.send',
      
      // Attribute-based patterns
      '[aria-label*="send"]',
      '[aria-label*="submit"]',
      '[title*="send"]',
      '[title*="submit"]',
      
      // Icon-based patterns
      'button:has(svg)',
      'button:has(.icon)',
      'button:has([class*="icon"])'
    ];

    return [baseSelector, ...fallbacks];
  }

  /**
   * Generate fallback selectors for container elements
   */
  static generateContainerSelectors(baseSelector: string): string[] {
    const fallbacks = [
      // Generic container patterns
      'main',
      '.container',
      '.content',
      '.chat',
      '.conversation',
      
      // Scrollable containers
      '.overflow-y-auto',
      '.overflow-auto',
      '[style*="overflow"]',
      
      // Semantic containers
      'section',
      'article',
      '.messages',
      '.chat-messages',
      
      // Layout containers
      '.flex-col',
      '.flex-column',
      '.grid',
      
      // Position-based
      'body > div:first-child',
      'main > div:first-child'
    ];

    return [baseSelector, ...fallbacks];
  }
}

/**
 * Selector health checker
 */
export class SelectorHealthChecker {
  /**
   * Test selector reliability
   */
  static async testSelector(
    selector: string,
    iterations = 10,
    delay = 100
  ): Promise<{
    successRate: number;
    averageTime: number;
    errors: string[];
  }> {
    const results: { success: boolean; time: number; error?: string }[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        const element = document.querySelector(selector);
        const time = performance.now() - startTime;
        
        results.push({
          success: element !== null,
          time
        });
      } catch (error) {
        const time = performance.now() - startTime;
        results.push({
          success: false,
          time,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const successfulResults = results.filter(r => r.success);
    const errors = results
      .filter(r => r.error)
      .map(r => r.error!)
      .filter((error, index, array) => array.indexOf(error) === index);
    
    return {
      successRate: successfulResults.length / iterations,
      averageTime: results.reduce((sum, r) => sum + r.time, 0) / iterations,
      errors
    };
  }

  /**
   * Validate selector performance
   */
  static validateSelectorPerformance(
    selector: string,
    maxTime = 50
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      try {
        document.querySelector(selector);
        const time = performance.now() - startTime;
        resolve(time <= maxTime);
      } catch {
        resolve(false);
      }
    });
  }
}

/**
 * Global fallback engine instance
 */
export const selectorFallback = new SelectorFallback();
