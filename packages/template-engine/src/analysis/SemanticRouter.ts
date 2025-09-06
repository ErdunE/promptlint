/**
 * Semantic Router - ES Module
 * 
 * Intent-based template routing with semantic understanding
 * Phase 1.3 Context-Aware Template Selection Implementation
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType } from '../types/TemplateTypes.js';
import { 
  PromptSemantics, 
  TemplateRoutingResult,
  IntentType,
  ComplexityLevel,
  CompletenessLevel
} from '../types/SemanticTypes.js';
import { DomainClassificationResult, DomainType } from '@promptlint/domain-classifier';

export class SemanticRouter {
  /**
   * Route template selection based on semantic analysis
   */
  routeTemplate(
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult
  ): TemplateRoutingResult {
    const primaryTemplate = this.selectPrimaryTemplate(semantics, domainResult);
    const alternativeTemplates = this.selectAlternativeTemplates(semantics, domainResult, primaryTemplate);
    const routingReason = this.generateRoutingReason(semantics, domainResult, primaryTemplate);
    const confidence = this.calculateRoutingConfidence(semantics, domainResult, primaryTemplate);

    return {
      primaryTemplate,
      alternativeTemplates,
      routingReason,
      semanticContext: semantics,
      confidence
    };
  }

  /**
   * Select primary template based on semantic analysis
   */
  private selectPrimaryTemplate(
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult
  ): string {
    // Intent-based primary selection
    const intentTemplate = this.getIntentBasedTemplate(semantics.intentType, domainResult.domain);
    
    // Complexity-based refinement
    const complexityRefined = this.refineByComplexity(intentTemplate, semantics.complexity);
    
    // Completeness-based refinement
    const completenessRefined = this.refineByCompleteness(complexityRefined, semantics.completeness);
    
    // Context-based final refinement
    const contextRefined = this.refineByContext(completenessRefined, semantics.context);

    return contextRefined;
  }

  /**
   * Get template based on intent type and domain
   */
  private getIntentBasedTemplate(intentType: IntentType, domain: DomainType): string {
    // Intent-based template mapping with domain considerations
    switch (intentType) {
      case IntentType.INSTRUCTIONAL:
        if (domain === DomainType.CODE) {
          return TemplateType.TASK_IO.toString();
        } else if (domain === DomainType.ANALYSIS) {
          return TemplateType.BULLET.toString();
        } else if (domain === DomainType.WRITING) {
          return TemplateType.SEQUENTIAL.toString();
        } else {
          return TemplateType.SEQUENTIAL.toString();
        }

      case IntentType.CREATIVE:
        if (domain === DomainType.WRITING) {
          return TemplateType.SEQUENTIAL.toString();
        } else if (domain === DomainType.CODE) {
          return TemplateType.MINIMAL.toString();
        } else {
          return TemplateType.BULLET.toString();
        }

      case IntentType.ANALYTICAL:
        if (domain === DomainType.ANALYSIS) {
          return TemplateType.BULLET.toString();
        } else if (domain === DomainType.RESEARCH) {
          return TemplateType.BULLET.toString();
        } else {
          return TemplateType.TASK_IO.toString();
        }

      case IntentType.COMPARATIVE:
        return TemplateType.BULLET.toString(); // Best for comparisons

      case IntentType.PLANNING:
        if (domain === DomainType.RESEARCH) {
          return TemplateType.BULLET.toString();
        } else if (domain === DomainType.CODE) {
          return TemplateType.SEQUENTIAL.toString();
        } else {
          return TemplateType.BULLET.toString();
        }

      case IntentType.DEBUGGING:
        if (domain === DomainType.CODE) {
          return TemplateType.SEQUENTIAL.toString();
        } else {
          return TemplateType.TASK_IO.toString();
        }

      case IntentType.EXPLANATORY:
        if (domain === DomainType.WRITING) {
          return TemplateType.SEQUENTIAL.toString();
        } else if (domain === DomainType.ANALYSIS) {
          return TemplateType.BULLET.toString();
        } else {
          return TemplateType.SEQUENTIAL.toString();
        }

      case IntentType.GENERATIVE:
        if (domain === DomainType.CODE) {
          return TemplateType.MINIMAL.toString();
        } else if (domain === DomainType.WRITING) {
          return TemplateType.SEQUENTIAL.toString();
        } else {
          return TemplateType.MINIMAL.toString();
        }

      default:
        return TemplateType.MINIMAL.toString();
    }
  }

  /**
   * Refine template selection based on complexity
   */
  private refineByComplexity(template: string, complexity: ComplexityLevel): string {
    switch (complexity) {
      case ComplexityLevel.SIMPLE:
        // Simple prompts work well with minimal or bullet templates
        if (template === TemplateType.TASK_IO.toString()) {
          return TemplateType.MINIMAL.toString();
        }
        return template;

      case ComplexityLevel.MODERATE:
        // Moderate complexity can use most templates
        return template;

      case ComplexityLevel.COMPLEX:
        // Complex prompts benefit from structured templates
        if (template === TemplateType.MINIMAL.toString()) {
          return TemplateType.BULLET.toString();
        }
        return template;

      case ComplexityLevel.EXPERT:
        // Expert-level prompts need the most structured templates
        if (template === TemplateType.MINIMAL.toString()) {
          return TemplateType.TASK_IO.toString();
        } else if (template === TemplateType.BULLET.toString()) {
          return TemplateType.TASK_IO.toString();
        }
        return template;

      default:
        return template;
    }
  }

  /**
   * Refine template selection based on completeness
   */
  private refineByCompleteness(template: string, completeness: CompletenessLevel): string {
    switch (completeness) {
      case CompletenessLevel.MINIMAL:
        // Minimal prompts work well with minimal templates
        if (template === TemplateType.TASK_IO.toString()) {
          return TemplateType.MINIMAL.toString();
        }
        return template;

      case CompletenessLevel.PARTIAL:
        // Partial prompts can use bullet or sequential templates
        if (template === TemplateType.TASK_IO.toString()) {
          return TemplateType.BULLET.toString();
        }
        return template;

      case CompletenessLevel.DETAILED:
        // Detailed prompts work well with most templates
        return template;

      case CompletenessLevel.COMPREHENSIVE:
        // Comprehensive prompts benefit from structured templates
        if (template === TemplateType.MINIMAL.toString()) {
          return TemplateType.TASK_IO.toString();
        }
        return template;

      default:
        return template;
    }
  }

  /**
   * Refine template selection based on context markers
   */
  private refineByContext(template: string, context: any): string {
    // Sequential context favors sequential templates
    if (context.sequential && template !== TemplateType.SEQUENTIAL.toString()) {
      return TemplateType.SEQUENTIAL.toString();
    }

    // Organizational context favors bullet templates
    if (context.organizational && template !== TemplateType.BULLET.toString()) {
      return TemplateType.BULLET.toString();
    }

    // Technical context favors task-io templates
    if (context.technical && template !== TemplateType.TASK_IO.toString()) {
      return TemplateType.TASK_IO.toString();
    }

    // Comparative context strongly favors bullet templates
    if (context.comparative && template !== TemplateType.BULLET.toString()) {
      return TemplateType.BULLET.toString();
    }

    // Conditional context favors task-io templates
    if (context.conditional && template !== TemplateType.TASK_IO.toString()) {
      return TemplateType.TASK_IO.toString();
    }

    return template;
  }

  /**
   * Select alternative templates for variety
   */
  private selectAlternativeTemplates(
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult,
    primaryTemplate: string
  ): string[] {
    const alternatives: string[] = [];
    const allTemplates = [
      TemplateType.TASK_IO.toString(),
      TemplateType.BULLET.toString(),
      TemplateType.SEQUENTIAL.toString(),
      TemplateType.MINIMAL.toString()
    ];

    // Remove primary template from alternatives
    const availableTemplates = allTemplates.filter(t => t !== primaryTemplate);

    // Select alternatives based on semantic analysis
    for (const template of availableTemplates) {
      const score = this.scoreAlternativeTemplate(template, semantics, domainResult);
      if (score >= 60) { // Only include good alternatives
        alternatives.push(template);
      }
    }

    // Sort by score and limit to 2 alternatives
    return alternatives.slice(0, 2);
  }

  /**
   * Score alternative template for selection
   */
  private scoreAlternativeTemplate(
    template: string,
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult
  ): number {
    let score = 50; // Base score

    // Intent-based scoring
    switch (semantics.intentType) {
      case IntentType.INSTRUCTIONAL:
        if (template === TemplateType.SEQUENTIAL.toString()) score += 20;
        if (template === TemplateType.BULLET.toString()) score += 15;
        if (template === TemplateType.TASK_IO.toString()) score += 25;
        break;

      case IntentType.ANALYTICAL:
        if (template === TemplateType.BULLET.toString()) score += 25;
        if (template === TemplateType.TASK_IO.toString()) score += 20;
        if (template === TemplateType.SEQUENTIAL.toString()) score += 15;
        break;

      case IntentType.CREATIVE:
        if (template === TemplateType.SEQUENTIAL.toString()) score += 20;
        if (template === TemplateType.BULLET.toString()) score += 15;
        if (template === TemplateType.MINIMAL.toString()) score += 10;
        break;

      case IntentType.COMPARATIVE:
        if (template === TemplateType.BULLET.toString()) score += 30;
        if (template === TemplateType.TASK_IO.toString()) score += 15;
        break;

      case IntentType.PLANNING:
        if (template === TemplateType.BULLET.toString()) score += 25;
        if (template === TemplateType.SEQUENTIAL.toString()) score += 20;
        if (template === TemplateType.TASK_IO.toString()) score += 15;
        break;

      case IntentType.DEBUGGING:
        if (template === TemplateType.SEQUENTIAL.toString()) score += 25;
        if (template === TemplateType.TASK_IO.toString()) score += 20;
        if (template === TemplateType.BULLET.toString()) score += 15;
        break;

      case IntentType.EXPLANATORY:
        if (template === TemplateType.SEQUENTIAL.toString()) score += 20;
        if (template === TemplateType.BULLET.toString()) score += 15;
        if (template === TemplateType.MINIMAL.toString()) score += 10;
        break;

      case IntentType.GENERATIVE:
        if (template === TemplateType.MINIMAL.toString()) score += 20;
        if (template === TemplateType.SEQUENTIAL.toString()) score += 15;
        if (template === TemplateType.BULLET.toString()) score += 10;
        break;
    }

    // Domain-based scoring
    switch (domainResult.domain) {
      case DomainType.CODE:
        if (template === TemplateType.TASK_IO.toString()) score += 15;
        if (template === TemplateType.SEQUENTIAL.toString()) score += 10;
        break;

      case DomainType.ANALYSIS:
        if (template === TemplateType.BULLET.toString()) score += 15;
        if (template === TemplateType.TASK_IO.toString()) score += 10;
        break;

      case DomainType.WRITING:
        if (template === TemplateType.SEQUENTIAL.toString()) score += 15;
        if (template === TemplateType.BULLET.toString()) score += 10;
        break;

      case DomainType.RESEARCH:
        if (template === TemplateType.BULLET.toString()) score += 15;
        if (template === TemplateType.SEQUENTIAL.toString()) score += 10;
        break;
    }

    // Context-based scoring
    if (semantics.context.sequential && template === TemplateType.SEQUENTIAL.toString()) {
      score += 15;
    }
    if (semantics.context.organizational && template === TemplateType.BULLET.toString()) {
      score += 15;
    }
    if (semantics.context.technical && template === TemplateType.TASK_IO.toString()) {
      score += 15;
    }
    if (semantics.context.comparative && template === TemplateType.BULLET.toString()) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate routing reason
   */
  private generateRoutingReason(
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult,
    primaryTemplate: string
  ): string {
    const reasons: string[] = [];

    // Intent-based reason
    reasons.push(`Selected ${primaryTemplate} template for ${semantics.intentType} intent`);

    // Domain-based reason
    reasons.push(`Optimized for ${domainResult.domain} domain (${domainResult.confidence}% confidence)`);

    // Complexity-based reason
    if (semantics.complexity === ComplexityLevel.EXPERT || semantics.complexity === ComplexityLevel.COMPLEX) {
      reasons.push(`Structured template for ${semantics.complexity} complexity`);
    }

    // Context-based reason
    const activeContexts = Object.entries(semantics.context)
      .filter(([_, active]) => active)
      .map(([context, _]) => context);

    if (activeContexts.length > 0) {
      reasons.push(`Context-aware selection for: ${activeContexts.join(', ')}`);
    }

    // Completeness-based reason
    if (semantics.completeness === CompletenessLevel.COMPREHENSIVE) {
      reasons.push('Comprehensive template for detailed requirements');
    } else if (semantics.completeness === CompletenessLevel.MINIMAL) {
      reasons.push('Minimal template for basic requirements');
    }

    return reasons.join('; ');
  }

  /**
   * Calculate routing confidence
   */
  private calculateRoutingConfidence(
    semantics: PromptSemantics,
    domainResult: DomainClassificationResult,
    primaryTemplate: string
  ): number {
    let confidence = 70; // Base confidence

    // Boost for high semantic confidence
    if (semantics.confidence >= 80) {
      confidence += 15;
    } else if (semantics.confidence >= 60) {
      confidence += 10;
    }

    // Boost for high domain confidence
    if (domainResult.confidence >= 80) {
      confidence += 10;
    } else if (domainResult.confidence >= 60) {
      confidence += 5;
    }

    // Boost for specific intent types
    if (semantics.intentType === IntentType.INSTRUCTIONAL || 
        semantics.intentType === IntentType.ANALYTICAL ||
        semantics.intentType === IntentType.DEBUGGING) {
      confidence += 5;
    }

    // Boost for high complexity (more predictable)
    if (semantics.complexity === ComplexityLevel.EXPERT || 
        semantics.complexity === ComplexityLevel.COMPLEX) {
      confidence += 5;
    }

    // Boost for comprehensive completeness
    if (semantics.completeness === CompletenessLevel.COMPREHENSIVE) {
      confidence += 5;
    }

    return Math.min(100, Math.max(20, confidence));
  }
}
