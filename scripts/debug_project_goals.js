// scripts/debug_project_goals.js
// Debug why "outline project goals" shows unknown intent

import { SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";

async function debugProjectGoals() {
  console.log("\n🔬 Project Goals Intent Debug");
  console.log("Objective: Fix 'outline project goals' unknown intent issue");
  console.log("=" .repeat(80));

  try {
    const analyzer = new SemanticAnalyzer();
    const testPrompt = "outline project goals";
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Expected Intent: planning`);
    
    const result = analyzer.analyze(testPrompt);
    
    console.log(`\n📊 Analysis Results:`);
    console.log(`Actual Intent: ${result.intentType}`);
    console.log(`Complexity: ${result.complexity}`);
    console.log(`Completeness: ${result.completeness}`);
    console.log(`Specificity: ${result.specificity}`);
    console.log(`Context: ${JSON.stringify(result.context)}`);
    console.log(`Indicators: ${JSON.stringify(result.indicators)}`);
    
    const intentMatch = result.intentType === 'planning';
    console.log(`\n✅ Intent Assessment:`);
    console.log(`Intent Match: ${intentMatch ? "✅ CORRECT" : "❌ INCORRECT"}`);
    
    if (!intentMatch) {
      console.log(`\n🔍 Debugging Planning Pattern Detection:`);
      // Test if planning patterns are detected
      const prompt = testPrompt.toLowerCase();
      const planningKeywords = [
        'outline', 'plan', 'roadmap', 'strategy', 'timeline',
        'milestone', 'goal', 'objective', 'project', 'organize',
        'structure', 'framework', 'approach', 'schedule'
      ];
      
      console.log(`Prompt (lowercase): "${prompt}"`);
      console.log(`Planning Keywords: ${JSON.stringify(planningKeywords)}`);
      
      const matchedKeywords = planningKeywords.filter(keyword => prompt.includes(keyword));
      console.log(`Matched Keywords: ${JSON.stringify(matchedKeywords)}`);
      console.log(`Should Match Planning: ${matchedKeywords.length > 0 ? "YES" : "NO"}`);
      
      if (matchedKeywords.length > 0) {
        console.log(`❌ ISSUE: Planning keywords found but not detected by hasPlanning`);
      } else {
        console.log(`❌ ISSUE: No planning keywords found - need to add more patterns`);
      }
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugProjectGoals().catch(error => {
  console.error("Project goals debug failed:", error);
  process.exit(1);
});
