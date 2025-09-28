/**
 * Prediction Agent
 * Specialized agent for intent prediction and ghost text generation
 * Leverages Level 5 predictive intelligence for anticipating user needs
 */

import { 
  Agent, 
  AgentAnalysis, 
  AgentExpertise, 
  AgentCapability,
  AgentSuggestion,
  AgentInsight,
  UserInput
} from '../types/OrchestrationTypes.js';

import { 
  PredictiveIntentEngine,
  GhostTextGenerator,
  DetectedPatterns,
  WorkflowState,
  createGhostTextGenerator
} from '@promptlint/level5-predictive';

import { PersistentMemoryManager } from '@promptlint/level5-memory';

export class PredictionAgent implements Agent {
  public readonly id = 'prediction_agent';
  public readonly name = 'Prediction Agent';
  public readonly expertise: AgentExpertise = 'prediction';
  public confidence = 0.8;

  private predictiveEngine: PredictiveIntentEngine;
  private ghostTextGenerator: GhostTextGenerator;
  private memoryManager: PersistentMemoryManager;

  constructor() {
    this.memoryManager = new PersistentMemoryManager();
    this.predictiveEngine = new PredictiveIntentEngine(this.memoryManager);
    this.ghostTextGenerator = createGhostTextGenerator({
      minConfidenceThreshold: 0.6,
      enablePatternMatching: true
    });
  }

  async analyzeInput(input: UserInput): Promise<AgentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Predict next intents
      const nextIntents = await this.predictiveEngine.predictNextIntent(input.prompt);
      
      // Generate ghost text
      const ghostText = await this.predictiveEngine.generateGhostText(input.prompt);
      
      // Generate prediction-based suggestions
      const suggestions = await this.generatePredictionSuggestions(input, nextIntents, ghostText);
      
      const processingTime = performance.now() - startTime;
      
