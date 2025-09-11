/**
 * PromptLint Chrome Extension - Content Script Main Entry Point
 * 
 * Initializes the extension on supported AI websites (ChatGPT, Claude)
 * Integrates with site-adapters for DOM interaction and rules-engine for analysis
 */

import { siteDetector, adapterRegistry, initializeSiteAdapters, getCurrentSiteAdapter } from '@promptlint/site-adapters';

import { UIInjector } from './ui-injector';
import { InputMonitor } from './input-monitor';
import { globalErrorHandler, ErrorType } from './error-handler';
import { extensionRephraseService } from './rephrase-service';
import { ContextAwareRephraseService } from '../services/context-aware-rephrase-service.js';

class PromptLintContentScript {
  private uiInjector: UIInjector | null = null;
  private inputMonitor: InputMonitor | null = null;
  private contextAwareService: ContextAwareRephraseService | null = null;
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
          const detection = await siteDetector.detectSite();
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
          if (!siteDetection.type) {
            throw new Error('Site type is null');
          }
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
          await adapter.initialize();
          return true;
        },
        ErrorType.ADAPTER_INITIALIZATION_FAILED,
        { siteType: siteDetection.type }
      );

      console.log('[PromptLint] Site adapter initialized');

      // Initialize rephrase service
      console.log('[PromptLint] Initializing rephrase service...');
      const rephraseStatus = await extensionRephraseService.initialize();
      console.log('[PromptLint] Rephrase service status:', rephraseStatus);

      // Initialize context-aware rephrase service (Phase 3.1)
      console.log('[PromptLint] Initializing context-aware rephrase service...');
      this.contextAwareService = new ContextAwareRephraseService();
      const contextAwareStatus = await this.contextAwareService.initialize();
      console.log('[PromptLint] Context-aware service status:', contextAwareStatus);

      // Initialize UI components with error handling
      const uiInitialized = await globalErrorHandler.attemptRecovery(
        async () => {
          // Create rephrase callbacks
          const rephraseCallbacks = extensionRephraseService.createGracefulFallback();
          
          this.uiInjector = new UIInjector(adapter as any, {
            panelOptions: { enableRephrase: true }
          }, rephraseCallbacks);
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
          this.inputMonitor = new InputMonitor(adapter as any, this.uiInjector!);
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

      // Safely cleanup adapter with error handling
      try {
        const adapter = await getCurrentSiteAdapter();
        if (adapter) {
          adapter.cleanup();
        }
      } catch (adapterError) {
        console.warn('[PromptLint] Error during adapter cleanup:', adapterError);
        // Don't let adapter cleanup errors prevent other cleanup
      }

      this.isInitialized = false;
      console.log('[PromptLint] Content script cleaned up');
    } catch (error) {
      console.error('[PromptLint] Error during cleanup:', error);
      // Ensure initialization state is reset even if cleanup fails
      this.isInitialized = false;
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

// Function to handle URL changes
const handleUrlChange = () => {
  try {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      console.log('[PromptLint] URL changed from', currentUrl, 'to', newUrl);
      currentUrl = newUrl;
      
      // Check if the new URL is still supported
      const isSupported = newUrl.startsWith('https://chat.openai.com/') || 
                         newUrl.startsWith('https://chatgpt.com/') ||
                         newUrl.startsWith('https://claude.ai/') ||
                         newUrl.startsWith('https://anthropic.com/');
      
      if (isSupported) {
        console.log('[PromptLint] New URL is supported, reinitializing...');
        promptLintCS.cleanup().then(() => {
          // Small delay to let SPA finish navigation
          setTimeout(() => promptLintCS.initialize(), 1000);
        }).catch(error => {
          console.warn('[PromptLint] Error during cleanup before reinitialization:', error);
          // Try to initialize anyway
          setTimeout(() => promptLintCS.initialize(), 1000);
        });
      } else {
        console.log('[PromptLint] New URL is not supported, cleaning up...');
        promptLintCS.cleanup().catch(error => {
          console.warn('[PromptLint] Error during cleanup for unsupported URL:', error);
        });
      }
    }
  } catch (error) {
    console.error('[PromptLint] Error in URL change handler:', error);
  }
};

// MutationObserver for DOM changes (catches most SPA navigation)
const observer = new MutationObserver(() => {
  handleUrlChange();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// History API listener for pushState/replaceState (catches programmatic navigation)
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(history, args);
  setTimeout(handleUrlChange, 100);
};

history.replaceState = function(...args) {
  originalReplaceState.apply(history, args);
  setTimeout(handleUrlChange, 100);
};

// Popstate listener for browser back/forward
window.addEventListener('popstate', () => {
  setTimeout(handleUrlChange, 100);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  promptLintCS.cleanup();
  observer.disconnect();
  
  // Restore original history methods
  history.pushState = originalPushState;
  history.replaceState = originalReplaceState;
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_STATUS':
      sendResponse({
        initialized: promptLintCS['isInitialized'],
        site: null
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
