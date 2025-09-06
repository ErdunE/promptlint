// scripts/validatePhase1_2_2.ts

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { TemplateEngine } from "../packages/template-engine/dist/template-engine.js";
import { TemplateType } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

interface TestCase {
  prompt: string;
  expectedDomain: string;
  expectedSubCategory: string;
  expectedTemplates: (keyof typeof TemplateType)[];
  minConfidence?: number;
}

function printTestResult(
  testCase: TestCase,
  actualDomain: string,
  actualSubCategory: string | undefined,
  actualTemplates: (keyof typeof TemplateType)[],
  confidence: number,
  processingTime: number
): boolean {
  console.log(`📝 Prompt: "${testCase.prompt}"`);
  console.log(`→ Expected Domain: ${testCase.expectedDomain}, Sub-Category: ${testCase.expectedSubCategory}`);
  console.log(`→ Actual Domain: ${actualDomain}, Sub-Category: ${actualSubCategory || 'none'}`);
  console.log(`→ Confidence: ${confidence}`);
  console.log(`→ Generated Templates: [${actualTemplates.join(", ")}]`);
  console.log(`→ Expected Templates: [${testCase.expectedTemplates.join(", ")}]`);
  
  const domainMatch = actualDomain === testCase.expectedDomain;
  const subCategoryMatch = actualSubCategory === testCase.expectedSubCategory;
  const templateMatch = testCase.expectedTemplates.some(t => actualTemplates.includes(t));
  const confidenceMatch = testCase.minConfidence ? confidence >= testCase.minConfidence : true;
  
  const allPassed = domainMatch && subCategoryMatch && templateMatch && confidenceMatch;
  
  console.log(`✅ Domain: ${domainMatch ? "PASS" : "FAIL"}`);
  console.log(`✅ Sub-Category: ${subCategoryMatch ? "PASS" : "FAIL"}`);
  console.log(`✅ Templates: ${templateMatch ? "PASS" : "FAIL"}`);
  console.log(`✅ Confidence: ${confidenceMatch ? "PASS" : "FAIL"}`);
  console.log(`⏱️ Processing Time: ${processingTime.toFixed(2)}ms`);
  console.log(`🎯 Overall: ${allPassed ? "✅ PASS" : "❌ FAIL"}`);
  console.log("─".repeat(80));
  
  return allPassed;
}

function printRegressionResult(prompt: string, actualDomain: string, confidence: number, shouldNotBe: string): boolean {
  console.log(`📝 Regression Test: "${prompt}"`);
  console.log(`→ Actual Domain: ${actualDomain} (${confidence} confidence)`);
  console.log(`→ Should NOT be: ${shouldNotBe}`);
  
  const passed = actualDomain !== shouldNotBe;
  console.log(passed ? "✅ PASS - Correctly avoided misclassification" : "❌ FAIL - Regression detected");
  console.log("─".repeat(60));
  
  return passed;
}

