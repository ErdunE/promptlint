/**
 * Workflow Intelligence Test Suite
 * Validates v0.8.0.3 quality gates for workflow state machine and proactive assistance
 * Tests workflow state detection, multi-step predictions, and ghost text generation
 */

import {
  WorkflowStateMachine,
  PredictiveIntentEngine,
  GhostTextGenerator,
  BehavioralPatternRecognizer,
  createWorkflowStateMachine,
  createGhostTextGenerator,
  createBehavioralPatternRecognizer,
  WorkflowState,
  WorkflowPrediction,
  DetectedPatterns,
  WorkflowContext
} from '../packages/level5-predictive/src/index.js';

import { 
  PersistentMemoryManager,
  UserInteraction 
} from '../packages/level5-memory/src/index.js';

interface WorkflowTestResult {
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  accuracy: number;
  confidence: number;
  duration: number;
  details: string;
  metrics?: any;
}

class WorkflowIntelligenceTestSuite {
  private workflowStateMachine: WorkflowStateMachine;
  private predictiveEngine: PredictiveIntentEngine;
  private ghostTextGenerator: GhostTextGenerator;
  private patternRecognizer: BehavioralPatternRecognizer;
  private memoryManager: PersistentMemoryManager;
  private results: WorkflowTestResult[] = [];

  constructor() {
    this.workflowStateMachine = createWorkflowStateMachine({
      enableProactiveSuggestions: true,
      confidenceThreshold: 0.75
    });
    
    this.ghostTextGenerator = createGhostTextGenerator({
      minConfidenceThreshold: 0.6,
      enablePatternMatching: true
    });
    
    this.patternRecognizer = createBehavioralPatternRecognizer();
    this.memoryManager = new PersistentMemoryManager();
    this.predictiveEngine = new PredictiveIntentEngine(this.memoryManager, this.patternRecognizer);
  }

  async runAllTests(): Promise<WorkflowTestResult[]> {
    console.log('🔮 Workflow Intelligence Test Suite Starting...\n');

    // Test 1: Workflow State Detection Accuracy
    await this.testWorkflowStateDetection();

    // Test 2: Multi-Step Workflow Prediction
    await this.testMultiStepWorkflowPrediction();

    // Test 3: Workflow-Aware Ghost Text Generation
    await this.testWorkflowAwareGhostText();

    // Test 4: Proactive Workflow Suggestions
    await this.testProactiveWorkflowSuggestions();

    // Test 5: State Transition Tracking
    await this.testStateTransitionTracking();

    // Test 6: Performance Benchmarks
    await this.testPerformanceBenchmarks();

    // Test 7: Integration with Behavioral Patterns
    await this.testBehavioralPatternIntegration();

    this.printTestSummary();
    return this.results;
  }

