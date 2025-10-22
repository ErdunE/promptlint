/**
 * Type definitions for Level 5 Multi-Agent System
 * Defines interfaces for agents, their capabilities, and analysis results
 */

export interface Agent {
  id: string;
  name: string;
  capabilities: AgentCapability[];
  analyzeInput(input: UserInput): Promise<AgentAnalysis>;
  getCapabilities(): AgentCapability[];
}

export interface AgentCapability {
  type: 'memory' | 'workflow' | 'pattern' | 'prediction' | 'analysis' | 'suggestion';
  description: string;
  confidence: number; // 0-1, how confident this agent is in this capability
  domains?: string[]; // Optional: specific domains this capability applies to
}

export interface AgentAnalysis {
  agentId: string;
  agentName: string;
  processingTime: number; // milliseconds
  confidence: number; // 0-1, overall confidence in this analysis
  suggestions: AgentSuggestion[];
  metadata?: {
    memoryContext?: any;
    workflowState?: any;
    detectedPatterns?: any;
    predictions?: any;
    [key: string]: any;
  };
}

export interface AgentSuggestion {
  id: string;
  type: 'action' | 'template' | 'workflow_step' | 'ghost_text' | 'explanation' | 'optimization';
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string; // Explanation of why this suggestion was made
  implementation?: {
    steps?: string[];
    code?: string;
    resources?: string[];
  };
  metadata?: {
    sourcePattern?: string;
    memorySource?: string;
    workflowPhase?: string;
    [key: string]: any;
  };
}

export interface UserInput {
  prompt: string;
  context: {
    platform: string; // e.g., 'GitHub', 'ChatGPT', 'VS Code'
    url: string;
    timestamp: number;
    sessionId: string;
    level4Analysis?: any; // Optional Level 4 contextual analysis
    userPreferences?: {
      preferredTemplates?: string[];
      workflowStyle?: string;
      complexityPreference?: string;
    };
  };
}

export interface AgentRegistration {
  agent: Agent;
  priority: number; // Higher numbers = higher priority
  isEnabled: boolean;
  lastUsed?: number;
}

export interface AgentPerformanceMetrics {
  agentId: string;
  totalAnalyses: number;
  averageProcessingTime: number; // milliseconds
  averageConfidence: number; // 0-1
  successRate: number; // 0-1, based on user acceptance
  lastUpdated: number;
}

export interface AgentCoordinationResult {
  participatingAgents: string[];
  totalProcessingTime: number;
  parallelEfficiency: number; // 0-1, how well agents worked in parallel
  coordinationOverhead: number; // milliseconds spent on coordination
}

// Agent-specific analysis types
export interface MemoryAgentAnalysis extends AgentAnalysis {
  metadata: {
    memoryContext: {
      episodicMemories: number;
      semanticPatterns: number;
      workingMemoryEntries: number;
      relevantInteractions: any[];
    };
    retrievalTime: number;
    memoryRelevance: number; // 0-1
  };
}

export interface WorkflowAgentAnalysis extends AgentAnalysis {
  metadata: {
    workflowState: {
      currentPhase: string;
      nextPhases: string[];
      completionProgress: number; // 0-1
    };
    workflowTransitions: any[];
    phaseConfidence: number; // 0-1
  };
}

export interface PatternAgentAnalysis extends AgentAnalysis {
  metadata: {
    detectedPatterns: {
      sequences: any[];
      preferences: any[];
      temporal: any[];
      workflows: any[];
    };
    patternConfidence: number; // 0-1
    emergingPatterns: number;
  };
}

export interface PredictionAgentAnalysis extends AgentAnalysis {
  metadata: {
    predictions: {
      nextIntents: any[];
      ghostText: string[];
      workflowSteps: any[];
    };
    predictionAccuracy: number; // 0-1, based on historical performance
    predictionLatency: number; // milliseconds
  };
}
