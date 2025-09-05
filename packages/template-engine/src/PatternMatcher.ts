/**
 * Pattern Matcher - ES Module
 * 
 * Rule-based template selection logic that maps lint issues to appropriate templates
 * Implements the template selection matrix from the specification
 * Chrome Extension Compatible - Browser APIs Only
 */

import { 
  TemplateType, 
  TemplateSelectionCriteria,
  EnhancedDomainResult,
  EnhancedTemplateSelection,
  SelectionReason,
  TemplateSelectionMetadata
} from './types/TemplateTypes.js';
import { LintResult, LintRuleType } from '@promptlint/shared-types';
import { DomainClassificationResult, DomainType } from '@promptlint/domain-classifier';

export class PatternMatcher {
  /**
   * Enhanced template selection with sub-category detection and metadata
   * 
   * @param lintResult - Lint analysis result
   * @param domainResult - Domain classification result
   * @param originalPrompt - Original prompt text (optional, for better analysis)
   * @returns Enhanced template selection with metadata
   */
  selectTemplatesWithMetadata(
    lintResult: LintResult, 
    domainResult: DomainClassificationResult, 
    originalPrompt?: string
  ): { templates: TemplateType[], metadata: TemplateSelectionMetadata } {
    const enhancedDomain = this.enhanceDomainClassification(domainResult, originalPrompt);
    const criteria = this.analyzePrompt(lintResult, originalPrompt);
    
    // Apply enhanced confidence-based selection strategy
    const selectionStrategy = this.determineSelectionStrategy(enhancedDomain.confidence);
    const selectedTemplates = this.selectOptimalTemplates(enhancedDomain, criteria, selectionStrategy);
    
    // Generate metadata for feedback integration
    const metadata: TemplateSelectionMetadata = {
      selectionReasoning: this.generateSelectionReasoning(selectedTemplates, enhancedDomain, criteria),
      domainContext: enhancedDomain,
      alternativeTemplates: this.getAlternativeTemplates(selectedTemplates),
      userFeedbackCapable: true,
      selectionStrategy
    };
    
    return {
      templates: selectedTemplates.map(s => s.templateType),
      metadata
    };
  }

  /**
   * Legacy method for backward compatibility
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
   * Enhance domain classification with sub-category detection
   */
  private enhanceDomainClassification(
    domainResult: DomainClassificationResult, 
    prompt?: string
  ): EnhancedDomainResult {
    const subCategory = this.detectDomainSubCategory(domainResult.domain, prompt || '', domainResult.confidence);
    const characteristics = this.extractDomainCharacteristics(domainResult.domain, prompt || '');
    
    return {
      primaryDomain: domainResult.domain,
      subCategory,
      confidence: domainResult.confidence,
      characteristics,
      originalResult: domainResult
    };
  }

  /**
   * Detect domain sub-category for enhanced context understanding
   */
  private detectDomainSubCategory(domain: DomainType, prompt: string, _confidence: number): string | undefined {
    const cleanPrompt = prompt.toLowerCase();
    
    switch (domain) {
      case DomainType.CODE:
        if (this.hasAlgorithmIndicators(cleanPrompt)) return 'algorithms';
        if (this.hasWebDevIndicators(cleanPrompt)) return 'web_development';
        if (this.hasDebuggingIndicators(cleanPrompt)) return 'debugging';
        if (this.hasOptimizationIndicators(cleanPrompt)) return 'optimization';
        if (this.hasAPIIndicators(cleanPrompt)) return 'api_development';
        break;
        
      case DomainType.ANALYSIS:
        if (this.hasDataAnalysisIndicators(cleanPrompt)) return 'data_analysis';
        if (this.hasPerformanceIndicators(cleanPrompt)) return 'performance_evaluation';
        if (this.hasComparisonIndicators(cleanPrompt)) return 'comparative_study';
        break;
        
      case DomainType.WRITING:
        if (this.hasContentCreationIndicators(cleanPrompt)) return 'content_creation';
        if (this.hasDocumentationIndicators(cleanPrompt)) return 'documentation';
        if (this.hasCommunicationIndicators(cleanPrompt)) return 'communication';
        break;
        
      case DomainType.RESEARCH:
        if (this.hasMethodologyIndicators(cleanPrompt)) return 'methodology';
        if (this.hasBestPracticesIndicators(cleanPrompt)) return 'best_practices';
        if (this.hasInvestigationIndicators(cleanPrompt)) return 'investigation';
        break;
    }
    
    return undefined;
  }

