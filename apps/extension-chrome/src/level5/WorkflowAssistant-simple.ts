/**
 * Simplified Workflow Assistant (for build compatibility)
 * Placeholder implementation for Chrome extension build
 */

export interface WorkflowAssistantConfig {
  enableProactiveSuggestions: boolean;
  suggestionFrequency: string;
  confidenceThreshold: number;
  respectUserFocus: boolean;
}

/**
 * Simplified Workflow Assistant
 */
export class WorkflowAssistant {
  private config: WorkflowAssistantConfig;

  constructor(config: WorkflowAssistantConfig) {
    this.config = config;
    console.log('[WorkflowAssistant] Initialized (simplified version)');
  }

  async showProactiveSuggestion(suggestion: any): Promise<void> {
    console.log('[WorkflowAssistant] Proactive suggestion shown (simplified)');
  }

  async generateWorkflowGhostText(context: any): Promise<string[]> {
    console.log('[WorkflowAssistant] Ghost text generated (simplified)');
    return ['Simplified ghost text suggestion'];
  }
}
