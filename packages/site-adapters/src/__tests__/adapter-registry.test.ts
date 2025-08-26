/**
 * Adapter registry tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry, adapterRegistry } from '../adapters/adapter-registry';
import { ChatGPTAdapter } from '../sites/chatgpt';
import { ClaudeAdapter } from '../sites/claude';
import { SiteType, AdapterError, AdapterErrorType } from '../types';

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry;
  let chatgptAdapter: ChatGPTAdapter;
  let claudeAdapter: ClaudeAdapter;

  beforeEach(() => {
    registry = new AdapterRegistry();
    chatgptAdapter = new ChatGPTAdapter();
    claudeAdapter = new ClaudeAdapter();
  });

  describe('Registration', () => {
    it('should register adapters successfully', () => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
      
      expect(registry.hasAdapter(SiteType.CHATGPT)).toBe(true);
      expect(registry.hasAdapter(SiteType.CLAUDE)).toBe(true);
    });

    it('should prevent duplicate registration', () => {
      registry.register(chatgptAdapter);
      
      expect(() => registry.register(chatgptAdapter)).toThrow(AdapterError);
    });

    it('should get all registered adapters', () => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
      
      const adapters = registry.getAllAdapters();
      expect(adapters).toHaveLength(2);
      expect(adapters).toContain(chatgptAdapter);
      expect(adapters).toContain(claudeAdapter);
    });

    it('should get registered site types', () => {
      registry.register(chatgptAdapter);
      
      const siteTypes = registry.getRegisteredSiteTypes();
      expect(siteTypes).toContain(SiteType.CHATGPT);
      expect(siteTypes).toHaveLength(1);
    });
  });

  describe('Adapter retrieval', () => {
    beforeEach(() => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
    });

    it('should get adapter by site type', () => {
      const adapter = registry.getAdapterByType(SiteType.CHATGPT);
      expect(adapter).toBe(chatgptAdapter);
    });

    it('should return null for unregistered site type', () => {
      const registry = new AdapterRegistry();
      const adapter = registry.getAdapterByType(SiteType.CHATGPT);
      expect(adapter).toBeNull();
    });

    it('should get adapter for current site', async () => {
      // Mock site detection
      Object.defineProperty(window, 'location', {
        value: { href: 'https://chat.openai.com' },
        writable: true
      });

      const adapter = await registry.getAdapter();
      expect(adapter).toBe(chatgptAdapter);
    });

    it('should return null for unsupported site', async () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com' },
        writable: true
      });

      const adapter = await registry.getAdapter();
      expect(adapter).toBeNull();
    });

    it('should throw error for detected but unregistered site', async () => {
      const registry = new AdapterRegistry(); // Empty registry
      
      Object.defineProperty(window, 'location', {
        value: { href: 'https://chat.openai.com' },
        writable: true
      });

      await expect(registry.getAdapter()).rejects.toThrow(AdapterError);
    });
  });

  describe('Site support checking', () => {
    beforeEach(() => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
    });

    it('should check if site is supported', async () => {
      const chatgptSupported = await registry.isSiteSupported('https://chat.openai.com');
      const claudeSupported = await registry.isSiteSupported('https://claude.ai');
      const unsupported = await registry.isSiteSupported('https://example.com');
      
      expect(chatgptSupported).toBe(true);
      expect(claudeSupported).toBe(true);
      expect(unsupported).toBe(false);
    });
  });

  describe('Initialization and cleanup', () => {
    beforeEach(() => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
    });

    it('should initialize all adapters', async () => {
      const chatgptInitSpy = vi.spyOn(chatgptAdapter, 'initialize');
      const claudeInitSpy = vi.spyOn(claudeAdapter, 'initialize');
      
      await registry.initializeAll();
      
      expect(chatgptInitSpy).toHaveBeenCalled();
      expect(claudeInitSpy).toHaveBeenCalled();
    });

    it('should not initialize twice', async () => {
      const chatgptInitSpy = vi.spyOn(chatgptAdapter, 'initialize');
      
      await registry.initializeAll();
      await registry.initializeAll(); // Second call
      
      expect(chatgptInitSpy).toHaveBeenCalledTimes(1);
    });

    it('should cleanup all adapters', () => {
      const chatgptCleanupSpy = vi.spyOn(chatgptAdapter, 'cleanup');
      const claudeCleanupSpy = vi.spyOn(claudeAdapter, 'cleanup');
      
      registry.cleanupAll();
      
      expect(chatgptCleanupSpy).toHaveBeenCalled();
      expect(claudeCleanupSpy).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      const error = new Error('Init failed');
      vi.spyOn(chatgptAdapter, 'initialize').mockRejectedValue(error);
      
      await expect(registry.initializeAll()).rejects.toThrow(AdapterError);
    });
  });

  describe('Unregistration', () => {
    beforeEach(() => {
      registry.register(chatgptAdapter);
      registry.register(claudeAdapter);
    });

    it('should unregister adapter', () => {
      const cleanupSpy = vi.spyOn(chatgptAdapter, 'cleanup');
      
      const result = registry.unregister(SiteType.CHATGPT);
      
      expect(result).toBe(true);
      expect(registry.hasAdapter(SiteType.CHATGPT)).toBe(false);
      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should return false for non-existent adapter', () => {
      const registry = new AdapterRegistry();
      const result = registry.unregister(SiteType.CHATGPT);
      
      expect(result).toBe(false);
    });

    it('should clear all adapters', () => {
      const chatgptCleanupSpy = vi.spyOn(chatgptAdapter, 'cleanup');
      const claudeCleanupSpy = vi.spyOn(claudeAdapter, 'cleanup');
      
      registry.clear();
      
      expect(registry.getAllAdapters()).toHaveLength(0);
      expect(chatgptCleanupSpy).toHaveBeenCalled();
      expect(claudeCleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should provide registry stats', () => {
      registry.register(chatgptAdapter);
      
      const stats = registry.getStats();
      
      expect(stats.totalAdapters).toBe(1);
      expect(stats.registeredSites).toContain(SiteType.CHATGPT);
      expect(stats.initialized).toBe(false);
    });

    it('should update stats after initialization', async () => {
      registry.register(chatgptAdapter);
      await registry.initializeAll();
      
      const stats = registry.getStats();
      expect(stats.initialized).toBe(true);
    });
  });

  describe('Global instance', () => {
    it('should provide global adapterRegistry instance', () => {
      expect(adapterRegistry).toBeInstanceOf(AdapterRegistry);
    });
  });
});
