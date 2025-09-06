/**
 * Domain classification types for PromptLint
 * Defines the four target domains and classification result interfaces
 */

export enum DomainType {
  CODE = 'code',
  WRITING = 'writing',
  ANALYSIS = 'analysis',
  RESEARCH = 'research'
}

export interface DomainClassificationResult {
  domain: DomainType;
  confidence: number; // 0-100
  indicators: string[]; // Keywords/patterns that led to classification
  processingTime: number; // Processing time in milliseconds
}

export interface DomainAnalysis {
  confidence: number;
  indicators: string[];
  matchedKeywords: string[];
  matchedContexts: string[];
}

export interface DomainClassifierConfig {
  minConfidence: number; // Minimum confidence threshold for classification
  maxProcessingTime: number; // Maximum allowed processing time in ms
  enablePerformanceLogging: boolean; // Whether to log performance metrics
}

export const DEFAULT_DOMAIN_CONFIG: DomainClassifierConfig = {
  minConfidence: 20, // Lowered to prevent overriding correct low-confidence classifications
  maxProcessingTime: 20,
  enablePerformanceLogging: false
};
