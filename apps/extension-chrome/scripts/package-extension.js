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
    console.log('🎯 Creating PNG icon files...');
    
    const iconSizes = [16, 48, 128];
    
    for (const size of iconSizes) {
      const pngBuffer = this.generatePngIcon(size);
      const iconPath = path.join(this.distDir, `icon-${size}.png`);
      
      await fs.writeFile(iconPath, pngBuffer);
      console.log(`  ✓ Created icon-${size}.png`);
    }
  }

  generatePngIcon(size) {
    // Create a minimal PNG (1x1 transparent pixel)
    // This is a base64 encoded 1x1 transparent PNG
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==';
    return Buffer.from(pngBase64, 'base64');
  }

  generateIconSvg(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" fill="white" text-anchor="middle" dominant-baseline="central">✨</text>
</svg>`;
  }
}

// Run the packager
const packager = new ExtensionPackager();
packager.package();
