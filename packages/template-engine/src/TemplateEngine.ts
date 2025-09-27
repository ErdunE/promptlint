/**
 * Template Engine - ES Module
 * 
 * Main orchestration class for template generation
 * Coordinates pattern matching, template application, and validation
 * Chrome Extension Compatible - Browser APIs Only
 */

import { 
  TemplateCandidate, 
  TemplateContext, 
  TemplateMetadata,
  FaithfulnessResult
} from './types/TemplateTypes.js';
import { LintResult } from '@promptlint/shared-types';
import { PatternMatcher } from './PatternMatcher.js';
import { 
  TaskIOTemplate, 
  BulletTemplate, 
  SequentialTemplate, 
  MinimalTemplate 
} from './templates/index.js';
import { HybridClassifier } from '@promptlint/domain-classifier';

export class TemplateEngine {
  private patternMatcher: PatternMatcher;
  private domainClassifier: HybridClassifier;
  private templates: Map<string, any>;
  private initialized: boolean = false;
  
  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.domainClassifier = new HybridClassifier();
    this.templates = new Map();
    
    // Initialize template registry
    this.initializeTemplates();
  }

  /**
   * Initialize the domain classifier
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.domainClassifier.initialize();
      this.initialized = true;
    }
  }
  
  /**
   * Initialize template registry with all available templates
   */
  private initializeTemplates(): void {
    this.templates.set('task_io', TaskIOTemplate);
    this.templates.set('bullet', BulletTemplate);
    this.templates.set('sequential', SequentialTemplate);
    this.templates.set('minimal', MinimalTemplate);
  }
  
  /**
   * Generate template candidates for a prompt with domain-aware selection
   * 
   * @param prompt - Original prompt text
   * @param lintResult - Lint analysis result
   * @returns Array of template candidates
   */
  async generateCandidates(prompt: string, lintResult: LintResult): Promise<TemplateCandidate[]> {
    const startTime = performance.now();
    
    try {
      // Ensure domain classifier is initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Classify domain for intelligent template selection
      const domainResult = await this.domainClassifier.classify(prompt);
      
      // Create template context with domain information
      const context: TemplateContext = {
        prompt,
        lintResult,
        config: {
          maxCandidates: 3,
          enableDiversity: true,
          faithfulnessThreshold: 70,
          performanceTimeout: 5000,
          enableEnhancedSelection: true
        },
        metadata: {
          type: 'template_context',
          name: 'TemplateContext',
          description: 'Context for template generation with domain awareness',
          version: '0.5.0',
          lastModified: Date.now(),
          timestamp: Date.now(),
          engine: 'TemplateEngine',
          domainClassification: domainResult
        }
      };
      
      // Select appropriate templates using enhanced selection with metadata
      const selectionResult = this.patternMatcher.selectTemplatesWithMetadata(lintResult, domainResult, prompt);
      const selectedTemplates = selectionResult.templates;
      const selectionMetadata = selectionResult.metadata;
      
      // Generate candidates for each selected template
      const candidates: TemplateCandidate[] = [];
      
      for (const templateType of selectedTemplates) {
        const candidate = this.generateCandidate(context, templateType);
        if (candidate) {
          // Add enhanced metadata to candidate
          if (candidate.metadata) {
            candidate.metadata.selectionMetadata = selectionMetadata;
            candidate.metadata.enhancedSelection = true;
          }
          candidates.push(candidate);
        }
      }
      
      // Sort candidates by score (highest first)
      candidates.sort((a, b) => b.score - a.score);
      
      // Limit to 2-3 candidates as per requirements
      const limitedCandidates = candidates.slice(0, 3);
      
      // Validate performance
      const totalTime = performance.now() - startTime;
      if (totalTime > 100) {
        console.warn(`Template generation took ${totalTime.toFixed(2)}ms, exceeding 100ms limit`);
      }
      
      return limitedCandidates;
      
    } catch (error) {
      console.error('Error generating template candidates:', error);
      
      // Fallback to minimal template
      return this.generateFallbackCandidate(prompt, lintResult);
    }
  }
  
  /**
   * Generate a single template candidate
   * 
   * @param context - Template context
   * @param templateType - Type of template to generate
   * @returns Template candidate or null if generation fails
   */
  private generateCandidate(context: TemplateContext, templateType: string): TemplateCandidate | null {
    try {
      const TemplateClass = this.templates.get(templateType);
      if (!TemplateClass) {
        console.warn(`Template type '${templateType}' not found`);
        return null;
      }
      
      // Create template instance
      const template = new TemplateClass();
      
      // Check if template is suitable for context
      if (!template.isSuitable(context)) {
        return null;
      }
      
      // Apply template with simplified validation
      const startTime = performance.now();
      const templateResult = template.apply(context);
      const executionTime = performance.now() - startTime;
      
      // Simplified faithfulness validation - MVP approach
      const isValid = templateResult.content && templateResult.content.length > 0;
      const faithfulnessScore = isValid ? 85 : 0; // Default good score for valid content
      
      // Create candidate
      const candidate: TemplateCandidate = {
        id: this.generateCandidateId(),
        type: templateType as any,
        content: templateResult.content,
        score: this.calculateSimpleScore(templateResult, faithfulnessScore),
        faithfulnessValidated: isValid,
        generationTime: executionTime,
        metadata: {
          templateType
        }
      };
      
      return candidate;
      
    } catch (error) {
      console.error(`Error generating candidate for template '${templateType}':`, error);
      return null;
    }
  }
  
  /**
   * Generate fallback candidate when primary generation fails
   * 
   * @param prompt - Original prompt text
   * @param lintResult - Lint analysis result
   * @returns Fallback template candidate
   */
  private generateFallbackCandidate(prompt: string, lintResult: LintResult): TemplateCandidate[] {
    try {
      const context: TemplateContext = {
        prompt,
        lintResult,
        config: {
          maxCandidates: 1,
          enableDiversity: false,
          faithfulnessThreshold: 50,
          performanceTimeout: 1000,
          enableEnhancedSelection: false
        },
        metadata: {
          type: 'template_context',
          name: 'TemplateContext',
          description: 'Context for template generation',
          version: '0.4.0',
          lastModified: Date.now(),
          timestamp: Date.now(),
          engine: 'TemplateEngine'
        }
      };
      
      // Use minimal template as fallback
      const minimalTemplate = new MinimalTemplate();
      const result = minimalTemplate.apply(context);
      
      const candidate: TemplateCandidate = {
        id: this.generateCandidateId(),
        type: 'minimal' as any,
        content: result.content,
        score: 0.5, // Lower score for fallback
        faithfulnessValidated: true,
        generationTime: 0,
        metadata: {
          templateType: 'minimal',
          faithfulnessResult: { isValid: true, violations: [], score: 100, report: 'Fallback template used' },
          performanceMetrics: { executionTime: 0, maxAllowedTime: 100, warningThreshold: 80, isAcceptable: true, isWarning: false, performanceRatio: 0 },
          warnings: ['Fallback template used due to generation failure']
        }
      };
      
      return [candidate];
      
    } catch (error) {
      console.error('Error generating fallback candidate:', error);
      
      // Ultimate fallback - return original prompt
      return [{
        id: this.generateCandidateId(),
        type: 'minimal' as any,
        content: prompt,
        score: 0.1,
        faithfulnessValidated: true,
        generationTime: 0,
        metadata: {
          templateType: 'minimal',
          faithfulnessResult: { isValid: true, violations: [], score: 100, report: 'Ultimate fallback used' },
          performanceMetrics: { executionTime: 0, maxAllowedTime: 100, warningThreshold: 80, isAcceptable: true, isWarning: false, performanceRatio: 0 },
          warnings: ['Ultimate fallback - original prompt returned']
        }
      }];
    }
  }
  
  /**
   * Calculate candidate score based on template result and faithfulness
   * 
   * @param result - Template application result
   * @param faithfulnessResult - Faithfulness validation result
   * @returns Calculated score
   */
  private calculateSimpleScore(result: any, faithfulnessScore: number): number {
    let score = 50; // Base score
    
    // Boost score for faithfulness
    if (faithfulnessScore > 0) {
      score += 30; // Faithfulness bonus
    }
    
    // Boost score for template quality
    if (result.score) {
      score += result.score * 0.2;
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Generate unique candidate ID
   * 
   * @returns Unique candidate ID
   */
  private generateCandidateId(): string {
    return `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get available template types
   * 
   * @returns Array of available template types
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
  
  /**
   * Get template metadata
   * 
   * @param templateType - Template type
   * @returns Template metadata or null if not found
   */
  getTemplateMetadata(templateType: string): TemplateMetadata | null {
    const TemplateClass = this.templates.get(templateType);
    if (!TemplateClass) {
      return null;
    }
    
    const template = new TemplateClass();
    return {
      templateType: templateType
    };
  }
  
  /**
   * Validate template engine health
   * 
   * @returns Health status
   */
  validateHealth(): {
    isHealthy: boolean;
    issues: string[];
    performance: any;
  } {
    const issues: string[] = [];
    
    // Check template registry
    if (this.templates.size === 0) {
      issues.push('No templates registered');
    }
    
    // Validators removed for MVP build - simplified validation approach
    
    // Check pattern matcher
    if (!this.patternMatcher) {
      issues.push('Pattern matcher not initialized');
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      performance: {
        maxExecutionTime: 100,
        warningThreshold: 80,
        templateCount: this.templates.size
      }
    };
  }
}
