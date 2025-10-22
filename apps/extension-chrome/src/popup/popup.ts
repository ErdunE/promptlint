/**
 * PromptLint Popup Script
 * 
 * Handles the extension popup interface, displays status, stats, and errors
 * Communicates with background service worker for real-time data
 */

// Chrome API type declarations
declare const chrome: {
  runtime: {
    sendMessage(message: any, callback?: (response: any) => void): void;
    lastError?: { message: string };
  };
  tabs: {
    query(queryInfo: any, callback: (tabs: any[]) => void): void;
    sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
    create(createProperties: any, callback?: (tab: any) => void): void;
  };
  storage: {
    local: {
      get(keys: string | string[] | null, callback: (result: Record<string, any>) => void): void;
      set(items: Record<string, any>, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    };
  };
};

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
  private loadingOverlay!: HTMLElement;
  private statusCard!: HTMLElement;
  private statusIndicator!: HTMLElement;
  private statusText!: HTMLElement;
  private statusDetails!: HTMLElement;
  private statusSite!: HTMLElement;
  private statusConfidence!: HTMLElement;
  private errorSection!: HTMLElement;
  private errorList!: HTMLElement;
  private currentTabId: number | null = null;
  
  // API key management removed in favor of privacy controls

  // View navigation elements
  private mainPopupView!: HTMLElement;
  private privacySettingsPanel!: HTMLElement;
  private openPrivacySettingsBtn!: HTMLButtonElement;
  private closePrivacySettingsBtn!: HTMLButtonElement;

  // Privacy controls elements (in secondary panel)
  private enableBehaviorTrackingCheckbox!: HTMLInputElement;
  private enablePreferenceLearningCheckbox!: HTMLInputElement;
  private storageUsageSpan!: HTMLElement;
  private totalSelectionsSpan!: HTMLElement;
  private mostUsedApproachSpan!: HTMLElement;
  private storageProgressBar!: HTMLElement;
  private exportDataBtn!: HTMLButtonElement;
  private clearDataBtn!: HTMLButtonElement;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.loadPopupData();
    this.loadPrivacySettings();
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
    
    // View navigation elements
    this.mainPopupView = this.getElement('main-popup-view');
    this.privacySettingsPanel = this.getElement('privacy-settings-panel');
    this.openPrivacySettingsBtn = this.getElement('open-privacy-settings') as HTMLButtonElement;
    this.closePrivacySettingsBtn = this.getElement('close-privacy-settings') as HTMLButtonElement;

    // Privacy controls elements (in secondary panel)
    this.enableBehaviorTrackingCheckbox = this.getElement('enable-behavior-tracking') as HTMLInputElement;
    this.enablePreferenceLearningCheckbox = this.getElement('enable-preference-learning') as HTMLInputElement;
    this.storageUsageSpan = this.getElement('storage-usage');
    this.totalSelectionsSpan = this.getElement('total-selections');
    this.mostUsedApproachSpan = this.getElement('most-used-approach');
    this.storageProgressBar = this.getElement('storage-progress');
    this.exportDataBtn = this.getElement('export-data-btn') as HTMLButtonElement;
    this.clearDataBtn = this.getElement('clear-data-btn') as HTMLButtonElement;
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

    // View navigation listeners
    this.openPrivacySettingsBtn.addEventListener('click', () => {
      this.showPrivacySettings();
    });

    this.closePrivacySettingsBtn.addEventListener('click', () => {
      this.showMainView();
    });

    // Privacy controls event listeners
    this.enableBehaviorTrackingCheckbox.addEventListener('change', () => {
      this.updatePrivacySetting('enableTracking', this.enableBehaviorTrackingCheckbox.checked);
    });

    this.enablePreferenceLearningCheckbox.addEventListener('change', () => {
      this.updatePrivacySetting('enableLearning', this.enablePreferenceLearningCheckbox.checked);
    });

    this.exportDataBtn.addEventListener('click', () => {
      this.exportUserData();
    });

    this.clearDataBtn.addEventListener('click', () => {
      this.clearUserDataWithConfirmation();
    });
  }

  private async loadPopupData(): Promise<void> {
    try {
      this.showLoading(true);

      // Get current tab
      const tabs = await new Promise<any[]>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });
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
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_EXTENSION_STATUS'
        }, resolve);
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
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'GET_ERROR_STATS'
        }, resolve);
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

  // API Key Management Methods
  
  // loadApiKeyStatus method removed - API key management deprecated

  // toggleApiKeyVisibility method removed - API key management deprecated

  // validateApiKeyInput method removed - API key management deprecated

  // saveApiKey method removed - API key management deprecated

  // clearApiKey method removed - API key management deprecated

  // testApiKey method removed - API key management deprecated

  // showApiKeyStatus method removed - API key management deprecated

  // View Navigation Methods
  private showPrivacySettings(): void {
    this.mainPopupView.classList.add('hidden');
    this.privacySettingsPanel.classList.remove('hidden');
    
    // Load privacy settings when showing the panel
    this.loadPrivacySettings();
  }

  private showMainView(): void {
    this.privacySettingsPanel.classList.add('hidden');
    this.mainPopupView.classList.remove('hidden');
  }

  // Privacy Controls Methods
  private async loadPrivacySettings(): Promise<void> {
    try {
      // Load privacy settings
      const privacySettings = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_privacy_settings'], resolve);
      });
      const settings = privacySettings.promptlint_privacy_settings || {
        enableTracking: true,
        enableLearning: true
      };

      this.enableBehaviorTrackingCheckbox.checked = settings.enableTracking !== false;
      this.enablePreferenceLearningCheckbox.checked = settings.enableLearning !== false;

      // Load user data stats
      await this.updatePrivacyStats();

    } catch (error) {
      console.error('[PromptLint Popup] Error loading privacy settings:', error);
    }
  }

  private async updatePrivacySetting(setting: string, value: boolean): Promise<void> {
    try {
      const stored = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_privacy_settings'], resolve);
      });
      const settings = stored.promptlint_privacy_settings || {};
      
      settings[setting] = value;
      
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({
          promptlint_privacy_settings: settings
        }, resolve);
      });

      console.log(`[PromptLint Popup] Privacy setting updated: ${setting} = ${value}`);

      // Update stats after setting change
      await this.updatePrivacyStats();

      // Show immediate feedback
      this.showPrivacyFeedback(setting, value);

    } catch (error) {
      console.error('[PromptLint Popup] Error updating privacy setting:', error);
    }
  }

  private showPrivacyFeedback(setting: string, enabled: boolean): void {
    const message = enabled ? 'enabled' : 'disabled';
    const settingName = setting === 'enableTracking' ? 'Behavior tracking' : 'Preference learning';
    console.log(`[PromptLint] ${settingName} ${message}`);
    
    // Could add visual feedback here if needed
  }

  private async updatePrivacyStats(): Promise<void> {
    try {
      // Get user data from storage
      const allData = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_user_data', 'promptlint_privacy_settings'], resolve);
      });
      const userData = allData.promptlint_user_data || { selections: [], stats: {} };

      // Update total selections
      this.totalSelectionsSpan.textContent = (userData.selections?.length || 0).toString();

      // Calculate storage usage
      const dataSize = JSON.stringify(allData).length;
      const sizeInKB = Math.round(dataSize / 1024 * 100) / 100;
      const maxKB = 5 * 1024; // 5MB Chrome extension limit
      
      this.storageUsageSpan.textContent = `${sizeInKB} KB / 5 MB`;
      
      // Update storage progress bar
      const usagePercent = Math.min((sizeInKB / maxKB) * 100, 100);
      this.storageProgressBar.style.width = `${usagePercent}%`;

      // Update most used approach
      const mostUsed = userData.stats?.mostUsedApproach || 'None';
      this.mostUsedApproachSpan.textContent = mostUsed;

    } catch (error) {
      console.error('[PromptLint Popup] Error updating privacy stats:', error);
      this.totalSelectionsSpan.textContent = 'Error';
      this.storageUsageSpan.textContent = 'Error';
      this.mostUsedApproachSpan.textContent = 'Error';
    }
  }

  private async exportUserData(): Promise<void> {
    try {
      // Get all user data from storage
      const allData = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get(['promptlint_user_data', 'promptlint_privacy_settings'], resolve);
      });
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        promptlintVersion: '0.6.0',
        userData: allData.promptlint_user_data || {},
        privacySettings: allData.promptlint_privacy_settings || {},
        totalSelections: allData.promptlint_user_data?.selections?.length || 0
      };

      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const filename = `promptlint_export_${new Date().toISOString().split('T')[0]}.json`;
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(url);

      console.log('[PromptLint Popup] User data exported successfully');

    } catch (error) {
      console.error('[PromptLint Popup] Error exporting user data:', error);
      alert('Error exporting data. Please try again.');
    }
  }

  private async clearUserDataWithConfirmation(): Promise<void> {
    try {
      // Enhanced confirmation dialog
      const confirmed = confirm(
        'This will permanently delete all your PromptLint data including:\n\n' +
        '• Template selection history\n' +
        '• User preferences and learning data\n' +
        '• Usage statistics\n\n' +
        'Privacy settings will be reset to defaults.\n\n' +
        'Are you sure you want to continue?'
      );
      
      if (!confirmed) {
        return;
      }

      // Clear all user data and privacy settings
      await chrome.storage.local.remove(['promptlint_user_data', 'promptlint_privacy_settings']);

      // Reset privacy toggles to default state
      this.enableBehaviorTrackingCheckbox.checked = true;
      this.enablePreferenceLearningCheckbox.checked = true;

      // Update stats display
      await this.updatePrivacyStats();

      console.log('[PromptLint Popup] All user data cleared successfully');
      alert('All PromptLint data has been cleared successfully.');

    } catch (error) {
      console.error('[PromptLint Popup] Error clearing user data:', error);
      alert('Error clearing data. Please try again.');
    }
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
