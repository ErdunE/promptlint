import { HybridClassifier } from "../packages/domain-classifier/src/classification/HybridClassifier.js";

async function validate() {
  const classifier = new HybridClassifier();
  await classifier.initialize();

  const prompts = [
    "compose email to stakeholders",
    "assess customer satisfaction scores",
    "explore agile methodology",
    "write blog post about productivity",
    "analyze market trends data",
    "research best practices for security",
    "implement binary search algorithm"
  ];

  for (const prompt of prompts) {
    const result = await classifier.classify(prompt);
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`→ Domain: ${result.domain}`);
    console.log(`→ Confidence: ${result.confidence}`);
    console.log("─".repeat(50));
  }
}

validate();