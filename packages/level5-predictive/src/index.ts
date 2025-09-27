/**
 * @promptlint/level5-predictive
 * 
 * Level 5 Predictive Intelligence Engine - Main Entry Point
 * Provides intent prediction and real-time autocomplete based on behavioral patterns
 * 
 * @version 0.8.0.0
 */

// Core Predictive Engine
export { PredictiveIntentEngine } from './PredictiveIntentEngine.js';

// Type Definitions
export type {
  PredictedIntent,
  BehavioralPatternRecognizer,
  SequencePattern,
  WorkflowStage,
  GhostTextSuggestion,
  PredictiveContext,
  PredictionPerformanceMetrics
} from './types/PredictiveTypes.js';

// Factory Functions
import { PersistentMemoryManager } from '@promptlint/level5-memory';
import { PredictiveIntentEngine } from './PredictiveIntentEngine.js';

export function createPredictiveIntentEngine(memoryManager: PersistentMemoryManager): PredictiveIntentEngine {
  return new PredictiveIntentEngine(memoryManager);
}

// Version Information
export const LEVEL5_PREDICTIVE_VERSION = '0.8.0.0';

// Default Export
export default {
  version: LEVEL5_PREDICTIVE_VERSION,
  createPredictiveIntentEngine,
  PredictiveIntentEngine
};
