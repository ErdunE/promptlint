/**
 * Context Memory Package - Level 3 User Context and Preference Learning
 * 
 * Privacy-first user context management for adaptive template selection
 * Chrome Extension Compatible - Local Storage Only
 */

import { UserContext, OptimizationHistory } from './types/ContextTypes.js';

// Core engine
export { ContextMemoryEngine } from './ContextMemoryEngine.js';

// Analytics and behavior tracking
export { BehaviorAnalytics } from './analytics/BehaviorAnalytics.js';

// Storage management
export { UserContextStorage } from './storage/UserContextStorage.js';

// Types and interfaces
export type {
  UserContext,
  TemplatePreferences,
  OptimizationHistory,
  PrivacySettings,
  ContextMetadata,
  UserDataExport,
  StorageUsageInfo,
  ContextMemoryConfig,
  TemplateSelectionEvent,
  PreferencePattern,
  UserFeedback,
  EffectivenessScore,
  SessionContext,
  ModificationEvent,
  TemplatePreferenceScore,
  DomainPreference,
  TimePattern
} from './types/ContextTypes.js';

export {
  ContextMemoryError,
  ContextMemoryErrorType
} from './types/ContextTypes.js';

// Default configurations
export const DEFAULT_CONTEXT_CONFIG = {
  maxStorageSize: 5 * 1024 * 1024, // 5MB Chrome extension limit
  maxHistoryEntries: 1000,
  defaultRetentionDays: 30,
  learningThreshold: 10,
  confidenceMinimum: 0.6,
  enableCompression: true
};

// Utility functions
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isStorageAvailable(): boolean {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return true;
    }
    if (typeof localStorage !== 'undefined') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function calculateStorageEfficiency(context: UserContext): {
  efficiency: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let efficiency = 100;

  // Check history size vs. learning value
  if (context.history.length > 500 && context.preferences.learningConfidence < 80) {
    efficiency -= 20;
    recommendations.push('Consider reducing history retention for better storage efficiency');
  }

  // Check for duplicate or near-duplicate entries
  const uniquePrompts = new Set(context.history.map((h: OptimizationHistory) => h.originalPrompt.toLowerCase().trim()));
  const duplicateRatio = (context.history.length - uniquePrompts.size) / context.history.length;
  
  if (duplicateRatio > 0.3) {
    efficiency -= 15;
    recommendations.push('High duplicate prompt ratio detected - consider deduplication');
  }

  // Check preference learning progress
  if (context.history.length > 50 && context.preferences.preferredTemplates.length === 0) {
    efficiency -= 10;
    recommendations.push('Preference learning not progressing - check analytics configuration');
  }

  return {
    efficiency: Math.max(0, efficiency),
    recommendations
  };
}
