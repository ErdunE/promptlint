# Changelog

All notable changes to PromptLint will be documented in this file.

## [0.4.2] - 2025-09-04

### Fixed
- **Grammar Construction Errors** - Fixed "Create [verb]" constructions by enhancing verb extraction
- **Verb Duplication** - Eliminated duplicate verbs in template assembly (e.g., "code debug")
- **Action Verb Recognition** - Added missing verbs: optimize, debug, analyze, refactor, fix, improve, enhance

### Enhanced
- **Professional Verb Mapping** - Preserve original verbs when appropriate instead of defaulting to "Create"
- **Template Construction** - Clean verb-objective combination without duplication
- **Capitalization Logic** - Proper sentence case handling for professional output

### Technical
- **Enhanced actionVerbs Array** - Extended verb detection for better extraction accuracy
- **Deduplication Logic** - Prevent verb repetition in TaskIOTemplate construction
- **Backward Compatibility** - All v0.4.1 template selection improvements maintained

## [0.4.1] - 2025-09-04

### Fixed
- **SequentialTemplate Activation** - Fixed critical issue where sequential prompts (e.g., "first...then...finally") were not triggering SequentialTemplate due to prompt data flow failure
- **Template Selection Balance** - Reduced TaskIOTemplate dominance from 83% to 54.8% through conditional rule modifications
- **Prompt Data Flow** - Enhanced PatternMatcher to receive original prompt text instead of placeholder for accurate keyword detection

### Added
- **Context-Aware Template Selection** - Vague language prompts now route to BulletTemplate instead of defaulting to TaskIOTemplate
- **Enhanced Rule Conditions** - Rules 1, 6, and 7 now include complexity and context restrictions to prevent TaskIOTemplate over-selection
- **Improved Template Variety** - All four template types (TaskIO, Bullet, Sequential, Minimal) now activate appropriately

### Changed
- **PatternMatcher API** - Added optional originalPrompt parameter to selectTemplates() method for better keyword detection
- **TemplateEngine Integration** - Enhanced generateCandidates() to pass original prompt to PatternMatcher
- **MinimalTemplate Threshold** - Lowered activation threshold from score >70 to >60 for improved well-structured prompt recognition

### Technical
- **Template Distribution Improved** - Achieved balanced template selection across all prompt categories
- **Sequential Detection Fixed** - hasSequentialKeywords() now receives actual prompt text instead of "prompt analysis" placeholder
- **Backward Compatibility Maintained** - Optional parameters preserve existing API contracts
- **Performance Preserved** - All template generation continues to meet <100ms requirement

### Validation Results
- SequentialTemplate: 0% → 100% activation rate for sequential prompts
- BulletTemplate: Consistent activation for vague language prompts
- TaskIOTemplate: Reduced from 83% dominance to balanced 54.8% usage
- MinimalTemplate: Improved activation for well-structured prompts
- Overall: All four template types now functional and appropriately balanced

## [0.4.0] - 2025-09-03

### Added
- **Complete Template Engine Architecture** - Dynamic template generation system replacing static placeholder functionality
- **4 Intelligent Template Types**:
  - TaskIOTemplate: Structured Task/Input/Output format for unclear prompts
  - BulletTemplate: Organized bullet point format for vague requirements  
  - SequentialTemplate: Numbered steps format for process-oriented tasks
  - MinimalTemplate: Basic cleanup and professional formatting
- **Pattern-Based Template Selection** - Automatic template matching based on lint analysis results
- **Faithfulness Validation System** - Strict 100% intent preservation with violation detection
- **Performance Monitoring** - <100ms generation requirement with timeout protection
- **ES Module Architecture** - Full Chrome extension compatibility with browser-only APIs

### Changed
- **Rephrase Functionality Enhanced** - Now generates 2-3 intelligent template-based candidates instead of static placeholders
- **Offline Mode Improved** - Template engine provides sophisticated structural improvements without API dependency
- **Version Bumped** - Extension and all packages updated to v0.4.0

### Technical
- Complete ES Module implementation across template engine (no CommonJS syntax)
- Browser-compatible APIs only (no Node.js dependencies in runtime)
- Vite build system optimized for Chrome extension environment
- Type-safe template generation with comprehensive TypeScript definitions
- Integration with existing rules-engine for intelligent template selection
- Graceful degradation strategies for API failures

### Performance
- Template generation completes within 100ms requirement
- Zero external API calls for template-based rephrasing
- Efficient pattern matching and candidate scoring system

## [0.3.0] - 2025-09-03

### Fixed
- Critical UI compatibility issue on white/light backgrounds  
- Panel now adapts automatically to light and dark themes
- Text contrast improved for accessibility compliance
- Issue indicator color differentiation (red → amber → blue)
- Icon loading issues - now uses prepared icons instead of placeholders

### Added  
- Dynamic theme detection using luminance calculation
- Real-time theme change monitoring  
- Automatic style refresh when themes switch

### Changed
- Extension description updated to "Real-time prompt analysis and improvement suggestions"
- Removed "Grammarly for AI prompts" comparison messaging

### Technical
- Implemented `detectLightTheme()` method
- Added MutationObserver for theme change detection
- Enhanced CSS injection with adaptive styling
- Fixed package-extension.js to copy real icons instead of generating 1x1 placeholders

## [0.2.0] - 2025-08-27
### Added
- Chrome Web Store release
- Glassmorphism UI with drag functionality
- Rainbow border animation on Rephrase button
- AI Agent dropdown (Auto/ChatGPT/Claude/etc.)

### Fixed
- URL prefix matching for conversation pages
- CSS injection and styling issues
- Button visibility and interaction problems

## [0.1.0] - 2025-08-25

### Added
- Initial MVP release
- Real-time prompt quality scoring
- Issue detection and suggestions
- Support for ChatGPT and Claude websites