// ===== src/ui-types.ts (FIXED) =====
/**
 * UI component interfaces and types
 */

import type { LintResult } from './lint-types';

/**
 * Floating panel display states
 */
export type FloatingPanelState = 'hidden' | 'minimized' | 'expanded';

/**
 * UI theme configuration
 */
export interface UITheme {
  /** Color scheme */
  scheme: 'light' | 'dark' | 'auto';
  /** Primary color palette */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    text: string;
  };
  /** Typography settings */
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

/**
 * Floating panel configuration
 */
export interface FloatingPanelConfig {
  /** Panel position */
  position: {
    x: number;
    y: number;
  };
  /** Panel dimensions */
  dimensions: {
    width: number;
    maxHeight: number;
  };
  /** Display state */
  state: FloatingPanelState;
  /** Theme configuration */
  theme: UITheme;
}

/**
 * Rephrase modal configuration
 */
export interface RephraseModalConfig {
  /** Whether modal is open */
  isOpen: boolean;
  /** Selected candidate index */
  selectedCandidate: number | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Extension UI state
 */
export interface ExtensionUIState {
  /** Current lint result */
  lintResult: LintResult | null;
  /** Floating panel configuration */
  floatingPanel: FloatingPanelConfig;
  /** Rephrase modal configuration */
  rephraseModal: RephraseModalConfig;
  /** Extension enabled state */
  isEnabled: boolean;
  /** Current site adapter */
  currentSite: string | null;
}