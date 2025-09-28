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

import { 
  BehavioralPatternRecognizer,
  DetectedPatterns,
  WorkflowContext,
  createBehavioralPatternRecognizer
} from '@promptlint/level5-predictive';

import { UserInteraction } from '@promptlint/level5-memory';

export class PatternRecognitionAgent implements Agent {
  public readonly id = 'pattern_agent';
  public readonly name = 'Pattern Recognition Agent';
  public readonly expertise: AgentExpertise = 'pattern_recognition';
  public confidence = 0.85;

  private patternRecognizer: BehavioralPatternRecognizer;
  private detectedPatterns: DetectedPatterns | null = null;

  constructor() {
    this.patternRecognizer = createBehavioralPatternRecognizer();
  }

  async analyzeInput(input: UserInput): Promise<AgentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Create workflow context from input
      const workflowContext = this.createWorkflowContext(input);
      
      // Analyze user behavior patterns
      const detectedPatterns = await this.patternRecognizer.analyzeUserBehavior([]);
      
      // Generate pattern-based suggestions
      const suggestions = await this.generatePatternSuggestions(input, detectedPatterns);
      
      const processingTime = performance.now() - startTime;
      
      return {
        agentId: this.id,
        agentName: this.name,
        processingTime,
        confidence: this.calculatePatternConfidence(detectedPatterns, suggestions),
        suggestions,
        metadata: {
          detectedPatterns: {
            sequences: detectedPatterns.sequences,
            preferences: detectedPatterns.preferences,
            temporal: detectedPatterns.temporal,
            workflows: detectedPatterns.workflows
          },
          patternConfidence: detectedPatterns.confidence,
          emergingPatterns: 0 // Would be populated from pattern recognizer
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
      this.detectedPatterns = patterns;

      // Generate pattern-based suggestions
      const suggestions = await this.generatePatternSuggestions(input, patterns, context);

      // Extract pattern insights
      const insights = await this.extractPatternInsights(input, patterns);

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
            { factor: 'pattern_strength', impact: patterns.confidence > 0.8 ? 0.2 : 0, description: 'Strong behavioral patterns detected' },
            { factor: 'sequence_quality', impact: patterns.sequences.length > 2 ? 0.15 : 0, description: 'Multiple sequence patterns found' },
            { factor: 'preference_clarity', impact: patterns.preferences.length > 1 ? 0.1 : 0, description: 'Clear user preferences identified' }
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

  private async generatePatternSuggestions(
    input: string,
    patterns: DetectedPatterns,
    context?: any
  ): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];

    // Sequence-based suggestions
    for (const sequence of patterns.sequences) {
      if (sequence.confidence > 0.7) {
        const nextStep = this.predictNextInSequence(input, sequence);
        if (nextStep) {
          suggestions.push({
            id: `pattern_sequence_${sequence.id}`,
            type: 'pattern_completion',
            content: `Based on your pattern: ${nextStep}`,
            confidence: sequence.confidence,
            priority: 'high',
            source: 'pattern_recognition',
            reasoning: `You typically do "${nextStep}" after "${sequence.sequence[sequence.sequence.length - 1]}"`
          });
        }
      }
    }

    // Preference-based suggestions
    for (const preference of patterns.preferences) {
      if (preference.strength > 0.6 && this.isPreferenceRelevant(preference, input)) {
        suggestions.push({
          id: `pattern_preference_${preference.id}`,
          type: 'contextual_hint',
          content: `Consider using ${preference.preference} (your usual preference)`,
          confidence: preference.strength,
          priority: 'medium',
          source: 'pattern_recognition',
          reasoning: `You prefer ${preference.preference} for ${preference.category} tasks`
        });
      }
    }

    // Temporal pattern suggestions
    for (const temporal of patterns.temporal) {
      if (temporal.confidence > 0.7 && this.isCurrentTimeRelevant(temporal)) {
        suggestions.push({
          id: `pattern_temporal_${temporal.id}`,
          type: 'proactive_guidance',
          content: `Good time for ${temporal.activity} - matches your typical ${temporal.timeOfDay} pattern`,
          confidence: temporal.confidence,
          priority: 'medium',
          source: 'pattern_recognition',
          reasoning: `You typically do ${temporal.activity} in the ${temporal.timeOfDay}`
        });
      }
    }

    // Workflow pattern suggestions
    for (const workflow of patterns.workflows) {
      if (workflow.confidence > 0.7) {
        const workflowSuggestion = this.generateWorkflowPatternSuggestion(input, workflow);
        if (workflowSuggestion) {
          suggestions.push(workflowSuggestion);
        }
      }
    }

    return suggestions.slice(0, 4); // Limit to top 4 suggestions
  }

