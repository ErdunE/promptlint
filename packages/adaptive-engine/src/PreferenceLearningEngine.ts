/**
 * PromptLint Preference Learning Engine
 * Phase 3.2 - User preference learning and pattern recognition
 */

import { TemplateType } from '../../shared-types/dist/index.js';
import {
  UserPreferencePattern,
  OptimizationHistory,
  TemplateSelectionEvent,
  TemplateRecommendation,
  PromptContext,
  UserContext,
  TemplatePreferences,
  PreferenceComplexity,
  StructuralPreference,
  PresentationStyle,
  DetailLevel,
  OrganizationPattern,
  AdaptiveTemplate
} from './types.js';

// TemplateSelectionEvent is imported from types.js, so we don't need to redefine it here

export class PreferenceLearningEngine {
  private readonly minHistoryForLearning = 5;
  private readonly maxHistoryAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly learningRate = 0.1; // how quickly preferences adapt

  /**
   * Analyze user behavior to extract preference patterns
   */
  analyzeUserBehavior(history: OptimizationHistory[]): UserPreferencePattern {
    const recentHistory = this.filterRecentHistory(history);
    
    if (recentHistory.length < this.minHistoryForLearning) {
      return this.getDefaultPreferencePattern();
    }

    const templateAffinities = this.calculateTemplateAffinities(recentHistory);
    const domainPreferences = this.analyzeDomainPreferences(recentHistory);
    const complexityHandling = this.analyzeComplexityHandling(recentHistory);
    const adaptationSpeed = this.calculateAdaptationSpeed(recentHistory);

    const confidence = this.calculatePatternConfidence(recentHistory);

    return {
      templateAffinities,
      domainPreferences,
      complexityHandling,
      adaptationSpeed,
      confidence,
      lastUpdated: Date.now(),
      sampleSize: recentHistory.length
    };
  }

  /**
   * Update preferences based on new template selection
   */
  updatePreferences(
    currentPreferences: TemplatePreferences,
    newSelection: TemplateSelectionEvent
  ): TemplatePreferences {
    const updatedAffinities = { ...currentPreferences.templateAffinities };
    
    // Increase affinity for selected template
    const currentAffinity = updatedAffinities[newSelection.templateType] || 0.5;
    const satisfactionBoost = this.calculateSatisfactionBoost(newSelection);
    updatedAffinities[newSelection.templateType] = Math.min(1.0, 
      currentAffinity + (this.learningRate * satisfactionBoost)
    );

    // Slightly decrease affinity for alternatives that were shown but not selected
    newSelection.alternativesShown.forEach(altType => {
      if (altType !== newSelection.templateType) {
        const currentAlt = updatedAffinities[altType] || 0.5;
        updatedAffinities[altType] = Math.max(0.0, 
          currentAlt - (this.learningRate * 0.1)
        );
      }
    });

    // Update domain preferences
    const updatedDomainPreferences = { ...currentPreferences.domainPreferences };
    if (!updatedDomainPreferences[newSelection.domain]) {
      updatedDomainPreferences[newSelection.domain] = [];
    }
    
    // Add template to domain preferences if not already there
    if (!updatedDomainPreferences[newSelection.domain].includes(newSelection.templateType)) {
      updatedDomainPreferences[newSelection.domain].push(newSelection.templateType);
      // Sort by affinity
      updatedDomainPreferences[newSelection.domain].sort((a, b) => 
        (updatedAffinities[b] || 0) - (updatedAffinities[a] || 0)
      );
      // Keep only top 3 preferences per domain
      updatedDomainPreferences[newSelection.domain] = 
        updatedDomainPreferences[newSelection.domain].slice(0, 3);
    }

    // Update structural preferences based on selection patterns
    const updatedStructuralPreferences = this.updateStructuralPreferences(
      currentPreferences.structuralPreferences,
      newSelection
    );

    // Update presentation style preference
    const updatedPresentationStyle = this.updatePresentationStyle(
      currentPreferences.presentationStyle,
      newSelection
    );

    // Update detail level preference
    const updatedDetailLevel = this.updateDetailLevel(
      currentPreferences.detailLevel,
      newSelection
    );

    return {
      ...currentPreferences,
      templateAffinities: updatedAffinities,
      domainPreferences: updatedDomainPreferences,
      structuralPreferences: updatedStructuralPreferences,
      presentationStyle: updatedPresentationStyle,
      detailLevel: updatedDetailLevel
    };
  }

