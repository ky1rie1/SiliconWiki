import {
  CustomBuild,
  CustomBuildSlotItem,
  BuildSlotType,
  BuildSlotTypes,
} from '../types/pcBuilder';
import { HardwareItem, RecommendedBuild } from '../types';
import { HardwareRecord } from '../types/hardwareCatalog';
import { hardwareCatalog } from '../data/hardware';
import {
  calculateBuildCost,
  calculateBuildPower,
  checkBuildCompatibility,
  createCatalogMap,
  CatalogInput,
} from './pcCompatibility';
import { isValidPriceRange } from './hardwareCatalog';

export const MAX_JSON_SIZE_BYTES = 65536; // 64KB
export const MAX_URL_PARAM_LENGTH = 2048; // 2048 characters max

export interface BuildValidationResult {
  valid: boolean;
  error?: string;
  build?: CustomBuild;
}

/**
 * 统一配置单合法性验证引擎
 * 严格验证 schemaVersion、单品类单槽位模型、slotId 唯一性、品类匹配度、严格数量区间与价格冲突
 */
export function validateCustomBuild(
  rawBuild: unknown,
  catalog?: CatalogInput
): BuildValidationResult {
  if (!rawBuild || typeof rawBuild !== 'object' || Array.isArray(rawBuild)) {
    return { valid: false, error: '配置单结构不合法：必须是有效对象' };
  }

  const obj = rawBuild as Record<string, unknown>;

  if (obj.schemaVersion !== 1) {
    return {
      valid: false,
      error: `不支持的配置单版本（期望 schemaVersion: 1，实际为 ${String(obj.schemaVersion)}）`,
    };
  }

  const title =
    typeof obj.title === 'string' && obj.title.trim()
      ? obj.title.trim().slice(0, 50)
      : '自选装机单';

  let targetBudget: number | null = null;
  if (obj.targetBudget !== undefined && obj.targetBudget !== null) {
    if (typeof obj.targetBudget === 'number' && Number.isFinite(obj.targetBudget) && obj.targetBudget >= 0) {
      targetBudget = Math.round(obj.targetBudget);
    } else {
      return { valid: false, error: '目标预算 (targetBudget) 必须是非负数值或 null' };
    }
  }

  if (!Array.isArray(obj.slots)) {
    return { valid: false, error: '配置单配件列表 (slots) 必须是数组' };
  }

  if (obj.slots.length > 20) {
    return { valid: false, error: '配置单配件项过多（超出 20 项上限）' };
  }

  const catalogMap = catalog ? createCatalogMap(catalog) : hardwareCatalog.byId;
  const validTypesSet = new Set<string>(BuildSlotTypes);
  const seenTypes = new Set<string>();
  const seenSlotIds = new Set<string>();
  const validatedSlots: CustomBuildSlotItem[] = [];

  for (let i = 0; i < obj.slots.length; i++) {
    const rawSlot = obj.slots[i];
    if (!rawSlot || typeof rawSlot !== 'object') {
      return { valid: false, error: `第 ${i + 1} 项配件结构损坏` };
    }
    const s = rawSlot as Record<string, unknown>;

    if (typeof s.type !== 'string' || !validTypesSet.has(s.type)) {
      return {
        valid: false,
        error: `第 ${i + 1} 项配件品类不合法：${String(s.type)}`,
      };
    }

    const type = s.type as BuildSlotType;

    // 单品类单槽位模型：同一品类不允许重复出现
    if (seenTypes.has(type)) {
      return {
        valid: false,
        error: `配置单中存在重复的配件槽位类型「${type}」，每种品类仅允许配置一个主槽位`,
      };
    }
    seenTypes.add(type);

    // slotId 唯一性检查
    const rawSlotId = typeof s.slotId === 'string' && s.slotId.trim() ? s.slotId.trim() : null;
    if (rawSlotId) {
      if (seenSlotIds.has(rawSlotId)) {
        return {
          valid: false,
          error: `配置单中存在重复的 slotId「${rawSlotId}」`,
        };
      }
      seenSlotIds.add(rawSlotId);
    }
    const slotId = rawSlotId || `slot-${type}-${Date.now()}-${i}`;

    // 数量严格检查（拒绝负数、0、小数，及不符合品类规格的超限数量，禁止静默截断）
    const qty = s.quantity;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty <= 0) {
      return {
        valid: false,
        error: `配件「${type}」数量必须为正整数，当前为 ${String(qty)}`,
      };
    }

    // 单件品类装机数量必须严格为 1
    const singleUnitTypes: BuildSlotType[] = ['cpu', 'motherboard', 'gpu', 'cooler', 'psu', 'case'];
    if (singleUnitTypes.includes(type)) {
      if (qty !== 1) {
        return {
          valid: false,
          error: `单件品类「${type}」的装机数量必须为 1，不支持配置 ${qty} 件`,
        };
      }
    } else if (type === 'ram') {
      if (qty < 1 || qty > 2) {
        return {
          valid: false,
          error: `内存数量必须为 1 到 2 套，当前为 ${qty} 套`,
        };
      }
    } else if (type === 'storage') {
      if (qty < 1 || qty > 4) {
        return {
          valid: false,
          error: `存储数量必须为 1 到 4 块，当前为 ${qty} 块`,
        };
      }
    }

    // 自定义价格与自备 0 元冲突检查
    if (
      s.isExplicitZeroPrice !== undefined &&
      s.isExplicitZeroPrice !== null &&
      typeof s.isExplicitZeroPrice !== 'boolean'
    ) {
      return {
        valid: false,
        error: `配件「${type}」的 isExplicitZeroPrice 必须为布尔值 (boolean)，当前为 ${typeof s.isExplicitZeroPrice}`,
      };
    }
    const isExplicitZeroPrice = s.isExplicitZeroPrice === true;
    let userPrice: number | null = null;
    if (s.userPrice !== undefined && s.userPrice !== null) {
      if (typeof s.userPrice === 'number' && Number.isFinite(s.userPrice) && s.userPrice >= 0) {
        userPrice = Math.round(s.userPrice * 100) / 100;
      } else {
        return {
          valid: false,
          error: `配件「${type}」的自定义价格必须为非负数值`,
        };
      }
    }

    if (isExplicitZeroPrice && userPrice !== null && userPrice > 0) {
      return {
        valid: false,
        error: `配件「${type}」同时标记为自备 0 元与自定义大于 0 价格冲突`,
      };
    }

    // hardwareId 与品类匹配度检查
    let hardwareId: string | null = null;
    if (typeof s.hardwareId === 'string' && s.hardwareId.trim()) {
      hardwareId = s.hardwareId.trim().slice(0, 100);

      // 先查 catalog
      const catalogItem = catalogMap.get(hardwareId);
      if (catalogItem) {
        const itemCat = 'category' in catalogItem ? catalogItem.category : catalogItem.identity?.category;
        if (itemCat && itemCat !== type) {
          return {
            valid: false,
            error: `配件「${hardwareId}」所属品类 (${itemCat}) 与槽位品类 (${type}) 不匹配`,
          };
        }
      } else {
        // 未在配件库中直接查到，检查 ID 前缀是否与当前槽位品类冲突
        const prefixMap: Record<string, BuildSlotType> = {
          'gpu-': 'gpu',
          'cpu-': 'cpu',
          'mb-': 'motherboard',
          'motherboard-': 'motherboard',
          'ram-': 'ram',
          'cooler-': 'cooler',
          'psu-': 'psu',
          'case-': 'case',
          'chassis-': 'case',
          'ssd-': 'storage',
          'storage-': 'storage',
        };
        for (const [prefix, pType] of Object.entries(prefixMap)) {
          if (hardwareId.toLowerCase().startsWith(prefix) && pType !== type) {
            return {
              valid: false,
              error: `配件「${hardwareId}」所属类别与槽位类别 (${type}) 不匹配`,
            };
          }
        }
        // 未冲突的前缀或自定义 ID 保留为未核实配件
      }
    }

    const customName =
      typeof s.customName === 'string' && s.customName.trim()
        ? s.customName.trim().slice(0, 100)
        : undefined;

    const notes =
      typeof s.notes === 'string' && s.notes.trim()
        ? s.notes.trim().slice(0, 200)
        : undefined;

    validatedSlots.push({
      slotId,
      type,
      hardwareId,
      customName,
      userPrice,
      isExplicitZeroPrice,
      quantity: qty,
      notes,
    });
  }

  const buildNotes =
    typeof obj.notes === 'string' && obj.notes.trim()
      ? obj.notes.trim().slice(0, 200)
      : undefined;

  const validBuild: CustomBuild = {
    schemaVersion: 1,
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim().slice(0, 50) : `build-${Date.now()}`,
    title,
    targetBudget,
    slots: validatedSlots,
    notes: buildNotes,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { valid: true, build: validBuild };
}

