/**
 * Level 5 Advanced Intelligence Setup Validation
 * Tests Phase 5.1 Foundation Architecture implementation
 */

import { 
  PersistentMemoryManager, 
  Level4IntegrationBridge,
  createPersistentMemoryManager 
} from '../packages/level5-memory/src/index.js';

import { 
  PredictiveIntentEngine,
  createPredictiveIntentEngine 
} from '../packages/level5-predictive/src/index.js';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  performanceMetrics?: any;
}

class Level5Validator {
  private results: ValidationResult[] = [];

  async validatePhase51Setup(): Promise<ValidationResult[]> {
    console.log('=== Level 5 Phase 5.1 Setup Validation ===\n');
    
    // Test 1: Memory Manager Initialization
    await this.testMemoryManagerInitialization();
    
    // Test 2: IndexedDB Operations
    await this.testIndexedDBOperations();
    
    // Test 3: Predictive Engine Integration
    await this.testPredictiveEngineIntegration();
    
    // Test 4: Level 4 Integration Bridge
    await this.testLevel4Integration();
    
    // Test 5: Performance Benchmarks
    await this.testPerformanceBenchmarks();
    
    this.printResults();
    return this.results;
  }

  private async testMemoryManagerInitialization(): Promise<void> {
    console.log('Testing Memory Manager Initialization...');
    
    try {
      const memoryManager = createPersistentMemoryManager();
      
      // Test initialization
      await memoryManager.initialize();
      
      this.addResult({
        component: 'PersistentMemoryManager',
        status: 'pass',
        message: 'Successfully initialized IndexedDB with memory stores'
      });
      
      // Clean up
      await memoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        component: 'PersistentMemoryManager',
        status: 'fail',
        message: `Initialization failed: ${error.message}`
      });
    }
  }

  private async testIndexedDBOperations(): Promise<void> {
    console.log('Testing IndexedDB Operations...');
    
    try {
      const memoryManager = createPersistentMemoryManager();
      await memoryManager.initialize();
      
      // Test storage operation
      const testInteraction = {
        id: 'test_interaction_1',
        timestamp: Date.now(),
        sessionId: 'test_session',
        prompt: 'Test prompt for validation',
        intent: 'create',
        complexity: 'simple',
        confidence: 0.8,
        outcome: 'successful' as const,
        context: {
          platform: 'test',
          domain: 'validation',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      };
      
      const startTime = performance.now();
      await memoryManager.storeInteraction(testInteraction);
      const storageTime = performance.now() - startTime;
      
      // Test retrieval operation
      const retrievalStart = performance.now();
      const context = await memoryManager.retrieveContext('test_session');
      const retrievalTime = performance.now() - retrievalStart;
      
      // Validate performance targets
      const storageOk = storageTime < 100; // Should be under 100ms
      const retrievalOk = retrievalTime < 50; // Should be under 50ms target
      
      this.addResult({
        component: 'IndexedDB Operations',
        status: (storageOk && retrievalOk) ? 'pass' : 'warning',
        message: `Storage: ${storageTime.toFixed(2)}ms, Retrieval: ${retrievalTime.toFixed(2)}ms`,
        performanceMetrics: {
          storageTime,
          retrievalTime,
          meetsTargets: storageOk && retrievalOk
        }
      });
      
      // Clean up
      await memoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        component: 'IndexedDB Operations',
        status: 'fail',
        message: `Storage/retrieval failed: ${error.message}`
      });
    }
  }

  private async testPredictiveEngineIntegration(): Promise<void> {
    console.log('Testing Predictive Engine Integration...');
    
    try {
      const memoryManager = createPersistentMemoryManager();
      await memoryManager.initialize();
      
      const predictiveEngine = createPredictiveIntentEngine(memoryManager);
      await predictiveEngine.initialize();
      
      // Test prediction generation
      const startTime = performance.now();
      const predictions = await predictiveEngine.predictNextIntent('Create a function that', 'test_session');
      const predictionTime = performance.now() - startTime;
      
      // Test ghost text generation
      const ghostStart = performance.now();
      const ghostText = await predictiveEngine.generateGhostText('Create a', 'test_session');
      const ghostTime = performance.now() - ghostStart;
      
      // Validate performance targets
      const predictionOk = predictionTime < 100; // Should be reasonable
      const ghostOk = ghostTime < 50; // Should meet 50ms target
      
      this.addResult({
        component: 'PredictiveIntentEngine',
        status: (predictionOk && ghostOk) ? 'pass' : 'warning',
        message: `Predictions: ${predictions.length}, Ghost text: "${ghostText}", Performance: ${predictionTime.toFixed(2)}ms/${ghostTime.toFixed(2)}ms`,
        performanceMetrics: {
          predictionTime,
          ghostTime,
          predictionsGenerated: predictions.length,
          meetsTargets: predictionOk && ghostOk
        }
      });
      
      // Clean up
      await memoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        component: 'PredictiveIntentEngine',
        status: 'fail',
        message: `Predictive engine failed: ${error.message}`
      });
    }
  }

  private async testLevel4Integration(): Promise<void> {
    console.log('Testing Level 4 Integration Bridge...');
    
    try {
      const memoryManager = createPersistentMemoryManager();
      await memoryManager.initialize();
      
      const integrationBridge = new Level4IntegrationBridge(memoryManager);
      await integrationBridge.connectToContextualEngine();
      
      // Test enhancement with mock Level 4 analysis
      const mockLevel4Analysis = {
        intentAnalysis: {
          instruction: {
            category: 'create',
            complexity: 'moderate',
            confidence: 0.8
          },
          confidence: 0.8
        },
        contextualReasoning: {
          projectContext: {
            domain: 'web-development',
            phase: 'implementation'
          },
          collaborativeContext: {
            collaborationLevel: 'team'
          }
        },
        totalProcessingTime: 15,
        originalPrompt: 'Create a React component for user authentication'
      };
      
      const startTime = performance.now();
      const enhancement = await integrationBridge.enhanceWithPrediction(mockLevel4Analysis, 'test_session');
      const enhancementTime = performance.now() - startTime;
      
      // Validate enhancement
      const hasInsights = enhancement.predictiveInsights.length > 0;
      const hasMemoryContext = enhancement.memoryContext !== null;
      const maintainsCompatibility = integrationBridge.isBackwardCompatible();
      const performanceOk = enhancementTime < 100; // Should add minimal overhead
      
      this.addResult({
        component: 'Level4IntegrationBridge',
        status: (hasInsights && hasMemoryContext && maintainsCompatibility && performanceOk) ? 'pass' : 'warning',
        message: `Insights: ${enhancement.predictiveInsights.length}, Compatible: ${maintainsCompatibility}, Time: ${enhancementTime.toFixed(2)}ms`,
        performanceMetrics: {
          enhancementTime,
          insightsGenerated: enhancement.predictiveInsights.length,
          backwardCompatible: maintainsCompatibility,
          meetsTargets: performanceOk
        }
      });
      
      // Clean up
      await memoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        component: 'Level4IntegrationBridge',
        status: 'fail',
        message: `Integration bridge failed: ${error.message}`
      });
    }
  }

  private async testPerformanceBenchmarks(): Promise<void> {
    console.log('Testing Performance Benchmarks...');
    
    try {
      const memoryManager = createPersistentMemoryManager();
      await memoryManager.initialize();
      
      // Benchmark: Multiple interactions storage
      const interactions = Array.from({ length: 10 }, (_, i) => ({
        id: `benchmark_${i}`,
        timestamp: Date.now() + i * 1000,
        sessionId: 'benchmark_session',
        prompt: `Benchmark prompt ${i}`,
        intent: ['create', 'analyze', 'solve'][i % 3],
        complexity: ['simple', 'moderate', 'complex'][i % 3],
        confidence: 0.7 + (i % 3) * 0.1,
        outcome: 'successful' as const,
        context: {
          platform: 'benchmark',
          domain: 'testing',
          collaborationLevel: 'individual',
          urgencyLevel: 'normal'
        }
      }));
      
      const batchStart = performance.now();
      for (const interaction of interactions) {
        await memoryManager.storeInteraction(interaction);
      }
      const batchTime = performance.now() - batchStart;
      
      // Benchmark: Context retrieval with populated memory
      const retrievalStart = performance.now();
      const context = await memoryManager.retrieveContext('benchmark_session');
      const retrievalTime = performance.now() - retrievalStart;
      
      // Performance targets
      const batchOk = batchTime < 1000; // 10 interactions under 1 second
      const retrievalOk = retrievalTime < 50; // Still under 50ms with data
      const memoryUsageOk = context.episodic.length > 0; // Memory populated
      
      this.addResult({
        component: 'Performance Benchmarks',
        status: (batchOk && retrievalOk && memoryUsageOk) ? 'pass' : 'warning',
        message: `Batch storage: ${batchTime.toFixed(2)}ms, Retrieval: ${retrievalTime.toFixed(2)}ms, Memory entries: ${context.episodic.length}`,
        performanceMetrics: {
          batchStorageTime: batchTime,
          retrievalTime,
          memoryEntries: context.episodic.length,
          meetsTargets: batchOk && retrievalOk
        }
      });
      
      // Clean up
      await memoryManager.cleanup();
      
    } catch (error) {
      this.addResult({
        component: 'Performance Benchmarks',
        status: 'fail',
        message: `Performance testing failed: ${error.message}`
      });
    }
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
    const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${status} ${result.component}: ${result.message}`);
  }

  private printResults(): void {
    console.log('\n=== Validation Summary ===');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    
    const overallStatus = failed > 0 ? 'FAILED' : warnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
    console.log(`\nOverall Status: ${overallStatus}`);
    
    if (failed === 0) {
      console.log('\n🎉 Level 5 Phase 5.1 setup is ready for v0.8.0.1 development!');
    } else {
      console.log('\n🔧 Please address the failed components before proceeding.');
    }
  }
}

// Quality Gates for v0.8.0.0
async function validateQualityGates(): Promise<boolean> {
  const validator = new Level5Validator();
  const results = await validator.validatePhase51Setup();
  
  const criticalComponents = [
    'PersistentMemoryManager',
    'IndexedDB Operations',
    'PredictiveIntentEngine',
    'Level4IntegrationBridge'
  ];
  
  const criticalFailures = results.filter(r => 
    criticalComponents.includes(r.component) && r.status === 'fail'
  );
  
  return criticalFailures.length === 0;
}

// Export for use in other scripts
export { Level5Validator, validateQualityGates };

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateQualityGates()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}
