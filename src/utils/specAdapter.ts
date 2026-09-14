import { HardwareItem } from '../types';
import { HardwareRecord } from '../types/hardwareCatalog';
import { SourceKind, VerificationStatus } from '../types/hardwareSources';

export interface FieldExtractionResult<T> {
  isKnown: boolean;
  value: T | null;
  fieldId: string;
  unit?: string;
  sourceKind?: SourceKind;
  verificationStatus?: VerificationStatus;
  variantModel?: string;
  condition?: string;
  rawText?: string;
}

import { SpecificationRecord } from '../types/hardwareCatalog';

/** Helper to find underlying SpecificationRecord */
export function getSpecificationRecord(
  item: HardwareItem | HardwareRecord | null,
  keys: string[]
): SpecificationRecord | null {
  if (!item) return null;
  if ('specifications' in item && item.schemaVersion === 1) {
    for (const key of keys) {
      const found = item.specifications.find(
        (s) => s.id === key || s.label === key || s.id.endsWith(`:${key}`)
      );
      if (found) return found;
    }
  }
  return null;
}

/** Helper to get either HardwareRecord or fallback to HardwareItem */
function getSpecsMap(item: HardwareItem | HardwareRecord | null): Record<string, string> {
  if (!item) return {};
  if ('specifications' in item && item.schemaVersion === 1) {
    const map: Record<string, string> = {};
    for (const spec of item.specifications) {
      if (spec.label && spec.value) {
        map[spec.label] = spec.value;
      }
      if (spec.id && spec.value) {
        map[spec.id] = spec.value;
        const lastColon = spec.id.lastIndexOf(':');
        if (lastColon !== -1) {
          map[spec.id.slice(lastColon + 1)] = spec.value;
        }
      }
    }
    return map;
  }
  return (item as HardwareItem).specs || {};
}

function getItemName(item: HardwareItem | HardwareRecord | null): string {
  if (!item) return '';
  if ('identity' in item) return item.identity.name;
  return item.name || '';
}

function getItemId(item: HardwareItem | HardwareRecord | null): string {
  if (!item) return '';
  if ('identity' in item) return item.identity.id;
  return item.id || '';
}

/**
 * 1. CPU 插槽提取
 */
export function extractCpuSocket(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<string> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'cpu.socket' };
  }
  const specRec = getSpecificationRecord(item, ['cpu.socket', '插槽接口', '插槽类型', '接口']);
  const specs = getSpecsMap(item);
  const raw = specs['cpu.socket'] || specs['插槽接口'] || specs['插槽类型'] || specs['接口'] || '';

  let socket: string | null = null;
  if (/AM5/i.test(raw)) socket = 'AM5';
  else if (/AM4/i.test(raw)) socket = 'AM4';
  else if (/LGA\s*1851/i.test(raw)) socket = 'LGA1851';
  else if (/LGA\s*1700/i.test(raw)) socket = 'LGA1700';
  else if (/LGA\s*1200/i.test(raw)) socket = 'LGA1200';
  else if (/LGA\s*1151/i.test(raw)) socket = 'LGA1151';
  else if (/sTR5/i.test(raw)) socket = 'sTR5';

  return {
    isKnown: socket !== null,
    value: socket,
    fieldId: 'cpu.socket',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: raw || undefined,
  };
}

/**
 * 2. 主板插槽提取
 * 明确规格优先于名称猜测，出现矛盾返回待核实
 */
