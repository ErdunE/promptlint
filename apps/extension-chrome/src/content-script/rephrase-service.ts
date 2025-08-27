/**
 * PromptLint Rephrase Service Integration
 * 
 * Integrates the llm-service package with the Chrome extension
 * Handles API key management and rephrase requests
 */

import { createRephraseServiceWithStoredKey, createApiKeyStorage, testApiKey } from '@promptlint/llm-service';
import { RephraseResult, RephraseRequest, RephraseError, RephraseErrorType } from '@promptlint/shared-types';

export interface RephraseServiceStatus {
  available: boolean;
  hasApiKey: boolean;
  error?: string;
}

export class ExtensionRephraseService {
  private rephraseService: any = null;
  private apiKeyStorage = createApiKeyStorage();
  private isInitialized = false;

  /**
   * Initialize the rephrase service
   */
  async initialize(): Promise<RephraseServiceStatus> {
    try {
      // Check if API key is stored
      const hasApiKey = await this.apiKeyStorage.hasKey();
      
      if (!hasApiKey) {
        return {
          available: false,
          hasApiKey: false,
          error: 'No API key configured'
        };
      }

      // Try to create service with stored key
      this.rephraseService = await createRephraseServiceWithStoredKey();
      
      if (!this.rephraseService) {
        return {
          available: false,
          hasApiKey: true,
          error: 'Failed to initialize rephrase service'
        };
      }

      // Test if service is available
      const available = await this.rephraseService.isAvailable();
      this.isInitialized = available;

      return {
        available,
        hasApiKey: true,
        error: available ? undefined : 'Service not available'
      };

    } catch (error) {
      console.error('[PromptLint Rephrase] Initialization failed:', error);
      return {
        available: false,
        hasApiKey: false,
        error: error instanceof Error ? error.message : 'Initialization failed'
      };
    }
  }

  /**
   * Set up API key
   */
  async setupApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Test the API key first
      const testResult = await testApiKey(apiKey);
      
      if (!testResult.valid) {
        return {
          success: false,
          error: testResult.error || 'Invalid API key'
        };
      }

      // Store the API key
      await this.apiKeyStorage.store(apiKey);

      // Reinitialize the service
      const status = await this.initialize();
      
