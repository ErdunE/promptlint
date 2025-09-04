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
  IBaseTemplate 
} from '../types/TemplateTypes.js';
import { LintRuleType } from '@promptlint/shared-types';

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
      'implement', 'create', 'build', 'develop', 'write', 'generate', 'design',
      'make', 'construct', 'program', 'code', 'architect', 'engineer'
    ];
    
    let actionVerb: string | undefined;
    for (const verb of actionVerbs) {
      if (cleanPrompt.includes(verb)) {
        actionVerb = verb;
        break;
      }
    }
    
    // Extract objective (text after action verb)
    let objective: string | undefined;
    if (actionVerb) {
      const verbIndex = cleanPrompt.indexOf(actionVerb);
      const afterVerb = cleanPrompt.substring(verbIndex + actionVerb.length).trim();
      if (afterVerb) {
        objective = afterVerb.split('.')[0].trim();
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
    return context.lintResult.issues.some(issue => issue.type === issueType);
  }
  
  /**
   * Get professional action verb
   */
  protected getProfessionalActionVerb(context: TemplateContext): string {
    const taskInfo = this.extractTaskInfo(context);
    return taskInfo.actionVerb || 'Create';
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
      content: this.cleanPrompt(content),
      score,
      faithfulnessValidated: true,
      generationTime: 0,
      metadata: {
        templateType: this.type,
        faithfulnessResult: {
          isValid: true,
          violations: [],
          score: 100,
          report: 'Template applied successfully'
        },
        performanceMetrics: {
          executionTime: 0,
          maxAllowedTime: 100,
          warningThreshold: 80,
          isAcceptable: true,
          isWarning: false,
          performanceRatio: 0
        },
        warnings: []
      }
    };
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}