export function extractMotherboardSocket(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<string> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'motherboard.socket' };
  }
  const specRec = getSpecificationRecord(item, ['motherboard.socket', 'CPU 插槽', '插槽接口', 'CPU插槽']);
  const specs = getSpecsMap(item);
  const name = getItemName(item);
  const raw = specs['motherboard.socket'] || specs['CPU 插槽'] || specs['插槽接口'] || specs['CPU插槽'] || '';

  let socketFromSpec: string | null = null;
  if (/AM5/i.test(raw)) socketFromSpec = 'AM5';
  else if (/AM4/i.test(raw)) socketFromSpec = 'AM4';
  else if (/LGA\s*1851/i.test(raw)) socketFromSpec = 'LGA1851';
  else if (/LGA\s*1700/i.test(raw)) socketFromSpec = 'LGA1700';
  else if (/LGA\s*1200/i.test(raw)) socketFromSpec = 'LGA1200';
  else if (/LGA\s*1151/i.test(raw)) socketFromSpec = 'LGA1151';
  else if (/sTR5/i.test(raw)) socketFromSpec = 'sTR5';

  let socketFromName: string | null = null;
  if (/AM5/i.test(name) || /X870|B850|X670|B650|A620/i.test(name)) socketFromName = 'AM5';
  else if (/AM4/i.test(name) || /X570|B550|B450|A520|A320/i.test(name)) socketFromName = 'AM4';
  else if (/LGA\s*1851/i.test(name) || /Z890|B860/i.test(name)) socketFromName = 'LGA1851';
  else if (/LGA\s*1700/i.test(name) || /Z790|B760|H610|Z690|B660/i.test(name)) socketFromName = 'LGA1700';
  else if (/LGA\s*1200/i.test(name) || /Z590|B560|H510|Z490|B460/i.test(name)) socketFromName = 'LGA1200';
  else if (/LGA\s*1151/i.test(name) || /Z390|B365|B360|H310/i.test(name)) socketFromName = 'LGA1151';
  else if (/sTR5/i.test(name) || /TRX50|WRX90/i.test(name)) socketFromName = 'sTR5';

  // 矛盾检测：当显式规格与名称识别发生冲突时，严禁静默放行，标记为矛盾待核实
  if (socketFromSpec && socketFromName && socketFromSpec !== socketFromName) {
    return {
      isKnown: false,
      value: null,
      fieldId: 'motherboard.socket',
      condition: `主板名称 (${name}) 与明确规格 (${raw}) 存在插槽接口矛盾待核实`,
      sourceKind: specRec?.sourceKind,
      verificationStatus: specRec?.verificationStatus,
      rawText: raw,
    };
  }

  const socket = socketFromSpec || socketFromName;

  return {
    isKnown: socket !== null,
    value: socket,
    fieldId: 'motherboard.socket',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: raw || name || undefined,
  };
}

/**
 * 3. 主板板型严格提取（禁止使用 includes('ATX') 混淆）
 */
export type BoardFormFactor = 'E-ATX' | 'ATX' | 'Micro-ATX' | 'Mini-ITX';

export function extractMotherboardFormFactor(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<BoardFormFactor> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'motherboard.formFactor' };
  }
  const specs = getSpecsMap(item);
  const raw = specs['motherboard.formFactor'] || specs['主板板型'] || specs['板型'] || '';

  let factor: BoardFormFactor | null = null;
  if (/E-ATX|EATX/i.test(raw)) {
    factor = 'E-ATX';
  } else if (/Micro-ATX|M-ATX|Micro ATX|mATX/i.test(raw)) {
    factor = 'Micro-ATX';
  } else if (/Mini-ITX|ITX|Mini ITX/i.test(raw)) {
    factor = 'Mini-ITX';
  } else {
    // 消除复合词后严格核查独立 ATX
    const sanitized = raw
      .replace(/E-ATX|EATX/gi, '')
      .replace(/Micro-ATX|M-ATX|Micro\s*ATX|mATX/gi, '')
      .replace(/Mini-ITX|Mini\s*ITX/gi, '');
    if (/\bATX\b/i.test(sanitized)) {
      factor = 'ATX';
    }
  }

  return {
    isKnown: factor !== null,
    value: factor,
    fieldId: 'motherboard.formFactor',
    rawText: raw || undefined,
  };
}

/**
 * 4. 机箱支持板型列表提取
 */
export function extractCaseSupportedFormFactors(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<BoardFormFactor[]> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'case.formFactorSupport' };
  }
  const specs = getSpecsMap(item);
  const raw = specs['case.formFactorSupport'] || specs['主板兼容'] || specs['支持主板'] || specs['板型支持'] || '';

  const supported: BoardFormFactor[] = [];
  if (/E-ATX|EATX/i.test(raw)) supported.push('E-ATX');
  if (/Micro-ATX|M-ATX|Micro ATX|mATX/i.test(raw)) {
    if (!supported.includes('Micro-ATX')) supported.push('Micro-ATX');
  }
  if (/Mini-ITX|ITX|Mini ITX/i.test(raw)) {
    if (!supported.includes('Mini-ITX')) supported.push('Mini-ITX');
  }

  // 消除复合词后严格核查独立的 ATX 支持
  const sanitized = raw
    .replace(/E-ATX|EATX/gi, '')
    .replace(/Micro-ATX|M-ATX|Micro\s*ATX|mATX/gi, '')
    .replace(/Mini-ITX|Mini\s*ITX/gi, '');
  if (/\bATX\b/i.test(sanitized)) {
    if (!supported.includes('ATX')) supported.push('ATX');
  }

  return {
    isKnown: supported.length > 0,
    value: supported.length > 0 ? supported : null,
    fieldId: 'case.formFactorSupport',
    rawText: raw || undefined,
  };
}

/**
 * 5. 内存规格提取
 * 严格准入：不得默认补出代际、内存形态（U-DIMM）和套条条数
 */
