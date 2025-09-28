/**
 * Workflow State Machine Type Definitions
 * Defines interfaces for workflow tracking, state transitions, and proactive assistance
 */

export interface WorkflowState {
  id: string;
  name: string;
  phase: WorkflowPhase;
  confidence: number;
  startTime: number;
  lastActivity: number;
  context: WorkflowContext;
  metadata: WorkflowMetadata;
}

export type WorkflowPhase = 
  | 'planning'
  | 'implementation' 
  | 'testing'
  | 'debugging'
  | 'documentation'
  | 'review'
  | 'deployment'
  | 'maintenance';

export interface WorkflowTransition {
  id: string;
  fromState: WorkflowState | null;
  toState: WorkflowState;
  confidence: number;
  timestamp: number;
  trigger: TransitionTrigger;
  suggestedActions: WorkflowAction[];
  reasoning: string;
}

export interface TransitionTrigger {
  type: 'prompt_content' | 'time_based' | 'pattern_match' | 'explicit_signal';
  value: string;
  confidence: number;
  indicators: string[];
}

export interface WorkflowAction {
  id: string;
  type: 'next_step' | 'parallel_task' | 'prerequisite' | 'optimization';
  action: string;
  description: string;
  confidence: number;
  estimatedDuration: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
}

export interface WorkflowSuggestion {
  id: string;
  type: 'proactive' | 'reactive' | 'preventive';
  title: string;
  description: string;
  confidence: number;
  actions: WorkflowAction[];
  timing: SuggestionTiming;
  dismissible: boolean;
}

export interface SuggestionTiming {
  showAfter: number; // milliseconds to wait before showing
  hideAfter: number; // milliseconds to auto-hide
  maxShows: number; // maximum times to show this suggestion
  cooldown: number; // milliseconds between shows
}

export interface WorkflowPrediction {
  id: string;
  sequence: WorkflowStep[];
  confidence: number;
  reasoning: string;
  totalEstimatedTime: number;
  alternativePaths: AlternativePath[];
}

export interface WorkflowStep {
  step: number;
  action: string;
  phase: WorkflowPhase;
  confidence: number;
  estimatedDuration: number;
  prerequisites: string[];
  description: string;
}

export interface AlternativePath {
  id: string;
  description: string;
  steps: WorkflowStep[];
  confidence: number;
  reasoning: string;
}

export interface WorkflowMetadata {
  projectType: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  teamSize: number;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  domain: string;
  technologies: string[];
  estimatedCompletion?: number;
}

export interface WorkflowPattern {
  id: string;
  name: string;
  phases: WorkflowPhase[];
  transitions: PhaseTransition[];
  frequency: number;
  successRate: number;
  avgDuration: number;
  contexts: string[];
}

export interface PhaseTransition {
  from: WorkflowPhase;
  to: WorkflowPhase;
  probability: number;
  avgDuration: number;
  commonTriggers: string[];
}

export interface WorkflowMetrics {
  currentPhase: WorkflowPhase;
  phaseProgress: number; // 0-1
  totalProgress: number; // 0-1
  timeInCurrentPhase: number;
  estimatedTimeRemaining: number;
  transitionAccuracy: number;
  suggestionAcceptanceRate: number;
}

export interface ProactiveAssistanceConfig {
  enableProactiveSuggestions: boolean;
  suggestionFrequency: 'minimal' | 'normal' | 'frequent';
  confidenceThreshold: number;
  maxSimultaneousSuggestions: number;
  respectFocusMode: boolean;
}

export interface WorkflowLearningData {
  userId: string;
  workflowPatterns: WorkflowPattern[];
  phasePreferences: Record<WorkflowPhase, number>;
  transitionHistory: WorkflowTransition[];
  suggestionFeedback: SuggestionFeedback[];
  performanceMetrics: WorkflowMetrics;
}

export interface SuggestionFeedback {
  suggestionId: string;
  action: 'accepted' | 'dismissed' | 'ignored' | 'modified';
  timestamp: number;
  context: WorkflowContext;
  outcome?: 'helpful' | 'neutral' | 'disruptive';
}
