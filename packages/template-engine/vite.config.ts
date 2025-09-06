import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TemplateEngine',
      formats: ['es'],
      fileName: 'template-engine'
    },
    rollupOptions: {
      external: ['@promptlint/shared-types', '@promptlint/domain-classifier'],
      output: {
        globals: {
          '@promptlint/shared-types': 'SharedTypes',
          '@promptlint/domain-classifier': 'DomainClassifier'
        }
      }
    },
    target: 'es2020'
  }
});
