/**
 * PromptLint Input Monitor
 * 
 * Monitors input field changes with debouncing and triggers lint analysis
 * Integrates with site adapters to find input elements and rules engine for analysis
 */

import { analyzePrompt } from '@promptlint/rules-engine';
import { SiteAdapter, LintResult } from '@promptlint/shared-types';
import { UIInjector } from './ui-injector';
import { globalErrorHandler, ErrorType } from './error-handler';

export interface InputMonitorOptions {
  debounceMs?: number;
  minLength?: number;
  maxLength?: number;
}

export class InputMonitor {
  private adapter: SiteAdapter;
  private uiInjector: UIInjector;
  private options: Required<InputMonitorOptions>;
  private currentInputElement: HTMLElement | null = null;
  private debounceTimer: number | null = null;
  private lastAnalyzedText = '';
  private isMonitoring = false;

  constructor(adapter: SiteAdapter, uiInjector: UIInjector, options: InputMonitorOptions = {}) {
    this.adapter = adapter;
    this.uiInjector = uiInjector;
    this.options = {
      debounceMs: options.debounceMs || 300,
      minLength: options.minLength || 3,
      maxLength: options.maxLength || 5000
    };
  }

  async initialize(): Promise<void> {
    try {
      console.log('[PromptLint] Initializing input monitor...');
      
      // Find input element using site adapter
      const inputResult = await this.adapter.findInputElement();
      if (!inputResult.element) {
        console.warn('[PromptLint] No input element found');
        return;
      }

      this.currentInputElement = inputResult.element;
      console.log('[PromptLint] Found input element:', inputResult.selectorUsed);

      // Start monitoring
      this.startMonitoring();
      
      console.log('[PromptLint] Input monitor initialized successfully');
    } catch (error) {
      console.error('[PromptLint] Failed to initialize input monitor:', error);
      throw error;
    }
  }

