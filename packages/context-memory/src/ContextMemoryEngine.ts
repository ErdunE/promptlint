/**
 * Context Memory Engine - Level 3 Core Component
 * 
 * Privacy-first user context management and preference learning
 * Chrome Extension Compatible - Local Storage Only
 */

import { TemplateType } from '@promptlint/template-engine';
import {
  UserContext,
  TemplatePreferences,
  OptimizationHistory,
  PrivacySettings,
  ContextMetadata,
  UserDataExport,
  StorageUsageInfo,
  ContextMemoryConfig,
  ContextMemoryError,
  ContextMemoryErrorType,
  PreferencePattern,
  TemplatePreferenceScore,
  DomainPreference
} from './types/ContextTypes.js';

export class ContextMemoryEngine {
  private config: ContextMemoryConfig;
  private storageKey = 'promptlint_user_context';
  private memoryStorage: Map<string, string> | undefined;

  constructor(config?: Partial<ContextMemoryConfig>) {
    this.config = {
      maxStorageSize: 5 * 1024 * 1024, // 5MB Chrome extension limit
      maxHistoryEntries: 1000,
      defaultRetentionDays: 30,
      learningThreshold: 10, // Minimum interactions for learning
      confidenceMinimum: 0.6,
      enableCompression: true,
      ...config
    };
  }