  /**
   * Predict preferred template for given prompt and context
   */
  predictPreferredTemplate(
    prompt: string,
    context: PromptContext,
    preferences: TemplatePreferences,
    availableTemplates: AdaptiveTemplate[]
  ): TemplateRecommendation {
    const scores = availableTemplates.map(template => ({
      template,
      score: this.calculatePreferenceScore(template, context, preferences),
      reasoning: this.generateRecommendationReasoning(template, context, preferences)
    }));

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    const bestMatch = scores[0];
    const alternatives = scores.slice(1, 4); // Top 3 alternatives

    return {
      template: bestMatch.template,
      confidence: bestMatch.score,
      reasoning: bestMatch.reasoning,
      alternativeOptions: alternatives.map(alt => alt.template)
    };
  }

  /**
   * Calculate confidence in current preference pattern
   */
  calculatePreferenceConfidence(pattern: UserPreferencePattern): number {
    // Base confidence on sample size and consistency
    const sampleSizeConfidence = Math.min(1.0, pattern.sampleSize / 20); // Full confidence at 20+ samples
    
    // Calculate consistency in template affinities
    const affinityValues = Object.values(pattern.templateAffinities);
    const affinityVariance = this.calculateVariance(affinityValues);
    const consistencyConfidence = Math.max(0.3, 1.0 - affinityVariance); // Higher variance = lower confidence

    // Temporal confidence - newer patterns are more confident
    const age = Date.now() - pattern.lastUpdated;
    const temporalConfidence = Math.max(0.5, 1.0 - (age / this.maxHistoryAge));

    return (sampleSizeConfidence * 0.4 + consistencyConfidence * 0.4 + temporalConfidence * 0.2);
  }

  // Private helper methods

