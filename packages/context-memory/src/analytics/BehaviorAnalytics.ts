/**
 * Behavior Analytics - Level 3 User Preference Learning
 * 
 * Privacy-first behavior analysis and template effectiveness tracking
 * Chrome Extension Compatible - Local Processing Only
 */

import { TemplateType } from '@promptlint/template-engine';
import {
  OptimizationHistory,
  TemplateSelectionEvent,
  PreferencePattern,
  UserFeedback,
  EffectivenessScore,
  SessionContext,
  TimePattern,
  ModificationEvent
} from '../types/ContextTypes.js';

export class BehaviorAnalytics {
  private sessionId: string;
  private sessionStart: Date;
  private interactionCount: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
  }

  /**
   * Track template selection event for preference learning
   */
  trackTemplateSelection(selection: TemplateSelectionEvent): OptimizationHistory {
    this.interactionCount++;

    // Calculate effectiveness based on user behavior
    const effectiveness = this.calculateEffectiveness(selection);

    // Extract modification events
    const modifications = this.extractModificationEvents(
      selection.originalPrompt,
      selection.userModifications
    );

    return {
      id: this.generateEventId(),
      timestamp: selection.timestamp,
      originalPrompt: selection.originalPrompt,
      selectedTemplate: selection.selectedTemplate,
      domainClassification: selection.domainClassification,
      userModifications: modifications,
      effectiveness,
      sessionId: this.sessionId
    };
  }

  /**
   * Detect preference patterns from historical data
   */
  detectPreferencePatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const patterns: PreferencePattern[] = [];

    // Template frequency patterns
    patterns.push(...this.detectTemplateFrequencyPatterns(history));

    // Domain-template correlation patterns
    patterns.push(...this.detectDomainTemplatePatterns(history));

    // Time-based usage patterns
    patterns.push(...this.detectTimeBasedPatterns(history));

    // Effectiveness patterns
    patterns.push(...this.detectEffectivenessPatterns(history));

    return patterns
      .filter(pattern => pattern.confidence >= 60) // Minimum confidence threshold
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate template effectiveness based on user feedback and behavior
   */
  calculateTemplateEffectiveness(
    templateType: TemplateType,
    userFeedback: UserFeedback
  ): number {
    let effectiveness = userFeedback.rating * 20; // Convert 1-5 to 0-100 scale

    // Adjust based on acceptance
    if (userFeedback.accepted) {
      effectiveness += 20;
    } else {
      effectiveness = Math.max(0, effectiveness - 30);
    }

    // Adjust based on time spent (optimal range: 30-120 seconds)
    const timeSpentSeconds = userFeedback.timeSpent / 1000;
    if (timeSpentSeconds < 10) {
      effectiveness -= 20; // Too quick, might be dismissal
    } else if (timeSpentSeconds > 300) {
      effectiveness -= 15; // Too long, might indicate confusion
    } else if (timeSpentSeconds >= 30 && timeSpentSeconds <= 120) {
      effectiveness += 10; // Optimal engagement time
    }

    // Adjust based on modifications
    if (userFeedback.modifications === 0) {
      effectiveness += 15; // Perfect fit, no changes needed
    } else if (userFeedback.modifications <= 2) {
      effectiveness += 5; // Minor adjustments
    } else if (userFeedback.modifications > 5) {
      effectiveness -= 10; // Significant changes needed
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  /**
   * Analyze user session patterns
   */
  analyzeSessionPatterns(history: OptimizationHistory[]): {
    averageSessionLength: number;
    templatesPerSession: number;
    mostActiveTimeOfDay: number;
    preferredSessionFlow: string[];
  } {
    const sessions = new Map<string, OptimizationHistory[]>();
    
    // Group by session
    history.forEach(entry => {
      if (!sessions.has(entry.sessionId)) {
        sessions.set(entry.sessionId, []);
      }
      sessions.get(entry.sessionId)!.push(entry);
    });

    // Calculate session metrics
    let totalSessionLength = 0;
    let totalTemplateSelections = 0;
    const hourCounts = new Array(24).fill(0);
    const sessionFlows: string[][] = [];

    sessions.forEach(sessionEntries => {
      sessionEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (sessionEntries.length > 0) {
        const sessionStart = sessionEntries[0].timestamp;
        const sessionEnd = sessionEntries[sessionEntries.length - 1].timestamp;
        totalSessionLength += sessionEnd.getTime() - sessionStart.getTime();
        totalTemplateSelections += sessionEntries.length;

        // Track hour of day
        hourCounts[sessionStart.getHours()]++;

        // Track template flow
        const flow = sessionEntries.map(entry => entry.selectedTemplate);
        sessionFlows.push(flow);
      }
    });

    const sessionCount = sessions.size;
    const averageSessionLength = sessionCount > 0 ? totalSessionLength / sessionCount : 0;
    const templatesPerSession = sessionCount > 0 ? totalTemplateSelections / sessionCount : 0;
    const mostActiveTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));

    // Find most common session flow patterns
    const flowPatterns = new Map<string, number>();
    sessionFlows.forEach(flow => {
      const flowKey = flow.slice(0, 3).join('->'); // First 3 templates
      flowPatterns.set(flowKey, (flowPatterns.get(flowKey) || 0) + 1);
    });

    const preferredSessionFlow = Array.from(flowPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([flow]) => flow);

    return {
      averageSessionLength,
      templatesPerSession,
      mostActiveTimeOfDay,
      preferredSessionFlow
    };
  }

  /**
   * Generate user insights from behavior data
   */
  generateUserInsights(history: OptimizationHistory[]): {
    primaryTemplatePreference: TemplateType | null;
    averageEffectiveness: number;
    improvementAreas: string[];
    strengths: string[];
    learningProgress: number;
  } {
    if (history.length === 0) {
      return {
        primaryTemplatePreference: null,
        averageEffectiveness: 0,
        improvementAreas: ['Insufficient data for analysis'],
        strengths: [],
        learningProgress: 0
      };
    }

    // Calculate primary template preference
    const templateCounts = new Map<TemplateType, number>();
    let totalEffectiveness = 0;

    history.forEach(entry => {
      templateCounts.set(
        entry.selectedTemplate,
        (templateCounts.get(entry.selectedTemplate) || 0) + 1
      );
      totalEffectiveness += entry.effectiveness.userSatisfaction;
    });

    const primaryTemplatePreference = Array.from(templateCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const averageEffectiveness = totalEffectiveness / history.length;

    // Identify improvement areas
    const improvementAreas: string[] = [];
    const strengths: string[] = [];

    if (averageEffectiveness < 60) {
      improvementAreas.push('Template selection effectiveness below optimal');
    } else if (averageEffectiveness > 80) {
      strengths.push('High template selection effectiveness');
    }

    const avgModifications = history.reduce(
      (sum, entry) => sum + entry.userModifications.length, 0
    ) / history.length;

    if (avgModifications > 3) {
      improvementAreas.push('Frequent template modifications needed');
    } else if (avgModifications < 1) {
      strengths.push('Templates often used as-is');
    }

    // Calculate learning progress (0-100)
    const learningProgress = Math.min(100, (history.length / 50) * 100);

    return {
      primaryTemplatePreference,
      averageEffectiveness,
      improvementAreas,
      strengths,
      learningProgress
    };
  }

  // Private helper methods

  private calculateEffectiveness(selection: TemplateSelectionEvent): EffectivenessScore {
    // Base effectiveness calculation
    let userSatisfaction = 70; // Default neutral satisfaction
    let promptImprovement = 50;
    
    // Adjust based on modifications
    const modificationCount = selection.userModifications.length;
    if (modificationCount === 0) {
      userSatisfaction = 90;
      promptImprovement = 85;
    } else if (modificationCount <= 2) {
      userSatisfaction = 75;
      promptImprovement = 70;
    } else {
      userSatisfaction = Math.max(30, 70 - (modificationCount * 10));
      promptImprovement = Math.max(20, 50 - (modificationCount * 5));
    }

    // Adjust based on domain classification confidence
    const domainConfidence = selection.domainClassification.confidence;
    if (domainConfidence > 80) {
      userSatisfaction += 10;
      promptImprovement += 10;
    } else if (domainConfidence < 50) {
      userSatisfaction -= 15;
      promptImprovement -= 15;
    }

    return {
      userSatisfaction: Math.max(0, Math.min(100, userSatisfaction)),
      promptImprovement: Math.max(0, Math.min(100, promptImprovement)),
      timeToAcceptance: Date.now() - selection.timestamp.getTime(),
      modificationsCount: modificationCount,
      finallyAccepted: modificationCount < 5 // Assume accepted if not heavily modified
    };
  }

  private extractModificationEvents(
    originalPrompt: string,
    userModifications: string[]
  ): ModificationEvent[] {
    return userModifications.map((modification, index) => ({
      type: 'text_edit' as const,
      originalText: index === 0 ? originalPrompt : userModifications[index - 1],
      modifiedText: modification,
      timestamp: new Date(),
      confidence: 0.8 // Default confidence for text modifications
    }));
  }

  private detectTemplateFrequencyPatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const templateCounts = new Map<TemplateType, number>();
    
    history.forEach(entry => {
      templateCounts.set(
        entry.selectedTemplate,
        (templateCounts.get(entry.selectedTemplate) || 0) + 1
      );
    });

    return Array.from(templateCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([templateType, count]) => ({
        pattern: `high_frequency_${templateType}`,
        confidence: Math.min(100, (count / history.length) * 100),
        frequency: count,
        templateTypes: [templateType],
        domains: [...Array.from(new Set(history
          .filter(h => h.selectedTemplate === templateType)
          .map(h => h.domainClassification.domain)
        ))]
      }));
  }

  private detectDomainTemplatePatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const domainTemplateMap = new Map<string, Map<TemplateType, number>>();

    history.forEach(entry => {
      const domain = entry.domainClassification.domain;
      if (!domainTemplateMap.has(domain)) {
        domainTemplateMap.set(domain, new Map());
      }
      
      const templateMap = domainTemplateMap.get(domain)!;
      templateMap.set(
        entry.selectedTemplate,
        (templateMap.get(entry.selectedTemplate) || 0) + 1
      );
    });

    const patterns: PreferencePattern[] = [];
    
    domainTemplateMap.forEach((templateMap, domain) => {
      const totalForDomain = Array.from(templateMap.values()).reduce((sum, count) => sum + count, 0);
      
      templateMap.forEach((count, templateType) => {
        if (count >= 2 && (count / totalForDomain) >= 0.5) {
          patterns.push({
            pattern: `domain_${domain}_prefers_${templateType}`,
            confidence: (count / totalForDomain) * 100,
            frequency: count,
            templateTypes: [templateType],
            domains: [domain]
          });
        }
      });
    });

    return patterns;
  }

  private detectTimeBasedPatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const hourCounts = new Map<number, number>();
    const dayOfWeekCounts = new Map<number, number>();

    history.forEach(entry => {
      const hour = entry.timestamp.getHours();
      const dayOfWeek = entry.timestamp.getDay();
      
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
    });

    const patterns: PreferencePattern[] = [];

    // Find peak usage hours
    const peakHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (peakHour && peakHour[1] >= 3) {
      patterns.push({
        pattern: `peak_usage_hour_${peakHour[0]}`,
        confidence: (peakHour[1] / history.length) * 100,
        frequency: peakHour[1],
        templateTypes: [...Array.from(new Set(history
          .filter(h => h.timestamp.getHours() === peakHour[0])
          .map(h => h.selectedTemplate)
        ))],
        domains: [],
        timePattern: {
          hourOfDay: [peakHour[0]],
          frequency: 'daily'
        }
      });
    }

    return patterns;
  }

  private detectEffectivenessPatterns(history: OptimizationHistory[]): PreferencePattern[] {
    const highEffectivenessTemplates = history
      .filter(entry => entry.effectiveness.userSatisfaction > 80)
      .map(entry => entry.selectedTemplate);

    const templateEffectiveness = new Map<TemplateType, number[]>();
    
    history.forEach(entry => {
      if (!templateEffectiveness.has(entry.selectedTemplate)) {
        templateEffectiveness.set(entry.selectedTemplate, []);
      }
      templateEffectiveness.get(entry.selectedTemplate)!.push(entry.effectiveness.userSatisfaction);
    });

    const patterns: PreferencePattern[] = [];

    templateEffectiveness.forEach((scores, templateType) => {
      const avgEffectiveness = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      if (avgEffectiveness > 75 && scores.length >= 3) {
        patterns.push({
          pattern: `high_effectiveness_${templateType}`,
          confidence: avgEffectiveness,
          frequency: scores.length,
          templateTypes: [templateType],
          domains: []
        });
      }
    });

    return patterns;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
