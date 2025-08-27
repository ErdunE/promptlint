/**
 * PromptLint LLM Service - Graceful Degradation
 * 
 * Provides fallback functionality when API is unavailable
 * Includes offline mode, cached responses, and user guidance
 */

import { RephraseResult, RephraseCandidate, RephraseRequest, RephraseApproach } from '@promptlint/shared-types';

export interface OfflineCapabilities {
  basicRephrase: boolean;
  templateSuggestions: boolean;
  structuredFormat: boolean;
  improvementTips: boolean;
}

export interface CacheEntry {
  prompt: string;
  result: RephraseResult;
  timestamp: number;
  hash: string;
}

/**
 * Rule-based rephrase suggestions for offline mode
 */
class OfflineRephraseEngine {
  private templates = {
    structured: {
      pattern: /^(write|create|build|implement|develop|design)/i,
      template: (prompt: string) => `**Task**: ${this.extractAction(prompt)}\n\n**Input**: [Specify your input requirements]\n\n**Output**: [Describe expected output format]\n\n**Additional Context**: [Add any relevant constraints or preferences]`
    },
    conversational: {
      pattern: /^(help|can you|please|could you)/i,
      template: (prompt: string) => `I need help with ${this.extractSubject(prompt)}. Here's what I'm looking for:\n\n- What I want to accomplish: [Describe your goal]\n- What I'm working with: [Specify your context/data]\n- How I want the result: [Format preferences]\n- Any constraints: [Limitations or requirements]\n\nCould you help me with this?`
    },
    imperative: {
      pattern: /./,
      template: (prompt: string) => `${this.capitalizeFirst(this.extractAction(prompt))} following these steps:\n\n1. [First step - specify what to analyze/process]\n2. [Second step - define the transformation/operation]\n3. [Third step - format the output as needed]\n4. [Final step - validate and present results]\n\nRequirements: [List any specific constraints or preferences]`
    }
  };

  private improvements = {
    vague: ['Be more specific about input/output', 'Add concrete examples', 'Specify the programming language or domain'],
    incomplete: ['Add missing context', 'Specify expected format', 'Include constraints or requirements'],
    unclear: ['Use precise terminology', 'Break down complex requests', 'Provide step-by-step details']
  };

  generateOfflineRephrase(request: RephraseRequest): RephraseResult {
    const candidates: RephraseCandidate[] = [];
    const originalPrompt = request.originalPrompt || 'create a solution'; // Handle empty prompts
    const candidateCount = Math.min(request.candidateCount || 3, 5); // Cap at 5 candidates

    // Generate structured candidate
    candidates.push(this.createStructuredCandidate(originalPrompt));

    // Generate conversational candidate if different
    if (candidateCount > 1) {
      candidates.push(this.createConversationalCandidate(originalPrompt));
    }

    // Generate imperative candidate if different
    if (candidateCount > 2) {
      candidates.push(this.createImperativeCandidate(originalPrompt));
    }

    // Add clarifying candidate if more are requested
    if (candidateCount > 3) {
      candidates.push(this.createClarifyingCandidate(originalPrompt));
    }

    // Add detailed candidate if maximum requested
    if (candidateCount > 4) {
      candidates.push(this.createDetailedCandidate(originalPrompt));
    }

    const warnings = [
      'Generated using offline rules-based engine',
      'For best results, configure OpenAI API key for AI-powered rephrasing',
      'This is a basic structural improvement - AI rephrasing provides more sophisticated results'
    ];

    // Add specific warning for empty prompts
    if (!request.originalPrompt || request.originalPrompt.trim().length === 0) {
      warnings.unshift('Empty prompt detected - providing helpful template structure');
    }

    return {
      originalPrompt: request.originalPrompt,
      candidates: candidates.slice(0, candidateCount),
      metadata: {
        processingTime: 10, // Instant for offline
        model: 'offline-rules-engine',
        tokensUsed: 0,
        estimatedCost: 0,
        timestamp: Date.now()
      },
      warnings
    };
  }

