import type { HardwareCategory, HardwareItem } from '../types';
import type {
  HardwareCatalog,
  HardwareRecord,
  HardwareAuditSummary,
  SpecificationRecord,
} from '../types/hardwareCatalog';
import type {
  HardwareVerification,
  SourceKind,
  VerificationStatus,
  EntityKind,
  HardwareSpecFieldId,
} from '../types/hardwareSources';

const finitePositive = (value: number | undefined | null): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export function isValidCheckDate(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (y < 2000 || y > 2099 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  return (
    utcDate.getUTCFullYear() === y &&
    utcDate.getUTCMonth() + 1 === m &&
    utcDate.getUTCDate() === d
  );
}

export function isValidSourceUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const u = new URL(urlStr);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password;
  } catch {
    return false;
  }
}

const safeLink = (value: { url: string }) => isValidSourceUrl(value.url);

export function isValidPriceRange(
  range: unknown,
  options?: { allowZero?: boolean }
): range is [number, number] {
  if (!Array.isArray(range) || range.length < 2) return false;
  const min = range[0];
  const max = range[1];
  if (typeof min !== 'number' || typeof max !== 'number') return false;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  if (min < 0 || max < 0) return false;
  if (min > max) return false;

  // Distinguish real zero price from historical unknown placeholders:
  // In retail hardware datasets, [0, 0] or [0, max] are standard placeholders for unrecorded price.
  // Unless explicitly allowed via allowZero, min === 0 indicates an unknown price.
  if (min === 0 && !options?.allowZero) return false;

  return true;
}

export function formatHardwarePrice(
  priceRange: [number, number] | undefined | null | unknown,
  lang: 'zh' | 'en' = 'zh',
  options?: { allowZero?: boolean }
): string {
  if (!isValidPriceRange(priceRange, options)) {
    return lang === 'en' ? 'Price unrecorded' : '暂无参考价';
  }
  const [min, max] = priceRange;
  if (min === max) {
    return `￥${min}`;
  }
  return `￥${min} ~ ￥${max}`;
}

export function formatHardwareTdp(
  tdpWatts: number | undefined | null,
  category?: HardwareCategory,
  lang: 'zh' | 'en' = 'zh'
): string {
  if (typeof tdpWatts === 'number' && Number.isFinite(tdpWatts) && tdpWatts > 0) {
    return `${tdpWatts}W`;
  }
  if (category === 'case') {
    return lang === 'en' ? 'N/A' : '不适用';
  }
  return lang === 'en' ? 'Power unrecorded' : '功耗未记录';
}

export interface CoreFieldSpec {
  canonicalName: string;
  aliases: readonly string[];
}

/**
 * Standard category benchmark core fields (Denominator Y).
 * Fixed per category to ensure transparent and consistent verification rates.
 */
