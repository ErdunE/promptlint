/**
 * Tests for the scoring system
 */

import { describe, it, expect } from 'vitest';
import { calculateScore, getSeverityWeight, calculateWeightedIssueCount } from '../scoring';
import { LintIssue, LintRuleType } from '@promptlint/shared-types';

describe('Scoring System', () => {
  const defaultConfig = {
    baseScore: 100,
    highSeverityPenalty: 25,
    mediumSeverityPenalty: 15,
    lowSeverityPenalty: 5
  };

  describe('calculateScore', () => {
    it('should return base score for no issues', () => {
      const score = calculateScore([], defaultConfig);
      expect(score).toBe(100);
    });

    it('should apply high severity penalties correctly', () => {
      const issues: LintIssue[] = [
        {
          type: LintRuleType.MISSING_LANGUAGE,
          severity: 'high',
          message: 'Test issue'
        }
      ];
      
      const score = calculateScore(issues, defaultConfig);
      expect(score).toBe(75); // 100 - 25
    });

    it('should apply medium severity penalties correctly', () => {
      const issues: LintIssue[] = [
        {
          type: LintRuleType.MISSING_TASK_VERB,
          severity: 'medium',
          message: 'Test issue'
        }
      ];
      
      const score = calculateScore(issues, defaultConfig);
      expect(score).toBe(85); // 100 - 15
    });

    it('should apply low severity penalties correctly', () => {
      const issues: LintIssue[] = [
        {
          type: LintRuleType.REDUNDANT_LANGUAGE,
          severity: 'low',
          message: 'Test issue'
        }
      ];
      
      const score = calculateScore(issues, defaultConfig);
      expect(score).toBe(95); // 100 - 5
    });

    it('should handle multiple issues correctly', () => {
      const issues: LintIssue[] = [
        {
          type: LintRuleType.MISSING_LANGUAGE,
          severity: 'high',
          message: 'Test issue 1'
        },
        {
          type: LintRuleType.MISSING_TASK_VERB,
          severity: 'medium',
          message: 'Test issue 2'
        },
        {
          type: LintRuleType.REDUNDANT_LANGUAGE,
          severity: 'low',
          message: 'Test issue 3'
        }
      ];
      
      const score = calculateScore(issues, defaultConfig);
      expect(score).toBe(55); // 100 - 25 - 15 - 5
    });

    it('should never return negative scores', () => {
      const issues: LintIssue[] = Array(10).fill({
        type: LintRuleType.MISSING_LANGUAGE,
        severity: 'high',
        message: 'Test issue'
      });
      
      const score = calculateScore(issues, defaultConfig);
      expect(score).toBe(0);
    });

    it('should never return scores above 100', () => {
      const config = {
        baseScore: 150,
        highSeverityPenalty: 0,
        mediumSeverityPenalty: 0,
        lowSeverityPenalty: 0
      };
      
      const score = calculateScore([], config);
      expect(score).toBe(100);
    });
  });

  describe('getSeverityWeight', () => {
    it('should return correct weights for each severity', () => {
      expect(getSeverityWeight('high')).toBe(3);
      expect(getSeverityWeight('medium')).toBe(2);
      expect(getSeverityWeight('low')).toBe(1);
    });
  });

  describe('calculateWeightedIssueCount', () => {
    it('should calculate weighted count correctly', () => {
      const issues: LintIssue[] = [
        {
          type: LintRuleType.MISSING_LANGUAGE,
          severity: 'high',
          message: 'Test'
        },
        {
          type: LintRuleType.MISSING_TASK_VERB,
          severity: 'medium',
          message: 'Test'
        },
        {
          type: LintRuleType.REDUNDANT_LANGUAGE,
          severity: 'low',
          message: 'Test'
        }
      ];
      
      const weightedCount = calculateWeightedIssueCount(issues);
      expect(weightedCount).toBe(6); // 3 + 2 + 1
    });
  });
});
