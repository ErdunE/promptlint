// scripts/validatePhase1_2_1.ts

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { TemplateType } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

function printResult(
  prompt: string, 
  templates: TemplateType[], 
  expected: TemplateType[], 
  domain: string, 
  confidence: number,
  processingTime: number
) {
  console.log(`📝 Prompt: "${prompt}"`);
  console.log(`→ Domain: ${domain} (${confidence} confidence)`);
  console.log(`→ Generated Templates: [${templates.join(", ")}]`);
  console.log(`→ Expected Templates: [${expected.join(", ")}]`);
  
  const matched = expected.some((t) => templates.includes(t));
  console.log(matched ? "✅ PASS - Matched expected domain templates" : "❌ FAIL - Did NOT match expected domain templates");
  console.log(`⏱️ Processing Time: ${processingTime.toFixed(2)}ms`);
  console.log("─".repeat(70));
  
  return matched;
}

async function runValidation() {
  console.log("\n🔍 Phase 1.2.1 Domain-Aware Template Selection Validation\n");
  
  const engine = new TemplateEngine();
  const classifier = new HybridClassifier();
  await classifier.initialize();

  const testCases = [
    {
      prompt: "implement binary search algorithm",
      domain: "code",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
    },
    {
      prompt: "write blog post about productivity",
      domain: "writing", 
      expectedTemplates: [TemplateType.MINIMAL, TemplateType.BULLET],
    },
    {
      prompt: "analyze market trends data",
      domain: "analysis",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.BULLET],
    },
    {
      prompt: "research best practices for security", 
      domain: "research",
      expectedTemplates: [TemplateType.BULLET, TemplateType.SEQUENTIAL],
    },
  ];

  let passedTests = 0;
  let totalProcessingTime = 0;

  // Primary Domain-Aware Selection Tests
  console.log("🎯 Domain-Aware Template Selection Tests:\n");
  
  for (const { prompt, domain, expectedTemplates } of testCases) {
    const domainResult = await classifier.classify(prompt);
    
    // Generate proper LintResult using rules-engine
    const lintResult = analyzePrompt(prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    totalProcessingTime += processingTime;
    
    const templates = candidates.map(c => c.type);
    
    const passed = printResult(
      prompt, 
      templates, 
      expectedTemplates, 
      domainResult.domain, 
      domainResult.confidence,
      processingTime
    );
    
    if (passed) passedTests++;
  }

  // Confidence Band Validation
  console.log("\n🎯 Confidence Band Behavior Tests:\n");
  
  const confidenceTests = [
    { prompt: "implement REST API", expectedConfidence: "high", threshold: 90 },
    { prompt: "outline project goals", expectedConfidence: "moderate", thresholds: [70, 89] },
    { prompt: "hi", expectedConfidence: "low", threshold: 70 },
  ];

  for (const { prompt, expectedConfidence, threshold, thresholds } of confidenceTests) {
    const domainResult = await classifier.classify(prompt);
    const lintResult = analyzePrompt(prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    let confidenceCheck = "";
    if (thresholds) {
      // Moderate range check
      confidenceCheck = (domainResult.confidence >= thresholds[0] && domainResult.confidence <= thresholds[1]) ? "✅ PASS" : "❌ FAIL";
    } else if (expectedConfidence === "high") {
      confidenceCheck = domainResult.confidence >= threshold ? "✅ PASS" : "❌ FAIL";
    } else {
      confidenceCheck = domainResult.confidence < threshold ? "✅ PASS" : "❌ FAIL";
    }
    
    console.log(`📝 "${prompt}"`);
    console.log(`→ Domain: ${domainResult.domain}, Confidence: ${domainResult.confidence}`);
    console.log(`→ Expected: ${expectedConfidence} confidence ${confidenceCheck}`);
    console.log(`→ Templates: [${candidates.map(c => c.type).join(", ")}]`);
    console.log(`⏱️ Processing: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("─".repeat(50));
  }

  // Error Handling and Fallback Tests
  console.log("\n⚠️ Error Handling & Fallback Tests:\n");
  
  try {
    // Test with invalid input
    const lintResult = analyzePrompt("");
    const candidates = await engine.generateCandidates("", lintResult);
    console.log("✅ PASS - Empty prompt handled gracefully");
    console.log(`→ Fallback templates: [${candidates.map(c => c.type).join(", ")}]`);
  } catch (error) {
    console.log("❌ FAIL - Empty prompt caused error:", error.message);
  }
  
  try {
    // Test with complex prompt
    const complexPrompt = "create a comprehensive web application with user authentication, real-time messaging, file upload capabilities, and administrative dashboard";
    const lintResult = analyzePrompt(complexPrompt);
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(complexPrompt, lintResult);
    const endTime = performance.now();
    
    console.log(`📝 Complex prompt test: "${complexPrompt.substring(0, 50)}..."`);
    console.log(`→ Templates: [${candidates.map(c => c.type).join(", ")}]`);
    console.log(`⏱️ Processing: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(endTime - startTime < 100 ? "✅ PASS - Under 100ms requirement" : "❌ FAIL - Exceeded 100ms requirement");
  } catch (error) {
    console.log("❌ FAIL - Complex prompt caused error:", error.message);
  }

  // Summary Report
  console.log("\n📊 VALIDATION SUMMARY");
  console.log("─".repeat(50));
  console.log(`Domain-Aware Selection Tests: ${passedTests}/4 passed`);
  console.log(`Average Processing Time: ${(totalProcessingTime / testCases.length).toFixed(2)}ms`);
  console.log(`Performance Requirement: ${totalProcessingTime / testCases.length < 100 ? "✅ PASS" : "❌ FAIL"} (<100ms)`);
  
  const overallSuccess = passedTests === testCases.length && (totalProcessingTime / testCases.length) < 100;
  console.log(`\n${overallSuccess ? "✅ PHASE 1.2.1 INTEGRATION SUCCESS" : "❌ PHASE 1.2.1 INTEGRATION ISSUES DETECTED"}`);
  
  if (!overallSuccess) {
    console.log("\n🚨 Issues detected - Phase 1.2.2 authorization pending resolution");
  } else {
    console.log("\n🚀 Ready for Phase 1.2.2 Selection Logic Enhancement");
  }
}

runValidation().catch(console.error);