export const CATEGORY_CORE_FIELDS: Record<HardwareCategory, readonly CoreFieldSpec[]> = {
  cpu: [
    { canonicalName: '核心/线程', aliases: ['核心/线程', '核心线程'] },
    { canonicalName: '基础/加速频率', aliases: ['基础/加速频率', '主频/睿频', '频率'] },
    { canonicalName: '三级缓存 (L3)', aliases: ['三级缓存 (L3)', '三级缓存', 'L3 缓存', 'L3缓存'] },
    { canonicalName: '基础功耗 / 最大睿频功耗', aliases: ['基础功耗 / 最大睿频功耗', '默认功耗', 'TDP', '功耗'] },
    { canonicalName: '插槽接口', aliases: ['插槽接口', '接口插槽', 'CPU插槽', '封装插槽'] },
    { canonicalName: '内存支持', aliases: ['内存支持', '支持内存', '内存类型'] },
    { canonicalName: '制程工艺', aliases: ['制程工艺', '工艺制程', '制程'] },
  ],
  gpu: [
    { canonicalName: '核心代号/流处理器数', aliases: ['核心代号/流处理器数', 'CUDA 核心数', '计算单元 (CU)', '流处理器', '流处理器数', 'CUDA核心'] },
    { canonicalName: '基础/加速频率', aliases: ['基础/加速频率', '核心加速频率', '核心频率', '加速频率'] },
    { canonicalName: '显存容量/类型', aliases: ['显存容量/类型', '显存容量', '显存规格'] },
    { canonicalName: '显存位宽/带宽', aliases: ['显存位宽/带宽', '显存位宽', '显存带宽'] },
    { canonicalName: '整卡功耗 (TGP/TBP)', aliases: ['整卡功耗 (TGP/TBP)', '整卡功耗', 'TGP', 'TBP', '功耗'] },
    { canonicalName: '供电接口', aliases: ['供电接口', '电源接口', '辅助供电'] },
    { canonicalName: '输出接口', aliases: ['输出接口', '显示接口', '视频接口'] },
    { canonicalName: '建议电源', aliases: ['建议电源', '推荐电源', '电源要求'] },
  ],
  motherboard: [
    { canonicalName: '芯片组', aliases: ['芯片组', '主板芯片组'] },
    { canonicalName: 'CPU插槽', aliases: ['CPU插槽', '插槽接口', 'CPU接口'] },
    { canonicalName: '板型尺寸', aliases: ['板型尺寸', '主板板型', '板型'] },
    { canonicalName: '供电相数', aliases: ['供电相数', '供电设计', '供电'] },
    { canonicalName: '内存插槽与上限', aliases: ['内存插槽与上限', '内存插槽', '内存规格'] },
    { canonicalName: 'PCIe与M.2扩展规格', aliases: ['PCIe与M.2扩展规格', '扩展插槽', 'M.2接口', 'PCIe插槽'] },
  ],
  ram: [
    { canonicalName: '容量与通道', aliases: ['容量与通道', '容量', '套条规格'] },
    { canonicalName: '频率', aliases: ['频率', '工作频率', '内存频率'] },
    { canonicalName: '时序CL', aliases: ['时序CL', '时序', '延迟'] },
    { canonicalName: '工作电压', aliases: ['工作电压', '电压'] },
    { canonicalName: '超频规范', aliases: ['超频规范', '超频支持', 'XMP/EXPO', 'XMP', 'EXPO'] },
  ],
  storage: [
    { canonicalName: '接口协议', aliases: ['接口协议', '总线协议', '接口类型'] },
    { canonicalName: '形态', aliases: ['形态', '外形规格', '尺寸规格'] },
    { canonicalName: '闪存颗粒类型', aliases: ['闪存颗粒类型', '闪存颗粒', 'NAND颗粒', '颗粒类型'] },
    { canonicalName: '主控型号', aliases: ['主控型号', '主控芯片', '主控'] },
    { canonicalName: '标称连续读写速度', aliases: ['标称连续读写速度', '顺序读写', '连续读写速度', '读写速度'] },
  ],
  psu: [
    { canonicalName: '额定功率', aliases: ['额定功率', '额定瓦数', '功率'] },
    { canonicalName: '80PLUS认证', aliases: ['80PLUS认证', '认证等级', '能效认证'] },
    { canonicalName: '模组规范', aliases: ['模组规范', '模组类型', '模组线材'] },
    { canonicalName: 'ATX 3.0/3.1与原生12V-2x6', aliases: ['ATX 3.0/3.1与原生12V-2x6', 'ATX规范', '12VHPWR接口', '原生12V-2x6'] },
    { canonicalName: '主要保护机制', aliases: ['主要保护机制', '保护功能', '安全保护'] },
  ],
  cooler: [
    { canonicalName: '散热形式', aliases: ['散热形式', '散热类型', '结构形式'] },
    { canonicalName: '标称解热能力TDP', aliases: ['标称解热能力TDP', '解热能力', '支持TDP'] },
    { canonicalName: '支持扣具插槽', aliases: ['支持扣具插槽', '兼容插槽', '扣具支持', '支持平台'] },
    { canonicalName: '冷排/风道尺寸', aliases: ['冷排/风道尺寸', '风扇尺寸', '散热器尺寸', '冷排尺寸'] },
  ],
  case: [
    { canonicalName: '板型支持', aliases: ['板型支持', '支持主板', '主板兼容'] },
    { canonicalName: '显卡限长', aliases: ['显卡限长', '显卡限长(mm)', '最大显卡长度'] },
    { canonicalName: '散热限高', aliases: ['散热限高', '风冷限高', '散热器限高'] },
    { canonicalName: '电源限长', aliases: ['电源限长', '电源位限长', '最大电源长度'] },
    { canonicalName: '风道/冷排位', aliases: ['风道/冷排位', '风扇位', '冷排支持'] },
  ],
  laptop: [
    { canonicalName: '处理器型号', aliases: ['处理器型号', 'CPU型号', '处理器'] },
    { canonicalName: '显卡及功耗释放', aliases: ['显卡及功耗释放', '独立显卡', '显卡功耗', '显卡'] },
    { canonicalName: '屏幕参数', aliases: ['屏幕参数', '屏幕规格', '显示屏'] },
    { canonicalName: '内存配置', aliases: ['内存配置', '内存容量', '内存'] },
    { canonicalName: '电池容量', aliases: ['电池容量', '电池规格', '电池'] },
    { canonicalName: '整机重量', aliases: ['整机重量', '机身重量', '重量'] },
  ],
};

