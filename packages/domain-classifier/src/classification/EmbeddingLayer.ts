/**
 * Embedding Layer - Lightweight Semantic Analysis
 * Uses TF-IDF and pre-computed domain vectors for semantic similarity
 * Optimized for Chrome extension constraints
 */

import { ClassificationLayer, DomainScore } from './ClassificationLayer.js';
import { DomainType } from '../types/DomainTypes.js';

interface DomainVector {
  domain: DomainType;
  vector: Map<string, number>; // Term frequency map
  description: string;
}

export class EmbeddingLayer implements ClassificationLayer {
  name = 'embedding';
  weight = 0.4;

  private domainVectors: DomainVector[] = [];
  private initialized = false;

  constructor() {
    this.initializeDomainVectors();
  }

  private initializeDomainVectors(): void {
    // Pre-computed domain vectors based on representative terms
    this.domainVectors = [
      {
        domain: DomainType.CODE,
        vector: new Map([
          ['implement', 0.15], ['algorithm', 0.12], ['function', 0.11], ['debug', 0.10],
          ['code', 0.10], ['program', 0.09], ['develop', 0.08], ['build', 0.08],
          ['optimize', 0.07], ['refactor', 0.06], ['class', 0.06], ['method', 0.05],
          ['variable', 0.05], ['array', 0.04], ['loop', 0.04], ['api', 0.04],
          ['database', 0.04], ['software', 0.03], ['application', 0.03], ['system', 0.03]
        ]),
        description: 'Programming and software development'
      },
      {
        domain: DomainType.ANALYSIS,
        vector: new Map([
          ['analyze', 0.14], ['data', 0.12], ['evaluate', 0.11], ['assess', 0.10],
          ['examine', 0.09], ['study', 0.08], ['investigate', 0.07], ['trends', 0.07],
          ['patterns', 0.06], ['metrics', 0.06], ['performance', 0.05], ['results', 0.05],
          ['compare', 0.05], ['contrast', 0.04], ['benchmark', 0.04], ['statistics', 0.04],
          ['findings', 0.03], ['correlation', 0.03], ['measurement', 0.03], ['outcomes', 0.03]
        ]),
        description: 'Data analysis and evaluation'
      },
      {
        domain: DomainType.WRITING,
        vector: new Map([
          ['write', 0.15], ['article', 0.12], ['create', 0.11], ['content', 0.10],
          ['blog', 0.09], ['post', 0.08], ['essay', 0.08], ['story', 0.07],
          ['compose', 0.06], ['draft', 0.06], ['author', 0.05], ['publish', 0.05],
          ['document', 0.05], ['report', 0.04], ['explain', 0.04], ['describe', 0.04],
          ['outline', 0.03], ['summarize', 0.03], ['review', 0.03], ['communication', 0.03]
        ]),
        description: 'Content creation and writing'
      },
      {
        domain: DomainType.RESEARCH,
        vector: new Map([
          ['research', 0.15], ['investigate', 0.12], ['explore', 0.11], ['study', 0.10],
          ['best', 0.09], ['practices', 0.09], ['methodologies', 0.08], ['approaches', 0.07],
          ['techniques', 0.06], ['find', 0.06], ['discover', 0.05], ['solutions', 0.05],
          ['methods', 0.05], ['frameworks', 0.04], ['tools', 0.04], ['platforms', 0.04],
          ['standards', 0.03], ['guidelines', 0.03], ['recommendations', 0.03], ['strategies', 0.03]
        ]),
        description: 'Research and methodology exploration'
      }
    ];

    this.initialized = true;
  }

  classify(prompt: string): DomainScore[] {
    if (!this.initialized) {
      return [];
    }

    const promptVector = this.computeTFIDF(prompt);
    const scores: DomainScore[] = [];

    for (const domainVector of this.domainVectors) {
      const similarity = this.cosineSimilarity(promptVector, domainVector.vector);
      
      if (similarity > 0.1) { // Minimum threshold for semantic similarity
        // Enhanced score calibration for semantic similarity
        const calibratedScore = this.calibrateEmbeddingScore(similarity);
        scores.push({
          domain: domainVector.domain,
          score: calibratedScore,
          method: 'embedding',
          indicators: [`semantic similarity: ${(similarity * 100).toFixed(1)}%`]
        });
      }
    }

    return scores;
  }

  private computeTFIDF(text: string): Map<string, number> {
    const words = this.tokenize(text);
    const termFreq = new Map<string, number>();
    
    // Count term frequencies
    for (const word of words) {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    }

    // Normalize by document length
    const docLength = words.length;
    const normalizedFreq = new Map<string, number>();
    
    for (const [term, freq] of termFreq.entries()) {
      normalizedFreq.set(term, freq / docLength);
    }

    return normalizedFreq;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove short words
      .filter(word => !this.isStopWord(word)); // Remove stop words
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'a', 'an'
    ]);
    return stopWords.has(word);
  }

  private cosineSimilarity(vectorA: Map<string, number>, vectorB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    // Calculate dot product and norms
    const allTerms = new Set([...vectorA.keys(), ...vectorB.keys()]);
    
    for (const term of allTerms) {
      const a = vectorA.get(term) || 0;
      const b = vectorB.get(term) || 0;
      
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    // Avoid division by zero
    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calibrateEmbeddingScore(similarity: number): number {
    // Semantic similarity should contribute meaningfully to final confidence
    if (similarity >= 0.5) return 0.8; // High semantic similarity
    if (similarity >= 0.4) return 0.7; // Good semantic similarity
    if (similarity >= 0.3) return 0.6; // Moderate semantic similarity
    if (similarity >= 0.2) return 0.5; // Low semantic similarity
    
    // Very low similarity gets minimal boost
    return Math.min(0.4, similarity + 0.1);
  }
}
