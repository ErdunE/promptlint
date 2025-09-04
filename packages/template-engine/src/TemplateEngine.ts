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
import { FaithfulnessValidator } from './validators/FaithfulnessValidator.js';
import { PerformanceTimer } from './validators/PerformanceTimer.js';
import { 
  TaskIOTemplate, 
  BulletTemplate, 
  SequentialTemplate, 
  MinimalTemplate 
} from './templates/index.js';

export class TemplateEngine {
  private patternMatcher: PatternMatcher;
  private faithfulnessValidator: FaithfulnessValidator;
  private performanceTimer: PerformanceTimer;
  private templates: Map<string, any>;
  
  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.faithfulnessValidator = new FaithfulnessValidator();
    this.performanceTimer = new PerformanceTimer();
    this.templates = new Map();
    
    // Initialize template registry
    this.initializeTemplates();
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
   * Generate template candidates for a prompt
   * 
   * @param prompt - Original prompt text
   * @param lintResult - Lint analysis result
   * @returns Array of template candidates
   */
  generateCandidates(prompt: string, lintResult: LintResult): TemplateCandidate[] {
    const startTime = performance.now();
    
    try {
      // Create template context
      const context: TemplateContext = {
        prompt,
        lintResult,
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
      
      // Select appropriate templates based on lint issues
      const selectedTemplates = this.patternMatcher.selectTemplates(lintResult);
      
      // Generate candidates for each selected template
      const candidates: TemplateCandidate[] = [];
      
      for (const templateType of selectedTemplates) {
        const candidate = this.generateCandidate(context, templateType);
        if (candidate) {
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
      
      // Apply template with performance monitoring
      const timedResult = this.performanceTimer.measure(() => {
        return template.apply(context);
      });
      
      // Validate faithfulness
      const faithfulnessResult = this.faithfulnessValidator.validate(
        context.prompt,
        timedResult.result.content
      );
      
      // Create candidate
      const candidate: TemplateCandidate = {
        id: this.generateCandidateId(),
        type: templateType as any,
        content: timedResult.result.content,
        score: this.calculateScore(timedResult.result, faithfulnessResult),
        faithfulnessValidated: faithfulnessResult.isValid,
        generationTime: timedResult.executionTime,
        metadata: {
          templateType,
          faithfulnessResult,
          performanceMetrics: this.performanceTimer.getPerformanceMetrics(timedResult.executionTime),
          warnings: timedResult.warnings
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
  private calculateScore(result: any, faithfulnessResult: FaithfulnessResult): number {
    let score = 0.5; // Base score
    
    // Boost score for faithfulness
    if (faithfulnessResult.isValid) {
      score += 0.3;
    }
    
    // Boost score for template quality
    if (result.score) {
      score += result.score * 0.2;
    }
    
    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
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
      type: templateType,
      name: template.name,
      description: template.description,
      version: '0.4.0',
      lastModified: Date.now()
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
    
    // Check validators
    if (!this.faithfulnessValidator) {
      issues.push('Faithfulness validator not initialized');
    }
    
    if (!this.performanceTimer) {
      issues.push('Performance timer not initialized');
    }
    
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
