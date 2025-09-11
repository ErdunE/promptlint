/**
 * Test setup for context-memory package
 */

import { vi } from 'vitest';

// Mock Chrome APIs
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
} as any;

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test) Chrome/120.0.0.0 Safari/537.36',
  },
  writable: true,
});

// Mock Blob for storage size calculations
global.Blob = class MockBlob {
  size: number;
  
  constructor(parts: any[]) {
    this.size = JSON.stringify(parts).length;
  }
} as any;
