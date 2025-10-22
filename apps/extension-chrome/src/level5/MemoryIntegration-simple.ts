/**
 * Simplified Chrome Memory Integration (for build compatibility)
 * Placeholder implementation for Chrome extension build
 */

export interface ChromeMemoryConfig {
  enableAutoCapture: boolean;
  debugMode: boolean;
}

export interface ExtensionInteractionData {
  timestamp: number;
  prompt: string;
  response: string;
  platform: string;
  url: string;
}

/**
 * Simplified Chrome Memory Integration
 */
export class ChromeMemoryIntegration {
  private config: ChromeMemoryConfig;

  constructor(config: ChromeMemoryConfig) {
    this.config = config;
    console.log('[ChromeMemoryIntegration] Initialized (simplified version)');
  }

  async initializeForExtension(): Promise<void> {
    console.log('[ChromeMemoryIntegration] Extension initialization (simplified)');
  }

  async captureUserInteraction(interaction: ExtensionInteractionData): Promise<void> {
    console.log('[ChromeMemoryIntegration] Interaction captured (simplified)');
  }
}

/**
 * Factory function for creating Chrome memory integration
 */
export function createChromeMemoryIntegration(config: ChromeMemoryConfig): ChromeMemoryIntegration {
  return new ChromeMemoryIntegration(config);
}
