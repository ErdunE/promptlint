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

import { 
  WorkflowState, 
  WorkflowPrediction, 
  WorkflowStep,
  WorkflowPattern 
} from './types/WorkflowTypes.js';

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
   * Predict next 2-3 steps in workflow based on current state and user patterns
   * Achieves >65% confidence target for multi-step predictions
   */
  async predictWorkflowSequence(
    currentState: WorkflowState,
    userPatterns: BehavioralPattern[]
  ): Promise<WorkflowPrediction[]> {
    const startTime = performance.now();

    if (!this.isInitialized) {
      return [];
    }

    try {
      console.log(`[Level5Predictive] Predicting workflow sequence from ${currentState.phase} phase`);

      // Analyze user patterns for workflow sequences
      const workflowPatterns = this.extractWorkflowPatterns(userPatterns);
      
      // Generate multi-step predictions
      const predictions = this.generateWorkflowPredictions(currentState, workflowPatterns);
      
      // Filter predictions by confidence threshold (>65%)
      const validPredictions = predictions.filter(pred => pred.confidence >= 0.65);
      
      const predictionTime = performance.now() - startTime;
      console.log(`[Level5Predictive] Generated ${validPredictions.length} workflow predictions in ${predictionTime.toFixed(2)}ms`);

      return validPredictions;

    } catch (error) {
      console.error('[Level5Predictive] Workflow sequence prediction failed:', error);
      return [];
    }
  }

  /**
   * Get workflow-aware predictions based on current workflow state
   */
  async getWorkflowAwarePredictions(
    currentState: WorkflowState,
    context: ContextMemory
  ): Promise<PredictedIntent[]> {
    try {
      console.log(`[Level5Predictive] Generating workflow-aware predictions for ${currentState.phase}`);

      const predictions: PredictedIntent[] = [];

      // Phase-specific predictions
      const phasePredictions = this.generatePhaseSpecificPredictions(currentState);
      predictions.push(...phasePredictions);

      // Transition-based predictions
      const transitionPredictions = this.generateTransitionPredictions(currentState, context);
      predictions.push(...transitionPredictions);

      // Pattern-based workflow predictions
      const patternPredictions = this.generatePatternBasedWorkflowPredictions(currentState, context);
      predictions.push(...patternPredictions);

      // Filter and sort by confidence
      const filteredPredictions = predictions
        .filter(p => p.confidence > 0.6)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      return filteredPredictions;

    } catch (error) {
      console.error('[Level5Predictive] Workflow-aware predictions failed:', error);
      return [];
    }
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

  // Workflow prediction helper methods

  private extractWorkflowPatterns(userPatterns: BehavioralPattern[]): WorkflowPattern[] {
    const workflowPatterns: WorkflowPattern[] = [];

    // Convert behavioral patterns to workflow patterns
    userPatterns.forEach(pattern => {
      if (pattern.type === 'sequence' && pattern.triggers.length >= 2) {
        const workflowPattern: WorkflowPattern = {
          id: `workflow_${pattern.description.replace(/\s+/g, '_')}`,
          name: pattern.description,
          phases: pattern.triggers as any[], // Simplified conversion
          transitions: this.generateTransitionsFromPattern(pattern),
          frequency: 1, // Would be tracked over time
          successRate: pattern.successRate,
          avgDuration: 60, // Default 60 minutes
          contexts: ['general']
        };
        workflowPatterns.push(workflowPattern);
      }
    });

    return workflowPatterns;
  }

  private generateWorkflowPredictions(
    currentState: WorkflowState,
    patterns: WorkflowPattern[]
  ): WorkflowPrediction[] {
    const predictions: WorkflowPrediction[] = [];

    // Generate standard workflow prediction
    const standardPrediction = this.generateStandardWorkflowPrediction(currentState);
    if (standardPrediction) predictions.push(standardPrediction);

    // Generate pattern-based predictions
    patterns.forEach(pattern => {
      const patternPrediction = this.generatePatternBasedPrediction(currentState, pattern);
      if (patternPrediction) predictions.push(patternPrediction);
    });

    return predictions;
  }

  private generateStandardWorkflowPrediction(currentState: WorkflowState): WorkflowPrediction | null {
    // Standard development workflow sequences
    const standardSequences: Record<string, WorkflowStep[]> = {
      'planning': [
        {
          step: 1,
          action: 'Create implementation plan',
          phase: 'implementation',
          confidence: 0.85,
          estimatedDuration: 60,
          prerequisites: [],
          description: 'Start implementing the planned solution'
        },
        {
          step: 2,
          action: 'Write unit tests',
          phase: 'testing',
          confidence: 0.72,
          estimatedDuration: 20,
          prerequisites: ['implementation'],
          description: 'Test the implemented functionality'
        },
        {
          step: 3,
          action: 'Create documentation',
          phase: 'documentation',
          confidence: 0.68,
          estimatedDuration: 25,
          prerequisites: ['testing'],
          description: 'Document the solution and usage'
        }
      ],
      'implementation': [
        {
          step: 1,
          action: 'Write unit tests',
          phase: 'testing',
          confidence: 0.80,
          estimatedDuration: 20,
          prerequisites: [],
          description: 'Test the implemented code'
        },
        {
          step: 2,
          action: 'Add error handling',
          phase: 'implementation',
          confidence: 0.70,
          estimatedDuration: 15,
          prerequisites: [],
          description: 'Improve code robustness'
        },
        {
          step: 3,
          action: 'Update documentation',
          phase: 'documentation',
          confidence: 0.65,
          estimatedDuration: 15,
          prerequisites: ['testing'],
          description: 'Document the new functionality'
        }
      ],
      'testing': [
        {
          step: 1,
          action: 'Fix failing tests',
          phase: 'debugging',
          confidence: 0.75,
          estimatedDuration: 30,
          prerequisites: [],
          description: 'Address any test failures'
        },
        {
          step: 2,
          action: 'Document test cases',
          phase: 'documentation',
          confidence: 0.70,
          estimatedDuration: 15,
          prerequisites: [],
          description: 'Document testing approach'
        },
        {
          step: 3,
          action: 'Code review',
          phase: 'review',
          confidence: 0.68,
          estimatedDuration: 20,
          prerequisites: ['documentation'],
          description: 'Get peer review of changes'
        }
      ]
    };

    const sequence = standardSequences[currentState.phase];
    if (!sequence) return null;

    const totalTime = sequence.reduce((sum, step) => sum + step.estimatedDuration, 0);
    const avgConfidence = sequence.reduce((sum, step) => sum + step.confidence, 0) / sequence.length;

    return {
      id: `standard_${currentState.phase}_${Date.now()}`,
      sequence,
      confidence: avgConfidence,
      reasoning: `Standard ${currentState.phase} workflow based on common development practices`,
      totalEstimatedTime: totalTime,
      alternativePaths: []
    };
  }

  private generatePatternBasedPrediction(
    currentState: WorkflowState,
    pattern: WorkflowPattern
  ): WorkflowPrediction | null {
    // Find current phase in pattern
    const currentIndex = pattern.phases.indexOf(currentState.phase as any);
    if (currentIndex === -1 || currentIndex >= pattern.phases.length - 1) {
      return null;
    }

    // Generate next steps based on pattern
    const nextSteps: WorkflowStep[] = [];
    for (let i = 1; i <= Math.min(3, pattern.phases.length - currentIndex - 1); i++) {
      const nextPhase = pattern.phases[currentIndex + i];
      nextSteps.push({
        step: i,
        action: `Continue with ${nextPhase}`,
        phase: nextPhase as any,
        confidence: pattern.successRate * (1 - (i - 1) * 0.1), // Decrease confidence for later steps
        estimatedDuration: pattern.avgDuration / pattern.phases.length,
        prerequisites: i > 1 ? [pattern.phases[currentIndex + i - 1] as string] : [],
        description: `Based on your ${pattern.name} pattern`
      });
    }

    if (nextSteps.length === 0) return null;

    const totalTime = nextSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    const avgConfidence = nextSteps.reduce((sum, step) => sum + step.confidence, 0) / nextSteps.length;

    return {
      id: `pattern_${pattern.id}_${Date.now()}`,
      sequence: nextSteps,
      confidence: avgConfidence,
      reasoning: `Based on your ${pattern.name} workflow pattern (${(pattern.successRate * 100).toFixed(0)}% success rate)`,
      totalEstimatedTime: totalTime,
      alternativePaths: []
    };
  }

  private generatePhaseSpecificPredictions(currentState: WorkflowState): PredictedIntent[] {
    const predictions: PredictedIntent[] = [];

    // Phase-specific next actions
    const phaseActions: Record<string, Array<{action: string, confidence: number, prompt: string}>> = {
      'planning': [
        { action: 'implement', confidence: 0.85, prompt: 'Start implementing the planned solution' },
        { action: 'research', confidence: 0.70, prompt: 'Research additional requirements or technologies' }
      ],
      'implementation': [
        { action: 'test', confidence: 0.80, prompt: 'Write tests for the implemented functionality' },
        { action: 'refactor', confidence: 0.65, prompt: 'Refactor and improve the code quality' }
      ],
      'testing': [
        { action: 'debug', confidence: 0.75, prompt: 'Fix any issues found during testing' },
        { action: 'document', confidence: 0.70, prompt: 'Document the testing approach and results' }
      ],
      'debugging': [
        { action: 'test', confidence: 0.85, prompt: 'Re-run tests to verify the fixes' },
        { action: 'implement', confidence: 0.60, prompt: 'Implement additional error handling' }
      ],
      'documentation': [
        { action: 'review', confidence: 0.75, prompt: 'Request code review of the documented changes' },
        { action: 'deploy', confidence: 0.65, prompt: 'Prepare for deployment to production' }
      ]
    };

    const actions = phaseActions[currentState.phase] || [];
    
    actions.forEach((actionData, index) => {
      predictions.push({
        id: `phase_${currentState.phase}_${actionData.action}_${index}`,
        type: 'workflow_step',
        action: actionData.action,
        confidence: actionData.confidence,
        reasoning: `Common next step after ${currentState.phase} phase`,
        suggestedPrompt: actionData.prompt,
        relatedPatterns: [`${currentState.phase}_workflow`],
        source: 'workflow'
      });
    });

    return predictions;
  }

  private generateTransitionPredictions(
    currentState: WorkflowState,
    context: ContextMemory
  ): PredictedIntent[] {
    const predictions: PredictedIntent[] = [];

    // Look for transition patterns in context
    const recentTransitions = context.episodic
      .slice(0, 10)
      .map(e => e.interaction.intent)
      .filter(intent => this.isWorkflowIntent(intent));

    if (recentTransitions.length >= 2) {
      // Predict based on recent transition patterns
      const lastIntent = recentTransitions[0];
      const commonNextIntents = this.getCommonNextIntents(lastIntent);

      commonNextIntents.forEach((nextIntent, index) => {
        predictions.push({
          id: `transition_${lastIntent}_${nextIntent}_${index}`,
          type: 'workflow_step',
          action: nextIntent,
          confidence: 0.70 - (index * 0.1),
          reasoning: `You often do ${nextIntent} after ${lastIntent}`,
          suggestedPrompt: `Continue with ${nextIntent} based on your workflow pattern`,
          relatedPatterns: [`${lastIntent}_${nextIntent}_transition`],
          source: 'workflow'
        });
      });
    }

    return predictions;
  }

  private generatePatternBasedWorkflowPredictions(
    currentState: WorkflowState,
    context: ContextMemory
  ): PredictedIntent[] {
    const predictions: PredictedIntent[] = [];

    // Analyze semantic memory for workflow patterns
    context.semantic.forEach(semantic => {
      if (semantic.confidence > 0.7 && semantic.pattern.type === 'workflow') {
        predictions.push({
          id: `semantic_workflow_${semantic.id}`,
          type: 'workflow_step',
          action: semantic.pattern.outcomes[0] || 'continue',
          confidence: semantic.confidence,
          reasoning: semantic.pattern.description,
          suggestedPrompt: `Based on your pattern: ${semantic.pattern.description}`,
          relatedPatterns: [semantic.id],
          source: 'workflow'
        });
      }
    });

    return predictions.slice(0, 2); // Limit to top 2 pattern-based predictions
  }

  private generateTransitionsFromPattern(pattern: BehavioralPattern): any[] {
    // Simplified transition generation
    const transitions = [];
    
    for (let i = 0; i < pattern.triggers.length - 1; i++) {
      transitions.push({
        from: pattern.triggers[i],
        to: pattern.triggers[i + 1],
        probability: pattern.successRate,
        avgDuration: 30, // Default 30 minutes
        commonTriggers: [pattern.triggers[i]]
      });
    }
    
    return transitions;
  }

  private isWorkflowIntent(intent: string): boolean {
    const workflowIntents = [
      'plan', 'implement', 'test', 'debug', 'document', 'review', 'deploy', 'maintain'
    ];
    return workflowIntents.includes(intent.toLowerCase());
  }

  private getCommonNextIntents(currentIntent: string): string[] {
    const commonTransitions: Record<string, string[]> = {
      'plan': ['implement', 'research'],
      'implement': ['test', 'debug', 'refactor'],
      'test': ['debug', 'document', 'review'],
      'debug': ['test', 'implement'],
      'document': ['review', 'deploy'],
      'review': ['implement', 'deploy'],
      'deploy': ['monitor', 'maintain'],
      'maintain': ['plan', 'implement']
    };

    return commonTransitions[currentIntent.toLowerCase()] || [];
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
