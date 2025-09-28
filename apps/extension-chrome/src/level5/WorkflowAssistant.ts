/**
 * Workflow Assistant for Proactive UI Suggestions
 * Provides non-intrusive workflow guidance and context-aware assistance
 * Integrates with Chrome Extension UI for seamless user experience
 */

import { 
  WorkflowState, 
  WorkflowPrediction, 
  WorkflowSuggestion,
  ProactiveAssistanceConfig,
  SuggestionFeedback
} from '@promptlint/level5-predictive';

export interface WorkflowAssistantConfig extends ProactiveAssistanceConfig {
  uiPosition: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  animationDuration: number;
  maxSuggestionWidth: number;
  enableSoundNotifications: boolean;
  respectUserFocus: boolean;
}

export interface WorkflowBanner {
  id: string;
  element: HTMLElement;
  suggestion: WorkflowSuggestion;
  showTime: number;
  isVisible: boolean;
}

export class WorkflowAssistant {
  private config: WorkflowAssistantConfig;
  private activeBanners: Map<string, WorkflowBanner> = new Map();
  private suggestionHistory: SuggestionFeedback[] = [];
  private isUserFocused: boolean = true;
  private lastSuggestionTime: number = 0;

  constructor(config: Partial<WorkflowAssistantConfig> = {}) {
    this.config = {
      enableProactiveSuggestions: true,
      suggestionFrequency: 'normal',
      confidenceThreshold: 0.75,
      maxSimultaneousSuggestions: 2,
      respectFocusMode: true,
      uiPosition: 'bottom-right',
      animationDuration: 300,
      maxSuggestionWidth: 350,
      enableSoundNotifications: false,
      respectUserFocus: true,
      ...config
    };

    this.initializeUserFocusTracking();
    this.initializeStyles();
  }

  /**
   * Show proactive workflow suggestion with non-intrusive banner
   * Respects user focus and suggestion frequency settings
   */
  async showProactiveSuggestion(suggestion: WorkflowSuggestion): Promise<void> {
    if (!this.config.enableProactiveSuggestions) {
      console.log('[WorkflowAssistant] Proactive suggestions disabled');
      return;
    }

    // Respect user focus mode
    if (this.config.respectUserFocus && !this.isUserFocused) {
      console.log('[WorkflowAssistant] User not focused, deferring suggestion');
      return;
    }

    // Check suggestion frequency limits
    if (!this.shouldShowSuggestion(suggestion)) {
      console.log('[WorkflowAssistant] Suggestion frequency limit reached');
      return;
    }

    // Check confidence threshold
    if (suggestion.confidence < this.config.confidenceThreshold) {
      console.log(`[WorkflowAssistant] Suggestion confidence ${suggestion.confidence} below threshold ${this.config.confidenceThreshold}`);
      return;
    }

    // Check maximum simultaneous suggestions
    if (this.activeBanners.size >= this.config.maxSimultaneousSuggestions) {
      console.log('[WorkflowAssistant] Maximum simultaneous suggestions reached');
      return;
    }

    try {
      console.log(`[WorkflowAssistant] Showing proactive suggestion: ${suggestion.title}`);

      // Create and show banner
      const banner = await this.createSuggestionBanner(suggestion);
      this.activeBanners.set(suggestion.id, banner);

      // Schedule auto-hide if configured
      if (suggestion.timing.hideAfter > 0) {
        setTimeout(() => {
          this.hideSuggestion(suggestion.id, 'auto_hide');
        }, suggestion.timing.hideAfter);
      }

      // Play notification sound if enabled
      if (this.config.enableSoundNotifications) {
        this.playNotificationSound();
      }

      this.lastSuggestionTime = Date.now();

    } catch (error) {
      console.error('[WorkflowAssistant] Failed to show proactive suggestion:', error);
    }
  }

  /**
   * Generate workflow-aware ghost text based on current workflow state
   * Provides context-sensitive autocomplete suggestions
   */
  async generateWorkflowGhostText(
    partialInput: string,
    workflowState: WorkflowState
  ): Promise<string> {
    const startTime = performance.now();

    try {
      console.log(`[WorkflowAssistant] Generating workflow ghost text for "${partialInput}" in ${workflowState.phase} phase`);

      // Phase-specific ghost text completions
      const phaseCompletions = this.getPhaseSpecificCompletions(partialInput, workflowState.phase);
      
      // Context-aware completions based on workflow metadata
      const contextCompletions = this.getContextAwareCompletions(partialInput, workflowState);
      
      // Combine and select best completion
      const allCompletions = [...phaseCompletions, ...contextCompletions];
      const bestCompletion = this.selectBestCompletion(partialInput, allCompletions);

      const generationTime = performance.now() - startTime;
      console.log(`[WorkflowAssistant] Generated workflow ghost text in ${generationTime.toFixed(2)}ms: "${bestCompletion}"`);

      return bestCompletion;

    } catch (error) {
      console.error('[WorkflowAssistant] Workflow ghost text generation failed:', error);
      return '';
    }
  }

