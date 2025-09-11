// Phase 3.1 Comprehensive Validation - User Context Memory Foundation
// Independent verification of all claimed functionality

import { performance } from 'perf_hooks';

async function validatePhase3_1Comprehensive() {
  console.log("\n🔍 PHASE 3.1 COMPREHENSIVE VALIDATION");
  console.log("User Context Memory Foundation - Independent Verification");
  console.log("=" .repeat(80));

  const validationResults = {
    contextMemory: { passed: 0, total: 0, errors: [] },
    privacyControls: { passed: 0, total: 0, errors: [] },
    storageCompliance: { passed: 0, total: 0, errors: [] },
    level2Regression: { passed: 0, total: 0, errors: [] },
    performance: { passed: 0, total: 0, errors: [], timings: [] }
  };

  try {
    // Import context memory components
    const { ContextMemoryEngine, BehaviorAnalytics, UserContextStorage, generateUserId } = 
      await import("../packages/context-memory/dist/context-memory.es.js");

    console.log("✅ Context Memory package imported successfully");

    // Test 1: Context Memory Engine Basic Operations
    console.log("\n📋 1. CONTEXT MEMORY ENGINE VALIDATION");
    console.log("-".repeat(50));

    await testContextStorageRetrieval(ContextMemoryEngine, UserContextStorage, validationResults);
    await testPreferenceLearning(ContextMemoryEngine, BehaviorAnalytics, validationResults);
    await testDataLifecycle(ContextMemoryEngine, UserContextStorage, validationResults);

    // Test 2: Privacy Controls Validation
    console.log("\n🔒 2. PRIVACY CONTROLS VALIDATION");
    console.log("-".repeat(50));

    await testPrivacySettings(UserContextStorage, validationResults);
    await testDataClearing(ContextMemoryEngine, UserContextStorage, validationResults);
    await testDataExport(UserContextStorage, validationResults);

    // Test 3: Chrome Extension Storage Compliance
    console.log("\n💾 3. STORAGE COMPLIANCE VALIDATION");
    console.log("-".repeat(50));

    await testStorageConstraints(UserContextStorage, validationResults);
    await testStorageEfficiency(ContextMemoryEngine, UserContextStorage, validationResults);
    await testDataLifecycleManagement(ContextMemoryEngine, validationResults);

    // Test 4: Level 2 Regression Prevention
    console.log("\n🔄 4. LEVEL 2 REGRESSION VALIDATION");
    console.log("-".repeat(50));

    await testLevel2Preservation(validationResults);

    // Test 5: Performance Impact Assessment
    console.log("\n⚡ 5. PERFORMANCE IMPACT VALIDATION");
    console.log("-".repeat(50));

    await testContextOperationPerformance(ContextMemoryEngine, BehaviorAnalytics, validationResults);
    await testEnhancedProcessingTime(validationResults);

    // Generate comprehensive report
    generateValidationReport(validationResults);

  } catch (error) {
    console.error("❌ CRITICAL VALIDATION FAILURE:", error);
    validationResults.contextMemory.errors.push(`Critical import failure: ${error.message}`);
    generateValidationReport(validationResults);
    return false;
  }
}

async function testContextStorageRetrieval(ContextMemoryEngine, UserContextStorage, results) {
  results.contextMemory.total += 3;

  try {
    console.log("Testing context storage and retrieval...");
    
    const engine = new ContextMemoryEngine();
    const testUserId = "test_user_" + Date.now();
    
    // Create test context
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true; // Required for storage
    testContext.preferences.preferredTemplates = [{
      templateType: 'bullet',
      score: 85,
      frequency: 0.8,
      lastUsed: new Date(),
      effectiveness: 85
    }];

    // Test 1: Store context
    await engine.storeUserContext(testContext);
    console.log("✅ Context storage: SUCCESS");
    results.contextMemory.passed++;

    // Test 2: Retrieve context
    const retrievedContext = await engine.retrieveUserContext(testUserId);
    if (retrievedContext && retrievedContext.userId === testUserId) {
      console.log("✅ Context retrieval: SUCCESS");
      results.contextMemory.passed++;
    } else {
      throw new Error("Retrieved context invalid or missing");
    }

    // Test 3: Context data integrity
    if (retrievedContext.preferences.preferredTemplates.length > 0 &&
        retrievedContext.settings.enableBehaviorTracking === true) {
      console.log("✅ Context data integrity: SUCCESS");
      results.contextMemory.passed++;
    } else {
      throw new Error("Context data integrity compromised");
    }

    // Cleanup
    await engine.clearUserData(testUserId);

  } catch (error) {
    console.error("❌ Context storage/retrieval failed:", error.message);
    results.contextMemory.errors.push(`Storage/Retrieval: ${error.message}`);
  }
}

