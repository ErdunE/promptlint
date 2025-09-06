// scripts/debug_investigative_intent.js
// Debug why "research ML approaches" is classified as instructional instead of investigative

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function debugInvestigativeIntent() {
  console.log("\n🔬 Investigative Intent Debug");
  console.log("Objective: Fix 'research ML approaches' misclassification");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    
    const testCases = [
      {
        prompt: "research machine learning approaches and implement prototype",
        expected: "investigative",
        description: "Multi-domain: research first, then implement - should be investigative"
      },
      {
        prompt: "research best practices for security",
        expected: "investigative", 
        description: "Pure research task - should be investigative"
      },
      {
        prompt: "investigate different cloud solutions",
        expected: "investigative",
        description: "Investigation task - should be investigative"
      },
      {
        prompt: "explore machine learning algorithms",
        expected: "investigative",
        description: "Exploration task - should be investigative"
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
        
        // Check investigative patterns
        const investigativePatterns = [
          'research', 'investigate', 'explore', 'find out', 'discover', 'study',
          'look into', 'examine', 'survey', 'gather information', 'collect data',
          'best practices', 'industry standards', 'methodologies', 'approaches',
          'solutions', 'options', 'alternatives', 'possibilities'
        ];
        
        console.log(`Investigative patterns in "${prompt}":`);
        const matchedInvestigative = investigativePatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Matched: ${JSON.stringify(matchedInvestigative)}`);
        
        // Check what patterns it might be matching instead
        const instructionalPatterns = ['implement', 'create', 'build', 'make', 'write', 'generate'];
        const matchedInstructional = instructionalPatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Instructional patterns matched: ${JSON.stringify(matchedInstructional)}`);
        
        // Check explanatory patterns
        const explanatoryPatterns = ['explain', 'document', 'describe'];
        const matchedExplanatory = explanatoryPatterns.filter(pattern => prompt.includes(pattern));
        console.log(`  Explanatory patterns matched: ${JSON.stringify(matchedExplanatory)}`);
      }
      
      console.log("─".repeat(60));
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugInvestigativeIntent().catch(error => {
  console.error("Investigative intent debug failed:", error);
  process.exit(1);
});
