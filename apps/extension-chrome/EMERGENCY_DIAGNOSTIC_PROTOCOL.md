# 🚨 EMERGENCY DIAGNOSTIC PROTOCOL - Level 5 v0.8.0.6

**Status:** PRODUCTION FAILURE INVESTIGATION IN PROGRESS  
**Priority:** P0 - BLOCKING ALL OTHER WORK

---

## 🔍 PRIORITY 1: GHOST TEXT VISIBILITY FAILURE

### Current Status
- ✅ Component initializes: `[PromptLint] Ghost text attached to element: DIV`
- ✅ Functionality runs: `[PromptLint] Ghost text functionality initialized`
- ❌ **NOT VISIBLE TO USERS** despite successful initialization

### Evidence Collected

**Ghost Text Implementation (main.ts:343-397):**
```typescript
private displayGhostText(element: HTMLElement, ghostText: string): void {
  const ghostElement = document.createElement('div');
  ghostElement.className = 'promptlint-ghost-text';
  ghostElement.textContent = ghostText;
  ghostElement.style.cssText = `
    position: fixed;
    color: #888;
    z-index: 10000;
    background: rgba(255, 255, 255, 0.95);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
  `;
  
  const rect = element.getBoundingClientRect();
  ghostElement.style.top = `${rect.bottom + window.scrollY + 8}px`;
  ghostElement.style.left = `${rect.left + window.scrollX}px`;
  
  document.body.appendChild(ghostElement);
  console.log('[PromptLint] Ghost text displayed:', ghostText.substring(0, 30) + '...');
}
```

### Hypothesis Matrix

| Issue | Probability | Evidence | Test Method |
|-------|------------|----------|-------------|
| Z-index too low | 🟡 MEDIUM | ChatGPT modals use z-index 1000+ | Run DEBUG_GHOST_TEXT.js |
| CSP blocking inline styles | 🔴 HIGH | 5+ CSP violations in console | Check computed styles |
| Wrong positioning | 🟡 MEDIUM | Uses fixed positioning | Verify getBoundingClientRect |
| Element removed too quickly | 🟢 LOW | 4 second timeout | Check MutationObserver |
| Ghost text generation failing | 🔴 HIGH | No actual ghost text content | Check generateGhostTextSuggestion |

### Diagnostic Commands

**Run in Chrome DevTools Console on ChatGPT:**
```javascript
// Load debug script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('DEBUG_GHOST_TEXT.js');
document.head.appendChild(script);

// Or paste contents of DEBUG_GHOST_TEXT.js directly
```

**Manual Test:**
```javascript
// Create test ghost text element manually
const test = document.createElement('div');
test.textContent = 'TEST GHOST TEXT';
test.style.cssText = `
  position: fixed;
  top: 100px;
  left: 100px;
  color: red;
  font-size: 30px;
  font-weight: bold;
  z-index: 999999;
  background: yellow;
  padding: 20px;
`;
document.body.appendChild(test);
// If this is visible, rendering works. If not, CSP or DOM issue.
```

### Required Evidence
1. Screenshot of Chrome DevTools Elements tab showing `.promptlint-ghost-text` element
2. Computed styles for ghost text element
3. Console output from DEBUG_GHOST_TEXT.js
4. Test ghost text visibility result

---

## 🔍 PRIORITY 2: CONFIDENCE DISPLAY 9500% BUG

### Current Status
- ❌ Displays: `9500%` 
- ✅ Should display: `95%`
- **ROOT CAUSE:** Double multiplication by 100

### Evidence Collection Required

**Search Pattern:** `confidence * 100`  
**Expected:** Should only happen ONCE in entire rendering chain

**Tracing Flow:**
```
InstructionAnalyzer (0.95) 
  → Level4AnalysisResult 
  → UI Component 
  → Display (95%)
```

**Bug Location Hunt:**
```bash
# Find ALL confidence percentage calculations
grep -rn "confidence.*100.*toFixed" apps/extension-chrome/src/
grep -rn "confidence.*\*.*100" apps/extension-chrome/src/
grep -rn "\.toFixed.*%\|%.*confidence" apps/extension-chrome/src/
```

### Hypothesis
**Double conversion occurring:**
1. Backend converts: `0.95 * 100 = 95`
2. Frontend converts again: `95 * 100 = 9500`

**OR:**

1. Template literal: `` `${confidence * 100}%` ``
2. CSS transform/scale multiplying again

### Fix Strategy
```typescript
// BEFORE (BROKEN):
const displayConfidence = `${confidence * 100 * 100}%`;

// AFTER (FIXED):
const displayConfidence = `${Math.round(confidence * 100)}%`;

// Add validation:
if (confidence > 1) {
  console.error('[PromptLint] Confidence value > 1 detected:', confidence);
  confidence = confidence / 100; // Assume already percentage
}
```

### Required Evidence
1. Exact code location performing percentage conversion
2. Console.log showing confidence value at each step
3. Screenshot showing 95% after fix
4. Unit test ensuring confidence <= 100%

