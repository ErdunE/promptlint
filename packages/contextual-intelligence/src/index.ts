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
export { MetaInstructionAnalyzer } from './intent-analysis/MetaInstructionAnalyzer.js';
export { InteractionAnalyzer } from './intent-analysis/InteractionAnalyzer.js';
export { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';

// === Contextual Reasoning Exports ===
export { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
export { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';

// === Template Reasoning Exports ===
export { ReasoningChainGenerator } from './template-reasoning/ReasoningChainGenerator.js';

// === Meta-Information Exports ===
export { ReferenceHistoryManager } from './meta-information/ReferenceHistoryManager.js';
export { PlatformStateAnalyzer } from './meta-information/PlatformStateAnalyzer.js';

// === Internal Imports for Factory Functions ===
import { InstructionAnalyzer } from './intent-analysis/InstructionAnalyzer.js';
import { MetaInstructionAnalyzer } from './intent-analysis/MetaInstructionAnalyzer.js';
import { InteractionAnalyzer } from './intent-analysis/InteractionAnalyzer.js';
import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { DefaultContextBridge } from './shared/ContextBridge.js';

// === Shared Types Exports ===
export { 
  // Core contextual types (selective export to avoid conflicts)
  Constraint, ProjectPhase,
  ExpertiseLevel, ProjectComplexity, TechnicalStack
} from './shared/ContextualTypes.js';

export { ConstraintType } from './shared/IntentTypes.js';

export { 
  // Intent analysis types
  IntentAnalysis, InstructionIntent, InteractionIntent,
  IntentCategory, ActionType, OutputFormat, IntentComplexity
} from './shared/IntentTypes.js';

// Export IntentAnalysis from ContextualTypes for compatibility
export type { IntentAnalysis as IntentAnalysisType } from './shared/IntentTypes.js';

// === Factory Functions ===

/**
 * Create a new InstructionAnalyzer instance
 */
export function createInstructionAnalyzer() {
  return new InstructionAnalyzer();
}

/**
 * Create a new MetaInstructionAnalyzer instance
 */
export function createMetaInstructionAnalyzer() {
  return new MetaInstructionAnalyzer();
}

/**
 * Create a new InteractionAnalyzer instance
 */
export function createInteractionAnalyzer() {
  return new InteractionAnalyzer();
}

/**
 * Create a new IntentAnalysisEngine instance
 */
export function createIntentAnalysisEngine() {
  return new IntentAnalysisEngine();
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
    this.cache.delete(key);
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
  createMetaInstructionAnalyzer,
  createInteractionAnalyzer,
  createIntentAnalysisEngine,
  createContextBridge
};
