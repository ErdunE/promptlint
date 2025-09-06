import { DomainAnalysis } from '../types/DomainTypes.js';

/**
 * AnalysisDomain - Data analysis, performance evaluation, comparative studies
 * Detects prompts related to analytical tasks, data processing, and evaluation
 */
export class AnalysisDomain {
  private readonly keywords = [
    // Analysis activities
    'analyze', 'analysis', 'evaluate', 'evaluation', 'assess', 'assessment',
    'examine', 'examination', 'investigate', 'investigation', 'study', 'research',
    'compare', 'comparison', 'contrast', 'benchmark', 'measure', 'measurement',
    'calculate', 'calculation', 'compute', 'computation', 'process', 'processing',
    'different', 'approaches', 'methods', 'techniques', 'strategies', 'solutions',
    
    // Data and metrics
    'data', 'dataset', 'metrics', 'statistics', 'statistical', 'numbers',
    'figures', 'results', 'findings', 'outcomes', 'performance', 'efficiency',
    'effectiveness', 'accuracy', 'precision', 'recall', 'correlation', 'trend',
    'pattern', 'insight', 'conclusion', 'summary', 'report', 'dashboard',
    
    // Analytical contexts
    'trends', 'patterns', 'relationships', 'causation', 'correlation',
    'distribution', 'variance', 'deviation', 'average', 'mean', 'median',
    'percentile', 'quartile', 'range', 'spread', 'outlier', 'anomaly'
  ];

  private readonly contexts = [
    // Analysis patterns
    'analyze data', 'evaluate performance', 'assess results', 'examine trends',
    'investigate patterns', 'study correlation', 'compare approaches',
    'benchmark performance', 'measure effectiveness', 'calculate metrics',
    'process information', 'examine findings', 'assess impact', 'evaluate outcomes',
    
    // Data analysis patterns
    'data analysis', 'performance evaluation', 'statistical analysis',
    'trend analysis', 'pattern recognition', 'correlation study',
    'comparative study', 'benchmark analysis', 'impact assessment',
    'effectiveness evaluation', 'metrics calculation', 'insight generation',
    
    // Market and business analysis patterns
    'market trends', 'business analysis', 'financial analysis', 'competitive analysis',
    'market data', 'sales analysis', 'customer analysis', 'performance metrics',
    'roi analysis', 'growth analysis', 'revenue analysis', 'profitability analysis',
    
    // Technical analysis patterns
    'system performance', 'application metrics', 'database performance',
    'network analysis', 'security analysis', 'compliance analysis',
    'quality metrics', 'efficiency analysis', 'scalability analysis'
  ];

  private readonly highConfidenceKeywords = [
    'analyze', 'analysis', 'evaluate', 'evaluation', 'assess', 'assessment',
    'data', 'metrics', 'performance', 'statistics', 'trends', 'patterns'
  ];

  /**
   * Analyze prompt for analysis domain indicators
   */
  analyze(prompt: string): DomainAnalysis {
    const cleanPrompt = prompt.toLowerCase();
    const matchedKeywords: string[] = [];
    const matchedContexts: string[] = [];
    let confidence = 0;

    // Check for high-confidence keywords (weight: 5)
    for (const keyword of this.highConfidenceKeywords) {
      if (cleanPrompt.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 5;
      }
    }

    // Check for regular keywords (weight: 3)
    for (const keyword of this.keywords) {
      if (cleanPrompt.includes(keyword) && !this.highConfidenceKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 3;
      }
    }

    // Check for context patterns (weight: 6)
    for (const context of this.contexts) {
      if (cleanPrompt.includes(context)) {
        matchedContexts.push(context);
        confidence += 6;
      }
    }

    // Enhanced bonus system for analysis domain
    if (matchedKeywords.length >= 2) {
      confidence += 4; // Bonus for multiple analysis indicators
    }
    if (matchedKeywords.length >= 3) {
      confidence += 3; // Additional bonus for strong analysis signals
    }
    if (matchedContexts.length > 0) {
      confidence += 5; // Strong bonus for context matches
    }

    // Analysis-specific bonuses
    if (cleanPrompt.includes('analyze') && (cleanPrompt.includes('data') || cleanPrompt.includes('trends') || cleanPrompt.includes('performance'))) {
      confidence += 8; // Strong bonus for clear analysis patterns
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
    return 'analysis';
  }
}
