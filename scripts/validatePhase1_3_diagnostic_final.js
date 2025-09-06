// scripts/validatePhase1_3_diagnostic_final.js
// Direct dist imports - bypassing package resolution issues

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

// Test data
const diagnosticTests = [
  // Critical Edge Cases (must pass for production approval)
  {
    name: "REST API High Confidence",
    prompt: "implement REST API",
    expectedIntent: "instructional", 
    expectedDomain: "code",
    expectedConfidence: 90,
    expectedTemplates: ["task_io"],
    category: 'edge_case',
    critical: true
  },
  {
    name: "Project Goals Non-Code",
    prompt: "outline project goals",
    expectedIntent: "planning",
    expectedDomain: "research",
    expectedConfidence: 70,
    expectedTemplates: ["bullet", "minimal"],
    category: 'edge_case',
    critical: true
  },
  {
    name: "Debug Performance High Confidence",
    prompt: "debug performance issues",
    expectedIntent: "debugging",
    expectedDomain: "code", 
    expectedConfidence: 80,
    expectedTemplates: ["task_io", "sequential"],
    category: 'edge_case',
    critical: true
  },

  // Analytical Intent Pattern Testing
  {
    name: "Data Analysis Basic",
    prompt: "analyze customer behavior patterns",
    expectedIntent: "analytical",
    expectedDomain: "analysis",
    expectedConfidence: 85,
    expectedTemplates: ["task_io", "bullet"],
    category: 'analytical_intent',
    critical: false
  },
  {
    name: "Performance Analysis", 
    prompt: "analyze system performance metrics",
    expectedIntent: "analytical",
    expectedDomain: "analysis",
    expectedConfidence: 85,
    expectedTemplates: ["task_io", "bullet"],
    category: 'analytical_intent',
    critical: false
  },

  // Code Domain Confidence Testing
  {
    name: "Algorithm Implementation",
    prompt: "implement quicksort algorithm",
    expectedIntent: "instructional",
    expectedDomain: "code",
    expectedConfidence: 85,
    expectedTemplates: ["task_io", "sequential"],
    category: 'code_confidence',
    critical: false
  },
  {
    name: "Web Development",
    prompt: "build responsive website with navigation",
    expectedIntent: "instructional",
    expectedDomain: "code",
    expectedConfidence: 80,
    expectedTemplates: ["task_io", "sequential"],
    category: 'code_confidence',
    critical: false
  },

  // Writing Domain Clarity Testing
  {
    name: "Blog Content Creation",
    prompt: "write engaging blog post about sustainable technology",
    expectedIntent: "creative",
    expectedDomain: "writing",
    expectedConfidence: 85,
    expectedTemplates: ["minimal", "bullet"],
    category: 'writing_clarity',
    critical: false
  },
  {
    name: "Technical Documentation",
    prompt: "document API endpoints with usage examples",
    expectedIntent: "explanatory",
    expectedDomain: "writing",
    expectedConfidence: 80,
    expectedTemplates: ["bullet", "sequential"],
    category: 'writing_clarity',
    critical: false
  },

  // Research Domain Methodology Testing
  {
    name: "Best Practices Research",
    prompt: "research industry best practices for cybersecurity",
    expectedIntent: "investigative",
    expectedDomain: "research",
    expectedConfidence: 85,
    expectedTemplates: ["bullet", "sequential"],
    category: 'research_methodology',
    critical: false
  },
  {
    name: "Technology Assessment",
    prompt: "evaluate different cloud computing platforms",
    expectedIntent: "comparative",
    expectedDomain: "research",
    expectedConfidence: 80,
    expectedTemplates: ["bullet", "task_io"],
    category: 'research_methodology',
    critical: false
  },

  // Complex Multi-Domain Testing
  {
    name: "Multi-Domain Task 1",
    prompt: "analyze user data to optimize code performance and document findings",
    expectedIntent: "analytical",
    expectedDomain: "analysis",
    expectedConfidence: 75,
    expectedTemplates: ["bullet", "sequential"],
    category: 'complex_multi_domain',
    critical: false
  },
  {
    name: "Multi-Domain Task 2",
    prompt: "research machine learning approaches and implement prototype",
    expectedIntent: "investigative",
    expectedDomain: "research",
    expectedConfidence: 70,
    expectedTemplates: ["sequential", "bullet"],
    category: 'complex_multi_domain',
    critical: false
  }
];

