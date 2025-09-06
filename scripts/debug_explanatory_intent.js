// scripts/debug_explanatory_intent.js
// Debug why "document API endpoints" is classified as generative instead of explanatory

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function debugExplanatoryIntent() {
  console.log("\n🔬 Explanatory Intent Debug");
  console.log("Objective: Fix 'document API endpoints' misclassification");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    
    const testCases = [
      {
        prompt: "document API endpoints with usage examples",
        expected: "explanatory",
        description: "Technical documentation - should be explanatory"
      },
      {
        prompt: "explain how the authentication system works",
        expected: "explanatory", 
        description: "Clear explanation request - should be explanatory"
      },
      {
        prompt: "document the database schema",
        expected: "explanatory",
        description: "Documentation task - should be explanatory"
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: "${testCase.prompt}"`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Description: ${testCase.description}`);
      
      const result = analyzer.analyze(testCase.prompt);
      
      console.log(`Actual Intent: ${result.intentType}`);
      console.log(`Indicators: ${JSON.stringify(result.indicators)}`);
      
      const match = result.intentType === testCase.expected;
      console.log(`Match: ${match ? "✅ CORRECT" : "❌ INCORRECT"}`);
      
      if (!match) {
        console.log(`\n🔍 Pattern Analysis:`);
        const prompt = testCase.prompt.toLowerCase();
        
        // Check explanatory patterns
        const explanatoryPatterns = [
          'explain', 'what is', 'what are', 'define', 'describe', 'tell me about',
          'meaning of', 'purpose of', 'why', 'how does', 'how is',
          'clarify', 'elaborate', 'detail', 'information about'
        ];
        
        console.log(`Explanatory patterns in "${prompt}":`);
        const matchedExplanatory = explanatoryPatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Matched: ${JSON.stringify(matchedExplanatory)}`);
        
        // Check if "document" should trigger explanatory
        if (prompt.includes('document')) {
          console.log(`  Contains "document" - should this trigger explanatory?`);
        }
        
        // Check what patterns it might be matching instead
        const instructionalPatterns = ['implement', 'create', 'build', 'make', 'write', 'generate'];
        const matchedInstructional = instructionalPatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Instructional patterns matched: ${JSON.stringify(matchedInstructional)}`);
      }
      
      console.log("─".repeat(60));
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugExplanatoryIntent().catch(error => {
  console.error("Explanatory intent debug failed:", error);
  process.exit(1);
});
