/**
 * User Context Storage - Chrome Extension Integration
 * 
 * Privacy-first local storage for user context and preferences
 * Chrome Extension Compatible - Local Storage Only
 */

import {
  UserContext,
  PrivacySettings,
  StorageUsageInfo,
  ContextMemoryError,
  ContextMemoryErrorType
} from '../types/ContextTypes.js';

export class UserContextStorage {
  private static readonly STORAGE_KEY = 'promptlint_user_context';
  private static readonly PRIVACY_KEY = 'promptlint_privacy_settings';
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB Chrome extension limit

  /**
   * Save user context to Chrome extension local storage
   */
  static async saveUserContext(context: UserContext): Promise<void> {
    try {
      // Check storage usage before saving
      const currentUsage = await this.getStorageUsage();
      const contextSize = this.calculateDataSize(context);

      if (currentUsage.totalBytes + contextSize > this.MAX_STORAGE_SIZE) {
        throw new ContextMemoryError(
          ContextMemoryErrorType.STORAGE_FULL,
          `Storage limit exceeded. Current: ${currentUsage.totalBytes}, New data: ${contextSize}, Limit: ${this.MAX_STORAGE_SIZE}`
        );
      }

      // Validate privacy settings before storing
      if (!context.settings.enableBehaviorTracking) {
        // Clear history if behavior tracking is disabled
        context.history = [];
      }

      // Update metadata
      context.lastUpdated = new Date();
      context.metadata.storageUsageBytes = contextSize;

      // Store in Chrome extension storage
      await this.setStorageItem(this.STORAGE_KEY, JSON.stringify(context));

    } catch (error) {
      if (error instanceof ContextMemoryError) {
        throw error;
      }
      throw new ContextMemoryError(
        ContextMemoryErrorType.STORAGE_FULL,
        `Failed to save user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Load user context from Chrome extension local storage
   */
  static async loadUserContext(): Promise<UserContext | null> {
    try {
      const storedData = await this.getStorageItem(this.STORAGE_KEY);
      if (!storedData) {
        return null;
      }

      const context: UserContext = JSON.parse(storedData);

      // Validate and deserialize dates
      context.createdAt = new Date(context.createdAt);
      context.lastUpdated = new Date(context.lastUpdated);
      context.history = context.history.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));

      // Check data retention policy
      const retentionLimit = new Date();
      retentionLimit.setDate(retentionLimit.getDate() - context.settings.dataRetentionDays);

      if (context.lastUpdated < retentionLimit) {
        await this.clearUserContext();
        return null;
      }

      // Filter history based on retention policy
      context.history = context.history.filter(
        entry => entry.timestamp > retentionLimit
      );

      return context;

    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.CORRUPTION_DETECTED,
        `Failed to load user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Clear all user context data
   */
  static async clearUserContext(): Promise<void> {
    try {
      await this.removeStorageItem(this.STORAGE_KEY);
      await this.removeStorageItem(this.PRIVACY_KEY);
    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.STORAGE_FULL,
        `Failed to clear user context: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Get current storage usage information
   */
  static async getStorageUsage(): Promise<StorageUsageInfo> {
    try {
      let totalBytes = 0;
      let entryCount = 0;
      let oldestEntry = new Date();

      // Check main context storage
      const contextData = await this.getStorageItem(this.STORAGE_KEY);
      if (contextData) {
        totalBytes += this.calculateDataSize(contextData);
        const context = JSON.parse(contextData);
        entryCount = context.history?.length || 0;
        if (context.history?.length > 0) {
          oldestEntry = new Date(context.history[0].timestamp);
        }
      }

      // Check privacy settings storage
      const privacyData = await this.getStorageItem(this.PRIVACY_KEY);
      if (privacyData) {
        totalBytes += this.calculateDataSize(privacyData);
      }

      const availableBytes = this.MAX_STORAGE_SIZE - totalBytes;
      const usagePercentage = (totalBytes / this.MAX_STORAGE_SIZE) * 100;

      return {
        totalBytes,
        availableBytes,
        usagePercentage,
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
   * Save privacy settings separately for quick access
   */
  static async savePrivacySettings(settings: PrivacySettings): Promise<void> {
    try {
      await this.setStorageItem(this.PRIVACY_KEY, JSON.stringify(settings));
    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.STORAGE_FULL,
        `Failed to save privacy settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Load privacy settings
   */
  static async loadPrivacySettings(): Promise<PrivacySettings | null> {
    try {
      const storedData = await this.getStorageItem(this.PRIVACY_KEY);
      if (!storedData) {
        return null;
      }
      return JSON.parse(storedData);
    } catch (error) {
      throw new ContextMemoryError(
        ContextMemoryErrorType.CORRUPTION_DETECTED,
        `Failed to load privacy settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Get default privacy settings
   */
  static getDefaultPrivacySettings(): PrivacySettings {
    return {
      enableBehaviorTracking: false, // Opt-in by default
      enablePreferenceLearning: false, // Opt-in by default
      dataRetentionDays: 30,
      allowAnalytics: false,
      exportDataOnRequest: true,
      anonymizeData: true,
      clearDataOnExit: false
    };
  }

  /**
   * Create default user context
   */
  static createDefaultUserContext(userId: string): UserContext {
    const now = new Date();
    
    return {
      userId,
      preferences: {
        preferredTemplates: [],
        domainPreferences: [],
        avoidedTemplates: [],
        confidenceThreshold: 70,
        learningConfidence: 0
      },
      history: [],
      settings: this.getDefaultPrivacySettings(),
      metadata: {
        version: '0.6.0',
        totalInteractions: 0,
        storageUsageBytes: 0,
        lastCleanup: now,
        migrationVersion: 1
      },
      createdAt: now,
      lastUpdated: now
    };
  }

  /**
   * Perform storage cleanup to free space
   */
  static async performCleanup(retentionDays?: number): Promise<void> {
    const context = await this.loadUserContext();
    if (!context) return;

    const cleanupDays = retentionDays || context.settings.dataRetentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cleanupDays);

    // Remove old history entries
    const originalCount = context.history.length;
    context.history = context.history.filter(
      entry => entry.timestamp > cutoffDate
    );

    const removedCount = originalCount - context.history.length;
    
    if (removedCount > 0) {
      context.metadata.lastCleanup = new Date();
      await this.saveUserContext(context);
    }
  }

  /**
   * Export user data for transparency
   */
  static async exportUserData(): Promise<string> {
    const context = await this.loadUserContext();
    const privacySettings = await this.loadPrivacySettings();

    const exportData = {
      exportDate: new Date().toISOString(),
      context,
      privacySettings,
      storageInfo: await this.getStorageUsage()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Validate storage integrity
   */
  static async validateStorageIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if context data is valid
      const context = await this.loadUserContext();
      if (context) {
        if (!context.userId || typeof context.userId !== 'string') {
          errors.push('Invalid user ID in context');
        }

        if (!context.createdAt || !(context.createdAt instanceof Date)) {
          errors.push('Invalid creation date in context');
        }

        if (!Array.isArray(context.history)) {
          errors.push('Invalid history array in context');
        }

        // Check storage usage
        const usage = await this.getStorageUsage();
        if (usage.usagePercentage > 90) {
          warnings.push(`Storage usage high: ${usage.usagePercentage.toFixed(1)}%`);
        }

        if (usage.usagePercentage > 95) {
          errors.push('Storage usage critical: cleanup required');
        }
      }

    } catch (error) {
      errors.push(`Storage validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private helper methods

  private static calculateDataSize(data: any): number {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    if (typeof Blob !== 'undefined') {
      return new Blob([jsonString]).size;
    } else {
      // Node.js fallback - calculate byte length
      return Buffer.byteLength(jsonString, 'utf8');
    }
  }

  // Chrome extension storage abstraction
  private static memoryStorage: Map<string, string> = new Map();

  private static async setStorageItem(key: string, value: string): Promise<void> {
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
      this.memoryStorage.set(key, value);
    }
  }

  private static async getStorageItem(key: string): Promise<string | null> {
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
      return this.memoryStorage.get(key) || null;
    }
  }

  private static async removeStorageItem(key: string): Promise<void> {
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
      this.memoryStorage.delete(key);
    }
  }
}
