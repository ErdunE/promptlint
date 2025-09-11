// scripts/validate_phase3_2_direct.ts - Pure direct imports validation

import { AdaptiveTemplateGenerator } from "../packages/adaptive-engine/src/AdaptiveTemplateGenerator.js";
import { PreferenceLearningEngine } from "../packages/adaptive-engine/src/PreferenceLearningEngine.js";
import { EffectivenessTracker } from "../packages/adaptive-engine/src/EffectivenessTracker.js";
import { TemplateType, TemplateCandidate } from "../packages/shared-types/dist/index.js";

interface ValidationTest {
  name: string;
  description: string;
  testFunction: () => Promise<ValidationResult>;
  critical: boolean;
}

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
  metrics?: {
    processingTime?: number;
    memoryUsage?: number;
    accuracy?: number;
    [key: string]: any;
  };
}

// Mock types and interfaces
interface MockUserContext {
  userId: string;
  preferences: {
    templateAffinities: Record<TemplateType, number>;
    domainPreferences: Record<string, TemplateType[]>;
    minimumHistoryForAdaptation: number;
    complexityHandling: any;
    adaptationSpeed: number;
    structuralPreferences: any[];
    presentationStyle: any;
    detailLevel: any;
    organizationPattern: any;
  };
  history: any[];
  settings: {
    enableTemplateAdaptation: boolean;
    enablePreferenceLearning: boolean;
  };
  stats: {
    totalGenerations: number;
    averageScore: number;
    favoriteTemplate: string;
  };
}

interface MockSemanticAnalysis {
  intent: string;
  complexity: number;
  domain: string;
  keyTerms: string[];
  confidence: number;
}