export interface RamSpecsInfo {
  generation: 'DDR4' | 'DDR5';
  formFactor: 'U-DIMM' | 'SO-DIMM' | null;
  packageCount: number; // 购买套数
  sticksPerPackage: number | null; // 单套条数（如 2 根，未知为 null）
  totalSticks: number | null;
  totalCapacityGb: number | null;
}

export function extractRamSpecs(item: HardwareItem | HardwareRecord | null, quantity: number = 1): FieldExtractionResult<RamSpecsInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'ram.specs' };
  }
  const specRec = getSpecificationRecord(item, ['ram.frequency', 'ram.capacity', '标称频率', '容量与套条', '容量']);
  const specs = getSpecsMap(item);
  const name = getItemName(item);
  const rawFreq = specs['ram.frequency'] || specs['标称频率'] || '';
  const rawCap = specs['ram.capacity'] || specs['容量与套条'] || specs['容量'] || '';
  const textCorpus = `${name} ${rawFreq} ${rawCap}`.trim();

  let generation: 'DDR4' | 'DDR5' | null = null;
  if (/DDR5/i.test(textCorpus)) generation = 'DDR5';
  else if (/DDR4/i.test(textCorpus)) generation = 'DDR4';

  // 代际未知时，直接返回 unknown，严禁默认当作 DDR5！
  if (!generation) {
    return {
      isKnown: false,
      value: null,
      fieldId: 'ram.specs',
      sourceKind: specRec?.sourceKind,
      verificationStatus: specRec?.verificationStatus,
      rawText: textCorpus || undefined,
    };
  }

  let formFactor: 'U-DIMM' | 'SO-DIMM' | null = null;
  if (/SO-DIMM|笔记本/i.test(textCorpus)) {
    formFactor = 'SO-DIMM';
  } else if (/U-DIMM|台式机|Desktop/i.test(textCorpus)) {
    formFactor = 'U-DIMM';
  }

  // 解析每套条数：如 16Gx2, 8G*2, 32GB (16GBx2), 2条装
  let sticksPerPackage: number | null = null;
  const matchSticks = textCorpus.match(/[x*×](\d+)/i) || textCorpus.match(/(\d+)\s*条装/) || textCorpus.match(/(\d+)\s*条/);
  if (matchSticks) {
    sticksPerPackage = parseInt(matchSticks[1], 10) || null;
  } else if (/单条/i.test(textCorpus)) {
    sticksPerPackage = 1;
  }

  // 解析单套总容量：如 32GB, 16GB, 64GB
  let totalCapacityGb: number | null = null;
  const matchCap = textCorpus.match(/(\d+)\s*GB/i);
  if (matchCap) {
    totalCapacityGb = parseInt(matchCap[1], 10) || null;
  }

  const validQuantity = Math.max(1, Math.floor(quantity));
  const totalSticks = sticksPerPackage !== null ? validQuantity * sticksPerPackage : null;

  return {
    isKnown: true,
    value: {
      generation,
      formFactor,
      packageCount: validQuantity,
      sticksPerPackage,
      totalSticks,
      totalCapacityGb: totalCapacityGb ? totalCapacityGb * validQuantity : null,
    },
    fieldId: 'ram.specs',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: textCorpus,
  };
}

/**
 * 6. 主板内存规格提取
 * 严格准入：插槽数量未记录时严禁默认填 4 槽
 */
export interface MotherboardRamSupportInfo {
  supportedGenerations: ('DDR4' | 'DDR5')[];
  totalSlots: number | null; // 未记录为 null
  maxCapacityGb: number | null;
}

export function extractMotherboardRamSupport(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<MotherboardRamSupportInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'motherboard.ramSupport' };
  }
  const specRec = getSpecificationRecord(item, ['motherboard.ram', 'motherboard.memorySlots', '内存规格', '内存插槽']);
  const specs = getSpecsMap(item);
  const raw = specs['motherboard.ram'] || specs['motherboard.memorySlots'] || specs['内存规格'] || specs['内存插槽'] || '';

  const gens: ('DDR4' | 'DDR5')[] = [];
  if (/DDR5/i.test(raw)) gens.push('DDR5');
  if (/DDR4/i.test(raw)) gens.push('DDR4');

  // 插槽数，通常为 2 或 4 槽，如 4x DDR5 或 2x DDR4
  let totalSlots: number | null = null;
  const matchSlots = raw.match(/(\d+)\s*[x*×]?\s*DDR/i) || raw.match(/(\d+)\s*个?内存插槽/) || raw.match(/(\d+)\s*条内存/);
  if (matchSlots) {
    totalSlots = parseInt(matchSlots[1], 10) || null;
  } else if (/4\s*槽|四槽/i.test(raw)) {
    totalSlots = 4;
  } else if (/2\s*槽|双槽/i.test(raw)) {
    totalSlots = 2;
  }

  // 最大支持容量
  let maxCap: number | null = null;
  const matchMaxCap = raw.match(/最大\s*(\d+)\s*GB/i);
  if (matchMaxCap) {
    maxCap = parseInt(matchMaxCap[1], 10) || null;
  }

  const isKnown = gens.length > 0;
  return {
    isKnown,
    value: isKnown ? { supportedGenerations: gens, totalSlots, maxCapacityGb: maxCap } : null,
    fieldId: 'motherboard.ramSupport',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: raw || undefined,
  };
}

