/**
 * Behavioral Pattern Recognition Integration Tests
 * Tests pattern recognition across realistic user workflows
 * Validates >80% sequence accuracy and >70% prediction confidence
 */

import { 
  BehavioralPatternRecognizer,
  GhostTextGenerator,
  createBehavioralPatternRecognizer,
  createGhostTextGenerator,
  DetectedPatterns,
  WorkflowContext,
  PredictedAction
} from '../packages/level5-predictive/src/index.js';

import { 
  UserInteraction,
  createPersistentMemoryManager 
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

class BehavioralPatternTestSuite {
  private patternRecognizer: BehavioralPatternRecognizer;
  private ghostTextGenerator: GhostTextGenerator;
  private results: WorkflowTestResult[] = [];

  constructor() {
    this.patternRecognizer = createBehavioralPatternRecognizer();
    this.ghostTextGenerator = createGhostTextGenerator({
      minConfidenceThreshold: 0.6,
      enablePatternMatching: true
    });
  }

  async runAllTests(): Promise<WorkflowTestResult[]> {
    console.log('🧠 Behavioral Pattern Recognition Test Suite Starting...\n');

    // Test 1: Sequential Task Workflows
    await this.testSequentialWorkflows();

    // Test 2: Domain-Specific Preferences
    await this.testDomainPreferences();

    // Test 3: Time-Based Patterns
    await this.testTemporalPatterns();

    // Test 4: Error Recovery Patterns
    await this.testErrorRecoveryPatterns();

    // Test 5: Ghost Text Generation
    await this.testGhostTextGeneration();

    // Test 6: Real-Time Pattern Learning
    await this.testRealTimePatternLearning();

    // Test 7: Prediction Accuracy
    await this.testPredictionAccuracy();

    this.printTestSummary();
    return this.results;
  }

  private async testSequentialWorkflows(): Promise<void> {
    const testName = 'Sequential Task Workflows';
    const startTime = performance.now();

    try {
      console.log('Testing sequential workflow pattern recognition...');

      // Create realistic development workflow: implement → test → document
      const workflowInteractions = this.createDevelopmentWorkflow();

      // Analyze patterns
      const patterns = await this.patternRecognizer.analyzeUserBehavior(workflowInteractions);

      // Validate sequence detection
      const implementTestSequence = patterns.sequences.find(seq => 
        seq.sequence.includes('implement') && seq.sequence.includes('test')
      );

      const testDocumentSequence = patterns.sequences.find(seq =>
        seq.sequence.includes('test') && seq.sequence.includes('document')
      );

      const duration = performance.now() - startTime;

      // Calculate accuracy
      let accuracy = 0;
      if (implementTestSequence && implementTestSequence.confidence > 0.7) accuracy += 0.5;
      if (testDocumentSequence && testDocumentSequence.confidence > 0.7) accuracy += 0.5;

      const avgConfidence = patterns.sequences.length > 0 
        ? patterns.sequences.reduce((sum, seq) => sum + seq.confidence, 0) / patterns.sequences.length
        : 0;

      this.addResult({
        testName,
        status: accuracy >= 0.8 ? 'pass' : accuracy >= 0.6 ? 'warning' : 'fail',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Detected ${patterns.sequences.length} sequences with avg confidence ${(avgConfidence * 100).toFixed(1)}%`,
        metrics: {
          sequencesDetected: patterns.sequences.length,
          implementTestFound: !!implementTestSequence,
          testDocumentFound: !!testDocumentSequence,
          targetAccuracy: 0.8
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

  private async testDomainPreferences(): Promise<void> {
    const testName = 'Domain-Specific Preferences';
    const startTime = performance.now();

    try {
      console.log('Testing domain-specific preference detection...');

      // Create interactions showing template preferences by domain
      const preferenceInteractions = this.createDomainPreferenceInteractions();

      const patterns = await this.patternRecognizer.analyzeUserBehavior(preferenceInteractions);

      // Validate preference detection
      const codeTemplatePreference = patterns.preferences.find(pref =>
        pref.category === 'template' && pref.preference.includes('Code')
      );

      const bulletTemplatePreference = patterns.preferences.find(pref =>
        pref.category === 'template' && pref.preference.includes('Bullet')
      );

      const duration = performance.now() - startTime;

      // Calculate accuracy based on detected preferences
      let accuracy = 0;
      if (codeTemplatePreference && codeTemplatePreference.strength > 0.6) accuracy += 0.5;
      if (bulletTemplatePreference && bulletTemplatePreference.strength > 0.6) accuracy += 0.5;

      const avgStrength = patterns.preferences.length > 0
        ? patterns.preferences.reduce((sum, pref) => sum + pref.strength, 0) / patterns.preferences.length
        : 0;

      this.addResult({
        testName,
        status: accuracy >= 0.8 ? 'pass' : accuracy >= 0.5 ? 'warning' : 'fail',
        accuracy,
        confidence: avgStrength,
        duration,
        details: `Detected ${patterns.preferences.length} preferences with avg strength ${(avgStrength * 100).toFixed(1)}%`,
        metrics: {
          preferencesDetected: patterns.preferences.length,
          codeTemplateFound: !!codeTemplatePreference,
          bulletTemplateFound: !!bulletTemplatePreference,
          targetAccuracy: 0.8
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

  private async testTemporalPatterns(): Promise<void> {
    const testName = 'Time-Based Patterns';
    const startTime = performance.now();

    try {
      console.log('Testing temporal pattern detection...');

      // Create interactions with time-based patterns
      const temporalInteractions = this.createTemporalInteractions();

      const patterns = await this.patternRecognizer.analyzeUserBehavior(temporalInteractions);

      // Validate temporal pattern detection
      const morningPatterns = patterns.temporal.filter(temp => temp.timeOfDay === 'morning');
      const afternoonPatterns = patterns.temporal.filter(temp => temp.timeOfDay === 'afternoon');

      const duration = performance.now() - startTime;

      // Calculate accuracy
      const accuracy = (morningPatterns.length > 0 && afternoonPatterns.length > 0) ? 1.0 : 0.5;
      
      const avgConfidence = patterns.temporal.length > 0
        ? patterns.temporal.reduce((sum, temp) => sum + temp.confidence, 0) / patterns.temporal.length
        : 0;

      this.addResult({
        testName,
        status: accuracy >= 0.8 ? 'pass' : 'warning',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Detected ${patterns.temporal.length} temporal patterns`,
        metrics: {
          temporalPatterns: patterns.temporal.length,
          morningPatterns: morningPatterns.length,
          afternoonPatterns: afternoonPatterns.length,
          targetAccuracy: 0.8
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

  private async testErrorRecoveryPatterns(): Promise<void> {
    const testName = 'Error Recovery Patterns';
    const startTime = performance.now();

    try {
      console.log('Testing error recovery pattern detection...');

      // Create interactions showing error recovery patterns
      const errorRecoveryInteractions = this.createErrorRecoveryInteractions();

      const patterns = await this.patternRecognizer.analyzeUserBehavior(errorRecoveryInteractions);

      // Look for error → solve → test patterns
      const errorRecoverySequences = patterns.sequences.filter(seq =>
        seq.sequence.includes('solve') && seq.sequence.includes('test')
      );

      const duration = performance.now() - startTime;

      const accuracy = errorRecoverySequences.length > 0 ? 1.0 : 0.0;
      const avgConfidence = errorRecoverySequences.length > 0
        ? errorRecoverySequences.reduce((sum, seq) => sum + seq.confidence, 0) / errorRecoverySequences.length
        : 0;

      this.addResult({
        testName,
        status: accuracy >= 0.7 ? 'pass' : 'warning',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Detected ${errorRecoverySequences.length} error recovery patterns`,
        metrics: {
          errorRecoverySequences: errorRecoverySequences.length,
          totalSequences: patterns.sequences.length,
          targetAccuracy: 0.7
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

  private async testGhostTextGeneration(): Promise<void> {
    const testName = 'Ghost Text Generation';
    const startTime = performance.now();

    try {
      console.log('Testing ghost text generation with patterns...');

      // Create patterns for ghost text context
      const interactions = this.createDevelopmentWorkflow();
      const patterns = await this.patternRecognizer.analyzeUserBehavior(interactions);

      // Test ghost text generation scenarios
      const testCases = [
        { input: 'create a', context: this.createWorkflowContext('create', 'development') },
        { input: 'write a', context: this.createWorkflowContext('write', 'documentation') },
        { input: 'implement', context: this.createWorkflowContext('implement', 'development') },
        { input: 'help me', context: this.createWorkflowContext('solve', 'general') }
      ];

      let successfulSuggestions = 0;
      const suggestions = [];

      for (const testCase of testCases) {
        const suggestion = await this.ghostTextGenerator.generateGhostText(
          testCase.input,
          patterns,
          testCase.context
        );

        suggestions.push(suggestion);

        if (suggestion.confidence >= 0.6 && suggestion.text.length > 0) {
          successfulSuggestions++;
        }
      }

      const duration = performance.now() - startTime;
      const accuracy = successfulSuggestions / testCases.length;
      const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;

      // Check 50ms performance target
      const avgGenerationTime = duration / testCases.length;
      const meetsPerformanceTarget = avgGenerationTime <= 50;

      this.addResult({
        testName,
        status: (accuracy >= 0.6 && meetsPerformanceTarget) ? 'pass' : 'warning',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Generated ${successfulSuggestions}/${testCases.length} quality suggestions, avg time: ${avgGenerationTime.toFixed(2)}ms`,
        metrics: {
          successfulSuggestions,
          totalTestCases: testCases.length,
          avgGenerationTime,
          meetsPerformanceTarget,
          targetAccuracy: 0.6
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

  private async testRealTimePatternLearning(): Promise<void> {
    const testName = 'Real-Time Pattern Learning';
    const startTime = performance.now();

    try {
      console.log('Testing real-time pattern learning...');

      // Start with empty patterns
      const initialPatterns = await this.patternRecognizer.analyzeUserBehavior([]);

      // Add interactions one by one and check learning
      const learningInteractions = this.createLearningSequence();
      const learningResults = [];

      for (let i = 1; i <= learningInteractions.length; i++) {
        const currentInteractions = learningInteractions.slice(0, i);
        const patterns = await this.patternRecognizer.analyzeUserBehavior(currentInteractions);
        
        learningResults.push({
          interactionCount: i,
          sequenceCount: patterns.sequences.length,
          preferenceCount: patterns.preferences.length,
          confidence: patterns.confidence
        });
      }

      const duration = performance.now() - startTime;

      // Check if patterns emerge as more interactions are added
      const finalResult = learningResults[learningResults.length - 1];
      const learningProgression = learningResults.some((result, index) => 
        index > 0 && result.sequenceCount > learningResults[index - 1].sequenceCount
      );

      const accuracy = (finalResult.sequenceCount > 0 && learningProgression) ? 1.0 : 0.5;

      this.addResult({
        testName,
        status: accuracy >= 0.8 ? 'pass' : 'warning',
        accuracy,
        confidence: finalResult.confidence,
        duration,
        details: `Learned ${finalResult.sequenceCount} sequences and ${finalResult.preferenceCount} preferences from ${learningInteractions.length} interactions`,
        metrics: {
          finalSequences: finalResult.sequenceCount,
          finalPreferences: finalResult.preferenceCount,
          learningProgression,
          interactionCount: learningInteractions.length,
          targetAccuracy: 0.8
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

  private async testPredictionAccuracy(): Promise<void> {
    const testName = 'Prediction Accuracy';
    const startTime = performance.now();

    try {
      console.log('Testing prediction accuracy with known patterns...');

      // Create known workflow pattern
      const knownWorkflow = this.createKnownWorkflowPattern();
      const patterns = await this.patternRecognizer.analyzeUserBehavior(knownWorkflow);

      // Test predictions at different workflow stages
      const predictionTests = [
        { context: this.createWorkflowContext('create', 'development'), expectedNext: 'test' },
        { context: this.createWorkflowContext('test', 'development'), expectedNext: 'document' },
        { context: this.createWorkflowContext('analyze', 'general'), expectedNext: 'solve' }
      ];

      let correctPredictions = 0;
      const allPredictions = [];

      for (const test of predictionTests) {
        const predictions = await this.patternRecognizer.predictNextAction(test.context);
        allPredictions.push(...predictions);

        // Check if any prediction matches expected next action
        const hasCorrectPrediction = predictions.some(pred => 
          pred.action === test.expectedNext && pred.confidence >= 0.7
        );

        if (hasCorrectPrediction) {
          correctPredictions++;
        }
      }

      const duration = performance.now() - startTime;
      const accuracy = correctPredictions / predictionTests.length;
      const avgConfidence = allPredictions.length > 0
        ? allPredictions.reduce((sum, pred) => sum + pred.confidence, 0) / allPredictions.length
        : 0;

      this.addResult({
        testName,
        status: accuracy >= 0.7 ? 'pass' : 'warning',
        accuracy,
        confidence: avgConfidence,
        duration,
        details: `Correctly predicted ${correctPredictions}/${predictionTests.length} next actions with avg confidence ${(avgConfidence * 100).toFixed(1)}%`,
        metrics: {
          correctPredictions,
          totalTests: predictionTests.length,
          totalPredictions: allPredictions.length,
          targetAccuracy: 0.7
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

  private createDevelopmentWorkflow(): UserInteraction[] {
    const baseTime = Date.now() - 3600000; // 1 hour ago
    
    return [
      this.createInteraction('dev_1', 'create', 'development', baseTime, 'CodeTemplate'),
      this.createInteraction('dev_2', 'implement', 'development', baseTime + 300000, 'StepByStepTemplate'),
      this.createInteraction('dev_3', 'test', 'development', baseTime + 600000, 'CodeTemplate'),
      this.createInteraction('dev_4', 'document', 'development', baseTime + 900000, 'BulletTemplate'),
      this.createInteraction('dev_5', 'create', 'development', baseTime + 1200000, 'CodeTemplate'),
      this.createInteraction('dev_6', 'implement', 'development', baseTime + 1500000, 'StepByStepTemplate'),
      this.createInteraction('dev_7', 'test', 'development', baseTime + 1800000, 'CodeTemplate'),
      this.createInteraction('dev_8', 'document', 'development', baseTime + 2100000, 'BulletTemplate')
    ];
  }

  private createDomainPreferenceInteractions(): UserInteraction[] {
    const baseTime = Date.now() - 7200000; // 2 hours ago
    
    return [
      // Development domain prefers CodeTemplate
      this.createInteraction('pref_1', 'create', 'development', baseTime, 'CodeTemplate'),
      this.createInteraction('pref_2', 'implement', 'development', baseTime + 300000, 'CodeTemplate'),
      this.createInteraction('pref_3', 'solve', 'development', baseTime + 600000, 'CodeTemplate'),
      
      // Analysis domain prefers BulletTemplate
      this.createInteraction('pref_4', 'analyze', 'analysis', baseTime + 900000, 'BulletTemplate'),
      this.createInteraction('pref_5', 'review', 'analysis', baseTime + 1200000, 'BulletTemplate'),
      this.createInteraction('pref_6', 'compare', 'analysis', baseTime + 1500000, 'BulletTemplate')
    ];
  }

  private createTemporalInteractions(): UserInteraction[] {
    const today = new Date();
    const morningTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).getTime();
    const afternoonTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).getTime();
    
    return [
      // Morning activities - planning and analysis
      this.createInteraction('temp_1', 'plan', 'general', morningTime),
      this.createInteraction('temp_2', 'analyze', 'general', morningTime + 600000),
      this.createInteraction('temp_3', 'plan', 'general', morningTime + 1200000),
      
      // Afternoon activities - implementation
      this.createInteraction('temp_4', 'implement', 'development', afternoonTime),
      this.createInteraction('temp_5', 'create', 'development', afternoonTime + 600000),
      this.createInteraction('temp_6', 'implement', 'development', afternoonTime + 1200000)
    ];
  }

  private createErrorRecoveryInteractions(): UserInteraction[] {
    const baseTime = Date.now() - 1800000; // 30 minutes ago
    
    return [
      this.createInteraction('err_1', 'create', 'development', baseTime),
      this.createInteraction('err_2', 'solve', 'development', baseTime + 300000), // Error occurred
      this.createInteraction('err_3', 'test', 'development', baseTime + 600000), // Test after fix
      this.createInteraction('err_4', 'implement', 'development', baseTime + 900000),
      this.createInteraction('err_5', 'solve', 'development', baseTime + 1200000), // Another error
      this.createInteraction('err_6', 'test', 'development', baseTime + 1500000) // Test after fix
    ];
  }

  private createLearningSequence(): UserInteraction[] {
    const baseTime = Date.now() - 900000; // 15 minutes ago
    
    return [
      this.createInteraction('learn_1', 'create', 'development', baseTime),
      this.createInteraction('learn_2', 'test', 'development', baseTime + 180000),
      this.createInteraction('learn_3', 'create', 'development', baseTime + 360000),
      this.createInteraction('learn_4', 'test', 'development', baseTime + 540000),
      this.createInteraction('learn_5', 'create', 'development', baseTime + 720000),
      this.createInteraction('learn_6', 'test', 'development', baseTime + 900000)
    ];
  }

  private createKnownWorkflowPattern(): UserInteraction[] {
    const baseTime = Date.now() - 2700000; // 45 minutes ago
    
    return [
      // Repeat the create → test → document pattern multiple times
      this.createInteraction('known_1', 'create', 'development', baseTime),
      this.createInteraction('known_2', 'test', 'development', baseTime + 300000),
      this.createInteraction('known_3', 'document', 'development', baseTime + 600000),
      this.createInteraction('known_4', 'create', 'development', baseTime + 900000),
      this.createInteraction('known_5', 'test', 'development', baseTime + 1200000),
      this.createInteraction('known_6', 'document', 'development', baseTime + 1500000),
      this.createInteraction('known_7', 'create', 'development', baseTime + 1800000),
      this.createInteraction('known_8', 'test', 'development', baseTime + 2100000),
      this.createInteraction('known_9', 'document', 'development', baseTime + 2400000)
    ];
  }

  private createInteraction(
    id: string, 
    intent: string, 
    domain: string, 
    timestamp: number, 
    template?: string
  ): UserInteraction {
    return {
      id,
      timestamp,
      sessionId: 'test_session',
      prompt: `Test prompt for ${intent} in ${domain}`,
      intent,
      complexity: 'moderate',
      confidence: 0.8,
      templateSelected: template,
      outcome: 'successful',
      context: {
        platform: 'test',
        domain,
        collaborationLevel: 'individual',
        urgencyLevel: 'normal'
      }
    };
  }

  private createWorkflowContext(intent: string, domain: string): WorkflowContext {
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

  private addResult(result: WorkflowTestResult): void {
    this.results.push(result);
    const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${status} ${result.testName}: ${result.details} (${result.duration.toFixed(2)}ms)`);
    console.log(`   Accuracy: ${(result.accuracy * 100).toFixed(1)}%, Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  }

  private printTestSummary(): void {
    console.log('\n🧠 Behavioral Pattern Recognition Test Summary');
    console.log('==============================================');
    
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
    const meetsAccuracyTarget = avgAccuracy >= 0.8;
    const meetsConfidenceTarget = avgConfidence >= 0.7;
    
    console.log('\n🎯 Quality Gate Status:');
    console.log(`${meetsAccuracyTarget ? '✅' : '❌'} Sequence Detection Accuracy: ${(avgAccuracy * 100).toFixed(1)}% (target: 80%)`);
    console.log(`${meetsConfidenceTarget ? '✅' : '❌'} Prediction Confidence: ${(avgConfidence * 100).toFixed(1)}% (target: 70%)`);
    
    if (failed === 0 && meetsAccuracyTarget && meetsConfidenceTarget) {
      console.log('\n🎉 All quality gates passed! Ready for production deployment.');
    } else {
      console.log('\n🔧 Some quality gates need attention before production deployment.');
    }
  }
}

// Export for use in other scripts
export { BehavioralPatternTestSuite };

// Run tests if called directly
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('test-behavioral-patterns')) {
  const testSuite = new BehavioralPatternTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\nBehavioral pattern testing completed.');
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}
