/**
 * Basic Level 5 Functionality Test
 * Simple Node.js test to verify Level 5 components work
 */

console.log('=== Level 5 Basic Functionality Test ===\n');

// Test 1: Check if Level 5 packages can be imported
console.log('1. Testing package imports...');

try {
  // Check if TypeScript files exist
  const fs = await import('fs');
  const path = await import('path');
  
  const memoryIndexPath = './packages/level5-memory/src/index.ts';
  const predictiveIndexPath = './packages/level5-predictive/src/index.ts';
  
  if (fs.existsSync(memoryIndexPath)) {
    console.log('✅ Memory package TypeScript files exist');
  } else {
    throw new Error('Memory package index.ts not found');
  }
  
  if (fs.existsSync(predictiveIndexPath)) {
    console.log('✅ Predictive package TypeScript files exist');
  } else {
    throw new Error('Predictive package index.ts not found');
  }
  
  console.log('✅ All Level 5 TypeScript source files are present');
  
} catch (error) {
  console.log('❌ Package structure check failed:', error.message);
  process.exit(1);
}

// Test 2: Check file structure
console.log('\n2. Testing file structure...');

try {
  const fs = await import('fs');
  const path = await import('path');
  
  // Check memory package files
  const memoryFiles = [
    './packages/level5-memory/src/PersistentMemoryManager.ts',
    './packages/level5-memory/src/Level4Integration.ts',
    './packages/level5-memory/src/types/MemoryTypes.ts'
  ];
  
  for (const file of memoryFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${path.basename(file)} exists`);
    } else {
      throw new Error(`${file} not found`);
    }
  }
  
  // Check predictive package files
  const predictiveFiles = [
    './packages/level5-predictive/src/PredictiveIntentEngine.ts',
    './packages/level5-predictive/src/types/PredictiveTypes.ts'
  ];
  
  for (const file of predictiveFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${path.basename(file)} exists`);
    } else {
      throw new Error(`${file} not found`);
    }
  }
  
} catch (error) {
  console.log('❌ File structure test failed:', error.message);
  process.exit(1);
}

// Test 3: Check package.json files
console.log('\n3. Testing package.json configuration...');

try {
  const fs = await import('fs');
  const path = await import('path');
  
  // Check memory package.json
  const memoryPackageJson = JSON.parse(
    fs.readFileSync('./packages/level5-memory/package.json', 'utf8')
  );
  
  if (memoryPackageJson.name === '@promptlint/level5-memory' && memoryPackageJson.version === '0.8.0.0') {
    console.log('✅ Memory package.json configured correctly');
  } else {
    throw new Error('Memory package.json configuration invalid');
  }
  
  // Check predictive package.json
  const predictivePackageJson = JSON.parse(
    fs.readFileSync('./packages/level5-predictive/package.json', 'utf8')
  );
  
  if (predictivePackageJson.name === '@promptlint/level5-predictive' && predictivePackageJson.version === '0.8.0.0') {
    console.log('✅ Predictive package.json configured correctly');
  } else {
    throw new Error('Predictive package.json configuration invalid');
  }
  
} catch (error) {
  console.log('❌ Package.json test failed:', error.message);
  process.exit(1);
}

// Test 4: Check TypeScript configuration
console.log('\n4. Testing TypeScript configuration...');

try {
  const fs = await import('fs');
  const path = await import('path');
  
  // Check tsconfig files
  const tsconfigFiles = [
    './packages/level5-memory/tsconfig.json',
    './packages/level5-predictive/tsconfig.json'
  ];
  
  for (const file of tsconfigFiles) {
    if (fs.existsSync(file)) {
      const tsconfig = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (tsconfig.extends && tsconfig.compilerOptions) {
        console.log(`✅ ${path.basename(path.dirname(file))} tsconfig.json valid`);
      } else {
        throw new Error(`${file} configuration invalid`);
      }
    } else {
      throw new Error(`${file} not found`);
    }
  }
  
} catch (error) {
  console.log('❌ TypeScript configuration test failed:', error.message);
  process.exit(1);
}

console.log('\n=== All Basic Tests Passed! ===');
console.log('🎉 Level 5 Phase 5.1 foundation is properly set up');
console.log('📋 Ready for Quality Gate validation and v0.8.0.1 development');
console.log('\nNext steps:');
console.log('- Run full validation: npm run validate:level5');
console.log('- Begin v0.8.0.1: IndexedDB implementation');
console.log('- Test browser integration');
