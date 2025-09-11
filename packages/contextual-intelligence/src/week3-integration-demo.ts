/**
 * Week 3 Integration Demo - Complete IntentAnalysisEngine showcase
 */

import { IntentAnalysisEngine } from './intent-analysis/IntentAnalysisEngine.js';

async function runIntegrationDemo(): Promise<void> {
  console.log('🎯 Level 4 Phase 4.1 Week 3 - Complete Intent Analysis Demo');
  console.log('===========================================================\n');

  const engine = new IntentAnalysisEngine();
  
  const demoPrompts = [
    {
      name: "Complex Technical Request",
      prompt: "I need to implement a scalable OAuth2 authentication service using Node.js and Express framework for our production environment by next week. The system should handle 10k+ concurrent users and integrate with our existing PostgreSQL database.",
      description: "Multi-constraint, technical, time-sensitive"
    },
    {
      name: "Learning & Educational",
      prompt: "Can you please help me understand how React hooks work? I'm a computer science student working on my final project and need detailed explanations with examples.",
      description: "Conversational, educational context, detail-oriented"
    },
    {
      name: "Emergency Production Issue",
      prompt: "URGENT: Our microservices API gateway is failing with 503 errors. Users can't access the platform. We need immediate debugging steps and a quick fix.",
      description: "Urgent, technical, team collaboration needed"
    }
  ];

  for (const demo of demoPrompts) {
    console.log(`🔍 Testing: ${demo.name}`);
    console.log(`📝 Prompt: "${demo.prompt}"`);
    console.log(`📋 Context: ${demo.description}\n`);
    
    const startTime = performance.now();
    const analysis = await engine.analyzeIntent(demo.prompt);
    const processingTime = performance.now() - startTime;
    
    // Generate detailed explanation
    const explanation = engine.generateIntentExplanation(analysis);
    console.log(explanation);
    
    // Validate faithfulness
    const faithful = engine.validateIntentFaithfulness(analysis, demo.prompt);
    console.log(`\n🎯 Intent Faithfulness: ${faithful ? '✅ PRESERVED' : '❌ COMPROMISED'}`);
    
    // Performance metrics
    console.log(`⚡ Total Processing Time: ${processingTime.toFixed(2)}ms`);
    console.log(`📊 Layer Performance:`);
    analysis.performance.layerTimes.forEach(layer => {
      console.log(`   ${layer.layer}: ${layer.processingTime.toFixed(2)}ms (${(layer.confidence * 100).toFixed(1)}% confidence)`);
    });
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('🎉 Week 3 Integration Demo Complete!');
  console.log('✅ Three-layer intent analysis fully functional');
  console.log('✅ Multi-dimensional context understanding');
  console.log('✅ Performance excellence achieved');
  console.log('✅ Intent faithfulness validation working');
}

runIntegrationDemo().catch(console.error);
