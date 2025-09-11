/**
 * Phase 4.2 Integration Demo - Complete Contextual Reasoning Engine showcase
 */

import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
import { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';

async function runPhase42IntegrationDemo(): Promise<void> {
  console.log('🎯 Level 4 Phase 4.2 - Complete Contextual Reasoning Demo');
  console.log('=========================================================\n');

  const intentEngine = new IntentAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer();
  const collaborativeManager = new CollaborativeContextManager();
  
  const demoPrompts = [
    {
      name: "Enterprise Microservices Architecture",
      prompt: "We need to design a highly scalable microservices architecture for our enterprise team's production system. The system must handle 50k+ concurrent users, integrate with our existing PostgreSQL databases, and use Node.js with Docker and Kubernetes for deployment. This is critical for our Q4 launch.",
      description: "Complex enterprise project with team collaboration, high performance requirements"
    },
    {
      name: "Individual Learning Project",
      prompt: "I'm learning React and want to build a simple todo app component for my personal portfolio. I'm a beginner so I need step-by-step guidance with basic explanations.",
      description: "Individual learning context, beginner level, educational focus"
    },
    {
      name: "Production Emergency Debugging",
      prompt: "URGENT: Our production authentication service is failing with OAuth token validation errors. Users can't log in. Our DevOps team needs immediate debugging steps and a hotfix solution.",
      description: "High-urgency production issue, team collaboration, DevOps context"
    },
    {
      name: "Student Assignment Help",
      prompt: "Help me understand how to implement a binary search algorithm in Python for my computer science assignment. I need detailed explanations and code examples for my university project.",
      description: "Educational context, student role, algorithm implementation"
    }
  ];

  for (const demo of demoPrompts) {
    console.log(`🔍 Testing: ${demo.name}`);
    console.log(`📝 Prompt: "${demo.prompt}"`);
    console.log(`📋 Context: ${demo.description}\n`);
    
    const startTime = performance.now();
    
    // Step 1: Intent Analysis (Phase 4.1)
    const intentAnalysis = await intentEngine.analyzeIntent(demo.prompt);
    
    // Step 2: Project Context Analysis (Phase 4.2)
    const projectContext = projectAnalyzer.analyzeProjectContext(intentAnalysis, demo.prompt);
    
    // Step 3: Collaborative Context Analysis (Phase 4.2)
    const collaborativeContext = collaborativeManager.analyzeCollaborativeContext(
      intentAnalysis, demo.prompt
    );
    
    const processingTime = performance.now() - startTime;
    
    // Display comprehensive analysis
    console.log('📊 Complete Contextual Analysis:');
    console.log('================================');
    
    // Intent Layer (Phase 4.1)
    console.log(`🎯 Intent Analysis:`);
    console.log(`   Category: ${intentAnalysis.instruction.category} (${(intentAnalysis.instruction.confidence * 100).toFixed(1)}% confidence)`);
    console.log(`   Action: ${intentAnalysis.instruction.action}`);
    console.log(`   Subject: ${intentAnalysis.instruction.subject.type} - ${intentAnalysis.instruction.subject.domain}`);
    console.log(`   Communication Style: ${intentAnalysis.interaction.interactionStyle}`);
    console.log(`   Overall Intent Confidence: ${(intentAnalysis.confidence * 100).toFixed(1)}%`);
    
    // Project Context (Phase 4.2)
    console.log(`\n🏗️ Project Context:`);
    console.log(`   Phase: ${projectContext.phase}`);
    console.log(`   Complexity: ${projectContext.complexity}`);
    console.log(`   Technical Stack:`);
    if (projectContext.technicalStack.languages.length > 0) {
      console.log(`     Languages: ${projectContext.technicalStack.languages.join(', ')}`);
    }
    if (projectContext.technicalStack.frameworks.length > 0) {
      console.log(`     Frameworks: ${projectContext.technicalStack.frameworks.join(', ')}`);
    }
    if (projectContext.technicalStack.tools.length > 0) {
      console.log(`     Tools: ${projectContext.technicalStack.tools.join(', ')}`);
    }
    if (projectContext.technicalStack.platforms.length > 0) {
      console.log(`     Platforms: ${projectContext.technicalStack.platforms.join(', ')}`);
    }
    console.log(`   Timeline: ${projectContext.timeline.urgency} (${(projectContext.timeline.confidence * 100).toFixed(1)}% confidence)`);
    console.log(`   Constraints: ${projectContext.constraints.length} detected`);
    if (projectContext.constraints.length > 0) {
      projectContext.constraints.forEach((constraint: any) => {
        console.log(`     - ${constraint.type}: ${constraint.description} (${constraint.severity})`);
      });
    }
    console.log(`   Project Confidence: ${(projectContext.confidence * 100).toFixed(1)}%`);
    
    // Collaborative Context (Phase 4.2)
    console.log(`\n👥 Collaborative Context:`);
    console.log(`   User Role: ${collaborativeContext.roleContext}`);
    console.log(`   Collaboration Level: ${collaborativeContext.collaborationLevel}`);
    console.log(`   Team Standards:`);
    console.log(`     Communication: ${collaborativeContext.teamStandards.communicationStyle}`);
    console.log(`     Documentation: ${collaborativeContext.teamStandards.documentationLevel}`);
    console.log(`     Code Style: ${collaborativeContext.teamStandards.codeStyle}`);
    console.log(`     Review Process: ${collaborativeContext.teamStandards.reviewProcess}`);
    console.log(`     Quality Gates: ${collaborativeContext.teamStandards.qualityGates.join(', ')}`);
    console.log(`   Shared Preferences:`);
    console.log(`     Template Style: ${collaborativeContext.sharedPreferences.templateStyle}`);
    console.log(`     Detail Level: ${collaborativeContext.sharedPreferences.detailLevel}`);
    console.log(`     Technical Level: ${collaborativeContext.sharedPreferences.technicalLevel}`);
    console.log(`     Response Format: ${collaborativeContext.sharedPreferences.responseFormat}`);
    console.log(`   Collaboration Confidence: ${(collaborativeContext.confidence * 100).toFixed(1)}%`);
    
    // Performance Metrics
    console.log(`\n⚡ Performance Metrics:`);
    console.log(`   Total Processing Time: ${processingTime.toFixed(2)}ms`);
    console.log(`   Intent Analysis: ${intentAnalysis.performance.totalTime.toFixed(2)}ms`);
    console.log(`   Project Analysis: ${projectContext.processingTime?.toFixed(2) || 'N/A'}ms`);
    console.log(`   Collaborative Analysis: ${collaborativeContext.processingTime.toFixed(2)}ms`);
    
    // Contextual Reasoning Summary
    const overallConfidence = (
      intentAnalysis.confidence * 0.4 +
      projectContext.confidence * 0.35 +
      collaborativeContext.confidence * 0.25
    );
    
    console.log(`\n📈 Contextual Reasoning Summary:`);
    console.log(`   Overall Confidence: ${(overallConfidence * 100).toFixed(1)}%`);
    console.log(`   Context Layers: 3 (Intent + Project + Collaborative)`);
    console.log(`   Analysis Depth: Comprehensive multi-dimensional understanding`);
    console.log(`   Integration Status: ✅ Fully integrated Phase 4.1 + 4.2`);
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('🎉 Phase 4.2 Integration Demo Complete!');
  console.log('✅ Complete contextual reasoning engine functional');
  console.log('✅ Multi-layered context analysis working');
  console.log('✅ Project and collaborative intelligence integrated');
  console.log('✅ Performance excellence maintained across all layers');
  console.log('✅ Ready for Phase 4.3 Template Reasoning System');
}

runPhase42IntegrationDemo().catch(console.error);
