/**
 * Sequential Steps Template - ES Module
 * 
 * Organizes prompts with sequential keywords into numbered step format
 * Ideal for process-oriented or workflow-based requests
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateCandidate, TemplateContext } from '../types/TemplateTypes.js';
import { LintRuleType } from '@promptlint/shared-types';
import { BaseTemplate } from './BaseTemplate.js';

export class SequentialTemplate extends BaseTemplate {
  readonly type = TemplateType.SEQUENTIAL;
  readonly name = 'Sequential Steps Template';
  readonly description = 'Organizes process-oriented prompts into numbered sequential steps';
  
  /**
   * Apply sequential steps template structure
   */
  apply(context: TemplateContext): TemplateCandidate {
    const actionVerb = this.getProfessionalActionVerb(context);
    const taskInfo = this.extractTaskInfo(context);
    const prompt = context.prompt;
    
    // Start with clear action statement
    let sequentialPrompt = `${actionVerb} `;
    
    if (taskInfo.objective) {
      sequentialPrompt += taskInfo.objective;
    } else {
      sequentialPrompt += this.extractMainObjective(prompt);
    }
    
    sequentialPrompt += ' using the following steps:\n\n';
    
    // Extract and organize steps
    const steps = this.extractSteps(context);
    
    for (let i = 0; i < steps.length; i++) {
      sequentialPrompt += `${i + 1}. ${steps[i]}\n`;
    }
    
    // Add requirements section if needed
    const additionalRequirements = this.extractAdditionalRequirements(context);
    if (additionalRequirements.length > 0) {
      sequentialPrompt += '\n**Requirements:**\n';
      for (const requirement of additionalRequirements) {
        sequentialPrompt += `• ${requirement}\n`;
      }
    }
    
    return this.generateCandidate(context, sequentialPrompt, 0.85);
  }
  
  /**
   * Check if template is suitable for context
   */
  isSuitable(context: TemplateContext): boolean {
    const prompt = context.prompt.toLowerCase();
    const sequentialKeywords = [
      'step', 'steps', 'then', 'first', 'next', 'after', 'before',
      'sequence', 'process', 'procedure', 'workflow', 'stage', 'phase',
      'implement', 'build', 'create', 'develop', 'setup', 'configure',
      'install', 'deploy', 'execute', 'run', 'perform', 'complete'
    ];
    
    // Also suitable for multi-domain tasks (research and implement, analyze and document)
    const multiDomainPatterns = [
      'and then', 'and implement', 'and create', 'and build', 'and develop',
      'then implement', 'then create', 'then build', 'then develop'
    ];
    
    const hasSequentialKeywords = sequentialKeywords.some(keyword => prompt.includes(keyword));
    const hasMultiDomainPattern = multiDomainPatterns.some(pattern => prompt.includes(pattern));
    
    return hasSequentialKeywords || hasMultiDomainPattern;
  }
  
  /**
   * Get priority for this template
   */
  getPriority(context: TemplateContext): number {
    const prompt = context.prompt.toLowerCase();
    let priority = 0.3;
    
    // Count sequential keywords
    const sequentialKeywords = [
      'step', 'steps', 'then', 'first', 'next', 'after', 'before',
      'sequence', 'process', 'procedure', 'workflow'
    ];
    
    const keywordCount = sequentialKeywords.filter(keyword => prompt.includes(keyword)).length;
    priority += keywordCount * 0.1;
    
    return Math.min(priority, 1.0);
  }
  
  /**
   * Extract main objective from prompt
   */
  private extractMainObjective(prompt: string): string {
    const cleanPrompt = this.cleanPrompt(prompt);
    
    // Try to extract objective before first step indicator
    const stepIndicators = ['step', 'first', 'then', 'process', 'procedure'];
    
    for (const indicator of stepIndicators) {
      const index = cleanPrompt.toLowerCase().indexOf(indicator);
      if (index > 10) { // Ensure there's meaningful content before the indicator
        return cleanPrompt.substring(0, index).trim();
      }
    }
    
    // Fallback to first sentence
    const sentences = cleanPrompt.split(/[.!?]/).filter(s => s.trim().length > 5);
    if (sentences.length > 0) {
      return sentences[0].trim();
    }
    
    return cleanPrompt;
  }
  
  /**
   * Extract steps from context
   */
  private extractSteps(context: TemplateContext): string[] {
    const prompt = context.prompt;
    const steps: string[] = [];
    
    // Try to extract existing steps from prompt
    const existingSteps = this.extractExistingSteps(prompt);
    if (existingSteps.length > 0) {
      steps.push(...existingSteps);
    } else {
      // Generate logical steps based on task info
      steps.push(...this.generateLogicalSteps(context));
    }
    
    // Ensure we have at least 2 steps
    if (steps.length < 2) {
      steps.push('Complete the implementation');
      steps.push('Test and verify the results');
    }
    
    return steps.slice(0, 6); // Limit to 6 steps
  }
  
  /**
   * Extract existing steps from prompt text
   */
  private extractExistingSteps(prompt: string): string[] {
    const steps: string[] = [];
    
    // Look for numbered steps (1., 2., etc.)
    const numberedSteps = prompt.match(/\d+\.\s*([^\n.]+)/g);
    if (numberedSteps) {
      steps.push(...numberedSteps.map(step => step.replace(/^\d+\.\s*/, '').trim()));
    }
    
    // Look for step keywords
    const stepKeywords = ['first', 'then', 'next', 'after', 'finally'];
    const sentences = prompt.split(/[.!?\n]/).filter(s => s.trim().length > 5);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase().trim();
      if (stepKeywords.some(keyword => lowerSentence.startsWith(keyword))) {
        steps.push(sentence.trim());
      }
    }
    
    return steps;
  }
  
  /**
   * Generate logical steps based on task context
   */
  private generateLogicalSteps(context: TemplateContext): string[] {
    const steps: string[] = [];
    const taskInfo = this.extractTaskInfo(context);
    
    // Start with planning/analysis
    steps.push('Analyze requirements and plan the approach');
    
    // Add input handling if needed
    if (taskInfo.inputSpec || this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      steps.push('Prepare and validate input data');
    }
    
    // Add main implementation
    if (taskInfo.actionVerb) {
      steps.push(`${taskInfo.actionVerb.charAt(0).toUpperCase() + taskInfo.actionVerb.slice(1)} the core functionality`);
    } else {
      steps.push('Implement the core functionality');
    }
    
    // Add output handling if needed
    if (taskInfo.outputSpec || this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      steps.push('Format and deliver the output');
    }
    
    // Add validation/testing
    steps.push('Test and validate the results');
    
    return steps;
  }
  
  /**
   * Extract additional requirements not covered in steps
   */
  private extractAdditionalRequirements(context: TemplateContext): string[] {
    const requirements: string[] = [];
    
    if (this.hasLintIssue(context, LintRuleType.MISSING_LANGUAGE)) {
      requirements.push('Specify programming language or technology to use');
    }
    
    if (this.hasLintIssue(context, LintRuleType.MISSING_IO_SPECIFICATION)) {
      requirements.push('Define input and output formats clearly');
    }
    
    const taskInfo = this.extractTaskInfo(context);
    if (taskInfo.constraints && taskInfo.constraints.length > 0) {
      requirements.push(...taskInfo.constraints.slice(0, 3));
    }
    
    return requirements;
  }
}