/**
 * PromptLint Background Service Worker
 * 
 * Manages extension lifecycle, handles messages from content scripts,
 * and provides extension status tracking for Manifest V3
 */

// Chrome API type declarations
declare const chrome: {
  runtime: {
    onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void;
    };
    onStartup: {
      addListener(callback: () => void): void;
    };
    onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void;
    };
    sendMessage(message: any, callback?: (response: any) => void): void;
    lastError?: { message: string };
  };
  tabs: {
    onUpdated: {
      addListener(callback: (tabId: number, changeInfo: any, tab: any) => void): void;
    };
    onRemoved: {
      addListener(callback: (tabId: number, removeInfo: any) => void): void;
    };
    query(queryInfo: any, callback: (tabs: any[]) => void): void;
    sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  };
  storage: {
    local: {
      set(items: Record<string, any>, callback?: () => void): void;
      get(keys: string | string[] | null, callback: (result: Record<string, any>) => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    };
  };
  scripting: {
    executeScript(injection: any, callback?: (results: any[]) => void): void;
  };
  action: {
    setBadgeText(details: { text: string; tabId?: number }): void;
    setBadgeBackgroundColor(details: { color: string; tabId?: number }): void;
    setTitle(details: { title: string; tabId?: number }): void;
    onClicked: {
      addListener(callback: (tab: any) => void): void;
    };
  };
};

// Chrome namespace declarations for type compatibility
declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
    interface TabChangeInfo {
      status?: string;
      url?: string;
    }
  }
  namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
    }
    interface InstalledDetails {
      reason: string;
      previousVersion?: string;
    }
  }
}

interface ContentScriptStatus {
  tabId: number;
  site: string;
  confidence: number;
  hasInputMonitor: boolean;
  timestamp: number;
  url: string;
}

interface ErrorReport {
  type: string;
  message: string;
  timestamp: number;
  recoverable: boolean;
  context?: Record<string, any>;
  tabId?: number;
  url?: string;
}

class PromptLintServiceWorker {
  private contentScriptStatus: Map<number, ContentScriptStatus> = new Map();
  private errorReports: ErrorReport[] = [];
  private extensionStats = {
    totalActivations: 0,
    successfulInitializations: 0,
    errorCount: 0,
    supportedSites: ['ChatGPT', 'Claude'],
    version: '0.2.0'
  };

  constructor() {
    this.initializeEventListeners();
    console.log('[PromptLint Background] Service worker initialized');
  }

