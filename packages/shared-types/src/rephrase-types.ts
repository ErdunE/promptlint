/**
 * PromptLint Rephrase Service Types
 * 
 * Type definitions for AI-powered prompt rephrasing functionality
 * Separate from base LLM types to avoid conflicts
 */

/**
 * Rephrase request configuration
 */
export interface RephraseRequest {
  /** Original prompt text to rephrase */
  originalPrompt: string;
  
  /** Optional context about the prompt's intended use */
  context?: {
    /** Target AI system (e.g., "ChatGPT", "Claude") */
    targetSystem?: string;
    /** Domain or subject area */
    domain?: string;
    /** Desired response style */
    responseStyle?: 'technical' | 'conversational' | 'formal' | 'creative';
  };
  
  /** Number of rephrase candidates to generate (2-3 recommended) */
  candidateCount?: number;
  
  /** Maximum length for rephrased prompts */
  maxLength?: number;
}

/**
 * Individual rephrase candidate
 */
export interface RephraseCandidate {
  /** Unique identifier for this candidate */
  id: string;
  
  /** Rephrased prompt text */
  text: string;
  
  /** Structural approach used for this candidate */
  approach: RephraseApproach;
  
  /** Estimated quality score (0-100) */
  estimatedScore: number;
  
  /** Key improvements made */
  improvements: string[];
  
  /** Length of the rephrased text */
  length: number;
}

/**
 * Different structural approaches for rephrasing
 */
export type RephraseApproach = 
  | 'structured'      // Task/Input/Output format
  | 'conversational'  // Natural language flow
  | 'imperative'      // Direct command style
  | 'clarifying'      // Adds explicit clarifications
  | 'detailed'        // Expands with helpful context
  | 'concise';        // Streamlined version

/**
 * Complete rephrase response
 */
export interface RephraseResult {
  /** Original prompt that was rephrased */
  originalPrompt: string;
  
  /** Array of rephrase candidates */
  candidates: RephraseCandidate[];
  
  /** Processing metadata */
  metadata: {
    /** Time taken for processing (ms) */
    processingTime: number;
    
    /** LLM model used */
    model: string;
    
    /** Total tokens consumed */
    tokensUsed?: number;
    
    /** Cost estimate (if available) */
    estimatedCost?: number;
    
    /** Processing timestamp */
    timestamp: number;
  };
  
  /** Any warnings or notes */
  warnings?: string[];
}

/**
 * Rephrase service configuration
 */
export interface RephraseConfig {
  /** OpenAI API key */
  apiKey: string;
  
  /** Model to use for rephrasing */
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview';
  
  /** Request timeout (ms) */
  timeout?: number;
  
  /** Maximum retries on failure */
  maxRetries?: number;
  
  /** Rate limiting configuration */
  rateLimit?: {
    /** Requests per minute */
    requestsPerMinute: number;
    /** Requests per hour */
    requestsPerHour: number;
  };
  
  /** Temperature for generation (0.0-1.0) */
  temperature?: number;
  
  /** Maximum tokens per response */
  maxTokens?: number;
}

/**
 * Rephrase service interface
 */
export interface IRephraseService {
  /**
   * Rephrase a prompt with multiple candidates
   */
  rephrase(request: RephraseRequest): Promise<RephraseResult>;
  
  /**
   * Check if service is available and configured
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Get current service status
   */
  getStatus(): RephraseServiceStatus;
  
  /**
   * Update configuration
   */
  configure(config: Partial<RephraseConfig>): void;
}

/**
 * Service status information
 */
export interface RephraseServiceStatus {
  /** Is service properly configured */
  configured: boolean;
  
  /** Is API key valid */
  apiKeyValid: boolean;
  
  /** Current rate limit status */
  rateLimit: {
    /** Requests remaining this minute */
    remainingMinute: number;
    /** Requests remaining this hour */
    remainingHour: number;
    /** Reset time for minute limit */
    minuteResetTime: number;
    /** Reset time for hour limit */
    hourResetTime: number;
  };
  
  /** Last successful request timestamp */
  lastSuccessfulRequest?: number;
  
  /** Current error state (if any) */
  error?: string;
}

/**
 * Rephrase error types
 */
export enum RephraseErrorType {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Rephrase service error
 */
export class RephraseError extends Error {
  constructor(
    public type: RephraseErrorType,
    message: string,
    public originalError?: Error,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'RephraseError';
  }
}

/**
 * API key storage interface
 */
export interface IApiKeyStorage {
  /**
   * Store API key securely
   */
  store(apiKey: string): Promise<void>;
  
  /**
   * Retrieve stored API key
   */
  retrieve(): Promise<string | null>;
  
  /**
   * Remove stored API key
   */
  remove(): Promise<void>;
  
  /**
   * Check if API key is stored
   */
  hasKey(): Promise<boolean>;
}
