/**
 * PromptLint Rephrase Service Integration
 * 
 * Integrates the llm-service package with the Chrome extension
 * Handles API key management and rephrase requests
 */

import { createRephraseServiceWithStoredKey, createApiKeyStorage, testApiKey } from '../../../../packages/llm-service/dist/index.js';
import { RephraseResult, RephraseRequest, RephraseError, RephraseErrorType, LintResult, LintRuleType, LintIssue } from '../../../../packages/shared-types/dist/index.js';
// @ts-ignore - Template engine JS file doesn't have declaration
import { TemplateEngine } from '../../../../packages/template-engine/dist/template-engine.js';
import type { TemplateCandidate } from '../../../../packages/template-engine/dist/index.js';
import { analyzePrompt } from '../../../../packages/rules-engine/dist/index.js';

export interface RephraseServiceStatus {
  available: boolean;
  hasApiKey: boolean;
  error?: string;
}

export class ExtensionRephraseService {
  private rephraseService: any = null;
  private apiKeyStorage = createApiKeyStorage();
  private isInitialized = false;
  private templateEngine = new TemplateEngine();

  /**
   * Initialize the rephrase service
   */
  async initialize(): Promise<RephraseServiceStatus> {
    try {
      // Check if API key is stored
      const hasApiKey = await this.apiKeyStorage.hasKey();
      
      if (!hasApiKey) {
        return {
          available: false,
          hasApiKey: false,
          error: 'No API key configured'
        };
      }

      // Try to create service with stored key
      this.rephraseService = await createRephraseServiceWithStoredKey();
      
      if (!this.rephraseService) {
        return {
          available: false,
          hasApiKey: true,
          error: 'Failed to initialize rephrase service'
        };
      }

      // Test if service is available
      const available = await this.rephraseService.isAvailable();
      this.isInitialized = available;

      return {
        available,
        hasApiKey: true,
        error: available ? undefined : 'Service not available'
      };

    } catch (error) {
      console.error('[PromptLint Rephrase] Initialization failed:', error);
      return {
        available: false,
        hasApiKey: false,
        error: error instanceof Error ? error.message : 'Initialization failed'
      };
    }
  }

  /**
   * Set up API key
   */
  async setupApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Test the API key first
      const testResult = await testApiKey(apiKey);
      
      if (!testResult.valid) {
        return {
          success: false,
          error: testResult.error || 'Invalid API key'
        };
      }

      // Store the API key
      await this.apiKeyStorage.store(apiKey);

      // Reinitialize the service
      const status = await this.initialize();
      
