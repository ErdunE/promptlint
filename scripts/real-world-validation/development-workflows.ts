/**
 * Real-World Development Workflow Scenarios
 * Comprehensive test scenarios for validating the "mind-reading" experience
 * across actual development workflows and user patterns
 */

export interface WorkflowScenario {
  id: string;
  name: string;
  description: string;
  sequence: WorkflowStep[];
  expectedPredictions: PredictionExpectation[];
  successCriteria: SuccessCriteria;
  platforms: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedDuration: number; // minutes
}

export interface WorkflowStep {
  step: number;
  action: string;
  prompt: string;
  expectedIntent: string;
  expectedComplexity: string;
  context: {
    platform: string;
    url: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
  };
  expectedNextSteps: string[];
}

export interface PredictionExpectation {
  afterStep: number;
  predictedNext: string[];
  confidence: number;
  ghostTextSamples: string[];
  workflowPhase: string;
}

export interface SuccessCriteria {
  predictionAccuracy: number; // >70%
  ghostTextAcceptance: number; // >60%
  workflowDetection: number; // >65%
  userSatisfaction: number; // >4.5/5
  iterationReduction: number; // >40%
}

/**
 * Comprehensive real-world development scenarios
 */
export const REAL_WORLD_SCENARIOS: WorkflowScenario[] = [
  {
    id: 'backend_api_development',
    name: 'Backend API Development',
    description: 'Complete API development workflow from planning to deployment',
    sequence: [
      {
        step: 1,
        action: 'Plan API endpoints',
        prompt: 'Design REST API for user management with authentication',
        expectedIntent: 'CREATE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/api/users.js',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['implement endpoints', 'add validation', 'setup middleware']
      },
      {
        step: 2,
        action: 'Implement API endpoints',
        prompt: 'Create POST /users endpoint with validation and error handling',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/api/users.js',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['add authentication', 'write tests', 'handle errors']
      },
      {
        step: 3,
        action: 'Add authentication middleware',
        prompt: 'Implement JWT authentication middleware for protected routes',
        expectedIntent: 'CODE',
        expectedComplexity: 'COMPLEX',
        context: {
          platform: 'VS Code',
          url: 'file:///project/middleware/auth.js',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['write unit tests', 'test endpoints', 'add logging']
      },
      {
        step: 4,
        action: 'Write comprehensive tests',
        prompt: 'Create unit tests for user API endpoints and authentication',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/tests/users.test.js',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['run tests', 'fix issues', 'add integration tests']
      },
      {
        step: 5,
        action: 'Debug failing tests',
        prompt: 'Fix authentication test failing with 401 unauthorized error',
        expectedIntent: 'SOLVE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/tests/users.test.js',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['verify fix', 'run full test suite', 'document API']
      },
      {
        step: 6,
        action: 'Document API endpoints',
        prompt: 'Create comprehensive API documentation with examples',
        expectedIntent: 'WRITE',
        expectedComplexity: 'SIMPLE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/docs/api.md',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['review code', 'deploy to staging', 'monitor performance']
      }
    ],
    expectedPredictions: [
      {
        afterStep: 1,
        predictedNext: ['implement endpoints', 'add validation', 'create middleware'],
        confidence: 0.85,
        ghostTextSamples: ['app.post(\'/users\',', 'const validateUser =', 'router.use(auth'],
        workflowPhase: 'implementation'
      },
      {
        afterStep: 2,
        predictedNext: ['add authentication', 'write tests', 'error handling'],
        confidence: 0.80,
        ghostTextSamples: ['const auth = require(', 'describe(\'User API\'', 'try { ... } catch'],
        workflowPhase: 'implementation'
      },
      {
        afterStep: 3,
        predictedNext: ['write tests', 'test endpoints', 'add logging'],
        confidence: 0.75,
        ghostTextSamples: ['it(\'should authenticate', 'test(\'POST /users\'', 'console.log(\'Auth'],
        workflowPhase: 'testing'
      }
    ],
    successCriteria: {
      predictionAccuracy: 0.75,
      ghostTextAcceptance: 0.65,
      workflowDetection: 0.70,
      userSatisfaction: 4.6,
      iterationReduction: 0.45
    },
    platforms: ['VS Code', 'GitHub'],
    complexity: 'moderate',
    estimatedDuration: 180
  },

  {
    id: 'frontend_component_development',
    name: 'Frontend Component Development',
    description: 'React component development with styling and state management',
    sequence: [
      {
        step: 1,
        action: 'Create component structure',
        prompt: 'Create React component for user profile with props and state',
        expectedIntent: 'CREATE',
        expectedComplexity: 'SIMPLE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/UserProfile.tsx',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['add styling', 'implement state', 'add props validation']
      },
      {
        step: 2,
        action: 'Add component styling',
        prompt: 'Style UserProfile component with CSS modules and responsive design',
        expectedIntent: 'CODE',
        expectedComplexity: 'SIMPLE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/UserProfile.module.css',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['add interactions', 'implement logic', 'test component']
      },
      {
        step: 3,
        action: 'Implement component logic',
        prompt: 'Add state management and event handlers for user profile editing',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/UserProfile.tsx',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['add validation', 'handle API calls', 'write tests']
      },
      {
        step: 4,
        action: 'Add form validation',
        prompt: 'Implement client-side validation for user profile form fields',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/UserProfile.tsx',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['test validation', 'add error messages', 'integrate API']
      },
      {
        step: 5,
        action: 'Write component tests',
        prompt: 'Create Jest tests for UserProfile component functionality',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'VS Code',
          url: 'file:///project/components/__tests__/UserProfile.test.tsx',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['run tests', 'fix issues', 'add accessibility']
      }
    ],
    expectedPredictions: [
      {
        afterStep: 1,
        predictedNext: ['add styling', 'implement state', 'add props'],
        confidence: 0.80,
        ghostTextSamples: ['.userProfile {', 'const [user, setUser]', 'interface Props {'],
        workflowPhase: 'implementation'
      },
      {
        afterStep: 2,
        predictedNext: ['add interactions', 'implement logic', 'add state'],
        confidence: 0.75,
        ghostTextSamples: ['const handleClick =', 'useState(', 'onClick={'],
        workflowPhase: 'implementation'
      }
    ],
    successCriteria: {
      predictionAccuracy: 0.70,
      ghostTextAcceptance: 0.60,
      workflowDetection: 0.65,
      userSatisfaction: 4.4,
      iterationReduction: 0.40
    },
    platforms: ['VS Code', 'CodePen'],
    complexity: 'simple',
    estimatedDuration: 120
  },

  {
    id: 'debugging_production_issue',
    name: 'Production Issue Debugging',
    description: 'Emergency debugging workflow for production system failure',
    sequence: [
      {
        step: 1,
        action: 'Identify the issue',
        prompt: 'Users reporting 503 errors on login endpoint, investigate immediately',
        expectedIntent: 'SOLVE',
        expectedComplexity: 'COMPLEX',
        context: {
          platform: 'GitHub',
          url: 'https://github.com/company/api/issues/234',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['check logs', 'analyze metrics', 'review recent changes']
      },
      {
        step: 2,
        action: 'Analyze system logs',
        prompt: 'Check application logs for authentication service errors and patterns',
        expectedIntent: 'ANALYZE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'Terminal',
          url: 'ssh://prod-server/logs/auth.log',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['identify root cause', 'check database', 'review code changes']
      },
      {
        step: 3,
        action: 'Identify root cause',
        prompt: 'Database connection pool exhausted, need to fix connection leaks',
        expectedIntent: 'SOLVE',
        expectedComplexity: 'COMPLEX',
        context: {
          platform: 'VS Code',
          url: 'file:///project/services/database.js',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['implement fix', 'add monitoring', 'test solution']
      },
      {
        step: 4,
        action: 'Implement emergency fix',
        prompt: 'Add proper connection cleanup and increase pool size for auth service',
        expectedIntent: 'CODE',
        expectedComplexity: 'COMPLEX',
        context: {
          platform: 'VS Code',
          url: 'file:///project/services/database.js',
          timeOfDay: 'evening'
        },
        expectedNextSteps: ['deploy fix', 'monitor metrics', 'verify resolution']
      },
      {
        step: 5,
        action: 'Deploy and verify fix',
        prompt: 'Deploy database connection fix and monitor system recovery',
        expectedIntent: 'DEPLOY',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'Terminal',
          url: 'ssh://prod-server',
          timeOfDay: 'evening'
        },
        expectedNextSteps: ['monitor metrics', 'document incident', 'prevent recurrence']
      }
    ],
    expectedPredictions: [
      {
        afterStep: 1,
        predictedNext: ['check logs', 'analyze metrics', 'review changes'],
        confidence: 0.90,
        ghostTextSamples: ['tail -f /var/log/', 'grep ERROR', 'git log --since'],
        workflowPhase: 'debugging'
      },
      {
        afterStep: 3,
        predictedNext: ['implement fix', 'add monitoring', 'test solution'],
        confidence: 0.85,
        ghostTextSamples: ['pool.on(\'error\'', 'connection.release()', 'maxConnections:'],
        workflowPhase: 'debugging'
      }
    ],
    successCriteria: {
      predictionAccuracy: 0.80,
      ghostTextAcceptance: 0.70,
      workflowDetection: 0.75,
      userSatisfaction: 4.7,
      iterationReduction: 0.50
    },
    platforms: ['GitHub', 'VS Code', 'Terminal'],
    complexity: 'complex',
    estimatedDuration: 90
  },

  {
    id: 'code_review_workflow',
    name: 'Code Review and Refactoring',
    description: 'Comprehensive code review with refactoring and optimization',
    sequence: [
      {
        step: 1,
        action: 'Review pull request',
        prompt: 'Review PR #156: Add user authentication with OAuth integration',
        expectedIntent: 'ANALYZE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'GitHub',
          url: 'https://github.com/company/app/pull/156',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['suggest improvements', 'test changes', 'check security']
      },
      {
        step: 2,
        action: 'Suggest code improvements',
        prompt: 'Refactor authentication logic to improve error handling and security',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'GitHub',
          url: 'https://github.com/company/app/pull/156/files',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['implement suggestions', 'add tests', 'update documentation']
      },
      {
        step: 3,
        action: 'Test the changes',
        prompt: 'Run integration tests for OAuth authentication flow',
        expectedIntent: 'TEST',
        expectedComplexity: 'SIMPLE',
        context: {
          platform: 'Terminal',
          url: 'file:///project',
          timeOfDay: 'morning'
        },
        expectedNextSteps: ['fix test failures', 'approve PR', 'merge changes']
      }
    ],
    expectedPredictions: [
      {
        afterStep: 1,
        predictedNext: ['suggest improvements', 'test changes', 'check security'],
        confidence: 0.75,
        ghostTextSamples: ['Consider adding', 'This could be improved', 'Security concern:'],
        workflowPhase: 'review'
      }
    ],
    successCriteria: {
      predictionAccuracy: 0.70,
      ghostTextAcceptance: 0.60,
      workflowDetection: 0.65,
      userSatisfaction: 4.3,
      iterationReduction: 0.35
    },
    platforms: ['GitHub'],
    complexity: 'moderate',
    estimatedDuration: 60
  },

  {
    id: 'database_optimization',
    name: 'Database Performance Optimization',
    description: 'Optimize slow database queries and improve performance',
    sequence: [
      {
        step: 1,
        action: 'Identify slow queries',
        prompt: 'Analyze database performance logs to find bottleneck queries',
        expectedIntent: 'ANALYZE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'Database Tool',
          url: 'postgresql://localhost/app_db',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['optimize queries', 'add indexes', 'analyze execution plans']
      },
      {
        step: 2,
        action: 'Optimize query performance',
        prompt: 'Rewrite user search query to use proper indexes and reduce execution time',
        expectedIntent: 'CODE',
        expectedComplexity: 'COMPLEX',
        context: {
          platform: 'VS Code',
          url: 'file:///project/queries/users.sql',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['test performance', 'add indexes', 'monitor results']
      },
      {
        step: 3,
        action: 'Add database indexes',
        prompt: 'Create composite indexes for user search and filtering operations',
        expectedIntent: 'CODE',
        expectedComplexity: 'MODERATE',
        context: {
          platform: 'Database Tool',
          url: 'postgresql://localhost/app_db',
          timeOfDay: 'afternoon'
        },
        expectedNextSteps: ['test queries', 'measure performance', 'document changes']
      }
    ],
    expectedPredictions: [
      {
        afterStep: 1,
        predictedNext: ['optimize queries', 'add indexes', 'analyze plans'],
        confidence: 0.80,
        ghostTextSamples: ['SELECT * FROM users WHERE', 'CREATE INDEX', 'EXPLAIN ANALYZE'],
        workflowPhase: 'optimization'
      }
    ],
    successCriteria: {
      predictionAccuracy: 0.75,
      ghostTextAcceptance: 0.65,
      workflowDetection: 0.70,
      userSatisfaction: 4.5,
      iterationReduction: 0.40
    },
    platforms: ['VS Code', 'Database Tool'],
    complexity: 'complex',
    estimatedDuration: 150
  }
];

/**
 * Cross-platform consistency test scenarios
 */
export const CROSS_PLATFORM_SCENARIOS = [
  {
    scenario: 'React Component Creation',
    platforms: [
      { name: 'VS Code', url: 'file:///project/components/Button.tsx' },
      { name: 'CodeSandbox', url: 'https://codesandbox.io/s/react-button' },
      { name: 'GitHub Codespaces', url: 'https://github.com/codespaces/project' }
    ],
    prompt: 'Create reusable Button component with TypeScript props',
    expectedConsistency: {
      intentDetection: 0.95, // Should be consistent across platforms
      complexityAssessment: 0.90,
      suggestionRelevance: 0.85
    }
  },
  {
    scenario: 'API Debugging',
    platforms: [
      { name: 'VS Code', url: 'file:///project/api/users.js' },
      { name: 'GitHub Issues', url: 'https://github.com/project/issues/123' },
      { name: 'Postman', url: 'https://app.getpostman.com/collections' }
    ],
    prompt: 'Debug 500 error in user registration endpoint',
    expectedConsistency: {
      intentDetection: 0.90,
      complexityAssessment: 0.85,
      suggestionRelevance: 0.80
    }
  }
];

/**
 * Mind-reading experience metrics
 */
export const MIND_READING_METRICS = {
  ghostTextAcceptance: {
    target: 0.60,
    measurement: 'percentage of ghost text suggestions accepted by user',
    factors: ['relevance', 'timing', 'context accuracy', 'user preference alignment']
  },
  predictionAccuracy: {
    target: 0.70,
    measurement: 'percentage of next-step predictions that match user actions',
    factors: ['workflow detection', 'pattern recognition', 'context understanding']
  },
  userSatisfaction: {
    target: 4.5,
    measurement: 'user rating on 1-5 scale for helpfulness',
    factors: ['suggestion quality', 'response time', 'non-intrusiveness', 'accuracy']
  },
  iterationReduction: {
    target: 0.40,
    measurement: 'reduction in user prompt iterations to achieve goal',
    factors: ['first-try success', 'suggestion relevance', 'context preservation']
  },
  workflowDetection: {
    target: 0.65,
    measurement: 'percentage of workflows correctly identified and predicted',
    factors: ['pattern recognition', 'sequence detection', 'context analysis']
  }
};

/**
 * Success validation criteria
 */
export const VALIDATION_CRITERIA = {
  overall: {
    minimumPassingScore: 0.70,
    targetExcellenceScore: 0.85,
    criticalMetrics: ['predictionAccuracy', 'userSatisfaction']
  },
  individual: {
    predictionAccuracy: { minimum: 0.65, target: 0.75 },
    ghostTextAcceptance: { minimum: 0.55, target: 0.65 },
    userSatisfaction: { minimum: 4.0, target: 4.5 },
    iterationReduction: { minimum: 0.30, target: 0.45 },
    workflowDetection: { minimum: 0.60, target: 0.70 }
  }
};
