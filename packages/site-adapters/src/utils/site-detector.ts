/**
 * Site detection utilities for identifying AI websites
 * Pure utility functions with no dependencies on adapters
 */

import { SiteType, SiteDetectionResult } from '../types';

/**
 * URL patterns for supported sites
 * Using prefix matching to handle all conversation URLs
 */
const SITE_PATTERNS: Record<SiteType, RegExp[]> = {
  [SiteType.CHATGPT]: [
    /^https?:\/\/chat\.openai\.com\//i,
    /^https?:\/\/chatgpt\.com\//i,
    /^https?:\/\/.*\.openai\.com\/chat\//i
  ],
  [SiteType.CLAUDE]: [
    /^https?:\/\/claude\.ai\//i,
    /^https?:\/\/.*\.anthropic\.com\//i,
    /^https?:\/\/console\.anthropic\.com\//i
  ]
};

/**
 * DOM-based detection patterns for additional validation
 */
const DOM_PATTERNS: Record<SiteType, {
  selectors: string[];
  textContent?: string[];
  attributes?: Array<{ selector: string; attribute: string; value: RegExp }>;
}> = {
  [SiteType.CHATGPT]: {
    selectors: [
      '[data-testid="chat-input"]',
      'textarea[placeholder*="Message ChatGPT"]',
      '.text-base.gap-6', // ChatGPT chat container
      '[data-testid="send-button"]'
    ],
    textContent: ['ChatGPT', 'OpenAI'],
    attributes: [
      { selector: 'meta[property="og:site_name"]', attribute: 'content', value: /ChatGPT|OpenAI/i }
    ]
  },
  [SiteType.CLAUDE]: {
    selectors: [
      '[data-testid="chat-input"]',
      'textarea[placeholder*="Talk with Claude"]',
      '.claude-chat', // Claude-specific classes
      '[data-testid="send-message"]'
    ],
    textContent: ['Claude', 'Anthropic'],
    attributes: [
      { selector: 'meta[property="og:site_name"]', attribute: 'content', value: /Claude|Anthropic/i }
    ]
  }
};

/**
 * Site detector class providing fast, reliable site identification
 */
export class SiteDetector {
  private detectionCache = new Map<string, SiteDetectionResult>();
  private cacheTimeout = 30000; // 30 seconds

