/**
 * @promptlint/contextual-intelligence
 * 
 * Level 4 Contextual Intelligence Engine - Main Entry Point
 * Phase 4.1 Week 1 Implementation
 * 
 * @version 0.1.0
 */

// === Core Intent Analysis Exports ===
export { InstructionAnalyzer } from './intent-analysis/InstructionAnalyzer.js';

// === Internal Imports for Factory Functions ===
import { InstructionAnalyzer } from './intent-analysis/InstructionAnalyzer.js';
import { DefaultContextBridge } from './shared/ContextBridge.js';

// === Shared Types Exports ===
export * from './shared/ContextualTypes.js';
export * from './shared/IntentTypes.js';
export * from './shared/ContextBridge.js';

// === Factory Functions ===

/**
 * Create a new InstructionAnalyzer instance
 */
export function createInstructionAnalyzer() {
  return new InstructionAnalyzer();
}

/**
 * Create a default ContextBridge with in-memory cache
 */
export function createContextBridge() {
  const cache = new InMemoryContextCache();
  return new DefaultContextBridge(cache);
}

// === Simple In-Memory Cache Implementation ===

class InMemoryContextCache {
  private cache = new Map<string, any>();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };
  
  async get(key: string) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }
    this.stats.misses++;
    return null;
  }
  
  async set(key: string, value: any, ttl?: number) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || 300000 // 5 minutes default
    });
  }
  
  async invalidate(key: string) {
    return this.cache.delete(key);
  }
  
  async clear() {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses),
      missRate: this.stats.misses / (this.stats.hits + this.stats.misses),
      evictionCount: this.stats.evictions
    };
  }
}

// === Version Information ===
export const CONTEXTUAL_INTELLIGENCE_VERSION = '0.1.0';

// === Default Export ===
export default {
  version: CONTEXTUAL_INTELLIGENCE_VERSION,
  createInstructionAnalyzer,
  createContextBridge
};
