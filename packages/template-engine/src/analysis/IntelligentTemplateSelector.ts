/**
 * Intelligent Template Selector - ES Module
 * 
 * Multi-factor template scoring and selection intelligence
 * Phase 1.3 Context-Aware Template Selection Implementation
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType } from '../types/TemplateTypes.js';
import { 
  PromptSemantics, 
  TemplateSelectionFactors, 
  TemplateScore,
  IntentType,
  ComplexityLevel,
  CompletenessLevel,
  SpecificityLevel
} from '../types/SemanticTypes.js';
import { DomainClassificationResult, DomainType } from '@promptlint/domain-classifier';
import { LintResult } from '@promptlint/shared-types';

export class IntelligentTemplateSelector {
  /**
   * Score a template based on comprehensive multi-factor analysis
   */
  scoreTemplate(
    templateType: TemplateType,
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult,
    lintResult: LintResult
  ): TemplateScore {
    const factors = this.calculateSelectionFactors(templateType, semantics, domainResult, lintResult);
    const reasoning = this.generateReasoning(templateType, factors, semantics, domainResult);
    const confidence = this.calculateSelectionConfidence(factors, semantics);

    return {
      templateType: templateType.toString(),
      factors,
      reasoning,
      confidence
    };
  }

  /**
   * Calculate multi-factor selection scores
   */
  private calculateSelectionFactors(
    templateType: TemplateType,
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult,
    lintResult: LintResult
  ): TemplateSelectionFactors {
    const domainAlignment = this.calculateDomainAlignment(templateType, domainResult, semantics);
    const intentMatch = this.calculateIntentMatch(templateType, semantics);
    const complexityAppropriate = this.calculateComplexityAppropriate(templateType, semantics);
    const completenessSupport = this.calculateCompletenessSupport(templateType, semantics);
    const contextualRelevance = this.calculateContextualRelevance(templateType, semantics);

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore({
      domainAlignment,
      intentMatch,
      complexityAppropriate,
      completenessSupport,
      contextualRelevance
    });

    return {
      domainAlignment,
      intentMatch,
      complexityAppropriate,
      completenessSupport,
      contextualRelevance,
      overallScore
    };
  }

  /**
   * Calculate domain alignment score
   */
  private calculateDomainAlignment(
    templateType: TemplateType,
    domainResult: DomainClassificationResult,
    semantics: PromptSemantics
  ): number {
    let score = 50; // Base score

    // Domain-specific template preferences
    switch (domainResult.domain) {
      case DomainType.CODE:
        if (templateType === TemplateType.TASK_IO) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 20;
        if (templateType === TemplateType.BULLET) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 5;
        break;

      case DomainType.ANALYSIS:
        if (templateType === TemplateType.BULLET) score += 25;
        if (templateType === TemplateType.TASK_IO) score += 20;
        if (templateType === TemplateType.SEQUENTIAL) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case DomainType.WRITING:
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.MINIMAL) score += 15;
        if (templateType === TemplateType.TASK_IO) score += 10;
        break;

      case DomainType.RESEARCH:
        if (templateType === TemplateType.BULLET) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 20;
        if (templateType === TemplateType.TASK_IO) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;
    }

    // Boost for high domain confidence
    if (domainResult.confidence >= 80) {
      score += 10;
    } else if (domainResult.confidence >= 60) {
      score += 5;
    }

    // Boost for technical context in code domain
    if (domainResult.domain === DomainType.CODE && semantics.context.technical) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate intent match score
   */
  private calculateIntentMatch(templateType: TemplateType, semantics: PromptSemantics): number {
    let score = 50; // Base score

    switch (semantics.intentType) {
      case IntentType.INSTRUCTIONAL:
        if (templateType === TemplateType.TASK_IO) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 5;
        break;

      case IntentType.CREATIVE:
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.MINIMAL) score += 15;
        if (templateType === TemplateType.TASK_IO) score += 10;
        break;

      case IntentType.ANALYTICAL:
        if (templateType === TemplateType.BULLET) score += 30;
        if (templateType === TemplateType.TASK_IO) score += 20;
        if (templateType === TemplateType.SEQUENTIAL) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case IntentType.COMPARATIVE:
        if (templateType === TemplateType.BULLET) score += 35;
        if (templateType === TemplateType.TASK_IO) score += 15;
        if (templateType === TemplateType.SEQUENTIAL) score += 10;
        if (templateType === TemplateType.MINIMAL) score += 5;
        break;

      case IntentType.PLANNING:
        if (templateType === TemplateType.BULLET) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.TASK_IO) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case IntentType.DEBUGGING:
        if (templateType === TemplateType.SEQUENTIAL) score += 30;
        if (templateType === TemplateType.TASK_IO) score += 25;
        if (templateType === TemplateType.BULLET) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 5;
        break;

      case IntentType.EXPLANATORY:
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.MINIMAL) score += 15;
        if (templateType === TemplateType.TASK_IO) score += 10;
        break;

      case IntentType.GENERATIVE:
        if (templateType === TemplateType.MINIMAL) score += 20;
        if (templateType === TemplateType.SEQUENTIAL) score += 15;
        if (templateType === TemplateType.BULLET) score += 10;
        if (templateType === TemplateType.TASK_IO) score += 5;
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate complexity appropriateness score
   */
  private calculateComplexityAppropriate(templateType: TemplateType, semantics: PromptSemantics): number {
    let score = 50; // Base score

    switch (semantics.complexity) {
      case ComplexityLevel.SIMPLE:
        if (templateType === TemplateType.MINIMAL) score += 30;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.SEQUENTIAL) score += 10;
        if (templateType === TemplateType.TASK_IO) score += 5;
        break;

      case ComplexityLevel.MODERATE:
        if (templateType === TemplateType.BULLET) score += 25;
        if (templateType === TemplateType.SEQUENTIAL) score += 20;
        if (templateType === TemplateType.TASK_IO) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case ComplexityLevel.COMPLEX:
        if (templateType === TemplateType.TASK_IO) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.MINIMAL) score += 5;
        break;

      case ComplexityLevel.EXPERT:
        if (templateType === TemplateType.TASK_IO) score += 35;
        if (templateType === TemplateType.SEQUENTIAL) score += 30;
        if (templateType === TemplateType.BULLET) score += 25;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate completeness support score
   */
  private calculateCompletenessSupport(templateType: TemplateType, semantics: PromptSemantics): number {
    let score = 50; // Base score

    switch (semantics.completeness) {
      case CompletenessLevel.MINIMAL:
        if (templateType === TemplateType.MINIMAL) score += 30;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.SEQUENTIAL) score += 10;
        if (templateType === TemplateType.TASK_IO) score += 5;
        break;

      case CompletenessLevel.PARTIAL:
        if (templateType === TemplateType.BULLET) score += 25;
        if (templateType === TemplateType.SEQUENTIAL) score += 20;
        if (templateType === TemplateType.TASK_IO) score += 15;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case CompletenessLevel.DETAILED:
        if (templateType === TemplateType.TASK_IO) score += 30;
        if (templateType === TemplateType.SEQUENTIAL) score += 25;
        if (templateType === TemplateType.BULLET) score += 20;
        if (templateType === TemplateType.MINIMAL) score += 10;
        break;

      case CompletenessLevel.COMPREHENSIVE:
        if (templateType === TemplateType.TASK_IO) score += 35;
        if (templateType === TemplateType.SEQUENTIAL) score += 30;
        if (templateType === TemplateType.BULLET) score += 25;
        if (templateType === TemplateType.MINIMAL) score += 15;
        break;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate contextual relevance score
   */
  private calculateContextualRelevance(templateType: TemplateType, semantics: PromptSemantics): number {
    let score = 50; // Base score

    // Sequential context
    if (semantics.context.sequential) {
      if (templateType === TemplateType.SEQUENTIAL) score += 25;
      if (templateType === TemplateType.TASK_IO) score += 15;
      if (templateType === TemplateType.BULLET) score += 10;
      if (templateType === TemplateType.MINIMAL) score += 5;
    }

    // Organizational context
    if (semantics.context.organizational) {
      if (templateType === TemplateType.BULLET) score += 25;
      if (templateType === TemplateType.SEQUENTIAL) score += 20;
      if (templateType === TemplateType.TASK_IO) score += 15;
      if (templateType === TemplateType.MINIMAL) score += 10;
    }

    // Technical context
    if (semantics.context.technical) {
      if (templateType === TemplateType.TASK_IO) score += 25;
      if (templateType === TemplateType.SEQUENTIAL) score += 20;
      if (templateType === TemplateType.BULLET) score += 15;
      if (templateType === TemplateType.MINIMAL) score += 5;
    }

    // Creative context
    if (semantics.context.creative) {
      if (templateType === TemplateType.SEQUENTIAL) score += 20;
      if (templateType === TemplateType.BULLET) score += 15;
      if (templateType === TemplateType.MINIMAL) score += 10;
      if (templateType === TemplateType.TASK_IO) score += 5;
    }

    // Analytical context
    if (semantics.context.analytical) {
      if (templateType === TemplateType.BULLET) score += 25;
      if (templateType === TemplateType.TASK_IO) score += 20;
      if (templateType === TemplateType.SEQUENTIAL) score += 15;
      if (templateType === TemplateType.MINIMAL) score += 10;
    }

    // Conditional context
    if (semantics.context.conditional) {
      if (templateType === TemplateType.TASK_IO) score += 20;
      if (templateType === TemplateType.SEQUENTIAL) score += 15;
      if (templateType === TemplateType.BULLET) score += 10;
      if (templateType === TemplateType.MINIMAL) score += 5;
    }

    // Comparative context
    if (semantics.context.comparative) {
      if (templateType === TemplateType.BULLET) score += 30;
      if (templateType === TemplateType.TASK_IO) score += 15;
      if (templateType === TemplateType.SEQUENTIAL) score += 10;
      if (templateType === TemplateType.MINIMAL) score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(factors: Omit<TemplateSelectionFactors, 'overallScore'>): number {
    // Weighted scoring with emphasis on domain alignment and intent match
    const weights = {
      domainAlignment: 0.25,
      intentMatch: 0.25,
      complexityAppropriate: 0.20,
      completenessSupport: 0.15,
      contextualRelevance: 0.15
    };

    const weightedScore = 
      factors.domainAlignment * weights.domainAlignment +
      factors.intentMatch * weights.intentMatch +
      factors.complexityAppropriate * weights.complexityAppropriate +
      factors.completenessSupport * weights.completenessSupport +
      factors.contextualRelevance * weights.contextualRelevance;

    return Math.round(weightedScore);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    templateType: TemplateType,
    factors: TemplateSelectionFactors,
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult
  ): string[] {
    const reasoning: string[] = [];

    // Domain alignment reasoning
    if (factors.domainAlignment >= 80) {
      reasoning.push(`Excellent domain alignment (${factors.domainAlignment}%) for ${domainResult.domain} domain`);
    } else if (factors.domainAlignment >= 60) {
      reasoning.push(`Good domain alignment (${factors.domainAlignment}%) for ${domainResult.domain} domain`);
    } else if (factors.domainAlignment >= 40) {
      reasoning.push(`Moderate domain alignment (${factors.domainAlignment}%) for ${domainResult.domain} domain`);
    }

    // Intent match reasoning
    if (factors.intentMatch >= 80) {
      reasoning.push(`Strong intent match (${factors.intentMatch}%) for ${semantics.intentType} intent`);
    } else if (factors.intentMatch >= 60) {
      reasoning.push(`Good intent match (${factors.intentMatch}%) for ${semantics.intentType} intent`);
    }

    // Complexity reasoning
    if (factors.complexityAppropriate >= 80) {
      reasoning.push(`Highly appropriate for ${semantics.complexity} complexity level`);
    } else if (factors.complexityAppropriate >= 60) {
      reasoning.push(`Appropriate for ${semantics.complexity} complexity level`);
    }

    // Completeness reasoning
    if (factors.completenessSupport >= 80) {
      reasoning.push(`Excellent support for ${semantics.completeness} completeness level`);
    } else if (factors.completenessSupport >= 60) {
      reasoning.push(`Good support for ${semantics.completeness} completeness level`);
    }

    // Context reasoning
    const activeContexts = Object.entries(semantics.context)
      .filter(([_, active]) => active)
      .map(([context, _]) => context);

    if (activeContexts.length > 0 && factors.contextualRelevance >= 70) {
      reasoning.push(`Strong contextual relevance for: ${activeContexts.join(', ')}`);
    }

    // Overall score reasoning
    if (factors.overallScore >= 85) {
      reasoning.push(`Excellent overall match (${factors.overallScore}%)`);
    } else if (factors.overallScore >= 70) {
      reasoning.push(`Good overall match (${factors.overallScore}%)`);
    } else if (factors.overallScore >= 55) {
      reasoning.push(`Moderate overall match (${factors.overallScore}%)`);
    }

    return reasoning;
  }

  /**
   * Calculate selection confidence
   */
  private calculateSelectionConfidence(
    factors: TemplateSelectionFactors,
    semantics: PromptSemantics
  ): number {
    let confidence = factors.overallScore;

    // Boost confidence for high semantic confidence
    if (semantics.confidence >= 80) {
      confidence += 10;
    } else if (semantics.confidence >= 60) {
      confidence += 5;
    }

    // Boost confidence for high specificity
    if (semantics.specificity === SpecificityLevel.PRECISE) {
      confidence += 10;
    } else if (semantics.specificity === SpecificityLevel.SPECIFIC) {
      confidence += 5;
    }

    // Boost confidence for comprehensive completeness
    if (semantics.completeness === CompletenessLevel.COMPREHENSIVE) {
      confidence += 5;
    }

    return Math.min(100, Math.max(20, confidence));
  }
}
