// scripts/debug_metadata_detailed.js
// Detailed metadata inspection to find semantic analysis data

import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugMetadataDetailed() {
  console.log("\n🔬 Detailed Metadata Inspection");
  console.log("Objective: Find semantic analysis data in candidate metadata");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const testPrompt = "implement REST API";
    
    console.log(`\n📝 Testing with prompt: "${testPrompt}"`);

    const lintResult = analyzePrompt(testPrompt);
    const candidates = await engine.generateCandidates(testPrompt, lintResult);
    
    if (candidates.length > 0) {
      const candidate = candidates[0];
      console.log(`\n📊 Candidate Metadata Analysis:`);
      console.log(`Candidate Type: ${candidate.type}`);
      console.log(`Candidate Score: ${candidate.score}`);
      
      if (candidate.metadata) {
        console.log(`\n🔍 Metadata Structure:`);
        console.log(`Metadata Keys: ${Object.keys(candidate.metadata)}`);
        
        // Check each metadata section
        for (const [key, value] of Object.entries(candidate.metadata)) {
          console.log(`\n📋 ${key}:`);
          if (value && typeof value === 'object') {
            console.log(`   Type: ${value.constructor.name}`);
            console.log(`   Keys: ${Object.keys(value)}`);
            
            // Special handling for domainContext
            if (key === 'domainContext') {
              console.log(`   Domain: ${value.domain}`);
              console.log(`   Confidence: ${value.confidence}`);
              console.log(`   Sub-category: ${value.subCategory || 'none'}`);
              console.log(`   Indicators: ${JSON.stringify(value.indicators)}`);
              console.log(`   Processing Time: ${value.processingTime}`);
              
              if (value.semanticContext) {
                console.log(`   ✅ Semantic Context Found:`);
                console.log(`      Intent: ${value.semanticContext.intentType}`);
                console.log(`      Complexity: ${value.semanticContext.complexity}`);
                console.log(`      Completeness: ${value.semanticContext.completeness}`);
                console.log(`      Specificity: ${value.semanticContext.specificity}`);
                console.log(`      Context Markers: ${JSON.stringify(value.semanticContext.context)}`);
              } else {
                console.log(`   ❌ No Semantic Context`);
              }
            }
            
            // Special handling for selectionMetadata
            if (key === 'selectionMetadata') {
              console.log(`   Selection Strategy: ${value.selectionStrategy}`);
              console.log(`   User Feedback Capable: ${value.userFeedbackCapable}`);
              console.log(`   Alternative Templates: ${JSON.stringify(value.alternativeTemplates)}`);
              
              if (value.selectionReasoning) {
                console.log(`   Selection Reasoning: ${JSON.stringify(value.selectionReasoning)}`);
              }
            }
            
            // Special handling for enhancedSelection
            if (key === 'enhancedSelection') {
              console.log(`   Enhanced Selection Keys: ${Object.keys(value)}`);
              if (value.reasons) {
                console.log(`   Reasons: ${JSON.stringify(value.reasons)}`);
              }
              if (value.domainAlignment) {
                console.log(`   Domain Alignment: ${value.domainAlignment}`);
              }
              if (value.contextMatch) {
                console.log(`   Context Match: ${value.contextMatch}`);
              }
              if (value.compositeScore) {
                console.log(`   Composite Score: ${value.compositeScore}`);
              }
            }
          } else {
            console.log(`   Value: ${value}`);
          }
        }
      } else {
        console.log(`❌ No metadata found`);
      }
    } else {
      console.log(`❌ No candidates generated`);
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugMetadataDetailed().catch(error => {
  console.error("Metadata debug failed:", error);
  process.exit(1);
});