  private initializeEventListeners(): void {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Handle messages from content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates (navigation)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle tab removal
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.handleTabRemoved(tabId);
    });

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });
  }

  private handleInstallation(details: chrome.runtime.InstalledDetails): void {
    console.log('[PromptLint Background] Extension installed:', details.reason);
    
    if (details.reason === 'install') {
      // First-time installation
      this.showWelcomeNotification();
      this.initializeExtensionData();
    } else if (details.reason === 'update') {
      // Extension updated
      const previousVersion = details.previousVersion;
      console.log(`[PromptLint Background] Updated from ${previousVersion} to ${this.extensionStats.version}`);
      this.handleExtensionUpdate(previousVersion);
    }
  }

  private handleStartup(): void {
    console.log('[PromptLint Background] Extension startup');
    this.extensionStats.totalActivations++;
    
    // Clear old content script status (tabs might have been closed)
    this.contentScriptStatus.clear();
  }

  private handleMessage(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ): void {
    const tabId = sender.tab?.id;
    
    switch (request.type) {
      case 'CONTENT_SCRIPT_READY':
        this.handleContentScriptReady(request, sender);
        sendResponse({ success: true });
        break;

      case 'ERROR_REPORT':
        this.handleErrorReport(request.error, sender);
        sendResponse({ success: true });
        break;

      case 'GET_EXTENSION_STATUS':
        sendResponse(this.getExtensionStatus(tabId));
        break;

      case 'GET_ERROR_STATS':
        sendResponse(this.getErrorStats(tabId));
        break;

      case 'CLEAR_ERRORS':
        this.clearErrors(tabId);
        sendResponse({ success: true });
        break;

      case 'REINJECT_CONTENT_SCRIPT':
        if (tabId) {
          this.reinjectContentScript(tabId);
        }
        sendResponse({ success: true });
        break;

      case 'SAVE_API_KEY':
        this.saveApiKey(request.apiKey).then(result => sendResponse(result));
        break;

      case 'CLEAR_API_KEY':
        this.clearApiKey().then(result => sendResponse(result));
        break;

      case 'TEST_API_KEY':
        this.testApiKey().then(result => sendResponse(result));
        break;

      default:
        console.warn('[PromptLint Background] Unknown message type:', request.type);
        sendResponse({ error: 'Unknown message type' });
    }
  }

  private handleContentScriptReady(request: any, sender: chrome.runtime.MessageSender): void {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    const status: ContentScriptStatus = {
      tabId,
      site: request.site,
      confidence: request.confidence,
      hasInputMonitor: request.hasInputMonitor,
      timestamp: Date.now(),
      url: sender.tab?.url || ''
    };

    this.contentScriptStatus.set(tabId, status);
    this.extensionStats.successfulInitializations++;

    console.log('[PromptLint Background] Content script ready:', status);

    // Update extension badge
    this.updateExtensionBadge(tabId, status);
  }

  private handleErrorReport(error: ErrorReport, sender: chrome.runtime.MessageSender): void {
    const tabId = sender.tab?.id;
    
    const errorWithContext: ErrorReport = {
      ...error,
      tabId,
      url: sender.tab?.url
    };

    this.errorReports.push(errorWithContext);
    this.extensionStats.errorCount++;

    // Keep only last 100 errors
    if (this.errorReports.length > 100) {
      this.errorReports.shift();
    }

    console.warn('[PromptLint Background] Error reported:', errorWithContext);

    // Update badge for error state if needed
    if (!error.recoverable && tabId) {
      this.updateExtensionBadge(tabId, null, true);
    }
  }

  private handleTabUpdate(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): void {
    // Clear status when navigating to new URL
    if (changeInfo.url) {
      this.contentScriptStatus.delete(tabId);
      this.clearExtensionBadge(tabId);
    }

    // Check if navigated to supported site
    if (changeInfo.status === 'complete' && tab.url) {
      const isSupportedSite = this.isSupportedSite(tab.url);
      if (isSupportedSite) {
        // Content script should auto-inject, but we can track the navigation
        console.log('[PromptLint Background] Navigated to supported site:', tab.url);
      }
    }
  }

  private handleTabRemoved(tabId: number): void {
    this.contentScriptStatus.delete(tabId);
    console.log('[PromptLint Background] Tab removed:', tabId);
  }

  private handleActionClick(tab: chrome.tabs.Tab): void {
    // Extension icon clicked - open popup or take action
    console.log('[PromptLint Background] Extension icon clicked for tab:', tab.id);
    
    if (!tab.id) return;

    const status = this.contentScriptStatus.get(tab.id);
    if (!status && tab.url && this.isSupportedSite(tab.url)) {
      // Try to reinject content script
      this.reinjectContentScript(tab.id);
    }
  }

  private updateExtensionBadge(tabId: number, status: ContentScriptStatus | null, hasError = false): void {
    if (hasError) {
      chrome.action.setBadgeText({ text: '!', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#ea4335', tabId });
      chrome.action.setTitle({ 
        title: 'PromptLint - Error occurred. Click to view details.', 
        tabId 
      });
    } else if (status) {
      const scoreText = status.confidence >= 0.8 ? '✓' : '~';
      chrome.action.setBadgeText({ text: scoreText, tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#34a853', tabId });
      chrome.action.setTitle({ 
        title: `PromptLint - Active on ${status.site}`, 
        tabId 
      });
    } else {
      this.clearExtensionBadge(tabId);
    }
  }

  private clearExtensionBadge(tabId: number): void {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setTitle({ 
      title: 'PromptLint - AI Prompt Quality Assistant', 
      tabId 
    });
  }

  private async reinjectContentScript(tabId: number): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-script.js']
      });
      
      console.log('[PromptLint Background] Content script reinjected for tab:', tabId);
    } catch (error) {
      console.error('[PromptLint Background] Failed to reinject content script:', error);
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

  private getExtensionStatus(tabId?: number): any {
    const status = tabId ? this.contentScriptStatus.get(tabId) : null;
    
    return {
      isActive: !!status,
      currentTab: status || null,
      stats: this.extensionStats,
      activeTabsCount: this.contentScriptStatus.size,
      supportedSites: this.extensionStats.supportedSites
    };
  }

  private getErrorStats(tabId?: number): any {
    const allErrors = this.errorReports;
    const tabErrors = tabId ? allErrors.filter(e => e.tabId === tabId) : allErrors;
    
    const errorsByType: Record<string, number> = {};
    tabErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    return {
      totalErrors: tabErrors.length,
      errorsByType,
      recentErrors: tabErrors.slice(-10),
      recoverableErrors: tabErrors.filter(e => e.recoverable).length
    };
  }

  private clearErrors(tabId?: number): void {
    if (tabId) {
      this.errorReports = this.errorReports.filter(e => e.tabId !== tabId);
    } else {
      this.errorReports = [];
    }
  }

  private showWelcomeNotification(): void {
    // Could show a welcome notification, but keeping it simple for MVP
    console.log('[PromptLint Background] Welcome to PromptLint!');
  }

  private initializeExtensionData(): void {
    // Initialize any necessary extension data
    this.extensionStats.totalActivations = 1;
    console.log('[PromptLint Background] Extension data initialized');
  }

  private handleExtensionUpdate(previousVersion?: string): void {
    // Handle extension updates if needed
    console.log(`[PromptLint Background] Extension updated from ${previousVersion}`);
    
    // Could clear old data, migrate settings, etc.
    // For MVP, just log the update
  }

  // API Key Management Methods

  private async saveApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!apiKey || !apiKey.startsWith('sk-') || apiKey.length < 25) {
        return { success: false, error: 'Invalid API key format' };
      }

      // Simple encryption using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      
      // Generate a key for encryption
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the API key
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );

      // Export the key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);

      // Store encrypted data and key
      await chrome.storage.local.set({
        openai_api_key_encrypted: Array.from(new Uint8Array(encrypted)),
        openai_api_key_iv: Array.from(iv),
        openai_api_key_key: Array.from(new Uint8Array(exportedKey))
      });

      console.log('[PromptLint Background] API key saved successfully');
      return { success: true };

    } catch (error) {
      console.error('[PromptLint Background] Error saving API key:', error);
      return { success: false, error: 'Failed to encrypt and save API key' };
    }
  }

  private async clearApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      await chrome.storage.local.remove([
        'openai_api_key_encrypted',
        'openai_api_key_iv',
        'openai_api_key_key'
      ]);

      console.log('[PromptLint Background] API key cleared successfully');
      return { success: true };

    } catch (error) {
      console.error('[PromptLint Background] Error clearing API key:', error);
      return { success: false, error: 'Failed to clear API key' };
    }
  }

  private async testApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      // Decrypt the stored API key
      const result = await new Promise<Record<string, any>>((resolve) => {
        chrome.storage.local.get([
          'openai_api_key_encrypted',
          'openai_api_key_iv',
          'openai_api_key_key'
        ], resolve);
      });

      if (!result.openai_api_key_encrypted) {
        return { success: false, error: 'No API key configured' };
      }

      // Import the key
      const keyData = new Uint8Array(result.openai_api_key_key);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt the API key
      const iv = new Uint8Array(result.openai_api_key_iv);
      const encryptedData = new Uint8Array(result.openai_api_key_encrypted);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      const apiKey = decoder.decode(decrypted);

      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('[PromptLint Background] API key test successful');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('[PromptLint Background] API key test failed:', response.status, errorText);
        return { success: false, error: `API key test failed: ${response.status}` };
      }

    } catch (error) {
      console.error('[PromptLint Background] Error testing API key:', error);
      return { success: false, error: 'Failed to test API key' };
    }
  }
}

// Initialize the service worker
const promptLintServiceWorker = new PromptLintServiceWorker();

// Export for testing purposes
export { PromptLintServiceWorker };
