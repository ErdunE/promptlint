# Level 5 Interactive Ghost Text UX - v0.9.0 Roadmap

**Status:** 📅 PLANNED (Post-v0.8.1)  
**Priority:** HIGH (User-Requested Feature)  
**Timeline:** 2-3 weeks after v0.8.1 production release  
**Estimated Effort:** 15-20 days  

---

## 🎯 Vision Statement

Transform ghost text from a **static suggestion display** into an **intelligent, interactive completion system** comparable to IDE autocomplete (VS Code IntelliSense, GitHub Copilot).

**User Problem Statement:**
> "Ghost text currently feels like placeholder text. It shows suggestions but doesn't integrate into the editing workflow. Users want keyboard shortcuts, multiple choices, and the ability to edit suggestions after acceptance."

---

## 📋 Feature Requirements

### 1. Keyboard Interaction ✨

**Current State:**
- Ghost text appears as gray overlay
- No way to accept suggestion via keyboard
- User must manually type the suggestion

**Target State:**
```
User types: "implement auth"
Ghost text shows: "→ entication with JWT tokens"

User presses: Tab or Enter
Result: Full text inserted into input field
```

**Implementation:**
- Listen for Tab/Enter keypress on input element
- Insert ghost text at cursor position
- Maintain undo history
- Preserve cursor position after insertion

**Technical Challenges:**
- ContentEditable cursor manipulation
- Undo/redo stack management
- ChatGPT's native keyboard shortcuts (avoid conflicts)
- Cross-browser compatibility

---

### 2. Multi-Suggestion Dropdown 🎨

**Current State:**
- Single suggestion displayed
- No visibility into alternatives
- No ranking or confidence indicators

**Target State:**
```
User types: "implement auth"

Dropdown appears:
┌─────────────────────────────────────────────┐
│ ✓ Implement authentication with JWT        │ 95% ⭐
│   Implement OAuth 2.0 authentication        │ 87%
│   Implement session-based authentication    │ 78%
│   Implement multi-factor authentication     │ 72%
└─────────────────────────────────────────────┘

Arrow keys: Navigate
Tab/Enter: Accept selected
Esc: Close dropdown
```

**Implementation:**
- Request multiple suggestions from `provideUnifiedAssistance()`
- Create dropdown UI component (absolute positioned div)
- Add keyboard navigation (Up/Down arrows)
- Show confidence scores with visual indicators
- Highlight selected suggestion

**Technical Challenges:**
- Positioning dropdown relative to cursor
- Handling dropdown outside viewport
- Styling without CSP violations
- Performance with many suggestions (limit to top 5)

---

### 3. Arrow Key Navigation ⌨️

**Current State:**
- No keyboard navigation
- Only mouse interaction possible

**Target State:**
```
User types: "implement auth"
Dropdown appears with 5 suggestions

↑ Up Arrow: Select previous suggestion
↓ Down Arrow: Select next suggestion
Tab/Enter: Accept selected suggestion
Esc: Cancel and hide dropdown
```

**Implementation:**
- Capture arrow key events on input element
- Prevent default behavior (cursor movement)
- Update dropdown selection highlight
- Preload selected suggestion text

**Technical Challenges:**
- Preventing ChatGPT's native arrow key behavior
- Restoring normal behavior when dropdown closed
- Accessibility (screen readers)

---

### 4. Inline Editing After Acceptance 📝

**Current State:**
- Suggestion inserted as plain text
- No indication of what was AI-generated
- Cannot easily undo or modify AI portion

**Target State:**
```
User accepts suggestion:
"Implement authentication with JWT tokens"

Text inserted with special formatting:
"Implement [authentication with JWT tokens]"
         ^-- Highlighted/editable region

User can:
- Edit AI-generated portion without affecting typed text
- Undo entire AI suggestion with Ctrl+Z
- Re-trigger suggestions within edited region
```

**Implementation:**
- Wrap inserted text in span with custom class
- Add temporary highlight (fades after 2 seconds)
- Track insertion in undo stack
- Allow re-triggering ghost text on edited portions

**Technical Challenges:**
- ContentEditable span manipulation
- Preventing ChatGPT from removing custom spans
- Undo/redo integration
- Visual design without being intrusive

---

## 🏗️ Technical Architecture

### Component Structure

```
GhostTextController
├── InputMonitor (existing)
│   └── Detects typing, triggers suggestions
├── SuggestionGenerator (existing)
│   └── Calls provideUnifiedAssistance()
├── 🆕 KeyboardHandler
│   ├── Tab/Enter acceptance
│   ├── Arrow key navigation
│   └── Esc cancellation
├── 🆕 DropdownManager
│   ├── Position calculation
│   ├── Suggestion rendering
│   ├── Selection highlighting
│   └── Confidence display
├── 🆕 TextInserter
│   ├── Cursor position management
│   ├── ContentEditable manipulation
│   ├── Undo stack integration
│   └── Highlight animation
└── DisplayManager (existing, enhanced)
    ├── Ghost text overlay
    └── Dropdown UI
```

---

