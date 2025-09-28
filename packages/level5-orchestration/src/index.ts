/**
 * @module @promptlint/level5-orchestration
 * @description
 * Core module for Level 5 Multi-Agent Orchestration.
 * Coordinates specialized agents to provide unified "mind-reading" intelligence
 * 
 * @version 0.8.0.0
 */

// Core Orchestration Framework
export { MultiAgentOrchestrator, createMultiAgentOrchestrator } from './MultiAgentOrchestrator.js';

// Consensus and Conflict Resolution
export { ConsensusEngine } from './ConsensusEngine.js';

// Specialized Agents
export { MemoryAgent } from './agents/MemoryAgent.js';
export { WorkflowAgent } from './agents/WorkflowAgent.js';
export { PatternRecognitionAgent } from './agents/PatternRecognitionAgent.js';
export { PredictionAgent } from './agents/PredictionAgent.js';

// Type Definitions
export type {
  Agent,
  AgentAnalysis,
  AgentExpertise,
  AgentCapability,
  AgentSuggestion,
  AgentInsight,
  SuggestionType,
  InsightType,
  ConsensusResult,
  Resolution,
  Agreement,
  Disagreement,
  ConflictType,
  ResolutionStrategy,
  OrchestratedResponse,
  ProcessingMetrics,
  TransparencyInfo,
  OrchestrationConfig,
  OrchestrationMetrics,
  UserFeedback,
  LearningData
} from './types/OrchestrationTypes.js';

// Factory Functions
import { OrchestrationConfig } from './types/OrchestrationTypes.js';
import { MultiAgentOrchestrator } from './MultiAgentOrchestrator.js';
import { ConsensusEngine } from './ConsensusEngine.js';
import { MemoryAgent } from './agents/MemoryAgent.js';
import { WorkflowAgent } from './agents/WorkflowAgent.js';
import { PatternRecognitionAgent } from './agents/PatternRecognitionAgent.js';
import { PredictionAgent } from './agents/PredictionAgent.js';

export function createMemoryAgent(): MemoryAgent {
  return new MemoryAgent();
}

export function createWorkflowAgent(): WorkflowAgent {
  return new WorkflowAgent();
}

export function createPatternRecognitionAgent(): PatternRecognitionAgent {
  return new PatternRecognitionAgent();
}

export function createPredictionAgent(): PredictionAgent {
  return new PredictionAgent();
}

export function createOrchestrationConfig(overrides: Partial<OrchestrationConfig> = {}): OrchestrationConfig {
  return {
    enableParallelProcessing: true,
    consensusThreshold: 0.7,
    conflictResolutionStrategy: 'highest_confidence',
    maxProcessingTime: 100,
    enableTransparency: true,
    agentWeights: {
      'memory': 1.0,
      'pattern_recognition': 1.0,
      'workflow_intelligence': 1.2,
      'prediction': 1.0,
      'contextual_analysis': 0.9,
      'ghost_text': 0.8
    },
    ...overrides
  };
}

// Version Information
export const LEVEL5_ORCHESTRATION_VERSION = '0.8.0.0';

// Default Export
export default {
  version: LEVEL5_ORCHESTRATION_VERSION,
  createMultiAgentOrchestrator: createMultiAgentOrchestrator,
  createMemoryAgent,
  createWorkflowAgent,
  createPatternRecognitionAgent,
  createPredictionAgent,
  createOrchestrationConfig,
  MultiAgentOrchestrator,
  ConsensusEngine: ConsensusEngine,
  MemoryAgent,
  WorkflowAgent,
  PatternRecognitionAgent,
  PredictionAgent
};
