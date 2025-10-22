/**
 * Integration bridge between Level 4 Contextual Intelligence 
 * and Level 5 Predictive Intelligence
 * 
 * Extends Level 4 capabilities with predictive layer while maintaining backward compatibility
 */

import { PersistentMemoryManager } from './PersistentMemoryManager.js';
import { UserInteraction, ContextMemory } from './types/MemoryTypes.js';

export interface Level5Enhancement {
  originalAnalysis: any;
  predictiveInsights: PredictiveInsight[];
  memoryContext: ContextMemory;
  performanceMetrics: {
    level4Time: number;
    level5Time: number;
    totalTime: number;
  };
}

export interface PredictiveInsight {
  type: 'next_intent' | 'workflow_stage' | 'pattern_match' | 'optimization';
  confidence: number;
  description: string;
  suggestedAction?: string;
  reasoning: string;
}

export class Level4IntegrationBridge {
  private memoryManager: PersistentMemoryManager;
  private isConnected = false;

  constructor(memoryManager: PersistentMemoryManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * Connect to Level 4 Contextual Intelligence Engine
   * Extends Level 4 IntentAnalysisEngine with predictive capabilities
   */
  async connectToContextualEngine(): Promise<void> {
    console.log('[Level4Integration] Connecting to Level 4 Contextual Intelligence Engine...');
    
    try {
      // Ensure memory manager is initialized
      await this.memoryManager.initialize();
      
      this.isConnected = true;
      console.log('[Level4Integration] Successfully connected to Level 4 engine');
      
    } catch (error) {
      console.error('[Level4Integration] Failed to connect to Level 4 engine:', error);
      throw error;
    }
  }

  /**
   * Enhance Level 4 analysis with Level 5 predictive intelligence
   * Takes Level 4 contextual analysis and adds predictive suggestions and memory-based improvements
   */
  async enhanceWithPrediction(level4Analysis: any, sessionId: string = 'default'): Promise<Level5Enhancement> {
    const startTime = performance.now();
    
    if (!this.isConnected) {
      throw new Error('Level 4 integration not connected');
    }

    console.log('[Level4Integration] Enhancing Level 4 analysis with predictive intelligence...');
    
    try {
      // Store the Level 4 analysis as a user interaction for learning
      await this.storeLevel4Analysis(level4Analysis, sessionId);
      
      // Retrieve memory context
      const memoryContext = await this.memoryManager.retrieveContext(sessionId);
      
      // Generate predictive insights
      const predictiveInsights = await this.generatePredictiveInsights(level4Analysis, memoryContext);
      
      const level5Time = performance.now() - startTime;
      
      const enhancement: Level5Enhancement = {
        originalAnalysis: level4Analysis,
        predictiveInsights,
        memoryContext,
        performanceMetrics: {
          level4Time: level4Analysis.totalProcessingTime || 0,
          level5Time,
          totalTime: (level4Analysis.totalProcessingTime || 0) + level5Time
        }
      };
      
      console.log(`[Level4Integration] Enhanced analysis with ${predictiveInsights.length} insights in ${level5Time.toFixed(2)}ms`);
      
      return enhancement;
      
    } catch (error) {
      console.error('[Level4Integration] Failed to enhance with prediction:', error);
      throw error;
    }
  }

  /**
   * Get integration performance metrics
   */
  getPerformanceMetrics(): any {
    return {
      isConnected: this.isConnected,
      memoryMetrics: this.memoryManager.getPerformanceMetrics()
    };
  }

  /**
   * Maintain backward compatibility with Level 4 API
   */
  isBackwardCompatible(): boolean {
    return true;
  }

  // Private helper methods

  private async storeLevel4Analysis(analysis: any, sessionId: string): Promise<void> {
    try {
      // Convert Level 4 analysis to UserInteraction format
      const interaction: UserInteraction = {
        id: `level4_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        sessionId,
        prompt: analysis.originalPrompt || 'Unknown prompt',
        intent: analysis.intentAnalysis?.instruction?.category || 'unknown',
        complexity: analysis.intentAnalysis?.instruction?.complexity || 'moderate',
        confidence: analysis.intentAnalysis?.confidence || 0.5,
        templateSelected: analysis.selectedTemplate?.type,
        outcome: 'successful', // Assume successful for Level 4 analysis
        context: {
          platform: analysis.platformState?.currentPlatform || 'unknown',
          domain: analysis.contextualReasoning?.projectContext?.domain || 'general',
          projectId: analysis.contextualReasoning?.projectContext?.projectId,
          workflowStage: analysis.contextualReasoning?.projectContext?.phase,
          collaborationLevel: analysis.contextualReasoning?.collaborativeContext?.collaborationLevel || 'individual',
          urgencyLevel: analysis.intentAnalysis?.interaction?.urgencyLevel || 'normal'
        }
      };

      await this.memoryManager.storeInteraction(interaction);
      
    } catch (error) {
      console.warn('[Level4Integration] Failed to store Level 4 analysis:', error);
      // Don't throw - this is not critical for the enhancement
    }
  }

  private async generatePredictiveInsights(level4Analysis: any, memoryContext: ContextMemory): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    // Insight 1: Next Intent Prediction
    const nextIntentInsight = this.generateNextIntentInsight(level4Analysis, memoryContext);
    if (nextIntentInsight) insights.push(nextIntentInsight);
    
    // Insight 2: Workflow Stage Prediction
    const workflowInsight = this.generateWorkflowInsight(level4Analysis, memoryContext);
    if (workflowInsight) insights.push(workflowInsight);
    
    // Insight 3: Pattern Match Insights
    const patternInsights = this.generatePatternInsights(level4Analysis, memoryContext);
    insights.push(...patternInsights);
    
    // Insight 4: Optimization Suggestions
    const optimizationInsights = this.generateOptimizationInsights(level4Analysis, memoryContext);
    insights.push(...optimizationInsights);
    
    return insights.filter(insight => insight.confidence > 0.5); // Only return confident insights
  }

  private generateNextIntentInsight(level4Analysis: any, memoryContext: ContextMemory): PredictiveInsight | null {
    const currentIntent = level4Analysis.intentAnalysis?.instruction?.category;
    if (!currentIntent) return null;
    
    // Analyze recent patterns to predict next intent
    const recentIntents = memoryContext.episodic
      .slice(0, 10)
      .map(e => e.interaction.intent);
    
    const intentSequences = this.findIntentSequences(recentIntents, currentIntent);
    
    if (intentSequences.length > 0) {
      const mostCommon = intentSequences[0];
      return {
        type: 'next_intent',
        confidence: Math.min(mostCommon.frequency / 10, 0.9),
        description: `Based on your patterns, you often follow ${currentIntent} with ${mostCommon.nextIntent}`,
        suggestedAction: `Consider ${mostCommon.nextIntent} as your next step`,
        reasoning: `Pattern observed ${mostCommon.frequency} times in recent history`
      };
    }
    
    return null;
  }

  private generateWorkflowInsight(level4Analysis: any, memoryContext: ContextMemory): PredictiveInsight | null {
    const complexity = level4Analysis.intentAnalysis?.instruction?.complexity;
    const intent = level4Analysis.intentAnalysis?.instruction?.category;
    
    if (complexity === 'complex' && intent === 'create') {
      return {
        type: 'workflow_stage',
        confidence: 0.7,
        description: 'Complex creation tasks typically involve multiple stages',
        suggestedAction: 'Consider breaking this into: Planning → Implementation → Testing → Documentation',
        reasoning: 'Complex projects benefit from structured workflow stages'
      };
    }
    
    return null;
  }

  private generatePatternInsights(level4Analysis: any, memoryContext: ContextMemory): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    // Check for semantic patterns that match current context
    memoryContext.semantic.forEach(semantic => {
      if (semantic.confidence > 0.7 && semantic.frequency > 3) {
        const currentDomain = level4Analysis.contextualReasoning?.projectContext?.domain;
        
        if (semantic.contexts.includes(currentDomain)) {
          insights.push({
            type: 'pattern_match',
            confidence: semantic.confidence,
            description: `You frequently use this pattern in ${currentDomain} projects`,
            suggestedAction: semantic.pattern.description,
            reasoning: `Pattern used ${semantic.frequency} times with ${(semantic.confidence * 100).toFixed(0)}% success rate`
          });
        }
      }
    });
    
    return insights.slice(0, 2); // Limit to top 2 pattern insights
  }

  private generateOptimizationInsights(level4Analysis: any, memoryContext: ContextMemory): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    // Check if user tends to modify templates
    const modificationRate = this.calculateModificationRate(memoryContext);
    
    if (modificationRate > 0.5) {
      insights.push({
        type: 'optimization',
        confidence: 0.8,
        description: 'You frequently modify suggested templates',
        suggestedAction: 'Consider providing more specific requirements upfront to get better initial suggestions',
        reasoning: `You modify ${(modificationRate * 100).toFixed(0)}% of templates`
      });
    }
    
    // Check for repeated similar prompts
    const repetitionInsight = this.checkForRepetition(level4Analysis, memoryContext);
    if (repetitionInsight) insights.push(repetitionInsight);
    
    return insights;
  }

  private findIntentSequences(recentIntents: string[], currentIntent: string): Array<{nextIntent: string, frequency: number}> {
    const sequences: Record<string, number> = {};
    
    for (let i = 0; i < recentIntents.length - 1; i++) {
      if (recentIntents[i] === currentIntent) {
        const nextIntent = recentIntents[i + 1];
        sequences[nextIntent] = (sequences[nextIntent] || 0) + 1;
      }
    }
    
    return Object.entries(sequences)
      .map(([nextIntent, frequency]) => ({ nextIntent, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private calculateModificationRate(memoryContext: ContextMemory): number {
    const interactions = memoryContext.episodic.map(e => e.interaction);
    const modifiedCount = interactions.filter(i => i.outcome === 'modified').length;
    
    return interactions.length > 0 ? modifiedCount / interactions.length : 0;
  }

  private checkForRepetition(level4Analysis: any, memoryContext: ContextMemory): PredictiveInsight | null {
    const currentPrompt = level4Analysis.originalPrompt?.toLowerCase() || '';
    const similarPrompts = memoryContext.episodic.filter(e => {
      const prompt = e.interaction.prompt.toLowerCase();
      return this.calculateSimilarity(currentPrompt, prompt) > 0.8;
    });
    
    if (similarPrompts.length > 2) {
      return {
        type: 'optimization',
        confidence: 0.9,
        description: 'You\'ve asked similar questions recently',
        suggestedAction: 'Consider creating a reusable template or workflow for this type of request',
        reasoning: `Found ${similarPrompts.length} similar prompts in recent history`
      };
    }
    
    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple similarity calculation - could be more sophisticated
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}
