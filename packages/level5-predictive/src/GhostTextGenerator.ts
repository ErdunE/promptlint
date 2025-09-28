/**
 * Ghost Text Generator with Pattern Awareness
 * Intelligent autocomplete based on behavioral patterns and context
 * Must complete within 50ms performance target
 */

import { ContextMemory } from '@promptlint/level5-memory';
import {
  DetectedPatterns,
  WorkflowContext,
  GhostTextSuggestion,
  PredictedAction
} from './types/PatternTypes.js';

export interface GhostTextOptions {
  maxSuggestionLength: number;
  minConfidenceThreshold: number;
  enablePatternMatching: boolean;
  enableContextualInference: boolean;
}

export class GhostTextGenerator {
  private options: GhostTextOptions;
  private commonCompletions: Map<string, CompletionData> = new Map();
  private patternCompletions: Map<string, PatternCompletion> = new Map();

  constructor(options: Partial<GhostTextOptions> = {}) {
    this.options = {
      maxSuggestionLength: 50,
      minConfidenceThreshold: 0.6,
      enablePatternMatching: true,
      enableContextualInference: true,
      ...options
    };

    this.initializeCommonCompletions();
  }

  /**
   * Generate ghost text suggestion based on patterns and context
   * Combines partial input with behavioral patterns to predict completion
   * Must complete within 50ms performance target
   */
  async generateGhostText(
    partialInput: string,
    patterns: DetectedPatterns,
    context: WorkflowContext
  ): Promise<GhostTextSuggestion> {
    const startTime = performance.now();

    try {
      console.log(`[GhostText] Generating suggestion for: "${partialInput}"`);

      // Quick return for very short inputs
      if (partialInput.length < 2) {
        return this.createEmptySuggestion();
      }

      // Generate suggestions from different sources
      const suggestions: GhostTextSuggestion[] = [];

      // Pattern-based suggestions
      if (this.options.enablePatternMatching) {
        const patternSuggestion = await this.generatePatternBasedSuggestion(
          partialInput, patterns, context
        );
        if (patternSuggestion) suggestions.push(patternSuggestion);
      }

      // Historical match suggestions
      const historicalSuggestion = this.generateHistoricalSuggestion(
        partialInput, patterns
      );
      if (historicalSuggestion) suggestions.push(historicalSuggestion);

      // Contextual inference suggestions
      if (this.options.enableContextualInference) {
        const contextualSuggestion = this.generateContextualSuggestion(
          partialInput, context
        );
        if (contextualSuggestion) suggestions.push(contextualSuggestion);
      }

      // Common completion suggestions
      const commonSuggestion = this.generateCommonCompletion(partialInput);
      if (commonSuggestion) suggestions.push(commonSuggestion);

      // Select best suggestion
      const bestSuggestion = this.selectBestSuggestion(suggestions);

      const generationTime = performance.now() - startTime;

      // Ensure we meet the 50ms performance target
      if (generationTime > 50) {
        console.warn(`[GhostText] Generation exceeded 50ms target: ${generationTime.toFixed(2)}ms`);
      }

      console.log(`[GhostText] Generated suggestion in ${generationTime.toFixed(2)}ms: "${bestSuggestion.text}"`);

      return bestSuggestion;

    } catch (error) {
      console.error('[GhostText] Generation failed:', error);
      return this.createEmptySuggestion();
    }
  }

