/**
 * Detailed complexity debugging script
 * Tests the exact problematic scenarios from Claude's assessment
 */

const { InstructionAnalyzer } = require('../packages/contextual-intelligence/src/intent-analysis/InstructionAnalyzer.ts');

async function debugComplexityDetailed() {
  console.log('=== DETAILED COMPLEXITY DEBUGGING ===\n');
  
  const analyzer = new InstructionAnalyzer();
  
  // The exact problematic scenarios from manual testing
  const criticalTestCases = [
    {
      name: "Enterprise OAuth with 100k+ Users",
      prompt: "Design an enterprise-grade OAuth 2.0 authentication system that can handle 100k+ concurrent users with PKCE, refresh tokens, and multi-tenant support for our scalable microservices architecture.",
      expectedComplexity: "COMPLEX",
      criticalIndicators: ["enterprise-grade", "100k+", "concurrent", "scalable", "microservices"]
    },
    {
      name: "Production 503 Emergency", 
      prompt: "URGENT: Our production API is returning 503 errors and users can't access the system. This is affecting thousands of users right now - help me debug this immediately.",
      expectedComplexity: "COMPLEX",
      criticalIndicators: ["URGENT", "production", "503", "emergency", "immediately"]
    },
    {
      name: "Simple JavaScript Function",
      prompt: "Create a simple JavaScript function that calculates the area of a rectangle given width and height.",
      expectedComplexity: "SIMPLE", 
      criticalIndicators: ["simple", "function"]
    },
    {
      name: "React Learning Request",
      prompt: "Help me understand how React hooks work, specifically useState and useEffect. Can you explain with simple examples?",
      expectedComplexity: "SIMPLE",
      criticalIndicators: ["help me understand", "simple", "explain"]
    }
  ];
  
  for (const testCase of criticalTestCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTING: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📝 Prompt: "${testCase.prompt}"`);
    console.log(`🎯 Expected Complexity: ${testCase.expectedComplexity}`);
    console.log(`🔍 Critical Indicators: [${testCase.criticalIndicators.join(', ')}]`);
    console.log(`\n--- ANALYSIS RESULTS ---`);
    
    try {
      const result = await analyzer.analyzeInstruction(testCase.prompt);
      
      console.log(`\n📊 FINAL RESULTS:`);
      console.log(`Intent: ${result.category}`);
      console.log(`Complexity: ${result.complexity} (expected: ${testCase.expectedComplexity})`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`Action: ${result.action}`);
      console.log(`Output Format: ${result.outputFormat}`);
      
      // Validation
      const complexityMatch = result.complexity === testCase.expectedComplexity;
      
      console.log(`\n✅ VALIDATION:`);
      console.log(`Complexity Assessment: ${complexityMatch ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!complexityMatch) {
        console.log(`\n🚨 COMPLEXITY MISMATCH DETECTED:`);
        console.log(`   Got: ${result.complexity}`);
        console.log(`   Expected: ${testCase.expectedComplexity}`);
        console.log(`   This indicates the algorithm is not properly detecting/weighting indicators`);
      }
      
    } catch (error) {
      console.error(`❌ ERROR: ${error.message}`);
      console.error(error.stack);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔬 DEBUGGING SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log('Key things to check in the console output above:');
  console.log('1. Are the critical indicators being detected correctly?');
  console.log('2. What are the actual complexity scores being calculated?');
  console.log('3. Which threshold range are the scores falling into?');
  console.log('4. Is the logic correctly prioritizing high-complexity scenarios?');
  console.log('\nIf enterprise/production scenarios are not COMPLEX, the algorithm needs fixing.');
}

// Run the detailed debugging
debugComplexityDetailed().catch(console.error);
