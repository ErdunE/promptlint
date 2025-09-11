import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DomainClassifier',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['@promptlint/shared-types'],
      output: {
        globals: {}
      }
    },
    target: 'es2022',
    minify: false
  }
});