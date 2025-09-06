// scripts/debug_template_suitability.js
// Debug template suitability filtering

import { TemplateEngine, TaskIOTemplate, BulletTemplate, SequentialTemplate, MinimalTemplate } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

async function debugTemplateSuitability() {
  console.log("\n🔬 Template Suitability Debug");
  console.log("Objective: Check why templates fail suitability tests");
  console.log("=" .repeat(80));

  try {
    const testPrompt = "outline project goals";
    const lintResult = analyzePrompt(testPrompt);
    
    console.log(`\n📝 Testing: "${testPrompt}"`);
    console.log(`Lint Score: ${lintResult.score}`);
    console.log(`Lint Issues: ${lintResult.issues.length}`);
    console.log(`Issue types: ${lintResult.issues.map(i => i.type).join(', ') || 'none'}`);

    // Create template context
    const context = {
      prompt: testPrompt,
      lintResult,
      metadata: {
        timestamp: Date.now(),
        engine: 'TemplateEngine',
        domainClassification: { domain: 'code', confidence: 50 }
      }
    };

    // Test each template's suitability
    const templates = [
      { name: 'TaskIOTemplate', class: TaskIOTemplate },
      { name: 'BulletTemplate', class: BulletTemplate },
      { name: 'SequentialTemplate', class: SequentialTemplate },
      { name: 'MinimalTemplate', class: MinimalTemplate }
    ];

    console.log(`\n🧪 Template Suitability Tests:`);
    
    for (const template of templates) {
      try {
        const instance = new template.class();
        const suitable = instance.isSuitable(context);
        const priority = instance.getPriority(context);
        
        console.log(`   ${template.name}:`);
        console.log(`      Suitable: ${suitable ? '✅ YES' : '❌ NO'}`);
        console.log(`      Priority: ${priority.toFixed(3)}`);
        
        // For debugging, let's check specific conditions
        if (template.name === 'TaskIOTemplate') {
          console.log(`      Missing Task Verb: ${instance.hasLintIssue(context, 'MISSING_TASK_VERB')}`);
          console.log(`      Missing I/O Spec: ${instance.hasLintIssue(context, 'MISSING_IO_SPECIFICATION')}`);
          console.log(`      Missing Language: ${instance.hasLintIssue(context, 'MISSING_LANGUAGE')}`);
        }
        
        if (template.name === 'BulletTemplate') {
          console.log(`      Vague Wording: ${instance.hasLintIssue(context, 'VAGUE_WORDING')}`);
          console.log(`      Unclear Scope: ${instance.hasLintIssue(context, 'UNCLEAR_SCOPE')}`);
          console.log(`      3+ Issues: ${context.lintResult.issues.length >= 3}`);
        }
        
        if (template.name === 'SequentialTemplate') {
          const sequentialKeywords = ['step', 'steps', 'then', 'first', 'next', 'after', 'before', 'sequence', 'process', 'procedure', 'workflow', 'stage', 'phase'];
          const matchedKeywords = sequentialKeywords.filter(keyword => testPrompt.toLowerCase().includes(keyword));
          console.log(`      Sequential Keywords: ${matchedKeywords.length > 0 ? matchedKeywords.join(', ') : 'none'}`);
        }
        
        if (template.name === 'MinimalTemplate') {
          console.log(`      Score > 70: ${context.lintResult.score > 70}`);
          console.log(`      ≤2 Issues: ${context.lintResult.issues.length <= 2}`);
        }
        
      } catch (error) {
        console.log(`   ${template.name}: Error - ${error.message}`);
      }
      console.log('');
    }

    // Test with a working prompt for comparison
    console.log(`\n📊 Comparison with Working Prompt:`);
    const workingPrompt = "implement REST API";
    const workingLint = analyzePrompt(workingPrompt);
    const workingContext = {
      prompt: workingPrompt,
      lintResult: workingLint,
      metadata: {
        timestamp: Date.now(),
        engine: 'TemplateEngine',
        domainClassification: { domain: 'code', confidence: 73 }
      }
    };
    
    console.log(`"${workingPrompt}" (Score: ${workingLint.score}, Issues: ${workingLint.issues.length}):`);
    
    for (const template of templates) {
      try {
        const instance = new template.class();
        const suitable = instance.isSuitable(workingContext);
        console.log(`   ${template.name}: ${suitable ? '✅ Suitable' : '❌ Not suitable'}`);
      } catch (error) {
        console.log(`   ${template.name}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ CRITICAL ERROR: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  }
}

// Execute test
debugTemplateSuitability().catch(error => {
  console.error("Template suitability debug failed:", error);
  process.exit(1);
});
