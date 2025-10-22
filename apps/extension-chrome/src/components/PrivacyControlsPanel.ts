/**
 * Privacy Controls Panel - Level 3 User Privacy Management
 * 
 * Privacy-first controls for context memory and preference learning
 * Chrome Extension Compatible - User Control Interface
 */

import { UserContextStorage } from '../../../../packages/context-memory/dist/index.js';

export interface PrivacyControlsConfig {
  enableBehaviorTracking: boolean;
  enablePreferenceLearning: boolean;
  dataRetentionDays: number;
  allowAnalytics: boolean;
  exportDataOnRequest: boolean;
  anonymizeData: boolean;
  clearDataOnExit: boolean;
}

export class PrivacyControlsPanel {
  private container: HTMLElement;
  private isVisible: boolean = false;
  private currentSettings: PrivacyControlsConfig | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializePanel();
  }

  /**
   * Show privacy controls panel
   */
  async show(): Promise<void> {
    if (this.isVisible) return;

    // Load current privacy settings
    await this.loadCurrentSettings();
    
    // Create and show panel
    this.createPanelUI();
    this.isVisible = true;

    // Add event listeners
    this.attachEventListeners();
  }

  /**
   * Hide privacy controls panel
   */
  hide(): void {
    if (!this.isVisible) return;

    const panel = this.container.querySelector('.privacy-controls-panel');
    if (panel) {
      panel.remove();
    }
    
    this.isVisible = false;
  }

  /**
   * Toggle privacy controls panel visibility
   */
  async toggle(): Promise<void> {
    if (this.isVisible) {
      this.hide();
    } else {
      await this.show();
    }
  }

  // Private methods

  private async initializePanel(): Promise<void> {
    // Load initial settings
    await this.loadCurrentSettings();
  }

  private async loadCurrentSettings(): Promise<void> {
    try {
      const settings = await UserContextStorage.loadPrivacySettings();
      this.currentSettings = settings || UserContextStorage.getDefaultPrivacySettings();
    } catch (error) {
      console.error('[Privacy Controls] Failed to load settings:', error);
      this.currentSettings = UserContextStorage.getDefaultPrivacySettings();
    }
  }

  private createPanelUI(): void {
    const panel = document.createElement('div');
    panel.className = 'privacy-controls-panel';
    panel.innerHTML = this.generatePanelHTML();
    
    this.container.appendChild(panel);
    
    // Set current values
    this.updateUIWithCurrentSettings();
  }

  private generatePanelHTML(): string {
    return `
      <div class="privacy-panel-header">
        <h3>🔒 Privacy & Data Controls</h3>
        <button class="privacy-close-btn" type="button">×</button>
      </div>
      
      <div class="privacy-panel-content">
        <div class="privacy-section">
          <h4>Data Collection</h4>
          
          <div class="privacy-setting">
            <label class="privacy-toggle">
              <input type="checkbox" id="enable-behavior-tracking">
              <span class="privacy-slider"></span>
            </label>
            <div class="privacy-setting-info">
              <strong>Behavior Tracking</strong>
              <p>Learn from your template selections to improve recommendations</p>
            </div>
          </div>
          
          <div class="privacy-setting">
            <label class="privacy-toggle">
              <input type="checkbox" id="enable-preference-learning">
              <span class="privacy-slider"></span>
            </label>
            <div class="privacy-setting-info">
              <strong>Preference Learning</strong>
              <p>Adapt template suggestions based on your usage patterns</p>
            </div>
          </div>
        </div>

        <div class="privacy-section">
          <h4>Data Retention</h4>
          
          <div class="privacy-setting">
            <label for="data-retention-days">Keep data for:</label>
            <select id="data-retention-days">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          
          <div class="privacy-setting">
            <label class="privacy-toggle">
              <input type="checkbox" id="clear-data-on-exit">
              <span class="privacy-slider"></span>
            </label>
            <div class="privacy-setting-info">
              <strong>Clear Data on Browser Exit</strong>
              <p>Automatically remove all stored data when browser closes</p>
            </div>
          </div>
        </div>

        <div class="privacy-section">
          <h4>Data Privacy</h4>
          
          <div class="privacy-setting">
            <label class="privacy-toggle">
              <input type="checkbox" id="anonymize-data">
              <span class="privacy-slider"></span>
            </label>
            <div class="privacy-setting-info">
              <strong>Anonymize Data</strong>
              <p>Remove personally identifiable information from stored data</p>
            </div>
          </div>
          
          <div class="privacy-setting">
            <label class="privacy-toggle">
              <input type="checkbox" id="allow-analytics">
              <span class="privacy-slider"></span>
            </label>
            <div class="privacy-setting-info">
              <strong>Usage Analytics</strong>
              <p>Help improve PromptLint by sharing anonymized usage statistics</p>
            </div>
          </div>
        </div>

        <div class="privacy-section">
          <h4>Data Management</h4>
          
          <div class="privacy-actions">
            <button class="privacy-btn secondary" id="export-data-btn">
              📤 Export My Data
            </button>
            
            <button class="privacy-btn secondary" id="view-storage-info">
              📊 Storage Usage
            </button>
            
            <button class="privacy-btn danger" id="clear-all-data-btn">
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        <div class="privacy-section">
          <div class="privacy-info-box">
            <h5>🛡️ Your Privacy Matters</h5>
            <p>All data is stored locally in your browser. Nothing is sent to external servers. You have complete control over your data.</p>
          </div>
        </div>
      </div>

      <div class="privacy-panel-footer">
        <button class="privacy-btn primary" id="save-privacy-settings">
          Save Settings
        </button>
        <button class="privacy-btn secondary" id="cancel-privacy-settings">
          Cancel
        </button>
      </div>
    `;
  }

  private updateUIWithCurrentSettings(): void {
    if (!this.currentSettings) return;

    const panel = this.container.querySelector('.privacy-controls-panel');
    if (!panel) return;

    // Update checkboxes
    (panel.querySelector('#enable-behavior-tracking') as HTMLInputElement).checked = this.currentSettings.enableBehaviorTracking;
    (panel.querySelector('#enable-preference-learning') as HTMLInputElement).checked = this.currentSettings.enablePreferenceLearning;
    (panel.querySelector('#clear-data-on-exit') as HTMLInputElement).checked = this.currentSettings.clearDataOnExit;
    (panel.querySelector('#anonymize-data') as HTMLInputElement).checked = this.currentSettings.anonymizeData;
    (panel.querySelector('#allow-analytics') as HTMLInputElement).checked = this.currentSettings.allowAnalytics;

    // Update select
    (panel.querySelector('#data-retention-days') as HTMLSelectElement).value = this.currentSettings.dataRetentionDays.toString();
  }

  private attachEventListeners(): void {
    const panel = this.container.querySelector('.privacy-controls-panel');
    if (!panel) return;

    // Close button
    panel.querySelector('.privacy-close-btn')?.addEventListener('click', () => {
      this.hide();
    });

    // Save settings
    panel.querySelector('#save-privacy-settings')?.addEventListener('click', async () => {
      await this.saveSettings();
    });

    // Cancel
    panel.querySelector('#cancel-privacy-settings')?.addEventListener('click', () => {
      this.hide();
    });

    // Export data
    panel.querySelector('#export-data-btn')?.addEventListener('click', async () => {
      await this.exportUserData();
    });

    // View storage info
    panel.querySelector('#view-storage-info')?.addEventListener('click', async () => {
      await this.showStorageInfo();
    });

    // Clear all data
    panel.querySelector('#clear-all-data-btn')?.addEventListener('click', async () => {
      await this.clearAllData();
    });

    // Real-time setting updates
    panel.querySelectorAll('input, select').forEach(element => {
      element.addEventListener('change', () => {
        this.updatePreview();
      });
    });
  }

  private async saveSettings(): Promise<void> {
    const panel = this.container.querySelector('.privacy-controls-panel');
    if (!panel) return;

    try {
      const newSettings: PrivacyControlsConfig = {
        enableBehaviorTracking: (panel.querySelector('#enable-behavior-tracking') as HTMLInputElement).checked,
        enablePreferenceLearning: (panel.querySelector('#enable-preference-learning') as HTMLInputElement).checked,
        dataRetentionDays: parseInt((panel.querySelector('#data-retention-days') as HTMLSelectElement).value),
        allowAnalytics: (panel.querySelector('#allow-analytics') as HTMLInputElement).checked,
        exportDataOnRequest: true, // Always enabled for transparency
        anonymizeData: (panel.querySelector('#anonymize-data') as HTMLInputElement).checked,
        clearDataOnExit: (panel.querySelector('#clear-data-on-exit') as HTMLInputElement).checked
      };

      await UserContextStorage.savePrivacySettings(newSettings);
      this.currentSettings = newSettings;

      // Show success message
      this.showNotification('Privacy settings saved successfully!', 'success');
      
      // Hide panel after brief delay
      setTimeout(() => {
        this.hide();
      }, 1500);

    } catch (error) {
      console.error('[Privacy Controls] Failed to save settings:', error);
      this.showNotification('Failed to save settings. Please try again.', 'error');
    }
  }

  private async exportUserData(): Promise<void> {
    try {
      const exportData = await UserContextStorage.exportUserData();
      
      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptlint-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      this.showNotification('Data exported successfully!', 'success');

    } catch (error) {
      console.error('[Privacy Controls] Failed to export data:', error);
      this.showNotification('Failed to export data. Please try again.', 'error');
    }
  }

  private async showStorageInfo(): Promise<void> {
    try {
      const storageInfo = await UserContextStorage.getStorageUsage();
      
      const infoHTML = `
        <div class="storage-info-modal">
          <h4>📊 Storage Usage Information</h4>
          <div class="storage-stats">
            <div class="storage-stat">
              <strong>Total Used:</strong> ${(storageInfo.totalBytes / 1024).toFixed(2)} KB
            </div>
            <div class="storage-stat">
              <strong>Available:</strong> ${(storageInfo.availableBytes / 1024).toFixed(2)} KB
            </div>
            <div class="storage-stat">
              <strong>Usage:</strong> ${storageInfo.usagePercentage.toFixed(1)}%
            </div>
            <div class="storage-stat">
              <strong>Data Entries:</strong> ${storageInfo.entryCount}
            </div>
            <div class="storage-stat">
              <strong>Oldest Entry:</strong> ${storageInfo.oldestEntry.toLocaleDateString()}
            </div>
          </div>
          <button class="privacy-btn secondary">Close</button>
        </div>
      `;
      
      const modal = document.createElement('div');
      modal.className = 'privacy-modal-overlay';
      modal.innerHTML = infoHTML;
      
      this.container.appendChild(modal);
      
      // Add event listener programmatically (CSP compliant)
      const closeBtn = modal.querySelector('.privacy-btn.secondary');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.remove();
        });
      }

    } catch (error) {
      console.error('[Privacy Controls] Failed to get storage info:', error);
      this.showNotification('Failed to retrieve storage information.', 'error');
    }
  }

  private async clearAllData(): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to clear all stored data? This action cannot be undone.\n\n' +
      'This will remove:\n' +
      '• All preference learning data\n' +
      '• Template usage history\n' +
      '• Privacy settings (reset to defaults)\n' +
      '• All stored context information'
    );

    if (!confirmed) return;

    try {
      await UserContextStorage.clearUserContext();
      this.currentSettings = UserContextStorage.getDefaultPrivacySettings();
      
      this.showNotification('All data cleared successfully!', 'success');
      
      // Update UI to reflect cleared state
      this.updateUIWithCurrentSettings();

    } catch (error) {
      console.error('[Privacy Controls] Failed to clear data:', error);
      this.showNotification('Failed to clear data. Please try again.', 'error');
    }
  }

  private updatePreview(): void {
    // This could show a real-time preview of what data would be collected
    // with the current settings
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `privacy-notification ${type}`;
    notification.textContent = message;
    
    this.container.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// CSS styles for the privacy controls panel
export const PRIVACY_CONTROLS_STYLES = `
.privacy-controls-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.privacy-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.privacy-panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.privacy-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.privacy-close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.privacy-panel-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 24px;
}

.privacy-section {
  margin: 24px 0;
}

.privacy-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.privacy-setting {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.privacy-setting label[for] {
  min-width: 100px;
  font-weight: 500;
  color: #495057;
  margin-top: 8px;
}

.privacy-setting select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
}

.privacy-toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 4px;
}

.privacy-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.privacy-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.privacy-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.privacy-toggle input:checked + .privacy-slider {
  background-color: #007bff;
}

.privacy-toggle input:checked + .privacy-slider:before {
  transform: translateX(24px);
}

.privacy-setting-info {
  flex: 1;
}

.privacy-setting-info strong {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.privacy-setting-info p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.privacy-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.privacy-btn.primary {
  background: #007bff;
  color: white;
}

.privacy-btn.primary:hover {
  background: #0056b3;
}

.privacy-btn.secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.privacy-btn.secondary:hover {
  background: #e9ecef;
}

.privacy-btn.danger {
  background: #dc3545;
  color: white;
}

.privacy-btn.danger:hover {
  background: #c82333;
}

.privacy-info-box {
  background: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 16px;
}

.privacy-info-box h5 {
  margin: 0 0 8px 0;
  color: #0c5460;
  font-size: 14px;
  font-weight: 600;
}

.privacy-info-box p {
  margin: 0;
  color: #0c5460;
  font-size: 13px;
  line-height: 1.4;
}

.privacy-panel-footer {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.privacy-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  z-index: 10001;
}

.privacy-notification.success {
  background: #28a745;
}

.privacy-notification.error {
  background: #dc3545;
}

.privacy-notification.info {
  background: #17a2b8;
}

.privacy-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
}

.storage-info-modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.storage-info-modal h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.storage-stats {
  margin-bottom: 20px;
}

.storage-stat {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f1f1;
}

.storage-stat:last-child {
  border-bottom: none;
}
`;