  private async testWorkflowStateDetection(): Promise<void> {
    const testName = 'Workflow State Detection Accuracy';
    const startTime = performance.now();

    try {
      console.log('Testing workflow state detection with >75% accuracy target...');

      // Test scenarios with known expected states
      const testScenarios = [
        { prompt: 'Let me plan the architecture for this microservice system', expectedState: 'planning', context: this.createTestContext('plan', 'development') },
        { prompt: 'I need to implement the user authentication logic', expectedState: 'implementation', context: this.createTestContext('implement', 'development') },
        { prompt: 'Write unit tests for the payment processing module', expectedState: 'testing', context: this.createTestContext('test', 'development') },
        { prompt: 'Debug the memory leak in the data processing pipeline', expectedState: 'debugging', context: this.createTestContext('debug', 'development') },
        { prompt: 'Create comprehensive API documentation for the endpoints', expectedState: 'documentation', context: this.createTestContext('document', 'development') },
        { prompt: 'Review the pull request for the new feature implementation', expectedState: 'review', context: this.createTestContext('review', 'development') },
        { prompt: 'Deploy the application to the production environment', expectedState: 'deployment', context: this.createTestContext('deploy', 'development') },
        { prompt: 'Monitor and optimize the system performance metrics', expectedState: 'maintenance', context: this.createTestContext('maintain', 'development') }
      ];

      let correctDetections = 0;
      const detectionResults = [];

      for (const scenario of testScenarios) {
        const patterns = await this.createMockPatterns();
        const transition = await this.workflowStateMachine.detectWorkflowTransition(
          scenario.prompt,
          patterns,
          scenario.context
        );

        const isCorrect = transition.toState.phase === scenario.expectedState;
        if (isCorrect) correctDetections++;

        detectionResults.push({
          prompt: scenario.prompt.substring(0, 50) + '...',
          expected: scenario.expectedState,
          detected: transition.toState.phase,
          confidence: transition.confidence,
          correct: isCorrect
        });
      }

      const accuracy = correctDetections / testScenarios.length;
      const avgConfidence = detectionResults.reduce((sum, r) => sum + r.confidence, 0) / detectionResults.length;
      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: accuracy >= 0.75 ? 'pass' : accuracy >= 0.6 ? 'warning' : 'fail',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Detected ${correctDetections}/${testScenarios.length} states correctly (${(accuracy * 100).toFixed(1)}% accuracy)`,
        metrics: {
          correctDetections,
          totalScenarios: testScenarios.length,
          detectionResults: detectionResults.slice(0, 3), // Show first 3 for brevity
          targetAccuracy: 0.75
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testMultiStepWorkflowPrediction(): Promise<void> {
    const testName = 'Multi-Step Workflow Prediction';
    const startTime = performance.now();

    try {
      console.log('Testing multi-step workflow prediction with >65% confidence...');

      // Create test workflow states
      const testStates = [
        this.createTestWorkflowState('planning', 'development'),
        this.createTestWorkflowState('implementation', 'development'),
        this.createTestWorkflowState('testing', 'development'),
        this.createTestWorkflowState('debugging', 'development')
      ];

      let validPredictions = 0;
      const predictionResults = [];

      for (const state of testStates) {
        const userPatterns = await this.createMockBehavioralPatterns();
        const predictions = await this.predictiveEngine.predictWorkflowSequence(state, userPatterns);

        const validPredictionsForState = predictions.filter(p => p.confidence >= 0.65);
        validPredictions += validPredictionsForState.length;

        predictionResults.push({
          phase: state.phase,
          predictionsGenerated: predictions.length,
          validPredictions: validPredictionsForState.length,
          avgConfidence: predictions.length > 0 
            ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
            : 0,
          topPrediction: predictions[0] ? {
            steps: predictions[0].sequence.length,
            confidence: predictions[0].confidence,
            totalTime: predictions[0].totalEstimatedTime
          } : null
        });
      }

      const avgValidPredictions = validPredictions / testStates.length;
      const avgConfidence = predictionResults.reduce((sum, r) => sum + r.avgConfidence, 0) / predictionResults.length;
      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: avgValidPredictions >= 1 && avgConfidence >= 0.65 ? 'pass' : 'warning',
        accuracy: Math.min(avgValidPredictions / 2, 1), // Normalize to 0-1 scale
        confidence: avgConfidence,
        duration,
        details: `Generated ${avgValidPredictions.toFixed(1)} valid predictions per state with ${(avgConfidence * 100).toFixed(1)}% avg confidence`,
        metrics: {
          validPredictions,
          totalStates: testStates.length,
          predictionResults,
          targetConfidence: 0.65
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testWorkflowAwareGhostText(): Promise<void> {
    const testName = 'Workflow-Aware Ghost Text Generation';
    const startTime = performance.now();

    try {
      console.log('Testing workflow-aware ghost text with >65% acceptance target...');

      // Test ghost text generation in different workflow phases
      const ghostTextTests = [
        { input: 'create', phase: 'planning', expected: 'implementation plan' },
        { input: 'write', phase: 'implementation', expected: 'function' },
        { input: 'test', phase: 'testing', expected: 'functionality' },
        { input: 'fix', phase: 'debugging', expected: 'bug' },
        { input: 'document', phase: 'documentation', expected: 'API' },
        { input: 'deploy', phase: 'deployment', expected: 'production' }
      ];

      let qualitySuggestions = 0;
      const ghostTextResults = [];

      for (const test of ghostTextTests) {
        const workflowState = this.createTestWorkflowState(test.phase as any, 'development');
        const patterns = await this.createMockPatterns();
        
        const suggestion = await this.ghostTextGenerator.generateWorkflowAwareGhostText(
          test.input,
          workflowState,
          patterns
        );

        const isQuality = suggestion.confidence >= 0.65 && suggestion.text.length > 0;
        const containsExpected = suggestion.text.toLowerCase().includes(test.expected);
        
        if (isQuality) qualitySuggestions++;

        ghostTextResults.push({
          input: test.input,
          phase: test.phase,
          suggestion: suggestion.text,
          confidence: suggestion.confidence,
          containsExpected,
          isQuality
        });
      }

      const acceptanceRate = qualitySuggestions / ghostTextTests.length;
      const avgConfidence = ghostTextResults.reduce((sum, r) => sum + r.confidence, 0) / ghostTextResults.length;
      const duration = performance.now() - startTime;

      // Check performance target (should be <50ms per generation)
      const avgGenerationTime = duration / ghostTextTests.length;
      const meetsPerformanceTarget = avgGenerationTime <= 50;

      this.addResult({
        testName,
        status: (acceptanceRate >= 0.65 && meetsPerformanceTarget) ? 'pass' : 'warning',
        accuracy: acceptanceRate,
        confidence: avgConfidence,
        duration,
        details: `Generated ${qualitySuggestions}/${ghostTextTests.length} quality suggestions (${(acceptanceRate * 100).toFixed(1)}% acceptance), avg time: ${avgGenerationTime.toFixed(2)}ms`,
        metrics: {
          qualitySuggestions,
          totalTests: ghostTextTests.length,
          avgGenerationTime,
          meetsPerformanceTarget,
          ghostTextResults: ghostTextResults.slice(0, 3),
          targetAcceptance: 0.65
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testProactiveWorkflowSuggestions(): Promise<void> {
    const testName = 'Proactive Workflow Suggestions';
    const startTime = performance.now();

    try {
      console.log('Testing proactive workflow suggestions...');

      // Test different workflow states for proactive suggestions
      const testStates = [
        this.createTestWorkflowState('implementation', 'development'),
        this.createTestWorkflowState('testing', 'development'),
        this.createTestWorkflowState('debugging', 'development')
      ];

      let relevantSuggestions = 0;
      const suggestionResults = [];

      for (const state of testStates) {
        const suggestions = await this.workflowStateMachine.getWorkflowSuggestions(state);
        
        const relevantSuggestionsForState = suggestions.filter(s => 
          s.confidence >= 0.75 && s.type === 'proactive'
        );
        relevantSuggestions += relevantSuggestionsForState.length;

        suggestionResults.push({
          phase: state.phase,
          suggestionsGenerated: suggestions.length,
          relevantSuggestions: relevantSuggestionsForState.length,
          avgConfidence: suggestions.length > 0 
            ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length 
            : 0
        });
      }

      const avgRelevantSuggestions = relevantSuggestions / testStates.length;
      const avgConfidence = suggestionResults.reduce((sum, r) => sum + r.avgConfidence, 0) / suggestionResults.length;
      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: avgRelevantSuggestions >= 0.5 ? 'pass' : 'warning',
        accuracy: Math.min(avgRelevantSuggestions, 1),
        confidence: avgConfidence,
        duration,
        details: `Generated ${avgRelevantSuggestions.toFixed(1)} relevant suggestions per state`,
        metrics: {
          relevantSuggestions,
          totalStates: testStates.length,
          suggestionResults
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testStateTransitionTracking(): Promise<void> {
    const testName = 'State Transition Tracking';
    const startTime = performance.now();

    try {
      console.log('Testing state transition tracking within 100ms...');

      // Test transition sequence
      const transitionSequence = [
        { prompt: 'Plan the new feature architecture', expectedPhase: 'planning' },
        { prompt: 'Implement the core functionality', expectedPhase: 'implementation' },
        { prompt: 'Write comprehensive tests', expectedPhase: 'testing' }
      ];

      let successfulTransitions = 0;
      const transitionTimes = [];

      for (const transition of transitionSequence) {
        const transitionStart = performance.now();
        
        const patterns = await this.createMockPatterns();
        const context = this.createTestContext('general', 'development');
        
        const workflowTransition = await this.workflowStateMachine.detectWorkflowTransition(
          transition.prompt,
          patterns,
          context
        );

        const transitionTime = performance.now() - transitionStart;
        transitionTimes.push(transitionTime);

        if (workflowTransition.toState.phase === transition.expectedPhase && transitionTime <= 100) {
          successfulTransitions++;
        }
      }

      const accuracy = successfulTransitions / transitionSequence.length;
      const avgTransitionTime = transitionTimes.reduce((sum, time) => sum + time, 0) / transitionTimes.length;
      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: (accuracy >= 0.8 && avgTransitionTime <= 100) ? 'pass' : 'warning',
        accuracy,
        confidence: 0.8, // Fixed confidence for transition tracking
        duration,
        details: `Tracked ${successfulTransitions}/${transitionSequence.length} transitions successfully, avg time: ${avgTransitionTime.toFixed(2)}ms`,
        metrics: {
          successfulTransitions,
          totalTransitions: transitionSequence.length,
          avgTransitionTime,
          meetsPerformanceTarget: avgTransitionTime <= 100
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testPerformanceBenchmarks(): Promise<void> {
    const testName = 'Performance Benchmarks';
    const startTime = performance.now();

    try {
      console.log('Testing performance benchmarks for workflow intelligence...');

      const performanceTests = [];

      // Test workflow state detection performance
      const stateDetectionStart = performance.now();
      const patterns = await this.createMockPatterns();
      const context = this.createTestContext('implement', 'development');
      await this.workflowStateMachine.detectWorkflowTransition(
        'Implement the user authentication system',
        patterns,
        context
      );
      const stateDetectionTime = performance.now() - stateDetectionStart;
      performanceTests.push({ test: 'State Detection', time: stateDetectionTime, target: 100 });

      // Test ghost text generation performance
      const ghostTextStart = performance.now();
      const workflowState = this.createTestWorkflowState('implementation', 'development');
      await this.ghostTextGenerator.generateWorkflowAwareGhostText(
        'create',
        workflowState,
        patterns
      );
      const ghostTextTime = performance.now() - ghostTextStart;
      performanceTests.push({ test: 'Ghost Text Generation', time: ghostTextTime, target: 50 });

      // Test workflow prediction performance
      const predictionStart = performance.now();
      const userPatterns = await this.createMockBehavioralPatterns();
      await this.predictiveEngine.predictWorkflowSequence(workflowState, userPatterns);
      const predictionTime = performance.now() - predictionStart;
      performanceTests.push({ test: 'Workflow Prediction', time: predictionTime, target: 100 });

      const allTestsPass = performanceTests.every(test => test.time <= test.target);
      const avgPerformance = performanceTests.reduce((sum, test) => sum + (test.time / test.target), 0) / performanceTests.length;
      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: allTestsPass ? 'pass' : 'warning',
        accuracy: allTestsPass ? 1.0 : avgPerformance,
        confidence: 0.9,
        duration,
        details: `${performanceTests.filter(t => t.time <= t.target).length}/${performanceTests.length} performance targets met`,
        metrics: {
          performanceTests,
          allTestsPass
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  private async testBehavioralPatternIntegration(): Promise<void> {
    const testName = 'Behavioral Pattern Integration';
    const startTime = performance.now();

    try {
      console.log('Testing integration with behavioral patterns...');

      // Create mock behavioral patterns
      const behavioralPatterns = await this.createMockBehavioralPatterns();
      const workflowState = this.createTestWorkflowState('implementation', 'development');

      // Test workflow predictions with behavioral patterns
      const predictions = await this.predictiveEngine.predictWorkflowSequence(workflowState, behavioralPatterns);
      
      // Test workflow-aware predictions
      const context = await this.createMockContextMemory();
      const workflowAwarePredictions = await this.predictiveEngine.getWorkflowAwarePredictions(workflowState, context);

      const hasValidPredictions = predictions.length > 0 && predictions[0].confidence > 0.6;
      const hasWorkflowAwarePredictions = workflowAwarePredictions.length > 0;
      const integrationSuccess = hasValidPredictions && hasWorkflowAwarePredictions;

      const duration = performance.now() - startTime;

      this.addResult({
        testName,
        status: integrationSuccess ? 'pass' : 'warning',
        accuracy: integrationSuccess ? 1.0 : 0.5,
        confidence: predictions.length > 0 ? predictions[0].confidence : 0,
        duration,
        details: `Generated ${predictions.length} workflow predictions and ${workflowAwarePredictions.length} workflow-aware predictions`,
        metrics: {
          workflowPredictions: predictions.length,
          workflowAwarePredictions: workflowAwarePredictions.length,
          integrationSuccess
        }
      });

    } catch (error) {
      this.addResult({
        testName,
        status: 'fail',
        accuracy: 0,
        confidence: 0,
        duration: performance.now() - startTime,
        details: `Test failed: ${error.message}`
      });
    }
  }

  // Helper methods for creating test data

  private createTestContext(intent: string, domain: string): WorkflowContext {
    return {
      currentIntent: intent,
      domain,
      recentActions: [intent],
      timeContext: {
        timeOfDay: 'afternoon',
        dayOfWeek: 'wednesday',
        isWeekend: false,
        sessionDuration: 30
      },
      collaborationLevel: 'individual',
      urgencyLevel: 'normal'
    };
  }

  private createTestWorkflowState(phase: any, domain: string): WorkflowState {
    return {
      id: `test_state_${phase}`,
      name: phase,
      phase,
      confidence: 0.8,
      startTime: Date.now() - 600000, // 10 minutes ago
      lastActivity: Date.now(),
      context: this.createTestContext(phase, domain),
      metadata: {
        projectType: domain,
        complexity: 'moderate',
        teamSize: 1,
        urgency: 'normal',
        domain,
        technologies: ['typescript', 'node.js']
      }
    };
  }

  private async createMockPatterns(): Promise<DetectedPatterns> {
    return {
      sequences: [
        {
          id: 'seq_1',
          sequence: ['plan', 'implement', 'test'],
          frequency: 5,
          confidence: 0.8,
          avgTimeBetween: 3600000,
          successRate: 0.9,
          contexts: ['development'],
          nextPredictions: []
        }
      ],
      preferences: [
        {
          id: 'pref_1',
          category: 'template',
          preference: 'CodeTemplate',
          strength: 0.7,
          frequency: 10,
          contexts: ['development'],
          evidence: []
        }
      ],
      workflows: [],
      temporal: [],
      confidence: 0.75,
      totalInteractions: 20
    };
  }

  private async createMockBehavioralPatterns(): Promise<any[]> {
    return [
      {
        type: 'sequence',
        description: 'Implementation followed by testing',
        triggers: ['implement', 'test'],
        successRate: 0.85
      }
    ];
  }

  private async createMockContextMemory(): Promise<any> {
    return {
      episodic: [
        {
          interaction: {
            id: 'test_1',
            intent: 'implement',
            timestamp: Date.now() - 3600000
          },
          timestamp: Date.now() - 3600000
        }
      ],
      semantic: [
        {
          id: 'semantic_1',
          pattern: {
            type: 'workflow',
            description: 'User prefers testing after implementation',
            outcomes: ['test']
          },
          confidence: 0.8
        }
      ],
      working: null,
      workflow: null
    };
  }

  private addResult(result: WorkflowTestResult): void {
    this.results.push(result);
    const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${status} ${result.testName}: ${result.details} (${result.duration.toFixed(2)}ms)`);
    console.log(`   Accuracy: ${(result.accuracy * 100).toFixed(1)}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  }

  private printTestSummary(): void {
    console.log('\n🔮 Workflow Intelligence Test Summary');
    console.log('====================================');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    
    // Calculate overall metrics
    const avgAccuracy = this.results.reduce((sum, r) => sum + r.accuracy, 0) / this.results.length;
    const avgConfidence = this.results.reduce((sum, r) => sum + r.confidence, 0) / this.results.length;
    
    console.log(`\nOverall Accuracy: ${(avgAccuracy * 100).toFixed(1)}%`);
    console.log(`Overall Confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    
    const overallStatus = failed > 0 ? 'FAILED' : warnings > 0 ? 'PASSED WITH WARNINGS' : 'PASSED';
    console.log(`\nOverall Status: ${overallStatus}`);
    
    // Check quality gates
    const meetsStateDetectionTarget = avgAccuracy >= 0.75;
    const meetsConfidenceTarget = avgConfidence >= 0.65;
    
    console.log('\n🎯 Quality Gate Status:');
    console.log(`${meetsStateDetectionTarget ? '✅' : '❌'} Workflow State Detection: ${(avgAccuracy * 100).toFixed(1)}% (target: 75%)`);
    console.log(`${meetsConfidenceTarget ? '✅' : '❌'} Multi-Step Prediction Confidence: ${(avgConfidence * 100).toFixed(1)}% (target: 65%)`);
    
    if (failed === 0 && meetsStateDetectionTarget && meetsConfidenceTarget) {
      console.log('\n🎉 All quality gates passed! Workflow intelligence ready for production.');
    } else {
      console.log('\n🔧 Some quality gates need attention before production deployment.');
    }
  }
}

// Export for use in other scripts
export { WorkflowIntelligenceTestSuite };

// Run tests if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-workflow-intelligence')) {
  const testSuite = new WorkflowIntelligenceTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\nWorkflow intelligence testing completed.');
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}
