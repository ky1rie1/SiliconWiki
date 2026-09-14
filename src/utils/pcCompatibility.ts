import { HardwareItem } from '../types';
import { HardwareRecord } from '../types/hardwareCatalog';
import {
  BuildSlotType,
  CustomBuild,
  CustomBuildSlotItem,
  CompatibilityStatus,
  CompatibilityRuleResult,
  CompatibilityReport,
  PowerEstimate,
  GpuPowerScenario,
  CostSummary,
  BudgetStatus,
  ReplacementCandidate,
} from '../types/pcBuilder';
import {
  extractCpuSocket,
  extractMotherboardSocket,
  extractMotherboardFormFactor,
  extractCaseSupportedFormFactors,
  extractRamSpecs,
  extractMotherboardRamSupport,
  extractCpuRamSupport,
  extractCoolerBrackets,
  extractCoolerDimensions,
  extractCaseClearance,
  extractGpuDimensions,
  extractPsuSpecs,
  extractDisplayOutputInfo,
  getSpecificationRecord,
} from './specAdapter';
import { isValidPriceRange } from './hardwareCatalog';

/** Uncovered rules in this version to disclose explicitly */
export const UNCOVERED_RULES_DISCLOSURE = [
  'PCIe 通道拆分与 CPU/PCH 共享总线带宽挤占（如插满 M.2 是否导致第二条 PCIe 降速）',
  'SATA 接口与 M.2 物理通道复用冲突（插特定 M.2 导致特定 SATA 口失效）',
  '高马甲发光内存与大型双塔风冷前置风扇物理避位公差',
  '定制模组线线序与异形电源接口插头净空间干涉',
  '机箱内部正负风压及进排气流仿真',
];

export type CatalogInput =
  | readonly (HardwareItem | HardwareRecord)[]
  | { byId: Map<string, HardwareRecord> }
  | Map<string, HardwareItem | HardwareRecord>;

