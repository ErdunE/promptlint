/**
 * Performance Cache System
 * Intelligent caching for Level 5 orchestration to achieve <100ms response times
 * Implements LRU caching with TTL and smart invalidation strategies
 */

export interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hitCount: number;
  computeTime: number;
  tags: string[];
}

export interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageComputeTime: number;
  averageHitTime: number;
  memoryUsage: number;
  evictions: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableMetrics: boolean;
  enableCompression: boolean;
  maxMemoryMB: number;
}

/**
 * LRU Cache with TTL and performance optimization
 */
export class PerformanceCache {
  private cache: Map<string, CachedResponse> = new Map();
  private accessOrder: string[] = [];
  private metrics: CacheMetrics;
  private config: CacheConfig;
  private compressionEnabled: boolean;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5000, // 5 seconds
      enableMetrics: true,
      enableCompression: false,
      maxMemoryMB: 50,
      ...config
    };

    this.compressionEnabled = this.config.enableCompression && typeof TextEncoder !== 'undefined';
    
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageComputeTime: 0,
      averageHitTime: 0,
      memoryUsage: 0,
      evictions: 0
    };

    console.log('[PerformanceCache] Initialized with config:', this.config);
  }

  /**
   * Get cached value or compute and cache new value
   */
  async getCachedOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      forceRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    const { ttl = this.config.defaultTTL, tags = [], forceRefresh = false } = options;

    // Check cache if not forcing refresh
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        const hitTime = performance.now() - startTime;
        this.updateHitMetrics(hitTime);
        return cached;
      }
    }

    // Cache miss - compute new value
    const computeStartTime = performance.now();
    
    try {
      const result = await computeFn();
      const computeTime = performance.now() - computeStartTime;
      
      // Cache the result
      this.set(key, result, ttl, tags, computeTime);
      
      this.updateMissMetrics(computeTime);
      
      return result;
      
    } catch (error) {
      this.metrics.cacheMisses++;
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  private get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.delete(key);
      return null;
    }

    // Update access order for LRU
    this.updateAccessOrder(key);
    cached.hitCount++;

    return cached.data as T;
  }

  /**
   * Set value in cache
   */
  private set<T>(key: string, value: T, ttl: number, tags: string[], computeTime: number): void {
    // Check memory limits before adding
    if (this.shouldEvict()) {
      this.evictLRU();
    }

    const cachedResponse: CachedResponse<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
      computeTime,
      tags
    };

    this.cache.set(key, cachedResponse);
    this.updateAccessOrder(key);
    this.updateMemoryUsage();
  }

  /**
   * Delete value from cache
   */
  private delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.updateMemoryUsage();
    }
    return deleted;
  }

  /**
   * Clear cache by tags
   */
  clearByTags(tags: string[]): number {
    let cleared = 0;
    
    for (const [key, cached] of Array.from(this.cache.entries())) {
      if (cached.tags.some(tag => tags.includes(tag))) {
        this.delete(key);
        cleared++;
      }
    }
    
    console.log(`[PerformanceCache] Cleared ${cleared} entries by tags:`, tags);
    return cleared;
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    let cleared = 0;
    const now = Date.now();
    
    for (const [key, cached] of Array.from(this.cache.entries())) {
      if (now - cached.timestamp > cached.ttl) {
        this.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`[PerformanceCache] Cleared ${cleared} expired entries`);
    }
    
    return cleared;
  }

  /**
   * Get cache statistics
   */
  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get cache size and memory info
   */
  getInfo(): {
    size: number;
    maxSize: number;
    memoryUsage: number;
    maxMemoryMB: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      memoryUsage: this.metrics.memoryUsage,
      maxMemoryMB: this.config.maxMemoryMB,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Warm up cache with common patterns
   */
  async warmUp(patterns: Array<{ key: string; computeFn: () => Promise<any>; ttl?: number }>): Promise<void> {
    console.log(`[PerformanceCache] Warming up cache with ${patterns.length} patterns`);
    
    const warmupPromises = patterns.map(async ({ key, computeFn, ttl }) => {
      try {
        await this.getCachedOrCompute(key, computeFn, { ttl, forceRefresh: true });
      } catch (error) {
        console.warn(`[PerformanceCache] Warmup failed for key ${key}:`, error);
      }
    });
    
    await Promise.all(warmupPromises);
    console.log('[PerformanceCache] Cache warmup completed');
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.metrics.evictions += this.cache.size;
    this.updateMemoryUsage();
    console.log('[PerformanceCache] Cache cleared');
  }

  // Private helper methods

  private updateAccessOrder(key: string): void {
    // Remove from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recent)
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private shouldEvict(): boolean {
    return this.cache.size >= this.config.maxSize || 
           this.metrics.memoryUsage > this.config.maxMemoryMB;
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;
    
    // Evict least recently used (first in access order)
    const lruKey = this.accessOrder[0];
    this.delete(lruKey);
    this.metrics.evictions++;
    
    console.log(`[PerformanceCache] Evicted LRU entry: ${lruKey}`);
  }

  private updateMemoryUsage(): void {
    // Estimate memory usage (rough calculation)
    let totalSize = 0;
    
    for (const [key, cached] of Array.from(this.cache.entries())) {
      // Key size
      totalSize += key.length * 2; // UTF-16
      
      // Data size (rough estimate)
      try {
        const dataStr = JSON.stringify(cached.data);
        totalSize += dataStr.length * 2;
      } catch {
        totalSize += 1000; // Fallback estimate
      }
      
      // Metadata size
      totalSize += 200; // Rough estimate for timestamps, etc.
    }
    
    this.metrics.memoryUsage = totalSize / (1024 * 1024); // Convert to MB
  }

  private updateHitMetrics(hitTime: number): void {
    this.metrics.cacheHits++;
    this.metrics.averageHitTime = (this.metrics.averageHitTime + hitTime) / 2;
  }

  private updateMissMetrics(computeTime: number): void {
    this.metrics.cacheMisses++;
    this.metrics.averageComputeTime = (this.metrics.averageComputeTime + computeTime) / 2;
  }

  private updateMetrics(): void {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    this.metrics.hitRate = total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
  }
}

/**
 * Specialized cache for agent responses
 */
export class AgentResponseCache extends PerformanceCache {
  constructor() {
    super({
      maxSize: 500,
      defaultTTL: 10000, // 10 seconds for agent responses
      enableMetrics: true,
      maxMemoryMB: 25
    });
  }

  /**
   * Cache agent analysis with smart key generation
   */
  async cacheAgentAnalysis<T>(
    agentId: string,
    input: any,
    computeFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateAgentKey(agentId, input);
    const tags = ['agent', agentId];
    
    return this.getCachedOrCompute(key, computeFn, { tags });
  }

  /**
   * Invalidate cache for specific agent
   */
  invalidateAgent(agentId: string): number {
    return this.clearByTags([agentId]);
  }

  private generateAgentKey(agentId: string, input: any): string {
    // Create deterministic key from agent ID and input
    const inputHash = this.hashInput(input);
    return `${agentId}:${inputHash}`;
  }

  private hashInput(input: any): string {
    // Simple hash function for input
    try {
      const str = JSON.stringify(input);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    } catch {
      return Date.now().toString(36);
    }
  }
}

/**
 * Specialized cache for consensus results
 */
export class ConsensusCache extends PerformanceCache {
  constructor() {
    super({
      maxSize: 200,
      defaultTTL: 15000, // 15 seconds for consensus
      enableMetrics: true,
      maxMemoryMB: 10
    });
  }

  /**
   * Cache consensus result with agent signature
   */
  async cacheConsensus<T>(
    agentAnalyses: any[],
    computeFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateConsensusKey(agentAnalyses);
    const tags = ['consensus'];
    
    return this.getCachedOrCompute(key, computeFn, { tags, ttl: 15000 });
  }

  private generateConsensusKey(agentAnalyses: any[]): string {
    // Create key from agent IDs and confidence levels
    const signature = agentAnalyses
      .map(analysis => `${analysis.agentId}:${Math.floor(analysis.confidence * 10)}`)
      .sort()
      .join('|');
    
    return `consensus:${this.hashString(signature)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Factory functions for creating cache instances
 */
export function createPerformanceCache(config?: Partial<CacheConfig>): PerformanceCache {
  return new PerformanceCache(config);
}

export function createAgentResponseCache(): AgentResponseCache {
  return new AgentResponseCache();
}

export function createConsensusCache(): ConsensusCache {
  return new ConsensusCache();
}
