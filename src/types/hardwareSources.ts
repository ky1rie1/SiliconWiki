/** Stable IDs survive display-label translations and presentation changes. */
export type HardwareSpecFieldId =
  | 'cpu.coresThreads' | 'cpu.clocks' | 'cpu.l3Cache' | 'cpu.defaultTdp'
  | 'cpu.socket' | 'memory.support' | 'cpu.process'
  | 'gpu.memory' | 'gpu.cudaCores' | 'gpu.boostClock' | 'gpu.tgp'
  | 'gpu.tensorGeneration' | 'gpu.aiTops';

export interface VerifiedHardwareFact {
  fieldId: HardwareSpecFieldId;
  value: string;
  sourceField: string;
}

export interface HardwareVerification {
  modelName: string;
  sourceTitle: string;
  sourceUrl: string;
  checkedAt: string;
  scope: string;
  /** Keys are current UI labels; fieldId is the canonical identity. */
  fields: Record<string, VerifiedHardwareFact>;
  tdpWatts: number;
  powerSourceField: string;
  zol?: { productId: string; productUrl: string; parameterUrl: string; checkedAt: string };
}