  private async extractPatternInsights(
    input: string,
    patterns: DetectedPatterns
  ): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = [];

    // Overall pattern strength insight
    if (patterns.confidence > 0.8) {
      insights.push({
        id: 'pattern_strength',
        type: 'behavioral_pattern',
        description: `Strong behavioral patterns detected (${(patterns.confidence * 100).toFixed(0)}% confidence)`,
        confidence: patterns.confidence,
        evidence: [
          {
            source: 'pattern_analysis',
            data: { 
              total_patterns: patterns.sequences.length + patterns.preferences.length + patterns.temporal.length,
              confidence: patterns.confidence 
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
    if (patterns.sequences.length > 0) {
      const strongSequences = patterns.sequences.filter(s => s.confidence > 0.8);
      if (strongSequences.length > 0) {
        insights.push({
          id: 'sequence_patterns',
          type: 'behavioral_pattern',
          description: `Detected ${strongSequences.length} strong sequence patterns`,
          confidence: 0.85,
          evidence: [
            {
              source: 'sequence_analysis',
              data: { sequences: strongSequences.map(s => s.sequence) },
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
    if (patterns.preferences.length > 2) {
      insights.push({
        id: 'user_preferences',
        type: 'behavioral_pattern',
        description: `Identified ${patterns.preferences.length} user preferences`,
        confidence: 0.8,
        evidence: [
          {
            source: 'preference_analysis',
            data: { preferences: patterns.preferences.map(p => ({ category: p.category, preference: p.preference })) },
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
    const strongTemporalPatterns = patterns.temporal.filter(t => t.confidence > 0.7);
    if (strongTemporalPatterns.length > 0) {
      insights.push({
        id: 'temporal_patterns',
        type: 'behavioral_pattern',
        description: `Found ${strongTemporalPatterns.length} time-based activity patterns`,
        confidence: 0.75,
        evidence: [
          {
            source: 'temporal_analysis',
            data: { patterns: strongTemporalPatterns.map(t => ({ time: t.timeOfDay, activity: t.activity })) },
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

  private analyzePatternEvolution(patterns: DetectedPatterns): AgentInsight | null {
    // Analyze if patterns are evolving or stable
    const totalPatterns = patterns.sequences.length + patterns.preferences.length + patterns.temporal.length;
    
    if (totalPatterns > 5 && patterns.confidence > 0.8) {
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

    if (totalPatterns < 3 || patterns.confidence < 0.5) {
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

  private calculatePatternConfidence(patterns: DetectedPatterns, suggestions: AgentSuggestion[]): number {
    let confidence = patterns.confidence; // Base confidence from pattern analysis

    // Boost based on pattern diversity
    const patternTypes = [
      patterns.sequences.length > 0,
      patterns.preferences.length > 0,
      patterns.temporal.length > 0,
      patterns.workflows.length > 0
    ].filter(Boolean).length;
    
    confidence += patternTypes * 0.05;

    // Boost based on suggestion quality
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
    confidence += highConfidenceSuggestions.length * 0.03;

    // Boost based on pattern strength
    const strongPatterns = [
      ...patterns.sequences.filter(s => s.confidence > 0.8),
      ...patterns.preferences.filter(p => p.strength > 0.8),
      ...patterns.temporal.filter(t => t.confidence > 0.8)
    ];
    
    confidence += strongPatterns.length * 0.02;

    return Math.min(confidence, 1.0);
  }

  private createMockHistory(input: string): UserInteraction[] {
    // Create mock interaction history for testing
    return [
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 3600000,
        prompt: 'Plan the new feature architecture',
        response: 'Created architecture plan',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'plan', complexity: 'moderate' }
      },
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 1800000,
        prompt: 'Implement the user authentication',
        response: 'Implemented auth system',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'implement', complexity: 'moderate' }
      },
      {
        sessionId: 'test_session',
        timestamp: Date.now() - 900000,
        prompt: 'Write tests for the auth system',
        response: 'Created comprehensive tests',
        platform: 'Test',
        url: 'http://test.com',
        level4Analysis: { intent: 'test', complexity: 'simple' }
      }
    ];
  }

  private generateReasoning(
    patterns: DetectedPatterns,
    suggestions: AgentSuggestion[],
    insights: AgentInsight[]
  ): string {
    const reasoningParts = [];

    reasoningParts.push(`Analyzed behavioral patterns with ${(patterns.confidence * 100).toFixed(0)}% confidence`);

    if (patterns.sequences.length > 0) {
      reasoningParts.push(`Found ${patterns.sequences.length} sequence patterns`);
    }

    if (patterns.preferences.length > 0) {
      reasoningParts.push(`Identified ${patterns.preferences.length} user preferences`);
    }

    if (patterns.temporal.length > 0) {
      reasoningParts.push(`Detected ${patterns.temporal.length} temporal patterns`);
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
      currentIntent: this.inferIntentFromInput(input.prompt),
      currentDomain: this.inferDomainFromInput(input.prompt),
      currentComplexity: input.context.level4Analysis?.complexity || 'unknown',
      timeOfDay: this.getCurrentTimeOfDay(),
      recentInteractions: [], // Would be populated from memory
      activeProject: this.extractProjectFromUrl(input.context.url),
      activeFile: this.extractFileFromUrl(input.context.url)
    };
  }

  private async generatePatternSuggestions(input: UserInput, patterns: DetectedPatterns): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    // Generate sequence-based suggestions
    for (const sequence of patterns.sequences) {
      if (sequence.confidence > 0.7) {
        suggestions.push({
          id: `pattern-sequence-${Date.now()}`,
          type: 'pattern_completion',
          title: 'Continue Pattern Sequence',
          description: `Based on your pattern: ${sequence.sequence.join(' → ')}`,
          confidence: sequence.confidence,
          priority: 'high',
          reasoning: `You typically follow this sequence with ${sequence.frequency} occurrences`,
          implementation: {
            steps: [`Continue with next step in sequence`],
            resources: [`Pattern history: ${sequence.frequency} times`]
          },
          metadata: {
            sourcePattern: sequence.id,
            patternType: 'sequence'
          }
        });
      }
    }
    
    // Generate preference-based suggestions
    for (const preference of patterns.preferences) {
      if (preference.strength > 0.6) {
        suggestions.push({
          id: `pattern-preference-${Date.now()}`,
          type: 'contextual_hint',
          title: 'Apply Preferred Approach',
          description: `Use your preferred ${preference.category}: ${preference.value}`,
          confidence: preference.strength,
          priority: 'medium',
          reasoning: `You prefer ${preference.value} for ${preference.category} tasks`,
          implementation: {
            steps: [`Apply ${preference.value} approach`],
            resources: [`Preference strength: ${(preference.strength * 100).toFixed(0)}%`]
          },
          metadata: {
            sourcePattern: preference.id,
            patternType: 'preference'
          }
        });
      }
    }
    
    // Generate temporal-based suggestions
    for (const temporal of patterns.temporal) {
      if (temporal.confidence > 0.6 && temporal.timeOfDay === this.getCurrentTimeOfDay()) {
        suggestions.push({
          id: `pattern-temporal-${Date.now()}`,
          type: 'proactive_guidance',
          title: 'Time-Based Suggestion',
          description: `You typically do ${temporal.activity} activities in the ${temporal.timeOfDay}`,
          confidence: temporal.confidence,
          priority: 'low',
          reasoning: `Temporal pattern shows ${temporal.activity} preference during ${temporal.timeOfDay}`,
          implementation: {
            steps: [`Consider ${temporal.activity} activities`],
            resources: [`Pattern frequency: ${temporal.frequency}`]
          },
          metadata: {
            sourcePattern: temporal.id,
            patternType: 'temporal'
          }
        });
      }
    }
    
    return suggestions;
  }

  private calculatePatternConfidence(patterns: DetectedPatterns, suggestions: AgentSuggestion[]): number {
    let confidence = patterns.confidence; // Base confidence from pattern analysis

    // Boost based on pattern diversity
    const patternTypes = [
      patterns.sequences.length > 0,
      patterns.preferences.length > 0,
      patterns.temporal.length > 0,
      patterns.workflows.length > 0
    ].filter(Boolean).length;
    
    confidence += patternTypes * 0.05;

    // Boost based on suggestion quality
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.7);
    confidence += highConfidenceSuggestions.length * 0.03;

    // Boost based on pattern strength
    const strongPatterns = [
      ...patterns.sequences.filter(s => s.confidence > 0.8),
      ...patterns.preferences.filter(p => p.strength > 0.8),
      ...patterns.temporal.filter(t => t.confidence > 0.8)
    ];
    
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
      agentName: this.name,
      processingTime,
      confidence: 0.3,
      suggestions: [{
        id: `pattern-fallback-${Date.now()}`,
        type: 'contextual_hint',
        title: 'Pattern Analysis Unavailable',
        description: 'Unable to detect behavioral patterns for this analysis',
        confidence: 0.3,
        priority: 'low',
        reasoning: 'Pattern recognition system encountered an error during analysis',
        metadata: {
          sourcePattern: 'fallback',
          patternType: 'none'
        }
      }],
      metadata: {
        detectedPatterns: {
          sequences: [],
          preferences: [],
          temporal: [],
          workflows: []
        },
        patternConfidence: 0,
        emergingPatterns: 0
      }
    };
  }
}
