/**
 * PromptLint Template Effectiveness Tracker
 * Phase 3.2 - Template effectiveness measurement and optimization
 */

import { TemplateType } from '../../shared-types/dist/index.js';
import {
  TemplateEffectiveness,
  TemplateUsageHistory,
  UserInteraction,
  TemplateRecommendation,
  PromptContext,
  EffectivenessMetrics,
  UserSatisfactionIndicator,
  AdaptiveTemplate
} from './types.js';

export class EffectivenessTracker {
  private readonly maxHistoryAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly minUsageForReliability = 3; // minimum usage count for reliable metrics

  /**
   * Track template usage and user interaction
   */
  trackTemplateUsage(
    templateType: TemplateType,
    userInteraction: UserInteraction,
    context: PromptContext
  ): void {
    const usageRecord = {
      timestamp: userInteraction.timestamp,
      templateType,
      interactionType: userInteraction.type,
      context: userInteraction.context,
      metadata: {
        ...userInteraction.metadata,
        domain: context.domain,
        complexity: context.complexity,
        urgency: context.urgency
      }
    };

    // Store usage record (in real implementation, this would go to storage)
    console.log('[EffectivenessTracker] Tracking usage:', usageRecord);
  }

  /**
   * Calculate effectiveness metrics for a template type
   */
  calculateEffectiveness(templateHistory: TemplateUsageHistory[]): TemplateEffectiveness {
    const recentHistory = this.filterRecentHistory(templateHistory);
    
    if (recentHistory.length === 0) {
      return this.getDefaultEffectiveness(templateHistory[0]?.templateType);
    }

    const totalUsage = recentHistory.reduce((sum, h) => sum + h.usageCount, 0);
    const weightedRating = recentHistory.reduce((sum, h) => sum + (h.averageRating * h.usageCount), 0) / totalUsage;
    
    const usageFrequency = this.calculateUsageFrequency(recentHistory);
    const adaptationSuccess = this.calculateAdaptationSuccess(recentHistory);
    const contextRelevance = this.calculateContextRelevance(recentHistory);

    return {
      templateType: recentHistory[0].templateType,
      userSatisfactionScore: weightedRating,
      usageFrequency,
      adaptationSuccess,
      contextRelevance,
      lastUpdated: Date.now()
    };
  }

  /**
   * Identify optimal template for given context
   */
  identifyOptimalTemplateForContext(
    context: PromptContext,
    availableTemplates: AdaptiveTemplate[],
    effectivenessHistory: Record<TemplateType, TemplateEffectiveness>
  ): TemplateRecommendation {
    const templateScores = availableTemplates.map(template => {
      const effectiveness = effectivenessHistory[template.baseTemplate];
      const contextScore = this.calculateContextScore(template, context, effectiveness);
      
      return {
        template,
        score: contextScore,
        reasoning: this.generateEffectivenessReasoning(template, context, effectiveness)
      };
    });

    // Sort by effectiveness score
    templateScores.sort((a, b) => b.score - a.score);

    const bestTemplate = templateScores[0];
    const alternatives = templateScores.slice(1, 4);

    return {
      template: bestTemplate.template,
      confidence: bestTemplate.score,
      reasoning: bestTemplate.reasoning,
      alternativeOptions: alternatives.map(alt => alt.template)
    };
  }

  /**
   * Calculate detailed effectiveness metrics
   */
  calculateDetailedMetrics(
    templateType: TemplateType,
    interactions: UserInteraction[]
  ): EffectivenessMetrics {
    const recentInteractions = interactions.filter(
      interaction => Date.now() - interaction.timestamp < this.maxHistoryAge
    );

    if (recentInteractions.length === 0) {
      return this.getDefaultMetrics();
    }

    const selectionRate = this.calculateSelectionRate(recentInteractions);
    const modificationRate = this.calculateModificationRate(recentInteractions);
    const abandonmentRate = this.calculateAbandonmentRate(recentInteractions);
    const timeToSelection = this.calculateAverageSelectionTime(recentInteractions);
    const satisfactionIndicators = this.calculateSatisfactionIndicators(recentInteractions);

    return {
      selectionRate,
      modificationRate,
      abandonmentRate,
      timeToSelection,
      userSatisfactionIndicators: satisfactionIndicators
    };
  }