/**
 * 导出装机单为带模式版本 (schemaVersion: 1) 的标准 JSON 字符串
 */
export function exportBuildToJson(build: CustomBuild): string {
  const exportPayload: CustomBuild = {
    schemaVersion: 1,
    id: build.id || `build-${Date.now()}`,
    title: (build.title || '自选装机单').slice(0, 50),
    targetBudget:
      typeof build.targetBudget === 'number' && Number.isFinite(build.targetBudget) && build.targetBudget >= 0
        ? Math.round(build.targetBudget)
        : null,
    slots: (build.slots || []).slice(0, 20).map((s) => ({
      slotId: s.slotId || `slot-${s.type}-${Math.random().toString(36).slice(2, 8)}`,
      type: s.type,
      hardwareId: s.hardwareId ? String(s.hardwareId).slice(0, 100) : null,
      customName: s.customName ? String(s.customName).slice(0, 100) : undefined,
      userPrice:
        typeof s.userPrice === 'number' && Number.isFinite(s.userPrice) && s.userPrice >= 0
          ? Math.round(s.userPrice * 100) / 100
          : null,
      isExplicitZeroPrice: Boolean(s.isExplicitZeroPrice),
      quantity: s.quantity,
      notes: s.notes ? String(s.notes).slice(0, 200) : undefined,
    })),
    notes: build.notes ? String(build.notes).slice(0, 200) : undefined,
    createdAt: build.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * 导入装机单 JSON 字符串，严格进行安全性校验、大小熔断与字段边界审查
 */
export function importBuildFromJson(
  jsonStr: string,
  catalog?: CatalogInput
): {
  success: boolean;
  build?: CustomBuild;
  error?: string;
} {
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) {
    return { success: false, error: '导入数据为空' };
  }

  // 1. 大小上限熔断 (64KB UTF-8 字节)
  const byteLength =
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(jsonStr).length
      : Buffer.byteLength(jsonStr, 'utf8');

  if (byteLength > MAX_JSON_SIZE_BYTES) {
    return {
      success: false,
      error: `文件体积超出上限（最大允许 64KB，当前为 ${(byteLength / 1024).toFixed(1)}KB）`,
    };
  }

  // 2. JSON 解析
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { success: false, error: 'JSON 格式解析失败，请检查文件是否完整' };
  }

  // 3. 统一委托至 validateCustomBuild
  const res = validateCustomBuild(parsed, catalog);
  if (!res.valid) {
    return { success: false, error: res.error };
  }

  return { success: true, build: res.build };
}

