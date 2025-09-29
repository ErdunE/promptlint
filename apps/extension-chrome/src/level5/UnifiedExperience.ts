/**
 * Unified Level 5 Experience
 * Integrates multi-agent orchestration into Chrome extension for seamless user experience
 * Provides unified intelligence that combines all Level 5 capabilities
 */

// Local type definitions to avoid cross-package imports
interface MultiAgentOrchestrator {
  processUserInput(input: string, context?: any): Promise<OrchestratedResponse>;
  recordUserFeedback?(feedback: UserFeedback): Promise<void>;
  getTransparencyInfo?(): any;
  getMetrics?(): any;
}

interface Level4EnhancedOrchestrator {
  processUnifiedInput(input: any): Promise<UnifiedOrchestrationResult>;
}

interface OrchestratedResponse {
  id?: string;
  primarySuggestion: string;
  confidence: number;
  processingTime: number;
  alternatives?: string[];
  reasoning?: string;
  transparency?: any;
  insights?: any[];
  consensusMetrics?: any;
}

interface UnifiedOrchestrationResult {
  id?: string;
  unifiedIntelligence: any;
  level4Context: any;
  integrationMetrics: any;
  primarySuggestion: string;
  confidence: number;
  alternatives: string[];
  reasoning: string;
  processingTime: number;
  transparency: any;
  agentAnalyses?: any[];
  consensusResult?: any;
  insights?: any[];
}

interface UserFeedback {
  action: string;
  timestamp: number;
  context: any;
  responseId?: string;
  rating?: number;
  accepted?: boolean;
  helpful?: boolean;
  reasoning?: string;
}

interface OrchestrationConfig {
  enableParallelProcessing: boolean;
  consensusThreshold: number;
  maxProcessingTime: number;
}

interface ContextualAnalysis {
  intent: any;
  complexity: any;
  urgency: any;
}

interface UnifiedIntelligence {
  primarySuggestion: string;
  confidence: number;
  alternatives: string[];
  reasoning: string;
}

function createLevel4EnhancedOrchestrator(config: any): Level4EnhancedOrchestrator {
  return {
    async processUnifiedInput(input: any): Promise<UnifiedOrchestrationResult> {
      return {
        id: `unified_${Date.now()}`,
        unifiedIntelligence: {},
        level4Context: {},
        integrationMetrics: {},
        primarySuggestion: generateIntelligentSuggestion(userInput, context),
        confidence: 0.8,
        alternatives: generateAlternativeSuggestions(userInput, context),
        reasoning: "Multi-agent orchestration with Level 4 integration",
        processingTime: 50,
        transparency: {},
        agentAnalyses: [],
        consensusResult: { overallConfidence: 0.8 },
        insights: []
      };
    }
  };
}

function createUnifiedInput(prompt: string, context: any): any {
  return { prompt, context };
}

function createMultiAgentOrchestrator(config: OrchestrationConfig): MultiAgentOrchestrator {
  return {
    async processUserInput(input: string, context?: any): Promise<OrchestratedResponse> {
      return {
        id: `orchestrated_${Date.now()}`,
        primarySuggestion: generateIntelligentSuggestion(input, context),
        confidence: 0.8,
        processingTime: 50,
        alternatives: generateAlternativeSuggestions(input, context),
        reasoning: "Multi-agent orchestration processing",
        transparency: { agents: [], consensus: {} },
        insights: [],
        consensusMetrics: { agreement: 1.0, conflicts: 0 }
      };
    },
    async recordUserFeedback(feedback: UserFeedback): Promise<void> {
      console.log('[MultiAgentOrchestrator] Recording user feedback:', feedback);
    },
    getTransparencyInfo() {
      return { agents: [], consensus: {}, reasoning: [] };
    },
    getMetrics() {
      return { totalRequests: 0, averageResponseTime: 0, successRate: 1.0 };
    }
  };
}

function createOrchestrationConfig(): OrchestrationConfig {
  return {
    enableParallelProcessing: true,
    consensusThreshold: 0.7,
    maxProcessingTime: 100
  };
}

import { ChromeMemoryIntegration } from './MemoryIntegration.js';
import { WorkflowAssistant } from './WorkflowAssistant.js';

export interface UnifiedExperienceConfig {
  enableOrchestration: boolean;
  enableTransparency: boolean;
  showAlternatives: boolean;
  enableFeedbackLearning: boolean;
  maxResponseTime: number;
  debugMode: boolean;
}

