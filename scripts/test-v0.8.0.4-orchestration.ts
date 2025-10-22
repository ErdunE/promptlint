/**
 * Comprehensive validation script for Level 5 v0.8.0.4 Multi-Agent Orchestration
 * Tests all quality gates and performance targets
 */

import { MultiAgentOrchestrator } from '../packages/level5-orchestration/src/MultiAgentOrchestrator.js';
import { MemoryAgent } from '../packages/level5-orchestration/src/agents/MemoryAgent.js';
import { WorkflowAgent } from '../packages/level5-orchestration/src/agents/WorkflowAgent.js';
import { PatternRecognitionAgent } from '../packages/level5-orchestration/src/agents/PatternRecognitionAgent.js';
import { PredictionAgent } from '../packages/level5-orchestration/src/agents/PredictionAgent.js';
import { ConsensusEngine } from '../packages/level5-orchestration/src/ConsensusEngine.js';
import { PersistentMemoryManager } from '../packages/level5-memory/src/PersistentMemoryManager.js';
import { BehavioralPatternRecognizer } from '../packages/level5-predictive/src/BehavioralPatternRecognizer.js';
import { PredictiveIntentEngine } from '../packages/level5-predictive/src/PredictiveIntentEngine.js';
import { WorkflowStateMachine } from '../packages/level5-predictive/src/WorkflowStateMachine.js';

import type { 
  UserInput, 
  OrchestrationResult, 
  AgentAnalysis,
  ConsensusResult,
  OrchestrationMetrics
} from '../packages/level5-orchestration/src/types/OrchestrationTypes.js';

console.log('=== Level 5 v0.8.0.4 Multi-Agent Orchestration Validation ===\n');

class OrchestrationValidator {
  private orchestrator: MultiAgentOrchestrator;
  private memoryManager: PersistentMemoryManager;
  private patternRecognizer: BehavioralPatternRecognizer;
  private predictiveEngine: PredictiveIntentEngine;
  private workflowStateMachine: WorkflowStateMachine;

  constructor() {
    // Initialize core components
    this.memoryManager = new PersistentMemoryManager();
    this.patternRecognizer = new BehavioralPatternRecognizer();
    this.predictiveEngine = new PredictiveIntentEngine(this.memoryManager, this.patternRecognizer);
    this.workflowStateMachine = new WorkflowStateMachine();

    // Create orchestrator
    this.orchestrator = new MultiAgentOrchestrator();
  }