  /**
   * Show workflow prediction with multi-step preview
   * Displays next 2-3 predicted workflow steps
   */
  async showWorkflowPrediction(prediction: WorkflowPrediction): Promise<void> {
    if (prediction.confidence < 0.65) {
      console.log(`[WorkflowAssistant] Prediction confidence ${prediction.confidence} too low for display`);
      return;
    }

    try {
      console.log(`[WorkflowAssistant] Showing workflow prediction with ${prediction.sequence.length} steps`);

      const predictionBanner = await this.createPredictionBanner(prediction);
      this.activeBanners.set(prediction.id, predictionBanner);

      // Auto-hide after 15 seconds
      setTimeout(() => {
        this.hideSuggestion(prediction.id, 'auto_hide');
      }, 15000);

    } catch (error) {
      console.error('[WorkflowAssistant] Failed to show workflow prediction:', error);
    }
  }

  /**
   * Record user feedback on suggestions for learning
   */
  recordSuggestionFeedback(
    suggestionId: string,
    action: 'accepted' | 'dismissed' | 'ignored' | 'modified',
    outcome?: 'helpful' | 'neutral' | 'disruptive'
  ): void {
    const feedback: SuggestionFeedback = {
      suggestionId,
      action,
      timestamp: Date.now(),
      context: this.getCurrentWorkflowContext(),
      outcome
    };

    this.suggestionHistory.push(feedback);

    // Keep only last 100 feedback entries
    if (this.suggestionHistory.length > 100) {
      this.suggestionHistory = this.suggestionHistory.slice(-100);
    }

    console.log(`[WorkflowAssistant] Recorded feedback: ${suggestionId} -> ${action} (${outcome || 'no outcome'})`);
  }

  /**
   * Get suggestion acceptance rate for analytics
   */
  getSuggestionAcceptanceRate(): number {
    if (this.suggestionHistory.length === 0) return 0;

    const acceptedCount = this.suggestionHistory.filter(f => f.action === 'accepted').length;
    return acceptedCount / this.suggestionHistory.length;
  }

  /**
   * Hide specific suggestion
   */
  hideSuggestion(suggestionId: string, reason: 'user_dismiss' | 'auto_hide' | 'replaced'): void {
    const banner = this.activeBanners.get(suggestionId);
    if (!banner) return;

    try {
      // Animate out
      banner.element.style.opacity = '0';
      banner.element.style.transform = this.getHideTransform();

      // Remove after animation
      setTimeout(() => {
        if (banner.element.parentNode) {
          banner.element.parentNode.removeChild(banner.element);
        }
        this.activeBanners.delete(suggestionId);
      }, this.config.animationDuration);

      // Record feedback if user dismissed
      if (reason === 'user_dismiss') {
        this.recordSuggestionFeedback(suggestionId, 'dismissed');
      }

      console.log(`[WorkflowAssistant] Hidden suggestion ${suggestionId} (${reason})`);

    } catch (error) {
      console.error('[WorkflowAssistant] Failed to hide suggestion:', error);
    }
  }

  /**
   * Clear all active suggestions
   */
  clearAllSuggestions(): void {
    const suggestionIds = Array.from(this.activeBanners.keys());
    suggestionIds.forEach(id => this.hideSuggestion(id, 'replaced'));
  }

  // Private helper methods

  private shouldShowSuggestion(suggestion: WorkflowSuggestion): boolean {
    const now = Date.now();

    // Check cooldown period
    const timeSinceLastSuggestion = now - this.lastSuggestionTime;
    const minInterval = this.getMinSuggestionInterval();
    
    if (timeSinceLastSuggestion < minInterval) {
      return false;
    }

    // Check if suggestion was shown recently
    const recentFeedback = this.suggestionHistory
      .filter(f => f.suggestionId === suggestion.id)
      .filter(f => now - f.timestamp < suggestion.timing.cooldown);

    if (recentFeedback.length > 0) {
      return false;
    }

    // Check max shows limit
    const totalShows = this.suggestionHistory
      .filter(f => f.suggestionId === suggestion.id).length;

    if (totalShows >= suggestion.timing.maxShows) {
      return false;
    }

    return true;
  }