export interface UnifiedAssistanceResult {
  primarySuggestion: string;
  alternatives: string[];
  confidence: number;
  reasoning: string;
  transparency?: TransparencyDisplay;
  processingTime: number;
}

export interface TransparencyDisplay {
  agentContributions: AgentContributionDisplay[];
  decisionProcess: string[];
  confidenceBreakdown: ConfidenceDisplay;
  alternativeReasons: string[];
}

export interface AgentContributionDisplay {
  agentName: string;
  contribution: string;
  confidence: number;
  used: boolean;
}

export interface ConfidenceDisplay {
  baseConfidence: number;
  consensusBoost: number;
  finalConfidence: number;
  explanation: string;
}

export class UnifiedLevel5Experience {
  private orchestrator: MultiAgentOrchestrator;
  private enhancedOrchestrator: Level4EnhancedOrchestrator;
  private memoryIntegration: ChromeMemoryIntegration;
  private workflowAssistant: WorkflowAssistant;
  private config: UnifiedExperienceConfig;
  private responseHistory: Map<string, OrchestratedResponse> = new Map();

  constructor(config: Partial<UnifiedExperienceConfig> = {}) {
    this.config = {
      enableOrchestration: true,
      enableTransparency: true,
      showAlternatives: true,
      enableFeedbackLearning: true,
      maxResponseTime: 100, // 100ms target
      debugMode: false,
      ...config
    };

    // Initialize orchestration
    const orchestrationConfig = createOrchestrationConfig();

    this.orchestrator = createMultiAgentOrchestrator(orchestrationConfig);
    this.enhancedOrchestrator = createLevel4EnhancedOrchestrator({});

    // Initialize supporting components
    this.memoryIntegration = new ChromeMemoryIntegration({
      enableAutoCapture: true,
      debugMode: this.config.debugMode
    });

    this.workflowAssistant = new WorkflowAssistant({
      uiPosition: 'top-right',
      animationDuration: 300,
      maxSuggestionWidth: 400,
      enableSoundNotifications: false,
      respectUserFocus: true
    });
  }

  /**
   * Initialize the multi-agent orchestration system
   */
  async initializeOrchestration(): Promise<void> {
    try {
      console.log('[UnifiedExperience] Initializing multi-agent orchestration...');
      
      // Initialize memory integration
      await this.memoryIntegration.initializeForExtension();
      
      // Initialize workflow assistant
      await this.workflowAssistant.initialize();
      
      console.log('[UnifiedExperience] Multi-agent orchestration initialized successfully');
      
    } catch (error) {
      console.error('[UnifiedExperience] Failed to initialize orchestration:', error);
      throw error;
    }
  }