  private filterRecentHistory(history: OptimizationHistory[]): OptimizationHistory[] {
    const cutoff = Date.now() - this.maxHistoryAge;
    return history
      .filter(item => item.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  private getDefaultPreferencePattern(): UserPreferencePattern {
    return {
      templateAffinities: {
        [TemplateType.TASK_IO]: 0.6,
        [TemplateType.BULLET]: 0.5,
        [TemplateType.SEQUENTIAL]: 0.4,
        [TemplateType.MINIMAL]: 0.3
      } as Record<TemplateType, number>,
      domainPreferences: {},
      complexityHandling: {
        preferredComplexity: 'moderate',
        adaptToPromptComplexity: true,
        maxTemplateLength: 500,
        minTemplateLength: 50
      },
      adaptationSpeed: 0.5,
      confidence: 0.3, // Low confidence for default pattern
      lastUpdated: Date.now(),
      sampleSize: 0
    };
  }

  private calculateTemplateAffinities(history: OptimizationHistory[]): Record<TemplateType, number> {
    const affinities: Record<string, number> = {};
    const counts: Record<string, number> = {};

    history.forEach(item => {
      const templateType = item.selectedTemplate.type;
      if (!affinities[templateType]) {
        affinities[templateType] = 0;
        counts[templateType] = 0;
      }

      // Calculate satisfaction score based on selection behavior
      const satisfactionScore = this.calculateHistoricalSatisfaction(item);
      affinities[templateType] += satisfactionScore;
      counts[templateType]++;
    });

    // Normalize by count
    Object.keys(affinities).forEach(templateType => {
      affinities[templateType] = affinities[templateType] / counts[templateType];
    });

    return affinities as Record<TemplateType, number>;
  }

  private calculateHistoricalSatisfaction(item: OptimizationHistory): number {
    let satisfaction = 0.5; // Base satisfaction

    // Quick selection indicates satisfaction
    if (item.effectivenessScore && item.effectivenessScore > 0.7) {
      satisfaction += 0.3;
    }

    // Few or no modifications indicates satisfaction
    if (!item.userModifications || item.userModifications.length === 0) {
      satisfaction += 0.2;
    } else if (item.userModifications.length > 3) {
      satisfaction -= 0.2;
    }

    return Math.max(0, Math.min(1, satisfaction));
  }

  private analyzeDomainPreferences(history: OptimizationHistory[]): Record<string, TemplateType[]> {
    const domainPrefs: Record<string, Record<TemplateType, number>> = {};

    history.forEach(item => {
      if (!domainPrefs[item.domain]) {
        domainPrefs[item.domain] = {} as Record<TemplateType, number>;
      }

      const templateType = item.selectedTemplate.type;
      const satisfaction = this.calculateHistoricalSatisfaction(item);
      
      if (!domainPrefs[item.domain][templateType]) {
        domainPrefs[item.domain][templateType] = 0;
      }
      domainPrefs[item.domain][templateType] += satisfaction;
    });

    // Convert to sorted arrays
    const result: Record<string, TemplateType[]> = {};
    Object.keys(domainPrefs).forEach(domain => {
      result[domain] = Object.entries(domainPrefs[domain])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3) // Top 3 per domain
        .map(([templateType]) => templateType as TemplateType);
    });

    return result;
  }

  private analyzeComplexityHandling(history: OptimizationHistory[]): PreferenceComplexity {
    const complexityData = history.map(item => ({
      promptLength: item.originalPrompt.length,
      templateLength: item.selectedTemplate.content.length,
      satisfaction: this.calculateHistoricalSatisfaction(item)
    }));

    // Analyze preferred template length based on prompt complexity
    const avgTemplateLength = complexityData.reduce((sum, item) => sum + item.templateLength, 0) / complexityData.length;
    
    let preferredComplexity: 'simple' | 'moderate' | 'comprehensive';
    if (avgTemplateLength < 150) {
      preferredComplexity = 'simple';
    } else if (avgTemplateLength < 350) {
      preferredComplexity = 'moderate';
    } else {
      preferredComplexity = 'comprehensive';
    }

    // Check if user adapts template complexity to prompt complexity
    const adaptToPromptComplexity = this.checkComplexityAdaptation(complexityData);

    return {
      preferredComplexity,
      adaptToPromptComplexity,
      maxTemplateLength: Math.max(500, avgTemplateLength * 1.5),
      minTemplateLength: Math.min(50, avgTemplateLength * 0.5)
    };
  }

  private checkComplexityAdaptation(complexityData: Array<{promptLength: number, templateLength: number, satisfaction: number}>): boolean {
    // Check correlation between prompt length and template length
    const correlation = this.calculateCorrelation(
      complexityData.map(d => d.promptLength),
      complexityData.map(d => d.templateLength)
    );
    
    return correlation > 0.3; // Positive correlation indicates adaptation
  }

  private calculateAdaptationSpeed(history: OptimizationHistory[]): number {
    // Analyze how quickly user preferences change over time
    if (history.length < 10) return 0.5;

    const recentHistory = history.slice(0, Math.floor(history.length / 2));
    const olderHistory = history.slice(Math.floor(history.length / 2));

    const recentAffinities = this.calculateTemplateAffinities(recentHistory);
    const olderAffinities = this.calculateTemplateAffinities(olderHistory);

    // Calculate change in preferences
    let totalChange = 0;
    let comparisonCount = 0;

    Object.keys(recentAffinities).forEach(templateType => {
      if (olderAffinities[templateType as TemplateType]) {
        totalChange += Math.abs(recentAffinities[templateType as TemplateType] - olderAffinities[templateType as TemplateType]);
        comparisonCount++;
      }
    });

    const avgChange = comparisonCount > 0 ? totalChange / comparisonCount : 0;
    return Math.min(1.0, avgChange * 2); // Scale to 0-1 range
  }

  private calculatePatternConfidence(history: OptimizationHistory[]): number {
    return this.calculatePreferenceConfidence({
      templateAffinities: this.calculateTemplateAffinities(history),
      domainPreferences: this.analyzeDomainPreferences(history),
      complexityHandling: this.analyzeComplexityHandling(history),
      adaptationSpeed: this.calculateAdaptationSpeed(history),
      confidence: 0,
      lastUpdated: Date.now(),
      sampleSize: history.length
    });
  }

  private calculateSatisfactionBoost(selection: TemplateSelectionEvent): number {
    let boost = 0.5; // Base boost

    if (selection.userSatisfactionIndicators.quickSelection) boost += 0.3;
    if (selection.userSatisfactionIndicators.noModifications) boost += 0.2;
    if (selection.userSatisfactionIndicators.repeatedUse) boost += 0.2;

    // Fast selection time indicates satisfaction
    if (selection.selectionTime < 5000) boost += 0.1; // < 5 seconds

    return Math.min(1.0, boost);
  }

  private updateStructuralPreferences(
    currentPreferences: StructuralPreference[],
    selection: TemplateSelectionEvent
  ): StructuralPreference[] {
    // Analyze selected template structure
    const selectedStructure = this.analyzeTemplateStructure(selection.selectedTemplate);
    
    const updatedPreferences = [...currentPreferences];
    const existingPref = updatedPreferences.find(pref => pref.type === selectedStructure);

    if (existingPref) {
      // Boost existing preference
      existingPref.preference = Math.min(1.0, existingPref.preference + this.learningRate);
      if (!existingPref.contexts.includes(selection.domain)) {
        existingPref.contexts.push(selection.domain);
      }
    } else {
      // Add new preference
      updatedPreferences.push({
        type: selectedStructure,
        preference: 0.6,
        contexts: [selection.domain]
      });
    }

    return updatedPreferences;
  }

  private analyzeTemplateStructure(template: string): 'bullets' | 'numbered' | 'sections' | 'paragraphs' {
    if (template.includes('•') || template.includes('-')) return 'bullets';
    if (template.match(/^\d+\./m)) return 'numbered';
    if (template.includes('**') || template.includes('#')) return 'sections';
    return 'paragraphs';
  }

  private updatePresentationStyle(
    currentStyle: PresentationStyle,
    selection: TemplateSelectionEvent
  ): PresentationStyle {
    // Analyze selected template style
    const detectedStyle = this.detectTemplateStyle(selection.selectedTemplate);
    
    // If user consistently selects different style, adapt
    if (detectedStyle !== currentStyle) {
      return detectedStyle;
    }
    
    return currentStyle;
  }

  private detectTemplateStyle(template: string): PresentationStyle {
    const formalWords = ['shall', 'utilize', 'facilitate', 'implement'].filter(word => 
      template.toLowerCase().includes(word)
    ).length;
    const casualWords = ['can', 'use', 'help', 'get'].filter(word => 
      template.toLowerCase().includes(word)
    ).length;
    
    if (formalWords > casualWords) return PresentationStyle.PROFESSIONAL;
    if (casualWords > formalWords) return PresentationStyle.CONVERSATIONAL;
    return PresentationStyle.PROFESSIONAL;
  }

  private updateDetailLevel(
    currentLevel: DetailLevel,
    selection: TemplateSelectionEvent
  ): DetailLevel {
    const templateLength = selection.selectedTemplate.length;
    const promptComplexity = selection.promptComplexity;

    let detectedLevel: DetailLevel;
    if (templateLength < 150) {
      detectedLevel = DetailLevel.CONCISE;
    } else if (templateLength > 350) {
      detectedLevel = DetailLevel.COMPREHENSIVE;
    } else {
      detectedLevel = DetailLevel.BALANCED;
    }

    // Check if user adapts detail level to prompt complexity
    if (promptComplexity > 0.7 && detectedLevel === DetailLevel.COMPREHENSIVE) {
      return DetailLevel.ADAPTIVE;
    }
    if (promptComplexity < 0.3 && detectedLevel === DetailLevel.CONCISE) {
      return DetailLevel.ADAPTIVE;
    }

    return detectedLevel;
  }

  private calculatePreferenceScore(
    template: AdaptiveTemplate,
    context: PromptContext,
    preferences: TemplatePreferences
  ): number {
    let score = 0;

    // Template type affinity
    const affinityScore = preferences.templateAffinities[template.baseTemplate] || 0.5;
    score += affinityScore * 0.4;

    // Domain preference
    const domainTemplates = preferences.domainPreferences[context.domain] || [];
    const domainBonus = domainTemplates.includes(template.baseTemplate) ? 0.3 : 0;
    score += domainBonus;

    // Complexity alignment
    const complexityAlignment = this.calculateComplexityAlignment(template, context, preferences.complexityHandling);
    score += complexityAlignment * 0.2;

    // User alignment from template itself
    score += template.userAlignment * 0.1;

    return Math.min(1.0, score);
  }

  private calculateComplexityAlignment(
    template: AdaptiveTemplate,
    context: PromptContext,
    complexityHandling: PreferenceComplexity
  ): number {
    const templateLength = template.content.length;
    const promptComplexity = context.complexity;

    if (complexityHandling.adaptToPromptComplexity) {
      // User adapts to prompt complexity
      const expectedLength = 100 + (promptComplexity * 300); // 100-400 range
      const lengthDiff = Math.abs(templateLength - expectedLength);
      return Math.max(0, 1.0 - (lengthDiff / 200)); // Penalty for length mismatch
    } else {
      // User has fixed complexity preference
      const preferredRange = this.getComplexityRange(complexityHandling.preferredComplexity);
      if (templateLength >= preferredRange.min && templateLength <= preferredRange.max) {
        return 1.0;
      } else {
        const distanceFromRange = Math.min(
          Math.abs(templateLength - preferredRange.min),
          Math.abs(templateLength - preferredRange.max)
        );
        return Math.max(0, 1.0 - (distanceFromRange / 200));
      }
    }
  }

  private getComplexityRange(complexity: 'simple' | 'moderate' | 'comprehensive'): { min: number; max: number } {
    switch (complexity) {
      case 'simple': return { min: 50, max: 150 };
      case 'moderate': return { min: 150, max: 350 };
      case 'comprehensive': return { min: 350, max: 600 };
    }
  }

  private generateRecommendationReasoning(
    template: AdaptiveTemplate,
    context: PromptContext,
    preferences: TemplatePreferences
  ): string[] {
    const reasons: string[] = [];

    const affinity = preferences.templateAffinities[template.baseTemplate] || 0.5;
    if (affinity > 0.7) {
      reasons.push(`High preference for ${template.baseTemplate} templates (${(affinity * 100).toFixed(0)}%)`);
    }

    const domainTemplates = preferences.domainPreferences[context.domain] || [];
    if (domainTemplates.includes(template.baseTemplate)) {
      reasons.push(`Preferred template type for ${context.domain} domain`);
    }

    if (template.personalizations.length > 0) {
      reasons.push(`Adapted based on ${template.personalizations.length} personal preferences`);
    }

    if (template.userAlignment > 0.8) {
      reasons.push('Strong alignment with your usage patterns');
    }

    return reasons;
  }

  // Utility methods
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}
