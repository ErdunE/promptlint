/**
 * PromptLint Floating Panel Component
 * 
 * Displays real-time lint results in a non-intrusive floating panel
 * Shows quality scores (0-100) and specific improvement suggestions
 */

// Chrome API type declarations
declare const chrome: {
  runtime: {
    sendMessage(message: any, callback?: (response: any) => void): void;
    lastError?: { message: string };
  };
  storage: {
    local: {
      get(keys: string | string[] | null, callback: (result: Record<string, any>) => void): void;
      set(items: Record<string, any>, callback?: () => void): void;
    };
  };
};

import { LintResult, LintIssue, RephraseResult, RephraseCandidate } from '@promptlint/shared-types';
import { Level4IntegrationService } from './contextual-integration.js';
import { ChromeMemoryIntegration, createChromeMemoryIntegration, ExtensionInteractionData } from '../level5/MemoryIntegration.js';
import { UnifiedLevel5Experience } from '../level5/UnifiedExperience.js';

export interface FloatingPanelOptions {
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  autoHide?: boolean;
  animationDuration?: number;
  enableRephrase?: boolean;
}

export interface RephraseCallbacks {
  onRephraseRequest?: (originalPrompt: string) => Promise<RephraseResult>;
  onRephraseSelect?: (selectedCandidate: RephraseCandidate, originalPrompt: string) => void;
}

export class FloatingPanel {
  private panel: HTMLElement | null = null;
  private scoreElement: HTMLElement | null = null;
  private issuesContainer: HTMLElement | null = null;
  private rephraseButton: HTMLButtonElement | null = null;
  private rephraseToggleButton: HTMLButtonElement | null = null;
  private rephraseContainer: HTMLElement | null = null;
  private aiAgentDropdown: HTMLElement | null = null;
  private aiAgentDropdownMenu: HTMLElement | null = null;
  private selectedAiAgent = 'Auto';
  private isDropdownOpen = false;
  private isVisible = false;
  private isRephraseMode = false;
  private currentPrompt = '';
  private options: Required<FloatingPanelOptions>;
  private rephraseCallbacks: RephraseCallbacks;
  private level4Service: Level4IntegrationService;
  private memoryIntegration: ChromeMemoryIntegration;
  private level5Experience: UnifiedLevel5Experience | null = null;

  constructor(options: FloatingPanelOptions = {}, callbacks: RephraseCallbacks = {}) {
    this.options = {
      position: options.position || 'bottom-right',
      autoHide: options.autoHide !== false,
      animationDuration: options.animationDuration || 200,
      enableRephrase: options.enableRephrase !== false
    };
    this.rephraseCallbacks = callbacks;
    this.level4Service = new Level4IntegrationService();
    this.memoryIntegration = createChromeMemoryIntegration({
      enableAutoCapture: true,
      debugMode: false
    });
  }

  async initialize(): Promise<void> {
    try {
      this.createPanel();
      this.attachStyles();
      
      // Initialize Level 4 service
      await this.level4Service.initialize();
      
      // Initialize Level 5 memory integration
      try {
        await this.memoryIntegration.initializeForExtension();
        console.log('[PromptLint] Level 5 memory integration initialized');
      } catch (memoryError) {
        console.warn('[PromptLint] Level 5 memory initialization failed, continuing without memory:', memoryError);
      }
      
      console.log('[PromptLint] Floating panel initialized');
    } catch (error) {
      console.error('[PromptLint] Failed to initialize floating panel:', error);
      throw error;
    }
  }

  /**
   * Set Level 5 experience for advanced intelligence features
   */
  setLevel5Experience(experience: UnifiedLevel5Experience): void {
    this.level5Experience = experience;
    console.log('[PromptLint] Level 5 experience connected to floating panel');
  }

