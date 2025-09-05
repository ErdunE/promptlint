/**
 * Domain Classifier Package - Main exports
 * Provides domain classification capabilities for PromptLint
 */

export { DomainClassifier } from './DomainClassifier.js';
export { 
  DomainType, 
  DEFAULT_DOMAIN_CONFIG 
} from './types/DomainTypes.js';

export type { 
  DomainClassificationResult, 
  DomainAnalysis, 
  DomainClassifierConfig 
} from './types/DomainTypes.js';

// Hybrid classification system
export { HybridClassifier } from './classification/HybridClassifier.js';
export { EmbeddingLayer } from './classification/EmbeddingLayer.js';
export { PatternLayer } from './classification/PatternLayer.js';
export { RuleLayer } from './classification/RuleLayer.js';
export { HeuristicLayer } from './classification/HeuristicLayer.js';

export type { 
  ClassificationLayer, 
  DomainScore, 
  ClassificationResult 
} from './classification/ClassificationLayer.js';

// Legacy domain-specific classifiers (for backward compatibility)
export { CodeDomain } from './domains/CodeDomain.js';
export { WritingDomain } from './domains/WritingDomain.js';
export { AnalysisDomain } from './domains/AnalysisDomain.js';
export { ResearchDomain } from './domains/ResearchDomain.js';
