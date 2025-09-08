/**
 * Context-Aware Rephrase Service - Level 3 Integration
 * 
 * Enhanced rephrase service with user context memory and preference learning
 * Integrates Level 2 Pattern Recognition with Level 3 Adaptive Intelligence
 */

import { createRephraseServiceWithStoredKey, createApiKeyStorage, testApiKey } from '../../../../packages/llm-service/dist/index.js';
import { RephraseResult, RephraseRequest, RephraseError, RephraseErrorType, LintResult, LintRuleType, LintIssue } from '../../../../packages/shared-types/dist/index.js';
import { TemplateEngine, TemplateCandidate } from '../../../../packages/template-engine/dist/template-engine.js';
import { analyzePrompt } from '../../../../packages/rules-engine/dist/index.js';
import { 
  ContextMemoryEngine, 
  BehaviorAnalytics, 
  UserContextStorage,
  UserContext,
  TemplateSelectionEvent,
  OptimizationHistory,
  generateUserId,
  isStorageAvailable
} from '../../../../packages/context-memory/dist/context-memory.es.js';

export interface ContextAwareRephraseServiceStatus {
  available: boolean;
  hasApiKey: boolean;
  contextMemoryEnabled: boolean;
  userId?: string;
  error?: string;
}

export class ContextAwareRephraseService {
  private rephraseService: any = null;
  private apiKeyStorage = createApiKeyStorage();
  private isInitialized = false;
  private templateEngine = new TemplateEngine();
  
  // Level 3 components
  private contextMemoryEngine: ContextMemoryEngine;
  private behaviorAnalytics: BehaviorAnalytics;
  private currentUserId: string | null = null;
  private userContext: UserContext | null = null;

  constructor() {
    this.contextMemoryEngine = new ContextMemoryEngine();
    this.behaviorAnalytics = new BehaviorAnalytics();
  }

  /**
   * Initialize the context-aware rephrase service
   */
  async initialize(): Promise<ContextAwareRephraseServiceStatus> {
    try {
      // Initialize Level 2 functionality
      const hasApiKey = await this.apiKeyStorage.hasKey();
      
      if (hasApiKey) {
        this.rephraseService = await createRephraseServiceWithStoredKey();
        if (this.rephraseService) {
          const available = await this.rephraseService.isAvailable();
          this.isInitialized = available;
        }
      }

      // Initialize Level 3 context memory
      const contextMemoryEnabled = await this.initializeContextMemory();
      
      return {
        available: this.isInitialized,
        hasApiKey,
        contextMemoryEnabled,
        userId: this.currentUserId || undefined,
        error: this.isInitialized ? undefined : 'Service not available'
      };

    } catch (error) {
      console.error('[PromptLint Context-Aware] Initialization failed:', error);
      return {
        available: false,
        hasApiKey: false,
        contextMemoryEnabled: false,
        error: error instanceof Error ? error.message : 'Initialization failed'
      };
    }
  }

  /**
   * Generate templates with user context awareness
   */
  async generateContextAwareTemplates(
    prompt: string,
    lintResult: LintResult
  ): Promise<TemplateCandidate[]> {
    try {
      // Generate templates using Level 2 system
      const baseCandidates = await this.templateEngine.generateCandidates(prompt, lintResult);
      
      // Apply user preference influence if context is available
      let enhancedCandidates = baseCandidates;
      
      if (this.userContext && this.userContext.settings.enablePreferenceLearning) {
        enhancedCandidates = await this.applyUserPreferences(baseCandidates, prompt, lintResult);
      }

      // Track template generation for future learning
      if (this.userContext && this.userContext.settings.enableBehaviorTracking) {
        await this.trackTemplateGeneration(prompt, enhancedCandidates, lintResult);
      }

      return enhancedCandidates;

    } catch (error) {
      console.error('[PromptLint Context-Aware] Template generation failed:', error);
      // Fallback to Level 2 functionality
      return await this.templateEngine.generateCandidates(prompt, lintResult);
    }
  }

