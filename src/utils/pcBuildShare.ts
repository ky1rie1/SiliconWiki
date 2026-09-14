import {
  CustomBuild,
  CustomBuildSlotItem,
  BuildSlotType,
  BuildSlotTypes,
} from '../types/pcBuilder';
import { HardwareItem, RecommendedBuild } from '../types';
import { HardwareRecord } from '../types/hardwareCatalog';
import { hardwareCatalog } from '../data/hardware';
import { calculateBuildCost, calculateBuildPower, checkBuildCompatibility } from './pcCompatibility';

const MAX_JSON_SIZE_BYTES = 65536; // 64KB
const MAX_URL_PARAM_LENGTH = 2048; // 2048 characters max

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
      quantity: Math.min(10, Math.max(1, Math.floor(s.quantity || 1))),
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
export function importBuildFromJson(jsonStr: string): {
  success: boolean;
  build?: CustomBuild;
  error?: string;
} {
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) {
    return { success: false, error: '导入数据为空' };
  }

  // 1. 大小上限熔断 (64KB)
  if (jsonStr.length > MAX_JSON_SIZE_BYTES) {
    return {
      success: false,
      error: `文件体积超出上限（最大允许 64KB，当前为 ${(jsonStr.length / 1024).toFixed(1)}KB）`,
    };
  }

  // 2. JSON 解析
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { success: false, error: 'JSON 格式解析失败，请检查文件是否完整' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: '配置单结构不合法：根对象必须是键值对象' };
  }

  const obj = parsed as Record<string, unknown>;

  // 3. 版本校验
  if (obj.schemaVersion !== 1) {
    return {
      success: false,
      error: `不支持的配置单版本（期望 schemaVersion: 1，实际为 ${String(obj.schemaVersion)}）`,
    };
  }

  // 4. 标题与预算字段验证
  const title =
    typeof obj.title === 'string' && obj.title.trim()
      ? obj.title.trim().slice(0, 50)
      : '导入的装机单';

  let targetBudget: number | null = null;
  if (obj.targetBudget !== undefined && obj.targetBudget !== null) {
    if (typeof obj.targetBudget === 'number' && Number.isFinite(obj.targetBudget) && obj.targetBudget >= 0) {
      targetBudget = Math.round(obj.targetBudget);
    } else {
      return { success: false, error: '目标预算 (targetBudget) 必须是非负数值或 null' };
    }
  }

  // 5. 槽位列表验证
  if (!Array.isArray(obj.slots)) {
    return { success: false, error: '配置单配件列表 (slots) 必须是数组' };
  }

  if (obj.slots.length > 20) {
    return { success: false, error: '配置单配件项过多（超出 20 项上限）' };
  }

  const validSlots: CustomBuildSlotItem[] = [];
  const validTypesSet = new Set<string>(BuildSlotTypes);

  for (let i = 0; i < obj.slots.length; i++) {
    const rawSlot = obj.slots[i];
    if (!rawSlot || typeof rawSlot !== 'object') {
      return { success: false, error: `第 ${i + 1} 项配件结构损坏` };
    }
    const s = rawSlot as Record<string, unknown>;

    if (typeof s.type !== 'string' || !validTypesSet.has(s.type)) {
      return {
        success: false,
        error: `第 ${i + 1} 项配件品类不合法：${String(s.type)}`,
      };
    }

    const type = s.type as BuildSlotType;
    const slotId =
      typeof s.slotId === 'string' && s.slotId.trim()
        ? s.slotId.trim().slice(0, 50)
        : `slot-${type}-${Date.now()}-${i}`;

    let hardwareId: string | null = null;
    if (s.hardwareId !== undefined && s.hardwareId !== null) {
      if (typeof s.hardwareId === 'string') {
        hardwareId = s.hardwareId.trim().slice(0, 100) || null;
      }
    }

    let customName: string | undefined;
    if (typeof s.customName === 'string' && s.customName.trim()) {
      customName = s.customName.trim().slice(0, 100);
    }

    let userPrice: number | null = null;
    let isExplicitZeroPrice = Boolean(s.isExplicitZeroPrice);

    if (s.userPrice !== undefined && s.userPrice !== null) {
      if (typeof s.userPrice === 'number' && Number.isFinite(s.userPrice) && s.userPrice >= 0) {
        userPrice = Math.round(s.userPrice * 100) / 100;
        if (userPrice === 0) {
          isExplicitZeroPrice = true;
        }
      } else {
        return {
          success: false,
          error: `配件「${type}」的自定义价格必须是非负数值`,
        };
      }
    }

    let quantity = 1;
    if (typeof s.quantity === 'number' && Number.isFinite(s.quantity)) {
      quantity = Math.min(10, Math.max(1, Math.floor(s.quantity)));
    }

    let notes: string | undefined;
    if (typeof s.notes === 'string' && s.notes.trim()) {
      notes = s.notes.trim().slice(0, 200);
    }

    validSlots.push({
      slotId,
      type,
      hardwareId,
      customName,
      userPrice,
      isExplicitZeroPrice,
      quantity,
      notes,
    });
  }

  const notes =
    typeof obj.notes === 'string' && obj.notes.trim()
      ? obj.notes.trim().slice(0, 200)
      : undefined;

  const validBuild: CustomBuild = {
    schemaVersion: 1,
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim().slice(0, 50) : `imported-${Date.now()}`,
    title,
    targetBudget,
    slots: validSlots,
    notes,
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { success: true, build: validBuild };
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
 * 包含 2048 字符硬限制，不包含敏感用户长备注
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
        typeof s.userPrice === 'number' ? Math.round(s.userPrice) : null,
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
 * 遵循客户端重算原则，绝不轻信外来状态
 */
export function deserializeBuildFromUrl(urlParam: string): CustomBuild | null {
  if (!urlParam || typeof urlParam !== 'string' || !urlParam.trim()) {
    return null;
  }

  try {
    const jsonStr = fromUrlSafeBase64(urlParam.trim());
    const parsed = JSON.parse(jsonStr) as CompactBuildSharePayload;

    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.s)) {
      return null;
    }

    const validTypesSet = new Set<string>(BuildSlotTypes);
    const slots: CustomBuildSlotItem[] = [];

    for (let i = 0; i < parsed.s.length; i++) {
      const item = parsed.s[i];
      if (!Array.isArray(item) || item.length < 2) continue;

      const type = item[0];
      if (!validTypesSet.has(type)) continue;

      const hardwareId = typeof item[1] === 'string' && item[1].trim() ? item[1].trim() : null;
      const userPrice = typeof item[2] === 'number' && Number.isFinite(item[2]) && item[2] >= 0 ? item[2] : null;
      const quantity = typeof item[3] === 'number' && item[3] >= 1 ? Math.min(10, Math.floor(item[3])) : 1;
      const customName = typeof item[4] === 'string' && item[4].trim() ? item[4].trim() : undefined;
      const isExplicitZeroPrice = item[5] === 1 || userPrice === 0;

      slots.push({
        slotId: `shared-slot-${type}-${i}`,
        type: type as BuildSlotType,
        hardwareId,
        customName,
        userPrice,
        isExplicitZeroPrice,
        quantity,
      });
    }

    return {
      schemaVersion: 1,
      id: `shared-${Date.now()}`,
      title: typeof parsed.t === 'string' && parsed.t.trim() ? parsed.t.trim() : '分享的装机单',
      targetBudget: typeof parsed.b === 'number' && parsed.b > 0 ? parsed.b : null,
      slots,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
    let name = slot.customName || '未选配件';
    let priceText = '价格待查';
    let verifiedNote = '';

    if (slot.hardwareId) {
      for (const item of safeCatalog) {
        if ('identity' in item) {
          if (item.identity.id === slot.hardwareId) {
            name = item.identity.name;
            if (item.pricing.launchReference) {
              priceText = `￥${item.pricing.launchReference}`;
            }
            if (item.auditSummary.hasOfficialSource) {
              verifiedNote = ' [官方核验]';
            } else if (item.auditSummary.verifiedCoreCount > 0) {
              verifiedNote = ' [已核验核心]';
            }
            break;
          }
        } else {
          if (item.id === slot.hardwareId) {
            name = item.name;
            if (item.msrpRmb) {
              priceText = `￥${item.msrpRmb}`;
            }
            break;
          }
        }
      }
    }

    if (slot.userPrice !== null) {
      priceText = slot.isExplicitZeroPrice ? '￥0 (自备/赠送)' : `￥${slot.userPrice} (自选报价)`;
    }

    if (slot.quantity > 1) {
      priceText += ` × ${slot.quantity}`;
    }

    return { name, priceText, verifiedNote };
  };

  const lines: string[] = [];

  if (lang === 'en') {
    lines.push(`【SiliconWiki Custom PC Build】${build.title}`);
    lines.push(
      `Budget: ${build.targetBudget ? `¥${build.targetBudget}` : 'N/A'} | Total Cost: ¥${cost.knownTotalCost} (${cost.hasUnknownPrices ? 'Partial Known Subtotal' : 'Complete Total'})`
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
    lines.push(`【SiliconWiki 芯知自选装机单】${build.title}`);
    lines.push(
      `目标预算：${build.targetBudget ? `￥${build.targetBudget}` : '未设定'} | 配件花费：￥${cost.knownTotalCost}（${cost.hasUnknownPrices ? '已知部分合计' : '完整总计'}）`
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