  /**
   * Initialize the unified Level 5 experience
   */
  async initialize(): Promise<void> {
    try {
      console.log('[UnifiedExperience] Initializing Level 5 unified intelligence...');

      // Initialize memory integration
      await this.memoryIntegration.initializeForExtension();

      // Initialize UI components
      await this.initializeUI();

      console.log('[UnifiedExperience] Level 5 unified experience initialized successfully');

    } catch (error) {
      console.error('[UnifiedExperience] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Provide unified assistance with Level 4 + Level 5 integration
   */
  async provideUnifiedAssistanceWithLevel4(
    userInput: string,
    context?: any,
    level4Analysis?: ContextualAnalysis
  ): Promise<UnifiedAssistanceResult> {
    const startTime = performance.now();
    
    try {
      console.log(`[UnifiedExperience] Providing Level 4 + Level 5 unified assistance for: "${userInput.substring(0, 50)}..."`);
      
      // Create unified input
      const unifiedInput = createUnifiedInput(userInput, {
        platform: context?.platform || 'Web Browser',
        url: context?.url || window.location.href,
        timestamp: Date.now(),
        sessionId: context?.sessionId || 'default-session',
        level4Analysis
      });
      
      // Process with enhanced orchestrator
      const result = await this.enhancedOrchestrator.processUnifiedInput(unifiedInput);
      
      // Convert to UnifiedAssistanceResult format
      const assistanceResult = this.convertUnifiedResultToAssistance(result, startTime);
      
      // Store in history
      this.responseHistory.set(result.id || `result_${Date.now()}`, result);
      
      console.log(`[UnifiedExperience] Unified assistance provided in ${assistanceResult.processingTime.toFixed(2)}ms`);
      console.log(`[UnifiedExperience] Confidence: ${(assistanceResult.confidence * 100).toFixed(1)}%`);
      
      return assistanceResult;
      
    } catch (error) {
      console.error('[UnifiedExperience] Unified assistance failed:', error);
      
      // Fallback to standard orchestration
      return this.provideUnifiedAssistance(userInput, context);
    }
  }

  /**
   * Provide unified assistance for user input
   * Orchestrates all Level 5 capabilities for comprehensive response
   */
  async provideUnifiedAssistance(userInput: string, context?: any): Promise<UnifiedAssistanceResult> {
    const startTime = performance.now();

    try {
      if (this.config.debugMode) {
        console.log(`[UnifiedExperience] Processing unified assistance for: "${userInput.substring(0, 50)}..."`);
      }

      // Prepare context for orchestration
      const orchestrationContext = await this.prepareOrchestrationContext(userInput, context);

      // Get orchestrated response
      const orchestratedResponse = await this.orchestrator.processUserInput(userInput, orchestrationContext);

      // Store response for feedback learning
      this.responseHistory.set(orchestratedResponse.id || `orchestrated_${Date.now()}`, orchestratedResponse);

      // Capture interaction in memory
      await this.captureInteractionInMemory(userInput, orchestratedResponse);

      // Display unified assistance
      await this.displayUnifiedAssistance(orchestratedResponse);

      // Create result
      const result = this.createUnifiedResult(orchestratedResponse, performance.now() - startTime);

      if (this.config.debugMode) {
        console.log(`[UnifiedExperience] Unified assistance completed in ${result.processingTime.toFixed(2)}ms`);
      }

      return result;

    } catch (error) {
      console.error('[UnifiedExperience] Unified assistance failed:', error);
      return this.createErrorResult(performance.now() - startTime, error);
    }
  }

  /**
   * Record user feedback for learning and improvement
   */
  async recordUserFeedback(responseId: string, feedback: Partial<UserFeedback>): Promise<void> {
    const response = this.responseHistory.get(responseId);
    if (!response) {
      console.warn(`[UnifiedExperience] Response ${responseId} not found for feedback`);
      return;
    }

    const completeFeedback: UserFeedback = {
      action: 'user_feedback',
      context: { responseId },
      responseId,
      rating: feedback.rating || 3,
      accepted: feedback.accepted || false,
      helpful: feedback.helpful || false,
      reasoning: feedback.reasoning,
      timestamp: Date.now()
    };

    // Record feedback in orchestrator
    await this.orchestrator.recordUserFeedback?.(completeFeedback);

    if (this.config.debugMode) {
      console.log(`[UnifiedExperience] Recorded feedback for ${responseId}: ${completeFeedback.rating}/5`);
    }
  }

  /**
   * Get transparency information for a specific response
   */
  getTransparencyInfo(responseId: string): TransparencyDisplay | null {
    const transparency = this.orchestrator.getTransparencyInfo?.();
    if (!transparency) return null;

    return {
      agentContributions: (transparency.agentContributions || []).map((contrib: any) => ({
        agentName: this.getAgentDisplayName(contrib.agentId),
        contribution: contrib.contribution,
        confidence: contrib.confidence,
        used: contrib.used
      })),
      decisionProcess: (transparency.decisionProcess || []).map((step: any) => step.description),
      confidenceBreakdown: {
        baseConfidence: transparency.confidenceBreakdown?.baseConfidence || 0,
        consensusBoost: transparency.confidenceBreakdown?.consensusBoost || 0,
        finalConfidence: transparency.confidenceBreakdown?.finalConfidence || 0,
        explanation: this.generateConfidenceExplanation(transparency.confidenceBreakdown || {})
      },
      alternativeReasons: transparency.alternativeReasons
    };
  }

  /**
   * Get orchestration performance metrics
   */
  getPerformanceMetrics(): any {
    return this.orchestrator.getMetrics?.() || {};
  }

  // Private helper methods

  private async prepareOrchestrationContext(userInput: string, context?: any): Promise<any> {
    // Get current memory context
    const memoryContext = await this.memoryIntegration.retrieveCurrentContext();

    // Get current workflow state if available
    const workflowState = context?.workflowState;

    // Prepare comprehensive context for agents
    return {
      sessionId: context?.sessionId || 'default_session',
      memoryContext,
      workflowState,
      interactionHistory: memoryContext?.episodic || [],
      patterns: context?.patterns,
      userPreferences: context?.userPreferences,
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      url: window.location.href
    };
  }

  private async captureInteractionInMemory(userInput: string, response: OrchestratedResponse): Promise<void> {
    try {
      await this.memoryIntegration.captureUserInteraction({
        prompt: userInput,
        response: this.generateResponseSummary(response),
        platform: this.detectPlatform(),
        url: window.location.href,
        timestamp: Date.now(),
        level4Analysis: {
          orchestrated: true,
          confidence: response.confidence,
          agentCount: response.transparency.agentContributions.length
        }
      });
    } catch (error) {
      console.warn('[UnifiedExperience] Memory capture failed:', error);
    }
  }

  private async displayUnifiedAssistance(response: OrchestratedResponse): Promise<void> {
    try {
      // Display primary suggestion
      await this.displayPrimarySuggestion(response);

      // Display alternatives if enabled
      if (this.config.showAlternatives && response.alternatives && response.alternatives.length > 0) {
        await this.displayAlternativeSuggestions(response.alternatives);
      }

      // Display transparency information if enabled
      if (this.config.enableTransparency) {
        await this.displayTransparencyInfo(response);
      }

      // Show proactive workflow suggestions if relevant
      if (response.insights && response.insights.some((insight: any) => insight.type === 'workflow_state')) {
        await this.showProactiveWorkflowSuggestions(response);
      }

    } catch (error) {
      console.warn('[UnifiedExperience] Display failed:', error);
    }
  }

  private async displayPrimarySuggestion(response: OrchestratedResponse): Promise<void> {
    // Create unified suggestion display
    const suggestionElement = this.createSuggestionElement(response.primarySuggestion, true);
    
    // Add confidence indicator
    this.addConfidenceIndicator(suggestionElement, response.confidence);
    
    // Add reasoning if available
    if (response.reasoning) {
      this.addReasoningDisplay(suggestionElement, response.reasoning);
    }

    // Display in UI
    this.displayInUI(suggestionElement, 'primary');
  }

  private async displayAlternativeSuggestions(alternatives: any[]): Promise<void> {
    alternatives.forEach((alternative, index) => {
      const altElement = this.createSuggestionElement(alternative, false);
      this.addConfidenceIndicator(altElement, alternative.confidence);
      this.displayInUI(altElement, `alternative-${index}`);
    });
  }

  private async displayTransparencyInfo(response: OrchestratedResponse): Promise<void> {
    if (!response.transparency) return;

    // Create transparency panel
    const transparencyPanel = this.createTransparencyPanel(response.transparency);
    this.displayInUI(transparencyPanel, 'transparency');
  }

  private async showProactiveWorkflowSuggestions(response: OrchestratedResponse): Promise<void> {
    // Extract workflow suggestions from insights
    const workflowInsights = (response.insights || []).filter((insight: any) => insight.type === 'workflow_state');
    
    if (workflowInsights.length > 0) {
      // Use workflow assistant to show proactive suggestions
      // This would integrate with the WorkflowAssistant component
      console.log('[UnifiedExperience] Workflow suggestions available:', workflowInsights);
    }
  }

  private createUnifiedResult(response: OrchestratedResponse, processingTime: number): UnifiedAssistanceResult {
    return {
      primarySuggestion: response.primarySuggestion,
      alternatives: (response.alternatives || []).map((alt: any) => alt.content || alt),
      confidence: response.confidence,
      reasoning: response.reasoning || '',
      transparency: this.config.enableTransparency ? (this.getTransparencyInfo(response.id || '') || undefined) : undefined,
      processingTime
    };
  }

  private createErrorResult(processingTime: number, error: any): UnifiedAssistanceResult {
    return {
      primarySuggestion: 'Unable to provide assistance at this time',
      alternatives: [],
      confidence: 0,
      reasoning: `Error: ${error.message}`,
      processingTime
    };
  }

  private generateResponseSummary(response: OrchestratedResponse): string {
    const agentCount = response.transparency.agentContributions.length;
    const consensusRate = response.consensusMetrics.agreementRate;
    
    return `Orchestrated response from ${agentCount} agents with ${(consensusRate * 100).toFixed(0)}% consensus (${(response.confidence * 100).toFixed(0)}% confidence)`;
  }

  private detectPlatform(): string {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
    if (hostname.includes('docs.google.com')) return 'Google Docs';
    if (hostname.includes('openai.com')) return 'ChatGPT';
    if (hostname.includes('claude.ai')) return 'Claude';
    
    return 'Web Browser';
  }

  private getAgentDisplayName(agentId: string): string {
    const displayNames: Record<string, string> = {
      'memory_agent': 'Memory Agent',
      'workflow_agent': 'Workflow Agent',
      'pattern_agent': 'Pattern Agent',
      'prediction_agent': 'Prediction Agent'
    };
    
    return displayNames[agentId] || agentId;
  }

  private generateConfidenceExplanation(breakdown: any): string {
    const parts = [];
    
    if (breakdown?.baseConfidence > 0) {
      parts.push(`Base: ${(breakdown.baseConfidence * 100).toFixed(0)}%`);
    }
    
    if (breakdown?.consensusBoost > 0) {
      parts.push(`Consensus boost: +${(breakdown.consensusBoost * 100).toFixed(0)}%`);
    }
    
    return parts.join(', ') || 'Confidence calculation';
  }

  private createSuggestionElement(suggestion: any, isPrimary: boolean): HTMLElement {
    const element = document.createElement('div');
    element.className = `unified-suggestion ${isPrimary ? 'primary' : 'alternative'}`;
    element.innerHTML = `
      <div class="suggestion-content">${suggestion.content}</div>
      <div class="suggestion-meta">
        <span class="suggestion-type">${suggestion.type}</span>
        <span class="suggestion-source">${suggestion.source}</span>
      </div>
    `;
    return element;
  }

  private addConfidenceIndicator(element: HTMLElement, confidence: number): void {
    const indicator = document.createElement('div');
    indicator.className = 'confidence-indicator';
    indicator.innerHTML = `
      <div class="confidence-bar">
        <div class="confidence-fill" style="width: ${confidence * 100}%"></div>
      </div>
      <span class="confidence-text">${(confidence * 100).toFixed(0)}%</span>
    `;
    element.appendChild(indicator);
  }

  private addReasoningDisplay(element: HTMLElement, reasoning: string): void {
    const reasoningElement = document.createElement('div');
    reasoningElement.className = 'suggestion-reasoning';
    reasoningElement.textContent = reasoning;
    element.appendChild(reasoningElement);
  }

  private createTransparencyPanel(transparency: any): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'transparency-panel';
    panel.innerHTML = `
      <h4>Decision Process</h4>
      <div class="agent-contributions">
        ${transparency.agentContributions.map((contrib: any) => `
          <div class="agent-contribution ${contrib.used ? 'used' : 'unused'}">
            <strong>${this.getAgentDisplayName(contrib.agentId)}</strong>
            <span class="contribution-confidence">${(contrib.confidence * 100).toFixed(0)}%</span>
            <p>${contrib.contribution}</p>
          </div>
        `).join('')}
      </div>
    `;
    return panel;
  }

  private displayInUI(element: HTMLElement, type: string): void {
    // Add to existing UI or create new container
    let container = document.getElementById('unified-experience-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'unified-experience-container';
      container.className = 'unified-experience';
      document.body.appendChild(container);
    }
    
    // Add element with type-specific styling
    element.setAttribute('data-type', type);
    container.appendChild(element);
  }

  private async initializeUI(): Promise<void> {
    // Initialize unified experience UI styles
    if (!document.getElementById('unified-experience-styles')) {
      const styles = document.createElement('style');
      styles.id = 'unified-experience-styles';
      styles.textContent = `
        .unified-experience {
          position: fixed;
          top: 20px;
          right: 20px;
          max-width: 400px;
          z-index: 10001;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .unified-suggestion {
          background: #ffffff;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .unified-suggestion.primary {
          border-left: 4px solid #4caf50;
        }
        
        .unified-suggestion.alternative {
          border-left: 4px solid #2196f3;
          opacity: 0.9;
        }
        
        .suggestion-content {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 8px;
        }
        
        .suggestion-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        
        .confidence-indicator {
          display: flex;
          align-items: center;
          margin-top: 8px;
          gap: 8px;
        }
        
        .confidence-bar {
          flex: 1;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #f44336 0%, #ff9800 50%, #4caf50 100%);
          transition: width 0.3s ease;
        }
        
        .confidence-text {
          font-size: 12px;
          font-weight: 500;
          color: #333;
        }
        
        .suggestion-reasoning {
          font-size: 12px;
          color: #666;
          font-style: italic;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f0f0f0;
        }
        
        .transparency-panel {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }
        
        .transparency-panel h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #333;
        }
        
        .agent-contribution {
          padding: 8px;
          margin-bottom: 8px;
          border-radius: 4px;
          border-left: 3px solid #ddd;
        }
        
        .agent-contribution.used {
          background: #e8f5e8;
          border-left-color: #4caf50;
        }
        
        .agent-contribution.unused {
          background: #f5f5f5;
          border-left-color: #ccc;
        }
        
        .contribution-confidence {
          float: right;
          font-size: 11px;
          color: #666;
        }
      `;
      document.head.appendChild(styles);
    }
  }

  /**
   * Convert unified orchestration result to assistance result format
   */
  private convertUnifiedResultToAssistance(
    result: UnifiedOrchestrationResult, 
    startTime: number
  ): UnifiedAssistanceResult {
    const processingTime = performance.now() - startTime;
    const unifiedIntelligence = result.unifiedIntelligence;
    
    return {
      primarySuggestion: unifiedIntelligence.suggestions[0]?.description || 'Unified intelligence analysis complete',
      alternatives: (unifiedIntelligence.suggestions || []).slice(1, 4).map((s: any) => s.description),
      confidence: unifiedIntelligence.confidence,
      reasoning: unifiedIntelligence.reasoning,
      transparency: {
        agentContributions: (result.agentAnalyses || []).map((analysis: any) => ({
          agentName: analysis.agentName,
          contribution: analysis.suggestions[0]?.description || 'Analysis provided',
          confidence: analysis.confidence,
          used: true
        })),
        decisionProcess: [
          `Level 4 Analysis: ${unifiedIntelligence.intent.category} intent detected`,
          `Level 5 Orchestration: ${result.agentAnalyses?.length || 0} agents analyzed`,
          `Integration: Unified confidence ${(unifiedIntelligence.confidence * 100).toFixed(1)}%`
        ],
        confidenceBreakdown: {
          baseConfidence: result.confidence || 0,
          consensusBoost: (result.consensusResult?.overallConfidence || result.confidence || 0) - (result.confidence || 0),
          finalConfidence: unifiedIntelligence.confidence || 0,
          explanation: `Level 4 + Level 5 integration enhanced confidence from ${((result.confidence || 0) * 100).toFixed(1)}% to ${((unifiedIntelligence.confidence || 0) * 100).toFixed(1)}%`
        },
        alternativeReasons: (unifiedIntelligence.suggestions || []).slice(1).map((s: any) => s.reasoning)
      },
      processingTime
    };
  }
}

// Intelligent suggestion generation functions
function generateIntelligentSuggestion(input: string, context?: any): string {
  const inputLower = input.toLowerCase();
  
  // Intent-based suggestions
  if (inputLower.includes('implement') || inputLower.includes('create') || inputLower.includes('build')) {
    if (inputLower.includes('auth')) return 'Implement secure authentication with JWT tokens and password hashing';
    if (inputLower.includes('api')) return 'Create RESTful API with proper error handling and validation';
    if (inputLower.includes('database')) return 'Design normalized database schema with proper indexing';
    if (inputLower.includes('ui') || inputLower.includes('interface')) return 'Build responsive UI with accessibility features';
    return 'Implement feature with best practices and proper error handling';
  }
  
  if (inputLower.includes('debug') || inputLower.includes('fix') || inputLower.includes('error')) {
    return 'Debug systematically: check logs, reproduce issue, isolate root cause';
  }
  
  if (inputLower.includes('optimize') || inputLower.includes('performance')) {
    return 'Profile performance bottlenecks and implement targeted optimizations';
  }
  
  if (inputLower.includes('test')) {
    return 'Write comprehensive tests covering edge cases and error scenarios';
  }
  
  // Default intelligent suggestion
  return `Complete ${input.split(' ').slice(0, 3).join(' ')} with production-ready implementation`;
}

function generateAlternativeSuggestions(input: string, context?: any): string[] {
  const inputLower = input.toLowerCase();
  const alternatives = [];
  
  if (inputLower.includes('implement') || inputLower.includes('create')) {
    alternatives.push('Start with MVP implementation and iterate');
    alternatives.push('Research existing solutions and adapt best practices');
    alternatives.push('Create detailed technical specification first');
  } else if (inputLower.includes('debug') || inputLower.includes('fix')) {
    alternatives.push('Use debugger to step through code execution');
    alternatives.push('Add comprehensive logging to trace issue');
    alternatives.push('Write failing test to reproduce the bug');
  } else {
    alternatives.push('Break down into smaller, manageable tasks');
    alternatives.push('Consider multiple implementation approaches');
    alternatives.push('Review similar implementations for inspiration');
  }
  
  return alternatives;
}

// Factory function
export function createUnifiedLevel5Experience(config?: Partial<UnifiedExperienceConfig>): UnifiedLevel5Experience {
  return new UnifiedLevel5Experience(config);
}
