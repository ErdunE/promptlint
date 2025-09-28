/**
 * Simple Node.js runner for v0.8.0.4 Multi-Agent Orchestration validation
 * This script tests the basic functionality without browser dependencies
 */

import { existsSync } from 'fs';
import { resolve } from 'path';

console.log('=== Level 5 v0.8.0.4 Multi-Agent Orchestration Basic Validation ===\n');

async function validateOrchestrationStructure() {
  console.log('1. Validating Multi-Agent Orchestration file structure...');
  
  const requiredFiles = [
    // Core orchestration files
    './packages/level5-orchestration/package.json',
    './packages/level5-orchestration/src/MultiAgentOrchestrator.ts',
    './packages/level5-orchestration/src/ConsensusEngine.ts',
    './packages/level5-orchestration/src/index.ts',
    
    // Agent files
    './packages/level5-orchestration/src/agents/MemoryAgent.ts',
    './packages/level5-orchestration/src/agents/WorkflowAgent.ts',
    './packages/level5-orchestration/src/agents/PatternRecognitionAgent.ts',
    './packages/level5-orchestration/src/agents/PredictionAgent.ts',
    
    // Type definitions
    './packages/level5-orchestration/src/types/OrchestrationTypes.ts',
    './packages/level5-orchestration/src/types/AgentTypes.ts',
    
    // Chrome extension integration
    './apps/extension-chrome/src/level5/UnifiedExperience.ts'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('   ✅ All required orchestration files are present');
  } else {
    console.log('   ❌ Some required files are missing');
    return false;
  }
  
  return true;
}

async function validatePackageConfiguration() {
  console.log('\n2. Validating package configuration...');
  
  try {
    // Check orchestration package.json
    const { readFileSync } = await import('fs');
    const orchestrationPackage = JSON.parse(
      readFileSync('./packages/level5-orchestration/package.json', 'utf8')
    );
    
    const expectedName = '@promptlint/level5-orchestration';
    const expectedVersion = '0.8.0.0';
    
    if (orchestrationPackage.name === expectedName && orchestrationPackage.version === expectedVersion) {
      console.log('   ✅ Orchestration package.json configured correctly');
    } else {
      console.log(`   ❌ Package configuration mismatch: ${orchestrationPackage.name}@${orchestrationPackage.version}`);
      return false;
    }
    
    // Check dependencies
    const requiredDeps = [
      '@promptlint/shared-types',
      '@promptlint/level5-memory', 
      '@promptlint/level5-predictive'
    ];
    
    for (const dep of requiredDeps) {
      if (orchestrationPackage.dependencies && orchestrationPackage.dependencies[dep]) {
        console.log(`   ✅ Dependency: ${dep}`);
      } else {
        console.log(`   ❌ Missing dependency: ${dep}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Package validation failed: ${error.message}`);
    return false;
  }
}

async function validateTypeDefinitions() {
  console.log('\n3. Validating TypeScript type definitions...');
  
  try {
    const { readFileSync } = await import('fs');
    
    // Check OrchestrationTypes.ts
    const orchestrationTypes = readFileSync('./packages/level5-orchestration/src/types/OrchestrationTypes.ts', 'utf8');
    
    const requiredTypes = [
      'UserInput',
      'OrchestrationResult', 
      'AgentAnalysis',
      'ConsensusResult',
      'OrchestrationMetrics'
    ];
    
    let allTypesPresent = true;
    
    for (const type of requiredTypes) {
      if (orchestrationTypes.includes(`interface ${type}`) || orchestrationTypes.includes(`type ${type}`)) {
        console.log(`   ✅ Type definition: ${type}`);
      } else {
        console.log(`   ❌ Missing type definition: ${type}`);
        allTypesPresent = false;
      }
    }
    
    // Check AgentTypes.ts
    const agentTypes = readFileSync('./packages/level5-orchestration/src/types/AgentTypes.ts', 'utf8');
    
    const requiredAgentTypes = [
      'Agent',
      'AgentAnalysis',
      'AgentSuggestion',
      'AgentCapability'
    ];
    
    for (const type of requiredAgentTypes) {
      if (agentTypes.includes(`interface ${type}`) || agentTypes.includes(`type ${type}`)) {
        console.log(`   ✅ Agent type definition: ${type}`);
      } else {
        console.log(`   ❌ Missing agent type definition: ${type}`);
        allTypesPresent = false;
      }
    }
    
    return allTypesPresent;
    
  } catch (error) {
    console.log(`   ❌ Type validation failed: ${error.message}`);
    return false;
  }
}

async function validateAgentImplementations() {
  console.log('\n4. Validating agent implementations...');
  
  try {
    const { readFileSync } = await import('fs');
    
    const agents = [
      { name: 'MemoryAgent', file: './packages/level5-orchestration/src/agents/MemoryAgent.ts' },
      { name: 'WorkflowAgent', file: './packages/level5-orchestration/src/agents/WorkflowAgent.ts' },
      { name: 'PatternRecognitionAgent', file: './packages/level5-orchestration/src/agents/PatternRecognitionAgent.ts' },
      { name: 'PredictionAgent', file: './packages/level5-orchestration/src/agents/PredictionAgent.ts' }
    ];
    
    let allAgentsValid = true;
    
    for (const agent of agents) {
      const content = readFileSync(agent.file, 'utf8');
      
      // Check for required methods
      const requiredMethods = ['analyzeInput', 'getCapabilities'];
      let agentValid = true;
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          console.log(`   ✅ ${agent.name}.${method}()`);
        } else {
          console.log(`   ❌ ${agent.name}.${method}() - MISSING`);
          agentValid = false;
        }
      }
      
      if (agentValid) {
        console.log(`   ✅ ${agent.name} implementation complete`);
      } else {
        console.log(`   ❌ ${agent.name} implementation incomplete`);
        allAgentsValid = false;
      }
    }
    
    return allAgentsValid;
    
  } catch (error) {
    console.log(`   ❌ Agent validation failed: ${error.message}`);
    return false;
  }
}

