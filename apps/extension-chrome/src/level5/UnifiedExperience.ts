/**
 * Unified Level 5 Experience
 * Integrates multi-agent orchestration into Chrome extension for seamless user experience
 * Provides unified intelligence that combines all Level 5 capabilities
 */

import { 
  MultiAgentOrchestrator,
  OrchestratedResponse,
  UserFeedback,
  OrchestrationConfig,
  createMultiAgentOrchestrator,
  createOrchestrationConfig
} from '@promptlint/level5-orchestration';

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
    const orchestrationConfig = createOrchestrationConfig({
      enableParallelProcessing: true,
      consensusThreshold: 0.7,
      conflictResolutionStrategy: 'hybrid_approach',
      maxProcessingTime: this.config.maxResponseTime,
      enableTransparency: this.config.enableTransparency
    });

    this.orchestrator = createMultiAgentOrchestrator(orchestrationConfig);

    // Initialize supporting components
    this.memoryIntegration = new ChromeMemoryIntegration({
      enableAutoCapture: true,
      debugMode: this.config.debugMode
    });

    this.workflowAssistant = new WorkflowAssistant({
      enableProactiveSuggestions: true,
      suggestionFrequency: 'normal',
      confidenceThreshold: 0.75,
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
      this.responseHistory.set(orchestratedResponse.id, orchestratedResponse);

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
  recordUserFeedback(responseId: string, feedback: Partial<UserFeedback>): void {
    const response = this.responseHistory.get(responseId);
    if (!response) {
      console.warn(`[UnifiedExperience] Response ${responseId} not found for feedback`);
      return;
    }

    const completeFeedback: UserFeedback = {
      responseId,
      rating: feedback.rating || 3,
      accepted: feedback.accepted || false,
      helpful: feedback.helpful || false,
      reasoning: feedback.reasoning,
      timestamp: Date.now()
    };

    // Record feedback in orchestrator
    this.orchestrator.recordUserFeedback(completeFeedback);

    if (this.config.debugMode) {
      console.log(`[UnifiedExperience] Recorded feedback for ${responseId}: ${completeFeedback.rating}/5`);
    }
  }

  /**
   * Get transparency information for a specific response
   */
  getTransparencyInfo(responseId: string): TransparencyDisplay | null {
    const transparency = this.orchestrator.getTransparencyInfo(responseId);
    if (!transparency) return null;

    return {
      agentContributions: transparency.agentContributions.map(contrib => ({
        agentName: this.getAgentDisplayName(contrib.agentId),
        contribution: contrib.contribution,
        confidence: contrib.confidence,
        used: contrib.used
      })),
      decisionProcess: transparency.decisionProcess.map(step => step.description),
      confidenceBreakdown: {
        baseConfidence: transparency.confidenceBreakdown.baseConfidence,
        consensusBoost: transparency.confidenceBreakdown.consensusBoost,
        finalConfidence: transparency.confidenceBreakdown.finalConfidence,
        explanation: this.generateConfidenceExplanation(transparency.confidenceBreakdown)
      },
      alternativeReasons: transparency.alternativeReasons
    };
  }

  /**
   * Get orchestration performance metrics
   */
  getPerformanceMetrics(): any {
    return this.orchestrator.getMetrics();
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
      if (this.config.showAlternatives && response.alternatives.length > 0) {
        await this.displayAlternativeSuggestions(response.alternatives);
      }

      // Display transparency information if enabled
      if (this.config.enableTransparency) {
        await this.displayTransparencyInfo(response);
      }

      // Show proactive workflow suggestions if relevant
      if (response.insights.some(insight => insight.type === 'workflow_state')) {
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
    const workflowInsights = response.insights.filter(insight => insight.type === 'workflow_state');
    
    if (workflowInsights.length > 0) {
      // Use workflow assistant to show proactive suggestions
      // This would integrate with the WorkflowAssistant component
      console.log('[UnifiedExperience] Workflow suggestions available:', workflowInsights);
    }
  }

  private createUnifiedResult(response: OrchestratedResponse, processingTime: number): UnifiedAssistanceResult {
    return {
      primarySuggestion: response.primarySuggestion.content,
      alternatives: response.alternatives.map(alt => alt.content),
      confidence: response.confidence,
      reasoning: response.reasoning,
      transparency: this.config.enableTransparency ? this.getTransparencyInfo(response.id) : undefined,
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
    
    if (breakdown.baseConfidence > 0) {
      parts.push(`Base: ${(breakdown.baseConfidence * 100).toFixed(0)}%`);
    }
    
    if (breakdown.consensusBoost > 0) {
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
}

// Factory function
export function createUnifiedLevel5Experience(config?: Partial<UnifiedExperienceConfig>): UnifiedLevel5Experience {
  return new UnifiedLevel5Experience(config);
}
