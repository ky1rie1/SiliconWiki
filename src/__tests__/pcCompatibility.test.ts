import { describe, it, expect } from 'vitest';
import {
  checkBuildCompatibility,
  calculateBuildPower,
  calculateBuildCost,
  findCompatibleReplacements,
} from '../utils/pcCompatibility';
import { CustomBuild } from '../types/pcBuilder';
import { HardwareItem } from '../types';
import { hardwareCatalog } from '../data/hardware';

describe('PC Compatibility Engine - Milestone 3A Tests', () => {
  // 辅助函数：构造测试用的装机单
  function createTestBuild(slots: { type: any; hardwareId: string | null; userPrice?: number | null; isExplicitZeroPrice?: boolean; quantity?: number }[]): CustomBuild {
    return {
      schemaVersion: 1,
      id: 'test-build-1',
      title: '测试装机单',
      targetBudget: 10000,
      slots: slots.map((s, idx) => ({
        slotId: `slot-${idx + 1}`,
        type: s.type,
        hardwareId: s.hardwareId,
        userPrice: s.userPrice ?? null,
        isExplicitZeroPrice: s.isExplicitZeroPrice ?? false,
        quantity: s.quantity ?? 1,
      })),
      createdAt: '2026-09-14T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z',
    };
  }

  const allRecords = [...hardwareCatalog.byId.values()];

  // ========================================================
  // 1. 五态判定与缺件配置测试
  // ========================================================
  it('1.1 空配置单或缺核心配件时不显示整机完全兼容，严格返回 unknown', () => {
    const emptyBuild = createTestBuild([]);
    const report = checkBuildCompatibility(emptyBuild, allRecords);

    expect(report.overallStatus).toBe('unknown');
    expect(report.isBuildComplete).toBe(false);
    expect(report.missingCoreSlotTypes).toEqual(
      expect.arrayContaining(['cpu', 'motherboard', 'ram', 'cooler', 'psu', 'case'])
    );
    expect(report.summaryText).toContain('配置单尚未选齐核心配件');
  });

  it('1.2 规则状态独立区分 unknown 与 warning，禁止底层将 unknown 折叠为 warning', () => {
    // 构造仅有未记录尺寸非公显卡的测试条目
    const customGpuWithoutDim: HardwareItem = {
      id: 'gpu-custom-nodim',
      name: '某非公显卡 (无尺寸数据)',
      category: 'gpu',
      brand: 'TestBrand',
      series: 'TestSeries',
      releaseYear: 2024,
      specs: {},
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 200,
      msrpRmb: 3000,
      marketPriceRange: [3000, 3200],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    const build = createTestBuild([
      { type: 'gpu', hardwareId: 'gpu-custom-nodim' },
      { type: 'case', hardwareId: 'case-lianli-o11d-evo-rgb' },
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, customGpuWithoutDim]);
    const gpuRule = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');

    expect(gpuRule).toBeDefined();
    // 关键准则：尺寸未知时必须为 unknown，绝不可归入 warning 或 pass
    expect(gpuRule!.status).toBe('unknown');
    expect(gpuRule!.missingFields).toContain('gpu.dimensions.lengthMm');
  });

  // ========================================================
  // 2. CPU 与主板插槽物理匹配 (rule_socket_match)
  // ========================================================
  it('2.1 AM5 CPU 搭配 AM5 主板返回 pass', () => {
    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' }, // AM5
      { type: 'motherboard', hardwareId: 'mb-asus-x870e-hero' }, // AM5
    ]);
    const report = checkBuildCompatibility(build, allRecords);
    const rule = report.rules.find((r) => r.ruleId === 'rule_socket_match');

    expect(rule?.status).toBe('pass');
    expect(rule?.basis).toContain('AM5');
  });

  it('2.2 AM5 CPU 搭配 LGA1700 主板返回 error 并提供修复建议', () => {
    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' }, // AM5
      { type: 'motherboard', hardwareId: 'mb-msi-mag-z790-tomahawk' }, // LGA 1700
    ]);
    const report = checkBuildCompatibility(build, allRecords);
    const rule = report.rules.find((r) => r.ruleId === 'rule_socket_match');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('插槽物理不兼容');
    expect(rule?.suggestedFix).toContain('更换');
  });

  // ========================================================
  // 3. 内存兼容性 (rule_ram_type_match & rule_ram_form_and_slots)
  // ========================================================
  it('3.1 AM5 CPU 搭配 DDR4 内存返回 error (AM5 仅支持 DDR5)', () => {
    const syntheticDdr4Ram: HardwareItem = {
      id: 'ram-test-ddr4',
      name: '金百达 银爵 DDR4 3200 16G',
      category: 'ram',
      brand: 'KingBank',
      series: '银爵',
      releaseYear: 2023,
      specs: { '标称频率': 'DDR4 3200 MT/s', '容量与套条': '16 GB' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 5,
      msrpRmb: 200,
      marketPriceRange: [180, 220],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' },
      { type: 'motherboard', hardwareId: 'mb-asus-x870e-hero' },
      { type: 'ram', hardwareId: 'ram-test-ddr4' },
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, syntheticDdr4Ram]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_ram_type_match');

    expect(rule?.status).toBe('error');
    expect(rule?.message).toContain('DDR4');
  });

  it('3.2 内存总条数超出主板插槽数返回 error', () => {
    // 构造 2 插槽 ITX 主板
    const itxMotherboard: HardwareItem = {
      id: 'mb-test-itx-2slots',
      name: '华硕 ROG STRIX B650I GAMING WIFI',
      category: 'motherboard',
      brand: 'ASUS',
      series: 'ROG STRIX',
      releaseYear: 2023,
      specs: { '主板板型': 'Mini-ITX', 'CPU 插槽': 'AM5', '内存规格': '2x DDR5' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 25,
      msrpRmb: 1899,
      marketPriceRange: [1699, 1899],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    // 选购 2 套双通道套条 (共 4 根)
    const build = createTestBuild([
      { type: 'motherboard', hardwareId: 'mb-test-itx-2slots' },
      { type: 'ram', hardwareId: 'ram-gskill-trident-z5-neo-6000-c28', quantity: 2 }, // 2套 × 2条 = 4条
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, itxMotherboard]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_ram_form_and_slots');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('超出主板物理插槽上限');
  });

  // ========================================================
  // 4. 板型与机箱匹配 (rule_motherboard_case_size)
  // ========================================================
  it('4.1 ATX 主板装入仅支持 M-ATX 的机箱返回 error', () => {
    const matxCase: HardwareItem = {
      id: 'case-test-matx-only',
      name: '先马平头哥 M-ATX 紧凑机箱',
      category: 'case',
      brand: 'SAMA',
      series: '平头哥',
      releaseYear: 2023,
      specs: { '主板兼容': 'Micro-ATX, Mini-ITX' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 0,
      msrpRmb: 150,
      marketPriceRange: [140, 160],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    const build = createTestBuild([
      { type: 'motherboard', hardwareId: 'mb-asus-x870e-hero' }, // ATX
      { type: 'case', hardwareId: 'case-test-matx-only' }, // M-ATX / ITX only
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, matxCase]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_motherboard_case_size');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('超出机箱容纳范围');
  });

  // ========================================================
  // 5. 显卡限长与风冷/水冷空间 (rule_gpu_length_clearance & rule_cooler_clearance)
  // ========================================================
  it('5.1 显卡长度超出机箱限长返回 error', () => {
    const smallCase: HardwareItem = {
      id: 'case-test-small',
      name: '紧凑型 ITX 机箱',
      category: 'case',
      brand: 'Test',
      series: 'ITX',
      releaseYear: 2024,
      specs: { '显卡限长': '300 mm', '主板兼容': 'Mini-ITX' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 0,
      msrpRmb: 300,
      marketPriceRange: [280, 320],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    // 七彩虹 4070S Ultra W 长度为 313.5mm
    const build = createTestBuild([
      { type: 'gpu', hardwareId: 'gpu-colorful-rtx4070s-ultra-w' },
      { type: 'case', hardwareId: 'case-test-small' },
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, smallCase]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('显卡超长无法放入机箱');
  });

  it('5.2 360mm 水冷排安装到仅支持 240mm 的机箱返回 error', () => {
    const case240Only: HardwareItem = {
      id: 'case-test-240-only',
      name: '紧凑 M-ATX 机箱 (仅支持 240 冷排)',
      category: 'case',
      brand: 'Test',
      series: 'MATX',
      releaseYear: 2024,
      specs: { '冷排支持': '顶置 240 + 后置 120', '主板兼容': 'Micro-ATX' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 0,
      msrpRmb: 200,
      marketPriceRange: [180, 220],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    const build = createTestBuild([
      { type: 'cooler', hardwareId: 'cooler-valkyrie-gl360' }, // 360mm
      { type: 'case', hardwareId: 'case-test-240-only' },
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, case240Only]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_cooler_clearance');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('机箱不支持当前规格水冷排');
  });

  // ========================================================
  // 6. 显示输出检查 (rule_display_output)
  // ========================================================
  it('6.1 无独显且 CPU 明确无核显返回 error', () => {
    const cpuWithoutIgpu: HardwareItem = {
      id: 'cpu-test-12400f',
      name: 'Intel 酷睿 i5-12400F',
      category: 'cpu',
      brand: 'Intel',
      series: '酷睿 12 代',
      releaseYear: 2022,
      specs: { '插槽接口': 'LGA 1700', '核显': '无核显 (需搭配独立显卡)' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 65,
      msrpRmb: 700,
      marketPriceRange: [650, 750],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-test-12400f' },
      { type: 'motherboard', hardwareId: 'mb-msi-mag-z790-tomahawk' },
    ]);

    const report = checkBuildCompatibility(build, [...allRecords, cpuWithoutIgpu]);
    const rule = report.rules.find((r) => r.ruleId === 'rule_display_output');

    expect(rule?.status).toBe('error');
    expect(rule?.title).toContain('系统缺少可用显示输出');
  });

  // ========================================================
  // 7. 功耗评估与电源冗余 (calculateBuildPower & rule_psu_capacity)
  // ========================================================
  it('7.1 电源额定功率低于整机预估峰值功耗返回 error', () => {
    const smallPsu: HardwareItem = {
      id: 'psu-test-300w',
      name: '额定 300W 办公电源',
      category: 'psu',
      brand: 'Test',
      series: 'Eco',
      releaseYear: 2023,
      specs: { '额定功率': '300 W' },
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: 300,
      msrpRmb: 100,
      marketPriceRange: [90, 110],
      priceTrend: 'stable',
      jdSearchQuery: '',
      tbSearchQuery: '',
      pddSearchQuery: '',
    };

    // 9800X3D (120W) + RTX 4070S (220W) + 基底 (60W) = 440W
    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' },
      { type: 'gpu', hardwareId: 'gpu-colorful-rtx4070s-ultra-w' },
      { type: 'psu', hardwareId: 'psu-test-300w' },
    ]);

    const powerEst = calculateBuildPower(build, [...allRecords, smallPsu]);
    expect(powerEst.status).toBe('error');
    expect(powerEst.estimatedPeakWatts).toBeGreaterThan(400);

    const report = checkBuildCompatibility(build, [...allRecords, smallPsu]);
    const psuRule = report.rules.find((r) => r.ruleId === 'rule_psu_capacity');
    expect(psuRule?.status).toBe('error');
    expect(psuRule?.title).toContain('电源额定功率低于系统预估负载');
  });

  // ========================================================
  // 8. 成本计算与价格边界 (calculateBuildCost)
  // ========================================================
  it('8.1 自定义 ¥0 与未填写价格严格区分，未知项标记为已知部分合计', () => {
    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d', isExplicitZeroPrice: true, userPrice: 0 }, // 明确 0 元自备
      { type: 'motherboard', hardwareId: 'mb-asus-x870e-hero', userPrice: 4500 }, // 自定义改价 4500
    ]);

    const cost = calculateBuildCost(build, allRecords);
    expect(cost.knownTotalCost).toBe(4500);
    expect(cost.priceSourceBreakdown.zeroPriceCount).toBe(1);
    expect(cost.priceSourceBreakdown.userOverrideCount).toBe(1);
  });

  // ========================================================
  // 9. 智能沙盒替代建议 (findCompatibleReplacements)
  // ========================================================
  it('9.1 插槽冲突时，替代建议推荐兼容主板且确保沙盒复检不引入新 error', () => {
    // 构造插槽冲突配置：AM5 CPU + LGA1700 主板
    const build = createTestBuild([
      { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' },
      { type: 'motherboard', hardwareId: 'mb-msi-mag-z790-tomahawk' },
    ]);

    const report = checkBuildCompatibility(build, allRecords);
    const socketError = report.rules.find((r) => r.ruleId === 'rule_socket_match');
    expect(socketError?.status).toBe('error');

    // 运行替代引擎
    const replacements = findCompatibleReplacements(socketError!, build, allRecords);

    expect(replacements.length).toBeGreaterThan(0);
    // 验证所有候选主板均与 AM5 匹配
    for (const cand of replacements) {
      expect(cand.item.category).toBe('motherboard');
      // 验证在沙盒中该候选确实消解了插槽冲突
      const testBuildWithCand = createTestBuild([
        { type: 'cpu', hardwareId: 'cpu-amd-9800x3d' },
        { type: 'motherboard', hardwareId: cand.item.id },
      ]);
      const candReport = checkBuildCompatibility(testBuildWithCand, allRecords);
      const candSocketRule = candReport.rules.find((r) => r.ruleId === 'rule_socket_match');
      expect(candSocketRule?.status).toBe('pass');
    }
  });
});