  /**
   * Extract domain characteristics for enhanced template selection
   */
  private extractDomainCharacteristics(domain: DomainType, prompt: string): string[] {
    const characteristics: string[] = [];
    const cleanPrompt = prompt.toLowerCase();
    
    // Common characteristics across domains
    if (cleanPrompt.includes('step') || cleanPrompt.includes('process')) {
      characteristics.push('sequential');
    }
    if (cleanPrompt.includes('analyze') || cleanPrompt.includes('evaluate')) {
      characteristics.push('analytical');
    }
    if (cleanPrompt.includes('create') || cleanPrompt.includes('build')) {
      characteristics.push('constructive');
    }
    
    // Domain-specific characteristics
    switch (domain) {
      case DomainType.CODE:
        if (cleanPrompt.includes('function') || cleanPrompt.includes('method')) {
          characteristics.push('functional');
        }
        if (cleanPrompt.includes('class') || cleanPrompt.includes('object')) {
          characteristics.push('object_oriented');
        }
        break;
        
      case DomainType.WRITING:
        if (cleanPrompt.includes('blog') || cleanPrompt.includes('article')) {
          characteristics.push('publishing');
        }
        if (cleanPrompt.includes('email') || cleanPrompt.includes('message')) {
          characteristics.push('communication');
        }
        break;
    }
    
    return characteristics;
  }

  /**
   * Determine selection strategy based on confidence
   */
  private determineSelectionStrategy(confidence: number): 'high_confidence' | 'moderate_confidence' | 'low_confidence_fallback' {
    if (confidence >= 90) return 'high_confidence';
    if (confidence >= 70) return 'moderate_confidence';
    return 'low_confidence_fallback';
  }

  /**
   * Select optimal templates with enhanced scoring
   */
  private selectOptimalTemplates(
    enhancedDomain: EnhancedDomainResult,
    criteria: TemplateSelectionCriteria,
    strategy: 'high_confidence' | 'moderate_confidence' | 'low_confidence_fallback'
  ): EnhancedTemplateSelection[] {
    // Score all template types
    const allTemplateScores = Object.values(TemplateType).map(templateType => 
      this.scoreTemplate(templateType, enhancedDomain, criteria)
    );
    
    // Rank by composite score
    const rankedTemplates = allTemplateScores
      .sort((a, b) => b.compositeScore - a.compositeScore);
    
    // Select diverse templates based on strategy
    const selectedTemplates = this.selectDiverseTemplates(rankedTemplates, strategy);
    
    return selectedTemplates;
  }

  /**
   * Score template appropriateness across multiple dimensions
   */
  private scoreTemplate(
    templateType: TemplateType,
    enhancedDomain: EnhancedDomainResult,
    criteria: TemplateSelectionCriteria
  ): EnhancedTemplateSelection {
    const domainAlignment = this.calculateDomainAlignment(templateType, enhancedDomain);
    const contextMatch = this.calculateContextMatch(templateType, criteria);
    const compositeScore = (domainAlignment * 0.6) + (contextMatch * 0.4);
    
    const reasons: SelectionReason[] = [
      {
        type: 'domain_alignment',
        description: `Domain alignment score: ${domainAlignment}`,
        confidence: domainAlignment
      },
      {
        type: 'context_match',
        description: `Context match score: ${contextMatch}`,
        confidence: contextMatch
      }
    ];
    
    return {
      templateType,
      confidence: Math.round(compositeScore),
      reasons,
      domainAlignment,
      contextMatch,
      compositeScore
    };
  }

  /**
   * Calculate domain alignment score for template
   */
  private calculateDomainAlignment(templateType: TemplateType, enhancedDomain: EnhancedDomainResult): number {
    const preferences = this.getDomainTemplatePreferences(enhancedDomain.primaryDomain as DomainType, 'high');
    const secondaryPreferences = this.getDomainTemplatePreferences(enhancedDomain.primaryDomain as DomainType, 'secondary');
    
    if (preferences.includes(templateType)) return 90;
    if (secondaryPreferences.includes(templateType)) return 70;
    
    // Sub-category specific scoring
    if (enhancedDomain.subCategory) {
      const subCategoryScore = this.getSubCategoryTemplateScore(templateType, enhancedDomain.subCategory);
      if (subCategoryScore > 0) return subCategoryScore;
    }
    
    return 30; // Default fallback score
  }

