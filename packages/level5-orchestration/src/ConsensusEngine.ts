/**
 * Consensus Engine
 * Intelligent decision-making system that builds consensus from multiple agent analyses
 * Resolves conflicts and provides transparent reasoning for unified responses
 */

import {
  AgentAnalysis,
  AgentSuggestion,
  ConsensusResult,
  Resolution,
  Agreement,
  Disagreement,
  ConflictType,
  ResolutionStrategy,
  ConsensusMetrics,
  OrchestrationConfig
} from './types/OrchestrationTypes.js';

export class ConsensusEngine {
  private config: OrchestrationConfig;
  private consensusHistory: ConsensusResult[] = [];
  private resolutionHistory: Resolution[] = [];

  constructor(config: OrchestrationConfig) {
    this.config = config;
  }

  /**
   * Build consensus from multiple agent analyses
   * Identifies agreements and disagreements with >80% consensus target
   */
  async buildConsensus(agentResponses: AgentAnalysis[]): Promise<ConsensusResult> {
    const startTime = performance.now();

    try {
      console.log(`[ConsensusEngine] Building consensus from ${agentResponses.length} agent responses`);

      // Group suggestions by similarity
      const suggestionGroups = this.groupSimilarSuggestions(agentResponses);

      // Identify agreements (multiple agents suggesting similar things)
      const agreements = this.identifyAgreements(suggestionGroups, agentResponses);

      // Identify disagreements (conflicting suggestions)
      const disagreements = this.identifyDisagreements(suggestionGroups, agentResponses);

      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(agentResponses, agreements);

      // Determine primary suggestion from agreements
      const primarySuggestion = this.selectPrimarySuggestion(agreements);

      // Collect alternative suggestions
      const alternativeSuggestions = this.collectAlternativeSuggestions(agreements, primarySuggestion);

      // Calculate consensus strength
      const consensusStrength = this.calculateConsensusStrength(agreements, disagreements, agentResponses.length);

      const consensus: ConsensusResult = {
        agreements,
        disagreements,
        overallConfidence,
        primarySuggestion,
        alternativeSuggestions,
        consensusStrength
      };

      // Store consensus for learning
      this.consensusHistory.push(consensus);

      const consensusTime = performance.now() - startTime;
      console.log(`[ConsensusEngine] Consensus built in ${consensusTime.toFixed(2)}ms: ${agreements.length} agreements, ${disagreements.length} disagreements`);

      return consensus;

    } catch (error) {
      console.error('[ConsensusEngine] Consensus building failed:', error);
      return this.createEmptyConsensus();
    }
  }

  /**
   * Resolve conflicts using configured resolution strategy
   * Maintains >70% user satisfaction through intelligent conflict resolution
   */
  async resolveConflicts(consensus: ConsensusResult): Promise<Resolution> {
    const startTime = performance.now();

    try {
      console.log(`[ConsensusEngine] Resolving conflicts using ${this.config.conflictResolutionStrategy} strategy`);

      let bestSuggestion: AgentSuggestion;
      let alternatives: AgentSuggestion[] = [];
      let resolutionMethod = this.config.conflictResolutionStrategy;
      let reasoning = '';

      // If no disagreements, use primary suggestion from consensus
      if (consensus.disagreements.length === 0) {
        bestSuggestion = consensus.primarySuggestion || this.createFallbackSuggestion();
        alternatives = consensus.alternativeSuggestions;
        reasoning = 'Strong consensus achieved with no conflicts';
      } else {
        // Apply conflict resolution strategy
        const resolutionResult = await this.applyResolutionStrategy(
          consensus.disagreements,
          consensus.agreements,
          this.config.conflictResolutionStrategy
        );

        bestSuggestion = resolutionResult.suggestion;
        alternatives = resolutionResult.alternatives;
        resolutionMethod = resolutionResult.method;
        reasoning = resolutionResult.reasoning;
      }

      // Calculate final confidence
      const finalConfidence = this.calculateFinalConfidence(bestSuggestion, consensus);

      // Generate consensus metrics
      const consensusMetrics = this.generateConsensusMetrics(consensus, bestSuggestion);

      const resolution: Resolution = {
        best: bestSuggestion,
        alternatives,
        confidence: finalConfidence,
        reasoning,
        resolutionMethod,
        consensusMetrics
      };

      // Store resolution for learning
      this.resolutionHistory.push(resolution);

      const resolutionTime = performance.now() - startTime;
      console.log(`[ConsensusEngine] Conflicts resolved in ${resolutionTime.toFixed(2)}ms using ${resolutionMethod}`);

      return resolution;

    } catch (error) {
      console.error('[ConsensusEngine] Conflict resolution failed:', error);
      return this.createEmptyResolution();
    }
  }

