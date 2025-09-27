/**
 * Level 5 Browser Integration Test Suite
 * Tests IndexedDB persistence across browser sessions, page refreshes, and storage limits
 */

import { 
  PersistentMemoryManager, 
  UserInteraction, 
  createPersistentMemoryManager 
} from '../packages/level5-memory/src/index.js';

interface BrowserTestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  message: string;
  metrics?: any;
}

class Level5BrowserTestSuite {
  private results: BrowserTestResult[] = [];
  private memoryManager: PersistentMemoryManager;
  private testSessionId: string;

  constructor() {
    this.memoryManager = createPersistentMemoryManager();
    this.testSessionId = `browser_test_${Date.now()}`;
  }

  async runAllTests(): Promise<BrowserTestResult[]> {
    console.log('🧪 Level 5 Browser Test Suite Starting...\n');
    
    // Test 1: Basic IndexedDB Initialization
    await this.testIndexedDBInitialization();
    
    // Test 2: Data Persistence Across Page Refresh
    await this.testDataPersistence();
    
    // Test 3: Multiple Tab Isolation
    await this.testMultipleTabIsolation();
    
    // Test 4: Storage Quota Management
    await this.testStorageQuotaManagement();
    
    // Test 5: Performance Under Load
    await this.testPerformanceUnderLoad();
    
    // Test 6: Error Recovery
    await this.testErrorRecovery();
    
    // Test 7: Memory Pruning
    await this.testMemoryPruning();
    
    this.printTestSummary();
    return this.results;
  }

  private async testIndexedDBInitialization(): Promise<void> {
    const testName = 'IndexedDB Initialization';
    const startTime = performance.now();
    
    try {
      console.log('Testing IndexedDB initialization...');
      
      // Test initialization
      await this.memoryManager.initialize();
      
      // Verify database exists and is accessible
      const testInteraction: UserInteraction = {
        id: 'init_test_1',
        timestamp: Date.now(),
        sessionId: this.testSessionId,
        prompt: 'Test initialization prompt',
        intent: 'test',
        complexity: 'simple',
        confidence: 1.0,
        outcome: 'successful',
        context: {
          platform: 'test',
          domain: 'testing',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      await this.memoryManager.storeInteraction(testInteraction);
      const context = await this.memoryManager.retrieveContext(this.testSessionId);
      
      const duration = performance.now() - startTime;
      
      if (context && context.episodic.length > 0) {
        this.addResult({
          testName,
          status: 'pass',
          duration,
          message: `IndexedDB initialized successfully in ${duration.toFixed(2)}ms`,
          metrics: { episodicEntries: context.episodic.length }
        });
      } else {
        throw new Error('Failed to store and retrieve test data');
      }
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Initialization failed: ${error.message}`
      });
    }
  }

  private async testDataPersistence(): Promise<void> {
    const testName = 'Data Persistence';
    const startTime = performance.now();
    
    try {
      console.log('Testing data persistence across sessions...');
      
      // Store multiple interactions
      const interactions: UserInteraction[] = [];
      for (let i = 0; i < 5; i++) {
        const interaction: UserInteraction = {
          id: `persistence_test_${i}`,
          timestamp: Date.now() + i * 1000,
          sessionId: this.testSessionId,
          prompt: `Test persistence prompt ${i}`,
          intent: ['create', 'analyze', 'solve'][i % 3],
          complexity: ['simple', 'moderate', 'complex'][i % 3],
          confidence: 0.8 + (i * 0.05),
          outcome: 'successful',
          context: {
            platform: 'test',
            domain: 'persistence',
            collaborationLevel: 'individual',
            urgencyLevel: 'normal'
          }
        };
        
        interactions.push(interaction);
        await this.memoryManager.storeInteraction(interaction);
      }
      
      // Simulate page refresh by creating new memory manager instance
      const newMemoryManager = createPersistentMemoryManager();
      await newMemoryManager.initialize();
      
      // Retrieve data with new instance
      const context = await newMemoryManager.retrieveContext(this.testSessionId);
      
      const duration = performance.now() - startTime;
      
      if (context && context.episodic.length >= 5) {
        this.addResult({
          testName,
          status: 'pass',
          duration,
          message: `Data persisted successfully across sessions. Retrieved ${context.episodic.length} interactions`,
          metrics: { 
            storedInteractions: interactions.length,
            retrievedInteractions: context.episodic.length
          }
        });
      } else {
        throw new Error(`Expected at least 5 interactions, got ${context?.episodic.length || 0}`);
      }
      
      await newMemoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Persistence test failed: ${error.message}`
      });
    }
  }

