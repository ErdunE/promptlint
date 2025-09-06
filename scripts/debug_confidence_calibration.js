// scripts/debug_confidence_calibration.js
// Test ConfidenceCalibrator with critical edge cases

import { ConfidenceCalibrator, SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";

async function testConfidenceCalibration() {
  console.log("\n🔬 Confidence Calibration Testing");
  console.log("Objective: Debug confidence calibration for critical edge cases");
  console.log("=" .repeat(80));

  try {
    const calibrator = new ConfidenceCalibrator();
    const semanticAnalyzer = new SemanticAnalyzer();
    const classifier = new HybridClassifier();
    await classifier.initialize();

    const testCases = [
      {
        name: "REST API (needs 90+ confidence)",
        prompt: "implement REST API",
        expectedMinConfidence: 90
      },
      {
        name: "Project Goals (needs 70+ confidence, non-code domain)",
        prompt: "outline project goals", 
        expectedMinConfidence: 70
      },
      {
        name: "Debug Performance (needs 80+ confidence)",
        prompt: "debug performance issues",
        expectedMinConfidence: 80
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.name}`);
      console.log(`Prompt: "${testCase.prompt}"`);
      console.log(`Expected Min Confidence: ${testCase.expectedMinConfidence}`);

      // Get domain classification
      const domainResult = await classifier.classify(testCase.prompt);
      console.log(`\n1️⃣ Domain Classification:`);
      console.log(`   Domain: ${domainResult.domain}`);
      console.log(`   Confidence: ${domainResult.confidence}`);
      console.log(`   Sub-category: ${domainResult.subCategory || 'none'}`);
      console.log(`   Indicators: ${JSON.stringify(domainResult.indicators)}`);

      // Get semantic analysis
      const semantics = semanticAnalyzer.analyze(testCase.prompt);
      console.log(`\n2️⃣ Semantic Analysis:`);
      console.log(`   Intent: ${semantics.intentType}`);
      console.log(`   Complexity: ${semantics.complexity}`);
      console.log(`   Completeness: ${semantics.completeness}`);
      console.log(`   Specificity: ${semantics.specificity}`);
      console.log(`   Context: ${JSON.stringify(semantics.context)}`);
      console.log(`   Indicators: ${JSON.stringify(semantics.indicators || [])}`);

      // Test confidence calibration
      const calibrationResult = calibrator.refineConfidence(
        domainResult.confidence,
        domainResult,
        semantics
      );
      
      console.log(`\n3️⃣ Confidence Calibration:`);
      console.log(`   Base Confidence: ${calibrationResult.baseConfidence}`);
      console.log(`   Semantic Boost: ${calibrationResult.semanticBoost}`);
      console.log(`   Domain Alignment: ${calibrationResult.domainAlignment}`);
      console.log(`   Specificity Bonus: ${calibrationResult.specificityBonus}`);
      console.log(`   Context Relevance: ${calibrationResult.contextRelevance}`);
      console.log(`   Final Confidence: ${calibrationResult.finalConfidence}`);
      
      const meetsThreshold = calibrationResult.finalConfidence >= testCase.expectedMinConfidence;
      console.log(`   Meets Threshold: ${meetsThreshold ? "✅ YES" : "❌ NO"} (${calibrationResult.finalConfidence} vs ${testCase.expectedMinConfidence}+)`);
      
      // Test specific detection methods
      console.log(`\n4️⃣ Detection Method Tests:`);
      try {
        const isApiDev = calibrator.isApiDevelopmentPrompt(domainResult, semantics);
        console.log(`   Is API Development: ${isApiDev}`);
      } catch (error) {
        console.log(`   Is API Development: ERROR - ${error.message}`);
      }
      
      try {
        const isProjectPlanning = calibrator.isProjectPlanningPrompt(semantics);
        console.log(`   Is Project Planning: ${isProjectPlanning}`);
      } catch (error) {
        console.log(`   Is Project Planning: ERROR - ${error.message}`);
      }

      console.log("─".repeat(60));
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testConfidenceCalibration().catch(error => {
  console.error("Confidence calibration test failed:", error);
  process.exit(1);
});
