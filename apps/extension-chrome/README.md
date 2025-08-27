# PromptLint Chrome Extension

> **Grammarly for AI prompts** - Real-time prompt quality analysis for ChatGPT and Claude

## 🚀 Quick Start

### Installation for Testing

1. **Build the extension:**
   ```bash
   npm install
   npm run package
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" 
   - Select the `dist/` folder in this directory

3. **Test it:**
   - Navigate to [ChatGPT](https://chat.openai.com) or [Claude](https://claude.ai)
   - Start typing a prompt in the input field
   - See the PromptLint floating panel appear with real-time feedback!

## ✨ Features

### Real-time Analysis
- **Quality Scoring**: 0-100 score based on prompt clarity and structure
- **Specific Suggestions**: Actionable improvements for better AI responses
- **Instant Feedback**: Updates as you type (300ms debounce)

### Supported Issues Detection
- Missing task verbs (implement, create, build)
- Missing programming language specification
- Missing input/output specifications
- Vague or unclear wording
- Redundant language
- Unclear scope

### Smart UI
- **Non-intrusive floating panel** positioned intelligently
- **Professional design** that doesn't interfere with site functionality
- **Responsive layout** works on different screen sizes
- **Dark mode support** respects system preferences

### Robust Error Handling
- Graceful fallbacks when site DOM changes
- Automatic retry mechanisms
- Comprehensive error reporting
- Clean recovery from failures

## 🎯 Demo Scenario

1. **Poor Prompt:**
   ```
   "write sorting"
   ```
   - Score: ~34
   - Issues: Missing language, missing I/O specification

2. **Improved Prompt:**
   ```
   "implement quicksort algorithm in Python with input array of integers and output sorted array"
   ```
   - Score: 100
   - Issues: None ✅

## 🏗️ Architecture

### Core Components

- **Content Script** (`src/content-script/`)
  - Site detection and adapter integration
  - Input monitoring with debouncing
  - UI injection and management
  - Error handling and recovery

- **Background Service Worker** (`src/background/`)
  - Extension lifecycle management
  - Message handling between components
  - Error reporting and statistics
  - Badge updates and notifications

- **Popup Interface** (`src/popup/`)
  - Extension status and statistics
  - Error reporting and debugging
  - Manual controls and settings

### Dependencies

- **@promptlint/rules-engine**: Core linting logic
- **@promptlint/site-adapters**: DOM interaction with ChatGPT/Claude
- **@promptlint/shared-types**: TypeScript interfaces

## 🛠️ Development

### Build Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Complete packaging (build + copy assets)
npm run package
```

### Project Structure

```
apps/extension-chrome/
├── src/
│   ├── content-script/     # Main extension logic
│   │   ├── main.ts         # Entry point and initialization
│   │   ├── floating-panel.ts  # UI component for results
│   │   ├── input-monitor.ts    # Input field monitoring
│   │   ├── ui-injector.ts      # DOM injection management
│   │   └── error-handler.ts    # Comprehensive error handling
│   ├── background/
│   │   └── service-worker.ts   # Background service worker
│   ├── popup/
│   │   ├── popup.html      # Extension popup HTML
│   │   ├── popup.ts        # Popup functionality
│   │   └── popup.css       # Popup styling
│   ├── styles/
│   │   ├── content-script.css  # Base content styles
│   │   └── floating-panel.css  # Panel-specific styles
│   └── assets/
│       └── manifest.json   # Extension manifest
├── dist/                   # Built extension files
├── scripts/
│   └── package-extension.js    # Build automation
└── README.md
```

## 🎨 UI Design

### Floating Panel
- **Position**: Bottom-right of input area (configurable)
- **Content**: Quality score + issue list with descriptions
- **Behavior**: Auto-hide when no issues, show when problems detected
- **Style**: Professional, clean, non-disruptive

### Status Indicators
- **Green dot**: Extension active and working
- **Yellow dot**: Partially active (warnings)
- **Red dot**: Errors detected
- **Gray dot**: Inactive (unsupported site)

## 🔧 Configuration

### Manifest V3 Permissions
- `activeTab`: Access current tab for DOM interaction
- `host_permissions`: ChatGPT and Claude domains only

### Performance Settings
- **Input debounce**: 300ms (configurable)
- **Analysis timeout**: <50ms (rules-engine guarantee)
- **Site detection**: <100ms
- **Element finding**: <200ms

## 🧪 Testing

### Manual Testing Checklist

1. **Site Detection**
   - [ ] Activates on ChatGPT (chat.openai.com)
   - [ ] Activates on Claude (claude.ai)
   - [ ] Ignores other websites

2. **Input Monitoring**
   - [ ] Detects typing in input fields
   - [ ] Handles both textarea and contenteditable
   - [ ] Respects debounce timing

3. **Analysis & UI**
   - [ ] Shows quality scores accurately
   - [ ] Lists relevant issues
   - [ ] Updates in real-time
   - [ ] Panel positioning works correctly

4. **Error Handling**
   - [ ] Graceful fallbacks on DOM changes
   - [ ] Recovery from adapter failures
   - [ ] User-friendly error messages

5. **Performance**
   - [ ] No typing lag
   - [ ] Fast analysis (<50ms)
   - [ ] Smooth animations

## 🚀 Production Deployment

### Chrome Web Store Preparation

1. **Replace placeholder icons** with proper PNG files:
   - `icon-16.png` (16x16px)
   - `icon-48.png` (48x48px) 
   - `icon-128.png` (128x128px)

2. **Update manifest.json**:
   - Add proper description and author info
   - Set final version number
   - Add required Chrome Web Store fields

3. **Create store assets**:
   - Screenshots of the extension in action
   - Promotional images
   - Store description and privacy policy

### Build for Production

```bash
# Create production build
npm run package

# The dist/ folder contains the complete extension
# Zip this folder for Chrome Web Store upload
```

## 📝 Known Limitations

- **MVP Scope**: Only ChatGPT and Claude supported
- **English Only**: Rules optimized for English prompts
- **No Rephrase**: Analysis only, no automatic rewriting
- **Placeholder Icons**: SVG placeholders need PNG replacement

## 🔮 Future Enhancements

- Additional AI sites (Perplexity, Gemini)
- Multi-language support
- One-click prompt rephrase feature
- Custom rule configuration
- Analytics and usage insights

---

**Ready to improve your AI prompts? Install PromptLint and start getting better responses today!** ✨
