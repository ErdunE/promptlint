/**
 * Adaptive Template Engine - Phase 3.2 Enhancement
 * 
 * Enhanced template engine with adaptive generation capabilities
 * Integrates with adaptive-engine for personalized template generation
 */

import { LintResult } from '@promptlint/shared-types';
import { TemplateEngine } from './TemplateEngine.js';
import { TemplateCandidate, TemplateType } from './types/TemplateTypes.js';
import {
  AdaptiveTemplateGenerator,
  PreferenceLearningEngine,
  EffectivenessTracker,
  UserContext,
  AdaptiveTemplate,
  SemanticAnalysis,
  PromptContext,
  OptimizationHistory,
  TemplateSelectionEvent
} from '@promptlint/adaptive-engine';

export class AdaptiveTemplateEngine extends TemplateEngine {
  private adaptiveGenerator: AdaptiveTemplateGenerator;
  private preferenceLearning: PreferenceLearningEngine;
  private effectivenessTracker: EffectivenessTracker;
  private userContextCache: UserContext | null = null;
  private cacheTimestamp = 0;
  private readonly cacheValidityMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.adaptiveGenerator = new AdaptiveTemplateGenerator();
    this.preferenceLearning = new PreferenceLearningEngine();
    this.effectivenessTracker = new EffectivenessTracker();
  }

  /**
   * Generate adaptive template candidates based on user preferences
   */
  async generateAdaptiveCandidates(
    prompt: string,
    lintResult: LintResult,
    userContext?: UserContext
  ): Promise<AdaptiveTemplate[]> {
    const startTime = performance.now();

    try {
      // 1. Generate base templates using Level 2 system
      const baseCandidates = await this.generateCandidates(prompt, lintResult);
      
      if (baseCandidates.length === 0) {
        console.warn('[AdaptiveTemplateEngine] No base candidates generated');
        return [];
      }

      // 2. Load or use provided user context
      const context = userContext || await this.loadUserContext();
      
      // 3. Skip adaptation if disabled or insufficient data
      if (!context.settings.enableTemplateAdaptation || !this.hasMinimumUserData(context)) {
        console.log('[AdaptiveTemplateEngine] Adaptation skipped, returning base templates');
        return this.convertToAdaptiveTemplates(baseCandidates);
      }

      // 4. Create semantic analysis for adaptation
      const semanticAnalysis = await this.createSemanticAnalysis(prompt, lintResult);
      
      // 5. Generate personalized templates
      const adaptiveCandidates = await this.adaptiveGenerator.generatePersonalizedTemplate(
        prompt,
        semanticAnalysis,
        context,
        baseCandidates
      );

      // 6. Track generation for effectiveness measurement
      await this.trackAdaptiveGeneration(prompt, adaptiveCandidates, context);

      const processingTime = performance.now() - startTime;
      console.log(`[AdaptiveTemplateEngine] Generated ${adaptiveCandidates.length} adaptive templates in ${processingTime.toFixed(2)}ms`);

      return adaptiveCandidates;

    } catch (error) {
      console.error('[AdaptiveTemplateEngine] Adaptive generation failed:', error);
      
      // Fallback to base templates on error
      const baseCandidates = await this.generateCandidates(prompt, lintResult);
      return this.convertToAdaptiveTemplates(baseCandidates);
    }
  }

  /**
   * Record template selection for learning
   */
  async recordTemplateSelection(
    selectedTemplate: AdaptiveTemplate,
    originalPrompt: string,
    alternativeTemplates: AdaptiveTemplate[],
    selectionTime: number,
    userModifications?: string[]
  ): Promise<void> {
    try {
      const userContext = await this.loadUserContext();
      
      // Create selection event
      const selectionEvent: TemplateSelectionEvent = {
        timestamp: Date.now(),
        templateType: selectedTemplate.baseTemplate,
        originalPrompt,
        selectedTemplate: selectedTemplate.content,
        alternativesShown: alternativeTemplates.map(t => t.baseTemplate),
        selectionTime,
        userModifications,
        contextTags: this.extractContextTags(originalPrompt),
        domain: await this.detectDomain(originalPrompt),
        promptComplexity: this.assessPromptComplexity(originalPrompt),
        userSatisfactionIndicators: {
          quickSelection: selectionTime < 5000,
          noModifications: !userModifications || userModifications.length === 0,
          repeatedUse: await this.checkRepeatedUse(selectedTemplate.baseTemplate, userContext)
        }
      };

      // Update user preferences
      const updatedPreferences = this.preferenceLearning.updatePreferences(
        userContext.preferences,
        selectionEvent
      );

      // Update user context
      const updatedContext: UserContext = {
        ...userContext,
        preferences: updatedPreferences,
        history: [
          ...userContext.history,
          {
            timestamp: Date.now(),
            originalPrompt,
            selectedTemplate,
            alternativesShown: alternativeTemplates,
            userModifications,
            contextTags: selectionEvent.contextTags,
            domain: selectionEvent.domain,
            effectivenessScore: selectedTemplate.effectivenessScore / 100 // Convert to 0-1 scale
          }
        ].slice(-100), // Keep last 100 selections
        stats: {
          ...userContext.stats,
          totalOptimizations: userContext.stats.totalOptimizations + 1,
          averageSelectionTime: this.updateAverageSelectionTime(
            userContext.stats.averageSelectionTime,
            userContext.stats.totalOptimizations,
            selectionTime
          ),
          mostUsedTemplates: this.updateTemplateUsage(
            userContext.stats.mostUsedTemplates,
            selectedTemplate.baseTemplate
          ),
          adaptationAcceptanceRate: this.calculateAdaptationAcceptance(
            userContext.history,
            selectedTemplate.personalizations.length > 0
          )
        }
      };

      // Save updated context
      await this.saveUserContext(updatedContext);
      
      // Clear cache to force reload
      this.userContextCache = null;

      console.log('[AdaptiveTemplateEngine] Template selection recorded and preferences updated');

    } catch (error) {
      console.error('[AdaptiveTemplateEngine] Failed to record template selection:', error);
    }
  }

  /**
   * Get template recommendations based on effectiveness
   */
  async getTemplateRecommendations(
    prompt: string,
    context: PromptContext
  ): Promise<AdaptiveTemplate[]> {
    const userContext = await this.loadUserContext();
    
    // Generate base candidates
    const lintResult = await this.createBasicLintResult(prompt);
    const baseCandidates = await this.generateCandidates(prompt, lintResult);
    
    // Convert to adaptive templates
    const adaptiveCandidates = await this.generateAdaptiveCandidates(prompt, lintResult, userContext);
    
    // Get effectiveness-based recommendation
    const effectiveness = await this.getTemplateEffectiveness(userContext);
    const recommendation = this.effectivenessTracker.identifyOptimalTemplateForContext(
      context,
      adaptiveCandidates,
      effectiveness
    );

    // Return recommended template first, followed by alternatives
    return [recommendation.template, ...recommendation.alternativeOptions];
  }

  // Private helper methods

  private async loadUserContext(): Promise<UserContext> {
    // Check cache validity
    if (this.userContextCache && (Date.now() - this.cacheTimestamp) < this.cacheValidityMs) {
      return this.userContextCache;
    }

    try {
      // In browser environment, load from chrome.storage or localStorage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const stored = await chrome.storage.local.get(['promptlint_user_context']);
        const context = stored.promptlint_user_context;
        
        if (context) {
          this.userContextCache = context;
          this.cacheTimestamp = Date.now();
          return context;
        }
      } else if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('promptlint_user_context');
        if (stored) {
          const context = JSON.parse(stored);
          this.userContextCache = context;
          this.cacheTimestamp = Date.now();
          return context;
        }
      }
    } catch (error) {
      console.warn('[AdaptiveTemplateEngine] Failed to load user context:', error);
    }

    // Return default context if none found
    const defaultContext = this.createDefaultUserContext();
    this.userContextCache = defaultContext;
    this.cacheTimestamp = Date.now();
    return defaultContext;
  }

  private async saveUserContext(context: UserContext): Promise<void> {
    try {
      // Save to chrome.storage or localStorage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ promptlint_user_context: context });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('promptlint_user_context', JSON.stringify(context));
      }
      
      // Update cache
      this.userContextCache = context;
      this.cacheTimestamp = Date.now();
      
    } catch (error) {
      console.error('[AdaptiveTemplateEngine] Failed to save user context:', error);
    }
  }

  private createDefaultUserContext(): UserContext {
    return {
      preferences: {
        templateAffinities: {
          [TemplateType.TASK_IO]: 0.6,
          [TemplateType.BULLET]: 0.5,
          [TemplateType.SEQUENTIAL]: 0.4,
          [TemplateType.MINIMAL]: 0.3
        },
        domainPreferences: {},
        complexityHandling: {
          preferredComplexity: 'moderate',
          adaptToPromptComplexity: true,
          maxTemplateLength: 500,
          minTemplateLength: 50
        },
        adaptationSpeed: 0.5,
        structuralPreferences: [],
        presentationStyle: 'professional' as const,
        detailLevel: 'balanced' as const,
        organizationPattern: 'sequential' as const
      },
      history: [],
      stats: {
        totalOptimizations: 0,
        averageSelectionTime: 5000,
        mostUsedTemplates: {},
        domainDistribution: {},
        adaptationAcceptanceRate: 0.5,
        learningConfidence: 0.3
      },
      settings: {
        enablePreferenceLearning: true,
        enableTemplateAdaptation: true,
        adaptationSpeed: 0.5,
        minimumHistoryForAdaptation: 5,
        faithfulnessStrictness: 0.95
      }
    };
  }

  private async createSemanticAnalysis(prompt: string, lintResult: LintResult): Promise<SemanticAnalysis> {
    const domain = await this.detectDomain(prompt);
    const complexity = this.assessPromptComplexity(prompt);
    const intentClarity = this.assessIntentClarity(lintResult);
    const contextRichness = this.assessContextRichness(prompt);
    const technicalLevel = this.assessTechnicalLevel(prompt, domain);
    
    return {
      domain,
      complexity,
      intentClarity,
      contextRichness,
      technicalLevel,
      keywords: this.extractKeywords(prompt),
      entities: this.extractEntities(prompt)
    };
  }

  private async detectDomain(prompt: string): Promise<string> {
    try {
      const classification = await this.domainClassifier.classify(prompt);
      return classification.domain;
    } catch (error) {
      console.warn('[AdaptiveTemplateEngine] Domain classification failed:', error);
      return 'general';
    }
  }

  private assessPromptComplexity(prompt: string): number {
    // Simple complexity assessment based on length, technical terms, etc.
    let complexity = 0;
    
    // Length factor
    complexity += Math.min(0.3, prompt.length / 1000);
    
    // Technical terms
    const technicalTerms = ['implement', 'analyze', 'optimize', 'algorithm', 'architecture'];
    const techTermCount = technicalTerms.filter(term => prompt.toLowerCase().includes(term)).length;
    complexity += techTermCount * 0.1;
    
    // Sentence complexity
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    complexity += Math.min(0.2, avgSentenceLength / 100);
    
    return Math.min(1.0, complexity);
  }

  private assessIntentClarity(lintResult: LintResult): number {
    // Higher score for fewer issues
    const maxIssues = 10;
    const issueCount = lintResult.issues.length;
    return Math.max(0.1, 1.0 - (issueCount / maxIssues));
  }

  private assessContextRichness(prompt: string): number {
    // Assess based on context clues, examples, constraints mentioned
    let richness = 0.5; // Base richness
    
    const contextIndicators = ['example', 'constraint', 'requirement', 'context', 'background'];
    const indicatorCount = contextIndicators.filter(indicator => 
      prompt.toLowerCase().includes(indicator)
    ).length;
    
    richness += indicatorCount * 0.1;
    
    return Math.min(1.0, richness);
  }

  private assessTechnicalLevel(prompt: string, domain: string): number {
    const technicalDomains = ['coding', 'engineering', 'data-analysis', 'system-design'];
    let level = technicalDomains.includes(domain) ? 0.6 : 0.3;
    
    const technicalTerms = ['API', 'database', 'algorithm', 'framework', 'architecture', 'implementation'];
    const techTermCount = technicalTerms.filter(term => 
      prompt.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    level += techTermCount * 0.1;
    
    return Math.min(1.0, level);
  }

  private extractKeywords(prompt: string): string[] {
    // Simple keyword extraction
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Return unique words, sorted by frequency
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
    
    return Array.from(wordCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractEntities(prompt: string): string[] {
    // Simple entity extraction - could be enhanced with NLP
    const entities: string[] = [];
    
    // Look for capitalized words (potential proper nouns)
    const words = prompt.split(/\s+/);
    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned.length > 2 && cleaned[0] === cleaned[0].toUpperCase()) {
        entities.push(cleaned);
      }
    });
    
    return [...new Set(entities)].slice(0, 5); // Unique entities, max 5
  }

  private extractContextTags(prompt: string): string[] {
    const tags: string[] = [];
    
    // Domain-specific tags
    if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('program')) {
      tags.push('coding');
    }
    if (prompt.toLowerCase().includes('data') || prompt.toLowerCase().includes('analysis')) {
      tags.push('data-analysis');
    }
    if (prompt.toLowerCase().includes('design') || prompt.toLowerCase().includes('ui')) {
      tags.push('design');
    }
    
    // Intent tags
    if (prompt.toLowerCase().includes('create') || prompt.toLowerCase().includes('build')) {
      tags.push('creation');
    }
    if (prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('review')) {
      tags.push('analysis');
    }
    
    return tags;
  }

  private async checkRepeatedUse(templateType: TemplateType, userContext: UserContext): Promise<boolean> {
    const recentSelections = userContext.history
      .filter(h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .map(h => h.selectedTemplate.type);
    
    const recentUseCount = recentSelections.filter(type => type === templateType).length;
    return recentUseCount >= 2; // Used 2+ times recently
  }

  private updateAverageSelectionTime(currentAvg: number, totalCount: number, newTime: number): number {
    return ((currentAvg * totalCount) + newTime) / (totalCount + 1);
  }

  private updateTemplateUsage(
    currentUsage: Record<TemplateType, number>,
    templateType: TemplateType
  ): Record<TemplateType, number> {
    return {
      ...currentUsage,
      [templateType]: (currentUsage[templateType] || 0) + 1
    };
  }

  private calculateAdaptationAcceptance(history: OptimizationHistory[], wasAdapted: boolean): number {
    const recentHistory = history.slice(-20); // Last 20 selections
    if (recentHistory.length === 0) return 0.5;
    
    const adaptedSelections = recentHistory.filter(h => 
      // Check if template had personalizations (simplified check)
      h.selectedTemplate.content !== h.selectedTemplate.content // This would be more sophisticated in real implementation
    ).length;
    
    return adaptedSelections / recentHistory.length;
  }

  private hasMinimumUserData(context: UserContext): boolean {
    return context.history.length >= context.settings.minimumHistoryForAdaptation;
  }

  private convertToAdaptiveTemplates(baseCandidates: TemplateCandidate[]): AdaptiveTemplate[] {
    return baseCandidates.map(candidate => ({
      ...candidate,
      baseTemplate: candidate.type,
      personalizations: [],
      effectivenessScore: candidate.score,
      userAlignment: 0.5,
      adaptationMetadata: {
        originalScore: candidate.score,
        adaptationTime: 0,
        confidenceLevel: 0.5,
        fallbackReason: 'no_adaptation_applied',
        faithfulnessValidated: true
      }
    }));
  }

  private async trackAdaptiveGeneration(
    prompt: string,
    candidates: AdaptiveTemplate[],
    context: UserContext
  ): Promise<void> {
    try {
      // Track generation event for analytics
      const generationEvent = {
        timestamp: Date.now(),
        promptLength: prompt.length,
        candidatesGenerated: candidates.length,
        adaptationsApplied: candidates.reduce((sum, c) => sum + c.personalizations.length, 0),
        userHistorySize: context.history.length,
        adaptationEnabled: context.settings.enableTemplateAdaptation
      };

      console.log('[AdaptiveTemplateEngine] Generation tracked:', generationEvent);
    } catch (error) {
      console.warn('[AdaptiveTemplateEngine] Failed to track generation:', error);
    }
  }

  private async createBasicLintResult(prompt: string): Promise<LintResult> {
    // Create a basic lint result for fallback scenarios
    return {
      score: Math.max(30, Math.min(90, prompt.length * 2)),
      issues: [],
      metadata: {
        processingTime: 0,
        inputLength: prompt.length,
        timestamp: new Date()
      }
    };
  }

  private async getTemplateEffectiveness(context: UserContext): Promise<Record<TemplateType, any>> {
    // Calculate template effectiveness from user history
    const effectiveness: Record<string, any> = {};
    
    Object.values(TemplateType).forEach(templateType => {
      const templateHistory = context.history.filter(h => h.selectedTemplate.type === templateType);
      
      if (templateHistory.length > 0) {
        const avgEffectiveness = templateHistory.reduce((sum, h) => sum + (h.effectivenessScore || 0.5), 0) / templateHistory.length;
        effectiveness[templateType] = {
          templateType,
          userSatisfactionScore: avgEffectiveness,
          usageFrequency: templateHistory.length / Math.max(1, context.history.length),
          adaptationSuccess: 0.7, // Simplified
          contextRelevance: 0.6, // Simplified
          lastUpdated: Date.now()
        };
      }
    });
    
    return effectiveness;
  }
}
