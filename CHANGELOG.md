# Changelog

All notable changes to PromptLint will be documented in this file.

## [0.3.0] - 2025-09-02

### Fixed
- Critical UI compatibility issue on white/light backgrounds
- Panel now adapts automatically to light and dark themes
- Text contrast improved for accessibility compliance

### Added  
- Dynamic theme detection using luminance calculation
- Real-time theme change monitoring
- Automatic style refresh when themes switch

### Technical
- Implemented `detectLightTheme()` method
- Added MutationObserver for theme change detection
- Enhanced CSS injection with adaptive styling

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