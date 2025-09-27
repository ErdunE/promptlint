/**
 * Level 4 Contextual Intelligence - Core Type Definitions
 * 
 * Foundational types for contextual understanding and intent analysis
 * Based on Level_4_Architecture_Specifications.md
 */

import { TemplateType } from '@promptlint/shared-types';

// === Core Context Types ===

/**
 * Project context extracted from various indicators
 */
export interface ProjectContext {
  /** Project type classification */
  projectType: ProjectType;
  /** Development stage indicator */
  stage: ProjectStage;
  /** Project phase (for MetaInstruction analysis) */
  phase?: ProjectPhase;
  /** Technology stack indicators */
  techStack: TechStackIndicator[];
  /** Technical stack (for MetaInstruction analysis) */
  technicalStack?: TechnicalStack;
  /** Team size and structure */
  teamStructure: TeamStructure;
  /** Project complexity assessment */
  complexity: ProjectComplexity;
  /** Context extraction confidence */
  confidence: number;
  /** Project timeline information */
  timeline?: {
    urgency: 'immediate' | 'short' | 'medium' | 'long';
    confidence: number;
  };
  /** Project constraints */
  constraints?: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  /** Processing time for analysis */
  processingTime?: number;
}

/**
 * Team standards and conventions
 */
export interface TeamStandards {
  /** Team identifier */
  teamId: string;
  /** Coding standards and conventions */
  codingStandards: CodingStandards;
  /** Communication preferences */
  communicationStyle: CommunicationStyle;
  /** Template preferences at team level */
  templatePreferences: TeamTemplatePreferences;
  /** Quality gates and requirements */
  qualityGates: QualityGate[];
}

/**
 * AI Platform specific constraints and capabilities
 */
export interface PlatformConstraints {
  /** Platform identifier */
  platform: AIPlatform;
  /** Maximum context length */
  maxContextLength: number;
  /** Supported features */
  capabilities: PlatformCapability[];
  /** Rate limiting constraints */
  rateLimits: RateLimitConstraints;
  /** Cost optimization preferences */
  costOptimization: CostOptimization;
}

/**
 * Aggregated context from multiple sources
 */
export interface AggregatedContext {
  /** Project-level context */
  project: ProjectContext;
  /** Team-level standards */
  team: TeamStandards;
  /** Platform-specific constraints */
  platform: PlatformConstraints;
  /** Context reliability score */
  reliability: ContextReliability;
  /** Context freshness timestamp */
  timestamp: number;
}

// === Enumeration Types ===

export enum ProjectType {
  WEB_DEVELOPMENT = 'web_development',
  MOBILE_APP = 'mobile_app',
  DATA_SCIENCE = 'data_science',
  MACHINE_LEARNING = 'machine_learning',
  DEVOPS = 'devops',
  RESEARCH = 'research',
  DOCUMENTATION = 'documentation',
  GENERAL = 'general'
}

export enum ProjectStage {
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  MAINTENANCE = 'maintenance',
  RESEARCH = 'research'
}

export enum AIPlatform {
  CHATGPT = 'chatgpt',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  COPILOT = 'copilot',
  PERPLEXITY = 'perplexity'
}

export enum ProjectComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ENTERPRISE = 'enterprise'
}

// === Supporting Types ===

export interface TechStackIndicator {
  technology: string;
  confidence: number;
  version?: string;
  usage: TechUsage;
}

export enum TechUsage {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TOOL = 'tool',
  DEPRECATED = 'deprecated'
}

export interface TeamStructure {
  size: TeamSize;
  roles: TeamRole[];
  experienceLevel: ExperienceLevel;
  workingStyle: WorkingStyle;
}

export enum TeamSize {
  INDIVIDUAL = 'individual',
  SMALL = 'small',     // 2-5 people
  MEDIUM = 'medium',   // 6-15 people
  LARGE = 'large'      // 16+ people
}

export enum TeamRole {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  PRODUCT_MANAGER = 'product_manager',
  DATA_SCIENTIST = 'data_scientist',
  DEVOPS = 'devops',
  QA = 'qa',
  RESEARCHER = 'researcher'
}

export enum ExperienceLevel {
  JUNIOR = 'junior',
  INTERMEDIATE = 'intermediate',
  SENIOR = 'senior',
  EXPERT = 'expert'
}

