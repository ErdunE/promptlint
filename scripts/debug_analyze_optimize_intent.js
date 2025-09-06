// scripts/debug_analyze_optimize_intent.js
// Debug why "analyze user data to optimize code performance and document findings" is explanatory instead of analytical

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function debugAnalyzeOptimizeIntent() {
  console.log("\n🔬 Analyze Optimize Intent Debug");
  console.log("Objective: Fix multi-verb intent priority (analytical should win over explanatory)");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    
    const testPrompt = "analyze user data to optimize code performance and document findings";
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Expected Intent: analytical`);
    console.log(`Current Issue: Intent=explanatory (document overrides analyze)`);
    
    const result = analyzer.analyze(testPrompt);
    
    console.log(`\n🔍 Current Analysis:`);
    console.log(`   Intent: ${result.intentType}`);
    console.log(`   Complexity: ${result.complexity}`);
    console.log(`   Completeness: ${result.completeness}`);
    console.log(`   Specificity: ${result.specificity}`);
    console.log(`   Context: ${JSON.stringify(result.context)}`);
    console.log(`   Indicators: ${JSON.stringify(result.indicators)}`);
    
    // Analyze verb patterns
    console.log(`\n🔍 Verb Pattern Analysis:`);
    const verbs = {
      analytical: ['analyze', 'examine', 'study', 'investigate', 'assess', 'evaluate', 'review', 'inspect'],
      explanatory: ['explain', 'describe', 'document', 'clarify', 'elaborate', 'detail', 'outline', 'summarize'],
      instructional: ['optimize', 'improve', 'enhance', 'implement', 'build', 'create', 'develop']
    };
    
    const prompt = testPrompt.toLowerCase();
    
    for (const [category, verbList] of Object.entries(verbs)) {
      const matchedVerbs = verbList.filter(verb => prompt.includes(verb));
      if (matchedVerbs.length > 0) {
        console.log(`   ${category}: ${matchedVerbs.join(', ')}`);
        
        // Find position of first match
        const positions = matchedVerbs.map(verb => ({
          verb,
          position: prompt.indexOf(verb)
        })).sort((a, b) => a.position - b.position);
        
        console.log(`     First occurrence: "${positions[0].verb}" at position ${positions[0].position}`);
      }
    }
    
    // Test different priority strategies
    console.log(`\n🧪 Intent Priority Test Variations:`);
    const variations = [
      "analyze user data to optimize code performance",
      "analyze user data and document findings",
      "optimize code performance and document findings", 
      "document findings from analyzing user data",
      "analyze and optimize user data performance"
    ];
    
    for (const variation of variations) {
      const varResult = analyzer.analyze(variation);
      console.log(`   "${variation}": ${varResult.intentType}`);
    }
    
    console.log(`\n💡 Solution Strategy:`);
    console.log(`   1. Prioritize primary action verbs (analyze, optimize) over secondary ones (document)`);
    console.log(`   2. Use verb position - earlier verbs should have higher priority`);
    console.log(`   3. Recognize "and document" as a trailing explanatory sub-clause`);

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugAnalyzeOptimizeIntent().catch(error => {
  console.error("Analyze optimize intent debug failed:", error);
  process.exit(1);
});
