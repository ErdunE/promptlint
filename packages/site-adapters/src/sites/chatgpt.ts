/**
 * ChatGPT site adapter implementation
 * Handles DOM interaction with chat.openai.com and chatgpt.com
 */

import { BaseAdapter } from '../adapters/base-adapter';
import { SiteType, SiteConfiguration, ElementSelector } from '../types';

/**
 * ChatGPT DOM selectors with comprehensive fallbacks
 */
const CHATGPT_SELECTORS = {
  input: {
    primary: '#prompt-textarea',
    fallbacks: [
      'textarea[data-testid="chat-input"]',
      'textarea[placeholder*="Message ChatGPT"]',
      'textarea[placeholder*="Send a message"]',
      '.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][data-testid="chat-input"]',
      'textarea.m-0',
      'form textarea:not([disabled])'
    ],
    validator: (element: Element): boolean => {
      const textarea = element as HTMLTextAreaElement | HTMLDivElement;
      
      // Must be visible and interactable
      if (!textarea.offsetParent) return false;
      
      // Check for common ChatGPT input characteristics
      const hasCorrectRole = textarea.getAttribute('role') === 'textbox' || 
                            textarea.tagName.toLowerCase() === 'textarea';
      
      const hasValidPlaceholder = textarea.getAttribute('placeholder')?.toLowerCase().includes('message') ||
                                 textarea.getAttribute('placeholder')?.toLowerCase().includes('send');
      
      const isContentEditable = textarea.getAttribute('contenteditable') === 'true';
      
      return hasCorrectRole || hasValidPlaceholder || isContentEditable;
    },
    description: 'Main chat input textarea'
  } as ElementSelector,

  submit: {
    primary: 'button[data-testid="send-button"]',
    fallbacks: [
      'button[aria-label*="Send message"]',
      'button[aria-label*="Send"]',
      'form button[type="submit"]',
      'button:has(svg[data-icon="send"])',
      '.btn-primary:last-of-type',
      'button.absolute.p-1.rounded-md',
      'button[disabled]:has-text("Send")',
      'form button:not([disabled]):last-child'
    ],
    validator: (element: Element): boolean => {
      const button = element as HTMLButtonElement;
      
      // Must be a button
      if (button.tagName.toLowerCase() !== 'button') return false;
      
      // Check for send-related attributes
      const ariaLabel = button.getAttribute('aria-label')?.toLowerCase();
      const hasValidLabel = ariaLabel?.includes('send') || ariaLabel?.includes('submit');
      
      // Check for send icon (SVG)
      const hasSendIcon = button.querySelector('svg') !== null;
      
      // Check position (send buttons are usually positioned absolutely or at end of form)
      const hasPositioning = button.classList.contains('absolute') || 
                            button.closest('form')?.lastElementChild === button;
      
      return hasValidLabel || hasSendIcon || hasPositioning;
    },
    description: 'Send message button'
  } as ElementSelector,

  chatContainer: {
    primary: 'main[class*="conversation"]',
    fallbacks: [
      '.conversation-turn-container',
      '[data-testid="conversation-turn"]',
      '.text-base.gap-6',
      'main.relative.h-full',
      '.flex.flex-col.text-sm',
      'div[class*="chat"]',
      'main div[class*="conversation"]',
      '.overflow-hidden.w-full.h-full.relative.flex'
    ],
    validator: (element: Element): boolean => {
      // Should contain multiple conversation elements or be a main container
      const hasConversationElements = element.querySelectorAll('[data-testid*="conversation"], .conversation, [class*="message"]').length > 0;
      const isMainContainer = element.tagName.toLowerCase() === 'main';
      const hasScrollableContent = element.scrollHeight > element.clientHeight;
      
      return hasConversationElements || isMainContainer || hasScrollableContent;
    },
    description: 'Main chat conversation container'
  } as ElementSelector,

  injectionPoint: {
    primary: 'form[class*="stretch"]',
    fallbacks: [
      'form:has(textarea)',
      '.relative.flex.h-full.flex-1.flex-col',
      'main.relative.h-full',
      'div[class*="composer"]',
      '.flex.w-full.items-center',
      'form.flex.flex-row.gap-3',
      'body > div:first-child',
      '#__next'
    ],
    validator: (element: Element): boolean => {
      // Should be near the input area and suitable for UI injection
      const hasInputNearby = element.querySelector('textarea, [contenteditable="true"]') !== null;
      const hasFormStructure = element.tagName.toLowerCase() === 'form' || 
                              element.querySelector('form') !== null;
      const hasValidPosition = element.getBoundingClientRect().bottom > window.innerHeight * 0.5;
      
      return hasInputNearby || hasFormStructure || hasValidPosition;
    },
    description: 'UI injection point for floating panel'
  } as ElementSelector
};