  private createPanel(): void {
    // Create main panel container
    this.panel = document.createElement('div');
    this.panel.id = 'promptlint-floating-panel';
    this.panel.className = `promptlint-panel promptlint-panel--${this.options.position}`;
    
    // Create header with score and drag handle
    const header = document.createElement('div');
    header.className = 'promptlint-panel__header';
    
    // Create drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'promptlint-panel__drag-handle';
    dragHandle.innerHTML = '⋮⋮';
    dragHandle.title = 'Drag to move panel';
    
    const title = document.createElement('div');
    title.className = 'promptlint-panel__title';
    // Debug icon loading process
    console.log('[PromptLint DEBUG] Starting icon loading process...');
    
    // Check if icon file exists (this will be logged during build time)
    console.log('[PromptLint DEBUG] Icon file path: ../../appicon/icon-48.png');
    
    // Base64 data for icon-48.png (scaled down to 24x24 via CSS)
    const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABqlBMVEVHcExSn/xVn/pXVN5ScudTiO9PivRMfu9QWdtMcu5Mg/NPWOFPVd9Rl/dTl/NQWtxOjPdPYOdRmvlNb+hNdutWmO1RW9hMevBTWNlagd1OaupVmfFRWd9QmPdMaORVoPdWnfJTnPhOlPlRVd5QVeJSnvtRUeFTnvlPY+RSnfpRV+FPlPdOX+VOYeFNlvxOXOZTUuNMk/pPVuRQU+NKfPBPmftOW+ZRnfxPWOVMkPlMkflMg/NQm/xMde9PWeZNiPVOmPxOjPZNivZLfvBMjvhMcu5McOuIiPpMhvSFjvqHi/uLg/pJe+9LgfJMa+pPWuZQY+hOl/xLcexNlftMbetLd+9MZuiqmPuDkfqzi/x7n/xNX+eAlftOXuZMgPGxjvpMaOmvkvpOYeionfxLee96pP1LgvKWuPp6rPuWvPt0cvFQgvl6p/y2h/t9m/qdrPx8mPx8sfuulfqYs/qasPx7e/d7kPqXwfuHdPFnoPeVmflbhPagpfxidu9NjvduhPNok/aUkPlnbu5Vf/ddiflWkvamifmLp/qgoPyTfvRmjfiYhPirlfpmkPlJ5tZ2AAAALnRSTlMA/XGCTE6mpkX19s6sjjkw9vLSpqYQEPUdB/Ucea+mSihg7Gbk9PSopuWOu/2Wf1lYEQAAA75JREFUSMeNlmlfGlcUh6dJF1pQqq3GNlpjXNKkLUYL44KC LBEECSiCRoQYg4ANIJSlQXZkETXfOeecOzOMTbV5fjPn3nvO8x/gFcNxAg/HJ+7dysT4o5+4G/T3DU5/cQfTT5+MyyJDfU8XFlaAhf+GJtNP HknfZky3ogNWboPNFgb7heeP6XRra7r/Z2WQfUbf1taWBu6tNYmbpx5jQ/h7H2s0Xq9XcxsYFvfeCfwAsOe8yBxbhOOcdNT0Zr8NcQ8HYbI8 dxcsTTzuh2+0jEBIKJ+Cprjc47763gosLVEBsLYKsXQ6VtDBwUqN5eUlNl3qg0AFsFaoWvGqFGIn/yDReIvOOLZW2PU1BEyE2WzGajJVCul0 FPQTINYSBpWKmSwKmI3QMxuxwm0CP5ZG+yQajcZNRiNOKIdgAFtGu1GgFUPSpEczmYLxJhD4zi7HXEA/Hs+Qnsl0TKxvtNulgF6OKQ52/Pg4 jnYmm83WqA0RvR0XDEQAfcSFJaJvkX58vN/JEqdJPbYBKvpvIOAKhVwuVlyRGtlIJ3uKJCPUpwoLBkIWSwhurKFQTdD3k/sdFnCFLEwI4TMx YNGiTcViqaGcSkIA6JyWSmchixZnWCACgQe41zJYINVsXn74cNksHpQwoJVhwcAmEAY2N6FRgwenmu+IYv6iVLoo4lxLBcBA2BcO+3w+zIRD qWQqlbpkgebBBVClZ2GBZfNH7ssHqyKQKoKeOsgX352fnxfzZ2+BDZ8cCHy72sN3eUDkm5L/9iwsE1Yx8KLHeZ4F9vby+T3m7+5WZQILbIu8 qJJMbNR30QbqqzRDtrd/gMC6RDkvyMjZLuP6usqm9EwM7OwI/mpV0h2OOtl/A2/q5Z110WEBgeoGw4HUr6/JRq7WJQcCP78UKMt9m+0N4zWS E52XFDiEzeHhjg3FDZJtNqezp79+1S4fIqD9AgG/3w8Hf9nhEJ6N5HJt0Ua6IGDELwSQsk3ECeRyzrZov0okuoKEgQEPo9GzWeCqLeqJxHtB 8vwKgSOGJ+eU6OYajVz36qqdYHQ9ZHiOIKAYOAoE4AoGjxp/iTQ8gYAHj+8ZcAQw9AenHgjOSgSDs0FxQ5WQdoHA76PciHJ2lud5aPK9IM/f XCUGFBz3jOfdBrebl3Aj0o6X4eaVwxynnnIbFg0GA3mGT5F3+Un8UxxdnJ9fvBMcz6OkGsbAsGr+M1Gq2R/1iOrPz0KpEF8Fhu9PPWdAG6u0 kzGjUsteTtTPlDPP72BmSqX41/vMiGJy9P5tTCpGRP0j3JFZCbK4zL0AAAAASUVORK5CYII=';
    
    // Debug base64 data
    console.log('[PromptLint DEBUG] Base64 string length:', iconBase64.length);
    console.log('[PromptLint DEBUG] Base64 first 50 chars:', iconBase64.substring(0, 50));
    console.log('[PromptLint DEBUG] Base64 starts with PNG header:', iconBase64.startsWith('iVBORw0KGgo'));
    
    // Create data URL
    const iconDataUrl = `data:image/png;base64,${iconBase64}`;
    console.log('[PromptLint DEBUG] Data URL length:', iconDataUrl.length);
    console.log('[PromptLint DEBUG] Data URL starts with:', iconDataUrl.substring(0, 30) + '...');
    
    title.innerHTML = `
      <img src="${iconDataUrl}" alt="PromptLint" class="promptlint-panel__title-icon" 
           onload="console.log('[PromptLint DEBUG] Icon loaded successfully')" 
           onerror="console.error('[PromptLint DEBUG] Icon loading failed:', this.src.substring(0, 100) + '...')">
      <span class="promptlint-panel__title-text">PromptLint</span>
    `;
    
    // Debug DOM element creation
    console.log('[PromptLint DEBUG] Title element created:', title);
    console.log('[PromptLint DEBUG] Title innerHTML length:', title.innerHTML.length);
    
    // Check if img element was created
    const imgElement = title.querySelector('img');
    console.log('[PromptLint DEBUG] Img element found:', !!imgElement);
    if (imgElement) {
      console.log('[PromptLint DEBUG] Img src length:', imgElement.src.length);
      console.log('[PromptLint DEBUG] Img src starts with:', imgElement.src.substring(0, 30) + '...');
    }
    
    // Create AI Agent dropdown
    this.aiAgentDropdown = document.createElement('div');
    this.aiAgentDropdown.className = 'promptlint-panel__ai-agent';
    this.aiAgentDropdown.innerHTML = `
      <span class="ai-agent-text">Auto</span>
      <span class="dropdown-arrow">▼</span>
    `;
    this.aiAgentDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAiAgentDropdown();
    });
    
    // Create dropdown menu
    this.aiAgentDropdownMenu = document.createElement('div');
    this.aiAgentDropdownMenu.className = 'promptlint-panel__ai-agent-menu';
    this.aiAgentDropdownMenu.style.display = 'none';
    
    const aiAgents = [
      { id: 'auto', name: 'Auto', description: 'Auto-detect current site' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI GPT models' },
      { id: 'claude', name: 'Claude', description: 'Anthropic Claude' },
      { id: 'gemini', name: 'Gemini', description: 'Google Gemini' },
      { id: 'copilot', name: 'Copilot', description: 'Microsoft Copilot' },
      { id: 'perplexity', name: 'Perplexity', description: 'Perplexity AI' }
    ];
    
    aiAgents.forEach(agent => {
      const option = document.createElement('div');
      option.className = 'ai-agent-option';
      option.dataset.agentId = agent.id;
      option.innerHTML = `
        <div class="ai-agent-option-name">${agent.name}</div>
        <div class="ai-agent-option-description">${agent.description}</div>
      `;
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectAiAgent(agent.id, agent.name);
      });
      this.aiAgentDropdownMenu?.appendChild(option);
    });
    
    this.aiAgentDropdown.appendChild(this.aiAgentDropdownMenu);
    
    // Create Rephrase toggle button
    this.rephraseToggleButton = document.createElement('button') as HTMLButtonElement;
    this.rephraseToggleButton.className = 'promptlint-panel__rephrase-toggle';
    this.rephraseToggleButton.innerHTML = `
      <span class="rephrase-icon">✨</span>
      <span class="rephrase-text">Rephrase</span>
    `;
    this.rephraseToggleButton.addEventListener('click', () => this.toggleRephraseMode());
    
    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'promptlint-panel__score';
    this.scoreElement.textContent = '0';
    
    header.appendChild(dragHandle);
    header.appendChild(title);
    header.appendChild(this.aiAgentDropdown);
    header.appendChild(this.rephraseToggleButton);
    header.appendChild(this.scoreElement);
    
    // Create issues container
    this.issuesContainer = document.createElement('div');
    this.issuesContainer.className = 'promptlint-panel__issues';
    
    // Rephrase button is now handled by toggle button in header
    
    // Create rephrase container
    this.rephraseContainer = document.createElement('div');
    this.rephraseContainer.className = 'promptlint-panel__rephrase';
    this.rephraseContainer.style.display = 'none';
    
    console.log('[PromptLint DEBUG] Created rephraseContainer:', this.rephraseContainer);
    console.log('[PromptLint DEBUG] rephraseContainer className:', this.rephraseContainer.className);
    
    // Create collapse/expand button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'promptlint-panel__toggle';
    toggleButton.innerHTML = '−';
    toggleButton.addEventListener('click', () => this.toggleCollapse());
    
    header.appendChild(toggleButton);
    
    // Assemble panel
    console.log('[PromptLint DEBUG] Assembling panel with components:');
    console.log('[PromptLint DEBUG] - header:', header);
    console.log('[PromptLint DEBUG] - issuesContainer:', this.issuesContainer);
    console.log('[PromptLint DEBUG] - rephraseButton:', this.rephraseButton);
    console.log('[PromptLint DEBUG] - rephraseContainer:', this.rephraseContainer);
    
    this.panel.appendChild(header);
    this.panel.appendChild(this.issuesContainer);
    this.panel.appendChild(this.rephraseContainer);
    console.log('[PromptLint DEBUG] Appended rephrase container to panel');
    
    console.log('[PromptLint DEBUG] Final panel structure:', this.panel.outerHTML);
    
    // Add to DOM (initially hidden)
    this.panel.style.display = 'none';
    document.body.appendChild(this.panel);
    
    // Initialize drag functionality
    this.initializeDrag(dragHandle);
    
    // Load saved position
    this.loadPosition();
    
    console.log('[PromptLint DEBUG] Panel added to document.body');
    console.log('[PromptLint DEBUG] Panel in DOM:', document.body.contains(this.panel));
    console.log('[PromptLint DEBUG] rephraseContainer in DOM:', document.body.contains(this.rephraseContainer));
  }

  private attachStyles(): void {
    // Check if styles already exist
    if (document.getElementById('promptlint-panel-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'promptlint-panel-styles';
    styleElement.textContent = this.getPanelCSS();
    document.head.appendChild(styleElement);
    
    // Set up theme change detection
    this.setupThemeChangeDetection();
  }

  private setupThemeChangeDetection(): void {
    // Listen for theme changes (common in modern apps)
    const observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
          shouldRefresh = true;
        }
      });
      
      if (shouldRefresh) {
        this.refreshTheme();
      }
    });
    
    // Observe body and html for theme changes
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    
    // Also listen for storage events (for cross-tab theme changes)
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme' || event.key === 'color-scheme') {
        this.refreshTheme();
      }
    });
  }

  private refreshTheme(): void {
    const styleElement = document.getElementById('promptlint-panel-styles');
    if (styleElement) {
      styleElement.textContent = this.getPanelCSS();
      console.log('[PromptLint] Theme refreshed for current page background');
    }
  }

  private detectLightTheme(): boolean {
    try {
      // Get the computed background color of the body or html element
      const body = document.body;
      const html = document.documentElement;
      
      // Try to get background color from body first, then html
      const bgColor = window.getComputedStyle(body).backgroundColor || 
                     window.getComputedStyle(html).backgroundColor;
      
      if (bgColor) {
        // Parse RGB values
        const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          
          // Calculate perceived brightness using luminance formula
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          
          // Return true for light themes (luminance > 0.5)
          return luminance > 0.5;
        }
      }
      
      // Fallback: check if page has light theme indicators
      const hasLightTheme = document.body.classList.contains('light') ||
                           document.body.classList.contains('light-mode') ||
                           document.documentElement.classList.contains('light') ||
                           document.documentElement.classList.contains('light-mode');
      
      return hasLightTheme;
    } catch (error) {
      console.warn('[PromptLint] Error detecting theme:', error);
      // Default to dark theme for safety
      return false;
    }
  }

  private getPanelCSS(): string {
    const isLightTheme = this.detectLightTheme();
    
    return `
      .promptlint-panel {
        position: fixed;
        z-index: 10000;
        background: ${isLightTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.12)'};
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        border: 1px solid ${isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
        border-radius: 12px;
        box-shadow: ${isLightTheme ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 0 20px rgba(59, 130, 246, 0.2)'};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 320px;
        max-width: 420px;
        transition: all ${this.options.animationDuration}ms ease;
        overflow: hidden;
      }

      .promptlint-panel--bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .promptlint-panel--top-right {
        top: 20px;
        right: 20px;
      }

      .promptlint-panel--bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .promptlint-panel--top-left {
        top: 20px;
        left: 20px;
      }

      .promptlint-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: ${isLightTheme ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)'};
        backdrop-filter: blur(14px);
        border-bottom: 1px solid ${isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)'};
        border-radius: 12px 12px 0 0;
        position: relative;
        gap: 12px;
        min-height: 48px;
      }

      .promptlint-panel__drag-handle {
        cursor: grab;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        font-size: 16px;
        font-weight: bold;
        padding: 6px;
        border-radius: 4px;
        transition: all 0.2s ease;
        user-select: none;
        background: transparent;
        border: none;
        z-index: 1;
        position: relative;
        letter-spacing: -1px;
      }

      .promptlint-panel__drag-handle:hover {
        color: ${isLightTheme ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'};
        background: rgba(59, 130, 246, 0.1);
        border-radius: 4px;
      }

      .promptlint-panel__drag-handle:active {
        cursor: grabbing;
        background: rgba(59, 130, 246, 0.15);
      }

      .promptlint-panel__title {
        font-weight: 600;
        font-size: 13px;
        flex: 1;
        text-align: center;
        letter-spacing: 0.025em;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 8px;
      }

      .promptlint-panel__title-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        filter: brightness(1.1) contrast(1.1);
      }

      .promptlint-panel__title-text {
        color: #60A5FA;
        text-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.025em;
      }

      .promptlint-panel__ai-agent {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        background: transparent;
        border: none;
        font-weight: 500;
        position: relative;
        z-index: 1;
      }

      .promptlint-panel__ai-agent:hover {
        background: rgba(59, 130, 246, 0.1);
        color: rgba(255, 255, 255, 1);
        border-radius: 4px;
      }

      .promptlint-panel__ai-agent:active {
        background: rgba(59, 130, 246, 0.15);
      }

      .dropdown-arrow {
        font-size: 8px;
        margin-left: 2px;
        opacity: 0.8;
        transition: transform 0.2s ease;
      }

      .promptlint-panel__ai-agent:hover .dropdown-arrow {
        transform: rotate(180deg);
      }

      .promptlint-panel__ai-agent.open .dropdown-arrow {
        transform: rotate(180deg);
      }

      .promptlint-panel__ai-agent-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 2147483647 !important;
        margin-top: 4px;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
        animation: dropdownFadeIn 0.2s ease-out;
        /* Ensure dropdown can be positioned outside panel boundaries */
        pointer-events: auto;
      }

      @keyframes dropdownFadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .ai-agent-option {
        padding: 10px 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .ai-agent-option:last-child {
        border-bottom: none;
      }

      .ai-agent-option:hover {
        background: rgba(59, 130, 246, 0.15);
      }

      .ai-agent-option-name {
        font-weight: 500;
        font-size: 12px;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        margin-bottom: 2px;
      }

      .ai-agent-option-description {
        font-size: 10px;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
        line-height: 1.3;
      }

      .promptlint-panel__rephrase-toggle {
        background: ${isLightTheme ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.8)'};
        color: white;
        border: 4px solid transparent;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(8px);
        min-width: 80px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 32px;
        position: relative;
        background-clip: padding-box;
        box-shadow: ${isLightTheme ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 0 20px rgba(59, 130, 246, 0.3)'};
      }

      /* Rainbow border animation for initial state */
      .promptlint-panel__rephrase-toggle::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: linear-gradient(45deg, 
          #3b82f6, #8b5cf6, #ec4899, #f97316, 
          #eab308, #22c55e, #06b6d4, #3b82f6);
        background-size: 400% 400%;
        border-radius: 12px;
        z-index: -1;
        animation: rainbow-border 4s linear infinite;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
      }

      /* Rainbow glow effect */
      .promptlint-panel__rephrase-toggle::after {

        content: '';
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        background: linear-gradient(45deg, 
          #3b82f6, #8b5cf6, #ec4899, #f97316, 
          #eab308, #22c55e, #06b6d4, #3b82f6);
        background-size: 400% 400%;
        border-radius: 14px;
        z-index: -2;
        animation: rainbow-glow 4s linear infinite;
        opacity: 0.3;
        filter: blur(4px);
      }

      @keyframes rainbow-border {
        0% { background-position: 0% 0%; }
        25% { background-position: 100% 0%; }
        50% { background-position: 100% 100%; }
        75% { background-position: 0% 100%; }
        100% { background-position: 0% 0%; }
      }

      @keyframes rainbow-glow {
        0% { background-position: 100% 100%; }
        25% { background-position: 0% 100%; }
        50% { background-position: 0% 0%; }
        75% { background-position: 100% 0%; }
        100% { background-position: 100% 100%; }
      }

      .promptlint-panel__rephrase-toggle:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      /* Active state - remove shimmer, clean appearance */
      .promptlint-panel__rephrase-toggle.active {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .promptlint-panel__rephrase-toggle.active::before {
        display: none;
      }

      .promptlint-panel__rephrase-toggle.active:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      /* Icon and text styling */
      .promptlint-panel__rephrase-toggle .rephrase-icon {
        font-size: 14px;
        transition: transform 0.2s ease;
      }

      .promptlint-panel__rephrase-toggle:hover .rephrase-icon {
        transform: scale(1.1);
      }

      .promptlint-panel__rephrase-toggle .rephrase-text {
        font-weight: 500;
        letter-spacing: 0.025em;
      }


      .promptlint-panel__score {
        font-weight: 700;
        font-size: 14px;
        padding: 6px 10px;
        border-radius: 6px;
        background: ${isLightTheme ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.15)'};
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
        border: 1px solid ${isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'};
        backdrop-filter: blur(8px);
        min-width: 32px;
        text-align: center;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
      }

      .promptlint-panel__score--poor {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.3);
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
      }

      .promptlint-panel__score--fair {
        background: rgba(245, 158, 11, 0.2);
        border-color: rgba(245, 158, 11, 0.3);
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
      }

      .promptlint-panel__score--good {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.3);
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
      }

      .promptlint-panel__score--excellent {
        background: #d4edda;
        color: #155724;
      }

      .promptlint-panel__score--good {
        background: #d1ecf1;
        color: #0c5460;
      }

      .promptlint-panel__score--fair {
        background: #fff3cd;
        color: #856404;
      }

      .promptlint-panel__score--poor {
        background: #f8d7da;
        color: #721c24;
      }

      .promptlint-panel__toggle {
        background: transparent;
        border: none;
        font-size: 14px;
        cursor: pointer;
        padding: 6px;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        border-radius: 4px;
        transition: all 0.2s ease;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      }

      .promptlint-panel__toggle:hover {
        background: rgba(59, 130, 246, 0.1);
        color: ${isLightTheme ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'};
        border-radius: 4px;
      }

      .promptlint-panel__toggle:active {
        background: rgba(59, 130, 246, 0.15);
      }

      .promptlint-panel__issues {
        padding: 0;
        max-height: 300px;
        overflow-y: auto;
        background: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }

      .promptlint-panel__issue {
        padding: 12px 16px;
        border-bottom: 1px solid ${isLightTheme ? 'rgba(0, 0, 0, 0.08)' : '#f1f3f4'};
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .promptlint-panel__issue:last-child {
        border-bottom: none;
      }

      .promptlint-panel__issue-icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-top: 2px;
      }

      .promptlint-panel__issue-icon--high {
        background: ${isLightTheme ? '#dc2626' : '#dc3545'};
      }

      .promptlint-panel__issue-icon--medium {
        background: ${isLightTheme ? '#d97706' : '#ffc107'};
      }

      .promptlint-panel__issue-icon--low {
        background: ${isLightTheme ? '#0891b2' : '#17a2b2'};
      }

      .promptlint-panel__issue-content {
        flex: 1;
      }

      .promptlint-panel__issue-title {
        font-weight: 500;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
        margin-bottom: 2px;
        font-size: 13px;
      }

      .promptlint-panel__issue-description {
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
        font-size: 12px;
        line-height: 1.4;
      }

      .promptlint-panel__no-issues {
        padding: 16px;
        text-align: center;
        color: ${isLightTheme ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
        font-weight: 500;
        font-size: 13px;
      }

      .promptlint-panel--collapsed .promptlint-panel__issues {
        display: none;
      }

      .promptlint-panel--collapsed .promptlint-panel__toggle {
        transform: rotate(180deg);
      }

      /* Animation states */
      .promptlint-panel--entering {
        opacity: 0;
        transform: translateY(10px);
      }

      .promptlint-panel--entered {
        opacity: 1;
        transform: translateY(0);
      }

      .promptlint-panel--exiting {
        opacity: 0;
        transform: translateY(10px);
      }

      .promptlint-panel__rephrase {
        background: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
        backdrop-filter: none;
        overflow: hidden;
      }

      .promptlint-panel__rephrase-mode {
        border-radius: 12px;
      }
    `;
  }

  updateResults(result: LintResult, originalPrompt?: string): void {
    if (!this.panel || !this.scoreElement || !this.issuesContainer) {
      console.warn('[PromptLint] Panel not initialized');
      return;
    }

    // Update score
    this.updateScore(result.score);
    
    // Update issues
    this.updateIssues(result.issues);

    // Run Level 4 contextual intelligence analysis in parallel
    if (originalPrompt) {
      this.currentPrompt = originalPrompt;
      this.runLevel4Analysis(originalPrompt).catch(error => {
        console.warn('[FloatingPanel] Level 4 analysis failed:', error);
      });
      
      // Run Level 5 unified analysis if available
      if (this.level5Experience) {
        this.runLevel5Analysis(originalPrompt, result).catch(error => {
          console.warn('[FloatingPanel] Level 5 analysis failed:', error);
        });
      }
      
      // Capture interaction in Level 5 memory
      this.captureInteractionInMemory(originalPrompt, result).catch(error => {
        console.warn('[FloatingPanel] Memory capture failed:', error);
      });
    }
    
    // Update prompt for rephrase functionality
    if (originalPrompt) {
      this.updatePrompt(originalPrompt);
    }
    
    // Show/hide panel based on results
    if (this.options.autoHide) {
      if (result.issues.length > 0) {
        this.show();
      } else {
        // Show briefly for good score, then auto-hide
        this.show();
        setTimeout(() => this.hide(), 2000);
      }
    } else {
      this.show();
    }
  }

  private updateScore(score: number): void {
    if (!this.scoreElement) return;

    this.scoreElement.textContent = score.toString();
    
    // Remove existing score classes
    this.scoreElement.className = 'promptlint-panel__score';
    
    // Add appropriate score class based on new color coding system
    if (score >= 71) {
      this.scoreElement.classList.add('promptlint-panel__score--good');
    } else if (score >= 41) {
      this.scoreElement.classList.add('promptlint-panel__score--fair');
    } else {
      this.scoreElement.classList.add('promptlint-panel__score--poor');
    }
  }

  private updateIssues(issues: LintIssue[]): void {
    if (!this.issuesContainer) return;

    // Clear existing issues
    this.issuesContainer.innerHTML = '';

    if (issues.length === 0) {
      // Show "no issues" message
      const noIssuesElement = document.createElement('div');
      noIssuesElement.className = 'promptlint-panel__no-issues';
      noIssuesElement.textContent = '✓ Great prompt quality!';
      this.issuesContainer.appendChild(noIssuesElement);
      return;
    }

    // Add each issue
    issues.forEach(issue => {
      const issueElement = document.createElement('div');
      issueElement.className = 'promptlint-panel__issue';

      const iconElement = document.createElement('div');
      iconElement.className = `promptlint-panel__issue-icon promptlint-panel__issue-icon--${issue.severity}`;

      const contentElement = document.createElement('div');
      contentElement.className = 'promptlint-panel__issue-content';

      const titleElement = document.createElement('div');
      titleElement.className = 'promptlint-panel__issue-title';
      titleElement.textContent = this.getIssueTitle(issue);

      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'promptlint-panel__issue-description';
      descriptionElement.textContent = issue.message;

      contentElement.appendChild(titleElement);
      contentElement.appendChild(descriptionElement);
      
      issueElement.appendChild(iconElement);
      issueElement.appendChild(contentElement);
      
      if (this.issuesContainer) {
        this.issuesContainer.appendChild(issueElement);
      }
    });
  }

  private getIssueTitle(issue: LintIssue): string {
    const titles: Record<string, string> = {
      'missing_task_verb': 'Missing Action Verb',
      'missing_language': 'Missing Programming Language',
      'missing_io_specification': 'Missing Input/Output Details',
      'vague_wording': 'Vague Language',
      'unclear_scope': 'Unclear Scope',
      'redundant_language': 'Redundant Wording'
    };
    
    return titles[issue.type] || 'Quality Issue';
  }

  show(): void {
    if (!this.panel || this.isVisible) return;

    this.panel.style.display = 'block';
    this.panel.classList.add('promptlint-panel--entering');
    
    // Trigger animation
    requestAnimationFrame(() => {
      if (this.panel) {
        this.panel.classList.remove('promptlint-panel--entering');
        this.panel.classList.add('promptlint-panel--entered');
      }
    });

    this.isVisible = true;
  }

  hide(): void {
    if (!this.panel || !this.isVisible) return;

    this.panel.classList.remove('promptlint-panel--entered');
    this.panel.classList.add('promptlint-panel--exiting');

    setTimeout(() => {
      if (this.panel) {
        this.panel.style.display = 'none';
        this.panel.classList.remove('promptlint-panel--exiting');
      }
    }, this.options.animationDuration);

    this.isVisible = false;
  }

  private toggleCollapse(): void {
    if (!this.panel) return;

    this.panel.classList.toggle('promptlint-panel--collapsed');
    
    const toggleButton = this.panel.querySelector('.promptlint-panel__toggle');
    if (toggleButton) {
      toggleButton.innerHTML = this.panel.classList.contains('promptlint-panel--collapsed') ? '+' : '−';
    }
  }

  private async handleRephraseClick(): Promise<void> {
    if (!this.rephraseCallbacks.onRephraseRequest || !this.currentPrompt) {
      console.warn('[PromptLint] No rephrase callback or prompt available');
      return;
    }

    try {
      // Show loading state
      if (this.rephraseButton) {
        this.rephraseButton.innerHTML = '⏳ Rephrasing...';
        this.rephraseButton.disabled = true;
      }

      // Request rephrase
      const result = await this.rephraseCallbacks.onRephraseRequest(this.currentPrompt);
      
      // Display rephrase candidates
      this.displayRephraseCandidates(result);
      
    } catch (error) {
      console.error('[PromptLint] Rephrase failed:', error);
      this.showRephraseError(error instanceof Error ? error.message : 'Rephrase failed');
    } finally {
      // Reset button state
      if (this.rephraseButton) {
        this.rephraseButton.innerHTML = 'Rephrase';
        this.rephraseButton.disabled = false;
      }
    }
  }

  private displayRephraseCandidates(result: RephraseResult): void {
    console.log('[PromptLint DEBUG] displayRephraseCandidates called');
    console.log('[PromptLint DEBUG] rephraseContainer exists:', !!this.rephraseContainer);
    console.log('[PromptLint DEBUG] panel exists:', !!this.panel);
    console.log('[PromptLint DEBUG] result:', result);

    if (!this.rephraseContainer || !this.panel) {
      console.error('[PromptLint DEBUG] Missing DOM elements - rephraseContainer or panel is null');
      return;
    }

    console.log('[PromptLint DEBUG] rephraseContainer element:', this.rephraseContainer);
    console.log('[PromptLint DEBUG] rephraseContainer parent:', this.rephraseContainer.parentElement);
    console.log('[PromptLint DEBUG] panel element:', this.panel);
    console.log('[PromptLint DEBUG] panel parent:', this.panel.parentElement);

    this.isRephraseMode = true;
          this.rephraseContainer.innerHTML = '';
      this.rephraseContainer.style.display = 'block';
      this.rephraseContainer.style.maxHeight = '600px';
      this.rephraseContainer.style.overflowY = 'auto';
      this.rephraseContainer.style.padding = '16px';
      this.rephraseContainer.style.background = 'transparent';
      this.rephraseContainer.style.backdropFilter = 'none';
      this.rephraseContainer.style.borderRadius = '0';
      this.rephraseContainer.style.border = 'none';
      this.rephraseContainer.style.boxShadow = 'none';
    
    console.log('[PromptLint DEBUG] Set rephraseContainer display to block');
    console.log('[PromptLint DEBUG] rephraseContainer computed styles:', window.getComputedStyle(this.rephraseContainer));
    
    // Add rephrase mode class to expand panel
    this.panel.classList.add('promptlint-panel--rephrase-mode');
    console.log('[PromptLint DEBUG] Added rephrase-mode class to panel');

    // Create candidates using the same pattern as issues
    console.log('[PromptLint DEBUG] Processing candidates:', result.candidates.length);

    result.candidates.forEach((candidate, index) => {
      console.log(`[PromptLint DEBUG] Creating candidate ${index}:`, candidate);
      
      const candidateElement = document.createElement('div');
      candidateElement.className = 'promptlint-panel__issue';
      
      // Modern AI Assistant Card Design (ChatGPT/Claude inspired)
      candidateElement.innerHTML = `
        <div class="promptlint-panel__issue" style="
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        ">
          <!-- Small Badge -->
          <div style="
            position: absolute;
            top: 12px;
            left: 16px;
            background: ${this.getApproachColor(candidate.approach)};
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            z-index: 2;
          ">${candidate.approach}</div>
          
          <!-- Content Area -->
          <div style="
            padding: 40px 16px 60px 16px;
            color: #1f2937;
            line-height: 1.6;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">${this.formatRephraseText(candidate.text)}</div>
          
          <!-- Action Button -->
          <div style="
            position: absolute;
            bottom: 12px;
            right: 16px;
          ">
            <button class="promptlint-copy-btn" title="Copy to clipboard" style="
              background: rgba(59, 130, 246, 0.9);
              color: white;
              border: none;
              border-radius: 8px;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              backdrop-filter: blur(10px);
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
            ">Copy</button>
          </div>
        </div>
      `;

      console.log(`[PromptLint DEBUG] Candidate ${index} HTML:`, candidateElement.outerHTML);
      console.log(`[PromptLint DEBUG] Candidate ${index} classes:`, candidateElement.className);

      // Add copy button handler (prevent event bubbling)
      const copyBtn = candidateElement.querySelector('.promptlint-copy-btn') as HTMLButtonElement;
      if (copyBtn) {
        // Add glassmorphism hover effects
        copyBtn.addEventListener('mouseenter', () => {
          copyBtn.style.background = 'rgba(37, 99, 235, 0.95)';
          copyBtn.style.transform = 'translateY(-2px)';
          copyBtn.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.4)';
        });
        copyBtn.addEventListener('mouseleave', () => {
          copyBtn.style.background = 'rgba(59, 130, 246, 0.9)';
          copyBtn.style.transform = 'translateY(0)';
          copyBtn.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        });
        copyBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          console.log(`[PromptLint DEBUG] Copy button ${index} clicked`);
          
          // Track template selection when user copies
          await this.trackTemplateSelection(candidate, this.currentPrompt);
          
          this.copyToClipboard(candidate.text);
          this.showCopyFeedback(copyBtn);
        });
        
        // Debug copy button styling
        const copyBtnStyles = window.getComputedStyle(copyBtn);
        console.log(`[PromptLint DEBUG] Copy button ${index} styling:`, {
          background: copyBtnStyles.background,
          color: copyBtnStyles.color,
          border: copyBtnStyles.border,
          borderRadius: copyBtnStyles.borderRadius,
          padding: copyBtnStyles.padding,
          fontSize: copyBtnStyles.fontSize,
          fontWeight: copyBtnStyles.fontWeight,
          cursor: copyBtnStyles.cursor,
          boxShadow: copyBtnStyles.boxShadow
        });
      } else {
        console.error(`[PromptLint DEBUG] Copy button ${index} not found!`);
      }
      
      // Debug approach label styling
      const approachElement = candidateElement.querySelector('.promptlint-panel__issue-icon') as HTMLElement;
      if (approachElement) {
        const approachStyles = window.getComputedStyle(approachElement);
        console.log(`[PromptLint DEBUG] Approach label ${index} styling:`, {
          background: approachStyles.background,
          color: approachStyles.color,
          borderRadius: approachStyles.borderRadius,
          padding: approachStyles.padding,
          fontSize: approachStyles.fontSize,
          fontWeight: approachStyles.fontWeight,
          textTransform: approachStyles.textTransform,
          letterSpacing: approachStyles.letterSpacing,
          minWidth: approachStyles.minWidth,
          textAlign: approachStyles.textAlign,
          boxShadow: approachStyles.boxShadow
        });
      } else {
        console.error(`[PromptLint DEBUG] Approach label ${index} not found!`);
      }
      
      // Debug card container styling
      const contentElement = candidateElement.querySelector('.promptlint-panel__issue-content') as HTMLElement;
      if (contentElement) {
        const contentStyles = window.getComputedStyle(contentElement);
        const contentRect = contentElement.getBoundingClientRect();
        console.log(`[PromptLint DEBUG] Card container ${index} styling:`, {
          background: contentStyles.background,
          border: contentStyles.border,
          borderRadius: contentStyles.borderRadius,
          padding: contentStyles.padding,
          margin: contentStyles.margin,
          boxShadow: contentStyles.boxShadow,
          width: contentRect.width,
          height: contentRect.height
        });
      } else {
        console.error(`[PromptLint DEBUG] Card container ${index} not found!`);
      }

      // Remove click handler for the entire card to prevent accidental closes
      // Users should explicitly click copy or close buttons

      if (this.rephraseContainer) {
        this.rephraseContainer.appendChild(candidateElement);
      }
      console.log(`[PromptLint DEBUG] Appended candidate ${index} directly to rephraseContainer`);
      
      // DEBUG: Check the actual description element and its styles
      const descriptionElement = candidateElement.querySelector('.promptlint-panel__issue-description') as HTMLElement;
      if (descriptionElement) {
        const computedStyles = window.getComputedStyle(descriptionElement);
        const rect = descriptionElement.getBoundingClientRect();
        
        console.log(`[PromptLint DEBUG] Candidate ${index} description element:`, {
          element: descriptionElement,
          innerHTML: descriptionElement.innerHTML,
          textContent: descriptionElement.textContent,
          innerText: descriptionElement.innerText,
          className: descriptionElement.className,
          computedStyles: {
            whiteSpace: computedStyles.whiteSpace,
            wordWrap: computedStyles.wordWrap,
            overflowWrap: computedStyles.overflowWrap,
            display: computedStyles.display,
            width: computedStyles.width,
            maxWidth: computedStyles.maxWidth,
            height: computedStyles.height,
            lineHeight: computedStyles.lineHeight,
            fontSize: computedStyles.fontSize,
            fontFamily: computedStyles.fontFamily,
            color: computedStyles.color,
            backgroundColor: computedStyles.backgroundColor,
            padding: computedStyles.padding,
            margin: computedStyles.margin,
            border: computedStyles.border,
            position: computedStyles.position,
            overflow: computedStyles.overflow,
            textOverflow: computedStyles.textOverflow
          },
          boundingRect: {
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y
          }
        });
        
        // Check if line breaks are preserved in the text content
        const textContent = descriptionElement.textContent || '';
        const lineBreakCount = (textContent.match(/\n/g) || []).length;
        console.log(`[PromptLint DEBUG] Candidate ${index} line break analysis:`, {
          textContentLength: textContent.length,
          lineBreakCount,
          hasLineBreaks: lineBreakCount > 0,
          firstLineBreakIndex: textContent.indexOf('\n'),
          textContentPreview: textContent.substring(0, 100) + '...'
        });
      }
    });


    console.log('[PromptLint DEBUG] Final rephraseContainer innerHTML:', this.rephraseContainer.innerHTML);
    // Get actual computed style values
    const containerStyles = window.getComputedStyle(this.rephraseContainer);
    const containerRect = this.rephraseContainer.getBoundingClientRect();
    const panelRect = this.panel?.getBoundingClientRect();
    
    console.log('[PromptLint DEBUG] rephraseContainer ACTUAL computed styles:', {
      display: containerStyles.display,
      visibility: containerStyles.visibility,
      opacity: containerStyles.opacity,
      width: containerStyles.width,
      height: containerStyles.height,
      color: containerStyles.color,
      backgroundColor: containerStyles.backgroundColor,
      position: containerStyles.position,
      top: containerStyles.top,
      left: containerStyles.left,
      zIndex: containerStyles.zIndex,
      overflow: containerStyles.overflow,
      padding: containerStyles.padding,
      margin: containerStyles.margin
    });
    
    console.log('[PromptLint DEBUG] rephraseContainer ACTUAL bounding rect:', {
      width: containerRect.width,
      height: containerRect.height,
      x: containerRect.x,
      y: containerRect.y,
      top: containerRect.top,
      left: containerRect.left,
      bottom: containerRect.bottom,
      right: containerRect.right
    });
    
    console.log('[PromptLint DEBUG] Panel ACTUAL bounding rect:', panelRect ? {
      width: panelRect.width,
      height: panelRect.height,
      x: panelRect.x,
      y: panelRect.y,
      top: panelRect.top,
      left: panelRect.left,
      bottom: panelRect.bottom,
      right: panelRect.right
    } : 'null');
    
    // Check for CSS conflicts
    console.log('[PromptLint DEBUG] All stylesheets on page:');
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        console.log(`[PromptLint DEBUG] Stylesheet ${index}:`, {
          href: sheet.href,
          ownerNode: sheet.ownerNode,
          rulesCount: sheet.cssRules?.length || 'N/A'
        });
      } catch (e) {
        console.log(`[PromptLint DEBUG] Stylesheet ${index}: Cross-origin or inaccessible`);
      }
    });
    
    // Check if our styles exist
    const promptlintStyles = document.getElementById('promptlint-panel-styles');
    console.log('[PromptLint DEBUG] PromptLint styles element exists:', !!promptlintStyles);
    if (promptlintStyles) {
      console.log('[PromptLint DEBUG] PromptLint styles content length:', promptlintStyles.textContent?.length || 0);
    }
    
    // Check if styles are being applied
    const sampleCandidate = this.rephraseContainer.querySelector('.promptlint-panel__issue');
    if (sampleCandidate) {
      console.log('[PromptLint DEBUG] Sample candidate computed styles:', window.getComputedStyle(sampleCandidate));
      console.log('[PromptLint DEBUG] Sample candidate bounding rect:', sampleCandidate.getBoundingClientRect());
      
      // Get detailed candidate element debugging
      const candidateStyles = window.getComputedStyle(sampleCandidate);
      const candidateRect = sampleCandidate.getBoundingClientRect();
      
      console.log('[PromptLint DEBUG] Sample candidate ACTUAL computed styles:', {
        display: candidateStyles.display,
        visibility: candidateStyles.visibility,
        opacity: candidateStyles.opacity,
        width: candidateStyles.width,
        height: candidateStyles.height,
        color: candidateStyles.color,
        backgroundColor: candidateStyles.backgroundColor,
        border: candidateStyles.border,
        borderBottom: candidateStyles.borderBottom,
        padding: candidateStyles.padding,
        margin: candidateStyles.margin,
        fontSize: candidateStyles.fontSize,
        fontWeight: candidateStyles.fontWeight,
        lineHeight: candidateStyles.lineHeight,
        position: candidateStyles.position,
        top: candidateStyles.top,
        left: candidateStyles.left,
        zIndex: candidateStyles.zIndex
      });
      
      console.log('[PromptLint DEBUG] Sample candidate ACTUAL bounding rect:', {
        width: candidateRect.width,
        height: candidateRect.height,
        x: candidateRect.x,
        y: candidateRect.y,
        top: candidateRect.top,
        left: candidateRect.left,
        bottom: candidateRect.bottom,
        right: candidateRect.right
      });
      
      // Check individual child elements
      const approachElement = sampleCandidate.querySelector('.promptlint-panel__issue-icon');
      const contentElement = sampleCandidate.querySelector('.promptlint-panel__issue-content');
      const textElement = sampleCandidate.querySelector('.promptlint-panel__issue-description');
      
      if (approachElement) {
        const approachStyles = window.getComputedStyle(approachElement);
        const approachRect = approachElement.getBoundingClientRect();
        console.log('[PromptLint DEBUG] Approach element ACTUAL styles:', {
          display: approachStyles.display,
          visibility: approachStyles.visibility,
          opacity: approachStyles.opacity,
          color: approachStyles.color,
          backgroundColor: approachStyles.backgroundColor,
          fontSize: approachStyles.fontSize,
          padding: approachStyles.padding,
          width: approachStyles.width,
          height: approachStyles.height
        });
        console.log('[PromptLint DEBUG] Approach element ACTUAL rect:', {
          width: approachRect.width,
          height: approachRect.height,
          x: approachRect.x,
          y: approachRect.y
        });
      }
      
      if (textElement) {
        const textStyles = window.getComputedStyle(textElement);
        const textRect = textElement.getBoundingClientRect();
        console.log('[PromptLint DEBUG] Text element ACTUAL styles:', {
          display: textStyles.display,
          visibility: textStyles.visibility,
          opacity: textStyles.opacity,
          color: textStyles.color,
          backgroundColor: textStyles.backgroundColor,
          fontSize: textStyles.fontSize,
          fontWeight: textStyles.fontWeight,
          lineHeight: textStyles.lineHeight,
          whiteSpace: textStyles.whiteSpace,
          wordWrap: textStyles.wordWrap,
          width: textStyles.width,
          height: textStyles.height
        });
        console.log('[PromptLint DEBUG] Text element ACTUAL rect:', {
          width: textRect.width,
          height: textRect.height,
          x: textRect.x,
          y: textRect.y
        });
      }
    } else {
      console.error('[PromptLint DEBUG] No candidate elements found after injection!');
    }
  }

  private async handleCandidateSelect(candidate: RephraseCandidate): Promise<void> {
    // Track user template selection in Chrome storage
    await this.trackTemplateSelection(candidate, this.currentPrompt);
    
    if (this.rephraseCallbacks.onRephraseSelect) {
      this.rephraseCallbacks.onRephraseSelect(candidate, this.currentPrompt);
    }
    this.hideRephrase();
  }

  /**
   * Track user template selection in Chrome storage for learning user preferences
   * Enhanced for Phase 3.2 adaptive learning
   */
  private async trackTemplateSelection(candidate: RephraseCandidate, originalPrompt: string): Promise<void> {
    try {
      // Check if tracking is enabled (respect privacy controls)
      const privacySettings = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_privacy_settings'], resolve);
      });
      const enableTracking = privacySettings.promptlint_privacy_settings?.enableTracking !== false; // Default to true
      
      if (!enableTracking) {
        console.log('[PromptLint] Template selection tracking disabled by user privacy settings');
        return;
      }

      // Get current user data from storage
      const stored = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_user_data'], resolve);
      });
      const userData = stored.promptlint_user_data || { 
        selections: [], 
        preferences: {},
        stats: {
          totalSelections: 0,
          averagePromptLength: 0,
          mostUsedApproach: null
        },
        lastUpdated: Date.now(),
        version: '0.6.0'
      };
      
      // Add new selection record with enhanced data for adaptive learning
      const selectionRecord = {
        timestamp: Date.now(),
        candidateId: candidate.id,
        approach: candidate.approach,
        originalPrompt: originalPrompt.substring(0, 200), // Store first 200 chars for privacy
        promptLength: originalPrompt.length,
        estimatedScore: candidate.estimatedScore || 0,
        improvements: candidate.improvements || [],
        site: window.location.hostname,
        // Enhanced Phase 3.2 tracking data
        selectionTime: Date.now() - this.rephraseStartTime, // Time to select
        contextTags: this.extractContextTags(originalPrompt),
        promptComplexity: this.assessPromptComplexity(originalPrompt),
        userSatisfactionIndicators: {
          quickSelection: (Date.now() - this.rephraseStartTime) < 5000,
          noModifications: true, // Assume no modifications for now
          repeatedUse: await this.checkRepeatedUse(candidate.approach, userData)
        }
      };
      
      userData.selections.push(selectionRecord);
      
      // Update preferences based on selection pattern
      const approach = candidate.approach || 'unknown';
      userData.preferences[approach] = (userData.preferences[approach] || 0) + 1;
      
      // Update statistics with enhanced Phase 3.2 metrics
      userData.stats.totalSelections = userData.selections.length;
      userData.stats.averagePromptLength = Math.round(
        userData.selections.reduce((sum: number, sel: any) => sum + sel.promptLength, 0) / userData.selections.length
      );
      userData.stats.averageSelectionTime = Math.round(
        userData.selections.reduce((sum: number, sel: any) => sum + (sel.selectionTime || 5000), 0) / userData.selections.length
      );
      
      // Find most used approach
      const mostUsedApproach = Object.entries(userData.preferences)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      userData.stats.mostUsedApproach = mostUsedApproach ? mostUsedApproach[0] : null;
      
      // Calculate learning confidence based on selection consistency
      userData.stats.learningConfidence = this.calculateLearningConfidence(userData.selections);
      
      userData.lastUpdated = Date.now();
      
      // Limit storage size - keep only last 100 selections
      if (userData.selections.length > 100) {
        userData.selections = userData.selections.slice(-100);
      }
      
      // Store back to Chrome storage
      await chrome.storage.local.set({ promptlint_user_data: userData });
      
      // Notify adaptive engine of selection for learning
      await this.notifyAdaptiveEngine(selectionRecord, userData);
      
      console.log('[PromptLint] Enhanced template selection tracked:', {
        approach: candidate.approach,
        totalSelections: userData.stats.totalSelections,
        preferences: userData.preferences,
        selectionTime: selectionRecord.selectionTime + 'ms',
        learningConfidence: userData.stats.learningConfidence?.toFixed(3)
      });
      
    } catch (error) {
      console.warn('[PromptLint] Failed to track template selection:', error);
      // Don't throw - tracking failure shouldn't break user experience
    }
  }

  // Enhanced tracking helper methods for Phase 3.2
  private rephraseStartTime = Date.now();

  private extractContextTags(prompt: string): string[] {
    const tags: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Domain tags
    if (lowerPrompt.includes('code') || lowerPrompt.includes('program')) tags.push('coding');
    if (lowerPrompt.includes('data') || lowerPrompt.includes('analysis')) tags.push('data-analysis');
    if (lowerPrompt.includes('design') || lowerPrompt.includes('ui')) tags.push('design');
    if (lowerPrompt.includes('write') || lowerPrompt.includes('content')) tags.push('writing');
    
    // Intent tags
    if (lowerPrompt.includes('create') || lowerPrompt.includes('build')) tags.push('creation');
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('review')) tags.push('analysis');
    if (lowerPrompt.includes('optimize') || lowerPrompt.includes('improve')) tags.push('optimization');
    
    return tags;
  }

  private assessPromptComplexity(prompt: string): number {
    let complexity = 0;
    
    // Length factor
    complexity += Math.min(0.3, prompt.length / 1000);
    
    // Technical terms
    const technicalTerms = ['implement', 'analyze', 'optimize', 'algorithm', 'architecture', 'framework'];
    const techTermCount = technicalTerms.filter(term => prompt.toLowerCase().includes(term)).length;
    complexity += techTermCount * 0.1;
    
    // Sentence complexity
    const sentences = prompt.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
      complexity += Math.min(0.2, avgSentenceLength / 100);
    }
    
    return Math.min(1.0, complexity);
  }

  private async checkRepeatedUse(approach: string, userData: any): Promise<boolean> {
    const recentSelections = userData.selections
      .filter((s: any) => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
      .map((s: any) => s.approach);
    
    const recentUseCount = recentSelections.filter((a: string) => a === approach).length;
    return recentUseCount >= 2; // Used 2+ times recently
  }

  private calculateLearningConfidence(selections: any[]): number {
    if (selections.length < 5) return 0.3; // Low confidence with few selections
    
    // Calculate consistency in approach preferences
    const approaches: Record<string, number> = {};
    selections.forEach(s => {
      approaches[s.approach] = (approaches[s.approach] || 0) + 1;
    });
    
    // Higher confidence if user has clear preferences
    const maxCount = Math.max(...Object.values(approaches));
    const totalCount = selections.length;
    const dominanceRatio = maxCount / totalCount;
    
    // Scale confidence based on sample size and preference consistency
    const sampleSizeConfidence = Math.min(1.0, selections.length / 20);
    const consistencyConfidence = dominanceRatio > 0.5 ? dominanceRatio : 0.5;
    
    return (sampleSizeConfidence * 0.6 + consistencyConfidence * 0.4);
  }

  private async notifyAdaptiveEngine(selectionRecord: any, userData: any): Promise<void> {
    try {
      // Store selection event for adaptive engine consumption
      const adaptiveSelection = {
        timestamp: selectionRecord.timestamp,
        templateType: this.mapApproachToTemplateType(selectionRecord.approach),
        originalPrompt: selectionRecord.originalPrompt,
        selectedTemplate: selectionRecord.candidateId,
        alternativesShown: [], // Would need to track alternatives shown
        selectionTime: selectionRecord.selectionTime,
        contextTags: selectionRecord.contextTags,
        domain: this.detectDomain(selectionRecord.originalPrompt),
        promptComplexity: selectionRecord.promptComplexity,
        userSatisfactionIndicators: selectionRecord.userSatisfactionIndicators
      };

      // Store for adaptive engine to process
      const adaptiveData = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_adaptive_selections'], resolve);
      });
      const adaptiveSelections = adaptiveData.promptlint_adaptive_selections || [];
      adaptiveSelections.push(adaptiveSelection);
      
      // Keep last 50 adaptive selections
      if (adaptiveSelections.length > 50) {
        adaptiveSelections.splice(0, adaptiveSelections.length - 50);
      }
      
      await chrome.storage.local.set({ promptlint_adaptive_selections: adaptiveSelections });
      
    } catch (error) {
      console.warn('[PromptLint] Failed to notify adaptive engine:', error);
    }
  }

  private mapApproachToTemplateType(approach: string): string {
    const mapping: Record<string, string> = {
      'structured': 'task_io',
      'conversational': 'minimal',
      'imperative': 'sequential',
      'clarifying': 'bullet',
      'detailed': 'task_io'
    };
    return mapping[approach] || 'task_io';
  }

  private detectDomain(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('code') || lowerPrompt.includes('program')) return 'coding';
    if (lowerPrompt.includes('data') || lowerPrompt.includes('analysis')) return 'data-analysis';
    if (lowerPrompt.includes('design') || lowerPrompt.includes('ui')) return 'design';
    if (lowerPrompt.includes('write') || lowerPrompt.includes('content')) return 'writing';
    if (lowerPrompt.includes('business') || lowerPrompt.includes('strategy')) return 'business';
    
    return 'general';
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('[PromptLint] Text copied to clipboard');
    } catch (err) {
      console.warn('[PromptLint] Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private showCopyFeedback(button: HTMLButtonElement): void {
    const originalText = button.textContent;
    button.textContent = '✓ Copied';
    button.style.background = '#10b981';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  }

  private getApproachColor(approach: string): string {
    const colors = {
      structured: '#3b82f6',    // Blue
      conversational: '#10b981', // Green
      imperative: '#f59e0b',    // Amber
      clarifying: '#8b5cf6',    // Purple
      detailed: '#ef4444'       // Red
    };
    return colors[approach as keyof typeof colors] || '#6b7280'; // Gray fallback
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private initializeDrag(dragHandle: HTMLElement): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = this.panel!.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Direct mouse following for better responsiveness
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;
      
      // Constrain to viewport with immediate feedback
      const panelWidth = this.panel!.offsetWidth;
      const panelHeight = this.panel!.offsetHeight;
      const maxLeft = window.innerWidth - panelWidth;
      const maxTop = window.innerHeight - panelHeight;
      
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      
      // Apply position immediately without transition during drag
      this.panel!.style.transition = 'none';
      this.panel!.style.left = `${newLeft}px`;
      this.panel!.style.top = `${newTop}px`;
      this.panel!.style.right = 'auto';
      this.panel!.style.bottom = 'auto';
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Restore transition
        this.panel!.style.transition = `all ${this.options.animationDuration}ms ease`;
        
        // Save position
        this.savePosition();
      }
    };

    dragHandle.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  private savePosition(): void {
    if (!this.panel) return;
    
    const rect = this.panel.getBoundingClientRect();
    const position = {
      left: rect.left,
      top: rect.top,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem('promptlint-panel-position', JSON.stringify(position));
    } catch (error) {
      console.warn('[PromptLint] Failed to save panel position:', error);
    }
  }

  private loadPosition(): void {
    if (!this.panel) return;
    
    try {
      const saved = sessionStorage.getItem('promptlint-panel-position');
      if (saved) {
        const position = JSON.parse(saved);
        const age = Date.now() - position.timestamp;
        
        // Only restore if saved within last 24 hours
        if (age < 24 * 60 * 60 * 1000) {
          this.panel.style.left = `${position.left}px`;
          this.panel.style.top = `${position.top}px`;
          this.panel.style.right = 'auto';
          this.panel.style.bottom = 'auto';
        }
      }
    } catch (error) {
      console.warn('[PromptLint] Failed to load panel position:', error);
    }
  }

  private toggleRephraseMode(): void {
    if (this.isRephraseMode) {
      this.hideRephrase();
      if (this.rephraseToggleButton) {
        this.rephraseToggleButton.innerHTML = `
          <span class="rephrase-icon">✨</span>
          <span class="rephrase-text">Rephrase</span>
        `;
        this.rephraseToggleButton.classList.remove('active');
      }
    } else {
      if (this.currentPrompt && this.rephraseCallbacks.onRephraseRequest) {
        // Record start time for selection tracking
        this.rephraseStartTime = Date.now();
        this.handleRephraseClick();
        if (this.rephraseToggleButton) {
          this.rephraseToggleButton.innerHTML = `
            <span class="rephrase-icon">⬆</span>
            <span class="rephrase-text">Collapse</span>
          `;
          this.rephraseToggleButton.classList.add('active');
        }
      }
    }
  }

  private formatRephraseText(text: string): string {
    console.log('[PromptLint DEBUG] formatRephraseText input:', text);
    console.log('[PromptLint DEBUG] formatRephraseText line breaks in input:', (text.match(/\n/g) || []).length);
    
    // Convert **text** to <strong>text</strong> and add structure
    let formatted = this.escapeHtml(text);
    
    // Convert line breaks to <br> tags for visual breaks (single spacing)
    formatted = formatted.replace(/\n\n/g, '<br>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convert markdown bold to HTML
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Add visual structure for common sections with consistent bold formatting
    formatted = formatted.replace(/^(\*\*Task\*\*:)/gm, '<div class="rephrase-section"><strong>Task:</strong>');
    formatted = formatted.replace(/^(\*\*Input\*\*:)/gm, '</div><div class="rephrase-section"><strong>Input:</strong>');
    formatted = formatted.replace(/^(\*\*Output\*\*:)/gm, '</div><div class="rephrase-section"><strong>Output:</strong>');
    formatted = formatted.replace(/^(\*\*Additional Context\*\*:)/gm, '</div><div class="rephrase-section"><strong>Additional Context:</strong>');
    formatted = formatted.replace(/^(\*\*Requirements\*\*:)/gm, '</div><div class="rephrase-section"><strong>Requirements:</strong>');
    
    // Apply consistent bold formatting to conversational and imperative patterns
    formatted = formatted.replace(/^(\*\*What I want to accomplish\*\*:)/gm, '<div class="rephrase-section"><strong>What I want to accomplish:</strong>');
    formatted = formatted.replace(/^(\*\*What I'm working with\*\*:)/gm, '</div><div class="rephrase-section"><strong>What I\'m working with:</strong>');
    formatted = formatted.replace(/^(\*\*How I want the result\*\*:)/gm, '</div><div class="rephrase-section"><strong>How I want the result:</strong>');
    formatted = formatted.replace(/^(\*\*Any constraints\*\*:)/gm, '</div><div class="rephrase-section"><strong>Any constraints:</strong>');
    
    // Imperative patterns
    formatted = formatted.replace(/^(\*\*First step\*\*:)/gm, '<div class="rephrase-section"><strong>First step:</strong>');
    formatted = formatted.replace(/^(\*\*Second step\*\*:)/gm, '</div><div class="rephrase-section"><strong>Second step:</strong>');
    formatted = formatted.replace(/^(\*\*Third step\*\*:)/gm, '</div><div class="rephrase-section"><strong>Third step:</strong>');
    formatted = formatted.replace(/^(\*\*Final step\*\*:)/gm, '</div><div class="rephrase-section"><strong>Final step:</strong>');
    formatted = formatted.replace(/^(\*\*Requirements\*\*:)/gm, '</div><div class="rephrase-section"><strong>Requirements:</strong>');
    
    // Close any open section
    if (formatted.includes('<div class="rephrase-section">')) {
      formatted += '</div>';
    }
    
    console.log('[PromptLint DEBUG] formatRephraseText output:', formatted);
    console.log('[PromptLint DEBUG] formatRephraseText <br> tags in output:', (formatted.match(/<br>/g) || []).length);
    
    return formatted;
  }

  private hideRephrase(): void {
    if (this.rephraseContainer) {
      this.rephraseContainer.style.display = 'none';
    }
    
    // Remove rephrase mode class to restore normal panel size
    if (this.panel) {
      this.panel.classList.remove('promptlint-panel--rephrase-mode');
    }
    
    this.isRephraseMode = false;
  }

  private showRephraseError(message: string): void {
    if (!this.rephraseContainer) return;

    this.rephraseContainer.innerHTML = `
      <div class="promptlint-rephrase__error">
        <h4>Rephrase Failed</h4>
        <p>${this.escapeHtml(message)}</p>
        <button class="promptlint-rephrase__close">Close</button>
      </div>
    `;
    this.rephraseContainer.style.display = 'block';

    const closeBtn = this.rephraseContainer.querySelector('.promptlint-rephrase__close') as HTMLElement;
    closeBtn?.addEventListener('click', () => this.hideRephrase());
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updatePrompt(prompt: string): void {
    this.currentPrompt = prompt;
    
    // Reset score to 0 if prompt is empty
    if (!prompt || prompt.trim().length === 0) {
      this.updateScore(0);
    }
    
    // Show/hide rephrase button based on prompt content and score
    if (this.rephraseButton) {
      const shouldShowRephrase = prompt.length > 10 && this.options.enableRephrase;
      this.rephraseButton.style.display = shouldShowRephrase ? 'block' : 'none';
    }
  }

  private toggleAiAgentDropdown(): void {
    if (!this.aiAgentDropdownMenu) return;
    
    this.isDropdownOpen = !this.isDropdownOpen;
    
    if (this.isDropdownOpen) {
      this.aiAgentDropdownMenu.style.display = 'block';
      this.aiAgentDropdown?.classList.add('open');
      
      // Position dropdown outside panel to avoid clipping
      this.positionDropdownOutsidePanel();
      
      // Add click outside listener
      setTimeout(() => {
        document.addEventListener('click', this.handleClickOutside.bind(this), { once: true });
      }, 0);
    } else {
      this.closeAiAgentDropdown();
    }
  }

  private positionDropdownOutsidePanel(): void {
    if (!this.aiAgentDropdown || !this.aiAgentDropdownMenu || !this.panel) return;
    
    // Get the position of the AI agent dropdown relative to the viewport
    const dropdownRect = this.aiAgentDropdown.getBoundingClientRect();
    
    // Calculate position relative to document body
    const left = dropdownRect.left;
    const top = dropdownRect.bottom + 4; // 4px gap
    
    // Check if dropdown would go off-screen to the right
    const dropdownWidth = 200; // min-width from CSS
    const viewportWidth = window.innerWidth;
    const adjustedLeft = left + dropdownWidth > viewportWidth ? viewportWidth - dropdownWidth - 8 : left;
    
    // Check if dropdown would go off-screen to the bottom
    const dropdownHeight = 300; // max-height from CSS
    const viewportHeight = window.innerHeight;
    const adjustedTop = top + dropdownHeight > viewportHeight ? dropdownRect.top - dropdownHeight - 4 : top;
    
    // Position the dropdown relative to document body
    this.aiAgentDropdownMenu.style.position = 'fixed';
    this.aiAgentDropdownMenu.style.left = `${adjustedLeft}px`;
    this.aiAgentDropdownMenu.style.top = `${adjustedTop}px`;
    this.aiAgentDropdownMenu.style.right = 'auto';
    this.aiAgentDropdownMenu.style.bottom = 'auto';
    this.aiAgentDropdownMenu.style.zIndex = '2147483647';
    
    // Move dropdown to document body to avoid clipping
    if (this.aiAgentDropdownMenu.parentElement !== document.body) {
      document.body.appendChild(this.aiAgentDropdownMenu);
    }
  }

  private closeAiAgentDropdown(): void {
    if (!this.aiAgentDropdownMenu) return;
    
    this.isDropdownOpen = false;
    this.aiAgentDropdownMenu.style.display = 'none';
    this.aiAgentDropdown?.classList.remove('open');
    
    // Reset dropdown positioning and move back to original parent if needed
    this.aiAgentDropdownMenu.style.position = 'absolute';
    this.aiAgentDropdownMenu.style.left = '0';
    this.aiAgentDropdownMenu.style.top = '100%';
    this.aiAgentDropdownMenu.style.right = 'auto';
    this.aiAgentDropdownMenu.style.bottom = 'auto';
    this.aiAgentDropdownMenu.style.zIndex = '2147483647';
    
    // Move dropdown back to AI agent dropdown if it was moved to body
    if (this.aiAgentDropdownMenu.parentElement === document.body && this.aiAgentDropdown) {
      this.aiAgentDropdown.appendChild(this.aiAgentDropdownMenu);
    }
  }

  private handleClickOutside(event: MouseEvent): void {
    if (this.aiAgentDropdown && !this.aiAgentDropdown.contains(event.target as Node)) {
      this.closeAiAgentDropdown();
    }
  }

  private selectAiAgent(agentId: string, agentName: string): void {
    this.selectedAiAgent = agentName;
    
    // Update the displayed text
    const textElement = this.aiAgentDropdown?.querySelector('.ai-agent-text');
    if (textElement) {
      textElement.textContent = agentName;
    }
    
    // Close dropdown
    this.closeAiAgentDropdown();
    
    // Log selection (for future functionality)
    console.log(`[PromptLint] AI Agent selected: ${agentName} (${agentId})`);
    
    // TODO: Implement actual functionality change based on selection
  }


  async cleanup(): Promise<void> {
    // Close dropdown if open
    if (this.isDropdownOpen) {
      this.closeAiAgentDropdown();
    }
    
    // Remove dropdown from body if it's there
    if (this.aiAgentDropdownMenu && this.aiAgentDropdownMenu.parentElement === document.body) {
      this.aiAgentDropdownMenu.remove();
    }
    
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }

    const styleElement = document.getElementById('promptlint-panel-styles');
    if (styleElement) {
      styleElement.remove();
    }

    this.scoreElement = null;
    this.issuesContainer = null;
    this.aiAgentDropdown = null;
    this.aiAgentDropdownMenu = null;
    this.isVisible = false;

    console.log('[PromptLint] Floating panel cleaned up');
  }

  private async runLevel4Analysis(prompt: string): Promise<void> {
    try {
      const analysis = await this.level4Service.enhancePromptWithContextualIntelligence(prompt);
      this.displayLevel4Insights(analysis.contextualInsights, analysis.optimizationSuggestions);
    } catch (error) {
      console.warn('[FloatingPanel] Level 4 analysis failed:', error);
    }
  }

  /**
   * Run Level 5 unified analysis with advanced intelligence
   */
  private async runLevel5Analysis(prompt: string, lintResult: LintResult): Promise<void> {
    if (!this.level5Experience) {
      console.warn('[FloatingPanel] Level 5 experience not available');
      return;
    }

    try {
      console.log('[FloatingPanel] Running Level 5 unified analysis...');
      
      // Get unified assistance from Level 5
      const unifiedResult = await this.level5Experience.provideUnifiedAssistance(prompt, {
        platform: window.location.hostname,
        url: window.location.href,
        lintScore: lintResult.score,
        issues: lintResult.issues
      });

      // Display Level 5 insights
      this.displayLevel5Insights(unifiedResult);
      
      console.log('[FloatingPanel] Level 5 analysis completed:', unifiedResult);
    } catch (error) {
      console.warn('[FloatingPanel] Level 5 analysis failed:', error);
    }
  }

  private displayLevel4Insights(insights: any, suggestions: string[]): void {
    if (!this.panel) return;

    // Find or create Level 4 insights container
    let insightsContainer = this.panel.querySelector('.level4-insights') as HTMLElement;
    if (!insightsContainer) {
      insightsContainer = document.createElement('div');
      insightsContainer.className = 'level4-insights';
      insightsContainer.innerHTML = `
        <div class="insights-header">
          <span class="insights-icon">🧠</span>
          <span class="insights-title">Contextual Intelligence</span>
          <span class="insights-confidence"></span>
        </div>
        <div class="insights-content"></div>
      `;
      
      // Insert after issues container
      const issuesContainer = this.panel.querySelector('.issues-container');
      if (issuesContainer) {
        issuesContainer.insertAdjacentElement('afterend', insightsContainer);
      } else {
        this.panel.appendChild(insightsContainer);
      }
    }

    // Update insights content
    const confidenceElement = insightsContainer.querySelector('.insights-confidence') as HTMLElement;
    const contentElement = insightsContainer.querySelector('.insights-content') as HTMLElement;

    if (confidenceElement) {
      confidenceElement.textContent = `${Math.round(insights.confidence * 100)}%`;
      confidenceElement.className = `insights-confidence ${insights.confidence > 0.8 ? 'high' : insights.confidence > 0.6 ? 'medium' : 'low'}`;
    }

    if (contentElement) {
      contentElement.innerHTML = `
        <div class="insight-item">
          <span class="insight-label">Intent:</span>
          <span class="insight-value">${insights.intent}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Complexity:</span>
          <span class="insight-value">${insights.complexity}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Style:</span>
          <span class="insight-value">${insights.style}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Processing:</span>
          <span class="insight-value">${insights.processingTime.toFixed(1)}ms</span>
        </div>
        ${suggestions.length > 0 ? `
          <div class="optimization-suggestions">
            <div class="suggestions-title">Optimizations:</div>
            ${suggestions.map(suggestion => `<div class="suggestion-item">• ${suggestion}</div>`).join('')}
          </div>
        ` : ''}
      `;
    }

    // Add Level 4 specific styles
    this.addLevel4Styles();
  }

  private addLevel4Styles(): void {
    if (document.querySelector('#promptlint-level4-styles')) return;

    const style = document.createElement('style');
    style.id = 'promptlint-level4-styles';
    style.textContent = `
      .level4-insights {
        margin-top: 12px;
        padding: 12px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }

      .insights-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .insights-icon {
        font-size: 16px;
      }

      .insights-title {
        color: #1e293b;
        font-size: 13px;
      }

      .insights-confidence {
        margin-left: auto;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }

      .insights-confidence.high {
        background: #dcfce7;
        color: #166534;
      }

      .insights-confidence.medium {
        background: #fef3c7;
        color: #92400e;
      }

      .insights-confidence.low {
        background: #fee2e2;
        color: #991b1b;
      }

      .insights-content {
        font-size: 12px;
      }

      .insight-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .insight-label {
        color: #64748b;
        font-weight: 500;
      }

      .insight-value {
        color: #1e293b;
        font-weight: 400;
      }

      .optimization-suggestions {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e2e8f0;
      }

      .suggestions-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .suggestion-item {
        color: #475569;
        font-size: 11px;
        margin-bottom: 2px;
        line-height: 1.3;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Capture user interaction in Level 5 memory system
   */
  private async captureInteractionInMemory(prompt: string, lintResult: LintResult): Promise<void> {
    try {
      const interactionData: ExtensionInteractionData = {
        prompt,
        response: this.generateResponseSummary(lintResult),
        platform: this.detectPlatform(),
        url: window.location.href,
        timestamp: Date.now(),
        level4Analysis: undefined // Will be populated when Level 4 analysis completes
      };

      await this.memoryIntegration.captureUserInteraction(interactionData);
      
    } catch (error) {
      console.warn('[FloatingPanel] Failed to capture interaction in memory:', error);
    }
  }

  private generateResponseSummary(lintResult: LintResult): string {
    const issues = lintResult?.issues?.length || 0;
    const score = lintResult?.score || 0;
    
    if (issues === 0) {
      return `Prompt analysis complete. Score: ${score}/100. No issues found.`;
    } else {
      return `Prompt analysis complete. Score: ${score}/100. Found ${issues} issue${issues > 1 ? 's' : ''}.`;
    }
  }

  /**
   * Display Level 5 unified intelligence insights
   */
  private displayLevel5Insights(unifiedResult: any): void {
    if (!this.panel || !unifiedResult) return;

    // Find or create Level 5 insights container
    let insightsContainer = this.panel.querySelector('.level5-insights') as HTMLElement;
    if (!insightsContainer) {
      insightsContainer = document.createElement('div');
      insightsContainer.className = 'level5-insights';
      insightsContainer.innerHTML = `
        <div class="insights-header">
          <span class="insights-icon">🚀</span>
          <span class="insights-title">Advanced Intelligence</span>
          <span class="insights-confidence"></span>
        </div>
        <div class="insights-content"></div>
        <div class="ghost-text-container" style="display: none;"></div>
      `;
      
      // Insert after Level 4 insights or issues container
      const level4Container = this.panel.querySelector('.level4-insights');
      const issuesContainer = this.panel.querySelector('.issues-container');
      const insertAfter = level4Container || issuesContainer;
      
      if (insertAfter) {
        insertAfter.insertAdjacentElement('afterend', insightsContainer);
      } else {
        this.panel.appendChild(insightsContainer);
      }
    }

    // Update insights content
    const confidenceElement = insightsContainer.querySelector('.insights-confidence') as HTMLElement;
    const contentElement = insightsContainer.querySelector('.insights-content') as HTMLElement;
    const ghostTextContainer = insightsContainer.querySelector('.ghost-text-container') as HTMLElement;

    if (confidenceElement) {
      const confidence = unifiedResult.confidence || 0;
      confidenceElement.textContent = `${Math.round(confidence * 100)}%`;
      confidenceElement.className = `insights-confidence ${confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'}`;
    }

    if (contentElement) {
      contentElement.innerHTML = `
        <div class="insight-item">
          <span class="insight-label">Primary:</span>
          <span class="insight-value">${unifiedResult.primarySuggestion || 'No suggestion available'}</span>
        </div>
        <div class="insight-item">
          <span class="insight-label">Processing:</span>
          <span class="insight-value">${(unifiedResult.processingTime || 0).toFixed(1)}ms</span>
        </div>
        ${unifiedResult.alternatives && unifiedResult.alternatives.length > 0 ? `
          <div class="alternatives-container">
            <div class="alternatives-title">Alternatives:</div>
            ${unifiedResult.alternatives.slice(0, 2).map((alt: string) => 
              `<div class="alternative-item">• ${alt || 'Alternative suggestion'}</div>`
            ).join('')}
          </div>
        ` : ''}
        ${unifiedResult.reasoning ? `
          <div class="reasoning-container">
            <div class="reasoning-title">Reasoning:</div>
            <div class="reasoning-text">${unifiedResult.reasoning}</div>
          </div>
        ` : ''}
      `;
    }

    // Show ghost text if available (placeholder for future implementation)
    if (ghostTextContainer && unifiedResult.ghostText) {
      ghostTextContainer.style.display = 'block';
      ghostTextContainer.innerHTML = `
        <div class="ghost-text-title">💭 Suggested completions:</div>
        <div class="ghost-text-items">
          ${unifiedResult.ghostText.map((text: string) => 
            `<div class="ghost-text-item">${text}</div>`
          ).join('')}
        </div>
      `;
    }

    // Add Level 5 specific styles
    this.addLevel5Styles();
  }

  /**
   * Add Level 5 specific CSS styles
   */
  private addLevel5Styles(): void {
    if (document.querySelector('#promptlint-level5-styles')) return;

    const style = document.createElement('style');
    style.id = 'promptlint-level5-styles';
    style.textContent = `
      .level5-insights {
        margin-top: 12px;
        padding: 12px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 8px;
        border: 1px solid #0ea5e9;
        box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
      }

      .level5-insights .insights-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 600;
        color: #0c4a6e;
      }

      .level5-insights .insights-icon {
        font-size: 16px;
      }

      .level5-insights .insights-title {
        flex: 1;
        font-size: 13px;
      }

      .level5-insights .insights-confidence {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }

      .level5-insights .insights-confidence.high {
        background: #dcfce7;
        color: #166534;
      }

      .level5-insights .insights-confidence.medium {
        background: #fef3c7;
        color: #92400e;
      }

      .level5-insights .insights-confidence.low {
        background: #fee2e2;
        color: #991b1b;
      }

      .level5-insights .insight-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 12px;
        border-bottom: 1px solid rgba(14, 165, 233, 0.1);
      }

      .level5-insights .insight-item:last-child {
        border-bottom: none;
      }

      .level5-insights .insight-label {
        font-weight: 500;
        color: #0c4a6e;
        min-width: 60px;
      }

      .level5-insights .insight-value {
        color: #0369a1;
        text-align: right;
        flex: 1;
        margin-left: 8px;
      }

      .level5-insights .alternatives-container,
      .level5-insights .reasoning-container {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(14, 165, 233, 0.2);
      }

      .level5-insights .alternatives-title,
      .level5-insights .reasoning-title {
        font-size: 11px;
        font-weight: 600;
        color: #0c4a6e;
        margin-bottom: 4px;
      }

      .level5-insights .alternative-item {
        font-size: 11px;
        color: #0369a1;
        margin: 2px 0;
        padding-left: 8px;
      }

      .level5-insights .reasoning-text {
        font-size: 11px;
        color: #0369a1;
        line-height: 1.4;
        font-style: italic;
      }

      .level5-insights .ghost-text-container {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(14, 165, 233, 0.2);
      }

      .level5-insights .ghost-text-title {
        font-size: 11px;
        font-weight: 600;
        color: #0c4a6e;
        margin-bottom: 4px;
      }

      .level5-insights .ghost-text-item {
        font-size: 11px;
        color: #0369a1;
        background: rgba(14, 165, 233, 0.1);
        padding: 4px 8px;
        margin: 2px 0;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .level5-insights .ghost-text-item:hover {
        background: rgba(14, 165, 233, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  private detectPlatform(): string {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
    if (hostname.includes('docs.google.com')) return 'Google Docs';
    if (hostname.includes('notion.so')) return 'Notion';
    if (hostname.includes('slack.com')) return 'Slack';
    if (hostname.includes('discord.com')) return 'Discord';
    if (hostname.includes('figma.com')) return 'Figma';
    if (hostname.includes('openai.com') || hostname.includes('chat.openai.com')) return 'ChatGPT';
    if (hostname.includes('claude.ai')) return 'Claude';
    if (hostname.includes('bard.google.com')) return 'Bard';
    
    return 'Web Browser';
  }
}

