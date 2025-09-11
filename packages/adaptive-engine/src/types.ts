/**
 * PromptLint Adaptive Engine Types
 * Phase 3.2 - Adaptive Template Generation
 */

import { TemplateCandidate, TemplateType } from '../../shared-types/dist/index.js';
import { LintResult } from '../../shared-types/dist/index.js';

// Core Adaptive Template Types
export interface AdaptiveTemplate {
  // Base template properties
  id: string;
  content: string;
  type: TemplateType;
  score: number;
  generationTime: number;
  metadata?: any;
  
  // Adaptive properties
  baseTemplate: TemplateType;
  personalizations: Personalization[];
  effectivenessScore: number;
  userAlignment: number;
  adaptationMetadata: AdaptationMetadata;
}

export interface Personalization {
  type: PersonalizationType;
  strength: number; // 0-1, how strong this personalization is
  description: string;
  appliedAt: number; // timestamp
}

export enum PersonalizationType {
  STRUCTURAL_PREFERENCE = 'structural_preference',
  PRESENTATION_STYLE = 'presentation_style',
  DETAIL_LEVEL = 'detail_level',
  ORGANIZATION_PATTERN = 'organization_pattern',
  LANGUAGE_FORMALITY = 'language_formality'
}

export interface AdaptationMetadata {
  originalScore: number;
  adaptationTime: number; // processing time in ms
  confidenceLevel: number; // 0-1, confidence in adaptation quality
  fallbackReason?: string; // if adaptation failed
  faithfulnessValidated: boolean;
}

// User Context and Preferences
export interface UserContext {
  preferences: TemplatePreferences;
  history: OptimizationHistory[];
  stats: UserStats;
  settings: AdaptiveSettings;
}

export interface TemplatePreferences {
  templateAffinities: Record<TemplateType, number>; // preference scores 0-1
  domainPreferences: Record<string, TemplateType[]>; // domain -> preferred templates
  complexityHandling: PreferenceComplexity;
  adaptationSpeed: number; // how quickly to adapt (0-1)
  structuralPreferences: StructuralPreference[];
  presentationStyle: PresentationStyle;
  detailLevel: DetailLevel;
  organizationPattern: OrganizationPattern;
}

export interface PreferenceComplexity {
  preferredComplexity: 'simple' | 'moderate' | 'comprehensive';
  adaptToPromptComplexity: boolean;
  maxTemplateLength: number;
  minTemplateLength: number;
}

export interface StructuralPreference {
  type: 'bullets' | 'numbered' | 'sections' | 'paragraphs';
  preference: number; // 0-1 preference score
  contexts: string[]; // contexts where this preference applies
}

export enum PresentationStyle {
  PROFESSIONAL = 'professional',
  CONVERSATIONAL = 'conversational',
  TECHNICAL = 'technical',
  ACCESSIBLE = 'accessible'
}

export enum DetailLevel {
  CONCISE = 'concise',
  BALANCED = 'balanced',
  COMPREHENSIVE = 'comprehensive',
  ADAPTIVE = 'adaptive' // adapts to prompt complexity
}

export enum OrganizationPattern {
  SEQUENTIAL = 'sequential',
  HIERARCHICAL = 'hierarchical',
  CATEGORICAL = 'categorical',
  PRIORITY_BASED = 'priority_based'
}

// Effectiveness Tracking
export interface TemplateEffectiveness {
  templateType: TemplateType;
  userSatisfactionScore: number; // derived from usage patterns
  usageFrequency: number;
  adaptationSuccess: number; // how often adaptations are accepted
  contextRelevance: number; // relevance in different contexts
  lastUpdated: number;
}

export interface EffectivenessMetrics {
  selectionRate: number; // how often this template is selected
  modificationRate: number; // how often users modify it
  abandonmentRate: number; // how often users don't use it
  timeToSelection: number; // average time to select
  userSatisfactionIndicators: UserSatisfactionIndicator[];
}

export interface UserSatisfactionIndicator {
  type: 'quick_selection' | 'repeated_use' | 'modification_pattern' | 'context_alignment';
  value: number;
  confidence: number;
}

// Learning and Adaptation
export interface OptimizationHistory {
  timestamp: number;
  originalPrompt: string;
  selectedTemplate: TemplateCandidate;
  alternativesShown: TemplateCandidate[];
  userModifications?: string[];
  contextTags: string[];
  domain: string;
  effectivenessScore?: number;
}

export interface UserStats {
  totalOptimizations: number;
  averageSelectionTime: number;
  mostUsedTemplates: Record<TemplateType, number>;
  domainDistribution: Record<string, number>;
  adaptationAcceptanceRate: number;
  learningConfidence: number;
}

export interface AdaptiveSettings {
  enablePreferenceLearning: boolean;
  enableTemplateAdaptation: boolean;
  adaptationSpeed: number; // 0-1, how aggressively to adapt
  minimumHistoryForAdaptation: number;
  faithfulnessStrictness: number; // 0-1, how strict faithfulness validation is
}

// Template Recommendation
export interface TemplateRecommendation {
  template: AdaptiveTemplate;
  confidence: number;
  reasoning: string[];
  alternativeOptions: AdaptiveTemplate[];
}

export interface UserInteraction {
  type: 'selection' | 'modification' | 'abandonment' | 'quick_accept';
  timestamp: number;
  templateId: string;
  context: string;
  metadata?: Record<string, any>;
}

// Analysis Types
export interface SemanticAnalysis {
  domain: string;
  complexity: number; // 0-1
  intentClarity: number; // 0-1
  contextRichness: number; // 0-1
  technicalLevel: number; // 0-1
  keywords: string[];
  entities: string[];
}

export interface PromptContext {
  domain: string;
  complexity: number;
  urgency: number;
  technicalLevel: number;
  audienceType: string;
  purposeType: string;
}

// User Feedback
export interface UserFeedback {
  templateId: string;
  rating: number; // 1-5
  improvements?: string[];
  satisfactionLevel: number; // 0-1
  wouldUseAgain: boolean;
  context: string;
  timestamp: number;
}

// Pattern Recognition
export interface UserPreferencePattern {
  templateAffinities: Record<TemplateType, number>;
  domainPreferences: Record<string, TemplateType[]>;
  complexityHandling: PreferenceComplexity;
  adaptationSpeed: number;
  confidence: number; // confidence in this pattern
  lastUpdated: number;
  sampleSize: number; // number of interactions this pattern is based on
}

export interface TemplateUsageHistory {
  templateType: TemplateType;
  usageCount: number;
  averageRating: number;
  contexts: string[];
  modifications: string[];
  timeSpentSelecting: number[];
  lastUsed: number;
}

export interface TemplateSelectionEvent {
  timestamp: number;
  templateType: TemplateType;
  originalPrompt: string;
  selectedTemplate: string;
  alternativesShown: TemplateType[];
  selectionTime: number; // time to select in ms
  userModifications?: string[];
  contextTags: string[];
  domain: string;
  promptComplexity: number;
  userSatisfactionIndicators: {
    quickSelection: boolean; // selected within 5 seconds
    noModifications: boolean; // used as-is
    repeatedUse: boolean; // similar template selected recently
  };
}
