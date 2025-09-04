/**
 * Minimal Template - ES Module
 * 
 * Basic cleanup and professional formatting for well-structured prompts
 * Used when few issues are detected or as fallback option
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateCandidate, TemplateContext } from '../types/TemplateTypes.js';
import { LintRuleType } from '@promptlint/shared-types';
import { BaseTemplate } from './BaseTemplate.js';

export class MinimalTemplate extends BaseTemplate {
  readonly type = TemplateType.MINIMAL;
  readonly name = 'Minimal Template';
  readonly description = 'Basic cleanup and professional formatting for well-structured prompts';
  
  /**
   * Apply minimal template cleanup
   */
  apply(context: TemplateContext): TemplateCandidate {
    const prompt = context.prompt;
    let cleanedPrompt = this.cleanPrompt(prompt);
    
    // Apply minimal professional improvements
    cleanedPrompt = this.improveProfessionalTone(cleanedPrompt);
    cleanedPrompt = this.addMissingPunctuation(cleanedPrompt);
    cleanedPrompt = this.capitalizeFirstLetter(cleanedPrompt);
    
    // Add minimal structure if completely unstructured
    if (this.needsBasicStructure(context)) {
      cleanedPrompt = this.addBasicStructure(cleanedPrompt, context);
    }
    
    return this.generateCandidate(context, cleanedPrompt, 0.7);
  }
  
  /**
   * Check if template is suitable for context
   */
  isSuitable(context: TemplateContext): boolean {
    // Suitable for prompts with few issues (score > 70) or as fallback
    return context.lintResult.score > 70 || context.lintResult.issues.length <= 2;
  }
  
  /**
   * Get priority for this template
   */
  getPriority(context: TemplateContext): number {
    let priority = 0.2; // Base priority (lowest)
    
    // Higher priority for high-scoring prompts
    if (context.lintResult.score > 70) {
      priority += 0.3;
    }
    
    // Higher priority for prompts with few issues
    if (context.lintResult.issues.length <= 1) {
      priority += 0.2;
    }
    
    return Math.min(priority, 1.0);
  }
  
  /**
   * Improve professional tone
   */
  private improveProfessionalTone(prompt: string): string {
    let improved = prompt;
    
    // Replace casual language with professional equivalents
    const replacements = [
      { from: /\bcan you\b/gi, to: 'please' },
      { from: /\bkinda\b/gi, to: 'somewhat' },
      { from: /\bgonna\b/gi, to: 'going to' },
      { from: /\bwanna\b/gi, to: 'want to' },
      { from: /\bu\b/gi, to: 'you' },
      { from: /\br\b/gi, to: 'are' }
    ];
    
    for (const replacement of replacements) {
      improved = improved.replace(replacement.from, replacement.to);
    }
    
    return improved;
  }
  
  /**
   * Add missing punctuation
   */
  private addMissingPunctuation(prompt: string): string {
    let punctuated = prompt.trim();
    
    // Add period if missing at end
    if (punctuated && !/[.!?]$/.test(punctuated)) {
      punctuated += '.';
    }
    
    return punctuated;
  }
  
  /**
   * Capitalize first letter
   */
  private capitalizeFirstLetter(prompt: string): string {
    if (!prompt) return prompt;
    return prompt.charAt(0).toUpperCase() + prompt.slice(1);
  }
  
  /**
   * Check if prompt needs basic structure
   */
  private needsBasicStructure(context: TemplateContext): boolean {
    return this.hasLintIssue(context, LintRuleType.MISSING_TASK_VERB) ||
           this.hasLintIssue(context, LintRuleType.VAGUE_WORDING);
  }
  
  /**
   * Add basic structure to unstructured prompt
   */
  private addBasicStructure(prompt: string, context: TemplateContext): string {
    let structured = prompt;
    
    // Add action verb if missing
    if (this.hasLintIssue(context, LintRuleType.MISSING_TASK_VERB)) {
      const actionVerb = this.getProfessionalActionVerb(context);
      if (!structured.toLowerCase().includes(actionVerb.toLowerCase())) {
        structured = `${actionVerb} ${structured.toLowerCase()}`;
      }
    }
    
    // Capitalize first letter after modifications
    structured = this.capitalizeFirstLetter(structured);
    
    return structured;
  }
}