  /**
   * Enhanced rephrase with context awareness
   */
  async rephrase(originalPrompt: string): Promise<RephraseResult> {
    if (!this.isInitialized) {
      throw new RephraseError(
        RephraseErrorType.SERVICE_UNAVAILABLE,
        'Rephrase service not initialized. Please configure your OpenAI API key.'
      );
    }

    if (!originalPrompt || originalPrompt.trim().length === 0) {
      throw new RephraseError(
        RephraseErrorType.INVALID_REQUEST,
        'Cannot rephrase empty prompt'
      );
    }

    try {
      const request: RephraseRequest = {
        originalPrompt: originalPrompt.trim(),
        candidateCount: 3,
        context: {
          targetSystem: this.detectTargetSystem(),
          domain: await this.detectDomainWithContext(originalPrompt),
          responseStyle: await this.getPreferredResponseStyle()
        }
      };

      const result = await this.rephraseService.rephrase(request);
      
      // Track successful rephrase for learning
      if (this.userContext && this.userContext.settings.enableBehaviorTracking) {
        await this.trackRephraseUsage(originalPrompt, result);
      }

      console.log('[PromptLint Context-Aware] Success:', {
        originalLength: originalPrompt.length,
        candidatesGenerated: result.candidates.length,
        contextAware: !!this.userContext,
        processingTime: result.metadata.processingTime
      });

      return result;

    } catch (error) {
      console.error('[PromptLint Context-Aware] Request failed:', error);
      
      if (error instanceof RephraseError) {
        throw error;
      }
      
      // Fallback to context-aware template generation
      return await this.createContextAwareOfflineResult(originalPrompt);
    }
  }

  /**
   * Track user template selection for preference learning
   */
  async trackTemplateSelection(
    selectedTemplate: TemplateCandidate,
    originalPrompt: string,
    modifiedPrompt?: string
  ): Promise<void> {
    if (!this.userContext || !this.userContext.settings.enableBehaviorTracking) {
      return;
    }

    try {
      const selectionEvent: TemplateSelectionEvent = {
        timestamp: new Date(),
        originalPrompt,
        selectedTemplate: selectedTemplate.type,
        userModifications: modifiedPrompt ? [modifiedPrompt] : [],
        domainClassification: {
          domain: selectedTemplate.metadata?.selectionMetadata?.domainContext?.domain || 'unknown',
          confidence: selectedTemplate.metadata?.selectionMetadata?.domainContext?.confidence || 0,
          indicators: []
        },
        sessionContext: {
          sessionId: 'session_' + Date.now(),
          startTime: new Date(),
          interactionCount: 1,
          userAgent: navigator.userAgent
        }
      };

      const optimizationHistory = this.behaviorAnalytics.trackTemplateSelection(selectionEvent);
      
      // Add to user context history
      this.userContext.history.push(optimizationHistory);
      this.userContext.metadata.totalInteractions++;

      // Update preferences based on new data
      this.userContext.preferences = this.contextMemoryEngine.analyzeUserPreferences(this.userContext.history);

      // Save updated context
      await this.contextMemoryEngine.storeUserContext(this.userContext);

      console.log('[PromptLint Context-Aware] Template selection tracked:', {
        template: selectedTemplate.type,
        learningProgress: this.userContext.preferences.learningConfidence
      });

    } catch (error) {
      console.error('[PromptLint Context-Aware] Failed to track template selection:', error);
    }
  }

  /**
   * Get user insights and recommendations
   */
  async getUserInsights(): Promise<{
    primaryTemplatePreference: string | null;
    averageEffectiveness: number;
    improvementAreas: string[];
    strengths: string[];
    learningProgress: number;
  } | null> {
    if (!this.userContext) {
      return null;
    }

    return this.behaviorAnalytics.generateUserInsights(this.userContext.history);
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: any): Promise<void> {
    if (this.userContext) {
      await this.contextMemoryEngine.setPrivacySettings(this.userContext.userId, settings);
      this.userContext = await this.contextMemoryEngine.retrieveUserContext(this.userContext.userId);
    }
  }

  /**
   * Clear all user data
   */
  async clearUserData(): Promise<void> {
    if (this.currentUserId) {
      await this.contextMemoryEngine.clearUserData(this.currentUserId);
      await UserContextStorage.clearUserContext();
      this.userContext = null;
      this.currentUserId = null;
    }
  }

  // Private helper methods

