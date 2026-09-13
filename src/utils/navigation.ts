import { ActiveTab, HardwareCategory } from '../types';

export const VALID_HARDWARE_CATEGORIES: HardwareCategory[] = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'cooler',
  'case',
  'laptop',
];

export const MAIN_TAB_ROUTES = [
  'wiki',
  'rankings',
  'simulator3d',
  '3d',
  'build',
  'glossary',
  'dict',
  'builds',
  'budget',
];

function toUrl(currentUrlInput: string | URL): URL {
  if (currentUrlInput instanceof URL) {
    return new URL(currentUrlInput.href);
  }
  try {
    return new URL(currentUrlInput);
  } catch {
    const base =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : 'https://computer-wiki.vercel.app/';
    return new URL(currentUrlInput, base);
  }
}

/**
 * Computes the target URL for tab navigation.
 * Properly removes tab-specific parameters (like 'hardware') when switching away from 'wiki'.
 * Always preserves full pathname + search + hash so that query parameters are actually removed.
 */
export function computeTabNavigationUrl(currentUrlInput: string | URL, newTab: ActiveTab): string {
  const url = toUrl(currentUrlInput);
  const hasTabParam = url.searchParams.has('tab');

  if (hasTabParam) {
    url.searchParams.set('tab', newTab);
    if (newTab !== 'wiki') {
      url.searchParams.delete('hardware');
    }
    url.hash = '';
    return url.pathname + url.search;
  }

  // Hash-based routing (#/tab)
  if (url.searchParams.has('hardware') && newTab !== 'wiki') {
    url.searchParams.delete('hardware');
  }

  url.hash = `#/${newTab}`;
  // Always include pathname + search + hash to ensure deleted query parameters are completely cleared
  return url.pathname + (url.search || '') + url.hash;
}

/**
 * Computes the URL for opening a hardware detail modal.
 * Preserves existing tab and query parameters while setting 'hardware'.
 */
export function computeDetailOpenUrl(currentUrlInput: string | URL, hardwareId: string): string {
  const url = toUrl(currentUrlInput);
  url.searchParams.set('hardware', hardwareId);
  if (url.searchParams.has('tab')) {
    url.searchParams.set('tab', 'wiki');
    url.hash = '';
  } else {
    url.hash = '#/wiki';
  }
  return url.pathname + (url.search || '') + url.hash;
}

/**
 * Computes the URL for closing a hardware detail modal.
 * Removes the 'hardware' query parameter, and ensures proper hash or tab parameter.
 */
export function computeDetailCloseUrl(currentUrlInput: string | URL): string {
  const url = toUrl(currentUrlInput);
  if (url.searchParams.has('hardware')) {
    url.searchParams.delete('hardware');
  }

  const rawHash = url.hash.replace(/^#\/?/, '').trim();
  if (rawHash && !MAIN_TAB_ROUTES.includes(rawHash)) {
    url.hash = '#/wiki';
  } else if (!rawHash && !url.searchParams.has('tab')) {
    url.hash = '#/wiki';
  }

  return url.pathname + (url.search || '') + url.hash;
}

/**
 * Extracts a candidate hardware ID from query params or legacy hash.
 * Returns null if the URL points to a standard page or has no hardware identifier.
 */
export function parseHardwareFromUrl(currentUrlInput: string | URL): string | null {
  try {
    const url = toUrl(currentUrlInput);
    const hardwareParam = url.searchParams.get('hardware')?.trim();
    if (hardwareParam) return hardwareParam;

    const rawHash = url.hash.replace(/^#\/?/, '').trim();
    if (rawHash && !MAIN_TAB_ROUTES.includes(rawHash)) {
      return rawHash;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts a valid hardware category from the URL query parameter.
 * Returns 'all' if not present or unrecognized.
 */
export function parseCategoryFromUrl(currentUrlInput: string | URL): HardwareCategory | 'all' {
  try {
    const url = toUrl(currentUrlInput);
    const cat = url.searchParams.get('category')?.toLowerCase();
    if (cat && VALID_HARDWARE_CATEGORIES.includes(cat as HardwareCategory)) {
      return cat as HardwareCategory;
    }
    return 'all';
  } catch {
    return 'all';
  }
}

/**
 * Computes the URL when the user changes category filter.
 */
export function computeCategoryChangeUrl(
  currentUrlInput: string | URL,
  newCategory: HardwareCategory | 'all'
): string {
  const url = toUrl(currentUrlInput);
  if (newCategory === 'all') {
    url.searchParams.delete('category');
  } else {
    url.searchParams.set('category', newCategory);
  }
  return url.pathname + (url.search || '') + url.hash;
}
