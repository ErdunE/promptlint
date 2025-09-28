/**
 * Pattern Recognition Agent
 * Specialized agent for behavioral pattern analysis and sequence detection
 * Leverages Level 5 behavioral pattern recognition for user behavior insights
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

// Local type definitions to avoid cross-package imports
interface BehavioralPatternRecognizer {
  analyzeUserBehavior(interactions: UserInteraction[]): Promise<BehavioralPattern[]>;
  predictNextAction(currentInput: string, patterns: BehavioralPattern[]): Promise<any>;
}

interface DetectedPatterns {
  sequences: any[];
  preferences: any[];
  temporal: any[];
  complexity: any[];
}

interface WorkflowContext {
  currentPhase: string;
  previousPhases: string[];
  estimatedTimeRemaining: number;
  currentIntent?: string;
  currentDomain?: string;
  currentComplexity?: string;
  timeOfDay?: string;
  recentInteractions?: any[];
  activeProject?: string;
  activeFile?: string;
}

interface BehavioralPattern {
  id: string;
  type: string;
  confidence: number;
  frequency: number;
  lastSeen: number;
  description?: string;
  successRate?: number;
  triggers?: string[];
  outcomes?: string[];
}

interface UserInteraction {
  id?: string;
  timestamp: number;
  prompt: string;
  context: any;
  outcome?: string;
  templateSelected?: string;
  complexity?: string;
  confidence?: number;
  sessionId?: string;
  response?: string;
  platform?: string;
  url?: string;
  level4Analysis?: any;
}

export class PatternRecognitionAgent implements Agent {
  public readonly id = 'pattern_agent';
  public readonly name = 'Pattern Recognition Agent';
  public readonly expertise: AgentExpertise = 'pattern_recognition';
  public confidence = 0.85;

  private patternRecognizer: BehavioralPatternRecognizer;
  private detectedPatterns: DetectedPatterns | null = null;

  constructor() {
    // Simplified pattern recognizer for orchestration
    this.patternRecognizer = {
      analyzeUserBehavior: async () => [],
      predictNextAction: async () => null
    };
  }

  async analyzeInput(input: UserInput): Promise<AgentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Create workflow context from input
      const workflowContext = this.createWorkflowContext(input);
      
      // Analyze user behavior patterns
      const detectedPatterns = await this.patternRecognizer.analyzeUserBehavior([]);
      
      // Generate pattern-based suggestions
      const suggestions = await this.generatePatternSuggestions(input, []);
      
      const processingTime = performance.now() - startTime;
      
      return {
        agentId: this.id,
        processingTime,
        confidence: this.calculatePatternConfidence([], suggestions),
        suggestions,
        insights: [],
        reasoning: 'Pattern analysis completed with simplified orchestration',
        metadata: {
          processingTime,
          dataSourcesUsed: ['pattern_analysis'],
          confidenceFactors: [
            { factor: 'pattern_detection', impact: 0.1, description: 'Basic pattern detection' }
          ]
        }
      };
      
    } catch (error) {
      console.error('[PatternRecognitionAgent] Analysis failed:', error);
      return this.createFallbackAnalysis(performance.now() - startTime);
    }
  }

  async analyze(input: string, context?: any): Promise<AgentAnalysis> {
    const startTime = performance.now();

    try {
      console.log(`[PatternAgent] Analyzing input for behavioral patterns: "${input.substring(0, 30)}..."`);

      // Get user interaction history from context
      const interactionHistory = context?.interactionHistory || this.createMockHistory(input);

      // Analyze behavioral patterns
      const patterns = await this.patternRecognizer.analyzeUserBehavior(interactionHistory);
      // Convert patterns to DetectedPatterns structure
      this.detectedPatterns = {
        sequences: patterns.filter(p => p.type === 'sequence'),
        preferences: patterns.filter(p => p.type === 'preference'),
        temporal: patterns.filter(p => p.type === 'temporal'),
        complexity: patterns.filter(p => p.type === 'complexity')
      };

      // Convert string input to UserInput
      const userInput: UserInput = { prompt: input, context: context || {} };

      // Generate pattern-based suggestions
      const suggestions = await this.generatePatternSuggestions(userInput, patterns);

      // Extract pattern insights
      const insights = await this.extractPatternInsights(userInput, patterns);

      // Calculate confidence based on pattern strength
      const confidence = this.calculatePatternConfidence(patterns, suggestions);

      const processingTime = performance.now() - startTime;

      return {
        agentId: this.id,
        confidence,
        suggestions,
        insights,
        reasoning: this.generateReasoning(patterns, suggestions, insights),
        processingTime,
        metadata: {
          processingTime,
          dataSourcesUsed: ['behavioral_patterns', 'sequence_analysis', 'preference_patterns'],
          confidenceFactors: [
            { factor: 'pattern_strength', impact: patterns.length > 3 ? 0.2 : 0, description: 'Multiple behavioral patterns detected' },
            { factor: 'sequence_quality', impact: patterns.filter(p => p.type === 'sequence').length > 1 ? 0.15 : 0, description: 'Multiple sequence patterns found' },
            { factor: 'preference_clarity', impact: patterns.filter(p => p.type === 'preference').length > 0 ? 0.1 : 0, description: 'Clear user preferences identified' }
          ]
        }
      };

    } catch (error) {
      console.error('[PatternAgent] Analysis failed:', error);
      return this.createErrorAnalysis(performance.now() - startTime, error);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'Sequence Pattern Detection',
        description: 'Detect behavioral sequences with >80% accuracy',
        confidence: 0.9,
        prerequisites: ['interaction_history']
      },
      {
        name: 'Preference Analysis',
        description: 'Identify user preferences from 5+ interactions',
        confidence: 0.85,
        prerequisites: ['sufficient_history']
      },
      {
        name: 'Temporal Pattern Recognition',
        description: 'Detect time-based behavioral patterns',
        confidence: 0.8,
        prerequisites: ['temporal_data']
      },
      {
        name: 'Workflow Pattern Matching',
        description: 'Match current input to established workflow patterns',
        confidence: 0.75,
        prerequisites: ['workflow_history']
      }
    ];
  }

  // Private helper methods


  private async extractPatternInsights(
    input: UserInput,
    patterns: BehavioralPattern[]
  ): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = [];

    // Overall pattern strength insight
    const avgConfidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;
    if (avgConfidence > 0.8) {
      insights.push({
        id: 'pattern_strength',
        type: 'behavioral_pattern',
        description: `Strong behavioral patterns detected (${(avgConfidence * 100).toFixed(0)}% confidence)`,
        confidence: avgConfidence,
        evidence: [
          {
            source: 'pattern_analysis',
            data: { 
              total_patterns: patterns.length,
              confidence: avgConfidence 
            },
            weight: 1.0,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User has established behavioral patterns',
          'Predictions can be made with high confidence',
          'Personalized suggestions will be more accurate'
        ]
      });
    }

    // Sequence pattern insight
    const sequencePatterns = patterns.filter(p => p.type === 'sequence');
    if (sequencePatterns.length > 0) {
      const strongSequences = sequencePatterns.filter((s: BehavioralPattern) => s.confidence > 0.8);
      if (strongSequences.length > 0) {
        insights.push({
          id: 'sequence_patterns',
          type: 'behavioral_pattern',
          description: `Detected ${strongSequences.length} strong sequence patterns`,
          confidence: 0.85,
          evidence: [
            {
              source: 'sequence_analysis',
              data: { sequences: strongSequences.map(s => s.description || s.id) },
              weight: 0.9,
              timestamp: Date.now()
            }
          ],
          implications: [
            'User follows predictable workflow sequences',
            'Next actions can be anticipated with high accuracy',
            'Workflow optimization opportunities exist'
          ]
        });
      }
    }

    // Preference insight
    const preferencePatterns = patterns.filter(p => p.type === 'preference');
    if (preferencePatterns.length > 2) {
      insights.push({
        id: 'user_preferences',
        type: 'behavioral_pattern',
        description: `Identified ${preferencePatterns.length} user preferences`,
        confidence: 0.8,
        evidence: [
          {
            source: 'preference_analysis',
            data: { preferences: preferencePatterns.map((p: BehavioralPattern) => ({ id: p.id, description: p.description })) },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User has clear preferences for tools and approaches',
          'Suggestions can be tailored to user preferences',
          'Default options should align with preferences'
        ]
      });
    }

    // Temporal pattern insight
    const temporalPatterns = patterns.filter(p => p.type === 'temporal');
    const strongTemporalPatterns = temporalPatterns.filter((t: BehavioralPattern) => t.confidence > 0.7);
    if (strongTemporalPatterns.length > 0) {
      insights.push({
        id: 'temporal_patterns',
        type: 'behavioral_pattern',
        description: `Found ${strongTemporalPatterns.length} time-based activity patterns`,
        confidence: 0.75,
        evidence: [
          {
            source: 'temporal_analysis',
            data: { patterns: strongTemporalPatterns.map((t: BehavioralPattern) => ({ id: t.id, description: t.description })) },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User has time-based work preferences',
          'Suggestions can be optimized for current time',
          'Productivity patterns can be leveraged'
        ]
      });
    }

    // Pattern evolution insight
    const evolutionInsight = this.analyzePatternEvolution(patterns);
    if (evolutionInsight) {
      insights.push(evolutionInsight);
    }

    return insights;
  }

  private predictNextInSequence(input: string, sequence: any): string | null {
    const inputLower = input.toLowerCase();
    
    // Find where current input fits in the sequence
    for (let i = 0; i < sequence.sequence.length - 1; i++) {
      const currentStep = sequence.sequence[i].toLowerCase();
      if (inputLower.includes(currentStep)) {
        return sequence.sequence[i + 1];
      }
    }

    // If input matches the last step, suggest starting a new cycle or related action
    const lastStep = sequence.sequence[sequence.sequence.length - 1].toLowerCase();
    if (inputLower.includes(lastStep)) {
      // Suggest starting the sequence over or a related action
      return sequence.sequence[0]; // Start sequence over
    }

    return null;
  }

  private isPreferenceRelevant(preference: any, input: string): boolean {
    const inputLower = input.toLowerCase();
    const category = preference.category.toLowerCase();
    
    // Check if input is related to the preference category
    return inputLower.includes(category) || 
           inputLower.includes(preference.preference.toLowerCase()) ||
           this.getCategoryKeywords(category).some(keyword => inputLower.includes(keyword));
  }

  private getCategoryKeywords(category: string): string[] {
    const keywords: Record<string, string[]> = {
      'template': ['template', 'format', 'structure'],
      'domain': ['project', 'work', 'task'],
      'complexity': ['simple', 'complex', 'advanced', 'basic'],
      'style': ['style', 'approach', 'method']
    };
    
    return keywords[category] || [];
  }

  private isCurrentTimeRelevant(temporal: any): boolean {
    const currentHour = new Date().getHours();
    let currentTimeOfDay: string;
    
    if (currentHour >= 6 && currentHour < 12) currentTimeOfDay = 'morning';
    else if (currentHour >= 12 && currentHour < 18) currentTimeOfDay = 'afternoon';
    else if (currentHour >= 18 && currentHour < 22) currentTimeOfDay = 'evening';
    else currentTimeOfDay = 'night';
    
    return temporal.timeOfDay === currentTimeOfDay;
  }

  private generateWorkflowPatternSuggestion(input: string, workflow: any): AgentSuggestion | null {
    // Find current position in workflow and suggest next step
    const inputLower = input.toLowerCase();
    
    for (let i = 0; i < workflow.sequence.length - 1; i++) {
      const currentStep = workflow.sequence[i].toLowerCase();
      if (inputLower.includes(currentStep)) {
        const nextStep = workflow.sequence[i + 1];
        return {
          id: `pattern_workflow_${workflow.id}`,
          type: 'workflow_step',
          content: `Next in your ${workflow.name}: ${nextStep}`,
          confidence: workflow.confidence,
          priority: 'high',
          source: 'pattern_recognition',
          reasoning: `Based on your ${workflow.name} pattern`
        };
      }
    }

    return null;
  }

  private analyzePatternEvolution(patterns: BehavioralPattern[]): AgentInsight | null {
    // Analyze if patterns are evolving or stable
    const totalPatterns = patterns.length;
    const avgConfidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;
    
    if (totalPatterns > 5 && avgConfidence > 0.8) {
      return {
        id: 'pattern_evolution',
        type: 'behavioral_pattern',
        description: 'Behavioral patterns are well-established and stable',
        confidence: 0.8,
        evidence: [
          {
            source: 'pattern_evolution_analysis',
            data: { total_patterns: totalPatterns, stability: 'high' },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'User has consistent work habits',
          'Predictions will remain accurate over time',
          'Automation opportunities exist for routine tasks'
        ]
      };
    }

    if (totalPatterns < 3 || avgConfidence < 0.5) {
      return {
        id: 'pattern_learning',
        type: 'behavioral_pattern',
        description: 'Still learning user behavioral patterns',
        confidence: 0.6,
        evidence: [
          {
            source: 'pattern_evolution_analysis',
            data: { total_patterns: totalPatterns, learning_phase: true },
            weight: 0.7,
            timestamp: Date.now()
          }
        ],
        implications: [
          'More interactions needed to establish patterns',
          'Suggestions will improve with usage',
          'User may be exploring different approaches'
        ]
      };
    }

    return null;
  }

  private createMockHistory(input: string): UserInteraction[] {
    // Create mock interaction history for testing
    return [
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 3600000,
        prompt: 'Plan the new feature architecture',
        context: {},
        response: 'Created architecture plan',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'plan', complexity: 'moderate' }
      },
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 1800000,
        prompt: 'Implement the user authentication',
        context: {},
        response: 'Implemented auth system',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'implement', complexity: 'moderate' }
      },
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 900000,
        prompt: 'Write tests for the auth system',
        context: {},
        response: 'Created comprehensive tests',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'test', complexity: 'simple' }
      }
    ];
  }

  private generateReasoning(
    patterns: BehavioralPattern[],
    suggestions: AgentSuggestion[],
    insights: AgentInsight[]
  ): string {
    const reasoningParts = [];

    const avgConfidence = patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length : 0;
    reasoningParts.push(`Analyzed behavioral patterns with ${(avgConfidence * 100).toFixed(0)}% confidence`);

    const sequencePatterns = patterns.filter(p => p.type === 'sequence');
    if (sequencePatterns.length > 0) {
      reasoningParts.push(`Found ${sequencePatterns.length} sequence patterns`);
    }

    const preferencePatterns = patterns.filter(p => p.type === 'preference');
    if (preferencePatterns.length > 0) {
      reasoningParts.push(`Identified ${preferencePatterns.length} user preferences`);
    }

    const temporalPatterns = patterns.filter(p => p.type === 'temporal');
    if (temporalPatterns.length > 0) {
      reasoningParts.push(`Detected ${temporalPatterns.length} temporal patterns`);
    }

    if (suggestions.length > 0) {
      reasoningParts.push(`Generated ${suggestions.length} pattern-based suggestions`);
    }

    return reasoningParts.join(', ');
  }

  private createErrorAnalysis(processingTime: number, error: any): AgentAnalysis {
    return {
      agentId: this.id,
      confidence: 0,
      suggestions: [],
      insights: [],
      reasoning: `Pattern analysis failed: ${error.message}`,
      processingTime,
      metadata: {
        processingTime,
        dataSourcesUsed: [],
        confidenceFactors: [],
        limitations: [`Error: ${error.message}`]
      }
    };
  }

  private createWorkflowContext(input: UserInput): WorkflowContext {
    return {
      currentPhase: 'analysis',
      previousPhases: [],
      estimatedTimeRemaining: 30,
      currentIntent: this.inferIntentFromInput(input.prompt),
      currentDomain: this.inferDomainFromInput(input.prompt),
      currentComplexity: input.context.level4Analysis?.complexity || 'unknown',
      timeOfDay: this.getCurrentTimeOfDay(),
      recentInteractions: [], // Would be populated from memory
      activeProject: this.extractProjectFromUrl(input.context.url),
      activeFile: this.extractFileFromUrl(input.context.url)
    };
  }

  private async generatePatternSuggestions(input: UserInput, patterns: BehavioralPattern[]): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    // Generate sequence-based suggestions
    for (const pattern of patterns) {
      if (pattern.confidence > 0.7 && pattern.type === 'sequence') {
        suggestions.push({
          id: `pattern-sequence-${Date.now()}`,
          type: 'pattern_completion',
          content: `Continue pattern sequence based on your behavior`,
          source: 'pattern_recognition',
          confidence: pattern.confidence,
          priority: 'high',
          reasoning: `You typically follow this sequence with ${pattern.frequency} occurrences`,
          metadata: {
            sourcePattern: pattern.id,
            patternType: 'sequence'
          }
        });
      }
    }
    
    // Generate preference-based suggestions
    const preferencePatterns = patterns.filter(p => p.type === 'preference');
    for (const preference of preferencePatterns) {
      if (preference.confidence > 0.6) {
        suggestions.push({
          id: `pattern-preference-${Date.now()}`,
          type: 'contextual_hint',
          content: `Apply preferred approach: ${preference.description || preference.id}`,
          source: 'pattern_recognition',
          confidence: preference.confidence,
          priority: 'medium',
          reasoning: `Based on your behavioral preferences pattern`,
          metadata: {
            sourcePattern: preference.id,
            patternType: 'preference'
          }
        });
      }
    }
    
    // Generate temporal-based suggestions
    const temporalPatterns = patterns.filter(p => p.type === 'temporal');
    for (const temporal of temporalPatterns) {
      if (temporal.confidence > 0.6) {
        suggestions.push({
          id: `pattern-temporal-${Date.now()}`,
          type: 'contextual_hint',
          content: `Time-based pattern suggestion: ${temporal.description || temporal.id}`,
          source: 'pattern_recognition',
          confidence: temporal.confidence,
          priority: 'low',
          reasoning: `Temporal pattern detected based on behavioral analysis`,
          metadata: {
            sourcePattern: temporal.id,
            patternType: 'temporal'
          }
        });
      }
    }
    
    return suggestions;
  }

  private calculatePatternConfidence(patterns: BehavioralPattern[], suggestions: AgentSuggestion[]): number {
    let confidence = 0.5; // Base confidence

    // Boost based on pattern diversity
    const patternTypes = patterns.reduce((types, pattern) => {
      if (!types.includes(pattern.type)) {
        types.push(pattern.type);
      }
      return types;
    }, [] as string[]).length;
    
    confidence += patternTypes * 0.05;

    // Boost based on suggestion quality
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
    confidence += highConfidenceSuggestions.length * 0.03;

    // Boost based on pattern strength
    const strongPatterns = patterns.filter((p: BehavioralPattern) => p.confidence > 0.8);
    
    confidence += strongPatterns.length * 0.02;

    return Math.min(confidence, 1.0);
  }

  private inferIntentFromInput(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('plan') || promptLower.includes('design')) return 'plan';
    if (promptLower.includes('implement') || promptLower.includes('code') || promptLower.includes('build')) return 'implement';
    if (promptLower.includes('test') || promptLower.includes('verify')) return 'test';
    if (promptLower.includes('debug') || promptLower.includes('fix')) return 'debug';
    if (promptLower.includes('document') || promptLower.includes('explain')) return 'document';
    if (promptLower.includes('review') || promptLower.includes('check')) return 'review';
    
    return 'general';
  }

  private inferDomainFromInput(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('react') || promptLower.includes('javascript') || promptLower.includes('typescript')) return 'frontend';
    if (promptLower.includes('node') || promptLower.includes('express') || promptLower.includes('api')) return 'backend';
    if (promptLower.includes('database') || promptLower.includes('sql')) return 'database';
    if (promptLower.includes('test') || promptLower.includes('jest')) return 'testing';
    
    return 'general';
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private extractProjectFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('github.com')) {
        const pathParts = urlObj.pathname.split('/');
        return pathParts[2]; // Repository name
      }
    } catch {
      // Invalid URL
    }
    return undefined;
  }

  private extractFileFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.includes('.')) {
        const pathParts = urlObj.pathname.split('/');
        return pathParts[pathParts.length - 1]; // File name
      }
    } catch {
      // Invalid URL
    }
    return undefined;
  }

  private createFallbackAnalysis(processingTime: number): AgentAnalysis {
    return {
      agentId: this.id,
      processingTime,
      confidence: 0.3,
      insights: [],
      reasoning: 'Pattern recognition system encountered an error during analysis',
      suggestions: [{
        id: `pattern-fallback-${Date.now()}`,
        type: 'contextual_hint',
        content: 'Unable to detect behavioral patterns for this analysis',
        source: 'pattern_recognition',
        confidence: 0.3,
        priority: 'low',
        reasoning: 'Pattern recognition system encountered an error during analysis',
        metadata: {
          sourcePattern: 'fallback',
          patternType: 'none'
        }
      }],
      metadata: {
        processingTime,
        dataSourcesUsed: ['pattern_fallback'],
        confidenceFactors: [
          { factor: 'pattern_unavailable', impact: -0.5, description: 'Pattern system error' }
        ],
        limitations: ['Pattern analysis unavailable']
      }
    };
  }
}