  /**
   * Detect site type from URL and DOM
   */
  async detectSite(url?: string): Promise<SiteDetectionResult> {
    const startTime = performance.now();
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    
    // Check cache first
    const cached = this.getCachedResult(targetUrl);
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          fromCache: true,
          detectionTime: performance.now() - startTime
        }
      };
    }

    try {
      const result = await this.performDetection(targetUrl, startTime);
      
      // Cache successful detections
      if (result.confidence > 0.5) {
        this.setCachedResult(targetUrl, result);
      }
      
      return result;
    } catch (error) {
      const detectionTime = performance.now() - startTime;
      return {
        type: null,
        confidence: 0,
        url: targetUrl,
        metadata: {
          detectionTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Perform actual site detection
   */
  private async performDetection(url: string, startTime: number): Promise<SiteDetectionResult> {
    let bestMatch: SiteType | null = null;
    let bestConfidence = 0;
    let detectionMetadata: Record<string, any> = {};

    // Test each site type
    for (const siteType of Object.values(SiteType)) {
      const { confidence, metadata } = await this.testSiteType(siteType, url);
      
      if (confidence > bestConfidence) {
        bestMatch = siteType;
        bestConfidence = confidence;
        detectionMetadata = { ...detectionMetadata, [`${siteType}_detection`]: metadata };
      }
    }

    const detectionTime = performance.now() - startTime;
    
    return {
      type: bestConfidence > 0.5 ? bestMatch : null,
      confidence: bestConfidence,
      url,
      metadata: {
        detectionTime,
        ...detectionMetadata,
        allScores: detectionMetadata
      }
    };
  }

  /**
   * Test specific site type against URL and DOM
   */
  private async testSiteType(siteType: SiteType, url: string): Promise<{
    confidence: number;
    metadata: Record<string, any>;
  }> {
    let confidence = 0;
    const metadata: Record<string, any> = {};

    // URL pattern matching (primary detection)
    const urlPatterns = SITE_PATTERNS[siteType];
    const urlMatch = urlPatterns.some(pattern => pattern.test(url));
    
    if (urlMatch) {
      confidence += 0.7; // Strong URL match
      metadata.urlMatch = true;
    }

    // DOM-based validation (if in browser environment)
    if (typeof document !== 'undefined') {
      const domConfidence = await this.testDOMPatterns(siteType);
      confidence += domConfidence * 0.3; // DOM validation boost
      metadata.domConfidence = domConfidence;
    } else {
      metadata.domConfidence = 0;
    }

    return {
      confidence: Math.min(confidence, 1.0),
      metadata
    };
  }

  /**
   * Test DOM patterns for site validation
   */
  private async testDOMPatterns(siteType: SiteType): Promise<number> {
    const patterns = DOM_PATTERNS[siteType];
    let score = 0;
    let totalTests = 0;

    // Test selectors
    if (patterns.selectors) {
      for (const selector of patterns.selectors) {
        totalTests++;
        try {
          if (document.querySelector(selector)) {
            score++;
          }
        } catch {
          // Invalid selector, skip
        }
      }
    }

    // Test text content
    if (patterns.textContent) {
      totalTests++;
      const bodyText = document.body?.textContent?.toLowerCase() || '';
      if (patterns.textContent.some(text => bodyText.includes(text.toLowerCase()))) {
        score++;
      }
    }

    // Test attributes
    if (patterns.attributes) {
      for (const { selector, attribute, value } of patterns.attributes) {
        totalTests++;
        try {
          const element = document.querySelector(selector);
          const attrValue = element?.getAttribute(attribute);
          if (attrValue && value.test(attrValue)) {
            score++;
          }
        } catch {
          // Invalid selector or attribute, skip
        }
      }
    }

    return totalTests > 0 ? score / totalTests : 0;
  }

  /**
   * Check if site is supported
   */
  async isSiteSupported(url?: string): Promise<boolean> {
    const result = await this.detectSite(url);
    return result.type !== null && result.confidence > 0.5;
  }

  /**
   * Get all supported site types
   */
  getSupportedSites(): SiteType[] {
    return Object.values(SiteType);
  }

  /**
   * Get URL patterns for a site type
   */
  getUrlPatterns(siteType: SiteType): RegExp[] {
    return [...SITE_PATTERNS[siteType]];
  }

  /**
   * Clear detection cache
   */
  clearCache(): void {
    this.detectionCache.clear();
  }

  /**
   * Get cached detection result
   */
  private getCachedResult(url: string): SiteDetectionResult | null {
    const cached = this.detectionCache.get(url);
    if (!cached) return null;

    // Check if cache is expired
    const cacheAge = Date.now() - (cached.metadata?.cacheTime || 0);
    if (cacheAge > this.cacheTimeout) {
      this.detectionCache.delete(url);
      return null;
    }

    return cached;
  }

  /**
   * Set cached detection result
   */
  private setCachedResult(url: string, result: SiteDetectionResult): void {
    const cachedResult = {
      ...result,
      metadata: {
        ...result.metadata,
        cacheTime: Date.now()
      }
    };
    
    this.detectionCache.set(url, cachedResult);
  }
}

/**
 * Global site detector instance
 */
export const siteDetector = new SiteDetector();

/**
 * Convenience function for quick site detection
 */
export async function detectCurrentSite(): Promise<SiteDetectionResult> {
  return siteDetector.detectSite();
}

/**
 * Convenience function to check if current site is supported
 */
export async function isCurrentSiteSupported(): Promise<boolean> {
  return siteDetector.isSiteSupported();
}
