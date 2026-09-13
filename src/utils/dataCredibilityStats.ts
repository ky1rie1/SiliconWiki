import type { HardwareCategory } from '../types';
import type { HardwareCatalog } from '../types/hardwareCatalog';

export interface CategoryCredibilityStats {
  category: HardwareCategory;
  totalCount: number;
  chipsAndSeriesCount: number;
  partnerVariantsCount: number;
  officiallyVerifiedCount: number;
  thirdPartyVerifiedCount: number;
  editorialReferenceCount: number;
  unverifiedCount: number;
  averageVerificationRate: number; // 0.0 to 1.0
  knownPowerCount: number;
  knownPriceCount: number;
}

export interface CatalogCredibilityStats {
  totalItems: number;
  totalChipsAndSeries: number;
  totalPartnerVariants: number;
  totalOfficiallyVerified: number;
  totalThirdPartyVerified: number;
  totalEditorialReference: number;
  overallVerificationRate: number;
  categories: Record<HardwareCategory, CategoryCredibilityStats>;
  latestVerificationDate: string | null;
}

const CATEGORIES: HardwareCategory[] = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'cooler',
  'case',
  'laptop',
];

/**
 * Computes dynamic credibility and verification metrics across the hardware catalog.
 * Numbers are aggregated in real time directly from the underlying data model.
 */
export function computeCatalogCredibilityStats(catalog: HardwareCatalog): CatalogCredibilityStats {
  let totalChipsAndSeries = 0;
  let totalPartnerVariants = 0;
  let totalOfficiallyVerified = 0;
  let totalThirdPartyVerified = 0;
  let totalEditorialReference = 0;
  let sumVerificationRate = 0;
  let latestDate: string | null = null;

  const categoryMap: Record<HardwareCategory, CategoryCredibilityStats> = {} as any;

  for (const cat of CATEGORIES) {
    categoryMap[cat] = {
      category: cat,
      totalCount: 0,
      chipsAndSeriesCount: 0,
      partnerVariantsCount: 0,
      officiallyVerifiedCount: 0,
      thirdPartyVerifiedCount: 0,
      editorialReferenceCount: 0,
      unverifiedCount: 0,
      averageVerificationRate: 0,
      knownPowerCount: 0,
      knownPriceCount: 0,
    };
  }

  for (const record of catalog.byId.values()) {
    const catStats = categoryMap[record.identity.category] || categoryMap.cpu;
    catStats.totalCount++;

    // 1. Entity classification (Chips / Series Reference vs Concrete Retail Variants)
    if (record.entityKind === 'partner-variant') {
      catStats.partnerVariantsCount++;
      totalPartnerVariants++;
    } else {
      catStats.chipsAndSeriesCount++;
      totalChipsAndSeries++;
    }

    // 2. Verification tier for this hardware item
    if (record.auditSummary.hasOfficialSource && record.auditSummary.verifiedFieldCount > 0) {
      catStats.officiallyVerifiedCount++;
      totalOfficiallyVerified++;
    } else if (record.sources.some((s) => s.kind === 'product-database')) {
      catStats.thirdPartyVerifiedCount++;
      totalThirdPartyVerified++;
    } else if (record.sources.length > 0 || record.specifications.some((s) => s.sourceKind === 'editorial')) {
      catStats.editorialReferenceCount++;
      totalEditorialReference++;
    } else {
      catStats.unverifiedCount++;
    }

    // 3. Known measurements check (avoiding defaulting missing to 0)
    if (record.power.isKnown && record.power.watts !== null) {
      catStats.knownPowerCount++;
    }
    if (record.pricing.isKnownRange && record.pricing.referenceRange.min !== null) {
      catStats.knownPriceCount++;
    }

    // 4. Verification rates & latest verification date
    sumVerificationRate += record.auditSummary.verificationRate;
    if (record.auditSummary.lastCheckedAt) {
      if (!latestDate || record.auditSummary.lastCheckedAt > latestDate) {
        latestDate = record.auditSummary.lastCheckedAt;
      }
    }
  }

  // Calculate per-category averages
  for (const cat of CATEGORIES) {
    const c = categoryMap[cat];
    if (c.totalCount > 0) {
      let catRateSum = 0;
      const ids = catalog.byCategory.get(cat) || [];
      for (const id of ids) {
        const rec = catalog.byId.get(id);
        if (rec) catRateSum += rec.auditSummary.verificationRate;
      }
      c.averageVerificationRate = Math.round((catRateSum / c.totalCount) * 100) / 100;
    }
  }

  const totalItems = catalog.ids.length;
  const overallVerificationRate =
    totalItems > 0 ? Math.round((sumVerificationRate / totalItems) * 100) / 100 : 0;

  return {
    totalItems,
    totalChipsAndSeries,
    totalPartnerVariants,
    totalOfficiallyVerified,
    totalThirdPartyVerified,
    totalEditorialReference,
    overallVerificationRate,
    categories: categoryMap,
    latestVerificationDate: latestDate,
  };
}
