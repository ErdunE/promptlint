import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TemplateEngine',
      formats: ['es'],
      fileName: 'template-engine'
    },
    rollupOptions: {
      external: ['@promptlint/shared-types'],
      output: {
        globals: {
          '@promptlint/shared-types': 'SharedTypes'
        }
      }
    },
    target: 'es2020'
  }
});
