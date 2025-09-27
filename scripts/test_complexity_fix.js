/**
 * Test script to validate complexity assessment fixes
 * Tests the exact scenarios from Claude's technical assessment
 */

const { InstructionAnalyzer } = require('../packages/contextual-intelligence/src/intent-analysis/InstructionAnalyzer.ts');

async function testComplexityFixes() {
  console.log('=== Testing Complexity Assessment Fixes ===\n');
  
  const analyzer = new InstructionAnalyzer();
  
  // Test cases from Claude's assessment with expected complexity corrections
  const testCases = [
    {
      name: "Enterprise OAuth Microservice",
      prompt: "Design an enterprise-grade OAuth 2.0 authentication system that can handle 100k+ concurrent users with PKCE, refresh tokens, and multi-tenant support for our scalable microservices architecture.",
      expectedIntent: "CREATE", // or "DESIGN"
      expectedComplexity: "COMPLEX", // Should be COMPLEX/ENTERPRISE, not simple
      keyIndicators: ["enterprise-grade", "100k+ concurrent users", "scalable microservices"]
    },
    {
      name: "Production 503 Emergency", 
      prompt: "URGENT: Our production API is returning 503 errors and users can't access the system. This is affecting thousands of users right now - help me debug this immediately.",
      expectedIntent: "SOLVE",
      expectedComplexity: "COMPLEX", // Should be HIGH/COMPLEX due to production emergency
      keyIndicators: ["URGENT", "production", "503 errors", "thousands of users"]
    },
    {
      name: "Team Documentation",
      prompt: "Write comprehensive documentation for our team's microservices architecture, including API specifications, deployment guides, and troubleshooting procedures.",
      expectedIntent: "WRITE",
      expectedComplexity: "MODERATE", // Should be MEDIUM to HIGH, not simple
      keyIndicators: ["comprehensive", "microservices architecture", "API specifications"]
    },
    {
      name: "Simple JavaScript Function",
      prompt: "Create a simple JavaScript function that calculates the area of a rectangle given width and height.",
      expectedIntent: "CREATE", // or "CODE"
      expectedComplexity: "SIMPLE", // Should remain simple
      keyIndicators: ["simple", "function", "calculates"]
    },
    {
      name: "React Learning Request",
      prompt: "Help me understand how React hooks work, specifically useState and useEffect. Can you explain with simple examples?",
      expectedIntent: "EXPLAIN",
      expectedComplexity: "SIMPLE", // Learning request, should be simple
      keyIndicators: ["help me understand", "explain", "simple examples"]
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`Prompt: "${testCase.prompt}"`);
    console.log(`Expected: ${testCase.expectedIntent} intent, ${testCase.expectedComplexity} complexity`);
    console.log(`Key indicators: [${testCase.keyIndicators.join(', ')}]`);
    
    try {
      const result = await analyzer.analyzeInstruction(testCase.prompt);
      
      console.log(`\n📊 RESULTS:`);
      console.log(`Intent: ${result.category} (expected: ${testCase.expectedIntent})`);
      console.log(`Complexity: ${result.complexity} (expected: ${testCase.expectedComplexity})`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Action: ${result.action}`);
      console.log(`Output Format: ${result.outputFormat}`);
      
      // Validation
      const intentMatch = result.category === testCase.expectedIntent || 
                         (testCase.expectedIntent === "CREATE" && result.category === "CODE") ||
                         (testCase.expectedIntent === "CREATE" && result.category === "DESIGN");
      const complexityMatch = result.complexity === testCase.expectedComplexity;
      const confidenceInRange = result.confidence >= 0.7 && result.confidence <= 0.95;
      
      console.log(`\n✅ VALIDATION:`);
      console.log(`✓ Intent Classification: ${intentMatch ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`✓ Complexity Assessment: ${complexityMatch ? '✅ PASS' : '❌ FAIL'}`);  
      console.log(`✓ Confidence Range (70-95%): ${confidenceInRange ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!complexityMatch) {
        console.log(`⚠️  COMPLEXITY MISMATCH: Got ${result.complexity}, expected ${testCase.expectedComplexity}`);
      }
      
    } catch (error) {
      console.error(`❌ ERROR: ${error.message}`);
      console.error(error.stack);
    }
  }
  
  console.log('\n=== COMPLEXITY FIX VALIDATION SUMMARY ===');
  console.log('Expected outcomes after fixes:');
  console.log('1. ✅ Enterprise OAuth (100k+ users): COMPLEX complexity');
  console.log('2. ✅ Production 503 emergency: COMPLEX complexity');  
  console.log('3. ✅ Team documentation: MODERATE complexity');
  console.log('4. ✅ Simple JavaScript function: SIMPLE complexity');
  console.log('5. ✅ React learning: SIMPLE complexity');
  console.log('\nIf any complexity assessments are still "SIMPLE" for scenarios 1-3, the algorithm needs further adjustment.');
}

// Run the complexity validation tests
testComplexityFixes().catch(console.error);
