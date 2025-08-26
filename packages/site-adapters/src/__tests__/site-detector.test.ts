/**
 * Site detector tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SiteDetector, siteDetector } from '../utils/site-detector';
import { SiteType } from '../types';

describe('SiteDetector', () => {
  let detector: SiteDetector;

  beforeEach(() => {
    detector = new SiteDetector();
    detector.clearCache();
  });

  describe('URL-based detection', () => {
    it('should detect ChatGPT from chat.openai.com', async () => {
      const result = await detector.detectSite('https://chat.openai.com/chat');
      
      expect(result.type).toBe(SiteType.CHATGPT);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.url).toBe('https://chat.openai.com/chat');
    });

    it('should detect ChatGPT from chatgpt.com', async () => {
      const result = await detector.detectSite('https://chatgpt.com');
      
      expect(result.type).toBe(SiteType.CHATGPT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Claude from claude.ai', async () => {
      const result = await detector.detectSite('https://claude.ai/chat');
      
      expect(result.type).toBe(SiteType.CLAUDE);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.url).toBe('https://claude.ai/chat');
    });

    it('should detect Claude from anthropic.com', async () => {
      const result = await detector.detectSite('https://console.anthropic.com');
      
      expect(result.type).toBe(SiteType.CLAUDE);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should not detect unsupported sites', async () => {
      const result = await detector.detectSite('https://example.com');
      
      expect(result.type).toBeNull();
      expect(result.confidence).toBe(0);
    });
  });

  describe('DOM-based detection', () => {
    it('should boost confidence for ChatGPT with DOM elements', async () => {
      // Set URL to ChatGPT
      Object.defineProperty(window, 'location', {
        value: { href: 'https://chat.openai.com' },
        writable: true
      });

      // Add ChatGPT-specific DOM elements
      document.body.innerHTML = `
        <textarea data-testid="chat-input" placeholder="Message ChatGPT"></textarea>
        <title>ChatGPT</title>
      `;

      const result = await detector.detectSite();
      
      expect(result.type).toBe(SiteType.CHATGPT);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.metadata?.domConfidence).toBeGreaterThan(0);
    });

    it('should boost confidence for Claude with DOM elements', async () => {
      // Set URL to Claude
      Object.defineProperty(window, 'location', {
        value: { href: 'https://claude.ai' },
        writable: true
      });

      // Add Claude-specific DOM elements
      document.body.innerHTML = `
        <div contenteditable="true" data-testid="chat-input"></div>
        <div class="ProseMirror"></div>
        <title>Claude</title>
      `;

      const result = await detector.detectSite();
      
      expect(result.type).toBe(SiteType.CLAUDE);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.metadata?.domConfidence).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should complete detection within 100ms', async () => {
      const start = Date.now();
      await detector.detectSite('https://chat.openai.com');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    it('should cache results for performance', async () => {
      const url = 'https://chat.openai.com';
      
      // First detection
      const result1 = await detector.detectSite(url);
      
      // Second detection should be from cache
      const result2 = await detector.detectSite(url);
      
      expect(result2.metadata?.fromCache).toBe(true);
      expect(result1.type).toBe(result2.type);
      expect(result1.confidence).toBe(result2.confidence);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid URLs gracefully', async () => {
      const result = await detector.detectSite('invalid-url');
      
      expect(result.type).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.metadata?.error).toBeUndefined();
    });

    it('should handle DOM errors gracefully', async () => {
      // Mock querySelector to throw
      const originalQuerySelector = document.querySelector;
      document.querySelector = vi.fn().mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = await detector.detectSite('https://chat.openai.com');
      
      expect(result.type).toBe(SiteType.CHATGPT); // Should still work with URL matching
      expect(result.confidence).toBeGreaterThan(0.5);
      
      // Restore
      document.querySelector = originalQuerySelector;
    });
  });

  describe('Utility methods', () => {
    it('should check if site is supported', async () => {
      const supported = await detector.isSiteSupported('https://chat.openai.com');
      const unsupported = await detector.isSiteSupported('https://example.com');
      
      expect(supported).toBe(true);
      expect(unsupported).toBe(false);
    });

    it('should return supported site types', () => {
      const sites = detector.getSupportedSites();
      
      expect(sites).toContain(SiteType.CHATGPT);
      expect(sites).toContain(SiteType.CLAUDE);
      expect(sites).toHaveLength(2);
    });

    it('should return URL patterns for site types', () => {
      const chatgptPatterns = detector.getUrlPatterns(SiteType.CHATGPT);
      const claudePatterns = detector.getUrlPatterns(SiteType.CLAUDE);
      
      expect(chatgptPatterns).toHaveLength(3);
      expect(claudePatterns).toHaveLength(3);
      expect(chatgptPatterns[0].test('https://chat.openai.com')).toBe(true);
      expect(claudePatterns[0].test('https://claude.ai')).toBe(true);
    });
  });

  describe('Global instance', () => {
    it('should provide global siteDetector instance', async () => {
      const result = await siteDetector.detectSite('https://chat.openai.com');
      
      expect(result.type).toBe(SiteType.CHATGPT);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });
});