async function testPreferenceLearning(ContextMemoryEngine, BehaviorAnalytics, results) {
  results.contextMemory.total += 2;

  try {
    console.log("Testing preference learning accuracy...");
    
    const engine = new ContextMemoryEngine();
    const analytics = new BehaviorAnalytics();

    // Create mock history with clear preference pattern
    const mockHistory = [];
    
    // 8 bullet template selections (high effectiveness)
    for (let i = 0; i < 8; i++) {
      mockHistory.push({
        id: `test_${i}`,
        timestamp: new Date(Date.now() - i * 1000),
        originalPrompt: `test prompt ${i}`,
        selectedTemplate: 'bullet',
        domainClassification: { domain: 'analysis', confidence: 85, indicators: [] },
        userModifications: [],
        effectiveness: {
          userSatisfaction: 85 + Math.random() * 10,
          promptImprovement: 80,
          timeToAcceptance: 30000,
          modificationsCount: 0,
          finallyAccepted: true
        },
        sessionId: 'test_session'
      });
    }

    // 2 task_io template selections (lower effectiveness)
    for (let i = 0; i < 2; i++) {
      mockHistory.push({
        id: `test_task_${i}`,
        timestamp: new Date(Date.now() - (i + 8) * 1000),
        originalPrompt: `task prompt ${i}`,
        selectedTemplate: 'task_io',
        domainClassification: { domain: 'code', confidence: 75, indicators: [] },
        userModifications: [],
        effectiveness: {
          userSatisfaction: 65,
          promptImprovement: 60,
          timeToAcceptance: 45000,
          modificationsCount: 1,
          finallyAccepted: true
        },
        sessionId: 'test_session'
      });
    }

    // Test 1: Preference analysis
    const preferences = engine.analyzeUserPreferences(mockHistory);
    
    if (preferences.preferredTemplates.length > 0 && 
        preferences.preferredTemplates[0].templateType === 'bullet') {
      console.log("✅ Preference detection: SUCCESS (bullet template preferred)");
      results.contextMemory.passed++;
    } else {
      throw new Error(`Expected bullet preference, got: ${preferences.preferredTemplates[0]?.templateType}`);
    }

    // Test 2: Learning confidence calculation
    if (preferences.learningConfidence > 0 && preferences.learningConfidence <= 100) {
      console.log(`✅ Learning confidence: SUCCESS (${preferences.learningConfidence.toFixed(1)}%)`);
      results.contextMemory.passed++;
    } else {
      throw new Error(`Invalid learning confidence: ${preferences.learningConfidence}`);
    }

  } catch (error) {
    console.error("❌ Preference learning failed:", error.message);
    results.contextMemory.errors.push(`Preference Learning: ${error.message}`);
  }
}