function analyzeDiagnosticResult(test, actualIntent, actualDomain, actualConfidence, actualTemplates, processingTime) {
  const intentCorrect = actualIntent === test.expectedIntent;
  const domainCorrect = actualDomain === test.expectedDomain;
  const confidenceCorrect = actualConfidence >= test.expectedConfidence;
  const templateMatch = test.expectedTemplates.some(t => actualTemplates.includes(t));
  
  return {
    testName: test.name,
    category: test.category,
    passed: intentCorrect && domainCorrect && confidenceCorrect && templateMatch,
    intentAccuracy: intentCorrect,
    domainAccuracy: domainCorrect, 
    confidenceCalibration: confidenceCorrect,
    templateSelection: templateMatch,
    processingTime,
    failureReasons: [
      ...(intentCorrect ? [] : [`Intent: expected ${test.expectedIntent}, got ${actualIntent}`]),
      ...(domainCorrect ? [] : [`Domain: expected ${test.expectedDomain}, got ${actualDomain}`]),
      ...(confidenceCorrect ? [] : [`Confidence: expected ${test.expectedConfidence}+, got ${actualConfidence}`]),
      ...(templateMatch ? [] : [`Template: expected [${test.expectedTemplates.join(',')}], got [${actualTemplates.join(',')}]`])
    ]
  };
}