/**
 * 7. CPU 支持的内存代际
 */
export function extractCpuRamSupport(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<('DDR4' | 'DDR5')[]> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'cpu.ramSupport' };
  }
  const specRec = getSpecificationRecord(item, ['cpu.ramSupport', 'memory.support', '内存支持']);
  const socketRes = extractCpuSocket(item);
  const specs = getSpecsMap(item);
  const raw = specs['cpu.ramSupport'] || specs['memory.support'] || specs['内存支持'] || '';

  const gens: ('DDR4' | 'DDR5')[] = [];
  if (/DDR5/i.test(raw)) gens.push('DDR5');
  if (/DDR4/i.test(raw)) gens.push('DDR4');

  // 若文本未写明，依据插槽与架构基线推导
  if (gens.length === 0 && socketRes.value) {
    if (socketRes.value === 'AM5' || socketRes.value === 'LGA1851') {
      gens.push('DDR5');
    } else if (socketRes.value === 'AM4' || socketRes.value === 'LGA1200' || socketRes.value === 'LGA1151') {
      gens.push('DDR4');
    } else if (socketRes.value === 'LGA1700') {
      gens.push('DDR4', 'DDR5');
    }
  }

  return {
    isKnown: gens.length > 0,
    value: gens.length > 0 ? gens : null,
    fieldId: 'cpu.ramSupport',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: raw || undefined,
  };
}

/**
 * 8. 散热器扣具支持提取
 */
export function extractCoolerBrackets(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<string[]> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'cooler.brackets' };
  }
  const specs = getSpecsMap(item);
  const raw = specs['cooler.brackets'] || specs['扣具支持'] || specs['支持平台'] || specs['兼容平台'] || '';

  const brackets: string[] = [];
  if (/AM5/i.test(raw)) brackets.push('AM5');
  if (/AM4/i.test(raw)) brackets.push('AM4');
  if (/LGA\s*1851/i.test(raw)) brackets.push('LGA1851');
  if (/LGA\s*1700/i.test(raw)) brackets.push('LGA1700');
  if (/LGA\s*1200/i.test(raw)) brackets.push('LGA1200');
  if (/LGA\s*115[x0-9]/i.test(raw)) brackets.push('LGA1151');

  return {
    isKnown: brackets.length > 0,
    value: brackets.length > 0 ? brackets : null,
    fieldId: 'cooler.brackets',
    rawText: raw || undefined,
  };
}

/**
 * 9. 散热器形态、高度、冷排尺寸与标称 TDP
 */
export interface CoolerDimensionsInfo {
  type: 'air' | 'liquid';
  heightMm: number | null;
  radiatorSizeMm: number | null;
  tdpRating: number | null;
}

export function extractCoolerDimensions(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<CoolerDimensionsInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'cooler.dimensions' };
  }
  const specs = getSpecsMap(item);
  const name = getItemName(item);
  const rawType = specs['cooler.type'] || specs['散热类型'] || '';
  const rawHeight = specs['cooler.height'] || specs['高度'] || '';
  const rawRadiator = specs['cooler.radiator'] || specs['冷排尺寸'] || '';
  const rawTdp = specs['cooler.tdp'] || specs['解热能力 (D-TDP)'] || specs['解热能力'] || '';

  const isLiquid = /水冷|AIO/i.test(`${rawType} ${name} ${rawRadiator}`);
  const type: 'air' | 'liquid' = isLiquid ? 'liquid' : 'air';

  let heightMm: number | null = null;
  const matchH = rawHeight.match(/(\d+(\.\d+)?)\s*mm/i);
  if (matchH) {
    heightMm = parseFloat(matchH[1]);
  }

  let radiatorSizeMm: number | null = null;
  const matchRad = rawRadiator.match(/(\d{3})\s*mm/i) || name.match(/(120|240|280|360|420)/);
  if (matchRad) {
    radiatorSizeMm = parseInt(matchRad[1], 10);
  }

  let tdpRating: number | null = null;
  if ('tdpWatts' in item && typeof item.tdpWatts === 'number' && item.tdpWatts > 0) {
    tdpRating = item.tdpWatts;
  } else {
    const matchTdp = rawTdp.match(/(\d+)\s*W/i);
    if (matchTdp) tdpRating = parseInt(matchTdp[1], 10);
  }

  return {
    isKnown: true,
    value: {
      type,
      heightMm,
      radiatorSizeMm,
      tdpRating,
    },
    fieldId: 'cooler.dimensions',
  };
}

