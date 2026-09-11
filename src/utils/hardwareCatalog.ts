import type { HardwareItem } from '../types';
import type { HardwareCatalog, HardwareRecord } from '../types/hardwareCatalog';
import type { HardwareVerification } from '../types/hardwareSources';

const finitePositive = (value: number | undefined): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;
const safeLink = (value: { url: string }) => {
  try { const url = new URL(value.url); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
};

/** Ingestion boundary: exact identities, stable fact IDs, explicit evidence and separate prices. */
export function createHardwareCatalog(items: readonly HardwareItem[], verificationFor?: (id: string) => HardwareVerification | undefined): HardwareCatalog {
  const byId = new Map<string, HardwareRecord>();
  const byCategory = new Map<HardwareItem['category'], string[]>();
  for (const item of items) {
    if (!item.id || byId.has(item.id)) throw new Error(`Duplicate or missing hardware ID: ${item.id}`);
    const [min, max] = item.marketPriceRange;
    if (![min, max].every(value => Number.isFinite(value) && value >= 0) || min > max) throw new Error(`Invalid price range: ${item.id}`);
    const candidate = verificationFor?.(item.id);
    const verified = candidate?.modelName === item.name ? candidate : undefined;
    const sourceId = `${item.id}:manufacturer`;
    const sources: HardwareRecord['sources'] = verified ? [{ id: sourceId, title: verified.sourceTitle, url: verified.sourceUrl, checkedAt: verified.checkedAt, kind: 'manufacturer' }] : [];
    if (verified?.zol) sources.push({ id: `${item.id}:zol`, title: 'ZOL product parameters', url: verified.zol.parameterUrl, checkedAt: verified.zol.checkedAt, kind: 'product-database' });
    const specifications: HardwareRecord['specifications'] = Object.entries(item.specs).map(([label, value]) => {
      const candidateFact = verified?.fields[label];
      const fact = candidateFact?.value === value ? candidateFact : undefined;
      return { id: fact?.fieldId || `catalog:${item.category}:${encodeURIComponent(label)}`, label, value,
        evidence: fact ? 'manufacturer-checked' : 'editorial-reference', ...(fact ? { sourceId, sourceField: fact.sourceField } : {}) };
    });
    const scores = Object.fromEntries(Object.entries(item.benchmarks || {}).filter(([, value]) => finitePositive(value)));
    const record: HardwareRecord = {
      schemaVersion: 1,
      identity: { id: item.id, name: item.name, brand: item.brand, category: item.category, series: item.series, releaseYear: item.releaseYear, platform: item.isLaptop || item.category === 'laptop' ? 'laptop' : 'desktop' },
      specifications, sources,
      power: { watts: finitePositive(item.tdpWatts) ? item.tdpWatts : null, evidence: verified && verified.tdpWatts === item.tdpWatts ? 'manufacturer-checked' : 'editorial-reference', meaning: verified?.powerSourceField || 'Catalog power reference; meaning depends on component category' },
      pricing: { currency: 'CNY', evidence: 'editorial-reference', referenceRange: { min, max }, launchReference: finitePositive(item.msrpRmb) ? item.msrpRmb : null,
        history: (item.priceHistory || []).filter(entry => entry.date && finitePositive(entry.price)).map(entry => ({ label: entry.date, amount: entry.price })) },
      benchmarks: { evidence: 'editorial-reference', scores },
      links: { documents: (item.docsLinks || []).filter(safeLink).map(link => ({ ...link })), reviews: (item.reviewLinks || []).filter(safeLink).map(link => ({ ...link })) },
    };
    byId.set(item.id, record);
    const categoryIds = byCategory.get(item.category) || []; categoryIds.push(item.id); byCategory.set(item.category, categoryIds);
  }
  return { schemaVersion: 1, ids: [...byId.keys()], byId, byCategory };
}
