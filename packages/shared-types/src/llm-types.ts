// ===== src/llm-types.ts =====
/**
 * LLM service interfaces and types
 */

/**
 * Available LLM providers
 */
export enum LLMProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic'
  }
  
  /**
   * LLM model specifications
   */
  export interface LLMModel {
    /** Provider identifier */
    provider: LLMProvider;
    /** Model name/identifier */
    name: string;
    /** Maximum context length */
    maxContextLength: number;
    /** Cost per 1K tokens (input/output) */
    costPer1K: {
      input: number;
      output: number;
    };
  }
  
  /**
   * Rephrase request configuration
   */
  export interface RephraseRequest {
    /** Original prompt text */
    originalPrompt: string;
    /** Target prompt scenario */
    scenario: 'codegen' | 'debug' | 'api-usage';
    /** Number of candidate rephrases to generate */
    candidateCount: number;
    /** Additional context or constraints */
    constraints?: string[];
  }
  
  /**
   * Individual rephrase candidate
   */
  export interface RephraseCandidate {
    /** Rephrased prompt text */
    text: string;
    /** Structural approach used */
    approach: 'structured-list' | 'bullet-points' | 'numbered-steps' | 'prose';
    /** Estimated quality score */
    estimatedScore: number;
    /** Explanation of changes made */
    changes?: string[];
  }
  
  /**
   * Complete rephrase service response
   */
  export interface RephraseResult {
    /** Generated rephrase candidates */
    candidates: RephraseCandidate[];
    /** Service metadata */
    metadata: {
      /** Processing time in milliseconds */
      processingTime: number;
      /** LLM provider used */
      provider: LLMProvider;
      /** Model used */
      model: string;
      /** Token usage */
      tokenUsage: {
        input: number;
        output: number;
        total: number;
      };
      /** Request timestamp */
      timestamp: Date;
    };
  }
  
  /**
   * LLM service configuration
   */
  export interface LLMServiceConfig {
    /** Default provider */
    defaultProvider: LLMProvider;
    /** API key storage */
    apiKeys: Record<LLMProvider, string>;
    /** Model preferences */
    models: Record<LLMProvider, string>;
    /** Rate limiting configuration */
    rateLimiting: {
      /** Requests per minute */
      requestsPerMinute: number;
      /** Retry configuration */
      retryAttempts: number;
      /** Backoff strategy */
      backoffStrategy: 'linear' | 'exponential';
    };
  }
  