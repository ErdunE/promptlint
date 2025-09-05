/**
 * Pattern Matcher - ES Module
 * 
 * Rule-based template selection logic that maps lint issues to appropriate templates
 * Implements the template selection matrix from the specification
 * Chrome Extension Compatible - Browser APIs Only
 */

import { TemplateType, TemplateSelectionCriteria } from './types/TemplateTypes.js';
import { LintResult, LintRuleType } from '@promptlint/shared-types';
import { DomainClassificationResult, DomainType } from '@promptlint/domain-classifier';

export class PatternMatcher {
  /**
   * Select appropriate templates based on domain classification, lint issues and prompt characteristics
   * 
   * @param lintResult - Lint analysis result
   * @param domainResult - Domain classification result
   * @param originalPrompt - Original prompt text (optional, for better analysis)
   * @returns Array of template types ordered by priority
   */
  selectTemplates(lintResult: LintResult, domainResult: DomainClassificationResult, originalPrompt?: string): TemplateType[] {
    const criteria = this.analyzePrompt(lintResult, originalPrompt);
    const selectedTemplates: TemplateType[] = [];
    
    // Apply domain-aware selection strategy based on confidence
    if (domainResult.confidence >= 90) {
      // High confidence: Strongly favor domain-specific templates
      const domainTemplates = this.getDomainTemplatePreferences(domainResult.domain, 'high');
      selectedTemplates.push(...domainTemplates);
      
      // Add lint-based templates that complement domain preferences
      const lintBasedTemplates = this.getLintBasedTemplates(criteria);
      const domainPreferences = this.getDomainTemplatePreferences(domainResult.domain, 'secondary');
      const complementaryTemplates = lintBasedTemplates.filter(t => domainPreferences.includes(t));
      selectedTemplates.push(...complementaryTemplates);
      
    } else if (domainResult.confidence >= 70) {
      // Moderate confidence: Blend domain preferences with existing rule-based logic
      const domainTemplates = this.getDomainTemplatePreferences(domainResult.domain, 'moderate');
      const ruleBasedTemplates = this.applyExistingRules(criteria);
      
      selectedTemplates.push(...this.blendTemplateSelections(domainTemplates, ruleBasedTemplates));
      
    } else {
      // Low confidence: Fall back to existing Level 1 logic
      return this.applyExistingRules(criteria);
    }
    
    // Apply additional lint-based rules for refinement
    this.applyLintBasedRefinements(selectedTemplates, criteria);
    
    // Ensure we have at least one template
    if (selectedTemplates.length === 0) {
      selectedTemplates.push(TemplateType.MINIMAL);
    }
    
    // Remove duplicates and limit to 3 templates
    const uniqueTemplates = [...new Set(selectedTemplates)];
    return uniqueTemplates.slice(0, 3);
  }

  /**
   * Get domain-specific template preferences
   */
  private getDomainTemplatePreferences(domain: DomainType, confidence: 'high' | 'moderate' | 'secondary'): TemplateType[] {
    const preferences = {
      [DomainType.CODE]: {
        high: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
        moderate: [TemplateType.TASK_IO, TemplateType.BULLET],
        secondary: [TemplateType.BULLET, TemplateType.MINIMAL]
      },
      [DomainType.WRITING]: {
        high: [TemplateType.MINIMAL, TemplateType.BULLET],
        moderate: [TemplateType.MINIMAL, TemplateType.TASK_IO],
        secondary: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL]
      },
      [DomainType.ANALYSIS]: {
        high: [TemplateType.TASK_IO, TemplateType.BULLET],
        moderate: [TemplateType.BULLET, TemplateType.SEQUENTIAL],
        secondary: [TemplateType.SEQUENTIAL, TemplateType.MINIMAL]
      },
      [DomainType.RESEARCH]: {
        high: [TemplateType.BULLET, TemplateType.SEQUENTIAL],
        moderate: [TemplateType.BULLET, TemplateType.TASK_IO],
        secondary: [TemplateType.TASK_IO, TemplateType.MINIMAL]
      }
    };
    
