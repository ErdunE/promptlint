// scripts/debug_analytical_template_selection.js
// Debug why analytical intent gets TaskIOTemplate instead of BulletTemplate

import { TemplateEngine, IntelligentTemplateSelector, SemanticAnalyzer } from "../packages/template-engine/dist/template-engine.js";
import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugAnalyticalTemplateSelection() {
  console.log("\n🔬 Analytical Template Selection Debug");
  console.log("Objective: Understand why TaskIOTemplate is preferred over BulletTemplate");
  console.log("=" .repeat(80));

  try {
    const engine = new TemplateEngine();
    const classifier = new HybridClassifier();
    const semanticAnalyzer = new SemanticAnalyzer();
    await classifier.initialize();
    
    const failingPrompt = "analyze user data to optimize code performance and document findings";
    
    console.log(`\n📝 Failing Case: "${failingPrompt}"`);
    console.log(`Expected: [bullet, sequential]`);
    console.log(`Current Issue: Gets [task_io, minimal]`);

    // Step 1: Get semantic analysis
    const semantics = semanticAnalyzer.analyze(failingPrompt);
    console.log(`\n1️⃣ Semantic Analysis:`);
    console.log(`   Intent: ${semantics.intentType}`);
    console.log(`   Complexity: ${semantics.complexity}`);
    console.log(`   Completeness: ${semantics.completeness}`);
    console.log(`   Specificity: ${semantics.specificity}`);
    console.log(`   Context: ${JSON.stringify(semantics.context)}`);

    // Step 2: Get domain classification
    const domainResult = await classifier.classify(failingPrompt);
    console.log(`\n2️⃣ Domain Classification:`);
    console.log(`   Domain: ${domainResult.domain}`);
    console.log(`   Confidence: ${domainResult.confidence}`);
    console.log(`   Sub-category: ${domainResult.subCategory || 'none'}`);

    // Step 3: Get lint analysis
    const lintResult = analyzePrompt(failingPrompt);
    console.log(`\n3️⃣ Lint Analysis:`);
    console.log(`   Score: ${lintResult.score}`);
    console.log(`   Issues: ${lintResult.issues.length}`);

    // Step 4: Test template generation
    const candidates = await engine.generateCandidates(failingPrompt, lintResult);
    console.log(`\n4️⃣ Current Template Selection:`);
    console.log(`   Templates Generated: ${candidates.length}`);
    candidates.forEach((candidate, index) => {
      console.log(`   ${index + 1}. ${candidate.type} (score: ${candidate.score?.toFixed(3) || 'N/A'})`);
    });

    // Step 5: Debug template suitability for analytical intent
    console.log(`\n5️⃣ Template Suitability Analysis:`);
    
    const { TaskIOTemplate, BulletTemplate, SequentialTemplate, MinimalTemplate } = await import("../packages/template-engine/dist/template-engine.js");
    
    const context = {
      prompt: failingPrompt,
      lintResult,
      metadata: {
        timestamp: Date.now(),
        engine: 'TemplateEngine',
        domainClassification: domainResult
      }
    };

    const templates = [
      { name: 'TaskIOTemplate', class: TaskIOTemplate },
      { name: 'BulletTemplate', class: BulletTemplate },
      { name: 'SequentialTemplate', class: SequentialTemplate },
      { name: 'MinimalTemplate', class: MinimalTemplate }
    ];

    for (const template of templates) {
      try {
        const instance = new template.class();
        const suitable = instance.isSuitable(context);
        const priority = instance.getPriority(context);
        
        console.log(`   ${template.name}:`);
        console.log(`      Suitable: ${suitable ? '✅' : '❌'}`);
        console.log(`      Priority: ${priority.toFixed(3)}`);
        
        // Debug specific suitability logic
        if (template.name === 'TaskIOTemplate') {
          console.log(`      Reason: Structured task patterns detected`);
        } else if (template.name === 'BulletTemplate') {
          console.log(`      Reason: ${suitable ? 'Planning/listing patterns detected' : 'No planning patterns or insufficient issues'}`);
        }
        
      } catch (error) {
        console.log(`   ${template.name}: Error - ${error.message}`);
      }
    }

    // Step 6: Test with similar analytical prompts
    console.log(`\n6️⃣ Comparative Analysis:`);
    const analyticalPrompts = [
      "analyze user data to optimize code performance and document findings", // failing case
      "analyze customer behavior patterns", // working case
      "analyze system performance metrics", // working case
      "analyze data trends and create report", // test case
      "examine user feedback and improve features" // test case
    ];

    for (const prompt of analyticalPrompts) {
      try {
        const testCandidates = await engine.generateCandidates(prompt, analyzePrompt(prompt));
        const templates = testCandidates.map(c => c.type);
        console.log(`   "${prompt}"`);
        console.log(`      Templates: [${templates.join(', ')}]`);
      } catch (error) {
        console.log(`   "${prompt}": ERROR - ${error.message}`);
      }
    }

    // Step 7: Check IntelligentTemplateSelector logic
    console.log(`\n7️⃣ Template Selection Logic Investigation:`);
    console.log(`   Analytical intent should prefer: BulletTemplate > SequentialTemplate > TaskIOTemplate`);
    console.log(`   Current selection suggests TaskIOTemplate has higher priority`);
    console.log(`   Need to investigate IntelligentTemplateSelector scoring logic`);

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugAnalyticalTemplateSelection().catch(error => {
  console.error("Analytical template selection debug failed:", error);
  process.exit(1);
});
