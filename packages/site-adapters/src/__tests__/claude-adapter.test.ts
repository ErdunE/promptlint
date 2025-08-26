/**
 * Claude adapter tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClaudeAdapter } from '../sites/claude';
import { SiteType } from '../types';

describe('ClaudeAdapter', () => {
  let adapter: ClaudeAdapter;

  beforeEach(() => {
    adapter = new ClaudeAdapter();
    
    // Set up Claude-like environment
    Object.defineProperty(window, 'location', {
      value: { href: 'https://claude.ai' },
      writable: true
    });
  });

  describe('Configuration', () => {
    it('should have correct site type', () => {
      expect(adapter.siteType).toBe(SiteType.CLAUDE);
    });

    it('should have correct URL patterns', () => {
      const patterns = adapter.config.urlPatterns;
      
      expect(patterns).toHaveLength(3);
      expect(patterns[0].test('https://claude.ai')).toBe(true);
      expect(patterns[1].test('https://console.anthropic.com')).toBe(true);
      expect(patterns[2].test('https://console.anthropic.com')).toBe(true);
    });

    it('should have metadata', () => {
      const metadata = adapter.config.metadata;
      
      expect(metadata?.displayName).toBe('Claude');
      expect(metadata?.iconUrl).toBeDefined();
      expect(metadata?.settings?.usesContentEditable).toBe(true);
    });
  });

  describe('Site detection', () => {
    it('should detect Claude site with high confidence', async () => {
      const result = await adapter.detectSite('https://claude.ai');
      
      expect(result.type).toBe(SiteType.CLAUDE);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should not detect non-Claude sites', async () => {
      const result = await adapter.detectSite('https://example.com');
      
      expect(result.type).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should boost confidence with DOM elements', async () => {
      document.body.innerHTML = `
        <div contenteditable="true" data-testid="chat-input" class="ProseMirror"></div>
        <button data-testid="send-message"></button>
      `;

      const result = await adapter.detectSite();
      
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Element finding', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form>
          <div contenteditable="true" data-testid="chat-input" class="ProseMirror">
            Talk with Claude
          </div>
          <button data-testid="send-message" aria-label="Send message">Send</button>
        </form>
        <div data-testid="chat-messages">
          <div>Message 1</div>
          <div>Message 2</div>
        </div>
        <div class="composer">
          <div contenteditable="true"></div>
        </div>
      `;
    });

    it('should find input element (contenteditable)', async () => {
      const result = await adapter.findInputElement();
      
      expect(result.element).toBeDefined();
      expect(result.element?.getAttribute('data-testid')).toBe('chat-input');
      expect(result.element?.getAttribute('contenteditable')).toBe('true');
      expect(result.selectorUsed).toBe('primary');
      expect(result.isValid).toBe(true);
    });

    it('should find submit button', async () => {
      const result = await adapter.findSubmitElement();
      
      expect(result.element).toBeDefined();
      expect(result.element?.getAttribute('data-testid')).toBe('send-message');
      expect(result.isValid).toBe(true);
    });

    it('should find chat container', async () => {
      const result = await adapter.findChatContainer();
      
      expect(result.element).toBeDefined();
      expect(result.element?.getAttribute('data-testid')).toBe('chat-messages');
      expect(result.isValid).toBe(true);
    });

    it('should find injection point', async () => {
      const result = await adapter.findInjectionPoint();
      
      expect(result.element).toBeDefined();
      expect(result.element?.classList.contains('composer')).toBe(true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Fallback selectors', () => {
    it('should use fallback for textarea input', async () => {
      document.body.innerHTML = `
        <textarea placeholder="Talk with Claude"></textarea>
      `;

      const result = await adapter.findInputElement();
      
      expect(result.element).toBeDefined();
      expect(result.element?.tagName.toLowerCase()).toBe('textarea');
      expect(result.selectorUsed).not.toBe('primary');
      expect(result.isValid).toBe(true);
    });

    it('should use fallback for generic submit button', async () => {
      document.body.innerHTML = `
        <form>
          <button type="submit">Send</button>
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
    it('should validate contenteditable inputs correctly', async () => {
      // Valid contenteditable
      document.body.innerHTML = `
        <div contenteditable="true" class="ProseMirror" style="display: block;"></div>
      `;

      let result = await adapter.findInputElement();
      expect(result.isValid).toBe(true);

      // Invalid input (hidden)
      document.body.innerHTML = `
        <div contenteditable="true" style="display: none;"></div>
      `;

      result = await adapter.findInputElement();
      expect(result.element).toBeNull();
    });

    it('should validate textarea inputs correctly', async () => {
      // Valid textarea
      document.body.innerHTML = `
        <textarea placeholder="Message Claude" style="display: block;"></textarea>
      `;

      const result = await adapter.findInputElement();
      expect(result.isValid).toBe(true);
    });

    it('should validate submit buttons correctly', async () => {
      // Valid button
      document.body.innerHTML = `
        <button data-testid="send-message" style="display: block;">Send</button>
      `;

      let result = await adapter.findSubmitElement();
      expect(result.isValid).toBe(true);

      // Invalid button (not a button)
      document.body.innerHTML = `
        <div data-testid="send-message">Send</div>
      `;

      result = await adapter.findSubmitElement();
      expect(result.element).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should find elements within 200ms', async () => {
      document.body.innerHTML = `
        <div contenteditable="true" data-testid="chat-input"></div>
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

  describe('ProseMirror support', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div contenteditable="true" class="ProseMirror" data-testid="chat-input">
          Current text content
        </div>
      `;
    });

    it('should get text from contenteditable input', async () => {
      const text = await adapter.getInputText();
      expect(text).toContain('Current text content');
    });

    it('should set text in contenteditable input', async () => {
      const success = await adapter.setInputText('New text content');
      
      expect(success).toBe(true);
      
      const element = await adapter.findInputElement();
      expect(element.element?.textContent).toBe('New text content');
    });

    it('should handle textarea input as well', async () => {
      document.body.innerHTML = `
        <textarea data-testid="chat-input">Textarea content</textarea>
      `;

      const text = await adapter.getInputText();
      expect(text).toBe('Textarea content');

      const success = await adapter.setInputText('New textarea content');
      expect(success).toBe(true);
    });
  });

  describe('Initialization and cleanup', () => {
    it('should initialize successfully', async () => {
      document.body.innerHTML = `
        <div contenteditable="true" data-testid="chat-input"></div>
        <div class="ProseMirror"></div>
      `;

      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('should cleanup successfully', () => {
      expect(() => adapter.cleanup()).not.toThrow();
    });

    it('should initialize ProseMirror support', async () => {
      document.body.innerHTML = `
        <div class="ProseMirror" contenteditable="true"></div>
      `;

      await adapter.initialize();
      
      // Should have stored ProseMirror reference
      expect((adapter as any)._proseMirrorEditor).toBeDefined();
    });

    it('should cleanup ProseMirror references', async () => {
      document.body.innerHTML = `
        <div class="ProseMirror" contenteditable="true"></div>
      `;

      await adapter.initialize();
      adapter.cleanup();
      
      expect((adapter as any)._proseMirrorEditor).toBeUndefined();
    });
  });

  describe('Dynamic content handling', () => {
    it('should handle content updates', async () => {
      await adapter.initialize();
      
      // Simulate dynamic content change
      document.body.innerHTML = `
        <div id="new-content">
          <div contenteditable="true" data-testid="chat-input"></div>
        </div>
      `;

      // Should still be able to find elements
      const result = await adapter.findInputElement();
      expect(result.element).toBeDefined();
    });
  });
});
