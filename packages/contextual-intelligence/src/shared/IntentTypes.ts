/**
 * Level 4 Contextual Intelligence - Intent Analysis Type Definitions
 * 
 * Types for multi-layer intent analysis: Instruction, Meta-Instruction, and Interaction
 * Based on Level_4_Architecture_Specifications.md
 */

import { TemplateType } from '@promptlint/shared-types';
import { AggregatedContext, ProjectContext, TeamStandards } from './ContextualTypes.js';

// === Core Intent Analysis Types ===

/**
 * Complete intent analysis result across all layers
 */
export interface IntentAnalysis {
  /** Primary instruction layer analysis */
  instruction: InstructionIntent;
  /** Meta-instruction layer analysis */
  metaInstruction: MetaInstructionIntent;
  /** Interaction layer analysis */
  interaction: InteractionIntent;
  /** Overall intent confidence */
  confidence: number;
  /** Processing performance metrics */
  performance: IntentAnalysisPerformance;
}

/**
 * Primary instruction layer - what the user wants done
 */
export interface InstructionIntent {
  /** Intent category classification */
  category: IntentCategory;
  /** Specific action requested */
  action: ActionType;
  /** Subject/target of the action */
  subject: ActionSubject;
  /** Required output format */
  outputFormat: OutputFormat;
  /** Complexity assessment */
  complexity: IntentComplexity;
  /** Confidence in classification */
  confidence: number;
}

/**
 * Meta-instruction layer - how the user wants it done
 */
export interface MetaInstructionIntent {
  /** Communication style preferences */
  style: CommunicationStyleIntent;
  /** Quality requirements */
  quality: QualityIntent;
  /** Constraints and limitations */
  constraints: ConstraintIntent[];
  /** Context requirements */
  contextRequirements: ContextRequirement[];
  /** Confidence in meta-instruction detection */
  confidence: number;
}

/**
 * Interaction layer - user's relationship with AI and workflow
 */
export interface InteractionIntent {
  /** User's expertise level in the domain */
  userExpertise: ExpertiseLevel;
  /** Collaboration pattern */
  collaborationPattern: CollaborationPattern;
  /** Workflow stage */
  workflowStage: WorkflowStage;
  /** Expected interaction style */
  interactionStyle: InteractionStyle;
  /** Follow-up expectations */
  followUpExpectations: FollowUpExpectation[];
  /** Confidence in interaction analysis */
  confidence: number;
}

// === Intent Classification Enums ===

export enum IntentCategory {
  // Creative & Content
  CREATE = 'create',
  WRITE = 'write',
  DESIGN = 'design',
  BRAINSTORM = 'brainstorm',
  
  // Analysis & Research
  ANALYZE = 'analyze',
  RESEARCH = 'research',
  REVIEW = 'review',
  COMPARE = 'compare',
  
  // Technical & Development
  CODE = 'code',
  DEBUG = 'debug',
  OPTIMIZE = 'optimize',
  DOCUMENT = 'document',
  
  // Problem Solving
  SOLVE = 'solve',
  TROUBLESHOOT = 'troubleshoot',
  PLAN = 'plan',
  STRATEGIZE = 'strategize',
  
  // Learning & Education
  EXPLAIN = 'explain',
  TEACH = 'teach',
  LEARN = 'learn',
  SUMMARIZE = 'summarize',
  
  // Communication
  COMMUNICATE = 'communicate',
  PRESENT = 'present',
  NEGOTIATE = 'negotiate',
  COLLABORATE = 'collaborate'
}

export enum ActionType {
  // Creation Actions
  GENERATE = 'generate',
  BUILD = 'build',
  CONSTRUCT = 'construct',
  COMPOSE = 'compose',
  
  // Analysis Actions
  EXAMINE = 'examine',
  EVALUATE = 'evaluate',
  ASSESS = 'assess',
  INVESTIGATE = 'investigate',
  
  // Transformation Actions
  CONVERT = 'convert',
  REFACTOR = 'refactor',
  TRANSLATE = 'translate',
  ADAPT = 'adapt',
  
  // Organization Actions
  ORGANIZE = 'organize',
  STRUCTURE = 'structure',
  CATEGORIZE = 'categorize',
  PRIORITIZE = 'prioritize',
  
  // Improvement Actions
  ENHANCE = 'enhance',
  IMPROVE = 'improve',
  POLISH = 'polish',
  VALIDATE = 'validate'
}

