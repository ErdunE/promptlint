/**
 * PromptLint UI Injector
 * 
 * Manages DOM injection and UI component lifecycle
 * Handles positioning and integration with target websites
 */

import { SiteAdapter, LintResult } from '@promptlint/shared-types';
import { FloatingPanel, FloatingPanelOptions } from './floating-panel';

export interface UIInjectorOptions {
  panelOptions?: FloatingPanelOptions;
  autoPosition?: boolean;
  respectSiteStyles?: boolean;
}

export class UIInjector {
  private adapter: SiteAdapter;
  private options: Required<UIInjectorOptions>;
  private floatingPanel: FloatingPanel | null = null;
  private injectionPoint: HTMLElement | null = null;
  private isInitialized = false;

  constructor(adapter: SiteAdapter, options: UIInjectorOptions = {}) {
    this.adapter = adapter;
    this.options = {
      panelOptions: options.panelOptions || {},
      autoPosition: options.autoPosition !== false,
      respectSiteStyles: options.respectSiteStyles !== false
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[PromptLint] UI Injector already initialized');
      return;
    }

    try {
      console.log('[PromptLint] Initializing UI injector...');
      
      // Find UI injection point using site adapter
      const injectionResult = await this.adapter.findInjectionPoint();
      if (!injectionResult.element) {
        console.warn('[PromptLint] No UI injection point found, using fallback');
        this.injectionPoint = document.body;
      } else {
        this.injectionPoint = injectionResult.element;
        console.log('[PromptLint] Found injection point:', injectionResult.selectorUsed);
      }

      // Determine optimal panel position
      const panelPosition = this.determineOptimalPosition();
      const panelOptions: FloatingPanelOptions = {
        ...this.options.panelOptions,
        position: panelPosition
      };

      // Initialize floating panel
      this.floatingPanel = new FloatingPanel(panelOptions);
      await this.floatingPanel.initialize();

      this.isInitialized = true;
      console.log('[PromptLint] UI injector initialized successfully');

    } catch (error) {
      console.error('[PromptLint] Failed to initialize UI injector:', error);
      throw error;
    }
  }

  private determineOptimalPosition(): 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left' {
    if (!this.options.autoPosition) {
      return this.options.panelOptions?.position || 'bottom-right';
    }

    try {
      // Get input element to position relative to it
      const inputResult = this.adapter.findInputElement();
      if (!inputResult.element) {
        return 'bottom-right';
      }

      const inputRect = inputResult.element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Determine horizontal position
      const preferRight = inputRect.right < (viewportWidth * 0.7);
      
      // Determine vertical position  
      const preferBottom = inputRect.bottom < (viewportHeight * 0.7);

      // Combine preferences
      if (preferRight && preferBottom) {
        return 'bottom-right';
      } else if (preferRight && !preferBottom) {
        return 'top-right';
      } else if (!preferRight && preferBottom) {
        return 'bottom-left';
      } else {
        return 'top-left';
      }

    } catch (error) {
      console.warn('[PromptLint] Error determining position, using default:', error);
      return 'bottom-right';
    }
  }

  async updateResults(result: LintResult): Promise<void> {
    if (!this.floatingPanel) {
      console.warn('[PromptLint] Floating panel not initialized');
      return;
    }

    try {
      // Update the floating panel with new results
      this.floatingPanel.updateResults(result);
      
      // Log for debugging
      console.log('[PromptLint] UI updated with results:', {
        score: result.score,
        issueCount: result.issues.length,
        processingTime: result.metadata?.processingTime
      });

    } catch (error) {
      console.error('[PromptLint] Error updating UI with results:', error);
    }
  }

  async showPanel(): Promise<void> {
    if (this.floatingPanel) {
      this.floatingPanel.show();
    }
  }

  async hidePanel(): Promise<void> {
    if (this.floatingPanel) {
      this.floatingPanel.hide();
    }
  }

  async repositionPanel(): Promise<void> {
    if (!this.floatingPanel || !this.options.autoPosition) {
      return;
    }

    try {
      // Determine new optimal position
      const newPosition = this.determineOptimalPosition();
      
      // Recreate panel with new position if it changed
      const currentPanel = this.floatingPanel;
      const panelOptions: FloatingPanelOptions = {
        ...this.options.panelOptions,
        position: newPosition
      };

      // Clean up current panel
      await currentPanel.cleanup();

      // Create new panel with updated position
      this.floatingPanel = new FloatingPanel(panelOptions);
      await this.floatingPanel.initialize();

      console.log('[PromptLint] Panel repositioned to:', newPosition);

    } catch (error) {
      console.error('[PromptLint] Error repositioning panel:', error);
    }
  }

  // Handle dynamic content changes (for SPAs)
  async handleContentChange(): Promise<void> {
    try {
      console.log('[PromptLint] Handling content change...');
      
      // Check if injection point still exists
      if (this.injectionPoint && !document.contains(this.injectionPoint)) {
        console.log('[PromptLint] Injection point removed, finding new one...');
        
        const injectionResult = await this.adapter.findInjectionPoint();
        if (injectionResult.element) {
          this.injectionPoint = injectionResult.element;
        } else {
          this.injectionPoint = document.body;
        }
      }

      // Reposition panel if needed
      await this.repositionPanel();

    } catch (error) {
      console.error('[PromptLint] Error handling content change:', error);
    }
  }

  // Get current UI state
  getStatus(): {
    isInitialized: boolean;
    hasPanelElement: boolean;
    hasInjectionPoint: boolean;
    panelVisible: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      hasPanelElement: !!this.floatingPanel,
      hasInjectionPoint: !!this.injectionPoint,
      panelVisible: this.floatingPanel ? this.floatingPanel['isVisible'] : false
    };
  }

  // Force refresh of UI components
  async refresh(): Promise<void> {
    try {
      console.log('[PromptLint] Refreshing UI components...');
      
      // Cleanup current components
      if (this.floatingPanel) {
        await this.floatingPanel.cleanup();
        this.floatingPanel = null;
      }

      this.isInitialized = false;

      // Reinitialize
      await this.initialize();

      console.log('[PromptLint] UI components refreshed successfully');

    } catch (error) {
      console.error('[PromptLint] Error refreshing UI components:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.floatingPanel) {
        await this.floatingPanel.cleanup();
        this.floatingPanel = null;
      }

      this.injectionPoint = null;
      this.isInitialized = false;

      console.log('[PromptLint] UI injector cleaned up');

    } catch (error) {
      console.error('[PromptLint] Error during UI injector cleanup:', error);
    }
  }
}
