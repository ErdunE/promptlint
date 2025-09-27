/**
 * Faithfulness Validator - ES Module
 * 
 * Strict validation system that enforces faithfulness principles
 * CRITICAL: Rejects any template that violates user intent
 * Chrome Extension Compatible - Browser APIs Only
 */

import { FaithfulnessResult, FaithfulnessViolation } from '../types/TemplateTypes.js';

export class FaithfulnessValidator {
  /**
   * Validate generated content against faithfulness principles
   * 
   * @param original - Original prompt text
   * @param generated - Generated template content
   * @returns Validation result with violations
   */
  validate(original: string, generated: string): FaithfulnessResult {
    const violations: FaithfulnessViolation[] = [];
    
    // Check for forbidden additions
    violations.push(...this.checkForbiddenAdditions(original, generated));
    
    // Check for scope changes
    violations.push(...this.checkScopeChanges(original, generated));
    
    // Check for context assumptions
    violations.push(...this.checkContextAssumptions(original, generated));
    
    // Check for technical additions
    violations.push(...this.checkTechnicalAdditions(original, generated));
    
    // Check for requirement expansion
    violations.push(...this.checkRequirementExpansion(original, generated));
    
    // Calculate validation score
    const score = this.calculateValidationScore(violations);
    const passed = violations.length === 0 || violations.every(v => v.severity !== 'critical');
    
    // Generate validation report
    const report = this.generateValidationReport(violations, score);
    
    return {
      isValid: passed,
      score,
      violations,
      report
    };
  }
  
  /**
   * Check for forbidden technical additions
   */
  private checkForbiddenAdditions(original: string, generated: string): FaithfulnessViolation[] {
    const violations: FaithfulnessViolation[] = [];
    const originalLower = original.toLowerCase();
    const generatedLower = generated.toLowerCase();
    
    // Programming languages
    const programmingLanguages = [
      'python', 'javascript', 'java', 'cpp', 'c++', 'typescript', 'go', 'rust',
      'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'c#',
      'vb.net', 'perl', 'haskell', 'clojure', 'erlang', 'elixir'
    ];
    
    for (const language of programmingLanguages) {
      if (generatedLower.includes(language) && !originalLower.includes(language)) {
        violations.push({
          type: 'technical_addition',
          description: `Added programming language '${language}' not specified in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'critical'
        });
      }
    }
    
    // Frameworks and libraries
    const frameworks = [
      'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask',
      'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap',
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy'
    ];
    
    for (const framework of frameworks) {
      if (generatedLower.includes(framework) && !originalLower.includes(framework)) {
        violations.push({
          type: 'technical_addition',
          description: `Added framework/library '${framework}' not specified in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'high'
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Check for scope changes
   */
  private checkScopeChanges(original: string, generated: string): FaithfulnessViolation[] {
    const violations: FaithfulnessViolation[] = [];
    
    // Check for major scope expansion
    const originalWords = original.split(/\s+/).length;
    const generatedWords = generated.split(/\s+/).length;
    
    if (generatedWords > originalWords * 2) {
      violations.push({
        type: 'changed_scope',
        description: `Generated content is significantly longer than original (${generatedWords} vs ${originalWords} words)`,
        originalText: original,
        generatedText: generated,
        severity: 'high'
      });
    }
    
    // Check for scope narrowing
    if (generatedWords < originalWords * 0.5) {
      violations.push({
        type: 'changed_scope',
        description: `Generated content is significantly shorter than original (${generatedWords} vs ${originalWords} words)`,
        originalText: original,
        generatedText: generated,
        severity: 'medium'
      });
    }
    
    return violations;
  }
  
  /**
   * Check for context assumptions
   */
  private checkContextAssumptions(original: string, generated: string): FaithfulnessViolation[] {
    const violations: FaithfulnessViolation[] = [];
    const originalLower = original.toLowerCase();
    const generatedLower = generated.toLowerCase();
    
    // Check for skill level assumptions
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert', 'professional'];
    for (const level of skillLevels) {
      if (generatedLower.includes(level) && !originalLower.includes(level)) {
        violations.push({
          type: 'context_assumption',
          description: `Assumed skill level '${level}' not specified in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'medium'
        });
      }
    }
    
    // Check for project type assumptions
    const projectTypes = ['web application', 'mobile app', 'desktop application', 'api', 'database'];
    for (const type of projectTypes) {
      if (generatedLower.includes(type) && !originalLower.includes(type)) {
        violations.push({
          type: 'context_assumption',
          description: `Assumed project type '${type}' not specified in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'medium'
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Check for technical additions
   */
  private checkTechnicalAdditions(original: string, generated: string): FaithfulnessViolation[] {
    const violations: FaithfulnessViolation[] = [];
    const originalLower = original.toLowerCase();
    const generatedLower = generated.toLowerCase();
    
    // Check for version specifications
    const versionPattern = /\d+\.\d+/g;
    const originalVersions: string[] = originalLower.match(versionPattern) || [];
    const generatedVersions: string[] = generatedLower.match(versionPattern) || [];
    
    for (const version of generatedVersions) {
      if (!originalVersions.includes(version)) {
        violations.push({
          type: 'technical_addition',
          description: `Added version specification '${version}' not in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'high'
        });
      }
    }
    
    // Check for environment specifications
    const environments = ['development', 'production', 'staging', 'testing', 'local', 'server'];
    for (const env of environments) {
      if (generatedLower.includes(env) && !originalLower.includes(env)) {
        violations.push({
          type: 'technical_addition',
          description: `Added environment specification '${env}' not in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'medium'
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Check for requirement expansion
   */
  private checkRequirementExpansion(original: string, generated: string): FaithfulnessViolation[] {
    const violations: FaithfulnessViolation[] = [];
    const originalLower = original.toLowerCase();
    const generatedLower = generated.toLowerCase();
    
    // Check for additional features
    const featureKeywords = ['feature', 'functionality', 'capability', 'option', 'setting'];
    for (const keyword of featureKeywords) {
      if (generatedLower.includes(keyword) && !originalLower.includes(keyword)) {
        violations.push({
          type: 'added_requirement',
          description: `Added feature requirement '${keyword}' not in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'high'
        });
      }
    }
    
    // Check for additional constraints
    const constraintKeywords = ['constraint', 'limit', 'restriction', 'requirement', 'must', 'should'];
    for (const keyword of constraintKeywords) {
      if (generatedLower.includes(keyword) && !originalLower.includes(keyword)) {
        violations.push({
          type: 'added_requirement',
          description: `Added constraint '${keyword}' not in original prompt`,
          originalText: original,
          generatedText: generated,
          severity: 'medium'
        });
      }
    }
    
    return violations;
  }
  
  /**
   * Calculate validation score based on violations
   */
  private calculateValidationScore(violations: FaithfulnessViolation[]): number {
    if (violations.length === 0) {
      return 100;
    }
    
    let score = 100;
    
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 50;
          break;
        case 'high':
          score -= 25;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Generate validation report
   */
  private generateValidationReport(violations: FaithfulnessViolation[], score: number): string {
    if (violations.length === 0) {
      return '✅ Faithfulness validation passed - no violations detected';
    }
    
    let report = `❌ Faithfulness validation failed - ${violations.length} violation(s) detected\n\n`;
    
    for (const violation of violations) {
      report += `• ${violation.severity.toUpperCase()}: ${violation.description}\n`;
    }
    
    report += `\nValidation Score: ${score}/100`;
    
    return report;
  }
}