  /**
   * Generate effectiveness improvement recommendations
   */
  generateImprovementRecommendations(
    templateType: TemplateType,
    effectiveness: TemplateEffectiveness,
    metrics: EffectivenessMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Low satisfaction score
    if (effectiveness.userSatisfactionScore < 0.6) {
      recommendations.push('Consider improving template structure and clarity');
    }

    // High modification rate
    if (metrics.modificationRate > 0.4) {
      recommendations.push('Template may need more flexibility or better default content');
    }

    // High abandonment rate
    if (metrics.abandonmentRate > 0.3) {
      recommendations.push('Template may be too complex or not well-suited for common use cases');
    }

    // Slow selection time
    if (metrics.timeToSelection > 10000) { // 10 seconds
      recommendations.push('Template may need better preview or clearer description');
    }

    // Low context relevance
    if (effectiveness.contextRelevance < 0.5) {
      recommendations.push('Template may need better context adaptation');
    }

    return recommendations;
  }

  // Private helper methods

  private filterRecentHistory(history: TemplateUsageHistory[]): TemplateUsageHistory[] {
    const cutoff = Date.now() - this.maxHistoryAge;
    return history.filter(h => h.lastUsed > cutoff);
  }

  private getDefaultEffectiveness(templateType: TemplateType): TemplateEffectiveness {
    return {
      templateType,
      userSatisfactionScore: 0.5,
      usageFrequency: 0,
      adaptationSuccess: 0.5,
      contextRelevance: 0.5,
      lastUpdated: Date.now()
    };
  }

  private calculateUsageFrequency(history: TemplateUsageHistory[]): number {
    if (history.length === 0) return 0;

    const totalUsage = history.reduce((sum, h) => sum + h.usageCount, 0);
    const timeSpan = Math.max(1, (Date.now() - Math.min(...history.map(h => h.lastUsed))) / (24 * 60 * 60 * 1000)); // days
    
    return totalUsage / timeSpan; // usage per day
  }

  private calculateAdaptationSuccess(history: TemplateUsageHistory[]): number {
    // Calculate how often templates are used without significant modifications
    let successfulAdaptations = 0;
    let totalAdaptations = 0;

    history.forEach(h => {
      totalAdaptations += h.usageCount;
      // Assume successful adaptation if few modifications
      successfulAdaptations += h.usageCount * (1 - Math.min(1, h.modifications.length / 3));
    });

    return totalAdaptations > 0 ? successfulAdaptations / totalAdaptations : 0.5;
  }

  private calculateContextRelevance(history: TemplateUsageHistory[]): number {
    // Calculate how well template performs across different contexts
    const uniqueContexts = new Set();
    let totalRating = 0;
    let totalUsage = 0;

    history.forEach(h => {
      h.contexts.forEach(context => uniqueContexts.add(context));
      totalRating += h.averageRating * h.usageCount;
      totalUsage += h.usageCount;
    });

    const contextDiversity = Math.min(1, uniqueContexts.size / 5); // Max score at 5+ contexts
    const averageRating = totalUsage > 0 ? totalRating / totalUsage : 0.5;

    return (contextDiversity * 0.3 + averageRating * 0.7);
  }

  private calculateContextScore(
    template: AdaptiveTemplate,
    context: PromptContext,
    effectiveness?: TemplateEffectiveness
  ): number {
    let score = 0.5; // Base score

    // Template's own effectiveness score
    score += template.effectivenessScore * 0.003; // Convert 0-100 to 0-0.3

    // User alignment
    score += template.userAlignment * 0.2;

    // Historical effectiveness if available
    if (effectiveness) {
      score += effectiveness.userSatisfactionScore * 0.3;
      score += effectiveness.contextRelevance * 0.2;
    }

    // Context-specific adjustments
    if (context.complexity > 0.8 && template.content.length > 300) {
      score += 0.1; // Boost for comprehensive templates in complex contexts
    }
    if (context.urgency > 0.8 && template.content.length < 200) {
      score += 0.1; // Boost for concise templates in urgent contexts
    }

    return Math.min(1.0, score);
  }