  private startMonitoring(): void {
    if (!this.currentInputElement || this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Handle different input types
    if (this.currentInputElement.tagName.toLowerCase() === 'textarea' || 
        this.currentInputElement.tagName.toLowerCase() === 'input') {
      // Standard input/textarea elements
      this.currentInputElement.addEventListener('input', this.handleInputChange.bind(this));
      this.currentInputElement.addEventListener('paste', this.handleInputChange.bind(this));
    } else if (this.currentInputElement.getAttribute('contenteditable') === 'true') {
      // Contenteditable elements (like Claude's ProseMirror)
      this.currentInputElement.addEventListener('input', this.handleInputChange.bind(this));
      this.currentInputElement.addEventListener('paste', this.handleInputChange.bind(this));
      
      // Also monitor for ProseMirror-specific changes
      const observer = new MutationObserver(() => {
        this.handleInputChange();
      });
      
      observer.observe(this.currentInputElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    console.log('[PromptLint] Started monitoring input changes');
  }

  private handleInputChange(): void {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new debounce timer
    this.debounceTimer = window.setTimeout(() => {
      this.processInputChange();
    }, this.options.debounceMs);
  }

  private async processInputChange(): Promise<void> {
    try {
      if (!this.currentInputElement) {
        return;
      }

      // Get current text content
      const currentText = this.extractTextContent();
      
      // Skip if text hasn't changed or is too short/long
      if (currentText === this.lastAnalyzedText || 
          currentText.length < this.options.minLength ||
          currentText.length > this.options.maxLength) {
        return;
      }

      this.lastAnalyzedText = currentText;
      console.log('[PromptLint] Analyzing input:', currentText.substring(0, 50) + '...');

      // Analyze prompt using rules engine with error handling
      const lintResult = await globalErrorHandler.attemptRecovery(
        async () => {
          const startTime = performance.now();
          const result = analyzePrompt(currentText);
          const analysisTime = performance.now() - startTime;

          console.log(`[PromptLint] Analysis completed in ${analysisTime.toFixed(2)}ms:`, {
            score: result.score,
            issues: result.issues.length
          });

          return result;
        },
        ErrorType.LINT_ANALYSIS_FAILED,
        { 
          textLength: currentText.length,
          inputType: this.currentInputElement.tagName.toLowerCase()
        }
      );

      if (lintResult) {
        // Update UI with results
        await this.uiInjector.updateResults(lintResult);
      } else {
        // Analysis failed after retries, show error
        const promptLintError = globalErrorHandler.handleError(
          'Lint analysis failed after multiple attempts',
          ErrorType.LINT_ANALYSIS_FAILED,
          { textLength: currentText.length }
        );
        
        const errorResult = globalErrorHandler.createErrorLintResult(promptLintError);
        await this.uiInjector.updateResults(errorResult);
      }

    } catch (error) {
      // Handle unexpected errors
      const promptLintError = globalErrorHandler.handleError(
        error as Error,
        ErrorType.LINT_ANALYSIS_FAILED,
        { 
          phase: 'input_processing',
          textLength: this.lastAnalyzedText.length 
        }
      );
      
      const errorResult = globalErrorHandler.createErrorLintResult(promptLintError);
      await this.uiInjector.updateResults(errorResult);
    }
  }

  private extractTextContent(): string {
    if (!this.currentInputElement) {
      return '';
    }

    // Handle different element types
    if (this.currentInputElement.tagName.toLowerCase() === 'textarea' || 
        this.currentInputElement.tagName.toLowerCase() === 'input') {
      return (this.currentInputElement as HTMLInputElement | HTMLTextAreaElement).value.trim();
    } else if (this.currentInputElement.getAttribute('contenteditable') === 'true') {
      // For contenteditable elements, get text content
      return this.currentInputElement.textContent?.trim() || '';
    }

    return '';
  }

  async refreshInputElement(): Promise<boolean> {
    try {
      console.log('[PromptLint] Refreshing input element...');
      
      // Stop current monitoring
      this.stopMonitoring();
      
      // Find input element again
      const inputResult = await this.adapter.findInputElement();
      if (!inputResult.element) {
        console.warn('[PromptLint] No input element found during refresh');
        return false;
      }

      this.currentInputElement = inputResult.element;
      this.lastAnalyzedText = ''; // Reset to trigger re-analysis
      
      // Restart monitoring
      this.startMonitoring();
      
      console.log('[PromptLint] Input element refreshed successfully');
      return true;
    } catch (error) {
      console.error('[PromptLint] Failed to refresh input element:', error);
      return false;
    }
  }

  private stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Remove event listeners
    if (this.currentInputElement) {
      // Clone and replace to remove all listeners
      const newElement = this.currentInputElement.cloneNode(true);
      this.currentInputElement.parentNode?.replaceChild(newElement, this.currentInputElement);
    }

    this.isMonitoring = false;
    console.log('[PromptLint] Stopped monitoring input changes');
  }

  // Force immediate analysis (useful for testing)
  async analyzeNow(): Promise<LintResult | null> {
    try {
      const currentText = this.extractTextContent();
      if (currentText.length < this.options.minLength) {
        return null;
      }

      const lintResult = analyzePrompt(currentText);
      await this.uiInjector.updateResults(lintResult);
      return lintResult;
    } catch (error) {
      console.error('[PromptLint] Error in immediate analysis:', error);
      return null;
    }
  }

  // Get current monitoring status
  getStatus(): {
    isMonitoring: boolean;
    hasInputElement: boolean;
    lastAnalyzedText: string;
    debounceMs: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      hasInputElement: !!this.currentInputElement,
      lastAnalyzedText: this.lastAnalyzedText,
      debounceMs: this.options.debounceMs
    };
  }

  async cleanup(): Promise<void> {
    try {
      this.stopMonitoring();
      this.currentInputElement = null;
      this.lastAnalyzedText = '';
      console.log('[PromptLint] Input monitor cleaned up');
    } catch (error) {
      console.error('[PromptLint] Error during input monitor cleanup:', error);
    }
  }
}