      return {
        success: status.available,
        error: status.error
      };

    } catch (error) {
      console.error('[PromptLint Rephrase] API key setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Setup failed'
      };
    }
  }

  /**
   * Remove stored API key
   */
  async removeApiKey(): Promise<void> {
    await this.apiKeyStorage.remove();
    this.rephraseService = null;
    this.isInitialized = false;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!this.rephraseService;
  }

  /**
   * Rephrase a prompt
   */
  async rephrase(originalPrompt: string): Promise<RephraseResult> {
    if (!this.isReady()) {
      throw new RephraseError(
        RephraseErrorType.SERVICE_UNAVAILABLE,
        'Rephrase service not initialized. Please configure your OpenAI API key.'
      );
    }

    if (!originalPrompt || originalPrompt.trim().length === 0) {
      throw new RephraseError(
        RephraseErrorType.INVALID_REQUEST,
        'Cannot rephrase empty prompt'
      );
    }

    try {
      const request: RephraseRequest = {
        originalPrompt: originalPrompt.trim(),
        candidateCount: 3,
        context: {
          targetSystem: this.detectTargetSystem(),
          domain: this.detectDomain(originalPrompt),
          responseStyle: 'technical'
        }
      };

      const result = await this.rephraseService.rephrase(request);
      
      // Log success for debugging
      console.log('[PromptLint Rephrase] Success:', {
        originalLength: originalPrompt.length,
        candidatesGenerated: result.candidates.length,
        processingTime: result.metadata.processingTime
      });

      return result;

    } catch (error) {
      console.error('[PromptLint Rephrase] Request failed:', error);
      
      if (error instanceof RephraseError) {
        throw error;
      }
      
      throw new RephraseError(
        RephraseErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Rephrase request failed'
      );
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<RephraseServiceStatus> {
    if (!this.isInitialized) {
      return await this.initialize();
    }

    try {
      const available = this.rephraseService ? await this.rephraseService.isAvailable() : false;
      const hasApiKey = await this.apiKeyStorage.hasKey();

      return {
        available,
        hasApiKey,
        error: available ? undefined : 'Service not available'
      };
    } catch (error) {
      return {
        available: false,
        hasApiKey: await this.apiKeyStorage.hasKey(),
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Detect target AI system based on current URL
   */
  private detectTargetSystem(): string {
    const hostname = window.location.hostname;
    
    if (hostname.includes('openai.com')) {
      return 'ChatGPT';
    } else if (hostname.includes('claude.ai')) {
      return 'Claude';
    } else {
      return 'Unknown';
    }
  }

  /**
   * Detect domain based on prompt content
   */
  private detectDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('program') || lowerPrompt.includes('function')) {
      return 'coding';
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('data') || lowerPrompt.includes('report')) {
      return 'analysis';
    } else if (lowerPrompt.includes('write') || lowerPrompt.includes('create') || lowerPrompt.includes('story')) {
      return 'creative';
    } else {
      return 'general';
    }
  }

  /**
   * Handle graceful degradation when service is unavailable
   */
  createGracefulFallback(): {
    onRephraseRequest: (prompt: string) => Promise<RephraseResult>;
    onRephraseSelect: (candidate: any, originalPrompt: string) => void;
  } {
    return {
      onRephraseRequest: async (prompt: string) => {
        try {
          // Check if service is ready
          const status = await this.getStatus();
          
          if (status.available && this.rephraseService) {
            // Use AI-powered rephrasing
            return await this.rephrase(prompt);
          } else {
            // Use offline graceful degradation
            return this.createOfflineRephraseResult(prompt);
          }
        } catch (error) {
          console.warn('[PromptLint] Rephrase failed, using offline mode:', error);
          return this.createOfflineRephraseResult(prompt);
        }
      },
      
      onRephraseSelect: (candidate: any, originalPrompt: string) => {
        // Find the input element and replace its content
        this.replacePromptInInput(candidate.text);
        
        // Log usage for analytics
        console.log('[PromptLint Rephrase] Candidate selected:', {
          approach: candidate.approach,
          originalLength: originalPrompt.length,
          newLength: candidate.text.length,
          estimatedScore: candidate.estimatedScore
        });
      }
    };
  }

  /**
   * Replace prompt text in the current input field
   */
  private replacePromptInInput(newText: string): void {
    // This will be implemented to work with the site adapters
    // For now, try to find the active input element
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      (activeElement as HTMLTextAreaElement).value = newText;
      
      // Trigger input event to notify the site
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(newText).then(() => {
        console.log('[PromptLint Rephrase] Copied to clipboard:', newText.substring(0, 50) + '...');
      }).catch(() => {
        console.warn('[PromptLint Rephrase] Failed to copy to clipboard');
      });
    }
  }

  /**
   * Create offline rephrase result when API is not available
   */
  private createOfflineRephraseResult(prompt: string): RephraseResult {
    const candidates = [];
    
    // Structured approach
    candidates.push({
      id: 'offline-structured',
      text: `**Task**: ${this.capitalizeFirst(this.extractAction(prompt))}\n\n**Input**: [Specify your input data/requirements here]\n\n**Output**: [Describe the expected output format]\n\n**Additional Context**: [Add any constraints, preferences, or specific requirements]`,
      approach: 'structured' as const,
      estimatedScore: 75,
      improvements: ['Added structured format', 'Included clear sections', 'Made requirements explicit'],
      length: 200
    });

    // Conversational approach
    candidates.push({
      id: 'offline-conversational',
      text: `I need help with ${this.extractAction(prompt)}. Here's what I'm looking for:

- What I want to accomplish: [Describe your goal]
- What I'm working with: [Specify your context/data]
- How I want the result: [Format preferences]
- Any constraints: [Limitations or requirements]

Could you help me with this?`,
      approach: 'conversational' as const,
      estimatedScore: 70,
      improvements: ['Added conversational structure', 'Included guidance prompts', 'Made it more engaging'],
      length: 180
    });

    // Imperative approach
    candidates.push({
      id: 'offline-imperative',
      text: `${this.capitalizeFirst(this.extractAction(prompt))} following these steps:

1. [First step - specify what to analyze/process]
2. [Second step - define the transformation/operation]
3. [Third step - format the output as needed]
4. [Final step - validate and present results]

Requirements: [List any specific constraints or preferences]`,
      approach: 'imperative' as const,
      estimatedScore: 72,
      improvements: ['Added step-by-step structure', 'Made process explicit', 'Included requirements section'],
      length: 190
    });

    return {
      originalPrompt: prompt,
      candidates,
      metadata: {
        processingTime: 5,
        model: 'offline-rules-engine',
        tokensUsed: 0,
        estimatedCost: 0,
        timestamp: Date.now()
      },
      warnings: [
        'Generated using offline template engine',
        'For AI-powered improvements, configure OpenAI API key in extension popup',
        'Templates provide structural improvements - AI rephrasing offers more sophisticated results'
      ]
    };
  }

  private extractAction(prompt: string): string {
    const actionWords = ['write', 'create', 'build', 'implement', 'develop', 'design', 'generate', 'make', 'analyze', 'process'];
    const words = prompt.toLowerCase().split(/\s+/);
    
    for (const word of actionWords) {
      if (words.includes(word)) {
        return word;
      }
    }
    
    // Default action based on prompt length
    if (prompt.length < 20) {
      return 'create a solution for';
    } else {
      return 'help with';
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Global instance for the extension
export const extensionRephraseService = new ExtensionRephraseService();