    return preferences[domain]?.[confidence] || [TemplateType.MINIMAL];
  }

  /**
   * Blend domain templates with rule-based templates for moderate confidence
   */
  private blendTemplateSelections(domainTemplates: TemplateType[], ruleBasedTemplates: TemplateType[]): TemplateType[] {
    const blended: TemplateType[] = [];
    
    // Prioritize domain templates (60% weight)
    blended.push(...domainTemplates.slice(0, 2));
    
    // Add complementary rule-based templates (40% weight)
    const complementary = ruleBasedTemplates.filter(t => !blended.includes(t));
    blended.push(...complementary.slice(0, 1));
    
    return blended;
  }

  /**
   * Apply existing Level 1 rule-based logic (fallback)
   */
  private applyExistingRules(criteria: TemplateSelectionCriteria): TemplateType[] {
    const selectedTemplates: TemplateType[] = [];
    
    // Apply selection rules based on criteria
    
    // Rule 1: missing_language + missing_io → TaskIOTemplate (with complexity check)
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_LANGUAGE) && 
        criteria.issues.some(i => i.type === LintRuleType.MISSING_IO_SPECIFICATION) &&
        criteria.complexity !== 'complex' &&
        !criteria.hasVagueWording) {
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
    
    // Rule 4: Minimal issues (score >60) → MinimalTemplate
    if (criteria.complexity === 'simple' && criteria.issues.length <= 1) {
      selectedTemplates.push(TemplateType.MINIMAL);
    }
    
    // Rule 5: Complex multi-issue → Multiple templates
    if (criteria.complexity === 'complex' && criteria.issues.length >= 3) {
      selectedTemplates.push(TemplateType.BULLET);
      selectedTemplates.push(TemplateType.TASK_IO);
      selectedTemplates.push(TemplateType.SEQUENTIAL);
    }
    
    // Rule 6: Missing task verb → Context-aware template selection
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_TASK_VERB)) {
      if (criteria.hasVagueWording || criteria.complexity === 'complex') {
        if (!selectedTemplates.includes(TemplateType.BULLET)) {
          selectedTemplates.push(TemplateType.BULLET);
        }
      } else {
        if (!selectedTemplates.includes(TemplateType.TASK_IO)) {
          selectedTemplates.push(TemplateType.TASK_IO);
        }
      }
    }
    
    // Rule 7: Needs I/O specification → TaskIOTemplate (conditional on context)
    if (criteria.needsIOSpecification && 
        criteria.complexity !== 'complex' && 
        !criteria.hasVagueWording) {
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
    
    // Rule 9: Has task structure + missing language → TaskIOTemplate (prioritize structured format)
    if (criteria.hasTaskStructure && 
        criteria.issues.some(i => i.type === LintRuleType.MISSING_LANGUAGE) &&
        criteria.complexity === 'simple') {
      if (!selectedTemplates.includes(TemplateType.TASK_IO)) {
        selectedTemplates.push(TemplateType.TASK_IO);
      }
    }
    
    // Rule 10: Has task structure → MinimalTemplate (fallback for well-structured prompts)
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
   * Get lint-based template suggestions
   */
  private getLintBasedTemplates(criteria: TemplateSelectionCriteria): TemplateType[] {
    const templates: TemplateType[] = [];
    
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_IO_SPECIFICATION)) {
      templates.push(TemplateType.TASK_IO);
    }
    
    if (criteria.hasVagueWording) {
      templates.push(TemplateType.BULLET);
    }
    
    if (criteria.hasSequentialKeywords) {
      templates.push(TemplateType.SEQUENTIAL);
    }
    
    if (criteria.complexity === 'simple' && criteria.issues.length <= 1) {
      templates.push(TemplateType.MINIMAL);
    }
    
    return templates;
  }

  /**
   * Apply lint-based refinements to selected templates
   */
  private applyLintBasedRefinements(selectedTemplates: TemplateType[], criteria: TemplateSelectionCriteria): void {
    // Add TaskIO template if missing I/O specification and not already included
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_IO_SPECIFICATION) && 
        !selectedTemplates.includes(TemplateType.TASK_IO)) {
      selectedTemplates.push(TemplateType.TASK_IO);
    }
    
    // Add Bullet template if vague wording and not already included
    if (criteria.hasVagueWording && !selectedTemplates.includes(TemplateType.BULLET)) {
      selectedTemplates.push(TemplateType.BULLET);
    }
    
    // Add Sequential template if sequential keywords and not already included
    if (criteria.hasSequentialKeywords && !selectedTemplates.includes(TemplateType.SEQUENTIAL)) {
      selectedTemplates.push(TemplateType.SEQUENTIAL);
    }
  }
  
  /**
   * Analyze prompt to extract selection criteria
   */
  private analyzePrompt(lintResult: LintResult, originalPrompt?: string): TemplateSelectionCriteria {
    const issues = lintResult.issues.map(i => i.type);
    const prompt = originalPrompt || (lintResult.metadata?.inputLength ? 
      this.reconstructPromptFromLintResult(lintResult) : '');
    
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
      // Original verbs
      'implement', 'create', 'build', 'develop', 'write', 'generate', 'design',
      'make', 'construct', 'program', 'code', 'architect', 'engineer',
      // Missing critical verbs identified in investigation
      'optimize', 'debug', 'analyze', 'refactor', 'fix', 'improve', 'enhance',
      'test', 'validate', 'review', 'audit', 'monitor', 'troubleshoot'
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
