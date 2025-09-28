/**
 * Memory Agent
 * Specialized agent for memory-based insights and historical context retrieval
 * Leverages Level 5 persistent memory for contextual understanding
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
  PersistentMemoryManager, 
  ContextMemory 
} from '@promptlint/level5-memory';

export class MemoryAgent implements Agent {
  public readonly id = 'memory_agent';
  public readonly name = 'Memory Agent';
  public readonly expertise: AgentExpertise = 'memory';
  public confidence = 0.85;

  private memoryManager: PersistentMemoryManager;

  constructor() {
    this.memoryManager = new PersistentMemoryManager();
  }

  async analyzeInput(input: UserInput): Promise<AgentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Retrieve relevant memory context
      const memoryContext = await this.memoryManager.retrieveContext(input.context.sessionId);
      
      // Generate memory-based suggestions
      const suggestions = await this.generateMemoryBasedSuggestions(input, memoryContext);
      
      const processingTime = performance.now() - startTime;
      
      return {
        agentId: this.id,
        agentName: this.name,
        processingTime,
        confidence: this.calculateMemoryConfidence(memoryContext, suggestions),
        suggestions,
        metadata: {
          memoryContext: {
            episodicMemories: memoryContext.episodic.length,
            semanticPatterns: memoryContext.semantic.length,
            workingMemoryEntries: memoryContext.working ? 1 : 0,
            relevantInteractions: memoryContext.episodic.slice(0, 5) // Most recent 5
          },
          retrievalTime: processingTime,
          memoryRelevance: this.calculateMemoryRelevance(input.prompt, memoryContext)
        }
      };
      
    } catch (error) {
      console.error('[MemoryAgent] Analysis failed:', error);
      return this.createFallbackAnalysis(performance.now() - startTime);
    }
  }

  async analyze(input: string, context?: any): Promise<AgentAnalysis> {
    const startTime = performance.now();

    try {
      console.log(`[MemoryAgent] Analyzing input for memory-based insights: "${input.substring(0, 30)}..."`);

      // Initialize memory manager if needed
      if (!this.isInitialized()) {
        await this.memoryManager.initialize();
      }

      // Retrieve relevant context from memory
      const sessionId = context?.sessionId || 'default_session';
      const memoryContext = await this.memoryManager.retrieveContext(sessionId);

      // Generate memory-based suggestions
      const suggestions = await this.generateMemoryBasedSuggestions(input, memoryContext);

      // Extract insights from memory patterns
      const insights = await this.extractMemoryInsights(input, memoryContext);

      // Calculate confidence based on memory quality
      const confidence = this.calculateMemoryConfidence(memoryContext, suggestions);

      const processingTime = performance.now() - startTime;

      return {
        agentId: this.id,
        confidence,
        suggestions,
        insights,
        reasoning: this.generateReasoning(memoryContext, suggestions, insights),
        processingTime,
        metadata: {
          processingTime,
          dataSourcesUsed: ['episodic_memory', 'semantic_memory', 'working_memory'],
          confidenceFactors: [
            { factor: 'memory_depth', impact: memoryContext.episodic.length > 10 ? 0.2 : 0, description: 'Rich interaction history' },
            { factor: 'pattern_strength', impact: memoryContext.semantic.length > 5 ? 0.15 : 0, description: 'Strong behavioral patterns' },
            { factor: 'recency', impact: this.hasRecentMemories(memoryContext) ? 0.1 : -0.1, description: 'Recent relevant memories' }
          ]
        }
      };

    } catch (error) {
      console.error('[MemoryAgent] Analysis failed:', error);
      return this.createErrorAnalysis(performance.now() - startTime, error);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'Historical Context Retrieval',
        description: 'Retrieve relevant past interactions and patterns',
        confidence: 0.9,
        prerequisites: ['initialized_memory']
      },
      {
        name: 'Pattern Recognition',
        description: 'Identify behavioral patterns from memory',
        confidence: 0.85,
        prerequisites: ['sufficient_history']
      },
      {
        name: 'Context Continuity',
        description: 'Maintain context across sessions',
        confidence: 0.8,
        prerequisites: ['persistent_storage']
      },
      {
        name: 'Learning from History',
        description: 'Suggest actions based on past success',
        confidence: 0.75,
        prerequisites: ['outcome_tracking']
      }
    ];
  }

  // Private helper methods

  private isInitialized(): boolean {
    // Check if memory manager is initialized
    return true; // Simplified for now
  }

  private async generateMemoryBasedSuggestions(
    input: string, 
    memoryContext: ContextMemory
  ): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];

    // Analyze episodic memory for similar past interactions
    const similarInteractions = this.findSimilarInteractions(input, memoryContext.episodic);
    
    if (similarInteractions.length > 0) {
      const mostSimilar = similarInteractions[0];
      suggestions.push({
        id: `memory_similar_${mostSimilar.interaction.id}`,
        type: 'contextual_hint',
        content: `Based on similar past interaction: "${mostSimilar.interaction.response}"`,
        confidence: 0.8,
        priority: 'high',
        source: 'memory',
        reasoning: `Found similar interaction from ${new Date(mostSimilar.timestamp).toLocaleDateString()}`
      });
    }

    // Analyze semantic memory for patterns
    const relevantPatterns = memoryContext.semantic.filter(semantic => 
      semantic.confidence > 0.7 && this.isPatternRelevant(semantic.pattern, input)
    );

    relevantPatterns.forEach((semantic, index) => {
      if (index < 2) { // Limit to top 2 patterns
        suggestions.push({
          id: `memory_pattern_${semantic.id}`,
          type: 'pattern_completion',
          content: `Pattern suggests: ${semantic.pattern.outcomes[0] || 'continue with established workflow'}`,
          confidence: semantic.confidence,
          priority: 'medium',
          source: 'memory',
          reasoning: semantic.pattern.description
        });
      }
    });

    // Working memory suggestions
    if (memoryContext.working) {
      suggestions.push({
        id: 'memory_working_context',
        type: 'contextual_hint',
        content: 'Continue from where you left off in this session',
        confidence: 0.7,
        priority: 'medium',
        source: 'memory',
        reasoning: 'Active working memory context available'
      });
    }

    return suggestions;
  }

  private async extractMemoryInsights(
    input: string, 
    memoryContext: ContextMemory
  ): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = [];

    // User behavior insights
    if (memoryContext.episodic.length > 5) {
      const recentIntents = memoryContext.episodic
        .slice(0, 5)
        .map(e => e.interaction.intent);
      
      const intentFrequency = this.calculateIntentFrequency(recentIntents);
      const dominantIntent = Object.entries(intentFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (dominantIntent && dominantIntent[1] > 2) {
        insights.push({
          id: 'memory_behavior_pattern',
          type: 'behavioral_pattern',
          description: `User frequently uses "${dominantIntent[0]}" intent recently`,
          confidence: 0.8,
          evidence: [
            {
              source: 'episodic_memory',
              data: { intent: dominantIntent[0], frequency: dominantIntent[1] },
              weight: 1.0,
              timestamp: Date.now()
            }
          ],
          implications: [
            'User may be in a focused workflow phase',
            'Suggestions should align with this intent pattern'
          ]
        });
      }
    }

    // Context shift detection
    if (this.detectContextShift(input, memoryContext)) {
      insights.push({
        id: 'memory_context_shift',
        type: 'context_shift',
        description: 'Detected shift in user context or workflow',
        confidence: 0.75,
        evidence: [
          {
            source: 'context_analysis',
            data: { shift_detected: true },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User may be starting a new task or workflow',
          'Previous context may be less relevant'
        ]
      });
    }

    // Performance opportunity insights
    const performanceOpportunity = this.identifyPerformanceOpportunity(memoryContext);
    if (performanceOpportunity) {
      insights.push(performanceOpportunity);
    }

    return insights;
  }

  private findSimilarInteractions(input: string, episodicMemory: any[]): any[] {
    const inputLower = input.toLowerCase();
    const inputWords = inputLower.split(/\s+/).filter(word => word.length > 2);

    return episodicMemory
      .map(episodic => {
        const promptLower = episodic.interaction.prompt.toLowerCase();
        const promptWords = promptLower.split(/\s+/).filter(word => word.length > 2);
        
        // Calculate similarity score
        const commonWords = inputWords.filter(word => promptWords.includes(word));
        const similarity = commonWords.length / Math.max(inputWords.length, promptWords.length);
        
        return { ...episodic, similarity };
      })
      .filter(episodic => episodic.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  private isPatternRelevant(pattern: any, input: string): boolean {
    const inputLower = input.toLowerCase();
    
    // Check if pattern triggers match input
    return pattern.triggers.some((trigger: string) => 
      inputLower.includes(trigger.toLowerCase())
    );
  }

  private calculateMemoryConfidence(
    memoryContext: ContextMemory, 
    suggestions: AgentSuggestion[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost based on memory depth
    if (memoryContext.episodic.length > 10) confidence += 0.2;
    else if (memoryContext.episodic.length > 5) confidence += 0.1;

    // Boost based on semantic patterns
    if (memoryContext.semantic.length > 5) confidence += 0.15;
    else if (memoryContext.semantic.length > 2) confidence += 0.1;

    // Boost based on suggestion quality
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
    confidence += highConfidenceSuggestions.length * 0.05;

    // Boost based on recency
    if (this.hasRecentMemories(memoryContext)) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private hasRecentMemories(memoryContext: ContextMemory): boolean {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return memoryContext.episodic.some(e => e.timestamp > oneHourAgo);
  }

  private calculateIntentFrequency(intents: string[]): Record<string, number> {
    return intents.reduce((freq, intent) => {
      freq[intent] = (freq[intent] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
  }

  private detectContextShift(input: string, memoryContext: ContextMemory): boolean {
    if (memoryContext.episodic.length === 0) return false;

    const recentIntent = memoryContext.episodic[0].interaction.intent;
    const currentIntent = this.inferIntentFromInput(input);

    // Simple context shift detection
    const intentShiftIndicators = ['now', 'switch', 'change', 'different', 'new'];
    const hasShiftIndicator = intentShiftIndicators.some(indicator => 
      input.toLowerCase().includes(indicator)
    );

    return hasShiftIndicator || (currentIntent !== recentIntent);
  }

  private inferIntentFromInput(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('create') || inputLower.includes('build')) return 'create';
    if (inputLower.includes('test') || inputLower.includes('verify')) return 'test';
    if (inputLower.includes('debug') || inputLower.includes('fix')) return 'debug';
    if (inputLower.includes('document') || inputLower.includes('explain')) return 'document';
    if (inputLower.includes('implement') || inputLower.includes('code')) return 'implement';
    
    return 'general';
  }

  private identifyPerformanceOpportunity(memoryContext: ContextMemory): AgentInsight | null {
    // Look for patterns that suggest performance improvements
    const recentInteractions = memoryContext.episodic.slice(0, 10);
    const repeatedPrompts = this.findRepeatedPrompts(recentInteractions);

    if (repeatedPrompts.length > 0) {
      return {
        id: 'memory_performance_opportunity',
        type: 'performance_opportunity',
        description: 'Detected repeated similar prompts - consider creating a template',
        confidence: 0.7,
        evidence: [
          {
            source: 'pattern_analysis',
            data: { repeated_prompts: repeatedPrompts },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User could benefit from prompt templates',
          'Workflow optimization opportunity identified'
        ]
      };
    }

    return null;
  }

  private findRepeatedPrompts(interactions: any[]): string[] {
    const promptCounts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const prompt = interaction.interaction.prompt.toLowerCase();
      const words = prompt.split(/\s+/).slice(0, 5).join(' '); // First 5 words
      promptCounts.set(words, (promptCounts.get(words) || 0) + 1);
    });

    return Array.from(promptCounts.entries())
      .filter(([, count]) => count > 2)
      .map(([prompt]) => prompt);
  }

  private generateReasoning(
    memoryContext: ContextMemory, 
    suggestions: AgentSuggestion[], 
    insights: AgentInsight[]
  ): string {
    const reasoningParts = [];

    if (memoryContext.episodic.length > 0) {
      reasoningParts.push(`Analyzed ${memoryContext.episodic.length} past interactions`);
    }

    if (memoryContext.semantic.length > 0) {
      reasoningParts.push(`Found ${memoryContext.semantic.length} behavioral patterns`);
    }

    if (suggestions.length > 0) {
      reasoningParts.push(`Generated ${suggestions.length} memory-based suggestions`);
    }

    if (insights.length > 0) {
      reasoningParts.push(`Identified ${insights.length} behavioral insights`);
    }

    return reasoningParts.length > 0 
      ? reasoningParts.join(', ')
      : 'Limited memory context available for analysis';
  }

  private createErrorAnalysis(processingTime: number, error: any): AgentAnalysis {
    return {
      agentId: this.id,
      confidence: 0,
      suggestions: [],
      insights: [],
      reasoning: `Memory analysis failed: ${error.message}`,
      processingTime,
      metadata: {
        processingTime,
        dataSourcesUsed: [],
        confidenceFactors: [],
        limitations: [`Error: ${error.message}`]
      }
    };
  }

  private async generateMemoryBasedSuggestions(input: UserInput, memoryContext: ContextMemory): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    // Analyze episodic memory for similar interactions
    const similarInteractions = memoryContext.episodic.filter(episodic => 
      this.calculateSimilarity(input.prompt, episodic.interaction.prompt) > 0.7
    );
    
    if (similarInteractions.length > 0) {
      suggestions.push({
        id: `memory-similar-${Date.now()}`,
        type: 'explanation',
        title: 'Similar Past Interaction',
        description: `Found ${similarInteractions.length} similar interaction(s) from your history`,
        confidence: 0.8,
        priority: 'medium',
        reasoning: `Based on similar interactions in your memory, this appears to be a recurring pattern`,
        implementation: {
          steps: ['Review past solutions', 'Adapt to current context', 'Apply learned patterns'],
          resources: [`Previous interactions: ${similarInteractions.length}`]
        },
        metadata: {
          sourcePattern: 'episodic_similarity',
          memorySource: 'episodic',
          similarityCount: similarInteractions.length
        }
      });
    }
    
    // Analyze semantic patterns
    const relevantPatterns = memoryContext.semantic.filter(pattern => 
      pattern.pattern.triggers.some(trigger => input.prompt.toLowerCase().includes(trigger.toLowerCase()))
    );
    
    if (relevantPatterns.length > 0) {
      const topPattern = relevantPatterns.sort((a, b) => b.confidence - a.confidence)[0];
      suggestions.push({
        id: `memory-pattern-${Date.now()}`,
        type: 'action',
        title: 'Apply Learned Pattern',
        description: topPattern.pattern.description,
        confidence: topPattern.confidence,
        priority: 'high',
        reasoning: `This matches a learned pattern from your behavior with ${topPattern.frequency} occurrences`,
        implementation: {
          steps: topPattern.pattern.outcomes,
          resources: [`Pattern frequency: ${topPattern.frequency}`]
        },
        metadata: {
          sourcePattern: topPattern.id,
          memorySource: 'semantic',
          patternType: topPattern.pattern.type
        }
      });
    }
    
    return suggestions;
  }

  private calculateMemoryConfidence(memoryContext: ContextMemory, suggestions: AgentSuggestion[]): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on available memory
    if (memoryContext.episodic.length > 0) confidence += 0.2;
    if (memoryContext.semantic.length > 0) confidence += 0.2;
    if (memoryContext.working) confidence += 0.1;
    
    // Boost based on suggestion quality
    if (suggestions.length > 0) {
      const avgSuggestionConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
      confidence = Math.max(confidence, avgSuggestionConfidence);
    }
    
    return Math.min(confidence, 1.0);
  }

  private calculateMemoryRelevance(prompt: string, memoryContext: ContextMemory): number {
    let relevance = 0;
    
    // Check episodic memory relevance
    const relevantEpisodic = memoryContext.episodic.filter(episodic => 
      this.calculateSimilarity(prompt, episodic.interaction.prompt) > 0.5
    );
    relevance += (relevantEpisodic.length / Math.max(memoryContext.episodic.length, 1)) * 0.5;
    
    // Check semantic pattern relevance
    const relevantSemantic = memoryContext.semantic.filter(pattern => 
      pattern.pattern.triggers.some(trigger => prompt.toLowerCase().includes(trigger.toLowerCase()))
    );
    relevance += (relevantSemantic.length / Math.max(memoryContext.semantic.length, 1)) * 0.5;
    
    return Math.min(relevance, 1.0);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation based on common words
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  private createFallbackAnalysis(processingTime: number): AgentAnalysis {
    return {
      agentId: this.id,
      agentName: this.name,
      processingTime,
      confidence: 0.3,
      suggestions: [{
        id: `memory-fallback-${Date.now()}`,
        type: 'explanation',
        title: 'Memory Analysis Unavailable',
        description: 'Unable to retrieve memory context for this analysis',
        confidence: 0.3,
        priority: 'low',
        reasoning: 'Memory system encountered an error during analysis',
        metadata: {
          sourcePattern: 'fallback',
          memorySource: 'none'
        }
      }],
      metadata: {
        memoryContext: {
          episodicMemories: 0,
          semanticPatterns: 0,
          workingMemoryEntries: 0,
          relevantInteractions: []
        },
        retrievalTime: processingTime,
        memoryRelevance: 0
      }
    };
  }
}
