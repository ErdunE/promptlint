/**
 * Level 5 Predictive Intent Engine
 * Anticipates user needs based on workflow patterns
 * Provides real-time autocomplete and intent prediction
 */

import { PersistentMemoryManager, ContextMemory, BehavioralPattern } from '@promptlint/level5-memory';
import { 
  PredictedIntent, 
  BehavioralPatternRecognizer,
  SequencePattern,
  WorkflowStage,
  GhostTextSuggestion,
  PredictiveContext,
  PredictionPerformanceMetrics
} from './types/PredictiveTypes.js';

export class PredictiveIntentEngine {
  private memoryManager: PersistentMemoryManager;
  private patternRecognizer: BehavioralPatternRecognizer;
  private performanceMetrics: PredictionPerformanceMetrics;
  private isInitialized = false;

  constructor(memoryManager: PersistentMemoryManager) {
    this.memoryManager = memoryManager;
    this.patternRecognizer = new DefaultPatternRecognizer();
    this.performanceMetrics = {
      predictionTime: 0,
      accuracyRate: 0,
      ghostTextLatency: 0,
      patternMatchCount: 0
    };
  }

  /**
   * Initialize the predictive engine
   */
  async initialize(): Promise<void> {
    console.log('[Level5Predictive] Initializing PredictiveIntentEngine...');
    
    try {
      // Ensure memory manager is initialized
      if (!this.memoryManager) {
        throw new Error('Memory manager is required');
      }

      this.isInitialized = true;
      console.log('[Level5Predictive] PredictiveIntentEngine initialized successfully');
      
    } catch (error) {
      console.error('[Level5Predictive] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Analyze current prompt context, retrieve historical patterns,
   * generate predictions with confidence scores, and return top 3 predictions >60% confidence
   */
  async predictNextIntent(currentPrompt: string, sessionId: string = 'default'): Promise<PredictedIntent[]> {
    const startTime = performance.now();
    
    if (!this.isInitialized) {
      throw new Error('Predictive engine not initialized');
    }

    try {
      console.log(`[Level5Predictive] Predicting next intent for: "${currentPrompt.substring(0, 50)}..."`);
      
      // Retrieve context from memory
      const context = await this.memoryManager.retrieveContext(sessionId);
      
      // Analyze current prompt context
      const promptContext = this.analyzePromptContext(currentPrompt, context);
      
      // Retrieve historical patterns
      const patterns = await this.retrieveHistoricalPatterns(promptContext, context);
      
      // Generate predictions with confidence scores
      const predictions = this.generatePredictions(promptContext, patterns, context);
      
      // Filter and return top 3 predictions >60% confidence
      const filteredPredictions = predictions
        .filter(p => p.confidence > 0.6)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      // Update performance metrics
      this.performanceMetrics.predictionTime = performance.now() - startTime;
      this.performanceMetrics.patternMatchCount = patterns.length;
      
      console.log(`[Level5Predictive] Generated ${filteredPredictions.length} predictions in ${this.performanceMetrics.predictionTime.toFixed(2)}ms`);
      
      return filteredPredictions;
      
    } catch (error) {
      console.error('[Level5Predictive] Failed to predict next intent:', error);
      return [];
    }
  }

  /**
   * Real-time autocomplete based on patterns
   * Must complete within 50ms performance target
   */
  async generateGhostText(partialInput: string, sessionId: string = 'default'): Promise<string> {
    const startTime = performance.now();
    
    if (!this.isInitialized) {
      return '';
    }

    try {
      // Quick return for very short inputs
      if (partialInput.length < 3) {
        return '';
      }

      console.log(`[Level5Predictive] Generating ghost text for: "${partialInput}"`);
      
      // Retrieve context (with caching for performance)
      const context = await this.memoryManager.retrieveContext(sessionId);
      
      // Generate ghost text suggestion
      const suggestion = this.generateGhostTextSuggestion(partialInput, context);
      
      // Update performance metrics
      this.performanceMetrics.ghostTextLatency = performance.now() - startTime;
      
      // Ensure we meet the 50ms performance target
      if (this.performanceMetrics.ghostTextLatency > 50) {
        console.warn(`[Level5Predictive] Ghost text generation exceeded 50ms target: ${this.performanceMetrics.ghostTextLatency.toFixed(2)}ms`);
      }
      
      console.log(`[Level5Predictive] Generated ghost text: "${suggestion}" in ${this.performanceMetrics.ghostTextLatency.toFixed(2)}ms`);
      
      return suggestion;
      
    } catch (error) {
      console.error('[Level5Predictive] Failed to generate ghost text:', error);
      return '';
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(): PredictionPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update prediction accuracy based on user feedback
   */
  async updateAccuracy(predictionId: string, wasAccurate: boolean): Promise<void> {
    // Update accuracy metrics
    // This would be used to improve the prediction algorithms over time
    console.log(`[Level5Predictive] Prediction ${predictionId} accuracy: ${wasAccurate}`);
  }

  // Private helper methods

  private analyzePromptContext(prompt: string, memory: ContextMemory): PredictiveContext {
    return {
      sessionId: memory.working.sessionId,
      currentPrompt: prompt,
      partialInput: prompt,
      cursorPosition: prompt.length,
      recentHistory: memory.episodic.slice(0, 10),
      workflowContext: memory.workflow[0] ? this.mapWorkflowToStage(memory.workflow[0]) : undefined
    };
  }

  private async retrieveHistoricalPatterns(context: PredictiveContext, memory: ContextMemory): Promise<BehavioralPattern[]> {
    // Extract relevant patterns from semantic memory
    const patterns: BehavioralPattern[] = [];
    
    // Add patterns from semantic memory
    memory.semantic.forEach(semantic => {
      if (semantic.confidence > 0.6) {
        patterns.push(semantic.pattern);
      }
    });
    
    // Add sequence patterns from recent interactions
    if (memory.episodic.length > 1) {
      const sequencePatterns = this.patternRecognizer.analyzeSequence(
        memory.episodic.map(e => e.interaction)
      );
      
      sequencePatterns.forEach(seq => {
        patterns.push({
          type: 'sequence',
          description: `Common sequence: ${seq.sequence.join(' → ')}`,
          triggers: seq.sequence.slice(0, -1),
          outcomes: [seq.sequence[seq.sequence.length - 1]],
          successRate: seq.successRate
        });
      });
    }
    
    return patterns;
  }

  private generatePredictions(context: PredictiveContext, patterns: BehavioralPattern[], memory: ContextMemory): PredictedIntent[] {
    const predictions: PredictedIntent[] = [];
    
    // Generate predictions based on patterns
    patterns.forEach((pattern, index) => {
      const confidence = this.calculatePredictionConfidence(pattern, context, memory);
      
      if (confidence > 0.4) { // Only consider reasonable predictions
        predictions.push({
          id: `prediction_${Date.now()}_${index}`,
          type: pattern.type,
          confidence,
          reasoning: this.generateReasoning(pattern, context),
          suggestedPrompt: this.generateSuggestedPrompt(pattern, context),
          relatedPatterns: [pattern.description]
        });
      }
    });
    
    // Add intent-based predictions
    if (memory.working.currentIntent) {
      const intentPrediction = this.generateIntentBasedPrediction(memory.working.currentIntent, context);
      if (intentPrediction) {
        predictions.push(intentPrediction);
      }
    }
    
    return predictions;
  }

  private calculatePredictionConfidence(pattern: BehavioralPattern, context: PredictiveContext, memory: ContextMemory): number {
    let confidence = pattern.successRate * 0.4; // Base confidence from success rate
    
    // Boost confidence for recent patterns
    const recentUsage = memory.episodic.some(e => 
      pattern.triggers.some(trigger => e.interaction.prompt.toLowerCase().includes(trigger.toLowerCase()))
    );
    if (recentUsage) confidence += 0.2;
    
    // Boost confidence for context match
    const contextMatch = pattern.triggers.some(trigger =>
      context.currentPrompt.toLowerCase().includes(trigger.toLowerCase())
    );
    if (contextMatch) confidence += 0.3;
    
    // Boost confidence for workflow stage match
    if (context.workflowContext && pattern.type === 'workflow') {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  private generateReasoning(pattern: BehavioralPattern, context: PredictiveContext): string {
    const reasons = [];
    
    if (pattern.successRate > 0.8) {
      reasons.push(`High success rate (${(pattern.successRate * 100).toFixed(0)}%)`);
    }
    
    if (pattern.triggers.some(trigger => context.currentPrompt.toLowerCase().includes(trigger.toLowerCase()))) {
      reasons.push('Matches current prompt context');
    }
    
    if (context.workflowContext && pattern.type === 'workflow') {
      reasons.push(`Fits current workflow stage: ${context.workflowContext.name}`);
    }
    
    return reasons.join(', ') || 'Based on historical patterns';
  }

  private generateSuggestedPrompt(pattern: BehavioralPattern, context: PredictiveContext): string {
    // Generate a suggested prompt based on the pattern
    if (pattern.outcomes.length > 0) {
      const outcome = pattern.outcomes[0];
      return `Consider: ${outcome}`;
    }
    
    return `Try: ${pattern.description}`;
  }

  private generateIntentBasedPrediction(currentIntent: string, context: PredictiveContext): PredictedIntent | null {
    const intentContinuations: Record<string, string[]> = {
      'create': ['implement', 'design', 'build'],
      'analyze': ['review', 'evaluate', 'compare'],
      'explain': ['clarify', 'elaborate', 'demonstrate'],
      'solve': ['debug', 'fix', 'resolve']
    };
    
    const continuations = intentContinuations[currentIntent.toLowerCase()];
    if (!continuations) return null;
    
    return {
      id: `intent_prediction_${Date.now()}`,
      type: 'intent_continuation',
      confidence: 0.7,
      reasoning: `Common continuation of ${currentIntent} intent`,
      suggestedPrompt: `Next step: ${continuations[0]} the solution`,
      relatedPatterns: [`${currentIntent} workflow`]
    };
  }

  private generateGhostTextSuggestion(partialInput: string, memory: ContextMemory): string {
    // Simple implementation - would be more sophisticated in production
    const commonCompletions: Record<string, string> = {
      'create a': ' function that',
      'write a': ' script to',
      'build a': ' component for',
      'implement': ' the following',
      'design': ' a system that',
      'analyze': ' the performance of',
      'explain': ' how to',
      'debug': ' the issue with'
    };
    
    const lowerInput = partialInput.toLowerCase();
    
    for (const [prefix, completion] of Object.entries(commonCompletions)) {
      if (lowerInput.endsWith(prefix)) {
        return completion;
      }
    }
    
    // Check recent patterns for completions
    for (const episodic of memory.episodic.slice(0, 5)) {
      const prompt = episodic.interaction.prompt.toLowerCase();
      if (prompt.startsWith(lowerInput)) {
        const remaining = prompt.substring(lowerInput.length);
        const nextWord = remaining.split(' ')[0];
        if (nextWord && nextWord.length > 0) {
          return ' ' + nextWord;
        }
      }
    }
    
    return '';
  }

  private mapWorkflowToStage(workflowState: any): WorkflowStage {
    return {
      id: workflowState.id,
      name: workflowState.stage,
      progress: workflowState.progress,
      nextStages: [], // Would be populated based on workflow definition
      estimatedDuration: 0
    };
  }
}

/**
 * Default implementation of BehavioralPatternRecognizer
 */
class DefaultPatternRecognizer implements BehavioralPatternRecognizer {
  analyzeSequence(interactions: any[]): SequencePattern[] {
    const sequences: SequencePattern[] = [];
    
    // Simple sequence analysis - look for common 2-3 step patterns
    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];
      
      if (current && next) {
        const sequenceId = `${current.intent}_${next.intent}`;
        const existing = sequences.find(s => s.id === sequenceId);
        
        if (existing) {
          existing.frequency += 1;
        } else {
          sequences.push({
            id: sequenceId,
            sequence: [current.intent, next.intent],
            frequency: 1,
            confidence: 0.5,
            avgTimeBetween: next.timestamp - current.timestamp,
            successRate: (current.outcome === 'successful' && next.outcome === 'successful') ? 1.0 : 0.5
          });
        }
      }
    }
    
    return sequences.filter(s => s.frequency > 1); // Only return patterns that occurred multiple times
  }

  detectWorkflowStage(context: any): WorkflowStage {
    // Simple workflow stage detection
    return {
      id: 'default_stage',
      name: 'development',
      progress: 0.5,
      nextStages: ['testing', 'deployment'],
      estimatedDuration: 3600000 // 1 hour
    };
  }

  predictNextAction(currentState: any): PredictedIntent[] {
    // Simple next action prediction
    return [];
  }
}
