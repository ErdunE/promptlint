/**
 * PromptLint Popup Script
 * 
 * Handles the extension popup interface, displays status, stats, and errors
 * Communicates with background service worker for real-time data
 */

interface ExtensionStatus {
  isActive: boolean;
  currentTab: any;
  stats: any;
  activeTabsCount: number;
  supportedSites: string[];
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: any[];
  recoverableErrors: number;
}

class PromptLintPopup {
  private loadingOverlay: HTMLElement;
  private statusCard: HTMLElement;
  private statusIndicator: HTMLElement;
  private statusText: HTMLElement;
  private statusDetails: HTMLElement;
  private statusSite: HTMLElement;
  private statusConfidence: HTMLElement;
  private errorSection: HTMLElement;
  private errorList: HTMLElement;
  private currentTabId: number | null = null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.loadPopupData();
  }

  private initializeElements(): void {
    this.loadingOverlay = this.getElement('loadingOverlay');
    this.statusCard = this.getElement('statusCard');
    this.statusIndicator = this.getElement('statusIndicator');
    this.statusText = this.getElement('statusText');
    this.statusDetails = this.getElement('statusDetails');
    this.statusSite = this.getElement('statusSite');
    this.statusConfidence = this.getElement('statusConfidence');
    this.errorSection = this.getElement('errorSection');
    this.errorList = this.getElement('errorList');
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id '${id}' not found`);
    }
    return element;
  }

  private attachEventListeners(): void {
    // Refresh button
    this.getElement('refreshBtn').addEventListener('click', () => {
      this.refreshData();
    });

    // Clear errors button
    this.getElement('clearErrorsBtn').addEventListener('click', () => {
      this.clearErrors();
    });

    // Reinject button
    this.getElement('reinjectBtn').addEventListener('click', () => {
      this.reinjectContentScript();
    });

    // Help button
    this.getElement('helpBtn').addEventListener('click', () => {
      this.openHelpPage();
    });

    // Footer links
    this.getElement('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedbackPage();
    });

    this.getElement('supportLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openSupportPage();
    });
  }

  private async loadPopupData(): Promise<void> {
    try {
      this.showLoading(true);

      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTabId = tabs[0]?.id || null;

      // Load extension status and stats
      await Promise.all([
        this.loadExtensionStatus(),
        this.loadErrorStats()
      ]);

    } catch (error) {
      console.error('[PromptLint Popup] Error loading data:', error);
      this.showError('Failed to load extension data');
    } finally {
      this.showLoading(false);
    }
  }

  private async loadExtensionStatus(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_EXTENSION_STATUS'
      });

      this.updateStatusDisplay(response);
      this.updateStatsDisplay(response.stats);

    } catch (error) {
      console.error('[PromptLint Popup] Error loading status:', error);
      this.showStatusError();
    }
  }

  private async loadErrorStats(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_ERROR_STATS'
      });

      this.updateErrorsDisplay(response);

    } catch (error) {
      console.error('[PromptLint Popup] Error loading error stats:', error);
    }
  }

  private updateStatusDisplay(status: ExtensionStatus): void {
    const statusDot = this.statusIndicator.querySelector('.status-dot') as HTMLElement;
    
    if (status.isActive && status.currentTab) {
      // Active state
      statusDot.className = 'status-dot active';
      this.statusText.textContent = 'Active';
      this.statusSite.textContent = `Detected: ${status.currentTab.site}`;
      this.statusConfidence.textContent = `Confidence: ${Math.round(status.currentTab.confidence * 100)}%`;
      this.statusCard.className = 'status-card success';
      
      if (!status.currentTab.hasInputMonitor) {
        statusDot.className = 'status-dot warning';
        this.statusText.textContent = 'Partially Active';
        this.statusConfidence.textContent += ' (Input monitoring disabled)';
        this.statusCard.className = 'status-card warning';
      }
    } else {
      // Check if we're on a supported site
      const currentUrl = window.location.href;
      const isSupportedSite = this.isSupportedSite(currentUrl);
      
      if (isSupportedSite) {
        statusDot.className = 'status-dot warning';
        this.statusText.textContent = 'Not Active';
        this.statusSite.textContent = 'Supported site detected';
        this.statusConfidence.textContent = 'Click "Retry" to activate';
        this.statusCard.className = 'status-card warning';
      } else {
        statusDot.className = 'status-dot';
        this.statusText.textContent = 'Inactive';
        this.statusSite.textContent = 'Navigate to ChatGPT or Claude';
        this.statusConfidence.textContent = '';
        this.statusCard.className = 'status-card';
      }
    }
  }

  private updateStatsDisplay(stats: any): void {
    this.getElement('totalActivations').textContent = stats.totalActivations.toString();
    this.getElement('successfulInits').textContent = stats.successfulInitializations.toString();
    this.getElement('errorCount').textContent = stats.errorCount.toString();
    this.getElement('activeTabsCount').textContent = stats.activeTabsCount?.toString() || '0';
  }

  private updateErrorsDisplay(errorStats: ErrorStats): void {
    if (errorStats.totalErrors === 0) {
      this.errorSection.style.display = 'none';
      return;
    }

    this.errorSection.style.display = 'block';
    this.errorList.innerHTML = '';

    // Show recent errors
    errorStats.recentErrors.forEach(error => {
      const errorElement = document.createElement('div');
      errorElement.className = 'error-item';
      
      errorElement.innerHTML = `
        <div class="error-type">${this.formatErrorType(error.type)}</div>
        <div class="error-message">${error.message}</div>
      `;
      
      this.errorList.appendChild(errorElement);
    });

    // Update error count in status if there are unrecoverable errors
    const unrecoverableErrors = errorStats.totalErrors - errorStats.recoverableErrors;
    if (unrecoverableErrors > 0) {
      const statusDot = this.statusIndicator.querySelector('.status-dot') as HTMLElement;
      statusDot.className = 'status-dot error';
      this.statusText.textContent = 'Error';
      this.statusCard.className = 'status-card error';
    }
  }

  private formatErrorType(errorType: string): string {
    return errorType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private showStatusError(): void {
    const statusDot = this.statusIndicator.querySelector('.status-dot') as HTMLElement;
    statusDot.className = 'status-dot error';
    this.statusText.textContent = 'Error';
    this.statusSite.textContent = 'Failed to get extension status';
    this.statusConfidence.textContent = '';
    this.statusCard.className = 'status-card error';
  }

  private showLoading(show: boolean): void {
    this.loadingOverlay.style.display = show ? 'flex' : 'none';
  }

  private showError(message: string): void {
    // Could implement a toast or error display
    console.error('[PromptLint Popup] Error:', message);
  }

  private async refreshData(): Promise<void> {
    await this.loadPopupData();
  }

  private async clearErrors(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'CLEAR_ERRORS'
      });
      
      this.errorSection.style.display = 'none';
      await this.loadErrorStats(); // Refresh error display
    } catch (error) {
      console.error('[PromptLint Popup] Error clearing errors:', error);
    }
  }

  private async reinjectContentScript(): Promise<void> {
    try {
      if (!this.currentTabId) return;

      await chrome.runtime.sendMessage({
        type: 'REINJECT_CONTENT_SCRIPT',
        tabId: this.currentTabId
      });

      // Refresh data after a short delay
      setTimeout(() => this.refreshData(), 1000);
    } catch (error) {
      console.error('[PromptLint Popup] Error reinjecting content script:', error);
    }
  }

  private isSupportedSite(url: string): boolean {
    const supportedDomains = [
      'chat.openai.com',
      'chatgpt.com', 
      'claude.ai',
      'anthropic.com'
    ];

    return supportedDomains.some(domain => url.includes(domain));
  }

  private openHelpPage(): void {
    chrome.tabs.create({
      url: 'https://github.com/promptlint/promptlint#readme'
    });
    window.close();
  }

  private openFeedbackPage(): void {
    chrome.tabs.create({
      url: 'https://github.com/promptlint/promptlint/issues/new'
    });
    window.close();
  }

  private openSupportPage(): void {
    chrome.tabs.create({
      url: 'https://github.com/promptlint/promptlint/discussions'
    });
    window.close();
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PromptLintPopup();
});

// Handle popup visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Popup became visible, refresh data
    setTimeout(() => {
      const popup = new PromptLintPopup();
    }, 100);
  }
});

export { PromptLintPopup };
