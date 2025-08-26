# @promptlint/shared-types

Shared TypeScript interfaces and types for the PromptLint ecosystem.

## Purpose

This package provides the foundational type definitions used across all PromptLint packages and applications. It ensures type safety and consistency throughout the codebase.

## Type Categories

### Lint Types (`lint-types.ts`)
- `LintResult` - Core lint analysis output
- `LintIssue` - Individual lint problems  
- `LintRuleType` - Available rule types
- `LintEngineConfig` - Engine configuration

### LLM Service Types (`llm-types.ts`)  
- `RephraseRequest` - Rephrase service input
- `RephraseResult` - Rephrase service output
- `LLMProvider` - Supported LLM providers
- `LLMServiceConfig` - Service configuration

### UI Types (`ui-types.ts`)
- `ExtensionUIState` - Extension interface state
- `FloatingPanelConfig` - Panel configuration
- `UITheme` - Theme and styling

### Site Adapter Types (`site-types.ts`)
- `SiteConfig` - Website-specific configuration
- `SiteAdapter` - Adapter interface
- `SupportedSite` - Supported AI websites

### Configuration Types (`config-types.ts`)
- `ExtensionStorageConfig` - Extension storage
- `BuildConfig` - Build configuration  

## Installation

```bash
npm install @promptlint/shared-types
```

## Usage

```typescript
import { LintResult, LintIssue, LintRuleType } from '@promptlint/shared-types';

// Use types in your implementation
const result: LintResult = {
  score: 85,
  issues: [],
  suggestions: []
};
```

## Development

```bash
# Build types
npm run build

# Watch for changes  
npm run build:watch

# Run type checking
npm run typecheck

# Lint code
npm run lint
```

## Version History

- `0.1.0` - Initial type definitions for MVP

## Contributing

When adding new types:

1. Place in appropriate category file
2. Export from `index.ts`  
3. Add JSDoc documentation
4. Update this README
5. Follow existing naming conventions

## Design Principles

- **Strict typing** - No `any` types allowed
- **Explicit nullability** - Use union types with `null`/`undefined`
- **Readonly by default** - Use readonly arrays and objects where appropriate
- **Comprehensive documentation** - All public interfaces must have JSDoc
- **Backward compatibility** - Breaking changes require major version bump