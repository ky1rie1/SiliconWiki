/** Stable IDs survive display-label translations and presentation changes. */
export type HardwareSpecFieldId =
  // CPU
  | 'cpu.coresThreads'
  | 'cpu.clocks'
  | 'cpu.l3Cache'
  | 'cpu.defaultTdp'
  | 'cpu.socket'
  | 'memory.support'
  | 'cpu.process'
  // GPU Core & Architecture
  | 'gpu.memory'
  | 'gpu.memoryBus'
  | 'gpu.cudaCores'
  | 'gpu.boostClock'
  | 'gpu.tgp'
  | 'gpu.recommendedPsu'
  | 'gpu.tensorGeneration'
  | 'gpu.aiTops'
  // GPU Physical & Board Partner Dimensions
  | 'gpu.lengthMm'
  | 'gpu.slotThickness'
  | 'gpu.powerConnectors'
  | 'gpu.displayPorts'
  // Motherboard
  | 'motherboard.chipset'
  | 'motherboard.socket'
  | 'motherboard.formFactor'
  | 'motherboard.memorySlots'
  | 'motherboard.powerPhases'
  // RAM
  | 'ram.capacity'
  | 'ram.frequency'
  | 'ram.timingCl'
  | 'ram.voltage'
  | 'ram.profile'
  // Storage
  | 'storage.protocol'
  | 'storage.formFactor'
  | 'storage.nandType'
  | 'storage.seqRead'
  | 'storage.seqWrite'
  // PSU
  | 'psu.wattage'
  | 'psu.efficiencyRating'
  | 'psu.modular'
  | 'psu.pcie12v2x6'
  // Cooler
  | 'cooler.type'
  | 'cooler.tdpRating'
  | 'cooler.fanSize'
  // Case
  | 'case.formFactor'
  | 'case.maxGpuLength'
  | 'case.maxCoolerHeight';

/** Source Categories: where the data originated */
export type SourceKind =
  | 'manufacturer'       // Official manufacturer (AMD, Intel, NVIDIA, ASUS, etc.)
  | 'product-database'   // Third-party catalog (TechPowerUp, Geekerwan socpk, ZOL, etc.)
  | 'editorial'          // Catalog editorial and community reference
  | 'unknown';           // Unknown source

/** Verification Status: whether the field has been verified against the source */
export type VerificationStatus =
  | 'verified'           // Manually reviewed and matched with active checkedAt date
  | 'unverified';        // Sourced or editorial, but pending strict review (no fake check date)

/** Entity Level: distinguishes silicon architectures from physical partner retail cards */
export type EntityKind =
  | 'chip'               // Silicon core / microarchitecture reference (e.g. AD104-350, Zen 5)
  | 'reference-product'  // Official reference design / boxed retail (e.g. 9800X3D Boxed, RTX 4070S FE)
  | 'partner-variant';   // Concrete board partner AIC variant (e.g. Colorful Ultra W, ASUS TUF)

export interface VerifiedHardwareFact {
  fieldId: HardwareSpecFieldId;
  value: string;
  sourceField: string;
  unit?: string;
  numericValue?: number | null;
  condition?: string;
  sourceKind?: SourceKind;
  verificationStatus?: VerificationStatus;
  checkedAt?: string;
}

export interface HardwareVerification {
  modelName: string;
  sourceTitle: string;
  sourceUrl: string;
  checkedAt: string;
  scope: string;
  entityKind?: EntityKind;
  /** Keys are current UI labels; fieldId is the canonical identity. */
  fields: Record<string, VerifiedHardwareFact>;
  tdpWatts: number;
  powerSourceField: string;
  variantDetails?: {
    brandPartner?: string;
    modelVariant?: string;
    lengthMm?: number | null;
    slotThickness?: number | null;
    powerConnectors?: string | null;
  };
  zol?: {
    productId: string;
    productUrl: string;
    parameterUrl: string;
    checkedAt: string;
  };
}
