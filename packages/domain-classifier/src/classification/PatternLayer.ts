/**
 * Pattern Layer - Advanced Context Pattern Recognition
 * Uses sophisticated regex patterns and grammatical structure analysis
 */

import { ClassificationLayer, DomainScore } from './ClassificationLayer.js';
import { DomainType } from '../types/DomainTypes.js';

interface PatternTemplate {
  pattern: RegExp;
  score: number;
  description: string;
}

export class PatternLayer implements ClassificationLayer {
  name = 'pattern';
  weight = 0.3;

  private domainPatterns: Map<DomainType, PatternTemplate[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Code Domain Patterns
    this.domainPatterns.set(DomainType.CODE, [
      // Implementation patterns
      { pattern: /\b(implement|build|create|develop)\s+(algorithm|function|method|class|program|application)\b/i, score: 0.9, description: 'implementation task' },
      { pattern: /\b(implement|build|create|develop)\s+.*?\s*(algorithm|function|method|class|program|application)\b/i, score: 0.85, description: 'complex implementation task' },
      { pattern: /\b(write|code|program)\s+(in\s+)?(python|javascript|java|typescript|c\+\+|react|node)\b/i, score: 0.95, description: 'programming language' },
      { pattern: /\b(debug|fix|troubleshoot|repair)\s+\w*\s*(code|bug|error|issue|problem)\b/i, score: 0.85, description: 'debugging task' },
      { pattern: /\b(optimize|refactor|improve)\s+\w*\s*(code|algorithm|performance|function|database|queries)\b/i, score: 0.8, description: 'code optimization' },
      { pattern: /\b(fix|resolve|repair)\s+\w*\s*(memory leak|performance issue|bug|error)\b/i, score: 0.85, description: 'issue resolution' },
      { pattern: /\b(create|build|design)\s+(api|database|schema|component|module|system|application)\b/i, score: 0.85, description: 'system component' },
      { pattern: /\b(create|build|design)\s+.*?\s*(authentication|security|user|system|application)\b/i, score: 0.8, description: 'complex system component' },
      { pattern: /\b(test|validate|verify)\s+\w*\s*(function|method|code|application)\b/i, score: 0.8, description: 'testing task' },
      
      // Technical context patterns
      { pattern: /\b(software|application|system|program)\s+(development|engineering|architecture)\b/i, score: 0.8, description: 'software development' },
      { pattern: /\b(authentication|security|encryption|database)\s+(implementation|setup|configuration)\b/i, score: 0.85, description: 'technical implementation' }
    ]);

    // Analysis Domain Patterns
    this.domainPatterns.set(DomainType.ANALYSIS, [
      // Analysis action patterns
      { pattern: /\b(analyze|evaluate|assess|examine|review)\s+\w*\s*(data|trends|performance|metrics|results)\b/i, score: 0.9, description: 'data analysis' },
      { pattern: /\b(compare|contrast|benchmark)\s+(approaches|methods|solutions|options|strategies)\b/i, score: 0.9, description: 'comparative analysis' },
      { pattern: /\b(compare|contrast|benchmark)\s+.*?\s*(approaches|methods|solutions|options|strategies)\b/i, score: 0.85, description: 'complex comparative analysis' },
      { pattern: /\b(study|investigate|explore)\s+\w*\s*(patterns|behavior|correlations|relationships)\b/i, score: 0.8, description: 'pattern investigation' },
      { pattern: /\b(calculate|measure|compute|assess)\s+\w*\s*(roi|metrics|statistics|performance|efficiency|scores|satisfaction)\b/i, score: 0.8, description: 'quantitative analysis' },
      { pattern: /\b(assess|evaluate|measure)\s+\w*\s*(customer|user|client)\s+(satisfaction|experience|feedback|scores)\b/i, score: 0.85, description: 'customer analysis' },
      { pattern: /\b(examine|assess|evaluate)\s+\w*\s*(impact|effectiveness|outcomes|results)\b/i, score: 0.8, description: 'impact evaluation' },
      
      // Data analysis context
      { pattern: /\b(market|business|financial|customer|sales)\s+(analysis|evaluation|assessment)\b/i, score: 0.85, description: 'business analysis' },
      { pattern: /\b(statistical|performance|quality|efficiency)\s+(analysis|evaluation|metrics)\b/i, score: 0.8, description: 'performance analysis' }
    ]);

    // Writing Domain Patterns
    this.domainPatterns.set(DomainType.WRITING, [
      // Content creation patterns
      { pattern: /\b(write|create|draft|compose)\s+(article|blog|post|essay|story|content|document|email|letter)\b/i, score: 0.9, description: 'content creation' },
      { pattern: /\b(compose|write|draft)\s+(email|letter|memo|message)\s+(to|for)\s+\w+\b/i, score: 0.85, description: 'communication writing' },
      { pattern: /\b(author|publish|post|share)\s+\w*\s*(article|blog|content|story|essay)\b/i, score: 0.85, description: 'publishing task' },
      { pattern: /\b(document|explain|describe|outline)\s+\w*\s*(process|procedure|method|approach|concept)\b/i, score: 0.8, description: 'documentation' },
      { pattern: /\b(review|critique|evaluate)\s+\w*\s*(book|article|product|service|work)\b/i, score: 0.8, description: 'review writing' },
      { pattern: /\b(summarize|summarise|condense)\s+\w*\s*(information|content|findings|report)\b/i, score: 0.75, description: 'summarization' },
      
      // Writing context patterns
      { pattern: /\b(newsletter|email|letter|memo|report)\s+(writing|creation|drafting)\b/i, score: 0.85, description: 'business writing' },
      { pattern: /\b(creative|fictional|narrative|storytelling)\s+(writing|content|story)\b/i, score: 0.8, description: 'creative writing' }
    ]);

    // Research Domain Patterns
    this.domainPatterns.set(DomainType.RESEARCH, [
      // Research action patterns
      { pattern: /\b(research|investigate|explore|study)\s+\w*\s*(best practices|methodologies|approaches|techniques)\b/i, score: 0.9, description: 'methodology research' },
      { pattern: /\b(find|discover|identify)\s+\w*\s*(solutions|methods|techniques|tools|approaches)\b/i, score: 0.8, description: 'solution discovery' },
      { pattern: /\b(explore|investigate|examine)\s+\w*\s*(trends|technologies|frameworks|standards|methodology|methodologies)\b/i, score: 0.8, description: 'technology exploration' },
      { pattern: /\b(explore|study|investigate)\s+\w*\s*(agile|scrum|devops|methodology|framework|approach)\b/i, score: 0.85, description: 'methodology exploration' },
      { pattern: /\b(compare|evaluate|assess)\s+\w*\s*(tools|platforms|solutions|options)\b/i, score: 0.75, description: 'tool comparison' },
      
      // Research context patterns
      { pattern: /\b(agile|devops|security|ux|ui|machine learning|ai)\s+(best practices|methodologies|approaches)\b/i, score: 0.85, description: 'domain research' },
      { pattern: /\b(industry|market|competitive)\s+(research|analysis|investigation)\b/i, score: 0.8, description: 'market research' }
    ]);
  }

