/**
 * PromptLint OpenAI API Client
 * 
 * Wrapper around OpenAI API with error handling, rate limiting, and retry logic
 */

import OpenAI from 'openai';
import { 
  RephraseConfig, 
  RephraseError, 
  RephraseErrorType,
  RephraseServiceStatus 
} from '@promptlint/shared-types';
import { globalErrorRecovery } from '../utils/error-recovery';

/**
 * Rate limiting tracker
 */
class RateLimiter {
  private requestsThisMinute: number[] = [];
  private requestsThisHour: number[] = [];
  private maxPerMinute: number;
  private maxPerHour: number;

  constructor(requestsPerMinute: number = 20, requestsPerHour: number = 100) {
    this.maxPerMinute = requestsPerMinute;
    this.maxPerHour = requestsPerHour;
  }

  /**
   * Check if request is allowed under rate limits
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Clean old requests
    this.requestsThisMinute = this.requestsThisMinute.filter(time => now - time < 60000);
    this.requestsThisHour = this.requestsThisHour.filter(time => now - time < 3600000);
    
    return this.requestsThisMinute.length < this.maxPerMinute && 
           this.requestsThisHour.length < this.maxPerHour;
  }

  /**
   * Record a successful request
   */
  recordRequest(): void {
    const now = Date.now();
    this.requestsThisMinute.push(now);
    this.requestsThisHour.push(now);
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RephraseServiceStatus['rateLimit'] {
    const now = Date.now();
    
    // Clean old requests
    this.requestsThisMinute = this.requestsThisMinute.filter(time => now - time < 60000);
    this.requestsThisHour = this.requestsThisHour.filter(time => now - time < 3600000);
    
    return {
      remainingMinute: Math.max(0, this.maxPerMinute - this.requestsThisMinute.length),
      remainingHour: Math.max(0, this.maxPerHour - this.requestsThisHour.length),
      minuteResetTime: now + 60000,
      hourResetTime: now + 3600000
    };
  }

  /**
   * Update rate limits
   */
  updateLimits(requestsPerMinute: number, requestsPerHour: number): void {
    this.maxPerMinute = requestsPerMinute;
    this.maxPerHour = requestsPerHour;
  }
}

/**
 * OpenAI API client with PromptLint-specific features
 */
export class OpenAIClient {
  private client: OpenAI | null = null;
  private config: RephraseConfig;
  private rateLimiter: RateLimiter;
  private lastSuccessfulRequest?: number;
  private currentError?: string;

  constructor(config: RephraseConfig) {
    this.config = { ...config };
    this.rateLimiter = new RateLimiter(
      config.rateLimit?.requestsPerMinute || 20,
      config.rateLimit?.requestsPerHour || 100
    );
    
    if (config.apiKey) {
      this.initializeClient();
    }
  }

