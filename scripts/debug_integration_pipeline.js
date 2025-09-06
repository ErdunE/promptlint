// scripts/debug_integration_pipeline.js
// Trace semantic data flow through the TemplateEngine pipeline

import { TemplateEngine, SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function testIntegrationPipeline() {
  console.log("\n🔬 Integration Pipeline Testing");
  console.log("Objective: Trace semantic data flow from analyzer to template selection");
  console.log("=" .repeat(80));

  try {
    // Initialize components
    const engine = new TemplateEngine();
    const classifier = new HybridClassifier();
    const semanticAnalyzer = new SemanticAnalyzer();
    await classifier.initialize();

    const testPrompt = "implement REST API";
    console.log(`\n📝 Testing with prompt: "${testPrompt}"`);

    // Step 1: Test SemanticAnalyzer directly
    console.log("\n1️⃣ SemanticAnalyzer Direct Test:");
    const semanticResult = semanticAnalyzer.analyze(testPrompt);
    console.log(`   Intent: ${semanticResult.intentType}`);
    console.log(`   Complexity: ${semanticResult.complexity}`);
    console.log(`   Completeness: ${semanticResult.completeness}`);
    console.log(`   Specificity: ${semanticResult.specificity}`);

    // Step 2: Test Domain Classification
    console.log("\n2️⃣ Domain Classification Test:");
    const domainResult = await classifier.classify(testPrompt);
    console.log(`   Domain: ${domainResult.domain}`);
    console.log(`   Confidence: ${domainResult.confidence}`);
    console.log(`   Sub-category: ${domainResult.subCategory || 'none'}`);

    // Step 3: Test Lint Analysis
    console.log("\n3️⃣ Lint Analysis Test:");
    const lintResult = analyzePrompt(testPrompt);
    console.log(`   Score: ${lintResult.score}`);
    console.log(`   Issues: ${lintResult.issues.length}`);

    // Step 4: Test TemplateEngine.generateCandidates
    console.log("\n4️⃣ TemplateEngine Integration Test:");
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(testPrompt, lintResult);
    const endTime = performance.now();
    
    console.log(`   Processing Time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`   Candidates Generated: ${candidates.length}`);
    
    if (candidates.length > 0) {
      const firstCandidate = candidates[0];
      console.log(`   First Candidate Type: ${firstCandidate.type}`);
      console.log(`   First Candidate Score: ${firstCandidate.score}`);
      console.log(`   First Candidate Content: "${firstCandidate.content.substring(0, 50)}..."`);
      
      // Check for semantic metadata
      if (firstCandidate.metadata) {
        console.log(`   Metadata Keys: ${Object.keys(firstCandidate.metadata)}`);
        
        if (firstCandidate.metadata.semanticAnalysis) {
          console.log(`   ✅ Semantic Analysis Found in Metadata:`);
          console.log(`      Intent: ${firstCandidate.metadata.semanticAnalysis.intentType}`);
          console.log(`      Complexity: ${firstCandidate.metadata.semanticAnalysis.complexity}`);
        } else {
          console.log(`   ❌ No Semantic Analysis in Metadata`);
        }
        
        if (firstCandidate.metadata.enhancedDomainResult) {
          console.log(`   ✅ Enhanced Domain Result Found:`);
          console.log(`      Domain: ${firstCandidate.metadata.enhancedDomainResult.domain}`);
          console.log(`      Confidence: ${firstCandidate.metadata.enhancedDomainResult.confidence}`);
        } else {
          console.log(`   ❌ No Enhanced Domain Result in Metadata`);
        }
      } else {
        console.log(`   ❌ No Metadata Found`);
      }
    } else {
      console.log(`   ❌ No Candidates Generated`);
    }

    // Step 5: Test PatternMatcher directly (if accessible)
    console.log("\n5️⃣ PatternMatcher Direct Test:");
    try {
      // Try to access PatternMatcher through TemplateEngine
      if (engine.patternMatcher) {
        console.log(`   ✅ PatternMatcher accessible`);
        
        // Test semantic analysis integration
        if (engine.patternMatcher.semanticAnalyzer) {
          console.log(`   ✅ SemanticAnalyzer integrated in PatternMatcher`);
          const patternSemanticResult = engine.patternMatcher.semanticAnalyzer.analyze(testPrompt);
          console.log(`   PatternMatcher Intent: ${patternSemanticResult.intentType}`);
        } else {
          console.log(`   ❌ SemanticAnalyzer not integrated in PatternMatcher`);
        }
      } else {
        console.log(`   ❌ PatternMatcher not accessible`);
      }
    } catch (error) {
      console.log(`   ❌ PatternMatcher test failed: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
testIntegrationPipeline().catch(error => {
  console.error("Integration test failed:", error);
  process.exit(1);
});