/**
 * ChatGPT site configuration
 */
const CHATGPT_CONFIG: SiteConfiguration = {
  type: SiteType.CHATGPT,
  urlPatterns: [
    /^https?:\/\/chat\.openai\.com/i,
    /^https?:\/\/chatgpt\.com/i,
    /^https?:\/\/.*\.openai\.com\/chat/i
  ],
  inputSelector: CHATGPT_SELECTORS.input,
  submitSelector: CHATGPT_SELECTORS.submit,
  chatContainerSelector: CHATGPT_SELECTORS.chatContainer,
  injectionPointSelector: CHATGPT_SELECTORS.injectionPoint,
  metadata: {
    displayName: 'ChatGPT',
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDBBNjdFIi8+Cjwvc3ZnPgo=',
    settings: {
      supportsStreaming: true,
      hasCodeExecution: true,
      hasFileUpload: true
    }
  }
};

/**
 * ChatGPT adapter implementation
 */
export class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super(CHATGPT_CONFIG);
  }

  /**
   * Additional ChatGPT-specific detection logic
   */
  protected async performAdditionalDetection(): Promise<number> {
    let confidence = 0;

    // Check for ChatGPT-specific elements
    const chatGPTElements = [
      'meta[property="og:title"][content*="ChatGPT"]',
      'title:contains("ChatGPT")',
      '[data-testid="chat-input"]',
      '.text-token-text-primary' // ChatGPT-specific CSS class
    ];

    let foundElements = 0;
    for (const selector of chatGPTElements) {
      try {
        if (document.querySelector(selector)) {
          foundElements++;
        }
      } catch {
        // Invalid selector, skip
      }
    }

    confidence += (foundElements / chatGPTElements.length) * 0.15;

    // Check for OpenAI branding
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    if (bodyText.includes('openai') || bodyText.includes('chatgpt')) {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.2); // Cap at 0.2 boost
  }

  /**
   * ChatGPT-specific initialization
   */
  protected async performInitialization(): Promise<void> {
    // Wait for ChatGPT to fully load
    await this.waitForDOM();
    
    // In test environment, skip waiting for elements
    if (!this.isTestEnvironment()) {
      // Wait for React app to initialize
      await this.waitForElement('textarea, [contenteditable="true"]', 10000);
      
      // Set up observers for dynamic content
      this.setupDynamicContentObserver();
    }
    
    console.log('ChatGPT adapter initialized successfully');
  }

  /**
   * ChatGPT-specific cleanup
   */
  protected performCleanup(): void {
    // Remove any observers or event listeners
    console.log('ChatGPT adapter cleaned up');
  }

  /**
   * Setup observer for dynamic content changes
   */
  private setupDynamicContentObserver(): void {
    // ChatGPT is a SPA that dynamically updates content
    // This observer helps detect when new conversations are loaded
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // New content added, selectors might need refreshing
          console.debug('ChatGPT content updated');
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store observer for cleanup
    (this as any)._contentObserver = observer;
  }

  /**
   * Enhanced cleanup with observer removal
   */
  cleanup(): void {
    const observer = (this as any)._contentObserver;
    if (observer) {
      observer.disconnect();
      delete (this as any)._contentObserver;
    }
    
    super.cleanup();
  }
}

/**
 * Create and export ChatGPT adapter instance
 */
export const chatgptAdapter = new ChatGPTAdapter();