  /**
   * Store user context with privacy compliance
   */
  async storeUserContext(context: UserContext): Promise<void> {
    try {
      // Validate privacy settings
      if (!context.settings.enableBehaviorTracking) {
        throw new ContextMemoryError(
          ContextMemoryErrorType.PRIVACY_VIOLATION,
          'Behavior tracking is disabled by user privacy settings'
        );
      }

      // Check storage limits
      const storageInfo = await this.getStorageUsage();
      const contextSize = this.calculateContextSize(context);
      
      if (storageInfo.totalBytes + contextSize > this.config.maxStorageSize) {
        await this.performStorageCleanup(context.settings.dataRetentionDays);
      }

      // Update metadata
      context.metadata = {
        ...context.metadata,
        storageUsageBytes: contextSize,
        lastCleanup: new Date(),
        version: '0.6.0'
      };

      context.lastUpdated = new Date();

      // Store with compression if enabled
      const serializedContext = this.config.enableCompression ?
        this.compressContext(context) : JSON.stringify(context);

      await this.setStorageItem(this.storageKey, serializedContext);

    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.STORAGE_FULL,
        `Failed to store user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Retrieve user context with privacy validation
   */
  async retrieveUserContext(userId: string): Promise<UserContext | null> {
    try {
      const storedData = await this.getStorageItem(this.storageKey);
      if (!storedData) {
        return null;
      }

      // Decompress if needed
      const contextData = this.config.enableCompression ?
        this.decompressContext(storedData) : JSON.parse(storedData);

      // Validate user ID match
      if (contextData.userId !== userId) {
        throw new ContextMemoryError(
          ContextMemoryErrorType.INVALID_USER_ID,
          'User ID mismatch in stored context'
        );
      }

      // Check data retention policy
      const retentionLimit = new Date();
      retentionLimit.setDate(retentionLimit.getDate() - contextData.settings.dataRetentionDays);

      if (contextData.lastUpdated < retentionLimit) {
        await this.clearUserData(userId);
        return null;
      }

      // Filter history based on retention policy
      contextData.history = contextData.history.filter(
        (entry: any) => new Date(entry.timestamp) > retentionLimit
      );

      return this.deserializeContext(contextData);

    } catch (error) {
      if (error instanceof ContextMemoryError) {
        throw error;
      }
      throw new ContextMemoryError(
        ContextMemoryErrorType.CORRUPTION_DETECTED,
        `Failed to retrieve user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Analyze user preferences from optimization history
   */
  analyzeUserPreferences(history: OptimizationHistory[]): TemplatePreferences {
    if (history.length < this.config.learningThreshold) {
      return this.getDefaultPreferences();
    }

    // Calculate template preference scores
    const templateUsage = new Map<TemplateType, {
      count: number;
      totalEffectiveness: number;
      lastUsed: Date;
    }>();

    history.forEach(entry => {
      const existing = templateUsage.get(entry.selectedTemplate) || {
        count: 0,
        totalEffectiveness: 0,
        lastUsed: new Date(0)
      };

      templateUsage.set(entry.selectedTemplate, {
        count: existing.count + 1,
        totalEffectiveness: existing.totalEffectiveness + entry.effectiveness.userSatisfaction,
        lastUsed: entry.timestamp > existing.lastUsed ? entry.timestamp : existing.lastUsed
      });
    });

    // Convert to preference scores
    const preferredTemplates: TemplatePreferenceScore[] = Array.from(templateUsage.entries())
      .map(([templateType, usage]) => ({
        templateType,
        score: usage.totalEffectiveness / usage.count,
        frequency: usage.count / history.length,
        lastUsed: usage.lastUsed,
        effectiveness: usage.totalEffectiveness / usage.count
      }))
      .sort((a, b) => b.score - a.score);

    // Analyze domain preferences
    const domainPreferences = this.analyzeDomainPreferences(history);

    // Identify avoided templates (low effectiveness)
    const avoidedTemplates = preferredTemplates
      .filter(pref => pref.effectiveness < 30) // Below 30% effectiveness
      .map(pref => pref.templateType);

    // Calculate learning confidence
    const learningConfidence = Math.min(100, (history.length / 50) * 100);

    return {
      preferredTemplates,
      domainPreferences,
      avoidedTemplates,
      confidenceThreshold: this.config.confidenceMinimum * 100,
      learningConfidence
    };
  }

  /**
   * Clear all user data with privacy compliance
   */
  async clearUserData(userId: string): Promise<void> {
    try {
      await this.removeStorageItem(this.storageKey);
    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.STORAGE_FULL,
        `Failed to clear user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Export user data for transparency
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const context = await this.retrieveUserContext(userId);
    if (!context) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.INVALID_USER_ID,
        'No user context found for export'
      );
    }

    return {
      exportDate: new Date(),
      userId,
      context,
      format: 'json',
      includeHistory: context.settings.exportDataOnRequest
    };
  }

  /**
   * Update privacy settings with immediate effect
   */
  async setPrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    const context = await this.retrieveUserContext(userId);
    if (!context) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.INVALID_USER_ID,
        'No user context found to update privacy settings'
      );
    }

    context.settings = { ...settings };
    
    // If behavior tracking is disabled, clear history
    if (!settings.enableBehaviorTracking) {
      context.history = [];
    }

    await this.storeUserContext(context);
  }

  /**
   * Get current storage usage information
   */
  async getStorageUsage(): Promise<StorageUsageInfo> {
    try {
      const storedData = await this.getStorageItem(this.storageKey);
      const totalBytes = storedData ? new Blob([storedData]).size : 0;
      const availableBytes = this.config.maxStorageSize - totalBytes;
      
      let oldestEntry = new Date();
      let entryCount = 0;

      if (storedData) {
        const context = JSON.parse(storedData);
        entryCount = context.history?.length || 0;
        if (context.history?.length > 0) {
          oldestEntry = new Date(context.history[0].timestamp);
        }
      }

      return {
        totalBytes,
        availableBytes,
        usagePercentage: (totalBytes / this.config.maxStorageSize) * 100,
        oldestEntry,
        entryCount
      };
    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.CORRUPTION_DETECTED,
        'Failed to calculate storage usage',
        error
      );
    }
  }

  /**
   * Detect preference patterns from user behavior
   */
  detectPreferencePatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const patterns: PreferencePattern[] = [];

    // Template frequency patterns
    const templateFrequency = new Map<TemplateType, number>();
    history.forEach(entry => {
      templateFrequency.set(
        entry.selectedTemplate,
        (templateFrequency.get(entry.selectedTemplate) || 0) + 1
      );
    });

    templateFrequency.forEach((frequency, templateType) => {
      if (frequency >= 3) { // Minimum pattern threshold
        patterns.push({
          pattern: `frequent_${templateType}`,
          confidence: Math.min(100, (frequency / history.length) * 100),
          frequency,
          templateTypes: [templateType],
          domains: [...new Set(history
            .filter(h => h.selectedTemplate === templateType)
            .map(h => h.domainClassification.domain)
          )]
        });
      }
    });

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  // Private helper methods

  private analyzeDomainPreferences(history: OptimizationHistory[]): DomainPreference[] {
    const domainUsage = new Map<string, {
      templates: Map<TemplateType, number>;
      totalCount: number;
      effectiveness: number;
    }>();

    history.forEach(entry => {
      const domain = entry.domainClassification.domain;
      const existing = domainUsage.get(domain) || {
        templates: new Map(),
        totalCount: 0,
        effectiveness: 0
      };

      existing.templates.set(
        entry.selectedTemplate,
        (existing.templates.get(entry.selectedTemplate) || 0) + 1
      );
      existing.totalCount++;
      existing.effectiveness += entry.effectiveness.userSatisfaction;

      domainUsage.set(domain, existing);
    });

    return Array.from(domainUsage.entries()).map(([domain, usage]) => {
      const preferredTemplates = Array.from(usage.templates.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3) // Top 3 preferred templates
        .map(([template]) => template);

      return {
        domain,
        preferredTemplates,
        confidence: Math.min(100, (usage.totalCount / history.length) * 100),
        sampleSize: usage.totalCount
      };
    });
  }

  private getDefaultPreferences(): TemplatePreferences {
    return {
      preferredTemplates: [],
      domainPreferences: [],
      avoidedTemplates: [],
      confidenceThreshold: this.config.confidenceMinimum * 100,
      learningConfidence: 0
    };
  }

  private calculateContextSize(context: UserContext): number {
    const jsonString = JSON.stringify(context);
    if (typeof Blob !== 'undefined') {
      return new Blob([jsonString]).size;
    } else {
      // Node.js fallback - calculate byte length
      return Buffer.byteLength(jsonString, 'utf8');
    }
  }

  private compressContext(context: UserContext): string {
    // Simple compression - in production would use proper compression algorithm
    return JSON.stringify(context);
  }

  private decompressContext(data: string): any {
    // Simple decompression - in production would use proper decompression
    return JSON.parse(data);
  }

  private deserializeContext(data: any): UserContext {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      lastUpdated: new Date(data.lastUpdated),
      history: data.history.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }))
    };
  }

  private async performStorageCleanup(retentionDays: number): Promise<void> {
    const context = await this.getStorageItem(this.storageKey);
    if (!context) return;

    const parsedContext = JSON.parse(context);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Remove old history entries
    parsedContext.history = parsedContext.history.filter(
      (entry: any) => new Date(entry.timestamp) > cutoffDate
    );

    await this.setStorageItem(this.storageKey, JSON.stringify(parsedContext));
  }

  // Storage abstraction for Chrome extension compatibility
  private async setStorageItem(key: string, value: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else if (typeof localStorage !== 'undefined') {
      // Fallback to localStorage for development/testing
      localStorage.setItem(key, value);
    } else {
      // In-memory storage for Node.js testing
      if (!this.memoryStorage) {
        this.memoryStorage = new Map();
      }
      this.memoryStorage.set(key, value);
    }
  }

  private async getStorageItem(key: string): Promise<string | null> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result[key] || null);
          }
        });
      });
    } else if (typeof localStorage !== 'undefined') {
      // Fallback to localStorage for development/testing
      return localStorage.getItem(key);
    } else {
      // In-memory storage for Node.js testing
      if (!this.memoryStorage) {
        this.memoryStorage = new Map();
      }
      return this.memoryStorage.get(key) || null;
    }
  }

  private async removeStorageItem(key: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else if (typeof localStorage !== 'undefined') {
      // Fallback to localStorage for development/testing
      localStorage.removeItem(key);
    } else {
      // In-memory storage for Node.js testing
      if (!this.memoryStorage) {
        this.memoryStorage = new Map();
      }
      this.memoryStorage.delete(key);
    }
  }
}
