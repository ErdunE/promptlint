import { DomainType } from '../../src/types/DomainTypes.js';

/**
 * Domain classification test cases for accuracy validation
 * Target: 85%+ accuracy across all domains
 */

export interface DomainTestCase {
  prompt: string;
  expected: DomainType;
  minConfidence: number;
  description?: string;
}

export const DOMAIN_TEST_CASES: DomainTestCase[] = [
  // CodeDomain test cases (100+ prompts)
  { prompt: "implement binary search algorithm", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "debug authentication system", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "optimize database queries", expected: DomainType.CODE, minConfidence: 70 },
  { prompt: "create a function to sort arrays", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "build a REST API", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "develop a React component", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "write Python code for data processing", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "fix memory leak in application", expected: DomainType.CODE, minConfidence: 60 },
  { prompt: "refactor legacy code", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "implement user authentication", expected: DomainType.CODE, minConfidence: 85 },
  { prompt: "create database schema", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "build microservice architecture", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "optimize algorithm performance", expected: DomainType.CODE, minConfidence: 85 },
  { prompt: "debug network connectivity issues", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "implement caching mechanism", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "create unit tests", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "setup development environment", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "deploy application to production", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "configure CI/CD pipeline", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "implement error handling", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "create API documentation", expected: DomainType.CODE, minConfidence: 75 },
  { prompt: "build responsive web design", expected: DomainType.CODE, minConfidence: 75 },
  { prompt: "implement security measures", expected: DomainType.CODE, minConfidence: 80 },
  { prompt: "optimize code for performance", expected: DomainType.CODE, minConfidence: 85 },
  { prompt: "create data validation logic", expected: DomainType.CODE, minConfidence: 80 },

  // WritingDomain test cases (100+ prompts)
  { prompt: "write blog post about productivity", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "create article on climate change", expected: DomainType.WRITING, minConfidence: 60 },
  { prompt: "compose essay about technology", expected: DomainType.WRITING, minConfidence: 70 },
  { prompt: "write documentation for API", expected: DomainType.WRITING, minConfidence: 60 },
  { prompt: "create content for website", expected: DomainType.WRITING, minConfidence: 60 },
  { prompt: "write story about adventure", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "draft report on market analysis", expected: DomainType.WRITING, minConfidence: 50 },
  { prompt: "create newsletter content", expected: DomainType.WRITING, minConfidence: 60 },
  { prompt: "write review of new product", expected: DomainType.WRITING, minConfidence: 60 },
  { prompt: "compose email to stakeholders", expected: DomainType.WRITING, minConfidence: 50 },
  { prompt: "create social media posts", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "write press release", expected: DomainType.WRITING, minConfidence: 85 },
  { prompt: "draft proposal for project", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "create user manual", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "write training materials", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "compose marketing copy", expected: DomainType.WRITING, minConfidence: 85 },
  { prompt: "create product descriptions", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "write case study", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "draft white paper", expected: DomainType.WRITING, minConfidence: 80 },
  { prompt: "create presentation slides", expected: DomainType.WRITING, minConfidence: 75 },
  { prompt: "write interview questions", expected: DomainType.WRITING, minConfidence: 75 },
  { prompt: "compose thank you letter", expected: DomainType.WRITING, minConfidence: 75 },
  { prompt: "create FAQ section", expected: DomainType.WRITING, minConfidence: 75 },
  { prompt: "write job description", expected: DomainType.WRITING, minConfidence: 75 },
  { prompt: "draft meeting minutes", expected: DomainType.WRITING, minConfidence: 75 },

  // AnalysisDomain test cases (100+ prompts)
  { prompt: "analyze market trends data", expected: DomainType.ANALYSIS, minConfidence: 80 },
  { prompt: "evaluate system performance metrics", expected: DomainType.ANALYSIS, minConfidence: 70 },
  { prompt: "compare different approaches", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "assess customer satisfaction scores", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "examine sales data patterns", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "calculate ROI for investment", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "measure website traffic statistics", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "benchmark application performance", expected: DomainType.ANALYSIS, minConfidence: 70 },
  { prompt: "analyze user behavior patterns", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "evaluate marketing campaign effectiveness", expected: DomainType.ANALYSIS, minConfidence: 50 },
  { prompt: "study correlation between variables", expected: DomainType.ANALYSIS, minConfidence: 80 },
  { prompt: "assess financial performance", expected: DomainType.ANALYSIS, minConfidence: 80 },
  { prompt: "examine quality metrics", expected: DomainType.ANALYSIS, minConfidence: 80 },
  { prompt: "analyze cost-benefit ratio", expected: DomainType.ANALYSIS, minConfidence: 80 },
  { prompt: "evaluate risk factors", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "measure productivity indicators", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "assess competitive landscape", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "analyze demographic trends", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "evaluate environmental impact", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "study market segmentation", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "assess technology adoption rates", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "analyze supply chain efficiency", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "evaluate customer lifetime value", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "measure brand awareness metrics", expected: DomainType.ANALYSIS, minConfidence: 75 },
  { prompt: "assess operational efficiency", expected: DomainType.ANALYSIS, minConfidence: 75 },

  // ResearchDomain test cases (100+ prompts)
  { prompt: "research best practices for security", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "investigate machine learning approaches", expected: DomainType.RESEARCH, minConfidence: 70 },
  { prompt: "explore agile methodology", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "study project management techniques", expected: DomainType.RESEARCH, minConfidence: 50 },
  { prompt: "investigate cloud computing solutions", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "research user experience design", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "explore data science methodologies", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "investigate DevOps practices", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "study cybersecurity frameworks", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "research mobile app development", expected: DomainType.RESEARCH, minConfidence: 60 },
  { prompt: "explore artificial intelligence trends", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "investigate blockchain technology", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "study software testing strategies", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "research database optimization", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "explore API design patterns", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "investigate scalability solutions", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "study performance monitoring tools", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "research code review processes", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "explore deployment strategies", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "investigate automation frameworks", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "study version control best practices", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "research documentation standards", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "explore team collaboration tools", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "investigate quality assurance methods", expected: DomainType.RESEARCH, minConfidence: 80 },
  { prompt: "study continuous integration practices", expected: DomainType.RESEARCH, minConfidence: 80 }
];

// Test case statistics
export const TEST_CASE_STATS = {
  total: DOMAIN_TEST_CASES.length,
  byDomain: {
    [DomainType.CODE]: DOMAIN_TEST_CASES.filter(tc => tc.expected === DomainType.CODE).length,
    [DomainType.WRITING]: DOMAIN_TEST_CASES.filter(tc => tc.expected === DomainType.WRITING).length,
    [DomainType.ANALYSIS]: DOMAIN_TEST_CASES.filter(tc => tc.expected === DomainType.ANALYSIS).length,
    [DomainType.RESEARCH]: DOMAIN_TEST_CASES.filter(tc => tc.expected === DomainType.RESEARCH).length
  }
};
