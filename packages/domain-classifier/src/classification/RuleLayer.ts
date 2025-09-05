/**
 * Rule Layer - Enhanced Rule-Based Classification with Exclusions
 * Prevents over-detection through sophisticated keyword analysis and context requirements
 */

import { ClassificationLayer, DomainScore } from './ClassificationLayer.js';
import { DomainType } from '../types/DomainTypes.js';

interface DomainRule {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  contextRequirements: string[];
  exclusions: string[]; // Patterns that should NOT trigger this domain
  bonusPatterns: string[]; // High-confidence patterns
}

export class RuleLayer implements ClassificationLayer {
  name = 'rule';
  weight = 0.2;

  private domainRules: Map<DomainType, DomainRule> = new Map();

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Code Domain Rules
    this.domainRules.set(DomainType.CODE, {
      primaryKeywords: ['implement', 'debug', 'optimize', 'refactor', 'code', 'program', 'develop', 'build'],
      secondaryKeywords: ['algorithm', 'function', 'method', 'class', 'variable', 'array', 'loop', 'api', 'database'],
      contextRequirements: ['programming', 'development', 'software', 'application', 'system'],
      exclusions: [
        'analyze data', 'write about', 'research methods', 'study trends', 
        'evaluate performance', 'assess results', 'compare approaches',
        'research mobile app', 'research best practices', 'investigate approaches'
      ],
      bonusPatterns: [
        'in python', 'in javascript', 'in java', 'in typescript', 'in c++',
        'write a function', 'implement algorithm', 'debug code', 'create api',
        'optimize database', 'build rest api', 'fix memory leak', 'create database'
      ]
    });

    // Analysis Domain Rules
    this.domainRules.set(DomainType.ANALYSIS, {
      primaryKeywords: ['analyze', 'evaluate', 'assess', 'examine', 'study', 'investigate', 'measure', 'calculate', 'track', 'monitor'],
      secondaryKeywords: ['data', 'trends', 'patterns', 'metrics', 'performance', 'results', 'findings', 'statistics', 'traffic', 'scores', 'benchmark'],
      contextRequirements: ['data analysis', 'performance evaluation', 'comparative study', 'statistical analysis', 'measurement analysis'],
      exclusions: [
        'debug code', 'implement algorithm', 'write function', 'create program',
        'write article', 'compose essay', 'research best practices'
      ],
      bonusPatterns: [
        'analyze data', 'evaluate performance', 'assess results', 'examine trends',
        'compare approaches', 'benchmark performance', 'statistical analysis'
      ]
    });

    // Writing Domain Rules
    this.domainRules.set(DomainType.WRITING, {
      primaryKeywords: ['write', 'create', 'compose', 'draft', 'author', 'publish'],
      secondaryKeywords: ['article', 'blog', 'post', 'essay', 'story', 'content', 'document', 'report'],
      contextRequirements: ['content creation', 'documentation', 'publishing', 'communication'],
      exclusions: [
        'debug code', 'implement algorithm', 'analyze data', 'research methods',
        'evaluate performance', 'study trends', 'investigate approaches'
      ],
      bonusPatterns: [
        'write article', 'create blog', 'compose essay', 'draft report',
        'publish content', 'author story', 'document process'
      ]
    });

    // Research Domain Rules
    this.domainRules.set(DomainType.RESEARCH, {
      primaryKeywords: ['research', 'investigate', 'explore', 'study', 'find', 'discover'],
      secondaryKeywords: ['best practices', 'methodologies', 'approaches', 'techniques', 'solutions', 'tools', 'frameworks', 'strategies'],
      contextRequirements: ['methodology exploration', 'best practices research', 'solution discovery', 'framework research'],
      exclusions: [
        'debug code', 'implement algorithm', 'write article', 'analyze data',
        'evaluate performance', 'compose essay', 'create content'
      ],
      bonusPatterns: [
        'research best practices', 'investigate approaches', 'explore methodologies',
        'find solutions', 'discover techniques', 'study methods'
      ]
    });
  }

  classify(prompt: string): DomainScore[] {
    const scores: DomainScore[] = [];
    const cleanPrompt = prompt.toLowerCase();

    for (const [domain, rule] of this.domainRules.entries()) {
      // Check exclusions first - if any exclusion pattern matches, skip this domain
      const hasExclusion = rule.exclusions.some(exclusion => 
        cleanPrompt.includes(exclusion.toLowerCase())
      );

      if (hasExclusion) {
        continue; // Skip this domain due to exclusion
      }

      let score = 0;
      const indicators: string[] = [];

      // Check bonus patterns (high confidence)
      for (const bonusPattern of rule.bonusPatterns) {
        if (cleanPrompt.includes(bonusPattern.toLowerCase())) {
          score = Math.max(score, 0.9);
          indicators.push(`bonus: ${bonusPattern}`);
        }
      }

      // Check primary keywords
      let primaryMatches = 0;
      for (const keyword of rule.primaryKeywords) {
        if (cleanPrompt.includes(keyword)) {
          primaryMatches++;
          indicators.push(`primary: ${keyword}`);
        }
      }

      // Check secondary keywords
      let secondaryMatches = 0;
      for (const keyword of rule.secondaryKeywords) {
        if (cleanPrompt.includes(keyword)) {
          secondaryMatches++;
          indicators.push(`secondary: ${keyword}`);
        }
      }

      // Check context requirements
      let contextMatches = 0;
      for (const context of rule.contextRequirements) {
        if (cleanPrompt.includes(context.toLowerCase())) {
          contextMatches++;
          indicators.push(`context: ${context}`);
        }
      }

      // Calculate score based on matches
      if (score === 0) { // No bonus pattern matched
        score = (primaryMatches * 0.3) + (secondaryMatches * 0.2) + (contextMatches * 0.1);
        score = Math.min(score, 0.8); // Cap at 0.8 for non-bonus patterns
      }

      // Enhanced score calibration for rule-based classification
      const calibratedScore = this.calibrateRuleScore(score, primaryMatches, secondaryMatches, contextMatches);

      // Require minimum threshold for classification
      if (calibratedScore >= 0.3) {
        scores.push({
          domain,
          score: calibratedScore,
          method: 'rule',
          indicators
        });
      }
    }

    return scores;
  }

  private calibrateRuleScore(score: number, primaryMatches: number, secondaryMatches: number, contextMatches: number): number {
    // Strong rule matches should contribute significantly to final confidence
    if (score >= 0.9) return 0.95; // Bonus patterns are very strong
    
    // Multiple strong indicators boost confidence
    const totalMatches = primaryMatches + secondaryMatches + contextMatches;
    if (totalMatches >= 3) {
      return Math.min(0.9, score + 0.15); // Strong boost for multiple indicators
    }
    if (totalMatches >= 2) {
      return Math.min(0.85, score + 0.1); // Moderate boost for multiple indicators
    }
    
    // Primary keyword matches are strong indicators
    if (primaryMatches >= 2) {
      return Math.min(0.8, score + 0.1);
    }
    
    // Single strong indicator
    if (primaryMatches === 1 && secondaryMatches >= 1) {
      return Math.min(0.75, score + 0.05);
    }
    
    return score;
  }
}