  private generateEffectivenessReasoning(
    template: AdaptiveTemplate,
    context: PromptContext,
    effectiveness?: TemplateEffectiveness
  ): string[] {
    const reasons: string[] = [];

    if (template.effectivenessScore > 80) {
      reasons.push(`High effectiveness score (${template.effectivenessScore})`);
    }

    if (template.userAlignment > 0.8) {
      reasons.push('Strong alignment with your preferences');
    }

    if (effectiveness) {
      if (effectiveness.userSatisfactionScore > 0.7) {
        reasons.push(`High user satisfaction (${(effectiveness.userSatisfactionScore * 100).toFixed(0)}%)`);
      }
      
      if (effectiveness.usageFrequency > 1) {
        reasons.push(`Frequently used (${effectiveness.usageFrequency.toFixed(1)} times per day)`);
      }
      
      if (effectiveness.contextRelevance > 0.7) {
        reasons.push('Performs well across different contexts');
      }
    }

    if (template.personalizations.length > 0) {
      reasons.push(`Personalized with ${template.personalizations.length} adaptations`);
    }

    return reasons;
  }

  private getDefaultMetrics(): EffectivenessMetrics {
    return {
      selectionRate: 0.5,
      modificationRate: 0.3,
      abandonmentRate: 0.2,
      timeToSelection: 5000, // 5 seconds
      userSatisfactionIndicators: []
    };
  }

  private calculateSelectionRate(interactions: UserInteraction[]): number {
    const selections = interactions.filter(i => i.type === 'selection').length;
    return interactions.length > 0 ? selections / interactions.length : 0;
  }

  private calculateModificationRate(interactions: UserInteraction[]): number {
    const modifications = interactions.filter(i => i.type === 'modification').length;
    const selections = interactions.filter(i => i.type === 'selection').length;
    return selections > 0 ? modifications / selections : 0;
  }

  private calculateAbandonmentRate(interactions: UserInteraction[]): number {
    const abandonments = interactions.filter(i => i.type === 'abandonment').length;
    return interactions.length > 0 ? abandonments / interactions.length : 0;
  }

  private calculateAverageSelectionTime(interactions: UserInteraction[]): number {
    const selectionTimes = interactions
      .filter(i => i.type === 'selection' && i.metadata?.selectionTime)
      .map(i => i.metadata!.selectionTime as number);
    
    if (selectionTimes.length === 0) return 5000; // Default 5 seconds
    
    return selectionTimes.reduce((sum, time) => sum + time, 0) / selectionTimes.length;
  }

  private calculateSatisfactionIndicators(interactions: UserInteraction[]): UserSatisfactionIndicator[] {
    const indicators: UserSatisfactionIndicator[] = [];

    // Quick selection indicator
    const quickSelections = interactions.filter(i => 
      i.type === 'quick_accept' || (i.metadata?.selectionTime && i.metadata.selectionTime < 3000)
    ).length;
    if (quickSelections > 0) {
      indicators.push({
        type: 'quick_selection',
        value: quickSelections / interactions.length,
        confidence: Math.min(1, quickSelections / 5) // Full confidence at 5+ quick selections
      });
    }

    // Repeated use indicator
    const repeatedUse = this.calculateRepeatedUse(interactions);
    if (repeatedUse.value > 0) {
      indicators.push(repeatedUse);
    }

    // Modification pattern indicator
    const modificationPattern = this.calculateModificationPattern(interactions);
    if (modificationPattern.value > 0) {
      indicators.push(modificationPattern);
    }

    return indicators;
  }

  private calculateRepeatedUse(interactions: UserInteraction[]): UserSatisfactionIndicator {
    const selections = interactions.filter(i => i.type === 'selection');
    const timeWindows = new Map<string, number>(); // context -> count

    selections.forEach(interaction => {
      const context = interaction.context;
      timeWindows.set(context, (timeWindows.get(context) || 0) + 1);
    });

    const repeatedContexts = Array.from(timeWindows.values()).filter(count => count > 1).length;
    const totalContexts = timeWindows.size;

    return {
      type: 'repeated_use',
      value: totalContexts > 0 ? repeatedContexts / totalContexts : 0,
      confidence: Math.min(1, totalContexts / 10) // Full confidence at 10+ contexts
    };
  }

  private calculateModificationPattern(interactions: UserInteraction[]): UserSatisfactionIndicator {
    const modifications = interactions.filter(i => i.type === 'modification');
    const selections = interactions.filter(i => i.type === 'selection');

    if (selections.length === 0) {
      return { type: 'modification_pattern', value: 0, confidence: 0 };
    }

    // Low modification rate indicates satisfaction
    const modificationRate = modifications.length / selections.length;
    const satisfactionValue = Math.max(0, 1 - modificationRate);

    return {
      type: 'modification_pattern',
      value: satisfactionValue,
      confidence: Math.min(1, selections.length / 10) // Full confidence at 10+ selections
    };
  }
}
