# Changelog

All notable changes to PromptLint will be documented in this file.

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