/**
 * 10. 机箱限长限高与冷排支持提取
 * 保留多条件限长与具体冷排安装位空间条件
 */
export interface ConditionalGpuLimit {
  condition: string;
  maxGpuLengthMm: number;
}

export interface RadiatorPositionSupport {
  position: 'top' | 'front' | 'rear' | 'side' | 'bottom';
  sizesMm: number[];
}

export interface CaseClearanceInfo {
  maxGpuLengthMm: number | null;
  conditionalGpuLimits?: ConditionalGpuLimit[];
  maxCoolerHeightMm: number | null;
  supportedRadiatorsMm: number[];
  radiatorPositions?: RadiatorPositionSupport[];
}

export function extractCaseClearance(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<CaseClearanceInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'case.clearance' };
  }
  const specRec = getSpecificationRecord(item, ['case.maxGpuLength', 'case.maxCoolerHeight', 'case.radiatorSupport', '显卡限长', 'CPU 散热器限高', '散热器限高', '冷排支持']);
  const specs = getSpecsMap(item);
  const rawGpu = specs['case.maxGpuLength'] || specs['显卡限长'] || '';
  const rawCooler = specs['case.maxCoolerHeight'] || specs['CPU 散热器限高'] || specs['散热器限高'] || '';
  const rawRad = specs['case.radiatorSupport'] || specs['冷排支持'] || '';

  let maxGpuLengthMm: number | null = null;
  const conditionalGpuLimits: ConditionalGpuLimit[] = [];

  // 解析多条件显卡限长（如：前置水冷 330mm，无前置水冷 380mm）
  if (rawGpu.includes('，') || rawGpu.includes(',') || rawGpu.includes('/') || rawGpu.includes(';')) {
    const clauses = rawGpu.split(/[，,;/]/);
    for (const clause of clauses) {
      const matchClause = clause.match(/(\d+(\.\d+)?)\s*mm/i);
      if (matchClause) {
        const limit = parseFloat(matchClause[1]);
        const cond = clause.replace(matchClause[0], '').replace(/[：:\s]/g, '').trim() || '特定条件';
        conditionalGpuLimits.push({ condition: cond, maxGpuLengthMm: limit });
      }
    }
  }

  const matchGpu = rawGpu.match(/(\d+(\.\d+)?)\s*mm/i);
  if (matchGpu) {
    maxGpuLengthMm = parseFloat(matchGpu[1]);
  }

  // 若存在多条件限制，默认基准取严格的保守下限
  if (conditionalGpuLimits.length > 0) {
    const minLimit = Math.min(...conditionalGpuLimits.map((c) => c.maxGpuLengthMm));
    if (minLimit > 0) {
      maxGpuLengthMm = minLimit;
    }
  }

  let maxCoolerHeightMm: number | null = null;
  const matchCooler = rawCooler.match(/(\d+(\.\d+)?)\s*mm/i);
  if (matchCooler) maxCoolerHeightMm = parseFloat(matchCooler[1]);

  const supportedRadiatorsMm: number[] = [];
  for (const rad of [120, 140, 240, 280, 360, 420]) {
    if (new RegExp(String(rad)).test(rawRad)) {
      supportedRadiatorsMm.push(rad);
    }
  }

  // 解析具体冷排安装位空间（截取完整子句，提取该位置支持的所有冷排尺寸）
  const radiatorPositions: RadiatorPositionSupport[] = [];
  const parsePos = (posName: 'top' | 'front' | 'rear' | 'side' | 'bottom', posRegex: RegExp) => {
    const matchClause = rawRad.match(new RegExp(`(?:${posRegex.source})[^，,;；\\n]*`, 'i'));
    if (matchClause) {
      const clause = matchClause[0];
      const sizes: number[] = [];
      for (const rad of [120, 140, 240, 280, 360, 420]) {
        if (new RegExp(`(?:\\b|[^0-9])${rad}(?:\\b|[^0-9]|mm)`).test(clause)) {
          sizes.push(rad);
        }
      }
      if (sizes.length > 0) {
        radiatorPositions.push({ position: posName, sizesMm: sizes });
      }
    }
  };

  parsePos('top', /顶部|顶置|Top/);
  parsePos('front', /前置|前面板|Front/);
  parsePos('rear', /后置|后面板|Rear/);
  parsePos('side', /侧面|侧置|Side/);
  parsePos('bottom', /底部|底置|Bottom/);

  return {
    isKnown: maxGpuLengthMm !== null || maxCoolerHeightMm !== null || supportedRadiatorsMm.length > 0,
    value: {
      maxGpuLengthMm,
      conditionalGpuLimits: conditionalGpuLimits.length > 0 ? conditionalGpuLimits : undefined,
      maxCoolerHeightMm,
      supportedRadiatorsMm,
      radiatorPositions: radiatorPositions.length > 0 ? radiatorPositions : undefined,
    },
    fieldId: 'case.clearance',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: `${rawGpu} ${rawCooler} ${rawRad}`.trim() || undefined,
  };
}

