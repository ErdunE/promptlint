import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-script/main.ts'),
        'background': resolve(__dirname, 'src/background/service-worker.ts'),
        'popup': resolve(__dirname, 'src/popup/popup.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    target: 'es2022',
    minify: 'esbuild'
  },
  plugins: [
    {
      name: 'copy-extension-files',
      generateBundle() {
        // 确保dist目录存在
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        
        // 复制manifest.json
        copyFileSync('src/assets/manifest.json', 'dist/manifest.json');
        
        // 复制popup.html
        copyFileSync('src/popup/popup.html', 'dist/popup.html');
        
        // 复制CSS文件
        copyFileSync('src/popup/popup.css', 'dist/popup.css');
        copyFileSync('src/styles/content-script.css', 'dist/content-script.css');
        copyFileSync('src/styles/floating-panel.css', 'dist/floating-panel.css');
        
        // 复制图标文件
        copyFileSync('src/assets/icon-24.png', 'dist/icon-24.png');
        
        // 从根目录复制其他图标
        copyFileSync('../../appicon/icon-16.png', 'dist/icon-16.png');
        copyFileSync('../../appicon/icon-48.png', 'dist/icon-48.png');
        copyFileSync('../../appicon/icon-128.png', 'dist/icon-128.png');
      }
    }
  ],
  resolve: {
    alias: {
      '@promptlint/rules-engine': resolve(__dirname, '../../packages/rules-engine/src'),
      '@promptlint/site-adapters': resolve(__dirname, '../../packages/site-adapters/src'),  
      '@promptlint/shared-types': resolve(__dirname, '../../packages/shared-types/src'),
      '@promptlint/contextual-intelligence': resolve(__dirname, '../../packages/contextual-intelligence/src'),
      '@promptlint/template-engine': resolve(__dirname, '../../packages/template-engine/src'),
      '@promptlint/llm-service': resolve(__dirname, '../../packages/llm-service/src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
