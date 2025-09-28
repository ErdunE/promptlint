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

// Performance-Optimized Orchestration (v0.8.0.5)
export { 
  OptimizedMultiAgentOrchestrator, 
  createOptimizedMultiAgentOrchestrator 
} from './OptimizedMultiAgentOrchestrator.js';
export type { 
  OptimizedOrchestrationConfig, 
  OptimizedOrchestrationResult 
} from './OptimizedMultiAgentOrchestrator.js';

// Performance Systems
export { 
  PerformanceCache, 
  AgentResponseCache, 
  ConsensusCache,
  createPerformanceCache,
  createAgentResponseCache,
  createConsensusCache
} from './PerformanceCache.js';
export type { 
  CachedResponse, 
  CacheMetrics, 
  CacheConfig 
} from './PerformanceCache.js';

export { 
  PerformanceMonitor, 
  createPerformanceMonitor,
  getGlobalPerformanceMonitor
} from './PerformanceMonitor.js';
export type { 
  PerformanceMetrics, 
  Bottleneck, 
  PerformanceEvent 
} from './PerformanceMonitor.js';

// Level 4 Enhanced Orchestration
export { 
  Level4EnhancedOrchestrator, 
  createLevel4EnhancedOrchestrator,
  createUnifiedInput
} from './Level4EnhancedOrchestrator.js';
export type { 
  Level4EnhancedInput, 
  UnifiedOrchestrationResult 
} from './Level4EnhancedOrchestrator.js';

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
  createMultiAgentOrchestrator: (config: any) => new MultiAgentOrchestrator(config),
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