  /**
   * Initialize OpenAI client
   */
  private initializeClient(): void {
    try {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout || 30000,
      });
      this.currentError = undefined;
    } catch (error) {
      this.currentError = `Failed to initialize OpenAI client: ${error}`;
      console.error('[PromptLint LLM]', this.currentError);
    }
  }

  /**
   * Update configuration
   */
  configure(newConfig: Partial<RephraseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey) {
      this.initializeClient();
    }
    
    if (newConfig.rateLimit) {
      this.rateLimiter.updateLimits(
        newConfig.rateLimit.requestsPerMinute,
        newConfig.rateLimit.requestsPerHour
      );
    }
  }

  /**
   * Check if client is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.client || !this.config.apiKey) {
      return false;
    }

    try {
      // Make a minimal test request
      await this.client.models.list();
      this.lastSuccessfulRequest = Date.now();
      this.currentError = undefined;
      return true;
    } catch (error) {
      this.currentError = `API availability check failed: ${error}`;
      return false;
    }
  }

  /**
   * Get current service status
   */
  getStatus(): RephraseServiceStatus {
    return {
      configured: !!this.config.apiKey,
      apiKeyValid: !!this.client && !this.currentError,
      rateLimit: this.rateLimiter.getStatus(),
      lastSuccessfulRequest: this.lastSuccessfulRequest,
      error: this.currentError
    };
  }

  /**
   * Generate completion with comprehensive error handling and recovery
   */
  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      retries?: number;
    } = {}
  ): Promise<{
    content: string;
    tokensUsed: number;
    model: string;
    processingTime: number;
  }> {
    if (!this.client) {
      throw new RephraseError(
        RephraseErrorType.SERVICE_UNAVAILABLE,
        'OpenAI client not initialized. Please check API key configuration.'
      );
    }

    // Check rate limits
    if (!this.rateLimiter.canMakeRequest()) {
      const status = this.rateLimiter.getStatus();
      const waitTime = Math.min(
        status.minuteResetTime - Date.now(),
        status.hourResetTime - Date.now()
      );
      throw new RephraseError(
        RephraseErrorType.RATE_LIMIT_EXCEEDED,
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        undefined,
        true // retryable
      );
    }

    const startTime = Date.now();

    return await globalErrorRecovery.executeWithRecovery(async () => {
      const response = await this.client!.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1000,
        stream: false
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new RephraseError(
          RephraseErrorType.INVALID_REQUEST,
          'No content in OpenAI response'
        );
      }

      // Record successful request
      this.rateLimiter.recordRequest();
      this.lastSuccessfulRequest = Date.now();
      this.currentError = undefined;

      const processingTime = Date.now() - startTime;

      return {
        content,
        tokensUsed: response.usage?.total_tokens || 0,
        model: response.model,
        processingTime
      };

    }, 'openai-completion').catch(error => {
      // Categorize and enhance error
      if (error instanceof RephraseError) {
        this.currentError = error.message;
        throw error;
      }
      
      const rephraseError = this.categorizeError(error as Error);
      this.currentError = rephraseError.message;
      throw rephraseError;
    });
  }

  /**
   * Categorize OpenAI errors into PromptLint error types
   */
  private categorizeError(error: Error): RephraseError {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid api key') || message.includes('unauthorized')) {
      return new RephraseError(
        RephraseErrorType.INVALID_API_KEY,
        'Invalid OpenAI API key. Please check your configuration.',
        error,
        false
      );
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return new RephraseError(
        RephraseErrorType.RATE_LIMIT_EXCEEDED,
        'OpenAI rate limit exceeded. Please wait before retrying.',
        error,
        true
      );
    }
    
    if (message.includes('quota') || message.includes('billing')) {
      return new RephraseError(
        RephraseErrorType.QUOTA_EXCEEDED,
        'OpenAI quota exceeded. Please check your billing settings.',
        error,
        false
      );
    }
    
    if (message.includes('timeout') || message.includes('network')) {
      return new RephraseError(
        RephraseErrorType.NETWORK_ERROR,
        'Network error connecting to OpenAI. Please check your connection.',
        error,
        true
      );
    }
    
    if (message.includes('invalid request') || message.includes('bad request')) {
      return new RephraseError(
        RephraseErrorType.INVALID_REQUEST,
        'Invalid request to OpenAI API.',
        error,
        false
      );
    }

    // Default to unknown error (retryable)
    return new RephraseError(
      RephraseErrorType.UNKNOWN_ERROR,
      `OpenAI API error: ${error.message}`,
      error,
      true
    );
  }

  /**
   * Get comprehensive health and error metrics
   */
  getHealthMetrics(): ReturnType<typeof globalErrorRecovery.getHealthMetrics> & {
    rateLimitStatus: ReturnType<RateLimiter['getStatus']>;
    clientStatus: {
      initialized: boolean;
      lastSuccessfulRequest?: number;
      currentError?: string;
    };
  } {
    const healthMetrics = globalErrorRecovery.getHealthMetrics();
    
    return {
      ...healthMetrics,
      rateLimitStatus: this.rateLimiter.getStatus(),
      clientStatus: {
        initialized: !!this.client,
        lastSuccessfulRequest: this.lastSuccessfulRequest,
        currentError: this.currentError
      }
    };
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    // OpenAI API keys start with 'sk-' and are typically 51 characters long
    return /^sk-[A-Za-z0-9]{48}$/.test(apiKey);
  }

  /**
   * Estimate cost for a request (rough approximation)
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    const model = this.config.model || 'gpt-3.5-turbo';
    
    // Rough pricing (as of 2024, subject to change)
    const pricing = {
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }, // per 1K tokens
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }
    };
    
    const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-3.5-turbo'];
    
    return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
  }
}
