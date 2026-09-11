import { describe, expect, it } from 'vitest';
import { resolveTextOverride } from '../utils/textOverrides';

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
});