  private async initializeContextMemory(): Promise<boolean> {
    try {
      if (!isStorageAvailable()) {
        console.warn('[PromptLint Context-Aware] Storage not available, context memory disabled');
        return false;
      }

      // Try to load existing user context
      this.userContext = await UserContextStorage.loadUserContext();
      
      if (!this.userContext) {
        // Create new user context
        this.currentUserId = generateUserId();
        this.userContext = UserContextStorage.createDefaultUserContext(this.currentUserId);
        await UserContextStorage.saveUserContext(this.userContext);
      } else {
        this.currentUserId = this.userContext.userId;
      }

      console.log('[PromptLint Context-Aware] Context memory initialized:', {
        userId: this.currentUserId,
        historyEntries: this.userContext.history.length,
        learningEnabled: this.userContext.settings.enablePreferenceLearning
      });

      return true;

    } catch (error) {
      console.error('[PromptLint Context-Aware] Context memory initialization failed:', error);
      return false;
    }
  }

  private async applyUserPreferences(
    candidates: TemplateCandidate[],
    prompt: string,
    lintResult: LintResult
  ): Promise<TemplateCandidate[]> {
    if (!this.userContext?.preferences.preferredTemplates.length) {
      return candidates; // No preferences learned yet
    }

    // Boost scores for preferred templates
    const enhancedCandidates = candidates.map(candidate => {
      const preference = this.userContext!.preferences.preferredTemplates
        .find(pref => pref.templateType === candidate.type);
      
      if (preference && preference.effectiveness > 70) {
        // Boost score by up to 20% based on effectiveness
        const boost = (preference.effectiveness / 100) * 0.2;
        candidate.score = Math.min(1.0, candidate.score + boost);
        
        // Add preference metadata
        candidate.metadata = {
          ...candidate.metadata,
          preferenceBoost: boost,
          userPreference: {
            effectiveness: preference.effectiveness,
            frequency: preference.frequency,
            lastUsed: preference.lastUsed
          }
        };
      }

      return candidate;
    });

    // Re-sort by enhanced scores
    return enhancedCandidates.sort((a, b) => b.score - a.score);
  }

  private async trackTemplateGeneration(
    prompt: string,
    candidates: TemplateCandidate[],
    lintResult: LintResult
  ): Promise<void> {
    // This would be called when templates are generated but not yet selected
    // Could be used for A/B testing or generation analytics
    console.log('[PromptLint Context-Aware] Template generation tracked:', {
      prompt: prompt.substring(0, 50) + '...',
      candidateCount: candidates.length,
      topTemplate: candidates[0]?.type
    });
  }

  private async detectDomainWithContext(prompt: string): Promise<string> {
    // Enhanced domain detection using user context
    const basicDomain = this.detectDomain(prompt);
    
    if (this.userContext?.preferences.domainPreferences.length) {
      // Consider user's domain usage patterns
      const userDomainPrefs = this.userContext.preferences.domainPreferences
        .find(pref => pref.domain === basicDomain);
      
      if (userDomainPrefs && userDomainPrefs.confidence > 80) {
        return basicDomain; // High confidence in this domain
      }
    }

    return basicDomain;
  }

  private async getPreferredResponseStyle(): Promise<string> {
    if (this.userContext?.preferences.preferredTemplates.length) {
      const topPreference = this.userContext.preferences.preferredTemplates[0];
      
      // Map template types to response styles
      switch (topPreference.templateType) {
        case 'bullet':
          return 'structured';
        case 'task_io':
          return 'technical';
        case 'sequential':
          return 'step-by-step';
        default:
          return 'technical';
      }
    }
    
    return 'technical';
  }

  private async trackRephraseUsage(originalPrompt: string, result: RephraseResult): Promise<void> {
    // Track successful AI-powered rephrase usage
    // This could inform whether users prefer AI rephrasing vs template-based improvements
    console.log('[PromptLint Context-Aware] Rephrase usage tracked:', {
      promptLength: originalPrompt.length,
      candidatesReturned: result.candidates.length,
      model: result.metadata.model
    });
  }