export const CATEGORY_POWER_FIELD_IDS: Partial<Record<HardwareCategory, HardwareSpecFieldId>> = {
  cpu: 'cpu.defaultTdp',
  gpu: 'gpu.tgp',
  psu: 'psu.wattage',
  cooler: 'cooler.tdpRating',
};

const AIC_PARTNER_BRANDS = new Set([
  'Colorful',
  '七彩虹',
  'ASUS',
  '华硕',
  'MSI',
  '微星',
  'Gigabyte',
  '技嘉',
  'ZOTAC',
  '索泰',
  'GALAX',
  '影驰',
  'Sapphire',
  '蓝宝石',
  'PowerColor',
  '撼讯',
  'Yeston',
  '盈通',
  'Maxsun',
  '铭瑄',
  'Inno3D',
  '映众',
  'Palit',
  'Gainward',
  '耕升',
  'KFA2',
  'XFX',
  '讯景',
]);

function detectEntityKind(item: HardwareItem, verified?: HardwareVerification): EntityKind {
  if (verified?.entityKind) return verified.entityKind;
  if (item.category === 'gpu') {
    if (AIC_PARTNER_BRANDS.has(item.brand)) {
      return 'partner-variant';
    }
    return 'reference-product';
  }
  if (item.category === 'cpu') {
    return 'reference-product';
  }
  return 'reference-product';
}

function extractVariantDetails(item: HardwareItem, verified?: HardwareVerification) {
  if (verified?.variantDetails) {
    return verified.variantDetails;
  }
  if (item.category === 'gpu' && AIC_PARTNER_BRANDS.has(item.brand)) {
    return {
      brandPartner: item.brand,
      modelVariant: item.name,
      lengthMm: null,
      slotThickness: null,
      powerConnectors: null,
    };
  }
  return undefined;
}

