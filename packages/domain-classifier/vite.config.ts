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
      name: 'DomainClassifier',
      formats: ['es'],
      fileName: 'domain-classifier'
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
