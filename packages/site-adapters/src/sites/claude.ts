/**
 * Claude site adapter implementation
 * Handles DOM interaction with claude.ai and Anthropic sites
 */

import { BaseAdapter } from '../adapters/base-adapter';
import { SiteType, SiteConfiguration, ElementSelector } from '../types';

/**
 * Claude DOM selectors with comprehensive fallbacks
 */
const CLAUDE_SELECTORS = {
  input: {
    primary: 'div[contenteditable="true"][data-testid="chat-input"]',
    fallbacks: [
      'textarea[placeholder*="Talk with Claude"]',
      'textarea[placeholder*="Message Claude"]',
      'div[contenteditable="true"].ProseMirror',
      '[data-testid="message-input"]',
      '.composer textarea',
      'div[role="textbox"][contenteditable="true"]',
      'textarea:not([disabled]):last-of-type',
      'form div[contenteditable="true"]'
    ],
    validator: (element: Element): boolean => {
      const input = element as HTMLTextAreaElement | HTMLDivElement;
      
      // Must be visible and interactable
      if (!input.offsetParent) return false;
      
      // Check for Claude-specific characteristics
      const isContentEditable = input.getAttribute('contenteditable') === 'true';
      const isTextarea = input.tagName.toLowerCase() === 'textarea';
      const hasCorrectRole = input.getAttribute('role') === 'textbox';
      
      const hasValidPlaceholder = input.getAttribute('placeholder')?.toLowerCase().includes('claude') ||
                                 input.getAttribute('placeholder')?.toLowerCase().includes('talk') ||
                                 input.getAttribute('placeholder')?.toLowerCase().includes('message');
      
      // Check for ProseMirror (Claude's rich text editor)
      const isProseMirror = input.classList.contains('ProseMirror') ||
                           input.querySelector('.ProseMirror') !== null;
      
      return (isContentEditable || isTextarea || hasCorrectRole) && 
             (hasValidPlaceholder || isProseMirror);
    },
    description: 'Main chat input (contenteditable div or textarea)'
  } as ElementSelector,

  submit: {
    primary: 'button[data-testid="send-message"]',
    fallbacks: [
      'button[aria-label*="Send message"]',
      'button[aria-label*="Send"]',
      'form button[type="submit"]',
      'button:has(svg[data-icon="send"])',
      'button:has(svg[data-testid="send-icon"])',
      '.send-button',
      'button.bg-accent-main-100',
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
      const hasSendIcon = button.querySelector('svg[data-testid*="send"], svg[data-icon*="send"]') !== null;
      
      // Check for Claude-specific styling
      const hasClaudeStyle = button.classList.contains('bg-accent-main-100') ||
                            button.classList.contains('send-button');
      
      // Check if it's the last button in a form (common pattern)
      const isLastFormButton = button.closest('form')?.lastElementChild === button;
      
      return hasValidLabel || hasSendIcon || hasClaudeStyle || isLastFormButton;
    },
    description: 'Send message button'
  } as ElementSelector,

  chatContainer: {
    primary: 'div[data-testid="chat-messages"]',
    fallbacks: [
      '.conversation-container',
      '[data-testid="conversation"]',
      'main div[class*="messages"]',
      '.chat-messages',
      'div[class*="conversation"]',
      'main.flex.flex-col',
      '.overflow-y-auto:has([data-testid*="message"])',
      'div:has(> div[data-testid*="message"])'
    ],
    validator: (element: Element): boolean => {
      // Should contain message elements or be a scrollable container
      const hasMessageElements = element.querySelectorAll('[data-testid*="message"], .message, [class*="message"]').length > 0;
      const isScrollableContainer = element.scrollHeight > element.clientHeight;
      const hasConversationStructure = element.children.length > 1; // Multiple conversation turns
      
      return hasMessageElements || isScrollableContainer || hasConversationStructure;
    },
    description: 'Main chat messages container'
  } as ElementSelector,

  injectionPoint: {
    primary: 'div[class*="composer"]',
    fallbacks: [
      'form:has(div[contenteditable="true"])',
      'form:has(textarea)',
      '.message-input-container',
      'div:has([data-testid="chat-input"])',
      'main > div:last-child',
      '.flex.flex-col.gap-2:has(textarea)',
      'body > div[id^="__next"]',
      'main.relative'
    ],
    validator: (element: Element): boolean => {
      // Should be near the input area and suitable for UI injection
      const hasInputNearby = element.querySelector('textarea, [contenteditable="true"]') !== null;
      const hasComposerStructure = element.classList.toString().includes('composer') ||
                                  element.querySelector('[class*="composer"]') !== null;
      const hasValidPosition = element.getBoundingClientRect().bottom > window.innerHeight * 0.4;
      
      return hasInputNearby || hasComposerStructure || hasValidPosition;
    },
    description: 'UI injection point for floating panel'
  } as ElementSelector
};

/**
 * Claude site configuration
 */
