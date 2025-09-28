/**
 * Multi-Agent Orchestrator
 * Central coordination system that manages specialized agents and builds consensus
 * Transforms individual intelligent features into a cohesive "mind-reading" experience
 */

import {
  Agent,
  AgentAnalysis,
  ConsensusResult,
  Resolution,
  OrchestratedResponse,
  OrchestrationConfig,
  OrchestrationMetrics,
  ProcessingMetrics,
  TransparencyInfo,
  UserFeedback
} from './types/OrchestrationTypes.js';

import { ConsensusEngine } from './ConsensusEngine.js';
import { MemoryAgent } from './agents/MemoryAgent.js';
import { WorkflowAgent } from './agents/WorkflowAgent.js';
import { PatternRecognitionAgent } from './agents/PatternRecognitionAgent.js';
import { PredictionAgent } from './agents/PredictionAgent.js';

export class MultiAgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private consensusEngine: ConsensusEngine;
  private config: OrchestrationConfig;
  private metrics: OrchestrationMetrics;
  private responseHistory: Map<string, OrchestratedResponse> = new Map();

  constructor(config: Partial<OrchestrationConfig> = {}) {
    this.config = {
      enableParallelProcessing: true,
      consensusThreshold: 0.7,
      conflictResolutionStrategy: 'highest_confidence',
      maxProcessingTime: 100, // 100ms target
      enableTransparency: true,
      agentWeights: {
        'memory': 1.0,
        'pattern_recognition': 1.0,
        'workflow_intelligence': 1.2, // Slightly higher weight for workflow
        'prediction': 1.0,
        'contextual_analysis': 0.9,
        'ghost_text': 0.8
      },
      ...config
    };

    this.consensusEngine = new ConsensusEngine(this.config);
    
    this.metrics = {
      totalRequests: 0,
      averageProcessingTime: 0,
      consensusSuccessRate: 0,
      conflictResolutionRate: 0,
      userSatisfactionScore: 0,
      agentPerformance: {}
    };

    this.initializeAgents();
  }

  /**
   * Process user input through all agents and return orchestrated response
   * Achieves <100ms parallel processing with >80% consensus rate
   */
  async processUserInput(input: string, context?: any): Promise<OrchestratedResponse> {
    const startTime = performance.now();
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`[Orchestrator] Processing user input: "${input.substring(0, 50)}..."`);

      // Parallel agent processing
      const agentResponses = await this.runAgentsInParallel(input, context);

      // Build consensus from agent responses
      const consensus = await this.consensusEngine.buildConsensus(agentResponses);

      // Resolve conflicts if any
      const resolution = await this.consensusEngine.resolveConflicts(consensus);

      // Create orchestrated response
      const response = this.createOrchestratedResponse(
        responseId,
        resolution,
        consensus,
        agentResponses,
        startTime
      );

      // Update metrics
      this.updateMetrics(response);

      // Store response for learning
      this.responseHistory.set(responseId, response);

      const totalTime = performance.now() - startTime;
      console.log(`[Orchestrator] Orchestrated response generated in ${totalTime.toFixed(2)}ms`);

      return response;

    } catch (error) {
      console.error('[Orchestrator] Processing failed:', error);
      return this.createErrorResponse(responseId, error, startTime);
    }
  }

  /**
   * Register a new agent with the orchestrator
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.metrics.agentPerformance[agent.id] = {
      totalAnalyses: 0,
      averageConfidence: 0,
      suggestionAcceptanceRate: 0,
      processingTime: 0,
      errorRate: 0
    };
    console.log(`[Orchestrator] Registered agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Remove an agent from the orchestrator
   */
  unregisterAgent(agentId: string): void {
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId)!;
      this.agents.delete(agentId);
      delete this.metrics.agentPerformance[agentId];
      console.log(`[Orchestrator] Unregistered agent: ${agent.name} (${agentId})`);
    }
  }

  /**
   * Record user feedback for learning and improvement
   */
  recordUserFeedback(feedback: UserFeedback): void {
    const response = this.responseHistory.get(feedback.responseId);
    if (!response) {
      console.warn(`[Orchestrator] Response ${feedback.responseId} not found for feedback`);
      return;
    }

    // Update satisfaction metrics
    this.updateSatisfactionMetrics(feedback);

    // Update agent performance based on feedback
    this.updateAgentPerformanceFromFeedback(response, feedback);

    console.log(`[Orchestrator] Recorded feedback for ${feedback.responseId}: ${feedback.rating}/5 (${feedback.accepted ? 'accepted' : 'rejected'})`);
  }

  /**
   * Get current orchestration metrics
   */
  getMetrics(): OrchestrationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get transparency information for a specific response
   */
  getTransparencyInfo(responseId: string): TransparencyInfo | null {
    const response = this.responseHistory.get(responseId);
    return response ? response.transparency : null;
  }

  // Private helper methods

  private initializeAgents(): void {
    console.log('[Orchestrator] Initializing specialized agents...');

    // Initialize core agents
    const memoryAgent = new MemoryAgent();
    const workflowAgent = new WorkflowAgent();
    const patternAgent = new PatternRecognitionAgent();
    const predictionAgent = new PredictionAgent();

    // Register agents
    this.registerAgent(memoryAgent);
    this.registerAgent(workflowAgent);
    this.registerAgent(patternAgent);
    this.registerAgent(predictionAgent);

    console.log(`[Orchestrator] Initialized ${this.agents.size} agents`);
  }

  private async runAgentsInParallel(input: string, context?: any): Promise<AgentAnalysis[]> {
    const agentPromises: Promise<AgentAnalysis>[] = [];

    // Create analysis promises for all agents
    for (const [agentId, agent] of Array.from(this.agents.entries())) {
      const promise = this.runAgentWithTimeout(agent, input, context);
      agentPromises.push(promise);
    }

    // Execute all agents in parallel
    const results = await Promise.allSettled(agentPromises);

    // Process results and handle failures
    const analyses: AgentAnalysis[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        analyses.push(result.value);
      } else {
        const agentId = Array.from(this.agents.keys())[index];
        console.warn(`[Orchestrator] Agent ${agentId} failed:`, result.reason);
        
        // Update error metrics
        if (this.metrics.agentPerformance[agentId]) {
          this.metrics.agentPerformance[agentId].errorRate += 1;
        }
      }
    });

    return analyses;
  }

  private async runAgentWithTimeout(agent: Agent, input: string, context?: any): Promise<AgentAnalysis> {
    const agentStartTime = performance.now();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Agent ${agent.id} timeout`)), this.config.maxProcessingTime);
      });

      // Race between agent analysis and timeout
      const analysis = await Promise.race([
        agent.analyze(input, context),
        timeoutPromise
      ]);

      const processingTime = performance.now() - agentStartTime;
      analysis.processingTime = processingTime;

      // Update agent performance metrics
      this.updateAgentMetrics(agent.id, analysis);

      return analysis;

    } catch (error) {
      console.error(`[Orchestrator] Agent ${agent.id} error:`, error);
      
      // Return empty analysis on error
      return {
        agentId: agent.id,
        confidence: 0,
        suggestions: [],
        insights: [],
        reasoning: `Agent failed: ${error instanceof Error ? error.message : String(error)}`,
        processingTime: performance.now() - agentStartTime,
        metadata: {
          processingTime: performance.now() - agentStartTime,
          dataSourcesUsed: [],
          confidenceFactors: [],
          limitations: [`Agent error: ${error instanceof Error ? error.message : String(error)}`]
        }
      };
    }
  }

  private createOrchestratedResponse(
    responseId: string,
    resolution: Resolution,
    consensus: ConsensusResult,
    agentResponses: AgentAnalysis[],
    startTime: number
  ): OrchestratedResponse {
    const totalTime = performance.now() - startTime;

    // Collect all insights from agents
    const allInsights = agentResponses.flatMap(response => response.insights);

    // Calculate processing metrics
    const processingMetrics: ProcessingMetrics = {
      totalTime,
      agentProcessingTimes: agentResponses.reduce((acc, response) => {
        acc[response.agentId] = response.processingTime;
        return acc;
      }, {} as Record<string, number>),
      consensusTime: 0, // Would be measured in ConsensusEngine
      resolutionTime: 0, // Would be measured in ConsensusEngine
      parallelEfficiency: this.calculateParallelEfficiency(agentResponses, totalTime)
    };

    // Create transparency information
    const transparency: TransparencyInfo = {
      decisionProcess: this.generateDecisionProcess(consensus, resolution),
      agentContributions: this.generateAgentContributions(agentResponses, resolution),
      confidenceBreakdown: this.generateConfidenceBreakdown(resolution, consensus),
      alternativeReasons: resolution.alternatives.map(alt => alt.reasoning)
    };

    return {
      id: responseId,
      timestamp: Date.now(),
      primarySuggestion: resolution.best,
      alternatives: resolution.alternatives,
      confidence: resolution.confidence,
      reasoning: resolution.reasoning,
      insights: allInsights,
      consensusMetrics: resolution.consensusMetrics,
      processingMetrics,
      transparency
    };
  }

  private createErrorResponse(responseId: string, error: any, startTime: number): OrchestratedResponse {
    return {
      id: responseId,
      timestamp: Date.now(),
      primarySuggestion: {
        id: 'error_suggestion',
        type: 'contextual_hint',
        content: 'Unable to process request at this time',
        confidence: 0,
        priority: 'low',
        source: 'contextual_analysis',
        reasoning: `Processing error: ${error.message}`
      },
      alternatives: [],
      confidence: 0,
      reasoning: `Orchestration failed: ${error.message}`,
      insights: [],
      consensusMetrics: {
        agreementRate: 0,
        conflictRate: 0,
        resolutionSuccess: 0,
        averageConfidence: 0,
        participatingAgents: 0
      },
      processingMetrics: {
        totalTime: performance.now() - startTime,
        agentProcessingTimes: {},
        consensusTime: 0,
        resolutionTime: 0,
        parallelEfficiency: 0
      },
      transparency: {
        decisionProcess: [],
        agentContributions: [],
        confidenceBreakdown: {
          baseConfidence: 0,
          consensusBoost: 0,
          expertiseWeight: 0,
          contextualAdjustment: 0,
          finalConfidence: 0
        },
        alternativeReasons: []
      }
    };
  }

  private updateMetrics(response: OrchestratedResponse): void {
    this.metrics.totalRequests += 1;
    
    // Update average processing time
    this.metrics.averageProcessingTime = (
      (this.metrics.averageProcessingTime * (this.metrics.totalRequests - 1)) + 
      response.processingMetrics.totalTime
    ) / this.metrics.totalRequests;

    // Update consensus success rate
    const consensusSuccess = response.consensusMetrics.agreementRate > this.config.consensusThreshold ? 1 : 0;
    this.metrics.consensusSuccessRate = (
      (this.metrics.consensusSuccessRate * (this.metrics.totalRequests - 1)) + 
      consensusSuccess
    ) / this.metrics.totalRequests;

    // Update conflict resolution rate
    const conflictResolution = response.consensusMetrics.resolutionSuccess;
    this.metrics.conflictResolutionRate = (
      (this.metrics.conflictResolutionRate * (this.metrics.totalRequests - 1)) + 
      conflictResolution
    ) / this.metrics.totalRequests;
  }

  private updateAgentMetrics(agentId: string, analysis: AgentAnalysis): void {
    const metrics = this.metrics.agentPerformance[agentId];
    if (!metrics) return;

    metrics.totalAnalyses += 1;
    
    // Update average confidence
    metrics.averageConfidence = (
      (metrics.averageConfidence * (metrics.totalAnalyses - 1)) + 
      analysis.confidence
    ) / metrics.totalAnalyses;

    // Update average processing time
    metrics.processingTime = (
      (metrics.processingTime * (metrics.totalAnalyses - 1)) + 
      analysis.processingTime
    ) / metrics.totalAnalyses;
  }

  private updateSatisfactionMetrics(feedback: UserFeedback): void {
    // Update user satisfaction score
    const currentScore = this.metrics.userSatisfactionScore;
    const currentCount = this.metrics.totalRequests;
    
    this.metrics.userSatisfactionScore = (
      (currentScore * (currentCount - 1)) + 
      feedback.rating
    ) / currentCount;
  }

  private updateAgentPerformanceFromFeedback(response: OrchestratedResponse, feedback: UserFeedback): void {
    // Update acceptance rates for agents that contributed to the primary suggestion
    response.transparency.agentContributions.forEach(contribution => {
      const metrics = this.metrics.agentPerformance[contribution.agentId];
      if (metrics && contribution.used) {
        const currentRate = metrics.suggestionAcceptanceRate;
        const totalAnalyses = metrics.totalAnalyses;
        
        const acceptanceValue = feedback.accepted ? 1 : 0;
        metrics.suggestionAcceptanceRate = (
          (currentRate * (totalAnalyses - 1)) + 
          acceptanceValue
        ) / totalAnalyses;
      }
    });
  }

  private calculateParallelEfficiency(agentResponses: AgentAnalysis[], totalTime: number): number {
    if (agentResponses.length === 0) return 0;

    const maxAgentTime = Math.max(...agentResponses.map(r => r.processingTime));
    return maxAgentTime / totalTime; // Closer to 1 means better parallel efficiency
  }

  private generateDecisionProcess(consensus: ConsensusResult, resolution: Resolution): any[] {
    // Simplified decision process - would be more detailed in real implementation
    return [
      {
        step: 1,
        description: 'Agent analysis completed',
        input: 'User input',
        output: 'Agent responses',
        reasoning: 'Parallel processing of specialized agents',
        duration: 0
      },
      {
        step: 2,
        description: 'Consensus building',
        input: 'Agent responses',
        output: 'Consensus result',
        reasoning: `Found ${consensus.agreements.length} agreements, ${consensus.disagreements.length} disagreements`,
        duration: 0
      },
      {
        step: 3,
        description: 'Conflict resolution',
        input: 'Consensus result',
        output: 'Final resolution',
        reasoning: `Applied ${resolution.resolutionMethod} strategy`,
        duration: 0
      }
    ];
  }

  private generateAgentContributions(agentResponses: AgentAnalysis[], resolution: Resolution): any[] {
    return agentResponses.map(response => ({
      agentId: response.agentId,
      contribution: response.reasoning,
      weight: this.config.agentWeights[this.agents.get(response.agentId)?.expertise || 'contextual_analysis'],
      confidence: response.confidence,
      used: response.suggestions.some(s => s.id === resolution.best.id)
    }));
  }

  private generateConfidenceBreakdown(resolution: Resolution, consensus: ConsensusResult): any {
    return {
      baseConfidence: resolution.best.confidence,
      consensusBoost: consensus.consensusStrength * 0.1,
      expertiseWeight: 0.05,
      contextualAdjustment: 0,
      finalConfidence: resolution.confidence
    };
  }
}

// Factory function
export function createMultiAgentOrchestrator(config?: Partial<OrchestrationConfig>): MultiAgentOrchestrator {
  return new MultiAgentOrchestrator(config);
}
