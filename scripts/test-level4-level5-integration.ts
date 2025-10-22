/**
 * Comprehensive test suite for Level 4 + Level 5 Integration
 * Validates the unified intelligence system combining contextual analysis with predictive orchestration
 */

import { 
  Level4EnhancedOrchestrator, 
  createLevel4EnhancedOrchestrator,
  createUnifiedInput,
  Level4EnhancedInput,
  UnifiedOrchestrationResult
} from '../packages/level5-orchestration/src/Level4EnhancedOrchestrator.js';

import { 
  EnhancedLevel4Bridge,
  ContextualAnalysis,
  UnifiedIntelligence
} from '../packages/level5-memory/src/EnhancedLevel4Bridge.js';

console.log('=== Level 4 + Level 5 Integration Test Suite ===\n');

class IntegrationValidator {
  private orchestrator: Level4EnhancedOrchestrator;
  private bridge: EnhancedLevel4Bridge;
  private testResults: Map<string, boolean> = new Map();

  constructor() {
    this.orchestrator = createLevel4EnhancedOrchestrator();
    this.bridge = new EnhancedLevel4Bridge();
  }

  async runComprehensiveTests(): Promise<void> {
    console.log('🚀 Starting Level 4 + Level 5 integration validation...\n');

    try {
      // Test 1: Basic Integration
      await this.testBasicIntegration();
      
      // Test 2: Performance Validation
      await this.testPerformanceTargets();
      
      // Test 3: Unified Intelligence Quality
      await this.testUnifiedIntelligenceQuality();
      
      // Test 4: Real-World Scenarios
      await this.testRealWorldScenarios();
      
      // Test 5: Error Handling and Fallbacks
      await this.testErrorHandling();
      
      // Generate final report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      throw error;
    }
  }

