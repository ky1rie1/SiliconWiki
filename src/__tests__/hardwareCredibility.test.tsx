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
} from '../utils/hardwareCatalog';
import { computeCatalogCredibilityStats } from '../utils/dataCredibilityStats';

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
      expect(partnerGpu.variantDetails?.powerConnectors).toBe('16-pin (12V-2x6)');
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
