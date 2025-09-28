import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Level5Orchestration',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        '@promptlint/shared-types', 
        '@promptlint/level5-memory', 
        '@promptlint/level5-predictive'
      ],
      output: {
        globals: {
          '@promptlint/shared-types': 'PromptLintSharedTypes',
          '@promptlint/level5-memory': 'PromptLintLevel5Memory',
          '@promptlint/level5-predictive': 'PromptLintLevel5Predictive'
        }
      }
    }
  }
});
