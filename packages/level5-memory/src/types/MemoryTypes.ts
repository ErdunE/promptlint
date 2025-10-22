/**
 * Level 5 Memory System Type Definitions
 * Defines interfaces for persistent memory, context preservation, and behavioral patterns
 */

export interface UserInteraction {
  id: string;
  timestamp: number;
  sessionId: string;
  prompt: string;
  intent: string;
  complexity: string;
  confidence: number;
  templateSelected?: string;
  outcome: 'successful' | 'modified' | 'abandoned';
  context: InteractionContext;
}

export interface InteractionContext {
  platform: string;
  domain: string;
  projectId?: string;
  workflowStage?: string;
  collaborationLevel: string;
  urgencyLevel: string;
}

export interface ContextMemory {
  episodic: EpisodicMemory[];
  semantic: SemanticMemory[];
  working: WorkingMemory;
  workflow: WorkflowState[];
}

export interface EpisodicMemory {
  id: string;
  timestamp: number;
  sessionId: string;
  interaction: UserInteraction;
  relatedInteractions: string[];
  emotionalContext?: string;
  retentionScore: number;
}

export interface SemanticMemory {
  id: string;
  pattern: BehavioralPattern;
  frequency: number;
  confidence: number;
  lastUpdated: number;
  contexts: string[];
}

export interface BehavioralPattern {
  type: 'sequence' | 'preference' | 'workflow' | 'timing';
  description: string;
  triggers: string[];
  outcomes: string[];
  successRate: number;
}

export interface WorkingMemory {
  sessionId: string;
  activeContext: InteractionContext;
  recentInteractions: UserInteraction[];
  currentIntent?: string;
  predictedNextActions: PredictedAction[];
  lastUpdated: number;
}

export interface WorkflowState {
  id: string;
  projectId: string;
  stage: string;
  progress: number;
  estimatedCompletion?: number;
  blockers: string[];
  patterns: BehavioralPattern[];
}

export interface PredictedAction {
  type: string;
  confidence: number;
  reasoning: string;
  suggestedPrompt?: string;
}

export interface MemoryStore {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique?: boolean }[];
}

export interface MemoryRetentionPolicy {
  maxAge: number; // in milliseconds
  maxEntries: number;
  pruningStrategy: 'fifo' | 'lru' | 'importance';
}

export interface MemoryPerformanceMetrics {
  storageTime: number;
  retrievalTime: number;
  cacheHitRate: number;
  memoryUsage: number;
}
