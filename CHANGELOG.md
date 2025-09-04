# Changelog

All notable changes to PromptLint will be documented in this file.

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