async function validateChromeExtensionIntegration() {
  console.log('\n5. Validating Chrome Extension integration...');
  
  try {
    const { readFileSync } = await import('fs');
    
    // Check UnifiedExperience.ts
    const unifiedExperience = readFileSync('./apps/extension-chrome/src/level5/UnifiedExperience.ts', 'utf8');
    
    const requiredMethods = [
      'provideUnifiedAssistance',
      'initializeOrchestration'
    ];
    
    let integrationValid = true;
    
    for (const method of requiredMethods) {
      if (unifiedExperience.includes(method)) {
        console.log(`   ✅ UnifiedExperience.${method}()`);
      } else {
        console.log(`   ❌ UnifiedExperience.${method}() - MISSING`);
        integrationValid = false;
      }
    }
    
    // Check for orchestrator import
    if (unifiedExperience.includes('MultiAgentOrchestrator')) {
      console.log(`   ✅ MultiAgentOrchestrator integration`);
    } else {
      console.log(`   ❌ MultiAgentOrchestrator integration - MISSING`);
      integrationValid = false;
    }
    
    return integrationValid;
    
  } catch (error) {
    console.log(`   ❌ Chrome Extension integration validation failed: ${error.message}`);
    return false;
  }
}

async function runBasicValidation() {
  console.log('Running basic validation checks...\n');
  
  const results = {
    structure: await validateOrchestrationStructure(),
    packageConfig: await validatePackageConfiguration(),
    typeDefinitions: await validateTypeDefinitions(),
    agentImplementations: await validateAgentImplementations(),
    chromeIntegration: await validateChromeExtensionIntegration()
  };
  
  console.log('\n=== Basic Validation Summary ===');
  console.log(`File Structure: ${results.structure ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Package Config: ${results.packageConfig ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Type Definitions: ${results.typeDefinitions ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Agent Implementations: ${results.agentImplementations ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chrome Integration: ${results.chromeIntegration ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nOverall: ${passedTests}/${totalTests} basic validation checks passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Basic validation PASSED! Multi-Agent Orchestration structure is complete.');
    console.log('\nNext steps:');
    console.log('- Run full orchestration tests: npm run test:orchestration');
    console.log('- Test browser integration: npm run test:browser');
    console.log('- Validate quality gates: npm run validate:v0.8.0.4');
  } else {
    console.log('⚠️ Some basic validation checks failed. Address issues before proceeding.');
  }
  
  return passedTests === totalTests;
}

// Run basic validation
runBasicValidation().catch(error => {
  console.error('Basic validation failed:', error);
  process.exit(1);
});
