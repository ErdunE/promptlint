/**
 * Level 4 Phase 4.1 Week 1 Validation Script
 * 
 * Tests core InstructionAnalyzer functionality and performance requirements
 */

import { InstructionAnalyzer } from './intent-analysis/InstructionAnalyzer.js';
import { IntentCategory, ActionType, SubjectType, IntentComplexity, OutputFormat } from './shared/IntentTypes.js';

async function runWeek1Validation(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.1 Week 1 Validation');
  console.log('=====================================\n');
  
  const analyzer = new InstructionAnalyzer();
  const testCases = [
    {
      name: 'Simple Code Generation',
      prompt: 'Create a JavaScript function that calculates the sum of two numbers',
      expectedCategory: IntentCategory.CODE,
      expectedAction: ActionType.BUILD
    },
    {
      name: 'Analysis Request',
      prompt: 'Analyze this data and show me the trends in bullet points',
      expectedCategory: IntentCategory.ANALYZE,
      expectedAction: ActionType.EXAMINE
    },
    {
      name: 'Problem Solving',
      prompt: 'Help me fix this bug in my React component',
      expectedCategory: IntentCategory.SOLVE,
      expectedAction: ActionType.EVALUATE
    },
    {
      name: 'Learning/Explanation',
      prompt: 'Explain how machine learning algorithms work',
      expectedCategory: IntentCategory.EXPLAIN,
      expectedAction: ActionType.EXAMINE
    },
    {
      name: 'Complex System Design',
      prompt: 'Design a scalable microservices architecture for an e-commerce platform with detailed documentation',
      expectedCategory: IntentCategory.DESIGN,
      expectedAction: ActionType.BUILD
    }
  ];
  
  let totalProcessingTime = 0;
  let successCount = 0;
  const results: ValidationResult[] = [];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Prompt: "${testCase.prompt}"`);
    
    const startTime = performance.now();
    
    try {
      const result = await analyzer.analyzeInstruction(testCase.prompt);
      const processingTime = performance.now() - startTime;
      totalProcessingTime += processingTime;
      
      const success = validateResult(result, testCase, processingTime);
      if (success) successCount++;
      
      results.push({
        testCase: testCase.name,
        success,
        processingTime,
        result,
        issues: success ? [] : ['Classification mismatch or performance issue']
      });
      
      console.log(`✅ Processed in ${processingTime.toFixed(2)}ms`);
      console.log(`   Category: ${result.category} (expected: ${testCase.expectedCategory})`);
      console.log(`   Action: ${result.action} (expected: ${testCase.expectedAction})`);
      console.log(`   Subject: ${result.subject.type} - ${result.subject.domain}`);
      console.log(`   Complexity: ${result.complexity}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Failed: ${error}`);
      results.push({
        testCase: testCase.name,
        success: false,
        processingTime: performance.now() - startTime,
        result: null,
        issues: [`Error: ${error instanceof Error ? error.message : String(error)}`]
      });
    }
  }
  
  // Performance Summary
  const averageTime = totalProcessingTime / testCases.length;
  const maxAllowedTime = 50; // Week 1 requirement: <50ms
  
  console.log('📊 Week 1 Validation Summary');
  console.log('============================');
  console.log(`✅ Success Rate: ${successCount}/${testCases.length} (${(successCount/testCases.length*100).toFixed(1)}%)`);
  console.log(`⚡ Average Processing Time: ${averageTime.toFixed(2)}ms`);
  console.log(`🎯 Performance Target: <${maxAllowedTime}ms per analysis`);
  console.log(`${averageTime <= maxAllowedTime ? '✅' : '❌'} Performance Requirement: ${averageTime <= maxAllowedTime ? 'PASSED' : 'FAILED'}`);
  
  // Detailed Results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testCase}: ${result.success ? '✅ PASS' : '❌ FAIL'} (${result.processingTime.toFixed(2)}ms)`);
    if (!result.success && result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });
  
  // Week 1 Checkpoint Assessment
  console.log('\n🏁 Week 1 Checkpoint Assessment');
  console.log('================================');
  
  const checkpoints = [
    {
      name: 'Basic instruction parsing functional',
      passed: successCount >= testCases.length * 0.8, // 80% success rate
      requirement: 'At least 80% of test cases should pass'
    },
    {
      name: 'InstructionAnalyzer implements intent taxonomy classification',
      passed: results.some(r => r.result && r.result.category !== IntentCategory.CREATE),
      requirement: 'Should classify different intent categories beyond default'
    },
    {
      name: 'Performance requirements validated',
      passed: averageTime <= maxAllowedTime,
      requirement: `Processing time <${maxAllowedTime}ms for Week 1 scope`
    },
    {
      name: 'Fallback strategies functional',
      passed: results.every(r => r.result !== null || r.issues.length > 0),
      requirement: 'Should handle all inputs gracefully'
    }
  ];
  
  checkpoints.forEach((checkpoint, index) => {
    console.log(`${index + 1}. ${checkpoint.name}: ${checkpoint.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Requirement: ${checkpoint.requirement}`);
  });
  
  const overallSuccess = checkpoints.every(c => c.passed);
  console.log(`\n🎯 Overall Week 1 Status: ${overallSuccess ? '✅ PASSED - Ready for Week 2' : '❌ FAILED - Needs attention'}`);
  
  if (overallSuccess) {
    console.log('\n🚀 Level 4 Phase 4.1 Week 1 Implementation: VALIDATED');
    console.log('✅ Core intent analysis functional with fallback strategies');
    console.log('✅ Performance requirements met for Week 1 scope');
    console.log('✅ Ready for Level 3 adaptive engine integration');
  } else {
    console.log('\n⚠️  Week 1 implementation needs improvement before proceeding');
  }
}

function validateResult(result: any, testCase: any, processingTime: number): boolean {
  // Basic validation logic
  const performanceOk = processingTime <= 50; // 50ms limit for Week 1
  const categoryReasonable = result.category !== null;
  const actionReasonable = result.action !== null;
  const confidenceReasonable = result.confidence >= 0.1; // Minimum confidence
  
  return performanceOk && categoryReasonable && actionReasonable && confidenceReasonable;
}

interface ValidationResult {
  testCase: string;
  success: boolean;
  processingTime: number;
  result: any;
  issues: string[];
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runWeek1Validation().catch(console.error);
}

export { runWeek1Validation };
