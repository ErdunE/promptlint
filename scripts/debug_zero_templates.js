// scripts/debug_zero_templates.js
// Debug why "outline project goals" generates 0 templates

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugZeroTemplates() {
  console.log("\n🔬 Zero Template Generation Debug");
  console.log("Objective: Fix 'outline project goals' generating 0 templates");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const classifier = new HybridClassifier();
    await classifier.initialize();
    
    const testPrompt = "outline project goals";
    console.log(`\n📝 Testing: "${testPrompt}"`);

    // Step 1: Domain Classification
    console.log(`\n1️⃣ Domain Classification:`);
    const domainResult = await classifier.classify(testPrompt);
    console.log(`   Domain: ${domainResult.domain}`);
    console.log(`   Confidence: ${domainResult.confidence}`);
    console.log(`   Sub-category: ${domainResult.subCategory || 'none'}`);
    console.log(`   Indicators: ${JSON.stringify(domainResult.indicators)}`);

    // Step 2: Lint Analysis
    console.log(`\n2️⃣ Lint Analysis:`);
    const lintResult = analyzePrompt(testPrompt);
    console.log(`   Score: ${lintResult.score}`);
    console.log(`   Issues: ${lintResult.issues.length}`);
    console.log(`   Issue types: ${lintResult.issues.map(i => i.type).join(', ')}`);

    // Step 3: Template Generation Pipeline
    console.log(`\n3️⃣ Template Generation Pipeline:`);
    const startTime = performance.now();
    
    try {
      const candidates = await engine.generateCandidates(testPrompt, lintResult);
      const endTime = performance.now();
      
      console.log(`   Processing Time: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`   Candidates Generated: ${candidates.length}`);
      
      if (candidates.length > 0) {
        console.log(`   ✅ Templates Generated Successfully:`);
        candidates.forEach((candidate, index) => {
          console.log(`      ${index + 1}. ${candidate.type} (score: ${candidate.score?.toFixed(3) || 'N/A'})`);
        });
      } else {
        console.log(`   ❌ No Templates Generated - Investigating Cause`);
        
        // Debug the template selection process
        console.log(`\n4️⃣ Template Selection Debug:`);
        
        // Check if PatternMatcher is accessible for debugging
        if (engine.patternMatcher) {
          console.log(`   PatternMatcher accessible: ✅`);
          
          try {
            // Try to call template selection directly
            const selectionResult = engine.patternMatcher.selectTemplatesWithMetadata(
              lintResult, 
              domainResult, 
              testPrompt
            );
            
            console.log(`   Template Selection Result:`);
            console.log(`      Templates: [${selectionResult.templates.join(', ')}]`);
            console.log(`      Metadata keys: ${Object.keys(selectionResult.metadata)}`);
            
            if (selectionResult.templates.length === 0) {
              console.log(`   ❌ Template selection returned 0 templates`);
              console.log(`   Selection Strategy: ${selectionResult.metadata.selectionStrategy}`);
              console.log(`   Domain Context: ${JSON.stringify(selectionResult.metadata.domainContext)}`);
            }
            
          } catch (selectionError) {
            console.log(`   ❌ Template selection failed: ${selectionError.message}`);
          }
        } else {
          console.log(`   PatternMatcher not accessible: ❌`);
        }
      }
      
    } catch (generationError) {
      console.log(`   ❌ Template generation failed: ${generationError.message}`);
      console.log(`   Stack: ${generationError.stack}`);
    }

    // Step 4: Alternative Test - Try with Different Prompts
    console.log(`\n5️⃣ Comparison Test:`);
    const workingPrompts = [
      "implement REST API",
      "research best practices",
      "write blog post"
    ];
    
    for (const workingPrompt of workingPrompts) {
      try {
        const workingCandidates = await engine.generateCandidates(workingPrompt, analyzePrompt(workingPrompt));
        console.log(`   "${workingPrompt}" → ${workingCandidates.length} templates: [${workingCandidates.map(c => c.type).join(', ')}]`);
      } catch (error) {
        console.log(`   "${workingPrompt}" → ERROR: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugZeroTemplates().catch(error => {
  console.error("Zero templates debug failed:", error);
  process.exit(1);
});
