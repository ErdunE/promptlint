# PromptLint Rules Engine

The core lint engine for PromptLint that analyzes AI prompts and provides quality feedback.

## Features

- **6 MVP Lint Rules**: Detects missing task verbs, programming languages, I/O specifications, vague wording, unclear scope, and redundant language
- **Quality Scoring**: 0-100 composite score based on detected issues
- **Performance**: Sub-50ms analysis for all prompt lengths
- **Comprehensive Testing**: 114+ tests covering edge cases and regression scenarios

## Language Support

**⚠️ English Only**: This MVP version is designed and optimized for **English prompts only**. 

- All rule detection logic is tuned for English language patterns
- Programming language detection focuses on English terms
- Scoring calibration is based on English prompt datasets
- Non-English prompts may receive inconsistent or incorrect analysis

Future versions may add multilingual support, but for now, please use English prompts for accurate results.

## Usage

```typescript
import { analyzePrompt } from '@promptlint/rules-engine';

const result = analyzePrompt('implement quicksort algorithm in Python');
console.log(`Score: ${result.score}/100`);
console.log(`Issues: ${result.issues.length}`);
```

## API

### `analyzePrompt(input: string): LintResult`

Analyzes a prompt and returns quality assessment.

**Parameters:**
- `input: string` - The prompt to analyze (English only)

**Returns:**
- `LintResult` - Contains score, issues, suggestions, and metadata

## Scoring System

- **90-100**: Excellent - Complete, well-specified prompts
- **70-89**: Good - Minor issues or missing details
- **50-69**: Fair - Multiple issues, needs improvement
- **30-49**: Poor - Significant issues, major improvements needed
- **0-29**: Very Poor - Fundamental problems, requires rewriting

## Performance

All analysis completes in <50ms with average processing time of ~3ms.