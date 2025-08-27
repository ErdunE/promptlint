import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@promptlint/shared-types': path.resolve(__dirname, '../shared-types/src/index.ts')
    }
  }
});
