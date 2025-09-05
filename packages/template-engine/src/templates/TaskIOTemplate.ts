/**
 * Task/Input/Output Template - ES Module
 * 
 * Structured format for prompts missing clear task definition or I/O specification
 * Organizes prompts into Task/Input/Output/Constraints format
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateCandidate, TemplateContext } from '../types/TemplateTypes.js';
import { LintRuleType } from '@promptlint/shared-types';
import { BaseTemplate } from './BaseTemplate.js';

export class TaskIOTemplate extends BaseTemplate {
  readonly type = TemplateType.TASK_IO;
  readonly name = 'Task/Input/Output Template';
  readonly description = 'Structures prompts with clear task definition, input requirements, and expected output';
  
  /**
   * Apply Task/Input/Output template structure
   */
  apply(context: TemplateContext): TemplateCandidate {
    const taskInfo = this.extractTaskInfo(context);
    const actionVerb = this.getProfessionalActionVerb(context);
    const prompt = context.prompt;
    
    // Build structured prompt with clean verb-objective combination
    let structuredPrompt = `**Task:** ${actionVerb} `;
    
    // Add objective with verb deduplication
    let objective: string;
    if (taskInfo.objective) {
      objective = this.cleanObjectiveForVerb(taskInfo.objective, actionVerb);
    } else {
      // Extract main objective from original prompt
      const rawObjective = this.extractMainObjective(prompt);
      objective = this.cleanObjectiveForVerb(rawObjective, actionVerb);
    }
    
    structuredPrompt += objective;
    
    structuredPrompt += '\n\n';
    
    // Add input section
    structuredPrompt += '**Input:** ';
    if (taskInfo.inputSpec) {
      structuredPrompt += taskInfo.inputSpec;
    } else if (this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      structuredPrompt += '[Please specify input format and requirements]';
    } else {
      structuredPrompt += 'As provided by user';
    }
    
    structuredPrompt += '\n\n';
    
    // Add output section
    structuredPrompt += '**Output:** ';
    if (taskInfo.outputSpec) {
      structuredPrompt += taskInfo.outputSpec;
    } else if (this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      structuredPrompt += '[Please specify expected output format]';
    } else {
      structuredPrompt += 'Completed task result';
    }
    
    // Add constraints if any
    if (taskInfo.constraints && taskInfo.constraints.length > 0) {
      structuredPrompt += '\n\n**Constraints:**\n';
      for (const constraint of taskInfo.constraints) {
        structuredPrompt += `• ${constraint}\n`;
      }
    }
    
    return this.generateCandidate(context, structuredPrompt, 0.9);
  }
  
  /**
   * Check if template is suitable for context
   */
  isSuitable(context: TemplateContext): boolean {
    // Suitable when missing task verb or I/O specification
    return this.hasLintIssue(context, LintRuleType.MISSING_TASK_VERB) ||
           this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION) ||
           this.hasLintIssue(context, LintRuleType.MISSING_LANGUAGE);
  }
  
  /**
   * Get priority for this template
   */
  getPriority(context: TemplateContext): number {
    let priority = 0.5;
    
    // Higher priority for missing task structure
    if (this.hasLintIssue(context, LintRuleType.MISSING_TASK_VERB)) {
      priority += 0.3;
    }
    
    // Higher priority for missing I/O specification
    if (this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      priority += 0.2;
    }
    
    return Math.min(priority, 1.0);
  }
  
  /**
   * Extract main objective from prompt
   */
  private extractMainObjective(prompt: string): string {
    const cleanPrompt = this.cleanPrompt(prompt);
    
    // Try to extract first sentence as objective
    const sentences = cleanPrompt.split('.').filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      return sentences[0].trim();
    }
    
    return cleanPrompt;
  }
  
  /**
   * Clean objective to prevent verb duplication
   */
  private cleanObjectiveForVerb(objective: string, actionVerb: string): string {
    const cleanObjective = objective.trim();
    
    // If objective starts with the same verb, remove the duplicate
    const verbPattern = new RegExp(`^${actionVerb}\\s+`, 'i');
    if (verbPattern.test(cleanObjective)) {
      return cleanObjective.replace(verbPattern, '').trim();
    }
    
    return cleanObjective;
  }
}