  /**
   * Update pattern completions based on user acceptance/rejection
   */
  updatePatternCompletion(
    partialInput: string,
    suggestion: string,
    wasAccepted: boolean,
    context: WorkflowContext
  ): void {
    const key = `${partialInput.toLowerCase()}_${context.domain}`;
    
    if (this.patternCompletions.has(key)) {
      const existing = this.patternCompletions.get(key)!;
      existing.usageCount += 1;
      
      if (wasAccepted) {
        existing.acceptanceRate = (existing.acceptanceRate * (existing.usageCount - 1) + 1) / existing.usageCount;
      } else {
        existing.acceptanceRate = (existing.acceptanceRate * (existing.usageCount - 1)) / existing.usageCount;
      }
      
      existing.lastUsed = Date.now();
    } else {
      this.patternCompletions.set(key, {
        completion: suggestion,
        confidence: wasAccepted ? 0.8 : 0.3,
        acceptanceRate: wasAccepted ? 1.0 : 0.0,
        usageCount: 1,
        contexts: [context.domain],
        lastUsed: Date.now()
      });
    }

    console.log(`[GhostText] Updated pattern completion for "${partialInput}": acceptance=${wasAccepted}`);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      totalPatternCompletions: this.patternCompletions.size,
      avgAcceptanceRate: this.calculateAverageAcceptanceRate(),
      commonCompletions: this.commonCompletions.size
    };
  }

  // Private helper methods

  private async generatePatternBasedSuggestion(
    partialInput: string,
    patterns: DetectedPatterns,
    context: WorkflowContext
  ): Promise<GhostTextSuggestion | null> {
    // Look for sequence patterns that might predict the next words
    for (const sequence of patterns.sequences) {
      if (sequence.confidence > 0.7 && sequence.nextPredictions.length > 0) {
        const prediction = sequence.nextPredictions[0];
        
        if (this.matchesPartialInput(prediction.action, partialInput)) {
          const completion = this.generateCompletionFromAction(prediction.action, partialInput);
          
          if (completion) {
            return {
              text: completion,
              confidence: sequence.confidence * 0.9,
              completionType: 'phrase',
              reasoning: `Based on your ${sequence.sequence.join(' → ')} workflow pattern`,
              source: 'behavioral_pattern'
            };
          }
        }
      }
    }

    // Look for preference patterns
    for (const preference of patterns.preferences) {
      if (preference.strength > 0.6 && preference.category === 'template') {
        const templateCompletion = this.generateTemplateCompletion(
          partialInput, preference.preference, context
        );
        
        if (templateCompletion) {
          return {
            text: templateCompletion,
            confidence: preference.strength,
            completionType: 'template',
            reasoning: `You often use ${preference.preference} for ${context.domain} tasks`,
            source: 'behavioral_pattern'
          };
        }
      }
    }

    return null;
  }

  private generateHistoricalSuggestion(
    partialInput: string,
    patterns: DetectedPatterns
  ): GhostTextSuggestion | null {
    // This would analyze historical interactions for similar partial inputs
    // For now, implement a simplified version

    const lowerInput = partialInput.toLowerCase();
    
    // Check pattern completions
    for (const [key, completion] of this.patternCompletions.entries()) {
      if (key.startsWith(lowerInput) && completion.acceptanceRate > 0.6) {
        const remainingText = completion.completion.substring(partialInput.length);
        
        if (remainingText.length > 0) {
          return {
            text: remainingText,
            confidence: completion.confidence * completion.acceptanceRate,
            completionType: 'phrase',
            reasoning: `Based on your previous usage (${(completion.acceptanceRate * 100).toFixed(0)}% acceptance)`,
            source: 'historical_match'
          };
        }
      }
    }

    return null;
  }

  private generateContextualSuggestion(
    partialInput: string,
    context: WorkflowContext
  ): GhostTextSuggestion | null {
    const lowerInput = partialInput.toLowerCase();

    // Domain-specific contextual suggestions
    const domainSuggestions: Record<string, Record<string, string>> = {
      'development': {
        'create a': ' function that handles',
        'write a': ' test for the',
        'implement': ' the following functionality:',
        'debug': ' the issue in',
        'refactor': ' this code to improve',
        'add': ' error handling for',
        'fix': ' the bug in'
      },
      'documentation': {
        'write': ' comprehensive documentation for',
        'create': ' a guide that explains',
        'document': ' the API endpoints',
        'explain': ' how to use',
        'describe': ' the implementation of'
      },
      'design': {
        'create': ' a mockup for',
        'design': ' a user interface that',
        'build': ' a prototype of',
        'sketch': ' the layout for'
      }
    };

    const contextSuggestions = domainSuggestions[context.domain] || domainSuggestions['development'];

    for (const [prefix, completion] of Object.entries(contextSuggestions)) {
      if (lowerInput.endsWith(prefix.toLowerCase())) {
        return {
          text: completion,
          confidence: 0.7,
          completionType: 'phrase',
          reasoning: `Common pattern for ${context.domain} tasks`,
          source: 'contextual_inference'
        };
      }
    }

    // Intent-based suggestions
    if (context.currentIntent) {
      const intentCompletion = this.generateIntentBasedCompletion(partialInput, context.currentIntent);
      if (intentCompletion) {
        return {
          text: intentCompletion,
          confidence: 0.65,
          completionType: 'phrase',
          reasoning: `Typical completion for ${context.currentIntent} tasks`,
          source: 'contextual_inference'
        };
      }
    }

    return null;
  }

  private generateCommonCompletion(partialInput: string): GhostTextSuggestion | null {
    const lowerInput = partialInput.toLowerCase();

    for (const [prefix, data] of this.commonCompletions.entries()) {
      if (lowerInput.endsWith(prefix)) {
        const completion = data.completions[0]; // Take the most common one
        
        return {
          text: completion,
          confidence: data.confidence,
          completionType: 'word',
          reasoning: 'Common completion pattern',
          source: 'common_pattern'
        };
      }
    }

    return null;
  }

  private selectBestSuggestion(suggestions: GhostTextSuggestion[]): GhostTextSuggestion {
    if (suggestions.length === 0) {
      return this.createEmptySuggestion();
    }

    // Filter by confidence threshold
    const validSuggestions = suggestions.filter(s => s.confidence >= this.options.minConfidenceThreshold);
    
    if (validSuggestions.length === 0) {
      return this.createEmptySuggestion();
    }

    // Sort by confidence and select the best
    validSuggestions.sort((a, b) => b.confidence - a.confidence);
    
    const best = validSuggestions[0];
    
    // Ensure suggestion doesn't exceed max length
    if (best.text.length > this.options.maxSuggestionLength) {
      best.text = best.text.substring(0, this.options.maxSuggestionLength) + '...';
    }

    return best;
  }

  private matchesPartialInput(action: string, partialInput: string): boolean {
    return action.toLowerCase().startsWith(partialInput.toLowerCase());
  }

  private generateCompletionFromAction(action: string, partialInput: string): string | null {
    const actionLower = action.toLowerCase();
    const inputLower = partialInput.toLowerCase();
    
    if (actionLower.startsWith(inputLower)) {
      return action.substring(partialInput.length);
    }
    
    return null;
  }

  private generateTemplateCompletion(
    partialInput: string,
    templateType: string,
    context: WorkflowContext
  ): string | null {
    const templateCompletions: Record<string, Record<string, string>> = {
      'BulletTemplate': {
        'analyze': ' the following data points:',
        'list': ' the key requirements:',
        'identify': ' the main issues:',
        'compare': ' these options:'
      },
      'StepByStepTemplate': {
        'create': ' a step-by-step guide for',
        'implement': ' the following process:',
        'build': ' this feature step by step:',
        'setup': ' the environment by:'
      },
      'CodeTemplate': {
        'write': ' a function that',
        'create': ' a class for',
        'implement': ' the algorithm to',
        'build': ' a component that'
      }
    };

    const completions = templateCompletions[templateType];
    if (!completions) return null;

    const lowerInput = partialInput.toLowerCase();
    
    for (const [prefix, completion] of Object.entries(completions)) {
      if (lowerInput.endsWith(prefix)) {
        return completion;
      }
    }

    return null;
  }

  private generateIntentBasedCompletion(partialInput: string, intent: string): string | null {
    const intentCompletions: Record<string, Record<string, string>> = {
      'create': {
        'create a': ' new',
        'build': ' a',
        'make': ' a'
      },
      'analyze': {
        'analyze': ' the',
        'examine': ' this',
        'review': ' the'
      },
      'solve': {
        'solve': ' the problem with',
        'fix': ' the issue in',
        'resolve': ' the error'
      },
      'explain': {
        'explain': ' how to',
        'describe': ' the process of',
        'clarify': ' why'
      }
    };

    const completions = intentCompletions[intent];
    if (!completions) return null;

    const lowerInput = partialInput.toLowerCase();
    
    for (const [prefix, completion] of Object.entries(completions)) {
      if (lowerInput.endsWith(prefix)) {
        return completion;
      }
    }

    return null;
  }

  private createEmptySuggestion(): GhostTextSuggestion {
    return {
      text: '',
      confidence: 0,
      completionType: 'word',
      reasoning: 'No suitable completion found',
      source: 'none'
    };
  }

  private calculateAverageAcceptanceRate(): number {
    if (this.patternCompletions.size === 0) return 0;
    
    const totalRate = Array.from(this.patternCompletions.values())
      .reduce((sum, completion) => sum + completion.acceptanceRate, 0);
    
    return totalRate / this.patternCompletions.size;
  }

  private initializeCommonCompletions(): void {
    // Initialize with common programming and writing completions
    const commonPatterns = [
      { prefix: 'create a', completions: [' function', ' class', ' component', ' new'], confidence: 0.8 },
      { prefix: 'write a', completions: [' function', ' test', ' script', ' guide'], confidence: 0.8 },
      { prefix: 'build a', completions: [' component', ' system', ' feature', ' tool'], confidence: 0.75 },
      { prefix: 'implement', completions: [' the', ' a', ' this'], confidence: 0.7 },
      { prefix: 'how to', completions: [' use', ' implement', ' create', ' build'], confidence: 0.85 },
      { prefix: 'help me', completions: [' with', ' understand', ' create', ' solve'], confidence: 0.8 },
      { prefix: 'can you', completions: [' help', ' explain', ' create', ' show'], confidence: 0.8 },
      { prefix: 'i need', completions: [' to', ' help', ' a'], confidence: 0.7 },
      { prefix: 'please', completions: [' help', ' explain', ' create', ' show'], confidence: 0.75 }
    ];

    commonPatterns.forEach(pattern => {
      this.commonCompletions.set(pattern.prefix, {
        completions: pattern.completions,
        confidence: pattern.confidence,
        usageCount: 0,
        lastUsed: Date.now()
      });
    });
  }
}

// Supporting interfaces
interface CompletionData {
  completions: string[];
  confidence: number;
  usageCount: number;
  lastUsed: number;
}

interface PatternCompletion {
  completion: string;
  confidence: number;
  acceptanceRate: number;
  usageCount: number;
  contexts: string[];
  lastUsed: number;
}

// Factory function
export function createGhostTextGenerator(options?: Partial<GhostTextOptions>): GhostTextGenerator {
  return new GhostTextGenerator(options);
}
