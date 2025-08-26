/**
 * Test setup configuration for site-adapters
 */

import { vi, beforeEach } from 'vitest';

// Mock performance.now for consistent timing tests
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  },
  writable: true
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Setup DOM environment
beforeEach(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Clear DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset URL
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      hostname: 'localhost',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true
  });
  
  // Reset performance mock
  vi.mocked(performance.now).mockClear();
  vi.mocked(performance.now).mockReturnValue(0);
});