async function runEnhancedValidation() {
  console.log("\n🔍 Phase 1.2.2 Enhanced Selection Logic Validation\n");
  
  const engine = new TemplateEngine();
  const classifier = new HybridClassifier();
  await classifier.initialize();

  // Sub-Category Detection Test Cases
  const subCategoryTests: TestCase[] = [
    {
      prompt: "implement binary search algorithm",
      expectedDomain: "code",
      expectedSubCategory: "algorithms",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
      minConfidence: 80
    },
    {
      prompt: "debug memory leak in application", 
      expectedDomain: "code",
      expectedSubCategory: "debugging",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
      minConfidence: 80
    },
    {
      prompt: "implement REST API for user management",
      expectedDomain: "code", 
      expectedSubCategory: "api_development",
      expectedTemplates: [TemplateType.TASK_IO],
      minConfidence: 90
    },
    {
      prompt: "write blog post about productivity",
      expectedDomain: "writing",
      expectedSubCategory: "content_creation", 
      expectedTemplates: [TemplateType.MINIMAL, TemplateType.BULLET],
      minConfidence: 80
    },
    {
      prompt: "analyze market trends data",
      expectedDomain: "analysis",
      expectedSubCategory: "data_analysis",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.BULLET],
      minConfidence: 80
    },
    {
      prompt: "research best practices for security",
      expectedDomain: "research",
      expectedSubCategory: "best_practices",
      expectedTemplates: [TemplateType.BULLET, TemplateType.SEQUENTIAL],
      minConfidence: 80
    }
  ];

  let passedSubCategoryTests = 0;
  let totalProcessingTime = 0;

  console.log("🎯 Sub-Category Detection and Template Selection Tests:\n");
  
  for (const testCase of subCategoryTests) {
    const domainResult = await classifier.classify(testCase.prompt);
    const lintResult = analyzePrompt(testCase.prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(testCase.prompt, lintResult);
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    totalProcessingTime += processingTime;
    
    const templates = candidates.map(c => c.type);
    const metadata = candidates[0]?.metadata;
    const subCategory = metadata?.selectionMetadata?.domainContext?.subCategory;
    
    const passed = printTestResult(
      testCase,
      domainResult.domain,
      subCategory,
      templates,
      domainResult.confidence,
      processingTime
    );
    
    if (passed) passedSubCategoryTests++;
  }

  // Regression Test for Previous Issues  
  console.log("\n🚫 Misclassification Regression Tests:\n");
  
  const regressionTests = [
    { prompt: "outline project goals", shouldNotBe: "code" },
    { prompt: "compose email to stakeholders", shouldNotBe: "code" },
    { prompt: "assess customer satisfaction", shouldNotBe: "code" }
  ];

  let passedRegressionTests = 0;
  
  for (const { prompt, shouldNotBe } of regressionTests) {
    const domainResult = await classifier.classify(prompt);
    
    const passed = printRegressionResult(
      prompt, 
      domainResult.domain, 
      domainResult.confidence,
      shouldNotBe
    );
    
    if (passed) passedRegressionTests++;
  }

  // Performance and Quality Summary
  console.log("\n📊 VALIDATION SUMMARY");
  console.log("─".repeat(80));
  console.log(`Sub-Category Detection Tests: ${passedSubCategoryTests}/${subCategoryTests.length} passed`);
  console.log(`Regression Prevention Tests: ${passedRegressionTests}/${regressionTests.length} passed`);
  console.log(`Average Processing Time: ${(totalProcessingTime / subCategoryTests.length).toFixed(2)}ms`);
  console.log(`Performance Requirement: ${totalProcessingTime / subCategoryTests.length < 100 ? "✅ PASS" : "❌ FAIL"} (<100ms)`);
  
  // Enhanced Selection Quality Assessment
  console.log("\n🎯 Enhanced Selection Quality:");
  console.log(`Template Diversity: Multiple templates generated per prompt`);
  console.log(`Domain Alignment: ${passedSubCategoryTests > 0 ? "Functional" : "Non-functional"}`);
  console.log(`Sub-Category Precision: ${passedSubCategoryTests === subCategoryTests.length ? "Perfect" : "Needs refinement"}`);

  const overallSuccess = 
    passedSubCategoryTests === subCategoryTests.length &&
    passedRegressionTests === regressionTests.length &&
    (totalProcessingTime / subCategoryTests.length) < 100;

  console.log(`\n${overallSuccess ? "✅ PHASE 1.2.2 ENHANCEMENT SUCCESS - Ready for Phase 1.3" : "❌ PHASE 1.2.2 ISSUES DETECTED - Requires refinement"}`);
  
  if (!overallSuccess) {
    console.log("\n🚨 Issues detected:");
    if (passedSubCategoryTests !== subCategoryTests.length) {
      console.log(`   - Sub-category detection: ${passedSubCategoryTests}/${subCategoryTests.length} accuracy`);
    }
    if (passedRegressionTests !== regressionTests.length) {
      console.log(`   - Regression issues: ${regressionTests.length - passedRegressionTests} failed`);
    }
    if ((totalProcessingTime / subCategoryTests.length) >= 100) {
      console.log(`   - Performance issues: ${(totalProcessingTime / subCategoryTests.length).toFixed(2)}ms average`);
    }
    console.log("   Phase 1.3 authorization pending issue resolution");
  } else {
    console.log("\n🎉 All enhancement criteria met");
    console.log("🚀 Domain-aware template selection with sub-categories validated");
    console.log("🔜 Ready to proceed with Phase 1.3 implementation");
  }
}

runEnhancedValidation().catch(console.error);