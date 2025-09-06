/**
 * Confidence Calibrator - ES Module
 * 
 * Advanced confidence calibration for edge cases
 * Phase 1.3 Context-Aware Template Selection Implementation
 * Chrome Extension Compatible - Browser APIs Only
 */

import { DomainClassificationResult, DomainType } from '@promptlint/domain-classifier';
import { PromptSemantics, ConfidenceCalibrationFactors } from '../types/SemanticTypes.js';

export class ConfidenceCalibrator {
  /**
   * Refine confidence based on semantic analysis and domain context
   */
  refineConfidence(
    baseConfidence: number,
    domainResult: DomainClassificationResult,
    semantics: PromptSemantics
  ): ConfidenceCalibrationFactors {
    let semanticBoost = 0;
    let domainAlignment = 0;
    let specificityBonus = 0;
    let contextRelevance = 0;

    // API development confidence boosting (REST API prompts)
    if (this.isApiDevelopmentPrompt(domainResult, semantics)) {
      semanticBoost += 25;
      domainAlignment += 20;
      specificityBonus += 15;
      contextRelevance += 10;
    }

    // Project planning should not be code domain
    if (this.isProjectPlanningPrompt(semantics)) {
      if (domainResult.domain === DomainType.CODE) {
        // Recalibrate for non-technical domains
        const recalibrated = this.recalibrateForNonTechnicalDomains(baseConfidence, semantics);
        return {
          baseConfidence,
          semanticBoost: -20, // Reduce confidence for misclassification
          domainAlignment: -30,
          specificityBonus: 0,
          contextRelevance: 0,
          finalConfidence: recalibrated
        };
      } else {
        semanticBoost += 15;
        domainAlignment += 10;
        contextRelevance += 15;
      }
    }

    // Performance debugging confidence enhancement
    if (this.isPerformanceDebuggingPrompt(domainResult, semantics)) {
      semanticBoost += 25; // Increased from 20
      domainAlignment += 20; // Increased from 15
      specificityBonus += 15; // Increased from 10
      contextRelevance += 15; // Increased from 10
    }

    // Additional debugging boost for simple debugging prompts
    if (semantics.intentType === 'debugging' && domainResult.domain === DomainType.CODE) {
      semanticBoost += 10;
      domainAlignment += 10;
    }

    // High specificity bonus
    if (semantics.specificity === 'precise' || semantics.specificity === 'specific') {
      specificityBonus += 10;
    }

    // Context relevance bonus
    const contextCount = Object.values(semantics.context).filter(Boolean).length;
    contextRelevance += contextCount * 3;

    // Intent-specific bonuses
    if (semantics.intentType === 'instructional' && domainResult.domain === DomainType.CODE) {
      semanticBoost += 10;
      domainAlignment += 10;
      
      // Extra boost for build/create artifact patterns (detected from domain indicators)
      const indicators = domainResult.indicators.join(' ').toLowerCase();
      if (indicators.includes('build') || indicators.includes('create') || indicators.includes('develop')) {
        semanticBoost += 25; // Strong instructional-code signal
        domainAlignment += 15;
        contextRelevance += 10;
      }
    }

    if (semantics.intentType === 'debugging' && domainResult.domain === DomainType.CODE) {
      semanticBoost += 15;
      domainAlignment += 15;
    }

    // Perfect intent-domain alignment bonuses
    if (semantics.intentType === 'analytical' && domainResult.domain === DomainType.ANALYSIS) {
      semanticBoost += 15;
      domainAlignment += 15;
      contextRelevance += 10;
    }

    if (semantics.intentType === 'creative' && domainResult.domain === DomainType.WRITING) {
      semanticBoost += 12;
      domainAlignment += 12;
      contextRelevance += 8;
    }

    if (semantics.intentType === 'explanatory' && domainResult.domain === DomainType.WRITING) {
      semanticBoost += 20;
      domainAlignment += 15;
      contextRelevance += 10; // Documentation bonus
    }

    if (semantics.intentType === 'investigative' && domainResult.domain === DomainType.RESEARCH) {
      semanticBoost += 15;
      domainAlignment += 12;
      contextRelevance += 8;
    }

    if (semantics.intentType === 'comparative') {
      semanticBoost += 18; // Comparative intent is often undervalued
      domainAlignment += 12;
      contextRelevance += 10;
    }

    // Complexity-based adjustments
    if (semantics.complexity === 'expert' && semantics.completeness === 'comprehensive') {
      semanticBoost += 10;
    }

    // High base confidence bonus (reward already good prompts)
    if (baseConfidence >= 80) {
      semanticBoost += 8;
      domainAlignment += 5;
    } else if (baseConfidence >= 70) {
      semanticBoost += 5;
      domainAlignment += 3;
    }

    // Calculate final confidence
    const finalConfidence = Math.min(100, Math.max(20, 
      baseConfidence + semanticBoost + domainAlignment + specificityBonus + contextRelevance
    ));

    return {
      baseConfidence,
      semanticBoost,
      domainAlignment,
      specificityBonus,
      contextRelevance,
      finalConfidence
    };
  }