      return {
        success: status.available,
        error: status.error
      };

    } catch (error) {
      console.error('[PromptLint Rephrase] API key setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Setup failed'
      };
    }
  }

  /**
   * Remove stored API key
   */
  async removeApiKey(): Promise<void> {
    await this.apiKeyStorage.remove();
    this.rephraseService = null;
    this.isInitialized = false;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.rephraseService;
  }

  /**
   * Rephrase a prompt
   */
  async rephrase(originalPrompt: string): Promise<RephraseResult> {
    if (!this.isReady()) {
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
          domain: this.detectDomain(originalPrompt),
          responseStyle: 'technical'
        }
      };

      const result = await this.rephraseService.rephrase(request);
      
      // Log success for debugging
      console.log('[PromptLint Rephrase] Success:', {
        originalLength: originalPrompt.length,
        candidatesGenerated: result.candidates.length,
        processingTime: result.metadata.processingTime
      });

      return result;

    } catch (error) {
      console.error('[PromptLint Rephrase] Request failed:', error);
      
      if (error instanceof RephraseError) {
        throw error;
      }
      
      throw new RephraseError(
        RephraseErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Rephrase request failed'
      );
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<RephraseServiceStatus> {
    if (!this.isInitialized) {
      return await this.initialize();
    }

    try {
      const available = this.rephraseService ? await this.rephraseService.isAvailable() : false;
      const hasApiKey = await this.apiKeyStorage.hasKey();

      return {
        available,
        hasApiKey,
        error: available ? undefined : 'Service not available'
      };
    } catch (error) {
      return {
        available: false,
        hasApiKey: await this.apiKeyStorage.hasKey(),
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Detect target AI system based on current URL
   */
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

  /**
   * Detect domain based on prompt content
   */
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

  /**
   * Handle graceful degradation when service is unavailable
   */
  createGracefulFallback(): {
    onRephraseRequest: (prompt: string) => Promise<RephraseResult>;
    onRephraseSelect: (candidate: any, originalPrompt: string) => void;
  } {
    return {
      onRephraseRequest: async (prompt: string) => {
        try {
          // Check if service is ready
          const status = await this.getStatus();
          
          if (status.available && this.rephraseService) {
            // Use AI-powered rephrasing
            return await this.rephrase(prompt);
          } else {
            // Use offline graceful degradation
            return await this.createOfflineRephraseResult(prompt);
          }
        } catch (error) {
          console.warn('[PromptLint] Rephrase failed, using offline mode:', error);
          return await this.createOfflineRephraseResult(prompt);
        }
      },
      
      onRephraseSelect: (candidate: any, originalPrompt: string) => {
        // Find the input element and replace its content
        this.replacePromptInInput(candidate.text);
        
        // Log usage for analytics
        console.log('[PromptLint Rephrase] Candidate selected:', {
          approach: candidate.approach,
          originalLength: originalPrompt.length,
          newLength: candidate.text.length,
          estimatedScore: candidate.estimatedScore
        });
      }
    };
  }

  /**
   * Replace prompt text in the current input field
   */
  private replacePromptInInput(newText: string): void {
    // This will be implemented to work with the site adapters
    // For now, try to find the active input element
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      (activeElement as HTMLTextAreaElement).value = newText;
      
      // Trigger input event to notify the site
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(newText).then(() => {
        console.log('[PromptLint Rephrase] Copied to clipboard:', newText.substring(0, 50) + '...');
      }).catch(() => {
        console.warn('[PromptLint Rephrase] Failed to copy to clipboard');
      });
    }
  }

  /**
   * Create offline rephrase result using template engine with user preference influence
   */
  private async createOfflineRephraseResult(prompt: string): Promise<RephraseResult> {
    try {
      // Analyze prompt to get lint result
      const lintResult = this.createBasicLintResult(prompt);
      
      // Generate template candidates
      const templateCandidates = await this.templateEngine.generateCandidates(prompt, lintResult);
      
      // Apply user preference influence
      const influencedCandidates = await this.applyUserPreferences(templateCandidates);
      
      // Convert template candidates to rephrase candidates
      const candidates = influencedCandidates.map((templateCandidate: TemplateCandidate) => ({
        id: templateCandidate.id,
        text: templateCandidate.content,
        approach: this.mapTemplateTypeToApproach(templateCandidate.type),
        estimatedScore: Math.round(templateCandidate.score * 100),
        improvements: this.extractImprovements(templateCandidate),
        length: templateCandidate.content.length
      }));

      // Track this generation for learning
      await this.trackTemplateGeneration(prompt, candidates);

      return {
        originalPrompt: prompt,
        candidates,
        metadata: {
          processingTime: templateCandidates.reduce((sum: number, c: TemplateCandidate) => sum + c.generationTime, 0),
          model: 'template-engine-v0.4.0-with-preferences',
          tokensUsed: 0,
          estimatedCost: 0,
          timestamp: Date.now()
        },
        warnings: [
          'Generated using PromptLint Template Engine v0.4.0 with user preferences',
          'For AI-powered improvements, configure OpenAI API key in extension popup',
          'Template ranking influenced by your selection history'
        ]
      };
      
    } catch (error) {
      console.error('[PromptLint] Template engine failed, using fallback:', error);
      return this.createFallbackRephraseResult(prompt);
    }
  }

  /**
   * Create basic lint result for template engine
   */
  private createBasicLintResult(prompt: string): LintResult {
    try {
      // Use the actual rules engine to analyze the prompt
      return analyzePrompt(prompt);
    } catch (error) {
      console.warn('[PromptLint] Rules engine failed, using basic analysis:', error);
      
      // Create a basic lint result as fallback
      const issues: LintIssue[] = [];
      const score = Math.max(30, Math.min(90, prompt.length * 2)); // Basic scoring
      
      // Basic issue detection
      if (!this.hasActionVerb(prompt)) {
        issues.push({ type: LintRuleType.MISSING_TASK_VERB, message: 'No clear action verb found', severity: 'medium' as const });
      }
      if (!this.hasLanguageSpecification(prompt)) {
        issues.push({ type: LintRuleType.MISSING_LANGUAGE, message: 'No programming language specified', severity: 'low' as const });
      }
      if (!this.hasIOSpecification(prompt)) {
        issues.push({ type: LintRuleType.MISSING_IO_SPECIFICATION, message: 'Input/output not specified', severity: 'medium' as const });
      }
      if (this.hasVagueWording(prompt)) {
        issues.push({ type: LintRuleType.VAGUE_WORDING, message: 'Contains vague wording', severity: 'medium' as const });
      }

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

  /**
   * Map template type to rephrase approach
   */
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

  /**
   * Extract improvements from template candidate
   */
  private extractImprovements(templateCandidate: TemplateCandidate): string[] {
    const improvements = [];
    
    if (templateCandidate.metadata?.faithfulnessResult?.isValid) {
      improvements.push('Preserved original intent');
    }
    
    if (templateCandidate.generationTime < 50) {
      improvements.push('Fast generation');
    }
    
    improvements.push(`Applied ${templateCandidate.type} template structure`);
    
    if (templateCandidate.metadata?.warnings?.length === 0) {
      improvements.push('No performance warnings');
    }
    
    return improvements;
  }

  /**
   * Create fallback rephrase result when template engine fails
   */
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
        'Template engine unavailable - using basic formatting',
        'For better results, ensure all dependencies are properly loaded'
      ]
    };
  }

  // Helper methods for basic lint analysis
  private hasActionVerb(prompt: string): boolean {
    const actionVerbs = ['create', 'build', 'implement', 'write', 'generate', 'develop', 'design', 'make', 'analyze', 'process'];
    const lowerPrompt = prompt.toLowerCase();
    return actionVerbs.some(verb => lowerPrompt.includes(verb));
  }

  private hasLanguageSpecification(prompt: string): boolean {
    const languages = ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift'];
    const lowerPrompt = prompt.toLowerCase();
    return languages.some(lang => lowerPrompt.includes(lang));
  }

  private hasIOSpecification(prompt: string): boolean {
    const ioKeywords = ['input', 'output', 'return', 'given', 'format', 'data', 'file'];
    const lowerPrompt = prompt.toLowerCase();
    return ioKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  private hasVagueWording(prompt: string): boolean {
    const vagueWords = ['something', 'anything', 'stuff', 'things', 'maybe', 'probably', 'kinda', 'sorta'];
    const lowerPrompt = prompt.toLowerCase();
    return vagueWords.some(word => lowerPrompt.includes(word));
  }

  private extractAction(prompt: string): string {
    const actionWords = ['write', 'create', 'build', 'implement', 'develop', 'design', 'generate', 'make', 'analyze', 'process'];
    const words = prompt.toLowerCase().split(/\s+/);
    
    for (const word of actionWords) {
      if (words.includes(word)) {
        return word;
      }
    }
    
    // Default action based on prompt length
    if (prompt.length < 20) {
      return 'create a solution for';
    } else {
      return 'help with';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Apply user preferences to influence template candidate ranking
   */
  private async applyUserPreferences(candidates: TemplateCandidate[]): Promise<TemplateCandidate[]> {
    try {
      // Check if preference learning is enabled
      const privacySettings = await chrome.storage.local.get(['promptlint_privacy_settings']);
      const enableLearning = privacySettings.promptlint_privacy_settings?.enableLearning !== false;
      
      if (!enableLearning) {
        console.log('[PromptLint] Preference learning disabled, returning original order');
        return candidates;
      }

      // Load user preferences from storage
      const userData = await chrome.storage.local.get(['promptlint_user_data']);
      const preferences = userData.promptlint_user_data?.preferences || {};
      
      if (Object.keys(preferences).length === 0) {
        console.log('[PromptLint] No user preferences found, returning original order');
        return candidates;
      }

      // Apply preference-based scoring boost
      const influencedCandidates = candidates.map(candidate => {
        const approach = this.mapTemplateTypeToApproach(candidate.type);
        const userPreferenceCount = preferences[approach] || 0;
        
        // Calculate preference boost (0-20 points based on usage frequency)
        const maxPreferenceCount = Math.max(...Object.values(preferences) as number[]);
        const preferenceBoost = maxPreferenceCount > 0 ? (userPreferenceCount / maxPreferenceCount) * 20 : 0;
        
        // Apply boost to candidate score
        const boostedCandidate = {
          ...candidate,
          score: Math.min(100, candidate.score + preferenceBoost),
          metadata: {
            ...candidate.metadata,
            templateType: candidate.metadata?.templateType || approach,
            faithfulnessResult: candidate.metadata?.faithfulnessResult || { 
              isValid: true, 
              violations: [], 
              score: 100, 
              report: 'No faithfulness issues detected' 
            },
            performanceMetrics: candidate.metadata?.performanceMetrics || {
              executionTime: 0,
              maxAllowedTime: 1000,
              warningThreshold: 500,
              isAcceptable: true,
              isWarning: false,
              performanceRatio: 0
            },
            warnings: candidate.metadata?.warnings || [],
            preferenceBoost,
            userPreferenceCount,
            originalScore: candidate.score
          }
        };
        
        return boostedCandidate;
      });

      // Sort by boosted score (descending)
      const sortedCandidates = influencedCandidates.sort((a, b) => b.score - a.score);
      
      console.log('[PromptLint] Applied user preferences:', {
        originalOrder: candidates.map(c => this.mapTemplateTypeToApproach(c.type)),
        influencedOrder: sortedCandidates.map(c => this.mapTemplateTypeToApproach(c.type)),
        preferences
      });
      
      return sortedCandidates;
      
    } catch (error) {
      console.warn('[PromptLint] Failed to apply user preferences:', error);
      return candidates;
    }
  }

  /**
   * Track template generation for learning purposes
   */
  private async trackTemplateGeneration(prompt: string, candidates: any[]): Promise<void> {
    try {
      // Check if tracking is enabled
      const privacySettings = await chrome.storage.local.get(['promptlint_privacy_settings']);
      const enableTracking = privacySettings.promptlint_privacy_settings?.enableTracking !== false;
      
      if (!enableTracking) {
        return;
      }

      // Get current user data
      const stored = await chrome.storage.local.get(['promptlint_user_data']);
      const userData = stored.promptlint_user_data || { 
        generations: [],
        stats: {}
      };
      
      // Add generation record
      const generationRecord = {
        timestamp: Date.now(),
        promptLength: prompt.length,
        candidatesGenerated: candidates.length,
        approaches: candidates.map(c => c.approach),
        site: window.location.hostname
      };
      
      userData.generations = userData.generations || [];
      userData.generations.push(generationRecord);
      
      // Limit generation history (keep last 50)
      if (userData.generations.length > 50) {
        userData.generations = userData.generations.slice(-50);
      }
      
      // Update stats
      userData.stats.totalGenerations = userData.generations.length;
      userData.lastUpdated = Date.now();
      
      // Store back to Chrome storage
      await chrome.storage.local.set({ promptlint_user_data: userData });
      
      console.log('[PromptLint] Template generation tracked');
      
    } catch (error) {
      console.warn('[PromptLint] Failed to track template generation:', error);
    }
  }
}

// Global instance for the extension
export const extensionRephraseService = new ExtensionRephraseService();
