// scripts/debug_template_generation.js
// Debug the template generation process after template selection

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugTemplateGeneration() {
  console.log("\n🔬 Template Generation Process Debug");
  console.log("Objective: Debug template instantiation after selection");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const testPrompt = "outline project goals";
    const lintResult = analyzePrompt(testPrompt);
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Lint Score: ${lintResult.score}`);
    console.log(`Lint Issues: ${lintResult.issues.length}`);

    // Try to access the template generation process step by step
    console.log(`\n🔍 Debugging Template Generation Steps:`);
    
    // Check if we can access individual template classes
    try {
      const { TaskIOTemplate, BulletTemplate, SequentialTemplate, MinimalTemplate } = await import("../packages/template-engine/dist/template-engine.js");
      
      console.log(`\n1️⃣ Template Classes Available:`);
      console.log(`   TaskIOTemplate: ${TaskIOTemplate ? '✅' : '❌'}`);
      console.log(`   BulletTemplate: ${BulletTemplate ? '✅' : '❌'}`);
      console.log(`   SequentialTemplate: ${SequentialTemplate ? '✅' : '❌'}`);
      console.log(`   MinimalTemplate: ${MinimalTemplate ? '✅' : '❌'}`);
      
      // Test individual template generation
      console.log(`\n2️⃣ Individual Template Generation Test:`);
      
      const templateTypes = [
        { name: 'TaskIOTemplate', class: TaskIOTemplate },
        { name: 'BulletTemplate', class: BulletTemplate },
        { name: 'SequentialTemplate', class: SequentialTemplate },
        { name: 'MinimalTemplate', class: MinimalTemplate }
      ];
      
      for (const template of templateTypes) {
        try {
          if (template.class) {
            const instance = new template.class();
            console.log(`   ${template.name}: Instance created ✅`);
            
            // Try to generate content
            try {
              const result = await instance.generate(testPrompt, {
                lintResult,
                metadata: {
                  timestamp: Date.now(),
                  engine: 'TemplateEngine',
                  domainClassification: { domain: 'code', confidence: 50 }
                }
              });
              
              console.log(`      Generation: ✅ Success (${result.content.length} chars)`);
            } catch (genError) {
              console.log(`      Generation: ❌ Failed - ${genError.message}`);
            }
          } else {
            console.log(`   ${template.name}: Not available ❌`);
          }
        } catch (templateError) {
          console.log(`   ${template.name}: Error - ${templateError.message}`);
        }
      }
      
    } catch (importError) {
      console.log(`❌ Template import failed: ${importError.message}`);
    }
    
    // Check if there are any filtering conditions
    console.log(`\n3️⃣ Template Filtering Analysis:`);
    
    // Test with different lint scores
    const testScores = [0, 25, 50, 75, 100];
    for (const score of testScores) {
      const testLint = { ...lintResult, score };
      try {
        const candidates = await engine.generateCandidates(testPrompt, testLint);
        console.log(`   Lint Score ${score}: ${candidates.length} templates generated`);
      } catch (error) {
        console.log(`   Lint Score ${score}: Error - ${error.message}`);
      }
    }
    
    // Test with different prompts to see if it's prompt-specific
    console.log(`\n4️⃣ Prompt Variation Test:`);
    const promptVariations = [
      "outline project goals",
      "outline the project goals",
      "create project outline", 
      "plan project goals",
      "organize project objectives"
    ];
    
    for (const prompt of promptVariations) {
      try {
        const candidates = await engine.generateCandidates(prompt, lintResult);
        console.log(`   "${prompt}": ${candidates.length} templates`);
      } catch (error) {
        console.log(`   "${prompt}": Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugTemplateGeneration().catch(error => {
  console.error("Template generation debug failed:", error);
  process.exit(1);
});