  /**
   * Calculate context match score for template
   */
  private calculateContextMatch(templateType: TemplateType, criteria: TemplateSelectionCriteria): number {
    let score = 50; // Base score
    
    // Lint-based scoring
    if (criteria.issues.some(i => i.type === LintRuleType.MISSING_IO_SPECIFICATION) && templateType === TemplateType.TASK_IO) {
      score += 30;
    }
    if (criteria.hasVagueWording && templateType === TemplateType.BULLET) {
      score += 25;
    }
    if (criteria.hasSequentialKeywords && templateType === TemplateType.SEQUENTIAL) {
      score += 25;
    }
    if (criteria.complexity === 'simple' && templateType === TemplateType.MINIMAL) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Get sub-category specific template scores
   */
  private getSubCategoryTemplateScore(templateType: TemplateType, subCategory: string): number {
    const subCategoryPreferences: Record<string, Record<TemplateType, number>> = {
      'algorithms': {
        [TemplateType.TASK_IO]: 95,
        [TemplateType.SEQUENTIAL]: 90,
        [TemplateType.BULLET]: 60,
        [TemplateType.MINIMAL]: 40
      },
      'web_development': {
        [TemplateType.TASK_IO]: 90,
        [TemplateType.BULLET]: 80,
        [TemplateType.SEQUENTIAL]: 70,
        [TemplateType.MINIMAL]: 50
      },
      'debugging': {
        [TemplateType.TASK_IO]: 95,
        [TemplateType.SEQUENTIAL]: 85,
        [TemplateType.BULLET]: 70,
        [TemplateType.MINIMAL]: 40
      },
      'api_development': {
        [TemplateType.TASK_IO]: 95,
        [TemplateType.BULLET]: 75,
        [TemplateType.SEQUENTIAL]: 65,
        [TemplateType.MINIMAL]: 45
      },
      'content_creation': {
        [TemplateType.MINIMAL]: 90,
        [TemplateType.BULLET]: 85,
        [TemplateType.TASK_IO]: 60,
        [TemplateType.SEQUENTIAL]: 50
      },
      'documentation': {
        [TemplateType.BULLET]: 90,
        [TemplateType.SEQUENTIAL]: 80,
        [TemplateType.MINIMAL]: 70,
        [TemplateType.TASK_IO]: 60
      },
      'data_analysis': {
        [TemplateType.TASK_IO]: 90,
        [TemplateType.BULLET]: 80,
        [TemplateType.SEQUENTIAL]: 70,
        [TemplateType.MINIMAL]: 50
      },
      'performance_evaluation': {
        [TemplateType.TASK_IO]: 85,
        [TemplateType.BULLET]: 80,
        [TemplateType.SEQUENTIAL]: 75,
        [TemplateType.MINIMAL]: 60
      }
    };
    
    return subCategoryPreferences[subCategory]?.[templateType] || 0;
  }

  /**
   * Select diverse templates to avoid redundancy
   */
  private selectDiverseTemplates(
    rankedTemplates: EnhancedTemplateSelection[],
    strategy: 'high_confidence' | 'moderate_confidence' | 'low_confidence_fallback'
  ): EnhancedTemplateSelection[] {
    const selected: EnhancedTemplateSelection[] = [];
    const maxTemplates = strategy === 'high_confidence' ? 2 : 3;
    
    for (const template of rankedTemplates) {
      if (selected.length >= maxTemplates) break;
      
      // Avoid selecting templates that are too similar
      const isDiverse = selected.every(selectedTemplate => 
        this.calculateTemplateSimilarity(template.templateType, selectedTemplate.templateType) < 0.8
      );
      
      if (isDiverse || selected.length === 0) {
        selected.push(template);
      }
    }
    
    return selected;
  }

  /**
   * Calculate similarity between template types
   */
  private calculateTemplateSimilarity(template1: TemplateType, template2: TemplateType): number {
    const similarityMatrix: Record<TemplateType, Record<TemplateType, number>> = {
      [TemplateType.TASK_IO]: {
        [TemplateType.TASK_IO]: 1.0,
        [TemplateType.BULLET]: 0.6,
        [TemplateType.SEQUENTIAL]: 0.7,
        [TemplateType.MINIMAL]: 0.4
      },
      [TemplateType.BULLET]: {
        [TemplateType.TASK_IO]: 0.6,
        [TemplateType.BULLET]: 1.0,
        [TemplateType.SEQUENTIAL]: 0.8,
        [TemplateType.MINIMAL]: 0.7
      },
      [TemplateType.SEQUENTIAL]: {
        [TemplateType.TASK_IO]: 0.7,
        [TemplateType.BULLET]: 0.8,
        [TemplateType.SEQUENTIAL]: 1.0,
        [TemplateType.MINIMAL]: 0.5
      },
      [TemplateType.MINIMAL]: {
        [TemplateType.TASK_IO]: 0.4,
        [TemplateType.BULLET]: 0.7,
        [TemplateType.SEQUENTIAL]: 0.5,
        [TemplateType.MINIMAL]: 1.0
      }
    };
    
    return similarityMatrix[template1]?.[template2] || 0;
  }

  /**
   * Generate selection reasoning for metadata
   */
  private generateSelectionReasoning(
    selectedTemplates: EnhancedTemplateSelection[],
    enhancedDomain: EnhancedDomainResult,
    _criteria: TemplateSelectionCriteria
  ): SelectionReason[] {
    const reasoning: SelectionReason[] = [];
    
    // Domain-based reasoning
    reasoning.push({
      type: 'domain_alignment',
      description: `Selected templates for ${enhancedDomain.primaryDomain} domain${enhancedDomain.subCategory ? ` (${enhancedDomain.subCategory})` : ''}`,
      confidence: enhancedDomain.confidence
    });
    
    // Template-specific reasoning
    selectedTemplates.forEach(template => {
      template.reasons.forEach(reason => {
        reasoning.push({
          ...reason,
          description: `${template.templateType}: ${reason.description}`
        });
      });
    });
    
    return reasoning;
  }

  /**
   * Get alternative templates for metadata
   */
  private getAlternativeTemplates(selectedTemplates: EnhancedTemplateSelection[]): TemplateType[] {
    const selectedTypes = selectedTemplates.map(t => t.templateType);
    return Object.values(TemplateType).filter(type => !selectedTypes.includes(type));
  }

  // Sub-category detection helper methods
  private hasAlgorithmIndicators(prompt: string): boolean {
    const indicators = ['algorithm', 'sort', 'search', 'binary', 'tree', 'graph', 'recursive', 'dynamic programming'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasWebDevIndicators(prompt: string): boolean {
    const indicators = ['website', 'web app', 'frontend', 'backend', 'ui', 'ux', 'responsive', 'html', 'css', 'javascript'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasDebuggingIndicators(prompt: string): boolean {
    const indicators = ['debug', 'fix', 'error', 'bug', 'issue', 'troubleshoot', 'memory leak', 'crash'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasOptimizationIndicators(prompt: string): boolean {
    const indicators = ['optimize', 'performance', 'speed', 'efficient', 'fast', 'slow', 'bottleneck'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasAPIIndicators(prompt: string): boolean {
    const indicators = ['api', 'rest', 'endpoint', 'service', 'microservice', 'integration'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasDataAnalysisIndicators(prompt: string): boolean {
    const indicators = ['data', 'analyze', 'statistics', 'metrics', 'trends', 'patterns', 'insights'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasPerformanceIndicators(prompt: string): boolean {
    const indicators = ['performance', 'benchmark', 'speed', 'efficiency', 'throughput', 'latency'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasComparisonIndicators(prompt: string): boolean {
    const indicators = ['compare', 'versus', 'vs', 'better', 'worse', 'alternative', 'option'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasContentCreationIndicators(prompt: string): boolean {
    const indicators = ['write', 'create', 'blog', 'article', 'content', 'story', 'post'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasDocumentationIndicators(prompt: string): boolean {
    const indicators = ['documentation', 'docs', 'manual', 'guide', 'tutorial', 'instructions'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasCommunicationIndicators(prompt: string): boolean {
    const indicators = ['email', 'message', 'letter', 'memo', 'communication', 'correspondence'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasMethodologyIndicators(prompt: string): boolean {
    const indicators = ['methodology', 'approach', 'framework', 'process', 'workflow', 'agile', 'scrum'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasBestPracticesIndicators(prompt: string): boolean {
    const indicators = ['best practices', 'standards', 'guidelines', 'recommendations', 'conventions'];
    return indicators.some(indicator => prompt.includes(indicator));
  }

  private hasInvestigationIndicators(prompt: string): boolean {
    const indicators = ['investigate', 'research', 'explore', 'study', 'examine', 'discover'];
    return indicators.some(indicator => prompt.includes(indicator));
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
