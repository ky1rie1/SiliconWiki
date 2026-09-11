import { describe, expect, it } from 'vitest';
import { createTextOverrideEntries, resolveTextOverride } from '../utils/textOverrides';

describe('text overrides on React-managed text and attributes', () => {
  it('preserves a language update instead of restoring the first rendered text', () => {
    const first = resolveTextOverride('探索硬件', undefined, { '探索硬件': '浏览硬件' });
    expect(resolveTextOverride('Explore hardware', first, { 'Explore hardware': 'Browse hardware' }).rendered).toBe('Browse hardware');
  });

  it('does not expand a replacement repeatedly during mutation observation', () => {
    const first = resolveTextOverride('GPU', undefined, { GPU: 'GPU guide' });
    expect(resolveTextOverride(first.rendered, first, { GPU: 'GPU guide' }).rendered).toBe('GPU guide');
  });

  it('restores the original when the user removes an override', () => {
    const first = resolveTextOverride('Hardware', undefined, { Hardware: 'My hardware' });
    expect(resolveTextOverride(first.rendered, first, {}).rendered).toBe('Hardware');
  });

  it('respects changing counts and cleared attributes from React', () => {
    const count = resolveTextOverride('152', undefined, {});
    expect(resolveTextOverride('34', count, {}).rendered).toBe('34');
    const label = resolveTextOverride('Search', undefined, { Search: 'Find' });
    expect(resolveTextOverride('', label, {}).rendered).toBe('');
  });

  it('applies compiled English overrides to both original Chinese and translated UI text', () => {
    const entries = createTextOverrideEntries(
      { '搜索': { zh: '查找', en: 'Find' } },
      'en',
      { zh: { search: '搜索', alternate: '搜索' }, en: { search: 'Search', alternate: 'Lookup' } },
    );
    expect(resolveTextOverride('搜索 / Search / Lookup', undefined, entries).rendered).toBe('Find / Find / Find');
  });

  it('switches an existing override back to Chinese using the current language', () => {
    const overrides = { '搜索': { zh: '查找', en: 'Find' } };
    const dictionaries = { zh: { search: '搜索' }, en: { search: 'Search' } };
    const first = resolveTextOverride('搜索', undefined, createTextOverrideEntries(overrides, 'en', dictionaries));
    expect(resolveTextOverride(first.rendered, first, createTextOverrideEntries(overrides, 'zh', dictionaries)).rendered).toBe('查找');
  });

  it('restores a source after removing the final compiled override', () => {
    const first = resolveTextOverride('Search', undefined, [['Search', 'Find']]);
    expect(first.rendered).toBe('Find');
    expect(resolveTextOverride(first.rendered, first, []).rendered).toBe('Search');
  });
});