async function testDataLifecycle(ContextMemoryEngine, UserContextStorage, results) {
  results.contextMemory.total += 1;

  try {
    console.log("Testing data lifecycle management...");
    
    const engine = new ContextMemoryEngine();
    const testUserId = "lifecycle_test_" + Date.now();
    
    // Create context with old data
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true;
    testContext.settings.dataRetentionDays = 7; // 7 day retention
    
    // Add old history entry (should be cleaned up)
    testContext.history.push({
      id: 'old_entry',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      originalPrompt: 'old prompt',
      selectedTemplate: 'bullet',
      domainClassification: { domain: 'test', confidence: 50, indicators: [] },
      userModifications: [],
      effectiveness: { userSatisfaction: 50, promptImprovement: 50, timeToAcceptance: 0, modificationsCount: 0, finallyAccepted: true },
      sessionId: 'old_session'
    });

    // Add recent history entry (should be preserved)
    testContext.history.push({
      id: 'recent_entry',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      originalPrompt: 'recent prompt',
      selectedTemplate: 'task_io',
      domainClassification: { domain: 'test', confidence: 80, indicators: [] },
      userModifications: [],
      effectiveness: { userSatisfaction: 80, promptImprovement: 80, timeToAcceptance: 0, modificationsCount: 0, finallyAccepted: true },
      sessionId: 'recent_session'
    });

    await engine.storeUserContext(testContext);
    
    // Retrieve context (should trigger cleanup)
    const retrievedContext = await engine.retrieveUserContext(testUserId);
    
    // Check that old data was cleaned and recent data preserved
    const hasRecentEntry = retrievedContext?.history.some(entry => entry.id === 'recent_entry');
    const hasOldEntry = retrievedContext?.history.some(entry => entry.id === 'old_entry');
    
    if (retrievedContext && hasRecentEntry && !hasOldEntry) {
      console.log(`✅ Data lifecycle management: SUCCESS (old data cleaned, ${retrievedContext.history.length} recent entries preserved)`);
      results.contextMemory.passed++;
    } else {
      throw new Error(`Data lifecycle failed - Recent: ${hasRecentEntry}, Old: ${hasOldEntry}, Total: ${retrievedContext?.history.length}`);
    }

    // Cleanup
    await engine.clearUserData(testUserId);

  } catch (error) {
    console.error("❌ Data lifecycle management failed:", error.message);
    results.contextMemory.errors.push(`Data Lifecycle: ${error.message}`);
  }
}

async function testPrivacySettings(UserContextStorage, results) {
  results.privacyControls.total += 2;

  try {
    console.log("Testing privacy settings functionality...");
    
    // Test 1: Default privacy settings
    const defaultSettings = UserContextStorage.getDefaultPrivacySettings();
    
    if (defaultSettings.enableBehaviorTracking === false && 
        defaultSettings.enablePreferenceLearning === false) {
      console.log("✅ Default privacy-first settings: SUCCESS (opt-in required)");
      results.privacyControls.passed++;
    } else {
      throw new Error("Default settings not privacy-first");
    }

    // Test 2: Privacy settings persistence
    const customSettings = {
      ...defaultSettings,
      enableBehaviorTracking: true,
      dataRetentionDays: 14
    };

    await UserContextStorage.savePrivacySettings(customSettings);
    const retrievedSettings = await UserContextStorage.loadPrivacySettings();
    
    if (retrievedSettings && 
        retrievedSettings.enableBehaviorTracking === true &&
        retrievedSettings.dataRetentionDays === 14) {
      console.log("✅ Privacy settings persistence: SUCCESS");
      results.privacyControls.passed++;
    } else {
      throw new Error("Privacy settings not persisted correctly");
    }

  } catch (error) {
    console.error("❌ Privacy settings failed:", error.message);
    results.privacyControls.errors.push(`Privacy Settings: ${error.message}`);
  }
}

async function testDataClearing(ContextMemoryEngine, UserContextStorage, results) {
  results.privacyControls.total += 1;

  try {
    console.log("Testing complete data clearing...");
    
    const engine = new ContextMemoryEngine();
    const testUserId = "clear_test_" + Date.now();
    
    // Create and store test context
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true;
    await engine.storeUserContext(testContext);
    
    // Verify context exists
    let retrievedContext = await engine.retrieveUserContext(testUserId);
    if (!retrievedContext) {
      throw new Error("Test context not stored properly");
    }

    // Clear all data
    await engine.clearUserData(testUserId);
    
    // Verify complete removal
    retrievedContext = await engine.retrieveUserContext(testUserId);
    
    if (retrievedContext === null) {
      console.log("✅ Complete data clearing: SUCCESS");
      results.privacyControls.passed++;
    } else {
      throw new Error("Data not completely cleared");
    }

  } catch (error) {
    console.error("❌ Data clearing failed:", error.message);
    results.privacyControls.errors.push(`Data Clearing: ${error.message}`);
  }
}

async function testDataExport(UserContextStorage, results) {
  results.privacyControls.total += 1;

  try {
    console.log("Testing data export functionality...");
    
    // Create test context
    const testUserId = "export_test_" + Date.now();
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true;
    
    await UserContextStorage.saveUserContext(testContext);
    
    // Test data export
    const exportData = await UserContextStorage.exportUserData();
    const parsedExport = JSON.parse(exportData);
    
    if (parsedExport.context && 
        parsedExport.context.userId === testUserId &&
        parsedExport.exportDate) {
      console.log("✅ Data export functionality: SUCCESS");
      results.privacyControls.passed++;
    } else {
      throw new Error("Export data incomplete or invalid");
    }

    // Cleanup
    await UserContextStorage.clearUserContext();

  } catch (error) {
    console.error("❌ Data export failed:", error.message);
    results.privacyControls.errors.push(`Data Export: ${error.message}`);
  }
}

