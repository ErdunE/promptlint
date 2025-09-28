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

// Behavioral Pattern Recognition
export { BehavioralPatternRecognizer } from './BehavioralPatternRecognizer.js';

// Ghost Text Generation
export { GhostTextGenerator, createGhostTextGenerator } from './GhostTextGenerator.js';

// Workflow State Machine
export { WorkflowStateMachine, createWorkflowStateMachine } from './WorkflowStateMachine.js';

// Type Definitions - Predictive Types
export type {
  PredictedIntent,
  BehavioralPatternRecognizer as BehavioralPatternRecognizerInterface,
  SequencePattern,
  WorkflowStage,
  GhostTextSuggestion,
  PredictiveContext,
  PredictionPerformanceMetrics
} from './types/PredictiveTypes.js';

// Type Definitions - Pattern Types
export type {
  WorkflowPattern,
  DetectedPatterns,
  PreferencePattern,
  TemporalPattern,
  WorkflowContext,
  PredictedAction,
  EmergingPattern,
  PatternLearningMetrics,
  NextActionPrediction,
  InteractionEvidence
} from './types/PatternTypes.js';

// Type Definitions - Workflow Types
export type {
  WorkflowState,
  WorkflowPhase,
  WorkflowTransition,
  WorkflowAction,
  WorkflowSuggestion,
  WorkflowPrediction,
  WorkflowStep,
  WorkflowMetrics,
  ProactiveAssistanceConfig
} from './types/WorkflowTypes.js';

// Factory Functions
import { PersistentMemoryManager } from '@promptlint/level5-memory';
import { PredictiveIntentEngine } from './PredictiveIntentEngine.js';
import { BehavioralPatternRecognizer } from './BehavioralPatternRecognizer.js';

export function createPredictiveIntentEngine(memoryManager: PersistentMemoryManager): PredictiveIntentEngine {
  return new PredictiveIntentEngine(memoryManager);
}

export function createBehavioralPatternRecognizer(): BehavioralPatternRecognizer {
  return new BehavioralPatternRecognizer();
}

export function createWorkflowStateMachine(config?: any): WorkflowStateMachine {
  return new WorkflowStateMachine(config);
}

// Version Information
export const LEVEL5_PREDICTIVE_VERSION = '0.8.0.0';

// Default Export
export default {
  version: LEVEL5_PREDICTIVE_VERSION,
  createPredictiveIntentEngine,
  createBehavioralPatternRecognizer,
  createGhostTextGenerator,
  createWorkflowStateMachine,
  PredictiveIntentEngine,
  BehavioralPatternRecognizer,
  GhostTextGenerator,
  WorkflowStateMachine
};
