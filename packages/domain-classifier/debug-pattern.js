const pattern = /\b(implement|build|create|develop)\s+(algorithm|function|method|class|program|application)\b/i;
const prompt = 'implement binary search algorithm';

console.log('Pattern test:');
console.log('Pattern:', pattern);
console.log('Prompt:', prompt);

const match = pattern.exec(prompt);
console.log('Match:', match);
console.log('Match found:', !!match);

// Test with different variations
const variations = [
  'implement algorithm',
  'implement binary search algorithm',
  'implement a binary search algorithm',
  'implement the binary search algorithm'
];

console.log('\nTesting variations:');
variations.forEach(variation => {
  const result = pattern.exec(variation);
  console.log(`"${variation}": ${!!result}`);
});
