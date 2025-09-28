/**
 * Ghost Text Generator with Pattern Awareness
 * Intelligent autocomplete based on behavioral patterns and context
 * Must complete within 50ms performance target
 */

// Local type definition to avoid cross-package imports
interface ContextMemory {
  episodic: any[];
  semantic: any[];
  working?: any;
  workflow?: any;
}
import {
  DetectedPatterns,
  WorkflowContext,
  PredictedAction
} from './types/PatternTypes.js';
import { GhostTextSuggestion } from './types/PredictiveTypes.js';

import {
  WorkflowState,
  WorkflowPhase
} from './types/WorkflowTypes.js';

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
   * Generate workflow-aware ghost text based on current workflow state
   * Provides context-sensitive autocomplete that adapts to workflow phase
   */
  async generateWorkflowAwareGhostText(
    partialInput: string,
    workflowState: WorkflowState,
    patterns: DetectedPatterns
  ): Promise<GhostTextSuggestion> {
    const startTime = performance.now();

    try {
      console.log(`[GhostText] Generating workflow-aware suggestion for "${partialInput}" in ${workflowState.phase} phase`);

      // Quick return for very short inputs
      if (partialInput.length < 2) {
        return this.createEmptySuggestion();
      }

      const suggestions: GhostTextSuggestion[] = [];

      // Workflow-specific suggestions (highest priority)
      const workflowSuggestion = this.generateWorkflowSpecificSuggestion(
        partialInput, workflowState
      );
      if (workflowSuggestion) suggestions.push(workflowSuggestion);

      // Phase-transition suggestions
      const transitionSuggestion = this.generatePhaseTransitionSuggestion(
        partialInput, workflowState
      );
      if (transitionSuggestion) suggestions.push(transitionSuggestion);

      // Context-aware suggestions enhanced with workflow
      const contextualSuggestion = this.generateWorkflowContextualSuggestion(
        partialInput, workflowState
      );
      if (contextualSuggestion) suggestions.push(contextualSuggestion);

      // Pattern-based suggestions with workflow filtering
      const patternSuggestion = await this.generateWorkflowPatternSuggestion(
        partialInput, patterns, workflowState
      );
      if (patternSuggestion) suggestions.push(patternSuggestion);

      // Select best workflow-aware suggestion
      const bestSuggestion = this.selectBestWorkflowSuggestion(suggestions, workflowState);

      const generationTime = performance.now() - startTime;

      // Ensure we meet the 50ms performance target
      if (generationTime > 50) {
        console.warn(`[GhostText] Workflow generation exceeded 50ms target: ${generationTime.toFixed(2)}ms`);
      }

      console.log(`[GhostText] Generated workflow-aware suggestion in ${generationTime.toFixed(2)}ms: "${bestSuggestion.text}"`);

      return bestSuggestion;

    } catch (error) {
      console.error('[GhostText] Workflow-aware generation failed:', error);
      return this.createEmptySuggestion();
    }
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

  // Workflow-aware ghost text helper methods

  private generateWorkflowSpecificSuggestion(
    partialInput: string,
    workflowState: WorkflowState
  ): GhostTextSuggestion | null {
    const lowerInput = partialInput.toLowerCase();
    
    // Phase-specific completions with high confidence
    const phaseCompletions: Record<WorkflowPhase, Record<string, { completion: string, confidence: number }>> = {
      'planning': {
        'create': { completion: ' a detailed implementation plan', confidence: 0.9 },
        'design': { completion: ' the system architecture', confidence: 0.9 },
        'plan': { completion: ' the development approach', confidence: 0.85 },
        'define': { completion: ' the requirements and scope', confidence: 0.8 },
        'analyze': { completion: ' the technical requirements', confidence: 0.8 }
      },
      'implementation': {
        'write': { completion: ' a function that handles', confidence: 0.9 },
        'create': { completion: ' a new component for', confidence: 0.85 },
        'implement': { completion: ' the business logic for', confidence: 0.9 },
        'add': { completion: ' error handling to', confidence: 0.8 },
        'build': { completion: ' the core functionality', confidence: 0.8 }
      },
      'testing': {
        'write': { completion: ' unit tests for the', confidence: 0.9 },
        'test': { completion: ' the new functionality', confidence: 0.85 },
        'verify': { completion: ' that the implementation', confidence: 0.8 },
        'check': { completion: ' if all edge cases', confidence: 0.8 },
        'validate': { completion: ' the input parameters', confidence: 0.75 }
      },
      'debugging': {
        'fix': { completion: ' the bug in the', confidence: 0.9 },
        'debug': { completion: ' the issue with', confidence: 0.85 },
        'investigate': { completion: ' why the test is failing', confidence: 0.8 },
        'resolve': { completion: ' the error in', confidence: 0.8 },
        'trace': { completion: ' the root cause of', confidence: 0.75 }
      },
      'documentation': {
        'document': { completion: ' the API endpoints and', confidence: 0.9 },
        'write': { completion: ' comprehensive documentation for', confidence: 0.85 },
        'create': { completion: ' usage examples for', confidence: 0.8 },
        'explain': { completion: ' how to use the', confidence: 0.8 },
        'describe': { completion: ' the implementation details', confidence: 0.75 }
      },
      'review': {
        'review': { completion: ' the code changes for', confidence: 0.9 },
        'check': { completion: ' the implementation against', confidence: 0.8 },
        'validate': { completion: ' the solution meets', confidence: 0.8 },
        'ensure': { completion: ' the code follows', confidence: 0.75 },
        'verify': { completion: ' all requirements are met', confidence: 0.75 }
      },
      'deployment': {
        'deploy': { completion: ' the application to production', confidence: 0.9 },
        'setup': { completion: ' the production environment', confidence: 0.85 },
        'configure': { completion: ' the deployment pipeline', confidence: 0.8 },
        'prepare': { completion: ' the release for deployment', confidence: 0.8 },
        'monitor': { completion: ' the deployment process', confidence: 0.75 }
      },
      'maintenance': {
        'update': { completion: ' the dependencies to', confidence: 0.85 },
        'optimize': { completion: ' the performance of', confidence: 0.8 },
        'refactor': { completion: ' the code to improve', confidence: 0.8 },
        'maintain': { completion: ' the system by', confidence: 0.75 },
        'monitor': { completion: ' the application performance', confidence: 0.75 }
      }
    };

    const completions = phaseCompletions[workflowState.phase] || {};

    for (const [prefix, data] of Object.entries(completions)) {
      if (lowerInput.endsWith(prefix)) {
        return {
          text: data.completion,
          confidence: data.confidence * workflowState.confidence, // Factor in workflow confidence
          completionType: 'phrase',
          reasoning: `Workflow-specific completion for ${workflowState.phase} phase`,
          source: 'workflow_specific'
        };
      }
    }

    return null;
  }

  private generatePhaseTransitionSuggestion(
    partialInput: string,
    workflowState: WorkflowState
  ): GhostTextSuggestion | null {
    const lowerInput = partialInput.toLowerCase();

    // Common transition phrases that suggest moving to next phase
    const transitionPhrases: Record<WorkflowPhase, Record<string, { completion: string, nextPhase: WorkflowPhase }>> = {
      'planning': {
        'now let': { completion: "'s implement the solution", nextPhase: 'implementation' },
        'ready to': { completion: ' start implementation', nextPhase: 'implementation' },
        'time to': { completion: ' begin coding', nextPhase: 'implementation' }
      },
      'implementation': {
        'now let': { completion: "'s test this functionality", nextPhase: 'testing' },
        'ready to': { completion: ' test the implementation', nextPhase: 'testing' },
        'time to': { completion: ' write some tests', nextPhase: 'testing' }
      },
      'testing': {
        'now let': { completion: "'s document this feature", nextPhase: 'documentation' },
        'ready to': { completion: ' create documentation', nextPhase: 'documentation' },
        'time to': { completion: ' write the docs', nextPhase: 'documentation' }
      },
      'debugging': {
        'now let': { completion: "'s test the fix", nextPhase: 'testing' },
        'ready to': { completion: ' verify the solution', nextPhase: 'testing' },
        'time to': { completion: ' run the tests again', nextPhase: 'testing' }
      },
      'documentation': {
        'now let': { completion: "'s get this reviewed", nextPhase: 'review' },
        'ready for': { completion: ' code review', nextPhase: 'review' },
        'time to': { completion: ' submit for review', nextPhase: 'review' }
      },
      'review': {
        'ready to': { completion: ' deploy to production', nextPhase: 'deployment' },
        'time to': { completion: ' release this feature', nextPhase: 'deployment' },
        'let': { completion: "'s deploy this", nextPhase: 'deployment' }
      },
      'deployment': {
        'now let': { completion: "'s monitor the deployment", nextPhase: 'maintenance' },
        'time to': { completion: ' monitor performance', nextPhase: 'maintenance' },
        'ready to': { completion: ' maintain the system', nextPhase: 'maintenance' }
      },
      'maintenance': {
        'time to': { completion: ' plan the next feature', nextPhase: 'planning' },
        'ready to': { completion: ' start planning improvements', nextPhase: 'planning' },
        'let': { completion: "'s plan the next iteration", nextPhase: 'planning' }
      }
    };

    const transitions = transitionPhrases[workflowState.phase] || {};

    for (const [prefix, data] of Object.entries(transitions)) {
      if (lowerInput.endsWith(prefix)) {
        return {
          text: data.completion,
          confidence: 0.8,
          completionType: 'phrase',
          reasoning: `Suggests transitioning from ${workflowState.phase} to ${data.nextPhase}`,
          source: 'workflow_transition'
        };
      }
    }

    return null;
  }

  private generateWorkflowContextualSuggestion(
    partialInput: string,
    workflowState: WorkflowState
  ): GhostTextSuggestion | null {
    const lowerInput = partialInput.toLowerCase();

    // Context-aware completions based on workflow metadata
    const contextualCompletions: string[] = [];

    // Urgency-aware completions
    if (workflowState.metadata.urgency === 'high' || workflowState.metadata.urgency === 'critical') {
      if (lowerInput.includes('quick')) {
        contextualCompletions.push('ly implement a solution');
      }
      if (lowerInput.includes('urgent')) {
        contextualCompletions.push(' fix for the production issue');
      }
      if (lowerInput.includes('asap')) {
        contextualCompletions.push(' - need this deployed immediately');
      }
    }

    // Team size aware completions
    if (workflowState.metadata.teamSize > 1) {
      if (lowerInput.includes('team')) {
        contextualCompletions.push(' collaboration on this feature');
      }
      if (lowerInput.includes('review')) {
        contextualCompletions.push(' with the team before merging');
      }
    }

    // Complexity-aware completions
    if (workflowState.metadata.complexity === 'enterprise' || workflowState.metadata.complexity === 'complex') {
      if (lowerInput.includes('scalable')) {
        contextualCompletions.push(' solution for enterprise use');
      }
      if (lowerInput.includes('architecture')) {
        contextualCompletions.push(' that supports high availability');
      }
    }

    // Domain-specific completions
    if (workflowState.metadata.domain === 'development') {
      if (lowerInput.includes('performance')) {
        contextualCompletions.push(' optimization for better user experience');
      }
      if (lowerInput.includes('security')) {
        contextualCompletions.push(' measures to protect user data');
      }
    }

    if (contextualCompletions.length > 0) {
      return {
        text: contextualCompletions[0],
        confidence: 0.75,
        completionType: 'phrase',
        reasoning: `Context-aware completion based on ${workflowState.metadata.urgency} urgency and ${workflowState.metadata.complexity} complexity`,
        source: 'workflow_contextual'
      };
    }

    return null;
  }

  private async generateWorkflowPatternSuggestion(
    partialInput: string,
    patterns: DetectedPatterns,
    workflowState: WorkflowState
  ): Promise<GhostTextSuggestion | null> {
    // Filter patterns relevant to current workflow phase
    const relevantSequences = patterns.sequences.filter(seq => 
      seq.sequence.some(step => this.isWorkflowRelated(step, workflowState.phase))
    );

    if (relevantSequences.length === 0) return null;

    // Use the most confident relevant sequence
    const bestSequence = relevantSequences.sort((a, b) => b.confidence - a.confidence)[0];

    // Generate completion based on sequence pattern
    const lowerInput = partialInput.toLowerCase();
    
    for (const step of bestSequence.sequence) {
      if (step.toLowerCase().startsWith(lowerInput)) {
        const completion = step.substring(partialInput.length);
        if (completion.length > 0) {
          return {
            text: completion,
            confidence: bestSequence.confidence * 0.8, // Slight reduction for pattern-based
            completionType: 'phrase',
            reasoning: `Based on your workflow pattern: ${bestSequence.sequence.join(' → ')}`,
            source: 'workflow_pattern'
          };
        }
      }
    }

    return null;
  }

  private selectBestWorkflowSuggestion(
    suggestions: GhostTextSuggestion[],
    workflowState: WorkflowState
  ): GhostTextSuggestion {
    if (suggestions.length === 0) {
      return this.createEmptySuggestion();
    }

    // Filter by confidence threshold
    const validSuggestions = suggestions.filter(s => s.confidence >= this.options.minConfidenceThreshold);
    
    if (validSuggestions.length === 0) {
      return this.createEmptySuggestion();
    }

    // Prioritize workflow-specific suggestions
    const workflowSpecific = validSuggestions.filter(s => s.source === 'workflow_specific');
    if (workflowSpecific.length > 0) {
      return this.selectHighestConfidence(workflowSpecific);
    }

    // Then transition suggestions
    const transitionSuggestions = validSuggestions.filter(s => s.source === 'workflow_transition');
    if (transitionSuggestions.length > 0) {
      return this.selectHighestConfidence(transitionSuggestions);
    }

    // Then contextual suggestions
    const contextualSuggestions = validSuggestions.filter(s => s.source === 'workflow_contextual');
    if (contextualSuggestions.length > 0) {
      return this.selectHighestConfidence(contextualSuggestions);
    }

    // Finally pattern-based suggestions
    return this.selectHighestConfidence(validSuggestions);
  }

  private selectHighestConfidence(suggestions: GhostTextSuggestion[]): GhostTextSuggestion {
    const sorted = suggestions.sort((a, b) => b.confidence - a.confidence);
    const best = sorted[0];
    
    // Ensure suggestion doesn't exceed max length
    if (best.text.length > this.options.maxSuggestionLength) {
      best.text = best.text.substring(0, this.options.maxSuggestionLength) + '...';
    }

    return best;
  }

  private isWorkflowRelated(step: string, phase: WorkflowPhase): boolean {
    const phaseKeywords: Record<WorkflowPhase, string[]> = {
      'planning': ['plan', 'design', 'architecture', 'requirements', 'scope'],
      'implementation': ['implement', 'code', 'build', 'create', 'develop'],
      'testing': ['test', 'verify', 'validate', 'check'],
      'debugging': ['debug', 'fix', 'resolve', 'investigate'],
      'documentation': ['document', 'readme', 'guide', 'explain'],
      'review': ['review', 'feedback', 'approve', 'merge'],
      'deployment': ['deploy', 'release', 'production', 'launch'],
      'maintenance': ['maintain', 'update', 'optimize', 'monitor']
    };

    const keywords = phaseKeywords[phase] || [];
    return keywords.some(keyword => step.toLowerCase().includes(keyword));
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
