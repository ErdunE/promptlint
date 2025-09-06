// scripts/test_template_improvements.js
// Test template generation improvements for problematic prompts

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function testTemplateImprovements() {
  console.log("\n🔬 Template Improvements Test");
  console.log("Objective: Test template generation for previously problematic prompts");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    
    const problematicPrompts = [
      {
        prompt: "outline project goals",
        previousResult: "0 templates",
        expectedImprovement: "Should generate bullet template"
      },
      {
        prompt: "document API endpoints with usage examples", 
        previousResult: "minimal only",
        expectedImprovement: "Should generate task_io template"
      },
      {
        prompt: "research machine learning approaches and implement prototype",
        previousResult: "minimal only", 
        expectedImprovement: "Should generate sequential template"
      },
      {
        prompt: "analyze user data to optimize code performance and document findings",
        previousResult: "minimal only",
        expectedImprovement: "Should generate multiple templates"
      },
      {
        prompt: "build responsive website with navigation",
        previousResult: "minimal only",
        expectedImprovement: "Should generate sequential template"
      }
    ];

    console.log(`\n🧪 Testing Template Generation:`);
    
    for (const test of problematicPrompts) {
      try {
        const lintResult = analyzePrompt(test.prompt);
        const candidates = await engine.generateCandidates(test.prompt, lintResult);
        
        const templates = candidates.map(c => c.type);
        const templateCount = candidates.length;
        
        console.log(`\n📝 "${test.prompt}"`);
        console.log(`   Previous: ${test.previousResult}`);
        console.log(`   Current: ${templateCount} templates: [${templates.join(', ')}]`);
        console.log(`   Expected: ${test.expectedImprovement}`);
        
        // Check if improvement achieved
        const improved = templateCount > 0 && (
          (test.previousResult.includes("0 templates") && templateCount > 0) ||
          (test.previousResult.includes("minimal only") && (templates.length > 1 || !templates.includes('minimal')))
        );
        
        console.log(`   Status: ${improved ? "✅ IMPROVED" : "⚠️ NEEDS MORE WORK"}`);
        
      } catch (error) {
        console.log(`\n📝 "${test.prompt}"`);
        console.log(`   ERROR: ${error.message}`);
      }
    }

    // Test some working prompts to ensure no regression
    console.log(`\n📊 Regression Test (should still work):`);
    const workingPrompts = [
      "implement REST API",
      "research best practices", 
      "write blog post"
    ];
    
    for (const prompt of workingPrompts) {
      try {
        const candidates = await engine.generateCandidates(prompt, analyzePrompt(prompt));
        const templates = candidates.map(c => c.type);
        console.log(`   "${prompt}": ${candidates.length} templates: [${templates.join(', ')}]`);
      } catch (error) {
        console.log(`   "${prompt}": ERROR - ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testTemplateImprovements().catch(error => {
  console.error("Template improvements test failed:", error);
  process.exit(1);
});
