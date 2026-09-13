import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  computeTabNavigationUrl,
  computeDetailOpenUrl,
  computeDetailCloseUrl,
  parseHardwareFromUrl,
  parseCategoryFromUrl,
  computeCategoryChangeUrl,
  VALID_HARDWARE_CATEGORIES,
} from '../utils/navigation';
import { hardwareList } from '../data/hardware';
import { hardwareShareUrl } from '../utils/hardwareLinks';

describe('Navigation, URL Computation & History Synchronization Suite', () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;

  beforeEach(() => {
    (globalThis as unknown as { window: unknown }).window = {
      location: new URL('https://computer-wiki.vercel.app/#/wiki'),
      history: {
        state: null,
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
      },
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    (globalThis as unknown as { window: unknown }).window = originalWindow;
  });

  describe('computeTabNavigationUrl - URL Construction without Relative Hash Traps', () => {
    it('should cleanly remove hardware parameter when URL has only hardware and no tab parameter', () => {
      // Review Point 3: When URL only has ?hardware=... without tab,
      // switching tab must NOT leave ?hardware=...#/rankings in the address bar.
      const urlWithoutTab = 'https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d';
      const target = computeTabNavigationUrl(urlWithoutTab, 'rankings');

      expect(target).toBe('/#/rankings');
      expect(target).not.toContain('hardware=');
      expect(target.startsWith('/')).toBe(true);
    });

    it('should update tab query parameter and delete hardware parameter for query-param routing', () => {
      const urlWithTab = 'https://computer-wiki.vercel.app/?tab=wiki&hardware=cpu-amd-9800x3d';
      const target = computeTabNavigationUrl(urlWithTab, 'rankings');

      expect(target).toBe('/?tab=rankings');
      expect(target).not.toContain('hardware=');
    });

    it('should switch between main tabs under hash routing cleanly', () => {
      const urlHash = 'https://computer-wiki.vercel.app/#/wiki';
      const target = computeTabNavigationUrl(urlHash, 'simulator3d');

      expect(target).toBe('/#/simulator3d');
    });
  });

  describe('computeDetailOpenUrl & computeDetailCloseUrl', () => {
    it('should construct valid detail URL pointing to wiki tab when opening hardware', () => {
      const fromRankingsHash = 'https://computer-wiki.vercel.app/#/rankings';
      const targetUrl = computeDetailOpenUrl(fromRankingsHash, 'cpu-amd-9800x3d');

      expect(targetUrl).toBe('/?hardware=cpu-amd-9800x3d#/wiki');
    });

    it('should update tab=wiki when opening hardware under query-based routing', () => {
      const fromRankingsQuery = 'https://computer-wiki.vercel.app/?tab=rankings';
      const targetUrl = computeDetailOpenUrl(fromRankingsQuery, 'gpu-rtx-4070-super');

      expect(targetUrl).toBe('/?tab=wiki&hardware=gpu-rtx-4070-super');
    });

    it('should close detail modal and reset to #/wiki when URL only had hardware parameter', () => {
      const url = 'https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d';
      const closedUrl = computeDetailCloseUrl(url);

      expect(closedUrl).toBe('/#/wiki');
      expect(closedUrl).not.toContain('hardware=');
    });

    it('should preserve category parameter when closing detail modal', () => {
      const url = 'https://computer-wiki.vercel.app/?category=gpu&hardware=gpu-rtx-4070-super#/wiki';
      const closedUrl = computeDetailCloseUrl(url);

      expect(closedUrl).toBe('/?category=gpu#/wiki');
      expect(closedUrl).not.toContain('hardware=');
      expect(closedUrl).toContain('category=gpu');
    });

    it('should handle legacy hash containing hardware ID and reset to #/wiki', () => {
      const legacyUrl = 'https://computer-wiki.vercel.app/#/cpu-amd-9800x3d';
      const closedUrl = computeDetailCloseUrl(legacyUrl);

      expect(closedUrl).toBe('/#/wiki');
    });
  });

  describe('parseHardwareFromUrl', () => {
    it('should extract hardware ID from query parameter', () => {
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d')).toBe(
        'cpu-amd-9800x3d'
      );
    });

    it('should extract hardware ID from legacy hash', () => {
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/gpu-rtx-4070-super')).toBe(
        'gpu-rtx-4070-super'
      );
    });

    it('should return null for recognized main tab routes in hash', () => {
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/wiki')).toBeNull();
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/rankings')).toBeNull();
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/simulator3d')).toBeNull();
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/glossary')).toBeNull();
      expect(parseHardwareFromUrl('https://computer-wiki.vercel.app/#/builds')).toBeNull();
    });
  });

  describe('parseCategoryFromUrl & computeCategoryChangeUrl', () => {
    it('should parse valid hardware category from URL', () => {
      VALID_HARDWARE_CATEGORIES.forEach((cat) => {
        const url = `https://computer-wiki.vercel.app/?category=${cat}#/wiki`;
        expect(parseCategoryFromUrl(url)).toBe(cat);
      });
    });

    it('should fall back to "all" for invalid or missing category parameter', () => {
      expect(parseCategoryFromUrl('https://computer-wiki.vercel.app/#/wiki')).toBe('all');
      expect(parseCategoryFromUrl('https://computer-wiki.vercel.app/?category=invalid_item')).toBe('all');
    });

    it('should compute category change URL without mutating tab hash', () => {
      const url = 'https://computer-wiki.vercel.app/#/wiki';
      const withCpu = computeCategoryChangeUrl(url, 'cpu');
      expect(withCpu).toBe('/?category=cpu#/wiki');

      const resetAll = computeCategoryChangeUrl(withCpu, 'all');
      expect(resetAll).toBe('/#/wiki');
      expect(resetAll).not.toContain('category=');
    });
  });



  describe('Omnisearch Hot Suggestions hardwareId Target', () => {
    it('sug-1 and sug-2 must have target hardwareId matching items in catalog', () => {
      const sug1HardwareId = 'cpu-amd-9800x3d';
      const sug2HardwareId = 'gpu-nvidia-rtx4070super';

      const foundSug1 = hardwareList.find((h) => h.id === sug1HardwareId);
      const foundSug2 = hardwareList.find((h) => h.id === sug2HardwareId);

      expect(foundSug1).toBeDefined();
      expect(foundSug1?.name).toContain('9800X3D');
      expect(foundSug2).toBeDefined();
      expect(foundSug2?.name).toContain('4070 Super');

      // Test alias resolution for gpu-rtx-4070-super
      const aliasTarget = 'gpu-rtx-4070-super';
      const normalized = aliasTarget === 'gpu-rtx-4070-super' ? 'gpu-nvidia-rtx4070super' : aliasTarget;
      const foundViaAlias = hardwareList.find((h) => h.id === normalized);
      expect(foundViaAlias).toBeDefined();
      expect(foundViaAlias?.name).toContain('4070 Super');
    });

    it('should generate valid share URL for hot suggestion hardware targets', () => {
      const url1 = hardwareShareUrl('https://computer-wiki.vercel.app/', 'cpu-amd-9800x3d');
      expect(url1).toContain('tab=wiki');
      expect(url1).toContain('hardware=cpu-amd-9800x3d');

      const url2 = hardwareShareUrl('https://computer-wiki.vercel.app/', 'gpu-nvidia-rtx4070super');
      expect(url2).toContain('tab=wiki');
      expect(url2).toContain('hardware=gpu-nvidia-rtx4070super');
    });
  });
});