  private async createSuggestionBanner(suggestion: WorkflowSuggestion): Promise<WorkflowBanner> {
    const banner = document.createElement('div');
    banner.className = 'promptlint-workflow-suggestion';
    banner.id = `promptlint-suggestion-${suggestion.id}`;

    // Set banner content
    banner.innerHTML = `
      <div class="suggestion-header">
        <div class="suggestion-icon">${this.getSuggestionIcon(suggestion.type)}</div>
        <div class="suggestion-title">${suggestion.title}</div>
        <button class="suggestion-close" data-action="dismiss">×</button>
      </div>
      <div class="suggestion-content">
        <p class="suggestion-description">${suggestion.description}</p>
        ${this.renderSuggestionActions(suggestion.actions)}
      </div>
      <div class="suggestion-footer">
        <span class="suggestion-confidence">${(suggestion.confidence * 100).toFixed(0)}% confidence</span>
        <div class="suggestion-buttons">
          <button class="suggestion-btn suggestion-btn-accept" data-action="accept">Accept</button>
          <button class="suggestion-btn suggestion-btn-dismiss" data-action="dismiss">Dismiss</button>
        </div>
      </div>
    `;

    // Position banner
    this.positionBanner(banner);

    // Add event listeners
    this.addBannerEventListeners(banner, suggestion);

    // Add to DOM with animation
    document.body.appendChild(banner);
    
    // Trigger animation
    requestAnimationFrame(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translateY(0)';
    });

