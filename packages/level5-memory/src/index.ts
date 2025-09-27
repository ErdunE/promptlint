/**
 * @promptlint/level5-memory
 * 
 * Level 5 Persistent Memory System - Main Entry Point
 * Provides multi-session context preservation with IndexedDB
 * 
 * @version 0.8.0.0
 */

// Core Memory Manager
export { PersistentMemoryManager } from './PersistentMemoryManager.js';

// Level 4 Integration Bridge
export { Level4IntegrationBridge } from './Level4Integration.js';
export type { Level5Enhancement, PredictiveInsight } from './Level4Integration.js';

// Type Definitions
export type {
  UserInteraction,
  InteractionContext,
  ContextMemory,
  EpisodicMemory,
  SemanticMemory,
  WorkingMemory,
  WorkflowState,
  BehavioralPattern,
  PredictedAction,
  MemoryStore,
  MemoryRetentionPolicy,
  MemoryPerformanceMetrics
} from './types/MemoryTypes.js';

// Factory Functions
export function createPersistentMemoryManager(): PersistentMemoryManager {
  return new PersistentMemoryManager();
}

// Version Information
export const LEVEL5_MEMORY_VERSION = '0.8.0.0';

// Default Export
export default {
  version: LEVEL5_MEMORY_VERSION,
  createPersistentMemoryManager,
  PersistentMemoryManager
};