// Test implementations
async function validateAdaptiveTemplateGeneration(): Promise<ValidationResult> {
  try {
    const generator = new AdaptiveTemplateGenerator();
    const mockUserContext: MockUserContext = {
      userId: "test-user-123",
      preferences: {
        templateAffinities: {
          [TemplateType.BULLET]: 0.93,
          [TemplateType.TASK_IO]: 0.15,
          [TemplateType.SEQUENTIAL]: 0.40,
          [TemplateType.MINIMAL]: 0.25
        },
        domainPreferences: {
          "software_development": [TemplateType.BULLET, TemplateType.TASK_IO],
          "data_analysis": [TemplateType.SEQUENTIAL]
        },
        minimumHistoryForAdaptation: 15,
        complexityHandling: "moderate",
        adaptationSpeed: 0.5,
        structuralPreferences: [],
        presentationStyle: "professional",
        detailLevel: "medium",
        organizationPattern: "structured"
      },
      history: Array.from({ length: 10 }, (_, i) => ({
        timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        originalPrompt: `Test prompt ${i}`,
        selectedTemplate: {
          type: TemplateType.BULLET,
          content: `Test content ${i}`,
          score: 85 + (i % 10)
        },
        alternativesShown: [],
        userModifications: [`Modified ${i}`],
        contextTags: [`tag${i}`],
        domain: "software_development",
        effectivenessScore: 0.8 + (i * 0.02)
      })),
      settings: {
        enableTemplateAdaptation: true,
        enablePreferenceLearning: true
      },
      stats: {
        totalGenerations: 0,
        averageScore: 0,
        favoriteTemplate: "bullet"
      }
    };

    const mockSemanticAnalysis: MockSemanticAnalysis = {
      intent: "task_breakdown",
      complexity: 0.7,
      domain: "software_development",
      keyTerms: ["analyze", "implement", "test"],
      confidence: 0.85
    };

    const baseCandidates: TemplateCandidate[] = [
      {
        id: "bullet-1",
        type: TemplateType.BULLET,
        content: "• Analyze requirements\n• Implement solution\n• Test functionality",
        score: 85,
        faithfulnessValidated: true,
        generationTime: 45
      },
      {
        id: "task-io-1", 
        type: TemplateType.TASK_IO,
        content: "**Task:** Analyze and implement\n**Input:** Requirements\n**Output:** Working solution",
        score: 75,
        faithfulnessValidated: true,
        generationTime: 52
      }
    ];

    const startTime = Date.now();
    const adaptiveTemplates = await generator.generatePersonalizedTemplate(
      "analyze user requirements and implement a solution",
      mockSemanticAnalysis as any,
      mockUserContext as any,
      baseCandidates
    );
    const processingTime = Date.now() - startTime;

    const includesPersonalizations = adaptiveTemplates.some(t => 
      t.personalizations && t.personalizations.length > 0
    );

    const userAlignmentAppropriate = adaptiveTemplates.some(t => 
      t.baseTemplate === TemplateType.BULLET && t.userAlignment > 0.8
    );

    const success = adaptiveTemplates.length > 0 && 
                   processingTime < 150 && 
                   includesPersonalizations && 
                   userAlignmentAppropriate;

    return {
      success,
      message: success ? 
        "✅ Adaptive template generation successful with personalization" : 
        "❌ Adaptive template generation failed validation criteria",
      details: {
        templateCount: adaptiveTemplates.length,
        processingTime,
        includesPersonalizations,
        userAlignmentAppropriate,
        topTemplate: adaptiveTemplates[0]
      },
      metrics: {
        processingTime,
        templateCount: adaptiveTemplates.length,
        accuracy: success ? 100 : 0
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `❌ Adaptive template generation failed: ${error.message}`,
      details: { error: error.stack }
    };
  }
}

async function validatePreferenceLearning(): Promise<ValidationResult> {
  try {
    const learningEngine = new PreferenceLearningEngine();
    
    const mockHistory = Array.from({ length: 20 }, (_, i) => ({
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
      originalPrompt: `Test prompt ${i}`,
      selectedTemplate: {
        type: i % 3 === 0 ? TemplateType.BULLET : TemplateType.TASK_IO,
        content: `Template content ${i}`,
        score: 85
      },
      alternativesShown: [],
      userModifications: [`Modification ${i}`],
      contextTags: [`tag${i}`],
      domain: "software_development",
      effectivenessScore: 0.8 + (i % 10) * 0.02
    }));

    const detectedPattern = learningEngine.analyzeUserBehavior(mockHistory as any);
    
    const hasTemplateAffinities = detectedPattern.templateAffinities && 
      Object.keys(detectedPattern.templateAffinities).length > 0;
    
    const hasDomainPreferences = detectedPattern.domainPreferences && 
      Object.keys(detectedPattern.domainPreferences).length > 0;
    
    const adaptationSpeedValid = typeof detectedPattern.adaptationSpeed === 'number' && 
      detectedPattern.adaptationSpeed >= 0.0;

    const success = hasTemplateAffinities && hasDomainPreferences && adaptationSpeedValid;

    return {
      success,
      message: success ? 
        "✅ Preference learning analysis successful" : 
        "❌ Preference learning analysis failed",
      details: {
        detectedPattern,
        hasTemplateAffinities,
        hasDomainPreferences,
        adaptationSpeedValid
      },
      metrics: {
        patternConfidence: detectedPattern.adaptationSpeed || 0,
        accuracy: success ? 100 : 0
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `❌ Preference learning failed: ${error.message}`,
      details: { error: error.stack }
    };
  }
}

async function validateEffectivenessTracking(): Promise<ValidationResult> {
  try {
    const tracker = new EffectivenessTracker();
    
    const mockUsageData = Array.from({ length: 15 }, (_, i) => ({
      templateType: i % 2 === 0 ? TemplateType.BULLET : TemplateType.SEQUENTIAL,
      timestamp: Date.now() - (i * 12 * 60 * 60 * 1000),
      userSatisfaction: 0.7 + (i % 5) * 0.1,
      adaptationSuccess: i % 3 === 0 ? 0.9 : 0.7,
      contextRelevance: 0.8 + (i % 4) * 0.05
    }));

    mockUsageData.forEach(data => {
      tracker.trackTemplateUsage(data.templateType, {
        timestamp: data.timestamp,
        domain: "software_development",
        context: "test_context",
        userSatisfaction: data.userSatisfaction,
        adaptationSuccess: data.adaptationSuccess,
        contextRelevance: data.contextRelevance
      } as any, { domain: "test", context: "validation" } as any);
    });

    const effectiveness = tracker.calculateEffectiveness(mockUsageData as any);
    
    const hasValidMetrics = effectiveness.userSatisfactionScore > 0 && 
      effectiveness.usageFrequency >= 0 && 
      effectiveness.adaptationSuccess > 0;

    return {
      success: hasValidMetrics,
      message: hasValidMetrics ? 
        "✅ Effectiveness tracking functional" : 
        "❌ Effectiveness tracking failed",
      details: { effectiveness },
      metrics: {
        satisfactionScore: effectiveness.userSatisfactionScore,
        accuracy: hasValidMetrics ? 100 : 0
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `❌ Effectiveness tracking failed: ${error.message}`,
      details: { error: error.stack }
    };
  }
}

async function validatePerformanceRequirements(): Promise<ValidationResult> {
  const testPrompts = [
    "Analyze user feedback and improve the product",
    "Create a comprehensive testing strategy",
    "Design a scalable architecture solution"
  ];

  const timingResults: Array<{prompt: string; time: number; withinBudget: boolean}> = [];

  try {
    for (const prompt of testPrompts) {
      const startTime = Date.now();
      
      // Simulate adaptive template generation
      const generator = new AdaptiveTemplateGenerator();
      const mockContext: MockUserContext = {
        userId: "perf-test-user",
        preferences: {
          templateAffinities: { [TemplateType.BULLET]: 0.8, [TemplateType.TASK_IO]: 0.6, [TemplateType.SEQUENTIAL]: 0.4, [TemplateType.MINIMAL]: 0.3 },
          domainPreferences: {},
          minimumHistoryForAdaptation: 5,
          complexityHandling: "simple",
          adaptationSpeed: 0.3,
          structuralPreferences: [],
          presentationStyle: "concise",
          detailLevel: "basic",
          organizationPattern: "linear"
        },
        history: [],
        settings: { enableTemplateAdaptation: true, enablePreferenceLearning: true },
        stats: {
          totalGenerations: 0,
          averageScore: 0,
          favoriteTemplate: "bullet"
        }
      };

      await generator.generatePersonalizedTemplate(prompt, {
        complexity: 0.6, domain: "general", keyTerms: [], confidence: 0.8
      } as any, mockContext as any, []);

      const processingTime = Date.now() - startTime;
      const withinBudget = processingTime < 150;
      
      timingResults.push({ prompt, time: processingTime, withinBudget });
    }

    const allWithinBudget = timingResults.every(result => result.withinBudget);
    const averageTime = timingResults.reduce((sum, result) => sum + result.time, 0) / timingResults.length;

    return {
      success: allWithinBudget,
      message: allWithinBudget ? 
        `✅ Performance requirements met (avg: ${averageTime.toFixed(1)}ms)` : 
        "❌ Performance requirements exceeded",
      details: { timingResults, averageTime },
      metrics: { processingTime: averageTime, accuracy: allWithinBudget ? 100 : 0 }
    };

  } catch (error) {
    return {
      success: false,
      message: `❌ Performance validation failed: ${error.message}`,
      details: { error: error.stack }
    };
  }
}

async function validateFaithfulnessPreservation(): Promise<ValidationResult> {
  try {
    const generator = new AdaptiveTemplateGenerator();
    const originalPrompt = "Create a Python script to analyze CSV data and generate reports";
    
    const mockContext: MockUserContext = {
      userId: "faithfulness-test",
      preferences: {
        templateAffinities: { [TemplateType.BULLET]: 0.9, [TemplateType.TASK_IO]: 0.5, [TemplateType.SEQUENTIAL]: 0.3, [TemplateType.MINIMAL]: 0.2 },
        domainPreferences: {},
        minimumHistoryForAdaptation: 3,
        complexityHandling: "advanced",
        adaptationSpeed: 0.7,
        structuralPreferences: [],
        presentationStyle: "detailed",
        detailLevel: "comprehensive",
        organizationPattern: "hierarchical"
      },
      history: [],
      settings: { enableTemplateAdaptation: true, enablePreferenceLearning: true },
      stats: {
        totalGenerations: 0,
        averageScore: 0,
        favoriteTemplate: "bullet"
      }
    };

    const adaptiveTemplates = await generator.generatePersonalizedTemplate(
      originalPrompt,
      { complexity: 0.7, domain: "programming", keyTerms: ["Python", "CSV", "reports"], confidence: 0.9       } as any,
      mockContext as any,
      []
    );

    // Check for faithfulness violations
    const faithfulnessViolations: string[] = [];
    
    adaptiveTemplates.forEach(template => {
      const content = (template as any).adaptedTemplate?.content || template.content || '';
      
      // Check for scope creep
      if (content.includes("machine learning") || content.includes("AI")) {
        faithfulnessViolations.push("Added AI/ML not in original");
      }
      
      // Check for technology changes
      if (content.includes("JavaScript") || content.includes("Java")) {
        faithfulnessViolations.push("Added programming language not in original");
      }
    });

    const faithfulnessPreserved = faithfulnessViolations.length === 0;

    return {
      success: faithfulnessPreserved,
      message: faithfulnessPreserved ? 
        "✅ Faithfulness preservation maintained" : 
        "❌ Faithfulness violations detected",
      details: { 
        violations: faithfulnessViolations,
        templateCount: adaptiveTemplates.length 
      },
      metrics: { 
        violationCount: faithfulnessViolations.length,
        accuracy: faithfulnessPreserved ? 100 : 0 
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `❌ Faithfulness validation failed: ${error.message}`,
      details: { error: error.stack }
    };
  }
}

// Main validation execution
async function runPhase32Validation(): Promise<void> {
  console.log("🚀 Phase 3.2 Adaptive Template Generation Validation");
  console.log("=" .repeat(60));

  const tests: ValidationTest[] = [
    {
      name: "Adaptive Template Generation",
      description: "Validates personalized template generation with user preferences",
      testFunction: validateAdaptiveTemplateGeneration,
      critical: true
    },
    {
      name: "Preference Learning",
      description: "Validates user behavior analysis and preference detection",
      testFunction: validatePreferenceLearning,
      critical: true
    },
    {
      name: "Effectiveness Tracking",
      description: "Validates template effectiveness measurement and optimization",
      testFunction: validateEffectivenessTracking,
      critical: false
    },
    {
      name: "Performance Requirements",
      description: "Validates processing time within 150ms budget",
      testFunction: validatePerformanceRequirements,
      critical: true
    },
    {
      name: "Faithfulness Preservation",
      description: "Validates that adaptations maintain original prompt intent",
      testFunction: validateFaithfulnessPreservation,
      critical: true
    }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let criticalFailures = 0;

  for (const test of tests) {
    totalTests++;
    console.log(`\n🔍 ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const result = await test.testFunction();
      
      if (result.success) {
        passedTests++;
        console.log(`   ${result.message}`);
        if (result.metrics) {
          console.log(`   📊 Metrics: ${JSON.stringify(result.metrics)}`);
        }
      } else {
        console.log(`   ${result.message}`);
        if (test.critical) {
          criticalFailures++;
        }
        if (result.details) {
          console.log(`   🔍 Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Test execution failed: ${error.message}`);
      if (test.critical) {
        criticalFailures++;
      }
    }
  }

  // Final assessment
  console.log("\n" + "=" .repeat(60));
  console.log("📊 PHASE 3.2 VALIDATION SUMMARY");
  console.log("=" .repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Critical Failures: ${criticalFailures}`);
  
  const successRate = (passedTests / totalTests) * 100;
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);

  if (criticalFailures === 0 && successRate >= 80) {
    console.log("\n🎉 PHASE 3.2 VALIDATION: SUCCESS");
    console.log("✅ Adaptive template generation system is functional");
    console.log("✅ All critical components validated");
    console.log("✅ Ready for Level 4 development");
  } else {
    console.log("\n⚠️ PHASE 3.2 VALIDATION: ISSUES DETECTED");
    console.log(`❌ ${criticalFailures} critical failures`);
    console.log(`📉 ${successRate.toFixed(1)}% success rate`);
    console.log("🔧 Requires fixes before Level 4 development");
  }

  process.exit(criticalFailures > 0 ? 1 : 0);
}

// Execute validation
runPhase32Validation().catch(error => {
  console.error("💥 Validation execution failed:", error);
  process.exit(1);
});