  private createStructuredCandidate(prompt: string): RephraseCandidate {
    const template = this.templates.structured.template(prompt);
    
    return {
      id: 'offline-structured',
      text: template,
      approach: 'structured',
      estimatedScore: this.estimateOfflineScore(template, prompt),
      improvements: this.identifyImprovements(prompt),
      length: template.length
    };
  }

  private createConversationalCandidate(prompt: string): RephraseCandidate {
    const template = this.templates.conversational.template(prompt);
    
    return {
      id: 'offline-conversational',
      text: template,
      approach: 'conversational',
      estimatedScore: this.estimateOfflineScore(template, prompt) - 5,
      improvements: ['Added conversational structure', 'Included placeholder guidance'],
      length: template.length
    };
  }

  private createImperativeCandidate(prompt: string): RephraseCandidate {
    const template = this.templates.imperative.template(prompt);
    
    return {
      id: 'offline-imperative',
      text: template,
      approach: 'imperative',
      estimatedScore: this.estimateOfflineScore(template, prompt) - 3,
      improvements: ['Added step-by-step structure', 'Used direct command style'],
      length: template.length
    };
  }

  private createClarifyingCandidate(prompt: string): RephraseCandidate {
    const clarifyingText = `${this.capitalizeFirst(this.extractAction(prompt))} with the following clarifications needed:

[Clarify: What specific type of ${this.extractSubject(prompt)} do you need?]
[Clarify: What format should the output be in?]
[Clarify: Are there any constraints or requirements?]
[Clarify: What programming language or platform should be used?]

Please provide these details for a more targeted solution.`;
    
    return {
      id: 'offline-clarifying',
      text: clarifyingText,
      approach: 'clarifying',
      estimatedScore: this.estimateOfflineScore(clarifyingText, prompt) - 8,
      improvements: ['Added explicit clarification requests', 'Identified missing information'],
      length: clarifyingText.length
    };
  }

  private createDetailedCandidate(prompt: string): RephraseCandidate {
    const detailedText = `**Comprehensive Request**: ${this.capitalizeFirst(this.extractAction(prompt))}

**Detailed Specification**:
- **Primary Goal**: [Describe the main objective]
- **Input Requirements**: [Specify what data/information will be provided]
- **Output Format**: [Define the expected result format]
- **Technical Constraints**: [List any limitations or requirements]
- **Success Criteria**: [How will you know it's working correctly?]

**Additional Context**:
- **Use Case**: [Explain when/where this will be used]
- **Performance Requirements**: [Any speed/efficiency needs]
- **Error Handling**: [How should edge cases be handled?]

Please fill in the bracketed sections with your specific requirements.`;
    
    return {
      id: 'offline-detailed',
      text: detailedText,
      approach: 'detailed',
      estimatedScore: this.estimateOfflineScore(detailedText, prompt) + 5,
      improvements: ['Added comprehensive specification template', 'Included success criteria', 'Added context sections'],
      length: detailedText.length
    };
  }

  private extractAction(prompt: string): string {
    const actionWords = ['write', 'create', 'build', 'implement', 'develop', 'design', 'generate', 'make'];
    const words = prompt.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (actionWords.includes(word)) {
        const index = words.indexOf(word);
        return words.slice(index, index + 3).join(' ');
      }
    }
    
    return 'create a solution';
  }

  private extractSubject(prompt: string): string {
    // Remove common prefixes and extract the main subject
    const cleaned = prompt.replace(/^(help|can you|please|could you|i need|i want)/i, '').trim();
    return cleaned || 'the requested task';
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private estimateOfflineScore(rephrased: string, original: string): number {
    let score = 40; // Base score for offline mode
    
    // Length improvement
    if (rephrased.length > original.length * 1.5) score += 10;
    
    // Structure indicators
    if (rephrased.includes('**Task**') || rephrased.includes('1.')) score += 15;
    
    // Placeholder guidance
    if (rephrased.includes('[') && rephrased.includes(']')) score += 10;
    
    return Math.min(score, 75); // Cap offline scores at 75
  }

  private identifyImprovements(prompt: string): string[] {
    const improvements: string[] = [];
    
    if (prompt.length < 20) {
      improvements.push('Added structure to brief prompt');
    }
    
    if (!prompt.includes('input') && !prompt.includes('output')) {
      improvements.push('Added input/output specification');
    }
    
    improvements.push('Provided template structure');
    improvements.push('Added placeholder guidance');
    
    return improvements;
  }
}

