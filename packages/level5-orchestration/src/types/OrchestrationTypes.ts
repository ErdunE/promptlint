/**
 * Multi-Agent Orchestration Type Definitions
 * Defines interfaces for agent coordination, consensus building, and unified responses
 */

// Core input/output types for orchestration
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

export interface OrchestrationResult {
  id: string;
  timestamp: number;
  primarySuggestion: AgentSuggestion;
  alternativeSuggestions: AgentSuggestion[];
  agentAnalyses: AgentAnalysis[];
  consensusResult: ConsensusResult;
  confidence: number;
  reasoning: string;
  processingMetrics: ProcessingMetrics;
}

export interface Agent {
  id: string;
  name: string;
  expertise: AgentExpertise;
  confidence: number;
  analyze(input: string, context?: any): Promise<AgentAnalysis>;
  getCapabilities(): AgentCapability[];
}

export type AgentExpertise = 
  | 'memory'
  | 'pattern_recognition'
  | 'workflow_intelligence'
  | 'prediction'
  | 'contextual_analysis'
  | 'ghost_text';

export interface AgentAnalysis {
  agentId: string;
  confidence: number;
  suggestions: AgentSuggestion[];
  insights: AgentInsight[];
  reasoning: string;
  processingTime: number;
  metadata: AgentMetadata;
}

export interface AgentSuggestion {
  id: string;
  type: SuggestionType;
  content: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  source: AgentExpertise;
  reasoning: string;
  metadata?: any;
}

export type SuggestionType = 
  | 'next_action'
  | 'ghost_text'
  | 'workflow_step'
  | 'pattern_completion'
  | 'contextual_hint'
  | 'proactive_guidance';

export interface AgentInsight {
  id: string;
  type: InsightType;
  description: string;
  confidence: number;
  evidence: Evidence[];
  implications: string[];
}

export type InsightType = 
  | 'user_intent'
  | 'workflow_state'
  | 'behavioral_pattern'
  | 'context_shift'
  | 'performance_opportunity'
  | 'error_prevention';

export interface Evidence {
  source: string;
  data: any;
  weight: number;
  timestamp: number;
}

export interface AgentMetadata {
  processingTime: number;
  dataSourcesUsed: string[];
  confidenceFactors: ConfidenceFactor[];
  limitations?: string[];
}

export interface ConfidenceFactor {
  factor: string;
  impact: number; // -1 to 1
  description: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  confidence: number;
  prerequisites: string[];
}

export interface ConsensusResult {
  agreements: Agreement[];
  disagreements: Disagreement[];
  overallConfidence: number;
  primarySuggestion: AgentSuggestion | null;
  alternativeSuggestions: AgentSuggestion[];
  consensusStrength: number; // 0-1
}

export interface Agreement {
  suggestion: AgentSuggestion;
  supportingAgents: string[];
  confidence: number;
  reasoning: string;
}

export interface Disagreement {
  conflictingSuggestions: AgentSuggestion[];
  involvedAgents: string[];
  conflictType: ConflictType;
  resolutionStrategy: ResolutionStrategy;
}

export type ConflictType = 
  | 'confidence_mismatch'
  | 'suggestion_contradiction'
  | 'priority_conflict'
  | 'expertise_overlap'
  | 'context_interpretation';

export type ResolutionStrategy = 
  | 'highest_confidence'
  | 'majority_vote'
  | 'expertise_priority'
  | 'user_preference'
  | 'hybrid_approach';

export interface Resolution {
  best: AgentSuggestion;
  alternatives: AgentSuggestion[];
  confidence: number;
  reasoning: string;
  resolutionMethod: ResolutionStrategy;
  consensusMetrics: ConsensusMetrics;
}

export interface ConsensusMetrics {
  agreementRate: number;
  conflictRate: number;
  resolutionSuccess: number;
  averageConfidence: number;
  participatingAgents: number;
}

export interface OrchestratedResponse {
  id: string;
  timestamp: number;
  primarySuggestion: AgentSuggestion;
  alternatives: AgentSuggestion[];
  confidence: number;
  reasoning: string;
  insights: AgentInsight[];
  consensusMetrics: ConsensusMetrics;
  processingMetrics: ProcessingMetrics;
  transparency: TransparencyInfo;
}

export interface ProcessingMetrics {
  totalTime: number;
  agentProcessingTimes: Record<string, number>;
  consensusTime: number;
  resolutionTime: number;
  parallelEfficiency: number;
}

export interface TransparencyInfo {
  decisionProcess: DecisionStep[];
  agentContributions: AgentContribution[];
  confidenceBreakdown: ConfidenceBreakdown;
  alternativeReasons: string[];
}

export interface DecisionStep {
  step: number;
  description: string;
  input: any;
  output: any;
  reasoning: string;
  duration: number;
}

export interface AgentContribution {
  agentId: string;
  contribution: string;
  weight: number;
  confidence: number;
  used: boolean;
}

export interface ConfidenceBreakdown {
  baseConfidence: number;
  consensusBoost: number;
  expertiseWeight: number;
  contextualAdjustment: number;
  finalConfidence: number;
}

export interface OrchestrationConfig {
  enableParallelProcessing: boolean;
  consensusThreshold: number;
  conflictResolutionStrategy: ResolutionStrategy;
  maxProcessingTime: number;
  enableTransparency: boolean;
  agentWeights: Record<AgentExpertise, number>;
}

export interface OrchestrationMetrics {
  totalRequests: number;
  averageProcessingTime: number;
  consensusSuccessRate: number;
  conflictResolutionRate: number;
  userSatisfactionScore: number;
  agentPerformance: Record<string, AgentPerformanceMetrics>;
}

export interface AgentPerformanceMetrics {
  totalAnalyses: number;
  averageConfidence: number;
  suggestionAcceptanceRate: number;
  processingTime: number;
  errorRate: number;
}

export interface UserFeedback {
  responseId: string;
  rating: number; // 1-5
  accepted: boolean;
  helpful: boolean;
  reasoning?: string;
  timestamp: number;
}

export interface LearningData {
  successfulPatterns: Pattern[];
  failurePatterns: Pattern[];
  userPreferences: UserPreference[];
  contextualFactors: ContextualFactor[];
}

export interface Pattern {
  id: string;
  description: string;
  conditions: Condition[];
  outcomes: Outcome[];
  confidence: number;
  frequency: number;
}

export interface Condition {
  type: string;
  value: any;
  operator: string;
}

export interface Outcome {
  type: string;
  value: any;
  probability: number;
}

export interface UserPreference {
  category: string;
  preference: string;
  strength: number;
  context: string[];
}

export interface ContextualFactor {
  factor: string;
  impact: number;
  conditions: string[];
}
