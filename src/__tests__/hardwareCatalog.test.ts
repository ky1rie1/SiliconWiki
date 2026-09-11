import { describe, expect, it } from 'vitest';
import { createHardwareCatalog } from '../utils/hardwareCatalog';
import { hardwareList } from '../data/hardware';
import { getHardwareVerification } from '../data/sources/verifiedHardware';

describe('normalized hardware catalog', () => {
  it('does not mark stale values as checked just because the model has a source', () => {
    const base = hardwareList.find(item => item.id === 'gpu-nvidia-rtx5090')!;
    const verified = getHardwareVerification(base.id)!;
    const label = Object.keys(verified.fields)[0];
    const stale = { ...base, tdpWatts: 600, specs: { ...base.specs, [label]: 'stale value' } };
    const record = createHardwareCatalog([stale], getHardwareVerification).byId.get(base.id)!;
    expect(record.specifications.find(field => field.label === label)?.evidence).toBe('editorial-reference');
    expect(record.power.evidence).toBe('editorial-reference');
  });
  it('indexes every exact model ID once without mutating legacy view data', () => {
    const before = JSON.stringify(hardwareList);
    const catalog = createHardwareCatalog(hardwareList);
    expect(catalog.byId.size).toBe(hardwareList.length);
    expect([...catalog.byCategory.values()].flat().length).toBe(hardwareList.length);
    expect(JSON.stringify(hardwareList)).toBe(before);
    expect(() => createHardwareCatalog([hardwareList[0], hardwareList[0]])).toThrow(/duplicate/i);
  });
  it('keeps missing scores/history absent instead of synthesizing them from price', () => {
    const raw = { ...hardwareList[0], benchmarks: undefined, priceHistory: undefined, tdpWatts: 0 };
    const item = createHardwareCatalog([raw]).byId.get(raw.id)!;
    expect(item.benchmarks.scores).toEqual({}); expect(item.pricing.history).toEqual([]);
    expect(item.power.watts).toBeNull();
  });
  it('rejects impossible reference ranges and never upgrades editorial facts by default', () => {
    const raw = hardwareList[0];
    expect(() => createHardwareCatalog([{ ...raw, marketPriceRange: [10, -1] }])).toThrow(/price/i);
    const record = createHardwareCatalog([raw]).byId.get(raw.id)!;
    expect(record.specifications.every(field => field.evidence === 'editorial-reference')).toBe(true);
    expect(record.sources).toEqual([]);
  });
});