  /**
   * Get consensus engine performance metrics
   */
  getMetrics(): any {
    const totalConsensus = this.consensusHistory.length;
    const totalResolutions = this.resolutionHistory.length;

    if (totalConsensus === 0) {
      return {
        totalConsensus: 0,
        averageConsensusStrength: 0,
        conflictResolutionRate: 0,
        averageConfidence: 0
      };
    }

    const avgConsensusStrength = this.consensusHistory.reduce((sum, c) => sum + c.consensusStrength, 0) / totalConsensus;
    const conflictResolutionRate = this.resolutionHistory.filter(r => r.confidence > 0.7).length / totalResolutions;
    const avgConfidence = this.resolutionHistory.reduce((sum, r) => sum + r.confidence, 0) / totalResolutions;

    return {
      totalConsensus,
      averageConsensusStrength: avgConsensusStrength,
      conflictResolutionRate,
      averageConfidence
    };
  }

  // Private helper methods

  private groupSimilarSuggestions(agentResponses: AgentAnalysis[]): Map<string, AgentSuggestion[]> {
    const groups = new Map<string, AgentSuggestion[]>();

    // Collect all suggestions
    const allSuggestions = agentResponses.flatMap(response => 
      response.suggestions.map(suggestion => ({
        ...suggestion,
        agentId: response.agentId
      }))
    );

    // Group by similarity
    allSuggestions.forEach(suggestion => {
      let foundGroup = false;

      // Check existing groups for similarity
      for (const [groupKey, groupSuggestions] of groups.entries()) {
        if (this.areSuggestionsSimilar(suggestion, groupSuggestions[0])) {
          groupSuggestions.push(suggestion);
          foundGroup = true;
          break;
        }
      }

      // Create new group if no similar group found
      if (!foundGroup) {
        const groupKey = `${suggestion.type}_${suggestion.content.substring(0, 20)}`;
        groups.set(groupKey, [suggestion]);
      }
    });

    return groups;
  }

  private identifyAgreements(
    suggestionGroups: Map<string, AgentSuggestion[]>,
    agentResponses: AgentAnalysis[]
  ): Agreement[] {
    const agreements: Agreement[] = [];

    suggestionGroups.forEach((suggestions, groupKey) => {
      // Agreement requires 2+ agents suggesting similar things
      if (suggestions.length >= 2) {
        const supportingAgents = suggestions.map(s => (s as any).agentId || 'unknown');
        const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
        
        // Use the highest confidence suggestion as the representative
        const bestSuggestion = suggestions.sort((a, b) => b.confidence - a.confidence)[0];

        agreements.push({
          suggestion: bestSuggestion,
          supportingAgents,
          confidence: avgConfidence,
          reasoning: `${supportingAgents.length} agents agree on this suggestion`
        });
      }
    });

    // Sort agreements by confidence and support
    return agreements.sort((a, b) => {
      const scoreA = a.confidence * a.supportingAgents.length;
      const scoreB = b.confidence * b.supportingAgents.length;
      return scoreB - scoreA;
    });
  }

  private identifyDisagreements(
    suggestionGroups: Map<string, AgentSuggestion[]>,
    agentResponses: AgentAnalysis[]
  ): Disagreement[] {
    const disagreements: Disagreement[] = [];

    // Find conflicting suggestions (same type but different content/approach)
    const suggestionsByType = new Map<string, AgentSuggestion[]>();
    
    suggestionGroups.forEach(suggestions => {
      suggestions.forEach(suggestion => {
        const type = suggestion.type;
        if (!suggestionsByType.has(type)) {
          suggestionsByType.set(type, []);
        }
        suggestionsByType.get(type)!.push(suggestion);
      });
    });

    // Identify conflicts within each type
    suggestionsByType.forEach((suggestions, type) => {
      if (suggestions.length > 1) {
        // Group by agent to find conflicting suggestions from different agents
        const agentSuggestions = new Map<string, AgentSuggestion[]>();
        
        suggestions.forEach(suggestion => {
          const agentId = (suggestion as any).agentId || 'unknown';
          if (!agentSuggestions.has(agentId)) {
            agentSuggestions.set(agentId, []);
          }
          agentSuggestions.get(agentId)!.push(suggestion);
        });

        // If multiple agents have different suggestions of the same type, it's a disagreement
        if (agentSuggestions.size > 1) {
          const conflictingSuggestions = Array.from(agentSuggestions.values()).flat();
          const involvedAgents = Array.from(agentSuggestions.keys());

          disagreements.push({
            conflictingSuggestions,
            involvedAgents,
            conflictType: this.determineConflictType(conflictingSuggestions),
            resolutionStrategy: this.selectResolutionStrategy(conflictingSuggestions)
          });
        }
      }
    });

    return disagreements;
  }

