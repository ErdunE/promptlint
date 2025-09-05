import { DomainAnalysis } from '../types/DomainTypes.js';

/**
 * CodeDomain - Programming, algorithms, development, debugging tasks
 * Detects prompts related to software development, programming, and technical implementation
 */
export class CodeDomain {
  private readonly keywords = [
    // Core programming terms
    'algorithm', 'function', 'method', 'class', 'variable', 'array', 'loop',
    'debug', 'optimize', 'implement', 'code', 'program', 'software', 'application',
    'api', 'database', 'query', 'sql', 'javascript', 'python', 'java', 'typescript',
    'react', 'node', 'framework', 'library', 'package', 'module', 'component',
    
    // Development activities
    'develop', 'build', 'create', 'design', 'architect', 'engineer', 'construct',
    'refactor', 'fix', 'repair', 'troubleshoot', 'test', 'validate', 'deploy',
    'compile', 'execute', 'run', 'install', 'configure', 'setup', 'initialize',
    
    // Technical concepts
    'performance', 'efficiency', 'scalability', 'security', 'authentication',
    'authorization', 'encryption', 'hashing', 'caching', 'memory', 'cpu',
    'bandwidth', 'latency', 'throughput', 'optimization', 'profiling'
  ];

  private readonly contexts = [
    // Implementation patterns
    'write a function', 'implement algorithm', 'create a class', 'build application',
    'develop software', 'debug code', 'optimize performance', 'fix bug',
    'refactor code', 'test function', 'deploy application', 'setup environment',
    
    // Technical specifications
    'create api', 'design database', 'implement authentication', 'build component',
    'configure server', 'setup database', 'install package', 'run tests',
    'compile code', 'execute program', 'initialize system', 'validate input',
    
    // Programming contexts
    'fix memory leak', 'optimize database', 'refactor legacy', 'debug system',
    'create function', 'build system', 'develop application', 'implement feature',
    'write code', 'program solution', 'code implementation', 'software development'
  ];

  private readonly highConfidenceKeywords = [
    'algorithm', 'function', 'debug', 'implement', 'code', 'program',
    'api', 'database', 'sql', 'javascript', 'python', 'react', 'node',
    'class', 'method', 'variable', 'array', 'loop', 'framework',
    'fix', 'refactor', 'optimize', 'application', 'software', 'system'
  ];

  /**
   * Analyze prompt for code domain indicators
   */
  analyze(prompt: string): DomainAnalysis {
    const cleanPrompt = prompt.toLowerCase();
    const matchedKeywords: string[] = [];
    const matchedContexts: string[] = [];
    let confidence = 0;

    // Check for high-confidence keywords (weight: 4)
    for (const keyword of this.highConfidenceKeywords) {
      if (cleanPrompt.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 4;
      }
    }

    // Check for regular keywords (weight: 2)
    for (const keyword of this.keywords) {
      if (cleanPrompt.includes(keyword) && !this.highConfidenceKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
        confidence += 2;
      }
    }

    // Check for context patterns (weight: 5)
    for (const context of this.contexts) {
      if (cleanPrompt.includes(context)) {
        matchedContexts.push(context);
        confidence += 5;
      }
    }

    // Programming context requirement - reduce confidence if no programming context
    const hasProgrammingContext = this.contexts.some(context => cleanPrompt.includes(context)) ||
                                 this.highConfidenceKeywords.some(keyword => cleanPrompt.includes(keyword));
    
    if (!hasProgrammingContext && matchedKeywords.length > 0) {
      confidence *= 0.5; // Reduce confidence for non-programming contexts
    }

    // Bonus for multiple indicators
    if (matchedKeywords.length > 2) {
      confidence += 3;
    }
    if (matchedContexts.length > 0) {
      confidence += 4;
    }

    // Code-specific bonuses
    if (cleanPrompt.includes('implement') && (cleanPrompt.includes('algorithm') || cleanPrompt.includes('function'))) {
      confidence += 6; // Strong bonus for clear programming patterns
    }

    // Normalize confidence to 0-100 scale (more generous scaling)
    confidence = Math.min(100, confidence * 3.0);

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
    return 'code';
  }
}