    return {
      id: suggestion.id,
      element: banner,
      suggestion,
      showTime: Date.now(),
      isVisible: true
    };
  }

  private async createPredictionBanner(prediction: WorkflowPrediction): Promise<WorkflowBanner> {
    const banner = document.createElement('div');
    banner.className = 'promptlint-workflow-prediction';
    banner.id = `promptlint-prediction-${prediction.id}`;

    // Render prediction steps
    const stepsHtml = prediction.sequence.map((step, index) => `
      <div class="prediction-step" data-step="${step.step}">
        <div class="step-number">${step.step}</div>
        <div class="step-content">
          <div class="step-action">${step.action}</div>
          <div class="step-description">${step.description}</div>
          <div class="step-meta">
            <span class="step-confidence">${(step.confidence * 100).toFixed(0)}%</span>
            <span class="step-duration">~${step.estimatedDuration}min</span>
          </div>
        </div>
      </div>
    `).join('');

    banner.innerHTML = `
      <div class="prediction-header">
        <div class="prediction-icon">🔮</div>
        <div class="prediction-title">Workflow Prediction</div>
        <button class="prediction-close" data-action="dismiss">×</button>
      </div>
      <div class="prediction-content">
        <p class="prediction-reasoning">${prediction.reasoning}</p>
        <div class="prediction-steps">
          ${stepsHtml}
        </div>
      </div>
      <div class="prediction-footer">
        <span class="prediction-confidence">${(prediction.confidence * 100).toFixed(0)}% confidence</span>
        <span class="prediction-duration">Total: ~${prediction.totalEstimatedTime}min</span>
      </div>
    `;

    // Position and add to DOM
    this.positionBanner(banner);
    this.addPredictionEventListeners(banner, prediction);
    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translateY(0)';
    });

    return {
      id: prediction.id,
      element: banner,
      suggestion: {
        id: prediction.id,
        type: 'proactive',
        title: 'Workflow Prediction',
        description: prediction.reasoning,
        confidence: prediction.confidence,
        actions: [],
        timing: { showAfter: 0, hideAfter: 15000, maxShows: 1, cooldown: 300000 },
        dismissible: true
      },
      showTime: Date.now(),
      isVisible: true
    };
  }

  private getPhaseSpecificCompletions(partialInput: string, phase: string): string[] {
    const phaseCompletions: Record<string, Record<string, string[]>> = {
      'planning': {
        'create': [' a detailed implementation plan', ' architecture diagrams', ' project timeline'],
        'design': [' the system architecture', ' user interface mockups', ' database schema'],
        'plan': [' the development approach', ' testing strategy', ' deployment process']
      },
      'implementation': {
        'write': [' a function that', ' unit tests for', ' documentation for'],
        'create': [' a new component', ' error handling', ' logging functionality'],
        'implement': [' the business logic', ' data validation', ' API endpoints']
      },
      'testing': {
        'write': [' unit tests for', ' integration tests', ' test documentation'],
        'test': [' the new functionality', ' edge cases', ' error scenarios'],
        'verify': [' the implementation works', ' all tests pass', ' performance requirements']
      },
      'debugging': {
        'fix': [' the bug in', ' the failing test', ' the performance issue'],
        'debug': [' the issue with', ' why the test fails', ' the memory leak'],
        'investigate': [' the root cause', ' the error logs', ' the stack trace']
      },
      'documentation': {
        'document': [' the API endpoints', ' usage examples', ' installation steps'],
        'write': [' a README file', ' API documentation', ' user guide'],
        'create': [' documentation for', ' examples showing', ' a guide explaining']
      }
    };

    const completions = phaseCompletions[phase] || {};
    const lowerInput = partialInput.toLowerCase();

    for (const [prefix, options] of Object.entries(completions)) {
      if (lowerInput.endsWith(prefix)) {
        return options;
      }
    }

    return [];
  }

  private getContextAwareCompletions(partialInput: string, workflowState: WorkflowState): string[] {
    const completions: string[] = [];

    // Add domain-specific completions
    if (workflowState.metadata.domain === 'development') {
      if (partialInput.toLowerCase().includes('error')) {
        completions.push(' handling for edge cases', ' logging and monitoring', ' recovery mechanisms');
      }
      if (partialInput.toLowerCase().includes('performance')) {
        completions.push(' optimization strategies', ' monitoring and metrics', ' load testing');
      }
    }

    // Add urgency-aware completions
    if (workflowState.metadata.urgency === 'high' || workflowState.metadata.urgency === 'critical') {
      completions.push(' quickly and efficiently', ' with minimal risk', ' following best practices');
    }

    return completions;
  }

  private selectBestCompletion(partialInput: string, completions: string[]): string {
    if (completions.length === 0) return '';

    // For now, return the first completion
    // In a real implementation, this would use more sophisticated selection logic
    return completions[0];
  }

  private positionBanner(banner: HTMLElement): void {
    const position = this.config.uiPosition;
    const offset = 20;

    banner.style.position = 'fixed';
    banner.style.zIndex = '10000';
    banner.style.maxWidth = `${this.config.maxSuggestionWidth}px`;

    switch (position) {
      case 'top-right':
        banner.style.top = `${offset}px`;
        banner.style.right = `${offset}px`;
        break;
      case 'bottom-right':
        banner.style.bottom = `${offset}px`;
        banner.style.right = `${offset}px`;
        break;
      case 'top-left':
        banner.style.top = `${offset}px`;
        banner.style.left = `${offset}px`;
        break;
      case 'bottom-left':
        banner.style.bottom = `${offset}px`;
        banner.style.left = `${offset}px`;
        break;
    }

    // Initial animation state
    banner.style.opacity = '0';
    banner.style.transform = this.getShowTransform();
    banner.style.transition = `all ${this.config.animationDuration}ms ease-out`;
  }

  private getShowTransform(): string {
    const position = this.config.uiPosition;
    if (position.includes('top')) {
      return 'translateY(-20px)';
    } else {
      return 'translateY(20px)';
    }
  }

  private getHideTransform(): string {
    const position = this.config.uiPosition;
    if (position.includes('right')) {
      return 'translateX(100%)';
    } else {
      return 'translateX(-100%)';
    }
  }

  private addBannerEventListeners(banner: HTMLElement, suggestion: WorkflowSuggestion): void {
    banner.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const action = target.getAttribute('data-action');

      if (action === 'accept') {
        this.recordSuggestionFeedback(suggestion.id, 'accepted', 'helpful');
        this.hideSuggestion(suggestion.id, 'user_dismiss');
        // Execute suggestion action if applicable
        this.executeSuggestionAction(suggestion);
      } else if (action === 'dismiss') {
        this.recordSuggestionFeedback(suggestion.id, 'dismissed');
        this.hideSuggestion(suggestion.id, 'user_dismiss');
      }
    });
  }

  private addPredictionEventListeners(banner: HTMLElement, prediction: WorkflowPrediction): void {
    banner.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const action = target.getAttribute('data-action');

      if (action === 'dismiss') {
        this.hideSuggestion(prediction.id, 'user_dismiss');
      }
    });
  }

  private renderSuggestionActions(actions: any[]): string {
    if (actions.length === 0) return '';

    return `
      <div class="suggestion-actions">
        ${actions.map(action => `
          <div class="suggestion-action">
            <strong>${action.action}</strong>
            <span class="action-description">${action.description}</span>
            <span class="action-duration">~${action.estimatedDuration}min</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getSuggestionIcon(type: string): string {
    const icons: Record<string, string> = {
      'proactive': '💡',
      'reactive': '⚡',
      'preventive': '🛡️'
    };
    return icons[type] || '💡';
  }

  private executeSuggestionAction(suggestion: WorkflowSuggestion): void {
    // This would integrate with the main extension to execute the suggested action
    console.log(`[WorkflowAssistant] Executing suggestion action: ${suggestion.title}`);
  }

  private initializeUserFocusTracking(): void {
    if (!this.config.respectUserFocus) return;

    document.addEventListener('visibilitychange', () => {
      this.isUserFocused = !document.hidden;
    });

    window.addEventListener('focus', () => {
      this.isUserFocused = true;
    });

    window.addEventListener('blur', () => {
      this.isUserFocused = false;
    });
  }

  private initializeStyles(): void {
    if (document.getElementById('promptlint-workflow-assistant-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'promptlint-workflow-assistant-styles';
    styles.textContent = `
      .promptlint-workflow-suggestion,
      .promptlint-workflow-prediction {
        background: #ffffff;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        max-width: 350px;
        min-width: 280px;
      }

      .suggestion-header,
      .prediction-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
      }

      .suggestion-icon,
      .prediction-icon {
        font-size: 18px;
        margin-right: 8px;
      }

      .suggestion-title,
      .prediction-title {
        flex: 1;
        font-weight: 600;
        color: #1a1a1a;
      }

      .suggestion-close,
      .prediction-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .suggestion-close:hover,
      .prediction-close:hover {
        color: #333;
        background: #e9ecef;
        border-radius: 4px;
      }

      .suggestion-content,
      .prediction-content {
        padding: 16px;
      }

      .suggestion-description,
      .prediction-reasoning {
        margin: 0 0 12px 0;
        color: #4a4a4a;
      }

      .suggestion-actions {
        margin-top: 12px;
      }

      .suggestion-action {
        padding: 8px 0;
        border-top: 1px solid #f0f0f0;
      }

      .suggestion-action:first-child {
        border-top: none;
      }

      .action-description {
        display: block;
        color: #666;
        font-size: 13px;
        margin-top: 2px;
      }

      .action-duration {
        display: inline-block;
        background: #e3f2fd;
        color: #1976d2;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        margin-top: 4px;
      }

      .suggestion-footer,
      .prediction-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-top: 1px solid #f0f0f0;
        background: #fafafa;
        border-radius: 0 0 8px 8px;
      }

      .suggestion-confidence,
      .prediction-confidence {
        font-size: 12px;
        color: #666;
      }

      .suggestion-buttons {
        display: flex;
        gap: 8px;
      }

      .suggestion-btn {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .suggestion-btn-accept {
        background: #4caf50;
        color: white;
        border-color: #4caf50;
      }

      .suggestion-btn-accept:hover {
        background: #45a049;
      }

      .suggestion-btn-dismiss:hover {
        background: #f5f5f5;
      }

      .prediction-steps {
        margin-top: 12px;
      }

      .prediction-step {
        display: flex;
        align-items: flex-start;
        padding: 8px 0;
        border-left: 2px solid #e0e0e0;
        padding-left: 12px;
        margin-left: 12px;
        position: relative;
      }

      .prediction-step:first-child {
        border-color: #4caf50;
      }

      .step-number {
        background: #2196f3;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        margin-right: 12px;
        flex-shrink: 0;
        position: absolute;
        left: -11px;
        top: 8px;
      }

      .step-content {
        flex: 1;
        margin-left: 20px;
      }

      .step-action {
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
      }

      .step-description {
        color: #666;
        font-size: 13px;
        margin-bottom: 6px;
      }

      .step-meta {
        display: flex;
        gap: 12px;
      }

      .step-confidence,
      .step-duration {
        font-size: 11px;
        color: #888;
      }

      .prediction-duration {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }
    `;

    document.head.appendChild(styles);
  }

  private getMinSuggestionInterval(): number {
    const intervals = {
      'minimal': 300000, // 5 minutes
      'normal': 120000,  // 2 minutes
      'frequent': 60000  // 1 minute
    };
    return intervals[this.config.suggestionFrequency];
  }

  private playNotificationSound(): void {
    // Simple notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('[WorkflowAssistant] Could not play notification sound:', error);
    }
  }

  private getCurrentWorkflowContext(): any {
    // This would integrate with the main extension to get current context
    return {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };
  }
}

// Factory function
export function createWorkflowAssistant(config?: Partial<WorkflowAssistantConfig>): WorkflowAssistant {
  return new WorkflowAssistant(config);
}
