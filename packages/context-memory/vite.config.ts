import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'ContextMemory',
      fileName: (format) => `context-memory.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@promptlint/shared-types',
        '@promptlint/template-engine'
      ],
      output: {
        globals: {
          '@promptlint/shared-types': 'SharedTypes',
          '@promptlint/template-engine': 'TemplateEngine'
        },
      },
    },
    target: 'es2022',
    sourcemap: true,
  },
});
