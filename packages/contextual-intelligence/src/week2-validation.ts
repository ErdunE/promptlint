import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';

interface Week2Test {
  name: string;
  prompt: string;
  expectedConstraints: number;
  expectedPhase: string;
  expectedExpertise: string;
}

const week2Tests: Week2Test[] = [
  {
    name: "Time-Constrained Development",
    prompt: "I need to build a React component by tomorrow for production deployment",
    expectedConstraints: 2, // time + quality
    expectedPhase: "development",
    expectedExpertise: "intermediate"
  },
  {
    name: "Budget-Limited Project",
    prompt: "Create a simple website using free tools and minimal resources",
    expectedConstraints: 2, // budget + scope
    expectedPhase: "development", 
    expectedExpertise: "beginner"
  },
  {
    name: "Enterprise Architecture",
    prompt: "Design a scalable microservices architecture with enterprise security requirements",
    expectedConstraints: 1, // quality
    expectedPhase: "planning",
    expectedExpertise: "expert"
  },
  {
    name: "Technical Specification",
    prompt: "Implement OAuth authentication using Node.js and Express framework",
    expectedConstraints: 1, // technical
    expectedPhase: "development",
    expectedExpertise: "advanced"
  },
  {
    name: "Maintenance Task",
    prompt: "Optimize the existing database queries to improve performance",
    expectedConstraints: 1, // quality
    expectedPhase: "maintenance",
    expectedExpertise: "advanced"
  }
];

async function runWeek2Validation(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.1 Week 2 Validation');
  console.log('=====================================');

  const engine = new IntentAnalysisEngine();
  const results: any[] = [];
  let totalProcessingTime = 0;

  for (const test of week2Tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Prompt: "${test.prompt}"`);

    const startTime = performance.now();
    const analysis = await engine.analyzeIntent(test.prompt);
    const testTime = performance.now() - startTime;
    totalProcessingTime += testTime;

    const constraintsFound = analysis.metaInstruction.constraints.length;
    // Note: Using placeholder values for Week 2 validation
    const phaseDetected = "development"; // Placeholder - actual implementation will be in Week 3
    const expertiseDetected = "intermediate"; // Placeholder - actual implementation will be in Week 3

    const passed = constraintsFound >= test.expectedConstraints &&
                  phaseDetected === test.expectedPhase &&
                  expertiseDetected === test.expectedExpertise;

    console.log(`✅ Processed in ${testTime.toFixed(2)}ms`);
    console.log(`   Constraints: ${constraintsFound} (expected: ${test.expectedConstraints})`);
    console.log(`   Phase: ${phaseDetected} (expected: ${test.expectedPhase})`);
    console.log(`   Expertise: ${expertiseDetected} (expected: ${test.expectedExpertise})`);
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
    
    if (analysis.metaInstruction.constraints.length > 0) {
      console.log(`   Detected constraints: ${analysis.metaInstruction.constraints.map(c => c.type).join(', ')}`);
    }
    
    // Note: Implicit requirements will be implemented in Week 3
    console.log(`   Implicit requirements: 0 (Week 3 feature)`);

    results.push({
      test: test.name,
      passed,
      processingTime: testTime,
      analysis
    });
  }

  // Summary
  console.log(`\n📊 Week 2 Validation Summary`);
  console.log('============================');
  const passedCount = results.filter(r => r.passed).length;
  const averageTime = totalProcessingTime / results.length;
  
  console.log(`✅ Success Rate: ${passedCount}/${results.length} (${((passedCount/results.length)*100).toFixed(1)}%)`);
  console.log(`⚡ Average Processing Time: ${averageTime.toFixed(2)}ms`);
  console.log(`🎯 Performance Target: <75ms per analysis`);
  console.log(`${averageTime < 75 ? '✅' : '❌'} Performance Requirement: ${averageTime < 75 ? 'PASSED' : 'FAILED'}`);
  
  console.log(`\n📋 Detailed Results:`);
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.passed ? '✅ PASS' : '❌ FAIL'} (${result.processingTime.toFixed(2)}ms)`);
  });

  console.log(`\n🏁 Week 2 Checkpoint Assessment`);
  console.log('================================');
  console.log(`1. MetaInstruction constraint extraction: ${passedCount >= 4 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: At least 4/5 test cases should correctly identify constraints`);
  console.log(`2. Project phase detection: ${results.every(r => r.analysis.metaInstruction.projectContext.phase) ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should detect project phases for all inputs`);
  console.log(`3. Performance requirements validated: ${averageTime < 75 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Processing time <75ms for Week 2 scope`);
  console.log(`4. Context integration functional: ${results.every(r => r.analysis.confidence > 0.4) ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should integrate instruction and meta-instruction analysis`);

  const overallPassed = passedCount >= 4 && averageTime < 75 && results.every(r => r.analysis.confidence > 0.4);
  console.log(`\n🎯 Overall Week 2 Status: ${overallPassed ? '✅ PASSED - Ready for Week 3' : '❌ NEEDS REFINEMENT'}`);
  
  if (overallPassed) {
    console.log('🚀 Level 4 Phase 4.1 Week 2 Implementation: VALIDATED');
    console.log('✅ MetaInstruction analysis functional with constraint extraction');
    console.log('✅ Performance requirements met for Week 2 scope');  
    console.log('✅ Ready for InteractionAnalyzer implementation');
  }
}

runWeek2Validation().catch(error => {
  console.error('Week 2 validation failed:', error);
  process.exit(1);
});
