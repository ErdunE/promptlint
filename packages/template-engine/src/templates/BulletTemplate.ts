/**
 * Bullet Point Template - ES Module
 * 
 * Organizes vague or unclear prompts into structured bullet point format
 * Helps clarify scope and requirements through organized presentation
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateCandidate, TemplateContext } from '../types/TemplateTypes.js';
import { LintRuleType } from '@promptlint/shared-types';
import { BaseTemplate } from './BaseTemplate.js';

export class BulletTemplate extends BaseTemplate {
  readonly type = TemplateType.BULLET;
  readonly name = 'Bullet Point Template';
  readonly description = 'Organizes vague prompts into clear bullet point requirements';
  
  /**
   * Apply bullet point template structure
   */
  apply(context: TemplateContext): TemplateCandidate {
    const actionVerb = this.getProfessionalActionVerb(context);
    const taskInfo = this.extractTaskInfo(context);
    const prompt = context.prompt;
    
    // Start with clear action statement
    let bulletPrompt = `${actionVerb} `;
    
    if (taskInfo.objective) {
      bulletPrompt += taskInfo.objective;
    } else {
      bulletPrompt += this.extractMainObjective(prompt);
    }
    
    bulletPrompt += ' with the following requirements:\n\n';
    
    // Extract and organize requirements
    const requirements = this.extractRequirements(context);
    
    for (const requirement of requirements) {
      bulletPrompt += `• ${requirement}\n`;
    }
    
    // Add missing information placeholders
    const missingInfo = this.identifyMissingInformation(context);
    if (missingInfo.length > 0) {
      bulletPrompt += '\n**Please specify:**\n';
      for (const missing of missingInfo) {
        bulletPrompt += `• ${missing}\n`;
      }
    }
    
    return this.generateCandidate(context, bulletPrompt, 0.85);
  }
  
  /**
   * Check if template is suitable for context
   */
  isSuitable(context: TemplateContext): boolean {
    // Suitable for vague wording or unclear scope
    const hasLintIssues = this.hasLintIssue(context, LintRuleType.VAGUE_WORDING) ||
                          this.hasLintIssue(context, LintRuleType.UNCLEAR_SCOPE) ||
                          context.lintResult.issues.length >= 3;
    
    // Also suitable for planning, organizing, and listing tasks
    const prompt = context.prompt.toLowerCase();
    const planningKeywords = [
      'outline', 'list', 'organize', 'plan', 'structure', 'breakdown',
      'categorize', 'summarize', 'points', 'items', 'goals', 'objectives',
      'requirements', 'features', 'benefits', 'steps', 'factors', 'aspects'
    ];
    
    const hasPlanningContent = planningKeywords.some(keyword => prompt.includes(keyword));
    
    return hasLintIssues || hasPlanningContent;
  }
  
  /**
   * Get priority for this template
   */
  getPriority(context: TemplateContext): number {
    let priority = 0.4;
    
    // Higher priority for vague wording
    if (this.hasLintIssue(context, LintRuleType.VAGUE_WORDING)) {
      priority += 0.3;
    }
    
    // Higher priority for unclear scope
    if (this.hasLintIssue(context, LintRuleType.UNCLEAR_SCOPE)) {
      priority += 0.2;
    }
    
    // Higher priority for complex issues
    if (context.lintResult.issues.length >= 3) {
      priority += 0.1;
    }
    
    return Math.min(priority, 1.0);
  }
  
  /**
   * Extract main objective from prompt
   */
  private extractMainObjective(prompt: string): string {
    const cleanPrompt = this.cleanPrompt(prompt);
    
    // Try to extract first meaningful sentence
    const sentences = cleanPrompt.split(/[.!?]/).filter(s => s.trim().length > 5);
    if (sentences.length > 0) {
      return sentences[0].trim();
    }
    
    return cleanPrompt;
  }
  
  /**
   * Extract requirements from context
   */
  private extractRequirements(context: TemplateContext): string[] {
    const prompt = context.prompt;
    const requirements: string[] = [];
    
    // Extract from task info
    const taskInfo = this.extractTaskInfo(context);
    
    if (taskInfo.inputSpec) {
      requirements.push(`Input: ${taskInfo.inputSpec}`);
    }
    
    if (taskInfo.outputSpec) {
      requirements.push(`Output: ${taskInfo.outputSpec}`);
    }
    
    if (taskInfo.constraints) {
      requirements.push(...taskInfo.constraints);
    }
    
    // Extract additional requirements from prompt
    const sentences = prompt.split(/[.!?]/).filter(s => s.trim().length > 10);
    for (const sentence of sentences) {
      const cleanSentence = sentence.trim();
      if (cleanSentence && !requirements.some(req => req.includes(cleanSentence.substring(0, 20)))) {
        // Check if sentence contains requirement keywords
        if (this.containsRequirementKeywords(cleanSentence)) {
          requirements.push(cleanSentence);
        }
      }
    }
    
    // Ensure we have at least basic requirements
    if (requirements.length === 0) {
      requirements.push('Complete the requested task');
    }
    
    return requirements.slice(0, 5); // Limit to 5 requirements
  }
  
  /**
   * Check if sentence contains requirement keywords
   */
  private containsRequirementKeywords(sentence: string): boolean {
    const keywords = ['must', 'should', 'need', 'require', 'ensure', 'include', 'use', 'implement'];
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => lowerSentence.includes(keyword));
  }
  
  /**
   * Identify missing information based on lint issues
   */
  private identifyMissingInformation(context: TemplateContext): string[] {
    const missing: string[] = [];
    
    if (this.hasLintIssue(context, LintRuleType.MISSING_LANGUAGE)) {
      missing.push('Programming language or technology to use');
    }
    
    if (this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      missing.push('Input format and expected output format');
    }
    
    if (this.hasLintIssue(context, LintRuleType.MISSING_TASK_VERB)) {
      missing.push('Specific action to perform');
    }
    
    if (this.hasLintIssue(context, LintRuleType.VAGUE_WORDING)) {
      missing.push('More specific requirements and constraints');
    }
    
    if (this.hasLintIssue(context, LintRuleType.UNCLEAR_SCOPE)) {
      missing.push('Project scope and boundaries');
    }
    
    return missing;
  }
}