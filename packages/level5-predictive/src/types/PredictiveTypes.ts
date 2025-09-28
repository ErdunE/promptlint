/**
 * Level 5 Predictive Engine Type Definitions
 * Defines interfaces for predictive intelligence and behavioral pattern recognition
 */

export interface PredictedIntent {
  id: string;
  type: string;
  action?: string;
  confidence: number;
  reasoning: string;
  suggestedPrompt?: string;
  estimatedCompletion?: number;
  relatedPatterns: string[];
  source?: string;
}

export interface BehavioralPatternRecognizer {
  analyzeSequence(interactions: any[]): SequencePattern[];
  detectWorkflowStage(context: any): WorkflowStage;
  predictNextAction(currentState: any): PredictedIntent[];
}

export interface SequencePattern {
  id: string;
  sequence: string[];
  frequency: number;
  confidence: number;
  avgTimeBetween: number;
  successRate: number;
}

export interface WorkflowStage {
  id: string;
  name: string;
  progress: number;
  nextStages: string[];
  estimatedDuration: number;
}

export interface GhostTextSuggestion {
  text: string;
  confidence: number;
  completionType: 'word' | 'phrase' | 'sentence' | 'template';
  reasoning: string;
  source?: string;
}

export interface PredictiveContext {
  sessionId: string;
  currentPrompt: string;
  partialInput: string;
  cursorPosition: number;
  recentHistory: any[];
  workflowContext?: WorkflowStage;
}

export interface PredictionPerformanceMetrics {
  predictionTime: number;
  accuracyRate: number;
  ghostTextLatency: number;
  patternMatchCount: number;
}
