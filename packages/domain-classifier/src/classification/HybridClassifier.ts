/**
 * Hybrid Classifier - Multi-Layer Classification System
 * Combines multiple classification approaches with weighted scoring
 */

import { ClassificationLayer, ClassificationResult, DomainScore } from './ClassificationLayer.js';
import { DomainType } from '../types/DomainTypes.js';
import { EmbeddingLayer } from './EmbeddingLayer.js';
import { PatternLayer } from './PatternLayer.js';
import { RuleLayer } from './RuleLayer.js';
import { HeuristicLayer } from './HeuristicLayer.js';

export class HybridClassifier {
  private layers: ClassificationLayer[] = [];
  private initialized = false;

  constructor() {
    this.initializeLayers();
  }

  private initializeLayers(): void {
    // Initialize classification layers in order of importance
    this.layers = [
      new EmbeddingLayer(),    // Semantic understanding (weight: 0.4)
      new PatternLayer(),      // Context pattern recognition (weight: 0.3)
      new RuleLayer(),         // Enhanced keyword rules (weight: 0.2)
      new HeuristicLayer()     // Domain-specific heuristics (weight: 0.1)
    ];

    this.initialized = true;
  }

  async initialize(): Promise<void> {
    // Initialize any layers that require async setup
    for (const layer of this.layers) {
      if (layer.initialize) {
        await layer.initialize();
      }
    }
  }

  classify(prompt: string): ClassificationResult {
    const startTime = performance.now();

    if (!this.initialized) {
      throw new Error('HybridClassifier not initialized. Call initialize() first.');
    }

    if (!prompt || prompt.trim().length === 0) {
      return this.createDefaultResult(DomainType.CODE, 50, ['empty prompt'], startTime);
    }

    // Collect scores from all layers
    const allLayerScores: DomainScore[] = [];
    
    for (const layer of this.layers) {
      try {
        const layerScores = layer.classify(prompt);
        allLayerScores.push(...layerScores);
      } catch (error) {
        console.warn(`Layer ${layer.name} failed:`, error);
        // Continue with other layers
      }
    }

    // Aggregate scores by domain
    const aggregatedScores = this.aggregateScores(allLayerScores);
    
    // Find the best domain
    const bestDomain = this.selectBestDomain(aggregatedScores);
    
    const processingTime = performance.now() - startTime;

    // Apply domain-specific confidence boosts
    const boostedConfidence = this.applyDomainBoosts(bestDomain.domain, bestDomain.weightedScore, bestDomain.indicators);

    return {
      domain: bestDomain.domain,
      confidence: Math.round(boostedConfidence * 100),
      method: 'hybrid',
      indicators: bestDomain.indicators,
      layerScores: allLayerScores,
      processingTime: Math.round(processingTime * 100) / 100
    };
  }

  private aggregateScores(layerScores: DomainScore[]): Map<DomainType, AggregatedScore> {
    const aggregated = new Map<DomainType, AggregatedScore>();

    // Initialize aggregated scores for all domains
    for (const domain of Object.values(DomainType)) {
      aggregated.set(domain, {
        domain,
        weightedScore: 0,
        maxScore: 0,
        indicators: [],
        layerCount: 0,
        layerScores: []
      });
    }

    // Aggregate scores from all layers
    for (const score of layerScores) {
      const layer = this.layers.find(l => l.name === score.method);
      const weight = layer ? layer.weight : 0.1; // Default weight for unknown layers

      const aggregatedScore = aggregated.get(score.domain)!;
      aggregatedScore.layerScores.push(score);
      aggregatedScore.maxScore = Math.max(aggregatedScore.maxScore, score.score);
      aggregatedScore.indicators.push(...(score.indicators || []));
      aggregatedScore.layerCount++;
    }

    // Apply enhanced aggregation algorithm
    for (const [domain, aggregatedScore] of aggregated.entries()) {
      if (aggregatedScore.layerCount > 0) {
        aggregatedScore.weightedScore = this.enhancedAggregation(aggregatedScore.layerScores);
      }
    }

    return aggregated;
  }

  private enhancedAggregation(layerScores: DomainScore[]): number {
    // Find highest confidence layer result
    const maxScore = Math.max(...layerScores.map(s => s.score));
    
    // If any layer has very high confidence, boost the aggregation
    if (maxScore >= 0.8) {
      const highConfidenceLayers = layerScores.filter(s => s.score >= 0.8);
      const otherLayers = layerScores.filter(s => s.score < 0.8);
      
      // High-confidence layers get 70% weight, others get 30%
      const highConfidenceWeight = 0.7;
      const otherWeight = 0.3;
      
      const highConfidenceScore = this.weightedAverage(highConfidenceLayers);
      const otherScore = otherLayers.length > 0 ? this.weightedAverage(otherLayers) : 0;
      
      return highConfidenceScore * highConfidenceWeight + otherScore * otherWeight;
    }
    
    // For moderate confidence, use standard weighted average with boost
    const standardScore = this.weightedAverage(layerScores);
    
    // Boost moderate scores if multiple layers agree
    if (layerScores.length >= 2) {
      return Math.min(0.85, standardScore + 0.1);
    }
    
    return standardScore;
  }