/**
 * 紧凑 URL 共享 Payload 格式
 */
interface CompactBuildSharePayload {
  v: 1;
  t?: string; // 标题
  b?: number | null; // 目标预算
  s: Array<[
    BuildSlotType, // 0: type
    string | null, // 1: hardwareId
    number | null, // 2: userPrice
    number, // 3: quantity
    string | undefined, // 4: customName
    number | undefined // 5: explicit zero price (1 or 0)
  ]>;
}

/**
 * UTF-8 安全 Base64 编码（支持中文，不调用仅支持 Latin1 的原生 btoa）
 */
function toUrlSafeBase64(str: string): string {
  let binary = '';
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(str);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  } else {
    binary = unescape(encodeURIComponent(str));
  }

  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  // URL-safe replacement: + -> -, / -> _, remove = padding
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * UTF-8 安全 Base64 解码（支持 URL-safe Base64 字符）
 */
function fromUrlSafeBase64(urlSafeBase64: string): string {
  let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
  // Add back padding if missing
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  let binary = '';
  if (typeof atob !== 'undefined') {
    binary = atob(base64);
  } else {
    binary = Buffer.from(base64, 'base64').toString('binary');
  }

  if (typeof TextDecoder !== 'undefined') {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  return decodeURIComponent(escape(binary));
}

/**
 * 将装机单序列化为可在 URL 查询参数中传递的紧凑 Base64 编码字符串
 * 包含 2048 字符硬限制，不包含敏感用户长备注，保留 2 位小数报价
 */
export function serializeBuildToUrl(build: CustomBuild): {
  success: boolean;
  urlParam?: string;
  error?: string;
} {
  try {
    const compact: CompactBuildSharePayload = {
      v: 1,
      t: build.title ? build.title.slice(0, 30) : undefined,
      b:
        typeof build.targetBudget === 'number' && Number.isFinite(build.targetBudget) && build.targetBudget > 0
          ? Math.round(build.targetBudget)
          : undefined,
      s: (build.slots || []).map((s) => [
        s.type,
        s.hardwareId ? s.hardwareId : null,
        typeof s.userPrice === 'number' && Number.isFinite(s.userPrice) && s.userPrice >= 0
          ? Math.round(s.userPrice * 100) / 100 // 保留 2 位小数
          : null,
        s.quantity > 1 ? s.quantity : 1,
        s.customName ? s.customName.slice(0, 30) : undefined,
        s.isExplicitZeroPrice ? 1 : undefined,
      ]),
    };

    const jsonStr = JSON.stringify(compact);
    const encoded = toUrlSafeBase64(jsonStr);

    if (encoded.length > MAX_URL_PARAM_LENGTH) {
      return {
        success: false,
        error: `配置单数据过大（编码后达 ${encoded.length} 字符，超出 URL 2048 字符分享上限），请使用「导出 JSON」功能进行分享。`,
      };
    }

    return { success: true, urlParam: encoded };
  } catch (err) {
    return {
      success: false,
      error: `序列化配置单失败：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * 从 URL 参数中反序列化装机单
 * 严格审查每个槽位结构，损坏项拒绝反序列化，绝不静默 continue 丢件
 */
export function deserializeBuildFromUrl(urlParam: string, catalog?: CatalogInput): CustomBuild | null {
  if (!urlParam || typeof urlParam !== 'string' || !urlParam.trim()) {
    return null;
  }

  // 0. URL 长度上限检查（必须在解码前拦截）
  if (urlParam.trim().length > MAX_URL_PARAM_LENGTH) {
    return null;
  }

  try {
    const jsonStr = fromUrlSafeBase64(urlParam.trim());

    // 0.1 解码后 JSON 体积上限检查
    const byteLength =
      typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(jsonStr).length
        : Buffer.byteLength(jsonStr, 'utf8');
    if (byteLength > MAX_JSON_SIZE_BYTES) {
      return null;
    }

    const parsed = JSON.parse(jsonStr) as CompactBuildSharePayload;

    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.s)) {
      return null;
    }

    const validTypesSet = new Set<string>(BuildSlotTypes);
    const rawSlots: any[] = [];

    for (let i = 0; i < parsed.s.length; i++) {
      const item = parsed.s[i];
      // 如果不是有效数组，或缺少基础元素，严禁使用 continue 静默忽略，必须整个拒绝！
      if (!Array.isArray(item) || item.length < 2) {
        return null;
      }

      const type = item[0];
      if (!validTypesSet.has(type)) {
        // 发现损坏的品类类型，必须直接拒绝，绝不静默跳过！
        return null;
      }

      const hardwareId = typeof item[1] === 'string' && item[1].trim() ? item[1].trim() : null;
      // 保持原始数据形态传递给统一校验器，绝不在反序列化前提前将负数篡改为 null 或将字符串篡改为 1
      const userPrice = item[2];
      const quantity = item[3];
      const customName = typeof item[4] === 'string' && item[4].trim() ? item[4].trim() : undefined;
      const isExplicitZeroPrice =
        item[5] === 1
          ? true
          : item[5] === 0
          ? false
          : item[5] === null || item[5] === undefined
          ? (userPrice === 0 ? true : false)
          : item[5];

      rawSlots.push({
        slotId: `shared-slot-${type}-${i}`,
        type,
        hardwareId,
        customName,
        userPrice,
        isExplicitZeroPrice,
        quantity,
      });
    }

    const candidateBuild = {
      schemaVersion: 1,
      id: `shared-${Date.now()}`,
      title: typeof parsed.t === 'string' && parsed.t.trim() ? parsed.t.trim() : '分享的装机单',
      targetBudget: typeof parsed.b === 'number' && parsed.b > 0 ? parsed.b : null,
      slots: rawSlots,
    };

    // 严格调用统一校验器，不合法则返回 null
    const valRes = validateCustomBuild(candidateBuild, catalog);
    if (!valRes.valid || !valRes.build) {
      return null;
    }

    return valRes.build;
  } catch {
    return null;
  }
}

/**
 * 生成配置单纯文本 / Markdown 格式，便于直接复制到社群、论坛或评论区讨论
 */
export function generateBuildPlainText(
  build: CustomBuild,
  catalog?: (HardwareItem | HardwareRecord)[],
  lang: 'zh' | 'en' = 'zh'
): string {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : Array.from(hardwareCatalog.byId.values());
  const catalogMap = createCatalogMap(safeCatalog);
  const cost = calculateBuildCost(build, safeCatalog);
  const power = calculateBuildPower(build, safeCatalog);
  const report = checkBuildCompatibility(build, safeCatalog);

  const slotNameMap: Record<BuildSlotType, { zh: string; en: string }> = {
    cpu: { zh: '处理器 (CPU)', en: 'Processor (CPU)' },
    cooler: { zh: '散热器 (Cooler)', en: 'Cooler' },
    motherboard: { zh: '主板 (Motherboard)', en: 'Motherboard' },
    ram: { zh: '内存 (RAM)', en: 'Memory (RAM)' },
    gpu: { zh: '显卡 (GPU)', en: 'Graphics Card (GPU)' },
    storage: { zh: '固态硬盘 (SSD)', en: 'Storage (SSD)' },
    psu: { zh: '电源 (PSU)', en: 'Power Supply (PSU)' },
    case: { zh: '机箱 (Chassis)', en: 'Case' },
  };

  const getHardwareInfo = (slot: CustomBuildSlotItem): { name: string; priceText: string; verifiedNote: string } => {
    // 1. 独立解析配件型号与核验状态（即使填写了自定义价格，也必须优先输出真实的库内型号名称）
    let name = slot.customName || '未选配件';
    let verifiedNote = '';

    if (slot.hardwareId) {
      const item = catalogMap.get(slot.hardwareId);
      if (item) {
        if ('identity' in item) {
          name = item.identity.name;
          if (item.auditSummary?.hasOfficialSource) {
            verifiedNote = ' [官方核验]';
          } else if (item.auditSummary && item.auditSummary.verifiedCoreCount > 0) {
            verifiedNote = ' [已核验核心]';
          }
        } else {
          name = item.name;
        }
      } else if (!slot.customName) {
        name = `${slot.hardwareId} (库外配件)`;
      }
    }

    // 2. 独立解析价格信息
    let priceText = '价格待查';
    if (slot.isExplicitZeroPrice) {
      priceText = '￥0 (自备/赠送)';
    } else if (slot.userPrice !== null && typeof slot.userPrice === 'number') {
      priceText = `￥${slot.userPrice} (自选报价)`;
    } else if (slot.hardwareId) {
      const item = catalogMap.get(slot.hardwareId);
      if (item) {
        if ('identity' in item) {
          if (item.pricing?.isKnownRange && typeof item.pricing.referenceRange?.min === 'number') {
            const pMin = item.pricing.referenceRange.min;
            const pMax = item.pricing.referenceRange.max;
            priceText = pMin !== pMax ? `￥${pMin}~￥${pMax} (市场参考)` : `￥${pMin} (市场参考)`;
          } else if (item.pricing?.launchReference) {
            priceText = `￥${item.pricing.launchReference} (首发参考，未取到当前市场报价)`;
          }
        } else {
          if (isValidPriceRange(item.marketPriceRange)) {
            const pMin = item.marketPriceRange[0];
            const pMax = item.marketPriceRange[1];
            priceText = pMin !== pMax ? `￥${pMin}~￥${pMax} (市场参考)` : `￥${pMin} (市场参考)`;
          } else if (item.msrpRmb) {
            priceText = `￥${item.msrpRmb} (首发参考，未取到当前市场报价)`;
          }
        }
      }
    }

    if (slot.quantity > 1) {
      priceText += ` × ${slot.quantity}`;
    }

    return { name, priceText, verifiedNote };
  };

  const lines: string[] = [];

  if (lang === 'en') {
    const costText = cost.isRange
      ? `¥${cost.knownSubtotalMin} ~ ¥${cost.knownSubtotalMax}`
      : `¥${cost.knownTotalCost}`;
    const budgetNote = cost.budgetStatus === 'spans-budget' ? ' [Spans Budget]' : '';

    lines.push(`【SiliconWiki Custom PC Build】${build.title}`);
    lines.push(
      `Budget: ${build.targetBudget ? `¥${build.targetBudget}` : 'N/A'} | Total Cost: ${costText}${budgetNote} (${cost.hasUnknownPrices ? `Partial Known Subtotal, ${cost.unknownPriceSlotCount} item(s) unpriced` : 'Complete Total'})`
    );
    lines.push('----------------------------------------');
    lines.push('Component Bill of Materials (BOM):');
    for (const slot of build.slots) {
      const info = getHardwareInfo(slot);
      const label = slotNameMap[slot.type]?.en || slot.type;
      lines.push(`• ${label.padEnd(20, ' ')}: ${info.name} — ${info.priceText}${info.verifiedNote}`);
    }
    lines.push('----------------------------------------');
    lines.push(
      `Estimated Peak Power: ~${power.estimatedPeakWatts ?? 'unknown'}W (CPU: ${power.cpuWatts ?? 'unknown'}W, GPU: ${power.gpuWatts ?? 'unknown'}W, Baseline: 60W empirical)`
    );
    lines.push(
      `Recommended PSU Rating: ≥ ${power.manufacturerPsuRecommendationWatts ?? 'unknown'}W (Installed PSU: ${power.psuRatedWatts ? `${power.psuRatedWatts}W` : 'Not Selected'})`
    );
    lines.push(`Notice: ${power.empiricalEstimateNotice}`);
    lines.push('----------------------------------------');
    lines.push(
      `Compatibility Diagnostic: ${
        report.overallStatus === 'pass'
          ? 'Passed known rule checks'
          : report.overallStatus === 'error'
          ? `Found ${report.errorCount} hard conflict(s)`
          : report.overallStatus === 'warning'
          ? `Found ${report.warningCount} caution item(s)`
          : 'Partially verified / Incomplete build'
      }`
    );
    if (report.errorCount > 0) {
      lines.push('Conflicts:');
      for (const r of report.rules.filter((r) => r.status === 'error')) {
        lines.push(`  ✕ [${r.title}] ${r.message}`);
      }
    }
    lines.push('----------------------------------------');
    lines.push(
      'Notice: Generated by SiliconWiki Custom Builder based on known rules. Not an official hardware manufacturer certification. Verify physical fit prior to purchase.'
    );
  } else {
    const costText = cost.isRange
      ? `￥${cost.knownSubtotalMin} ~ ￥${cost.knownSubtotalMax}`
      : `￥${cost.knownTotalCost}`;
    const budgetNote = cost.budgetStatus === 'spans-budget' ? ' [跨越预算线]' : '';

    lines.push(`【SiliconWiki 芯知自选装机单】${build.title}`);
    lines.push(
      `目标预算：${build.targetBudget ? `￥${build.targetBudget}` : '未设定'} | 配件花费：${costText}${budgetNote}（${cost.hasUnknownPrices ? `已知部分合计，${cost.unknownPriceSlotCount}项未报价` : '完整总计'}）`
    );
    lines.push('----------------------------------------');
    lines.push('配件配置清单 (BOM)：');
    for (const slot of build.slots) {
      const info = getHardwareInfo(slot);
      const label = slotNameMap[slot.type]?.zh || slot.type;
      lines.push(`• ${label.padEnd(16, ' ')}：${info.name} —— ${info.priceText}${info.verifiedNote}`);
    }
    lines.push('----------------------------------------');
    lines.push(
      `整机满载预估功耗：约 ${power.estimatedPeakWatts ?? '未知'}W（CPU: ${power.cpuWatts ?? '未知'}W，显卡: ${power.gpuWatts ?? '未知'}W，平台基底: 60W 经验假设）`
    );
    lines.push(
      `建议电源额定：≥ ${power.manufacturerPsuRecommendationWatts ?? '未知'}W（已选电源：${power.psuRatedWatts ? `${power.psuRatedWatts}W` : '未选择'}）`
    );
    lines.push(`功耗说明：${power.empiricalEstimateNotice}`);
    lines.push('----------------------------------------');
    lines.push(
      `兼容性规则诊断：${
        report.overallStatus === 'pass'
          ? '✓ 全部已知规则通过'
          : report.overallStatus === 'error'
          ? `✕ 发现 ${report.errorCount} 项硬冲突`
          : report.overallStatus === 'warning'
          ? `! 存在 ${report.warningCount} 项安装注意事项`
          : '？ 部分项目待核验 / 配件未齐备'
      }`
    );
    if (report.errorCount > 0) {
      lines.push('硬冲突明细：');
      for (const r of report.rules.filter((r) => r.status === 'error')) {
        lines.push(`  ✕ 【${r.title}】${r.message}`);
      }
    }
    lines.push('----------------------------------------');
    lines.push(
      '【免责声明】本配置单由 SiliconWiki 自选装机配置器生成，结论基于已知规则引擎计算，非厂商官方认证。实际公差与BIOS兼容性请以实物与厂商说明书为准。'
    );
  }

  return lines.join('\n');
}

/**
 * 安全从当前浏览器 URL 或传入的 URL 字符串中提取配置单视图与分享 Payload
 * 严格保留分享 Payload 的原始大小写（绝不对其调用 toLowerCase）
 */
export function getBuildUrlParams(urlOrHref?: string): {
  view: 'recommended' | 'custom';
  sharePayload: string | null;
} {
  let searchStr = '';
  let hashStr = '';

  if (typeof urlOrHref === 'string') {
    try {
      const u = new URL(urlOrHref, 'https://computer-wiki.vercel.app');
      searchStr = u.search;
      hashStr = u.hash;
    } catch {
      // 容错处理纯 hash 或相对路径
      const qIndex = urlOrHref.indexOf('?');
      const hIndex = urlOrHref.indexOf('#');
      if (hIndex !== -1) {
        hashStr = urlOrHref.slice(hIndex);
      }
      if (qIndex !== -1 && (hIndex === -1 || qIndex < hIndex)) {
        searchStr = urlOrHref.slice(qIndex, hIndex !== -1 ? hIndex : undefined);
      }
    }
  } else if (typeof window !== 'undefined') {
    searchStr = window.location.search;
    hashStr = window.location.hash;
  }

  let view: 'recommended' | 'custom' = 'recommended';
  let sharePayload: string | null = null;

  // 1. 优先检查标准查询参数 (?view=custom, ?share=XYZ)
  if (searchStr) {
    const searchParams = new URLSearchParams(searchStr);
    const searchView = searchParams.get('view')?.toLowerCase();
    if (searchView === 'custom') {
      view = 'custom';
    }
    const searchShare = searchParams.get('share');
    if (searchShare && searchShare.trim()) {
      sharePayload = searchShare.trim();
    }
  }

  // 2. 检查 Hash 路由中的查询参数 (如 #/builds?view=custom&share=XYZ)
  const rawHash = hashStr.replace(/^#\/?/, '').trim();
  const qIndex = rawHash.indexOf('?');
  if (qIndex !== -1) {
    const hashRoute = rawHash.slice(0, qIndex).toLowerCase();
    if (hashRoute === 'builder' || hashRoute === 'custom') {
      view = 'custom';
    }
    const hashQuery = rawHash.slice(qIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    const hashView = hashParams.get('view')?.toLowerCase();
    if (hashView === 'custom') {
      view = 'custom';
    }
    const hashShare = hashParams.get('share');
    if (hashShare && hashShare.trim()) {
      sharePayload = hashShare.trim();
    }
  } else {
    if (rawHash.toLowerCase() === 'builder' || rawHash.toLowerCase() === 'custom') {
      view = 'custom';
    }
  }

  return { view, sharePayload };
}

/**
 * 将官方/社区精选推荐配置转换为自选装机单草稿
 * 优先依据确切硬件名称/ID 匹配，未匹配项标记为待确认型号并保留文本与参考价
 */
export function convertRecommendedBuildToCustomBuild(
  recommended: RecommendedBuild,
  catalog?: (HardwareItem | HardwareRecord)[]
): CustomBuild {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : Array.from(hardwareCatalog.byId.values());
  const typeMap: Record<string, BuildSlotType> = {
    CPU: 'cpu',
    主板: 'motherboard',
    散热: 'cooler',
    散热器: 'cooler',
    内存: 'ram',
    显卡: 'gpu',
    固态: 'storage',
    固态硬盘: 'storage',
    存储: 'storage',
    电源: 'psu',
    机箱: 'case',
  };

  const slots: CustomBuildSlotItem[] = [];

  for (let i = 0; i < recommended.parts.length; i++) {
    const part = recommended.parts[i];
    const slotType = typeMap[part.type];
    if (!slotType) continue;

    // 查找硬件目录中是否存在确切匹配的型号（严格匹配，严禁模糊替换）
    let matchedId: string | null = null;
    const cleanPartName = part.name.trim().toLowerCase();

    for (const item of safeCatalog) {
      if ('identity' in item) {
        if (item.identity.category === slotType) {
          const catName = item.identity.name.trim().toLowerCase();
          const catId = item.identity.id.trim().toLowerCase();
          if (catName === cleanPartName || catId === cleanPartName) {
            matchedId = item.identity.id;
            break;
          }
        }
      } else {
        if (item.category === slotType) {
          const catName = item.name.trim().toLowerCase();
          const catId = item.id.trim().toLowerCase();
          if (catName === cleanPartName || catId === cleanPartName) {
            matchedId = item.id;
            break;
          }
        }
      }
    }

    slots.push({
      slotId: `slot-${slotType}-${Date.now()}-${i}`,
      type: slotType,
      hardwareId: matchedId,
      customName: matchedId ? undefined : part.name, // 无法唯一定位时保留原文本标记为自备/待确认
      userPrice: matchedId ? null : part.approxPrice,
      isExplicitZeroPrice: false,
      quantity: 1,
      notes: part.spec ? `规格参考：${part.spec}` : undefined,
    });
  }

  return {
    schemaVersion: 1,
    id: `build-from-${recommended.id}-${Date.now()}`,
    title: `${recommended.title} (自选版)`,
    targetBudget: recommended.targetPrice || recommended.totalPrice || null,
    slots,
    notes: `以 SiliconWiki 推荐方案「${recommended.title}」为蓝本自选装机。\n适用场景：${recommended.scenario}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