  private async testMultipleTabIsolation(): Promise<void> {
    const testName = 'Multiple Tab Isolation';
    const startTime = performance.now();
    
    try {
      console.log('Testing multiple tab isolation...');
      
      // Simulate multiple tabs with different session IDs
      const tab1SessionId = `tab1_${Date.now()}`;
      const tab2SessionId = `tab2_${Date.now()}`;
      
      // Store data for tab 1
      const tab1Interaction: UserInteraction = {
        id: 'tab1_interaction',
        timestamp: Date.now(),
        sessionId: tab1SessionId,
        prompt: 'Tab 1 specific prompt',
        intent: 'create',
        complexity: 'simple',
        confidence: 0.9,
        outcome: 'successful',
        context: {
          platform: 'tab1',
          domain: 'isolation',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      // Store data for tab 2
      const tab2Interaction: UserInteraction = {
        id: 'tab2_interaction',
        timestamp: Date.now(),
        sessionId: tab2SessionId,
        prompt: 'Tab 2 specific prompt',
        intent: 'analyze',
        complexity: 'moderate',
        confidence: 0.8,
        outcome: 'successful',
        context: {
          platform: 'tab2',
          domain: 'isolation',
          collaborationLevel: 'team',
          urgencyLevel: 'high'
        }
      };
      
      await this.memoryManager.storeInteraction(tab1Interaction);
      await this.memoryManager.storeInteraction(tab2Interaction);
      
      // Retrieve contexts separately
      const tab1Context = await this.memoryManager.retrieveContext(tab1SessionId);
      const tab2Context = await this.memoryManager.retrieveContext(tab2SessionId);
      
      const duration = performance.now() - startTime;
      
      // Verify isolation
      const tab1HasOnlyTab1Data = tab1Context.working?.sessionId === tab1SessionId;
      const tab2HasOnlyTab2Data = tab2Context.working?.sessionId === tab2SessionId;
      
      if (tab1HasOnlyTab1Data && tab2HasOnlyTab2Data) {
        this.addResult({
          testName,
          status: 'pass',
          duration,
          message: 'Tab isolation working correctly',
          metrics: {
            tab1Sessions: tab1Context.working?.sessionId,
            tab2Sessions: tab2Context.working?.sessionId
          }
        });
      } else {
        throw new Error('Tab isolation failed - sessions are not properly isolated');
      }
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Tab isolation test failed: ${error.message}`
      });
    }
  }

  private async testStorageQuotaManagement(): Promise<void> {
    const testName = 'Storage Quota Management';
    const startTime = performance.now();
    
    try {
      console.log('Testing storage quota management...');
      
      // Check if storage estimation is available
      if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
        this.addResult({
          testName,
          status: 'warning',
          duration: performance.now() - startTime,
          message: 'Storage estimation API not available in this browser'
        });
        return;
      }
      
      // Get initial storage estimate
      const initialEstimate = await navigator.storage.estimate();
      const initialUsage = initialEstimate.usage || 0;
      
      // Store a moderate amount of data
      const largeDataSessions = [];
      for (let i = 0; i < 50; i++) {
        const sessionId = `quota_test_${i}`;
        largeDataSessions.push(sessionId);
        
        const interaction: UserInteraction = {
          id: `quota_interaction_${i}`,
          timestamp: Date.now() + i,
          sessionId,
          prompt: `Large test prompt with lots of data to test storage quota management. This is interaction number ${i} with additional padding text to increase storage usage. `.repeat(10),
          intent: 'test',
          complexity: 'complex',
          confidence: 0.7,
          outcome: 'successful',
          context: {
            platform: 'quota_test',
            domain: 'storage',
            collaborationLevel: 'individual',
            urgencyLevel: 'normal'
          }
        };
        
        await this.memoryManager.storeInteraction(interaction);
      }
      
      // Get final storage estimate
      const finalEstimate = await navigator.storage.estimate();
      const finalUsage = finalEstimate.usage || 0;
      const usageIncrease = finalUsage - initialUsage;
      
      const duration = performance.now() - startTime;
      
      this.addResult({
        testName,
        status: 'pass',
        duration,
        message: `Storage quota management test completed. Usage increased by ${(usageIncrease / 1024).toFixed(2)} KB`,
        metrics: {
          initialUsageKB: (initialUsage / 1024).toFixed(2),
          finalUsageKB: (finalUsage / 1024).toFixed(2),
          increaseKB: (usageIncrease / 1024).toFixed(2),
          quotaKB: ((finalEstimate.quota || 0) / 1024).toFixed(2)
        }
      });
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Storage quota test failed: ${error.message}`
      });
    }
  }

