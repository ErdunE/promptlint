/**
 * Workflow Agent
 * Specialized agent for workflow state detection and multi-step predictions
 * Leverages Level 5 workflow intelligence for proactive guidance
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
  WorkflowStateMachine,
  WorkflowState,
  WorkflowPrediction,
  DetectedPatterns,
  WorkflowContext,
  createWorkflowStateMachine
} from '@promptlint/level5-predictive';

export class WorkflowAgent implements Agent {
  public readonly id = 'workflow_agent';
  public readonly name = 'Workflow Agent';
  public readonly expertise: AgentExpertise = 'workflow_intelligence';
  public confidence = 0.9;

  private workflowStateMachine: WorkflowStateMachine;
  private currentWorkflowState: WorkflowState | null = null;

  constructor() {
    this.workflowStateMachine = createWorkflowStateMachine({
      enableProactiveSuggestions: true,
      confidenceThreshold: 0.75
    });
  }

  async analyzeInput(input: UserInput): Promise<AgentAnalysis> {
    const startTime = performance.now();
    
    try {
      // Detect current workflow state
      const workflowState = await this.workflowStateMachine.detectWorkflowTransition(
        input.prompt,
        input.context
      );
      
      // Generate workflow-based suggestions
      const suggestions = await this.generateWorkflowSuggestions(input, workflowState);
      
      const processingTime = performance.now() - startTime;
      
      return {
        agentId: this.id,
        agentName: this.name,
        processingTime,
        confidence: this.calculateWorkflowConfidence(workflowState, suggestions),
        suggestions,
        metadata: {
          workflowState: {
            currentPhase: workflowState?.phase || 'unknown',
            nextPhases: workflowState?.transitions?.map(t => t.nextPhase) || [],
            completionProgress: workflowState?.progress || 0
          },
          workflowTransitions: workflowState?.transitions || [],
          phaseConfidence: workflowState?.confidence || 0
        }
      };
      
    } catch (error) {
      console.error('[WorkflowAgent] Analysis failed:', error);
      return this.createFallbackAnalysis(performance.now() - startTime);
    }
  }

  async analyze(input: string, context?: any): Promise<AgentAnalysis> {
    const startTime = performance.now();

    try {
      console.log(`[WorkflowAgent] Analyzing input for workflow intelligence: "${input.substring(0, 30)}..."`);

      // Create workflow context from input
      const workflowContext = this.createWorkflowContext(input, context);

      // Detect current workflow state
      const patterns = context?.patterns || await this.createMockPatterns();
      const transition = await this.workflowStateMachine.detectWorkflowTransition(
        input, patterns, workflowContext
      );

      // Update current workflow state
      this.currentWorkflowState = transition.toState;

      // Generate workflow-based suggestions
      const suggestions = await this.generateWorkflowSuggestions(transition, workflowContext);

      // Extract workflow insights
      const insights = await this.extractWorkflowInsights(transition, workflowContext);

      // Calculate confidence based on workflow detection accuracy
      const confidence = this.calculateWorkflowConfidence(transition, suggestions);

      const processingTime = performance.now() - startTime;

      return {
        agentId: this.id,
        confidence,
        suggestions,
        insights,
        reasoning: this.generateReasoning(transition, suggestions, insights),
        processingTime,
        metadata: {
          processingTime,
          dataSourcesUsed: ['workflow_state_machine', 'behavioral_patterns', 'temporal_context'],
          confidenceFactors: [
            { factor: 'state_confidence', impact: transition.confidence > 0.8 ? 0.2 : 0, description: 'High workflow state confidence' },
            { factor: 'pattern_match', impact: patterns.sequences.length > 0 ? 0.15 : 0, description: 'Strong behavioral pattern match' },
            { factor: 'context_clarity', impact: this.hasGoodContext(workflowContext) ? 0.1 : -0.1, description: 'Clear workflow context' }
          ]
        }
      };

    } catch (error) {
      console.error('[WorkflowAgent] Analysis failed:', error);
      return this.createErrorAnalysis(performance.now() - startTime, error);
    }
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'Workflow State Detection',
        description: 'Detect current workflow phase with >75% accuracy',
        confidence: 0.9,
        prerequisites: ['workflow_context']
      },
      {
        name: 'Multi-Step Prediction',
        description: 'Predict next 2-3 workflow steps with >65% confidence',
        confidence: 0.85,
        prerequisites: ['workflow_state', 'behavioral_patterns']
      },
      {
        name: 'Proactive Guidance',
        description: 'Suggest appropriate next actions based on workflow phase',
        confidence: 0.8,
        prerequisites: ['workflow_state']
      },
      {
        name: 'Phase Transition Detection',
        description: 'Identify when user is transitioning between workflow phases',
        confidence: 0.75,
        prerequisites: ['workflow_history']
      }
    ];
  }

  // Private helper methods

  private createWorkflowContext(input: string, context?: any): WorkflowContext {
    // Infer workflow context from input and provided context
    const currentIntent = this.inferIntentFromInput(input);
    const domain = context?.domain || this.inferDomainFromInput(input);
    const urgencyLevel = this.inferUrgencyFromInput(input);

    return {
      currentIntent,
      domain,
      recentActions: [currentIntent],
      timeContext: {
        timeOfDay: this.getCurrentTimeOfDay(),
        dayOfWeek: this.getCurrentDayOfWeek(),
        isWeekend: this.isWeekend(),
        sessionDuration: context?.sessionDuration || 30
      },
      collaborationLevel: context?.collaborationLevel || 'individual',
      urgencyLevel
    };
  }

  private async generateWorkflowSuggestions(
    transition: any,
    workflowContext: WorkflowContext
  ): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];

    // Current workflow state suggestion
    if (transition.confidence > 0.75) {
      suggestions.push({
        id: `workflow_current_${transition.toState.phase}`,
        type: 'workflow_step',
        content: `You're in the ${transition.toState.phase} phase`,
        confidence: transition.confidence,
        priority: 'high',
        source: 'workflow_intelligence',
        reasoning: `Detected ${transition.toState.phase} phase with ${(transition.confidence * 100).toFixed(0)}% confidence`
      });
    }

    // Next step suggestions from workflow state machine
    const workflowSuggestions = await this.workflowStateMachine.getWorkflowSuggestions(transition.toState);
    
    workflowSuggestions.forEach((suggestion, index) => {
      if (index < 2) { // Limit to top 2 workflow suggestions
        suggestions.push({
          id: `workflow_next_${suggestion.id}`,
          type: 'next_action',
          content: suggestion.description,
          confidence: suggestion.confidence,
          priority: suggestion.actions[0]?.priority || 'medium',
          source: 'workflow_intelligence',
          reasoning: `Based on ${transition.toState.phase} phase workflow patterns`
        });
      }
    });

    // Phase transition suggestions
    const transitionSuggestion = this.generatePhaseTransitionSuggestion(transition.toState, workflowContext);
    if (transitionSuggestion) {
      suggestions.push(transitionSuggestion);
    }

    // Urgency-based suggestions
    if (workflowContext.urgencyLevel === 'high' || workflowContext.urgencyLevel === 'critical') {
      suggestions.push({
        id: 'workflow_urgency_guidance',
        type: 'proactive_guidance',
        content: 'Focus on critical path items due to high urgency',
        confidence: 0.8,
        priority: 'high',
        source: 'workflow_intelligence',
        reasoning: `High urgency detected: ${workflowContext.urgencyLevel}`
      });
    }

    return suggestions;
  }

  private async extractWorkflowInsights(
    transition: any,
    workflowContext: WorkflowContext
  ): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = [];

    // Workflow state insight
    insights.push({
      id: 'workflow_state_detection',
      type: 'workflow_state',
      description: `User is in ${transition.toState.phase} workflow phase`,
      confidence: transition.confidence,
      evidence: [
        {
          source: 'workflow_state_machine',
          data: { 
            phase: transition.toState.phase, 
            confidence: transition.confidence,
            indicators: transition.trigger.indicators 
          },
          weight: 1.0,
          timestamp: Date.now()
        }
      ],
      implications: [
        `Suggestions should align with ${transition.toState.phase} phase activities`,
        'User likely needs phase-specific guidance and tools'
      ]
    });

    // Time-based workflow insight
    const timeInsight = this.generateTimeBasedInsight(workflowContext);
    if (timeInsight) {
      insights.push(timeInsight);
    }

    // Workflow efficiency insight
    const efficiencyInsight = this.generateEfficiencyInsight(transition.toState, workflowContext);
    if (efficiencyInsight) {
      insights.push(efficiencyInsight);
    }

    // Collaboration insight
    if (workflowContext.collaborationLevel === 'team') {
      insights.push({
        id: 'workflow_collaboration',
        type: 'workflow_state',
        description: 'Team collaboration context detected',
        confidence: 0.8,
        evidence: [
          {
            source: 'context_analysis',
            data: { collaboration_level: 'team' },
            weight: 0.9,
            timestamp: Date.now()
          }
        ],
        implications: [
          'Consider team coordination and communication needs',
          'Suggestions should include collaborative aspects'
        ]
      });
    }

    return insights;
  }

  private generatePhaseTransitionSuggestion(
    currentState: WorkflowState,
    context: WorkflowContext
  ): AgentSuggestion | null {
    // Suggest transition to next logical phase
    const phaseTransitions: Record<string, string> = {
      'planning': 'implementation',
      'implementation': 'testing',
      'testing': 'documentation',
      'debugging': 'testing',
      'documentation': 'review',
      'review': 'deployment',
      'deployment': 'maintenance',
      'maintenance': 'planning'
    };

    const nextPhase = phaseTransitions[currentState.phase];
    if (!nextPhase) return null;

    // Check if user has been in current phase for a while
    const timeInPhase = Date.now() - currentState.startTime;
    const expectedDuration = this.getExpectedPhaseDuration(currentState.phase);

    if (timeInPhase > expectedDuration * 1.2) { // 20% over expected duration
      return {
        id: `workflow_transition_${nextPhase}`,
        type: 'workflow_step',
        content: `Consider moving to ${nextPhase} phase`,
        confidence: 0.75,
        priority: 'medium',
        source: 'workflow_intelligence',
        reasoning: `You've been in ${currentState.phase} phase for ${Math.round(timeInPhase / 60000)} minutes`
      };
    }

    return null;
  }

  private generateTimeBasedInsight(context: WorkflowContext): AgentInsight | null {
    const timeOfDay = context.timeContext.timeOfDay;
    
    // Generate insights based on time of day patterns
    const timeInsights: Record<string, { activity: string, confidence: number }> = {
      'morning': { activity: 'planning and architecture', confidence: 0.8 },
      'afternoon': { activity: 'implementation and coding', confidence: 0.85 },
      'evening': { activity: 'documentation and review', confidence: 0.75 }
    };

    const insight = timeInsights[timeOfDay];
    if (!insight) return null;

    return {
      id: 'workflow_time_pattern',
      type: 'behavioral_pattern',
      description: `${timeOfDay} is typically good for ${insight.activity}`,
      confidence: insight.confidence,
      evidence: [
        {
          source: 'temporal_analysis',
          data: { time_of_day: timeOfDay, suggested_activity: insight.activity },
          weight: 0.8,
          timestamp: Date.now()
        }
      ],
      implications: [
        `Current time (${timeOfDay}) aligns well with ${insight.activity}`,
        'Consider focusing on time-appropriate activities'
      ]
    };
  }

  private generateEfficiencyInsight(
    currentState: WorkflowState,
    context: WorkflowContext
  ): AgentInsight | null {
    // Look for efficiency opportunities based on workflow state and context
    if (currentState.phase === 'implementation' && context.urgencyLevel === 'high') {
      return {
        id: 'workflow_efficiency_opportunity',
        type: 'performance_opportunity',
        description: 'High urgency implementation - consider MVP approach',
        confidence: 0.8,
        evidence: [
          {
            source: 'workflow_analysis',
            data: { phase: 'implementation', urgency: 'high' },
            weight: 0.9,
            timestamp: Date.now()
          }
        ],
        implications: [
          'Focus on core functionality first',
          'Consider deferring nice-to-have features',
          'Prioritize testing critical paths'
        ]
      };
    }

    if (currentState.phase === 'testing' && context.collaborationLevel === 'team') {
      return {
        id: 'workflow_team_testing',
        type: 'workflow_state',
        description: 'Team testing phase - coordinate test coverage',
        confidence: 0.75,
        evidence: [
          {
            source: 'workflow_analysis',
            data: { phase: 'testing', collaboration: 'team' },
            weight: 0.8,
            timestamp: Date.now()
          }
        ],
        implications: [
          'Coordinate with team to avoid duplicate testing',
          'Consider parallel testing strategies',
          'Share test results and coverage reports'
        ]
      };
    }

    return null;
  }

  private calculateWorkflowConfidence(transition: any, suggestions: AgentSuggestion[]): number {
    let confidence = transition.confidence; // Base confidence from workflow detection

    // Boost based on suggestion quality
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence > 0.8);
    confidence += highConfidenceSuggestions.length * 0.05;

    // Boost based on workflow state clarity
    if (transition.toState.confidence > 0.8) confidence += 0.1;

    // Adjust based on context quality
    if (this.hasGoodContext(this.createWorkflowContext('', {}))) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private hasGoodContext(context: WorkflowContext): boolean {
    return context.currentIntent !== 'unknown' && 
           context.domain !== 'general' && 
           context.timeContext.sessionDuration > 5;
  }

  private inferIntentFromInput(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('plan') || inputLower.includes('design')) return 'plan';
    if (inputLower.includes('implement') || inputLower.includes('code') || inputLower.includes('build')) return 'implement';
    if (inputLower.includes('test') || inputLower.includes('verify')) return 'test';
    if (inputLower.includes('debug') || inputLower.includes('fix')) return 'debug';
    if (inputLower.includes('document') || inputLower.includes('explain')) return 'document';
    if (inputLower.includes('review') || inputLower.includes('check')) return 'review';
    if (inputLower.includes('deploy') || inputLower.includes('release')) return 'deploy';
    if (inputLower.includes('maintain') || inputLower.includes('monitor')) return 'maintain';
    
    return 'general';
  }

  private inferDomainFromInput(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('code') || inputLower.includes('function') || inputLower.includes('api')) return 'development';
    if (inputLower.includes('test') || inputLower.includes('bug')) return 'testing';
    if (inputLower.includes('document') || inputLower.includes('readme')) return 'documentation';
    if (inputLower.includes('deploy') || inputLower.includes('production')) return 'deployment';
    
    return 'general';
  }

  private inferUrgencyFromInput(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('urgent') || inputLower.includes('asap') || inputLower.includes('critical')) return 'critical';
    if (inputLower.includes('important') || inputLower.includes('priority')) return 'high';
    if (inputLower.includes('when possible') || inputLower.includes('eventually')) return 'low';
    
    return 'normal';
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getCurrentDayOfWeek(): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  private isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private getExpectedPhaseDuration(phase: string): number {
    // Expected durations in milliseconds
    const durations: Record<string, number> = {
      'planning': 30 * 60 * 1000,      // 30 minutes
      'implementation': 60 * 60 * 1000, // 60 minutes
      'testing': 20 * 60 * 1000,       // 20 minutes
      'debugging': 40 * 60 * 1000,     // 40 minutes
      'documentation': 25 * 60 * 1000, // 25 minutes
      'review': 15 * 60 * 1000,        // 15 minutes
      'deployment': 20 * 60 * 1000,    // 20 minutes
      'maintenance': 35 * 60 * 1000    // 35 minutes
    };
    
    return durations[phase] || 30 * 60 * 1000; // Default 30 minutes
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
      preferences: [],
      workflows: [],
      temporal: [],
      confidence: 0.75,
      totalInteractions: 10
    };
  }

  private generateReasoning(
    transition: any,
    suggestions: AgentSuggestion[],
    insights: AgentInsight[]
  ): string {
    const reasoningParts = [];

    reasoningParts.push(`Detected ${transition.toState.phase} workflow phase with ${(transition.confidence * 100).toFixed(0)}% confidence`);

    if (suggestions.length > 0) {
      reasoningParts.push(`Generated ${suggestions.length} workflow-based suggestions`);
    }

    if (insights.length > 0) {
      reasoningParts.push(`Identified ${insights.length} workflow insights`);
    }

    if (transition.trigger.indicators.length > 0) {
      reasoningParts.push(`Based on indicators: ${transition.trigger.indicators.slice(0, 3).join(', ')}`);
    }

    return reasoningParts.join(', ');
  }

  private createErrorAnalysis(processingTime: number, error: any): AgentAnalysis {
    return {
      agentId: this.id,
      confidence: 0,
      suggestions: [],
      insights: [],
      reasoning: `Workflow analysis failed: ${error.message}`,
      processingTime,
      metadata: {
        processingTime,
        dataSourcesUsed: [],
        confidenceFactors: [],
        limitations: [`Error: ${error.message}`]
      }
    };
  }

  private async generateWorkflowSuggestions(input: UserInput, workflowState: WorkflowState | null): Promise<AgentSuggestion[]> {
    const suggestions: AgentSuggestion[] = [];
    
    if (!workflowState) {
      // No workflow detected, suggest starting one
      suggestions.push({
        id: `workflow-start-${Date.now()}`,
        type: 'workflow_step',
        title: 'Start Workflow',
        description: 'Begin a structured workflow for this task',
        confidence: 0.6,
        priority: 'medium',
        reasoning: 'No active workflow detected, suggesting to start a structured approach',
        implementation: {
          steps: ['Define requirements', 'Plan approach', 'Begin implementation'],
          resources: ['Workflow templates', 'Best practices']
        },
        metadata: {
          workflowPhase: 'planning'
        }
      });
      return suggestions;
    }
    
    // Generate phase-specific suggestions
    const phaseActions = this.getPhaseSpecificActions(workflowState.phase);
    for (const action of phaseActions) {
      suggestions.push({
        id: `workflow-${workflowState.phase}-${Date.now()}`,
        type: 'workflow_step',
        title: action.title,
        description: action.description,
        confidence: action.confidence,
        priority: action.priority,
        reasoning: `Suggested for ${workflowState.phase} phase based on workflow patterns`,
        implementation: {
          steps: action.steps,
          resources: action.resources
        },
        metadata: {
          workflowPhase: workflowState.phase,
          sourcePattern: 'phase_specific'
        }
      });
    }
    
    // Generate transition suggestions
    if (workflowState.transitions && workflowState.transitions.length > 0) {
      const nextTransition = workflowState.transitions[0];
      suggestions.push({
        id: `workflow-transition-${Date.now()}`,
        type: 'workflow_step',
        title: `Transition to ${nextTransition.nextPhase}`,
        description: `Ready to move to ${nextTransition.nextPhase} phase`,
        confidence: nextTransition.confidence,
        priority: 'high',
        reasoning: `Workflow analysis suggests transitioning to ${nextTransition.nextPhase}`,
        implementation: {
          steps: [`Complete current ${workflowState.phase} tasks`, `Begin ${nextTransition.nextPhase} activities`],
          resources: [`${nextTransition.nextPhase} checklist`]
        },
        metadata: {
          workflowPhase: nextTransition.nextPhase,
          sourcePattern: 'transition'
        }
      });
    }
    
    return suggestions;
  }

  private calculateWorkflowConfidence(workflowState: WorkflowState | null, suggestions: AgentSuggestion[]): number {
    let confidence = 0.4; // Base confidence
    
    if (workflowState) {
      confidence += workflowState.confidence * 0.4;
      
      // Boost for clear phase detection
      if (workflowState.phase !== 'unknown') confidence += 0.1;
      
      // Boost for available transitions
      if (workflowState.transitions && workflowState.transitions.length > 0) confidence += 0.1;
    }
    
    // Boost based on suggestion quality
    if (suggestions.length > 0) {
      const avgSuggestionConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
      confidence = Math.max(confidence, avgSuggestionConfidence);
    }
    
    return Math.min(confidence, 1.0);
  }

  private getPhaseSpecificActions(phase: string): Array<{title: string, description: string, confidence: number, priority: 'high' | 'medium' | 'low', steps: string[], resources: string[]}> {
    const actions: Record<string, Array<{title: string, description: string, confidence: number, priority: 'high' | 'medium' | 'low', steps: string[], resources: string[]}>> = {
      'planning': [
        {
          title: 'Define Requirements',
          description: 'Clarify what needs to be accomplished',
          confidence: 0.8,
          priority: 'high',
          steps: ['List functional requirements', 'Identify constraints', 'Set success criteria'],
          resources: ['Requirements template', 'Stakeholder input']
        },
        {
          title: 'Create Implementation Plan',
          description: 'Break down the work into manageable steps',
          confidence: 0.75,
          priority: 'high',
          steps: ['Identify major components', 'Estimate effort', 'Plan timeline'],
          resources: ['Planning tools', 'Past project data']
        }
      ],
      'implementation': [
        {
          title: 'Write Core Logic',
          description: 'Implement the main functionality',
          confidence: 0.8,
          priority: 'high',
          steps: ['Set up development environment', 'Write main functions', 'Add error handling'],
          resources: ['Code templates', 'Best practices guide']
        },
        {
          title: 'Add Unit Tests',
          description: 'Create tests for the implemented code',
          confidence: 0.7,
          priority: 'medium',
          steps: ['Write test cases', 'Set up test framework', 'Run initial tests'],
          resources: ['Testing framework', 'Test examples']
        }
      ],
      'testing': [
        {
          title: 'Run Test Suite',
          description: 'Execute all tests and verify functionality',
          confidence: 0.85,
          priority: 'high',
          steps: ['Run unit tests', 'Execute integration tests', 'Check coverage'],
          resources: ['Test runner', 'Coverage tools']
        }
      ],
      'debugging': [
        {
          title: 'Identify Root Cause',
          description: 'Find the source of the issue',
          confidence: 0.7,
          priority: 'high',
          steps: ['Reproduce the issue', 'Add logging', 'Trace execution'],
          resources: ['Debugging tools', 'Log analysis']
        }
      ]
    };
    
    return actions[phase] || [];
  }

  private createFallbackAnalysis(processingTime: number): AgentAnalysis {
    return {
      agentId: this.id,
      agentName: this.name,
      processingTime,
      confidence: 0.3,
      suggestions: [{
        id: `workflow-fallback-${Date.now()}`,
        type: 'workflow_step',
        title: 'Workflow Analysis Unavailable',
        description: 'Unable to determine workflow state for this analysis',
        confidence: 0.3,
        priority: 'low',
        reasoning: 'Workflow system encountered an error during analysis',
        metadata: {
          sourcePattern: 'fallback',
          workflowPhase: 'unknown'
        }
      }],
      metadata: {
        workflowState: {
          currentPhase: 'unknown',
          nextPhases: [],
          completionProgress: 0
        },
        workflowTransitions: [],
        phaseConfidence: 0
      }
    };
  }
}
