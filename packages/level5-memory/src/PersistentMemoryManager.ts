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
   * Full browser-compatible implementation with error handling
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[Level5Memory] Initializing PersistentMemoryManager...');
      
      // Check IndexedDB availability
      if (!window.indexedDB) {
        const error = new Error('IndexedDB not supported in this browser');
        console.error('[Level5Memory]', error.message);
        reject(error);
        return;
      }
      
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        const error = request.error || new Error('Unknown IndexedDB error');
        console.error('[Level5Memory] Failed to open IndexedDB:', error);
        reject(new Error(`Failed to initialize memory database: ${error.message}`));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Level5Memory] IndexedDB initialized successfully');
        
        // Set up error handling for the database
        this.db.onerror = (event) => {
          console.error('[Level5Memory] Database error:', event);
        };
        
        this.db.onversionchange = () => {
          console.warn('[Level5Memory] Database version changed, closing connection');
          this.db?.close();
        };
        
        // Set up automatic pruning
        this.setupAutomaticPruning();
        
        // Validate database integrity
        this.validateDatabaseIntegrity()
          .then(() => resolve())
          .catch(reject);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[Level5Memory] Setting up database schema...');
        const db = (event.target as IDBOpenDBRequest).result;
        
        try {
          // Create episodic memory store
          if (!db.objectStoreNames.contains('episodic_memory')) {
            const episodicStore = db.createObjectStore('episodic_memory', { 
              keyPath: 'id'
            });
            episodicStore.createIndex('timestamp', 'timestamp', { unique: false });
            episodicStore.createIndex('sessionId', 'sessionId', { unique: false });
            episodicStore.createIndex('retentionScore', 'retentionScore', { unique: false });
            console.log('[Level5Memory] Created episodic_memory store');
          }
          
          // Create semantic memory store
          if (!db.objectStoreNames.contains('semantic_memory')) {
            const semanticStore = db.createObjectStore('semantic_memory', { 
              keyPath: 'id'
            });
            semanticStore.createIndex('frequency', 'frequency', { unique: false });
            semanticStore.createIndex('confidence', 'confidence', { unique: false });
            semanticStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            console.log('[Level5Memory] Created semantic_memory store');
          }
          
          // Create working memory store
          if (!db.objectStoreNames.contains('working_memory')) {
            const workingStore = db.createObjectStore('working_memory', { 
              keyPath: 'sessionId'
            });
            workingStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            console.log('[Level5Memory] Created working_memory store');
          }
          
          // Create workflow states store
          if (!db.objectStoreNames.contains('workflow_states')) {
            const workflowStore = db.createObjectStore('workflow_states', { 
              keyPath: 'id'
            });
            workflowStore.createIndex('projectId', 'projectId', { unique: false });
            workflowStore.createIndex('stage', 'stage', { unique: false });
            console.log('[Level5Memory] Created workflow_states store');
          }
          
          console.log('[Level5Memory] Database schema setup complete');
          
        } catch (error) {
          console.error('[Level5Memory] Error creating database schema:', error);
          throw error;
        }
      };
      
      request.onblocked = () => {
        console.warn('[Level5Memory] Database upgrade blocked by another connection');
        reject(new Error('Database upgrade blocked. Please close other tabs and try again.'));
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

  private async validateDatabaseIntegrity(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    console.log('[Level5Memory] Validating database integrity...');
    
    try {
      // Check if all required stores exist
      const requiredStores = ['episodic_memory', 'semantic_memory', 'working_memory', 'workflow_states'];
      for (const storeName of requiredStores) {
        if (!this.db.objectStoreNames.contains(storeName)) {
          throw new Error(`Required store '${storeName}' not found`);
        }
      }
      
      // Test basic read operation on each store
      const transaction = this.db.transaction(requiredStores, 'readonly');
      for (const storeName of requiredStores) {
        const store = transaction.objectStore(storeName);
        // Just count entries to verify store is accessible
        const countRequest = store.count();
        await new Promise<void>((resolve, reject) => {
          countRequest.onsuccess = () => resolve();
          countRequest.onerror = () => reject(countRequest.error);
        });
      }
      
      console.log('[Level5Memory] Database integrity validation passed');
      
    } catch (error) {
      console.error('[Level5Memory] Database integrity validation failed:', error);
      throw error;
    }
  }

  private setupAutomaticPruning(): void {
    // Set up automatic pruning every 6 hours
    setInterval(() => {
      this.pruneMemory().catch(error => {
        console.error('[Level5Memory] Automatic pruning failed:', error);
      });
    }, 6 * 60 * 60 * 1000);
    
    // Also set up storage quota monitoring
    this.monitorStorageQuota();
    
    console.log('[Level5Memory] Automatic pruning scheduled every 6 hours');
  }

  private async monitorStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        const quotaMB = (estimate.quota || 0) / (1024 * 1024);
        const usagePercent = quotaMB > 0 ? (usedMB / quotaMB) * 100 : 0;
        
        console.log(`[Level5Memory] Storage usage: ${usedMB.toFixed(2)}MB / ${quotaMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`);
        
        // If usage is over 80%, trigger aggressive pruning
        if (usagePercent > 80) {
          console.warn('[Level5Memory] Storage quota nearly exceeded, triggering aggressive pruning');
          await this.aggressivePruning();
        }
        
        // Update performance metrics
        this.performanceMetrics.memoryUsage = usedMB;
        
      } catch (error) {
        console.warn('[Level5Memory] Could not estimate storage usage:', error);
      }
    }
  }

  private async aggressivePruning(): Promise<void> {
    console.log('[Level5Memory] Starting aggressive pruning...');
    
    if (!this.db) return;

    try {
      // Reduce retention periods for aggressive pruning
      const aggressivePolicies: Record<string, MemoryRetentionPolicy> = {
        episodic_memory: {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days instead of 30
          maxEntries: 1000, // Reduced from 10000
          pruningStrategy: 'importance'
        },
        semantic_memory: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days instead of 90
          maxEntries: 200, // Reduced from 1000
          pruningStrategy: 'lru'
        },
        working_memory: {
          maxAge: 6 * 60 * 60 * 1000, // 6 hours instead of 24
          maxEntries: 20, // Reduced from 100
          pruningStrategy: 'fifo'
        }
      };

      for (const [storeName, policy] of Object.entries(aggressivePolicies)) {
        await this.pruneStore(storeName, policy);
      }
      
      console.log('[Level5Memory] Aggressive pruning completed');
      
    } catch (error) {
      console.error('[Level5Memory] Aggressive pruning failed:', error);
    }
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