function computeAuditSummary(
  category: HardwareCategory,
  entityKind: EntityKind,
  specifications: SpecificationRecord[],
  sources: HardwareRecord['sources']
): HardwareAuditSummary {
  const coreSpecs = CATEGORY_CORE_FIELDS[category] || [];
  const coreFieldTotal = coreSpecs.length;

  const verifiedSpecs = specifications.filter((s) => s.verificationStatus === 'verified');
  const verifiedLabels = new Set(verifiedSpecs.map((s) => s.label));

  const missingCoreFields: string[] = [];
  let verifiedCoreCount = 0;

  for (const core of coreSpecs) {
    const isMatched = core.aliases.some((alias) => verifiedLabels.has(alias));
    if (isMatched) {
      verifiedCoreCount++;
    } else {
      missingCoreFields.push(core.canonicalName);
    }
  }

  const verifiedFieldCount = verifiedSpecs.length;
  const verificationRate =
    coreFieldTotal > 0 ? Math.min(1, Math.round((verifiedCoreCount / coreFieldTotal) * 100) / 100) : 0;

  const hasOfficialSource = sources.some(
    (s) => s.kind === 'manufacturer' && isValidSourceUrl(s.url) && isValidCheckDate(s.checkedAt)
  );

  let lastCheckedAt: string | null = null;
  for (const s of sources) {
    if (s.checkedAt && isValidCheckDate(s.checkedAt) && (!lastCheckedAt || s.checkedAt > lastCheckedAt)) {
      lastCheckedAt = s.checkedAt;
    }
  }
  for (const spec of verifiedSpecs) {
    if (spec.checkedAt && isValidCheckDate(spec.checkedAt) && (!lastCheckedAt || spec.checkedAt > lastCheckedAt)) {
      lastCheckedAt = spec.checkedAt;
    }
  }

  return {
    entityKind,
    verifiedFieldCount,
    verifiedCoreCount,
    coreFieldTotal,
    verificationRate,
    hasOfficialSource,
    lastCheckedAt,
    missingCoreFields,
  };
}

