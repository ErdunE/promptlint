import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
import { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';
import { ReasoningChainGenerator } from './template-reasoning/ReasoningChainGenerator.js';
import { AIPlatform } from './shared/ContextualTypes.js';

interface Phase43Test {
  name: string;
  prompt: string;
  expectedSteps: number;
  expectedConfidence: number;
  templateOptions: any[];
}

const phase43Tests: Phase43Test[] = [
  {
    name: "Complex Enterprise Architecture",
    prompt: "We need to design a highly scalable microservices architecture for our enterprise production system with 100k+ concurrent users using Node.js, PostgreSQL, and Kubernetes deployment",
    expectedSteps: 4,
    expectedConfidence: 0.8,
    templateOptions: [
      { id: 1, type: 'TaskIO', suitableFor: ['create', 'code'], complexityLevel: 'high' },
      { id: 2, type: 'Bullet', suitableFor: ['analyze', 'create'], complexityLevel: 'enterprise' },
      { id: 3, type: 'Sequential', suitableFor: ['create', 'solve'], complexityLevel: 'medium' }
    ]
  },
  {
    name: "Individual Learning Project", 
    prompt: "I want to learn React hooks and build a simple todo app component for my portfolio",
    expectedSteps: 4,
    expectedConfidence: 0.7,
    templateOptions: [
      { id: 1, type: 'TaskIO', suitableFor: ['create'], complexityLevel: 'low' },
      { id: 2, type: 'Sequential', suitableFor: ['explain', 'create'], complexityLevel: 'low' },
      { id: 3, type: 'Bullet', suitableFor: ['create'], complexityLevel: 'medium' }
    ]
  },
  {
    name: "Production Debugging Emergency",
    prompt: "URGENT: Our authentication service is down with OAuth token errors. Need immediate debugging steps and hotfix solution for our team",
    expectedSteps: 4,
    expectedConfidence: 0.75,
    templateOptions: [
      { id: 1, type: 'Sequential', suitableFor: ['solve'], complexityLevel: 'high' },
      { id: 2, type: 'Bullet', suitableFor: ['solve', 'analyze'], complexityLevel: 'high' },
      { id: 3, type: 'TaskIO', suitableFor: ['solve'], complexityLevel: 'medium' }
    ]
  }
];

async function runPhase43Validation(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.3 Template Reasoning System Validation');
  console.log('=======================================================');

  const intentEngine = new IntentAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer();
  const collaborativeManager = new CollaborativeContextManager();
  const reasoningGenerator = new ReasoningChainGenerator();
  
  const results: any[] = [];
  let totalProcessingTime = 0;

  for (const test of phase43Tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Prompt: "${test.prompt}"`);

    const startTime = performance.now();
    
    // Multi-stage analysis pipeline
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

    // Generate reasoning chain
    const reasoningChain = reasoningGenerator.generateReasoningChain(
      intentAnalysis,
      contextualReasoning,
      test.templateOptions
    );
    
    const testTime = performance.now() - startTime;
    totalProcessingTime += testTime;

    // Evaluate results
    const stepsMatch = reasoningChain.steps.length >= test.expectedSteps;
    const confidenceMatch = reasoningChain.overallConfidence >= test.expectedConfidence;
    const validatedChain = reasoningChain.validated;
    const hasDocumentation = reasoningChain.documentation.summary.length > 0;
    
    const passed = stepsMatch && confidenceMatch && validatedChain && hasDocumentation;

    console.log(`✅ Processed in ${testTime.toFixed(2)}ms`);
    console.log(`   Reasoning Steps: ${reasoningChain.steps.length} (expected: ${test.expectedSteps}) ${stepsMatch ? '✅' : '❌'}`);
    console.log(`   Chain Confidence: ${(reasoningChain.overallConfidence * 100).toFixed(1)}% (expected: ${test.expectedConfidence * 100}%) ${confidenceMatch ? '✅' : '❌'}`);
    console.log(`   Chain Validated: ${reasoningChain.validated ? 'Yes' : 'No'} ${validatedChain ? '✅' : '❌'}`);
    console.log(`   Documentation: ${hasDocumentation ? 'Generated' : 'Missing'} ${hasDocumentation ? '✅' : '❌'}`);
    
    // Show reasoning chain summary
    console.log(`   Key Decisions:`);
    reasoningChain.documentation.keyDecisions.forEach((decision, index) => {
      console.log(`     ${index + 1}. ${decision.step}: ${decision.decision} (${(decision.confidence * 100).toFixed(1)}%)`);
    });

    results.push({
      test: test.name,
      passed,
      processingTime: testTime,
      reasoningChain,
      matches: { stepsMatch, confidenceMatch, validatedChain, hasDocumentation }
    });
  }

  // Summary
  console.log(`\n📊 Phase 4.3 Validation Summary`);
  console.log('==============================');
  const passedCount = results.filter(r => r.passed).length;
  const averageTime = totalProcessingTime / results.length;
  
  console.log(`✅ Success Rate: ${passedCount}/${results.length} (${((passedCount/results.length)*100).toFixed(1)}%)`);
  console.log(`⚡ Average Processing Time: ${averageTime.toFixed(2)}ms`);
  console.log(`🎯 Performance Target: <200ms per template reasoning`);
  console.log(`${averageTime < 200 ? '✅' : '❌'} Performance Requirement: ${averageTime < 200 ? 'PASSED' : 'FAILED'}`);
  
  // Component validation breakdown
  const stepAccuracy = results.filter(r => r.matches.stepsMatch).length / results.length * 100;
  const confidenceAccuracy = results.filter(r => r.matches.confidenceMatch).length / results.length * 100;
  const validationSuccess = results.filter(r => r.matches.validatedChain).length / results.length * 100;
  const documentationSuccess = results.filter(r => r.matches.hasDocumentation).length / results.length * 100;
  
  console.log(`\n📋 Component Validation:`);
  console.log(`   Reasoning Chain Completeness: ${stepAccuracy.toFixed(1)}%`);
  console.log(`   Confidence Threshold Achievement: ${confidenceAccuracy.toFixed(1)}%`);
  console.log(`   Logic Validation Success: ${validationSuccess.toFixed(1)}%`);
  console.log(`   Documentation Generation: ${documentationSuccess.toFixed(1)}%`);

  console.log(`\n🏁 Phase 4.3 Checkpoint Assessment`);
  console.log('===================================');
  console.log(`1. Reasoning chain generation functional: ${stepAccuracy >= 80 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: At least 80% of tests should generate complete reasoning chains`);
  console.log(`2. Template reasoning transparency: ${documentationSuccess >= 90 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should generate clear documentation for all reasoning decisions`);
  console.log(`3. Performance requirements: ${averageTime < 200 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Processing time <200ms for template reasoning system`);
  console.log(`4. Logic validation functional: ${validationSuccess >= 80 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should validate reasoning chain logic and consistency`);

  const overallPassed = stepAccuracy >= 80 && documentationSuccess >= 90 && 
                       averageTime < 200 && validationSuccess >= 80;
  
  console.log(`\n🎯 Overall Phase 4.3 Status: ${overallPassed ? '✅ PASSED - Ready for Phase 4.4' : '❌ NEEDS REFINEMENT'}`);
  
  if (overallPassed) {
    console.log('🚀 Level 4 Phase 4.3 Implementation: VALIDATED');
    console.log('✅ Template reasoning system with transparent logic chains functional');
    console.log('✅ Context-aware template selection with documented decisions');  
    console.log('✅ Ready for Phase 4.4 Meta-Information Engine integration');
    
    // Performance excellence bonus
    if (averageTime < 50) {
      console.log('⭐ PERFORMANCE EXCELLENCE: Sub-50ms template reasoning achieved!');
    }
  } else {
    console.log('⚠️  Phase 4.3 implementation shows progress but needs refinement');
    console.log('📋 Focus areas for improvement:');
    if (stepAccuracy < 80) console.log('   - Reasoning chain completeness');
    if (documentationSuccess < 90) console.log('   - Documentation generation quality');
    if (averageTime >= 200) console.log('   - Processing time optimization');
    if (validationSuccess < 80) console.log('   - Logic validation accuracy');
  }
}

runPhase43Validation().catch(error => {
  console.error('Phase 4.3 validation failed:', error);
  process.exit(1);
});
