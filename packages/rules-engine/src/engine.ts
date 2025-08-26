/**
 * Core lint engine that orchestrates rule execution and scoring
 */

import { LintResult, LintIssue, LintEngineConfig } from '@promptlint/shared-types';
import { getAllRules, LintRule } from './rules';
import { calculateScore } from './scoring';

/**
 * Default configuration for the lint engine
 */
const DEFAULT_CONFIG: LintEngineConfig = {
  rules: [
    { type: 'missing_task_verb' as any, enabled: true, severity: 'medium' },
    { type: 'missing_language' as any, enabled: true, severity: 'high' },
    { type: 'missing_io_specification' as any, enabled: true, severity: 'medium' },
    { type: 'vague_wording' as any, enabled: true, severity: 'medium' },
    { type: 'unclear_scope' as any, enabled: true, severity: 'medium' },
    { type: 'redundant_language' as any, enabled: true, severity: 'low' }
  ],
  scoring: {
    baseScore: 100,
    highSeverityPenalty: 43, // Balanced for proper penalties while maintaining Product Spec
    mediumSeverityPenalty: 23, // Balanced for differentiation
    lowSeverityPenalty: 12, // Moderate penalty for multiple issues
    // Granularity bonuses for better UX
    taskVerbQualityBonus: 5, // Bonus for excellent task verbs
    specificityBonus: 3, // Bonus for specific terms like "algorithm", "function"
    clarityBonus: 2 // Bonus for clear, well-structured prompts
  },
  performance: {
    maxProcessingTime: 50
  }
};

/**
 * Main lint engine class that coordinates rule execution
 */
export class LintEngine {
  private rules: LintRule[];
  private config: LintEngineConfig;

  constructor(config: Partial<LintEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rules = getAllRules();
  }

  /**
   * Analyzes a prompt using all enabled rules
   * 
   * @param input - The prompt text to analyze
   * @returns Complete lint analysis result
   */
  analyze(input: string): LintResult {
    const issues: LintIssue[] = [];
    const suggestions: string[] = [];

    // Execute all enabled rules
    for (const rule of this.rules) {
      const ruleConfig = this.config.rules.find(r => r.type === rule.type);
      
      if (!ruleConfig || !ruleConfig.enabled) {
        continue;
      }

      try {
        const ruleResult = rule.analyze(input);
        
        if (ruleResult.hasIssue) {
          const issue: LintIssue = {
            type: rule.type,
            severity: ruleConfig.severity,
            message: ruleResult.message
          };
          
          if (ruleResult.position) {
            issue.position = ruleResult.position;
          }
          
          issues.push(issue);
        }

        // Add rule-specific suggestions
        if (ruleResult.suggestion) {
          suggestions.push(ruleResult.suggestion);
        }
      } catch (error) {
        // Log error but don't break analysis
        console.warn(`Rule ${rule.type} failed:`, error);
      }
    }

    // Calculate composite score
    const score = calculateScore(issues, this.config.scoring, input);

    const result: LintResult = {
      score,
      issues
    };
    
    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }
    
    return result;
  }

  /**
   * Get current engine configuration
   */
  getConfig(): LintEngineConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(newConfig: Partial<LintEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
