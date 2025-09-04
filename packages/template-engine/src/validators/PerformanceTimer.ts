/**
 * Performance Timer - ES Module
 * 
 * Monitors and enforces <100ms performance requirement
 * Provides fallback strategies when timeout exceeded
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TimedResult } from '../types/TemplateTypes.js';

export class PerformanceTimer {
  private readonly maxExecutionTime: number;
  private readonly warningThreshold: number;
  
  constructor(maxExecutionTime: number = 100, warningThreshold: number = 80) {
    this.maxExecutionTime = maxExecutionTime;
    this.warningThreshold = warningThreshold;
  }
  
  /**
   * Measure operation execution time with timeout protection
   * 
   * @param operation - Operation to measure
   * @returns Timed result with execution metrics
   */
  measure<T>(operation: () => T): TimedResult<T> {
    const startTime = performance.now();
    const warnings: string[] = [];
    
    try {
      // Execute operation
      const result = operation();
      const executionTime = performance.now() - startTime;
      
      // Check for timeout
      const timeoutExceeded = executionTime > this.maxExecutionTime;
      
      // Generate warnings
      if (executionTime > this.warningThreshold) {
        warnings.push(`Operation took ${executionTime.toFixed(2)}ms (warning threshold: ${this.warningThreshold}ms)`);
      }
      
      if (timeoutExceeded) {
        warnings.push(`Operation exceeded maximum time limit of ${this.maxExecutionTime}ms`);
      }
      
      return {
        result,
        executionTime,
        timeoutExceeded,
        warnings
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const timeoutExceeded = executionTime > this.maxExecutionTime;
      
      warnings.push(`Operation failed after ${executionTime.toFixed(2)}ms: ${error instanceof Error ? error.message : String(error)}`);
      
      if (timeoutExceeded) {
        warnings.push(`Operation exceeded maximum time limit of ${this.maxExecutionTime}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Measure async operation execution time with timeout protection
   * 
   * @param operation - Async operation to measure
   * @returns Timed result with execution metrics
   */
  async measureAsync<T>(operation: () => Promise<T>): Promise<TimedResult<T>> {
    const startTime = performance.now();
    const warnings: string[] = [];
    
    try {
      // Execute async operation
      const result = await operation();
      const executionTime = performance.now() - startTime;
      
      // Check for timeout
      const timeoutExceeded = executionTime > this.maxExecutionTime;
      
      // Generate warnings
      if (executionTime > this.warningThreshold) {
        warnings.push(`Async operation took ${executionTime.toFixed(2)}ms (warning threshold: ${this.warningThreshold}ms)`);
      }
      
      if (timeoutExceeded) {
        warnings.push(`Async operation exceeded maximum time limit of ${this.maxExecutionTime}ms`);
      }
      
      return {
        result,
        executionTime,
        timeoutExceeded,
        warnings
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const timeoutExceeded = executionTime > this.maxExecutionTime;
      
      warnings.push(`Async operation failed after ${executionTime.toFixed(2)}ms: ${error instanceof Error ? error.message : String(error)}`);
      
      if (timeoutExceeded) {
        warnings.push(`Async operation exceeded maximum time limit of ${this.maxExecutionTime}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Measure operation with timeout and fallback
   * 
   * @param operation - Primary operation to measure
   * @param fallback - Fallback operation if timeout exceeded
   * @returns Timed result with execution metrics
   */
  measureWithFallback<T>(
    operation: () => T,
    fallback: () => T
  ): TimedResult<T> {
    const startTime = performance.now();
    const warnings: string[] = [];
    
    try {
      // Execute primary operation
      const result = operation();
      const executionTime = performance.now() - startTime;
      
      // Check for timeout
      const timeoutExceeded = executionTime > this.maxExecutionTime;
      
      if (timeoutExceeded) {
        warnings.push(`Primary operation exceeded time limit, using fallback`);
        // Execute fallback
        const fallbackStartTime = performance.now();
        const fallbackResult = fallback();
        const fallbackExecutionTime = performance.now() - fallbackStartTime;
        
        warnings.push(`Fallback operation took ${fallbackExecutionTime.toFixed(2)}ms`);
        
        return {
          result: fallbackResult,
          executionTime: executionTime + fallbackExecutionTime,
          timeoutExceeded: true,
          warnings
        };
      }
      
      // Generate warnings
      if (executionTime > this.warningThreshold) {
        warnings.push(`Operation took ${executionTime.toFixed(2)}ms (warning threshold: ${this.warningThreshold}ms)`);
      }
      
      return {
        result,
        executionTime,
        timeoutExceeded: false,
        warnings
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      warnings.push(`Primary operation failed, using fallback: ${error instanceof Error ? error.message : String(error)}`);
      
      // Execute fallback
      const fallbackStartTime = performance.now();
      const fallbackResult = fallback();
      const fallbackExecutionTime = performance.now() - fallbackStartTime;
      
      warnings.push(`Fallback operation took ${fallbackExecutionTime.toFixed(2)}ms`);
      
      return {
        result: fallbackResult,
        executionTime: executionTime + fallbackExecutionTime,
        timeoutExceeded: true,
        warnings
      };
    }
  }
  
  /**
   * Check if execution time is within acceptable limits
   * 
   * @param executionTime - Execution time in milliseconds
   * @returns Whether time is acceptable
   */
  isAcceptableTime(executionTime: number): boolean {
    return executionTime <= this.maxExecutionTime;
  }
  
  /**
   * Get performance metrics for logging
   * 
   * @param executionTime - Execution time in milliseconds
   * @returns Performance metrics object
   */
  getPerformanceMetrics(executionTime: number): {
    executionTime: number;
    maxAllowedTime: number;
    warningThreshold: number;
    isAcceptable: boolean;
    isWarning: boolean;
    performanceRatio: number;
  } {
    return {
      executionTime,
      maxAllowedTime: this.maxExecutionTime,
      warningThreshold: this.warningThreshold,
      isAcceptable: this.isAcceptableTime(executionTime),
      isWarning: executionTime > this.warningThreshold,
      performanceRatio: executionTime / this.maxExecutionTime
    };
  }
  
  /**
   * Create a timeout promise that rejects after specified time
   * 
   * @param timeoutMs - Timeout in milliseconds
   * @returns Promise that rejects after timeout
   */
  createTimeoutPromise(timeoutMs: number = this.maxExecutionTime): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }
  
  /**
   * Race operation against timeout
   * 
   * @param operation - Operation to race
   * @param timeoutMs - Timeout in milliseconds
   * @returns Promise that resolves with operation result or rejects on timeout
   */
  async raceAgainstTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.maxExecutionTime
  ): Promise<T> {
    const timeoutPromise = this.createTimeoutPromise(timeoutMs);
    const operationPromise = operation();
    
    return Promise.race([operationPromise, timeoutPromise]);
  }
}
