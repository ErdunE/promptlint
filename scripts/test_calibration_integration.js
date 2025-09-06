// scripts/test_calibration_integration.js
// Test if confidence calibration is working in the actual pipeline

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function testCalibrationIntegration() {
  console.log("\n🔬 Confidence Calibration Integration Test");
  console.log("Objective: Verify calibration works in actual pipeline");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const testPrompt = "implement REST API";
    
    console.log(`\n📝 Testing with prompt: "${testPrompt}"`);

    const lintResult = analyzePrompt(testPrompt);
    const candidates = await engine.generateCandidates(testPrompt, lintResult);
    
    if (candidates.length > 0) {
      const candidate = candidates[0];
      console.log(`\n📊 Pipeline Results:`);
      console.log(`Candidate Type: ${candidate.type}`);
      console.log(`Candidate Score: ${candidate.score}`);
      
      if (candidate.metadata?.selectionMetadata?.domainContext) {
        const domainContext = candidate.metadata.selectionMetadata.domainContext;
        console.log(`\n🎯 Domain Context Analysis:`);
        console.log(`Domain: ${domainContext.domain}`);
        console.log(`Confidence: ${domainContext.confidence}`);
        console.log(`Sub-category: ${domainContext.subCategory || 'none'}`);
        
        if (domainContext.semanticContext) {
          console.log(`\n🧠 Semantic Context:`);
          console.log(`Intent: ${domainContext.semanticContext.intentType}`);
          console.log(`Complexity: ${domainContext.semanticContext.complexity}`);
        }
        
        // Check if confidence meets threshold
        const meetsThreshold = domainContext.confidence >= 90;
        console.log(`\n✅ Confidence Assessment:`);
        console.log(`Meets 90+ threshold: ${meetsThreshold ? "✅ YES" : "❌ NO"} (${domainContext.confidence} vs 90+)`);
        
        if (meetsThreshold) {
          console.log(`🎉 SUCCESS: REST API confidence calibration working in pipeline!`);
        } else {
          console.log(`❌ ISSUE: Confidence calibration not working in pipeline`);
        }
      }
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testCalibrationIntegration().catch(error => {
  console.error("Calibration integration test failed:", error);
  process.exit(1);
});
