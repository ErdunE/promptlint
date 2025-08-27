/**
 * PromptLint LLM Service - Main Package Exports
 * 
 * AI-powered prompt rephrasing service with OpenAI integration
 * Enforces Optimization Principles for high-quality prompt improvement
 */

// Core rephrase engine
export { RephraseEngine } from './api/rephrase-engine';

// OpenAI client
export { OpenAIClient } from './api/openai-client';

// API key storage
export {
  ChromeExtensionApiKeyStorage,
  LocalFileApiKeyStorage,
  MemoryApiKeyStorage,
  createApiKeyStorage,
  ApiKeyValidator
} from './utils/api-key-storage';

// System prompts (for advanced usage)
export {
  CORE_REPHRASE_SYSTEM_PROMPT,
  getSystemPromptForApproach,
  getDomainEnhancedPrompt
} from './prompts/system-prompts';

// Import types and classes for internal use
import type {
  RephraseRequest,
  RephraseResult,
  RephraseCandidate,
  RephraseConfig,
  RephraseServiceStatus,
  IRephraseService,
  IApiKeyStorage,
  RephraseApproach
} from '@promptlint/shared-types';

import {
  RephraseError,
  RephraseErrorType
} from '@promptlint/shared-types';

import { RephraseEngine } from './api/rephrase-engine';
import { OpenAIClient } from './api/openai-client';
import { createApiKeyStorage, ApiKeyValidator } from './utils/api-key-storage';

// Re-export types from shared-types for convenience
export type {
  RephraseRequest,
  RephraseResult,
  RephraseCandidate,
  RephraseConfig,
  RephraseServiceStatus,
  IRephraseService,
  IApiKeyStorage,
  RephraseApproach
} from '@promptlint/shared-types';

export {
  RephraseError,
  RephraseErrorType
} from '@promptlint/shared-types';

/**
 * Factory function to create a configured rephrase service
 */
export function createRephraseService(config: Partial<RephraseConfig> = {}): RephraseEngine {
  const defaultConfig: RephraseConfig = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    timeout: 30000,
    maxRetries: 3,
    temperature: 0.7,
    maxTokens: 1000,
    rateLimit: {
      requestsPerMinute: 20,
      requestsPerHour: 100
    }
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new RephraseEngine(finalConfig);
}

/**
 * Convenience function to create a rephrase service with stored API key
 */
export async function createRephraseServiceWithStoredKey(
  additionalConfig: Partial<RephraseConfig> = {}
): Promise<RephraseEngine | null> {
  const storage = createApiKeyStorage();
  const apiKey = await storage.retrieve();

  if (!apiKey) {
    console.warn('[PromptLint LLM] No stored API key found');
    return null;
  }

  const config: RephraseConfig = {
    ...additionalConfig,
    apiKey
  };

  return createRephraseService(config);
}

/**
 * Utility function to test API key validity
 */
export async function testApiKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
  model?: string;
}> {
  // First check format
  const formatCheck = ApiKeyValidator.validateOpenAIKey(apiKey);
  if (!formatCheck.valid) {
    return { valid: false, error: formatCheck.error };
  }

  // Test with actual API call
  try {
    const client = new OpenAIClient({ apiKey });
    const available = await client.isAvailable();
    
    if (available) {
      return { valid: true };
    } else {
      const status = client.getStatus();
      return { valid: false, error: status.error || 'API key test failed' };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error testing API key'
    };
  }
}
