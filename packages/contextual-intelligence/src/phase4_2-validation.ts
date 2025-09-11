import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
import { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';

interface Phase42Test {
  name: string;
  prompt: string;
  expectedPhase: string;
  expectedComplexity: string;
  expectedRole: string;
  expectedCollaboration: string;
}

const phase42Tests: Phase42Test[] = [
  {
    name: "Enterprise Architecture Project",
    prompt: "We need to design a scalable microservices architecture for our team's production system with 10k+ concurrent users using Node.js and PostgreSQL",
    expectedPhase: "planning",
    expectedComplexity: "enterprise", 
    expectedRole: "architect",
    expectedCollaboration: "team"
  },
  {
    name: "Individual Development Task",
    prompt: "I want to implement OAuth authentication using Express framework for my personal project",
    expectedPhase: "development",
    expectedComplexity: "medium",
    expectedRole: "developer", 
    expectedCollaboration: "individual"
  },
  {
    name: "Team Debugging Session",
    prompt: "Our production API is failing with 503 errors and we need to troubleshoot the issue together as a team",
    expectedPhase: "testing",
    expectedComplexity: "high",
    expectedRole: "developer",
    expectedCollaboration: "team"
  },
  {
    name: "Student Learning Project",
    prompt: "Help me understand how to build a simple React component for my computer science assignment",
    expectedPhase: "development", 
    expectedComplexity: "low",
    expectedRole: "student",
    expectedCollaboration: "individual"
  }
];

async function runPhase42Validation(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.2 Contextual Reasoning Validation');
  console.log('===================================================');

  const intentEngine = new IntentAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer();
  const collaborativeManager = new CollaborativeContextManager();
  
  const results: any[] = [];
  let totalProcessingTime = 0;

  for (const test of phase42Tests) {
    console.log(`\nTesting: ${test.name}`);
    console.log(`Prompt: "${test.prompt}"`);

    const startTime = performance.now();
    
    // Step 1: Intent Analysis
    const intentAnalysis = await intentEngine.analyzeIntent(test.prompt);
    
    // Step 2: Project Context Analysis
    const projectContext = projectAnalyzer.analyzeProjectContext(intentAnalysis, test.prompt);
    
    // Step 3: Collaborative Context Analysis  
    const collaborativeContext = collaborativeManager.analyzeCollaborativeContext(
      intentAnalysis, test.prompt
    );
    
    const testTime = performance.now() - startTime;
    totalProcessingTime += testTime;

    // Evaluate results
    const phaseMatch = projectContext.phase === test.expectedPhase;
    const complexityMatch = projectContext.complexity === test.expectedComplexity;
    const roleMatch = collaborativeContext.roleContext === test.expectedRole;
    const collaborationMatch = collaborativeContext.collaborationLevel === test.expectedCollaboration;
    
    const passed = [phaseMatch, complexityMatch, roleMatch, collaborationMatch].filter(Boolean).length >= 2;

    console.log(`✅ Processed in ${testTime.toFixed(2)}ms`);
    console.log(`   Project Phase: ${projectContext.phase} (expected: ${test.expectedPhase}) ${phaseMatch ? '✅' : '❌'}`);
    console.log(`   Complexity: ${projectContext.complexity} (expected: ${test.expectedComplexity}) ${complexityMatch ? '✅' : '❌'}`);
    console.log(`   User Role: ${collaborativeContext.roleContext} (expected: ${test.expectedRole}) ${roleMatch ? '✅' : '❌'}`);
    console.log(`   Collaboration: ${collaborativeContext.collaborationLevel} (expected: ${test.expectedCollaboration}) ${collaborationMatch ? '✅' : '❌'}`);
    console.log(`   Technical Stack: ${projectContext.technicalStack.languages.concat(projectContext.technicalStack.frameworks).join(', ') || 'None detected'}`);
    console.log(`   Project Confidence: ${(projectContext.confidence * 100).toFixed(1)}%`);
    console.log(`   Collaboration Confidence: ${(collaborativeContext.confidence * 100).toFixed(1)}%`);

    results.push({
      test: test.name,
      passed,
      processingTime: testTime,
      projectContext,
      collaborativeContext,
      matches: { phaseMatch, complexityMatch, roleMatch, collaborationMatch }
    });
  }

  // Summary
  console.log(`\n📊 Phase 4.2 Validation Summary`);
  console.log('==============================');
  const passedCount = results.filter(r => r.passed).length;
  const averageTime = totalProcessingTime / results.length;
  
  console.log(`✅ Success Rate: ${passedCount}/${results.length} (${((passedCount/results.length)*100).toFixed(1)}%)`);
  console.log(`⚡ Average Processing Time: ${averageTime.toFixed(2)}ms`);
  console.log(`🎯 Performance Target: <150ms per contextual analysis`);
  console.log(`${averageTime < 150 ? '✅' : '❌'} Performance Requirement: ${averageTime < 150 ? 'PASSED' : 'FAILED'}`);
  
  // Component accuracy breakdown
  const phaseAccuracy = results.filter(r => r.matches.phaseMatch).length / results.length * 100;
  const complexityAccuracy = results.filter(r => r.matches.complexityMatch).length / results.length * 100;
  const roleAccuracy = results.filter(r => r.matches.roleMatch).length / results.length * 100;
  const collaborationAccuracy = results.filter(r => r.matches.collaborationMatch).length / results.length * 100;
  
  console.log(`\n📋 Component Accuracy:`);
  console.log(`   Project Phase Detection: ${phaseAccuracy.toFixed(1)}%`);
  console.log(`   Complexity Assessment: ${complexityAccuracy.toFixed(1)}%`);
  console.log(`   Role Identification: ${roleAccuracy.toFixed(1)}%`);
  console.log(`   Collaboration Level: ${collaborationAccuracy.toFixed(1)}%`);

  console.log(`\n🏁 Phase 4.2 Checkpoint Assessment`);
  console.log('===================================');
  console.log(`1. Project context analysis functional: ${phaseAccuracy >= 50 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: At least 50% accuracy in project phase detection`);
  console.log(`2. Collaborative context detection: ${collaborationAccuracy >= 50 ? '✅ PASSED' : '❌ FAILED'}`);  
  console.log(`   Requirement: Should detect team vs individual context accurately`);
  console.log(`3. Performance requirements: ${averageTime < 150 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Processing time <150ms for contextual reasoning`);
  console.log(`4. Integration with intent analysis: ${results.every(r => r.projectContext.confidence > 0.3) ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   Requirement: Should integrate effectively with Phase 4.1 intent analysis`);

  const overallPassed = phaseAccuracy >= 50 && collaborationAccuracy >= 50 && averageTime < 150;
  
  console.log(`\n🎯 Overall Phase 4.2 Status: ${overallPassed ? '✅ PASSED - Ready for Phase 4.3' : '❌ NEEDS REFINEMENT'}`);
  
  if (overallPassed) {
    console.log('🚀 Level 4 Phase 4.2 Implementation: VALIDATED');
    console.log('✅ Contextual reasoning engine functional');
    console.log('✅ Project and collaborative context detection working');  
    console.log('✅ Ready for Phase 4.3 Template Reasoning System');
    
    // Performance excellence bonus
    if (averageTime < 50) {
      console.log('⭐ PERFORMANCE EXCELLENCE: Sub-50ms contextual analysis achieved!');
    }
  } else {
    console.log('⚠️  Phase 4.2 implementation shows progress but needs refinement');
    console.log('📋 Focus areas for improvement:');
    if (phaseAccuracy < 50) console.log('   - Project phase detection accuracy');
    if (collaborationAccuracy < 50) console.log('   - Collaboration level detection');
    if (averageTime >= 150) console.log('   - Processing time optimization');
  }
}

runPhase42Validation().catch(error => {
  console.error('Phase 4.2 validation failed:', error);
  process.exit(1);
});