  /**
   * Check if prompt is API development related
   */
  private isApiDevelopmentPrompt(
    domainResult: DomainClassificationResult, 
    semantics: PromptSemantics
  ): boolean {
    const apiKeywords = [
      'rest api', 'api', 'endpoint', 'http', 'request', 'response',
      'crud', 'get', 'post', 'put', 'delete', 'patch',
      'json', 'xml', 'authentication', 'authorization',
      'swagger', 'openapi', 'graphql', 'soap'
    ];

    const prompt = domainResult.indicators.join(' ').toLowerCase();
    const hasApiKeywords = apiKeywords.some(keyword => prompt.includes(keyword));
    
    return (
      domainResult.domain === DomainType.CODE &&
      (hasApiKeywords || 
       semantics.context.technical ||
       semantics.specificity === 'specific' ||
       semantics.specificity === 'precise') &&
      (semantics.intentType === 'instructional' || semantics.intentType === 'generative')
    );
  }

  /**
   * Check if prompt is project planning related
   */
  private isProjectPlanningPrompt(semantics: PromptSemantics): boolean {
    const planningKeywords = [
      'outline', 'plan', 'roadmap', 'strategy', 'timeline',
      'milestone', 'goal', 'objective', 'project', 'organize',
      'structure', 'framework', 'approach', 'schedule'
    ];

    const hasPlanningIntent = semantics.intentType === 'planning';
    const hasOrganizationalContext = semantics.context.organizational;
    const hasPlanningKeywords = planningKeywords.some(keyword => 
      semantics.indicators.some(indicator => indicator.toLowerCase().includes(keyword))
    );

    return hasPlanningIntent || hasOrganizationalContext || hasPlanningKeywords;
  }

  /**
   * Check if prompt is performance debugging related
   */
  private isPerformanceDebuggingPrompt(
    domainResult: DomainClassificationResult,
    semantics: PromptSemantics
  ): boolean {
    const debuggingKeywords = [
      'debug', 'performance', 'optimize', 'slow', 'fast', 'speed',
      'memory', 'cpu', 'bottleneck', 'issue', 'problem', 'fix',
      'troubleshoot', 'profiling', 'monitoring', 'metrics'
    ];

    const prompt = domainResult.indicators.join(' ').toLowerCase();
    const hasDebuggingKeywords = debuggingKeywords.some(keyword => prompt.includes(keyword));
    
    return (
      domainResult.domain === DomainType.CODE &&
      (hasDebuggingKeywords ||
       semantics.intentType === 'debugging' ||
       semantics.context.analytical) &&
      semantics.complexity !== 'simple'
    );
  }

