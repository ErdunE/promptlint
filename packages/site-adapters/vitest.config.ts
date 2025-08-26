import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
