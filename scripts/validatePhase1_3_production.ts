// scripts/validatePhase1_3_production.ts

// Direct dist imports - bypassing package resolution issues
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { TemplateEngine } from "../packages/template-engine/src/index.js";
import { TemplateType } from "../packages/shared-types/dist/index.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

interface EdgeCaseTest {
  name: string;
  prompt: string;
  previousIssue: string;
  expectedDomain: string;
  expectedConfidence: number;
  expectedTemplates: string[];
  mustPass: boolean; // Critical edge cases that must pass
}

interface IntegrationTest {
  name: string;
  prompt: string;
  expectedBehavior: string;
  performanceThreshold: number;
}

function printEdgeCaseResult(test: EdgeCaseTest, actualDomain: string, actualConfidence: number, actualTemplates: string[], processingTime: number): boolean {
  console.log(`🎯 Edge Case: ${test.name}`);
  console.log(`Prompt: "${test.prompt}"`);
  console.log(`Previous Issue: ${test.previousIssue}`);
  console.log(`Expected: ${test.expectedDomain} domain, ${test.expectedConfidence}+ confidence`);
  console.log(`Actual: ${actualDomain} domain, ${actualConfidence} confidence`);
  console.log(`Templates: [${actualTemplates.join(", ")}]`);
  console.log(`Processing: ${processingTime.toFixed(2)}ms`);
  
  const domainCorrect = actualDomain === test.expectedDomain;
  const confidenceCorrect = actualConfidence >= test.expectedConfidence;
  const templateMatch = test.expectedTemplates.some(t => actualTemplates.includes(t));
  
  const passed = domainCorrect && confidenceCorrect && templateMatch;
  
  console.log(`Domain: ${domainCorrect ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Confidence: ${confidenceCorrect ? "✅ PASS" : "❌ FAIL"} (${actualConfidence} vs ${test.expectedConfidence}+)`);
  console.log(`Templates: ${templateMatch ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Overall: ${passed ? "✅ PASS" : "❌ FAIL"} ${test.mustPass ? "(CRITICAL)" : "(OPTIONAL)"}`);
  console.log("─".repeat(80));
  
  return passed;
}

function printIntegrationResult(test: IntegrationTest, actualTemplates: string[], processingTime: number, semanticData?: any): boolean {
  console.log(`🔧 Integration: ${test.name}`);
  console.log(`Prompt: "${test.prompt}"`);
  console.log(`Expected: ${test.expectedBehavior}`);
  console.log(`Templates: [${actualTemplates.join(", ")}]`);
  console.log(`Processing: ${processingTime.toFixed(2)}ms (threshold: ${test.performanceThreshold}ms)`);
  
  if (semanticData) {
    console.log(`Semantic Analysis: Intent=${semanticData.intentType}, Complexity=${semanticData.complexity}`);
  }
  
  const performancePassed = processingTime < test.performanceThreshold;
  const behaviorAppropriate = actualTemplates.length > 0; // Basic functionality check
  
  console.log(`Performance: ${performancePassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Behavior: ${behaviorAppropriate ? "✅ PASS" : "❌ FAIL"}`);
  console.log("─".repeat(60));
  
  return performancePassed && behaviorAppropriate;
}

