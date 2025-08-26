// ===== src/config-types.ts (FIXED) =====
/**
 * Configuration interfaces and types
 */

import type { UITheme } from './ui-types';
import type { SupportedSite, SiteConfig } from './site-types';
import type { LintRuleConfig } from './lint-types';
import type { LLMServiceConfig } from './llm-types';

/**
 * Extension storage configuration
 */
export interface ExtensionStorageConfig {
  /** API keys (encrypted) */
  apiKeys: Record<string, string>;
  /** User preferences */
  preferences: {
    /** UI theme */
    theme: UITheme;
    /** Enabled features */
    features: {
      linting: boolean;
      rephrasing: boolean;
      autoSuggestions: boolean;
    };
    /** Site-specific settings */
    siteSettings: Record<SupportedSite, {
      enabled: boolean;
      customSelectors?: Partial<SiteConfig['selectors']>;
    }>;
  };
  /** Rule configurations */
  ruleConfigs: LintRuleConfig[];
  /** LLM service configuration */
  llmConfig: LLMServiceConfig;
}

/**
 * Extension manifest permissions
 */
export interface ExtensionPermissions {
  /** Required permissions */
  required: string[];
  /** Optional permissions */
  optional: string[];
  /** Host permissions */
  hosts: string[];
}

/**
 * Build configuration
 */
export interface BuildConfig {
  /** Target environment */
  target: 'development' | 'production';
  /** Source maps enabled */
  sourceMaps: boolean;
  /** Bundle analysis */
  analyze: boolean;
  /** Output directory */
  outputDir: string;
}