/**
 * PromptLint Extension Packaging Script
 * 
 * Copies assets, builds the extension, and creates a distributable package
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ExtensionPackager {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.rootDir, 'src');
    this.distDir = path.join(this.rootDir, 'dist');
    this.assetsDir = path.join(this.srcDir, 'assets');
  }

  async package() {
    try {
      console.log('📦 Starting PromptLint extension packaging...');

      // Ensure dist directory exists
      await this.ensureDistDirectory();

      // Copy static assets
      await this.copyAssets();

      // Copy CSS files
      await this.copyStyles();

      // Copy HTML files
      await this.copyHtmlFiles();

      // Create simple icons (placeholder)
      await this.createIcons();

      console.log('✅ Extension packaging completed successfully!');
      console.log(`📁 Extension files are in: ${this.distDir}`);
      console.log('🔧 To test: Load unpacked extension from dist/ folder in Chrome');

    } catch (error) {
      console.error('❌ Extension packaging failed:', error);
      process.exit(1);
    }
  }

  async ensureDistDirectory() {
    try {
      await fs.access(this.distDir);
    } catch {
      await fs.mkdir(this.distDir, { recursive: true });
    }
  }

  async copyAssets() {
    console.log('📋 Copying manifest and assets...');
    
    // Copy manifest.json
    const manifestSrc = path.join(this.assetsDir, 'manifest.json');
    const manifestDest = path.join(this.distDir, 'manifest.json');
    await fs.copyFile(manifestSrc, manifestDest);
    
    console.log('  ✓ Copied manifest.json');
  }

  async copyStyles() {
    console.log('🎨 Copying CSS files...');
    
    const styleFiles = [
      { src: path.join(this.srcDir, 'styles', 'content-script.css'), dest: 'content-script.css' },
      { src: path.join(this.srcDir, 'styles', 'floating-panel.css'), dest: 'floating-panel.css' },
      { src: path.join(this.srcDir, 'popup', 'popup.css'), dest: 'popup.css' }
    ];

    for (const { src, dest } of styleFiles) {
      const destPath = path.join(this.distDir, dest);
      
      try {
        await fs.copyFile(src, destPath);
        console.log(`  ✓ Copied ${dest}`);
      } catch (error) {
        // If floating-panel.css doesn't exist separately, skip it
        if (dest === 'floating-panel.css') {
          console.log(`  ⚠ Skipped ${dest} (included in content-script.css)`);
        } else {
          throw error;
        }
      }
    }
  }

  async copyHtmlFiles() {
    console.log('📄 Copying HTML files...');
    
    const htmlFiles = [
      { src: path.join(this.srcDir, 'popup', 'popup.html'), dest: 'popup.html' }
    ];

    for (const { src, dest } of htmlFiles) {
      const destPath = path.join(this.distDir, dest);
      await fs.copyFile(src, destPath);
      console.log(`  ✓ Copied ${dest}`);
    }
  }

  async createIcons() {
    console.log('🎯 Copying prepared icon files...');
    
    const iconSizes = [16, 48, 128];
    
    for (const size of iconSizes) {
      const iconSrc = path.join(this.rootDir, '..', '..', 'appicon', `icon-${size}.png`);
      const iconDest = path.join(this.distDir, `icon-${size}.png`);
      
      try {
        await fs.copyFile(iconSrc, iconDest);
        console.log(`  ✓ Copied icon-${size}.png`);
      } catch (error) {
        console.error(`  ❌ Failed to copy icon-${size}.png:`, error.message);
        throw error;
      }
    }
  }
}

// Run the packager
const packager = new ExtensionPackager();
packager.package();
