// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from '../App';
import { hardwareCatalog, hardwareList } from '../data/hardware';
import {
  CATEGORY_CORE_FIELDS,
  safeSortHardwareByPrice,
  safeSortHardwareByTdp,
  createHardwareCatalog,
  isValidCheckDate,
  formatHardwarePrice,
  isValidPriceRange,
} from '../utils/hardwareCatalog';
import { computeCatalogCredibilityStats } from '../utils/dataCredibilityStats';
import { HardwareTableView } from '../components/wiki/HardwareTableView';
import { HardwareCard } from '../components/wiki/HardwareCard';
import { SearchModal } from '../components/search/SearchModal';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CustomContentProvider } from '../context/CustomContentContext';
import type { HardwareItem } from '../types';
import type { HardwareVerification } from '../types/hardwareSources';

// Configure React act environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('Phase 2: Hardware Credibility, Structured Data & Audit Suite', () => {
  /* ========================================================================
   * 1. Pure Functional Tests: Catalog Ingestion & Schema Integrity
   * ======================================================================== */
  describe('Data Integrity & Category Benchmark Standards', () => {
    it('contains no duplicate hardware IDs and all price ranges are valid', () => {
      const ids = new Set<string>();
      for (const item of hardwareList) {
        expect(ids.has(item.id), `Duplicate ID found: ${item.id}`).toBe(false);
        ids.add(item.id);

        const [min, max] = item.marketPriceRange;
        expect(min).toBeGreaterThanOrEqual(0);
        expect(max).toBeGreaterThanOrEqual(min);
      }
    });

    it('strictly fixes denominator Y across all 9 hardware categories', () => {
      expect(CATEGORY_CORE_FIELDS.cpu).toHaveLength(7);
      expect(CATEGORY_CORE_FIELDS.gpu).toHaveLength(8);
      expect(CATEGORY_CORE_FIELDS.motherboard).toHaveLength(6);
      expect(CATEGORY_CORE_FIELDS.ram).toHaveLength(5);
      expect(CATEGORY_CORE_FIELDS.storage).toHaveLength(5);
      expect(CATEGORY_CORE_FIELDS.psu).toHaveLength(5);
      expect(CATEGORY_CORE_FIELDS.cooler).toHaveLength(4);
      expect(CATEGORY_CORE_FIELDS.case).toHaveLength(5);
      expect(CATEGORY_CORE_FIELDS.laptop).toHaveLength(6);

      // Verify every catalog record has coreFieldTotal matching its category
      for (const record of hardwareCatalog.byId.values()) {
        const expectedY = CATEGORY_CORE_FIELDS[record.identity.category].length;
        expect(record.auditSummary.coreFieldTotal).toBe(expectedY);
      }
    });

    it('never fabricates check dates or inflates rates for unverified items', () => {
      // Find an item without manufacturer verification, e.g. a case
      const unverifiedCase = hardwareCatalog.byId.get('case-lianli-o11d-evo') ||
        [...hardwareCatalog.byId.values()].find((r) => r.sources.length === 0)!;

      expect(unverifiedCase.auditSummary.verifiedFieldCount).toBe(0);
      expect(unverifiedCase.auditSummary.hasOfficialSource).toBe(false);
      expect(unverifiedCase.auditSummary.verificationRate).toBe(0);
      expect(unverifiedCase.auditSummary.missingCoreFields.length).toBe(
        unverifiedCase.auditSummary.coreFieldTotal
      );

      // Unverified specification fields MUST NOT have a checkedAt timestamp
      for (const spec of unverifiedCase.specifications) {
        expect(spec.verificationStatus).toBe('unverified');
        expect(spec.checkedAt).toBeUndefined();
      }
    });

    it('attaches verified facts, source metadata, and check dates to verified records', () => {
      const cpu = hardwareCatalog.byId.get('cpu-amd-9800x3d')!;
      expect(cpu).toBeDefined();
      expect(cpu.auditSummary.entityKind).toBe('reference-product');
      expect(cpu.auditSummary.hasOfficialSource).toBe(true);
      expect(cpu.auditSummary.verifiedFieldCount).toBe(7);
      expect(cpu.auditSummary.coreFieldTotal).toBe(7);
      expect(cpu.auditSummary.verificationRate).toBe(1);
      expect(cpu.auditSummary.missingCoreFields).toEqual([]);

      const verifiedSpecs = cpu.specifications.filter((s) => s.verificationStatus === 'verified');
      expect(verifiedSpecs).toHaveLength(7);
      for (const s of verifiedSpecs) {
        expect(s.sourceKind).toBe('manufacturer');
        expect(s.checkedAt).toBe('2026-09-11');
      }
    });

    it('distinguishes reference products from concrete partner variants with physical specs', () => {
      const refGpu = hardwareCatalog.byId.get('gpu-nvidia-rtx4070super')!;
      expect(refGpu).toBeDefined();
      expect(refGpu.entityKind).toBe('reference-product');
      expect(refGpu.variantDetails).toBeUndefined();

      const partnerGpu = hardwareCatalog.byId.get('gpu-colorful-rtx4070s-ultra-w')!;
      expect(partnerGpu).toBeDefined();
      expect(partnerGpu.entityKind).toBe('partner-variant');
      expect(partnerGpu.variantDetails).toBeDefined();
      expect(partnerGpu.variantDetails?.lengthMm).toBe(313.5);
      expect(partnerGpu.variantDetails?.slotThickness).toBe(2.5);
      expect(partnerGpu.variantDetails?.powerConnectors).toBe('16-pin (12VHPWR / 12V-2x6)');
    });
  });

  /* ========================================================================
   * 2. Pure Functional Tests: Unknown Values & Safe Sorting
   * ======================================================================== */
  describe('Unknown Values & Safe Comparator Defenses', () => {
    it('maps 0 TDP and missing prices to null and isKnown: false', () => {
      const dummyItem = {
        ...hardwareList[0],
        id: 'dummy-test-item',
        tdpWatts: 0,
        marketPriceRange: [0, 0] as [number, number],
      };

      const catalog = createHardwareCatalog([dummyItem]);
      const record = catalog.byId.get('dummy-test-item')!;

      expect(record.power.watts).toBeNull();
      expect(record.power.isKnown).toBe(false);
      expect(record.pricing.referenceRange.min).toBeNull();
      expect(record.pricing.referenceRange.max).toBeNull();
      expect(record.pricing.isKnownRange).toBe(false);
    });

    it('safeSortHardwareByPrice places unknown prices at the very end in asc and desc', () => {
      const items = [
        { id: 'unknown-1', marketPriceRange: [0, 0] as [number, number] },
        { id: 'expensive', marketPriceRange: [5000, 6000] as [number, number] },
        { id: 'cheap', marketPriceRange: [1000, 1200] as [number, number] },
        { id: 'unknown-2', marketPriceRange: [0, 0] as [number, number] },
      ];

      const asc = safeSortHardwareByPrice(items, true);
      expect(asc[0].id).toBe('cheap');
      expect(asc[1].id).toBe('expensive');
      expect(asc[2].id).toMatch(/unknown/);
      expect(asc[3].id).toMatch(/unknown/);

      const desc = safeSortHardwareByPrice(items, false);
      expect(desc[0].id).toBe('expensive');
      expect(desc[1].id).toBe('cheap');
      expect(desc[2].id).toMatch(/unknown/);
      expect(desc[3].id).toMatch(/unknown/);
    });

    it('safeSortHardwareByTdp places unknown watts at the end', () => {
      const items = [
        { id: 'case-no-tdp', tdpWatts: 0 },
        { id: 'high-power', tdpWatts: 450 },
        { id: 'low-power', tdpWatts: 65 },
        { id: 'another-no-tdp', tdpWatts: 0 },
      ];

      const sorted = safeSortHardwareByTdp(items);
      expect(sorted[0].id).toBe('high-power');
      expect(sorted[1].id).toBe('low-power');
      expect(sorted[2].id).toMatch(/no-tdp/);
      expect(sorted[3].id).toMatch(/no-tdp/);
    });

    it('computeCatalogCredibilityStats dynamically calculates metrics from catalog', () => {
      const stats = computeCatalogCredibilityStats(hardwareCatalog);

      expect(stats.totalItems).toBe(hardwareCatalog.ids.length);
      expect(stats.totalChipsAndSeries + stats.totalPartnerVariants).toBe(stats.totalItems);
      expect(stats.totalOfficiallyVerified).toBeGreaterThanOrEqual(6);
      expect(stats.totalPartnerVariants).toBeGreaterThanOrEqual(1);
      expect(stats.overallVerificationRate).toBeGreaterThan(0);
      expect(stats.overallVerificationRate).toBeLessThanOrEqual(1);
      expect(stats.latestVerificationDate).toBe('2026-09-11');

      // Check category details
      expect(stats.categories.cpu.officiallyVerifiedCount).toBeGreaterThanOrEqual(3);
      expect(stats.categories.gpu.partnerVariantsCount).toBeGreaterThanOrEqual(1);
      expect(stats.categories.case.totalCount).toBeGreaterThan(0);
    });
  });

  /* ========================================================================
   * 2.5. Production Regression: Audit Calibration, Strict Verification & Unknown Values
   * ======================================================================== */
  describe('Production Regression: Audit Calibration, Strict Verification & Unknown Values', () => {
    beforeEach(() => {
      window.localStorage.setItem('silicon_wiki_lang', 'zh');
    });

    afterEach(() => {
      window.localStorage.removeItem('silicon_wiki_lang');
    });

    it('extra verified fields do not inflate core verification rate (RTX 5090 is core 4/8 with 6 total verified)', () => {
      const rtx5090 = hardwareCatalog.byId.get('gpu-nvidia-rtx5090')!;
      expect(rtx5090).toBeDefined();

      // RTX 5090 has 4 verified core fields, 2 extra verified fields (Tensor 核心, AI 算力), and 8 total core fields
      expect(rtx5090.auditSummary.coreFieldTotal).toBe(8);
      expect(rtx5090.auditSummary.verifiedCoreCount).toBe(4);
      expect(rtx5090.auditSummary.verifiedFieldCount).toBe(6);

      // Verification rate must be strictly verifiedCoreCount / coreFieldTotal (4/8 = 0.5), NEVER 6/8 (0.75)!
      expect(rtx5090.auditSummary.verificationRate).toBe(0.5);

      // Missing core fields list must strictly equal coreFieldTotal - verifiedCoreCount
      expect(rtx5090.auditSummary.missingCoreFields).toHaveLength(4);
      expect(rtx5090.auditSummary.missingCoreFields).toEqual([
        '显存位宽/带宽',
        '供电接口',
        '输出接口',
        '建议电源',
      ]);
    });

    it('invalid source url, empty date, or invalid date cannot be counted as verified', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'bad-source-item',
        name: 'Bad Source Item',
      };

      const verificationWithBadSource: HardwareVerification = {
        modelName: 'Bad Source Item',
        sourceTitle: 'Bad Source',
        sourceUrl: 'javascript:alert(1)', // invalid URL protocol
        checkedAt: 'not-a-valid-date',   // invalid date format
        scope: 'Test invalid source metadata',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer' as const,
            verificationStatus: 'verified' as const,
            checkedAt: '', // empty date
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'bad-source-item' ? verificationWithBadSource : undefined)
      );
      const rec = catalog.byId.get('bad-source-item')!;

      // Because source URL and checked dates are invalid, it must NOT count as verified
      expect(rec.auditSummary.hasOfficialSource).toBe(false);
      expect(rec.auditSummary.verifiedCoreCount).toBe(0);
      expect(rec.auditSummary.verifiedFieldCount).toBe(0);
      expect(rec.auditSummary.verificationRate).toBe(0);

      const spec = rec.specifications.find((s) => s.label === '核心/线程')!;
      expect(spec.verificationStatus).toBe('unverified');
      expect(spec.evidence).toBe('editorial-reference');
      expect(spec.checkedAt).toBeUndefined();
    });

    it('explicit unverified facts do not produce manufacturer-checked evidence tag or count as verified', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'unverified-fact-item',
        name: 'Unverified Fact Item',
      };

      const verificationWithUnverifiedFact: HardwareVerification = {
        modelName: 'Unverified Fact Item',
        sourceTitle: 'Valid Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Test unverified fact',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer' as const,
            verificationStatus: 'unverified' as const,
            checkedAt: '2026-09-11',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'unverified-fact-item' ? verificationWithUnverifiedFact : undefined)
      );
      const rec = catalog.byId.get('unverified-fact-item')!;

      expect(rec.auditSummary.verifiedCoreCount).toBe(0);
      expect(rec.auditSummary.verifiedFieldCount).toBe(0);

      const spec = rec.specifications.find((s) => s.label === '核心/线程')!;
      expect(spec.verificationStatus).toBe('unverified');
      expect(spec.evidence).not.toBe('manufacturer-checked');
      expect(spec.evidence).toBe('editorial-reference');
    });

    it('third-party verified fields link to valid third-party source and not manufacturer', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'third-party-test-item',
        name: 'Third Party Test Item',
      };

      const verificationWithZol: HardwareVerification = {
        modelName: 'Third Party Test Item',
        sourceTitle: 'AMD Official Page',
        sourceUrl: 'https://www.amd.com/official',
        checkedAt: '2026-09-11',
        scope: 'Test third-party source attribution',
        zol: {
          parameterUrl: 'https://detail.zol.com.cn/cpu/index.html',
          checkedAt: '2026-09-11',
        },
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: '核心数/线程数',
            sourceKind: 'product-database' as const,
            verificationStatus: 'verified' as const,
            checkedAt: '2026-09-11',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'third-party-test-item' ? verificationWithZol : undefined)
      );
      const rec = catalog.byId.get('third-party-test-item')!;
      const spec = rec.specifications.find((s) => s.label === '核心/线程')!;

      expect(spec.sourceKind).toBe('product-database');
      expect(spec.sourceId).toBe('third-party-test-item:zol');
      expect(spec.sourceId).not.toBe('third-party-test-item:manufacturer');
    });

    it('consistently formats unrecorded prices [0, 0] across Card, Table, and Search without showing ￥0~￥0', async () => {
      const testItem: HardwareItem = {
        ...hardwareList[0],
        id: 'test-zero-price-item',
        name: 'Zero Price Test CPU',
        msrpRmb: 0,
        marketPriceRange: [0, 0],
        tdpWatts: 0,
      };

      const testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
      const testRoot = createRoot(testContainer);

      try {
        // 1. Render Card
        await act(async () => {
          testRoot.render(
            <ThemeProvider>
              <LanguageProvider>
                <HardwareCard item={testItem} />
              </LanguageProvider>
            </ThemeProvider>
          );
        });

        const cardText = testContainer.textContent || '';
        expect(cardText).not.toContain('￥0 ~ ￥0');
        expect(cardText).not.toContain('￥0~0');
        expect(cardText).toContain('暂无参考价');
        expect(cardText).not.toContain('标准功耗');
        expect(cardText).toContain('功耗未记录');

        // 2. Render Table
        await act(async () => {
          testRoot.render(
            <ThemeProvider>
              <LanguageProvider>
                <HardwareTableView items={[testItem]} />
              </LanguageProvider>
            </ThemeProvider>
          );
        });

        const tableText = testContainer.textContent || '';
        expect(tableText).not.toContain('￥0 ~ ￥0');
        expect(tableText).not.toContain('￥0~0');
        expect(tableText).toContain('暂无参考价');
        expect(tableText).not.toContain('标准功耗');
        expect(tableText).toContain('功耗未记录');

        // 3. Render SearchModal with controllable data injection
        await act(async () => {
          testRoot.render(
            <ThemeProvider>
              <LanguageProvider>
                <CustomContentProvider>
                  <SearchModal
                    isOpen={true}
                    onClose={() => {}}
                    onNavigate={() => {}}
                    hardwareItems={[testItem, ...hardwareList]}
                  />
                </CustomContentProvider>
              </LanguageProvider>
            </ThemeProvider>
          );
        });

        // Type query that matches an item with unrecorded price
        const searchInput = testContainer.querySelector('input[type="text"]') as HTMLInputElement;
        expect(searchInput).not.toBeNull();
        await act(async () => {
          const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
          descriptor?.set?.call(searchInput, 'Zero Price');
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // 1. Positively assert that the target item appears in the search results
        const titleEl = Array.from(testContainer.querySelectorAll('span')).find(
          (el) => el.textContent === 'Zero Price Test CPU'
        );
        expect(titleEl).toBeDefined();

        // 2. Locate the specific result item row DOM node for Zero Price Test CPU
        const itemRow = titleEl!.closest('.cursor-pointer');
        expect(itemRow).not.toBeNull();
        expect(itemRow!.textContent).toContain('Zero Price Test CPU');
        expect(itemRow!.textContent).toContain('暂无参考价');
        expect(itemRow!.textContent).not.toContain('￥0 ~ ￥0');
        expect(itemRow!.textContent).not.toContain('￥0~0');
        expect(itemRow!.textContent).not.toContain('￥0');
      } finally {
        await act(async () => {
          testRoot.unmount();
        });
        testContainer.remove();
      }
    });

    it('date validation rejects nonexistent calendar dates while preserving valid leap years', () => {
      // Nonexistent calendar dates
      expect(isValidCheckDate('2026-02-31')).toBe(false);
      expect(isValidCheckDate('2025-02-29')).toBe(false); // 2025 is not leap year
      expect(isValidCheckDate('2026-04-31')).toBe(false); // April has 30 days
      expect(isValidCheckDate('2026-06-31')).toBe(false); // June has 30 days
      expect(isValidCheckDate('2026-09-31')).toBe(false); // September has 30 days
      expect(isValidCheckDate('2026-11-31')).toBe(false); // November has 30 days
      expect(isValidCheckDate('2026-13-01')).toBe(false); // Month 13
      expect(isValidCheckDate('2026-00-10')).toBe(false); // Month 0

      // Valid dates and leap years
      expect(isValidCheckDate('2024-02-29')).toBe(true); // 2024 is leap year
      expect(isValidCheckDate('2020-02-29')).toBe(true); // 2020 is leap year
      expect(isValidCheckDate('2026-09-11')).toBe(true);
      expect(isValidCheckDate('2024-11-07')).toBe(true);
    });

    it('unified price validity: [0, 1000] is unknown across catalog, formatting, and sorting, along with NaN, Infinity, inverted, and missing endpoints', () => {
      // 0. Direct helper checks
      expect(isValidPriceRange([0, 1000])).toBe(false);
      expect(isValidPriceRange([0, 0])).toBe(false);
      expect(isValidPriceRange([1000, 2000])).toBe(true);

      // 1. [0, 1000] in catalog
      const dummyPartialZero: HardwareItem = {
        ...hardwareList[0],
        id: 'partial-zero-price-item',
        name: 'Partial Zero Item',
        marketPriceRange: [0, 1000],
      };
      const catalog = createHardwareCatalog([dummyPartialZero]);
      const rec = catalog.byId.get('partial-zero-price-item')!;
      expect(rec.pricing.isKnownRange).toBe(false);
      expect(rec.pricing.referenceRange.min).toBeNull();
      expect(rec.pricing.referenceRange.max).toBeNull();

      // 2. [0, 1000] in formatting
      expect(formatHardwarePrice([0, 1000], 'zh')).toBe('暂无参考价');
      expect(formatHardwarePrice([0, 1000], 'en')).toBe('Price unrecorded');

      // 3. NaN, Infinity, inverted ranges, and missing endpoints in formatting
      expect(formatHardwarePrice([NaN, 1000] as any)).toBe('暂无参考价');
      expect(formatHardwarePrice([Infinity, 1000] as any)).toBe('暂无参考价');
      expect(formatHardwarePrice([1000, Infinity] as any)).toBe('暂无参考价');
      expect(formatHardwarePrice([2000, 1000])).toBe('暂无参考价'); // inverted
      expect(formatHardwarePrice([null, 1000] as any)).toBe('暂无参考价');
      expect(formatHardwarePrice([1000, null] as any)).toBe('暂无参考价');
      expect(formatHardwarePrice([] as any)).toBe('暂无参考价');

      // 4. Sorting: [0, 1000], [0, 0], [NaN, 1000] are all placed at the end in both asc and desc
      const items = [
        { ...dummyPartialZero, id: 'unknown-0-1000', marketPriceRange: [0, 1000] as [number, number] },
        { ...dummyPartialZero, id: 'known-mid', marketPriceRange: [2000, 2500] as [number, number] },
        { ...dummyPartialZero, id: 'known-low', marketPriceRange: [500, 600] as [number, number] },
        { ...dummyPartialZero, id: 'unknown-0-0', marketPriceRange: [0, 0] as [number, number] },
      ];
      const sortedAsc = safeSortHardwareByPrice(items, true);
      expect(sortedAsc[0].id).toBe('known-low');
      expect(sortedAsc[1].id).toBe('known-mid');
      expect(['unknown-0-1000', 'unknown-0-0']).toContain(sortedAsc[2].id);
      expect(['unknown-0-1000', 'unknown-0-0']).toContain(sortedAsc[3].id);

      const sortedDesc = safeSortHardwareByPrice(items, false);
      expect(sortedDesc[0].id).toBe('known-mid');
      expect(sortedDesc[1].id).toBe('known-low');
      expect(['unknown-0-1000', 'unknown-0-0']).toContain(sortedDesc[2].id);
      expect(['unknown-0-1000', 'unknown-0-0']).toContain(sortedDesc[3].id);
    });

    it('power evidence requires valid official source and check date, not just matching tdpWatts', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'bad-power-source-item',
        name: 'Bad Power Source Item',
        tdpWatts: 150,
      };

      // Verified has matching tdpWatts, BUT invalid check date (nonexistent date 2026-02-31)
      const verificationWithBadDate: HardwareVerification = {
        modelName: 'Bad Power Source Item',
        sourceTitle: 'Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-02-31', // invalid date!
        scope: 'Test power evidence validation',
        fields: {},
        tdpWatts: 150,
        powerSourceField: 'TDP',
      };

      const catalogBadDate = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'bad-power-source-item' ? verificationWithBadDate : undefined)
      );
      const rec1 = catalogBadDate.byId.get('bad-power-source-item')!;
      expect(rec1.power.evidence).not.toBe('manufacturer-checked');
      expect(rec1.power.evidence).toBe('editorial-reference');

      // Verified has matching tdpWatts, BUT invalid sourceUrl
      const verificationWithBadUrl: HardwareVerification = {
        modelName: 'Bad Power Source Item',
        sourceTitle: 'Official Spec',
        sourceUrl: 'javascript:alert(1)', // invalid url!
        checkedAt: '2026-09-11',
        scope: 'Test power evidence validation',
        fields: {},
        tdpWatts: 150,
        powerSourceField: 'TDP',
      };
      const catalogBadUrl = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'bad-power-source-item' ? verificationWithBadUrl : undefined)
      );
      const rec2 = catalogBadUrl.byId.get('bad-power-source-item')!;
      expect(rec2.power.evidence).not.toBe('manufacturer-checked');
      expect(rec2.power.evidence).toBe('editorial-reference');
    });

    it('associates power evidence strictly with the verified power specification fact', () => {
      const baseCpu: HardwareItem = {
        ...hardwareList[0],
        id: 'power-spec-test-cpu',
        name: 'Power Spec Test CPU',
        category: 'cpu',
        tdpWatts: 120,
        specs: {
          '核心/线程': '8 核 / 16 线程',
          '基础功耗 / 最大睿频功耗': '120W TDP',
        },
      };

      // 1. Counterexample 1: CPU with valid official source and verified core/thread field,
      // but power field is explicitly unverified -> power.evidence must be 'editorial-reference'
      const verExplicitUnverified: HardwareVerification = {
        modelName: 'Power Spec Test CPU',
        sourceTitle: 'AMD Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Power unverified counterexample',
        tdpWatts: 120,
        powerSourceField: 'Default TDP',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            verificationStatus: 'unverified',
          },
        },
      };

      const cat1 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verExplicitUnverified : undefined));
      const rec1 = cat1.byId.get(baseCpu.id)!;
      expect(rec1.power.evidence).toBe('editorial-reference');

      // 2. Counterexample 2: CPU with valid official source and verified core/thread field,
      // but power field was only verified by third-party database (zol) -> power.evidence must NOT be manufacturer-checked
      const verThirdPartyPower: HardwareVerification = {
        modelName: 'Power Spec Test CPU',
        sourceTitle: 'AMD Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Power third-party counterexample',
        tdpWatts: 120,
        powerSourceField: 'Default TDP',
        zol: {
          parameterUrl: 'https://detail.zol.com.cn/cpu/param.shtml',
          checkedAt: '2026-09-11',
        },
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'ZOL TDP',
            sourceKind: 'product-database',
            sourceId: `${baseCpu.id}:zol`,
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };

      const cat2 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verThirdPartyPower : undefined));
      const rec2 = cat2.byId.get(baseCpu.id)!;
      expect(rec2.power.evidence).toBe('editorial-reference');

      // 3. Counterexample 3: CPU with valid official source, but power field has invalid/nonexistent sourceId
      // and degraded to unverified -> power.evidence must be 'editorial-reference'
      const verBadSourceIdPower: HardwareVerification = {
        modelName: 'Power Spec Test CPU',
        sourceTitle: 'AMD Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Power bad sourceId counterexample',
        tdpWatts: 120,
        powerSourceField: 'Default TDP',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            sourceId: 'nonexistent-power-source-id',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };

      const cat3 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verBadSourceIdPower : undefined));
      const rec3 = cat3.byId.get(baseCpu.id)!;
      expect(rec3.power.evidence).toBe('editorial-reference');

      // 4. Positive Example: CPU with valid official source, matching wattage, and verified manufacturer-checked power spec
      const verOfficialPower: HardwareVerification = {
        modelName: 'Power Spec Test CPU',
        sourceTitle: 'AMD Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Power verified positive example',
        tdpWatts: 120,
        powerSourceField: 'Default TDP',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            numericValue: 120,
            unit: 'W',
            condition: '默认 TDP',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };

      const cat4 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verOfficialPower : undefined));
      const rec4 = cat4.byId.get(baseCpu.id)!;
      expect(rec4.power.evidence).toBe('manufacturer-checked');
      expect(rec4.power.watts).toBe(120);
      expect(rec4.power.meaning).toBe('Default TDP');

      // 5. Numeric value mismatch: fact.numericValue is 65 while item.tdpWatts is 120 -> editorial-reference
      const verNumericMismatch: HardwareVerification = {
        ...verOfficialPower,
        fields: {
          ...verOfficialPower.fields,
          '基础功耗 / 最大睿频功耗': {
            ...verOfficialPower.fields['基础功耗 / 最大睿频功耗'],
            numericValue: 65,
          },
        },
      };
      const cat5 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verNumericMismatch : undefined));
      const rec5 = cat5.byId.get(baseCpu.id)!;
      expect(rec5.power.evidence).toBe('editorial-reference');

      // 6. Unit mismatch: fact.unit is 'A' (current) rather than watts -> editorial-reference
      const verUnitMismatch: HardwareVerification = {
        ...verOfficialPower,
        fields: {
          ...verOfficialPower.fields,
          '基础功耗 / 最大睿频功耗': {
            ...verOfficialPower.fields['基础功耗 / 最大睿频功耗'],
            unit: 'A',
          },
        },
      };
      const cat6 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verUnitMismatch : undefined));
      const rec6 = cat6.byId.get(baseCpu.id)!;
      expect(rec6.power.evidence).toBe('editorial-reference');

      // 7. Category/concept conflation: CPU item assigned gpu.tgp (TGP cannot endorse CPU TDP) -> editorial-reference
      const cpuWithTgp: HardwareItem = {
        ...baseCpu,
        specs: {
          '核心/线程': '8 核 / 16 线程',
          '整卡功耗 (TGP/TBP)': '120W TGP',
        },
      };
      const verConflatedCategory: HardwareVerification = {
        ...verOfficialPower,
        powerSourceField: 'Total Graphics Power (W)',
        fields: {
          '核心/线程': verOfficialPower.fields['核心/线程'],
          '整卡功耗 (TGP/TBP)': {
            fieldId: 'gpu.tgp',
            value: '120W TGP',
            sourceField: 'Total Graphics Power (W)',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };
      const cat7 = createHardwareCatalog([cpuWithTgp], (id) => (id === cpuWithTgp.id ? verConflatedCategory : undefined));
      const rec7 = cat7.byId.get(cpuWithTgp.id)!;
      expect(rec7.power.evidence).toBe('editorial-reference');

      // 8. Regression A: Spec text is "65W TDP", missing numericValue / unit,
      // while top-level tdpWatts is 120 -> must degrade to editorial-reference
      const cpuWith65wText: HardwareItem = {
        ...baseCpu,
        specs: {
          ...baseCpu.specs,
          '基础功耗 / 最大睿频功耗': '65W TDP',
        },
      };
      const verTextDiscrepancyMissingNumeric: HardwareVerification = {
        ...verOfficialPower,
        fields: {
          ...verOfficialPower.fields,
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '65W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
            // numericValue and unit explicitly omitted / undefined
          },
        },
      };
      const cat8 = createHardwareCatalog([cpuWith65wText], (id) => (id === cpuWith65wText.id ? verTextDiscrepancyMissingNumeric : undefined));
      const rec8 = cat8.byId.get(cpuWith65wText.id)!;
      expect(rec8.power.evidence).toBe('editorial-reference');

      // 9. Regression B: GPU has NO gpu.tgp, only verified gpu.recommendedPsu = 650W.
      // Even if powerSourceField points to recommended PSU and tdpWatts is 650,
      // gpu.recommendedPsu can NEVER endorse power -> must be editorial-reference
      const baseGpu: HardwareItem = {
        ...hardwareList[0],
        id: 'psu-power-check-gpu',
        name: 'PSU Power Check GPU',
        category: 'gpu',
        tdpWatts: 650,
        specs: {
          '建议电源': '650W 及以上',
        },
      };
      const verGpuOnlyRecommendedPsu: HardwareVerification = {
        modelName: 'PSU Power Check GPU',
        sourceTitle: 'Official Spec',
        sourceUrl: 'https://www.nvidia.com/spec',
        checkedAt: '2026-09-11',
        scope: 'GPU recommended PSU counterexample',
        tdpWatts: 650,
        powerSourceField: '建议电源',
        fields: {
          '建议电源': {
            fieldId: 'gpu.recommendedPsu',
            value: '650W 及以上',
            sourceField: '建议电源',
            sourceKind: 'manufacturer',
            numericValue: 650,
            unit: 'W',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };
      const cat9 = createHardwareCatalog([baseGpu], (id) => (id === baseGpu.id ? verGpuOnlyRecommendedPsu : undefined));
      const rec9 = cat9.byId.get(baseGpu.id)!;
      expect(rec9.power.evidence).toBe('editorial-reference');

      // 10. Missing numericValue alone (even with unit: 'W') -> editorial-reference
      const verMissingNumericAlone: HardwareVerification = {
        ...verOfficialPower,
        fields: {
          ...verOfficialPower.fields,
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            unit: 'W',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };
      const cat10 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verMissingNumericAlone : undefined));
      const rec10 = cat10.byId.get(baseCpu.id)!;
      expect(rec10.power.evidence).toBe('editorial-reference');

      // 11. Missing unit alone (even with numericValue: 120) -> editorial-reference
      const verMissingUnitAlone: HardwareVerification = {
        ...verOfficialPower,
        fields: {
          ...verOfficialPower.fields,
          '基础功耗 / 最大睿频功耗': {
            fieldId: 'cpu.defaultTdp',
            value: '120W TDP',
            sourceField: 'Default TDP',
            sourceKind: 'manufacturer',
            numericValue: 120,
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
      };
      const cat11 = createHardwareCatalog([baseCpu], (id) => (id === baseCpu.id ? verMissingUnitAlone : undefined));
      const rec11 = cat11.byId.get(baseCpu.id)!;
      expect(rec11.power.evidence).toBe('editorial-reference');
    });

    it('explicit sourceId rejects nonexistent IDs and sourceKind conflicts without fallback', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'source-id-check-item',
        name: 'Source ID Check Item',
      };

      // 1. Explicit sourceId does NOT exist -> must degrade to unverified and NOT fallback to manufacturer
      const verificationNonexistentSourceId: HardwareVerification = {
        modelName: 'Source ID Check Item',
        sourceTitle: 'Valid Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Test explicit invalid sourceId',
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
            sourceId: 'completely-non-existent-source-id',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog1 = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'source-id-check-item' ? verificationNonexistentSourceId : undefined)
      );
      const rec1 = catalog1.byId.get('source-id-check-item')!;
      const spec1 = rec1.specifications.find((s) => s.label === '核心/线程')!;
      expect(spec1.verificationStatus).toBe('unverified');
      expect(spec1.evidence).toBe('editorial-reference');
      expect(rec1.auditSummary.verifiedFieldCount).toBe(0);

      // 2. Conflict: sourceId points to a third-party source (zol), but fact.sourceKind claims 'manufacturer'
      const verificationKindConflict: HardwareVerification = {
        modelName: 'Source ID Check Item',
        sourceTitle: 'Valid Official Spec',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Test kind conflict',
        zol: {
          parameterUrl: 'https://detail.zol.com.cn/cpu/index.html',
          checkedAt: '2026-09-11',
        },
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'manufacturer', // Claiming manufacturer!
            sourceId: 'source-id-check-item:zol', // But sourceId points to product-database!
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog2 = createHardwareCatalog(
        [dummyItem],
        (id) => (id === 'source-id-check-item' ? verificationKindConflict : undefined)
      );
      const rec2 = catalog2.byId.get('source-id-check-item')!;
      const spec2 = rec2.specifications.find((s) => s.label === '核心/线程')!;
      // Conflict must degrade to unverified, cannot label third-party link as manufacturer!
      expect(spec2.verificationStatus).toBe('unverified');
      expect(spec2.evidence).toBe('editorial-reference');
      expect(rec2.auditSummary.verifiedFieldCount).toBe(0);
    });

    it('credibility stats: having official link but only third-party verified fields does not count as officially verified', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'tp-only-verified-item',
        name: 'Third Party Only Verified Item',
      };

      const verification: HardwareVerification = {
        modelName: 'Third Party Only Verified Item',
        sourceTitle: 'Official AMD Spec Link',
        sourceUrl: 'https://www.amd.com/spec',
        checkedAt: '2026-09-11',
        scope: 'Only third-party fields verified',
        zol: {
          parameterUrl: 'https://detail.zol.com.cn/cpu/index.html',
          checkedAt: '2026-09-11',
        },
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'product-database',
            verificationStatus: 'verified',
            checkedAt: '2026-09-11',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog = createHardwareCatalog([dummyItem], () => verification);
      const stats = computeCatalogCredibilityStats(catalog);

      // Must NOT count as officially verified, because 0 official fields are verified!
      expect(stats.totalOfficiallyVerified).toBe(0);
      expect(stats.categories.cpu.officiallyVerifiedCount).toBe(0);

      // Must count as third-party verified!
      expect(stats.totalThirdPartyVerified).toBe(1);
      expect(stats.categories.cpu.thirdPartyVerifiedCount).toBe(1);
    });

    it('credibility stats: having only third-party link with zero verified fields does not count as third-party verified', () => {
      const dummyItem: HardwareItem = {
        ...hardwareList[0],
        id: 'link-only-item',
        name: 'Link Only Item',
      };

      const verificationLinkOnly: HardwareVerification = {
        modelName: 'Link Only Item',
        sourceTitle: 'Reference Link',
        sourceUrl: 'https://example.com/unverified',
        checkedAt: '2026-09-11',
        scope: 'Only link, zero verified fields',
        zol: {
          parameterUrl: 'https://detail.zol.com.cn/cpu/index.html',
          checkedAt: '2026-09-11',
        },
        fields: {
          '核心/线程': {
            fieldId: 'cpu.coresThreads',
            value: dummyItem.specs['核心/线程'] || '8 核 / 16 线程',
            sourceField: 'Cores',
            sourceKind: 'product-database',
            verificationStatus: 'unverified', // unverified!
            checkedAt: '2026-09-11',
          },
        },
        tdpWatts: 120,
        powerSourceField: 'TDP',
      };

      const catalog = createHardwareCatalog([dummyItem], () => verificationLinkOnly);
      const stats = computeCatalogCredibilityStats(catalog);

      // Cannot count as third-party verified when verified fields is 0!
      expect(stats.totalThirdPartyVerified).toBe(0);
      expect(stats.categories.cpu.thirdPartyVerifiedCount).toBe(0);
      expect(stats.totalOfficiallyVerified).toBe(0);

      // Since it has sources/links, it falls into editorial reference
      expect(stats.totalEditorialReference).toBe(1);
      expect(stats.categories.cpu.editorialReferenceCount).toBe(1);
    });

    it('table view places unknown prices at the end in both asc and desc sorts', async () => {
      const itemCheap: HardwareItem = {
        ...hardwareList[0],
        id: 'test-cheap',
        name: 'Alpha Cheap Item',
        marketPriceRange: [1000, 1200],
      };
      const itemExpensive: HardwareItem = {
        ...hardwareList[0],
        id: 'test-expensive',
        name: 'Beta Expensive Item',
        marketPriceRange: [5000, 6000],
      };
      const itemUnknown: HardwareItem = {
        ...hardwareList[0],
        id: 'test-unknown',
        name: 'Gamma Unknown Item',
        marketPriceRange: [0, 0],
      };

      const testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
      const testRoot = createRoot(testContainer);

      try {
        await act(async () => {
          testRoot.render(
            <ThemeProvider>
              <LanguageProvider>
                <HardwareTableView items={[itemUnknown, itemExpensive, itemCheap]} />
              </LanguageProvider>
            </ThemeProvider>
          );
        });

        const priceHeader = Array.from(testContainer.querySelectorAll('th')).find((th) =>
          th.textContent?.includes('参考均价') || th.textContent?.includes('价格') || th.textContent?.includes('Price')
        );
        expect(priceHeader, 'Price header must exist').toBeDefined();

        // 1st click -> Descending sort
        await act(async () => {
          priceHeader!.click();
        });

        let rows = Array.from(testContainer.querySelectorAll('tbody tr'));
        expect(rows[0].textContent).toContain('Beta Expensive Item');
        expect(rows[1].textContent).toContain('Alpha Cheap Item');
        expect(rows[2].textContent).toContain('Gamma Unknown Item'); // Unknown MUST be last!

        // 2nd click -> Ascending sort
        await act(async () => {
          priceHeader!.click();
        });

        rows = Array.from(testContainer.querySelectorAll('tbody tr'));
        expect(rows[0].textContent).toContain('Alpha Cheap Item');
        expect(rows[1].textContent).toContain('Beta Expensive Item');
        expect(rows[2].textContent).toContain('Gamma Unknown Item'); // Unknown MUST STILL be last!
      } finally {
        await act(async () => {
          testRoot.unmount();
        });
        testContainer.remove();
      }
    });

    it('unverified physical parameters are not presented as verified', () => {
      const partnerGpu = hardwareCatalog.byId.get('gpu-colorful-rtx4070s-ultra-w')!;
      expect(partnerGpu).toBeDefined();

      // Connector in partner variant details must be consistent with specs
      expect(partnerGpu.variantDetails?.powerConnectors).toBe('16-pin (12VHPWR / 12V-2x6)');

      // If an item has unverified physical specs, they must not be marked verified
      const unverifiedItem = hardwareCatalog.byId.get('case-lianli-o11d-evo-rgb')!;
      for (const spec of unverifiedItem.specifications) {
        expect(spec.verificationStatus).toBe('unverified');
        expect(spec.evidence).toBe('editorial-reference');
      }
    });
  });

  /* ========================================================================
   * 3. Real DOM Integration Tests in happy-dom: Dialogs & Inspection Flows
   * ======================================================================== */
  describe('Real Component DOM Rendering & User Interaction', () => {
    let container: HTMLDivElement | null = null;
    let root: Root | null = null;

    beforeEach(() => {
      window.localStorage.setItem('silicon_wiki_lang', 'zh');
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
    });

    afterEach(async () => {
      window.localStorage.removeItem('silicon_wiki_lang');
      if (root) {
        await act(async () => {
          root?.unmount();
        });
        root = null;
      }
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        container = null;
      }
    });

    async function mountApp() {
      await act(async () => {
        root!.render(<App />);
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 60));
      });
    }

    it('opens and closes Data Credibility Modal from toolbar with real metrics', async () => {
      await mountApp();

      // Locate the Data Credibility button in the toolbar
      const credBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('数据可信度')
      );
      expect(credBtn, 'Data Credibility button must exist on toolbar').toBeDefined();

      // Click button to open modal
      await act(async () => {
        credBtn!.click();
      });

      // Verify modal dialog is rendered
      const dialog = container!.querySelector('[role="dialog"][aria-labelledby="credibility-modal-title"]');
      expect(dialog).not.toBeNull();
      expect(dialog!.textContent).toContain('数据可信度与规格核验状态汇总');
      expect(dialog!.textContent).toContain('收录硬件总数');
      expect(dialog!.textContent).toContain('原厂官方核验');
      expect(dialog!.textContent).toContain('非公卡/独立变体');

      // Check category breakdown table exists in dialog
      expect(dialog!.textContent).toContain('分品类核验进度与实体覆盖表');
      expect(dialog!.textContent).toContain('处理器 (CPU)');
      expect(dialog!.textContent).toContain('显卡 (GPU)');

      // Click the Done / close button
      const closeBtn = Array.from(dialog!.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('完成') || b.getAttribute('aria-label')?.includes('关闭')
      );
      expect(closeBtn).toBeDefined();

      await act(async () => {
        closeBtn!.click();
      });

      // Assert modal is closed
      const closedDialog = container!.querySelector('[role="dialog"][aria-labelledby="credibility-modal-title"]');
      expect(closedDialog).toBeNull();
    });

    it('renders field verification badges, partner physical specs, and checkedAt in detail modal', async () => {
      // Direct link to the partner variant: 七彩虹 iGame RTX 4070 SUPER Ultra W
      window.location.href = 'https://computer-wiki.vercel.app/?hardware=gpu-colorful-rtx4070s-ultra-w#/wiki';
      window.history.replaceState(
        { swDetail: true, hardware: 'gpu-colorful-rtx4070s-ultra-w', tab: 'wiki' },
        '',
        '/?hardware=gpu-colorful-rtx4070s-ultra-w#/wiki'
      );

      await mountApp();

      // Detail modal dialog should be mounted
      const detailModal = container!.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailModal, 'Detail modal should be mounted from URL').not.toBeNull();

      // Verify Entity Kind & Credibility Badges in Header
      expect(detailModal!.textContent).toContain('七彩虹 iGame GeForce RTX 4070 SUPER Ultra W OC 12GB');
      expect(detailModal!.textContent).toContain('品牌非公版');
      expect(detailModal!.textContent).toMatch(/已核验 \d+\/8 项/);

      // Switch to TAB 3: Full Tech Specs
      const specsTabBtn = detailModal!.querySelector('[data-detail-tab="specs"]') as HTMLButtonElement;
      expect(specsTabBtn).not.toBeNull();

      await act(async () => {
        specsTabBtn.click();
      });

      // Check Evidence section
      const evidenceSection = detailModal!.querySelector('[data-hardware-evidence]');
      expect(evidenceSection).not.toBeNull();
      expect(evidenceSection!.textContent).toContain('数据来源与核验范围');
      expect(evidenceSection!.textContent).toContain('品牌非公版变体');
      expect(evidenceSection!.textContent).toContain('非公卡专属物理参数提示');
      expect(evidenceSection!.textContent).toContain('313.5mm');
      expect(evidenceSection!.textContent).toContain('2.5槽');
      expect(evidenceSection!.textContent).toContain('16-pin');

      // Check verified fields list and check date in evidence
      expect(evidenceSection!.textContent).toContain('2026-09-11');
      expect(evidenceSection!.textContent).toContain('七彩虹官方 iGame GeForce RTX 4070 SUPER Ultra W OC 规格');

      // Close the modal
      const closeDetailBtn = detailModal!.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      expect(closeDetailBtn).not.toBeNull();

      await act(async () => {
        closeDetailBtn.click();
      });

      expect(container!.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();
    });
  });
});