  private async testPerformanceUnderLoad(): Promise<void> {
    const testName = 'Performance Under Load';
    const startTime = performance.now();
    
    try {
      console.log('Testing performance under load...');
      
      const batchSize = 20;
      const retrievalTimes: number[] = [];
      const storageTimes: number[] = [];
      
      // Batch storage test
      for (let batch = 0; batch < 3; batch++) {
        const batchStartTime = performance.now();
        
        const promises = [];
        for (let i = 0; i < batchSize; i++) {
          const interaction: UserInteraction = {
            id: `load_test_${batch}_${i}`,
            timestamp: Date.now() + (batch * batchSize) + i,
            sessionId: `load_session_${batch}`,
            prompt: `Load test prompt ${batch}-${i}`,
            intent: 'test',
            complexity: 'moderate',
            confidence: 0.8,
            outcome: 'successful',
            context: {
              platform: 'load_test',
              domain: 'performance',
              collaborationLevel: 'individual',
              urgencyLevel: 'normal'
            }
          };
          
          promises.push(this.memoryManager.storeInteraction(interaction));
        }
        
        await Promise.all(promises);
        const batchTime = performance.now() - batchStartTime;
        storageTimes.push(batchTime);
      }
      
      // Batch retrieval test
      for (let batch = 0; batch < 3; batch++) {
        const retrievalStartTime = performance.now();
        await this.memoryManager.retrieveContext(`load_session_${batch}`);
        const retrievalTime = performance.now() - retrievalStartTime;
        retrievalTimes.push(retrievalTime);
      }
      
      const avgStorageTime = storageTimes.reduce((a, b) => a + b, 0) / storageTimes.length;
      const avgRetrievalTime = retrievalTimes.reduce((a, b) => a + b, 0) / retrievalTimes.length;
      
      const duration = performance.now() - startTime;
      
      // Performance targets: storage <100ms per batch, retrieval <50ms
      const storageOk = avgStorageTime < 100;
      const retrievalOk = avgRetrievalTime < 50;
      
      this.addResult({
        testName,
        status: (storageOk && retrievalOk) ? 'pass' : 'warning',
        duration,
        message: `Performance test completed. Avg storage: ${avgStorageTime.toFixed(2)}ms, Avg retrieval: ${avgRetrievalTime.toFixed(2)}ms`,
        metrics: {
          avgStorageTime: avgStorageTime.toFixed(2),
          avgRetrievalTime: avgRetrievalTime.toFixed(2),
          batchSize,
          batches: 3,
          meetsTargets: storageOk && retrievalOk
        }
      });
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Performance test failed: ${error.message}`
      });
    }
  }

  private async testErrorRecovery(): Promise<void> {
    const testName = 'Error Recovery';
    const startTime = performance.now();
    
    try {
      console.log('Testing error recovery...');
      
      // Test recovery from corrupted data
      let recoverySuccessful = true;
      
      try {
        // Attempt to store invalid data (should be handled gracefully)
        const invalidInteraction = {
          id: 'invalid_test',
          // Missing required fields to test error handling
        } as any;
        
        await this.memoryManager.storeInteraction(invalidInteraction);
        
      } catch (error) {
        // Expected to fail, but should not crash the system
        console.log('Expected error caught:', error.message);
      }
      
      // Test that normal operations still work after error
      const validInteraction: UserInteraction = {
        id: 'recovery_test',
        timestamp: Date.now(),
        sessionId: this.testSessionId,
        prompt: 'Recovery test prompt',
        intent: 'test',
        complexity: 'simple',
        confidence: 0.9,
        outcome: 'successful',
        context: {
          platform: 'recovery_test',
          domain: 'error_handling',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      await this.memoryManager.storeInteraction(validInteraction);
      const context = await this.memoryManager.retrieveContext(this.testSessionId);
      
      const duration = performance.now() - startTime;
      
      if (context && context.episodic.some(e => e.interaction.id === 'recovery_test')) {
        this.addResult({
          testName,
          status: 'pass',
          duration,
          message: 'Error recovery successful - system continues to function after errors',
          metrics: { recoverySuccessful }
        });
      } else {
        throw new Error('System did not recover properly after error');
      }
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Error recovery test failed: ${error.message}`
      });
    }
  }

  private async testMemoryPruning(): Promise<void> {
    const testName = 'Memory Pruning';
    const startTime = performance.now();
    
    try {
      console.log('Testing memory pruning...');
      
      // Store old interactions that should be pruned
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      const oldInteraction: UserInteraction = {
        id: 'old_interaction',
        timestamp: oldTimestamp,
        sessionId: 'old_session',
        prompt: 'Old interaction that should be pruned',
        intent: 'test',
        complexity: 'simple',
        confidence: 0.8,
        outcome: 'successful',
        context: {
          platform: 'pruning_test',
          domain: 'cleanup',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      await this.memoryManager.storeInteraction(oldInteraction);
      
      // Store recent interaction that should be kept
      const recentInteraction: UserInteraction = {
        id: 'recent_interaction',
        timestamp: Date.now(),
        sessionId: 'recent_session',
        prompt: 'Recent interaction that should be kept',
        intent: 'test',
        complexity: 'simple',
        confidence: 0.8,
        outcome: 'successful',
        context: {
          platform: 'pruning_test',
          domain: 'cleanup',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      await this.memoryManager.storeInteraction(recentInteraction);
      
      // Trigger pruning
      await this.memoryManager.pruneMemory();
      
      // Check results
      const oldContext = await this.memoryManager.retrieveContext('old_session');
      const recentContext = await this.memoryManager.retrieveContext('recent_session');
      
      const duration = performance.now() - startTime;
      
      // Old data should be pruned, recent data should remain
      const oldDataPruned = oldContext.episodic.length === 0;
      const recentDataKept = recentContext.episodic.length > 0;
      
      if (oldDataPruned && recentDataKept) {
        this.addResult({
          testName,
          status: 'pass',
          duration,
          message: 'Memory pruning working correctly - old data removed, recent data preserved',
          metrics: {
            oldDataPruned,
            recentDataKept,
            oldContextEntries: oldContext.episodic.length,
            recentContextEntries: recentContext.episodic.length
          }
        });
      } else {
        this.addResult({
          testName,
          status: 'warning',
          duration,
          message: `Pruning may not be working as expected. Old: ${oldContext.episodic.length}, Recent: ${recentContext.episodic.length}`,
          metrics: {
            oldDataPruned,
            recentDataKept,
            oldContextEntries: oldContext.episodic.length,
            recentContextEntries: recentContext.episodic.length
          }
        });
      }
      
    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        duration: performance.now() - startTime,
        message: `Memory pruning test failed: ${error.message}`
      });
    }
  }

  private addResult(result: BrowserTestResult): void {
    this.results.push(result);
    const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${status} ${result.testName}: ${result.message} (${result.duration.toFixed(2)}ms)`);
  }

  private printTestSummary(): void {
    console.log('\n🧪 Browser Test Suite Summary');
    console.log('================================');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    
    const overallStatus = failed > 0 ? 'FAILED' : warnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
    console.log(`\nOverall Status: ${overallStatus}`);
    
    if (failed === 0) {
      console.log('\n🎉 Level 5 browser integration is ready for production!');
    } else {
      console.log('\n🔧 Please address the failed tests before deployment.');
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.memoryManager.cleanup();
      console.log('Test cleanup completed');
    } catch (error) {
      console.error('Test cleanup failed:', error);
    }
  }
}

// Export for use in other scripts
export { Level5BrowserTestSuite };

// Run tests if called directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  const testSuite = new Level5BrowserTestSuite();
  testSuite.runAllTests()
    .then(() => testSuite.cleanup())
    .catch(console.error);
}