  /**
   * Test 1: Basic Integration Functionality
   */
  async testBasicIntegration(): Promise<void> {
    console.log('1. Testing Basic Level 4 + Level 5 Integration...');
    
    try {
      // Create test input with Level 4 analysis
      const level4Analysis: ContextualAnalysis = {
        intent: {
          category: 'CREATE',
          action: 'create',
          confidence: 0.85
        },
        complexity: {
          level: 'MODERATE',
          score: 2.8,
          factors: ['multiple_components', 'integration_required']
        },
        confidence: 0.82,
        urgency: 'normal',
        domain: 'frontend'
      };

      const input: Level4EnhancedInput = createUnifiedInput({
        prompt: 'Create a React component with state management and API integration',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/UserProfile.tsx',
          timestamp: Date.now(),
          sessionId: 'integration-test-1'
        }
      }, level4Analysis);

      // Process unified input
      const result = await this.orchestrator.processUnifiedInput(input);
      
      // Validate integration
      this.validateBasicIntegration(result);
      
      console.log('   ✅ Basic integration successful');
      console.log(`   📊 Unified confidence: ${(result.unifiedIntelligence.confidence * 100).toFixed(1)}%`);
      console.log(`   🎯 Suggestions: ${result.unifiedIntelligence.suggestions.length}`);
      console.log(`   ⏱️ Total time: ${result.integrationMetrics.totalUnifiedTime.toFixed(2)}ms`);
      
      this.testResults.set('basic_integration', true);
      
    } catch (error) {
      console.log('   ❌ Basic integration failed:', error.message);
      this.testResults.set('basic_integration', false);
    }
  }

  /**
   * Test 2: Performance Target Validation
   */
  async testPerformanceTargets(): Promise<void> {
    console.log('\n2. Testing Performance Targets (<100ms unified processing)...');
    
    try {
      const testScenarios = [
        'Simple function to validate email format',
        'Debug React component rendering issue',
        'Create REST API endpoint for user authentication',
        'Explain how async/await works in JavaScript',
        'Optimize database query performance'
      ];

      const performanceResults: number[] = [];
      
      for (const prompt of testScenarios) {
        const startTime = performance.now();
        
        const input: Level4EnhancedInput = createUnifiedInput({
          prompt,
          context: {
            platform: 'Test',
            url: 'https://test.com',
            timestamp: Date.now(),
            sessionId: `perf-test-${Date.now()}`
          }
        });

        const result = await this.orchestrator.processUnifiedInput(input);
        const processingTime = performance.now() - startTime;
        
        performanceResults.push(processingTime);
        
        console.log(`   📝 "${prompt.substring(0, 30)}..." - ${processingTime.toFixed(2)}ms`);
      }
      
      const averageTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      const maxTime = Math.max(...performanceResults);
      
      console.log(`   📊 Average processing time: ${averageTime.toFixed(2)}ms`);
      console.log(`   📊 Maximum processing time: ${maxTime.toFixed(2)}ms`);
      
      const meetsTarget = averageTime < 100 && maxTime < 150; // Allow some buffer for max
      
      if (meetsTarget) {
        console.log('   ✅ Performance targets met');
        this.testResults.set('performance_targets', true);
      } else {
        console.log('   ⚠️ Performance targets not met');
        this.testResults.set('performance_targets', false);
      }
      
    } catch (error) {
      console.log('   ❌ Performance testing failed:', error.message);
      this.testResults.set('performance_targets', false);
    }
  }

  /**
   * Test 3: Unified Intelligence Quality
   */
  async testUnifiedIntelligenceQuality(): Promise<void> {
    console.log('\n3. Testing Unified Intelligence Quality...');
    
    try {
      const qualityScenarios = [
        {
          prompt: 'Fix production bug causing 503 errors for 100k users',
          expectedIntent: 'SOLVE',
          expectedComplexity: 'COMPLEX',
          expectedUrgency: 'high',
          minConfidence: 0.8
        },
        {
          prompt: 'Create simple hello world function',
          expectedIntent: 'CREATE',
          expectedComplexity: 'SIMPLE',
          expectedUrgency: 'normal',
          minConfidence: 0.7
        },
        {
          prompt: 'Explain how React hooks work with examples',
          expectedIntent: 'EXPLAIN',
          expectedComplexity: 'MODERATE',
          expectedUrgency: 'normal',
          minConfidence: 0.75
        }
      ];

      let qualityTests = 0;
      let qualityPassed = 0;

      for (const scenario of qualityScenarios) {
        qualityTests++;
        
        const level4Analysis: ContextualAnalysis = {
          intent: {
            category: scenario.expectedIntent,
            action: scenario.expectedIntent.toLowerCase(),
            confidence: 0.85
          },
          complexity: {
            level: scenario.expectedComplexity,
            score: scenario.expectedComplexity === 'SIMPLE' ? 1.5 : scenario.expectedComplexity === 'MODERATE' ? 2.5 : 3.5,
            factors: ['test_scenario']
          },
          confidence: 0.8,
          urgency: scenario.expectedUrgency,
          domain: 'general'
        };

        const input: Level4EnhancedInput = createUnifiedInput({
          prompt: scenario.prompt,
          context: {
            platform: 'Test',
            url: 'https://test.com',
            timestamp: Date.now(),
            sessionId: `quality-test-${qualityTests}`
          }
        }, level4Analysis);

        const result = await this.orchestrator.processUnifiedInput(input);
        const unifiedIntelligence = result.unifiedIntelligence;
        
        // Validate quality criteria
        const intentMatch = unifiedIntelligence.intent.category === scenario.expectedIntent;
        const complexityMatch = unifiedIntelligence.complexity.level === scenario.expectedComplexity;
        const confidenceOk = unifiedIntelligence.confidence >= scenario.minConfidence;
        const hasSuggestions = unifiedIntelligence.suggestions.length > 0;
        const hasReasoning = unifiedIntelligence.reasoning.length > 0;
        
        const scenarioPassed = intentMatch && complexityMatch && confidenceOk && hasSuggestions && hasReasoning;
        
        if (scenarioPassed) {
          qualityPassed++;
          console.log(`   ✅ "${scenario.prompt.substring(0, 40)}..." - Quality validated`);
        } else {
          console.log(`   ❌ "${scenario.prompt.substring(0, 40)}..." - Quality issues detected`);
          console.log(`      Intent: ${intentMatch ? '✅' : '❌'} (${unifiedIntelligence.intent.category})`);
          console.log(`      Complexity: ${complexityMatch ? '✅' : '❌'} (${unifiedIntelligence.complexity.level})`);
          console.log(`      Confidence: ${confidenceOk ? '✅' : '❌'} (${(unifiedIntelligence.confidence * 100).toFixed(1)}%)`);
        }
      }
      
      const qualityRate = (qualityPassed / qualityTests) * 100;
      console.log(`   📊 Quality validation rate: ${qualityRate.toFixed(1)}% (${qualityPassed}/${qualityTests})`);
      
      const meetsQuality = qualityRate >= 80;
      this.testResults.set('intelligence_quality', meetsQuality);
      
      if (meetsQuality) {
        console.log('   ✅ Unified intelligence quality meets standards');
      } else {
        console.log('   ⚠️ Unified intelligence quality below standards');
      }
      
    } catch (error) {
      console.log('   ❌ Quality testing failed:', error.message);
      this.testResults.set('intelligence_quality', false);
    }
  }

  /**
   * Test 4: Real-World Development Scenarios
   */
  async testRealWorldScenarios(): Promise<void> {
    console.log('\n4. Testing Real-World Development Scenarios...');
    
    try {
      const realWorldScenarios = [
        {
          name: 'GitHub Issue Investigation',
          prompt: 'Users reporting login failures after recent deployment',
          platform: 'GitHub',
          url: 'https://github.com/myproject/issues/123',
          expectedSuggestionTypes: ['action', 'workflow_step']
        },
        {
          name: 'VS Code Development',
          prompt: 'Add TypeScript support to existing JavaScript project',
          platform: 'VS Code',
          url: 'file:///project/tsconfig.json',
          expectedSuggestionTypes: ['template', 'action']
        },
        {
          name: 'ChatGPT Consultation',
          prompt: 'Best practices for React performance optimization',
          platform: 'ChatGPT',
          url: 'https://chat.openai.com',
          expectedSuggestionTypes: ['explanation', 'template']
        }
      ];

      let scenariosPassed = 0;

      for (const scenario of realWorldScenarios) {
        console.log(`   🔍 Testing: ${scenario.name}`);
        
        const input: Level4EnhancedInput = createUnifiedInput({
          prompt: scenario.prompt,
          context: {
            platform: scenario.platform,
            url: scenario.url,
            timestamp: Date.now(),
            sessionId: `real-world-${Date.now()}`
          }
        });

        const result = await this.orchestrator.processUnifiedInput(input);
        
        // Validate scenario-specific requirements
        const hasExpectedSuggestions = scenario.expectedSuggestionTypes.some(type =>
          result.unifiedIntelligence.suggestions.some(s => s.type.includes(type))
        );
        
        const hasContextualRelevance = result.unifiedIntelligence.suggestions.some(s =>
          s.sources.level4 || s.sources.level5Agents?.length > 0
        );
        
        const hasTransparency = result.unifiedIntelligence.transparency.decisionRationale.length > 0;
        
        if (hasExpectedSuggestions && hasContextualRelevance && hasTransparency) {
          scenariosPassed++;
          console.log(`      ✅ Scenario validated - ${result.unifiedIntelligence.suggestions.length} relevant suggestions`);
        } else {
          console.log(`      ❌ Scenario validation failed`);
          console.log(`         Expected suggestions: ${hasExpectedSuggestions ? '✅' : '❌'}`);
          console.log(`         Contextual relevance: ${hasContextualRelevance ? '✅' : '❌'}`);
          console.log(`         Transparency: ${hasTransparency ? '✅' : '❌'}`);
        }
      }
      
      const scenarioRate = (scenariosPassed / realWorldScenarios.length) * 100;
      console.log(`   📊 Real-world scenario success: ${scenarioRate.toFixed(1)}% (${scenariosPassed}/${realWorldScenarios.length})`);
      
      this.testResults.set('real_world_scenarios', scenarioRate >= 80);
      
    } catch (error) {
      console.log('   ❌ Real-world scenario testing failed:', error.message);
      this.testResults.set('real_world_scenarios', false);
    }
  }

  /**
   * Test 5: Error Handling and Fallbacks
   */
  async testErrorHandling(): Promise<void> {
    console.log('\n5. Testing Error Handling and Fallback Mechanisms...');
    
    try {
      // Test with invalid Level 4 analysis
      console.log('   🔧 Testing invalid Level 4 analysis handling...');
      
      const invalidLevel4Analysis = {
        intent: { category: 'INVALID', action: 'invalid', confidence: -1 },
        complexity: { level: 'UNKNOWN', score: NaN, factors: [] },
        confidence: 2.0 // Invalid confidence > 1
      } as any;

      const input: Level4EnhancedInput = createUnifiedInput({
        prompt: 'Test error handling with invalid analysis',
        context: {
          platform: 'Test',
          url: 'https://test.com',
          timestamp: Date.now(),
          sessionId: 'error-test-1'
        }
      }, invalidLevel4Analysis);

      const result = await this.orchestrator.processUnifiedInput(input);
      
      // Should still produce a result with fallback
      const hasFallback = result.unifiedIntelligence.suggestions.length > 0;
      const hasErrorHandling = result.unifiedIntelligence.confidence > 0;
      
      if (hasFallback && hasErrorHandling) {
        console.log('      ✅ Invalid analysis handled gracefully');
      } else {
        console.log('      ❌ Invalid analysis not handled properly');
      }
      
      // Test with missing Level 4 analysis
      console.log('   🔧 Testing missing Level 4 analysis handling...');
      
      const inputNoLevel4: Level4EnhancedInput = createUnifiedInput({
        prompt: 'Test without Level 4 analysis',
        context: {
          platform: 'Test',
          url: 'https://test.com',
          timestamp: Date.now(),
          sessionId: 'error-test-2'
        }
      });

      const resultNoLevel4 = await this.orchestrator.processUnifiedInput(inputNoLevel4);
      
      const hasSimulation = resultNoLevel4.level4Context.metadata?.simulatedAnalysis === true;
      const hasValidResult = resultNoLevel4.unifiedIntelligence.confidence > 0;
      
      if (hasSimulation && hasValidResult) {
        console.log('      ✅ Missing Level 4 analysis handled with simulation');
      } else {
        console.log('      ❌ Missing Level 4 analysis not handled properly');
      }
      
      this.testResults.set('error_handling', hasFallback && hasErrorHandling && hasSimulation && hasValidResult);
      
    } catch (error) {
      console.log('   ❌ Error handling test failed:', error.message);
      this.testResults.set('error_handling', false);
    }
  }

  /**
   * Validate basic integration requirements
   */
  private validateBasicIntegration(result: UnifiedOrchestrationResult): void {
    // Check required components
    if (!result.unifiedIntelligence) {
      throw new Error('Missing unified intelligence in result');
    }
    
    if (!result.level4Context) {
      throw new Error('Missing Level 4 context in result');
    }
    
    if (!result.integrationMetrics) {
      throw new Error('Missing integration metrics in result');
    }
    
    // Check unified intelligence structure
    const ui = result.unifiedIntelligence;
    if (!ui.intent || !ui.complexity || !ui.suggestions || !ui.reasoning) {
      throw new Error('Incomplete unified intelligence structure');
    }
    
    // Check integration metrics
    const metrics = result.integrationMetrics;
    if (metrics.totalUnifiedTime <= 0 || metrics.integrationTime < 0) {
      throw new Error('Invalid integration metrics');
    }
    
    // Check transparency
    if (!ui.transparency || !ui.transparency.level4Analysis || !ui.transparency.level5Orchestration) {
      throw new Error('Missing transparency information');
    }
  }

  /**
   * Generate comprehensive test report
   */
  private generateTestReport(): void {
    console.log('\n=== Level 4 + Level 5 Integration Test Report ===');
    
    const testCategories = [
      { key: 'basic_integration', name: 'Basic Integration', weight: 1.0 },
      { key: 'performance_targets', name: 'Performance Targets (<100ms)', weight: 1.2 },
      { key: 'intelligence_quality', name: 'Unified Intelligence Quality', weight: 1.1 },
      { key: 'real_world_scenarios', name: 'Real-World Scenarios', weight: 1.0 },
      { key: 'error_handling', name: 'Error Handling & Fallbacks', weight: 0.8 }
    ];
    
    let totalScore = 0;
    let maxScore = 0;
    let passedTests = 0;
    
    testCategories.forEach(category => {
      const passed = this.testResults.get(category.key) || false;
      const score = passed ? category.weight : 0;
      
      totalScore += score;
      maxScore += category.weight;
      
      if (passed) passedTests++;
      
      console.log(`${passed ? '✅' : '❌'} ${category.name}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const overallScore = (totalScore / maxScore) * 100;
    const testPassRate = (passedTests / testCategories.length) * 100;
    
    console.log(`\n📊 Overall Integration Score: ${overallScore.toFixed(1)}%`);
    console.log(`📊 Test Pass Rate: ${testPassRate.toFixed(1)}% (${passedTests}/${testCategories.length})`);
    
    if (overallScore >= 85 && testPassRate >= 80) {
      console.log('\n🎉 INTEGRATION VALIDATION SUCCESSFUL!');
      console.log('✅ Level 4 + Level 5 unified intelligence is production-ready');
      console.log('✅ Performance targets met');
      console.log('✅ Quality standards achieved');
      console.log('✅ Real-world scenarios validated');
    } else if (overallScore >= 70) {
      console.log('\n⚠️ INTEGRATION PARTIALLY SUCCESSFUL');
      console.log('🔧 Some improvements needed before production deployment');
    } else {
      console.log('\n❌ INTEGRATION VALIDATION FAILED');
      console.log('🚨 Significant issues need to be addressed');
    }
    
    console.log('\n📋 Next Steps:');
    if (overallScore >= 85) {
      console.log('- Proceed to Priority 2: Performance Optimization');
      console.log('- Implement intelligent caching system');
      console.log('- Add comprehensive monitoring');
    } else {
      console.log('- Address failing test categories');
      console.log('- Improve integration robustness');
      console.log('- Re-run validation suite');
    }
  }
}

// Run the integration validation
async function runIntegrationTests() {
  const validator = new IntegrationValidator();
  
  try {
    await validator.runComprehensiveTests();
    console.log('\n✅ Integration test suite completed successfully');
  } catch (error) {
    console.error('\n❌ Integration test suite failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}

export { IntegrationValidator, runIntegrationTests };
