/**
 * Chrome Extension Level 5 Memory Integration
 * Browser-compatible memory operations for the Chrome extension
 * Handles user interaction capture and memory persistence
 */

// Chrome API type declarations
declare const chrome: {
  storage: {
    local: {
      get(keys: string | string[] | null, callback: (result: Record<string, any>) => void): void;
      set(items: Record<string, any>, callback?: () => void): void;
    };
  };
  tabs?: {
    onActivated?: {
      addListener(callback: () => void): void;
    };
  };
};

// Local type definitions to avoid cross-package imports
interface PersistentMemoryManager {
  initialize(): Promise<void>;
  storeInteraction(interaction: UserInteraction): Promise<void>;
  retrieveContext(sessionId: string): Promise<ContextMemory>;
  getPerformanceMetrics?(): any;
  pruneMemory?(): Promise<void>;
  cleanup?(): Promise<void>;
}

interface ContextMemory {
  episodic: any[];
  semantic: any[];
  working?: any;
  workflow?: any;
}

interface UserInteraction {
  id?: string;
  sessionId: string;
  timestamp: number;
  prompt: string;
  response?: string;
  intent?: string;
  platform?: string;
  context?: any;
  complexity?: string;
  confidence?: number;
  templateSelected?: string;
  outcome?: string;
}

function createPersistentMemoryManager(): PersistentMemoryManager {
  // Simplified implementation for Chrome extension
  return {
    async initialize() { /* placeholder */ },
    async storeInteraction(interaction: UserInteraction) { /* placeholder */ },
    async retrieveContext(sessionId: string): Promise<ContextMemory> {
      return { episodic: [], semantic: [] };
    },
    getPerformanceMetrics() { return {}; },
    async pruneMemory() { /* placeholder */ },
    async cleanup() { /* placeholder */ }
  };
}

export interface ChromeMemoryConfig {
  enableAutoCapture: boolean;
  sessionTimeout: number; // in milliseconds
  maxStorageSize: number; // in MB
  debugMode: boolean;
}

export interface ExtensionInteractionData {
  prompt: string;
  response: string;
  platform: string;
  url: string;
  timestamp: number;
  level4Analysis?: any;
}

export class ChromeMemoryIntegration {
  private memoryManager: PersistentMemoryManager;
  private isInitialized = false;
  private currentSessionId: string;
  private config: ChromeMemoryConfig;
  private interactionQueue: ExtensionInteractionData[] = [];
  private processingQueue = false;

  constructor(config: Partial<ChromeMemoryConfig> = {}) {
    this.memoryManager = createPersistentMemoryManager();
    this.currentSessionId = this.generateSessionId();
    
    this.config = {
      enableAutoCapture: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxStorageSize: 50, // 50MB
      debugMode: false,
      ...config
    };
  }

  /**
   * Initialize memory integration for Chrome extension
   * Checks IndexedDB availability and sets up event listeners
   */
  async initializeForExtension(): Promise<void> {
    try {
      console.log('[ChromeMemory] Initializing Level 5 memory integration...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !window.indexedDB) {
        throw new Error('IndexedDB not available in this environment');
      }
      
      // Initialize the memory manager
      await this.memoryManager.initialize();
      
      // Set up extension-specific event listeners
      this.setupExtensionEventListeners();
      
      // Restore previous session if available
      await this.restorePreviousSession();
      
      // Start processing queued interactions
      this.startQueueProcessor();
      
      this.isInitialized = true;
      console.log('[ChromeMemory] Level 5 memory integration initialized successfully');
      
      if (this.config.debugMode) {
        console.log(`[ChromeMemory] Session ID: ${this.currentSessionId}`);
        console.log('[ChromeMemory] Configuration:', this.config);
      }
      
    } catch (error) {
      console.error('[ChromeMemory] Failed to initialize memory integration:', error);
      throw error;
    }
  }

