/**
 * Performance Monitor
 * Real-time performance tracking and bottleneck detection for Level 5 orchestration
 * Monitors response times, memory usage, and identifies optimization opportunities
 */

export interface PerformanceMetrics {
  // Response time metrics
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // Throughput metrics
  requestsPerSecond: number;
  totalRequests: number;
  
  // Agent metrics
  agentPerformance: Record<string, AgentPerformanceMetrics>;
  
  // Memory metrics
  memoryUsage: number;
  peakMemoryUsage: number;
  
  // Cache metrics
  cacheHitRate: number;
  cacheSize: number;
  
  // Error metrics
  errorRate: number;
  totalErrors: number;
  
  // System health
  healthScore: number;
  bottlenecks: Bottleneck[];
}

export interface AgentPerformanceMetrics {
  agentId: string;
  averageTime: number;
  totalRequests: number;
  errorCount: number;
  lastUsed: number;
  reliability: number; // 0-1
}

export interface Bottleneck {
  type: 'agent' | 'consensus' | 'memory' | 'cache' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  suggestion: string;
  detectedAt: number;
  affectedOperations: string[];
}

export interface PerformanceEvent {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface PerformanceConfig {
  sampleSize: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  enableRealTimeMonitoring: boolean;
  enableBottleneckDetection: boolean;
}

/**
 * Real-time performance monitoring system
 */
export class PerformanceMonitor {
  private events: PerformanceEvent[] = [];
  private responseTimes: number[] = [];
  private agentMetrics: Map<string, AgentPerformanceMetrics> = new Map();
  private bottlenecks: Bottleneck[] = [];
  private config: PerformanceConfig;
  private startTime: number;
  private memoryBaseline: number;
  private peakMemory: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      sampleSize: 1000,
      alertThresholds: {
        responseTime: 100, // ms
        errorRate: 0.05, // 5%
        memoryUsage: 100 // MB
      },
      enableRealTimeMonitoring: true,
      enableBottleneckDetection: true,
      ...config
    };

    this.startTime = Date.now();
    this.memoryBaseline = this.getCurrentMemoryUsage();
    
