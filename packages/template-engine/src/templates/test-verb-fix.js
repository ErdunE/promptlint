// Test script to verify verb matching fix
const testCases = [
  {
    prompt: "debugging authentication flow issues",
    verb: "debug",
    expected: "authentication flow issues"
  },
  {
    prompt: "implement a new feature",
    verb: "implement", 
    expected: "a new feature"
  },
  {
    prompt: "analyzing data trends",
    verb: "analyz",
    expected: "data trends"
  }
];

console.log('=== CURRENT BUGGY BEHAVIOR ===');
// Test current buggy logic (indexOf)
testCases.forEach(test => {
  const verbIndex = test.prompt.toLowerCase().indexOf(test.verb);
  if (verbIndex !== -1) {
    const afterVerb = test.prompt.substring(verbIndex + test.verb.length).trim();
    console.log(`Prompt: "${test.prompt}"`);
    console.log(`Expected: "${test.expected}"`);
    console.log(`Current Result: "${afterVerb}"`);
    console.log(`Status: ${afterVerb === test.expected ? 'PASS' : 'FAIL - BUG CONFIRMED'}`);
    console.log('---');
  }
});

console.log('\n=== FIXED BEHAVIOR ===');
// Test fixed regex logic
testCases.forEach(test => {
  const verbRegex = new RegExp(`\\b${test.verb}\\b`, 'i');
  const match = test.prompt.match(verbRegex);
  
  if (match && match.index !== undefined) {
    const afterVerb = test.prompt.substring(match.index + test.verb.length).trim();
    console.log(`Prompt: "${test.prompt}"`);
    console.log(`Expected: "${test.expected}"`);
    console.log(`Fixed Result: "${afterVerb}"`);
    console.log(`Status: ${afterVerb === test.expected ? 'PASS - BUG FIXED' : 'FAIL'}`);
    console.log('---');
  } else {
    console.log(`Prompt: "${test.prompt}" - No word boundary match found`);
    console.log('---');
  }
});
