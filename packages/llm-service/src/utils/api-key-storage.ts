/**
 * PromptLint API Key Storage
 * 
 * Secure local storage for OpenAI API keys with encryption
 * Works in both browser (Chrome extension) and Node.js environments
 */

import { IApiKeyStorage } from '@promptlint/shared-types';

// Type declarations for Chrome extension APIs (when available)
declare global {
  const chrome: {
    storage?: {
      local: {
        get(keys: string | string[]): Promise<{[key: string]: any}>;
        set(items: {[key: string]: any}): Promise<void>;
        remove(keys: string | string[]): Promise<void>;
      };
    };
  } | undefined;
}

/**
 * Simple encryption/decryption using browser crypto API or Node.js crypto
 */
class SimpleCrypto {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;

  /**
   * Generate a key from a password
   */
  private static async deriveKey(password: string): Promise<any> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('promptlint-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt text with a password
   */
  static async encrypt(text: string, password: string): Promise<string> {
    const key = await this.deriveKey(password);
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      encoder.encode(text)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt text with a password
   */
  static async decrypt(encryptedText: string, password: string): Promise<string> {
    const key = await this.deriveKey(password);
    
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }
}

/**
 * Browser-based API key storage using Chrome extension storage
 */
export class ChromeExtensionApiKeyStorage implements IApiKeyStorage {
  private static readonly STORAGE_KEY = 'promptlint_api_key';
  private static readonly DEVICE_ID_KEY = 'promptlint_device_id';

  /**
   * Get or create device-specific encryption key
   */
  private async getDeviceKey(): Promise<string> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new Error('Chrome extension storage not available');
    }

    const result = await chrome.storage.local.get(ChromeExtensionApiKeyStorage.DEVICE_ID_KEY);
    
    if (result[ChromeExtensionApiKeyStorage.DEVICE_ID_KEY]) {
      return result[ChromeExtensionApiKeyStorage.DEVICE_ID_KEY];
    }

    // Generate new device ID
    const deviceId = crypto.randomUUID();
    await chrome.storage.local.set({
      [ChromeExtensionApiKeyStorage.DEVICE_ID_KEY]: deviceId
    });

    return deviceId;
  }

  /**
   * Store API key securely
   */
  async store(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }

    if (!chrome?.storage?.local) {
      throw new Error('Chrome extension storage not available');
    }

    const deviceKey = await this.getDeviceKey();
    const encryptedKey = await SimpleCrypto.encrypt(apiKey, deviceKey);

    await chrome.storage.local.set({
      [ChromeExtensionApiKeyStorage.STORAGE_KEY]: encryptedKey
    });
  }

  /**
   * Retrieve stored API key
   */
  async retrieve(): Promise<string | null> {
    if (!chrome?.storage?.local) {
      return null;
    }

    const result = await chrome.storage.local.get(ChromeExtensionApiKeyStorage.STORAGE_KEY);
    const encryptedKey = result[ChromeExtensionApiKeyStorage.STORAGE_KEY];

    if (!encryptedKey) {
      return null;
    }

    try {
      const deviceKey = await this.getDeviceKey();
      return await SimpleCrypto.decrypt(encryptedKey, deviceKey);
    } catch (error) {
      console.error('[PromptLint] Failed to decrypt API key:', error);
      // If decryption fails, remove the corrupted key
      await this.remove();
      return null;
    }
  }

  /**
   * Remove stored API key
   */
  async remove(): Promise<void> {
    if (!chrome?.storage?.local) {
      return;
    }
    await chrome.storage.local.remove(ChromeExtensionApiKeyStorage.STORAGE_KEY);
  }

  /**
   * Check if API key is stored
   */
  async hasKey(): Promise<boolean> {
    if (!chrome?.storage?.local) {
      return false;
    }
    const result = await chrome.storage.local.get(ChromeExtensionApiKeyStorage.STORAGE_KEY);
    return !!result[ChromeExtensionApiKeyStorage.STORAGE_KEY];
  }
}

/**
 * Node.js-based API key storage using local file system
 */
export class LocalFileApiKeyStorage implements IApiKeyStorage {
  private static readonly STORAGE_FILE = '.promptlint-api-key';
  private static readonly DEVICE_ID_FILE = '.promptlint-device-id';

