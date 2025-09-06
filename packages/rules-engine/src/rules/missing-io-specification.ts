/**
 * Rule: Missing I/O Specification
 * 
 * Detects prompts that don't clearly specify input and/or output formats.
 * Important for ensuring AI understands data structures and expected results.
 */

import { LintRuleType } from '@promptlint/shared-types';
import { LintRule, RuleAnalysisResult } from './index.js';

/**
 * Keywords indicating input specification
 */
const INPUT_INDICATORS = [
  'input', 'parameter', 'argument', 'data', 'array', 'list', 'string', 'number', 'integer',
  'object', 'json', 'csv', 'file', 'text', 'value', 'variable', 'field', 'property',
  'receives', 'takes', 'accepts', 'given', 'provided', 'passed'
];

/**
 * Keywords indicating output specification
 */
const OUTPUT_INDICATORS = [
  'output', 'return', 'result', 'response', 'produce', 'generate', 'create', 'build',
  'sorted', 'filtered', 'transformed', 'formatted', 'calculated', 'processed',
  'returns', 'outputs', 'produces', 'yields', 'gives', 'provides'
];

/**
 * Keywords that suggest I/O specification might be needed
 */
const IO_CONTEXT_INDICATORS = [
  'function', 'method', 'algorithm', 'sort', 'search', 'filter', 'transform', 'convert',
  'parse', 'process', 'calculate', 'compute', 'analyze', 'validate', 'format', 'returns',
  'endpoint', 'api', 'service', 'component', 'connection', 'authentication',
  // Generic programming actions that usually need I/O
  'do', 'make', 'create', 'build', 'write', 'implement'
];

export class MissingIOSpecificationRule implements LintRule {
  type = LintRuleType.MISSING_IO_SPECIFICATION;
  name = 'Missing I/O Specification';
  description = 'Detects prompts without clear input/output format specifications';

  analyze(input: string): RuleAnalysisResult {
    const cleanInput = input.toLowerCase().trim();
    
    // Check if this type of request typically needs I/O specification
    const needsIOSpec = IO_CONTEXT_INDICATORS.some(indicator => 
      cleanInput.includes(indicator.toLowerCase())
    );
    
    // If it doesn't look like it needs I/O spec, skip this rule
    if (!needsIOSpec) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Check for input specification (must be explicitly about input, not just mentioning data types)
    const hasInputSpec = INPUT_INDICATORS.some(indicator => {
      const patterns = [
        new RegExp(`\\b${indicator}\\s*:`),
        new RegExp(`\\b${indicator}\\s*(is|are|should be)`),
        new RegExp(`\\btakes?\\s+\\w*\\s*${indicator}`),
        new RegExp(`\\binput\\s+${indicator}`),
        new RegExp(`\\b${indicator}\\s+input`),
        new RegExp(`\\breceives?\\s+\\w*\\s*${indicator}`),
        new RegExp(`\\baccepts?\\s+\\w*\\s*${indicator}`)
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });
    
    // Check for output specification  
    const hasOutputSpec = OUTPUT_INDICATORS.some(indicator => {
      const patterns = [
        new RegExp(`\\b${indicator}\\b`),
        new RegExp(`\\b${indicator}\\s*:`),
        new RegExp(`\\b${indicator}\\s*(is|are|should be)`),
        new RegExp(`\\bshould\\s+${indicator}`)
      ];
      return patterns.some(pattern => pattern.test(cleanInput));
    });

    // Determine what's missing
    const missingInput = !hasInputSpec;
    const missingOutput = !hasOutputSpec;
    
    if (!missingInput && !missingOutput) {
      return {
        hasIssue: false,
        message: ''
      };
    }
    
    // Generate appropriate message based on what's missing
    let message = '';
    let suggestion = '';
    
    if (missingInput && missingOutput) {
      message = 'Input and output formats not specified';
      suggestion = 'Specify both input format (e.g., "array of integers") and expected output format';
    } else if (missingInput) {
      message = 'Input format not specified';
      suggestion = 'Specify the input format (e.g., "array of integers", "string", "JSON object")';
    } else {
      message = 'Output format not specified';  
      suggestion = 'Specify the expected output format (e.g., "sorted array", "boolean", "formatted string")';
    }

    return {
      hasIssue: true,
      message,
      suggestion
    };
  }
}
