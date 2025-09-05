import { DomainAnalysis } from '../types/DomainTypes.js';

/**
 * ResearchDomain - Investigation, best practices, methodology exploration
 * Detects prompts related to research, investigation, and methodology exploration
 */
export class ResearchDomain {
  private readonly keywords = [
    // Research activities
    'research', 'investigate', 'investigation', 'explore', 'exploration',
    'discover', 'discovery', 'find', 'finding', 'study', 'examine',
    'survey', 'review', 'literature review', 'meta-analysis', 'synthesis',
    'explore', 'probe', 'delve', 'scrutinize', 'inspect', 'inquiry',
    'project', 'management', 'techniques', 'practices', 'methodologies',
    
    // Research contexts
    'best practices', 'methodology', 'approach', 'strategy', 'technique',
    'method', 'framework', 'model', 'theory', 'concept', 'principle',
    'guideline', 'standard', 'protocol', 'procedure', 'process',
    'solution', 'recommendation', 'suggestion', 'advice', 'guidance',
    
    // Research outcomes
    'findings', 'results', 'conclusions', 'insights', 'recommendations',
    'implications', 'applications', 'benefits', 'advantages', 'disadvantages',
    'pros', 'cons', 'trade-offs', 'considerations', 'factors', 'criteria'
  ];

  private readonly contexts = [
    // Research patterns
    'research best practices', 'investigate approaches', 'explore methods',
    'study methodology', 'review literature', 'find solutions', 'discover techniques',
    'examine strategies', 'survey options', 'analyze approaches', 'compare methods',
    'evaluate techniques', 'assess strategies', 'investigate solutions',
    
    // Investigation patterns
    'what are the best', 'how to choose', 'which approach', 'what methods',
    'recommendations for', 'guidelines for', 'best way to', 'optimal approach',
    'effective strategy', 'proven method', 'successful technique', 'reliable process',
    'standard practice', 'industry standard', 'common approach', 'typical method'
  ];

  private readonly highConfidenceKeywords = [
    'research', 'investigate', 'investigation', 'best practices', 'methodology',
    'approach', 'strategy', 'technique', 'method', 'framework', 'solution',
    'recommendation', 'guideline', 'standard', 'protocol', 'study', 'explore',
    'user experience', 'data science', 'devops', 'cybersecurity', 'mobile app'
  ];

  /**
   * Analyze prompt for research domain indicators
   */
  analyze(prompt: string): DomainAnalysis {
    const cleanPrompt = prompt.toLowerCase();
    const matchedKeywords: string[] = [];
    const matchedContexts: string[] = [];
    let confidence = 0;

    // Check for high-confidence keywords (weight: 3)
    for (const keyword of this.highConfidenceKeywords) {
      if (cleanPrompt.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 3;
      }
    }

    // Check for regular keywords (weight: 2)
    for (const keyword of this.keywords) {
      if (cleanPrompt.includes(keyword) && !this.highConfidenceKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 2;
      }
    }

    // Check for context patterns (weight: 4)
    for (const context of this.contexts) {
      if (cleanPrompt.includes(context)) {
        matchedContexts.push(context);
        confidence += 4;
      }
    }

    // Bonus for multiple indicators
    if (matchedKeywords.length > 2) {
      confidence += 2;
    }
    if (matchedContexts.length > 0) {
      confidence += 3;
    }

    // Normalize confidence to 0-100 scale (more generous scaling)
    confidence = Math.min(100, confidence * 2.5);

    return {
      confidence,
      indicators: [...matchedKeywords, ...matchedContexts],
      matchedKeywords,
      matchedContexts
    };
  }

  /**
   * Get domain type
   */
  getDomainType(): string {
    return 'research';
  }
}
