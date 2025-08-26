/**
 * Adapter registry for managing site-specific adapters
 * Provides centralized adapter management and site detection
 */

import { ISiteAdapter, IAdapterRegistry, SiteType, AdapterError, AdapterErrorType } from '../types';
import { siteDetector } from '../utils/site-detector';

/**
 * Registry for managing site adapters
 */
export class AdapterRegistry implements IAdapterRegistry {
  private adapters = new Map<SiteType, ISiteAdapter>();
  private initialized = false;

  /**
   * Register a site adapter
   */
  register(adapter: ISiteAdapter): void {
    if (this.adapters.has(adapter.siteType)) {
      throw new AdapterError(
        AdapterErrorType.INITIALIZATION_FAILED,
        `Adapter for ${adapter.siteType} is already registered`,
        { siteType: adapter.siteType }
      );
    }

    this.adapters.set(adapter.siteType, adapter);
  }

  /**
   * Get adapter for current site
   */
  async getAdapter(url?: string): Promise<ISiteAdapter | null> {
    const detection = await siteDetector.detectSite(url);
    
    if (!detection.type || detection.confidence < 0.5) {
      return null;
    }

    const adapter = this.adapters.get(detection.type);
    if (!adapter) {
      throw new AdapterError(
        AdapterErrorType.SITE_NOT_DETECTED,
        `No adapter registered for site type: ${detection.type}`,
        { siteType: detection.type, detection }
      );
    }

    return adapter;
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): ISiteAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if site is supported
   */
  async isSiteSupported(url?: string): Promise<boolean> {
    const detection = await siteDetector.detectSite(url);
    return detection.type !== null && 
           detection.confidence > 0.5 && 
           this.adapters.has(detection.type);
  }

  /**
   * Get adapter by site type
   */
  getAdapterByType(siteType: SiteType): ISiteAdapter | null {
    return this.adapters.get(siteType) || null;
  }

  /**
   * Check if adapter is registered for site type
   */
  hasAdapter(siteType: SiteType): boolean {
    return this.adapters.has(siteType);
  }

  /**
   * Get all registered site types
   */
  getRegisteredSiteTypes(): SiteType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Initialize all registered adapters
   */
  async initializeAll(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initPromises = this.getAllAdapters().map(async (adapter) => {
      try {
        await adapter.initialize();
      } catch (error) {
        console.warn(`Failed to initialize ${adapter.siteType} adapter:`, error);
        throw new AdapterError(
          AdapterErrorType.INITIALIZATION_FAILED,
          `Failed to initialize ${adapter.siteType} adapter`,
          { siteType: adapter.siteType, error }
        );
      }
    });

    await Promise.all(initPromises);
    this.initialized = true;
  }

  /**
   * Cleanup all registered adapters
   */
  cleanupAll(): void {
    for (const adapter of this.getAllAdapters()) {
      try {
        adapter.cleanup();
      } catch (error) {
        console.warn(`Failed to cleanup ${adapter.siteType} adapter:`, error);
      }
    }
    this.initialized = false;
  }

  /**
   * Unregister an adapter
   */
  unregister(siteType: SiteType): boolean {
    const adapter = this.adapters.get(siteType);
    if (adapter) {
      try {
        adapter.cleanup();
      } catch (error) {
        console.warn(`Failed to cleanup ${siteType} adapter during unregister:`, error);
      }
      return this.adapters.delete(siteType);
    }
    return false;
  }

  /**
   * Clear all adapters
   */
  clear(): void {
    this.cleanupAll();
    this.adapters.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalAdapters: number;
    registeredSites: SiteType[];
    initialized: boolean;
  } {
    return {
      totalAdapters: this.adapters.size,
      registeredSites: this.getRegisteredSiteTypes(),
      initialized: this.initialized
    };
  }
}

/**
 * Global adapter registry instance
 */
export const adapterRegistry = new AdapterRegistry();

/**
 * Convenience function to get current site's adapter
 */
export async function getCurrentSiteAdapter(): Promise<ISiteAdapter | null> {
  return adapterRegistry.getAdapter();
}

/**
 * Convenience function to check if current site is supported
 */
export async function isCurrentSiteSupported(): Promise<boolean> {
  return adapterRegistry.isSiteSupported();
}
