import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSafeLocalStorage,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
} from '../utils/storage';
import {
  saveLocalFeedback,
  getLocalFeedbacks,
  LOCAL_FEEDBACK_STORAGE_KEY,
} from '../utils/feedback';
import { FeedbackItem } from '../types';

describe('Storage Safety & Exception Boundary Suite', () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;

  beforeEach(() => {
    // Create a mock Window with standard localStorage
    const mockStore: Record<string, string> = {};
    const mockStorage: Storage = {
      getItem: (k: string) => mockStore[k] || null,
      setItem: (k: string, v: string) => {
        mockStore[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStore[k];
      },
      clear: () => {
        Object.keys(mockStore).forEach((k) => delete mockStore[k]);
      },
      length: 0,
      key: (i: number) => Object.keys(mockStore)[i] || null,
    };

    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
      dispatchEvent: vi.fn(),
      CustomEvent: class CustomEvent {},
      location: new URL('https://computer-wiki.vercel.app/'),
    };
  });

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = originalWindow;
  });

  describe('getSafeLocalStorage', () => {
    it('should return window.localStorage when accessible', () => {
      const storage = getSafeLocalStorage();
      expect(storage).toBeDefined();
      expect(typeof storage?.getItem).toBe('function');
    });

    it('should catch SecurityError from localStorage getter and return null gracefully', () => {
      const win = (globalThis as unknown as { window: Record<string, unknown> }).window;
      Object.defineProperty(win, 'localStorage', {
        get: () => {
          const err = new Error(
            "SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document."
          );
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      expect(() => win.localStorage).toThrow('SecurityError');
      const safe = getSafeLocalStorage();
      expect(safe).toBeNull();
    });

    it('should return null when window is undefined (SSR safety)', () => {
      delete (globalThis as unknown as { window?: unknown }).window;
      expect(getSafeLocalStorage()).toBeNull();
    });
  });

  describe('safeGetItem, safeSetItem, safeRemoveItem', () => {
    it('should safely return null/false when storage throws SecurityError', () => {
      const win = (globalThis as unknown as { window: Record<string, unknown> }).window;
      Object.defineProperty(win, 'localStorage', {
        get: () => {
          const err = new Error('Access denied');
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      expect(safeGetItem('some_key')).toBeNull();
      expect(safeSetItem('some_key', 'val')).toBe(false);
      expect(safeRemoveItem('some_key')).toBe(false);
    });

    it('should safely read, write, and remove when storage is accessible', () => {
      expect(safeSetItem('test_sw_key', 'hello_world')).toBe(true);
      expect(safeGetItem('test_sw_key')).toBe('hello_world');
      expect(safeRemoveItem('test_sw_key')).toBe(true);
      expect(safeGetItem('test_sw_key')).toBeNull();
    });

    it('should gracefully handle QuotaExceededError in safeSetItem', () => {
      const quotaFailingStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          const err = new Error('Quota exceeded');
          err.name = 'QuotaExceededError';
          throw err;
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      } as unknown as Storage;

      const result = safeSetItem('test_quota', 'large_value', quotaFailingStorage);
      expect(result).toBe(false);
    });
  });

  describe('saveLocalFeedback with SecurityError boundary', () => {
    it('should return failure result instead of throwing uncaught SecurityError when storage getter throws', () => {
      const win = (globalThis as unknown as { window: Record<string, unknown> }).window;
      Object.defineProperty(win, 'localStorage', {
        get: () => {
          const err = new Error("SecurityError: Access is denied");
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      const item: FeedbackItem = {
        id: 'fb_security_test',
        type: 'bug',
        content: 'Testing error boundary',
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      // saveLocalFeedback must not evaluate window.localStorage in parameter defaults
      expect(() => {
        const res = saveLocalFeedback(item);
        expect(res.success).toBe(false);
        expect(res.error).toContain('Storage unavailable');
      }).not.toThrow();
    });

    it('should return empty list from getLocalFeedbacks when storage getter throws SecurityError', () => {
      const win = (globalThis as unknown as { window: Record<string, unknown> }).window;
      Object.defineProperty(win, 'localStorage', {
        get: () => {
          const err = new Error('Access is denied');
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      expect(() => {
        const feedbacks = getLocalFeedbacks();
        expect(feedbacks).toEqual([]);
      }).not.toThrow();
    });

    it('should reject non-array JSON objects in getLocalFeedbacks without crashing', () => {
      const store: Record<string, string> = {};
      const mockStorage: Storage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
        clear: () => {
          Object.keys(store).forEach((k) => delete store[k]);
        },
        length: 0,
        key: (i: number) => Object.keys(store)[i] || null,
      };

      // Corrupted storage containing an object instead of an array
      mockStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify({ error: 'not an array' }));
      const itemsObj = getLocalFeedbacks(mockStorage);
      expect(itemsObj).toEqual([]);

      // Corrupted storage containing a primitive string
      mockStorage.setItem(LOCAL_FEEDBACK_STORAGE_KEY, JSON.stringify("plain string"));
      const itemsStr = getLocalFeedbacks(mockStorage);
      expect(itemsStr).toEqual([]);

      // Array containing invalid items missing required fields
      mockStorage.setItem(
        LOCAL_FEEDBACK_STORAGE_KEY,
        JSON.stringify([
          { id: 'valid_1', type: 'bug', content: 'good', createdAt: '2026-09-04' },
          { id: 'invalid_missing_content', type: 'bug' },
          null,
          42,
        ])
      );
      const itemsFiltered = getLocalFeedbacks(mockStorage);
      expect(itemsFiltered).toHaveLength(1);
      expect(itemsFiltered[0].id).toBe('valid_1');
    });
  });
});
