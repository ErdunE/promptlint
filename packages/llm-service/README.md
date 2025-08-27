# @promptlint/llm-service

> AI-powered prompt rephrasing service for PromptLint with OpenAI integration

## Overview

The `llm-service` package provides intelligent prompt rephrasing capabilities using OpenAI's GPT models. It generates multiple rephrase candidates using different structural approaches while strictly enforcing PromptLint's Optimization Principles.

## Key Features

### 🎯 **Optimization Principles Enforcement**
- **Never adds technical details** not provided by user
- **Never assumes** programming language, environment, or context
- **Only rephrases, restructures, and clarifies** existing content
- **Uses structured format** (Task/Input/Output) when applicable
- **Explicitly indicates** where user should clarify missing information

### 🔄 **Multiple Rephrase Approaches**
- **Structured**: Clear Task/Input/Output sections
- **Conversational**: Natural language flow
- **Imperative**: Direct command style  
- **Clarifying**: Adds explicit clarification requests

### 🔒 **Secure API Key Management**
- **Encrypted local storage** (Chrome extension or file system)
- **Device-specific encryption** keys
- **Automatic key validation** and format checking
- **Safe key masking** for display

### ⚡ **Production-Ready Features**
- **Rate limiting** and quota management
- **Comprehensive error handling** with retries
- **Cost estimation** and token tracking
- **Graceful offline degradation**

## Installation

```bash
npm install @promptlint/llm-service
```

## Quick Start

### Basic Usage

```typescript
import { createRephraseService } from '@promptlint/llm-service';

// Create service with API key
const rephraseService = createRephraseService({
  apiKey: 'sk-your-openai-api-key',
  model: 'gpt-3.5-turbo'
});

// Rephrase a prompt
const result = await rephraseService.rephrase({
  originalPrompt: 'write sorting code',
  candidateCount: 3
});

console.log('Original:', result.originalPrompt);
result.candidates.forEach((candidate, i) => {
  console.log(`\nCandidate ${i + 1} (${candidate.approach}):`);
  console.log(candidate.text);
  console.log(`Score: ${candidate.estimatedScore}`);
  console.log(`Improvements: ${candidate.improvements.join(', ')}`);
});
```

### With Stored API Key

```typescript
import { createRephraseServiceWithStoredKey, createApiKeyStorage } from '@promptlint/llm-service';

// Store API key securely
const storage = createApiKeyStorage();
await storage.store('sk-your-openai-api-key');

// Create service with stored key
const rephraseService = await createRephraseServiceWithStoredKey();

if (rephraseService) {
  const result = await rephraseService.rephrase({
    originalPrompt: 'maybe create something for data analysis',
    context: {
      domain: 'analysis',
      targetSystem: 'ChatGPT'
    }
  });
}
```

## API Reference

### RephraseService

#### `rephrase(request: RephraseRequest): Promise<RephraseResult>`

Generate multiple rephrase candidates for a prompt.

**Parameters:**
- `originalPrompt`: The prompt text to rephrase
- `candidateCount`: Number of candidates to generate (2-3 recommended)
- `context`: Optional context about intended use
- `maxLength`: Maximum length for rephrased prompts

**Returns:**
- `candidates`: Array of rephrase candidates with different approaches
- `metadata`: Processing time, tokens used, cost estimate
- `warnings`: Helpful suggestions for better results

#### `isAvailable(): Promise<boolean>`

Check if the service is properly configured and OpenAI API is accessible.

#### `getStatus(): RephraseServiceStatus`

Get current service status including rate limits and API key validity.

### API Key Management

#### `createApiKeyStorage(): IApiKeyStorage`

Create appropriate storage for the current environment (Chrome extension or Node.js).

```typescript
import { createApiKeyStorage, ApiKeyValidator } from '@promptlint/llm-service';

const storage = createApiKeyStorage();

// Validate before storing
const validation = ApiKeyValidator.validateOpenAIKey(apiKey);
if (validation.valid) {
  await storage.store(apiKey);
}

// Retrieve and use
const storedKey = await storage.retrieve();
```

### Configuration

```typescript
interface RephraseConfig {
  apiKey: string;                    // OpenAI API key
  model?: 'gpt-3.5-turbo' | 'gpt-4'; // Model to use
  timeout?: number;                  // Request timeout (ms)
  maxRetries?: number;               // Max retry attempts
  temperature?: number;              // Generation creativity (0.0-1.0)
  maxTokens?: number;                // Max tokens per response
  rateLimit?: {                      // Rate limiting
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}
```

## Rephrase Examples

### Input
```
"write sorting code"
```

### Output Candidates

**Structured Approach:**
```
Task: Implement a sorting algorithm
Input: Array or list of elements to sort
Output: Sorted array in ascending order
[Clarify: specify programming language and preferred sorting method]
```

**Conversational Approach:**
```
I need help creating a sorting function. Could you implement a sorting algorithm that takes an array of elements and returns them sorted in ascending order? Please specify which programming language you'd like me to use.
```

**Imperative Approach:**
```
Implement a sorting algorithm that:
1. Takes an array of elements as input
2. Sorts them in ascending order
3. Returns the sorted array
[Specify: programming language and sorting method preference]
```

## Error Handling

The service provides comprehensive error handling with specific error types:

```typescript
import { RephraseError, RephraseErrorType } from '@promptlint/llm-service';

try {
  const result = await rephraseService.rephrase(request);
} catch (error) {
  if (error instanceof RephraseError) {
    switch (error.type) {
      case RephraseErrorType.INVALID_API_KEY:
        console.log('Please check your OpenAI API key');
        break;
      case RephraseErrorType.RATE_LIMIT_EXCEEDED:
        console.log('Rate limit exceeded, waiting...');
        break;
      case RephraseErrorType.QUOTA_EXCEEDED:
        console.log('OpenAI quota exceeded');
        break;
      // ... handle other error types
    }
  }
}
```

## Integration with Chrome Extension

The service is designed to integrate seamlessly with the PromptLint Chrome extension:

```typescript
// In Chrome extension content script
import { createRephraseServiceWithStoredKey } from '@promptlint/llm-service';

class RephraseUI {
  private rephraseService: RephraseEngine | null = null;

  async initialize() {
    this.rephraseService = await createRephraseServiceWithStoredKey();
    
    if (!this.rephraseService) {
      this.showApiKeySetup();
      return;
    }

    this.enableRephraseFeature();
  }

  async rephrasePrompt(originalPrompt: string) {
    if (!this.rephraseService) return;

    try {
      const result = await this.rephraseService.rephrase({
        originalPrompt,
        candidateCount: 3
      });

      this.displayRephraseCandidates(result.candidates);
    } catch (error) {
      this.handleRephraseError(error);
    }
  }
}
```

## Cost Management

The service provides cost estimation and tracking:

```typescript
const result = await rephraseService.rephrase(request);

console.log(`Tokens used: ${result.metadata.tokensUsed}`);
console.log(`Estimated cost: $${result.metadata.estimatedCost?.toFixed(4)}`);

// Check rate limits
const status = rephraseService.getStatus();
console.log(`Remaining requests: ${status.rateLimit.remainingMinute}/minute`);
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Environment Setup

Create a `.env` file for testing:

```
OPENAI_API_KEY=sk-your-test-api-key
```

## License

MIT License - see LICENSE file for details.

---

**Part of the PromptLint ecosystem** - Transform your AI interactions with better prompts! ✨