const CLAUDE_CONFIG: SiteConfiguration = {
  type: SiteType.CLAUDE,
  urlPatterns: [
    /^https?:\/\/claude\.ai/i,
    /^https?:\/\/.*\.anthropic\.com/i,
    /^https?:\/\/console\.anthropic\.com/i
  ],
  inputSelector: CLAUDE_SELECTORS.input,
  submitSelector: CLAUDE_SELECTORS.submit,
  chatContainerSelector: CLAUDE_SELECTORS.chatContainer,
  injectionPointSelector: CLAUDE_SELECTORS.injectionPoint,
  metadata: {
    displayName: 'Claude',
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNEOTdCMDAiLz4KPHBhdGggZD0iTTggMTJMMTIgOEwxNiAxMkwxMiAxNkw4IDEyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
    settings: {
      supportsStreaming: true,
      hasCodeExecution: false,
      hasFileUpload: true,
      usesContentEditable: true
    }
  }
};

/**
 * Claude adapter implementation
 */
export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super(CLAUDE_CONFIG);
  }

  /**
   * Additional Claude-specific detection logic
   */
  protected async performAdditionalDetection(): Promise<number> {
    let confidence = 0;

    // Check for Claude-specific elements
    const claudeElements = [
      'meta[property="og:title"][content*="Claude"]',
      'title:contains("Claude")',
      '[data-testid="chat-input"]',
      '.ProseMirror', // Claude uses ProseMirror editor
      '[class*="anthropic"]'
    ];

    let foundElements = 0;
    for (const selector of claudeElements) {
      try {
        if (document.querySelector(selector)) {
          foundElements++;
        }
      } catch {
        // Invalid selector, skip
      }
    }

    confidence += (foundElements / claudeElements.length) * 0.15;

    // Check for Anthropic branding
    const bodyText = document.body?.textContent?.toLowerCase() || '';
    if (bodyText.includes('anthropic') || bodyText.includes('claude')) {
      confidence += 0.05;
    }

    return Math.min(confidence, 0.2); // Cap at 0.2 boost
  }

  /**
   * Claude-specific initialization
   */
  protected async performInitialization(): Promise<void> {
    // Wait for Claude to fully load
    await this.waitForDOM();
    
    // In test environment, skip waiting for elements
    if (!this.isTestEnvironment()) {
      // Wait for React app and ProseMirror to initialize
      await this.waitForElement('div[contenteditable="true"], textarea', 10000);
      
      // Set up observers for dynamic content
      this.setupDynamicContentObserver();
      
      // Claude-specific initialization
      await this.initializeProseMirrorSupport();
    }
    
    console.log('Claude adapter initialized successfully');
  }

  /**
   * Claude-specific cleanup
   */
  protected performCleanup(): void {
    // Remove any observers or event listeners
    console.log('Claude adapter cleaned up');
  }

  /**
   * Setup observer for dynamic content changes
   */
  private setupDynamicContentObserver(): void {
    // Claude is a SPA that dynamically updates content
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // New content added, selectors might need refreshing
          console.debug('Claude content updated');
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
   * Initialize ProseMirror editor support
   */
  private async initializeProseMirrorSupport(): Promise<void> {
    // Claude uses ProseMirror for rich text editing
    // This method sets up any ProseMirror-specific handling
    
    const proseMirrorEditor = await this.waitForElement('.ProseMirror', 5000);
    if (proseMirrorEditor) {
      console.debug('ProseMirror editor detected and initialized');
      
      // Store reference for potential future use
      (this as any)._proseMirrorEditor = proseMirrorEditor;
    }
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
    
    // Clean up ProseMirror reference
    delete (this as any)._proseMirrorEditor;
    
    super.cleanup();
  }

  /**
   * Claude-specific method to handle contenteditable input
   */
  async getInputText(): Promise<string> {
    const inputElement = await this.findInputElement();
    if (!inputElement.element) {
      return '';
    }

    const element = inputElement.element as HTMLElement;
    
    // Handle contenteditable div (ProseMirror)
    if (element.getAttribute('contenteditable') === 'true') {
      return element.textContent || '';
    }
    
    // Handle regular textarea
    if (element.tagName.toLowerCase() === 'textarea') {
      return (element as HTMLTextAreaElement).value || '';
    }
    
    return '';
  }

  /**
   * Claude-specific method to set input text
   */
  async setInputText(text: string): Promise<boolean> {
    const inputElement = await this.findInputElement();
    if (!inputElement.element) {
      return false;
    }

    const element = inputElement.element as HTMLElement;
    
    try {
      // Handle contenteditable div (ProseMirror)
      if (element.getAttribute('contenteditable') === 'true') {
        element.textContent = text;
        
        // Trigger input event for ProseMirror
        element.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      
      // Handle regular textarea
      if (element.tagName.toLowerCase() === 'textarea') {
        const textarea = element as HTMLTextAreaElement;
        textarea.value = text;
        
        // Trigger change event
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    } catch (error) {
      console.warn('Failed to set input text:', error);
    }
    
    return false;
  }
}

/**
 * Create and export Claude adapter instance
 */
export const claudeAdapter = new ClaudeAdapter();
