/**
 * PromptLint Error Handler
 * 
 * Comprehensive error handling for DOM injection and adapter failures
 * Provides graceful fallbacks and user-friendly error reporting
 */

import { LintResult } from '@promptlint/shared-types';

export enum ErrorType {
  SITE_DETECTION_FAILED = 'SITE_DETECTION_FAILED',
  ADAPTER_NOT_FOUND = 'ADAPTER_NOT_FOUND',
  ADAPTER_INITIALIZATION_FAILED = 'ADAPTER_INITIALIZATION_FAILED',
  DOM_INJECTION_FAILED = 'DOM_INJECTION_FAILED',
  INPUT_ELEMENT_NOT_FOUND = 'INPUT_ELEMENT_NOT_FOUND',
  UI_INJECTION_POINT_NOT_FOUND = 'UI_INJECTION_POINT_NOT_FOUND',
  LINT_ANALYSIS_FAILED = 'LINT_ANALYSIS_FAILED',
  PANEL_CREATION_FAILED = 'PANEL_CREATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface PromptLintError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: number;
  recoverable: boolean;
  userMessage: string;
  suggestion?: string;
}

export interface ErrorHandlerOptions {
  enableLogging?: boolean;
  enableUserNotifications?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>;
  private errorLog: PromptLintError[] = [];
  private retryAttempts: Map<string, number> = new Map();

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableLogging: options.enableLogging !== false,
      enableUserNotifications: options.enableUserNotifications !== false,
      maxRetries: options.maxRetries || 3,
      retryDelayMs: options.retryDelayMs || 1000
    };
  }

  /**
   * Handle and categorize errors with appropriate responses
   */
  handleError(error: Error | string, type?: ErrorType, context?: Record<string, any>): PromptLintError {
    const promptLintError = this.createPromptLintError(error, type, context);
    
    // Log error
    if (this.options.enableLogging) {
      this.logError(promptLintError);
    }

    // Store in error log
    this.errorLog.push(promptLintError);
    
    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Send to background script for telemetry
    this.reportToBackground(promptLintError);

    return promptLintError;
  }

  /**
   * Create standardized PromptLint error object
   */
  private createPromptLintError(error: Error | string, type?: ErrorType, context?: Record<string, any>): PromptLintError {
    const originalError = error instanceof Error ? error : new Error(error);
    const errorType = type || this.categorizeError(originalError);
    
    return {
      type: errorType,
      message: originalError.message,
      originalError,
      context: context || {},
      timestamp: Date.now(),
      recoverable: this.isRecoverable(errorType),
      userMessage: this.getUserMessage(errorType),
      suggestion: this.getSuggestion(errorType)
    };
  }

  /**
   * Automatically categorize errors based on message and context
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('site') && message.includes('detect')) {
      return ErrorType.SITE_DETECTION_FAILED;
    }
    
    if (message.includes('adapter') && message.includes('not found')) {
      return ErrorType.ADAPTER_NOT_FOUND;
    }
    
    if (message.includes('input') && message.includes('element')) {
      return ErrorType.INPUT_ELEMENT_NOT_FOUND;
    }
    
    if (message.includes('injection') || message.includes('dom')) {
      return ErrorType.DOM_INJECTION_FAILED;
    }
    
    if (message.includes('permission')) {
      return ErrorType.PERMISSION_DENIED;
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    if (message.includes('analyze') || message.includes('lint')) {
      return ErrorType.LINT_ANALYSIS_FAILED;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Determine if error is recoverable with retry
   */
  private isRecoverable(errorType: ErrorType): boolean {
    const recoverableErrors = [
      ErrorType.INPUT_ELEMENT_NOT_FOUND,
      ErrorType.UI_INJECTION_POINT_NOT_FOUND,
      ErrorType.DOM_INJECTION_FAILED,
      ErrorType.LINT_ANALYSIS_FAILED,
      ErrorType.NETWORK_ERROR
    ];
    
    return recoverableErrors.includes(errorType);
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(errorType: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.SITE_DETECTION_FAILED]: 'Unable to detect supported AI website',
      [ErrorType.ADAPTER_NOT_FOUND]: 'Website adapter not available',
      [ErrorType.ADAPTER_INITIALIZATION_FAILED]: 'Failed to initialize website integration',
      [ErrorType.DOM_INJECTION_FAILED]: 'Unable to inject PromptLint interface',
      [ErrorType.INPUT_ELEMENT_NOT_FOUND]: 'Cannot find text input field',
      [ErrorType.UI_INJECTION_POINT_NOT_FOUND]: 'Cannot find suitable location for PromptLint panel',
      [ErrorType.LINT_ANALYSIS_FAILED]: 'Prompt analysis temporarily unavailable',
      [ErrorType.PANEL_CREATION_FAILED]: 'Unable to create PromptLint panel',
      [ErrorType.PERMISSION_DENIED]: 'Extension permissions insufficient',
      [ErrorType.NETWORK_ERROR]: 'Network connection issue',
      [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred'
    };
    
    return messages[errorType] || 'Unknown error occurred';
  }

  /**
   * Get user-friendly suggestion for error resolution
   */
  private getSuggestion(errorType: ErrorType): string | undefined {
    const suggestions: Partial<Record<ErrorType, string>> = {
      [ErrorType.SITE_DETECTION_FAILED]: 'Make sure you\'re on ChatGPT or Claude website',
      [ErrorType.ADAPTER_NOT_FOUND]: 'Try refreshing the page or check if site is supported',
      [ErrorType.INPUT_ELEMENT_NOT_FOUND]: 'Navigate to the chat interface and try again',
      [ErrorType.PERMISSION_DENIED]: 'Check extension permissions in Chrome settings',
      [ErrorType.NETWORK_ERROR]: 'Check your internet connection and try again',
      [ErrorType.UNKNOWN_ERROR]: 'Try refreshing the page or restarting the browser'
    };
    
    return suggestions[errorType];
  }

  /**
   * Attempt to recover from error with retry logic
   */
  async attemptRecovery<T>(
    operation: () => Promise<T>,
    errorType: ErrorType,
    context?: Record<string, any>
  ): Promise<T | null> {
    const operationKey = `${errorType}_${JSON.stringify(context || {})}`;
    const currentAttempts = this.retryAttempts.get(operationKey) || 0;
    
    if (currentAttempts >= this.options.maxRetries) {
      console.warn(`[PromptLint] Max retries exceeded for ${errorType}`);
      return null;
    }

    try {
      const result = await operation();
      // Success - reset retry counter
      this.retryAttempts.delete(operationKey);
      return result;
    } catch (error) {
      const attempts = currentAttempts + 1;
      this.retryAttempts.set(operationKey, attempts);
      
      const promptLintError = this.handleError(error as Error, errorType, {
        ...context,
        attempt: attempts,
        maxRetries: this.options.maxRetries
      });
      
      if (promptLintError.recoverable && attempts < this.options.maxRetries) {
        console.log(`[PromptLint] Retrying ${errorType} (attempt ${attempts}/${this.options.maxRetries})`);
        
        // Exponential backoff
        const delay = this.options.retryDelayMs * Math.pow(2, attempts - 1);
        await this.sleep(delay);
        
        return this.attemptRecovery(operation, errorType, context);
      }
      
      return null;
    }
  }

  /**
   * Create error-state lint result for display
   */
  createErrorLintResult(error: PromptLintError): LintResult {
    return {
      score: 0,
      issues: [{
        type: 'missing_language' as any,
        severity: 'high',
        message: error.userMessage
      }],
      metadata: {
        processingTime: 0,
        inputLength: 0,
        timestamp: new Date()
      }
    };
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: PromptLintError): void {
    const logMessage = `[PromptLint Error] ${error.type}: ${error.message}`;
    const logData = {
      error: error.originalError,
      context: error.context,
      recoverable: error.recoverable,
      timestamp: new Date(error.timestamp).toISOString()
    };

    if (error.recoverable) {
      console.warn(logMessage, logData);
    } else {
      console.error(logMessage, logData);
    }
  }

  /**
   * Report error to background script
   */
  private reportToBackground(error: PromptLintError): void {
    try {
      chrome.runtime.sendMessage({
        type: 'ERROR_REPORT',
        error: {
          type: error.type,
          message: error.message,
          timestamp: error.timestamp,
          recoverable: error.recoverable,
          context: error.context
        }
      }).catch(() => {
        // Ignore messaging errors - background script might not be ready
      });
    } catch {
      // Ignore - extension context might not be available
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recoverableErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: PromptLintError[];
  } {
    const errorsByType: Record<string, number> = {};
    let recoverableErrors = 0;

    this.errorLog.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      if (error.recoverable) {
        recoverableErrors++;
      }
    });

    return {
      totalErrors: this.errorLog.length,
      recoverableErrors,
      errorsByType,
      recentErrors: this.errorLog.slice(-10) // Last 10 errors
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler({
  enableLogging: true,
  enableUserNotifications: true,
  maxRetries: 3,
  retryDelayMs: 1000
});
