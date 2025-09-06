// scripts/debug_borderline_confidence.js
// Debug borderline confidence failures for small gaps

import { ConfidenceCalibrator, SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";

async function debugBorderlineConfidence() {
  console.log("\n🔬 Borderline Confidence Debug");
  console.log("Objective: Analyze small confidence gaps preventing passing validation");
  console.log("=" .repeat(80));

  try {
    const calibrator = new ConfidenceCalibrator();
    const semanticAnalyzer = new SemanticAnalyzer();
    const classifier = new HybridClassifier();
    await classifier.initialize();

    const borderlineCases = [
      {
        prompt: "analyze customer behavior patterns",
        currentConfidence: 72,
        requiredConfidence: 85,
        gap: 13,
        description: "Analytical intent, analysis domain - 13 points short"
      },
      {
        prompt: "write engaging blog post about sustainable technology",
        currentConfidence: 84,
        requiredConfidence: 85,
        gap: 1,
        description: "Creative intent, writing domain - 1 point short!"
      },
      {
        prompt: "document API endpoints with usage examples",
        currentConfidence: 60,
        requiredConfidence: 80,
        gap: 20,
        description: "Explanatory intent, writing domain - 20 points short"
      },
      {
        prompt: "evaluate different cloud computing platforms",
        currentConfidence: 51,
        requiredConfidence: 80,
        gap: 29,
        description: "Comparative intent, analysis domain - 29 points short"
      }
    ];

    for (const testCase of borderlineCases) {
      console.log(`\n📝 Testing: "${testCase.prompt}"`);
      console.log(`Gap Analysis: ${testCase.currentConfidence} → ${testCase.requiredConfidence} (${testCase.gap} points short)`);
      console.log(`Description: ${testCase.description}`);

      // Get domain classification
      const domainResult = await classifier.classify(testCase.prompt);
      console.log(`\n1️⃣ Domain Classification:`);
      console.log(`   Domain: ${domainResult.domain}`);
      console.log(`   Base Confidence: ${domainResult.confidence}`);
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

      // Test confidence calibration
      const calibrationResult = calibrator.refineConfidence(
        domainResult.confidence,
        domainResult,
        semantics
      );
      
      console.log(`\n3️⃣ Current Confidence Calibration:`);
      console.log(`   Base Confidence: ${calibrationResult.baseConfidence}`);
      console.log(`   Semantic Boost: ${calibrationResult.semanticBoost}`);
      console.log(`   Domain Alignment: ${calibrationResult.domainAlignment}`);
      console.log(`   Specificity Bonus: ${calibrationResult.specificityBonus}`);
      console.log(`   Context Relevance: ${calibrationResult.contextRelevance}`);
      console.log(`   Final Confidence: ${calibrationResult.finalConfidence}`);
      
      const actualGap = testCase.requiredConfidence - calibrationResult.finalConfidence;
      console.log(`   Actual Gap: ${actualGap} points (${actualGap <= 5 ? "SMALL GAP" : "LARGE GAP"})`);
      
      // Analyze what could boost confidence
      console.log(`\n4️⃣ Potential Confidence Boosts:`);
      
      // Check if intent-domain combination should get special treatment
      console.log(`   Intent-Domain Combo: ${semantics.intentType} + ${domainResult.domain}`);
      
      // Suggest specific boosts needed
      if (semantics.intentType === 'analytical' && domainResult.domain === 'analysis') {
        console.log(`   💡 Suggestion: Add analytical-analysis domain alignment bonus (+15)`);
      }
      
      if (semantics.intentType === 'creative' && domainResult.domain === 'writing') {
        console.log(`   💡 Suggestion: Add creative-writing domain alignment bonus (+10)`);
      }
      
      if (semantics.intentType === 'explanatory' && domainResult.domain === 'writing') {
        console.log(`   💡 Suggestion: Add explanatory-writing documentation bonus (+25)`);
      }
      
      if (semantics.intentType === 'comparative') {
        console.log(`   💡 Suggestion: Add comparative intent bonus (+20)`);
      }
      
      // Check for high-quality prompt bonuses
      if (domainResult.confidence >= 80) {
        console.log(`   💡 Suggestion: Add high base confidence bonus (+10)`);
      }
      
      // Check for specificity improvements
      if (semantics.specificity === 'vague' && testCase.prompt.length > 30) {
        console.log(`   💡 Suggestion: Recalibrate specificity for detailed prompts (+5)`);
      }
      
      console.log("─".repeat(80));
    }

    // Summary of needed improvements
    console.log(`\n📊 CONFIDENCE CALIBRATION IMPROVEMENT RECOMMENDATIONS:`);
    console.log(`1. Add intent-domain alignment bonuses for perfect matches`);
    console.log(`2. Boost creative writing prompts (+10-15 points)`);
    console.log(`3. Enhance explanatory documentation prompts (+20-25 points)`);
    console.log(`4. Add comparative intent recognition bonus (+15-20 points)`);
    console.log(`5. Reward high-quality prompts with base confidence bonuses`);

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugBorderlineConfidence().catch(error => {
  console.error("Borderline confidence debug failed:", error);
  process.exit(1);
});
