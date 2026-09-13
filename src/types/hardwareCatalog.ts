import type { HardwareCategory, HardwareItem } from './index';
import type { SourceKind, VerificationStatus, EntityKind } from './hardwareSources';

export interface HardwareSource {
  id: string;
  title: string;
  url: string;
  kind: SourceKind;
  checkedAt: string;
}

export interface SpecificationRecord {
  id: string;
  label: string;
  value: string;
  unit?: string;
  numericValue?: number | null;
  /** Backward compatible evidence tag */
  evidence: 'manufacturer-checked' | 'editorial-reference';
  /** Exact source kind */
  sourceKind: SourceKind;
  /** Field-level verification status */
  verificationStatus: VerificationStatus;
  sourceId?: string;
  sourceField?: string;
  checkedAt?: string;
  condition?: string;
}

export interface HardwareAuditSummary {
  entityKind: EntityKind;
  verifiedFieldCount: number; // 全部已核验字段数（包含扩展核验字段）
  verifiedCoreCount: number;  // 已核验核心字段数（严格对应分母 Y）
  coreFieldTotal: number;     // Y: category standard core benchmark fields
  verificationRate: number;   // verifiedCoreCount / coreFieldTotal (normalized 0 to 1)
  hasOfficialSource: boolean;
  lastCheckedAt: string | null;
  missingCoreFields: string[];
}

/** Canonical read model. Missing measurements remain missing (null), never derived from price. */
export interface HardwareRecord {
  schemaVersion: 1;
  entityKind: EntityKind;
  variantDetails?: {
    brandPartner?: string;
    modelVariant?: string;
    lengthMm?: number | null;
    slotThickness?: number | null;
    powerConnectors?: string | null;
  };
  identity: Pick<HardwareItem, 'id' | 'name' | 'brand' | 'category' | 'series' | 'releaseYear'> & {
    platform: 'desktop' | 'laptop';
  };
  specifications: SpecificationRecord[];
  auditSummary: HardwareAuditSummary;
  sources: HardwareSource[];
  power: {
    watts: number | null;
    evidence: 'manufacturer-checked' | 'editorial-reference';
    meaning: string;
    isKnown: boolean;
  };
  pricing: {
    currency: 'CNY';
    evidence: 'editorial-reference';
    referenceRange: { min: number | null; max: number | null };
    isKnownRange: boolean;
    launchReference: number | null;
    history: Array<{ label: string; amount: number }>;
  };
  benchmarks: {
    evidence: 'editorial-reference';
    scores: NonNullable<HardwareItem['benchmarks']>;
  };
  links: {
    documents: NonNullable<HardwareItem['docsLinks']>;
    reviews: NonNullable<HardwareItem['reviewLinks']>;
  };
}

export interface HardwareCatalog {
  schemaVersion: 1;
  ids: string[];
  byId: ReadonlyMap<string, HardwareRecord>;
  byCategory: ReadonlyMap<HardwareCategory, readonly string[]>;
}