## 📊 API Changes Required

### 1. Multi-Suggestion API

**Current:**
```typescript
interface UnifiedAssistanceResult {
  primarySuggestion: string;
  confidence: number;
  alternatives?: string[];  // Currently unused
}
```

**Required:**
```typescript
interface GhostTextSuggestion {
  text: string;
  confidence: number;
  reasoning: string;
  rank: number;
}

interface UnifiedAssistanceResult {
  primarySuggestion: string;
  confidence: number;
  alternatives: GhostTextSuggestion[];  // Top 5 ranked suggestions
  totalAlternatives: number;
}
```

---

### 2. Suggestion Ranking API

**New Method in UnifiedExperience:**
```typescript
async provideMultipleGhostTextSuggestions(
  partialInput: string,
  context: AssistanceContext,
  maxSuggestions: number = 5
): Promise<GhostTextSuggestion[]>
```

---

## 🎨 UI/UX Design

### Visual Design Mockup

```
┌─────────────────────────────────────────────────┐
│ ChatGPT Input Field                             │
│ User types: implement auth█                     │
│                                                  │
│ Ghost: → entication with JWT tokens             │ ← Light gray overlay
│                                                  │
│   ┌───────────────────────────────────────────┐ │
│   │ 💡 Suggestions (3)                        │ │ ← Dropdown
│   ├───────────────────────────────────────────┤ │
│   │ ⭐ Implement auth with JWT        95% ✓   │ │ ← Selected (blue bg)
│   │    Implement OAuth 2.0 auth       87%     │ │
│   │    Implement session auth         78%     │ │
│   └───────────────────────────────────────────┘ │
│                                                  │
│ Hint: Tab/↵ accept • ↑↓ navigate • Esc cancel  │ ← Helper text
└─────────────────────────────────────────────────┘
```

**Color Scheme:**
- Ghost text: `rgba(150, 150, 150, 0.6)` (light gray)
- Dropdown background: `rgba(30, 30, 30, 0.95)` (dark semi-transparent)
- Selected item: `rgba(0, 120, 215, 0.3)` (blue highlight)
- Confidence indicator: Green (>80%) / Yellow (60-80%) / Gray (<60%)

---

## 🚧 Implementation Plan

### Phase 1: Keyboard Acceptance (Week 1)
**Goal:** Tab/Enter to accept current ghost text

**Tasks:**
- [ ] Add keyboard event listener to input element
- [ ] Detect Tab/Enter keypress (prevent default)
- [ ] Insert ghost text at cursor position
- [ ] Handle ContentEditable cursor management
- [ ] Add undo stack entry
- [ ] Test on ChatGPT and Claude.ai

**Success Criteria:**
- User can accept ghost text with Tab
- Cursor positioned at end of inserted text
- Ctrl+Z undoes insertion

---

### Phase 2: Multi-Suggestion Backend (Week 1-2)
**Goal:** Generate 5 ranked suggestions instead of 1

**Tasks:**
- [ ] Extend `provideUnifiedAssistance` to return multiple suggestions
- [ ] Implement ranking algorithm based on:
  - Confidence scores from agents
  - Pattern recognition frequency
  - User historical preferences
- [ ] Add API for requesting N suggestions
- [ ] Validate performance impact (<150ms budget)

**Success Criteria:**
- API returns 5 diverse suggestions
- Ranked by relevance and confidence
- Performance within budget

---

### Phase 3: Dropdown UI (Week 2)
**Goal:** Visual dropdown showing multiple suggestions

**Tasks:**
- [ ] Create dropdown component (absolute positioned div)
- [ ] Calculate position relative to cursor
- [ ] Render suggestion list with confidence scores
- [ ] Add visual indicators (stars, percentages)
- [ ] Handle viewport boundary cases
- [ ] Style with gradients and shadows (no CSP violations)
- [ ] Add animation (fade in/out)

**Success Criteria:**
- Dropdown appears below cursor
- Shows 5 suggestions with confidence
- Responsive to window resize
- Accessible (ARIA labels)

---

### Phase 4: Arrow Key Navigation (Week 2-3)
**Goal:** Navigate suggestions with keyboard

**Tasks:**
- [ ] Capture Up/Down arrow key events
- [ ] Prevent default cursor movement when dropdown open
- [ ] Update selection highlight
- [ ] Preload selected suggestion to ghost text overlay
- [ ] Handle Esc key to close dropdown
- [ ] Restore normal arrow behavior when closed

**Success Criteria:**
- Arrow keys navigate dropdown
- Selected suggestion shows in ghost text
- Esc closes dropdown
- No conflict with ChatGPT shortcuts

---

### Phase 5: Inline Editing (Week 3)
**Goal:** Highlight and allow editing of inserted text

**Tasks:**
- [ ] Wrap inserted text in span with custom class
- [ ] Add temporary highlight (2 second fade)
- [ ] Track insertion in undo history
- [ ] Allow re-triggering suggestions on edited text
- [ ] Test span persistence with ChatGPT's DOM manipulation