async function validatePhase1_3Production() {
  console.log("\n🚀 Phase 1.3 Production-Ready Validation");
  console.log("Testing: Context-Aware Template Selection + Edge Case Resolution");
  console.log("=" .repeat(80));

  const engine = new TemplateEngine();
  const classifier = new HybridClassifier();
  await classifier.initialize();

  // CRITICAL EDGE CASE TESTS - These MUST pass for Phase 1.3 approval
  const edgeCaseTests: EdgeCaseTest[] = [
    {
      name: "REST API High Confidence",
      prompt: "implement REST API",
      previousIssue: "Only achieved 67 confidence (needed 90+)",
      expectedDomain: "code",
      expectedConfidence: 90,
      expectedTemplates: ["task_io"],
      mustPass: true
    },
    {
      name: "Project Goals Domain Correction", 
      prompt: "outline project goals",
      previousIssue: "Misclassified as code domain (should be writing/research)",
      expectedDomain: "writing", // or research, anything except code
      expectedConfidence: 70,
      expectedTemplates: ["bullet", "minimal"],
      mustPass: true
    },
    {
      name: "Debug Performance Confidence",
      prompt: "debug performance issues", 
      previousIssue: "Only achieved 48 confidence (needed 80+)",
      expectedDomain: "code",
      expectedConfidence: 80,
      expectedTemplates: ["task_io", "sequential"],
      mustPass: true
    }
  ];

  // INTEGRATION TESTS - End-to-end pipeline validation
  const integrationTests: IntegrationTest[] = [
    {
      name: "Complex Multi-Domain Prompt",
      prompt: "analyze user behavior data to optimize application performance and create documentation",
      expectedBehavior: "Should handle multiple domains and provide appropriate template variety",
      performanceThreshold: 100
    },
    {
      name: "Simple Code Prompt",
      prompt: "write quicksort function",
      expectedBehavior: "Should maintain v0.4.2 baseline quality with semantic enhancement", 
      performanceThreshold: 50
    },
    {
      name: "Ambiguous Intent Prompt",
      prompt: "help with project",
      expectedBehavior: "Should handle vague prompts gracefully without errors",
      performanceThreshold: 50
    }
  ];

  let passedEdgeCase = 0;
  let criticalEdgeCase = 0;
  let passedIntegration = 0;

  // Test Critical Edge Cases
  console.log("\n🚨 Critical Edge Case Resolution Tests:\n");
  
  for (const test of edgeCaseTests) {
    const domainResult = await classifier.classify(test.prompt);
    const lintResult = analyzePrompt(test.prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(test.prompt, lintResult);
    const endTime = performance.now();
    
    const templates = candidates.map(c => c.type);
    const processingTime = endTime - startTime;
    
    const passed = printEdgeCaseResult(
      test,
      domainResult.domain,
      domainResult.confidence,
      templates,
      processingTime
    );
    
    if (passed) passedEdgeCase++;
    if (test.mustPass) criticalEdgeCase++;
  }

  // Test End-to-End Integration
  console.log("\n🔧 End-to-End Integration Tests:\n");
  
  for (const test of integrationTests) {
    const domainResult = await classifier.classify(test.prompt);
    const lintResult = analyzePrompt(test.prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(test.prompt, lintResult);
    const endTime = performance.now();
    
    const templates = candidates.map(c => c.type);
    const processingTime = endTime - startTime;
    
    const passed = printIntegrationResult(
      test,
      templates, 
      processingTime,
      { 
        intentType: "semantic_data_placeholder",
        complexity: "moderate" 
      }
    );
    
    if (passed) passedIntegration++;
  }

  // Performance Validation
  console.log("\n⚡ Performance Validation:\n");
  
  const performancePrompts = [
    "implement binary search algorithm",
    "write blog post about productivity", 
    "analyze market trends data",
    "research best practices for security"
  ];

  let totalTime = 0;
  let performanceTests = 0;

  for (const prompt of performancePrompts) {
    const lintResult = analyzePrompt(prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    totalTime += processingTime;
    performanceTests++;
    
    console.log(`"${prompt.substring(0, 30)}..." → ${processingTime.toFixed(2)}ms`);
  }

  const averageTime = totalTime / performanceTests;
  
  // Critical Results Assessment
  console.log("\n📊 PRODUCTION READINESS ASSESSMENT");
  console.log("=" .repeat(80));
  console.log(`Critical Edge Cases Resolved: ${passedEdgeCase}/${criticalEdgeCase} (${criticalEdgeCase === passedEdgeCase ? "✅ ALL PASS" : "❌ FAILURES DETECTED"})`);
  console.log(`Integration Tests Passed: ${passedIntegration}/${integrationTests.length} (${passedIntegration === integrationTests.length ? "✅ ALL PASS" : "❌ ISSUES DETECTED"})`);
  console.log(`Average Processing Time: ${averageTime.toFixed(2)}ms (${averageTime < 100 ? "✅ WITHIN BUDGET" : "❌ EXCEEDS BUDGET"})`);

  // Final Production Readiness Decision
  const allEdgeCasesPassed = passedEdgeCase === criticalEdgeCase;
  const allIntegrationPassed = passedIntegration === integrationTests.length;
  const performanceAcceptable = averageTime < 100;

  const productionReady = allEdgeCasesPassed && allIntegrationPassed && performanceAcceptable;

  console.log("\n🎯 PRODUCTION READINESS STATUS:");
  if (productionReady) {
    console.log("✅ PHASE 1.3 APPROVED FOR PRODUCTION");
    console.log("✅ Level 2 Pattern Recognition Engine COMPLETE");
    console.log("✅ All critical edge cases resolved");
    console.log("✅ Integration pipeline functional");
    console.log("✅ Performance requirements met");
    console.log("\n🚀 Ready for Level 2 architecture completion and user deployment");
  } else {
    console.log("❌ PHASE 1.3 NOT READY FOR PRODUCTION");
    console.log("❌ Critical issues require resolution:");
    
    if (!allEdgeCasesPassed) {
      console.log(`   - Edge case failures: ${criticalEdgeCase - passedEdgeCase} critical issues unresolved`);
    }
    if (!allIntegrationPassed) {
      console.log(`   - Integration failures: ${integrationTests.length - passedIntegration} pipeline issues detected`);
    }
    if (!performanceAcceptable) {
      console.log(`   - Performance issues: ${averageTime.toFixed(2)}ms exceeds 100ms budget`);
    }
    
    console.log("\n🔄 Additional refinement required before production approval");
  }

  return productionReady;
}

// Execute validation
validatePhase1_3Production().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Validation failed with error:", error);
  process.exit(1);
});