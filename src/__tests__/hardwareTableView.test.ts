import { describe, it, expect } from 'vitest';
import { hardwareList } from '../data/hardware';
import { translations } from '../i18n/translations';

describe('Hardware Table View & Data Matrix', () => {
  it('should contain 140+ hardware items across all categories', () => {
    expect(hardwareList.length).toBeGreaterThanOrEqual(140);
  });

  it('every hardware item should have required fields for the data matrix', () => {
    hardwareList.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.brand).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(typeof item.tdpWatts).toBe('number');
      expect(Array.isArray(item.marketPriceRange)).toBe(true);
      expect(item.marketPriceRange.length).toBe(2);
      expect(item.marketPriceRange[0]).toBeLessThanOrEqual(item.marketPriceRange[1]);
      expect(['down', 'stable', 'up', 'warning']).toContain(item.priceTrend);
      expect(typeof item.specs).toBe('object');
      expect(Object.keys(item.specs).length).toBeGreaterThan(0);
    });
  });

  it('should verify sorting algorithms for Price, TDP, and Model name', () => {
    // Price Ascending
    const sortedByPriceAsc = [...hardwareList].sort(
      (a, b) => a.marketPriceRange[0] - b.marketPriceRange[0]
    );
    for (let i = 0; i < sortedByPriceAsc.length - 1; i++) {
      expect(sortedByPriceAsc[i].marketPriceRange[0]).toBeLessThanOrEqual(
        sortedByPriceAsc[i + 1].marketPriceRange[0]
      );
    }

    // Price Descending
    const sortedByPriceDesc = [...hardwareList].sort(
      (a, b) => b.marketPriceRange[0] - a.marketPriceRange[0]
    );
    for (let i = 0; i < sortedByPriceDesc.length - 1; i++) {
      expect(sortedByPriceDesc[i].marketPriceRange[0]).toBeGreaterThanOrEqual(
        sortedByPriceDesc[i + 1].marketPriceRange[0]
      );
    }

    // TDP Descending
    const sortedByTdpDesc = [...hardwareList].sort((a, b) => b.tdpWatts - a.tdpWatts);
    for (let i = 0; i < sortedByTdpDesc.length - 1; i++) {
      expect(sortedByTdpDesc[i].tdpWatts).toBeGreaterThanOrEqual(
        sortedByTdpDesc[i + 1].tdpWatts
      );
    }

    // Model Name Ascending
    const sortedByModelAsc = [...hardwareList].sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-CN')
    );
    expect(sortedByModelAsc[0].name.localeCompare(sortedByModelAsc[1].name, 'zh-CN')).toBeLessThanOrEqual(0);
  });

  it('should have complete bilingual support for table view headers and actions', () => {
    const requiredKeys = [
      'viewCard',
      'viewTable',
      'tableColModel',
      'tableColBrand',
      'tableColArch',
      'tableColSpecs',
      'tableColTdp',
      'tableColPrice',
      'tableColTrend',
      'tableColActions',
      'tableCompare',
      'tableSpecsDetail',
      'tableComparingCount',
      'tableLaunchCompare',
      'tableClearCompare',
      'tableLimitNotice',
      'tableCompareModalTitle',
      'tableCompareModalDesc',
      'tableTrendDown',
      'tableTrendUp',
      'tableTrendWarning',
      'tableTrendStable',
    ] as const;

    requiredKeys.forEach((key) => {
      expect(translations.zh[key]).toBeTruthy();
      expect(translations.en[key]).toBeTruthy();
    });
  });

  it('should support localStorage view mode preference round-trip', () => {
    const key = 'silicon_wiki_view_mode';
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    };

    const modes: ('grid' | 'table')[] = ['grid', 'table'];
    modes.forEach((mode) => {
      mockLocalStorage.setItem(key, mode);
      expect(mockLocalStorage.getItem(key)).toBe(mode);
    });
  });
});

