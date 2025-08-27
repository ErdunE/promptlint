import { defineConfig } from 'vite';
import { resolve } from 'path';

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
  resolve: {
    alias: {
      '@promptlint/rules-engine': resolve(__dirname, '../../packages/rules-engine/src'),
      '@promptlint/site-adapters': resolve(__dirname, '../../packages/site-adapters/src'),  
      '@promptlint/shared-types': resolve(__dirname, '../../packages/shared-types/src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
