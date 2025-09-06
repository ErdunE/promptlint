// scripts/debug_semantic_analyzer.js
// Test SemanticAnalyzer independently to isolate intent classification failure

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function testSemanticAnalyzer() {
  console.log("\n🔬 SemanticAnalyzer Isolation Testing");
  console.log("Objective: Identify intent classification failure root cause");
  console.log("=" .repeat(80));

  try {
    // Initialize SemanticAnalyzer
    const analyzer = new SemanticAnalyzer();
    console.log("✅ SemanticAnalyzer initialized successfully");

    // Test cases for intent classification
    const testCases = [
      {
        prompt: "implement REST API",
        expectedIntent: "instructional",
        description: "REST API implementation - should be instructional"
      },
      {
        prompt: "analyze customer behavior patterns", 
        expectedIntent: "analytical",
        description: "Data analysis - should be analytical"
      },
      {
        prompt: "debug performance issues",
        expectedIntent: "debugging", 
        description: "Performance debugging - should be debugging"
      },
      {
        prompt: "write engaging blog post",
        expectedIntent: "creative",
        description: "Content creation - should be creative"
      },
      {
        prompt: "research best practices",
        expectedIntent: "investigative",
        description: "Research task - should be investigative"
      }
    ];

    console.log("\n🧪 Testing Intent Classification:\n");

    for (const testCase of testCases) {
      try {
        console.log(`📝 Testing: "${testCase.prompt}"`);
        console.log(`   Expected Intent: ${testCase.expectedIntent}`);
        console.log(`   Description: ${testCase.description}`);
        
        const result = analyzer.analyze(testCase.prompt);
        
        console.log(`   ✅ Analysis completed`);
        console.log(`   Actual Intent: ${result.intentType}`);
        console.log(`   Complexity: ${result.complexity}`);
        console.log(`   Completeness: ${result.completeness}`);
        console.log(`   Specificity: ${result.specificity}`);
        console.log(`   Context Markers: ${JSON.stringify(result.context)}`);
        
        const intentMatch = result.intentType === testCase.expectedIntent;
        console.log(`   Intent Match: ${intentMatch ? "✅ CORRECT" : "❌ INCORRECT"}`);
        console.log("─".repeat(60));
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        console.log("─".repeat(60));
      }
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: Failed to initialize SemanticAnalyzer`);
    console.log(`Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testSemanticAnalyzer().catch(error => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