  private weightedAverage(layerScores: DomainScore[]): number {
    if (layerScores.length === 0) return 0;
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    for (const score of layerScores) {
      const layer = this.layers.find(l => l.name === score.method);
      const weight = layer ? layer.weight : 0.1;
      
      totalWeightedScore += score.score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  private selectBestDomain(aggregatedScores: Map<DomainType, AggregatedScore>): AggregatedScore {
    let bestScore: AggregatedScore | null = null;

    for (const score of aggregatedScores.values()) {
      // Only consider domains that have at least one layer contributing
      if (score.layerCount > 0) {
        // Use weighted score as primary, max score as tiebreaker
        const effectiveScore = score.weightedScore + (score.maxScore * 0.1);
        
        if (!bestScore || effectiveScore > (bestScore.weightedScore + (bestScore.maxScore * 0.1))) {
          bestScore = score;
        }
      }
    }

    // Fallback to CODE domain if no clear winner
    if (!bestScore || bestScore.weightedScore < 0.1) {
      return {
        domain: DomainType.CODE,
        weightedScore: 0.5,
        maxScore: 0.5,
        indicators: ['default classification'],
        layerCount: 1,
        layerScores: []
      };
    }

    return bestScore;
  }

  private createDefaultResult(
    domain: DomainType, 
    confidence: number, 
    indicators: string[], 
    startTime: number
  ): ClassificationResult {
    return {
      domain,
      confidence,
      method: 'default',
      indicators,
      layerScores: [],
      processingTime: Math.round((performance.now() - startTime) * 100) / 100
    };
  }

  // Get layer information for debugging
  getLayerInfo(): Array<{name: string, weight: number}> {
    return this.layers.map(layer => ({
      name: layer.name,
      weight: layer.weight
    }));
  }

  private applyDomainBoosts(domain: DomainType, baseScore: number, indicators: string[]): number {
    let boostedScore = baseScore;
    
    // Enhanced confidence calibration for smooth distribution
    const calibratedScore = this.calibrateConfidenceDistribution(baseScore, indicators);
    
    // Code domain boosts
    if (domain === DomainType.CODE) {
      if (indicators.some(ind => ind.includes('programming language') || ind.includes('implementation task'))) {
        boostedScore += 0.15; // Strong boost for clear programming indicators
      }
      if (indicators.some(ind => ind.includes('primary: implement') || ind.includes('primary: debug'))) {
        boostedScore += 0.10; // Boost for strong programming verbs
      }
    }
    
    // Analysis domain boosts  
    if (domain === DomainType.ANALYSIS) {
      if (indicators.some(ind => ind.includes('data analysis') || ind.includes('comparative analysis'))) {
        boostedScore += 0.12; // Boost for clear analysis indicators
      }
      if (indicators.some(ind => ind.includes('primary: analyze') || ind.includes('primary: evaluate'))) {
        boostedScore += 0.08; // Boost for analysis verbs
      }
    }
    
    // Writing domain boosts
    if (domain === DomainType.WRITING) {
      if (indicators.some(ind => ind.includes('content creation') || ind.includes('communication writing'))) {
        boostedScore += 0.10; // Boost for content creation indicators
      }
      if (indicators.some(ind => ind.includes('primary: write') || ind.includes('primary: create'))) {
        boostedScore += 0.08; // Boost for writing verbs
      }
    }
    
    // Research domain boosts
    if (domain === DomainType.RESEARCH) {
      if (indicators.some(ind => ind.includes('methodology research') || ind.includes('methodology exploration'))) {
        boostedScore += 0.12; // Boost for clear research indicators
      }
      if (indicators.some(ind => ind.includes('primary: research') || ind.includes('primary: investigate'))) {
        boostedScore += 0.08; // Boost for research verbs
      }
    }
    
    // Apply calibrated score with domain boosts
    const finalScore = Math.max(calibratedScore, boostedScore);
    return Math.min(1.0, finalScore); // Cap at 1.0
  }

  private calibrateConfidenceDistribution(baseScore: number, indicators: string[]): number {
    // Smooth confidence distribution algorithm
    // Target: 40-100 range with appropriate distribution
    
    // Count strong indicators
    const strongIndicators = indicators.filter(ind => 
      ind.includes('pattern:') || 
      ind.includes('bonus:') || 
      ind.includes('programming language') ||
      ind.includes('content creation') ||
      ind.includes('data analysis') ||
      ind.includes('methodology research')
    ).length;
    
    const moderateIndicators = indicators.filter(ind => 
      ind.includes('primary:') || 
      ind.includes('secondary:') ||
      ind.includes('context:')
    ).length;
    
    // Calculate confidence based on indicator strength
    if (strongIndicators >= 2) {
      // Strong case: 80-95 confidence
      return Math.min(0.95, baseScore + 0.15);
    } else if (strongIndicators >= 1 || moderateIndicators >= 3) {
      // Moderate case: 60-79 confidence  
      return Math.min(0.79, baseScore + 0.10);
    } else if (moderateIndicators >= 1) {
      // Weak case: 40-59 confidence
      return Math.min(0.59, baseScore + 0.05);
    } else {
      // Very weak case: 20-39 confidence
      return Math.min(0.39, baseScore);
    }
  }
}

interface AggregatedScore {
  domain: DomainType;
  weightedScore: number;
  maxScore: number;
  indicators: string[];
  layerCount: number;
  layerScores: DomainScore[];
}