async function testStorageConstraints(UserContextStorage, results) {
  results.storageCompliance.total += 1;

  try {
    console.log("Testing storage constraint compliance...");
    
    const storageInfo = await UserContextStorage.getStorageUsage();
    const maxStorageBytes = 5 * 1024 * 1024; // 5MB Chrome extension limit
    
    if (storageInfo.totalBytes < maxStorageBytes) {
      console.log(`✅ Storage constraints: SUCCESS (${(storageInfo.totalBytes / 1024).toFixed(2)} KB used)`);
      results.storageCompliance.passed++;
    } else {
      throw new Error(`Storage limit exceeded: ${storageInfo.totalBytes} bytes`);
    }

  } catch (error) {
    console.error("❌ Storage constraints failed:", error.message);
    results.storageCompliance.errors.push(`Storage Constraints: ${error.message}`);
  }
}

async function testStorageEfficiency(ContextMemoryEngine, UserContextStorage, results) {
  results.storageCompliance.total += 1;

  try {
    console.log("Testing storage efficiency...");
    
    const engine = new ContextMemoryEngine();
    const testUserId = "efficiency_test_" + Date.now();
    
    // Create context with substantial data
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true;
    
    // Add multiple history entries
    for (let i = 0; i < 50; i++) {
      testContext.history.push({
        id: `entry_${i}`,
        timestamp: new Date(Date.now() - i * 1000),
        originalPrompt: `test prompt ${i} with some additional content to test storage efficiency`,
        selectedTemplate: i % 2 === 0 ? 'bullet' : 'task_io',
        domainClassification: { domain: 'test', confidence: 75, indicators: ['test', 'efficiency'] },
        userModifications: [],
        effectiveness: { userSatisfaction: 75, promptImprovement: 75, timeToAcceptance: 30000, modificationsCount: 0, finallyAccepted: true },
        sessionId: `session_${Math.floor(i / 10)}`
      });
    }

    const beforeStorage = await UserContextStorage.getStorageUsage();
    await engine.storeUserContext(testContext);
    const afterStorage = await UserContextStorage.getStorageUsage();
    
    const storageIncrease = afterStorage.totalBytes - beforeStorage.totalBytes;
    const expectedMaxIncrease = 100 * 1024; // 100KB reasonable for 50 entries
    
    if (storageIncrease < expectedMaxIncrease) {
      console.log(`✅ Storage efficiency: SUCCESS (${(storageIncrease / 1024).toFixed(2)} KB for 50 entries)`);
      results.storageCompliance.passed++;
    } else {
      throw new Error(`Storage inefficient: ${storageIncrease} bytes for test data`);
    }

    // Cleanup
    await engine.clearUserData(testUserId);

  } catch (error) {
    console.error("❌ Storage efficiency failed:", error.message);
    results.storageCompliance.errors.push(`Storage Efficiency: ${error.message}`);
  }
}

