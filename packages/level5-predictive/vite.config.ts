import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Level5Predictive',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@promptlint/shared-types', '@promptlint/level5-memory'],
      output: {
        globals: {
          '@promptlint/shared-types': 'SharedTypes',
          '@promptlint/level5-memory': 'Level5Memory'
        }
      }
    },
    target: 'es2022',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@promptlint/shared-types': resolve(__dirname, '../shared-types/src'),
      '@promptlint/level5-memory': resolve(__dirname, '../level5-memory/src')
    }
  }
});