  async initialize(): Promise<void> {
    console.log('1. Initializing Multi-Agent Orchestration System...');
    
    try {
      // Initialize memory manager
      await this.memoryManager.initialize();
      
      // Initialize predictive engine
      await this.predictiveEngine.initialize();
      
      // Initialize workflow state machine
      await this.workflowStateMachine.initialize();
      
      // Register agents with orchestrator
      const memoryAgent = new MemoryAgent(this.memoryManager);
      const workflowAgent = new WorkflowAgent(this.workflowStateMachine);
      const patternAgent = new PatternRecognitionAgent(this.patternRecognizer);
      const predictionAgent = new PredictionAgent(this.predictiveEngine);

      this.orchestrator.registerAgent('memory', memoryAgent);
      this.orchestrator.registerAgent('workflow', workflowAgent);
      this.orchestrator.registerAgent('pattern', patternAgent);
      this.orchestrator.registerAgent('prediction', predictionAgent);

      console.log('✅ Multi-Agent Orchestration System initialized successfully');
      console.log(`   - Registered ${this.orchestrator.getRegisteredAgents().length} agents`);
      
    } catch (error) {
      console.error('❌ Orchestration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Quality Gate 1: 4+ agents working in parallel <100ms
   */
  async testParallelProcessingPerformance(): Promise<boolean> {
    console.log('\n2. Testing Parallel Processing Performance (<100ms for 4+ agents)...');
    
    const testInputs: UserInput[] = [
      {
        prompt: 'How do I debug a React component that\'s not rendering?',
        context: {
          platform: 'GitHub',
          url: 'https://github.com/myproject/issues/123',
          timestamp: Date.now(),
          sessionId: 'test-session-1'
        }
      },
      {
        prompt: 'Create a scalable microservices architecture for 100k users',
        context: {
          platform: 'Notion',
          url: 'https://notion.so/architecture-planning',
          timestamp: Date.now(),
          sessionId: 'test-session-2'
        }
      },
      {
        prompt: 'Write unit tests for authentication service',
        context: {
          platform: 'VS Code',
          url: 'file:///project/auth.test.ts',
          timestamp: Date.now(),
          sessionId: 'test-session-3'
        }
      }
    ];

    let allTestsPassed = true;

    for (const input of testInputs) {
      const startTime = performance.now();
      
      try {
        const result = await this.orchestrator.processUserInput(input);
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        console.log(`   Input: "${input.prompt.substring(0, 50)}..."`);
        console.log(`   Processing time: ${processingTime.toFixed(2)}ms`);
        console.log(`   Agents involved: ${result.agentAnalyses.length}`);
        
        if (processingTime > 100) {
          console.log(`   ❌ FAILED: Processing time exceeded 100ms target`);
          allTestsPassed = false;
        } else if (result.agentAnalyses.length < 4) {
          console.log(`   ❌ FAILED: Less than 4 agents participated`);
          allTestsPassed = false;
        } else {
          console.log(`   ✅ PASSED: ${result.agentAnalyses.length} agents processed in ${processingTime.toFixed(2)}ms`);
        }
        
      } catch (error) {
        console.log(`   ❌ FAILED: Processing error: ${error.message}`);
        allTestsPassed = false;
      }
    }

    return allTestsPassed;
  }

  /**
   * Quality Gate 2: Consensus achieved in >80% of cases
   */
  async testConsensusAchievement(): Promise<boolean> {
    console.log('\n3. Testing Consensus Achievement (>80% success rate)...');
    
    const testScenarios = [
      // High agreement scenarios
      { prompt: 'Simple function to add two numbers', expectedConsensus: true },
      { prompt: 'Basic React component with useState', expectedConsensus: true },
      { prompt: 'How to center a div with CSS', expectedConsensus: true },
      
      // Moderate agreement scenarios
      { prompt: 'Best practices for microservices architecture', expectedConsensus: true },
      { prompt: 'Optimize database queries for performance', expectedConsensus: true },
      
      // Potential disagreement scenarios
      { prompt: 'Choose between React vs Vue vs Angular', expectedConsensus: false },
      { prompt: 'Implement complex distributed system with multiple databases', expectedConsensus: false },
      
      // Edge cases
      { prompt: 'Fix production outage with 503 errors affecting 100k users', expectedConsensus: true },
      { prompt: 'Refactor legacy codebase with no documentation', expectedConsensus: false },
      { prompt: 'Create AI model for natural language processing', expectedConsensus: false }
    ];

    let consensusAchieved = 0;
    let totalTests = testScenarios.length;

    for (const scenario of testScenarios) {
      try {
        const input: UserInput = {
          prompt: scenario.prompt,
          context: {
            platform: 'Test',
            url: 'https://test.com',
            timestamp: Date.now(),
            sessionId: `consensus-test-${Date.now()}`
          }
        };

        const result = await this.orchestrator.processUserInput(input);
        
        // Check if consensus was achieved
        const hasConsensus = result.consensusResult.confidence > 0.7 && 
                           result.consensusResult.agreements.length > result.consensusResult.disagreements.length;
        
        if (hasConsensus) {
          consensusAchieved++;
          console.log(`   ✅ "${scenario.prompt.substring(0, 40)}..." - Consensus achieved (${result.consensusResult.confidence.toFixed(2)})`);
        } else {
          console.log(`   ⚠️ "${scenario.prompt.substring(0, 40)}..." - No consensus (${result.consensusResult.confidence.toFixed(2)})`);
        }
        
      } catch (error) {
        console.log(`   ❌ "${scenario.prompt.substring(0, 40)}..." - Processing failed: ${error.message}`);
      }
    }

    const consensusRate = (consensusAchieved / totalTests) * 100;
    console.log(`   Consensus Achievement Rate: ${consensusRate.toFixed(1)}% (${consensusAchieved}/${totalTests})`);
    
    const passed = consensusRate > 80;
    if (passed) {
      console.log(`   ✅ PASSED: Consensus rate exceeds 80% target`);
    } else {
      console.log(`   ❌ FAILED: Consensus rate below 80% target`);
    }

    return passed;
  }

  /**
   * Quality Gate 3: Conflict resolution maintains >70% user satisfaction
   */
  async testConflictResolution(): Promise<boolean> {
    console.log('\n4. Testing Conflict Resolution (>70% satisfaction simulation)...');
    
    // Simulate scenarios where agents disagree
    const conflictScenarios = [
      {
        prompt: 'Choose the best frontend framework for a new project',
        description: 'Framework choice conflicts'
      },
      {
        prompt: 'Design database schema for complex e-commerce system',
        description: 'Architecture disagreements'
      },
      {
        prompt: 'Implement authentication: JWT vs Sessions vs OAuth',
        description: 'Security approach conflicts'
      },
      {
        prompt: 'Performance optimization: caching vs database vs CDN',
        description: 'Performance strategy conflicts'
      },
      {
        prompt: 'Testing strategy: unit vs integration vs e2e priority',
        description: 'Testing approach conflicts'
      }
    ];

    let satisfactoryResolutions = 0;
    let totalConflicts = conflictScenarios.length;

    for (const scenario of conflictScenarios) {
      try {
        const input: UserInput = {
          prompt: scenario.prompt,
          context: {
            platform: 'Test',
            url: 'https://test.com',
            timestamp: Date.now(),
            sessionId: `conflict-test-${Date.now()}`
          }
        };

        const result = await this.orchestrator.processUserInput(input);
        
        // Evaluate resolution quality
        const hasDisagreements = result.consensusResult.disagreements.length > 0;
        const resolutionQuality = this.evaluateResolutionQuality(result);
        
        console.log(`   Scenario: ${scenario.description}`);
        console.log(`   Disagreements: ${result.consensusResult.disagreements.length}`);
        console.log(`   Resolution method: ${result.consensusResult.resolutionStrategy || 'consensus'}`);
        console.log(`   Quality score: ${resolutionQuality.toFixed(2)}/1.0`);
        
        if (resolutionQuality > 0.7) {
          satisfactoryResolutions++;
          console.log(`   ✅ Satisfactory resolution`);
        } else {
          console.log(`   ⚠️ Below satisfaction threshold`);
        }
        
      } catch (error) {
        console.log(`   ❌ Resolution failed: ${error.message}`);
      }
    }

    const satisfactionRate = (satisfactoryResolutions / totalConflicts) * 100;
    console.log(`   Conflict Resolution Satisfaction: ${satisfactionRate.toFixed(1)}% (${satisfactoryResolutions}/${totalConflicts})`);
    
    const passed = satisfactionRate > 70;
    if (passed) {
      console.log(`   ✅ PASSED: Satisfaction rate exceeds 70% target`);
    } else {
      console.log(`   ❌ FAILED: Satisfaction rate below 70% target`);
    }

    return passed;
  }

  /**
   * Quality Gate 4: Reasoning explanation available for all decisions
   */
  async testReasoningExplanation(): Promise<boolean> {
    console.log('\n5. Testing Reasoning Explanation (100% coverage)...');
    
    const testPrompts = [
      'Create a REST API for user management',
      'Debug memory leak in Node.js application',
      'Implement real-time chat with WebSockets',
      'Set up CI/CD pipeline for React app',
      'Optimize SQL queries for better performance'
    ];

    let explanationsProvided = 0;
    let totalTests = testPrompts.length;

    for (const prompt of testPrompts) {
      try {
        const input: UserInput = {
          prompt,
          context: {
            platform: 'Test',
            url: 'https://test.com',
            timestamp: Date.now(),
            sessionId: `reasoning-test-${Date.now()}`
          }
        };

        const result = await this.orchestrator.processUserInput(input);
        
        // Check if reasoning is provided
        const hasMainReasoning = result.primarySuggestion.reasoning && result.primarySuggestion.reasoning.length > 0;
        const hasConsensusReasoning = result.consensusResult.reasoning && result.consensusResult.reasoning.length > 0;
        const hasAgentReasonings = result.agentAnalyses.every(analysis => 
          analysis.suggestions.every(suggestion => suggestion.reasoning && suggestion.reasoning.length > 0)
        );

        console.log(`   Prompt: "${prompt.substring(0, 40)}..."`);
        console.log(`   Main reasoning: ${hasMainReasoning ? '✅' : '❌'}`);
        console.log(`   Consensus reasoning: ${hasConsensusReasoning ? '✅' : '❌'}`);
        console.log(`   Agent reasonings: ${hasAgentReasonings ? '✅' : '❌'}`);
        
        if (hasMainReasoning && hasConsensusReasoning && hasAgentReasonings) {
          explanationsProvided++;
          console.log(`   ✅ Complete reasoning provided`);
        } else {
          console.log(`   ❌ Incomplete reasoning`);
        }
        
      } catch (error) {
        console.log(`   ❌ Processing failed: ${error.message}`);
      }
    }

    const explanationRate = (explanationsProvided / totalTests) * 100;
    console.log(`   Reasoning Explanation Coverage: ${explanationRate.toFixed(1)}% (${explanationsProvided}/${totalTests})`);
    
    const passed = explanationRate === 100;
    if (passed) {
      console.log(`   ✅ PASSED: 100% reasoning explanation coverage`);
    } else {
      console.log(`   ❌ FAILED: Incomplete reasoning explanation coverage`);
    }

    return passed;
  }

  /**
   * Quality Gate 5: Zero performance degradation from parallel processing
   */
  async testPerformanceDegradation(): Promise<boolean> {
    console.log('\n6. Testing Performance Degradation (baseline vs parallel)...');
    
    const testPrompt = 'Create a function to validate email addresses';
    const input: UserInput = {
      prompt: testPrompt,
      context: {
        platform: 'Test',
        url: 'https://test.com',
        timestamp: Date.now(),
        sessionId: 'performance-test'
      }
    };

    // Measure baseline performance (single agent simulation)
    console.log('   Measuring baseline performance...');
    const baselineStartTime = performance.now();
    
    try {
      // Simulate single agent processing
      const memoryAgent = new MemoryAgent(this.memoryManager);
      await memoryAgent.analyzeInput(input);
      
      const baselineEndTime = performance.now();
      const baselineTime = baselineEndTime - baselineStartTime;
      
      console.log(`   Baseline time (single agent): ${baselineTime.toFixed(2)}ms`);
      
      // Measure parallel processing performance
      console.log('   Measuring parallel processing performance...');
      const parallelStartTime = performance.now();
      
      const result = await this.orchestrator.processUserInput(input);
      
      const parallelEndTime = performance.now();
      const parallelTime = parallelEndTime - parallelStartTime;
      
      console.log(`   Parallel time (${result.agentAnalyses.length} agents): ${parallelTime.toFixed(2)}ms`);
      
      // Calculate performance impact
      const performanceRatio = parallelTime / baselineTime;
      const degradationPercent = ((performanceRatio - 1) * 100);
      
      console.log(`   Performance ratio: ${performanceRatio.toFixed(2)}x`);
      console.log(`   Performance change: ${degradationPercent > 0 ? '+' : ''}${degradationPercent.toFixed(1)}%`);
      
      // Allow for up to 20% overhead due to coordination
      const passed = degradationPercent <= 20;
      
      if (passed) {
        console.log(`   ✅ PASSED: Performance degradation within acceptable limits`);
      } else {
        console.log(`   ❌ FAILED: Excessive performance degradation`);
      }
      
      return passed;
      
    } catch (error) {
      console.log(`   ❌ Performance test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper method to evaluate resolution quality
   */
  private evaluateResolutionQuality(result: OrchestrationResult): number {
    let qualityScore = 0;
    
    // Base score from confidence
    qualityScore += result.consensusResult.confidence * 0.4;
    
    // Bonus for having alternatives
    if (result.alternativeSuggestions.length > 0) {
      qualityScore += 0.2;
    }
    
    // Bonus for clear reasoning
    if (result.consensusResult.reasoning && result.consensusResult.reasoning.length > 50) {
      qualityScore += 0.2;
    }
    
    // Bonus for resolution strategy
    if (result.consensusResult.resolutionStrategy) {
      qualityScore += 0.1;
    }
    
    // Bonus for agent participation
    if (result.agentAnalyses.length >= 4) {
      qualityScore += 0.1;
    }
    
    return Math.min(qualityScore, 1.0);
  }

  /**
   * Run comprehensive validation
   */
  async runValidation(): Promise<void> {
    try {
      await this.initialize();
      
      console.log('\n=== Quality Gate Validation ===');
      
      const results = {
        parallelProcessing: await this.testParallelProcessingPerformance(),
        consensusAchievement: await this.testConsensusAchievement(),
        conflictResolution: await this.testConflictResolution(),
        reasoningExplanation: await this.testReasoningExplanation(),
        performanceDegradation: await this.testPerformanceDegradation()
      };
      
      console.log('\n=== Validation Summary ===');
      console.log(`✅ Parallel Processing (<100ms): ${results.parallelProcessing ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Consensus Achievement (>80%): ${results.consensusAchievement ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Conflict Resolution (>70%): ${results.conflictResolution ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Reasoning Explanation (100%): ${results.reasoningExplanation ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Performance Degradation (≤20%): ${results.performanceDegradation ? 'PASS' : 'FAIL'}`);
      
      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\nOverall Result: ${passedTests}/${totalTests} quality gates passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 ALL QUALITY GATES PASSED! v0.8.0.4 is ready for production.');
      } else {
        console.log('⚠️ Some quality gates failed. Review and address issues before release.');
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// Run validation
const validator = new OrchestrationValidator();
validator.runValidation().catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