export interface ActionSubject {
  /** Primary subject type */
  type: SubjectType;
  /** Specific domain */
  domain: string;
  /** Subject complexity */
  complexity: SubjectComplexity;
  /** Additional context about the subject */
  context: string[];
}

export enum SubjectType {
  CODE = 'code',
  DOCUMENT = 'document',
  DATA = 'data',
  DESIGN = 'design',
  PROCESS = 'process',
  SYSTEM = 'system',
  CONTENT = 'content',
  STRATEGY = 'strategy',
  CONCEPT = 'concept',
  PROBLEM = 'problem'
}

export enum SubjectComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  EXPERT_LEVEL = 'expert_level'
}

export enum OutputFormat {
  // Text Formats
  PROSE = 'prose',
  BULLET_POINTS = 'bullet_points',
  NUMBERED_LIST = 'numbered_list',
  OUTLINE = 'outline',
  
  // Structured Formats
  TABLE = 'table',
  CHART = 'chart',
  DIAGRAM = 'diagram',
  FLOWCHART = 'flowchart',
  
  // Code Formats
  CODE_SNIPPET = 'code_snippet',
  FULL_PROGRAM = 'full_program',
  CONFIGURATION = 'configuration',
  SCRIPT = 'script',
  
  // Document Formats
  REPORT = 'report',
  PRESENTATION = 'presentation',
  DOCUMENTATION = 'documentation',
  SPECIFICATION = 'specification',
  
  // Interactive Formats
  STEP_BY_STEP = 'step_by_step',
  TUTORIAL = 'tutorial',
  GUIDE = 'guide',
  CHECKLIST = 'checklist'
}

export enum IntentComplexity {
  TRIVIAL = 'trivial',       // Single-step, obvious solution
  SIMPLE = 'simple',         // Few steps, straightforward
  MODERATE = 'moderate',     // Multiple steps, some complexity
  COMPLEX = 'complex',       // Many steps, significant complexity
  EXPERT = 'expert'          // Requires deep expertise
}

// === Meta-Instruction Types ===

export interface CommunicationStyleIntent {
  /** Desired formality level */
  formality: FormalityLevel;
  /** Technical depth preference */
  technicality: TechnicalityLevel;
  /** Explanation detail level */
  detail: DetailLevel;
  /** Tone preferences */
  tone: TonePreference[];
}

export enum FormalityLevel {
  CASUAL = 'casual',
  CONVERSATIONAL = 'conversational',
  PROFESSIONAL = 'professional',
  FORMAL = 'formal',
  ACADEMIC = 'academic'
}

