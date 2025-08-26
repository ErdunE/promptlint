/**
 * Site-specific types for PromptLint site adapters
 * Extends types from @promptlint/shared-types
 */

/**
 * Supported AI sites for PromptLint MVP
 */
export enum SiteType {
  CHATGPT = 'chatgpt',
  CLAUDE = 'claude'
}

/**
 * Site detection result
 */
export interface SiteDetectionResult {
  /** Detected site type */
  type: SiteType | null;
  /** Confidence level (0-1) */
  confidence: number;
  /** URL that was analyzed */
  url: string;
  /** Additional metadata from detection */
  metadata?: Record<string, any>;
}

/**
 * DOM element with fallback selectors
 */
export interface ElementSelector {
  /** Primary CSS selector */
  primary: string;
  /** Fallback selectors (in order of preference) */
  fallbacks: string[];
  /** Optional validation function to verify element is correct */
  validator?: (element: Element) => boolean;
  /** Human-readable description for debugging */
  description: string;
}

/**
 * Site-specific DOM configuration
 */
export interface SiteConfiguration {
  /** Site identifier */
  type: SiteType;
  /** URL patterns that identify this site */
  urlPatterns: RegExp[];
  /** Input textarea selectors */
  inputSelector: ElementSelector;
  /** Submit button selectors */
  submitSelector: ElementSelector;
  /** Main chat container selectors */
  chatContainerSelector: ElementSelector;
  /** UI injection point for floating panel */
  injectionPointSelector: ElementSelector;
  /** Optional site-specific metadata */
  metadata?: {
    /** Site name for display */
    displayName: string;
    /** Site icon URL or data URI */
    iconUrl?: string;
    /** Additional site-specific settings */
    settings?: Record<string, any>;
  };
}

/**
 * Element finding result
 */
export interface ElementFindResult {
  /** Found element (null if not found) */
  element: Element | null;
  /** Which selector was used (primary or fallback index) */
  selectorUsed: 'primary' | number;
  /** Time taken to find element (ms) */
  findTime: number;
  /** Whether element passed validation */
  isValid: boolean;
}

/**
 * Site adapter interface - contract for all site adapters
 */
export interface ISiteAdapter {
  /** Site configuration */
  readonly config: SiteConfiguration;
  
  /** Site type this adapter handles */
  readonly siteType: SiteType;
  
  /**
   * Detect if current page matches this adapter's site
   */
  detectSite(url?: string): Promise<SiteDetectionResult>;
  
  /**
   * Find input textarea element
   */
  findInputElement(): Promise<ElementFindResult>;
  
  /**
   * Find submit button element
   */
  findSubmitElement(): Promise<ElementFindResult>;
  
  /**
   * Find main chat container element
   */
  findChatContainer(): Promise<ElementFindResult>;
  
  /**
   * Find UI injection point for floating panel
   */
  findInjectionPoint(): Promise<ElementFindResult>;
  
  /**
   * Initialize adapter (setup watchers, etc.)
   */
  initialize(): Promise<void>;
  
  /**
   * Cleanup adapter resources
   */
  cleanup(): void;
}

/**
 * Adapter registry interface
 */
export interface IAdapterRegistry {
  /**
   * Register a site adapter
   */
  register(adapter: ISiteAdapter): void;
  
  /**
   * Get adapter for current site
   */
  getAdapter(url?: string): Promise<ISiteAdapter | null>;
  
  /**
   * Get all registered adapters
   */
  getAllAdapters(): ISiteAdapter[];
  
  /**
   * Check if site is supported
   */
  isSiteSupported(url?: string): Promise<boolean>;
}

/**
 * Fallback strategy configuration
 */
export interface FallbackConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries (ms) */
  baseDelay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
  /** Maximum total time to spend finding element (ms) */
  maxTimeout: number;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  /** Site detection time (ms) */
  siteDetectionTime: number;
  /** Element finding times by type */
  elementFindTimes: {
    input: number;
    submit: number;
    chatContainer: number;
    injectionPoint: number;
  };
  /** Fallback usage statistics */
  fallbackUsage: {
    [elementType: string]: {
      primary: number;
      fallback: number[];
    };
  };
}

/**
 * Error types for site adapters
 */
export enum AdapterErrorType {
  SITE_NOT_DETECTED = 'site_not_detected',
  ELEMENT_NOT_FOUND = 'element_not_found',
  SELECTOR_INVALID = 'selector_invalid',
  TIMEOUT = 'timeout',
  VALIDATION_FAILED = 'validation_failed',
  INITIALIZATION_FAILED = 'initialization_failed'
}

/**
 * Site adapter error
 */
export class AdapterError extends Error {
  constructor(
    public readonly type: AdapterErrorType,
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}
