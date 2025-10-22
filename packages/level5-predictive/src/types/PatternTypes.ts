/**
 * Behavioral Pattern Recognition Type Definitions
 * Defines interfaces for advanced pattern detection and workflow analysis
 */

export interface WorkflowPattern {
  id: string;
  type: 'sequence' | 'preference' | 'temporal' | 'domain' | 'error_recovery';
  name: string;
  description: string;
  sequence: string[];
  frequency: number;
  confidence: number;
  lastSeen: number;
  contexts: string[];
  triggers: PatternTrigger[];
  outcomes: PatternOutcome[];
  strength: number; // 0-1, how established this pattern is
}

export interface PatternTrigger {
  type: 'intent' | 'domain' | 'time' | 'context' | 'error';
  value: string;
  weight: number;
}

export interface PatternOutcome {
  action: string;
  probability: number;
  avgTimeDelta: number; // milliseconds between trigger and action
  successRate: number;
}

export interface DetectedPatterns {
  sequences: SequencePattern[];
  preferences: PreferencePattern[];
  workflows: WorkflowPattern[];
  temporal: TemporalPattern[];
  confidence: number;
  totalInteractions: number;
}

export interface SequencePattern {
  id: string;
  sequence: string[];
  frequency: number;
  confidence: number;
  avgTimeBetween: number;
  successRate: number;
  contexts: string[];
  nextPredictions: NextActionPrediction[];
}

export interface PreferencePattern {
  id: string;
  category: 'template' | 'domain' | 'complexity' | 'collaboration' | 'timing';
  preference: string;
  strength: number; // 0-1
  frequency: number;
  contexts: string[];
  evidence: InteractionEvidence[];
}

export interface TemporalPattern {
  id: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  activities: string[];
  frequency: number;
  confidence: number;
}

export interface NextActionPrediction {
  action: string;
  confidence: number;
  reasoning: string;
  estimatedTime: number; // when this might happen (ms from now)
}

export interface InteractionEvidence {
  interactionId: string;
  timestamp: number;
  supportingData: any;
  weight: number;
}

export interface WorkflowContext {
  currentIntent: string;
  domain: string;
  recentActions: string[];
  timeContext: TimeContext;
  collaborationLevel: string;
  urgencyLevel: string;
  projectContext?: ProjectContext;
}

export interface TimeContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWeekend: boolean;
  sessionDuration: number; // minutes in current session
}

export interface ProjectContext {
  projectId: string;
  phase: 'planning' | 'implementation' | 'testing' | 'deployment' | 'maintenance';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  teamSize: number;
}

export interface PredictedAction {
  id: string;
  type: 'next_intent' | 'template_suggestion' | 'workflow_step' | 'error_prevention';
  action: string;
  confidence: number;
  reasoning: string;
  suggestedPrompt?: string;
  estimatedTime?: number;
  relatedPatterns: string[];
  source: 'sequence' | 'preference' | 'temporal' | 'contextual';
}

export interface EmergingPattern {
  id: string;
  type: string;
  description: string;
  occurrences: number;
  requiredOccurrences: number;
  confidence: number;
  firstSeen: number;
  lastSeen: number;
  isEstablished: boolean;
}

export interface PatternLearningMetrics {
  totalPatterns: number;
  establishedPatterns: number;
  emergingPatterns: number;
  predictionAccuracy: number;
  learningRate: number;
  sessionPatterns: number;
}
