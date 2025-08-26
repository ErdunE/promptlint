/**
 * ChatGPT adapter tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatGPTAdapter } from '../sites/chatgpt';
import { SiteType } from '../types';

describe('ChatGPTAdapter', () => {
  let adapter: ChatGPTAdapter;

  beforeEach(() => {
    adapter = new ChatGPTAdapter();
    
    // Set up ChatGPT-like environment
    Object.defineProperty(window, 'location', {
      value: { href: 'https://chat.openai.com' },
      writable: true
    });
  });

  describe('Configuration', () => {
    it('should have correct site type', () => {
      expect(adapter.siteType).toBe(SiteType.CHATGPT);
    });

    it('should have correct URL patterns', () => {
      const patterns = adapter.config.urlPatterns;
      
      expect(patterns).toHaveLength(3);
      expect(patterns[0].test('https://chat.openai.com')).toBe(true);
      expect(patterns[1].test('https://chatgpt.com')).toBe(true);
      expect(patterns[2].test('https://api.openai.com/chat')).toBe(true);
    });

    it('should have metadata', () => {
      const metadata = adapter.config.metadata;
      
      expect(metadata?.displayName).toBe('ChatGPT');
      expect(metadata?.iconUrl).toBeDefined();
      expect(metadata?.settings?.supportsStreaming).toBe(true);
    });
  });

  describe('Site detection', () => {
    it('should detect ChatGPT site with high confidence', async () => {
      const result = await adapter.detectSite('https://chat.openai.com');
      
      expect(result.type).toBe(SiteType.CHATGPT);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect non-ChatGPT sites', async () => {
      const result = await adapter.detectSite('https://example.com');
      
      expect(result.type).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should boost confidence with DOM elements', async () => {
      document.body.innerHTML = `
        <textarea data-testid="chat-input" placeholder="Message ChatGPT"></textarea>
        <button data-testid="send-button"></button>
      `;

      const result = await adapter.detectSite();
      
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Element finding', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form>
          <textarea id="prompt-textarea" placeholder="Message ChatGPT"></textarea>
          <button data-testid="send-button" aria-label="Send message">Send</button>
        </form>
        <main class="conversation">
          <div class="text-base gap-6">Chat content</div>
        </main>
      `;
    });

    it('should find input element', async () => {
      const result = await adapter.findInputElement();
      
      expect(result.element).toBeDefined();
      expect(result.element?.id).toBe('prompt-textarea');
      expect(result.selectorUsed).toBe('primary');
      expect(result.isValid).toBe(true);
    });

    it('should find submit button', async () => {
      const result = await adapter.findSubmitElement();
      
      expect(result.element).toBeDefined();
      expect(result.element?.getAttribute('data-testid')).toBe('send-button');
      expect(result.isValid).toBe(true);
    });

    it('should find chat container', async () => {
      const result = await adapter.findChatContainer();
      
      expect(result.element).toBeDefined();
      expect(result.element?.tagName.toLowerCase()).toBe('main');
      expect(result.isValid).toBe(true);
    });

    it('should find injection point', async () => {
      const result = await adapter.findInjectionPoint();
      
      expect(result.element).toBeDefined();
      expect(result.element?.tagName.toLowerCase()).toBe('form');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Fallback selectors', () => {
    it('should use fallback for input element', async () => {
      document.body.innerHTML = `
        <textarea data-testid="chat-input" placeholder="Send a message"></textarea>
      `;

      const result = await adapter.findInputElement();
      
      expect(result.element).toBeDefined();
      expect(result.selectorUsed).not.toBe('primary');
      expect(result.isValid).toBe(true);
    });

    it('should use fallback for submit button', async () => {
      document.body.innerHTML = `
        <form>
          <button aria-label="Send message">Submit</button>
        </form>
      `;

      const result = await adapter.findSubmitElement();
      
      expect(result.element).toBeDefined();
      expect(result.selectorUsed).not.toBe('primary');
      expect(result.isValid).toBe(true);
    });

    it('should return null when no elements found', async () => {
      document.body.innerHTML = '<div>No matching elements</div>';

      const result = await adapter.findInputElement();
      
      expect(result.element).toBeNull();
      expect(result.isValid).toBe(false);
    });
  });

  describe('Element validation', () => {
    it('should validate input elements correctly', async () => {
      // Valid input
      document.body.innerHTML = `
        <textarea placeholder="Message ChatGPT" style="display: block;"></textarea>
      `;

      let result = await adapter.findInputElement();
      expect(result.isValid).toBe(true);

      // Invalid input (hidden)
      document.body.innerHTML = `
        <textarea placeholder="Message ChatGPT" style="display: none;"></textarea>
      `;

      result = await adapter.findInputElement();
      expect(result.element).toBeNull();
    });

    it('should validate submit buttons correctly', async () => {
      // Valid button
      document.body.innerHTML = `
        <button aria-label="Send message" style="display: block;">Send</button>
      `;

      let result = await adapter.findSubmitElement();
      expect(result.isValid).toBe(true);

      // Invalid button (not a button)
      document.body.innerHTML = `
        <div aria-label="Send message">Send</div>
      `;

      result = await adapter.findSubmitElement();
      expect(result.element).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should find elements within 200ms', async () => {
      document.body.innerHTML = `
        <textarea id="prompt-textarea"></textarea>
      `;

      const start = Date.now();
      const result = await adapter.findInputElement();
      const duration = Date.now() - start;
      
      expect(result.element).toBeDefined();
      expect(duration).toBeLessThan(200);
    });

    it('should complete site detection within 100ms', async () => {
      const start = Date.now();
      await adapter.detectSite();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Initialization and cleanup', () => {
    it('should initialize successfully', async () => {
      document.body.innerHTML = `
        <textarea data-testid="chat-input"></textarea>
      `;

      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('should cleanup successfully', () => {
      expect(() => adapter.cleanup()).not.toThrow();
    });

    it('should not initialize twice', async () => {
      document.body.innerHTML = `
        <textarea data-testid="chat-input"></textarea>
      `;

      await adapter.initialize();
      await expect(adapter.initialize()).resolves.not.toThrow();
    });
  });

  describe('Dynamic content handling', () => {
    it('should handle content updates', async () => {
      await adapter.initialize();
      
      // Simulate dynamic content change
      document.body.innerHTML = `
        <div id="new-content">
          <textarea data-testid="chat-input"></textarea>
        </div>
      `;

      // Should still be able to find elements
      const result = await adapter.findInputElement();
      expect(result.element).toBeDefined();
    });
  });
});