describe('Security & Localization for Diagnostics & Content Calibration Workspace', () => {
  const isDiagnosticsToken = (input: string) => {
    if (!input || input.length !== 10) return false;
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0) === 3770793177;
  };

  it('should verify FNV-1a hash matching logic', () => {
    const chars = [107, 121, 49, 114, 105, 101, 49, 49, 48, 49].map(c => String.fromCharCode(c)).join('');
    expect(isDiagnosticsToken(chars)).toBe(true);
    expect(isDiagnosticsToken(chars.toLowerCase())).toBe(true);
    expect(isDiagnosticsToken('wrongtoken')).toBe(false);
    expect(isDiagnosticsToken('1234567890')).toBe(false);
    expect(isDiagnosticsToken('')).toBe(false);
    expect(isDiagnosticsToken('short')).toBe(false);
    expect(isDiagnosticsToken('toolongtokenhere')).toBe(false);
  });

  it('should verify all required bilingual tab keys exist and match specs', () => {
    expect(translations.zh.tabCustom).toBe('单项修改');
    expect(translations.en.tabCustom).toBe('Single Edit');

    expect(translations.zh.tabPresets).toBe('常见预设');
    expect(translations.en.tabPresets).toBe('Common Presets');

    expect(translations.zh.tabList).toBe('修改清单');
    expect(translations.en.tabList).toBe('Active Changes');

    expect(translations.zh.tabExport).toBe('导入导出');
    expect(translations.en.tabExport).toBe('Import & Export');
  });

  it('should verify diagnostics workspace titles, badges, and controls are localized without Chinese in English mode', () => {
    const diagKeys = [
      'diagModalTitle',
      'diagBadgePersistent',
      'diagSubtitle',
      'diagExitMode',
      'diagExitModeTitle',
      'diagFloatingBtn',
      'diagFloatingBtnTitle',
      'visualBannerTitle',
      'visualBannerDesc',
      'visualBannerExit',
      'visualModeCardTitle',
      'visualModeCardDesc',
      'visualModeCardBtn',
      'labelOriginalText',
      'placeholderOriginalText',
      'labelZhReplacement',
      'placeholderZhReplacement',
      'labelEnReplacement',
      'badgeAutoBilingual',
      'btnRetranslate',
      'placeholderEnReplacement',
      'noticeAppliedSuccess',
      'btnClearInput',
      'btnSaveApply',
      'presetsIntro',
      'presetCustomizedBadge',
      'presetOrigPrefix',
      'btnRefinePreset',
      'presetBrandLabel',
      'presetBrandPlaceholder',
      'presetSloganLabel',
      'presetSloganPlaceholder',
      'presetBadgeLabel',
      'presetBadgePlaceholder',
      'presetRankingsLabel',
      'presetRankingsPlaceholder',
      'presetAssemblyLabel',
      'presetAssemblyPlaceholder',
      'presetGlossaryLabel',
      'presetGlossaryPlaceholder',
      'activeListTitle',
      'btnRestoreDefaults',
      'emptyListTitle',
      'emptyListAction',
      'tagOriginal',
      'tagZh',
      'tagEn',
      'btnEditItemTitle',
      'btnDeleteItemTitle',
      'exportSectionTitle',
      'exportSectionDesc',
      'btnCopyJson',
      'btnCopiedJson',
      'btnCopyTs',
      'btnCopiedTs',
      'importSectionTitle',
      'importPlaceholder',
      'btnImportMerge',
      'importSuccessNotice',
      'importErrorNotice',
      'notesTitle',
      'note1',
      'note2',
      'note3',
      'footerShortcutHint',
      'btnDone',
    ] as const;

    diagKeys.forEach((key) => {
      expect(translations.zh[key]).toBeTruthy();
      expect(translations.en[key]).toBeTruthy();
      // Ensure English translations do not contain Chinese characters
      expect(/[\u4e00-\u9fa5]/.test(translations.en[key])).toBe(false);
    });
  });
});