/** Convert catalog input to lookup map */
export function createCatalogMap(catalog: CatalogInput): Map<string, HardwareItem | HardwareRecord> {
  if (catalog instanceof Map) {
    return catalog;
  }
  if (catalog && typeof catalog === 'object' && 'byId' in catalog && catalog.byId instanceof Map) {
    return catalog.byId;
  }
  const map = new Map<string, HardwareItem | HardwareRecord>();
  if (Array.isArray(catalog)) {
    for (const item of catalog) {
      const id = 'identity' in item ? item.identity.id : item.id;
      map.set(id, item);
    }
  }
  return map;
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

/** Get underlying HardwareItem for compatibility and replacements */
function getAsHardwareItem(item: HardwareItem | HardwareRecord | null): HardwareItem | null {
  if (!item) return null;
  if ('identity' in item) {
    // If it's a HardwareRecord, we adapt the basic fields
    return {
      id: item.identity.id,
      name: item.identity.name,
      category: item.identity.category,
      brand: item.identity.brand,
      series: item.identity.series,
      releaseYear: item.identity.releaseYear,
      specs: {},
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: item.power.watts ?? 0,
      msrpRmb: item.pricing.launchReference ?? 0,
      marketPriceRange: [item.pricing.referenceRange.min ?? 0, item.pricing.referenceRange.max ?? 0],
      priceTrend: 'stable',
      jdSearchQuery: item.identity.name,
      tbSearchQuery: item.identity.name,
      pddSearchQuery: item.identity.name,
    };
  }
  return item;
}

/**
 * 核心兼容性评估纯函数
 */
export function checkBuildCompatibility(
  build: CustomBuild,
  catalog: CatalogInput
): CompatibilityReport {
  const catalogMap = createCatalogMap(catalog);

  // 1. 提取各槽位配件
  const getPart = (type: BuildSlotType): { item: HardwareItem | HardwareRecord | null; slot: CustomBuildSlotItem | null } => {
    const slot = build.slots.find((s) => s.type === type && s.hardwareId);
    if (!slot || !slot.hardwareId) return { item: null, slot: null };
    const item = catalogMap.get(slot.hardwareId) || null;
    return { item, slot };
  };

  const cpuSlot = getPart('cpu');
  const mbSlot = getPart('motherboard');
  const ramSlot = getPart('ram');
  const coolerSlot = getPart('cooler');
  const gpuSlot = getPart('gpu');
  const caseSlot = getPart('case');
  const psuSlot = getPart('psu');

  const cpu = cpuSlot.item;
  const mb = mbSlot.item;
  const ram = ramSlot.item;
  const cooler = coolerSlot.item;
  const gpu = gpuSlot.item;
  const chassis = caseSlot.item;
  const psu = psuSlot.item;

  const rules: CompatibilityRuleResult[] = [];

  // ========================================================
  // 规则 1: CPU ↔ 主板插槽匹配 (rule_socket_match)
  // ========================================================
  if (cpu && mb) {
    const cpuSocketRes = extractCpuSocket(cpu);
    const mbSocketRes = extractMotherboardSocket(mb);

    if (cpuSocketRes.isKnown && mbSocketRes.isKnown) {
      if (cpuSocketRes.value === mbSocketRes.value) {
        rules.push({
          ruleId: 'rule_socket_match',
          category: '核心架构',
          status: 'pass',
          title: 'CPU 与主板插槽匹配',
          message: `CPU 插槽 (${cpuSocketRes.value}) 与主板 CPU 插槽 (${mbSocketRes.value}) 物理规格一致。`,
          basis: `CPU: ${cpuSocketRes.rawText || cpuSocketRes.value}; 主板: ${mbSocketRes.rawText || mbSocketRes.value}`,
          involvedSlotTypes: ['cpu', 'motherboard'],
          involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
        });
      } else {
        rules.push({
          ruleId: 'rule_socket_match',
          category: '核心架构',
          status: 'error',
          title: 'CPU 与主板插槽物理不兼容',
          message: `所选 CPU 插槽为 ${cpuSocketRes.value}，但主板插槽为 ${mbSocketRes.value}，针脚与防呆定义不同，物理无法安装！`,
          basis: `CPU 插槽: ${cpuSocketRes.value}; 主板插槽: ${mbSocketRes.value}`,
          involvedSlotTypes: ['cpu', 'motherboard'],
          involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
          suggestedFix: `更换为支持 ${cpuSocketRes.value} 插槽的主板，或更换支持 ${mbSocketRes.value} 的 CPU。`,
        });
      }
    } else {
      rules.push({
        ruleId: 'rule_socket_match',
        category: '核心架构',
        status: 'unknown',
        title: 'CPU 或主板插槽待核实',
        message: '配件库中缺少该 CPU 或主板的具体插槽代号记录，无法断定物理是否匹配。',
        basis: '规格库未包含完整插槽信息',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
        missingFields: [
          ...(!cpuSocketRes.isKnown ? ['cpu.socket'] : []),
          ...(!mbSocketRes.isKnown ? ['motherboard.socket'] : []),
        ],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_socket_match',
      category: '核心架构',
      status: 'not-applicable',
      title: 'CPU 与主板插槽检查',
      message: '需要同时选配 CPU 与主板后方可进行插槽物理匹配检查。',
      basis: '缺少 CPU 或主板',
      involvedSlotTypes: ['cpu', 'motherboard'],
      involvedHardwareIds: [getItemId(cpu), getItemId(mb)].filter(Boolean),
    });
  }

  // ========================================================
  // ========================================================
  // 规则 2: 主板 CPU 支持与 BIOS 条件 (rule_bios_support)
  // 严格准入：缺少出厂 BIOS 支持依据时不得默认原生通过，必须返回 unknown
  // ========================================================
  if (cpu && mb) {
    const cpuName = getItemName(cpu);
    const mbName = getItemName(mb);

    // 检查是否有确切的已核验 BIOS / CPU 支持记录（如 specifications 中记录了 motherboard.biosVersion 或 motherboard.cpuSupport）
    const mbSpecRec = getSpecificationRecord(mb, ['motherboard.biosVersion', 'motherboard.cpuSupport', '出厂BIOS', 'BIOS支持']);
    const hasExplicitVerifiedSupport =
      mbSpecRec?.verificationStatus === 'verified' &&
      Boolean(mbSpecRec.value && mbSpecRec.value.toLowerCase().includes(cpuName.toLowerCase()));

    // 典型跨代已知需要更新 BIOS 的提醒 (warning)
    const isRyzen9000On600Series = /Ryzen\s*[79]\s*9\d{3}/i.test(cpuName) && /B650|X670|A620/i.test(mbName);
    const isIntel14thOn600Series = /i[3579]-14\d{3}/i.test(cpuName) && /B660|Z690|H610/i.test(mbName);
    const isRyzen5000On300400Series = /Ryzen\s*[579]\s*5\d{3}/i.test(cpuName) && /B450|X470|B350|A320/i.test(mbName);

    if (hasExplicitVerifiedSupport) {
      rules.push({
        ruleId: 'rule_bios_support',
        category: 'BIOS 与微码',
        status: 'pass',
        title: '主板明确核验支持当前 CPU',
        message: `主板规格明确核验支持该型号 CPU 出厂运行（依据：${mbSpecRec?.value}）。`,
        basis: mbSpecRec?.value || '规格库已核验支持记录',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
      });
    } else if (isRyzen9000On600Series) {
      rules.push({
        ruleId: 'rule_bios_support',
        category: 'BIOS 与微码',
        status: 'warning',
        title: '需要确认主板 BIOS 版本',
        message: 'B650/X670 系列主板搭配锐龙 9000 系列处理器，通常需要升级 BIOS 才能点亮。请确认主板具备无 CPU 刷 BIOS (BIOS Flashback) 按钮或出厂预刷了兼容 BIOS。',
        basis: 'AMD 600 系主板发布于 2022 年，早于 Zen 5 处理器',
        condition: '出厂预刷新版 BIOS 或主板支持免 U 刷 BIOS',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
      });
    } else if (isIntel14thOn600Series) {
      rules.push({
        ruleId: 'rule_bios_support',
        category: 'BIOS 与微码',
        status: 'warning',
        title: '需要确认主板 BIOS 版本',
        message: '600 系列主板搭配 14 代酷睿处理器需升级至支持 Raptor Lake Refresh 的 BIOS 版本方能点亮。',
        basis: 'Intel 600 系列主板早期出厂 BIOS 缺少 14 代微码',
        condition: '已升级或出厂预刷最新 BIOS',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
      });
    } else if (isRyzen5000On300400Series) {
      rules.push({
        ruleId: 'rule_bios_support',
        category: 'BIOS 与微码',
        status: 'warning',
        title: '需要确认主板 BIOS 版本',
        message: 'B450/A320 系列早期主板搭配锐龙 5000 系列处理器通常需要刷新支持 Vermeer/Cezanne 微码的 BIOS。',
        basis: '主板芯片组早于 CPU 架构发布',
        condition: '出厂预刷或手动升级最新 BIOS',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
      });
    } else {
      // 没有具体支持记录时保留 unknown（禁止通过名称正则组合认定原生支持）
      rules.push({
        ruleId: 'rule_bios_support',
        category: 'BIOS 与微码',
        status: 'unknown',
        title: '主板 BIOS 支持待核查',
        message: '配件库未包含该主板对该型号 CPU 的具体出厂 BIOS 版本或微码支持记录，无法确认出厂是否能直接点亮。',
        basis: '缺少出厂 BIOS 支持依据',
        involvedSlotTypes: ['cpu', 'motherboard'],
        involvedHardwareIds: [getItemId(cpu), getItemId(mb)],
        missingFields: ['motherboard.biosVersion', 'cpu.microcode'],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_bios_support',
      category: 'BIOS 与微码',
      status: 'not-applicable',
      title: '主板 BIOS 支持检查',
      message: '需要同时选配 CPU 与主板。',
      basis: '缺少配对硬件',
      involvedSlotTypes: ['cpu', 'motherboard'],
      involvedHardwareIds: [getItemId(cpu), getItemId(mb)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 3: 内存代际 ↔ 主板与 CPU (rule_ram_type_match)
  // 严格准入：CPU 或主板内存支持资料缺失时不能默认通过
  // ========================================================
  if (ram && (mb || cpu)) {
    const ramRes = extractRamSpecs(ram, ramSlot.slot?.quantity ?? 1);
    const mbRamRes = extractMotherboardRamSupport(mb);
    const cpuRamRes = extractCpuRamSupport(cpu);

    if (ramRes.isKnown && ramRes.value) {
      let isMismatch = false;
      let mismatchReason = '';

      // 校验主板代际
      if (mbRamRes.isKnown && mbRamRes.value) {
        if (!mbRamRes.value.supportedGenerations.includes(ramRes.value.generation)) {
          isMismatch = true;
          mismatchReason = `主板仅支持 ${mbRamRes.value.supportedGenerations.join('/')}，但所选为 ${ramRes.value.generation} 内存。防呆卡口缺口位置不同，物理无法插入！`;
        }
      }

      // 校验 CPU 代际
      if (!isMismatch && cpuRamRes.isKnown && cpuRamRes.value) {
        if (!cpuRamRes.value.includes(ramRes.value.generation)) {
          isMismatch = true;
          mismatchReason = `当前 CPU 仅支持 ${cpuRamRes.value.join('/')} 内存，无法搭配 ${ramRes.value.generation}。`;
        }
      }

      if (isMismatch) {
        rules.push({
          ruleId: 'rule_ram_type_match',
          category: '内存兼容性',
          status: 'error',
          title: '内存代际冲突 (DDR4 / DDR5 不通用)',
          message: mismatchReason,
          basis: `内存: ${ramRes.value.generation}; 主板支持: ${mbRamRes.value?.supportedGenerations.join('/') ?? '未知'}; CPU支持: ${cpuRamRes.value?.join('/') ?? '未知'}`,
          involvedSlotTypes: ['ram', ...(mb ? ['motherboard' as BuildSlotType] : []), ...(cpu ? ['cpu' as BuildSlotType] : [])],
          involvedHardwareIds: [getItemId(ram), getItemId(mb), getItemId(cpu)].filter(Boolean),
          suggestedFix: `更换为适配主板与 CPU 的 ${mbRamRes.value?.supportedGenerations[0] || '兼容'} 内存。`,
        });
      } else if (!mbRamRes.isKnown && !cpuRamRes.isKnown) {
        // 主板与 CPU 内存支持均未知
        rules.push({
          ruleId: 'rule_ram_type_match',
          category: '内存兼容性',
          status: 'unknown',
          title: '主板与 CPU 内存支持代际待核验',
          message: '无法确认主板与 CPU 是否支持当前内存代际（DDR4/DDR5）。',
          basis: '内存支持参数缺失',
          involvedSlotTypes: ['ram', ...(mb ? ['motherboard' as BuildSlotType] : []), ...(cpu ? ['cpu' as BuildSlotType] : [])],
          involvedHardwareIds: [getItemId(ram), getItemId(mb), getItemId(cpu)].filter(Boolean),
          missingFields: ['motherboard.ram', 'cpu.ramSupport'],
        });
      } else if (mb && !mbRamRes.isKnown) {
        // 主板内存规格未记录
        rules.push({
          ruleId: 'rule_ram_type_match',
          category: '内存兼容性',
          status: 'unknown',
          title: '主板支持内存代际待核验',
          message: `配件库未记录该主板的内存代际支持规格，无法断定是否支持 ${ramRes.value.generation}。`,
          basis: '主板内存参数缺失',
          involvedSlotTypes: ['ram', 'motherboard'],
          involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          missingFields: ['motherboard.ram'],
        });
      } else if (cpu && !cpuRamRes.isKnown) {
        // 已选 CPU 的内存支持未知、主板支持已知
        rules.push({
          ruleId: 'rule_ram_type_match',
          category: '内存兼容性',
          status: 'unknown',
          title: 'CPU 内存控制器支持待核验',
          message: `配件库未记录该 CPU 的内存代际支持规格，无法断定是否支持 ${ramRes.value.generation} 内存。`,
          basis: 'CPU 内存支持参数缺失',
          involvedSlotTypes: ['ram', 'cpu'],
          involvedHardwareIds: [getItemId(ram), getItemId(cpu)],
          missingFields: ['cpu.ramSupport'],
        });
      } else {
        rules.push({
          ruleId: 'rule_ram_type_match',
          category: '内存兼容性',
          status: 'pass',
          title: '内存代际匹配一致',
          message: `内存类型 (${ramRes.value.generation}) 与主板及 CPU 支持的内存规格匹配一致。`,
          basis: `内存代际: ${ramRes.value.generation}`,
          involvedSlotTypes: ['ram', ...(mb ? ['motherboard' as BuildSlotType] : []), ...(cpu ? ['cpu' as BuildSlotType] : [])],
          involvedHardwareIds: [getItemId(ram), getItemId(mb), getItemId(cpu)].filter(Boolean),
        });
      }
    } else {
      rules.push({
        ruleId: 'rule_ram_type_match',
        category: '内存兼容性',
        status: 'unknown',
        title: '内存类型待核验',
        message: '无法解析内存的 DDR4/DDR5 代际规格，请查实产品名称与参数。',
        basis: '内存代际缺失',
        involvedSlotTypes: ['ram'],
        involvedHardwareIds: [getItemId(ram)],
        missingFields: ['ram.generation'],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_ram_type_match',
      category: '内存兼容性',
      status: 'not-applicable',
      title: '内存代际匹配检查',
      message: '需要选配内存及主板。',
      basis: '缺少内存或主板',
      involvedSlotTypes: ['ram'],
      involvedHardwareIds: [getItemId(ram)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 4: 内存形态与插槽数量 (rule_ram_form_and_slots)
  // 严格独立评估：插槽未知不掩盖代际冲突，亦不得默认 pass
  // ========================================================
  if (ram && mb) {
    const ramRes = extractRamSpecs(ram, ramSlot.slot?.quantity ?? 1);
    const mbRamRes = extractMotherboardRamSupport(mb);

    if (ramRes.isKnown && ramRes.value) {
      if (ramRes.value.formFactor === 'SO-DIMM') {
        rules.push({
          ruleId: 'rule_ram_form_and_slots',
          category: '内存兼容性',
          status: 'error',
          title: '内存物理形态不符 (笔记本内存)',
          message: '所选内存为笔记本 SO-DIMM 短条，台式机主板无法直接安装。请选择台式机标准长条 (U-DIMM)。',
          basis: '内存形态: SO-DIMM; 主板形态: 台式机 U-DIMM',
          involvedSlotTypes: ['ram', 'motherboard'],
          involvedHardwareIds: [getItemId(ram), getItemId(mb)],
        });
      } else if (!mbRamRes.isKnown || !mbRamRes.value) {
        rules.push({
          ruleId: 'rule_ram_form_and_slots',
          category: '内存兼容性',
          status: 'unknown',
          title: '主板内存规格待核验',
          message: '配件库未包含该主板的完整内存规格记录，无法核验可用插槽数。',
          basis: '主板内存规格缺失',
          involvedSlotTypes: ['ram', 'motherboard'],
          involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          missingFields: ['motherboard.ramSupport'],
        });
      } else if (mbRamRes.value.totalSlots === null) {
        // 主板插槽数量未知，不得默认 4 槽！
        rules.push({
          ruleId: 'rule_ram_form_and_slots',
          category: '内存兼容性',
          status: 'unknown',
          title: '主板物理内存插槽数待核验',
          message: '配件库未记录该主板的物理插槽数量，无法核实能否全部插入。',
          basis: '主板插槽数缺失',
          involvedSlotTypes: ['ram', 'motherboard'],
          involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          missingFields: ['motherboard.memorySlots'],
        });
      } else if (ramRes.value.totalSticks === null) {
        rules.push({
          ruleId: 'rule_ram_form_and_slots',
          category: '内存兼容性',
          status: 'unknown',
          title: '内存套条条数待核验',
          message: '无法解析所选内存的单套条数，无法计算占用插槽数。',
          basis: '内存条数缺失',
          involvedSlotTypes: ['ram', 'motherboard'],
          involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          missingFields: ['ram.sticksPerPackage'],
        });
      } else {
        const totalSticks = ramRes.value.totalSticks;
        const totalSlots = mbRamRes.value.totalSlots;

        if (totalSticks > totalSlots) {
          rules.push({
            ruleId: 'rule_ram_form_and_slots',
            category: '内存兼容性',
            status: 'error',
            title: '内存条数超出主板物理插槽上限',
            message: `当前配置包含 ${totalSticks} 根内存条（${ramRes.value.packageCount} 套 × ${ramRes.value.sticksPerPackage} 条），但主板仅有 ${totalSlots} 个物理内存插槽，无法全部插入！`,
            basis: `总条数: ${totalSticks}; 主板插槽: ${totalSlots}`,
            involvedSlotTypes: ['ram', 'motherboard'],
            involvedHardwareIds: [getItemId(ram), getItemId(mb)],
            suggestedFix: `减少购买套数，或更换为单条更大容量的套条（如将 4 根 16G 换为 2 根 32G）。`,
          });
        } else if (totalSticks === 4 && ramRes.value.generation === 'DDR5') {
          rules.push({
            ruleId: 'rule_ram_form_and_slots',
            category: '内存兼容性',
            status: 'warning',
            title: 'DDR5 插满 4 槽降频预警',
            message: '在主流消费级双通道主板上插满 4 根 DDR5 内存时，由于内存控制器电气信号负载增大，XMP/EXPO 高频超频稳定性将显著下降，通常可能自动降频至 4800~5200 MT/s 运行。追求极高频率建议优先选择 2 根大容量套条。',
            basis: '消费级 DDR5 4 槽 Daisy Chain 拓扑高频衰减特性',
            condition: '高频 XMP/EXPO 模式',
            involvedSlotTypes: ['ram', 'motherboard'],
            involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          });
        } else {
          rules.push({
            ruleId: 'rule_ram_form_and_slots',
            category: '内存兼容性',
            status: 'pass',
            title: '内存插槽数量充足',
            message: `内存总条数 (${totalSticks} 条) 在主板可用插槽数 (${totalSlots} 槽) 范围之内。`,
            basis: `条数: ${totalSticks}/${totalSlots}`,
            involvedSlotTypes: ['ram', 'motherboard'],
            involvedHardwareIds: [getItemId(ram), getItemId(mb)],
          });
        }
      }
    } else {
      rules.push({
        ruleId: 'rule_ram_form_and_slots',
        category: '内存兼容性',
        status: 'unknown',
        title: '内存形态未知',
        message: '无法解析内存形态与套条条数。',
        basis: '内存参数不完整',
        involvedSlotTypes: ['ram'],
        involvedHardwareIds: [getItemId(ram)],
        missingFields: ['ram.specs'],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_ram_form_and_slots',
      category: '内存兼容性',
      status: 'not-applicable',
      title: '内存形态与插槽检查',
      message: '需要同时选配内存与主板。',
      basis: '缺少内存或主板',
      involvedSlotTypes: ['ram'],
      involvedHardwareIds: [getItemId(ram)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 5: 散热器扣具 ↔ CPU 平台 (rule_cooler_bracket)
  // ========================================================
  if (cooler && cpu) {
    const coolerBrackets = extractCoolerBrackets(cooler);
    const cpuSocket = extractCpuSocket(cpu);

    if (coolerBrackets.isKnown && cpuSocket.isKnown && cpuSocket.value) {
      if (coolerBrackets.value!.includes(cpuSocket.value)) {
        rules.push({
          ruleId: 'rule_cooler_bracket',
          category: '散热与安装',
          status: 'pass',
          title: '散热器扣具支持该 CPU 插槽',
          message: `散热器标配扣具支持 ${cpuSocket.value} 平台，可正常安装固定。`,
          basis: `散热器扣具: ${coolerBrackets.value!.join(', ')}; CPU插槽: ${cpuSocket.value}`,
          involvedSlotTypes: ['cooler', 'cpu'],
          involvedHardwareIds: [getItemId(cooler), getItemId(cpu)],
        });
      } else {
        rules.push({
          ruleId: 'rule_cooler_bracket',
          category: '散热与安装',
          status: 'error',
          title: '散热器扣具不匹配',
          message: `散热器标配扣具支持 [${coolerBrackets.value!.join(', ')}]，未标明支持当前 CPU 的 ${cpuSocket.value} 插槽，无法完成螺丝固定与压紧！`,
          basis: `扣具缺失 ${cpuSocket.value}`,
          involvedSlotTypes: ['cooler', 'cpu'],
          involvedHardwareIds: [getItemId(cooler), getItemId(cpu)],
          suggestedFix: `选择明确标配 ${cpuSocket.value} 扣具的散热器，或向散热厂商单独申请/购买对应平台专用扣具。`,
        });
      }
    } else {
      rules.push({
        ruleId: 'rule_cooler_bracket',
        category: '散热与安装',
        status: 'unknown',
        title: '散热器扣具支持待核验',
        message: '散热器规格中未完整记录扣具支持列表，请查实产品出厂扣具是否包含当前 CPU 插槽。',
        basis: '扣具数据未核验',
        involvedSlotTypes: ['cooler', 'cpu'],
        involvedHardwareIds: [getItemId(cooler), getItemId(cpu)],
        missingFields: ['cooler.brackets'],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_cooler_bracket',
      category: '散热与安装',
      status: 'not-applicable',
      title: '散热器扣具匹配检查',
      message: '需要同时选配散热器与 CPU。',
      basis: '缺少散热器或 CPU',
      involvedSlotTypes: ['cooler', 'cpu'],
      involvedHardwareIds: [getItemId(cooler), getItemId(cpu)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 6: 主板板型 ↔ 机箱支持 (rule_motherboard_case_size)
  // ========================================================
  if (mb && chassis) {
    const mbFactorRes = extractMotherboardFormFactor(mb);
    const caseSupportRes = extractCaseSupportedFormFactors(chassis);

    if (mbFactorRes.isKnown && caseSupportRes.isKnown) {
      const mbFactor = mbFactorRes.value!;
      const supportedList = caseSupportRes.value!;

      if (supportedList.includes(mbFactor)) {
        rules.push({
          ruleId: 'rule_motherboard_case_size',
          category: '物理空间与干涉',
          status: 'pass',
          title: '主板板型与机箱兼容',
          message: `主板规格为 ${mbFactor}，机箱支持 [${supportedList.join(', ')}]，铜柱定位与 I/O 挡板孔位相符。`,
          basis: `主板板型: ${mbFactor}; 机箱支持: ${supportedList.join(', ')}`,
          involvedSlotTypes: ['motherboard', 'case'],
          involvedHardwareIds: [getItemId(mb), getItemId(chassis)],
        });
      } else {
        rules.push({
          ruleId: 'rule_motherboard_case_size',
          category: '物理空间与干涉',
          status: 'error',
          title: '主板板型超出机箱容纳范围',
          message: `所选主板为 ${mbFactor} 大板，但所选机箱最大仅支持 [${supportedList.join(', ')}]。机箱内部空间不足，铜柱螺丝孔位与挡板无法匹配，物理无法放入！`,
          basis: `主板板型: ${mbFactor}; 机箱支持列表: ${supportedList.join(', ')}`,
          involvedSlotTypes: ['motherboard', 'case'],
          involvedHardwareIds: [getItemId(mb), getItemId(chassis)],
          suggestedFix: `更换为支持 ${mbFactor} 板型的大机箱，或更换为 ${supportedList[0]} 等符合机箱尺寸的小主板。`,
        });
      }
    } else {
      rules.push({
        ruleId: 'rule_motherboard_case_size',
        category: '物理空间与干涉',
        status: 'unknown',
        title: '主板板型或机箱支持规格待核验',
        message: '无法完全确认主板或机箱的板型代号，请查实产品规格。',
        basis: '板型或支持规格缺失',
        involvedSlotTypes: ['motherboard', 'case'],
        involvedHardwareIds: [getItemId(mb), getItemId(chassis)],
        missingFields: [
          ...(!mbFactorRes.isKnown ? ['motherboard.formFactor'] : []),
          ...(!caseSupportRes.isKnown ? ['case.formFactorSupport'] : []),
        ],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_motherboard_case_size',
      category: '物理空间与干涉',
      status: 'not-applicable',
      title: '主板板型与机箱匹配检查',
      message: '需要同时选配主板与机箱。',
      basis: '缺少主板或机箱',
      involvedSlotTypes: ['motherboard', 'case'],
      involvedHardwareIds: [getItemId(mb), getItemId(chassis)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 7: 显卡长度 ↔ 机箱显卡限长 (rule_gpu_length_clearance)
  // ========================================================
  if (gpu && chassis) {
    const gpuDim = extractGpuDimensions(gpu);
    const caseClr = extractCaseClearance(chassis);

    if (gpuDim.isKnown && caseClr.isKnown && gpuDim.value?.lengthMm && caseClr.value?.maxGpuLengthMm) {
      const gLen = gpuDim.value.lengthMm;
      const cMax = caseClr.value.maxGpuLengthMm;
      const condLimits = caseClr.value.conditionalGpuLimits;

      if (condLimits && condLimits.length > 0) {
        const limits = condLimits.map((c) => c.maxGpuLengthMm);
        const minLim = Math.min(...limits);
        const maxLim = Math.max(...limits);

        if (gLen > maxLim) {
          // 超过所有已知条件限长最大值，绝对无法安装
          rules.push({
            ruleId: 'rule_gpu_length_clearance',
            category: '物理空间与干涉',
            status: 'error',
            title: '显卡超长无法放入机箱',
            message: `显卡实际长度为 ${gLen}mm，超过机箱在所有安装状态下的最大允许限长 (${maxLim}mm)，物理无法装入机箱内仓！`,
            basis: `显卡长: ${gLen}mm; 机箱最大限长: ${maxLim}mm`,
            involvedSlotTypes: ['gpu', 'case'],
            involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
            suggestedFix: `更换内部更宽裕的机箱，或更换长度小于 ${maxLim}mm 的显卡。`,
          });
        } else if (gLen > minLim && gLen <= maxLim) {
          // 介于条件区间内：不能粗暴断言装不下，未确定安装状态时明确待核实
          const condDesc = condLimits.map((c) => `「${c.condition}」限长 ${c.maxGpuLengthMm}mm`).join('；');
          rules.push({
            ruleId: 'rule_gpu_length_clearance',
            category: '物理空间与干涉',
            status: 'unknown',
            title: '显卡长度处于机箱多条件限长区间（待核实安装状态）',
            message: `显卡长度为 ${gLen}mm，处于机箱多条件限长区间内（${condDesc}）。未确定实际装配方案或前置散热器安装状态时，无法断定是否发生物理干涉，需待核实实物安装条件。`,
            basis: `显卡长: ${gLen}mm; 条件限长范围: ${minLim}~${maxLim}mm`,
            involvedSlotTypes: ['gpu', 'case'],
            involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
            missingFields: ['case.installationCondition'],
          });
        } else {
          // 小于等于最保守限长
          if (minLim - gLen < 15) {
            rules.push({
              ruleId: 'rule_gpu_length_clearance',
              category: '物理空间与干涉',
              status: 'warning',
              title: '显卡安装空间极为紧凑',
              message: `显卡长度 (${gLen}mm) 接近机箱保守条件限长 (${minLim}mm)，间隙不足 15mm。装配时可能需要调整角度小心放入。`,
              basis: `保守净空余量仅 ${minLim - gLen}mm`,
              condition: '严苛安装状态下空间紧凑',
              involvedSlotTypes: ['gpu', 'case'],
              involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
            });
          } else {
            rules.push({
              ruleId: 'rule_gpu_length_clearance',
              category: '物理空间与干涉',
              status: 'pass',
              title: '显卡长度符合机箱限长要求',
              message: `显卡长度为 ${gLen}mm，在机箱各种条件限长（最低 ${minLim}mm）下均可正常安装，余量充沛 (${minLim - gLen}mm)。`,
              basis: `显卡: ${gLen}mm; 保守限长: ${minLim}mm`,
              involvedSlotTypes: ['gpu', 'case'],
              involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
            });
          }
        }
      } else {
        // 单一限长无多条件
        if (gLen > cMax) {
          rules.push({
            ruleId: 'rule_gpu_length_clearance',
            category: '物理空间与干涉',
            status: 'error',
            title: '显卡超长无法放入机箱',
            message: `显卡实际长度为 ${gLen}mm，超过机箱标称显卡限长 (${cMax}mm)，无法正常装入机箱内仓！`,
            basis: `显卡长: ${gLen}mm; 机箱限长: ${cMax}mm`,
            involvedSlotTypes: ['gpu', 'case'],
            involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
            suggestedFix: `更换内部更宽裕的机箱，或更换长度小于 ${cMax}mm 的双风扇/紧凑版显卡。`,
          });
        } else if (cMax - gLen < 15) {
          rules.push({
            ruleId: 'rule_gpu_length_clearance',
            category: '物理空间与干涉',
            status: 'warning',
            title: '显卡安装空间极度紧凑',
            message: `显卡长度 (${gLen}mm) 接近机箱限长 (${cMax}mm)，间隙不足 15mm。若机箱前置安装了散热风扇或水冷排，可用限长将进一步缩减，装配时可能需要调整角度小心放入。`,
            basis: `净空余量仅 ${cMax - gLen}mm`,
            condition: '机箱前置未安装水冷排或厚风扇',
            involvedSlotTypes: ['gpu', 'case'],
            involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
          });
        } else {
          rules.push({
            ruleId: 'rule_gpu_length_clearance',
            category: '物理空间与干涉',
            status: 'pass',
            title: '显卡长度符合机箱限长要求',
            message: `显卡长度为 ${gLen}mm，机箱显卡限长为 ${cMax}mm，余量充沛 (${cMax - gLen}mm)。`,
            basis: `显卡: ${gLen}mm; 限长: ${cMax}mm`,
            involvedSlotTypes: ['gpu', 'case'],
            involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
          });
        }
      }
    } else {
      rules.push({
        ruleId: 'rule_gpu_length_clearance',
        category: '物理空间与干涉',
        status: 'unknown',
        title: '显卡长度或机箱限长待核验',
        message: '配件库未记录该具体非公显卡的长宽高数据，或机箱显卡限长未标明。根据安全准入规范，系统拒绝假定其装得下，请手动查验非公显卡长宽高与机箱净空。',
        basis: '尺寸数据缺失，严禁静默放行',
        involvedSlotTypes: ['gpu', 'case'],
        involvedHardwareIds: [getItemId(gpu), getItemId(chassis)],
        missingFields: [
          ...(!gpuDim.value?.lengthMm ? ['gpu.dimensions.lengthMm'] : []),
          ...(!caseClr.value?.maxGpuLengthMm ? ['case.maxGpuLength'] : []),
        ],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_gpu_length_clearance',
      category: '物理空间与干涉',
      status: 'not-applicable',
      title: '显卡长度与机箱限长检查',
      message: '未同时选配独立显卡与机箱。',
      basis: '无显卡或无机箱',
      involvedSlotTypes: ['gpu', 'case'],
      involvedHardwareIds: [getItemId(gpu), getItemId(chassis)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 8: 散热器高度/冷排 ↔ 机箱净空间 (rule_cooler_clearance)
  // ========================================================
  if (cooler && chassis) {
    const coolerDim = extractCoolerDimensions(cooler);
    const caseClr = extractCaseClearance(chassis);

    if (coolerDim.value?.type === 'air') {
      // 风冷高度检查
      if (coolerDim.value.heightMm && caseClr.value?.maxCoolerHeightMm) {
        const h = coolerDim.value.heightMm;
        const maxH = caseClr.value.maxCoolerHeightMm;

        if (h > maxH) {
          rules.push({
            ruleId: 'rule_cooler_clearance',
            category: '物理空间与干涉',
            status: 'error',
            title: '风冷散热器过高无法闭合侧板',
            message: `风冷散热器高度为 ${h}mm，超过机箱 CPU 散热器限高 (${maxH}mm)，安装后侧板将顶住热管无法盖合！`,
            basis: `散热高度: ${h}mm; 机箱限高: ${maxH}mm`,
            involvedSlotTypes: ['cooler', 'case'],
            involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
            suggestedFix: `更换高度小于 ${maxH}mm 的散热器，或更换更宽的机箱。`,
          });
        } else {
          rules.push({
            ruleId: 'rule_cooler_clearance',
            category: '物理空间与干涉',
            status: 'pass',
            title: '风冷散热器高度符合机箱限高',
            message: `风冷散热器高度为 ${h}mm，机箱限高为 ${maxH}mm，可正常闭合侧板。`,
            basis: `高度: ${h}mm; 限高: ${maxH}mm`,
            involvedSlotTypes: ['cooler', 'case'],
            involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
          });
        }
      } else {
        rules.push({
          ruleId: 'rule_cooler_clearance',
          category: '物理空间与干涉',
          status: 'unknown',
          title: '风冷高度或机箱限高待核验',
          message: '散热器具体高度或机箱限高数据不完整，无法确认物理干涉情况。',
          basis: '高度数据缺失',
          involvedSlotTypes: ['cooler', 'case'],
          involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
          missingFields: [
            ...(!coolerDim.value?.heightMm ? ['cooler.height'] : []),
            ...(!caseClr.value?.maxCoolerHeightMm ? ['case.maxCoolerHeight'] : []),
          ],
        });
      }
    } else {
      // 水冷排安装检查
      if (coolerDim.value?.radiatorSizeMm && caseClr.value?.supportedRadiatorsMm) {
        const radSize = coolerDim.value.radiatorSizeMm;
        const supportedRads = caseClr.value.supportedRadiatorsMm;

        if (supportedRads.length > 0) {
          if (supportedRads.includes(radSize)) {
            rules.push({
              ruleId: 'rule_cooler_clearance',
              category: '物理空间与干涉',
              status: 'pass',
              title: '机箱支持该规格水冷排安装',
              message: `水冷排规格为 ${radSize}mm，机箱支持水冷规格 [${supportedRads.join(', ')} mm]。`,
              basis: `冷排: ${radSize}mm; 机箱支持: ${supportedRads.join('/')}mm`,
              involvedSlotTypes: ['cooler', 'case'],
              involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
            });
          } else {
            rules.push({
              ruleId: 'rule_cooler_clearance',
              category: '物理空间与干涉',
              status: 'error',
              title: '机箱不支持当前规格水冷排',
              message: `所选水冷排为 ${radSize}mm 规格，但机箱仅支持 [${supportedRads.join(', ')} mm] 冷排，缺乏足够的螺丝固定孔位或空间！`,
              basis: `冷排规格: ${radSize}mm; 机箱支持: ${supportedRads.join('/')}mm`,
              involvedSlotTypes: ['cooler', 'case'],
              involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
              suggestedFix: `更换为支持 ${radSize}mm 冷排的机箱，或更换为匹配机箱的 ${supportedRads[0]}mm 水冷排/高性能风冷。`,
            });
          }
        } else {
          rules.push({
            ruleId: 'rule_cooler_clearance',
            category: '物理空间与干涉',
            status: 'unknown',
            title: '机箱冷排支持规格待核实',
            message: `机箱规格库中未明确记录是否支持 ${radSize}mm 水冷排安装位置。`,
            basis: '机箱冷排位数据缺失',
            involvedSlotTypes: ['cooler', 'case'],
            involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
            missingFields: ['case.radiatorSupport'],
          });
        }
      } else {
        rules.push({
          ruleId: 'rule_cooler_clearance',
          category: '物理空间与干涉',
          status: 'unknown',
          title: '冷排或机箱规格待核实',
          message: '无法解析水冷排规格或机箱冷排支持。',
          basis: '参数缺失',
          involvedSlotTypes: ['cooler', 'case'],
          involvedHardwareIds: [getItemId(cooler), getItemId(chassis)],
        });
      }
    }
  } else {
    rules.push({
      ruleId: 'rule_cooler_clearance',
      category: '物理空间与干涉',
      status: 'not-applicable',
      title: '散热器空间匹配检查',
      message: '需要同时选配散热器与机箱。',
      basis: '缺少散热器或机箱',
      involvedSlotTypes: ['cooler', 'case'],
      involvedHardwareIds: [getItemId(cooler), getItemId(chassis)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 9: 显卡必要供电接口 ↔ 电源线材 (rule_gpu_power_connectors)
  // 严格供求核验：供不应求为 error，参数不足为 unknown，不假定附赠转接线
  // ========================================================
  if (gpu && psu) {
    const gpuDim = extractGpuDimensions(gpu);
    const psuSpecs = extractPsuSpecs(psu);

    const parsedGpu = gpuDim.value?.parsedConnectors;
    const psu16 = psuSpecs.value?.native12VhpwrCount ?? 0;
    const psu8 = psuSpecs.value?.pcie8PinCount ?? null;

    // 显卡接口需求未知（未解析出任何有效接口，且非免插电）
    if (
      !parsedGpu ||
      parsedGpu.isUnparseable ||
      (!parsedGpu.isSlotPowerOnly && parsedGpu.count16Pin === 0 && parsedGpu.count8Pin === 0 && parsedGpu.count6Pin === 0)
    ) {
      rules.push({
        ruleId: 'rule_gpu_power_connectors',
        category: '电源与供电',
        status: 'unknown',
        title: '显卡供电接口需求待核实',
        message: `配件库未记录该具体型号显卡的辅助供电接口需求，或供电文本（“${parsedGpu?.rawText || '未填写'}”）无法确切解析，无法核实电源线材是否充足。`,
        basis: '显卡供电接口数据缺失或无法确切解析',
        involvedSlotTypes: ['gpu', 'psu'],
        involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
        missingFields: ['gpu.powerConnectors'],
      });
    } else if (parsedGpu.isSlotPowerOnly) {
      // 明确免外接供电卡（如 GTX 1650 / RX 6400 等 ≤75W 卡）
      rules.push({
        ruleId: 'rule_gpu_power_connectors',
        category: '电源与供电',
        status: 'pass',
        title: '显卡无需独立辅助供电接口',
        message: '该显卡设计功耗极低，通过主板 PCIe 插槽直接取电即可正常工作，无需从电源引出独立供电线。',
        basis: '显卡无需外接供电 (PCIe 插槽 ≤75W 供电)',
        involvedSlotTypes: ['gpu', 'psu'],
        involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
      });
    } else if (!psuSpecs.isKnown || (psu8 === null && psu16 === 0)) {
      // 电源线材供给未知
      rules.push({
        ruleId: 'rule_gpu_power_connectors',
        category: '电源与供电',
        status: 'unknown',
        title: '电源供电线材接口数量待核实',
        message: '配件库未明确记录该电源配备的 PCIe 8-pin 模组线或 16-pin 接口数量，无法核实供给能力。',
        basis: '电源线材规格缺失',
        involvedSlotTypes: ['gpu', 'psu'],
        involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
        missingFields: ['psu.connectors'],
      });
    } else {
      // 双方参数明确，开始核验
      if (parsedGpu.count16Pin > 0) {
        if (psu16 >= parsedGpu.count16Pin) {
          rules.push({
            ruleId: 'rule_gpu_power_connectors',
            category: '电源与供电',
            status: 'pass',
            title: '具备原生 16-pin (12V-2x6 / 12VHPWR) 供电线',
            message: '显卡采用 16-pin 接口，电源配备原生 12V-2x6 模组线，直插连接美观且能承受瞬时高负荷。',
            basis: '电源具备原生 16-pin 输出',
            involvedSlotTypes: ['gpu', 'psu'],
            involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
          });
        } else {
          // 无原生 16-pin
          if (psu8 !== null && psu8 < 2) {
            // 转接线至少需要 2 组以上 8-pin，8-pin 接口不足 2 组时物理无法满足
            rules.push({
              ruleId: 'rule_gpu_power_connectors',
              category: '电源与供电',
              status: 'error',
              title: '电源供电接口严重不足以驱动 16-pin 显卡',
              message: `显卡明确需要 16-pin 供电，电源无原生 16-pin 且仅有 ${psu8} 组 PCIe 8-pin 接口（转接线至少需要 2 组独立 8-pin 供电），物理接口严重不足无法点亮！`,
              basis: `需求: 16-pin; 供给: 仅 ${psu8}x 8-pin 且无原生 16-pin`,
              involvedSlotTypes: ['gpu', 'psu'],
              involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
              suggestedFix: '更换具备原生 12V-2x6 / 16-pin 接口或更多独立 8-pin 接口的电源。',
            });
          } else {
            // 没有确认转接方案、需求数量和可用性时，不暗示可转接驱动，严格返回 unknown
            rules.push({
              ruleId: 'rule_gpu_power_connectors',
              category: '电源与供电',
              status: 'unknown',
              title: '16-pin 显卡转接方案与线材需求待核实',
              message: `显卡采用 16-pin 接口而电源无原生 16-pin 输出。不同显卡转接线对 PCIe 8-pin 数量需求不同（通常为 2 至 4 组独立 8-pin），且需确认显卡配件包是否附带转接线及电源是否具备足够的独立分线。未确认具体转接方案前，无法确认是否可用。`,
              basis: '无原生 16-pin 接口，且未确认转接线配件与线材需求数',
              involvedSlotTypes: ['gpu', 'psu'],
              involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
              missingFields: ['gpu.powerAdapter', 'psu.independentPcieCables'],
            });
          }
        }
      } else {
        // 传统 PCIe 8-pin / 6-pin（正确计算每种接口数量，不将多个 6-pin 折为一个，也不把“8-pin × 3”解析为一个）
        const neededPcieConnectors = parsedGpu.count8Pin + parsedGpu.count6Pin;
        const demandText = [
          parsedGpu.count8Pin > 0 ? `${parsedGpu.count8Pin} 组 8-pin` : '',
          parsedGpu.count6Pin > 0 ? `${parsedGpu.count6Pin} 组 6-pin` : '',
        ]
          .filter(Boolean)
          .join(' + ');

        if (psu8 !== null) {
          if (psu8 < neededPcieConnectors) {
            rules.push({
              ruleId: 'rule_gpu_power_connectors',
              category: '电源与供电',
              status: 'error',
              title: '电源 PCIe 辅助供电接口不足',
              message: `显卡明确需要 ${demandText}（共需 ${neededPcieConnectors} 组独立 PCIe 供电接口），但电源仅配备 ${psu8} 组 PCIe 接口，接口数量缺失无法正常点亮！`,
              basis: `需求: ${demandText} (共 ${neededPcieConnectors} 组); 供给: ${psu8} 组 PCIe 8-pin`,
              involvedSlotTypes: ['gpu', 'psu'],
              involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
              suggestedFix: `更换为提供至少 ${neededPcieConnectors} 组独立 PCIe 8-pin 供电线的电源。`,
            });
          } else {
            rules.push({
              ruleId: 'rule_gpu_power_connectors',
              category: '电源与供电',
              status: 'pass',
              title: '传统 PCIe 辅助供电接口充足',
              message: `显卡供电需求 (${demandText}，共 ${neededPcieConnectors} 组) 与电源可用接口 (${psu8} 组) 匹配满足。`,
              basis: `需求: ${neededPcieConnectors} 组; 供给: ${psu8} 组`,
              involvedSlotTypes: ['gpu', 'psu'],
              involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
            });
          }
        } else {
          rules.push({
            ruleId: 'rule_gpu_power_connectors',
            category: '电源与供电',
            status: 'unknown',
            title: '电源 PCIe 接口数量待核实',
            message: `显卡明确需要 ${demandText}，但电源模组线数量未明确记录。`,
            basis: '电源线材数量缺失',
            involvedSlotTypes: ['gpu', 'psu'],
            involvedHardwareIds: [getItemId(gpu), getItemId(psu)],
            missingFields: ['psu.connectors'],
          });
        }
      }
    }
  } else {
    rules.push({
      ruleId: 'rule_gpu_power_connectors',
      category: '电源与供电',
      status: 'not-applicable',
      title: '显卡供电接口检查',
      message: '未同时选配独立显卡与电源。',
      basis: '无显卡或电源',
      involvedSlotTypes: ['gpu', 'psu'],
      involvedHardwareIds: [getItemId(gpu), getItemId(psu)].filter(Boolean),
    });
  }

  // ========================================================
  // 规则 10: 电源容量与厂商要求 (rule_psu_capacity)
  // ========================================================
  if (psu) {
    const powerEst = calculateBuildPower(build, catalog);
    const psuSpecs = extractPsuSpecs(psu);

    if (psuSpecs.isKnown && psuSpecs.value?.ratedWattage) {
      const rated = psuSpecs.value.ratedWattage;

      if (!powerEst.isFullyKnown) {
        rules.push({
          ruleId: 'rule_psu_capacity',
          category: '电源与供电',
          status: 'unknown',
          title: '整机负载功耗估算不完整',
          message: `电源额定功率为 ${rated}W。由于当前配置中部分配件（${powerEst.missingInputs.join('、')}）功耗未记录，无法完成精确冗余评估。`,
          basis: '关键功耗输入缺失',
          involvedSlotTypes: ['psu', ...(cpu ? ['cpu' as BuildSlotType] : []), ...(gpu ? ['gpu' as BuildSlotType] : [])],
          involvedHardwareIds: [getItemId(psu), getItemId(cpu), getItemId(gpu)].filter(Boolean),
          missingFields: powerEst.missingInputs,
        });
      } else {
        const peak = powerEst.estimatedPeakWatts!;
        const mfgRec = powerEst.manufacturerPsuRecommendationWatts;

        if (rated < peak) {
          rules.push({
            ruleId: 'rule_psu_capacity',
            category: '电源与供电',
            status: 'error',
            title: '电源额定功率低于系统预估负载',
            message: `电源额定功率 (${rated}W) 低于整机预估峰值功耗 (${peak}W)。在重负载工况下电源功率余量不足，建议提升电源规格以保证系统稳定运行。`,
            basis: `电源额定: ${rated}W; 预估峰值: ${peak}W`,
            involvedSlotTypes: ['psu', ...(cpu ? ['cpu' as BuildSlotType] : []), ...(gpu ? ['gpu' as BuildSlotType] : [])],
            involvedHardwareIds: [getItemId(psu), getItemId(cpu), getItemId(gpu)].filter(Boolean),
            suggestedFix: `更换为额定功率至少 ${Math.ceil((peak * 1.3) / 50) * 50}W 以上的品质电源。`,
          });
        } else if (mfgRec && rated < mfgRec) {
          rules.push({
            ruleId: 'rule_psu_capacity',
            category: '电源与供电',
            status: 'warning',
            title: '低于显卡厂商官方建议电源功率',
            message: `当前电源额定为 ${rated}W，低于显卡官方白皮书建议的 ${mfgRec}W 系统电源。高负载工况下瞬态尖峰可能使电源余量偏紧。`,
            basis: `电源: ${rated}W; 厂商建议: ${mfgRec}W`,
            condition: '应对极端 3A 游戏瞬态峰值功耗',
            involvedSlotTypes: ['psu', ...(gpu ? ['gpu' as BuildSlotType] : [])],
            involvedHardwareIds: [getItemId(psu), getItemId(gpu)].filter(Boolean),
          });
        } else if (rated < peak * 1.2) {
          rules.push({
            ruleId: 'rule_psu_capacity',
            category: '电源与供电',
            status: 'warning',
            title: '电源负载余量偏紧',
            message: `电源额定 (${rated}W) 虽高于理论预估峰值 (${peak}W)，但冗余不足 20%。建议留出 25%~30% 余量，以便电源处于更稳健的负载区间并降低风扇运转噪音。`,
            basis: `冗余比例仅 ${Math.round(((rated - peak) / peak) * 100)}%`,
            involvedSlotTypes: ['psu'],
            involvedHardwareIds: [getItemId(psu)],
          });
        } else {
          rules.push({
            ruleId: 'rule_psu_capacity',
            category: '电源与供电',
            status: 'pass',
            title: '电源额定功率充沛',
            message: `电源额定功率 (${rated}W) 充裕满足系统峰值功耗 (${peak}W)，具备舒适冗余空间 (${rated - peak}W)。`,
            basis: `额定: ${rated}W; 峰值: ${peak}W; 余量: ${rated - peak}W`,
            involvedSlotTypes: ['psu'],
            involvedHardwareIds: [getItemId(psu)],
          });
        }
      }
    } else {
      rules.push({
        ruleId: 'rule_psu_capacity',
        category: '电源与供电',
        status: 'unknown',
        title: '电源额定功率未知',
        message: '无法解析电源额定输出功率。',
        basis: '参数缺失',
        involvedSlotTypes: ['psu'],
        involvedHardwareIds: [getItemId(psu)],
      });
    }
  } else {
    rules.push({
      ruleId: 'rule_psu_capacity',
      category: '电源与供电',
      status: 'not-applicable',
      title: '电源容量评估',
      message: '未选配电源。',
      basis: '缺少电源配件',
      involvedSlotTypes: ['psu'],
      involvedHardwareIds: [],
    });
  }

  // ========================================================
  // 规则 11: 显示输出可用性 (rule_display_output)
  // ========================================================
  {
    const displayInfo = extractDisplayOutputInfo(cpu, mb, gpu);

    if (displayInfo.hasDedicatedGpu) {
      rules.push({
        ruleId: 'rule_display_output',
        category: '显示与外设',
        status: 'pass',
        title: '具备独立显卡显示输出',
        message: '配置已包含独立显卡，可通过显卡后置 DP/HDMI 接口直接输出图形信号。',
        basis: '已选配独立显卡',
        involvedSlotTypes: ['gpu'],
        involvedHardwareIds: [getItemId(gpu)],
      });
    } else if (displayInfo.cpuHasIgpu === false) {
      rules.push({
        ruleId: 'rule_display_output',
        category: '显示与外设',
        status: 'error',
        title: '系统缺少可用显示输出',
        message: '当前 CPU 明确无集成核显（如 Intel F/KF 后缀或特定锐龙型号），且装机单未选配独立显卡，组装后将无法连接显示器点亮！',
        basis: 'CPU 无核显且无独立显卡',
        involvedSlotTypes: ['cpu', 'gpu'],
        involvedHardwareIds: [getItemId(cpu)].filter(Boolean),
        suggestedFix: '选配一张独立显卡，或更换为带集成核显的 CPU 型号。',
      });
    } else if (displayInfo.cpuHasIgpu === true) {
      if (displayInfo.mbHasVideoPorts === true) {
        rules.push({
          ruleId: 'rule_display_output',
          category: '显示与外设',
          status: 'pass',
          title: '采用 CPU 集成核显输出',
          message: 'CPU 内置集成核显且主板具备视频输出接口，无需独立显卡即可点亮显示器日常使用。',
          basis: 'CPU 含核显，主板配备视频接口',
          involvedSlotTypes: ['cpu', 'motherboard'],
          involvedHardwareIds: [getItemId(cpu), getItemId(mb)].filter(Boolean),
        });
      } else {
        rules.push({
          ruleId: 'rule_display_output',
          category: '显示与外设',
          status: 'warning',
          title: '核显输出需确认主板后置接口',
          message: '当前配置无独显并依赖 CPU 核显输出，请确认主板背板配备所需的 HDMI/DP 显示输出插口。',
          basis: '核显平台未核验主板视频接口',
          involvedSlotTypes: ['cpu', 'motherboard'],
          involvedHardwareIds: [getItemId(cpu), getItemId(mb)].filter(Boolean),
        });
      }
    } else {
      rules.push({
        ruleId: 'rule_display_output',
        category: '显示与外设',
        status: 'unknown',
        title: '显示输出可用性待确认',
        message: '装机单未选配独立显卡，且无法确认当前 CPU 是否具备集成核显。',
        basis: '核显参数未完全收录',
        involvedSlotTypes: ['cpu'],
        involvedHardwareIds: [getItemId(cpu)].filter(Boolean),
      });
    }
  }

  // ========================================================
  // 汇总统计与整机状态判定
  // ========================================================
  let passCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let unknownCount = 0;
  let notApplicableCount = 0;

  for (const r of rules) {
    if (r.status === 'pass') passCount++;
    else if (r.status === 'warning') warningCount++;
    else if (r.status === 'error') errorCount++;
    else if (r.status === 'unknown') unknownCount++;
    else if (r.status === 'not-applicable') notApplicableCount++;
  }

  // 核心槽位齐备性核查 (CPU、主板、内存、散热、电源、机箱为必须，存储也应有)
  const coreSlotRequirements: BuildSlotType[] = ['cpu', 'motherboard', 'ram', 'cooler', 'psu', 'case'];
  const missingCoreSlotTypes: BuildSlotType[] = [];

  for (const slotType of coreSlotRequirements) {
    const slot = build.slots.find((s) => s.type === slotType && s.hardwareId);
    if (!slot) missingCoreSlotTypes.push(slotType);
  }

  const isBuildComplete = missingCoreSlotTypes.length === 0;

  let overallStatus: CompatibilityStatus = 'pass';
  let summaryText = '';

  if (errorCount > 0) {
    overallStatus = 'error';
    summaryText = `检测到 ${errorCount} 项严重物理或电气冲突，配件无法正常安装或开机，请根据建议调整配置。`;
  } else if (warningCount > 0) {
    overallStatus = 'warning';
    summaryText = `无严重硬冲突，但存在 ${warningCount} 项装机注意事项或空间/供电提示，装配前请核实。`;
  } else if (unknownCount > 0 || !isBuildComplete) {
    overallStatus = 'unknown';
    if (!isBuildComplete) {
      summaryText = `配置单尚未选齐核心配件（缺少 ${missingCoreSlotTypes.join('、')}），暂不能断言整机兼容性。`;
    } else {
      summaryText = `存在 ${unknownCount} 项规格待核查项目，无法断言整机完全兼容，请查阅具体非公或机箱物理参数。`;
    }
  } else {
    overallStatus = 'pass';
    summaryText = '在当前已知且核验的规格条件下，所有检查项校验通过（注意：本版未覆盖通道拆分与微观间隙等高阶物理细节）。';
  }

  return {
    overallStatus,
    rules,
    passCount,
    warningCount,
    errorCount,
    unknownCount,
    notApplicableCount,
    isBuildComplete,
    missingCoreSlotTypes,
    uncoveredChecks: UNCOVERED_RULES_DISCLOSURE,
    summaryText,
  };
}

/**
 * 功耗与电源负荷评估纯函数
 */
export function calculateBuildPower(
  build: CustomBuild,
  catalog: CatalogInput
): PowerEstimate {
  const catalogMap = createCatalogMap(catalog);

  const getSlot = (type: BuildSlotType): CustomBuildSlotItem | null => {
    return build.slots.find((s) => s.type === type) || null;
  };

  const cpuSlot = getSlot('cpu');
  const gpuSlot = getSlot('gpu');
  const psuSlot = getSlot('psu');

  const cpu = cpuSlot?.hardwareId ? catalogMap.get(cpuSlot.hardwareId) || null : null;
  const gpu = gpuSlot?.hardwareId ? catalogMap.get(gpuSlot.hardwareId) || null : null;
  const psu = psuSlot?.hardwareId ? catalogMap.get(psuSlot.hardwareId) || null : null;

  const missingInputs: string[] = [];
  const notes: string[] = [];

  // CPU 功耗
  let cpuWatts: number | null = null;
  if (cpuSlot) {
    if (cpu) {
      if ('power' in cpu && cpu.power?.isKnown && typeof cpu.power.watts === 'number' && cpu.power.watts > 0) {
        cpuWatts = cpu.power.watts;
      } else if ('tdpWatts' in cpu && typeof cpu.tdpWatts === 'number' && cpu.tdpWatts > 0) {
        cpuWatts = cpu.tdpWatts;
      } else {
        missingInputs.push('CPU 标称功耗');
      }
    } else if (cpuSlot.customName) {
      missingInputs.push('自填 CPU 功耗');
    } else if (cpuSlot.hardwareId) {
      missingInputs.push('未收录 CPU 功耗');
    } else {
      missingInputs.push('CPU');
    }
  } else {
    missingInputs.push('CPU');
  }

  // GPU 功耗及 4 种情形
  let gpuWatts: number | null = null;
  let gpuScenario: GpuPowerScenario = 'none';
  let manufacturerPsuRecommendationWatts: number | null = null;
  let manufacturerPsuSource: PowerEstimate['manufacturerPsuSource'] = null;

  if (!gpuSlot || (!gpuSlot.hardwareId && !gpuSlot.customName)) {
    // 明确未选配独立显卡
    gpuScenario = 'none';
    gpuWatts = 0;
  } else if (gpuSlot.customName && !gpuSlot.hardwareId) {
    // 自填/二手未收录型号
    gpuScenario = 'custom';
    gpuWatts = null;
    missingInputs.push('自填显卡功耗');
  } else if (gpuSlot.hardwareId) {
    if (!gpu) {
      // 提供了 hardwareId 但配件库中不存在
      gpuScenario = 'unrecognized';
      gpuWatts = null;
      missingInputs.push('未收录显卡功耗');
    } else {
      // 配件库已知型号
      gpuScenario = 'known';
      if ('power' in gpu && gpu.power?.isKnown && typeof gpu.power.watts === 'number' && gpu.power.watts > 0) {
        gpuWatts = gpu.power.watts;
      } else if ('tdpWatts' in gpu && typeof gpu.tdpWatts === 'number' && gpu.tdpWatts > 0) {
        gpuWatts = gpu.tdpWatts;
      } else {
        missingInputs.push('显卡标称功耗');
      }

      // 提取厂商官方建议电源：仅从已核验的规格规范中严格提取单值功率（禁止非数字盲目提取与范围值折合，移除 cons/pairingAdvice 回退）
      if ('specifications' in gpu && Array.isArray(gpu.specifications)) {
        const psuSpec = gpu.specifications.find(
          (s) =>
            s.id === 'gpu.recommendedPsu' ||
            s.id.includes('recommendedPsu') ||
            (typeof s.label === 'string' && (s.label.includes('建议') && s.label.includes('供电') || s.label.includes('建议电源')))
        );
        if (psuSpec) {
          const isVerifiedMfg =
            psuSpec.verificationStatus === 'verified' ||
            psuSpec.sourceKind === 'manufacturer';
          if (isVerifiedMfg) {
            const rawVal = String(psuSpec.value || '').trim();
            // 严禁将范围值（如 650–750 W、650-750W、650~750W）盲目折合为单值
            const isRange = /[-–—~至]/.test(rawVal);
            if (!isRange) {
              let num: number | null = null;
              if (typeof psuSpec.numericValue === 'number' && psuSpec.numericValue > 0) {
                num = psuSpec.numericValue;
              } else {
                const matchSingle =
                  rawVal.match(/^(\d{3,4})\s*W?$/i) ||
                  rawVal.match(/(?:建议(?:系统)?电源|PSU|电源)[^\d]*(\d{3,4})\s*W/i);
                if (matchSingle) {
                  num = parseInt(matchSingle[1], 10);
                }
              }
              if (num && num > 0) {
                manufacturerPsuRecommendationWatts = num;
                manufacturerPsuSource = {
                  valueWatts: num,
                  sourceKind: psuSpec.sourceKind,
                  condition: psuSpec.condition,
                };
              }
            }
          }
        }
      }
    }
  }

  // 平台基底功耗：经验假设 60W
  const basePlatformWatts = 60;
  const basePlatformAssumptionText =
    '主板芯片组、双通道内存、NVMe SSD 及机箱散热风扇日常运作基底（经验假设值 50W~70W，取中值 60W，非实测数据）';
  const empiricalEstimateNotice =
    '注：整机预估峰值基于经验公式（CPU 1.15倍 + 显卡 1.1倍瞬态裕量 + 60W平台基底），仅供配置参考，非实测数据。';

  // 检查关键输入是否齐全
  const isFullyKnown = missingInputs.length === 0 && cpuWatts !== null && gpuWatts !== null;

  let estimatedPeakWatts: number | null = null;
  if (isFullyKnown && cpuWatts !== null && gpuWatts !== null) {
    // 峰值功耗估算：CPU 1.15倍 + 显卡 1.1倍 + 基底 60W
    estimatedPeakWatts = Math.round(cpuWatts * 1.15 + gpuWatts * 1.1 + basePlatformWatts);
  }

  // 电源额定功率
  const psuSpecs = extractPsuSpecs(psu);
  const psuRatedWatts = psuSpecs.value?.ratedWattage ?? null;

  let headroomWatts: number | null = null;
  if (psuRatedWatts !== null && estimatedPeakWatts !== null) {
    headroomWatts = psuRatedWatts - estimatedPeakWatts;
  }

  let status: 'pass' | 'warning' | 'error' | 'unknown' = 'pass';
  if (!isFullyKnown || psuRatedWatts === null) {
    status = 'unknown';
    notes.push('输入功耗或电源额定功率数据不全，当前功耗估算不完整，无法精确计算冗余裕量。');
  } else if (headroomWatts !== null && headroomWatts < 0) {
    status = 'error';
    notes.push(`系统预估峰值负载 (${estimatedPeakWatts}W) 超过电源额定容量 (${psuRatedWatts}W)，高负载运行存在触发过载保护或掉电风险。`);
  } else if (manufacturerPsuRecommendationWatts && psuRatedWatts < manufacturerPsuRecommendationWatts) {
    status = 'warning';
    notes.push(`电源额定容量 (${psuRatedWatts}W) 低于显卡官方建议的 ${manufacturerPsuRecommendationWatts}W 系统电源。高负载瞬态尖峰下可能接近电源限值。`);
  } else if (headroomWatts !== null && headroomWatts < estimatedPeakWatts! * 0.2) {
    status = 'warning';
    notes.push(`电源余量仅 ${headroomWatts}W，瞬态抗冲击能力偏紧，建议留出 20%~30% 裕量。`);
  } else {
    status = 'pass';
    notes.push(`电源容量充裕，预估负载处于合理负荷区间，保留了稳健的工程余量。`);
  }

  return {
    cpuWatts,
    gpuWatts,
    gpuScenario,
    basePlatformWatts,
    basePlatformAssumptionText,
    otherWatts: 0,
    estimatedPeakWatts,
    manufacturerPsuRecommendationWatts,
    manufacturerPsuSource,
    psuRatedWatts,
    headroomWatts,
    isFullyKnown,
    missingInputs,
    status,
    notes,
    empiricalEstimateNotice,
  };
}

/**
 * 成本汇总纯函数
 */
export function calculateBuildCost(
  build: CustomBuild,
  catalog: CatalogInput
): CostSummary {
  const catalogMap = createCatalogMap(catalog);

  let knownSubtotalMin = 0;
  let knownSubtotalMax = 0;
  let hasUnknownPrices = false;
  let unknownPriceSlotCount = 0;
  let userOverrideCount = 0;
  let catalogReferenceCount = 0;
  let zeroPriceCount = 0;
  let unknownCount = 0;
  let launchPriceOnlyCount = 0;
  let filledSlotsCount = 0;

  for (const slot of build.slots) {
    if (!slot.hardwareId && !slot.customName) continue;
    filledSlotsCount++;

    const qty = Math.max(1, Math.floor(slot.quantity || 1));

    if (slot.isExplicitZeroPrice || slot.userPrice === 0) {
      zeroPriceCount++;
      // 自备 0 元
      continue;
    }

    if (typeof slot.userPrice === 'number' && slot.userPrice > 0) {
      knownSubtotalMin += slot.userPrice * qty;
      knownSubtotalMax += slot.userPrice * qty;
      userOverrideCount++;
      continue;
    }

    // 尝试读取目录价格
    const item = slot.hardwareId ? catalogMap.get(slot.hardwareId) : null;
    let marketMin: number | null = null;
    let marketMax: number | null = null;
    let launchPrice: number | null = null;

    if (item) {
      if ('pricing' in item && item.pricing) {
        if (item.pricing.isKnownRange && typeof item.pricing.referenceRange?.min === 'number' && item.pricing.referenceRange.min > 0) {
          marketMin = item.pricing.referenceRange.min;
          marketMax = typeof item.pricing.referenceRange.max === 'number' && item.pricing.referenceRange.max > 0
            ? item.pricing.referenceRange.max
            : marketMin;
        }
        if (typeof item.pricing.launchReference === 'number' && item.pricing.launchReference > 0) {
          launchPrice = item.pricing.launchReference;
        }
      }
      if (marketMin === null) {
        const hItem = getAsHardwareItem(item);
        if (hItem && isValidPriceRange(hItem.marketPriceRange)) {
          marketMin = hItem.marketPriceRange[0];
          marketMax = hItem.marketPriceRange[1] > 0 ? hItem.marketPriceRange[1] : marketMin;
        }
        if (hItem && typeof hItem.msrpRmb === 'number' && hItem.msrpRmb > 0) {
          launchPrice = hItem.msrpRmb;
        }
      }
    }

    if (marketMin !== null && marketMin > 0) {
      knownSubtotalMin += marketMin * qty;
      knownSubtotalMax += (marketMax ?? marketMin) * qty;
      catalogReferenceCount++;
    } else if (launchPrice !== null && launchPrice > 0) {
      // 发售参考价不自动降级为当前市场报价
      launchPriceOnlyCount++;
      hasUnknownPrices = true;
      unknownPriceSlotCount++;
      unknownCount++;
    } else {
      hasUnknownPrices = true;
      unknownPriceSlotCount++;
      unknownCount++;
    }
  }

  const isRange = knownSubtotalMin !== knownSubtotalMax;
  const knownTotalCost = knownSubtotalMin; // 固定基线含义（下限）
  const budget = build.targetBudget;
  const hasLaunchPriceFallback = launchPriceOnlyCount > 0;
  const launchPriceFallbackCount = launchPriceOnlyCount;

  let budgetDifferenceMin: number | null = null;
  let budgetDifferenceMax: number | null = null;
  let budgetDifference: number | null = null;
  let isBudgetExceeded = false;
  let budgetStatus: BudgetStatus = 'unspecified';

  if (budget !== null && budget > 0) {
    budgetDifferenceMin = knownSubtotalMin - budget;
    budgetDifferenceMax = knownSubtotalMax - budget;
    budgetDifference = budgetDifferenceMin;
    isBudgetExceeded = knownSubtotalMin > budget;

    if (knownSubtotalMin > budget) {
      // 哪怕有未知价格，已知下限已超预算，亦算 exceeded（但提示有未报价配件）
      budgetStatus = 'exceeded';
    } else if (isRange && knownSubtotalMin <= budget && knownSubtotalMax >= budget) {
      // 区间跨越预算线
      budgetStatus = 'spans-budget';
    } else if (hasUnknownPrices) {
      // 有未知价格且已知小计低于预算，不得显示 within，必须标 unknown
      budgetStatus = 'unknown';
    } else {
      budgetStatus = 'within';
    }
  } else {
    budgetStatus = 'unspecified';
  }

  return {
    knownTotalCost,
    knownSubtotalMin,
    knownSubtotalMax,
    isRange,
    targetBudget: budget,
    budgetDifferenceMin,
    budgetDifferenceMax,
    budgetDifference,
    isBudgetExceeded,
    budgetStatus,
    hasUnknownPrices,
    unknownPriceSlotCount,
    hasLaunchPriceFallback,
    launchPriceFallbackCount,
    totalSlotsCount: build.slots.length,
    filledSlotsCount,
    priceSourceBreakdown: {
      userOverrideCount,
      catalogReferenceCount,
      zeroPriceCount,
      unknownCount,
      launchPriceOnlyCount,
    },
  };
}

/**
 * 槽位添加或更新纯函数
 * 若已存在该品类槽位则更新替换；若该槽位此前被删除/不存在则补入
 */
export function updateOrInsertSlot(
  build: CustomBuild,
  slotItem: CustomBuildSlotItem
): CustomBuild {
  const existingIdx = build.slots.findIndex((s) => s.type === slotItem.type);
  let newSlots: CustomBuildSlotItem[];
  if (existingIdx >= 0) {
    newSlots = build.slots.map((s, idx) => (idx === existingIdx ? { ...slotItem } : s));
  } else {
    newSlots = [...build.slots, { ...slotItem }];
  }
  return {
    ...build,
    slots: newSlots,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 智能沙盒替代建议引擎
 * 针对产生特定 Error 的规则，克隆配置单进行全配置沙盒复检，返回既解决冲突又不引入新 Error 的候选配件
 */
export function findCompatibleReplacements(
  ruleResult: CompatibilityRuleResult,
  currentBuild: CustomBuild,
  catalog: CatalogInput
): ReplacementCandidate[] {
  if (ruleResult.status !== 'error') return [];

  // 确定需要替换的槽位类型
  let targetSlotType: BuildSlotType | null = null;
  if (ruleResult.ruleId === 'rule_socket_match') {
    targetSlotType = 'motherboard';
  } else if (ruleResult.ruleId === 'rule_ram_type_match' || ruleResult.ruleId === 'rule_ram_form_and_slots') {
    targetSlotType = 'ram';
  } else if (ruleResult.ruleId === 'rule_cooler_bracket' || ruleResult.ruleId === 'rule_cooler_clearance') {
    targetSlotType = 'cooler';
  } else if (ruleResult.ruleId === 'rule_motherboard_case_size' || ruleResult.ruleId === 'rule_gpu_length_clearance') {
    targetSlotType = 'case';
  } else if (ruleResult.ruleId === 'rule_psu_capacity' || ruleResult.ruleId === 'rule_gpu_power_connectors') {
    targetSlotType = 'psu';
  } else if (ruleResult.ruleId === 'rule_display_output') {
    targetSlotType = 'gpu';
  }

  if (!targetSlotType) return [];

  const catalogMap = createCatalogMap(catalog);
  const currentSlot = currentBuild.slots.find((s) => s.type === targetSlotType);
  const currentPart = (currentSlot?.hardwareId ? catalogMap.get(currentSlot.hardwareId) : null) ?? null;
  const currentItem = getAsHardwareItem(currentPart);
  const qty = currentSlot?.quantity || 1;

  // 计算当前槽位的已知价格（用户报价 > 0 元自备 > 目录市场区间；绝不回退 msrp）
  let currentMin: number | null = null;
  let currentMax: number | null = null;

  if (currentSlot?.isExplicitZeroPrice) {
    currentMin = 0;
    currentMax = 0;
  } else if (currentSlot?.userPrice !== null && typeof currentSlot?.userPrice === 'number' && currentSlot.userPrice >= 0) {
    const totalUserPrice = currentSlot.userPrice * qty;
    currentMin = totalUserPrice;
    currentMax = totalUserPrice;
  } else if (currentItem && isValidPriceRange(currentItem.marketPriceRange)) {
    currentMin = currentItem.marketPriceRange[0] * qty;
    currentMax = currentItem.marketPriceRange[1] * qty;
  }

  // 记录基线现有错误
  const baselineReport = checkBuildCompatibility(currentBuild, catalog);
  const baselineErrorRuleIds = new Set(
    baselineReport.rules.filter((r) => r.status === 'error').map((r) => r.ruleId)
  );

  const candidates: ReplacementCandidate[] = [];

  for (const item of catalogMap.values()) {
    const rawItem = getAsHardwareItem(item);
    if (!rawItem || rawItem.category !== targetSlotType) continue;
    if (currentSlot?.hardwareId && rawItem.id === currentSlot.hardwareId) continue;

    // 创建沙盒克隆配置（使用 updateOrInsertSlot）
    const sandboxSlot: CustomBuildSlotItem = {
      slotId: currentSlot?.slotId || `slot-${targetSlotType}`,
      type: targetSlotType,
      hardwareId: rawItem.id,
      quantity: qty,
      userPrice: null,
      isExplicitZeroPrice: false,
    };
    const sandboxBuild = updateOrInsertSlot(currentBuild, sandboxSlot);

    // 在沙盒中执行完全相同的校验引擎
    const sandboxReport = checkBuildCompatibility(sandboxBuild, catalog);

    // 条件 1: 目标规则在沙盒中必须变为 pass，不得降级为 unknown 或仍为 error
    const targetRuleInSandbox = sandboxReport.rules.find((r) => r.ruleId === ruleResult.ruleId);
    if (!targetRuleInSandbox || targetRuleInSandbox.status !== 'pass') {
      continue;
    }

    // 条件 2: 绝不引入任何全新的 error（除原先已存在的既有错误外）
    const sandboxErrors = sandboxReport.rules.filter((r) => r.status === 'error');
    const hasNewError = sandboxErrors.some(
      (r) => r.ruleId !== ruleResult.ruleId && !baselineErrorRuleIds.has(r.ruleId)
    );
    if (hasNewError) {
      continue;
    }

    // 计算候选价格（仅使用有效市场参考区间 × 数量，绝不回退到 msrp）
    let candMin: number | null = null;
    let candMax: number | null = null;
    if (isValidPriceRange(rawItem.marketPriceRange)) {
      candMin = rawItem.marketPriceRange[0] * qty;
      candMax = rawItem.marketPriceRange[1] * qty;
    }

    let deltaPrice: number | null = null;
    let deltaPriceMin: number | undefined = undefined;
    let deltaPriceMax: number | undefined = undefined;

    if (candMin !== null && candMax !== null && currentMin !== null && currentMax !== null) {
      deltaPriceMin = candMin - currentMax;
      deltaPriceMax = candMax - currentMin;
      if (deltaPriceMin === deltaPriceMax) {
        deltaPrice = deltaPriceMin;
      }
    }

    // 收集沙盒中剩余的待注意问题（包括 warning, unknown 以及其他既有 error）
    const remainingIssues = sandboxReport.rules.filter(
      (r) => (r.status === 'warning' || r.status === 'unknown' || r.status === 'error') && r.ruleId !== ruleResult.ruleId
    );

    candidates.push({
      item: rawItem,
      deltaPrice,
      deltaPriceMin,
      deltaPriceMax,
      remainingIssues,
    });
  }

  // 排序：优先按差价下限由低到高（保留区间与未知状态）
  candidates.sort((a, b) => {
    const valA = a.deltaPriceMin ?? a.deltaPrice ?? Infinity;
    const valB = b.deltaPriceMin ?? b.deltaPrice ?? Infinity;
    return valA - valB;
  });

  return candidates.slice(0, 3);
}
