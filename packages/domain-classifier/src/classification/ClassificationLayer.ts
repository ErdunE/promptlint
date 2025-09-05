/**
 * Classification Layer Interface
 * Defines the contract for different classification approaches in the hybrid system
 */

import { DomainType } from '../types/DomainTypes.js';

export interface DomainScore {
  domain: DomainType;
  score: number; // 0-1 confidence score
  method: string; // Classification method used
  indicators?: string[]; // Keywords/patterns that led to classification
}

export interface ClassificationLayer {
  name: string;
  weight: number;
  classify(prompt: string): DomainScore[];
  initialize?(): Promise<void>;
}

export interface ClassificationResult {
  domain: DomainType;
  confidence: number; // 0-100
  method: string;
  indicators: string[];
  layerScores: DomainScore[];
  processingTime: number;
}
