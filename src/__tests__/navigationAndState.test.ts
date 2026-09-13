import { describe, it, expect } from 'vitest';
import { hardwareList } from '../data/hardware';
import { hardwareShareUrl } from '../utils/hardwareLinks';

describe('Navigation and State Synchronization Suite', () => {
  describe('Hardware Share Link Compatibility', () => {
    it('should generate valid share URL with tab=wiki and hardware parameter', () => {
      const shareUrl = hardwareShareUrl('https://computer-wiki.vercel.app/', 'cpu-amd-9800x3d');
      const parsed = new URL(shareUrl);
      expect(parsed.searchParams.get('tab')).toBe('wiki');
      expect(parsed.searchParams.get('hardware')).toBe('cpu-amd-9800x3d');
      expect(parsed.hash).toBe('');
    });

    it('should preserve base path when creating share URL', () => {
      const shareUrl = hardwareShareUrl('https://example.com/subpath/?foo=bar', 'gpu-rtx-4070-super');
      const parsed = new URL(shareUrl);
      expect(parsed.pathname).toBe('/subpath/');
      expect(parsed.searchParams.get('hardware')).toBe('gpu-rtx-4070-super');
      expect(parsed.searchParams.get('tab')).toBe('wiki');
    });

    it('should match known hardware IDs in catalog', () => {
      const item = hardwareList.find((h) => h.id === 'cpu-amd-9800x3d');
      expect(item).toBeDefined();
      expect(item?.name).toContain('9800X3D');
    });
  });

  describe('URL Parsing and Detail Synchronization Semantics', () => {
    it('should recognize candidate hardware ID from searchParams', () => {
      const testUrl = new URL('https://computer-wiki.vercel.app/?tab=wiki&hardware=cpu-amd-7800x3d');
      const param = testUrl.searchParams.get('hardware');
      expect(param).toBe('cpu-amd-7800x3d');
      const found = hardwareList.find((h) => h.id === param);
      expect(found).toBeDefined();
      expect(found?.name).toContain('7800X3D');
    });

    it('should recognize candidate hardware ID from hash in legacy share links', () => {
      const testUrl = new URL('https://computer-wiki.vercel.app/#/cpu-amd-7800x3d');
      const rawHash = testUrl.hash.replace(/^#\/?/, '').trim();
      const tabNames = ['wiki', 'rankings', 'simulator3d', '3d', 'build', 'glossary', 'dict', 'builds', 'budget'];
      const candidate = rawHash && !tabNames.includes(rawHash) ? rawHash : null;

      expect(candidate).toBe('cpu-amd-7800x3d');
      const found = hardwareList.find((h) => h.id === candidate);
      expect(found).toBeDefined();
    });

    it('should not confuse main tab routes in hash (#/wiki, #/rankings) with hardware IDs', () => {
      const testUrl = new URL('https://computer-wiki.vercel.app/#/wiki');
      const rawHash = testUrl.hash.replace(/^#\/?/, '').trim();
      const tabNames = ['wiki', 'rankings', 'simulator3d', '3d', 'build', 'glossary', 'dict', 'builds', 'budget'];
      const candidate = rawHash && !tabNames.includes(rawHash) ? rawHash : null;

      expect(candidate).toBeNull();
    });

    it('should clean hardware query parameter upon closing modal', () => {
      const currentUrl = new URL('https://computer-wiki.vercel.app/?tab=wiki&hardware=cpu-amd-9800x3d');
      expect(currentUrl.searchParams.has('hardware')).toBe(true);

      // Simulate close logic
      currentUrl.searchParams.delete('hardware');
      expect(currentUrl.searchParams.has('hardware')).toBe(false);
      expect(currentUrl.searchParams.get('tab')).toBe('wiki');
      expect(currentUrl.toString()).toBe('https://computer-wiki.vercel.app/?tab=wiki');
    });

    it('should clean hardware query param when switching from wiki to another tab', () => {
      const currentUrl = new URL('https://computer-wiki.vercel.app/?tab=wiki&hardware=cpu-amd-9800x3d');
      const newTab: string = 'rankings';

      if (currentUrl.searchParams.has('tab')) {
        currentUrl.searchParams.set('tab', newTab);
        if (newTab !== 'wiki') {
          currentUrl.searchParams.delete('hardware');
        }
      }

      expect(currentUrl.searchParams.get('tab')).toBe('rankings');
      expect(currentUrl.searchParams.has('hardware')).toBe(false);
    });
  });

  describe('Category Filter State in URL', () => {
    it('should preserve and parse category parameter from URL', () => {
      const url = new URL('https://computer-wiki.vercel.app/?tab=wiki&category=gpu');
      const cat = url.searchParams.get('category')?.toLowerCase();
      const validCats = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case', 'laptop'];
      expect(validCats.includes(cat!)).toBe(true);
      expect(cat).toBe('gpu');
    });

    it('should ignore invalid category parameter and fall back cleanly', () => {
      const url = new URL('https://computer-wiki.vercel.app/?tab=wiki&category=unknown_thing');
      const cat = url.searchParams.get('category')?.toLowerCase();
      const validCats = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case', 'laptop'];
      const resolved = cat && validCats.includes(cat) ? cat : 'all';
      expect(resolved).toBe('all');
    });
  });
});
