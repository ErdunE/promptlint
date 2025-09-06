// scripts/debug_build_website_intent.js
// Debug why "build responsive website" is generative instead of instructional

import { SemanticAnalyzer, ConfidenceCalibrator } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";

async function debugBuildWebsiteIntent() {
  console.log("\n🔬 Build Website Intent Debug");
  console.log("Objective: Fix 'build responsive website' intent and confidence");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    const calibrator = new ConfidenceCalibrator();
    const classifier = new HybridClassifier();
    await classifier.initialize();
    
    const testPrompt = "build responsive website with navigation";
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Expected Intent: instructional`);
    console.log(`Expected Confidence: 80+`);
    console.log(`Current Issues: Intent=generative, Confidence=39`);
    
    // Get semantic analysis
    const semantics = analyzer.analyze(testPrompt);
    console.log(`\n🔍 Current Semantic Analysis:`);
    console.log(`   Intent: ${semantics.intentType}`);
    console.log(`   Complexity: ${semantics.complexity}`);
    console.log(`   Completeness: ${semantics.completeness}`);
    console.log(`   Specificity: ${semantics.specificity}`);
    console.log(`   Context: ${JSON.stringify(semantics.context)}`);
    console.log(`   Indicators: ${JSON.stringify(semantics.indicators)}`);
    
    // Get domain classification
    const domainResult = await classifier.classify(testPrompt);
    console.log(`\n🔍 Current Domain Classification:`);
    console.log(`   Domain: ${domainResult.domain}`);
    console.log(`   Confidence: ${domainResult.confidence}`);
    console.log(`   Sub-category: ${domainResult.subCategory || 'none'}`);
    console.log(`   Indicators: ${JSON.stringify(domainResult.indicators)}`);
    
    // Test confidence calibration
    const calibrationResult = calibrator.refineConfidence(
      domainResult.confidence,
      domainResult,
      semantics
    );
    
    console.log(`\n🔍 Current Confidence Calibration:`);
    console.log(`   Base Confidence: ${calibrationResult.baseConfidence}`);
    console.log(`   Semantic Boost: ${calibrationResult.semanticBoost}`);
    console.log(`   Domain Alignment: ${calibrationResult.domainAlignment}`);
    console.log(`   Specificity Bonus: ${calibrationResult.specificityBonus}`);
    console.log(`   Context Relevance: ${calibrationResult.contextRelevance}`);
    console.log(`   Final Confidence: ${calibrationResult.finalConfidence}`);
    
    // Analyze why it's not instructional
    console.log(`\n💡 Intent Classification Analysis:`);
    console.log(`   "build" should trigger instructional patterns`);
    console.log(`   "responsive website" is a specific artifact to create`);
    console.log(`   "with navigation" provides implementation details`);
    
    // Test pattern variations
    console.log(`\n🧪 Intent Pattern Analysis:`);
    const buildVariations = [
      "build responsive website with navigation",
      "build a responsive website",
      "create responsive website", 
      "develop responsive website",
      "implement responsive website",
      "make responsive website"
    ];
    
    for (const variation of buildVariations) {
      const result = analyzer.analyze(variation);
      console.log(`   "${variation}": ${result.intentType}`);
    }
    
    // Check current instructional patterns
    console.log(`\n🔍 Instructional Pattern Check:`);
    const instructionalKeywords = ['how to', 'how do i', 'how can i', 'show me', 'teach me', 'create a', 'build a', 'implement', 'write a', 'make a', 'generate', 'step by step', 'tutorial', 'guide', 'instructions'];
    const prompt = testPrompt.toLowerCase();
    
    console.log(`   Current instructional patterns in "${prompt}":`);
    const matchedInstructional = instructionalKeywords.filter(pattern => prompt.includes(pattern));
    console.log(`   Matched: ${JSON.stringify(matchedInstructional)}`);
    
    if (matchedInstructional.length === 0) {
      console.log(`   ❌ No current patterns match - need to add "build <artifact>" pattern`);
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugBuildWebsiteIntent().catch(error => {
  console.error("Build website intent debug failed:", error);
  process.exit(1);
});
