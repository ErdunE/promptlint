/**
 * PromptLint Floating Panel Component
 * 
 * Displays real-time lint results in a non-intrusive floating panel
 * Shows quality scores (0-100) and specific improvement suggestions
 */

import { LintResult, LintIssue } from '@promptlint/shared-types';

export interface FloatingPanelOptions {
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
  autoHide?: boolean;
  animationDuration?: number;
}

export class FloatingPanel {
  private panel: HTMLElement | null = null;
  private scoreElement: HTMLElement | null = null;
  private issuesContainer: HTMLElement | null = null;
  private isVisible = false;
  private options: Required<FloatingPanelOptions>;

  constructor(options: FloatingPanelOptions = {}) {
    this.options = {
      position: options.position || 'bottom-right',
      autoHide: options.autoHide !== false,
      animationDuration: options.animationDuration || 200
    };
  }

  async initialize(): Promise<void> {
    try {
      this.createPanel();
      this.attachStyles();
      console.log('[PromptLint] Floating panel initialized');
    } catch (error) {
      console.error('[PromptLint] Failed to initialize floating panel:', error);
      throw error;
    }
  }

  private createPanel(): void {
    // Create main panel container
    this.panel = document.createElement('div');
    this.panel.id = 'promptlint-floating-panel';
    this.panel.className = `promptlint-panel promptlint-panel--${this.options.position}`;
    
    // Create header with score
    const header = document.createElement('div');
    header.className = 'promptlint-panel__header';
    
    const title = document.createElement('div');
    title.className = 'promptlint-panel__title';
    title.textContent = 'PromptLint';
    
    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'promptlint-panel__score';
    this.scoreElement.textContent = '--';
    
    header.appendChild(title);
    header.appendChild(this.scoreElement);
    
    // Create issues container
    this.issuesContainer = document.createElement('div');
    this.issuesContainer.className = 'promptlint-panel__issues';
    
    // Create collapse/expand button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'promptlint-panel__toggle';
    toggleButton.innerHTML = '−';
    toggleButton.addEventListener('click', () => this.toggleCollapse());
    
    header.appendChild(toggleButton);
    
    // Assemble panel
    this.panel.appendChild(header);
    this.panel.appendChild(this.issuesContainer);
    
    // Add to DOM (initially hidden)
    this.panel.style.display = 'none';
    document.body.appendChild(this.panel);
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
  }

  private getPanelCSS(): string {
    return `
      .promptlint-panel {
        position: fixed;
        z-index: 10000;
        background: #ffffff;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 280px;
        max-width: 320px;
        transition: all ${this.options.animationDuration}ms ease;
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
        background: #f8f9fa;
        border-bottom: 1px solid #e1e5e9;
        border-radius: 8px 8px 0 0;
      }

      .promptlint-panel__title {
        font-weight: 600;
        color: #1a1a1a;
        font-size: 13px;
      }

      .promptlint-panel__score {
        font-weight: 700;
        font-size: 16px;
        padding: 4px 8px;
        border-radius: 4px;
        min-width: 32px;
        text-align: center;
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
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        color: #6c757d;
        border-radius: 2px;
      }

      .promptlint-panel__toggle:hover {
        background: #e9ecef;
      }

      .promptlint-panel__issues {
        padding: 0;
        max-height: 300px;
        overflow-y: auto;
      }

      .promptlint-panel__issue {
        padding: 12px 16px;
        border-bottom: 1px solid #f1f3f4;
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
        background: #dc3545;
      }

      .promptlint-panel__issue-icon--medium {
        background: #ffc107;
      }

      .promptlint-panel__issue-icon--low {
        background: #17a2b8;
      }

      .promptlint-panel__issue-content {
        flex: 1;
      }

      .promptlint-panel__issue-title {
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 2px;
        font-size: 13px;
      }

      .promptlint-panel__issue-description {
        color: #6c757d;
        font-size: 12px;
        line-height: 1.4;
      }

      .promptlint-panel__no-issues {
        padding: 16px;
        text-align: center;
        color: #28a745;
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
    `;
  }

  updateResults(result: LintResult): void {
    if (!this.panel || !this.scoreElement || !this.issuesContainer) {
      console.warn('[PromptLint] Panel not initialized');
      return;
    }

    // Update score
    this.updateScore(result.score);
    
    // Update issues
    this.updateIssues(result.issues);
    
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
    
    // Add appropriate score class
    if (score >= 85) {
      this.scoreElement.classList.add('promptlint-panel__score--excellent');
    } else if (score >= 70) {
      this.scoreElement.classList.add('promptlint-panel__score--good');
    } else if (score >= 50) {
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
      
      this.issuesContainer.appendChild(issueElement);
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

  async cleanup(): Promise<void> {
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
    this.isVisible = false;

    console.log('[PromptLint] Floating panel cleaned up');
  }
}
