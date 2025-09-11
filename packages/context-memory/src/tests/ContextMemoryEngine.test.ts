/**
 * Context Memory Engine Tests
 * 
 * Comprehensive testing for Level 3 context memory functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContextMemoryEngine } from '../ContextMemoryEngine.js';
import { BehaviorAnalytics } from '../analytics/BehaviorAnalytics.js';
import { UserContextStorage } from '../storage/UserContextStorage.js';
import {
  UserContext,
  OptimizationHistory,
  TemplateSelectionEvent,
  ContextMemoryError,
  ContextMemoryErrorType
} from '../types/ContextTypes.js';
import { TemplateType } from '@promptlint/template-engine';

describe('ContextMemoryEngine', () => {
  let engine: ContextMemoryEngine;
  let mockUserId: string;
  let mockUserContext: UserContext;

  beforeEach(() => {
    engine = new ContextMemoryEngine();
    mockUserId = 'test_user_123';
    mockUserContext = UserContextStorage.createDefaultUserContext(mockUserId);
    
    // Mock localStorage for testing
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('storeUserContext', () => {
    it('should store user context successfully', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      
      await engine.storeUserContext(mockUserContext);
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'promptlint_user_context',
        expect.stringContaining(mockUserId)
      );
    });

    it('should throw error when behavior tracking is disabled', async () => {
      mockUserContext.settings.enableBehaviorTracking = false;
      
      await expect(engine.storeUserContext(mockUserContext))
        .rejects.toThrow(ContextMemoryError);
    });

    it('should update metadata when storing', async () => {
      const originalVersion = mockUserContext.metadata.version;
      
      await engine.storeUserContext(mockUserContext);
      
      expect(mockUserContext.metadata.version).toBe('0.6.0');
      expect(mockUserContext.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('retrieveUserContext', () => {
    it('should return null when no context exists', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      const result = await engine.retrieveUserContext(mockUserId);
      
      expect(result).toBeNull();
    });

    it('should retrieve and deserialize user context', async () => {
      const storedData = JSON.stringify(mockUserContext);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      
      const result = await engine.retrieveUserContext(mockUserId);
      
      expect(result).toBeTruthy();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for user ID mismatch', async () => {
      const differentUserContext = { ...mockUserContext, userId: 'different_user' };
      const storedData = JSON.stringify(differentUserContext);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      
      await expect(engine.retrieveUserContext(mockUserId))
        .rejects.toThrow(ContextMemoryError);
    });

    it('should clear expired data based on retention policy', async () => {
      const expiredContext = { 
        ...mockUserContext, 
        lastUpdated: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        settings: { ...mockUserContext.settings, dataRetentionDays: 30 }
      };
      const storedData = JSON.stringify(expiredContext);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      
      const result = await engine.retrieveUserContext(mockUserId);
      
      expect(result).toBeNull();
      expect(removeItemSpy).toHaveBeenCalled();
    });
  });

  describe('analyzeUserPreferences', () => {
    it('should return default preferences for insufficient data', () => {
      const shortHistory: OptimizationHistory[] = [];
      
      const preferences = engine.analyzeUserPreferences(shortHistory);
      
      expect(preferences.preferredTemplates).toHaveLength(0);
      expect(preferences.learningConfidence).toBe(0);
    });

    it('should analyze template preferences from history', () => {
      const history: OptimizationHistory[] = [
        createMockHistoryEntry('bullet', 85),
        createMockHistoryEntry('bullet', 90),
        createMockHistoryEntry('task_io', 70),
        createMockHistoryEntry('bullet', 88),
        createMockHistoryEntry('sequential', 75),
        // Add more entries to meet learning threshold
        ...Array(6).fill(null).map(() => createMockHistoryEntry('bullet', 85))
      ];
      
      const preferences = engine.analyzeUserPreferences(history);
      
      expect(preferences.preferredTemplates.length).toBeGreaterThan(0);
      expect(preferences.preferredTemplates[0].templateType).toBe('bullet');
      expect(preferences.learningConfidence).toBeGreaterThan(0);
    });

    it('should identify avoided templates', () => {
      const history: OptimizationHistory[] = [
        ...Array(8).fill(null).map(() => createMockHistoryEntry('bullet', 85)),
        ...Array(3).fill(null).map(() => createMockHistoryEntry('minimal', 25)) // Low effectiveness
      ];
      
      const preferences = engine.analyzeUserPreferences(history);
      
      expect(preferences.avoidedTemplates).toContain('minimal');
    });

    it('should calculate learning confidence based on history size', () => {
      const smallHistory = Array(10).fill(null).map(() => createMockHistoryEntry('bullet', 85));
      const largeHistory = Array(50).fill(null).map(() => createMockHistoryEntry('bullet', 85));
      
      const smallPrefs = engine.analyzeUserPreferences(smallHistory);
      const largePrefs = engine.analyzeUserPreferences(largeHistory);
      
      expect(largePrefs.learningConfidence).toBeGreaterThan(smallPrefs.learningConfidence);
    });
  });

  describe('clearUserData', () => {
    it('should remove user data from storage', async () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      
      await engine.clearUserData(mockUserId);
      
      expect(removeItemSpy).toHaveBeenCalledWith('promptlint_user_context');
    });
  });

  describe('exportUserData', () => {
    it('should export user data when context exists', async () => {
      const storedData = JSON.stringify(mockUserContext);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      
      const exportData = await engine.exportUserData(mockUserId);
      
      expect(exportData.userId).toBe(mockUserId);
      expect(exportData.context).toBeTruthy();
      expect(exportData.exportDate).toBeInstanceOf(Date);
    });

    it('should throw error when no context exists for export', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      await expect(engine.exportUserData(mockUserId))
        .rejects.toThrow(ContextMemoryError);
    });
  });

  describe('setPrivacySettings', () => {
    it('should update privacy settings and clear history when tracking disabled', async () => {
      // Setup existing context
      const contextWithHistory = {
        ...mockUserContext,
        history: [createMockHistoryEntry('bullet', 85)]
      };
      const storedData = JSON.stringify(contextWithHistory);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      
      const newSettings = {
        ...mockUserContext.settings,
        enableBehaviorTracking: false
      };
      
      await engine.setPrivacySettings(mockUserId, newSettings);
      
      // Verify settings were updated and history cleared
      expect(setItemSpy).toHaveBeenCalled();
      const savedData = JSON.parse(setItemSpy.mock.calls[0][1]);
      expect(savedData.settings.enableBehaviorTracking).toBe(false);
      expect(savedData.history).toHaveLength(0);
    });
  });

  describe('getStorageUsage', () => {
    it('should calculate storage usage correctly', async () => {
      const storedData = JSON.stringify(mockUserContext);
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(storedData);
      
      const usage = await engine.getStorageUsage();
      
      expect(usage.totalBytes).toBeGreaterThan(0);
      expect(usage.availableBytes).toBeGreaterThan(0);
      expect(usage.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(usage.usagePercentage).toBeLessThanOrEqual(100);
    });

    it('should return zero usage when no data exists', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      const usage = await engine.getStorageUsage();
      
      expect(usage.totalBytes).toBe(0);
      expect(usage.entryCount).toBe(0);
    });
  });

  describe('detectPreferencePatterns', () => {
    it('should detect template frequency patterns', () => {
      const history: OptimizationHistory[] = [
        ...Array(5).fill(null).map(() => createMockHistoryEntry('bullet', 85)),
        createMockHistoryEntry('task_io', 70),
        createMockHistoryEntry('sequential', 75)
      ];
      
      const patterns = engine.detectPreferencePatterns(history);
      
      expect(patterns.length).toBeGreaterThan(0);
      const bulletPattern = patterns.find(p => p.pattern.includes('bullet'));
      expect(bulletPattern).toBeTruthy();
      expect(bulletPattern?.confidence).toBeGreaterThan(60);
    });

    it('should filter patterns by minimum confidence threshold', () => {
      const history: OptimizationHistory[] = [
        createMockHistoryEntry('bullet', 85),
        createMockHistoryEntry('task_io', 70)
      ];
      
      const patterns = engine.detectPreferencePatterns(history);
      
      // Should not include low-confidence patterns
      patterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThanOrEqual(60);
      });
    });
  });
});

describe('BehaviorAnalytics', () => {
  let analytics: BehaviorAnalytics;

  beforeEach(() => {
    analytics = new BehaviorAnalytics();
  });

  describe('trackTemplateSelection', () => {
    it('should create optimization history from selection event', () => {
      const selectionEvent: TemplateSelectionEvent = {
        timestamp: new Date(),
        originalPrompt: 'test prompt',
        selectedTemplate: 'bullet' as TemplateType,
        userModifications: ['modified prompt'],
        domainClassification: {
          domain: 'code',
          confidence: 85,
          indicators: ['test']
        },
        sessionContext: {
          sessionId: 'test_session',
          startTime: new Date(),
          interactionCount: 1,
          userAgent: 'test'
        }
      };
      
      const history = analytics.trackTemplateSelection(selectionEvent);
      
      expect(history.originalPrompt).toBe('test prompt');
      expect(history.selectedTemplate).toBe('bullet');
      expect(history.effectiveness.userSatisfaction).toBeGreaterThan(0);
    });
  });

  describe('calculateTemplateEffectiveness', () => {
    it('should calculate effectiveness based on user feedback', () => {
      const userFeedback = {
        rating: 4,
        accepted: true,
        timeSpent: 60000, // 60 seconds
        modifications: 1,
        comments: 'Good template'
      };
      
      const effectiveness = analytics.calculateTemplateEffectiveness('bullet' as TemplateType, userFeedback);
      
      expect(effectiveness).toBeGreaterThan(70);
      expect(effectiveness).toBeLessThanOrEqual(100);
    });

    it('should penalize low ratings and rejection', () => {
      const badFeedback = {
        rating: 1,
        accepted: false,
        timeSpent: 5000, // 5 seconds (too quick)
        modifications: 10, // Too many modifications
      };
      
      const effectiveness = analytics.calculateTemplateEffectiveness('bullet' as TemplateType, badFeedback);
      
      expect(effectiveness).toBeLessThan(50);
    });
  });

  describe('generateUserInsights', () => {
    it('should generate insights from user history', () => {
      const history: OptimizationHistory[] = [
        ...Array(5).fill(null).map(() => createMockHistoryEntry('bullet', 85)),
        createMockHistoryEntry('task_io', 70)
      ];
      
      const insights = analytics.generateUserInsights(history);
      
      expect(insights.primaryTemplatePreference).toBe('bullet');
      expect(insights.averageEffectiveness).toBeGreaterThan(70);
      expect(insights.learningProgress).toBeGreaterThan(0);
    });

    it('should return default insights for empty history', () => {
      const insights = analytics.generateUserInsights([]);
      
      expect(insights.primaryTemplatePreference).toBeNull();
      expect(insights.averageEffectiveness).toBe(0);
      expect(insights.improvementAreas).toContain('Insufficient data for analysis');
    });
  });
});

// Helper functions
function createMockHistoryEntry(templateType: TemplateType, satisfaction: number): OptimizationHistory {
  return {
    id: `test_${Date.now()}_${Math.random()}`,
    timestamp: new Date(),
    originalPrompt: 'test prompt',
    selectedTemplate: templateType,
    domainClassification: {
      domain: 'code',
      confidence: 85,
      indicators: ['test']
    },
    userModifications: [],
    effectiveness: {
      userSatisfaction: satisfaction,
      promptImprovement: satisfaction,
      timeToAcceptance: 30000,
      modificationsCount: 0,
      finallyAccepted: true
    },
    sessionId: 'test_session'
  };
}
