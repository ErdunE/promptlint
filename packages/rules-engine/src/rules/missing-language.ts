/**
 * Rule: Missing Language
 * 
 * Detects code generation prompts that don't specify a programming language.
 * This is critical for code generation tasks to avoid ambiguity.
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index';

/**
 * Common programming languages and their variations
 */
const PROGRAMMING_LANGUAGES = [
  // Popular languages
  'javascript', 'js', 'typescript', 'ts', 'python', 'py', 'java', 'c\\+\\+', 'cpp', 'c#', 'csharp',
  'c', 'go', 'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'dart',
  
  // Web technologies
  'html', 'css', 'scss', 'sass', 'jsx', 'tsx', 'vue', 'react', 'angular',
  
  // Other languages
  'bash', 'shell', 'powershell', 'sql', 'r', 'matlab', 'perl', 'haskell', 'clojure',
  'lua', 'assembly', 'asm', 'vb', 'vba', 'fortran', 'cobol', 'ada', 'erlang', 'elixir',
  
  // Framework-specific
  'node', 'nodejs', 'deno', 'bun'
];

/**
 * Keywords that indicate code generation is requested
 */
const CODE_INDICATORS = [
  'function', 'class', 'method', 'algorithm', 'code', 'script', 'program', 'app', 'application',
  'implementation', 'library', 'module', 'component', 'service', 'api', 'endpoint',
  'quicksort', 'bubblesort', 'mergesort', 'binary search', 'linked list', 'tree', 'graph',
  'database', 'query', 'server', 'client', 'frontend', 'backend', 'fullstack',
  // Web development
  'navbar', 'navigation', 'responsive', 'website', 'webpage', 'html', 'css', 'dom',
  // Testing
  'unit test', 'test', 'testing', 'spec', 'mock', 'stub',
  // System development
  'system', 'authentication', 'auth', 'login', 'session', 'security',
  // Debugging/fixing
  'debug', 'fix', 'error', 'bug', 'issue', 'troubleshoot',
  // Generic programming terms
  'do', 'make', 'create', 'build', 'write', 'implement'
];

/**
 * Keywords that indicate explanation/documentation tasks (not code generation)
 */
const EXPLANATION_INDICATORS = [
  'explain', 'describe', 'document', 'what is', 'how does', 'why does', 'show me',
  'tell me', 'help me understand', 'clarify', 'outline', 'overview'
];

export class MissingLanguageRule implements LintRule {
  type = LintRuleType.MISSING_LANGUAGE;
  name = 'Missing Programming Language';
  description = 'Detects code generation requests without specified programming language';

  analyze(input: string): RuleAnalysisResult {
    const cleanInput = input.toLowerCase().trim();
    
    // Check if this is an explanation/documentation task
    const isExplanationTask = EXPLANATION_INDICATORS.some(indicator => 
      cleanInput.includes(indicator.toLowerCase())
    );
    
    // If it's an explanation task, skip language requirement
    if (isExplanationTask) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Check if this looks like a code generation request
    const isCodeRequest = CODE_INDICATORS.some(indicator => 
      cleanInput.includes(indicator.toLowerCase())
    );
    
    // If it doesn't look like code generation, skip this rule
    if (!isCodeRequest) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Check for programming language specification
    const hasLanguage = PROGRAMMING_LANGUAGES.some(lang => {
      const patterns = [
        new RegExp(`\\b${lang}\\b`, 'i'),
        new RegExp(`\\bin ${lang}\\b`, 'i'),
        new RegExp(`\\busing ${lang}\\b`, 'i'),
        new RegExp(`\\bwith ${lang}\\b`, 'i'),
        new RegExp(`\\b${lang} code\\b`, 'i'),
        new RegExp(`\\b${lang} function\\b`, 'i'),
        new RegExp(`\\b${lang} script\\b`, 'i')
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });

    if (hasLanguage) {
      return {
        hasIssue: false,
        message: ''
      };
    }

    // Code generation request without language specification
    return {
      hasIssue: true,
      message: 'Programming language not specified for code generation request',
      suggestion: 'Specify the programming language (e.g., Python, JavaScript, Java, C++, etc.)'
    };
  }
}
