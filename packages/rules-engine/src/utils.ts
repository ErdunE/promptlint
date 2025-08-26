/**
 * Utility functions for the rules engine
 */

/**
 * Clean and normalize text for analysis
 * 
 * @param text - Input text to clean
 * @returns Cleaned text ready for analysis
 */
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\-]/g, ''); // Remove special characters except basic punctuation
}

/**
 * Extract words from text, filtering out short words and punctuation
 * 
 * @param text - Input text
 * @param minLength - Minimum word length to include (default: 2)
 * @returns Array of meaningful words
 */
export function extractWords(text: string, minLength: number = 2): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= minLength && /^[a-zA-Z]+$/.test(word));
}

/**
 * Check if text contains any of the specified patterns
 * 
 * @param text - Text to search in
 * @param patterns - Array of regex patterns or strings
 * @returns True if any pattern matches
 */
export function containsAny(text: string, patterns: (string | RegExp)[]): boolean {
  const lowerText = text.toLowerCase();
  
  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return lowerText.includes(pattern.toLowerCase());
    }
    return pattern.test(text);
  });
}

/**
 * Find all matches of patterns in text with positions
 * 
 * @param text - Text to search in
 * @param patterns - Array of regex patterns
 * @returns Array of match objects with position information
 */
export function findMatches(
  text: string, 
  patterns: RegExp[]
): Array<{ match: string; start: number; end: number }> {
  const matches: Array<{ match: string; start: number; end: number }> = [];
  
  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        match: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }
  
  return matches.sort((a, b) => a.start - b.start);
}

/**
 * Calculate text complexity score based on various factors
 * 
 * @param text - Text to analyze
 * @returns Complexity score (higher = more complex)
 */
export function calculateComplexity(text: string): number {
  const words = extractWords(text);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
  
  // Simple complexity score
  return Math.round((avgWordsPerSentence * 0.5 + avgWordLength * 0.3 + words.length * 0.2) * 10) / 10;
}

/**
 * Check if text appears to be a code generation request
 * 
 * @param text - Text to analyze
 * @returns True if it looks like a code generation request
 */
export function isCodeGenerationRequest(text: string): boolean {
  const codeIndicators = [
    'function', 'class', 'method', 'algorithm', 'code', 'script', 'program',
    'implement', 'write', 'create', 'build', 'develop', 'generate',
    'sort', 'search', 'parse', 'validate', 'calculate', 'compute'
  ];
  
  return containsAny(text, codeIndicators);
}

/**
 * Estimate reading time for text (in milliseconds)
 * 
 * @param text - Text to analyze
 * @param wordsPerMinute - Reading speed (default: 200 WPM)
 * @returns Estimated reading time in milliseconds
 */
export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = extractWords(text);
  const minutes = words.length / wordsPerMinute;
  return Math.round(minutes * 60 * 1000);
}
