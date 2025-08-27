/**
 * PromptLint Rephrase Engine
 * 
 * Core rephrasing functionality that generates multiple candidates
 * using different structural approaches while enforcing Optimization Principles
 */

import { 
  RephraseRequest, 
  RephraseResult, 
  RephraseCandidate, 
  RephraseApproach,
  RephraseConfig,
  IRephraseService,
  RephraseServiceStatus,
  RephraseError,
  RephraseErrorType
} from '@promptlint/shared-types';

import { OpenAIClient } from './openai-client';
import { 
  CORE_REPHRASE_SYSTEM_PROMPT,
  getSystemPromptForApproach,
  getDomainEnhancedPrompt
} from '../prompts/system-prompts';
import { globalGracefulDegradation } from '../utils/graceful-degradation';

/**
 * Core rephrase engine implementation
 */
export class RephraseEngine implements IRephraseService {
  private openaiClient: OpenAIClient;
  private config: RephraseConfig;

  constructor(config: RephraseConfig) {
    this.config = { ...config };
    this.openaiClient = new OpenAIClient(config);
  }

  /**
   * Rephrase a prompt with multiple candidates and graceful degradation
   */
  async rephrase(request: RephraseRequest): Promise<RephraseResult> {
    // Use graceful degradation manager to handle the request
    return await globalGracefulDegradation.handleRephrase(request, async (req) => {
      const startTime = Date.now();
      
      try {
        // Validate request
        this.validateRequest(req);

        // Determine approaches to use
        const approaches = this.selectApproaches(req);
        
        // Generate candidates using different approaches
        const candidates = await this.generateCandidates(req, approaches);
        
        // Calculate total processing time
        const processingTime = Date.now() - startTime;
        
        // Get metadata from last OpenAI call
        const status = this.openaiClient.getStatus();
        
        return {
          originalPrompt: req.originalPrompt,
          candidates,
          metadata: {
            processingTime,
            model: this.config.model || 'gpt-3.5-turbo',
            tokensUsed: candidates.reduce((sum, c) => sum + (c as any).tokensUsed || 0, 0),
            estimatedCost: this.estimateTotalCost(candidates),
            timestamp: Date.now()
          },
          warnings: this.generateWarnings(req, candidates)
        };

      } catch (error) {
        console.error('[PromptLint Rephrase] Error:', error);
        
        if (error instanceof RephraseError) {
          throw error;
        }
        
        throw new RephraseError(
          RephraseErrorType.UNKNOWN_ERROR,
          `Rephrase failed: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error : undefined
        );
      }
    });
  }

  /**
   * Check if service is available and configured
   */
  async isAvailable(): Promise<boolean> {
    return await this.openaiClient.isAvailable();
  }

  /**
   * Get current service status
   */
  getStatus(): RephraseServiceStatus {
    return this.openaiClient.getStatus();
  }

  /**
   * Update configuration
   */
  configure(config: Partial<RephraseConfig>): void {
    this.config = { ...this.config, ...config };
    this.openaiClient.configure(config);
  }

  /**
   * Validate and normalize rephrase request
   */
  private validateRequest(request: RephraseRequest): void {
    // Allow empty prompts - graceful degradation will handle them
    // Just validate extreme cases that could cause issues
    
    if (request.originalPrompt && request.originalPrompt.length > (request.maxLength || 5000)) {
      throw new RephraseError(
        RephraseErrorType.INVALID_REQUEST,
        'Original prompt exceeds maximum length'
      );
    }

    // Normalize candidate count to reasonable bounds (graceful capping)
    if (request.candidateCount) {
      request.candidateCount = Math.max(1, Math.min(request.candidateCount, 5));
    }
  }

  /**
   * Select approaches to use for rephrasing
   */
  private selectApproaches(request: RephraseRequest): RephraseApproach[] {
    const candidateCount = request.candidateCount || 3;
    const availableApproaches: RephraseApproach[] = [
      'structured',
      'conversational', 
      'imperative',
      'clarifying'
    ];

    // Always include structured approach as it's most reliable
    const selectedApproaches: RephraseApproach[] = ['structured'];

    // Add additional approaches based on prompt characteristics
    const prompt = request.originalPrompt.toLowerCase();
    
    if (prompt.includes('create') || prompt.includes('build') || prompt.includes('implement')) {
      selectedApproaches.push('imperative');
    }
    
    if (prompt.length < 50 || this.hasVagueTerms(prompt)) {
      selectedApproaches.push('clarifying');
    }
    
    if (selectedApproaches.length < candidateCount) {
      selectedApproaches.push('conversational');
    }

    // Add remaining approaches if needed
    for (const approach of availableApproaches) {
      if (selectedApproaches.length >= candidateCount) break;
      if (!selectedApproaches.includes(approach)) {
        selectedApproaches.push(approach);
      }
    }

    return selectedApproaches.slice(0, candidateCount);
  }

  /**
   * Check if prompt has vague terms that need clarification
   */
  private hasVagueTerms(prompt: string): boolean {
    const vagueTerms = [
      'something', 'anything', 'somehow', 'maybe', 'perhaps',
      'kind of', 'sort of', 'basically', 'generally', 'usually',
      'stuff', 'things', 'whatever', 'etc', 'and so on'
    ];
    
    return vagueTerms.some(term => prompt.includes(term));
  }

  /**
   * Generate rephrase candidates using different approaches
   */
  private async generateCandidates(
    request: RephraseRequest,
    approaches: RephraseApproach[]
  ): Promise<RephraseCandidate[]> {
    const candidates: RephraseCandidate[] = [];
    
    for (let i = 0; i < approaches.length; i++) {
      const approach = approaches[i];
      
      try {
        const candidate = await this.generateSingleCandidate(request, approach, i);
        candidates.push(candidate);
      } catch (error) {
        console.warn(`[PromptLint Rephrase] Failed to generate candidate with ${approach} approach:`, error);
        
        // Try fallback approach
        if (approach !== 'structured') {
          try {
            const fallbackCandidate = await this.generateSingleCandidate(request, 'structured', i);
            candidates.push(fallbackCandidate);
          } catch (fallbackError) {
            console.error('[PromptLint Rephrase] Fallback also failed:', fallbackError);
          }
        }
      }
    }

    if (candidates.length === 0) {
      throw new RephraseError(
        RephraseErrorType.SERVICE_UNAVAILABLE,
        'Failed to generate any rephrase candidates'
      );
    }

    return candidates;
  }

  /**
   * Generate a single rephrase candidate
   */
  private async generateSingleCandidate(
    request: RephraseRequest,
    approach: RephraseApproach,
    index: number
  ): Promise<RephraseCandidate> {
    // Build system prompt for this approach
    const systemPrompt = this.buildSystemPrompt(request, approach);
    
    // Build user prompt
    const userPrompt = this.buildUserPrompt(request, approach);
    
    // Generate completion
    const completion = await this.openaiClient.generateCompletion(
      systemPrompt,
      userPrompt,
      {
        temperature: this.getTemperatureForApproach(approach),
        maxTokens: request.maxLength ? Math.min(request.maxLength * 2, 1000) : 800
      }
    );

    // Parse the response to extract the rephrased prompt
    const rephraseText = this.parseRephraseResponse(completion.content, approach);
    
    // Estimate quality score
    const estimatedScore = this.estimateQualityScore(rephraseText, request.originalPrompt);
    
    // Identify improvements made
    const improvements = this.identifyImprovements(request.originalPrompt, rephraseText);

    return {
      id: `rephrase-${approach}-${index}`,
      text: rephraseText,
      approach,
      estimatedScore,
      improvements,
      length: rephraseText.length,
      // Store additional metadata for cost calculation
      tokensUsed: completion.tokensUsed
    } as RephraseCandidate & { tokensUsed: number };
  }

  /**
   * Build system prompt for specific approach
   */
  private buildSystemPrompt(request: RephraseRequest, approach: RephraseApproach): string {
    // Start with approach-specific prompt
    let systemPrompt = getSystemPromptForApproach(approach);
    
    // Add domain enhancement if specified
    if (request.context?.domain) {
      systemPrompt = getDomainEnhancedPrompt(request.context.domain);
    }
    
    return systemPrompt;
  }

  /**
   * Build user prompt for the LLM
   */
  private buildUserPrompt(request: RephraseRequest, approach: RephraseApproach): string {
    let userPrompt = `Please rephrase this prompt using the ${approach} approach:\n\n"${request.originalPrompt}"`;
    
    // Add context if provided
    if (request.context) {
      userPrompt += '\n\nContext:';
      if (request.context.targetSystem) {
        userPrompt += `\n- Target system: ${request.context.targetSystem}`;
      }
      if (request.context.domain) {
        userPrompt += `\n- Domain: ${request.context.domain}`;
      }
      if (request.context.responseStyle) {
        userPrompt += `\n- Desired style: ${request.context.responseStyle}`;
      }
    }

    userPrompt += '\n\nProvide only the rephrased prompt, no explanation or commentary.';
    
    return userPrompt;
  }

  /**
   * Get temperature setting for different approaches
   */
  private getTemperatureForApproach(approach: RephraseApproach): number {
    const temperatures = {
      structured: 0.3,      // More deterministic for structure
      conversational: 0.7,  // More natural variation
      imperative: 0.4,      // Slightly more creative for commands
      clarifying: 0.5,      // Balanced for clarifications
      detailed: 0.6,
      concise: 0.4
    };
    
    return temperatures[approach] || 0.5;
  }

  /**
   * Parse the LLM response to extract clean rephrase text
   */
  private parseRephraseResponse(response: string, approach: RephraseApproach): string {
    // Remove any markdown formatting
    let cleaned = response.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    
    // Remove common prefixes the LLM might add
    const prefixes = [
      'Here\'s the rephrased prompt:',
      'Rephrased prompt:',
      'Here is the rephrased version:',
      'Rephrased:',
      'Here\'s a rephrased version:',
      'The rephrased prompt is:'
    ];
    
    for (const prefix of prefixes) {
      if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleaned = cleaned.substring(prefix.length);
      }
    }
    
    // Clean up whitespace and quotes
    cleaned = cleaned.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    
    return cleaned.trim();
  }

  /**
   * Estimate quality score for a rephrased prompt
   */
  private estimateQualityScore(rephraseText: string, originalText: string): number {
    let score = 50; // Base score
    
    // Length improvement (not too short, not too verbose)
    const lengthRatio = rephraseText.length / originalText.length;
    if (lengthRatio > 1.2 && lengthRatio < 2.0) {
      score += 15; // Good expansion
    } else if (lengthRatio > 0.8 && lengthRatio <= 1.2) {
      score += 10; // Maintained length
    }
    
    // Structure indicators
    if (rephraseText.includes('Task:') || rephraseText.includes('Input:') || rephraseText.includes('Output:')) {
      score += 15;
    }
    
    // Clarity improvements
    const clarityWords = ['specific', 'clear', 'detailed', 'format', 'structure', 'requirements'];
    const clarityCount = clarityWords.filter(word => rephraseText.toLowerCase().includes(word)).length;
    score += Math.min(clarityCount * 3, 15);
    
    // Action verbs
    const actionVerbs = ['implement', 'create', 'build', 'generate', 'analyze', 'design', 'develop'];
    if (actionVerbs.some(verb => rephraseText.toLowerCase().includes(verb))) {
      score += 10;
    }
    
    // Penalize vague terms
    const vagueTerms = ['something', 'somehow', 'maybe', 'kind of', 'sort of'];
    const vagueCount = vagueTerms.filter(term => rephraseText.toLowerCase().includes(term)).length;
    score -= vagueCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify improvements made in the rephrase
   */
  private identifyImprovements(originalText: string, rephraseText: string): string[] {
    const improvements: string[] = [];
    
    // Structure improvements
    if (rephraseText.includes('Task:') || rephraseText.includes('Input:') || rephraseText.includes('Output:')) {
      improvements.push('Added structured format');
    }
    
    // Length improvements
    const lengthRatio = rephraseText.length / originalText.length;
    if (lengthRatio > 1.3) {
      improvements.push('Expanded with helpful details');
    } else if (lengthRatio < 0.8) {
      improvements.push('Condensed for clarity');
    }
    
    // Clarity improvements
    const clarityWords = ['specific', 'clear', 'detailed', 'format', 'requirements'];
    if (clarityWords.some(word => rephraseText.toLowerCase().includes(word) && !originalText.toLowerCase().includes(word))) {
      improvements.push('Enhanced clarity and specificity');
    }
    
    // Action verb improvements
    const actionVerbs = ['implement', 'create', 'build', 'generate', 'analyze', 'design'];
    const originalHasActionVerb = actionVerbs.some(verb => originalText.toLowerCase().includes(verb));
    const rephraseHasActionVerb = actionVerbs.some(verb => rephraseText.toLowerCase().includes(verb));
    
    if (!originalHasActionVerb && rephraseHasActionVerb) {
      improvements.push('Added clear action verb');
    }
    
    // Removed vague terms
    const vagueTerms = ['something', 'somehow', 'maybe', 'kind of', 'sort of'];
    const originalVagueCount = vagueTerms.filter(term => originalText.toLowerCase().includes(term)).length;
    const rephraseVagueCount = vagueTerms.filter(term => rephraseText.toLowerCase().includes(term)).length;
    
    if (originalVagueCount > rephraseVagueCount) {
      improvements.push('Removed vague language');
    }
    
    // Default improvement if none detected
    if (improvements.length === 0) {
      improvements.push('Improved overall structure and clarity');
    }
    
    return improvements;
  }

  /**
   * Estimate total cost for all candidates
   */
  private estimateTotalCost(candidates: RephraseCandidate[]): number {
    return candidates.reduce((total, candidate) => {
      const tokensUsed = (candidate as any).tokensUsed || 0;
      return total + this.openaiClient.estimateCost(tokensUsed * 0.3, tokensUsed * 0.7);
    }, 0);
  }

  /**
   * Generate warnings for the rephrase result
   */
  private generateWarnings(request: RephraseRequest, candidates: RephraseCandidate[]): string[] {
    const warnings: string[] = [];
    
    // Warn if original prompt was very short
    if (request.originalPrompt.length < 20) {
      warnings.push('Original prompt was very short - consider providing more context for better results');
    }
    
    // Warn if all candidates are very similar
    if (candidates.length > 1) {
      const similarities = this.calculateSimilarities(candidates);
      if (similarities > 0.8) {
        warnings.push('Generated candidates are very similar - original prompt may already be well-structured');
      }
    }
    
    // Warn about potential missing information
    const originalLower = request.originalPrompt.toLowerCase();
    if (originalLower.includes('code') || originalLower.includes('program')) {
      if (!originalLower.includes('language') && !originalLower.includes('python') && !originalLower.includes('javascript')) {
        warnings.push('Consider specifying the programming language for more targeted results');
      }
    }
    
    return warnings;
  }

  /**
   * Calculate average similarity between candidates
   */
  private calculateSimilarities(candidates: RephraseCandidate[]): number {
    if (candidates.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        totalSimilarity += this.calculateTextSimilarity(candidates[i].text, candidates[j].text);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Calculate similarity between two texts (simple word overlap)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}
