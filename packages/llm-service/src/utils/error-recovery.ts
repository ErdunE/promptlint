/**
 * PromptLint LLM Service - Advanced Error Recovery
 * 
 * Comprehensive error handling, recovery strategies, and monitoring
 * for API failures, rate limits, and service degradation
 */

import { RephraseError, RephraseErrorType } from '@promptlint/shared-types';

export interface ErrorRecoveryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: RephraseErrorType[];
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

export interface RetryContext {
  attempt: number;
  totalAttempts: number;
  lastError: Error;
  startTime: number;
  operation: string;
}

/**
 * Circuit breaker pattern for API protection
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number,
    private timeout: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new RephraseError(
          RephraseErrorType.SERVICE_UNAVAILABLE,
          'Circuit breaker is OPEN - service temporarily unavailable'
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Advanced error recovery with circuit breaker and adaptive backoff
 */
export class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig;
  private circuitBreaker: CircuitBreaker;
  private errorHistory: Array<{ timestamp: number; error: RephraseError }> = [];
  private performanceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastHourErrors: 0
  };

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      backoffMultiplier: config.backoffMultiplier || 2,
      retryableErrors: config.retryableErrors || [
        RephraseErrorType.NETWORK_ERROR,
        RephraseErrorType.TIMEOUT,
        RephraseErrorType.RATE_LIMIT_EXCEEDED,
        RephraseErrorType.UNKNOWN_ERROR
      ],
      circuitBreakerThreshold: config.circuitBreakerThreshold || 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout || 60000
    };

    this.circuitBreaker = new CircuitBreaker(
      this.config.circuitBreakerThreshold,
      this.config.circuitBreakerTimeout
    );
  }

  /**
   * Execute operation with comprehensive error recovery
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;

    try {
      const result = await this.circuitBreaker.execute(async () => {
        return await this.retryWithBackoff(operation, operationName);
      });

      // Record success metrics
      this.performanceMetrics.successfulRequests++;
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      return result;

    } catch (error) {
      // Record failure metrics
      this.performanceMetrics.failedRequests++;
      
      if (error instanceof RephraseError) {
        this.recordError(error);
        throw error;
      }

      // Wrap unknown errors
      const rephraseError = new RephraseError(
        RephraseErrorType.UNKNOWN_ERROR,
        `Operation '${operationName}' failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
      
      this.recordError(rephraseError);
      throw rephraseError;
    }
  }

  /**
   * Retry operation with adaptive backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 0) {
          console.log(`[PromptLint Recovery] Operation '${operationName}' succeeded on attempt ${attempt + 1}`);
        }
        
        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error as RephraseError) || attempt === this.config.maxRetries) {
          throw error;
        }

        // Calculate adaptive delay
        const delay = this.calculateBackoffDelay(attempt);
        
        console.warn(`[PromptLint Recovery] Attempt ${attempt + 1} failed for '${operationName}', retrying in ${delay}ms:`, error);
        
        // Wait before retry
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if error should trigger retry
   */
  private isRetryableError(error: RephraseError): boolean {
    return this.config.retryableErrors.includes(error.type);
  }

  /**
   * Calculate adaptive backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
    const delay = exponentialDelay + jitter;
    
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Record error for monitoring
   */
  private recordError(error: RephraseError): void {
    const now = Date.now();
    
    this.errorHistory.push({ timestamp: now, error });
    
    // Clean old errors (keep last hour)
    this.errorHistory = this.errorHistory.filter(
      entry => now - entry.timestamp < 3600000
    );
    
    this.performanceMetrics.lastHourErrors = this.errorHistory.length;
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(responseTime: number): void {
    const total = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.successfulRequests - 1);
    this.performanceMetrics.averageResponseTime = (total + responseTime) / this.performanceMetrics.successfulRequests;
  }

  /**
   * Get comprehensive service health metrics
   */
  getHealthMetrics(): {
    performance: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageResponseTime: number;
      lastHourErrors: number;
    };
    circuitBreaker: ReturnType<CircuitBreaker['getState']>;
    errorRate: number;
    recentErrors: Array<{ timestamp: number; type: string; message: string }>;
    recommendations: string[];
  } {
    const errorRate = this.performanceMetrics.totalRequests > 0 
      ? this.performanceMetrics.failedRequests / this.performanceMetrics.totalRequests 
      : 0;

    const recentErrors = this.errorHistory.slice(-10).map(entry => ({
      timestamp: entry.timestamp,
      type: entry.error.type,
      message: entry.error.message
    }));

    const recommendations = this.generateRecommendations(errorRate);

    return {
      performance: { ...this.performanceMetrics },
      circuitBreaker: this.circuitBreaker.getState(),
      errorRate,
      recentErrors,
      recommendations
    };
  }

  /**
   * Generate actionable recommendations based on error patterns
   */
  private generateRecommendations(errorRate: number): string[] {
    const recommendations: string[] = [];

    if (errorRate > 0.5) {
      recommendations.push('High error rate detected - consider checking API key validity');
    }

    if (this.performanceMetrics.averageResponseTime > 10000) {
      recommendations.push('Slow response times - consider reducing request complexity');
    }

    const rateLimitErrors = this.errorHistory.filter(e => e.error.type === RephraseErrorType.RATE_LIMIT_EXCEEDED).length;
    if (rateLimitErrors > 3) {
      recommendations.push('Frequent rate limiting - consider reducing request frequency');
    }

    const networkErrors = this.errorHistory.filter(e => e.error.type === RephraseErrorType.NETWORK_ERROR).length;
    if (networkErrors > 2) {
      recommendations.push('Network connectivity issues detected - check internet connection');
    }

    if (this.circuitBreaker.getState().state === 'OPEN') {
      recommendations.push('Circuit breaker is open - service will retry automatically after cooldown');
    }

    return recommendations;
  }

  /**
   * Reset error history and metrics
   */
  reset(): void {
    this.errorHistory = [];
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastHourErrors: 0
    };
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global error recovery manager instance
 */
export const globalErrorRecovery = new ErrorRecoveryManager();