/**
 * 11. 显卡尺寸与供电接口提取
 * 严格解析必要供电接口（16-pin / 8-pin / 6-pin 具体数量）
 */
export interface GpuPowerConnectorInfo {
  count16Pin: number;
  count8Pin: number;
  count6Pin: number;
  isSlotPowerOnly?: boolean;
  isUnparseable?: boolean;
  rawText?: string;
}

export function parseGpuPowerConnectors(raw: string | null): GpuPowerConnectorInfo | undefined {
  if (!raw || !raw.trim()) return undefined;
  const text = raw.trim();

  // 1. 明确声明无需外接供电 / PCIe 插槽直接供电 (≤75W)
  if (/无需(?:辅助|额外|外接)?供电|免插电|PCIe\s*插槽(?:直接)?供电|免供电|无需外接电源/i.test(text)) {
    return {
      count16Pin: 0,
      count8Pin: 0,
      count6Pin: 0,
      isSlotPowerOnly: true,
      rawText: text,
    };
  }

  let count16Pin = 0;
  let count8Pin = 0;
  let count6Pin = 0;

  // 2. 解析 16-pin / 12VHPWR / 12V-2x6
  const m16Front = text.match(/(\d+)\s*[x*×]\s*(?:16-pin|12VHPWR|12V-2x6)/i);
  const m16Back = text.match(/(?:16-pin|12VHPWR|12V-2x6)\s*[x*×]\s*(\d+)/i);
  if (m16Front) {
    count16Pin = parseInt(m16Front[1], 10) || 1;
  } else if (m16Back) {
    count16Pin = parseInt(m16Back[1], 10) || 1;
  } else if (/16-pin|12VHPWR|12V-2x6/i.test(text)) {
    count16Pin = 1;
  }

  // 屏蔽 16-pin 文本后解析 8-pin 与 6-pin，避免 "16-pin" 中的 "6" 或 "16" 干扰
  const maskedText = text.replace(/16-pin|12VHPWR|12V-2x6/gi, '');

  // 3. 解析 8-pin（支持 "3 x 8-pin" 与 "8-pin x 3" / "8-pin × 3" / "8-pin + 8-pin"）
  const m8Front = maskedText.match(/(\d+)\s*[x*×]\s*(?:8-pin|8P|6\+2-pin)/i);
  const m8Back = maskedText.match(/(?:8-pin|8P|6\+2-pin)\s*[x*×]\s*(\d+)/i);
  if (m8Front) {
    count8Pin = parseInt(m8Front[1], 10) || 1;
  } else if (m8Back) {
    count8Pin = parseInt(m8Back[1], 10) || 1;
  } else {
    // 统计独立出现的 8-pin 数量（如 "8-pin + 8-pin" 或 "8-pin + 8-pin + 8-pin"）
    const all8Matches = maskedText.match(/(?:8-pin|6\+2-pin|\b8P\b)/gi);
    if (all8Matches) {
      count8Pin = all8Matches.length;
    }
  }

  // 4. 解析 6-pin（支持 "2 x 6-pin" 与 "6-pin x 2" / "6-pin + 6-pin"，禁止将多个 6-pin 折为一个）
  const m6Front = maskedText.match(/(\d+)\s*[x*×]\s*(?:6-pin|6P)/i);
  const m6Back = maskedText.match(/(?:6-pin|6P)\s*[x*×]\s*(\d+)/i);
  if (m6Front) {
    count6Pin = parseInt(m6Front[1], 10) || 1;
  } else if (m6Back) {
    count6Pin = parseInt(m6Back[1], 10) || 1;
  } else {
    // 统计独立出现的 6-pin 数量（如 "6-pin + 6-pin"）
    const all6Matches = maskedText.match(/(?:6-pin|\b6P\b)/gi);
    if (all6Matches) {
      count6Pin = all6Matches.length;
    }
  }

  // 5. 若无法解析出任何有效接口且非免插电（如文本为“待核实”、“详见说明”），标记为无法解析
  const isUnparseable = count16Pin === 0 && count8Pin === 0 && count6Pin === 0;

  return {
    count16Pin,
    count8Pin,
    count6Pin,
    isSlotPowerOnly: false,
    isUnparseable,
    rawText: text,
  };
}

