// scripts/debug_project_goals_domain.js
// Debug why "outline project goals" is classified as code instead of research

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";

async function debugProjectGoalsDomain() {
  console.log("\n🔬 Project Goals Domain Debug");
  console.log("Objective: Fix 'outline project goals' domain classification");
  console.log("=" .repeat(80));

  try {
    const classifier = new HybridClassifier();
    await classifier.initialize();
    
    const testPrompt = "outline project goals";
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Expected Domain: research`);
    console.log(`Current Issue: Classified as code`);
    
    // Get detailed classification result
    const result = await classifier.classify(testPrompt);
    
    console.log(`\n🔍 Current Classification:`);
    console.log(`   Domain: ${result.domain}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Sub-category: ${result.subCategory || 'none'}`);
    console.log(`   Indicators: ${JSON.stringify(result.indicators)}`);
    
    // Test variations to understand the pattern
    console.log(`\n🧪 Pattern Analysis:`);
    
    const variations = [
      "outline project goals",
      "outline goals for project", 
      "project goals outline",
      "plan project goals",
      "define project objectives",
      "research project planning",
      "outline research goals",
      "project planning outline"
    ];
    
    for (const variation of variations) {
      try {
        const varResult = await classifier.classify(variation);
        console.log(`   "${variation}": ${varResult.domain} (${varResult.confidence})`);
      } catch (error) {
        console.log(`   "${variation}": ERROR - ${error.message}`);
      }
    }
    
    // Test code-specific vs research-specific patterns
    console.log(`\n🔍 Code vs Research Pattern Analysis:`);
    
    const codePrompts = [
      "implement project architecture",
      "build project framework", 
      "debug project issues",
      "code project features"
    ];
    
    const researchPrompts = [
      "research project methodologies",
      "investigate project approaches",
      "study project requirements",
      "explore project options"
    ];
    
    console.log(`\nCode-oriented prompts:`);
    for (const prompt of codePrompts) {
      const result = await classifier.classify(prompt);
      console.log(`   "${prompt}": ${result.domain} (${result.confidence})`);
    }
    
    console.log(`\nResearch-oriented prompts:`);
    for (const prompt of researchPrompts) {
      const result = await classifier.classify(prompt);
      console.log(`   "${prompt}": ${result.domain} (${result.confidence})`);
    }
    
    // Analyze specific keywords
    console.log(`\n💡 Keyword Analysis for Domain Classification:`);
    console.log(`   "outline" - planning/strategy keyword (should favor research)`);
    console.log(`   "project" - neutral keyword (could be code or research)`);
    console.log(`   "goals" - planning/strategy keyword (should favor research)`);
    console.log(`   Missing code verbs: implement, build, debug, develop, code`);
    console.log(`   Strong planning signals: outline + goals combination`);

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugProjectGoalsDomain().catch(error => {
  console.error("Project goals domain debug failed:", error);
  process.exit(1);
});
