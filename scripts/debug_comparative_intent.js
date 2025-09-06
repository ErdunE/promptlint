// scripts/debug_comparative_intent.js
// Debug why "evaluate cloud platforms" is analytical instead of comparative

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function debugComparativeIntent() {
  console.log("\n🔬 Comparative Intent Debug");
  console.log("Objective: Fix comparative intent detection");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    
    const testCases = [
      {
        prompt: "evaluate different cloud computing platforms",
        expected: "comparative",
        description: "Should be comparative - evaluating different options"
      },
      {
        prompt: "compare React and Vue frameworks",
        expected: "comparative", 
        description: "Should be comparative - direct comparison"
      },
      {
        prompt: "analyze the pros and cons of microservices",
        expected: "comparative",
        description: "Should be comparative - pros/cons analysis"
      },
      {
        prompt: "choose between MySQL and PostgreSQL",
        expected: "comparative",
        description: "Should be comparative - choice between options"
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: "${testCase.prompt}"`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Description: ${testCase.description}`);
      
      const result = analyzer.analyze(testCase.prompt);
      
      console.log(`Actual Intent: ${result.intentType}`);
      console.log(`Context: ${JSON.stringify(result.context)}`);
      console.log(`Indicators: ${JSON.stringify(result.indicators)}`);
      
      const match = result.intentType === testCase.expected;
      console.log(`Match: ${match ? "✅ CORRECT" : "❌ INCORRECT"}`);
      
      if (!match) {
        console.log(`\n🔍 Comparative Pattern Analysis:`);
        const prompt = testCase.prompt.toLowerCase();
        
        // Check current comparative patterns
        const comparativePatterns = [
          'compare', 'versus', 'vs', 'against', 'between', 'difference',
          'pros and cons', 'advantages', 'disadvantages', 'better', 'worse',
          'prefer', 'choose', 'select', 'decide', 'option', 'alternative'
        ];
        
        console.log(`Comparative patterns in "${prompt}":`);
        const matchedComparative = comparativePatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Matched: ${JSON.stringify(matchedComparative)}`);
        
        // Check if "evaluate" should trigger comparative
        if (prompt.includes('evaluate') || prompt.includes('assessment')) {
          console.log(`  Contains evaluation terms - should this trigger comparative?`);
        }
        
        // Check for "different" keyword
        if (prompt.includes('different')) {
          console.log(`  Contains "different" - strong comparative signal`);
        }
      }
      
      console.log("─".repeat(60));
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugComparativeIntent().catch(error => {
  console.error("Comparative intent debug failed:", error);
  process.exit(1);
});
