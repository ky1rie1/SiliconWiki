import { HardwareItem } from './index';
import { SourceKind, VerificationStatus } from './hardwareSources';

export type BuildSlotType =
  | 'cpu'
  | 'cooler'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case';

export const BUILD_SLOT_TYPES: BuildSlotType[] = [
  'cpu',
  'cooler',
  'motherboard',
  'ram',
  'gpu',
  'storage',
  'psu',
  'case',
];

export const BuildSlotTypes = BUILD_SLOT_TYPES;

export interface CustomBuildSlotItem {
  slotId: string;
  type: BuildSlotType;
  hardwareId: string | null;
  customName?: string;
  userPrice: number | null; // null = use catalog reference; number = explicit user override (including 0)
  isExplicitZeroPrice?: boolean; // true if user explicitly set ¥0
  quantity: number;
  notes?: string;
}

export interface CustomBuild {
  schemaVersion: 1;
  id: string;
  title: string;
  targetBudget: number | null;
  slots: CustomBuildSlotItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CompatibilityStatus =
  | 'pass'
  | 'warning'
  | 'error'
  | 'unknown'
  | 'not-applicable';

export type CompatibilityRuleId =
  | 'rule_socket_match'
  | 'rule_bios_support'
  | 'rule_ram_type_match'
  | 'rule_ram_form_and_slots'
  | 'rule_cooler_bracket'
  | 'rule_motherboard_case_size'
  | 'rule_gpu_length_clearance'
  | 'rule_cooler_clearance'
  | 'rule_gpu_power_connectors'
  | 'rule_psu_capacity'
  | 'rule_display_output';

export interface CompatibilityRuleResult {
  ruleId: CompatibilityRuleId;
  category: string;
  status: CompatibilityStatus;
  title: string;
  message: string;
  basis: string; // 判定依据与引用规格
  condition?: string; // 适用前提与安装条件
  sourceKind?: SourceKind;
  verificationStatus?: VerificationStatus;
  involvedSlotTypes: BuildSlotType[];
  involvedHardwareIds: string[];
  missingFields?: string[]; // 待补数据或未核实字段
  suggestedFix?: string;
  suggestedReplacementIds?: string[];
}

export interface CompatibilityReport {
  overallStatus: CompatibilityStatus;
  rules: CompatibilityRuleResult[];
  passCount: number;
  warningCount: number;
  errorCount: number;
  unknownCount: number;
  notApplicableCount: number;
  isBuildComplete: boolean;
  missingCoreSlotTypes: BuildSlotType[];
  uncoveredChecks: string[];
  summaryText: string;
}

export type GpuPowerScenario = 'none' | 'known' | 'unrecognized' | 'custom';

export type PowerEvidenceLevel = 'manufacturer-checked' | 'editorial-reference' | 'legacy-unverified';

export interface ComponentPowerDetail {
  watts: number | null;
  evidence: PowerEvidenceLevel;
  meaning?: string;
  isVerifiedManufacturer: boolean;
}

export interface PowerEstimate {
  cpuWatts: number | null;
  gpuWatts: number | null;
  gpuScenario: GpuPowerScenario;
  cpuPowerDetail?: ComponentPowerDetail;
  gpuPowerDetail?: ComponentPowerDetail;
  basePlatformWatts: number; // 60W empirical baseline
  basePlatformAssumptionText: string;
  otherWatts: number;
  estimatedPeakWatts: number | null;
  manufacturerPsuRecommendationWatts: number | null;
  manufacturerPsuSource?: {
    valueWatts: number;
    sourceKind?: SourceKind;
    condition?: string;
  } | null;
  psuRatedWatts: number | null;
  headroomWatts: number | null;
  isFullyKnown: boolean;
  isDeterministicDeficiency?: boolean;
  missingInputs: string[];
  status: 'pass' | 'warning' | 'error' | 'unknown';
  notes: string[];
  empiricalEstimateNotice: string;
}

export type BudgetStatus = 'within' | 'exceeded' | 'spans-budget' | 'unknown' | 'unspecified';

export interface CostSummary {
  knownTotalCost: number; // 确定已知金额基线（即 knownSubtotalMin）
  knownSubtotalMin: number;
  knownSubtotalMax: number;
  isRange: boolean;
  targetBudget: number | null;
  budgetDifferenceMin: number | null;
  budgetDifferenceMax: number | null;
  budgetDifference: number | null; // backward compatibility
  isBudgetExceeded: boolean;
  budgetStatus: BudgetStatus;
  hasUnknownPrices: boolean;
  unknownPriceSlotCount: number;
  hasLaunchPriceFallback: boolean;
  launchPriceFallbackCount: number;
  totalSlotsCount: number;
  filledSlotsCount: number;
  priceSourceBreakdown: {
    userOverrideCount: number;
    catalogReferenceCount: number;
    zeroPriceCount: number;
    unknownCount: number;
    launchPriceOnlyCount: number;
  };
}

export interface ReplacementCandidate {
  item: HardwareItem;
  deltaPrice: number | null;
  deltaPriceMin?: number;
  deltaPriceMax?: number;
  remainingIssues: CompatibilityRuleResult[];
}