  classify(prompt: string): DomainScore[] {
    const scores: DomainScore[] = [];
    const cleanPrompt = prompt.toLowerCase();

    for (const [domain, patterns] of this.domainPatterns.entries()) {
      let maxScore = 0;
      const matchedPatterns: string[] = [];
      let matchCount = 0;

      for (const patternTemplate of patterns) {
        const match = patternTemplate.pattern.exec(cleanPrompt);
        if (match) {
          maxScore = Math.max(maxScore, patternTemplate.score);
          matchedPatterns.push(patternTemplate.description);
          matchCount++;
        }
      }

      if (maxScore > 0) {
        // Enhanced score calibration for better aggregation
        const calibratedScore = this.calibratePatternScore(maxScore, matchCount, matchedPatterns);
        scores.push({
          domain,
          score: calibratedScore,
          method: 'pattern',
          indicators: matchedPatterns
        });
      }
    }

    return scores;
  }

  private calibratePatternScore(rawScore: number, matchCount: number, patterns: string[]): number {
    // Strong pattern matches should contribute significantly to final confidence
    if (rawScore >= 0.9 && matchCount >= 1) return 0.95; // Very strong patterns
    if (rawScore >= 0.85 && matchCount >= 1) return 0.90; // Strong patterns
    if (rawScore >= 0.8 && matchCount >= 1) return 0.85;  // Good patterns
    
    // Multiple pattern matches boost confidence
    if (matchCount >= 2) {
      return Math.min(0.9, rawScore + 0.1);
    }
    
    // Single pattern matches
    if (matchCount === 1) {
      return Math.min(0.85, rawScore + 0.05);
    }
    
    return rawScore;
  }
}