  /**
   * Recalibrate confidence for non-technical domains
   */
  private recalibrateForNonTechnicalDomains(
    baseConfidence: number, 
    semantics: PromptSemantics
  ): number {
    // Reduce confidence for misclassified technical prompts
    let recalibratedConfidence = baseConfidence * 0.6;

    // Strong boost for appropriate non-technical domains
    if (semantics.intentType === 'planning') {
      recalibratedConfidence += 30; // Planning should be high confidence (increased from 20)
    }

    if (semantics.context.organizational) {
      recalibratedConfidence += 20; // Increased from 15
    }

    if (semantics.completeness === 'detailed' || semantics.completeness === 'comprehensive') {
      recalibratedConfidence += 10;
    }

    // Additional boost for clear planning indicators
    if (semantics.intentType === 'planning' && semantics.context.organizational) {
      recalibratedConfidence += 10; // Extra boost for strong planning signals
    }

    return Math.min(100, Math.max(20, recalibratedConfidence));
  }

  /**
   * Apply domain-specific confidence adjustments
   */
  applyDomainSpecificAdjustments(
    baseConfidence: number,
    domainResult: DomainClassificationResult,
    semantics: PromptSemantics
  ): number {
    let adjustedConfidence = baseConfidence;

    // Code domain adjustments
    if (domainResult.domain === DomainType.CODE) {
      // Boost for technical specificity
      if (semantics.specificity === 'precise' || semantics.specificity === 'specific') {
        adjustedConfidence += 15;
      }

      // Boost for technical context
      if (semantics.context.technical) {
        adjustedConfidence += 10;
      }

      // Boost for instructional intent in code domain
      if (semantics.intentType === 'instructional') {
        adjustedConfidence += 10;
      }
    }

    // Analysis domain adjustments
    if (domainResult.domain === DomainType.ANALYSIS) {
      // Boost for analytical intent
      if (semantics.intentType === 'analytical') {
        adjustedConfidence += 15;
      }

      // Boost for analytical context
      if (semantics.context.analytical) {
        adjustedConfidence += 10;
      }

      // Boost for comparative intent
      if (semantics.intentType === 'comparative') {
        adjustedConfidence += 10;
      }
    }

    // Writing domain adjustments
    if (domainResult.domain === DomainType.WRITING) {
      // Boost for creative intent
      if (semantics.intentType === 'creative') {
        adjustedConfidence += 15;
      }

      // Boost for creative context
      if (semantics.context.creative) {
        adjustedConfidence += 10;
      }

      // Boost for explanatory intent
      if (semantics.intentType === 'explanatory') {
        adjustedConfidence += 10;
      }
    }

    // Research domain adjustments
    if (domainResult.domain === DomainType.RESEARCH) {
      // Boost for planning intent
      if (semantics.intentType === 'planning') {
        adjustedConfidence += 15;
      }

      // Boost for organizational context
      if (semantics.context.organizational) {
        adjustedConfidence += 10;
      }

      // Boost for analytical intent
      if (semantics.intentType === 'analytical') {
        adjustedConfidence += 10;
      }
    }

    return Math.min(100, Math.max(20, adjustedConfidence));
  }

  /**
   * Validate confidence distribution
   */
  validateConfidenceDistribution(confidence: number): number {
    // Ensure confidence is within reasonable bounds
    if (confidence < 20) {
      return 20; // Minimum confidence
    }
    
    if (confidence > 100) {
      return 100; // Maximum confidence
    }

    // Smooth confidence distribution
    if (confidence >= 90) {
      return Math.min(95, confidence); // Cap very high confidence
    }
    
    if (confidence >= 80) {
      return Math.min(89, confidence); // Cap high confidence
    }
    
    if (confidence >= 70) {
      return Math.min(79, confidence); // Cap moderate-high confidence
    }
    
    if (confidence >= 60) {
      return Math.min(69, confidence); // Cap moderate confidence
    }
    
    if (confidence >= 50) {
      return Math.min(59, confidence); // Cap moderate-low confidence
    }
    
    if (confidence >= 40) {
      return Math.min(49, confidence); // Cap low confidence
    }
    
    return Math.max(20, confidence); // Ensure minimum confidence
  }
}
