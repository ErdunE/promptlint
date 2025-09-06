import { 
  DomainType, 
  DomainClassificationResult, 
  DomainClassifierConfig, 
  DEFAULT_DOMAIN_CONFIG 
} from './types/DomainTypes.js';
import { HybridClassifier } from './classification/HybridClassifier.js';

/**
 * DomainClassifier - Core classification engine for prompt domain detection
 * Analyzes prompts and classifies them into one of four domains with confidence scoring
 */
export class DomainClassifier {
  private readonly config: DomainClassifierConfig;
  private readonly hybridClassifier: HybridClassifier;
  private initialized = false;

  constructor(config: Partial<DomainClassifierConfig> = {}) {
    this.config = { ...DEFAULT_DOMAIN_CONFIG, ...config };
    this.hybridClassifier = new HybridClassifier();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.hybridClassifier.initialize();
      this.initialized = true;
    }
  }

  /**
   * Classify prompt into one of the four domains using hybrid approach
   * Performance target: <20ms processing time
   */
  classifyDomain(prompt: string): DomainClassificationResult {
    const startTime = performance.now();

    if (!this.initialized) {
      // Fallback to simple classification if not initialized
      return this.createResult(DomainType.CODE, 50, ['not initialized'], startTime);
    }

    if (!prompt || prompt.trim().length === 0) {
      return this.createResult(DomainType.CODE, 50, ['empty prompt'], startTime);
    }

    try {
      // Use hybrid classifier for sophisticated analysis
      const result = this.hybridClassifier.classify(prompt);

      // Validate performance requirement
      if (result.processingTime > this.config.maxProcessingTime) {
        if (this.config.enablePerformanceLogging) {
          console.warn(`Domain classification exceeded ${this.config.maxProcessingTime}ms: ${result.processingTime}ms`);
        }
      }

      // Only fallback to CODE if confidence is extremely low (below 20)
      // This prevents overriding correct but low-confidence classifications
      if (result.confidence < 20) {
        return this.createResult(
          DomainType.CODE, 
          20, 
          ['extremely low confidence'], 
          startTime
        );
      }

      return {
        domain: result.domain,
        confidence: result.confidence,
        indicators: result.indicators,
        processingTime: result.processingTime
      };

    } catch (error) {
      console.warn('Hybrid classification failed, using fallback:', error);
      return this.createResult(DomainType.CODE, 50, ['classification error'], startTime);
    }
  }

  /**
   * Get layer information for debugging
   */
  getLayerInfo(): Array<{name: string, weight: number}> {
    return this.hybridClassifier.getLayerInfo();
  }

  /**
   * Create classification result with processing time
   */
  private createResult(
    domain: DomainType, 
    confidence: number, 
    indicators: string[], 
    startTime: number
  ): DomainClassificationResult {
    return {
      domain,
      confidence: Math.round(confidence),
      indicators,
      processingTime: Math.round((performance.now() - startTime) * 100) / 100
    };
  }

  /**
   * Get configuration
   */
  getConfig(): DomainClassifierConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DomainClassifierConfig>): void {
    Object.assign(this.config, newConfig);
  }
}
