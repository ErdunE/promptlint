// scripts/debug_project_goals_metadata.js
// Debug metadata extraction for "outline project goals"

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugProjectGoalsMetadata() {
  console.log("\n🔬 Project Goals Metadata Debug");
  console.log("Objective: Check why metadata extraction shows 'unknown' intent");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const testPrompt = "outline project goals";
    
    console.log(`\n📝 Testing: "${testPrompt}"`);

    const lintResult = analyzePrompt(testPrompt);
    const candidates = await engine.generateCandidates(testPrompt, lintResult);
    
    console.log(`\n📊 Pipeline Results:`);
    console.log(`Candidates Generated: ${candidates.length}`);
    
    if (candidates.length > 0) {
      const candidate = candidates[0];
      console.log(`First Candidate Type: ${candidate.type}`);
      console.log(`First Candidate Score: ${candidate.score}`);
      
      if (candidate.metadata) {
        console.log(`\n🔍 Metadata Structure:`);
        console.log(`Metadata Keys: ${Object.keys(candidate.metadata)}`);
        
        if (candidate.metadata.selectionMetadata) {
          console.log(`\n📋 Selection Metadata:`);
          console.log(`Selection Metadata Keys: ${Object.keys(candidate.metadata.selectionMetadata)}`);
          
          if (candidate.metadata.selectionMetadata.domainContext) {
            const domainContext = candidate.metadata.selectionMetadata.domainContext;
            console.log(`\n🎯 Domain Context:`);
            console.log(`Domain: ${domainContext.domain}`);
            console.log(`Confidence: ${domainContext.confidence}`);
            console.log(`Sub-category: ${domainContext.subCategory || 'none'}`);
            
            if (domainContext.semanticContext) {
              console.log(`\n🧠 Semantic Context:`);
              console.log(`Intent Type: ${domainContext.semanticContext.intentType}`);
              console.log(`Complexity: ${domainContext.semanticContext.complexity}`);
              console.log(`Completeness: ${domainContext.semanticContext.completeness}`);
              console.log(`Specificity: ${domainContext.semanticContext.specificity}`);
              console.log(`Context: ${JSON.stringify(domainContext.semanticContext.context)}`);
              
              console.log(`\n✅ Metadata Extraction Test:`);
              const extractedIntent = domainContext.semanticContext.intentType;
              console.log(`Extracted Intent: ${extractedIntent}`);
              console.log(`Expected Intent: planning`);
              console.log(`Match: ${extractedIntent === 'planning' ? "✅ CORRECT" : "❌ INCORRECT"}`);
            } else {
              console.log(`\n❌ No Semantic Context in Domain Context`);
            }
          } else {
            console.log(`\n❌ No Domain Context in Selection Metadata`);
          }
        } else {
          console.log(`\n❌ No Selection Metadata`);
        }
      } else {
        console.log(`\n❌ No Metadata`);
      }
    } else {
      console.log(`\n❌ No Candidates Generated`);
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugProjectGoalsMetadata().catch(error => {
  console.error("Project goals metadata debug failed:", error);
  process.exit(1);
});