/** Ingestion boundary: exact identities, stable fact IDs, explicit evidence and separate prices. */
export function createHardwareCatalog(
  items: readonly HardwareItem[],
  verificationFor?: (id: string) => HardwareVerification | undefined
): HardwareCatalog {
  const byId = new Map<string, HardwareRecord>();
  const byCategory = new Map<HardwareItem['category'], string[]>();

  for (const item of items) {
    if (!item.id || byId.has(item.id)) throw new Error(`Duplicate or missing hardware ID: ${item.id}`);

    const [rawMin, rawMax] = item.marketPriceRange;
    if (
      ![rawMin, rawMax].every((value) => typeof value === 'number' && Number.isFinite(value) && value >= 0) ||
      rawMin > rawMax
    ) {
      throw new Error(`Invalid price range: ${item.id}`);
    }

    const candidate = verificationFor?.(item.id);
    const verified = candidate?.modelName === item.name ? candidate : undefined;
    const entityKind = detectEntityKind(item, verified);
    const variantDetails = extractVariantDetails(item, verified);

    const mfgSourceId = `${item.id}:manufacturer`;
    const sources: HardwareRecord['sources'] = [];
    if (
      verified &&
      verified.sourceTitle &&
      isValidSourceUrl(verified.sourceUrl) &&
      isValidCheckDate(verified.checkedAt)
    ) {
      sources.push({
        id: mfgSourceId,
        title: verified.sourceTitle,
        url: verified.sourceUrl,
        checkedAt: verified.checkedAt,
        kind: 'manufacturer',
      });
    }

    if (
      verified?.zol &&
      isValidSourceUrl(verified.zol.parameterUrl) &&
      isValidCheckDate(verified.zol.checkedAt)
    ) {
      sources.push({
        id: `${item.id}:zol`,
        title: 'ZOL product parameters',
        url: verified.zol.parameterUrl,
        checkedAt: verified.zol.checkedAt,
        kind: 'product-database',
      });
    }

    const validSourcesById = new Map(sources.map((s) => [s.id, s]));

    const specifications: SpecificationRecord[] = Object.entries(item.specs).map(([label, value]) => {
      const candidateFact = verified?.fields[label];
      const fact = candidateFact?.value === value ? candidateFact : undefined;

      let isEffectivelyVerified = false;
      let effectiveSourceId: string | undefined;
      let effectiveCheckedAt: string | undefined;
      let sourceKind: SourceKind = 'editorial';

      if (fact && fact.verificationStatus === 'verified') {
        const checkDate = fact.checkedAt || verified?.checkedAt;
        if (isValidCheckDate(checkDate)) {
          let resolvedSource: typeof sources[number] | undefined;
          let hasSourceError = false;

          if (fact.sourceId !== undefined && fact.sourceId !== '') {
            const found = validSourcesById.get(fact.sourceId);
            if (!found) {
              hasSourceError = true;
            } else if (fact.sourceKind && fact.sourceKind !== found.kind) {
              hasSourceError = true;
            } else {
              resolvedSource = found;
            }
          } else {
            const targetKind = fact.sourceKind || 'manufacturer';
            resolvedSource = sources.find((s) => s.kind === targetKind);
          }

          if (!hasSourceError && resolvedSource) {
            isEffectivelyVerified = true;
            effectiveSourceId = resolvedSource.id;
            effectiveCheckedAt = checkDate;
            sourceKind = resolvedSource.kind;
          }
        }
      }

      const verificationStatus: VerificationStatus = isEffectivelyVerified ? 'verified' : 'unverified';
      const evidence =
        isEffectivelyVerified && sourceKind === 'manufacturer'
          ? 'manufacturer-checked'
          : 'editorial-reference';

      return {
        id: fact ? `${item.id}:${fact.fieldId}` : `catalog:${item.id}:${encodeURIComponent(label)}`,
        label,
        value,
        evidence,
        sourceKind: isEffectivelyVerified ? sourceKind : (fact?.sourceKind || 'editorial'),
        verificationStatus,
        ...(isEffectivelyVerified
          ? {
              sourceId: effectiveSourceId,
              sourceField: fact?.sourceField,
              checkedAt: effectiveCheckedAt,
              condition: fact?.condition,
              unit: fact?.unit,
              numericValue: fact?.numericValue,
            }
          : fact?.condition
          ? { condition: fact.condition }
          : {}),
      };
    });

    const auditSummary = computeAuditSummary(item.category, entityKind, specifications, sources);
    const scores = Object.fromEntries(
      Object.entries(item.benchmarks || {}).filter(([, value]) => finitePositive(value))
    );

    const hasKnownPower = finitePositive(item.tdpWatts);
    const isKnownPrice = isValidPriceRange(item.marketPriceRange);
    const min = isKnownPrice ? rawMin : null;
    const max = isKnownPrice ? rawMax : null;

    const hasValidOfficialSource = sources.some(
      (s) => s.kind === 'manufacturer' && isValidSourceUrl(s.url) && isValidCheckDate(s.checkedAt)
    );

    const expectedPowerFieldId = CATEGORY_POWER_FIELD_IDS[item.category];

    // 1. Power specification fact must strictly match the canonical power field ID for this category.
    // Loose label matching or sourceField text matching is strictly forbidden so that non-power
    // facts (such as gpu.recommendedPsu) can never endorse power.
    const powerSpec = expectedPowerFieldId
      ? specifications.find((s) => s.id === `${item.id}:${expectedPowerFieldId}`)
      : undefined;

    // 2. Verified numeric value must be explicit, finite positive, and equal to item.tdpWatts.
    // numericValue being null/undefined is NOT accepted.
    const isPowerNumericValid =
      powerSpec !== undefined &&
      typeof powerSpec.numericValue === 'number' &&
      Number.isFinite(powerSpec.numericValue) &&
      powerSpec.numericValue > 0 &&
      powerSpec.numericValue === item.tdpWatts;

    // 3. Unit must be explicit and must be valid power units ('W' or '瓦').
    // Missing or empty unit is NOT accepted.
    const isPowerUnitValid =
      powerSpec !== undefined &&
      typeof powerSpec.unit === 'string' &&
      ['W', '瓦'].includes(powerSpec.unit.trim().toUpperCase());

    // 4. Condition must be explicit and consistent:
    // Missing condition is NOT accepted. For reference products, partner OC conditions cannot endorse.
    const isPowerConditionValid =
      powerSpec !== undefined &&
      typeof powerSpec.condition === 'string' &&
      powerSpec.condition.trim().length > 0 &&
      (entityKind === 'partner-variant' || !/一键超频|非公/.test(powerSpec.condition));

    const isPowerVerified = Boolean(
      hasKnownPower &&
      hasValidOfficialSource &&
      verified &&
      verified.tdpWatts === item.tdpWatts &&
      isValidCheckDate(verified.checkedAt) &&
      powerSpec &&
      powerSpec.verificationStatus === 'verified' &&
      powerSpec.sourceKind === 'manufacturer' &&
      powerSpec.evidence === 'manufacturer-checked' &&
      isPowerNumericValid &&
      isPowerUnitValid &&
      isPowerConditionValid
    );

    const record: HardwareRecord = {
      schemaVersion: 1,
      entityKind,
      ...(variantDetails ? { variantDetails } : {}),
      identity: {
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        series: item.series,
        releaseYear: item.releaseYear,
        platform: item.isLaptop || item.category === 'laptop' ? 'laptop' : 'desktop',
      },
      specifications,
      auditSummary,
      sources,
      power: {
        watts: hasKnownPower ? item.tdpWatts : null,
        isKnown: hasKnownPower,
        evidence: isPowerVerified ? 'manufacturer-checked' : 'editorial-reference',
        meaning: isPowerVerified
          ? (verified?.powerSourceField ||
             powerSpec?.sourceField ||
             (item.category === 'cpu'
               ? 'Default TDP'
               : item.category === 'gpu'
               ? 'Total Graphics Power (W)'
               : '官方核验功耗'))
          : (hasKnownPower
              ? 'Catalog power reference; meaning depends on component category'
              : '功耗未记录'),
      },
      pricing: {
        currency: 'CNY',
        evidence: 'editorial-reference',
        referenceRange: { min, max },
        isKnownRange: isKnownPrice,
        launchReference: finitePositive(item.msrpRmb) ? item.msrpRmb : null,
        history: (item.priceHistory || [])
          .filter((entry) => entry.date && finitePositive(entry.price))
          .map((entry) => ({ label: entry.date, amount: entry.price })),
      },
      benchmarks: { evidence: 'editorial-reference', scores },
      links: {
        documents: (item.docsLinks || []).filter(safeLink).map((link) => ({ ...link })),
        reviews: (item.reviewLinks || []).filter(safeLink).map((link) => ({ ...link })),
      },
    };

    byId.set(item.id, record);
    const categoryIds = byCategory.get(item.category) || [];
    categoryIds.push(item.id);
    byCategory.set(item.category, categoryIds);
  }

  return { schemaVersion: 1, ids: [...byId.keys()], byId, byCategory };
}