export enum TechnicalityLevel {
  LAYPERSON = 'layperson',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// DetailLevel is now defined as a type union at the end of the file

export enum TonePreference {
  ENCOURAGING = 'encouraging',
  NEUTRAL = 'neutral',
  DIRECT = 'direct',
  COLLABORATIVE = 'collaborative',
  AUTHORITATIVE = 'authoritative',
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional'
}

export interface QualityIntent {
  /** Accuracy requirements */
  accuracy: AccuracyLevel;
  /** Completeness requirements */
  completeness: CompletenessLevel;
  /** Performance requirements */
  performance: PerformanceRequirement[];
  /** Validation requirements */
  validation: ValidationRequirement[];
}

export enum AccuracyLevel {
  APPROXIMATE = 'approximate',
  GOOD_ENOUGH = 'good_enough',
  HIGH = 'high',
  PRECISE = 'precise',
  PERFECT = 'perfect'
}

export enum CompletenessLevel {
  PARTIAL = 'partial',
  ESSENTIAL = 'essential',
  THOROUGH = 'thorough',
  COMPREHENSIVE = 'comprehensive',
  EXHAUSTIVE = 'exhaustive'
}

export interface PerformanceRequirement {
  metric: PerformanceMetric;
  target: number;
  unit: string;
  priority: RequirementPriority;
}

export enum PerformanceMetric {
  RESPONSE_TIME = 'response_time',
  PROCESSING_SPEED = 'processing_speed',
  MEMORY_USAGE = 'memory_usage',
  ACCURACY_SCORE = 'accuracy_score',
  COMPLETION_TIME = 'completion_time'
}

export enum RequirementPriority {
  NICE_TO_HAVE = 'nice_to_have',
  PREFERRED = 'preferred',
  IMPORTANT = 'important',
  CRITICAL = 'critical',
  MANDATORY = 'mandatory'
}

export interface ValidationRequirement {
  type: ValidationType;
  criteria: ValidationCriteria[];
  automated: boolean;
}

export enum ValidationType {
  SYNTAX = 'syntax',
  LOGIC = 'logic',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  USABILITY = 'usability'
}

export interface ValidationCriteria {
  name: string;
  description: string;
  threshold?: number;
  required: boolean;
}

export interface ConstraintIntent {
  /** Type of constraint */
  type: ConstraintType;
  /** Constraint description */
  description: string;
  /** Severity of constraint */
  severity: ConstraintSeverity;
  /** Flexibility of constraint */
  flexibility: ConstraintFlexibility;
}

export enum ConstraintType {
  TIME = 'time',
  BUDGET = 'budget',
  RESOURCES = 'resources',
  TECHNOLOGY = 'technology',
  COMPLIANCE = 'compliance',
  COMPATIBILITY = 'compatibility',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  SCOPE = 'scope'
}

export enum ConstraintSeverity {
  SOFT = 'soft',           // Preference, can be ignored
  MODERATE = 'moderate',   // Should be followed if possible
  HARD = 'hard',          // Must be followed
  CRITICAL = 'critical'    // Absolute requirement
}

export enum ConstraintFlexibility {
  FLEXIBLE = 'flexible',
  SOMEWHAT_FLEXIBLE = 'somewhat_flexible',
  INFLEXIBLE = 'inflexible',
  ABSOLUTE = 'absolute'
}

export interface ContextRequirement {
  /** Type of context needed */
  type: ContextRequirementType;
  /** Importance of this context */
  importance: RequirementPriority;
  /** Specific context details needed */
  details: string[];
}

export enum ContextRequirementType {
  PROJECT_CONTEXT = 'project_context',
  TEAM_STANDARDS = 'team_standards',
  HISTORICAL_DATA = 'historical_data',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  TECHNICAL_SPECS = 'technical_specs',
  BUSINESS_RULES = 'business_rules',
  USER_PREFERENCES = 'user_preferences'
}

// === Interaction Layer Types ===

export enum ExpertiseLevel {
  NOVICE = 'novice',           // New to the domain
  BEGINNER = 'beginner',       // Basic understanding
  INTERMEDIATE = 'intermediate', // Solid foundation
  ADVANCED = 'advanced',       // Deep expertise
  EXPERT = 'expert'            // Master level
}

export enum CollaborationPattern {
  INDEPENDENT = 'independent',     // Working alone
  CONSULTATION = 'consultation',   // Seeking advice
  COLLABORATION = 'collaboration', // Working together
  MENTORSHIP = 'mentorship',      // Learning relationship
  REVIEW = 'review',              // Peer review
  LEADERSHIP = 'leadership'        // Leading others
}

export enum WorkflowStage {
  EXPLORATION = 'exploration',     // Initial investigation
  PLANNING = 'planning',           // Strategy and design
  IMPLEMENTATION = 'implementation', // Active development
  TESTING = 'testing',             // Validation phase
  REFINEMENT = 'refinement',       // Improvement phase
  COMPLETION = 'completion',       // Final delivery
  MAINTENANCE = 'maintenance'      // Ongoing support
}

export enum InteractionStyle {
  DIRECTIVE = 'directive',         // Clear instructions
  COLLABORATIVE = 'collaborative', // Working together
  CONSULTATIVE = 'consultative',   // Advisory approach
  EDUCATIONAL = 'educational',     // Teaching focused
  EXPLORATORY = 'exploratory'      // Discovery oriented
}

export interface FollowUpExpectation {
  /** Type of follow-up expected */
  type: FollowUpType;
  /** Timeline expectation */
  timeline: TimelineExpectation;
  /** Expected interaction pattern */
  pattern: FollowUpPattern;
}

export enum FollowUpType {
  CLARIFICATION = 'clarification',   // Questions about the response
  ITERATION = 'iteration',           // Refinement requests
  EXTENSION = 'extension',           // Additional related work
  VALIDATION = 'validation',         // Confirmation of approach
  IMPLEMENTATION = 'implementation'   // Help with execution
}

export enum TimelineExpectation {
  IMMEDIATE = 'immediate',           // Right now
  SAME_SESSION = 'same_session',     // Within this conversation
  NEAR_TERM = 'near_term',          // Within hours/days
  MEDIUM_TERM = 'medium_term',       // Within days/weeks
  LONG_TERM = 'long_term'           // Weeks or longer
}

export enum FollowUpPattern {
  ONE_TIME = 'one_time',            // Single follow-up
  ITERATIVE = 'iterative',          // Multiple rounds
  ONGOING = 'ongoing',              // Continuous relationship
  PROJECT_BASED = 'project_based'   // Duration of project
}

// === Performance and Analysis Types ===

export interface IntentAnalysisPerformance {
  /** Total processing time in milliseconds */
  totalTime: number;
  /** Time breakdown by analysis layer */
  layerTimes: LayerPerformance[];
  /** Memory usage metrics */
  memoryUsage: MemoryMetrics;
  /** Confidence scores by layer */
  confidenceBreakdown: ConfidenceBreakdown;
}

export interface LayerPerformance {
  layer: AnalysisLayer;
  processingTime: number;
  confidence: number;
  fallbacksUsed: number;
}

export enum AnalysisLayer {
  INSTRUCTION = 'instruction',
  META_INSTRUCTION = 'meta_instruction',
  INTERACTION = 'interaction',
  AGGREGATION = 'aggregation'
}

export interface MemoryMetrics {
  peakUsage: number;
  averageUsage: number;
  allocationCount: number;
}

export interface ConfidenceBreakdown {
  instruction: number;
  metaInstruction: number;
  interaction: number;
  overall: number;
}

// === Intent Taxonomy and Classification ===

export interface IntentTaxonomy {
  /** Primary classification */
  primary: IntentCategory;
  /** Secondary classifications */
  secondary: IntentCategory[];
  /** Domain-specific tags */
  domainTags: string[];
  /** Complexity indicators */
  complexityIndicators: ComplexityIndicator[];
}

export interface ComplexityIndicator {
  factor: ComplexityFactor;
  impact: ComplexityImpact;
  confidence: number;
}

export enum ComplexityFactor {
  SCOPE = 'scope',                 // How much work is involved
  DEPTH = 'depth',                 // How deep the knowledge required
  BREADTH = 'breadth',             // How many domains involved
  INTERDEPENDENCY = 'interdependency', // How interconnected
  AMBIGUITY = 'ambiguity',         // How unclear the requirements
  NOVELTY = 'novelty'              // How new/unique the problem
}

export enum ComplexityImpact {
  MINIMAL = 'minimal',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXTREME = 'extreme'
}

// === Intent Analysis Context Integration ===

export interface IntentContextAlignment {
  /** How well intent aligns with project context */
  projectAlignment: AlignmentScore;
  /** How well intent aligns with team standards */
  teamAlignment: AlignmentScore;
  /** How well intent aligns with platform capabilities */
  platformAlignment: AlignmentScore;
  /** Overall alignment assessment */
  overallAlignment: AlignmentScore;
  /** Alignment improvement suggestions */
  suggestions: AlignmentSuggestion[];
}

export interface AlignmentScore {
  score: number;           // 0-1 scale
  confidence: number;      // Confidence in the score
  factors: AlignmentFactor[]; // Contributing factors
}

export interface AlignmentFactor {
  factor: string;
  impact: number;          // Positive or negative impact
  explanation: string;
}

export interface AlignmentSuggestion {
  type: SuggestionType;
  description: string;
  impact: SuggestionImpact;
  effort: ImplementationEffort;
}

export enum SuggestionType {
  TEMPLATE_ADJUSTMENT = 'template_adjustment',
  CONTEXT_ENHANCEMENT = 'context_enhancement',
  APPROACH_MODIFICATION = 'approach_modification',
  CONSTRAINT_RELAXATION = 'constraint_relaxation',
  CAPABILITY_UPGRADE = 'capability_upgrade'
}

export enum SuggestionImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  TRANSFORMATIVE = 'transformative'
}

export enum ImplementationEffort {
  TRIVIAL = 'trivial',
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  COMPLEX = 'complex'
}

// Week 2 MetaInstruction types (simplified for now)

// Interaction Analysis Types (placeholder for Week 3)
export interface InteractionAnalysis {
  communicationStyle: CommunicationStyle;
  preferredDetailLevel: DetailLevel;
  urgencyIndicators: UrgencyLevel;
  collaborationContext: CollaborationContext;
  confidence: number;
  processingTime: number;
}

export type CommunicationStyle = 'direct' | 'conversational' | 'formal' | 'technical';
export type DetailLevel = 'minimal' | 'balanced' | 'detailed' | 'comprehensive';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';
export type CollaborationContext = 'individual' | 'team' | 'public' | 'educational';