/**
 * Response caching for improved offline experience
 */
class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxEntries = 50;
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours

  set(prompt: string, result: RephraseResult): void {
    const hash = this.hashPrompt(prompt);
    
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxEntries) {
      this.cleanOldEntries();
    }
    
    this.cache.set(hash, {
      prompt,
      result: { ...result, metadata: { ...result.metadata, timestamp: Date.now() } },
      timestamp: Date.now(),
      hash
    });
  }

  get(prompt: string): RephraseResult | null {
    const hash = this.hashPrompt(prompt);
    const entry = this.cache.get(hash);
    
    if (!entry) return null;
    
    // Check if entry is still valid
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }
    
    return {
      ...entry.result,
      warnings: [
        ...(entry.result.warnings || []),
        'Result retrieved from cache (offline mode)'
      ]
    };
  }

  private hashPrompt(prompt: string): string {
    // Simple hash function for prompt caching
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private cleanOldEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp and remove oldest entries
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxEntries: number; oldestEntry?: number } {
    const entries = Array.from(this.cache.values());
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : undefined;
    
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      oldestEntry
    };
  }
}

/**
 * Main graceful degradation manager
 */
export class GracefulDegradationManager {
  private offlineEngine = new OfflineRephraseEngine();
  private cache = new ResponseCache();
  private isOnlineMode = true;

  /**
   * Handle rephrase request with graceful degradation
   */
  async handleRephrase(
    request: RephraseRequest,
    primaryHandler: (req: RephraseRequest) => Promise<RephraseResult>
  ): Promise<RephraseResult> {
    // Try cache first if offline
    if (!this.isOnlineMode) {
      const cached = this.cache.get(request.originalPrompt);
      if (cached) {
        return cached;
      }
    }

    try {
      // Attempt primary (online) handler
      const result = await primaryHandler(request);
      
      // Cache successful results
      this.cache.set(request.originalPrompt, result);
      this.isOnlineMode = true;
      
      return result;

    } catch (error) {
      console.warn('[PromptLint Graceful] Primary handler failed, attempting graceful degradation:', error);
      
      // Mark as offline mode
      this.isOnlineMode = false;
      
      // Try cache first
      const cached = this.cache.get(request.originalPrompt);
      if (cached) {
        return {
          ...cached,
          warnings: [
            ...(cached.warnings || []),
            'Service temporarily unavailable - using cached result'
          ]
        };
      }

      // Fall back to offline engine
      return this.offlineEngine.generateOfflineRephrase(request);
    }
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): OfflineCapabilities & {
    onlineMode: boolean;
    cacheStats: ReturnType<ResponseCache['getStats']>;
  } {
    return {
      basicRephrase: true,
      templateSuggestions: true,
      structuredFormat: true,
      improvementTips: true,
      onlineMode: this.isOnlineMode,
      cacheStats: this.cache.getStats()
    };
  }

  /**
   * Force offline mode (for testing)
   */
  setOfflineMode(offline: boolean): void {
    this.isOnlineMode = !offline;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get user guidance for current state
   */
  getUserGuidance(): {
    status: string;
    message: string;
    actionable: string[];
  } {
    if (this.isOnlineMode) {
      return {
        status: 'online',
        message: 'AI-powered rephrasing is available',
        actionable: []
      };
    }

    return {
      status: 'offline',
      message: 'Using offline mode with rule-based improvements',
      actionable: [
        'Check your internet connection',
        'Verify your OpenAI API key is valid',
        'Try again in a few minutes',
        'Basic structural improvements are still available'
      ]
    };
  }
}

/**
 * Global graceful degradation manager
 */
export const globalGracefulDegradation = new GracefulDegradationManager();