  /**
   * Get storage directory
   */
  private getStorageDir(): string {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), '.promptlint');
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    const fs = require('fs').promises;
    const storageDir = this.getStorageDir();

    try {
      await fs.access(storageDir);
    } catch {
      await fs.mkdir(storageDir, { recursive: true });
    }
  }

  /**
   * Get or create device-specific encryption key
   */
  private async getDeviceKey(): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');
    
    await this.ensureStorageDir();
    const deviceIdPath = path.join(this.getStorageDir(), LocalFileApiKeyStorage.DEVICE_ID_FILE);

    try {
      const deviceId = await fs.readFile(deviceIdPath, 'utf8');
      return deviceId.trim();
    } catch {
      // Generate new device ID
      const crypto = require('crypto');
      const deviceId = crypto.randomUUID();
      await fs.writeFile(deviceIdPath, deviceId, { mode: 0o600 });
      return deviceId;
    }
  }

  /**
   * Store API key securely
   */
  async store(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
    }

    const fs = require('fs').promises;
    const path = require('path');

    await this.ensureStorageDir();
    const deviceKey = await this.getDeviceKey();
    const encryptedKey = await SimpleCrypto.encrypt(apiKey, deviceKey);
    const keyPath = path.join(this.getStorageDir(), LocalFileApiKeyStorage.STORAGE_FILE);

    await fs.writeFile(keyPath, encryptedKey, { mode: 0o600 });
  }

  /**
   * Retrieve stored API key
   */
  async retrieve(): Promise<string | null> {
    const fs = require('fs').promises;
    const path = require('path');
    const keyPath = path.join(this.getStorageDir(), LocalFileApiKeyStorage.STORAGE_FILE);

    try {
      const encryptedKey = await fs.readFile(keyPath, 'utf8');
      const deviceKey = await this.getDeviceKey();
      return await SimpleCrypto.decrypt(encryptedKey, deviceKey);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      
      console.error('[PromptLint] Failed to decrypt API key:', error);
      // If decryption fails, remove the corrupted key
      await this.remove();
      return null;
    }
  }

  /**
   * Remove stored API key
   */
  async remove(): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    const keyPath = path.join(this.getStorageDir(), LocalFileApiKeyStorage.STORAGE_FILE);

    try {
      await fs.unlink(keyPath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Check if API key is stored
   */
  async hasKey(): Promise<boolean> {
    const fs = require('fs').promises;
    const path = require('path');
    const keyPath = path.join(this.getStorageDir(), LocalFileApiKeyStorage.STORAGE_FILE);

    try {
      await fs.access(keyPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Memory-based API key storage (for testing)
 */
export class MemoryApiKeyStorage implements IApiKeyStorage {
  private apiKey: string | null = null;

  async store(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
  }

  async retrieve(): Promise<string | null> {
    return this.apiKey;
  }

  async remove(): Promise<void> {
    this.apiKey = null;
  }

  async hasKey(): Promise<boolean> {
    return this.apiKey !== null;
  }
}

/**
 * Factory function to create appropriate storage based on environment
 */
export function createApiKeyStorage(): IApiKeyStorage {
  // Check if we're in a Chrome extension environment
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new ChromeExtensionApiKeyStorage();
  }
  
  // Check if we're in Node.js
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return new LocalFileApiKeyStorage();
  }
  
  // Fallback to memory storage (mainly for testing)
  console.warn('[PromptLint] Using memory-based API key storage - keys will not persist');
  return new MemoryApiKeyStorage();
}

/**
 * API key validation utilities
 */
export class ApiKeyValidator {
  /**
   * Validate OpenAI API key format
   */
  static validateOpenAIKey(apiKey: string): { valid: boolean; error?: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'API key cannot be empty' };
    }

    const trimmedKey = apiKey.trim();

    // Check format: should start with 'sk-' and be 51 characters total
    if (!trimmedKey.startsWith('sk-')) {
      return { valid: false, error: 'OpenAI API key must start with "sk-"' };
    }

    if (trimmedKey.length !== 51) {
      return { valid: false, error: 'OpenAI API key must be 51 characters long' };
    }

    // Check that it only contains valid characters (alphanumeric)
    const validChars = /^sk-[A-Za-z0-9]{48}$/;
    if (!validChars.test(trimmedKey)) {
      return { valid: false, error: 'OpenAI API key contains invalid characters' };
    }

    return { valid: true };
  }

  /**
   * Mask API key for display (show first 7 and last 4 characters)
   */
  static maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 11) {
      return '***';
    }

    const start = apiKey.substring(0, 7);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(Math.max(0, apiKey.length - 11));

    return `${start}${middle}${end}`;
  }
}