async function runDiagnosticValidation() {
  console.log("\n🔬 Phase 1.3 Diagnostic Validation Suite");
  console.log("Objective: Identify failure patterns and refinement priorities");
  console.log("Sample Size: 14 prompts across 6 categories");
  console.log("=" .repeat(80));

  const results = [];
  let totalProcessingTime = 0;

  // Initialize components
  const classifier = new HybridClassifier();
  const engine = new TemplateEngine();
  await classifier.initialize();

  console.log("\n🧪 Diagnostic Testing Execution:\n");

  for (const test of diagnosticTests) {
    try {
      const domainResult = await classifier.classify(test.prompt);
      const lintResult = analyzePrompt(test.prompt);
      
      const startTime = performance.now();
      const candidates = await engine.generateCandidates(test.prompt, lintResult);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      totalProcessingTime += processingTime;
      
      const templates = candidates.map(c => c.type || 'unknown');
      
      // Extract semantic analysis from metadata
      let semanticIntent = "unknown";
      if (candidates.length > 0 && candidates[0].metadata?.selectionMetadata?.domainContext?.semanticContext) {
        semanticIntent = candidates[0].metadata.selectionMetadata.domainContext.semanticContext.intentType;
      }
      
      // Extract calibrated confidence from metadata
      let calibratedConfidence = domainResult.confidence;
      if (candidates.length > 0 && candidates[0].metadata?.selectionMetadata?.domainContext?.confidence) {
        calibratedConfidence = candidates[0].metadata.selectionMetadata.domainContext.confidence;
      }
      
      const result = analyzeDiagnosticResult(
        test,
        semanticIntent,
        domainResult.domain,
        calibratedConfidence,
        templates,
        processingTime
      );
      
      results.push(result);
      
      console.log(`${test.critical ? "🚨" : "📋"} ${test.name} [${test.category}]`);
      console.log(`   Prompt: "${test.prompt}"`);
      console.log(`   Result: ${result.passed ? "✅ PASS" : "❌ FAIL"} (${test.critical ? "CRITICAL" : "DIAGNOSTIC"})`);
      if (!result.passed) {
        console.log(`   Issues: ${result.failureReasons.join(", ")}`);
      }
      console.log(`   Domain: ${domainResult.domain} (${domainResult.confidence} → ${calibratedConfidence} confidence)`);
      console.log(`   Templates: [${templates.join(", ")}]`);
      console.log(`   Time: ${processingTime.toFixed(2)}ms`);
      console.log("─".repeat(60));
      
    } catch (error) {
      console.log(`❌ ERROR in ${test.name}: ${error.message}`);
      results.push({
        testName: test.name,
        category: test.category,
        passed: false,
        intentAccuracy: false,
        domainAccuracy: false,
        confidenceCalibration: false,
        templateSelection: false,
        processingTime: 0,
        failureReasons: [`Execution error: ${error.message}`]
      });
    }
  }

  // Diagnostic Analysis
  console.log("\n📊 DIAGNOSTIC ANALYSIS");
  console.log("=" .repeat(80));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const criticalTests = diagnosticTests.filter(t => t.critical).length;
  const passedCritical = results.filter((r, i) => diagnosticTests[i].critical && r.passed).length;

  console.log(`Overall Success Rate: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  console.log(`Critical Edge Cases: ${passedCritical}/${criticalTests} (${(passedCritical/criticalTests*100).toFixed(1)}%)`);
  
  // Category-specific analysis
  const categories = ['edge_case', 'analytical_intent', 'code_confidence', 'writing_clarity', 'research_methodology', 'complex_multi_domain'];
  
  console.log("\n📈 Category Performance Analysis:");
  for (const category of categories) {
    const categoryResults = results.filter((r, i) => diagnosticTests[i].category === category);
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    const categoryTotal = categoryResults.length;
    
    if (categoryTotal > 0) {
      const successRate = (categoryPassed / categoryTotal * 100).toFixed(1);
      console.log(`   ${category}: ${categoryPassed}/${categoryTotal} (${successRate}%)`);
      
      // Identify failure patterns
      const failedTests = categoryResults.filter(r => !r.passed);
      if (failedTests.length > 0) {
        console.log(`      Failure patterns:`);
        failedTests.forEach(f => {
          console.log(`        - ${f.testName}: ${f.failureReasons.join(", ")}`);
        });
      }
    }
  }

  // Performance Analysis
  const avgProcessingTime = totalProcessingTime / totalTests;
  console.log(`\nPerformance: ${avgProcessingTime.toFixed(2)}ms average (${avgProcessingTime < 100 ? "✅ WITHIN BUDGET" : "❌ EXCEEDS BUDGET"})`);

  // Issue Pattern Analysis
  console.log("\n🔍 Issue Pattern Analysis:");
  const intentFailures = results.filter(r => !r.intentAccuracy).length;
  const domainFailures = results.filter(r => !r.domainAccuracy).length;
  const confidenceFailures = results.filter(r => !r.confidenceCalibration).length;
  const templateFailures = results.filter(r => !r.templateSelection).length;

  console.log(`   Intent Classification Issues: ${intentFailures}/${totalTests} (${(intentFailures/totalTests*100).toFixed(1)}%)`);
  console.log(`   Domain Classification Issues: ${domainFailures}/${totalTests} (${(domainFailures/totalTests*100).toFixed(1)}%)`);
  console.log(`   Confidence Calibration Issues: ${confidenceFailures}/${totalTests} (${(confidenceFailures/totalTests*100).toFixed(1)}%)`);
  console.log(`   Template Selection Issues: ${templateFailures}/${totalTests} (${(templateFailures/totalTests*100).toFixed(1)}%)`);

  // Refinement Priority Recommendations
  console.log("\n🎯 Phase 1.3.1 Refinement Priorities:");
  if (intentFailures > domainFailures && intentFailures > confidenceFailures) {
    console.log("   1. PRIORITY: Intent classification algorithm refinement");
  }
  if (confidenceFailures > 0) {
    console.log("   2. IMPORTANT: Confidence calibration optimization");
  }
  if (templateFailures > 0) {
    console.log("   3. MODERATE: Template selection logic enhancement");
  }

  // Production Readiness Assessment
  const productionThreshold = 0.90; // 90% success rate for production approval
  const criticalThreshold = 1.0;    // 100% critical edge cases must pass
  
  const overallSuccess = (passedTests / totalTests) >= productionThreshold;
  const criticalSuccess = (passedCritical / criticalTests) >= criticalThreshold;
  const performanceAcceptable = avgProcessingTime < 100;

  console.log("\n🎯 PRODUCTION READINESS ASSESSMENT:");
  console.log(`Overall Quality: ${(passedTests/totalTests*100).toFixed(1)}% (${overallSuccess ? "✅ MEETS" : "❌ BELOW"} 90% threshold)`);
  console.log(`Critical Edge Cases: ${(passedCritical/criticalTests*100).toFixed(1)}% (${criticalSuccess ? "✅ MEETS" : "❌ BELOW"} 100% threshold)`);
  console.log(`Performance: ${avgProcessingTime.toFixed(2)}ms (${performanceAcceptable ? "✅ ACCEPTABLE" : "❌ EXCEEDS BUDGET"})`);

  const productionReady = overallSuccess && criticalSuccess && performanceAcceptable;

  if (productionReady) {
    console.log("\n✅ PHASE 1.3 APPROVED FOR PRODUCTION");
    console.log("✅ Level 2 Pattern Recognition Engine VALIDATED");
    console.log("🚀 Ready for user deployment");
  } else {
    console.log("\n❌ PHASE 1.3 REQUIRES REFINEMENT");
    console.log("📋 Recommended Phase 1.3.1 focus areas identified above");
    console.log("🔄 Additional development cycle required");
  }

  return {
    productionReady,
    overallSuccessRate: passedTests / totalTests,
    criticalSuccessRate: passedCritical / criticalTests,
    averageProcessingTime: avgProcessingTime,
    categoryAnalysis: categories.map(cat => {
      const catResults = results.filter((r, i) => diagnosticTests[i].category === cat);
      return {
        category: cat,
        successRate: catResults.filter(r => r.passed).length / catResults.length,
        totalTests: catResults.length
      };
    })
  };
}

// Execute diagnostic validation
runDiagnosticValidation().then(analysis => {
  process.exit(analysis.productionReady ? 0 : 1);
}).catch(error => {
  console.error("Diagnostic validation failed:", error);
  process.exit(1);
});
