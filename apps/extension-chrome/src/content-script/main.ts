/**
 * PromptLint Chrome Extension - Content Script Main Entry Point
 * 
 * Initializes the extension on supported AI websites (ChatGPT, Claude)
 * Integrates with site-adapters for DOM interaction and rules-engine for analysis
 */

import { siteDetector, adapterRegistry, initializeSiteAdapters } from '@promptlint/site-adapters';
import { SiteType } from '@promptlint/shared-types';
import { UIInjector } from './ui-injector';
import { InputMonitor } from './input-monitor';
import { globalErrorHandler, ErrorType } from './error-handler';

class PromptLintContentScript {
  private uiInjector: UIInjector | null = null;
  private inputMonitor: InputMonitor | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[PromptLint] Already initialized');
      return;
    }

    try {
      console.log('[PromptLint] Initializing content script...');
      
      // Detect current site with error handling
      const siteDetection = await globalErrorHandler.attemptRecovery(
        async () => {
          const detection = siteDetector.detectSite();
          if (!detection || detection.confidence < 0.7) {
            throw new Error('Site not supported or confidence too low');
          }
          return detection;
        },
        ErrorType.SITE_DETECTION_FAILED,
        { url: window.location.href }
      );

      if (!siteDetection) {
        console.log('[PromptLint] Site detection failed after retries');
        return;
      }

      console.log('[PromptLint] Site detection result:', siteDetection);

      // Initialize site adapters (register ChatGPT and Claude adapters)
      const initResult = await globalErrorHandler.attemptRecovery(
        async () => {
          await initializeSiteAdapters();
          return true;
        },
        ErrorType.ADAPTER_INITIALIZATION_FAILED,
        { phase: 'site_adapters_init' }
      );

      if (!initResult) {
        console.error('[PromptLint] Failed to initialize site adapters');
        return;
      }

      console.log('[PromptLint] Site adapters initialized');
      console.log('[PromptLint] Registered adapters:', adapterRegistry.getRegisteredSiteTypes());

      // Get site adapter with error handling
      console.log('[PromptLint] Looking for adapter for site type:', siteDetection.type);
      const adapter = await globalErrorHandler.attemptRecovery(
        async () => {
          const adapterInstance = adapterRegistry.getAdapterByType(siteDetection.type);
          console.log('[PromptLint] Found adapter:', !!adapterInstance);
          if (!adapterInstance) {
            throw new Error(`No adapter found for site type: ${siteDetection.type}`);
          }
          return adapterInstance;
        },
        ErrorType.ADAPTER_NOT_FOUND,
        { siteType: siteDetection.type }
      );

      if (!adapter) {
        console.error('[PromptLint] Failed to get adapter after retries');
        return;
      }

      // Initialize adapter with error handling
      await globalErrorHandler.attemptRecovery(
        async () => {
          await adapter.performInitialization();
          return true;
        },
        ErrorType.ADAPTER_INITIALIZATION_FAILED,
        { siteType: siteDetection.type }
      );

      console.log('[PromptLint] Site adapter initialized');

      // Initialize UI components with error handling
      const uiInitialized = await globalErrorHandler.attemptRecovery(
        async () => {
          this.uiInjector = new UIInjector(adapter);
          await this.uiInjector.initialize();
          return true;
        },
        ErrorType.DOM_INJECTION_FAILED,
        { siteType: siteDetection.type }
      );

      if (!uiInitialized) {
        console.error('[PromptLint] Failed to initialize UI components');
        return;
      }

      // Initialize input monitor with error handling
      const inputInitialized = await globalErrorHandler.attemptRecovery(
        async () => {
          this.inputMonitor = new InputMonitor(adapter, this.uiInjector!);
          await this.inputMonitor.initialize();
          return true;
        },
        ErrorType.INPUT_ELEMENT_NOT_FOUND,
        { siteType: siteDetection.type }
      );

      if (!inputInitialized) {
        console.error('[PromptLint] Failed to initialize input monitor');
        // Continue without input monitoring - UI still works
      }

      this.isInitialized = true;
      console.log('[PromptLint] Content script initialized successfully');

      // Send status to background script
      try {
        chrome.runtime.sendMessage({
          type: 'CONTENT_SCRIPT_READY',
          site: siteDetection.type,
          confidence: siteDetection.confidence,
          hasInputMonitor: !!inputInitialized
        });
      } catch (error) {
        // Ignore messaging errors - background script might not be ready
        console.warn('[PromptLint] Could not send ready message to background:', error);
      }

    } catch (error) {
      const promptLintError = globalErrorHandler.handleError(
        error as Error,
        ErrorType.UNKNOWN_ERROR,
        { phase: 'initialization', url: window.location.href }
      );
      
      console.error('[PromptLint] Failed to initialize content script:', promptLintError);
      
      // Show error in UI if possible
      if (this.uiInjector) {
        const errorResult = globalErrorHandler.createErrorLintResult(promptLintError);
        await this.uiInjector.updateResults(errorResult);
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.inputMonitor) {
        await this.inputMonitor.cleanup();
        this.inputMonitor = null;
      }

      if (this.uiInjector) {
        await this.uiInjector.cleanup();
        this.uiInjector = null;
      }

      const adapter = adapterRegistry.getAdapterForCurrentSite();
      if (adapter) {
        await adapter.performCleanup();
      }

      this.isInitialized = false;
      console.log('[PromptLint] Content script cleaned up');
    } catch (error) {
      console.error('[PromptLint] Error during cleanup:', error);
    }
  }
}

// Global instance
const promptLintCS = new PromptLintContentScript();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    promptLintCS.initialize();
  });
} else {
  // DOM is already ready
  promptLintCS.initialize();
}

// Handle page navigation (SPA routing)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('[PromptLint] URL changed, reinitializing...');
    promptLintCS.cleanup().then(() => {
      // Small delay to let SPA finish navigation
      setTimeout(() => promptLintCS.initialize(), 1000);
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  promptLintCS.cleanup();
  observer.disconnect();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_STATUS':
      sendResponse({
        initialized: promptLintCS['isInitialized'],
        site: siteDetector.detectSite()?.type || null
      });
      break;
    
    case 'REINITIALIZE':
      promptLintCS.cleanup().then(() => promptLintCS.initialize());
      sendResponse({ success: true });
      break;
      
    default:
      break;
  }
});

export { promptLintCS };
