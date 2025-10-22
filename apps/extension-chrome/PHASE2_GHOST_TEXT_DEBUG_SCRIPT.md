# Phase 2: Ghost Text Debugging Instructions

## 🎯 Objective
Identify WHY ghost text is not visible despite successful initialization

## 📋 Prerequisites
- v0.8.0.7 extension loaded in Chrome
- ChatGPT or Claude.ai open
- Chrome DevTools open (F12)

---

## 🔧 Step 1: Run DEBUG_GHOST_TEXT.js

### Method A: Via Console
1. Open `apps/extension-chrome/DEBUG_GHOST_TEXT.js`
2. Copy entire contents
3. Paste into Chrome DevTools Console
4. Press Enter
5. Type "implement auth" in ChatGPT input
6. Capture ALL console output

### Method B: Via Extension
1. Load script as content script (if needed)
2. Refresh page
3. Check console for debug output

---

## 📊 Expected Debug Output

```javascript
=== GHOST TEXT DEBUGGING SUITE ===

[Test 1] Checking for ghost text elements in DOM...
Found X ghost text elements

Ghost Element 1:
- HTML: <div class="promptlint-ghost-text">...</div>
- Text Content: "authentication with JWT tokens"
- Computed Styles: {
    display: "block",
    visibility: "visible",
    opacity: "1",
    position: "fixed",
    zIndex: "10000",
    ...
  }

[Test 2] Checking for CSP violations...

[Test 3] Checking input elements...
Selector: textarea[placeholder*="message"] - Found: 1 elements

[Test 4] Creating test ghost text element...
✅ Test ghost text IS VISIBLE - rendering works

[Test 5] Checking for style conflicts...

[Test 6] Setting up MutationObserver...
✅ MutationObserver active - will log any new ghost text elements
```

---

## 🔍 What to Look For

### Scenario 1: Ghost Text Element EXISTS but INVISIBLE
**Symptoms:**
- Element found in DOM
- Computed display: "none" or visibility: "hidden"
- OR z-index being overridden

**Diagnosis:**
- CSS conflict with ChatGPT styles
- Z-index battle (ChatGPT modals > 10000)
- Position fixed being overridden

**Fix:** Increase z-index to 999999, add !important if needed

---

### Scenario 2: Ghost Text Element NEVER CREATED
**Symptoms:**
- "Found 0 ghost text elements"
- No MutationObserver logs
- Console shows "Ghost text displayed" but element missing

**Diagnosis:**
- generateGhostTextSuggestion returning null/empty
- provideUnifiedAssistance failing
- Element created but immediately removed

**Fix:** Add debug logging to generation pipeline (see below)

---

### Scenario 3: CSP BLOCKING Styles
**Symptoms:**
- Element exists but has no styles
- CSP violation in console
- Test ghost text also fails

**Diagnosis:**
- ChatGPT's CSP blocking inline styles
- Need to use CSS classes instead

**Fix:** Create stylesheet, apply classes instead of inline styles

---

### Scenario 4: Element Created OUTSIDE Viewport
**Symptoms:**
- Element exists with valid styles
- getBoundingClientRect shows weird position
- top/left values negative or huge

**Diagnosis:**
- Scroll position calculation wrong
- Input element rect being misread

**Fix:** Use fixed position relative to viewport, not page

---

## 🔬 Step 2: Add Enhanced Logging

If DEBUG_GHOST_TEXT.js doesn't reveal the issue, add this logging:

### File: `main.ts` - generateGhostTextSuggestion()

```typescript
private async generateGhostTextSuggestion(partialInput: string): Promise<string | null> {
  console.log('[DEBUG] ===== GHOST TEXT GENERATION START =====');
  console.log('[DEBUG] Input:', partialInput);
  console.log('[DEBUG] Input length:', partialInput.length);
  console.log('[DEBUG] Level5Experience exists:', !!this.level5Experience);
  
  if (!this.level5Experience) {
    console.error('[DEBUG] BLOCKED: No Level 5 experience');
    return null;
  }
  
  const context = {
    platform: window.location.hostname,
    url: window.location.href,
    ghostTextMode: true
  };
  console.log('[DEBUG] Context:', context);
  
  try {
    console.log('[DEBUG] Calling provideUnifiedAssistance...');
    const result = await this.level5Experience.provideUnifiedAssistance(partialInput, context);
    
    console.log('[DEBUG] Result received:', {
      hasResult: !!result,
      resultType: typeof result,
      hasPrimarySuggestion: !!result?.primarySuggestion,
      suggestionType: typeof result?.primarySuggestion,
      suggestionLength: result?.primarySuggestion?.length || 0,
      suggestionPreview: result?.primarySuggestion?.substring(0, 100) || '[EMPTY/NULL]',
      confidence: result?.confidence,
      fullResultKeys: result ? Object.keys(result) : []
    });
    
    const ghostText = result?.primarySuggestion || null;
    console.log('[DEBUG] Returning ghost text:', ghostText ? `"${ghostText.substring(0, 50)}..."` : 'NULL');
    console.log('[DEBUG] ===== GHOST TEXT GENERATION END =====');
    
    return ghostText;
  } catch (error) {
    console.error('[DEBUG] EXCEPTION:', error);
    console.error('[DEBUG] Stack:', error.stack);
    return null;
  }
}
```

### Rebuild and Test
```bash
npm run build
# Reload extension
# Type in input
# Check console for debug sequence
```

---

## 📝 Report Format

Please provide:

1. **Console Output**
   - Full DEBUG_GHOST_TEXT.js output
   - Full debug logging sequence
   - Any errors or warnings

2. **DOM Inspector**
   - Screenshot of Elements tab showing (or not showing) `.promptlint-ghost-text`
   - Computed styles if element exists
   - Position relative to input element

3. **Network Tab**
   - Any failed requests
   - Extension resources loading correctly

4. **Findings**
   - Which scenario matches (1-4 above)
   - Root cause hypothesis
   - Proposed fix

---

## ✅ Success Criteria

You've completed Phase 2 when you can answer:

- ✅ Does ghost text element get created? (Yes/No)
- ✅ If yes, is it visible in viewport? (Yes/No)
- ✅ If no, what's the DOM state? (Screenshot)
- ✅ Does generateGhostTextSuggestion return text? (Yes/No with value)
- ✅ If no, where does it fail? (Exact line/function)
- ✅ Are there CSP violations? (Yes/No with details)
- ✅ Does test ghost text render? (Yes/No)

---

## 🚀 Next Steps After Phase 2

Based on findings:
- **If rendering issue:** Fix z-index/positioning
- **If generation issue:** Fix provideUnifiedAssistance
- **If CSP issue:** Migrate to stylesheet approach
- **If timing issue:** Fix async/await chain

Do NOT proceed with fixes until you have concrete evidence of root cause.

