// scripts/test_evaluate_cloud_domain.js
// Test domain classification fix for "evaluate cloud platforms"

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";

async function testEvaluateCloudDomain() {
  console.log("\n🔬 Evaluate Cloud Platforms Domain Test");
  console.log("Objective: Verify 'evaluate cloud platforms' → research domain");
  console.log("=" .repeat(80));

  try {
    const classifier = new HybridClassifier();
    await classifier.initialize();
    
    const testPrompts = [
      {
        prompt: "evaluate different cloud computing platforms",
        expected: "research",
        description: "Main test case"
      },
      {
        prompt: "compare cloud platforms",
        expected: "research", 
        description: "Similar comparative research"
      },
      {
        prompt: "evaluate performance data",
        expected: "analysis",
        description: "Should stay analysis (data analysis)"
      },
      {
        prompt: "analyze user data patterns",
        expected: "analysis",
        description: "Should stay analysis (data analysis)"
      }
    ];
    
    for (const test of testPrompts) {
      console.log(`\n📝 Testing: "${test.prompt}"`);
      console.log(`Expected: ${test.expected}`);
      console.log(`Description: ${test.description}`);
      
      const result = await classifier.classify(test.prompt);
      
      console.log(`Result: ${result.domain} (confidence: ${result.confidence})`);
      console.log(`Indicators: ${JSON.stringify(result.indicators)}`);
      
      const match = result.domain === test.expected;
      console.log(`Status: ${match ? "✅ CORRECT" : "❌ INCORRECT"}`);
      
      if (!match) {
        console.log(`   Issue: Expected ${test.expected}, got ${result.domain}`);
      }
      
      console.log("─".repeat(60));
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testEvaluateCloudDomain().catch(error => {
  console.error("Evaluate cloud domain test failed:", error);
  process.exit(1);
});
