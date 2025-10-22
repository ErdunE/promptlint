import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Level5Memory',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@promptlint/shared-types'],
      output: {
        globals: {
          '@promptlint/shared-types': 'SharedTypes'
        }
      }
    },
    target: 'es2022',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@promptlint/shared-types': resolve(__dirname, '../shared-types/src')
    }
  }
});
