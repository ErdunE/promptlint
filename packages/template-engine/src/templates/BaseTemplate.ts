/**
 * Base Template Abstract Class - ES Module
 * 
 * Provides common functionality and enforces interface for all template implementations
 * Ensures faithfulness principles and performance requirements are met
 * Chrome Extension Compatible - Browser APIs Only
 */

import {
  TemplateType,
  TemplateCandidate,
  TemplateContext,
  TemplateGenerationContext,
  FaithfulnessResult,
  FaithfulnessViolationType,
  IBaseTemplate
} from '../types/TemplateTypes.js';
import { LintRuleType } from '../../../shared-types/dist/index.js';

/**
 * Abstract base class for all template implementations
 * 
 * CRITICAL REQUIREMENTS:
 * - All templates MUST preserve 100% of user intent
 * - All templates MUST complete generation within performance limits
 * - All templates MUST pass faithfulness validation
 * - All code MUST be browser-compatible (no Node.js APIs)
 */
export abstract class BaseTemplate implements IBaseTemplate {
  /** Template type identifier */
  abstract readonly type: TemplateType;
  
  /** Human-readable template name */
  abstract readonly name: string;
  
  /** Template description */
  abstract readonly description: string;
  
  /**
   * Apply template to generate candidate
   * 
   * @param context - Template application context
   * @returns Generated template candidate
   */
  abstract apply(context: TemplateContext): TemplateCandidate;

  /**
   * Generate template content (required by IBaseTemplate)
   */
  async generate(context: TemplateGenerationContext): Promise<string> {
    const candidate = this.apply(context);
    return candidate.content;
  }

  /**
   * Validate template faithfulness (required by IBaseTemplate)
   */
  async validateFaithfulness(original: string, generated: string): Promise<FaithfulnessResult> {
    // Basic faithfulness check - can be overridden by subclasses
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const generatedWords = new Set(generated.toLowerCase().split(/\s+/));
    
    const commonWords = Array.from(originalWords).filter(word => generatedWords.has(word));
    const faithfulnessScore = commonWords.length / originalWords.size * 100;
    
    return {
      passed: faithfulnessScore >= 70, // 70% word overlap threshold
      issues: faithfulnessScore < 70 ? [{
        type: FaithfulnessViolationType.CONTENT_DRIFT,
        description: `Low content overlap: ${faithfulnessScore.toFixed(1)}%`,
        severity: 'medium' as const
      }] : [],
      details: `Faithfulness score: ${faithfulnessScore.toFixed(1)}% (${commonWords.length}/${originalWords.size} words)`,
      score: faithfulnessScore,
      // Backward compatibility
      isValid: faithfulnessScore >= 70,
      violations: faithfulnessScore < 70 ? [{
        type: FaithfulnessViolationType.CONTENT_DRIFT,
        description: `Low content overlap: ${faithfulnessScore.toFixed(1)}%`,
        severity: 'medium' as const
      }] : [],
      report: `Faithfulness score: ${faithfulnessScore.toFixed(1)}% (${commonWords.length}/${originalWords.size} words)`
    };
  }

  /**
   * Get template metadata (required by IBaseTemplate)
   */
  getMetadata(): any {
    return {
      templateType: this.constructor.name,
      capabilities: ['basic_generation'],
      version: '1.0.0'
    };
  }
  
  /**
   * Check if template is suitable for given context
   * 
   * @param context - Template context to evaluate
   * @returns Whether template is suitable
   */
  abstract isSuitable(context: TemplateContext): boolean;
  
  /**
   * Get template priority for given context
   * 
   * @param context - Template context to evaluate
   * @returns Priority score (higher = more preferred)
   */
  abstract getPriority(context: TemplateContext): number;
  
