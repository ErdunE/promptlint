/**
 * Scoring system for calculating composite quality scores
 */

import { LintIssue, LintIssueSeverity } from '@promptlint/shared-types';

/**
 * Scoring configuration interface
 */
export interface ScoringConfig {
  baseScore: number;
  highSeverityPenalty: number;
  mediumSeverityPenalty: number;
  lowSeverityPenalty: number;
  taskVerbQualityBonus?: number;
  specificityBonus?: number;
  clarityBonus?: number;
}

/**
 * Calculate composite quality score from lint issues
 * 
 * Score calculation logic:
 * - Start with base score (100)
 * - Subtract penalties for each issue based on severity
 * - Add granularity bonuses for better mid-range differentiation
 * - Ensure score never goes below 0
 * 
 * @param issues - Array of lint issues found
 * @param config - Scoring configuration
 * @param input - Original prompt text for bonus calculations
 * @returns Quality score from 0-100
 */
export function calculateScore(issues: LintIssue[], config: ScoringConfig, input?: string): number {
  let score = config.baseScore;

  // Apply penalties for issues
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        score -= config.highSeverityPenalty;
        break;
      case 'medium':
        score -= config.mediumSeverityPenalty;
        break;
      case 'low':
        score -= config.lowSeverityPenalty;
        break;
    }
  }

  // Apply granularity bonuses for better UX (only if input provided)
  if (input) {
    score += calculateGranularityBonuses(input, config);
  }

  // Ensure score is within valid range
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate granularity bonuses for better mid-range differentiation
 * This improves UX by showing incremental improvements as users add details
 * 
 * CRITICAL: Bonuses are CUMULATIVE - adding more details should always increase scores
 */
function calculateGranularityBonuses(input: string, config: ScoringConfig): number {
  const cleanInput = input.toLowerCase().trim();
  let bonus = 0;
  
  // Task verb quality bonus - check for best verb present
  if (config.taskVerbQualityBonus) {
    const excellentVerbs = ['implement', 'develop', 'architect', 'construct', 'engineer'];
    const goodVerbs = ['build', 'create', 'generate', 'design', 'code', 'program'];
    
    if (excellentVerbs.some(verb => cleanInput.includes(verb))) {
      bonus += config.taskVerbQualityBonus;
    } else if (goodVerbs.some(verb => cleanInput.includes(verb))) {
      bonus += Math.round(config.taskVerbQualityBonus * 0.6); // 60% of bonus
    }
  }
  
  // Specificity bonus - CUMULATIVE for all specific terms
  if (config.specificityBonus) {
    const specificTerms = ['algorithm', 'function', 'method', 'class', 'module', 'component'];
    const matchedTerms = specificTerms.filter(term => cleanInput.includes(term));
    // Give full bonus for first term, half bonus for additional terms
    if (matchedTerms.length > 0) {
      bonus += config.specificityBonus;
      if (matchedTerms.length > 1) {
        bonus += Math.round(config.specificityBonus * 0.5 * (matchedTerms.length - 1));
      }
    }
  }
  
  // Clarity bonus - CUMULATIVE for all clarity improvements
  if (config.clarityBonus) {
    const clarityIndicators = [
      { pattern: ' with ', desc: 'with clause' },
      { pattern: ' that ', desc: 'that clause' }, 
      { pattern: ' for ', desc: 'for clause' },
      { pattern: 'input', desc: 'input specification' },
      { pattern: 'output', desc: 'output specification' },
      { pattern: 'return', desc: 'return specification' }
    ];
    
    const matchedIndicators = clarityIndicators.filter(indicator => 
      cleanInput.includes(indicator.pattern)
    );
    
    // Each clarity indicator adds to the bonus
    bonus += Math.round(config.clarityBonus * matchedIndicators.length * 0.3);
    
    // Additional bonus for detailed prompts (length-based)
    if (cleanInput.length > 30 && cleanInput.split(' ').length >= 6) {
      bonus += Math.round(config.clarityBonus * 0.5);
    }
  }
  
  return bonus;
}

/**
 * Get severity weight for scoring calculations
 * 
 * @param severity - Issue severity level
 * @returns Numeric weight for the severity
 */
export function getSeverityWeight(severity: LintIssueSeverity): number {
  switch (severity) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * Calculate weighted issue count for analytics
 * 
 * @param issues - Array of lint issues
 * @returns Weighted sum of all issues
 */
export function calculateWeightedIssueCount(issues: LintIssue[]): number {
  return issues.reduce((sum, issue) => sum + getSeverityWeight(issue.severity), 0);
}
