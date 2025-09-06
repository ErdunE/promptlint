import { DomainClassifier } from './dist/domain-classifier.js';

// Comprehensive test cases with realistic confidence requirements
const testCases = [
  // CodeDomain cases - should achieve 80+ confidence
  { prompt: "implement binary search algorithm", expected: "code", minConfidence: 80 },
  { prompt: "debug authentication system", expected: "code", minConfidence: 80 },
  { prompt: "optimize database queries", expected: "code", minConfidence: 70 },
  { prompt: "create a function to sort arrays", expected: "code", minConfidence: 80 },
  { prompt: "build a REST API", expected: "code", minConfidence: 80 },
  { prompt: "write Python code for data processing", expected: "code", minConfidence: 80 },
  { prompt: "fix memory leak in application", expected: "code", minConfidence: 60 },
  { prompt: "refactor legacy code", expected: "code", minConfidence: 70 },
  { prompt: "implement user authentication", expected: "code", minConfidence: 80 },
  { prompt: "create database schema", expected: "code", minConfidence: 70 },
  
  // WritingDomain cases - should achieve 60+ confidence
  { prompt: "write blog post about productivity", expected: "writing", minConfidence: 80 },
  { prompt: "create article on climate change", expected: "writing", minConfidence: 60 },
  { prompt: "compose essay about technology", expected: "writing", minConfidence: 70 },
  { prompt: "write documentation for API", expected: "writing", minConfidence: 60 },
  { prompt: "create content for website", expected: "writing", minConfidence: 60 },
  { prompt: "write story about adventure", expected: "writing", minConfidence: 80 },
  { prompt: "draft report on market analysis", expected: "writing", minConfidence: 50 },
  { prompt: "create newsletter content", expected: "writing", minConfidence: 60 },
  { prompt: "write review of new product", expected: "writing", minConfidence: 60 },
  { prompt: "compose email to stakeholders", expected: "writing", minConfidence: 50 },
  
  // AnalysisDomain cases - should achieve 50+ confidence
  { prompt: "analyze market trends data", expected: "analysis", minConfidence: 80 },
  { prompt: "evaluate system performance metrics", expected: "analysis", minConfidence: 70 },
  { prompt: "compare different approaches", expected: "analysis", minConfidence: 50 },
  { prompt: "assess customer satisfaction scores", expected: "analysis", minConfidence: 50 },
  { prompt: "examine sales data patterns", expected: "analysis", minConfidence: 50 },
  { prompt: "calculate ROI for investment", expected: "analysis", minConfidence: 50 },
  { prompt: "measure website traffic statistics", expected: "analysis", minConfidence: 50 },
  { prompt: "benchmark application performance", expected: "analysis", minConfidence: 70 },
  { prompt: "analyze user behavior patterns", expected: "analysis", minConfidence: 50 },
  { prompt: "evaluate marketing campaign effectiveness", expected: "analysis", minConfidence: 50 },
  
  // ResearchDomain cases - should achieve 50+ confidence
  { prompt: "research best practices for security", expected: "research", minConfidence: 80 },
  { prompt: "investigate machine learning approaches", expected: "research", minConfidence: 70 },
  { prompt: "explore agile methodology", expected: "research", minConfidence: 60 },
  { prompt: "study project management techniques", expected: "research", minConfidence: 50 },
  { prompt: "investigate cloud computing solutions", expected: "research", minConfidence: 60 },
  { prompt: "research user experience design", expected: "research", minConfidence: 60 },
  { prompt: "explore data science methodologies", expected: "research", minConfidence: 60 },
  { prompt: "investigate DevOps practices", expected: "research", minConfidence: 60 },
  { prompt: "study cybersecurity frameworks", expected: "research", minConfidence: 60 },
  { prompt: "research mobile app development", expected: "research", minConfidence: 60 }
];

async function validatePerformance() {
  const classifier = new DomainClassifier();
  await classifier.initialize();
  
  let correct = 0;
  let total = testCases.length;
  const failures = [];
  
  console.log('=== Comprehensive Domain Classification Validation ===\n');
  
  for (const testCase of testCases) {
    const result = classifier.classifyDomain(testCase.prompt);
    const isCorrect = result.domain === testCase.expected && result.confidence >= testCase.minConfidence;
    
    if (isCorrect) {
      correct++;
    } else {
      failures.push({
        prompt: testCase.prompt,
        expected: testCase.expected,
        actual: result.domain,
        confidence: result.confidence,
        minRequired: testCase.minConfidence
      });
    }
  }
  
  console.log(`Overall Accuracy: ${correct}/${total} = ${(correct/total*100).toFixed(1)}%`);
  console.log(`\nFailures (${failures.length}):`);
  
  failures.forEach(failure => {
    console.log(`"${failure.prompt}"`);
    console.log(`  Expected: ${failure.expected}, Actual: ${failure.actual}`);
    console.log(`  Confidence: ${failure.confidence} (required: ${failure.minRequired})`);
    console.log('');
  });
  
  // Domain-specific accuracy
  const domains = ['code', 'writing', 'analysis', 'research'];
  domains.forEach(domain => {
    const domainCases = testCases.filter(tc => tc.expected === domain);
    const domainCorrect = domainCases.filter(tc => {
      const result = classifier.classifyDomain(tc.prompt);
      return result.domain === tc.expected && result.confidence >= tc.minConfidence;
    }).length;
    
    console.log(`${domain.toUpperCase()} Domain: ${domainCorrect}/${domainCases.length} = ${(domainCorrect/domainCases.length*100).toFixed(1)}%`);
  });
}

validatePerformance().catch(console.error);
