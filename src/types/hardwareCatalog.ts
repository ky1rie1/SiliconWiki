import type { HardwareCategory, HardwareItem } from './index';

export interface HardwareSource {
  id: string;
  title: string;
  url: string;
  kind: 'manufacturer' | 'product-database';
  checkedAt: string;
}

/** Canonical read model. Missing measurements remain missing, never derived from price. */
export interface HardwareRecord {
  schemaVersion: 1;
  identity: Pick<HardwareItem, 'id' | 'name' | 'brand' | 'category' | 'series' | 'releaseYear'> & { platform: 'desktop' | 'laptop' };
  specifications: Array<{
    id: string;
    label: string;
    value: string;
    evidence: 'manufacturer-checked' | 'editorial-reference';
    sourceId?: string;
    sourceField?: string;
  }>;
  sources: HardwareSource[];
  power: { watts: number | null; evidence: 'manufacturer-checked' | 'editorial-reference'; meaning: string };
  pricing: {
    currency: 'CNY';
    evidence: 'editorial-reference';
    referenceRange: { min: number; max: number };
    launchReference: number | null;
    history: Array<{ label: string; amount: number }>;
  };
  benchmarks: { evidence: 'editorial-reference'; scores: NonNullable<HardwareItem['benchmarks']> };
  links: { documents: NonNullable<HardwareItem['docsLinks']>; reviews: NonNullable<HardwareItem['reviewLinks']> };
}

export interface HardwareCatalog {
  schemaVersion: 1;
  ids: string[];
  byId: ReadonlyMap<string, HardwareRecord>;
  byCategory: ReadonlyMap<HardwareCategory, readonly string[]>;
}
