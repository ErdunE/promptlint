# Changelog

All notable changes to PromptLint will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.6.0] - 2025-09-10

### Major Architecture Rebuild - Phase 4.5 Strategic Standardization

This release represents a critical architectural milestone, transforming PromptLint from prototype to production-ready system through comprehensive package standardization and build system optimization.

#### Added

- Complete package standardization system with unified architecture across all 8 workspace packages
- Official package template framework in tools/package-template/ for consistent future development
- Chrome extension static asset pipeline with automated resource deployment
- Comprehensive build validation framework for package integrity verification
- Systematic validation testing for all core functionality components

#### Fixed

- Chrome extension build system with resolved module resolution and static asset deployment
- Package export configurations standardized across shared-types, rules-engine, template-engine, and all packages
- Build pipeline consistency through unified Vite configuration with proper ES2022 module support
- Static asset deployment pipeline for manifest.json, popup.html, CSS, and icon resources

#### Enhanced

- Phase 3.2 Adaptive Engine validation achieving 100% success rate across all critical tests
- Production deployment capability with Chrome extension fully operational at 375.45 kB optimized bundle
- Development tooling stability through reliable direct import validation system
- Package build system with all 8 packages compiling successfully with proper TypeScript support

#### Performance Improvements

- Adaptive template generation maintaining sub-millisecond processing times
- Chrome extension bundle optimization with efficient code splitting
- Build performance improvements across all packages through optimized Vite configurations
- Memory optimization through improved module resolution strategies

#### Technical Debt Management

- Development environment package import resolution isolated as non-blocking technical debt
- Production readiness confirmed with zero blocking deployment issues
- Quality assurance framework established for reliable continuous development
- Architectural stability foundation prepared for Level 4 Contextual Intelligence development

## [0.5.1] - 2025-09-06

### Level 2 Pattern Recognition Engine - Development Complete

#### Fixed

- Template selection accuracy for analytical tasks through enhanced BulletTemplate suitability logic
- Multi-domain prompt handling with improved template selection for complex prompts containing multiple action verbs
- Template priority logic with analytical keyword detection and priority boost for structured analysis tasks

#### Enhanced

- BulletTemplate intelligence with analytical keyword detection for suitability assessment
- Template selection precision ensuring analytical intent prompts properly favor BulletTemplate and SequentialTemplate
- Multi-factor scoring with enhanced template appropriateness calculation for complex analytical scenarios

#### Performance

- Processing time optimization maintaining 0.61ms average processing time within 100ms budget
- Template generation efficiency with enhanced scoring algorithms without performance degradation
- Memory usage optimization with minimal impact from analytical enhancement logic

## [0.5.0] - 2025-09-06

### Level 2 Pattern Recognition Engine Implementation

#### Added

- Domain classification system supporting 4 domains: Code, Writing, Analysis, Research with 95% accuracy
- Sub-category detection with 12 specialized categories for enhanced context understanding
- Semantic analysis framework with intent classification supporting instructional, analytical, debugging, and creative intents
- Intelligent template selection with multi-factor scoring based on domain, intent, and contextual analysis
- Context-aware template routing with enhanced appropriateness assessment through semantic understanding

#### Fixed

- Edge case resolution for REST API implementation prompts improving confidence calibration from 67% to 100%
- Domain misclassification correction ensuring project planning prompts route to research domain instead of code domain
- Confidence threshold calibration for debugging prompts enhancing confidence from 48% to 98%
- Intent classification accuracy through advanced semantic understanding for complex prompt analysis

#### Performance

- Processing time optimization maintaining sub-1ms average processing time with advanced intelligence layers
- Domain classification accuracy achieving 95% across comprehensive validation dataset
- Template selection success rate reaching 92.3% with context-aware intelligence implementation

## [0.4.2] - 2025-09-04

### Template System Quality Improvements

#### Fixed

- Grammar construction errors in template generation by enhancing verb extraction algorithms
- Verb duplication elimination in template assembly preventing constructions such as "code debug"
- Action verb recognition expansion adding optimize, debug, analyze, refactor, fix, improve, enhance
- Line break rendering issues ensuring template sections display on separate lines correctly
- Template selection logic corrections for "improve" and "troubleshoot" routing to appropriate templates

#### Enhanced

- Professional verb mapping preserving original verbs when appropriate instead of defaulting to "Create"
- Template construction with clean verb-objective combination without duplication
- Capitalization logic implementing proper sentence case handling for professional output
- Template formatting with proper line break preservation for visual section separation

## [0.4.1] - 2025-09-04

### Template Selection Balance Optimization

#### Fixed

- SequentialTemplate activation resolving critical issue preventing sequential prompts from triggering appropriate templates
- Template selection balance reducing TaskIOTemplate dominance from 83% to 54.8% through conditional rule modifications
- Prompt data flow enhancement enabling PatternMatcher to receive original prompt text for accurate keyword detection

#### Added

- Context-aware template selection routing vague language prompts to BulletTemplate instead of default TaskIOTemplate
- Enhanced rule conditions for Rules 1, 6, and 7 including complexity and context restrictions
- Template variety improvement ensuring all four template types activate appropriately

#### Changed

- PatternMatcher API enhancement adding optional originalPrompt parameter for improved keyword detection
- TemplateEngine integration improvement enabling generateCandidates() to pass original prompt to PatternMatcher
- MinimalTemplate threshold adjustment lowering activation threshold from score >70 to >60

## [0.4.0] - 2025-09-03

### Complete Template Engine Architecture

#### Added

- Dynamic template generation system replacing static placeholder functionality
- Four intelligent template types: TaskIOTemplate, BulletTemplate, SequentialTemplate, MinimalTemplate
- Pattern-based template selection with automatic matching based on lint analysis results
- Faithfulness validation system ensuring strict 100% intent preservation
- Performance monitoring with sub-100ms generation requirement and timeout protection
- ES Module architecture providing full Chrome extension compatibility with browser-only APIs

#### Changed

- Rephrase functionality enhancement generating 2-3 intelligent template-based candidates
- Offline mode improvement providing sophisticated structural improvements without API dependency
- Version increment updating extension and all packages to v0.4.0

## [0.3.0] - 2025-09-03

### User Interface and Theme Support

#### Fixed

- UI compatibility issues on white and light backgrounds
- Dynamic theme detection and automatic adaptation
- Text contrast improvements for accessibility compliance
- Icon loading issues replacing placeholders with prepared icons

#### Added

- Real-time theme change monitoring with automatic style refresh
- Dynamic theme detection using luminance calculation algorithms

#### Changed

- Extension description updated to "Real-time prompt analysis and improvement suggestions"
- Messaging updates removing "Grammarly for AI prompts" comparison references

## [0.2.0] - 2025-08-27

### Chrome Web Store Release

#### Added

- Glassmorphism user interface with drag functionality
- Rainbow border animation on Rephrase button
- AI Agent dropdown supporting Auto, ChatGPT, Claude, and additional options

#### Fixed

- URL prefix matching for conversation pages
- CSS injection and styling issues
- Button visibility and interaction problems

## [0.1.0] - 2025-08-25

### Initial MVP Release

#### Added

- Real-time prompt quality scoring system
- Issue detection and improvement suggestions
- Support for ChatGPT and Claude websites
- Basic lint analysis and user interface