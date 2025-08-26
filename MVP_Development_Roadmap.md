# PromptLint MVP Development Roadmap

**Document Purpose:** Development priority guide to prevent scope creep and maintain focus during MVP phase.

**Last Updated:** 2025-08-25

---

## 🎯 MVP Phase: Package Development Priority

### **Priority 1: packages/shared-types/ (Foundation)**
**Why First:** All other packages depend on these type definitions. Defines the system's "contract".

**Key Deliverables:**
- `LintResult`, `LintIssue`, `RuleType` interfaces
- Extension UI component types  
- Site adapter configuration types
- API service interfaces

**Success Criteria:** Other packages can import types without circular dependencies.

---

### **Priority 2: packages/rules-engine/ (Core Value)**
**Why Second:** The heart of PromptLint. Pure TypeScript, easiest to develop and test.

**Key Deliverables:**
- 6 MVP lint rules:
  - `missing_task_verb`
  - `missing_language` 
  - `missing_io_specification`
  - `vague_wording`
  - `unclear_scope`
  - `redundant_language`
- `analyzePrompt(input: string): LintResult` function
- Comprehensive test suite
- Performance requirement: <50ms response time

**Success Criteria:** Can analyze prompts and return structured lint results locally.

---

### **Priority 3: packages/site-adapters/ (Integration Layer)**
**Why Third:** Extension needs to know how to interact with ChatGPT/Claude DOM.

**Key Deliverables:**
- ChatGPT DOM selectors and injection logic
- Claude DOM selectors and injection logic  
- Base adapter interface
- Fallback selector strategies

**Success Criteria:** Can reliably find input elements and inject UI on target sites.

---

### **Priority 4: apps/extension-chrome/ (User Interface)**
**Why Fourth:** Depends on all previous packages. Most complex due to Chrome APIs.

**Key Deliverables:**
- Content script with floating panel UI
- Background service worker (Manifest V3)
- Basic popup for settings/status
- CSS styling for professional appearance
- Chrome Web Store package

**Success Criteria:** Functional Chrome extension that shows lint results in real-time.

---

### **Priority 5: packages/llm-service/ (Enhancement Feature)**
**Why Last:** Rephrase functionality is enhancement, not core MVP requirement.

**Key Deliverables:**
- OpenAI API integration
- System prompt templates
- Error handling and rate limiting
- API key management

**Success Criteria:** Can generate 2-3 professional rephrase candidates while maintaining faithfulness.

---

## 📅 Suggested Development Timeline

```
Week 1: packages/shared-types/
        → Define all TypeScript interfaces
        → Establish data contracts between packages

Week 2: packages/rules-engine/  
        → Implement 6 core lint rules
        → Write comprehensive test suite
        → Validate <50ms performance requirement

Week 3: packages/site-adapters/
        → ChatGPT DOM adaptation
        → Claude DOM adaptation
        → Fallback strategies for DOM changes

Week 4: apps/extension-chrome/
        → Chrome extension framework
        → Content script + floating panel UI
        → Background service worker setup

Week 5: Integration & Testing
        → End-to-end functionality testing
        → Performance optimization
        → Chrome Web Store preparation

Week 6+: packages/llm-service/
        → Rephrase functionality (post-MVP)
        → API integration and error handling
```

---

## 🚨 Anti-Patterns to Avoid

### **Scope Creep Prevention:**
- ❌ **Don't** add new lint rules beyond the 6 MVP rules
- ❌ **Don't** work on VS Code or desktop apps yet
- ❌ **Don't** optimize for sites beyond ChatGPT/Claude  
- ❌ **Don't** build advanced UI features (sidebar, history, etc.)

### **Development Sequence Violations:**
- ❌ **Don't** start extension-chrome before rules-engine is complete
- ❌ **Don't** implement llm-service until core lint functionality works
- ❌ **Don't** skip shared-types - it prevents refactoring hell later

### **Quality Shortcuts:**
- ❌ **Don't** skip tests for rules-engine (it's the core value)
- ❌ **Don't** hardcode selectors without fallback strategies
- ❌ **Don't** ignore the <50ms performance requirement

---

## ✅ Progress Checkpoints

### **Milestone 1: Foundation Complete**
- [ ] shared-types package published internally
- [ ] All interfaces documented and stable
- [ ] Type-safe imports working across packages

### **Milestone 2: Core Logic Complete**  
- [ ] rules-engine passes all test cases from Product Spec
- [ ] Performance benchmarks met (<50ms)
- [ ] All 6 MVP rules implemented and tested

### **Milestone 3: Integration Ready**
- [ ] site-adapters working on ChatGPT and Claude
- [ ] DOM injection stable and non-intrusive
- [ ] Fallback strategies tested

### **Milestone 4: MVP Complete**
- [ ] Chrome extension installable and functional
- [ ] Real-time lint feedback working
- [ ] Professional UI that matches design principles
- [ ] Ready for initial user testing

### **Milestone 5: Enhanced MVP**
- [ ] Rephrase functionality working
- [ ] API key management secure
- [ ] Full feature set from Product Spec delivered

---

## 🎪 Current Focus Reminder

**RIGHT NOW:** Focus on `packages/shared-types/`

**Next Steps:**
1. Define `LintResult` interface structure
2. Define `LintIssue` types and severity levels  
3. Define rule type enums
4. Set up package.json and TypeScript config
5. Create initial exports and documentation

**Success Metric:** Other team members can import these types and understand the data flow without explanation.

---

## 🔄 When to Revisit This Document

- **Weekly:** Review progress against timeline
- **When confused:** Return to priority order
- **When tempted to add features:** Check against anti-patterns
- **Before starting new package:** Verify prerequisites are complete

**Remember:** MVP success is measured by delivering a working Chrome extension that provides real-time lint feedback for code generation prompts. Everything else is nice-to-have.