/**
 * Pure safe sort function for price ascending/descending.
 * Unknown, invalid, or zero placeholder prices are placed at the very end of the list.
 */
export function safeSortHardwareByPrice<T extends { marketPriceRange: [number, number] }>(
  items: readonly T[],
  ascending: boolean
): T[] {
  return [...items].sort((a, b) => {
    const aValid = isValidPriceRange(a.marketPriceRange);
    const bValid = isValidPriceRange(b.marketPriceRange);

    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;

    const aMin = a.marketPriceRange[0];
    const bMin = b.marketPriceRange[0];
    return ascending ? aMin - bMin : bMin - aMin;
  });
}

/**
 * Pure safe sort function for TDP.
 * Unknown or 0 watts are placed at the end of the list.
 */
export function safeSortHardwareByTdp<T extends { tdpWatts: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const aTdp = a.tdpWatts;
    const bTdp = b.tdpWatts;
    const aKnown = typeof aTdp === 'number' && Number.isFinite(aTdp) && aTdp > 0;
    const bKnown = typeof bTdp === 'number' && Number.isFinite(bTdp) && bTdp > 0;

    if (!aKnown && !bKnown) return 0;
    if (!aKnown) return 1;
    if (!bKnown) return -1;

    return bTdp - aTdp;
  });
}

