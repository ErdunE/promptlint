/**
 * Pattern Matcher - ES Module
 * 
 * Rule-based template selection logic that maps lint issues to appropriate templates
 * Implements the template selection matrix from the specification
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateSelectionCriteria } from './types/TemplateTypes.js';
import { LintResult, LintRuleType } from '@promptlint/shared-types';

export class PatternMatcher {
  /**
   * Select appropriate templates based on lint issues and prompt characteristics
   * 
   * @param lintResult - Lint analysis result
   * @returns Array of template types ordered by priority
   */
  selectTemplates(lintResult: LintResult): TemplateType[] {
    const criteria = this.analyzePrompt(lintResult);
    const selectedTemplates: TemplateType[] = [];
    
    // Apply selection rules based on criteria
    
    // Rule 1: missing_language + missing_io → TaskIOTemplate
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_LANGUAGE) && 
        criteria.issues.some(i => i.type === LintRuleType.MISSING_IO_SPECIFICATION)) {
      selectedTemplates.push(TemplateType.TASK_IO);
    }
    
    // Rule 2: vague_wording + unclear_scope → BulletTemplate
    if (criteria.issues.some(i => i.type === LintRuleType.VAGUE_WORDING) && 
        criteria.issues.some(i => i.type === LintRuleType.UNCLEAR_SCOPE)) {
      selectedTemplates.push(TemplateType.BULLET);
    }
    
    // Rule 3: Sequential keywords → SequentialTemplate
    if (criteria.hasSequentialKeywords) {
      selectedTemplates.push(TemplateType.SEQUENTIAL);
    }
    
    // Rule 4: Minimal issues (score >70) → MinimalTemplate
    if (criteria.complexity === 'simple' && lintResult.score > 70) {
      selectedTemplates.push(TemplateType.MINIMAL);
    }
    
    // Rule 5: Complex multi-issue → Multiple templates
    if (criteria.complexity === 'complex' && criteria.issues.length >= 3) {
      selectedTemplates.push(TemplateType.BULLET);
      selectedTemplates.push(TemplateType.TASK_IO);
      selectedTemplates.push(TemplateType.SEQUENTIAL);
    }
    
    // Rule 6: Missing task verb → TaskIOTemplate
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_TASK_VERB)) {
      if (!selectedTemplates.includes(TemplateType.TASK_IO)) {
        selectedTemplates.push(TemplateType.TASK_IO);
      }
    }
    
    // Rule 7: Needs I/O specification → TaskIOTemplate
    if (criteria.needsIOSpecification) {
      if (!selectedTemplates.includes(TemplateType.TASK_IO)) {
        selectedTemplates.push(TemplateType.TASK_IO);
      }
    }
    
    // Rule 8: Has vague wording → BulletTemplate
    if (criteria.hasVagueWording) {
      if (!selectedTemplates.includes(TemplateType.BULLET)) {
        selectedTemplates.push(TemplateType.BULLET);
      }
    }
    
    // Rule 9: Has task structure → MinimalTemplate
    if (criteria.hasTaskStructure && criteria.complexity === 'simple') {
      if (!selectedTemplates.includes(TemplateType.MINIMAL)) {
        selectedTemplates.push(TemplateType.MINIMAL);
      }
    }
    
    // Ensure we have at least one template
    if (selectedTemplates.length === 0) {
      selectedTemplates.push(TemplateType.MINIMAL);
    }
    
    // Remove duplicates and limit to 3 templates
    const uniqueTemplates = [...new Set(selectedTemplates)];
    return uniqueTemplates.slice(0, 3);
  }
  
  /**
   * Analyze prompt to extract selection criteria
   */
  private analyzePrompt(lintResult: LintResult): TemplateSelectionCriteria {
    const issues = lintResult.issues.map(i => i.type);
    const prompt = lintResult.metadata?.inputLength ? 
      this.reconstructPromptFromLintResult(lintResult) : '';
    
    return {
      issues: lintResult.issues,
      complexity: this.determineComplexity(prompt, issues),
      hasSequentialKeywords: this.hasSequentialKeywords(prompt),
      hasTaskStructure: this.hasTaskStructure(prompt),
      needsIOSpecification: this.needsIOSpecification(issues),
      hasVagueWording: this.hasVagueWording(prompt, issues)
    };
  }
  
  /**
   * Determine prompt complexity level
   */
  private determineComplexity(prompt: string, issues: LintRuleType[]): 'simple' | 'medium' | 'complex' {
    const wordCount = prompt.split(' ').length;
    const issueCount = issues.length;
    
    if (wordCount <= 5 && issueCount <= 1) {
      return 'simple';
    } else if (wordCount <= 20 && issueCount <= 3) {
      return 'medium';
    } else {
      return 'complex';
    }
  }
  
  /**
   * Check if prompt has sequential keywords
   */
  private hasSequentialKeywords(prompt: string): boolean {
    const sequentialKeywords = [
      'step', 'steps', 'then', 'first', 'next', 'after', 'before', 'sequence',
      'process', 'procedure', 'workflow', 'pipeline', 'stage', 'phase'
    ];
    
    const cleanPrompt = prompt.toLowerCase();
    return sequentialKeywords.some(keyword => cleanPrompt.includes(keyword));
  }
  
  /**
   * Check if prompt has clear task structure
   */
  private hasTaskStructure(prompt: string): boolean {
    const taskKeywords = [
      'implement', 'create', 'build', 'develop', 'write', 'generate', 'design',
      'make', 'construct', 'program', 'code', 'architect', 'engineer'
    ];
    
    const cleanPrompt = prompt.toLowerCase();
    return taskKeywords.some(keyword => cleanPrompt.includes(keyword));
  }
  
  /**
   * Check if prompt needs I/O specification
   */
  private needsIOSpecification(issues: LintRuleType[]): boolean {
    return issues.includes(LintRuleType.MISSING_IO_SPECIFICATION);
  }
  
  /**
   * Check if prompt has vague wording
   */
  private hasVagueWording(prompt: string, issues: LintRuleType[]): boolean {
    if (issues.includes(LintRuleType.VAGUE_WORDING)) {
      return true;
    }
    
    const vagueWords = [
      'something', 'somehow', 'maybe', 'perhaps', 'kind of', 'sort of',
      'basically', 'just', 'whatever', 'anything', 'everything'
    ];
    
    const cleanPrompt = prompt.toLowerCase();
    return vagueWords.some(word => cleanPrompt.includes(word));
  }
  
  /**
   * Reconstruct prompt from lint result (fallback when original prompt not available)
   */
  private reconstructPromptFromLintResult(_lintResult: LintResult): string {
    // This is a fallback method - in practice, the original prompt should be available
    // For now, return a placeholder that allows basic analysis
    return 'prompt analysis';
  }
}