---

## 🔍 PRIORITY 3: MEMORY CAPTURE UNDEFINED DATA

### Current Status
- ❌ Console: `generateResponseSummary: No response provided`
- ❌ `propertyId` is undefined
- **ROOT CAUSE:** Data pipeline receiving incomplete objects

### Evidence from Test
```javascript
[20:11:09] LOG: Testing memory capture with undefined propertyId
[20:11:09] FAIL: generateResponseSummary: No response provided
```

### Data Flow Trace Required
```
User Interaction 
  → provideUnifiedAssistance()
  → captureInteractionInMemory()
  → generateResponseSummary(response)
  → ❌ response is undefined/incomplete
```

### Debug Instrumentation
```typescript
// Add to captureInteractionInMemory
async captureInteractionInMemory(userInput: string, response: OrchestratedResponse): Promise<void> {
  console.log('[DEBUG] captureInteractionInMemory called with:', {
    userInput: userInput?.substring(0, 50),
    responseType: typeof response,
    responseKeys: response ? Object.keys(response) : 'null',
    hasTransparency: !!response?.transparency,
    hasConfidence: !!response?.confidence
  });
  
  // ... rest of method
}
```

### Required Evidence
1. Console output showing what data is actually passed to generateResponseSummary
2. Stack trace showing where undefined originates
3. Verification that multi-agent orchestration completes before memory capture
4. Screenshot of successful memory capture after fix

---

## 🔍 PRIORITY 4: CSP VIOLATIONS

### Current Status
- ❌ 5+ identical CSP violations
- ⚠️ Blocking inline event handlers
- **IMPACT:** May be preventing ghost text inline styles

### CSP Violation Message
```
Refused to execute inline event handler because it violates the following 
Content Security Policy directive: "script-src 'nonce-...' 'self' 'wasm-unsafe-eval'..."
```

### Audit Required
```bash
# Find all inline event handlers
grep -rn "onclick=\|onload=\|onerror=" apps/extension-chrome/src/
grep -rn "on[A-Z]" apps/extension-chrome/src/ | grep "="
```

### Fix Strategy
```typescript
// BEFORE (VIOLATES CSP):
element.innerHTML = `<button onclick="handleClick()">Click</button>`;

// AFTER (CSP COMPLIANT):
const button = document.createElement('button');
button.textContent = 'Click';
button.addEventListener('click', handleClick);
element.appendChild(button);
```

### Required Evidence
1. List of all inline event handlers found
2. Console showing 0 CSP violations after fix
3. Verification that ghost text styles are NOT blocked by CSP

---

## 📊 VALIDATION MATRIX

Before claiming ANY issue is "fixed", provide:

| Evidence Type | Ghost Text | Confidence | Memory | CSP |
|---------------|-----------|------------|--------|-----|
| Root Cause Identified | ⬜ | ⬜ | ⬜ | ⬜ |
| Code Location Found | ⬜ | ⬜ | ⬜ | ⬜ |
| Fix Implemented | ⬜ | ⬜ | ⬜ | ⬜ |
| Console Output Clean | ⬜ | ⬜ | ⬜ | ⬜ |
| Screenshot Proof | ⬜ | ⬜ | ⬜ | ⬜ |
| Unit Test Added | ⬜ | ⬜ | ⬜ | ⬜ |
| Integration Test Pass | ⬜ | ⬜ | ⬜ | ⬜ |
| User-Facing Validation | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 🎯 NEXT STEPS

### Immediate (Next 15 minutes)
1. Run DEBUG_GHOST_TEXT.js on ChatGPT with extension loaded
2. Search codebase for confidence percentage double conversion
3. Add debug logging to memory capture pipeline
4. Audit for inline event handlers

### Evidence Collection (Next 30 minutes)
1. Ghost text: DOM inspector screenshot + computed styles
2. Confidence: Grep output showing all `* 100` locations
3. Memory: Console output with debug instrumentation
4. CSP: List of violations and inline handlers

### Fix Implementation (Next 60 minutes)
1. Fix issues ONE AT A TIME with verification between each
2. Commit each fix separately with evidence
3. Rebuild and test after each commit
4. Document root cause for each issue

### Validation (Next 30 minutes)
1. Load extension on ChatGPT
2. Type "implement authentication"
3. Verify: Ghost text visible, confidence shows 95%, memory captures, no CSP errors
4. Repeat test on Claude.ai
5. Screenshot all passing validations

---

## 🚫 DO NOT PROCEED WITHOUT

1. ❌ Claiming fix without showing actual code change
2. ❌ Saying "should work" without runtime evidence
3. ❌ Fixing symptoms without identifying root cause
4. ❌ Moving to next issue before current one is validated
5. ❌ Submitting fixes without user-visible proof

---

**Total Estimated Time to Complete All 4 Priorities:** 2.5 hours  
**Current Status:** Evidence collection phase  
**Blocking:** All Level 5 development until resolved