async function testDataLifecycleManagement(ContextMemoryEngine, results) {
  // Import UserContextStorage for this test
  const { UserContextStorage } = await import("../packages/context-memory/dist/context-memory.es.js");
  results.storageCompliance.total += 1;

  try {
    console.log("Testing automatic cleanup functionality...");
    
    const engine = new ContextMemoryEngine();
    const testUserId = "cleanup_test_" + Date.now();
    
    // Create context with mixed old/new data
    const testContext = UserContextStorage.createDefaultUserContext(testUserId);
    testContext.settings.enableBehaviorTracking = true;
    testContext.settings.dataRetentionDays = 5; // 5 day retention
    
    // Add old entries (should be cleaned)
    for (let i = 0; i < 10; i++) {
      testContext.history.push({
        id: `old_${i}`,
        timestamp: new Date(Date.now() - (7 + i) * 24 * 60 * 60 * 1000), // 7+ days ago
        originalPrompt: `old prompt ${i}`,
        selectedTemplate: 'bullet',
        domainClassification: { domain: 'test', confidence: 50, indicators: [] },
        userModifications: [],
        effectiveness: { userSatisfaction: 50, promptImprovement: 50, timeToAcceptance: 0, modificationsCount: 0, finallyAccepted: true },
        sessionId: 'old_session'
      });
    }

    // Add recent entries (should be preserved)
    for (let i = 0; i < 5; i++) {
      testContext.history.push({
        id: `recent_${i}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // 0-4 days ago
        originalPrompt: `recent prompt ${i}`,
        selectedTemplate: 'task_io',
        domainClassification: { domain: 'test', confidence: 80, indicators: [] },
        userModifications: [],
        effectiveness: { userSatisfaction: 80, promptImprovement: 80, timeToAcceptance: 0, modificationsCount: 0, finallyAccepted: true },
        sessionId: 'recent_session'
      });
    }

    await engine.storeUserContext(testContext);
    
    // Retrieve context (triggers cleanup)
    const cleanedContext = await engine.retrieveUserContext(testUserId);
    
    if (cleanedContext && cleanedContext.history.length === 5 &&
        cleanedContext.history.every(entry => entry.id.startsWith('recent_'))) {
      console.log("✅ Automatic cleanup: SUCCESS (old data removed, recent preserved)");
      results.storageCompliance.passed++;
    } else {
      throw new Error(`Expected 5 recent entries, got ${cleanedContext?.history.length}`);
    }

    // Cleanup
    await engine.clearUserData(testUserId);

  } catch (error) {
    console.error("❌ Automatic cleanup failed:", error.message);
    results.storageCompliance.errors.push(`Automatic Cleanup: ${error.message}`);
  }
}

async function testLevel2Preservation(results) {
  results.level2Regression.total += 1;

  try {
    console.log("Testing Level 2 functionality preservation...");
    
    // Import Level 2 components
    const { HybridClassifier } = await import("../packages/domain-classifier/dist/index.js");
    const { TemplateEngine } = await import("../packages/template-engine/dist/template-engine.js");
    const { analyzePrompt } = await import("../packages/rules-engine/dist/index.js");

    const classifier = new HybridClassifier();
    await classifier.initialize();
    const engine = new TemplateEngine();

    // Test core Level 2 functionality
    const testPrompts = [
      { prompt: "implement REST API", expectedDomain: "code", minConfidence: 90 },
      { prompt: "analyze customer data", expectedDomain: "analysis", minConfidence: 85 },
      { prompt: "write blog post", expectedDomain: "writing", minConfidence: 85 }
    ];

    let level2Tests = 0;
    let level2Passed = 0;

    for (const test of testPrompts) {
      level2Tests++;
      const lintResult = analyzePrompt(test.prompt);
      const candidates = await engine.generateCandidates(test.prompt, lintResult);
      
      const domain = candidates[0]?.metadata?.selectionMetadata?.domainContext?.domain;
      const confidence = candidates[0]?.metadata?.selectionMetadata?.domainContext?.confidence || 0;
      
      if (domain === test.expectedDomain && confidence >= test.minConfidence) {
        level2Passed++;
      }
    }

    if (level2Passed === level2Tests) {
      console.log(`✅ Level 2 preservation: SUCCESS (${level2Passed}/${level2Tests} tests passed)`);
      results.level2Regression.passed++;
    } else {
      throw new Error(`Level 2 regression detected: ${level2Passed}/${level2Tests} tests passed`);
    }

  } catch (error) {
    console.error("❌ Level 2 preservation failed:", error.message);
    results.level2Regression.errors.push(`Level 2 Preservation: ${error.message}`);
  }
}

async function testContextOperationPerformance(ContextMemoryEngine, BehaviorAnalytics, results) {
  results.performance.total += 4;

  try {
    console.log("Testing context operation performance...");
    
    const engine = new ContextMemoryEngine();
    const analytics = new BehaviorAnalytics();
    const testUserId = "perf_test_" + Date.now();
    
    // Test 1: Context storage performance
    const testContext = {
      userId: testUserId,
      preferences: { preferredTemplates: [], domainPreferences: [], avoidedTemplates: [], confidenceThreshold: 70, learningConfidence: 0 },
      history: [],
      settings: { enableBehaviorTracking: true, enablePreferenceLearning: false, dataRetentionDays: 30, allowAnalytics: false, exportDataOnRequest: true, anonymizeData: true, clearDataOnExit: false },
      metadata: { version: '0.6.0', totalInteractions: 0, storageUsageBytes: 0, lastCleanup: new Date(), migrationVersion: 1 },
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const startStore = performance.now();
    await engine.storeUserContext(testContext);
    const endStore = performance.now();
    const storeTime = endStore - startStore;
    
    results.performance.timings.push({ operation: 'Context Storage', time: storeTime });
    
    if (storeTime < 25) {
      console.log(`✅ Context storage performance: SUCCESS (${storeTime.toFixed(2)}ms)`);
      results.performance.passed++;
    } else {
      throw new Error(`Storage too slow: ${storeTime.toFixed(2)}ms (limit: 25ms)`);
    }

    // Test 2: Context retrieval performance
    const startRetrieve = performance.now();
    const retrievedContext = await engine.retrieveUserContext(testUserId);
    const endRetrieve = performance.now();
    const retrieveTime = endRetrieve - startRetrieve;
    
    results.performance.timings.push({ operation: 'Context Retrieval', time: retrieveTime });
    
    if (retrieveTime < 25) {
      console.log(`✅ Context retrieval performance: SUCCESS (${retrieveTime.toFixed(2)}ms)`);
      results.performance.passed++;
    } else {
      throw new Error(`Retrieval too slow: ${retrieveTime.toFixed(2)}ms (limit: 25ms)`);
    }

    // Test 3: Template selection tracking performance
    const mockEvent = {
      timestamp: new Date(),
      originalPrompt: 'test prompt',
      selectedTemplate: 'bullet',
      userModifications: [],
      domainClassification: { domain: 'test', confidence: 80, indicators: [] },
      sessionContext: { sessionId: 'test', startTime: new Date(), interactionCount: 1, userAgent: 'test' }
    };

    const startTrack = performance.now();
    const historyEntry = analytics.trackTemplateSelection(mockEvent);
    const endTrack = performance.now();
    const trackTime = endTrack - startTrack;
    
    results.performance.timings.push({ operation: 'Template Tracking', time: trackTime });
    
    if (trackTime < 25) {
      console.log(`✅ Template tracking performance: SUCCESS (${trackTime.toFixed(2)}ms)`);
      results.performance.passed++;
    } else {
      throw new Error(`Tracking too slow: ${trackTime.toFixed(2)}ms (limit: 25ms)`);
    }

    // Test 4: Preference analysis performance
    const mockHistory = Array(20).fill(null).map((_, i) => ({
      id: `perf_${i}`,
      timestamp: new Date(Date.now() - i * 1000),
      originalPrompt: `prompt ${i}`,
      selectedTemplate: i % 2 === 0 ? 'bullet' : 'task_io',
      domainClassification: { domain: 'test', confidence: 75, indicators: [] },
      userModifications: [],
      effectiveness: { userSatisfaction: 75, promptImprovement: 75, timeToAcceptance: 30000, modificationsCount: 0, finallyAccepted: true },
      sessionId: 'perf_session'
    }));

    const startAnalyze = performance.now();
    const preferences = engine.analyzeUserPreferences(mockHistory);
    const endAnalyze = performance.now();
    const analyzeTime = endAnalyze - startAnalyze;
    
    results.performance.timings.push({ operation: 'Preference Analysis', time: analyzeTime });
    
    if (analyzeTime < 25) {
      console.log(`✅ Preference analysis performance: SUCCESS (${analyzeTime.toFixed(2)}ms)`);
      results.performance.passed++;
    } else {
      throw new Error(`Analysis too slow: ${analyzeTime.toFixed(2)}ms (limit: 25ms)`);
    }

    // Cleanup
    await engine.clearUserData(testUserId);

  } catch (error) {
    console.error("❌ Context operation performance failed:", error.message);
    results.performance.errors.push(`Context Operations: ${error.message}`);
  }
}

async function testEnhancedProcessingTime(results) {
  results.performance.total += 1;

  try {
    console.log("Testing enhanced processing time budget...");
    
    // Import enhanced service components
    const { TemplateEngine } = await import("../packages/template-engine/dist/template-engine.js");
    const { analyzePrompt } = await import("../packages/rules-engine/dist/index.js");
    
    const engine = new TemplateEngine();
    
    const testPrompts = [
      "implement REST API with authentication",
      "analyze customer data trends and patterns", 
      "create comprehensive documentation for team"
    ];

    let totalTime = 0;
    let testCount = 0;

    for (const prompt of testPrompts) {
      testCount++;
      const lintResult = analyzePrompt(prompt);
      
      const startTime = performance.now();
      const candidates = await engine.generateCandidates(prompt, lintResult);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      totalTime += processingTime;
      
      results.performance.timings.push({ 
        operation: `Enhanced Processing: "${prompt.substring(0, 30)}..."`, 
        time: processingTime 
      });
    }

    const averageTime = totalTime / testCount;
    
    if (averageTime < 150) { // Level 3 budget: <150ms
      console.log(`✅ Enhanced processing time: SUCCESS (${averageTime.toFixed(2)}ms average)`);
      results.performance.passed++;
    } else {
      throw new Error(`Processing too slow: ${averageTime.toFixed(2)}ms average (limit: 150ms)`);
    }

  } catch (error) {
    console.error("❌ Enhanced processing time failed:", error.message);
    results.performance.errors.push(`Enhanced Processing: ${error.message}`);
  }
}

function generateValidationReport(results) {
  console.log("\n📊 PHASE 3.1 VALIDATION REPORT");
  console.log("=" .repeat(80));

  const categories = [
    { name: "Context Memory Engine", key: "contextMemory", icon: "🧠" },
    { name: "Privacy Controls", key: "privacyControls", icon: "🔒" },
    { name: "Storage Compliance", key: "storageCompliance", icon: "💾" },
    { name: "Level 2 Regression", key: "level2Regression", icon: "🔄" },
    { name: "Performance Impact", key: "performance", icon: "⚡" }
  ];

  let totalPassed = 0;
  let totalTests = 0;
  let hasErrors = false;

  categories.forEach(category => {
    const result = results[category.key];
    const successRate = result.total > 0 ? (result.passed / result.total * 100) : 0;
    
    console.log(`\n${category.icon} ${category.name}:`);
    console.log(`  Tests: ${result.passed}/${result.total} (${successRate.toFixed(1)}%)`);
    
    if (result.errors.length > 0) {
      hasErrors = true;
      console.log(`  ❌ Errors:`);
      result.errors.forEach(error => console.log(`    • ${error}`));
    } else if (result.passed === result.total && result.total > 0) {
      console.log(`  ✅ All tests passed`);
    }

    totalPassed += result.passed;
    totalTests += result.total;
  });

  // Performance timing summary
  if (results.performance.timings.length > 0) {
    console.log(`\n⏱️ Performance Timings:`);
    results.performance.timings.forEach(timing => {
      const status = timing.time < 25 ? '✅' : timing.time < 150 ? '⚠️' : '❌';
      console.log(`  ${status} ${timing.operation}: ${timing.time.toFixed(2)}ms`);
    });
  }

  // Overall assessment
  const overallSuccess = (totalPassed / totalTests * 100);
  
  console.log(`\n🎯 OVERALL VALIDATION RESULTS:`);
  console.log("=" .repeat(80));
  console.log(`Total Tests: ${totalPassed}/${totalTests} (${overallSuccess.toFixed(1)}%)`);
  console.log(`Errors Detected: ${hasErrors ? 'YES' : 'NO'}`);

  if (overallSuccess >= 90 && !hasErrors) {
    console.log(`\n✅ PHASE 3.1 VALIDATION: PASSED`);
    console.log(`User Context Memory Foundation validated successfully`);
    console.log(`🚀 Ready for Phase 3.2 authorization`);
    return true;
  } else if (overallSuccess >= 75) {
    console.log(`\n⚠️ PHASE 3.1 VALIDATION: PARTIAL SUCCESS`);
    console.log(`Some functionality validated, refinement needed`);
    console.log(`❌ Phase 3.2 authorization BLOCKED until issues resolved`);
    return false;
  } else {
    console.log(`\n❌ PHASE 3.1 VALIDATION: FAILED`);
    console.log(`Critical functionality issues detected`);
    console.log(`❌ Phase 3.2 authorization BLOCKED - major refinement required`);
    return false;
  }
}

// Execute validation
validatePhase3_1Comprehensive().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error("Validation execution failed:", error);
  process.exit(1);
});