  private async applyResolutionStrategy(
    disagreements: Disagreement[],
    agreements: Agreement[],
    strategy: ResolutionStrategy
  ): Promise<{ suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string }> {
    
    // If we have strong agreements, prefer those over disagreements
    if (agreements.length > 0 && agreements[0].confidence > 0.8) {
      return {
        suggestion: agreements[0].suggestion,
        alternatives: agreements.slice(1).map(a => a.suggestion),
        method: 'expertise_priority',
        reasoning: `Strong agreement (${agreements[0].confidence.toFixed(2)} confidence) from ${agreements[0].supportingAgents.length} agents`
      };
    }

    // Apply the configured strategy to resolve disagreements
    switch (strategy) {
      case 'highest_confidence':
        return this.resolveByHighestConfidence(disagreements, agreements);
      
      case 'majority_vote':
        return this.resolveByMajorityVote(disagreements, agreements);
      
      case 'expertise_priority':
        return this.resolveByExpertisePriority(disagreements, agreements);
      
      case 'user_preference':
        return this.resolveByUserPreference(disagreements, agreements);
      
      case 'hybrid_approach':
        return this.resolveByHybridApproach(disagreements, agreements);
      
      default:
        return this.resolveByHighestConfidence(disagreements, agreements);
    }
  }

  private resolveByHighestConfidence(
    disagreements: Disagreement[],
    agreements: Agreement[]
  ): { suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string } {
    
    // Collect all suggestions from disagreements and agreements
    const allSuggestions = [
      ...disagreements.flatMap(d => d.conflictingSuggestions),
      ...agreements.map(a => a.suggestion)
    ];

    // Sort by confidence
    const sortedSuggestions = allSuggestions.sort((a, b) => b.confidence - a.confidence);
    
    return {
      suggestion: sortedSuggestions[0] || this.createFallbackSuggestion(),
      alternatives: sortedSuggestions.slice(1, 4),
      method: 'highest_confidence',
      reasoning: `Selected suggestion with highest confidence (${sortedSuggestions[0]?.confidence.toFixed(2) || '0'})`
    };
  }

  private resolveByMajorityVote(
    disagreements: Disagreement[],
    agreements: Agreement[]
  ): { suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string } {
    
    // Count votes for each suggestion type
    const voteCount = new Map<string, { suggestion: AgentSuggestion; votes: number }>();

    // Count agreement votes (weighted by number of supporting agents)
    agreements.forEach(agreement => {
      const key = `${agreement.suggestion.type}_${agreement.suggestion.content.substring(0, 20)}`;
      voteCount.set(key, {
        suggestion: agreement.suggestion,
        votes: agreement.supportingAgents.length
      });
    });

    // Count disagreement votes (each agent gets one vote)
    disagreements.forEach(disagreement => {
      disagreement.conflictingSuggestions.forEach(suggestion => {
        const key = `${suggestion.type}_${suggestion.content.substring(0, 20)}`;
        const existing = voteCount.get(key);
        if (existing) {
          existing.votes += 1;
        } else {
          voteCount.set(key, { suggestion, votes: 1 });
        }
      });
    });

    // Find the suggestion with most votes
    const sortedByVotes = Array.from(voteCount.values()).sort((a, b) => b.votes - a.votes);
    
    return {
      suggestion: sortedByVotes[0]?.suggestion || this.createFallbackSuggestion(),
      alternatives: sortedByVotes.slice(1, 4).map(v => v.suggestion),
      method: 'majority_vote',
      reasoning: `Selected by majority vote (${sortedByVotes[0]?.votes || 0} votes)`
    };
  }