export enum WorkingStyle {
  AGILE = 'agile',
  WATERFALL = 'waterfall',
  HYBRID = 'hybrid',
  RESEARCH = 'research'
}

export interface CodingStandards {
  language: string;
  style: string;
  linting: boolean;
  formatting: string;
  documentation: DocumentationLevel;
}

export enum DocumentationLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive',
  ACADEMIC = 'academic'
}

export interface CommunicationStyle {
  formality: FormalityLevel;
  detail: DetailLevel;
  technicality: TechnicalityLevel;
  collaboration: CollaborationStyle;
}

export enum FormalityLevel {
  CASUAL = 'casual',
  PROFESSIONAL = 'professional',
  FORMAL = 'formal',
  ACADEMIC = 'academic'
}

export enum DetailLevel {
  HIGH_LEVEL = 'high_level',
  MODERATE = 'moderate',
  DETAILED = 'detailed',
  EXHAUSTIVE = 'exhaustive'
}

export enum TechnicalityLevel {
  NON_TECHNICAL = 'non_technical',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum CollaborationStyle {
  INDEPENDENT = 'independent',
  COLLABORATIVE = 'collaborative',
  MENTORING = 'mentoring',
  PAIR_PROGRAMMING = 'pair_programming'
}

export interface TeamTemplatePreferences {
  preferredTypes: TemplateType[];
  avoidedTypes: TemplateType[];
  customizations: TemplateCustomization[];
}

export interface TemplateCustomization {
  templateType: TemplateType;
  modifications: string[];
  reasoning: string;
}

export interface QualityGate {
  name: string;
  criteria: QualityCriteria[];
  required: boolean;
}

export interface QualityCriteria {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export enum PlatformCapability {
  CODE_EXECUTION = 'code_execution',
  FILE_UPLOAD = 'file_upload',
  WEB_BROWSING = 'web_browsing',
  IMAGE_ANALYSIS = 'image_analysis',
  STREAMING = 'streaming',
  FUNCTION_CALLING = 'function_calling'
}

export interface RateLimitConstraints {
  requestsPerMinute: number;
  tokensPerMinute: number;
  dailyLimit?: number;
}

export interface CostOptimization {
  priority: CostPriority;
  budgetConstraints: BudgetConstraints;
  optimizationStrategy: OptimizationStrategy;
}

export enum CostPriority {
  MINIMIZE = 'minimize',
  BALANCE = 'balance',
  PERFORMANCE = 'performance',
  UNLIMITED = 'unlimited'
}

export interface BudgetConstraints {
  maxCostPerRequest?: number;
  dailyBudget?: number;
  monthlyBudget?: number;
}

export enum OptimizationStrategy {
  TOKEN_EFFICIENCY = 'token_efficiency',
  CACHING = 'caching',
  BATCH_PROCESSING = 'batch_processing',
  SMART_ROUTING = 'smart_routing'
}

export interface ContextReliability {
  overall: number;
  sources: SourceReliability[];
  confidence: number;
  freshness: number;
}

export interface SourceReliability {
  source: string;
  reliability: number;
  lastUpdated: number;
  dataQuality: DataQuality;
}

export enum DataQuality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNRELIABLE = 'unreliable'
}

// === Context Extraction Types ===

export interface ContextIndicator {
  type: IndicatorType;
  value: string;
  confidence: number;
  source: string;
}

export enum IndicatorType {
  FILE_EXTENSION = 'file_extension',
  PACKAGE_JSON = 'package_json',
  DOCKERFILE = 'dockerfile',
  README_CONTENT = 'readme_content',
  COMMIT_MESSAGES = 'commit_messages',
  FOLDER_STRUCTURE = 'folder_structure',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration'
}

export interface ContextValidation {
  isValid: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: IssueSeverity;
  message: string;
  field: string;
  suggestedFix?: string;
}

export enum IssueSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// === Default Context ===

export interface DefaultContext {
  reason: string;
  fallbackProject: ProjectContext;
  fallbackTeam: TeamStandards;
  fallbackPlatform: PlatformConstraints;
  limitations: string[];
}

// === MetaInstruction Analysis Types ===

export interface MetaInstructionAnalysis {
  constraints: Constraint[];
  projectContext: ProjectContext;
  implicitRequirements: string[];
  userExpertiseLevel: ExpertiseLevel;
  confidence: number;
  processingTime: number;
}

export interface Constraint {
  type: import('./IntentTypes.js').ConstraintType;
  description: string;
  severity: 'low' | 'medium' | 'high';
  extractedFrom: string;
}

// ConstraintType moved to IntentTypes.ts to avoid duplication

export enum ProjectPhase {
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  MAINTENANCE = 'maintenance'
}

export interface TechnicalStack {
  languages: string[];
  frameworks: string[];
  tools: string[];
  platforms: string[];
}

export enum ExpertiseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Phase 4.2 Contextual Reasoning Types
export interface ContextualReasoning {
  projectContext: ProjectContext;
  collaborativeContext: CollaborativeContext;
  platformContext: PlatformContext;
  overallConfidence: number;
  processingTime: number;
}

export interface CollaborativeContext {
  teamStandards: SimpleTeamStandards;
  roleContext: UserRole;
  sharedPreferences: SharedPreferences;
  individualOverrides: any;
  collaborationLevel: 'individual' | 'team' | 'organization' | 'public';
  confidence: number;
  processingTime: number;
}

// Simplified TeamStandards for CollaborativeContextManager
export interface SimpleTeamStandards {
  communicationStyle: string;
  documentationLevel: string;
  codeStyle: string;
  reviewProcess: string;
  qualityGates: string[];
}

export enum UserRole {
  DEVELOPER = 'developer',
  ARCHITECT = 'architect',
  PROJECT_MANAGER = 'project_manager',
  DEVOPS = 'devops',
  QA_ENGINEER = 'qa_engineer',
  STUDENT = 'student'
}

export interface SharedPreferences {
  templateStyle: string;
  detailLevel: string;
  technicalLevel: string;
  responseFormat: string;
}

export interface PlatformContext {
  currentPlatform: AIPlatform;
  capabilities: PlatformCapability[];
  contextWindow: ContextWindowInfo;
  optimizationOpportunities: OptimizationOpportunity[];
  confidence: number;
  processingTime: number;
}

export interface PlatformCapability {
  feature: string;
  supported: boolean;
  limitations?: string[];
}

export interface ContextWindowInfo {
  maxTokens: number;
  currentUsage: number;
  remainingCapacity: number;
}

export interface OptimizationOpportunity {
  type: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  feasibility?: 'low' | 'medium' | 'high';
}

// Template Reasoning System Types
export interface ReasoningChain {
  steps: ReasoningStep[];
  overallConfidence: number;
  documentation: ReasoningDocumentation;
  processingTime: number;
  validated: boolean;
}

export interface ReasoningStep {
  type: string;
  reasoning: {
    decision: string;
    factors: string[];
    confidence: number;
    alternatives: any[];
  };
  impact: 'low' | 'medium' | 'high' | 'critical';
  processingTime?: number;
}

export interface ReasoningDocumentation {
  summary: string;
  keyDecisions: Array<{
    step: string;
    decision: string;
    confidence: number;
  }>;
  totalSteps: number;
  confidenceScore: number;
  executionTime: number;
}

// Meta-Information Engine Types
export interface ReferenceHistory {
  projectHistory: ProjectOptimizationHistory;
  userPatterns: UserOptimizationPatterns;
  successfulInteractions: any[];
  learningTrajectory: LearningTrajectory;
  confidence: number;
  lastUpdated: number;
  processingTime: number;
}

export interface ProjectOptimizationHistory {
  projectId: string;
  totalInteractions: number;
  optimizationPatterns: any[];
  templateEffectiveness: any;
  evolutionTimeline: any[];
  lastActive: number;
}

export interface UserOptimizationPatterns {
  userId: string;
  templatePreferences: any;
  communicationStyle: string;
  expertiseProgression: any[];
  domainFocus: any[];
  consistency: number;
  adaptationRate: number;
}

export interface LearningTrajectory {
  userId: string;
  improvementMetrics: any;
  skillDevelopment: any[];
  adaptationSpeed: number;
  trajectoryConfidence: number;
  predictedNeeds: any[];
}

export interface PlatformState {
  currentPlatform: AIPlatform;
  capabilities: PlatformCapability[];
  contextWindow: ContextWindowInfo;
  optimizationOpportunities: OptimizationOpportunity[];
  confidence: number;
  analysisTimestamp: number;
  processingTime: number;
}