export interface GpuDimensionsInfo {
  lengthMm: number | null;
  slotThickness: number | null;
  powerConnectors: string | null;
  parsedConnectors?: GpuPowerConnectorInfo;
}

export function extractGpuDimensions(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<GpuDimensionsInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'gpu.dimensions' };
  }

  // 1. 若为标准 HardwareRecord
  if ('schemaVersion' in item && item.schemaVersion === 1) {
    if (item.entityKind === 'partner-variant' && item.variantDetails) {
      const v = item.variantDetails;
      return {
        isKnown: typeof v.lengthMm === 'number' || Boolean(v.powerConnectors),
        value: {
          lengthMm: v.lengthMm ?? null,
          slotThickness: v.slotThickness ?? null,
          powerConnectors: v.powerConnectors ?? null,
          parsedConnectors: parseGpuPowerConnectors(v.powerConnectors ?? null),
        },
        fieldId: 'gpu.dimensions',
        variantModel: v.modelVariant,
      };
    }
    if (item.entityKind === 'chip') {
      // 芯片核心无物理卡身
      return {
        isKnown: false,
        value: { lengthMm: null, slotThickness: null, powerConnectors: null },
        fieldId: 'gpu.dimensions',
        condition: '芯片核心无具体零售卡身尺寸与供电接口',
      };
    }
    // reference-product
    if (item.variantDetails?.lengthMm || item.variantDetails?.powerConnectors) {
      return {
        isKnown: true,
        value: {
          lengthMm: item.variantDetails.lengthMm ?? null,
          slotThickness: item.variantDetails.slotThickness ?? null,
          powerConnectors: item.variantDetails.powerConnectors ?? null,
          parsedConnectors: parseGpuPowerConnectors(item.variantDetails.powerConnectors ?? null),
        },
        fieldId: 'gpu.dimensions',
        condition: '公版参考设计规格',
      };
    }
  }

  // 2. 从 legacy specs 解析
  const specs = getSpecsMap(item);
  const rawDim = specs['gpu.dimensions'] || specs['尺寸 (长宽高)'] || specs['尺寸'] || '';
  const rawPower = specs['gpu.powerConnectors'] || specs['供电接口'] || specs['辅助供电'] || '';

  let lengthMm: number | null = null;
  const matchLen = rawDim.match(/(\d+(\.\d+)?)\s*(?:mm|×|x)/i);
  if (matchLen) {
    lengthMm = parseFloat(matchLen[1]);
  }

  return {
    isKnown: lengthMm !== null || Boolean(rawPower),
    value: {
      lengthMm,
      slotThickness: null,
      powerConnectors: rawPower || null,
      parsedConnectors: parseGpuPowerConnectors(rawPower || null),
    },
    fieldId: 'gpu.dimensions',
    rawText: rawDim || undefined,
  };
}

/**
 * 12. 电源额定功率与接口规格提取
 * 严禁无据默认 2 组 8-pin 模组线
 */
export interface PsuSpecsInfo {
  ratedWattage: number | null;
  native12VhpwrCount: number;
  pcie8PinCount: number | null; // 未明确记录时为 null
}