  private resolveByExpertisePriority(
    disagreements: Disagreement[],
    agreements: Agreement[]
  ): { suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string } {
    
    // Weight suggestions by agent expertise
    const weightedSuggestions = [
      ...disagreements.flatMap(d => d.conflictingSuggestions),
      ...agreements.map(a => a.suggestion)
    ].map(suggestion => ({
      suggestion,
      weight: this.getAgentExpertiseWeight(suggestion.source) * suggestion.confidence
    }));

    // Sort by weighted score
    const sortedWeighted = weightedSuggestions.sort((a, b) => b.weight - a.weight);
    
    return {
      suggestion: sortedWeighted[0]?.suggestion || this.createFallbackSuggestion(),
      alternatives: sortedWeighted.slice(1, 4).map(w => w.suggestion),
      method: 'expertise_priority',
      reasoning: `Selected based on agent expertise and confidence (weight: ${sortedWeighted[0]?.weight.toFixed(2) || 0})`
    };
  }

  private resolveByUserPreference(
    disagreements: Disagreement[],
    agreements: Agreement[]
  ): { suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string } {
    
    // For now, fall back to highest confidence
    // In a real implementation, this would use user preference history
    return {
      ...this.resolveByHighestConfidence(disagreements, agreements),
      method: 'user_preference',
      reasoning: 'Selected based on user preference patterns (fallback to highest confidence)'
    };
  }

  private resolveByHybridApproach(
    disagreements: Disagreement[],
    agreements: Agreement[]
  ): { suggestion: AgentSuggestion; alternatives: AgentSuggestion[]; method: ResolutionStrategy; reasoning: string } {
    
    // Combine multiple strategies
    const confidenceResult = this.resolveByHighestConfidence(disagreements, agreements);
    const majorityResult = this.resolveByMajorityVote(disagreements, agreements);
    const expertiseResult = this.resolveByExpertisePriority(disagreements, agreements);

    // If all strategies agree on the same suggestion, use it
    if (confidenceResult.suggestion.id === majorityResult.suggestion.id &&
        majorityResult.suggestion.id === expertiseResult.suggestion.id) {
      return {
        suggestion: confidenceResult.suggestion,
        alternatives: [majorityResult.suggestion, expertiseResult.suggestion].filter((s, i, arr) => 
          arr.findIndex(item => item.id === s.id) === i
        ).slice(1, 4),
        method: 'hybrid_approach',
        reasoning: 'All resolution strategies converged on the same suggestion'
      };
    }

    // Otherwise, use expertise priority as the tiebreaker
    return {
      ...expertiseResult,
      method: 'hybrid_approach',
      reasoning: 'Hybrid approach using expertise priority as tiebreaker'
    };
  }

  private areSuggestionsSimilar(suggestion1: AgentSuggestion, suggestion2: AgentSuggestion): boolean {
    // Check if suggestions are similar enough to be grouped together
    if (suggestion1.type !== suggestion2.type) return false;
    
    // Simple similarity check based on content overlap
    const content1 = suggestion1.content.toLowerCase();
    const content2 = suggestion2.content.toLowerCase();
    
    const words1 = content1.split(/\s+/);
    const words2 = content2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return similarity > 0.5; // 50% word overlap threshold
  }

  private determineConflictType(suggestions: AgentSuggestion[]): ConflictType {
    // Analyze the type of conflict
    const confidenceRange = Math.max(...suggestions.map(s => s.confidence)) - 
                           Math.min(...suggestions.map(s => s.confidence));
    
    if (confidenceRange > 0.3) return 'confidence_mismatch';
    
    const priorities = suggestions.map(s => s.priority);
    if (new Set(priorities).size > 1) return 'priority_conflict';
    
    const sources = suggestions.map(s => s.source);
    if (new Set(sources).size === suggestions.length) return 'expertise_overlap';
    
    return 'suggestion_contradiction';
  }

  private selectResolutionStrategy(suggestions: AgentSuggestion[]): ResolutionStrategy {
    // Select appropriate resolution strategy based on conflict characteristics
    const confidenceRange = Math.max(...suggestions.map(s => s.confidence)) - 
                           Math.min(...suggestions.map(s => s.confidence));
    
    if (confidenceRange > 0.3) return 'highest_confidence';
    
    const sources = new Set(suggestions.map(s => s.source));
    if (sources.size === suggestions.length) return 'expertise_priority';
    
    return 'majority_vote';
  }

  private getAgentExpertiseWeight(source: string): number {
    // Get weight for agent expertise from config
    const weights: Record<string, number> = {
      'memory': this.config.agentWeights?.memory || 1.0,
      'workflow_intelligence': this.config.agentWeights?.workflow_intelligence || 1.2,
      'pattern_recognition': this.config.agentWeights?.pattern_recognition || 1.0,
      'prediction': this.config.agentWeights?.prediction || 1.0,
      'contextual_analysis': this.config.agentWeights?.contextual_analysis || 0.9,
      'ghost_text': this.config.agentWeights?.ghost_text || 0.8
    };
    
    return weights[source] || 1.0;
  }

