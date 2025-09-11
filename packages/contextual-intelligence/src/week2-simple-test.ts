/**
 * Simplified Week 2 Test - Basic MetaInstructionAnalyzer functionality
 */

import { MetaInstructionAnalyzer } from './intent-analysis/MetaInstructionAnalyzer.js';

async function simpleWeek2Test(): Promise<void> {
  console.log('🚀 Level 4 Phase 4.1 Week 2 - Simple Test');
  console.log('=========================================');

  const analyzer = new MetaInstructionAnalyzer();
  
  const testPrompts = [
    "I need to build a React component by tomorrow for production deployment",
    "Create a simple website using free tools and minimal resources",
    "Design a scalable microservices architecture with enterprise security requirements"
  ];

  for (const prompt of testPrompts) {
    console.log(`\nTesting: "${prompt}"`);
    
    try {
      const result = analyzer.analyzeMetaInstruction(prompt);
      console.log(`✅ Analysis successful`);
      console.log(`   Constraints found: ${result.constraints.length}`);
      console.log(`   User expertise: ${result.userExpertiseLevel}`);
      console.log(`   Project complexity: ${result.projectContext.complexity}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Processing time: ${result.processingTime.toFixed(2)}ms`);
      
      if (result.constraints.length > 0) {
        console.log(`   Constraint types: ${result.constraints.map(c => c.type).join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Test failed:`, error);
    }
  }
  
  console.log('\n✅ Week 2 Simple Test Complete');
}

simpleWeek2Test().catch(console.error);
