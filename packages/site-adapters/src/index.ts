/**
 * PromptLint Site Adapters - Public API
 * Integration layer for Chrome extension to interact with AI websites
 */

// Core types
export * from './types';

// Base adapter
export { BaseAdapter } from './adapters/base-adapter';

// Adapter registry
export { 
  AdapterRegistry,
  adapterRegistry,
  getCurrentSiteAdapter,
  isCurrentSiteSupported
} from './adapters/adapter-registry';

// Site-specific adapters
export { ChatGPTAdapter, chatgptAdapter } from './sites/chatgpt';
export { ClaudeAdapter, claudeAdapter } from './sites/claude';

// Site detection
export {
  SiteDetector,
  siteDetector,
  detectCurrentSite,
  isCurrentSiteSupported as isSiteSupported
} from './utils/site-detector';

// DOM utilities
export * from './utils/dom-utils';

// Fallback strategies
export {
  SelectorFallback,
  SelectorGenerator,
  SelectorHealthChecker,
  selectorFallback
} from './utils/selector-fallback';

// Convenience initialization function
export async function initializeSiteAdapters(): Promise<void> {
  const { adapterRegistry } = await import('./adapters/adapter-registry');
  const { chatgptAdapter } = await import('./sites/chatgpt');
  const { claudeAdapter } = await import('./sites/claude');
  
  // Register all adapters (safe for re-registration)
  adapterRegistry.registerOrUpdate(chatgptAdapter);
  adapterRegistry.registerOrUpdate(claudeAdapter);
  
  // Initialize all adapters
  await adapterRegistry.initializeAll();
}

// Convenience cleanup function
export function cleanupSiteAdapters(): void {
  const { adapterRegistry } = require('./adapters/adapter-registry');
  adapterRegistry.cleanupAll();
}
