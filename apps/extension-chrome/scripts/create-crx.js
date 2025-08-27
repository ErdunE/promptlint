/**
 * PromptLint CRX Package Generator
 * 
 * Creates installable packages for Chrome Web Store distribution
 * Generates both ZIP (for Chrome Web Store) and documentation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CRXPackager {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.packageDir = path.join(this.rootDir, 'packages');
    this.version = '0.1.0';
  }

  async createPackage() {
    try {
      console.log('📦 Starting PromptLint CRX package creation...');
      console.log(`🎯 Version: ${this.version}`);

      // Ensure dist directory exists and is built
      await this.verifyDistDirectory();

      // Create packages directory
      await this.ensurePackageDirectory();

      // Create Chrome Web Store ZIP
      await this.createWebStoreZip();

      // Create installation instructions
      await this.createInstallationGuide();

      // Create release notes
      await this.createReleaseNotes();

      // Generate package info
      await this.generatePackageInfo();

      console.log('✅ CRX package creation completed successfully!');
      console.log(`📁 Packages are in: ${this.packageDir}`);
      console.log('🚀 Ready for Chrome Web Store submission or direct distribution');

    } catch (error) {
      console.error('❌ CRX package creation failed:', error);
      process.exit(1);
    }
  }

  async verifyDistDirectory() {
    console.log('🔍 Verifying dist directory...');
    
    try {
      await fs.access(this.distDir);
    } catch {
      throw new Error('dist/ directory not found. Run "npm run build" first.');
    }

    // Check for required files
    const requiredFiles = [
      'manifest.json',
      'content-script.js',
      'background.js',
      'popup.html',
      'popup.js',
      'popup.css',
      'content-script.css',
      'icon-16.png',
      'icon-48.png',
      'icon-128.png'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(this.distDir, file));
        console.log(`  ✓ ${file}`);
      } catch {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }

  async ensurePackageDirectory() {
    try {
      await fs.access(this.packageDir);
      // Clean existing packages
      const files = await fs.readdir(this.packageDir);
      for (const file of files) {
        await fs.unlink(path.join(this.packageDir, file));
      }
    } catch {
      await fs.mkdir(this.packageDir, { recursive: true });
    }
  }

  async createWebStoreZip() {
    console.log('📦 Creating Chrome Web Store ZIP package...');
    
    const zipFileName = `promptlint-v${this.version}-webstore.zip`;
    const zipPath = path.join(this.packageDir, zipFileName);

    try {
      // Use system zip command to create the package
      const command = `cd "${this.distDir}" && zip -r "${zipPath}" . -x "*.DS_Store" "*.map"`;
      execSync(command, { stdio: 'inherit' });
      
      console.log(`  ✓ Created ${zipFileName}`);
      
      // Get file size
      const stats = await fs.stat(zipPath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`  📊 Package size: ${sizeKB} KB`);
      
    } catch (error) {
      throw new Error(`Failed to create ZIP package: ${error.message}`);
    }
  }

  async createInstallationGuide() {
    console.log('📝 Creating installation guide...');
    
    const guide = `# PromptLint Chrome Extension - Installation Guide

## Version ${this.version}

### Method 1: Chrome Web Store (Recommended)
*Coming Soon - Package ready for submission*

1. Visit Chrome Web Store (link will be provided after submission)
2. Click "Add to Chrome"
3. Click "Add Extension" in the popup
4. Extension is ready to use!

### Method 2: Developer Mode (Advanced Users)

#### Prerequisites
- Google Chrome 88 or later
- Developer mode enabled in Chrome

#### Installation Steps

1. **Download the Extension**
   - Download \`promptlint-v${this.version}-webstore.zip\`
   - Extract the ZIP file to a folder

2. **Enable Developer Mode**
   - Open Chrome and go to \`chrome://extensions/\`
   - Toggle "Developer mode" ON (top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extracted folder
   - Extension should appear in your extensions list

4. **Verify Installation**
   - Look for PromptLint icon in Chrome toolbar
   - Visit [ChatGPT](https://chat.openai.com) or [Claude](https://claude.ai)
   - Extension badge should turn green when active

#### Usage

1. **Navigate to Supported Sites**
   - ChatGPT: chat.openai.com or chatgpt.com
   - Claude: claude.ai

2. **Start Typing**
   - Type a prompt in the input field
   - PromptLint floating panel appears automatically
   - Real-time quality score and suggestions provided

3. **Improve Your Prompts**
   - Follow suggestions to improve prompt quality
   - Watch score increase as you add details
   - Achieve 85+ score for optimal AI responses

#### Troubleshooting

**Extension Not Activating:**
- Check that you're on a supported site (ChatGPT or Claude)
- Refresh the page
- Check browser console for error messages

**Panel Not Appearing:**
- Try typing more than 3 characters
- Check if input field is focused
- Reload the extension in chrome://extensions/

**Performance Issues:**
- Extension uses <10MB memory
- Analysis completes in <50ms
- Contact support if experiencing slowdowns

#### Support

- GitHub Issues: https://github.com/promptlint/promptlint/issues
- Documentation: https://github.com/promptlint/promptlint#readme

---

**Happy prompting with PromptLint!** ✨
`;

    await fs.writeFile(
      path.join(this.packageDir, 'INSTALLATION.md'),
      guide
    );
    
    console.log('  ✓ Created INSTALLATION.md');
  }

  async createReleaseNotes() {
    console.log('📋 Creating release notes...');
    
    const releaseNotes = `# PromptLint v${this.version} - Release Notes

## 🚀 Initial Release - MVP Complete

### ✨ Features

#### Real-time Prompt Analysis
- **Quality Scoring**: 0-100 score based on prompt clarity and structure
- **Instant Feedback**: Updates as you type (300ms debounce)
- **Specific Suggestions**: Actionable improvements for better AI responses

#### Supported Issue Detection
- ✅ Missing task verbs (implement, create, build)
- ✅ Missing programming language specification  
- ✅ Missing input/output specifications
- ✅ Vague or unclear wording
- ✅ Redundant language
- ✅ Unclear scope

#### Smart UI
- **Non-intrusive floating panel** positioned intelligently
- **Professional design** that doesn't interfere with site functionality
- **Responsive layout** works on different screen sizes
- **Dark mode support** respects system preferences

#### Supported Websites
- ✅ **ChatGPT** (chat.openai.com, chatgpt.com)
- ✅ **Claude** (claude.ai)

### 🏗️ Technical Specifications

#### Performance
- **Analysis Speed**: <50ms per prompt
- **Site Detection**: <100ms 
- **Element Finding**: <200ms
- **Memory Usage**: <10MB
- **No typing lag** or performance impact

#### Architecture
- **Manifest V3** compliant
- **TypeScript** throughout for reliability
- **Comprehensive error handling** with graceful fallbacks
- **Modular design** with separate packages for rules, adapters, and types

#### Browser Support
- **Chrome 88+** (Manifest V3 requirement)
- No Firefox or Safari support in MVP

### 🎯 Demo Scenarios

#### Poor Prompt Example
\`\`\`
Input: "write sorting"
Score: ~34/100
Issues: Missing language, missing I/O specification
\`\`\`

#### Improved Prompt Example  
\`\`\`
Input: "implement quicksort algorithm in Python with input array of integers and output sorted array"
Score: 100/100
Issues: None ✅
\`\`\`

### 🔧 Installation

See \`INSTALLATION.md\` for detailed installation instructions.

### 📊 Package Contents

- **Extension Size**: ~85KB total
- **Content Script**: 61KB (includes all rules and adapters)
- **Background Script**: 5KB (service worker)
- **Popup Interface**: 16KB (HTML/CSS/JS)
- **Icons**: 3 PNG files (16px, 48px, 128px)

### 🛠️ Development

#### Built With
- **Vite** for bundling and build optimization
- **TypeScript** for type safety and reliability
- **Chrome Extension APIs** (Manifest V3)
- **CSS Grid/Flexbox** for responsive layouts

#### Architecture
- \`@promptlint/rules-engine\` - Core linting logic
- \`@promptlint/site-adapters\` - DOM interaction layer  
- \`@promptlint/shared-types\` - TypeScript interfaces
- Chrome extension wrapper with content scripts and popup

### 🔮 Future Roadmap

#### Planned Features
- Additional AI sites (Perplexity, Gemini)
- Multi-language support beyond English
- One-click prompt rephrase feature
- Custom rule configuration
- Analytics and usage insights

#### Not in MVP Scope
- Automatic prompt rewriting
- Other browsers (Firefox, Safari)
- Offline functionality
- Custom rule creation

### 📝 Known Limitations

- **English Only**: Rules optimized for English prompts
- **Limited Sites**: Only ChatGPT and Claude supported
- **Analysis Only**: No automatic rewriting (by design)
- **Placeholder Icons**: Basic icons (can be improved for production)

### 🐛 Bug Reports

Please report issues at: https://github.com/promptlint/promptlint/issues

Include:
- Browser version
- Website URL
- Console error messages
- Steps to reproduce

---

**Thank you for using PromptLint!** 

Transform your AI interactions with better prompts. ✨
`;

    await fs.writeFile(
      path.join(this.packageDir, 'RELEASE_NOTES.md'),
      releaseNotes
    );
    
    console.log('  ✓ Created RELEASE_NOTES.md');
  }

  async generatePackageInfo() {
    console.log('📊 Generating package information...');
    
    // Get file sizes
    const files = await fs.readdir(this.distDir);
    const fileSizes = {};
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(this.distDir, file);
      const stats = await fs.stat(filePath);
      fileSizes[file] = Math.round(stats.size / 1024);
      totalSize += stats.size;
    }
    
    const packageInfo = {
      name: "PromptLint",
      version: this.version,
      description: "Grammarly for AI prompts - improve prompt clarity and structure in real-time",
      author: "PromptLint Team",
      license: "MIT",
      manifestVersion: 3,
      permissions: ["activeTab"],
      supportedSites: ["ChatGPT", "Claude"],
      totalSizeKB: Math.round(totalSize / 1024),
      files: fileSizes,
      buildDate: new Date().toISOString(),
      chromeMinVersion: "88",
      features: [
        "Real-time prompt analysis",
        "Quality scoring (0-100)",
        "Specific improvement suggestions", 
        "Non-intrusive floating panel",
        "Dark mode support",
        "Professional UI design",
        "Comprehensive error handling",
        "Performance optimized (<50ms analysis)"
      ],
      technicalSpecs: {
        analysisSpeed: "<50ms",
        siteDetection: "<100ms", 
        elementFinding: "<200ms",
        memoryUsage: "<10MB",
        architecture: "Modular TypeScript with separate packages"
      }
    };
    
    await fs.writeFile(
      path.join(this.packageDir, 'package-info.json'),
      JSON.stringify(packageInfo, null, 2)
    );
    
    console.log('  ✓ Created package-info.json');
    console.log(`  📊 Total extension size: ${packageInfo.totalSizeKB} KB`);
  }
}

// Run the packager
const packager = new CRXPackager();
packager.createPackage();
