/**
 * Test script to validate Level 4 improvements
 * Tests the scenarios from the manual testing assessment
 */

const { InstructionAnalyzer } = require('../packages/contextual-intelligence/src/intent-analysis/InstructionAnalyzer.ts');

async function testImprovedClassification() {
  console.log('=== Testing Level 4 Improvements ===\n');
  
  const analyzer = new InstructionAnalyzer();
  
  // Test scenarios from manual testing
  const testCases = [
    {
      name: "Production Emergency",
      prompt: "Our production OAuth service is failing and users can't log in. This is urgent - help me debug this immediately.",
      expectedIntent: "SOLVE",
      expectedComplexity: "COMPLEX" // Should be high due to production emergency
    },
    {
      name: "Simple JavaScript Function", 
      prompt: "Create a simple JavaScript function that calculates the area of a rectangle.",
      expectedIntent: "CREATE",
      expectedComplexity: "SIMPLE" // Should be simple, not medium
    },
    {
      name: "Learning Request",
      prompt: "Help me understand how React hooks work. Can you explain useState with examples?",
      expectedIntent: "EXPLAIN", // Should not be CREATE
      expectedComplexity: "SIMPLE"
    },
    {
      name: "Enterprise OAuth",
      prompt: "Design an enterprise-grade OAuth 2.0 authentication system with PKCE, refresh tokens, and multi-tenant support.",
      expectedIntent: "CREATE",
      expectedComplexity: "COMPLEX" // Should remain complex/enterprise
    },
    {
      name: "Documentation Task",
      prompt: "Write comprehensive API documentation for our enterprise microservices architecture.",
      expectedIntent: "WRITE", // Should not be CREATE
      expectedComplexity: "COMPLEX" // Enterprise-level documentation
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`Prompt: "${testCase.prompt}"`);
    
    try {
      const result = await analyzer.analyzeInstruction(testCase.prompt);
      
      console.log(`Intent: ${result.category} (expected: ${testCase.expectedIntent})`);
      console.log(`Complexity: ${result.complexity} (expected: ${testCase.expectedComplexity})`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Action: ${result.action}`);
      console.log(`Output Format: ${result.outputFormat}`);
      
      // Validation
      const intentMatch = result.category === testCase.expectedIntent;
      const complexityMatch = result.complexity === testCase.expectedComplexity;
      const confidenceInRange = result.confidence >= 0.7 && result.confidence <= 0.95;
      
      console.log(`✓ Intent Classification: ${intentMatch ? 'PASS' : 'FAIL'}`);
      console.log(`✓ Complexity Assessment: ${complexityMatch ? 'PASS' : 'FAIL'}`);  
      console.log(`✓ Confidence Range (70-95%): ${confidenceInRange ? 'PASS' : 'FAIL'}`);
      
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
    }
  }
  
  console.log('\n=== Test Summary ===');
  console.log('Check the results above to validate improvements:');
  console.log('1. Intent classification should be more diverse (not all CREATE)');
  console.log('2. Complexity should match scenario severity');
  console.log('3. Confidence should be in 70-95% range for clear prompts');
}

// Run the tests
testImprovedClassification().catch(console.error);
