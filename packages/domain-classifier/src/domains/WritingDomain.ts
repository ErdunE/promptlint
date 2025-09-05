import { DomainAnalysis } from '../types/DomainTypes.js';

/**
 * WritingDomain - Blog posts, articles, creative writing, documentation
 * Detects prompts related to content creation, writing, and documentation
 */
export class WritingDomain {
  private readonly keywords = [
    // Content types
    'article', 'blog', 'post', 'document', 'documentation', 'essay', 'story',
    'content', 'text', 'copy', 'prose', 'narrative', 'report', 'summary',
    'review', 'analysis', 'critique', 'commentary', 'editorial', 'newsletter',
    
    // Writing activities
    'write', 'author', 'compose', 'draft', 'edit', 'revise', 'proofread',
    'publish', 'post', 'share', 'submit', 'create content', 'generate text',
    'craft', 'develop', 'structure', 'organize', 'format', 'style',
    
    // Writing contexts
    'about', 'regarding', 'concerning', 'on the topic of', 'explaining',
    'describing', 'discussing', 'presenting', 'introducing', 'concluding',
    'summarizing', 'outlining', 'detailing', 'elaborating', 'clarifying'
  ];

  private readonly contexts = [
    // Writing patterns
    'write about', 'create article', 'blog post', 'write a story', 'document process',
    'create content', 'write documentation', 'compose essay', 'draft report',
    'write review', 'create summary', 'write analysis', 'craft narrative',
    
    // Content creation patterns
    'explain how', 'describe the', 'discuss the', 'present information',
    'introduce concept', 'outline process', 'detail steps', 'elaborate on',
    'clarify meaning', 'summarize findings', 'analyze topic', 'critique approach'
  ];

  private readonly highConfidenceKeywords = [
    'article', 'blog', 'document', 'essay', 'story', 'content', 'write',
    'author', 'publish', 'documentation', 'review', 'summary', 'create',
    'compose', 'draft', 'newsletter', 'email', 'report'
  ];

  /**
   * Analyze prompt for writing domain indicators
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
    return 'writing';
  }
}
