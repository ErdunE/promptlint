# Prompt Optimization Principles (Draft v1)

These principles define how PromptLint transforms user input into professional prompts.  
They act as the foundation of the tool’s behavior and guarantee that optimization remains faithful, clear, and actionable.

---

## 1. Faithfulness
- The optimized prompt must always preserve the original intent of the user.  
- No assumptions or fabricated details should be introduced (e.g., programming language, environment, data format).  
- Synonyms, rephrasing, or structural changes are allowed as long as meaning remains intact.  

---

## 2. Professional Rephrasing
- Casual or vague language should be transformed into **clear, structured, and professional expressions**.  
- Typical improvements include:
  - Explicit **Task** description  
  - Breaking down **Requirements**  
  - Standardized **Input/Output** description  
  - Indicating tone or style if relevant  

---

## 3. Structure First
- Optimized prompts should prioritize **lists, bullet points, and structured blocks** rather than long free-form paragraphs.  
- Example template:
  - Task:
  - Input:
  - Output:
  - Constraints:
---

## 4. Conciseness
- The optimized prompt must be **more concise and readable** than the original.  
- Avoid redundancy, filler words, or overly verbose explanations.  

---

## 5. Actionability
- Prompts should explicitly state **what the AI is expected to do**.  
- Optimization must remain within the information provided by the user; no new conditions should be invented.  

---

## 6. User Confirmation
- For ambiguous cases (e.g., missing language or unclear scope), the optimized prompt should **surface the ambiguity** and prompt the user to clarify, rather than assuming.  
- Example:  
- ✅ *“Task: Implement quicksort algorithm. (Please specify programming language if needed)”*  
- ❌ *“Implement quicksort in Python 3.10 with unit tests”* (assumed without user input).  

---

## ✅ In One Sentence
PromptLint only improves **clarity, structure, and professionalism** of prompts.  
It does **not** alter intent or invent new details.
