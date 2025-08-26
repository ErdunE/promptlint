// ===== src/site-types.ts =====
/**
 * Site adapter interfaces and types
 */

/**
 * Supported AI websites
 */
export enum SupportedSite {
    CHATGPT = 'chatgpt',
    CLAUDE = 'claude',
    GEMINI = 'gemini',
    COPILOT = 'copilot'
  }
  
  /**
   * DOM selector configuration with fallbacks
   */
  export interface DOMSelector {
    /** Primary selector */
    primary: string;
    /** Fallback selectors (in priority order) */
    fallbacks: string[];
    /** Selector validation function */
    validator?: (element: Element) => boolean;
  }
  
  /**
   * Site-specific DOM configuration
   */
  export interface SiteConfig {
    /** Site identifier */
    site: SupportedSite;
    /** Site display name */
    displayName: string;
    /** URL patterns to match */
    urlPatterns: string[];
    /** Input element selectors */
    selectors: {
      /** Main input textarea */
      input: DOMSelector;
      /** Submit button */
      submitButton: DOMSelector;
      /** Message container */
      messageContainer?: DOMSelector;
      /** Chat interface container */
      chatContainer?: DOMSelector;
    };
    /** UI injection configuration */
    injection: {
      /** Where to inject floating panel */
      panelContainer: DOMSelector;
      /** Panel positioning strategy */
      positionStrategy: 'relative' | 'absolute' | 'fixed';
      /** Z-index for floating elements */
      zIndex: number;
    };
    /** Site-specific behaviors */
    behaviors: {
      /** Whether site uses dynamic content loading */
      isDynamic: boolean;
      /** Input event types to monitor */
      inputEvents: string[];
      /** Debounce delay for input events (ms) */
      debounceDelay: number;
    };
  }
  
  /**
   * Site detection result
   */
  export interface SiteDetectionResult {
    /** Detected site */
    site: SupportedSite | null;
    /** Confidence level (0-1) */
    confidence: number;
    /** Detection method used */
    method: 'url' | 'dom' | 'title';
    /** Site configuration */
    config: SiteConfig | null;
  }
  
  /**
   * Site adapter interface
   */
  export interface SiteAdapter {
    /** Site configuration */
    config: SiteConfig;
    
    /** Initialize adapter for current page */
    initialize(): Promise<boolean>;
    
    /** Find and return input element */
    getInputElement(): Element | null;
    
    /** Inject floating panel UI */
    injectPanel(panelElement: HTMLElement): boolean;
    
    /** Monitor input changes */
    startInputMonitoring(callback: (text: string) => void): void;
    
    /** Stop input monitoring */
    stopInputMonitoring(): void;
    
    /** Replace input text */
    replaceInputText(newText: string): boolean;
    
    /** Cleanup adapter resources */
    cleanup(): void;
  }