  private calculateOverallConfidence(agentResponses: AgentAnalysis[], agreements: Agreement[]): number {
    // Calculate overall confidence based on agent responses and agreements
    const agentConfidences = agentResponses.map(r => r.confidence);
    const avgAgentConfidence = agentConfidences.reduce((sum, c) => sum + c, 0) / agentConfidences.length;
    
    // Boost confidence if there are strong agreements
    let agreementBoost = 0;
    if (agreements.length > 0) {
      const strongAgreements = agreements.filter(a => a.confidence > 0.8 && a.supportingAgents.length > 1);
      agreementBoost = strongAgreements.length * 0.1;
    }
    
    return Math.min(avgAgentConfidence + agreementBoost, 1.0);
  }

  private selectPrimarySuggestion(agreements: Agreement[]): AgentSuggestion | null {
    if (agreements.length === 0) return null;
    
    // Select the agreement with highest confidence and most support
    return agreements[0].suggestion;
  }

  private collectAlternativeSuggestions(agreements: Agreement[], primarySuggestion: AgentSuggestion | null): AgentSuggestion[] {
    return agreements
      .filter(a => !primarySuggestion || a.suggestion.id !== primarySuggestion.id)
      .map(a => a.suggestion)
      .slice(0, 3); // Limit to top 3 alternatives
  }

  private calculateConsensusStrength(agreements: Agreement[], disagreements: Disagreement[], totalAgents: number): number {
    if (totalAgents === 0) return 0;
    
    // Calculate based on agreement vs disagreement ratio
    const agreementScore = agreements.reduce((sum, a) => sum + a.supportingAgents.length, 0);
    const disagreementScore = disagreements.reduce((sum, d) => sum + d.involvedAgents.length, 0);
    
    const totalVotes = agreementScore + disagreementScore;
    if (totalVotes === 0) return 0;
    
    return agreementScore / totalVotes;
  }

  private calculateFinalConfidence(suggestion: AgentSuggestion, consensus: ConsensusResult): number {
    let confidence = suggestion.confidence;
    
    // Boost based on consensus strength
    confidence += consensus.consensusStrength * 0.2;
    
    // Boost based on overall confidence
    confidence += consensus.overallConfidence * 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private generateConsensusMetrics(consensus: ConsensusResult, bestSuggestion: AgentSuggestion): ConsensusMetrics {
    const totalSuggestions = consensus.agreements.length + consensus.disagreements.length;
    
    return {
      agreementRate: totalSuggestions > 0 ? consensus.agreements.length / totalSuggestions : 0,
      conflictRate: totalSuggestions > 0 ? consensus.disagreements.length / totalSuggestions : 0,
      resolutionSuccess: bestSuggestion.confidence,
      averageConfidence: consensus.overallConfidence,
      participatingAgents: this.countParticipatingAgents(consensus)
    };
  }

  private countParticipatingAgents(consensus: ConsensusResult): number {
    const agents = new Set<string>();
    
    consensus.agreements.forEach(a => {
      a.supportingAgents.forEach(agent => agents.add(agent));
    });
    
    consensus.disagreements.forEach(d => {
      d.involvedAgents.forEach(agent => agents.add(agent));
    });
    
    return agents.size;
  }

  private createFallbackSuggestion(): AgentSuggestion {
    return {
      id: 'fallback_suggestion',
      type: 'contextual_hint',
      content: 'Continue with your current task',
      confidence: 0.5,
      priority: 'low',
      source: 'contextual_analysis',
      reasoning: 'Fallback suggestion when no consensus reached'
    };
  }

  private createEmptyConsensus(): ConsensusResult {
    return {
      agreements: [],
      disagreements: [],
      overallConfidence: 0,
      primarySuggestion: null,
      alternativeSuggestions: [],
      consensusStrength: 0
    };
  }

  private createEmptyResolution(): Resolution {
    return {
      best: this.createFallbackSuggestion(),
      alternatives: [],
      confidence: 0,
      reasoning: 'Failed to resolve conflicts',
      resolutionMethod: 'highest_confidence',
      consensusMetrics: {
        agreementRate: 0,
        conflictRate: 0,
        resolutionSuccess: 0,
        averageConfidence: 0,
        participatingAgents: 0
      }
    };
  }
}