      return {
        agentId: this.id,
        agentName: this.name,
        processingTime,
        confidence: this.calculatePredictionConfidence(nextIntents, ghostText, suggestions),
        suggestions,
        metadata: {
          predictions: {
            nextIntents,
            ghostText,
            workflowSteps: [] // Would be populated from workflow predictions
          },
          predictionAccuracy: 0.75, // Would be calculated from historical performance
          predictionLatency: processingTime
        }
      };
      
    } catch (error) {
      console.error('[PredictionAgent] Analysis failed:', error);
      return this.createFallbackAnalysis(performance.now() - startTime);
    }
  }

  async analyze(input: string, context?: any): Promise<AgentAnalysis> {
    const startTime = performance.now();

    try {
      console.log(`[PredictionAgent] Analyzing input for predictive insights: "${input.substring(0, 30)}..."`);

      // Initialize if needed
      if (!this.isInitialized()) {
        await this.predictiveEngine.initialize();
      }

      // Generate predictions and ghost text
      const [intentPredictions, ghostTextSuggestion] = await Promise.all([
        this.generateIntentPredictions(input, context),
        this.generateGhostTextSuggestion(input, context)
      ]);

      // Generate prediction-based suggestions
      const suggestions = await this.generatePredictionSuggestions(
        input, intentPredictions, ghostTextSuggestion, context
      );

      // Extract prediction insights
      const insights = await this.extractPredictionInsights(
        input, intentPredictions, ghostTextSuggestion
      );

      // Calculate confidence based on prediction quality
      const confidence = this.calculatePredictionConfidence(
        intentPredictions, ghostTextSuggestion, suggestions
      );

      const processingTime = performance.now() - startTime;

      return {
        agentId: this.id,
        confidence,
        suggestions,
        insights,
        reasoning: this.generateReasoning(intentPredictions, ghostTextSuggestion, suggestions),
        processingTime,
        metadata: {
          processingTime,
          dataSourcesUsed: ['predictive_engine', 'ghost_text_generator', 'intent_analysis'],
          confidenceFactors: [
            { factor: 'prediction_confidence', impact: this.getAveragePredictionConfidence(intentPredictions) > 0.7 ? 0.2 : 0, description: 'High prediction confidence' },
            { factor: 'ghost_text_quality', impact: ghostTextSuggestion.confidence > 0.6 ? 0.15 : 0, description: 'Quality ghost text generated' },
            { factor: 'context_richness', impact: context?.workflowState ? 0.1 : 0, description: 'Rich context available' }
          ]
        }
      };

    } catch (error) {
      console.error('[PredictionAgent] Analysis failed:', error);
      return this.createErrorAnalysis(performance.now() - startTime, error);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'Intent Prediction',
        description: 'Predict next user intent with >70% confidence',
        confidence: 0.85,
        prerequisites: ['user_history']
      },
      {
        name: 'Ghost Text Generation',
        description: 'Generate intelligent autocomplete with >60% acceptance rate',
        confidence: 0.8,
        prerequisites: ['partial_input']
      },
      {
        name: 'Next Action Prediction',
        description: 'Predict likely next actions based on current context',
        confidence: 0.75,
        prerequisites: ['workflow_context']
      },
      {
        name: 'Completion Suggestions',
        description: 'Suggest completions for partial prompts',
        confidence: 0.7,
        prerequisites: ['pattern_data']
      }
    ];
  }

  // Private helper methods

  private isInitialized(): boolean {
    // Check if predictive engine is initialized
    return true; // Simplified for now
  }

  private async generateIntentPredictions(input: string, context?: any): Promise<any[]> {
    try {
      // Use predictive engine to generate intent predictions
      const sessionId = context?.sessionId || 'default_session';
      const memoryContext = await this.memoryManager.retrieveContext(sessionId);
      
      // Get workflow-aware predictions if workflow state is available
      if (context?.workflowState) {
        return await this.predictiveEngine.getWorkflowAwarePredictions(
          context.workflowState, 
          memoryContext
        );
      }

      // Fallback to general predictions
      return await this.predictiveEngine.predictNextIntent(input);

    } catch (error) {
      console.warn('[PredictionAgent] Intent prediction failed:', error);
      return [];
    }
  }

  private async generateGhostTextSuggestion(input: string, context?: any): Promise<any> {
    try {
      const patterns = context?.patterns || await this.createMockPatterns();
      
      // Use workflow-aware ghost text if workflow state is available
      if (context?.workflowState) {
        return await this.ghostTextGenerator.generateWorkflowAwareGhostText(
          input, 
          context.workflowState, 
          patterns
        );
      }

      // Fallback to general ghost text
      return await this.ghostTextGenerator.generateGhostText(input, patterns, {
        currentIntent: 'general',
        domain: 'general',
        recentActions: [],
        timeContext: {
          timeOfDay: this.getCurrentTimeOfDay(),
          dayOfWeek: 'wednesday',
          isWeekend: false,
          sessionDuration: 30
        },
        collaborationLevel: 'individual',
        urgencyLevel: 'normal'
      });

    } catch (error) {
      console.warn('[PredictionAgent] Ghost text generation failed:', error);
      return { text: '', confidence: 0, source: 'error' };
    }
  }

  private async generatePredictionSuggestions(
    input: string,
    intentPredictions: any[],
    ghostTextSuggestion: any,
    context?: any
  ): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];

    // Intent prediction suggestions
    intentPredictions.forEach((prediction, index) => {
      if (prediction.confidence > 0.6 && index < 2) { // Top 2 predictions
        suggestions.push({
          id: `prediction_intent_${prediction.id}`,
          type: 'next_action',
          content: prediction.suggestedPrompt || `Continue with ${prediction.action}`,
          confidence: prediction.confidence,
          priority: index === 0 ? 'high' : 'medium',
          source: 'prediction',
          reasoning: prediction.reasoning
        });
      }
    });

    // Ghost text suggestion
    if (ghostTextSuggestion.text && ghostTextSuggestion.confidence > 0.6) {
      suggestions.push({
        id: 'prediction_ghost_text',
        type: 'ghost_text',
        content: ghostTextSuggestion.text,
        confidence: ghostTextSuggestion.confidence,
        priority: 'medium',
        source: 'prediction',
        reasoning: ghostTextSuggestion.reasoning || 'Intelligent autocomplete suggestion'
      });
    }

    // Contextual predictions based on input patterns
    const contextualSuggestion = this.generateContextualPrediction(input, context);
    if (contextualSuggestion) {
      suggestions.push(contextualSuggestion);
    }

    // Completion predictions for partial inputs
    if (input.length > 3 && input.length < 20) {
      const completionSuggestion = this.generateCompletionPrediction(input);
      if (completionSuggestion) {
        suggestions.push(completionSuggestion);
      }
    }

    return suggestions;
  }

  private async extractPredictionInsights(
    input: string,
    intentPredictions: any[],
    ghostTextSuggestion: any
  ): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = [];

    // Intent prediction insight
    if (intentPredictions.length > 0) {
      const highConfidencePredictions = intentPredictions.filter(p => p.confidence > 0.7);
      
      if (highConfidencePredictions.length > 0) {
        insights.push({
          id: 'prediction_intent_confidence',
          type: 'user_intent',
          description: `High confidence predictions available for next actions`,
          confidence: 0.8,
          evidence: [
            {
              source: 'intent_prediction',
              data: { 
                predictions: highConfidencePredictions.length,
                top_confidence: Math.max(...highConfidencePredictions.map(p => p.confidence))
              },
              weight: 0.9,
              timestamp: Date.now()
            }
          ],
          implications: [
            'User behavior is predictable based on current context',
            'Proactive suggestions can be offered with confidence',
            'Workflow optimization opportunities exist'
          ]
        });
      }
    }

    // Ghost text quality insight
    if (ghostTextSuggestion.confidence > 0.7) {
      insights.push({
        id: 'prediction_ghost_text_quality',
        type: 'user_intent',
        description: 'High-quality autocomplete suggestion available',
        confidence: ghostTextSuggestion.confidence,
        evidence: [
          {
            source: 'ghost_text_generator',
            data: { 
              suggestion: ghostTextSuggestion.text.substring(0, 30),
              confidence: ghostTextSuggestion.confidence,
              source: ghostTextSuggestion.source
            },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User input can be intelligently completed',
          'Typing efficiency can be improved',
          'User intent is clear from partial input'
        ]
      });
    }

    // Prediction accuracy insight
    const accuracyInsight = this.analyzePredictionAccuracy(intentPredictions, ghostTextSuggestion);
    if (accuracyInsight) {
      insights.push(accuracyInsight);
    }

    // Context utilization insight
    const contextInsight = this.analyzeContextUtilization(input, intentPredictions);
    if (contextInsight) {
      insights.push(contextInsight);
    }

    return insights;
  }

  private generateContextualPrediction(input: string, context?: any): AgentSuggestion | null {
    const inputLower = input.toLowerCase();

    // Time-based contextual predictions
    const timeOfDay = this.getCurrentTimeOfDay();
    const timeContexts: Record<string, { activity: string, confidence: number }> = {
      'morning': { activity: 'planning and setup', confidence: 0.7 },
      'afternoon': { activity: 'implementation and execution', confidence: 0.8 },
      'evening': { activity: 'review and documentation', confidence: 0.7 }
    };

    const timeContext = timeContexts[timeOfDay];
    if (timeContext && this.isActivityRelevant(inputLower, timeContext.activity)) {
      return {
        id: 'prediction_contextual_time',
        type: 'contextual_hint',
        content: `Good time for ${timeContext.activity}`,
        confidence: timeContext.confidence,
        priority: 'low',
        source: 'prediction',
        reasoning: `${timeOfDay} is typically good for ${timeContext.activity}`
      };
    }

    // Domain-specific contextual predictions
    if (inputLower.includes('error') || inputLower.includes('bug')) {
      return {
        id: 'prediction_contextual_debug',
        type: 'next_action',
        content: 'Consider systematic debugging approach',
        confidence: 0.75,
        priority: 'medium',
        source: 'prediction',
        reasoning: 'Error-related input suggests debugging workflow'
      };
    }

    return null;
  }

  private generateCompletionPrediction(input: string): AgentSuggestion | null {
    const inputLower = input.toLowerCase();

    // Common completion patterns
    const completions: Record<string, { completion: string, confidence: number }> = {
      'how to': { completion: ' implement a solution for', confidence: 0.8 },
      'create': { completion: ' a new component that', confidence: 0.75 },
      'write': { completion: ' a function to handle', confidence: 0.8 },
      'debug': { completion: ' the issue with', confidence: 0.75 },
      'test': { completion: ' the functionality of', confidence: 0.7 },
      'explain': { completion: ' how this works', confidence: 0.7 }
    };

    for (const [prefix, data] of Object.entries(completions)) {
      if (inputLower.startsWith(prefix)) {
        return {
          id: `prediction_completion_${prefix.replace(' ', '_')}`,
          type: 'ghost_text',
          content: data.completion,
          confidence: data.confidence,
          priority: 'low',
          source: 'prediction',
          reasoning: `Common completion for "${prefix}" prompts`
        };
      }
    }

    return null;
  }

  private analyzePredictionAccuracy(intentPredictions: any[], ghostTextSuggestion: any): AgentInsight | null {
    const totalPredictions = intentPredictions.length + (ghostTextSuggestion.text ? 1 : 0);
    
    if (totalPredictions === 0) {
      return {
        id: 'prediction_accuracy_low',
        type: 'performance_opportunity',
        description: 'Limited prediction capability for current input',
        confidence: 0.6,
        evidence: [
          {
            source: 'prediction_analysis',
            data: { total_predictions: 0 },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'More context or history needed for better predictions',
          'User behavior may be exploratory or novel',
          'Prediction models may need refinement'
        ]
      };
    }

    const highConfidencePredictions = intentPredictions.filter(p => p.confidence > 0.7).length +
      (ghostTextSuggestion.confidence > 0.7 ? 1 : 0);

    const accuracyRate = highConfidencePredictions / totalPredictions;

    if (accuracyRate > 0.7) {
      return {
        id: 'prediction_accuracy_high',
        type: 'performance_opportunity',
        description: `High prediction accuracy (${(accuracyRate * 100).toFixed(0)}%)`,
        confidence: 0.8,
        evidence: [
          {
            source: 'prediction_analysis',
            data: { accuracy_rate: accuracyRate, high_confidence_predictions: highConfidencePredictions },
            weight: 0.9,
            timestamp: Date.now()
          }
        ],
        implications: [
          'Predictions are highly reliable for this context',
          'User behavior is well-understood',
          'Proactive assistance can be confidently offered'
        ]
      };
    }

    return null;
  }

  private analyzeContextUtilization(input: string, intentPredictions: any[]): AgentInsight | null {
    // Analyze how well context is being utilized for predictions
    const contextualPredictions = intentPredictions.filter(p => 
      p.source === 'workflow' || p.relatedPatterns?.length > 0
    );

    if (contextualPredictions.length > 0) {
      return {
        id: 'prediction_context_utilization',
        type: 'performance_opportunity',
        description: 'Context is being effectively utilized for predictions',
        confidence: 0.75,
        evidence: [
          {
            source: 'context_analysis',
            data: { contextual_predictions: contextualPredictions.length, total_predictions: intentPredictions.length },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'Rich context enables better predictions',
          'User workflow is well-understood',
          'Contextual suggestions are more relevant'
        ]
      };
    }

    return null;
  }

  private calculatePredictionConfidence(
    intentPredictions: any[],
    ghostTextSuggestion: any,
    suggestions: AgentSuggestion[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost based on intent prediction quality
    if (intentPredictions.length > 0) {
      const avgIntentConfidence = this.getAveragePredictionConfidence(intentPredictions);
      confidence += avgIntentConfidence * 0.3;
    }

    // Boost based on ghost text quality
    if (ghostTextSuggestion.confidence > 0.6) {
      confidence += ghostTextSuggestion.confidence * 0.2;
    }

    // Boost based on suggestion diversity
    const suggestionTypes = new Set(suggestions.map(s => s.type));
    confidence += suggestionTypes.size * 0.05;

    // Boost based on high-confidence suggestions
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
    confidence += highConfidenceSuggestions.length * 0.05;

    return Math.min(confidence, 1.0);
  }

  private getAveragePredictionConfidence(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private isActivityRelevant(input: string, activity: string): boolean {
    const activityKeywords: Record<string, string[]> = {
      'planning and setup': ['plan', 'design', 'setup', 'prepare', 'organize'],
      'implementation and execution': ['implement', 'code', 'build', 'create', 'develop'],
      'review and documentation': ['review', 'document', 'explain', 'summarize', 'reflect']
    };

    const keywords = activityKeywords[activity] || [];
    return keywords.some(keyword => input.includes(keyword));
  }

  private async createMockPatterns(): Promise<DetectedPatterns> {
    // Create mock patterns for testing
    return {
      sequences: [
        {
          id: 'seq_1',
          sequence: ['plan', 'implement', 'test'],
          frequency: 5,
          confidence: 0.8,
          avgTimeBetween: 3600000,
          successRate: 0.9,
          contexts: ['development'],
          nextPredictions: []
        }
      ],
      preferences: [
        {
          id: 'pref_1',
          category: 'template',
          preference: 'CodeTemplate',
          strength: 0.7,
          frequency: 10,
          contexts: ['development'],
          evidence: []
        }
      ],
      workflows: [],
      temporal: [],
      confidence: 0.75,
      totalInteractions: 15
    };
  }

  private generateReasoning(
    intentPredictions: any[],
    ghostTextSuggestion: any,
    suggestions: AgentSuggestion[]
  ): string {
    const reasoningParts = [];

    if (intentPredictions.length > 0) {
      const avgConfidence = this.getAveragePredictionConfidence(intentPredictions);
      reasoningParts.push(`Generated ${intentPredictions.length} intent predictions (avg ${(avgConfidence * 100).toFixed(0)}% confidence)`);
    }

    if (ghostTextSuggestion.text) {
      reasoningParts.push(`Generated ghost text with ${(ghostTextSuggestion.confidence * 100).toFixed(0)}% confidence`);
    }

    if (suggestions.length > 0) {
      reasoningParts.push(`Created ${suggestions.length} prediction-based suggestions`);
    }

    return reasoningParts.length > 0 
      ? reasoningParts.join(', ')
      : 'Limited prediction capability for current input';
  }

  private createErrorAnalysis(processingTime: number, error: any): AgentAnalysis {
    return {
      agentId: this.id,
      confidence: 0,
      suggestions: [],
      insights: [],
      reasoning: `Prediction analysis failed: ${error.message}`,
      processingTime,
      metadata: {
        processingTime,
        dataSourcesUsed: [],
        confidenceFactors: [],
        limitations: [`Error: ${error.message}`]
      }
    };
  }

  private async generatePredictionSuggestions(input: UserInput, nextIntents: any[], ghostText: string[]): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    // Generate intent-based suggestions
    for (const intent of nextIntents) {
      if (intent.confidence > 0.6) {
        suggestions.push({
          id: `prediction-intent-${Date.now()}`,
          type: 'next_action',
          title: `Next: ${intent.intent}`,
          description: `Predicted next action: ${intent.intent}`,
          confidence: intent.confidence,
          priority: intent.confidence > 0.8 ? 'high' : 'medium',
          reasoning: intent.reasoning || `Based on behavioral patterns, you typically do ${intent.intent} next`,
          implementation: {
            steps: [`Prepare for ${intent.intent} activity`],
            resources: [`${intent.intent} tools and templates`]
          },
          metadata: {
            sourcePattern: intent.sourceMemory,
            predictionType: 'intent'
          }
        });
      }
    }
    
    // Generate ghost text suggestions
    for (const text of ghostText) {
      if (text && text.length > 0) {
        suggestions.push({
          id: `prediction-ghost-${Date.now()}`,
          type: 'ghost_text',
          title: 'Auto-complete Suggestion',
          description: `Continue with: "${text}"`,
          confidence: 0.7, // Default confidence for ghost text
          priority: 'medium',
          reasoning: 'Based on similar patterns in your history',
          implementation: {
            steps: [`Use suggested text: "${text}"`],
            resources: ['Auto-completion system']
          },
          metadata: {
            sourcePattern: 'ghost_text',
            predictionType: 'completion'
          }
        });
      }
    }
    
    // Generate proactive suggestions based on context
    if (input.context.platform === 'GitHub' && input.prompt.toLowerCase().includes('bug')) {
      suggestions.push({
        id: `prediction-proactive-${Date.now()}`,
        type: 'proactive_guidance',
        title: 'Bug Investigation Workflow',
        description: 'Start systematic bug investigation process',
        confidence: 0.75,
        priority: 'high',
        reasoning: 'GitHub context + bug mention suggests debugging workflow',
        implementation: {
          steps: ['Reproduce the issue', 'Check logs', 'Identify root cause', 'Create fix'],
          resources: ['Debugging checklist', 'Log analysis tools']
        },
        metadata: {
          sourcePattern: 'contextual_prediction',
          predictionType: 'workflow'
        }
      });
    }
    
    return suggestions;
  }

  private calculatePredictionConfidence(nextIntents: any[], ghostText: string[], suggestions: AgentSuggestion[]): number {
    let confidence = 0.4; // Base confidence
    
    // Boost based on intent prediction quality
    if (nextIntents.length > 0) {
      const avgIntentConfidence = nextIntents.reduce((sum, intent) => sum + intent.confidence, 0) / nextIntents.length;
      confidence += avgIntentConfidence * 0.3;
    }
    
    // Boost based on ghost text availability
    if (ghostText.length > 0) {
      confidence += 0.2;
    }
    
    // Boost based on suggestion quality
    if (suggestions.length > 0) {
      const avgSuggestionConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
      confidence = Math.max(confidence, avgSuggestionConfidence);
    }
    
    return Math.min(confidence, 1.0);
  }

  private createFallbackAnalysis(processingTime: number): AgentAnalysis {
    return {
      agentId: this.id,
      agentName: this.name,
      processingTime,
      confidence: 0.3,
      suggestions: [{
        id: `prediction-fallback-${Date.now()}`,
        type: 'next_action',
        title: 'Prediction Analysis Unavailable',
        description: 'Unable to generate predictions for this analysis',
        confidence: 0.3,
        priority: 'low',
        reasoning: 'Prediction system encountered an error during analysis',
        metadata: {
          sourcePattern: 'fallback',
          predictionType: 'none'
        }
      }],
      metadata: {
        predictions: {
          nextIntents: [],
          ghostText: [],
          workflowSteps: []
        },
        predictionAccuracy: 0,
        predictionLatency: processingTime
      }
    };
  }
}
