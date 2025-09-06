// scripts/validatePhase1_2_2.js - Enhanced Selection Logic Validation

import { HybridClassifier } from "../packages/domain-classifier/dist/index.js";
import { TemplateEngine, TemplateType } from "../packages/template-engine/dist/template-engine.js";
import { analyzePrompt } from "../packages/rules-engine/dist/index.js";

function printEnhancedResult(
  prompt, 
  templates, 
  expected, 
  domain, 
  confidence,
  subCategory,
  characteristics,
  processingTime,
  metadata
) {
  console.log(`📝 Prompt: "${prompt}"`);
  console.log(`→ Domain: ${domain} (${confidence} confidence)`);
  if (subCategory) {
    console.log(`→ Sub-Category: ${subCategory}`);
  }
  if (characteristics.length > 0) {
    console.log(`→ Characteristics: [${characteristics.join(", ")}]`);
  }
  console.log(`→ Generated Templates: [${templates.join(", ")}]`);
  console.log(`→ Expected Templates: [${expected.join(", ")}]`);
  
  const matched = expected.some((t) => templates.includes(t));
  console.log(matched ? "✅ PASS - Matched expected domain templates" : "❌ FAIL - Did NOT match expected domain templates");
  console.log(`⏱️ Processing Time: ${processingTime.toFixed(2)}ms`);
  
  // Show enhanced selection metadata
  if (metadata && metadata.enhancedSelection) {
    console.log(`🔍 Enhanced Selection: ${metadata.selectionStrategy}`);
    if (metadata.selectionReasoning && metadata.selectionReasoning.length > 0) {
      console.log(`📋 Selection Reasoning:`);
      metadata.selectionReasoning.slice(0, 2).forEach(reason => {
        console.log(`   • ${reason.description} (${reason.confidence}% confidence)`);
      });
    }
  }
  
  console.log("─".repeat(70));
  
  return matched;
}

