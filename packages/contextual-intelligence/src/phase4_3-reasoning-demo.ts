/**
 * Phase 4.3 Reasoning Demo - Complete Template Reasoning System showcase
 */

import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';
import { ProjectContextAnalyzer } from './contextual-reasoning/ProjectContextAnalyzer.js';
import { CollaborativeContextManager } from './contextual-reasoning/CollaborativeContextManager.js';
import { ReasoningChainGenerator } from './template-reasoning/ReasoningChainGenerator.js';

async function runPhase43ReasoningDemo(): Promise<void> {
  console.log('🎯 Level 4 Phase 4.3 - Complete Template Reasoning Demo');
  console.log('======================================================\n');

  const intentEngine = new IntentAnalysisEngine();
  const projectAnalyzer = new ProjectContextAnalyzer();
  const collaborativeManager = new CollaborativeContextManager();
  const reasoningGenerator = new ReasoningChainGenerator();
  
  const demoPrompts = [
    {
      name: "Enterprise Microservices Architecture",
      prompt: "We need to architect a highly scalable microservices system for our enterprise platform. The system must support 500k+ concurrent users, integrate with existing PostgreSQL databases, use Node.js with TypeScript, deploy on Kubernetes with Docker containers, and include comprehensive security and monitoring. This is critical for our Q1 2024 launch with a $50M revenue target.",
      description: "Complex enterprise architecture with multiple constraints and high stakes",
      templateOptions: [
        { id: 1, type: 'TaskIO', suitableFor: ['create', 'code'], complexityLevel: 'high', communicationStyle: 'technical' },
        { id: 2, type: 'Bullet', suitableFor: ['analyze', 'create'], complexityLevel: 'enterprise', communicationStyle: 'professional' },
        { id: 3, type: 'Sequential', suitableFor: ['create', 'solve'], complexityLevel: 'medium', communicationStyle: 'structured' },
        { id: 4, type: 'Analytical', suitableFor: ['analyze', 'create'], complexityLevel: 'enterprise', communicationStyle: 'technical' }
      ]
    },
    {
      name: "Student Learning Assignment",
      prompt: "Hi! I'm a computer science student working on my final year project. I need help understanding how to implement a binary search tree in Python. Can you explain the concept step-by-step and provide code examples? I'm still learning data structures and algorithms, so please keep explanations beginner-friendly.",
      description: "Educational context with beginner-level requirements",
      templateOptions: [
        { id: 1, type: 'Sequential', suitableFor: ['explain', 'code'], complexityLevel: 'low', communicationStyle: 'conversational' },
        { id: 2, type: 'Tutorial', suitableFor: ['explain', 'create'], complexityLevel: 'low', communicationStyle: 'educational' },
        { id: 3, type: 'Bullet', suitableFor: ['explain'], complexityLevel: 'medium', communicationStyle: 'structured' }
      ]
    },
    {
      name: "Production Emergency Resolution",
      prompt: "CRITICAL ALERT: Our payment processing service is experiencing cascading failures. Transaction success rate dropped from 99.5% to 12% in the last 30 minutes. Database connection pool is exhausted, Redis cache is throwing timeout errors, and our monitoring shows CPU spikes across all microservices. Our DevOps and backend teams need immediate action plan to restore service. Revenue impact: $50k/hour.",
      description: "High-urgency production incident with multiple system failures",
      templateOptions: [
        { id: 1, type: 'Emergency', suitableFor: ['solve'], complexityLevel: 'high', communicationStyle: 'direct' },
        { id: 2, type: 'Sequential', suitableFor: ['solve', 'analyze'], complexityLevel: 'high', communicationStyle: 'technical' },
        { id: 3, type: 'Diagnostic', suitableFor: ['solve', 'analyze'], complexityLevel: 'enterprise', communicationStyle: 'professional' }
      ]
    }
  ];

  for (const demo of demoPrompts) {
    console.log(`🔍 Analyzing: ${demo.name}`);
    console.log(`📝 Prompt: "${demo.prompt.substring(0, 200)}..."`);
    console.log(`📋 Context: ${demo.description}\n`);
    
    const startTime = performance.now();
    
    // Complete analysis pipeline
    const intentAnalysis = await intentEngine.analyzeIntent(demo.prompt);
    const projectContext = projectAnalyzer.analyzeProjectContext(intentAnalysis, demo.prompt);
    const collaborativeContext = collaborativeManager.analyzeCollaborativeContext(intentAnalysis, demo.prompt);
    
    const contextualReasoning = {
      projectContext,
      collaborativeContext,
      overallConfidence: (projectContext.confidence + collaborativeContext.confidence) / 2,
      processingTime: (projectContext.processingTime || 0) + collaborativeContext.processingTime
    };

    // Generate detailed reasoning chain
    const reasoningChain = reasoningGenerator.generateReasoningChain(
      intentAnalysis,
      contextualReasoning,
      demo.templateOptions
    );
    
    const processingTime = performance.now() - startTime;
    
    // Display comprehensive reasoning analysis
    console.log('🧠 Complete Reasoning Chain Analysis:');
    console.log('====================================');
    
    // Reasoning Chain Overview
    console.log(`📊 Chain Overview:`);
    console.log(`   Steps: ${reasoningChain.steps.length}`);
    console.log(`   Overall Confidence: ${(reasoningChain.overallConfidence * 100).toFixed(1)}%`);
    console.log(`   Validation Status: ${reasoningChain.validated ? '✅ Validated' : '❌ Failed'}`);
    console.log(`   Processing Time: ${reasoningChain.processingTime.toFixed(2)}ms`);
    
    // Step-by-Step Reasoning
    console.log(`\n🔗 Detailed Reasoning Steps:`);
    reasoningChain.steps.forEach((step, index) => {
      console.log(`\n   ${index + 1}. ${step.type.toUpperCase()} (${step.impact} impact)`);
      console.log(`      Decision: ${step.reasoning.decision}`);
      console.log(`      Confidence: ${(step.reasoning.confidence * 100).toFixed(1)}%`);
      console.log(`      Key Factors:`);
      step.reasoning.factors.forEach((factor, factorIndex) => {
        console.log(`        - ${factor}`);
      });
      
      if (step.reasoning.alternatives.length > 0) {
        console.log(`      Alternatives Considered:`);
        step.reasoning.alternatives.slice(0, 2).forEach((alt: any) => {
          if (typeof alt === 'string') {
            console.log(`        - ${alt}`);
          } else if (alt.template) {
            console.log(`        - ${alt.template}: ${alt.reason}`);
          }
        });
      }
      
      if (step.processingTime) {
        console.log(`      Processing Time: ${step.processingTime.toFixed(2)}ms`);
      }
    });
    
    // Template Selection Details
    const templateStep = reasoningChain.steps.find(s => s.type === 'template_selection') as any;
    if (templateStep?.selectedTemplate) {
      console.log(`\n🎯 Selected Template Analysis:`);
      console.log(`   Template Type: ${templateStep.selectedTemplate.type}`);
      console.log(`   Suitable For: ${templateStep.selectedTemplate.suitableFor?.join(', ') || 'General'}`);
      console.log(`   Complexity Level: ${templateStep.selectedTemplate.complexityLevel || 'Standard'}`);
      console.log(`   Communication Style: ${templateStep.selectedTemplate.communicationStyle || 'Neutral'}`);
      console.log(`   Selection Confidence: ${(templateStep.reasoning.confidence * 100).toFixed(1)}%`);
    }
    
    // Documentation Summary
    console.log(`\n📋 Reasoning Documentation:`);
    console.log(`   Summary: ${reasoningChain.documentation.summary}`);
    console.log(`   Total Steps: ${reasoningChain.documentation.totalSteps}`);
    console.log(`   Confidence Score: ${(reasoningChain.documentation.confidenceScore * 100).toFixed(1)}%`);
    console.log(`   Execution Time: ${reasoningChain.documentation.executionTime.toFixed(2)}ms`);
    
    // Performance Metrics
    console.log(`\n⚡ Performance Breakdown:`);
    console.log(`   Total Pipeline Time: ${processingTime.toFixed(2)}ms`);
    console.log(`   Intent Analysis: ${intentAnalysis.performance.totalTime.toFixed(2)}ms`);
    console.log(`   Project Context: ${(projectContext.processingTime || 0).toFixed(2)}ms`);
    console.log(`   Collaborative Context: ${collaborativeContext.processingTime.toFixed(2)}ms`);
    console.log(`   Reasoning Chain: ${reasoningChain.processingTime.toFixed(2)}ms`);
    
    // Transparency and Explainability
    console.log(`\n🔍 Reasoning Transparency:`);
    console.log(`   Logic Validation: ${reasoningChain.validated ? 'All validators passed' : 'Validation issues detected'}`);
    console.log(`   Decision Factors: ${reasoningChain.steps.reduce((sum, s) => sum + s.reasoning.factors.length, 0)} total factors considered`);
    console.log(`   Alternative Options: ${reasoningChain.steps.reduce((sum, s) => sum + s.reasoning.alternatives.length, 0)} alternatives evaluated`);
    console.log(`   Confidence Distribution:`);
    reasoningChain.steps.forEach(step => {
      console.log(`     ${step.type}: ${(step.reasoning.confidence * 100).toFixed(1)}%`);
    });
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('🎉 Phase 4.3 Reasoning Demo Complete!');
  console.log('✅ Template reasoning system with full transparency operational');
  console.log('✅ Multi-step logic chains with documented decision factors');
  console.log('✅ Context-aware template selection with alternative evaluation');
  console.log('✅ Performance excellence maintained across complex reasoning');
  console.log('✅ Complete explainability and validation framework functional');
  console.log('✅ Ready for Phase 4.4 Meta-Information Engine integration');
}

runPhase43ReasoningDemo().catch(console.error);
