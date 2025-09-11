/**
 * Level 3 Context Memory Types
 * 
 * Privacy-first user context and preference learning types
 * Chrome Extension Compatible - Local Storage Only
 */

import { TemplateType } from '@promptlint/template-engine';

/**
 * Domain classification result interface (local definition to avoid circular dependency)
 */
export interface DomainClassificationResult {
  domain: string;
  confidence: number;
  subCategory?: string;
  indicators: string[];
}

/**
 * User context storage interface
 */
export interface UserContext {
  userId: string;
  preferences: TemplatePreferences;
  history: OptimizationHistory[];
  settings: PrivacySettings;
  metadata: ContextMetadata;
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Template preference learning data
 */
export interface TemplatePreferences {
  preferredTemplates: TemplatePreferenceScore[];
  domainPreferences: DomainPreference[];
  avoidedTemplates: TemplateType[];
  confidenceThreshold: number;
  learningConfidence: number;
}

export interface TemplatePreferenceScore {
  templateType: TemplateType;
  score: number;
  frequency: number;
  lastUsed: Date;
  effectiveness: number;
}

export interface DomainPreference {
  domain: string;
  preferredTemplates: TemplateType[];
  confidence: number;
  sampleSize: number;
}

/**
 * User interaction history tracking
 */
export interface OptimizationHistory {
  id: string;
  timestamp: Date;
  originalPrompt: string;
  selectedTemplate: TemplateType;
  domainClassification: DomainClassificationResult;
  userModifications: ModificationEvent[];
  effectiveness: EffectivenessScore;
  sessionId: string;
}

export interface ModificationEvent {
  type: 'text_edit' | 'template_switch' | 'manual_override';
  originalText: string;
  modifiedText: string;
  timestamp: Date;
  confidence: number;
}

export interface EffectivenessScore {
  userSatisfaction: number; // 0-100
  promptImprovement: number; // 0-100
  timeToAcceptance: number; // milliseconds
  modificationsCount: number;
  finallyAccepted: boolean;
}

/**
 * Privacy and user control settings
 */
export interface PrivacySettings {
  enableBehaviorTracking: boolean;
  enablePreferenceLearning: boolean;
  dataRetentionDays: number;
  allowAnalytics: boolean;
  exportDataOnRequest: boolean;
  anonymizeData: boolean;
  clearDataOnExit: boolean;
}

/**
 * Context metadata for system management
 */
export interface ContextMetadata {
  version: string;
  totalInteractions: number;
  storageUsageBytes: number;
  lastCleanup: Date;
  migrationVersion: number;
}

/**
 * Template selection event tracking
 */
export interface TemplateSelectionEvent {
  timestamp: Date;
  originalPrompt: string;
  selectedTemplate: TemplateType;
  userModifications: string[];
  domainClassification: DomainClassificationResult;
  sessionContext: SessionContext;
}

export interface SessionContext {
  sessionId: string;
  startTime: Date;
  interactionCount: number;
  currentDomain?: string;
  userAgent: string;
}

/**
 * Preference pattern detection
 */
export interface PreferencePattern {
  pattern: string;
  confidence: number;
  frequency: number;
  templateTypes: TemplateType[];
  domains: string[];
  timePattern?: TimePattern;
}

export interface TimePattern {
  dayOfWeek?: number[];
  hourOfDay?: number[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
}

/**
 * User feedback for effectiveness scoring
 */
export interface UserFeedback {
  rating: number; // 1-5 stars
  accepted: boolean;
  timeSpent: number; // milliseconds
  modifications: number;
  comments?: string;
}

/**
 * Storage management types
 */
export interface StorageUsageInfo {
  totalBytes: number;
  availableBytes: number;
  usagePercentage: number;
  oldestEntry: Date;
  entryCount: number;
}

export interface UserDataExport {
  exportDate: Date;
  userId: string;
  context: UserContext;
  format: 'json' | 'csv';
  includeHistory: boolean;
}

/**
 * Context memory configuration
 */
export interface ContextMemoryConfig {
  maxStorageSize: number;
  maxHistoryEntries: number;
  defaultRetentionDays: number;
  learningThreshold: number;
  confidenceMinimum: number;
  enableCompression: boolean;
}

/**
 * Error types for context memory operations
 */
export enum ContextMemoryErrorType {
  STORAGE_FULL = 'storage_full',
  PRIVACY_VIOLATION = 'privacy_violation',
  INVALID_USER_ID = 'invalid_user_id',
  CORRUPTION_DETECTED = 'corruption_detected',
  MIGRATION_FAILED = 'migration_failed'
}

export class ContextMemoryError extends Error {
  constructor(
    public type: ContextMemoryErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ContextMemoryError';
  }
}
