/**
 * Safe localStorage access wrappers that gracefully handle SecurityError,
 * QuotaExceededError, disabled storage, and SSR environments.
 */

export function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    // SecurityError: Access to Storage is denied in sandboxed iframe or restricted mode
    return null;
  }
}

export function safeGetItem(key: string, storage?: Storage | null): string | null {
  try {
    const s = storage !== undefined ? storage : getSafeLocalStorage();
    if (!s) return null;
    return s.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string, storage?: Storage | null): boolean {
  try {
    const s = storage !== undefined ? storage : getSafeLocalStorage();
    if (!s) return false;
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveItem(key: string, storage?: Storage | null): boolean {
  try {
    const s = storage !== undefined ? storage : getSafeLocalStorage();
    if (!s) return false;
    s.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