export function extractPsuSpecs(item: HardwareItem | HardwareRecord | null): FieldExtractionResult<PsuSpecsInfo> {
  if (!item) {
    return { isKnown: false, value: null, fieldId: 'psu.specs' };
  }
  const specRec = getSpecificationRecord(item, ['psu.wattage', 'psu.connectors', '额定功率', '显卡原生接口', '线材模组']);
  const specs = getSpecsMap(item);
  const name = getItemName(item);
  const rawRated = specs['psu.wattage'] || specs['额定功率'] || '';
  const rawConn = specs['psu.connectors'] || specs['显卡原生接口'] || specs['线材模组'] || '';

  let ratedWattage: number | null = null;
  if ('power' in item && typeof item.power?.watts === 'number' && item.power.watts > 0) {
    ratedWattage = item.power.watts;
  } else if ('tdpWatts' in item && typeof item.tdpWatts === 'number' && item.tdpWatts > 0) {
    ratedWattage = item.tdpWatts;
  } else {
    const matchW = rawRated.match(/(\d+)\s*W/i) || name.match(/(\d{3,4})\s*W/i);
    if (matchW) ratedWattage = parseInt(matchW[1], 10);
  }

  const native12VhpwrCount = /16-pin|12VHPWR|12V-2x6/i.test(rawConn) ? 1 : 0;

  // 严格解析 PCIe 8-pin 数量（禁止假定标配 2 组）
  let pcie8PinCount: number | null = null;
  const match8Pin =
    rawConn.match(/(\d+)\s*[x*×]?\s*(?:PCIe\s*)?(?:8-pin|6\+2-pin|8P)/i) ||
    rawConn.match(/(?:8-pin|6\+2-pin)\s*[x*×]?\s*(\d+)/i);
  if (match8Pin) {
    pcie8PinCount = parseInt(match8Pin[1], 10) || null;
  } else if (/8-pin|6\+2-pin/i.test(rawConn)) {
    pcie8PinCount = 1;
  }

  return {
    isKnown: ratedWattage !== null && ratedWattage > 0,
    value: {
      ratedWattage,
      native12VhpwrCount,
      pcie8PinCount,
    },
    fieldId: 'psu.specs',
    sourceKind: specRec?.sourceKind,
    verificationStatus: specRec?.verificationStatus,
    condition: specRec?.condition,
    rawText: `${rawRated} ${rawConn}`.trim() || undefined,
  };
}

/**
 * 13. 显示输出可用性提取与检查
 * 严禁以普通 Type-C 替代明确的视频输出能力
 */
export interface DisplayOutputInfo {
  hasDedicatedGpu: boolean;
  cpuHasIgpu: boolean | null;
  mbHasVideoPorts: boolean | null;
}

export function extractDisplayOutputInfo(
  cpu: HardwareItem | HardwareRecord | null,
  mb: HardwareItem | HardwareRecord | null,
  gpu: HardwareItem | HardwareRecord | null,
): DisplayOutputInfo {
  const hasDedicatedGpu = Boolean(gpu && getItemId(gpu));

  let cpuHasIgpu: boolean | null = null;
  if (cpu) {
    const cpuName = getItemName(cpu).toUpperCase();
    const cpuSpecs = getSpecsMap(cpu);
    const rawIgpu = cpuSpecs['核显'] || cpuSpecs['集成显卡'] || '';

    if (/无核显|无集成显卡|需搭配独立显卡/i.test(rawIgpu)) {
      cpuHasIgpu = false;
    } else if (/Radeon Graphics|Intel UHD|核显|CU/i.test(rawIgpu)) {
      cpuHasIgpu = true;
    } else if (/(\d{4,5})F\b|(\d{4,5})KF\b/.test(cpuName)) {
      // Intel F / KF 系列无核显
      cpuHasIgpu = false;
    } else if (/AMD/i.test(cpuName) && /RYZEN\s*[3579]\s*5\d{3}[X]?\b/.test(cpuName) && !/5\d{3}G\b/.test(cpuName)) {
      // Ryzen 5000 桌面无 G 后缀（如 5600, 5700X）无核显
      cpuHasIgpu = false;
    } else if (/RYZEN\s*[79]\s*[789]\d{3}/.test(cpuName)) {
      // Ryzen 7000 / 9000 全系标配 2CU 核显
      cpuHasIgpu = true;
    } else if (/INTEL/i.test(cpuName) && !/F\b/.test(cpuName)) {
      cpuHasIgpu = true;
    }
  }

  let mbHasVideoPorts: boolean | null = null;
  if (mb) {
    const mbSpecs = getSpecsMap(mb);
    const rawIo = mbSpecs['后置 I/O'] || mbSpecs['视频输出'] || mbSpecs['显示接口'] || '';
    // 严格检查：普通 Type-C 不作为视频输出，仅当标明 DP Alt / DisplayPort / 视频输出时才认可
    const hasExplicitVideoPort =
      /HDMI|DisplayPort|\bDP\b|VGA|DVI/i.test(rawIo) ||
      (/Type-C|USB-C/i.test(rawIo) && /DP\s*Alt|DisplayPort|视频输出/i.test(rawIo));

    if (hasExplicitVideoPort) {
      mbHasVideoPorts = true;
    } else if (/无视频输出|不含显示接口/i.test(rawIo) || (rawIo.trim().length > 0 && !hasExplicitVideoPort)) {
      mbHasVideoPorts = false;
    } else {
      mbHasVideoPorts = null;
    }
  }

  return {
    hasDedicatedGpu,
    cpuHasIgpu,
    mbHasVideoPorts,
  };
}

