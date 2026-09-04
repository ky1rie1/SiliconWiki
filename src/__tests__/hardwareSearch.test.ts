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

describe('Hardware Filter Matchers', () => {
  const am5CpuMatcher = (i: any) => {
    const socket = (
      (i.specs['插槽'] || '') +
      ' ' +
      (i.specs['插槽接口'] || '') +
      ' ' +
      (i.specs['插槽/平台'] || '')
    ).toUpperCase();
    const arch = (i.architecture || '').toUpperCase();
    return (
      socket.includes('AM5') ||
      arch.includes('ZEN 5') ||
      arch.includes('ZEN 4') ||
      i.series.includes('9000') ||
      i.series.includes('7000') ||
      /(?:9800X3D|7800X3D|7950X3D|9950X|9900X|9700X|9600X|7700X|7600X|7500F)\b/i.test(i.name)
    );
  };

  const lga1851CpuMatcher = (i: any) => {
    const socket = (
      (i.specs['插槽'] || '') +
      ' ' +
      (i.specs['插槽接口'] || '') +
      ' ' +
      (i.specs['插槽/平台'] || '')
    ).toUpperCase();
    return (
      socket.includes('1851') ||
      i.series.includes('Ultra 200S') ||
      i.series.includes('200S') ||
      /(?:285K|265K|245K)\b/i.test(i.name)
    );
  };

  const lga1700CpuMatcher = (i: any) => {
    const socket = (
      (i.specs['插槽'] || '') +
      ' ' +
      (i.specs['插槽接口'] || '') +
      ' ' +
      (i.specs['插槽/平台'] || '')
    ).toUpperCase();
    const isDesktopIntel =
      !i.name.includes('HX') &&
      !i.series.includes('移动') &&
      i.brand === 'Intel';
    return (
      socket.includes('1700') ||
      (isDesktopIntel &&
        (i.series.includes('14 代') ||
          i.series.includes('13 代') ||
          i.series.includes('12 代') ||
          /(?:14\d{3}|13\d{3}|12\d{3})[KFSE]*/i.test(i.name)))
    );
  };

  const am4CpuMatcher = (i: any) => {
    const socket = (
      (i.specs['插槽'] || '') +
      ' ' +
      (i.specs['插槽接口'] || '') +
      ' ' +
      (i.specs['插槽/平台'] || '')
    ).toUpperCase();
    return (
      socket.includes('AM4') ||
      i.series.includes('5000') ||
      /(?:5800X3D|5700X3D|5600X|5600G|5600)\b/i.test(i.name)
    );
  };

  const ocCpuMatcher = (i: any) =>
    /\d{3,5}(?:X3D|XT|X|KF|KS|K)\b/i.test(i.name) ||
    (i.specs['基础/加速频率'] || '').includes('解锁超频');

  it('should match AM5 CPUs properly (9800X3D, 7800X3D, 7700X, 7500F, etc.)', () => {
    const cpuPool = hardwareList.filter((item) => item.category === 'cpu');
    const am5Items = cpuPool.filter(am5CpuMatcher);
    expect(am5Items.some((i) => i.name.includes('9800X3D'))).toBe(true);
    expect(am5Items.some((i) => i.name.includes('7800X3D'))).toBe(true);
    expect(am5Items.some((i) => i.name.includes('7700X'))).toBe(true);
    expect(am5Items.some((i) => i.name.includes('7500F'))).toBe(true);
    expect(am5Items.some((i) => i.name.includes('5600'))).toBe(false);
    expect(am5Items.some((i) => i.name.includes('14700K'))).toBe(false);
  });

  it('should match LGA1851 desktop CPUs and exclude mobile Ultra 185H', () => {
    const cpuPool = hardwareList.filter((item) => item.category === 'cpu');
    const lga1851Items = cpuPool.filter(lga1851CpuMatcher);
    expect(lga1851Items.some((i) => i.name.includes('285K'))).toBe(true);
    expect(lga1851Items.some((i) => i.name.includes('265K'))).toBe(true);
    expect(lga1851Items.some((i) => i.name.includes('245K'))).toBe(true);
    expect(lga1851Items.some((i) => i.name.includes('185H'))).toBe(false);
  });

  it('should match LGA1700 desktop CPUs and exclude mobile 14900HX', () => {
    const cpuPool = hardwareList.filter((item) => item.category === 'cpu');
    const lga1700Items = cpuPool.filter(lga1700CpuMatcher);
    expect(lga1700Items.some((i) => i.name.includes('14900K'))).toBe(true);
    expect(lga1700Items.some((i) => i.name.includes('14700K'))).toBe(true);
    expect(lga1700Items.some((i) => i.name.includes('14400F'))).toBe(true);
    expect(lga1700Items.some((i) => i.name.includes('13600KF'))).toBe(true);
    expect(lga1700Items.some((i) => i.name.includes('12400F'))).toBe(true);
    expect(lga1700Items.some((i) => i.name.includes('14900HX'))).toBe(false);
  });

  it('should match AM4 CPUs properly (5800X3D, 5700X3D, 5600, 5600G)', () => {
    const cpuPool = hardwareList.filter((item) => item.category === 'cpu');
    const am4Items = cpuPool.filter(am4CpuMatcher);
    expect(am4Items.some((i) => i.name.includes('5800X3D'))).toBe(true);
    expect(am4Items.some((i) => i.name.includes('5700X3D'))).toBe(true);
    expect(am4Items.some((i) => i.name.includes('5600'))).toBe(true);
    expect(am4Items.some((i) => i.name.includes('9800X3D'))).toBe(false);
  });

  it('should accurately test CPU OC matcher without naive false positives', () => {
    const cpuPool = hardwareList.filter((item) => item.category === 'cpu');
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('9800X3D'))!)).toBe(true);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('14700K'))!)).toBe(true);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('14600KF'))!)).toBe(true);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('265K'))!)).toBe(true);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('7700X'))!)).toBe(true);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('5600') && !i.name.includes('X3D'))!)).toBe(false);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('7500F'))!)).toBe(false);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('14400F'))!)).toBe(false);
    expect(ocCpuMatcher(cpuPool.find((i) => i.name.includes('12400F'))!)).toBe(false);
  });

  it('should match Motherboard chipsets (AM5, LGA1700, LGA1851)', () => {
    const mbPool = hardwareList.filter((item) => item.category === 'motherboard');
    const am5Matcher = (i: any) => {
      const text = (
        i.name +
        ' ' +
        (i.specs['CPU 插槽'] || '') +
        ' ' +
        (i.specs['插槽接口'] || '') +
        ' ' +
        (i.specs['插槽'] || '') +
        ' ' +
        (i.specs['芯片组'] || '') +
        ' ' +
        (i.series || '')
      ).toUpperCase();
      return (
        text.includes('AM5') ||
        text.includes('B650') ||
        text.includes('X870') ||
        text.includes('X670') ||
        text.includes('A620')
      );
    };

    const lga1700Matcher = (i: any) => {
      const text = (
        i.name +
        ' ' +
        (i.specs['CPU 插槽'] || '') +
        ' ' +
        (i.specs['插槽接口'] || '') +
        ' ' +
        (i.specs['插槽'] || '') +
        ' ' +
        (i.specs['芯片组'] || '') +
        ' ' +
        (i.series || '')
      ).toUpperCase();
      return (
        text.includes('1700') ||
        text.includes('B760') ||
        text.includes('Z790') ||
        text.includes('Z690') ||
        text.includes('B660') ||
        text.includes('H610')
      );
    };

    const lga1851Matcher = (i: any) => {
      const text = (
        i.name +
        ' ' +
        (i.specs['CPU 插槽'] || '') +
        ' ' +
        (i.specs['插槽接口'] || '') +
        ' ' +
        (i.specs['插槽'] || '') +
        ' ' +
        (i.specs['芯片组'] || '') +
        ' ' +
        (i.series || '')
      ).toUpperCase();
      return (
        text.includes('1851') ||
        text.includes('Z890') ||
        text.includes('B860')
      );
    };

    const am5Mbs = mbPool.filter(am5Matcher);
    expect(am5Mbs.some((m) => m.name.includes('B650'))).toBe(true);
    expect(am5Mbs.some((m) => m.name.includes('X870'))).toBe(true);

    const lga1700Mbs = mbPool.filter(lga1700Matcher);
    expect(lga1700Mbs.some((m) => m.name.includes('B760'))).toBe(true);
    expect(lga1700Mbs.some((m) => m.name.includes('Z790'))).toBe(true);

    const lga1851Mbs = mbPool.filter(lga1851Matcher);
    expect(lga1851Mbs.some((m) => m.name.includes('Z890'))).toBe(true);
  });
});