**Success Criteria:**
- Inserted text has subtle highlight
- Highlight fades after 2 seconds
- Undo removes entire insertion
- User can edit AI-generated portion

---

## 🧪 Testing Strategy

### Unit Tests
- Keyboard event handling (Tab, Enter, Arrow keys, Esc)
- Dropdown position calculation
- Suggestion ranking algorithm
- Text insertion at cursor position
- Undo stack management

### Integration Tests
- Full flow: Type → Suggestions → Navigate → Accept → Edit
- Cross-platform (ChatGPT, Claude.ai)
- Cross-browser (Chrome, Edge, Firefox)
- Performance under load (rapid typing)

### User Acceptance Tests
- Can user efficiently accept suggestions?
- Is dropdown discoverable?
- Are keyboard shortcuts intuitive?
- Does inline editing feel natural?
- Any conflicts with platform shortcuts?

---

## ⚠️ Risk Assessment

### High Risk
1. **ChatGPT DOM Interference**
   - ChatGPT may remove our custom spans/classes
   - **Mitigation:** Use MutationObserver to restore elements

2. **Keyboard Shortcut Conflicts**
   - Tab/Enter may conflict with native behavior
   - **Mitigation:** Only intercept when dropdown visible

3. **Performance Degradation**
   - Generating 5 suggestions may exceed 150ms budget
   - **Mitigation:** Cache suggestions, use debouncing

### Medium Risk
1. **ContentEditable Cursor Issues**
   - Cursor position may be unpredictable
   - **Mitigation:** Extensive testing, fallback to append

2. **Cross-Platform Inconsistency**
   - Different platforms may have different DOM structures
   - **Mitigation:** Abstract DOM manipulation layer

### Low Risk
1. **CSP Violations**
   - Dropdown styling may trigger violations
   - **Mitigation:** Use programmatic styles, no inline

---

## 📏 Success Metrics

### Quantitative
- **Acceptance Rate:** >50% of ghost text suggestions accepted
- **Dropdown Usage:** >30% of users navigate suggestions
- **Performance:** <150ms generation time for 5 suggestions
- **Error Rate:** <1% keyboard interaction failures

### Qualitative
- User feedback: "Feels like Copilot"
- Support tickets: <5 keyboard conflict reports
- User testing: 8/10 users prefer interactive mode

---

## 🔄 Iteration Plan

### MVP (v0.9.0)
- Tab/Enter acceptance
- Multi-suggestion dropdown
- Arrow key navigation
- Basic inline highlight

### Future Enhancements (v0.9.1+)
- Custom keyboard shortcuts (user configurable)
- Suggestion history/favorites
- Context-aware suggestion templates
- Real-time suggestion updates as user types
- Integration with memory system for personalized suggestions
- Fuzzy matching for partial acceptance

---

## 🚀 Launch Criteria

**v0.9.0 CANNOT be released until:**
- [✅] v0.8.1 production stable for 2+ weeks
- [✅] Memory capture working (provides diverse suggestions)
- [✅] Performance validated (<150ms)
- [✅] All Phase 1-5 tasks completed
- [✅] Unit tests pass (>90% coverage)
- [✅] Integration tests pass on ChatGPT and Claude.ai
- [✅] User acceptance testing with 10+ users
- [✅] Documentation complete
- [✅] No CSP violations
- [✅] No keyboard conflicts reported

---

## 📚 User Documentation Required

### For End Users
1. **Quick Start Guide:** "How to use interactive ghost text"
2. **Keyboard Shortcuts Reference Card**
3. **Video Tutorial:** "Accepting and navigating suggestions"
4. **FAQ:** "Why don't suggestions appear sometimes?"

### For Developers
1. **Architecture Documentation:** Component interaction diagram
2. **API Reference:** `provideMultipleGhostTextSuggestions()`
3. **Testing Guide:** How to test keyboard interactions
4. **Troubleshooting:** Common issues and solutions

---

## 💡 User Feedback Integration

**Original User Request (Chinese):**
> "建议后续支持：
> - Tab/Enter 接受建议
> - 多建议下拉选择
> - 插入后可编辑内容
> - 加强与编辑框的交互性"

**Translation & Interpretation:**
- ✅ Tab/Enter acceptance → Phase 1
- ✅ Multi-suggestion dropdown → Phase 2-3
- ✅ Editable after insertion → Phase 5
- ✅ Enhanced interactivity → All phases

**All user-requested features are included in this roadmap.**

---

## 🎯 Technical Assessment

**Why defer to v0.9.0?**
1. **Foundation First:** v0.8.1 must stabilize core features (memory, transparency)
2. **Complexity:** Interactive UX requires 15-20 days of focused development
3. **Risk Management:** Don't introduce new features while fixing critical bugs
4. **User Trust:** Deliver stable v0.8.1 first, then enhance UX

**User feedback is excellent and will be implemented**, but in the correct architectural sequence.

---

**Status:** 📅 **ROADMAP APPROVED - AWAITING v0.8.1 COMPLETION**

**Next Review:** After v0.8.1 production release (estimated Week 3)