async function runEnhancedValidation() {
  console.log("\n🔍 Phase 1.2.2 Enhanced Selection Logic Validation\n");
  
  const engine = new TemplateEngine();
  const classifier = new HybridClassifier();
  await classifier.initialize();

  // Enhanced test cases with sub-category expectations
  const testCases = [
    {
      prompt: "implement binary search algorithm",
      domain: "code",
      expectedSubCategory: "algorithms",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
      expectedCharacteristics: ["sequential", "functional"]
    },
    {
      prompt: "debug memory leak in application",
      domain: "code",
      expectedSubCategory: "debugging",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.SEQUENTIAL],
      expectedCharacteristics: ["sequential"]
    },
    {
      prompt: "implement REST API for user management",
      domain: "code",
      expectedSubCategory: "api_development",
      expectedTemplates: [TemplateType.TASK_IO],
      expectedCharacteristics: ["constructive"]
    },
    {
      prompt: "write blog post about productivity",
      domain: "writing", 
      expectedSubCategory: "content_creation",
      expectedTemplates: [TemplateType.MINIMAL, TemplateType.BULLET],
      expectedCharacteristics: ["constructive", "publishing"]
    },
    {
      prompt: "analyze market trends data",
      domain: "analysis",
      expectedSubCategory: "data_analysis",
      expectedTemplates: [TemplateType.TASK_IO, TemplateType.BULLET],
      expectedCharacteristics: ["analytical"]
    },
    {
      prompt: "research best practices for security",
      domain: "research",
      expectedSubCategory: "best_practices",
      expectedTemplates: [TemplateType.BULLET, TemplateType.SEQUENTIAL],
      expectedCharacteristics: ["analytical"]
    }
  ];

  let passedTests = 0;
  let totalProcessingTime = 0;
  let subCategoryMatches = 0;

  // Enhanced Selection Tests
  console.log("🎯 Enhanced Template Selection Tests:\n");
  
  for (const { prompt, domain, expectedSubCategory, expectedTemplates, expectedCharacteristics } of testCases) {
    const domainResult = await classifier.classify(prompt);
    const lintResult = analyzePrompt(prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    totalProcessingTime += processingTime;
    
    const templates = candidates.map(c => c.type);
    const metadata = candidates[0]?.metadata;
    
    // Extract enhanced domain information
    const enhancedDomain = metadata?.selectionMetadata?.domainContext;
    const subCategory = enhancedDomain?.subCategory;
    const characteristics = enhancedDomain?.characteristics || [];
    
    const passed = printEnhancedResult(
      prompt, 
      templates, 
      expectedTemplates, 
      domainResult.domain, 
      domainResult.confidence,
      subCategory,
      characteristics,
      processingTime,
      metadata
    );
    
    if (passed) passedTests++;
    
    // Check sub-category detection
    if (subCategory === expectedSubCategory) {
      subCategoryMatches++;
    }
  }

  // Confidence Range Enhancement Tests
  console.log("\n🎯 Confidence Range Enhancement Tests:\n");
  
  const confidenceTests = [
    { 
      prompt: "implement REST API", 
      expectedConfidence: "high", 
      threshold: 90,
      expectedSubCategory: "api_development"
    },
    { 
      prompt: "outline project goals", 
      expectedConfidence: "moderate", 
      thresholds: [70, 89],
      expectedDomain: "writing" // Should not be code domain
    },
    { 
      prompt: "debug performance issues", 
      expectedConfidence: "high", 
      threshold: 90,
      expectedSubCategory: "debugging"
    }
  ];

  for (const { prompt, expectedConfidence, threshold, thresholds, expectedDomain, expectedSubCategory } of confidenceTests) {
    const domainResult = await classifier.classify(prompt);
    const lintResult = analyzePrompt(prompt);
    
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    const metadata = candidates[0]?.metadata;
    const enhancedDomain = metadata?.selectionMetadata?.domainContext;
    const subCategory = enhancedDomain?.subCategory;
    
    let confidenceCheck = "";
    if (thresholds) {
      confidenceCheck = (domainResult.confidence >= thresholds[0] && domainResult.confidence <= thresholds[1]) ? "✅ PASS" : "❌ FAIL";
    } else if (expectedConfidence === "high") {
      confidenceCheck = domainResult.confidence >= threshold ? "✅ PASS" : "❌ FAIL";
    } else {
      confidenceCheck = domainResult.confidence < threshold ? "✅ PASS" : "❌ FAIL";
    }
    
    console.log(`📝 "${prompt}"`);
    console.log(`→ Domain: ${domainResult.domain}, Confidence: ${domainResult.confidence}`);
    if (subCategory) {
      console.log(`→ Sub-Category: ${subCategory}`);
    }
    console.log(`→ Expected: ${expectedConfidence} confidence ${confidenceCheck}`);
    if (expectedDomain && domainResult.domain !== expectedDomain) {
      console.log(`❌ Domain Misclassification: Expected ${expectedDomain}, got ${domainResult.domain}`);
    }
    if (expectedSubCategory && subCategory !== expectedSubCategory) {
      console.log(`❌ Sub-Category Mismatch: Expected ${expectedSubCategory}, got ${subCategory || 'none'}`);
    }
    console.log(`→ Templates: [${candidates.map(c => c.type).join(", ")}]`);
    console.log(`⏱️ Processing: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("─".repeat(50));
  }

  // Template Diversity Tests
  console.log("\n🎯 Template Diversity Optimization Tests:\n");
  
  const diversityTests = [
    {
      prompt: "create comprehensive web application with authentication and real-time features",
      expectedMinTemplates: 2,
      expectedMaxTemplates: 3
    },
    {
      prompt: "analyze user behavior patterns and optimize conversion rates",
      expectedMinTemplates: 2,
      expectedMaxTemplates: 3
    }
  ];

  for (const { prompt, expectedMinTemplates, expectedMaxTemplates } of diversityTests) {
    const lintResult = analyzePrompt(prompt);
    const startTime = performance.now();
    const candidates = await engine.generateCandidates(prompt, lintResult);
    const endTime = performance.now();
    
    const templateCount = candidates.length;
    const diversityCheck = (templateCount >= expectedMinTemplates && templateCount <= expectedMaxTemplates) ? "✅ PASS" : "❌ FAIL";
    
    console.log(`📝 "${prompt.substring(0, 50)}..."`);
    console.log(`→ Template Count: ${templateCount} (expected: ${expectedMinTemplates}-${expectedMaxTemplates}) ${diversityCheck}`);
    console.log(`→ Templates: [${candidates.map(c => c.type).join(", ")}]`);
    console.log(`⏱️ Processing: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("─".repeat(50));
  }

  // Summary Report
  console.log("\n📊 ENHANCED VALIDATION SUMMARY");
  console.log("─".repeat(50));
  console.log(`Enhanced Selection Tests: ${passedTests}/${testCases.length} passed`);
  console.log(`Sub-Category Detection: ${subCategoryMatches}/${testCases.length} matched`);
  console.log(`Average Processing Time: ${(totalProcessingTime / testCases.length).toFixed(2)}ms`);
  console.log(`Performance Requirement: ${totalProcessingTime / testCases.length < 100 ? "✅ PASS" : "❌ FAIL"} (<100ms)`);
  
  const overallSuccess = passedTests === testCases.length && 
                        subCategoryMatches >= testCases.length * 0.8 && 
                        (totalProcessingTime / testCases.length) < 100;
  
  console.log(`\n${overallSuccess ? "✅ PHASE 1.2.2 ENHANCEMENT SUCCESS" : "❌ PHASE 1.2.2 ENHANCEMENT ISSUES DETECTED"}`);
  
  if (!overallSuccess) {
    console.log("\n🚨 Issues detected - Further refinement needed");
  } else {
    console.log("\n🚀 Enhanced selection logic ready for production");
  }
}

runEnhancedValidation().catch(console.error);