  private async createContextAwareOfflineResult(prompt: string): Promise<RephraseResult> {
    try {
      const lintResult = this.createBasicLintResult(prompt);
      const templateCandidates = await this.generateContextAwareTemplates(prompt, lintResult);

      const candidates = templateCandidates.map((templateCandidate: TemplateCandidate) => ({
        id: templateCandidate.id,
        text: templateCandidate.content,
        approach: this.mapTemplateTypeToApproach(templateCandidate.type),
        estimatedScore: Math.round(templateCandidate.score * 100),
        improvements: this.extractImprovements(templateCandidate),
        length: templateCandidate.content.length
      }));

      return {
        originalPrompt: prompt,
        candidates,
        metadata: {
          processingTime: templateCandidates.reduce((sum: number, c: TemplateCandidate) => sum + c.generationTime, 0),
          model: 'context-aware-template-engine-v0.6.0',
          tokensUsed: 0,
          estimatedCost: 0,
          timestamp: Date.now()
        },
        warnings: [
          'Generated using PromptLint Context-Aware Template Engine v0.6.0',
          this.userContext ? 
            `Personalized based on ${this.userContext.history.length} previous interactions` :
            'For personalized results, enable context memory in settings',
          'For AI-powered improvements, configure OpenAI API key in extension popup'
        ]
      };

    } catch (error) {
      console.error('[PromptLint Context-Aware] Context-aware generation failed:', error);
      return this.createFallbackRephraseResult(prompt);
    }
  }

  // Inherited helper methods from original rephrase service
  private detectTargetSystem(): string {
    const hostname = window.location.hostname;
    
    if (hostname.includes('openai.com')) {
      return 'ChatGPT';
    } else if (hostname.includes('claude.ai')) {
      return 'Claude';
    } else {
      return 'Unknown';
    }
  }

  private detectDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('program') || lowerPrompt.includes('function')) {
      return 'coding';
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('data') || lowerPrompt.includes('report')) {
      return 'analysis';
    } else if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('story')) {
      return 'creative';
    } else {
      return 'general';
    }
  }

  private createBasicLintResult(prompt: string): LintResult {
    try {
      return analyzePrompt(prompt);
    } catch (error) {
      console.warn('[PromptLint Context-Aware] Rules engine failed, using basic analysis:', error);
      
      const issues: LintIssue[] = [];
      const score = Math.max(30, Math.min(90, prompt.length * 2));
      
      return {
        score,
        issues,
        metadata: {
          processingTime: 0,
          inputLength: prompt.length,
          timestamp: new Date()
        }
      };
    }
  }

  private mapTemplateTypeToApproach(templateType: any): 'structured' | 'conversational' | 'imperative' {
    switch (templateType) {
      case 'task_io':
        return 'structured';
      case 'bullet':
        return 'structured';
      case 'sequential':
        return 'imperative';
      case 'minimal':
        return 'conversational';
      default:
        return 'structured';
    }
  }

  private extractImprovements(templateCandidate: TemplateCandidate): string[] {
    const improvements = [];
    
    if (templateCandidate.metadata?.faithfulnessResult?.isValid) {
      improvements.push('Preserved original intent');
    }
    
    if (templateCandidate.generationTime < 50) {
      improvements.push('Fast generation');
    }
    
    improvements.push(`Applied ${templateCandidate.type} template structure`);
    
    if (templateCandidate.metadata?.preferenceBoost) {
      improvements.push('Personalized based on your preferences');
    }
    
    return improvements;
  }

  private createFallbackRephraseResult(prompt: string): RephraseResult {
    const candidates = [{
      id: 'fallback-minimal',
      text: this.capitalizeFirst(prompt.trim()) + (prompt.trim().endsWith('.') ? '' : '.'),
      approach: 'conversational' as const,
      estimatedScore: 50,
      improvements: ['Basic formatting applied', 'Capitalized first letter', 'Added punctuation'],
      length: prompt.length + 2
    }];

    return {
      originalPrompt: prompt,
      candidates,
      metadata: {
        processingTime: 1,
        model: 'fallback-formatter',
        tokensUsed: 0,
        estimatedCost: 0,
        timestamp: Date.now()
      },
      warnings: [
        'Context-aware engine unavailable - using basic formatting',
        'For better results, ensure all dependencies are properly loaded'
      ]
    };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
