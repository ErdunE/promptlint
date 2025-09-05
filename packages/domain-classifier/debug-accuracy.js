import { DomainClassifier } from './dist/domain-classifier.js';

// Sample test cases from each domain to debug
const testCases = [
  // CodeDomain cases
  { prompt: "implement binary search algorithm", expected: "code", minConfidence: 85 },
  { prompt: "debug authentication system", expected: "code", minConfidence: 85 },
  { prompt: "optimize database queries", expected: "code", minConfidence: 80 },
  { prompt: "create a function to sort arrays", expected: "code", minConfidence: 85 },
  { prompt: "build a REST API", expected: "code", minConfidence: 85 },
  { prompt: "write Python code for data processing", expected: "code", minConfidence: 85 },
  { prompt: "fix memory leak in application", expected: "code", minConfidence: 80 },
  { prompt: "refactor legacy code", expected: "code", minConfidence: 80 },
  { prompt: "implement user authentication", expected: "code", minConfidence: 85 },
  { prompt: "create database schema", expected: "code", minConfidence: 80 },
  
  // WritingDomain cases
  { prompt: "write blog post about productivity", expected: "writing", minConfidence: 90 },
  { prompt: "create article on climate change", expected: "writing", minConfidence: 85 },
  { prompt: "compose essay about technology", expected: "writing", minConfidence: 85 },
  { prompt: "write documentation for API", expected: "writing", minConfidence: 80 },
  { prompt: "create content for website", expected: "writing", minConfidence: 85 },
  { prompt: "write story about adventure", expected: "writing", minConfidence: 90 },
  { prompt: "draft report on market analysis", expected: "writing", minConfidence: 80 },
  { prompt: "create newsletter content", expected: "writing", minConfidence: 85 },
  { prompt: "write review of new product", expected: "writing", minConfidence: 85 },
  { prompt: "compose email to stakeholders", expected: "writing", minConfidence: 75 },
  
  // AnalysisDomain cases
  { prompt: "analyze market trends data", expected: "analysis", minConfidence: 85 },
  { prompt: "evaluate system performance metrics", expected: "analysis", minConfidence: 80 },
  { prompt: "compare different approaches", expected: "analysis", minConfidence: 80 },
  { prompt: "assess customer satisfaction scores", expected: "analysis", minConfidence: 80 },
  { prompt: "examine sales data patterns", expected: "analysis", minConfidence: 80 },
  { prompt: "calculate ROI for investment", expected: "analysis", minConfidence: 80 },
  { prompt: "measure website traffic statistics", expected: "analysis", minConfidence: 80 },
  { prompt: "benchmark application performance", expected: "analysis", minConfidence: 85 },
  { prompt: "analyze user behavior patterns", expected: "analysis", minConfidence: 80 },
  { prompt: "evaluate marketing campaign effectiveness", expected: "analysis", minConfidence: 80 },
  
  // ResearchDomain cases
  { prompt: "research best practices for security", expected: "research", minConfidence: 85 },
  { prompt: "investigate machine learning approaches", expected: "research", minConfidence: 80 },
  { prompt: "explore agile methodology", expected: "research", minConfidence: 80 },
  { prompt: "study project management techniques", expected: "research", minConfidence: 80 },
  { prompt: "investigate cloud computing solutions", expected: "research", minConfidence: 80 },
  { prompt: "research user experience design", expected: "research", minConfidence: 80 },
  { prompt: "explore data science methodologies", expected: "research", minConfidence: 80 },
  { prompt: "investigate DevOps practices", expected: "research", minConfidence: 80 },
  { prompt: "study cybersecurity frameworks", expected: "research", minConfidence: 80 },
  { prompt: "research mobile app development", expected: "research", minConfidence: 80 }
];

const classifier = new DomainClassifier();
let correct = 0;
let total = testCases.length;
const failures = [];

console.log('=== Domain Classification Debug Analysis ===\n');

testCases.forEach((testCase, index) => {
  const result = classifier.classifyDomain(testCase.prompt);
  const isCorrect = result.domain === testCase.expected && result.confidence >= testCase.minConfidence;
  
  if (isCorrect) {
    correct++;
  } else {
    failures.push({
      index,
      prompt: testCase.prompt,
      expected: testCase.expected,
      actual: result.domain,
      confidence: result.confidence,
      minRequired: testCase.minConfidence
    });
  }
});

console.log(`Overall Accuracy: ${correct}/${total} = ${(correct/total*100).toFixed(1)}%`);
console.log(`\nFailures (${failures.length}):`);

failures.forEach(failure => {
  console.log(`${failure.index + 1}. "${failure.prompt}"`);
  console.log(`   Expected: ${failure.expected}, Actual: ${failure.actual}`);
  console.log(`   Confidence: ${failure.confidence} (required: ${failure.minRequired})`);
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