  /**
   * Extract task information from context
   * 
   * @param context - Template context
   * @returns Extracted task information
   */
  protected extractTaskInfo(context: TemplateContext): {
    actionVerb?: string;
    objective?: string;
    inputSpec?: string;
    outputSpec?: string;
    constraints?: string[];
  } {
    const prompt = context.prompt;
    const cleanPrompt = prompt.toLowerCase().trim();
    
    // Extract action verb
    const actionVerbs = [
      // Original verbs
      'implement', 'create', 'build', 'develop', 'write', 'generate', 'design',
      'make', 'construct', 'program', 'code', 'architect', 'engineer',
      // Missing critical verbs identified in investigation
      'optimize', 'debug', 'analyze', 'refactor', 'fix', 'improve', 'enhance',
      'test', 'validate', 'review', 'audit', 'monitor', 'troubleshoot'
    ];
    
    let actionVerb: string | undefined;
    let bestMatch: { verb: string; position: number } | null = null;
    
    // Find the best verb match (earliest position in prompt)
    for (const verb of actionVerbs) {
      const position = cleanPrompt.indexOf(verb);
      if (position !== -1) {
        // Prefer verbs that appear at the beginning of the prompt
        if (!bestMatch || position < bestMatch.position) {
          bestMatch = { verb, position };
        }
      }
    }
    
    if (bestMatch) {
      actionVerb = bestMatch.verb;
    }
    
    // Extract objective (text after action verb)
    let objective: string | undefined;
    if (actionVerb) {
      // FIX: Use word boundary regex instead of indexOf for proper verb matching
      const verbRegex = new RegExp(`\\b${actionVerb}\\b`, 'i');
      const match = cleanPrompt.match(verbRegex);
      
      if (match && match.index !== undefined) {
        // Use word boundary match
        const verbIndex = match.index;
        const afterVerb = cleanPrompt.substring(verbIndex + actionVerb.length).trim();
        if (afterVerb) {
          objective = afterVerb.split('.')[0].trim();
        }
      } else {
        // Fallback: if no word boundary match, use the full prompt as objective
        // This handles cases where partial matches would cause corruption
        objective = cleanPrompt.split('.')[0].trim();
        
        // Remove the verb if it appears at the start
        if (objective) {
          const startsWithVerb = new RegExp(`^${actionVerb}\\s+`, 'i');
          if (startsWithVerb.test(objective)) {
            objective = objective.replace(startsWithVerb, '').trim();
          }
        }
      }
    }
    
    // Extract input/output specifications
    const inputSpec = this.extractSpecification(cleanPrompt, ['input', 'given', 'with', 'using']);
    const outputSpec = this.extractSpecification(cleanPrompt, ['output', 'result', 'return', 'generate']);
    
    // Extract constraints
    const constraints = this.extractConstraints(cleanPrompt);
    
    return {
      ...(actionVerb && { actionVerb }),
      ...(objective && { objective }),
      ...(inputSpec && { inputSpec }),
      ...(outputSpec && { outputSpec }),
      ...(constraints.length > 0 && { constraints })
    };
  }
  
  /**
   * Extract specification keywords from prompt
   */
  private extractSpecification(prompt: string, keywords: string[]): string | undefined {
    for (const keyword of keywords) {
      const index = prompt.indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = prompt.substring(index + keyword.length).trim();
        if (afterKeyword) {
          return afterKeyword.split('.')[0].trim();
        }
      }
    }
    return undefined;
  }
  
  /**
   * Extract constraints from prompt
   */
  private extractConstraints(prompt: string): string[] {
    const constraints: string[] = [];
    const constraintKeywords = ['must', 'should', 'cannot', 'avoid', 'ensure', 'require'];
    
    for (const keyword of constraintKeywords) {
      if (prompt.includes(keyword)) {
        const sentences = prompt.split('.');
        for (const sentence of sentences) {
          if (sentence.includes(keyword)) {
            constraints.push(sentence.trim());
          }
        }
      }
    }
    
    return constraints;
  }
  
  /**
   * Check if context has specific lint issue
   */
  protected hasLintIssue(context: TemplateContext, issueType: LintRuleType): boolean {
    return context.lintResult.issues.some((issue: any) => issue.type === issueType);
  }
  
  /**
   * Get professional action verb
   */
  protected getProfessionalActionVerb(context: TemplateContext): string {
    const taskInfo = this.extractTaskInfo(context);
    
    // If we found a verb, capitalize and use it
    if (taskInfo.actionVerb) {
      return this.capitalizeFirstLetter(taskInfo.actionVerb);
    }
    
    // Only default to 'Create' if no verb found at all
    return 'Create';
  }
  
  /**
   * Clean and format prompt text
   */
  protected cleanPrompt(prompt: string): string {
    return prompt.trim()
      .replace(/\s+/g, ' ')
      .replace(/[.]{2,}/g, '.')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?');
  }
  
  /**
   * Clean template content while preserving line breaks
   */
  protected cleanTemplateContent(content: string): string {
    return content.trim()
      .replace(/[.]{2,}/g, '.')
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?');
  }
  
  /**
   * Generate candidate with common structure
   */
  protected generateCandidate(
    _context: TemplateContext,
    content: string,
    score: number = 0.8
  ): TemplateCandidate {
    return {
      id: this.generateId(),
      type: this.type,
      content: this.cleanTemplateContent(content),
      score,
      faithfulnessValidated: true,
      generationTime: 0,
      metadata: {
        templateType: this.type
      }
    };
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Capitalize first letter of a string
   */
  protected capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}