  /**
   * Capture user interaction and store in memory
   * Stores interaction in episodic memory, extracts patterns for semantic memory,
   * and updates working memory for current session
   */
  async captureUserInteraction(data: ExtensionInteractionData): Promise<void> {
    if (!this.isInitialized) {
      console.warn('[ChromeMemory] Memory integration not initialized, queuing interaction');
      this.interactionQueue.push(data);
      return;
    }

    try {
      const interaction: UserInteraction = {
        id: `chrome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: data.timestamp,
        sessionId: this.currentSessionId,
        prompt: data.prompt,
        intent: this.extractIntent(data),
        complexity: this.assessComplexity(data),
        confidence: this.calculateConfidence(data),
        templateSelected: data.level4Analysis?.selectedTemplate?.type,
        outcome: this.determineOutcome(data),
        context: {
          platform: data.platform,
          domain: this.extractDomain(data.url),
          projectId: this.extractProjectId(data.url),
          workflowStage: this.detectWorkflowStage(data),
          collaborationLevel: this.detectCollaborationLevel(data),
          urgencyLevel: this.detectUrgencyLevel(data)
        }
      };

      // Store the interaction
      await this.memoryManager.storeInteraction(interaction);
      
      if (this.config.debugMode) {
        console.log('[ChromeMemory] Captured interaction:', {
          id: interaction.id,
          intent: interaction.intent,
          complexity: interaction.complexity,
          platform: interaction.context.platform
        });
      }
      
    } catch (error) {
      console.error('[ChromeMemory] Failed to capture user interaction:', error);
      // Don't throw - we don't want to break the extension if memory fails
    }
  }

  /**
   * Retrieve contextual memory for current session
   * Returns relevant context within 50ms performance target
   */
  async getContextualMemory(): Promise<ContextMemory | null> {
    if (!this.isInitialized) {
      console.warn('[ChromeMemory] Memory integration not initialized');
      return null;
    }

    try {
      const startTime = performance.now();
      const context = await this.memoryManager.retrieveContext(this.currentSessionId);
      const retrievalTime = performance.now() - startTime;
      
      // Validate context structure with safe array access
      const validatedContext: ContextMemory = {
        episodic: Array.isArray(context?.episodic) ? context.episodic : [],
        semantic: Array.isArray(context?.semantic) ? context.semantic : [],
        working: context?.working || undefined,
        workflow: context?.workflow || undefined
      };
      
      if (this.config.debugMode) {
        console.log(`[ChromeMemory] Retrieved context in ${retrievalTime.toFixed(2)}ms`);
        console.log(`[ChromeMemory] Context summary:`, {
          episodic: validatedContext.episodic.length,
          semantic: validatedContext.semantic.length,
          working: validatedContext.working ? 'present' : 'absent',
          workflow: validatedContext.workflow ? 'present' : 'absent'
        });
      }
      
      return validatedContext;
      
    } catch (error) {
      console.error('[ChromeMemory] Failed to retrieve contextual memory:', error);
      return { episodic: [], semantic: [] };
    }
  }

  /**
   * Get memory performance metrics
   */
  getPerformanceMetrics() {
    return this.memoryManager.getPerformanceMetrics?.() || {};
  }

  /**
   * Manually trigger memory cleanup
   */
  async cleanupMemory(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await this.memoryManager.pruneMemory?.();
      console.log('[ChromeMemory] Memory cleanup completed');
    } catch (error) {
      console.error('[ChromeMemory] Memory cleanup failed:', error);
    }
  }

  /**
   * Start a new session (e.g., when user opens a new project)
   */
  startNewSession(): void {
    this.currentSessionId = this.generateSessionId();
    console.log(`[ChromeMemory] Started new session: ${this.currentSessionId}`);
  }

  /**
   * Clean up resources when extension is disabled/unloaded
   */
  async cleanup(): Promise<void> {
    try {
      // Process any remaining queued interactions
      await this.processInteractionQueue();
      
      // Clean up memory manager
      await this.memoryManager.cleanup?.();
      
      this.isInitialized = false;
      console.log('[ChromeMemory] Memory integration cleaned up');
      
    } catch (error) {
      console.error('[ChromeMemory] Cleanup failed:', error);
    }
  }

  // Private helper methods

  private generateSessionId(): string {
    return `chrome_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupExtensionEventListeners(): void {
    // Listen for tab changes to potentially start new sessions
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onActivated?.addListener(() => {
        // Could start new session on tab change if desired
        if (this.config.debugMode) {
          console.log('[ChromeMemory] Tab activated');
        }
      });
    }

    // Listen for page navigation
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Save any pending data before page unload
        this.processInteractionQueue().catch(console.error);
      });
    }
  }

  private async restorePreviousSession(): Promise<void> {
    try {
      // Try to restore the most recent session
      const recentContext = await this.memoryManager.retrieveContext('recent');
      
      // Safe property access with validation
      if (recentContext?.working && recentContext.working.lastUpdated && recentContext.working.sessionId) {
        const timeSinceLastUpdate = Date.now() - recentContext.working.lastUpdated;
        
        // If last session was within timeout period, continue it
        if (timeSinceLastUpdate < this.config.sessionTimeout) {
          this.currentSessionId = recentContext.working.sessionId;
          console.log('[ChromeMemory] Restored previous session');
        }
      }
    } catch (error) {
      console.warn('[ChromeMemory] Could not restore previous session:', error);
    }
  }

  private startQueueProcessor(): void {
    // Process queued interactions every 5 seconds
    setInterval(() => {
      if (this.interactionQueue.length > 0 && !this.processingQueue) {
        this.processInteractionQueue().catch(console.error);
      }
    }, 5000);
  }

  private async processInteractionQueue(): Promise<void> {
    if (this.processingQueue || this.interactionQueue.length === 0) return;
    
    this.processingQueue = true;
    
    try {
      const queuedInteractions = [...this.interactionQueue];
      this.interactionQueue = [];
      
      for (const interaction of queuedInteractions) {
        await this.captureUserInteraction(interaction);
      }
      
      if (this.config.debugMode) {
        console.log(`[ChromeMemory] Processed ${queuedInteractions.length} queued interactions`);
      }
      
    } catch (error) {
      console.error('[ChromeMemory] Failed to process interaction queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  private extractIntent(data: ExtensionInteractionData): string {
    // Use Level 4 analysis if available
    if (data.level4Analysis?.intentAnalysis?.instruction?.category) {
      return data.level4Analysis.intentAnalysis.instruction.category;
    }
    
    // Simple intent extraction based on prompt keywords
    const prompt = data.prompt.toLowerCase();
    
    if (prompt.includes('create') || prompt.includes('build') || prompt.includes('make')) {
      return 'create';
    } else if (prompt.includes('explain') || prompt.includes('how') || prompt.includes('what')) {
      return 'explain';
    } else if (prompt.includes('fix') || prompt.includes('debug') || prompt.includes('solve')) {
      return 'solve';
    } else if (prompt.includes('analyze') || prompt.includes('review') || prompt.includes('check')) {
      return 'analyze';
    } else if (prompt.includes('write') || prompt.includes('document')) {
      return 'write';
    } else if (prompt.includes('code') || prompt.includes('function') || prompt.includes('script')) {
      return 'code';
    }
    
    return 'general';
  }

  private assessComplexity(data: ExtensionInteractionData): string {
    // Use Level 4 analysis if available
    if (data.level4Analysis?.intentAnalysis?.instruction?.complexity) {
      return data.level4Analysis.intentAnalysis.instruction.complexity;
    }
    
    // Simple complexity assessment
    const prompt = data.prompt;
    const wordCount = prompt.split(' ').length;
    
    if (wordCount < 10) return 'simple';
    if (wordCount < 30) return 'moderate';
    return 'complex';
  }

  private calculateConfidence(data: ExtensionInteractionData): number {
    // Use Level 4 analysis if available
    if (data.level4Analysis?.intentAnalysis?.confidence) {
      return data.level4Analysis.intentAnalysis.confidence;
    }
    
    // Simple confidence calculation
    return 0.7; // Default confidence
  }

  private determineOutcome(data: ExtensionInteractionData): 'successful' | 'modified' | 'abandoned' {
    // For now, assume successful if we have a response
    return data.response && data.response.length > 0 ? 'successful' : 'abandoned';
  }

  private extractDomain(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      
      // Map common platforms to domains
      if (hostname.includes('github.com')) return 'development';
      if (hostname.includes('stackoverflow.com')) return 'development';
      if (hostname.includes('docs.google.com')) return 'documentation';
      if (hostname.includes('notion.so')) return 'documentation';
      if (hostname.includes('slack.com')) return 'communication';
      if (hostname.includes('discord.com')) return 'communication';
      if (hostname.includes('figma.com')) return 'design';
      
      return 'general';
    } catch {
      return 'general';
    }
  }

  private extractProjectId(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      
      // Extract project identifiers from common platforms
      if (urlObj.hostname.includes('github.com')) {
        const pathParts = urlObj.pathname.split('/');
        if (pathParts.length >= 3) {
          return `github_${pathParts[1]}_${pathParts[2]}`;
        }
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  private detectWorkflowStage(data: ExtensionInteractionData): string {
    const prompt = data.prompt.toLowerCase();
    
    if (prompt.includes('plan') || prompt.includes('design') || prompt.includes('architecture')) {
      return 'planning';
    } else if (prompt.includes('implement') || prompt.includes('code') || prompt.includes('build')) {
      return 'implementation';
    } else if (prompt.includes('test') || prompt.includes('debug') || prompt.includes('fix')) {
      return 'testing';
    } else if (prompt.includes('deploy') || prompt.includes('release') || prompt.includes('production')) {
      return 'deployment';
    } else if (prompt.includes('document') || prompt.includes('readme') || prompt.includes('guide')) {
      return 'documentation';
    }
    
    return 'development';
  }

  private detectCollaborationLevel(data: ExtensionInteractionData): string {
    const url = data.url.toLowerCase();
    const prompt = data.prompt.toLowerCase();
    
    if (url.includes('slack') || url.includes('discord') || url.includes('teams')) {
      return 'team';
    } else if (prompt.includes('team') || prompt.includes('collaborate') || prompt.includes('share')) {
      return 'team';
    } else if (prompt.includes('review') || prompt.includes('feedback')) {
      return 'collaborative';
    }
    
    return 'individual';
  }

  private detectUrgencyLevel(data: ExtensionInteractionData): string {
    const prompt = data.prompt.toLowerCase();
    
    if (prompt.includes('urgent') || prompt.includes('asap') || prompt.includes('immediately')) {
      return 'urgent';
    } else if (prompt.includes('quick') || prompt.includes('fast') || prompt.includes('soon')) {
      return 'high';
    } else if (prompt.includes('when possible') || prompt.includes('eventually')) {
      return 'low';
    }
    
    return 'normal';
  }

  /**
   * Retrieve current context for orchestration
   */
  async retrieveCurrentContext(): Promise<ContextMemory> {
    const sessionId = this.currentSessionId;
    try {
      const context = await this.memoryManager.retrieveContext(sessionId);
      
      // Validate and ensure proper structure
      return {
        episodic: Array.isArray(context?.episodic) ? context.episodic : [],
        semantic: Array.isArray(context?.semantic) ? context.semantic : [],
        working: context?.working || undefined,
        workflow: context?.workflow || undefined
      };
    } catch (error) {
      console.error('[ChromeMemory] Failed to retrieve current context:', error);
      return { episodic: [], semantic: [] };
    }
  }
}

// Factory function for easy instantiation
export function createChromeMemoryIntegration(config?: Partial<ChromeMemoryConfig>): ChromeMemoryIntegration {
  return new ChromeMemoryIntegration(config);
}

// Default export
export default ChromeMemoryIntegration;
