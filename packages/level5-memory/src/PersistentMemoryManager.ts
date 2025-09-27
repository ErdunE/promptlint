/**
 * Level 5 Persistent Memory Manager
 * Manages multi-session context preservation using IndexedDB
 * Implements 30-day retention with intelligent pruning
 */

import { 
  UserInteraction, 
  ContextMemory, 
  EpisodicMemory, 
  SemanticMemory, 
  WorkingMemory,
  WorkflowState,
  MemoryStore,
  MemoryRetentionPolicy,
  MemoryPerformanceMetrics
} from './types/MemoryTypes.js';

export class PersistentMemoryManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'PromptLintMemory';
  private readonly DB_VERSION = 1;
  private performanceMetrics: MemoryPerformanceMetrics;
  
  // Memory stores configuration
  private readonly STORES: MemoryStore[] = [
    {
      name: 'episodic_memory',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'sessionId', keyPath: 'sessionId' },
        { name: 'retentionScore', keyPath: 'retentionScore' }
      ]
    },
    {
      name: 'semantic_memory',
      keyPath: 'id',
      indexes: [
        { name: 'frequency', keyPath: 'frequency' },
        { name: 'confidence', keyPath: 'confidence' },
        { name: 'lastUpdated', keyPath: 'lastUpdated' }
      ]
    },
    {
      name: 'working_memory',
      keyPath: 'sessionId',
      indexes: [
        { name: 'lastUpdated', keyPath: 'lastUpdated' }
      ]
    },
    {
      name: 'workflow_states',
      keyPath: 'id',
      indexes: [
        { name: 'projectId', keyPath: 'projectId' },
        { name: 'stage', keyPath: 'stage' }
      ]
    }
  ];

  // Retention policies
  private readonly RETENTION_POLICIES: Record<string, MemoryRetentionPolicy> = {
    episodic_memory: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 10000,
      pruningStrategy: 'importance'
    },
    semantic_memory: {
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      maxEntries: 1000,
      pruningStrategy: 'lru'
    },
    working_memory: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 100,
      pruningStrategy: 'fifo'
    },
    workflow_states: {
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
      maxEntries: 500,
      pruningStrategy: 'lru'
    }
  };

  constructor() {
    this.performanceMetrics = {
      storageTime: 0,
      retrievalTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0
    };
  }

  /**
   * Initialize IndexedDB with memory stores
   * Implements 30-day retention policy and sets up automatic pruning
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[Level5Memory] Initializing PersistentMemoryManager...');
      
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('[Level5Memory] Failed to open IndexedDB:', request.error);
        reject(new Error(`Failed to initialize memory database: ${request.error}`));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Level5Memory] IndexedDB initialized successfully');
        
        // Set up automatic pruning
        this.setupAutomaticPruning();
        
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[Level5Memory] Setting up database schema...');
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        this.STORES.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            
            // Create indexes
            store.indexes?.forEach(index => {
              objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false });
            });
            
            console.log(`[Level5Memory] Created store: ${store.name}`);
          }
        });
      };
    });
  }

  /**
   * Store user interaction in episodic memory
   * Extract patterns for semantic memory and update working memory cache
   */
  async storeInteraction(interaction: UserInteraction): Promise<void> {
    const startTime = performance.now();
    
    if (!this.db) {
      throw new Error('Memory manager not initialized');
    }

    try {
      // Store in episodic memory
      await this.storeEpisodicMemory(interaction);
      
      // Extract and update semantic patterns
      await this.updateSemanticMemory(interaction);
      
      // Update working memory
      await this.updateWorkingMemory(interaction);
      
      // Update performance metrics
      this.performanceMetrics.storageTime = performance.now() - startTime;
      
      console.log(`[Level5Memory] Stored interaction ${interaction.id} in ${this.performanceMetrics.storageTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[Level5Memory] Failed to store interaction:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant context within 50ms performance target
   * Merge episodic and semantic memories and return consolidated context
   */
  async retrieveContext(sessionId: string): Promise<ContextMemory> {
    const startTime = performance.now();
    
    if (!this.db) {
      throw new Error('Memory manager not initialized');
    }

    try {
      // Retrieve from all memory stores in parallel
      const [episodic, semantic, working, workflow] = await Promise.all([
        this.getRecentEpisodicMemory(sessionId, 50), // Last 50 interactions
        this.getRelevantSemanticMemory(sessionId),
        this.getWorkingMemory(sessionId),
        this.getActiveWorkflowStates(sessionId)
      ]);

      const context: ContextMemory = {
        episodic,
        semantic,
        working: working || this.createEmptyWorkingMemory(sessionId),
        workflow
      };

      // Update performance metrics
      this.performanceMetrics.retrievalTime = performance.now() - startTime;
      
      console.log(`[Level5Memory] Retrieved context for ${sessionId} in ${this.performanceMetrics.retrievalTime.toFixed(2)}ms`);
      
      // Ensure we meet the 50ms performance target
      if (this.performanceMetrics.retrievalTime > 50) {
        console.warn(`[Level5Memory] Context retrieval exceeded 50ms target: ${this.performanceMetrics.retrievalTime.toFixed(2)}ms`);
      }

      return context;
      
    } catch (error) {
      console.error('[Level5Memory] Failed to retrieve context:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(): MemoryPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Manually trigger memory pruning
   */
  async pruneMemory(): Promise<void> {
    if (!this.db) return;

    console.log('[Level5Memory] Starting memory pruning...');
    
    for (const [storeName, policy] of Object.entries(this.RETENTION_POLICIES)) {
      await this.pruneStore(storeName, policy);
    }
    
    console.log('[Level5Memory] Memory pruning completed');
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[Level5Memory] Database connection closed');
    }
  }

  // Private helper methods

  private async storeEpisodicMemory(interaction: UserInteraction): Promise<void> {
    const episodicMemory: EpisodicMemory = {
      id: `episodic_${interaction.id}`,
      timestamp: interaction.timestamp,
      sessionId: interaction.sessionId,
      interaction,
      relatedInteractions: [], // Will be populated by pattern analysis
      retentionScore: this.calculateRetentionScore(interaction)
    };

    return this.storeInObjectStore('episodic_memory', episodicMemory);
  }

  private async updateSemanticMemory(interaction: UserInteraction): Promise<void> {
    // Extract behavioral patterns and update semantic memory
    // This is a simplified implementation - full pattern recognition would be more complex
    const patternId = `pattern_${interaction.intent}_${interaction.context.domain}`;
    
    try {
      const existing = await this.getFromObjectStore('semantic_memory', patternId) as SemanticMemory;
      
      if (existing) {
        existing.frequency += 1;
        existing.lastUpdated = Date.now();
        existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
        await this.storeInObjectStore('semantic_memory', existing);
      } else {
        const newPattern: SemanticMemory = {
          id: patternId,
          pattern: {
            type: 'preference',
            description: `User prefers ${interaction.intent} for ${interaction.context.domain}`,
            triggers: [interaction.intent],
            outcomes: [interaction.outcome],
            successRate: interaction.outcome === 'successful' ? 1.0 : 0.0
          },
          frequency: 1,
          confidence: 0.5,
          lastUpdated: Date.now(),
          contexts: [interaction.context.domain]
        };
        await this.storeInObjectStore('semantic_memory', newPattern);
      }
    } catch (error) {
      console.warn('[Level5Memory] Failed to update semantic memory:', error);
    }
  }

  private async updateWorkingMemory(interaction: UserInteraction): Promise<void> {
    try {
      let workingMemory = await this.getFromObjectStore('working_memory', interaction.sessionId) as WorkingMemory;
      
      if (!workingMemory) {
        workingMemory = this.createEmptyWorkingMemory(interaction.sessionId);
      }

      // Update working memory with new interaction
      workingMemory.recentInteractions.unshift(interaction);
      workingMemory.recentInteractions = workingMemory.recentInteractions.slice(0, 10); // Keep last 10
      workingMemory.currentIntent = interaction.intent;
      workingMemory.lastUpdated = Date.now();
      workingMemory.activeContext = interaction.context;

      await this.storeInObjectStore('working_memory', workingMemory);
    } catch (error) {
      console.warn('[Level5Memory] Failed to update working memory:', error);
    }
  }

  private createEmptyWorkingMemory(sessionId: string): WorkingMemory {
    return {
      sessionId,
      activeContext: {
        platform: 'unknown',
        domain: 'general',
        collaborationLevel: 'individual',
        urgencyLevel: 'normal'
      },
      recentInteractions: [],
      predictedNextActions: [],
      lastUpdated: Date.now()
    };
  }

  private calculateRetentionScore(interaction: UserInteraction): number {
    let score = 0.5; // Base score
    
    // Increase score for successful interactions
    if (interaction.outcome === 'successful') score += 0.3;
    
    // Increase score for high confidence
    score += interaction.confidence * 0.2;
    
    // Increase score for complex interactions
    if (interaction.complexity === 'complex') score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private async getRecentEpisodicMemory(sessionId: string, limit: number): Promise<EpisodicMemory[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['episodic_memory'], 'readonly');
      const store = transaction.objectStore('episodic_memory');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev'); // Most recent first
      const results: EpisodicMemory[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          const memory = cursor.value as EpisodicMemory;
          if (memory.sessionId === sessionId || this.isRelatedSession(memory.sessionId, sessionId)) {
            results.push(memory);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getRelevantSemanticMemory(sessionId: string): Promise<SemanticMemory[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['semantic_memory'], 'readonly');
      const store = transaction.objectStore('semantic_memory');
      const index = store.index('confidence');
      
      const request = index.openCursor(IDBKeyRange.lowerBound(0.6), 'prev'); // High confidence patterns
      const results: SemanticMemory[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < 20) {
          results.push(cursor.value as SemanticMemory);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async getWorkingMemory(sessionId: string): Promise<WorkingMemory | null> {
    return this.getFromObjectStore('working_memory', sessionId) as Promise<WorkingMemory | null>;
  }

  private async getActiveWorkflowStates(sessionId: string): Promise<WorkflowState[]> {
    // Simplified implementation - would need more sophisticated project/session mapping
    return [];
  }

  private isRelatedSession(sessionId1: string, sessionId2: string): boolean {
    // Simplified implementation - could use more sophisticated session relationship detection
    return false;
  }

  private async storeInObjectStore(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromObjectStore(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private setupAutomaticPruning(): void {
    // Set up automatic pruning every 6 hours
    setInterval(() => {
      this.pruneMemory().catch(error => {
        console.error('[Level5Memory] Automatic pruning failed:', error);
      });
    }, 6 * 60 * 60 * 1000);
    
    console.log('[Level5Memory] Automatic pruning scheduled every 6 hours');
  }

  private async pruneStore(storeName: string, policy: MemoryRetentionPolicy): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - policy.maxAge;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp') || store.index('lastUpdated');
      
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
      let deletedCount = 0;
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`[Level5Memory] Pruned ${deletedCount} entries from ${storeName}`);
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
