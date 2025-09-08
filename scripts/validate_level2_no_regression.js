// Level 2 Regression Validation - Phase 3.1 Integration Check
// Ensures Level 2 functionality remains intact after Level 3 integration

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function validateLevel2NoRegression() {
  console.log("\n🔍 Level 2 Regression Validation - Phase 3.1 Integration");
  console.log("Ensuring Level 2 Pattern Recognition Engine remains intact");
  console.log("=" .repeat(80));

  try {
    const classifier = new HybridClassifier();
    await classifier.initialize();

    // Import template engine using successful approach
    const { TemplateEngine } = await import("../packages/template-engine/dist/template-engine.js");
    const engine = new TemplateEngine();

    // Core Level 2 validation test cases
    const validationTests = [
      {
        name: "REST API Implementation",
        prompt: "implement REST API",
        expectedDomain: "code",
        minConfidence: 90,
        expectedTemplates: ["task_io", "sequential"]
      },
      {
        name: "Blog Writing",
        prompt: "write engaging blog post",
        expectedDomain: "writing", 
        minConfidence: 85,
        expectedTemplates: ["minimal", "bullet"]
      },
      {
        name: "Data Analysis",
        prompt: "analyze customer behavior patterns",
        expectedDomain: "analysis",
        minConfidence: 85,
        expectedTemplates: ["task_io", "bullet"]
      },
      {
        name: "Research Task",
        prompt: "research machine learning approaches",
        expectedDomain: "research",
        minConfidence: 80,
        expectedTemplates: ["bullet"]
      },
      {
        name: "Debug Performance",
        prompt: "debug performance issues in Python",
        expectedDomain: "code",
        minConfidence: 80,
        expectedTemplates: ["sequential", "task_io"]
      }
    ];

    let passedTests = 0;
    let totalProcessingTime = 0;

    console.log("🧪 Level 2 Core Functionality Tests:\n");

    for (const test of validationTests) {
      const lintResult = analyzePrompt(test.prompt);
      
      const startTime = performance.now();
      const candidates = await engine.generateCandidates(test.prompt, lintResult);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      totalProcessingTime += processingTime;
      
      const templates = candidates.map(c => c.type);
      const calibratedConfidence = candidates.length > 0 ? 
        candidates[0].metadata?.selectionMetadata?.domainContext?.confidence || 0 : 0;
      const domain = candidates.length > 0 ?
        candidates[0].metadata?.selectionMetadata?.domainContext?.domain || 'unknown' : 'unknown';

      // Validation criteria (same as Level 2 validation)
      const domainCorrect = domain === test.expectedDomain;
      const confidencePass = calibratedConfidence >= test.minConfidence;
      const templatesGenerated = templates.length > 0;
      const performanceAcceptable = processingTime < 100; // Level 2 requirement

      const testPassed = domainCorrect && confidencePass && templatesGenerated && performanceAcceptable;
      
      if (testPassed) passedTests++;

      console.log(`${test.name}:`);
      console.log(`  Prompt: "${test.prompt}"`);
      console.log(`  Domain: ${domain} (expected: ${test.expectedDomain}) ${domainCorrect ? '✅' : '❌'}`);
      console.log(`  Confidence: ${calibratedConfidence.toFixed(1)}% (min: ${test.minConfidence}%) ${confidencePass ? '✅' : '❌'}`);
      console.log(`  Templates: [${templates.join(", ")}] ${templatesGenerated ? '✅' : '❌'}`);
      console.log(`  Processing: ${processingTime.toFixed(2)}ms ${performanceAcceptable ? '✅' : '❌'}`);
      console.log(`  Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    const averageProcessing = totalProcessingTime / validationTests.length;
    const successRate = (passedTests / validationTests.length) * 100;

    // Performance validation
    console.log("⚡ Performance Validation:");
    console.log(`  Average Processing Time: ${averageProcessing.toFixed(2)}ms`);
    console.log(`  Level 2 Requirement: <100ms ${averageProcessing < 100 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Performance vs Level 2 Baseline: ${averageProcessing < 1 ? '✅ EXCELLENT' : averageProcessing < 5 ? '✅ GOOD' : '⚠️ ACCEPTABLE'}`);

    // Overall assessment
    console.log("\n📊 LEVEL 2 REGRESSION VALIDATION RESULTS:");
    console.log("=" .repeat(80));
    console.log(`Test Success Rate: ${passedTests}/${validationTests.length} (${successRate.toFixed(1)}%)`);
    console.log(`Performance: ${averageProcessing.toFixed(2)}ms average (requirement: <100ms)`);

    const regressionDetected = successRate < 100 || averageProcessing >= 100;

    if (regressionDetected) {
      console.log("\n❌ REGRESSION DETECTED:");
      console.log("Level 2 functionality has been impacted by Level 3 integration");
      console.log("Required actions:");
      if (successRate < 100) {
        console.log("  • Fix failing test cases to restore Level 2 accuracy");
      }
      if (averageProcessing >= 100) {
        console.log("  • Optimize performance to meet Level 2 requirements");
      }
      console.log("  • Review Level 3 integration for compatibility issues");
    } else {
      console.log("\n✅ NO REGRESSION DETECTED:");
      console.log("Level 2 Pattern Recognition Engine functionality preserved");
      console.log("Level 3 integration successful without impact on core features");
      console.log("\n🎯 Phase 3.1 Integration Status: VALIDATED");
      console.log("Ready for Level 3 feature development and user testing");
    }

    return {
      passed: !regressionDetected,
      successRate,
      averageProcessing,
      passedTests,
      totalTests: validationTests.length
    };

  } catch (error) {
    console.error("❌ Level 2 regression validation failed:", error);
    return {
      passed: false,
      successRate: 0,
      averageProcessing: 0,
      passedTests: 0,
      totalTests: 0,
      error: error.message
    };
  }
}

// Execute validation
validateLevel2NoRegression().then(results => {
  if (results.passed) {
    console.log(`\n🎉 Level 2 functionality preserved with Level 3 integration`);
    console.log(`Success rate: ${results.successRate.toFixed(1)}%, Performance: ${results.averageProcessing.toFixed(2)}ms`);
  } else {
    console.log(`\n⚠️ Regression detected - Level 2 functionality compromised`);
    if (results.error) {
      console.log(`Error: ${results.error}`);
    }
  }
  process.exit(results.passed ? 0 : 1);
}).catch(error => {
  console.error("Validation execution failed:", error);
  process.exit(1);
});