    console.log('[PerformanceMonitor] Initialized with config:', this.config);
    
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }
  }

  /**
   * Track a performance event
   */
  track(operation: string, duration: number, success: boolean = true, metadata?: Record<string, any>): void {
    const event: PerformanceEvent = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      metadata
    };

    this.events.push(event);
    
    // Maintain sample size limit
    if (this.events.length > this.config.sampleSize) {
      this.events.shift();
    }

    // Track response times
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.config.sampleSize) {
      this.responseTimes.shift();
    }

    // Update agent metrics if this is an agent operation
    if (operation.startsWith('agent:')) {
      this.updateAgentMetrics(operation, duration, success);
    }

    // Check for performance alerts
    if (this.config.enableRealTimeMonitoring) {
      this.checkPerformanceAlerts(event);
    }

    // Detect bottlenecks
    if (this.config.enableBottleneckDetection) {
      this.detectBottlenecks();
    }
  }

  /**
   * Track agent-specific performance
   */
  trackAgent(agentId: string, duration: number, success: boolean = true): void {
    this.track(`agent:${agentId}`, duration, success, { agentId });
  }

  /**
   * Track consensus performance
   */
  trackConsensus(duration: number, agentCount: number, success: boolean = true): void {
    this.track('consensus', duration, success, { agentCount });
  }

  /**
   * Track cache performance
   */
  trackCache(operation: 'hit' | 'miss' | 'set', duration: number): void {
    this.track(`cache:${operation}`, duration, true, { cacheOperation: operation });
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const timeWindow = now - this.startTime;
    const successfulEvents = this.events.filter(e => e.success);
    const failedEvents = this.events.filter(e => !e.success);

    // Calculate percentiles
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    const p50 = this.calculatePercentile(sortedTimes, 50);
    const p95 = this.calculatePercentile(sortedTimes, 95);
    const p99 = this.calculatePercentile(sortedTimes, 99);

    // Calculate averages
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length 
      : 0;

    // Calculate throughput
    const requestsPerSecond = timeWindow > 0 ? (this.events.length / timeWindow) * 1000 : 0;

    // Calculate error rate
    const errorRate = this.events.length > 0 ? failedEvents.length / this.events.length : 0;

    // Get cache metrics
    const cacheEvents = this.events.filter(e => e.operation.startsWith('cache:'));
    const cacheHits = cacheEvents.filter(e => e.operation === 'cache:hit').length;
    const cacheTotal = cacheEvents.length;
    const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0;

    // Calculate health score
    const healthScore = this.calculateHealthScore(avgResponseTime, errorRate, this.getCurrentMemoryUsage());

    return {
      averageResponseTime: avgResponseTime,
      p50ResponseTime: p50,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      requestsPerSecond,
      totalRequests: this.events.length,
      agentPerformance: Object.fromEntries(this.agentMetrics),
      memoryUsage: this.getCurrentMemoryUsage(),
      peakMemoryUsage: this.peakMemory,
      cacheHitRate,
      cacheSize: cacheTotal,
      errorRate: errorRate * 100,
      totalErrors: failedEvents.length,
      healthScore,
      bottlenecks: [...this.bottlenecks]
    };
  }

  /**
   * Detect current bottlenecks
   */
  detectBottlenecks(): Bottleneck[] {
    const currentBottlenecks: Bottleneck[] = [];
    const metrics = this.getMetrics();

    // Response time bottleneck
    if (metrics.p95ResponseTime > this.config.alertThresholds.responseTime) {
      currentBottlenecks.push({
        type: 'network',
        severity: metrics.p95ResponseTime > this.config.alertThresholds.responseTime * 2 ? 'high' : 'medium',
        description: `P95 response time (${metrics.p95ResponseTime.toFixed(2)}ms) exceeds threshold`,
        impact: 'Users experiencing slow responses',
        suggestion: 'Optimize agent processing or increase cache hit rate',
        detectedAt: Date.now(),
        affectedOperations: ['orchestration', 'agent_analysis']
      });
    }

    // Memory bottleneck
    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      currentBottlenecks.push({
        type: 'memory',
        severity: metrics.memoryUsage > this.config.alertThresholds.memoryUsage * 1.5 ? 'critical' : 'high',
        description: `Memory usage (${metrics.memoryUsage.toFixed(2)}MB) exceeds threshold`,
        impact: 'Risk of memory exhaustion and performance degradation',
        suggestion: 'Implement memory pruning or reduce cache size',
        detectedAt: Date.now(),
        affectedOperations: ['caching', 'memory_storage']
      });
    }

    // Agent performance bottleneck
    for (const [agentId, agentMetrics] of Array.from(this.agentMetrics)) {
      if (agentMetrics.averageTime > this.config.alertThresholds.responseTime * 0.8) {
        currentBottlenecks.push({
          type: 'agent',
          severity: agentMetrics.averageTime > this.config.alertThresholds.responseTime ? 'high' : 'medium',
          description: `Agent ${agentId} average time (${agentMetrics.averageTime.toFixed(2)}ms) is slow`,
          impact: 'Slowing down overall orchestration',
          suggestion: `Optimize ${agentId} processing or consider caching`,
          detectedAt: Date.now(),
          affectedOperations: [`agent:${agentId}`]
        });
      }
    }

    // Cache performance bottleneck
    if (metrics.cacheHitRate < 50 && metrics.totalRequests > 50) {
      currentBottlenecks.push({
        type: 'cache',
        severity: metrics.cacheHitRate < 30 ? 'high' : 'medium',
        description: `Low cache hit rate (${metrics.cacheHitRate.toFixed(1)}%)`,
        impact: 'Increased computation time due to cache misses',
        suggestion: 'Optimize cache keys or increase cache size/TTL',
        detectedAt: Date.now(),
        affectedOperations: ['caching']
      });
    }

    // Error rate bottleneck
    if (metrics.errorRate > this.config.alertThresholds.errorRate * 100) {
      currentBottlenecks.push({
        type: 'consensus',
        severity: metrics.errorRate > this.config.alertThresholds.errorRate * 200 ? 'critical' : 'high',
        description: `High error rate (${metrics.errorRate.toFixed(1)}%)`,
        impact: 'Reduced system reliability and user experience',
        suggestion: 'Investigate error causes and improve error handling',
        detectedAt: Date.now(),
        affectedOperations: ['orchestration', 'consensus']
      });
    }

    // Update bottlenecks list
    this.bottlenecks = currentBottlenecks;
    
    return currentBottlenecks;
  }

  /**
   * Get performance summary for dashboard
   */
  getSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    healthScore: number;
    keyMetrics: {
      responseTime: number;
      throughput: number;
      errorRate: number;
      cacheHitRate: number;
    };
    activeBottlenecks: number;
    recommendations: string[];
  } {
    const metrics = this.getMetrics();
    const bottlenecks = this.detectBottlenecks();
    
    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (bottlenecks.some(b => b.severity === 'critical')) {
      status = 'critical';
    } else if (bottlenecks.some(b => b.severity === 'high') || metrics.healthScore < 70) {
      status = 'warning';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (metrics.p95ResponseTime > this.config.alertThresholds.responseTime) {
      recommendations.push('Optimize agent processing for faster response times');
    }
    if (metrics.cacheHitRate < 60) {
      recommendations.push('Improve cache strategy to increase hit rate');
    }
    if (metrics.memoryUsage > this.config.alertThresholds.memoryUsage * 0.8) {
      recommendations.push('Monitor memory usage and consider optimization');
    }
    if (bottlenecks.length === 0 && metrics.healthScore > 90) {
      recommendations.push('System performing optimally');
    }

    return {
      status,
      healthScore: metrics.healthScore,
      keyMetrics: {
        responseTime: metrics.p95ResponseTime,
        throughput: metrics.requestsPerSecond,
        errorRate: metrics.errorRate,
        cacheHitRate: metrics.cacheHitRate
      },
      activeBottlenecks: bottlenecks.length,
      recommendations
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.events = [];
    this.responseTimes = [];
    this.agentMetrics.clear();
    this.bottlenecks = [];
    this.startTime = Date.now();
    this.memoryBaseline = this.getCurrentMemoryUsage();
    this.peakMemory = 0;
    
    console.log('[PerformanceMonitor] Metrics reset');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    summary: PerformanceMetrics;
    events: PerformanceEvent[];
    config: PerformanceConfig;
    exportedAt: number;
  } {
    return {
      summary: this.getMetrics(),
      events: [...this.events],
      config: this.config,
      exportedAt: Date.now()
    };
  }

  // Private helper methods

  private updateAgentMetrics(operation: string, duration: number, success: boolean): void {
    const agentId = operation.replace('agent:', '');
    
    let metrics = this.agentMetrics.get(agentId);
    if (!metrics) {
      metrics = {
        agentId,
        averageTime: duration,
        totalRequests: 1,
        errorCount: success ? 0 : 1,
        lastUsed: Date.now(),
        reliability: success ? 1 : 0
      };
    } else {
      // Update running averages
      metrics.averageTime = (metrics.averageTime * metrics.totalRequests + duration) / (metrics.totalRequests + 1);
      metrics.totalRequests++;
      if (!success) metrics.errorCount++;
      metrics.lastUsed = Date.now();
      metrics.reliability = (metrics.totalRequests - metrics.errorCount) / metrics.totalRequests;
    }
    
    this.agentMetrics.set(agentId, metrics);
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  private calculateHealthScore(avgResponseTime: number, errorRate: number, memoryUsage: number): number {
    let score = 100;
    
    // Response time impact (0-40 points)
    const responseTimeRatio = avgResponseTime / this.config.alertThresholds.responseTime;
    score -= Math.min(40, responseTimeRatio * 20);
    
    // Error rate impact (0-30 points)
    const errorRateRatio = errorRate / this.config.alertThresholds.errorRate;
    score -= Math.min(30, errorRateRatio * 15);
    
    // Memory usage impact (0-20 points)
    const memoryRatio = memoryUsage / this.config.alertThresholds.memoryUsage;
    score -= Math.min(20, memoryRatio * 10);
    
    // Bottleneck impact (0-10 points)
    const criticalBottlenecks = this.bottlenecks.filter(b => b.severity === 'critical').length;
    const highBottlenecks = this.bottlenecks.filter(b => b.severity === 'high').length;
    score -= criticalBottlenecks * 5 + highBottlenecks * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  private getCurrentMemoryUsage(): number {
    // Estimate current memory usage (browser environment)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      this.peakMemory = Math.max(this.peakMemory, usedMB);
      return usedMB;
    }
    
    // Fallback estimation
    return 0;
  }

  private checkPerformanceAlerts(event: PerformanceEvent): void {
    // Check response time alert
    if (event.duration > this.config.alertThresholds.responseTime) {
      console.warn(`[PerformanceMonitor] Slow operation detected: ${event.operation} took ${event.duration.toFixed(2)}ms`);
    }
    
    // Check error alert
    if (!event.success) {
      console.warn(`[PerformanceMonitor] Operation failed: ${event.operation}`);
    }
  }

  private startRealTimeMonitoring(): void {
    // Monitor memory usage every 5 seconds
    setInterval(() => {
      const currentMemory = this.getCurrentMemoryUsage();
      if (currentMemory > this.config.alertThresholds.memoryUsage) {
        console.warn(`[PerformanceMonitor] High memory usage detected: ${currentMemory.toFixed(2)}MB`);
      }
    }, 5000);
    
    // Clean up old bottlenecks every minute
    setInterval(() => {
      const now = Date.now();
      this.bottlenecks = this.bottlenecks.filter(b => now - b.detectedAt < 300000); // Keep for 5 minutes
    }, 60000);
  }
}

/**
 * Factory function to create performance monitor
 */
export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = createPerformanceMonitor();
  }
  return globalMonitor;
}
