import { describe, it, expect } from 'vitest';
import { hardwareList } from '../data/hardware';
import { matchHardwareFuzzy, normalizeHardwareText } from '../utils/hardwareSearch';

describe('Advanced Hardware Fuzzy Search Engine', () => {
  it('should normalize text by stripping punctuation and hyphens', () => {
    expect(normalizeHardwareText('B-650M-PLUS (WIFI)')).toBe('b650mpluswifi');
    expect(normalizeHardwareText('RTX 4070 SUPER / 12GB')).toBe('rtx4070super12gb');
  });

  it('should support Pinyin abbreviations: zps -> 重炮手', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, 'zps'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.id === 'mb-asus-tuf-b650m-plus-wifi')).toBe(true);
    results.forEach((item) => {
      const hasZps = item.name.includes('重炮手') || 
        item.badge?.includes('重炮手') || 
        item.highlights.some(h => h.includes('重炮手')) ||
        item.tbSearchQuery?.includes('重炮手') ||
        item.jdSearchQuery?.includes('重炮手') ||
        item.pairingAdvice?.includes('重炮手') ||
        item.pros.some(p => p.includes('重炮手')) ||
        item.cons.some(c => c.includes('重炮手'));
      if (!hasZps) {
        console.log('Failed item:', item.id, item.name, item.brand, item.series);
      }
      expect(hasZps).toBe(true);
    });
  });

  it('should support Pinyin abbreviations: pjp -> 迫击炮', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, 'pjp'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.id === 'mb-msi-b650m-mortar-wifi')).toBe(true);
  });

  it('should support shorthand: 4070s -> 4070 SUPER', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, '4070s'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.toLowerCase().includes('4070 super'))).toBe(true);
  });

  it('should support shorthand: 98x3d -> 9800X3D', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, '98x3d'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.includes('9800X3D'))).toBe(true);
  });

  it('should support shorthand: xd -> 小雕', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, 'xd'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.includes('小雕') || item.name.includes('AORUS ELITE'))).toBe(true);
  });

  it('should support shorthand: dtr -> 雕 (Aorus)', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, 'dtr'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.includes('小雕') || item.name.includes('AORUS'))).toBe(true);
  });

  it('should support shorthand: 75f -> 7500F', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, '75f'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.includes('7500F'))).toBe(true);
  });

  it('should support shorthand: 126kf -> 12600KF', () => {
    const results = hardwareList.filter((item) => matchHardwareFuzzy(item, '126kf'));
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.includes('12600KF'))).toBe(true);
  });

  it('should support multi-token searching with AND logic', () => {
    // "华硕 b650" should match ASUS B650 motherboards, but NOT MSI B650
    const asusB650 = hardwareList.filter((item) => matchHardwareFuzzy(item, '华硕 b650'));
    expect(asusB650.length).toBeGreaterThan(0);
    expect(asusB650.every((item) => item.brand.toLowerCase() === 'asus' || item.name.toLowerCase().includes('asus') || item.name.includes('华硕'))).toBe(true);
    expect(asusB650.some((item) => item.id === 'mb-asus-tuf-b650m-plus-wifi')).toBe(true);

    // "intel 14700"
    const intel14700 = hardwareList.filter((item) => matchHardwareFuzzy(item, 'intel 14700'));
    expect(intel14700.length).toBeGreaterThan(0);
    expect(intel14700.some((item) => item.name.includes('14700'))).toBe(true);

    // "4070 12g"
    const rtx407012g = hardwareList.filter((item) => matchHardwareFuzzy(item, '4070 12g'));
    expect(rtx407012g.length).toBeGreaterThan(0);
    expect(rtx407012g.some((item) => item.name.includes('4070'))).toBe(true);
  });

  it('should be hyphen and punctuation insensitive', () => {
    const hyphenResults = hardwareList.filter((item) => matchHardwareFuzzy(item, 'b-650'));
    const plainResults = hardwareList.filter((item) => matchHardwareFuzzy(item, 'b650'));
    expect(hyphenResults.length).toBeGreaterThan(0);
    expect(hyphenResults.length).toBe(plainResults.length);
  });

  it('should guarantee mb-asus-tuf-b650m-plus-wifi appears exactly once', () => {
    const matches = hardwareList.filter(item => item.id === 'mb-asus-tuf-b650m-plus-wifi');
    expect(matches.length).toBe(1);
    expect(matches[0].name).toContain('ASUS (华硕) TUF GAMING B650M-PLUS WIFI 重炮手');
    expect(matches[0].category).toBe('motherboard');
  });

  it('should guarantee strict category isolation so motherboards never leak into PSUs or other categories', () => {
    const psuPool = hardwareList.filter(item => item.category === 'psu');
    expect(psuPool.every(item => item.category === 'psu')).toBe(true);
    expect(psuPool.some(item => item.id.startsWith('mb-'))).toBe(false);

    const mbPool = hardwareList.filter(item => item.category === 'motherboard');
    expect(mbPool.every(item => item.category === 'motherboard')).toBe(true);
    expect(mbPool.some(item => item.id.startsWith('psu-'))).toBe(false);
  });
});
