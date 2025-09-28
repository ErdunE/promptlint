import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
import { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';
import { ReasoningChainGenerator } from './template-reasoning/ReasoningChainGenerator.js';
import { AIPlatform } from './shared/ContextualTypes.js';
import { ReferenceHistoryManager } from './meta-information/ReferenceHistoryManager.js';
import { PlatformStateAnalyzer } from './meta-information/PlatformStateAnalyzer.js';

interface Phase44Test {
  name: string;
  prompt: string;
  mockHistory: any[];
  expectedHistoryConfidence: number;
  expectedPlatformOptimizations: number;
}

const phase44Tests: Phase44Test[] = [
  {
    name: "Experienced Developer with Rich History",
    prompt: "I need to implement a complex authentication microservice with JWT tokens and Redis caching",
    mockHistory: Array.from({ length: 25 }, (_, i) => ({
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
      originalPrompt: `Development task ${i}`,
      selectedTemplate: { type: 'TaskIO' },
      userSatisfaction: 0.8 + (Math.random() * 0.2),
      templateEffectiveness: 0.75 + (Math.random() * 0.25),
      reasoningQuality: 0.7 + (Math.random() * 0.3),
      projectId: 'auth-service',
      outcome: 'successful'
    })),
    expectedHistoryConfidence: 0.75,
    expectedPlatformOptimizations: 2
  },
  {
    name: "New User with Limited History",
    prompt: "Help me create a simple React component for my learning project",
    mockHistory: Array.from({ length: 3 }, (_, i) => ({
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
      originalPrompt: `Learning task ${i}`,
      selectedTemplate: { type: 'Sequential' },
      userSatisfaction: 0.6,
      templateEffectiveness: 0.5,
      reasoningQuality: 0.6,
      projectId: 'learning',
      outcome: 'partial'
    })),
    expectedHistoryConfidence: 0.4,
    expectedPlatformOptimizations: 1
  }
];

async function runPhase44Validation(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.4 Meta-Information Engine Validation');
  console.log('====================================================');

  const intentEngine = new IntentAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer();
  const collaborativeManager = new CollaborativeContextManager();
  const reasoningGenerator = new ReasoningChainGenerator();
  const historyManager = new ReferenceHistoryManager();
  const platformAnalyzer = new PlatformStateAnalyzer();
  
  const results: any[] = [];
  let totalProcessingTime = 0;

  for (const test of phase44Tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Prompt: "${test.prompt}"`);
    console.log(`History Length: ${test.mockHistory.length} interactions`);

    const startTime = performance.now();
    
    // Complete Level 4 pipeline
    const intentAnalysis = await intentEngine.analyzeIntent(test.prompt);
    const projectContext = projectAnalyzer.analyzeProjectContext(intentAnalysis, test.prompt);
    const collaborativeContext = collaborativeManager.analyzeCollaborativeContext(intentAnalysis, test.prompt);
    
    const contextualReasoning = {
      projectContext,
      collaborativeContext,
      platformContext: {
        currentPlatform: AIPlatform.GENERIC,
        capabilities: [],
        contextWindow: {
          maxTokens: 4096,
          currentUsage: 0,
          remainingCapacity: 4096,
          estimatedCost: 0
        },
        optimizationOpportunities: [],
        confidence: 0.8,
        processingTime: 0
      },
      overallConfidence: (projectContext.confidence + collaborativeContext.confidence) / 2,
      processingTime: (projectContext.processingTime || 0) + collaborativeContext.processingTime
    };

    const reasoningChain = reasoningGenerator.generateReasoningChain(
      intentAnalysis,
      contextualReasoning,
      [{ id: 1, type: 'TaskIO' }, { id: 2, type: 'Bullet' }]
    );

    // Meta-information analysis
    const referenceHistory = historyManager.buildReferenceHistory(
      'test-user',
      'test-project',
      test.mockHistory
    );

    const platformState = platformAnalyzer.analyzePlatformState({
      intentAnalysis,
      projectContext,
      prompt: test.prompt
    });
    
    const testTime = performance.now() - startTime;
    totalProcessingTime += testTime;

    // Evaluate results
    const historyConfidenceMatch = referenceHistory.confidence >= test.expectedHistoryConfidence;
    const platformOptimizationsMatch = platformState.optimizationOpportunities.length >= test.expectedPlatformOptimizations;
    const hasSuccessfulInteractions = referenceHistory.successfulInteractions.length >= Math.min(test.mockHistory.length * 0.3, 5);
    const metaAnalysisComplete = referenceHistory.processingTime > 0 && platformState.processingTime > 0;
    
    const passed = historyConfidenceMatch && platformOptimizationsMatch && 
                  hasSuccessfulInteractions && metaAnalysisComplete;

    console.log(`✅ Processed in ${testTime.toFixed(2)}ms`);
    console.log(`   History Confidence: ${(referenceHistory.confidence * 100).toFixed(1)}% (expected: ${test.expectedHistoryConfidence * 100}%) ${historyConfidenceMatch ? '✅' : '❌'}`);
    console.log(`   Platform Optimizations: ${platformState.optimizationOpportunities.length} (expected: ${test.expectedPlatformOptimizations}) ${platformOptimizationsMatch ? '✅' : '❌'}`);
    console.log(`   Successful Interactions: ${referenceHistory.successfulInteractions.length} identified`);
    console.log(`   Platform: ${platformState.currentPlatform}`);
    console.log(`   User Patterns: ${Object.keys(referenceHistory.userPatterns.templatePreferences || {}).length} template preferences detected`);
    
    // Show optimization opportunities
    if (platformState.optimizationOpportunities.length > 0) {
      console.log(`   Optimization Opportunities:`);
      platformState.optimizationOpportunities.forEach((opp, index) => {
        console.log(`     ${index + 1}. ${opp.type}: ${opp.description} (${opp.impact} impact)`);
      });
    }

    results.push({
      test: test.name,
      passed,
      processingTime: testTime,
      referenceHistory,
      platformState,
      matches: { historyConfidenceMatch, platformOptimizationsMatch, hasSuccessfulInteractions, metaAnalysisComplete }
    });
  }

  // Summary
  console.log(`\n📊 Phase 4.4 Validation Summary`);
  console.log('==============================');
  const passedCount = results.filter(r => r.passed).length;
  const averageTime = totalProcessingTime / results.length;
  
  console.log(`✅ Success Rate: ${passedCount}/${results.length} (${((passedCount/results.length)*100).toFixed(1)}%)`);
  console.log(`⚡ Average Processing Time: ${averageTime.toFixed(2)}ms`);
  console.log(`🎯 Performance Target: <250ms per complete Level 4 analysis`);
  console.log(`${averageTime < 250 ? '✅' : '❌'} Performance Requirement: ${averageTime < 250 ? 'PASSED' : 'FAILED'}`);
  
  // Component validation breakdown
  const historyAccuracy = results.filter(r => r.matches.historyConfidenceMatch).length / results.length * 100;
  const platformAccuracy = results.filter(r => r.matches.platformOptimizationsMatch).length / results.length * 100;
  const interactionSuccess = results.filter(r => r.matches.hasSuccessfulInteractions).length / results.length * 100;
  const metaAnalysisSuccess = results.filter(r => r.matches.metaAnalysisComplete).length / results.length * 100;
  
  console.log(`\n📋 Component Validation:`);
  console.log(`   Reference History Quality: ${historyAccuracy.toFixed(1)}%`);
  console.log(`   Platform Optimization Detection: ${platformAccuracy.toFixed(1)}%`);
  console.log(`   Successful Interaction Identification: ${interactionSuccess.toFixed(1)}%`);
  console.log(`   Meta-Analysis Completion: ${metaAnalysisSuccess.toFixed(1)}%`);

  console.log(`\n🏁 Phase 4.4 Checkpoint Assessment`);
  console.log('===================================');
  console.log(`1. Reference history analysis functional: ${historyAccuracy >= 80 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: At least 80% should achieve expected history confidence`);
  console.log(`2. Platform state analysis working: ${platformAccuracy >= 80 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should identify appropriate platform optimization opportunities`);
  console.log(`3. Performance requirements: ${averageTime < 250 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Processing time <250ms for complete Level 4 meta-information`);
  console.log(`4. Meta-information integration: ${metaAnalysisSuccess >= 90 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should complete meta-information analysis successfully`);

  const overallPassed = historyAccuracy >= 80 && platformAccuracy >= 80 && 
                       averageTime < 250 && metaAnalysisSuccess >= 90;
  
  console.log(`\n🎯 Overall Phase 4.4 Status: ${overallPassed ? '✅ PASSED - Level 4 COMPLETE' : '❌ NEEDS REFINEMENT'}`);
  
  if (overallPassed) {
    console.log('🚀 Level 4 Phase 4.4 Implementation: VALIDATED');
    console.log('✅ Meta-information engine with historical analysis functional');
    console.log('✅ Platform optimization and state analysis working');  
    console.log('✅ Level 4 Contextual Intelligence Engine: COMPLETE');
    console.log('🎉 Ready for production deployment and Level 5 planning');
    
    // Performance excellence bonus
    if (averageTime < 100) {
      console.log('⭐ PERFORMANCE EXCELLENCE: Sub-100ms complete Level 4 analysis achieved!');
    }
  } else {
    console.log('⚠️  Phase 4.4 implementation shows progress but needs refinement');
    console.log('📋 Focus areas for improvement:');
    if (historyAccuracy < 80) console.log('   - Reference history analysis accuracy');
    if (platformAccuracy < 80) console.log('   - Platform optimization detection');
    if (averageTime >= 250) console.log('   - Processing time optimization');
    if (metaAnalysisSuccess < 90) console.log('   - Meta-information integration completeness');
  }
}

runPhase44Validation().catch(error => {
  console.error('Phase 4.4 validation failed:', error);
  process.exit(1);
});
