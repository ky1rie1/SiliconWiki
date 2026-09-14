import { describe, it, expect } from 'vitest';
import {
  extractMotherboardSocket,
  extractMotherboardRamSupport,
  extractRamSpecs,
  extractPsuSpecs,
  extractCaseClearance,
  extractDisplayOutputInfo,
} from '../utils/specAdapter';
import {
  checkBuildCompatibility,
  calculateBuildPower,
  calculateBuildCost,
  findCompatibleReplacements,
} from '../utils/pcCompatibility';
import {
  validateCustomBuild,
  deserializeBuildFromUrl,
} from '../utils/pcBuildShare';
import { CustomBuild } from '../types/pcBuilder';
import { HardwareRecord } from '../types/hardwareCatalog';
import { HardwareItem } from '../types';

describe('Phase 3 Regression: Spec Adapter & 5-State Rules Integrity', () => {
  it('extractMotherboardRamSupport does not default to 4 slots when slot count is unknown', () => {
    const item: Partial<HardwareItem> = {
      id: 'mb-no-slots',
      category: 'motherboard',
      specs: { '内存规格': '支持 DDR5 6400MHz' },
    };
    const res = extractMotherboardRamSupport(item as HardwareItem);
    expect(res.isKnown).toBe(true);
    expect(res.value?.supportedGenerations).toEqual(['DDR5']);
    // Must NOT default to 4!
    expect(res.value?.totalSlots).toBeNull();
  });

  it('extractRamSpecs does not default to DDR5 or U-DIMM or 1 stick when unspecified', () => {
    const item: Partial<HardwareItem> = {
      id: 'ram-vague',
      category: 'ram',
      name: '某品牌 内存条',
      specs: {},
    };
    const res = extractRamSpecs(item as HardwareItem);
    expect(res.isKnown).toBe(false);
    expect(res.value).toBeNull();
  });

  it('extractPsuSpecs does not default PCIe 8-pin count to 2', () => {
    const item: Partial<HardwareItem> = {
      id: 'psu-vague',
      category: 'psu',
      name: '某品牌 500W 电源',
      specs: { '额定功率': '500W' },
    };
    const res = extractPsuSpecs(item as HardwareItem);
    expect(res.isKnown).toBe(true);
    expect(res.value?.ratedWattage).toBe(500);
    // When PCIe 8-pin is unspecified, it must be null, NOT 2!
    expect(res.value?.pcie8PinCount).toBeNull();
  });

  it('extractMotherboardSocket prioritizes explicit spec over name guessing and flags contradictions', () => {
    const item: Partial<HardwareItem> = {
      id: 'mb-weird',
      category: 'motherboard',
      name: 'B650 风格定制主板',
      specs: { 'motherboard.socket': 'LGA1700' },
    };
    const res = extractMotherboardSocket(item as HardwareItem);
    // Explicit spec says LGA1700, but name has B650 (AM5). Contradictory!
    expect(res.isKnown).toBe(false);
    expect(res.condition).toMatch(/矛盾/);
  });

  it('extractCaseClearance preserves multi-condition GPU length and radiator mounting positions', () => {
    const item: Partial<HardwareItem> = {
      id: 'case-multi',
      category: 'case',
      specs: {
        '显卡限长': '前置安装水冷时限长 330mm，无前置水冷 380mm',
        '冷排支持': '顶部支持 240/280/360mm，前置支持 240/280/360/420mm',
      },
    };
    const res = extractCaseClearance(item as HardwareItem);
    expect(res.isKnown).toBe(true);
    expect(res.value?.conditionalGpuLimits).toBeDefined();
    expect(res.value?.conditionalGpuLimits?.length).toBeGreaterThanOrEqual(1);
    expect(res.value?.radiatorPositions).toBeDefined();
    expect(res.value?.radiatorPositions?.some((p) => p.position === 'top')).toBe(true);
  });

  it('extractDisplayOutputInfo does not treat bare Type-C as video output', () => {
    const mb: Partial<HardwareItem> = {
      id: 'mb-typec',
      category: 'motherboard',
      specs: { '后置 I/O': 'USB 3.2 Gen2 Type-C, USB 3.0' },
    };
    const cpu: Partial<HardwareItem> = {
      id: 'cpu-kf',
      name: 'Intel Core i5-13600KF',
      category: 'cpu',
      specs: { '核显': '无核显' },
    };
    const res = extractDisplayOutputInfo(cpu as HardwareItem, mb as HardwareItem, null);
    expect(res.hasDedicatedGpu).toBe(false);
    expect(res.cpuHasIgpu).toBe(false);
    expect(res.mbHasVideoPorts).toBe(false);
  });

  it('Rule 2 (BIOS support) returns unknown when BIOS data is missing, not default pass', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b1',
      title: 'Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-exotic', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'motherboard', hardwareId: 'mb-exotic', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'cpu-exotic',
        category: 'cpu',
        name: '未知世代 CPU',
        specs: { 'cpu.socket': 'AM5' },
      } as unknown as HardwareItem,
      {
        id: 'mb-exotic',
        category: 'motherboard',
        name: '未知芯片组主板',
        specs: { 'motherboard.socket': 'AM5' },
      } as unknown as HardwareItem,
    ];
    const report = checkBuildCompatibility(build, catalog);
    const biosRule = report.rules.find((r) => r.ruleId === 'rule_bios_support');
    expect(biosRule).toBeDefined();
    expect(biosRule?.status).toBe('unknown');
  });

  it('Rule 3 & Rule 4: motherboard DDR5 known, slot count unknown, RAM DDR4 selected', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b2',
      title: 'Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'ram', hardwareId: 'ram-ddr4', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'motherboard', hardwareId: 'mb-ddr5-noslots', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'ram-ddr4',
        category: 'ram',
        name: 'DDR4 3200 16GB',
        specs: { 'ram.frequency': 'DDR4 3200', 'ram.capacity': '16GB' },
      } as unknown as HardwareItem,
      {
        id: 'mb-ddr5-noslots',
        category: 'motherboard',
        name: 'DDR5 主板',
        specs: { 'motherboard.ram': 'DDR5 内存支持' },
      } as unknown as HardwareItem,
    ];
    const report = checkBuildCompatibility(build, catalog);
    const rule3 = report.rules.find((r) => r.ruleId === 'rule_ram_type_match');
    const rule4 = report.rules.find((r) => r.ruleId === 'rule_ram_form_and_slots');

    // Rule 3 must report error (DDR4 vs DDR5 mismatch)
    expect(rule3?.status).toBe('error');
    // Rule 4 must report unknown (slot count unknown), NOT pass!
    expect(rule4?.status).toBe('unknown');
  });

  it('Rule 9 (GPU power): flags error when confirmed demand exceeds confirmed supply', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b3',
      title: 'Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'gpu', hardwareId: 'gpu-3x8pin', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'psu', hardwareId: 'psu-1x8pin', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'gpu-3x8pin',
        category: 'gpu',
        name: 'RTX 3080 Ti 旗舰版',
        specs: { 'gpu.powerConnectors': '3x 8-pin' },
      } as unknown as HardwareItem,
      {
        id: 'psu-1x8pin',
        category: 'psu',
        name: '500W 电源',
        specs: { 'psu.wattage': '500W', 'psu.connectors': '1x PCIe 8-pin' },
      } as unknown as HardwareItem,
    ];
    const report = checkBuildCompatibility(build, catalog);
    const psuRule = report.rules.find((r) => r.ruleId === 'rule_gpu_power_connectors');
    expect(psuRule?.status).toBe('error');
  });

  it('Rule 9 (GPU power): returns unknown when connectors are missing', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b4',
      title: 'Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'gpu', hardwareId: 'gpu-unknown-conn', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'psu', hardwareId: 'psu-basic', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'gpu-unknown-conn',
        category: 'gpu',
        name: '非公显卡',
        specs: {},
      } as unknown as HardwareItem,
      {
        id: 'psu-basic',
        category: 'psu',
        name: '650W 电源',
        specs: { 'psu.wattage': '650W' },
      } as unknown as HardwareItem,
    ];
    const report = checkBuildCompatibility(build, catalog);
    const psuRule = report.rules.find((r) => r.ruleId === 'rule_gpu_power_connectors');
    expect(psuRule?.status).toBe('unknown');
  });
});

describe('Phase 3 Regression: Power & PSU Recommendation Flow', () => {
  it('distinguishes explicitly no GPU (0W) vs custom GPU vs unrecognized GPU', () => {
    const buildNoGpu: CustomBuild = {
      schemaVersion: 1,
      id: 'b-no-gpu',
      title: 'No GPU',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
      ],
    };
    const buildCustomGpu: CustomBuild = {
      schemaVersion: 1,
      id: 'b-custom-gpu',
      title: 'Custom GPU',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'gpu', hardwareId: null, customName: '淘来的二手显卡', userPrice: 500, quantity: 1 },
      ],
    };
    const buildUnrecognizedGpu: CustomBuild = {
      schemaVersion: 1,
      id: 'b-unrec-gpu',
      title: 'Unrecognized GPU',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'gpu', hardwareId: 'gpu-non-existent', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      { id: 'cpu-1', category: 'cpu', tdpWatts: 65, specs: {} } as unknown as HardwareItem,
    ];

    const estNoGpu = calculateBuildPower(buildNoGpu, catalog);
    expect(estNoGpu.gpuScenario).toBe('none');
    expect(estNoGpu.gpuWatts).toBe(0);

    const estCustom = calculateBuildPower(buildCustomGpu, catalog);
    expect(estCustom.gpuScenario).toBe('custom');
    expect(estCustom.gpuWatts).toBeNull();
    expect(estCustom.isFullyKnown).toBe(false);

    const estUnrec = calculateBuildPower(buildUnrecognizedGpu, catalog);
    expect(estUnrec.gpuScenario).toBe('unrecognized');
    expect(estUnrec.gpuWatts).toBeNull();
    expect(estUnrec.isFullyKnown).toBe(false);
  });

  it('reads structured manufacturer recommended PSU from specifications', () => {
    const gpuRecord: Partial<HardwareRecord> = {
      schemaVersion: 1,
      entityKind: 'reference-product',
      identity: {
        id: 'gpu-rtx4080',
        name: 'RTX 4080',
        brand: 'NVIDIA',
        category: 'gpu',
        series: 'RTX 40',
        releaseYear: 2022,
        platform: 'desktop',
      },
      specifications: [
        {
          id: 'gpu.recommendedPsu',
          label: '建议系统供电',
          value: '750W',
          numericValue: 750,
          unit: 'W',
          evidence: 'manufacturer-checked',
          sourceKind: 'manufacturer',
          verificationStatus: 'verified',
          condition: '搭配酷睿 i9 处理器',
        },
      ],
      power: { watts: 320, isKnown: true, evidence: 'manufacturer-checked', meaning: 'TGP' },
      pricing: { currency: 'CNY', evidence: 'editorial-reference', referenceRange: { min: 8000, max: 9499 }, isKnownRange: true, launchReference: 9499, history: [] },
      auditSummary: { entityKind: 'reference-product', verifiedFieldCount: 1, verifiedCoreCount: 1, coreFieldTotal: 1, verificationRate: 1, hasOfficialSource: true, lastCheckedAt: null, missingCoreFields: [] },
      sources: [],
      benchmarks: { evidence: 'editorial-reference', scores: {} as any },
      links: { documents: [], reviews: [] },
    };

    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b-rec-psu',
      title: 'Rec PSU',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-i9', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'gpu', hardwareId: 'gpu-rtx4080', userPrice: null, quantity: 1 },
      ],
    };

    const catalog = [
      { id: 'cpu-i9', category: 'cpu', tdpWatts: 250, specs: {} } as unknown as HardwareItem,
      gpuRecord as HardwareRecord,
    ];

    const est = calculateBuildPower(build, catalog);
    expect(est.manufacturerPsuRecommendationWatts).toBe(750);
    expect(est.manufacturerPsuSource?.condition).toBe('搭配酷睿 i9 处理器');
  });
});

describe('Phase 3 Regression: Unified Configuration Validation', () => {
  it('rejects duplicate slot types in validateCustomBuild', () => {
    const invalidBuild = {
      schemaVersion: 1,
      id: 'dup-slot',
      title: 'Dup Slot',
      targetBudget: null,
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', quantity: 1 },
        { slotId: 's2', type: 'cpu', hardwareId: 'cpu-2', quantity: 1 },
      ],
    };
    const res = validateCustomBuild(invalidBuild);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/重复/);
  });

  it('rejects duplicate slotIds in validateCustomBuild', () => {
    const invalidBuild = {
      schemaVersion: 1,
      id: 'dup-slot-id',
      title: 'Dup Slot ID',
      targetBudget: null,
      slots: [
        { slotId: 'same-id', type: 'cpu', hardwareId: 'cpu-1', quantity: 1 },
        { slotId: 'same-id', type: 'motherboard', hardwareId: 'mb-1', quantity: 1 },
      ],
    };
    const res = validateCustomBuild(invalidBuild);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/slotId/);
  });

  it('rejects mismatched category for known hardwareId', () => {
    const invalidBuild = {
      schemaVersion: 1,
      id: 'cat-mismatch',
      title: 'Mismatch',
      targetBudget: null,
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'gpu-rtx4090', quantity: 1 }, // GPU in CPU slot!
      ],
    };
    const res = validateCustomBuild(invalidBuild);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/类别|品类/);
  });

  it('preserves unknown hardwareId as unconfirmed part without crashing', () => {
    const build = {
      schemaVersion: 1,
      id: 'unconfirmed-id',
      title: 'Unconfirmed',
      targetBudget: null,
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'custom-es-cpu', quantity: 1 },
      ],
    };
    const res = validateCustomBuild(build);
    expect(res.valid).toBe(true);
    expect(res.build?.slots[0].hardwareId).toBe('custom-es-cpu');
  });

  it('rejects negative, zero, fractional, or excessive quantities without silent truncation', () => {
    const invalidQuantities = [-1, 0, 1.5, 2]; // cpu cannot have 2
    for (const q of invalidQuantities) {
      const invalidBuild = {
        schemaVersion: 1,
        id: `q-${q}`,
        title: 'Bad Qty',
        targetBudget: null,
        slots: [{ slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', quantity: q }],
      };
      const res = validateCustomBuild(invalidBuild);
      expect(res.valid).toBe(false);
    }
  });

  it('rejects isExplicitZeroPrice true when userPrice > 0', () => {
    const invalidBuild = {
      schemaVersion: 1,
      id: 'bad-zero-price',
      title: 'Conflict',
      targetBudget: null,
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', quantity: 1, userPrice: 100, isExplicitZeroPrice: true },
      ],
    };
    const res = validateCustomBuild(invalidBuild);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/0|冲突/);
  });

  it('URL deserialization rejects malformed items and does not silent-drop with continue', () => {
    // Malformed compact payload with corrupted item
    const corruptedPayload = {
      v: 1,
      t: 'Corrupted',
      s: [
        ['invalid_slot_type', 'cpu-1', 100, 1], // invalid type!
      ],
    };
    // URL deserializer must fail or return null, NOT return an empty build with 0 slots!
    const jsonStr = JSON.stringify(corruptedPayload);
    const b64 = Buffer.from(jsonStr).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const deserialized = deserializeBuildFromUrl(b64);
    expect(deserialized).toBeNull();
  });
});

describe('Phase 3 Regression: Pricing Semantics & Budget Spanning', () => {
  it('identifies price range and handles budget spanning', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'price-test',
      title: 'Price Range Test',
      targetBudget: 5500,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-ranged', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'cpu-ranged',
        category: 'cpu',
        marketPriceRange: [5000, 6000],
        specs: {},
      } as unknown as HardwareItem,
    ];
    const cost = calculateBuildCost(build, catalog);
    expect(cost.isRange).toBe(true);
    expect(cost.knownSubtotalMin).toBe(5000);
    expect(cost.knownSubtotalMax).toBe(6000);
    // Budget is 5500. Range is 5000 ~ 6000. It spans the budget!
    expect(cost.budgetStatus).toBe('spans-budget');
  });

  it('does not silently substitute launch price as current market quote', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'launch-test',
      title: 'Launch Price Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-launch-only', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      {
        id: 'cpu-launch-only',
        category: 'cpu',
        marketPriceRange: [0, 0], // no market quote
        msrpRmb: 2999, // launch price only
        specs: {},
      } as unknown as HardwareItem,
    ];
    const cost = calculateBuildCost(build, catalog);
    // Launch price should NOT be silently added to knownSubtotalMin as market price!
    expect(cost.hasLaunchPriceFallback).toBe(true);
    expect(cost.hasUnknownPrices).toBe(true);
  });
});

describe('Phase 3 Regression: Sandbox Replacement Engine', () => {
  it('does not accept an alternative that resolves error into unknown', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'repl-test',
      title: 'Repl Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-am5', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'motherboard', hardwareId: 'mb-lga1700', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      { id: 'cpu-am5', category: 'cpu', specs: { 'cpu.socket': 'AM5' } } as unknown as HardwareItem,
      { id: 'mb-lga1700', category: 'motherboard', specs: { 'motherboard.socket': 'LGA1700' } } as unknown as HardwareItem,
      { id: 'mb-unknown-socket', category: 'motherboard', specs: {} } as unknown as HardwareItem, // socket unknown!
      { id: 'mb-valid-am5', category: 'motherboard', specs: { 'motherboard.socket': 'AM5' } } as unknown as HardwareItem,
    ];

    const report = checkBuildCompatibility(build, catalog);
    const socketError = report.rules.find((r) => r.ruleId === 'rule_socket_match' && r.status === 'error');
    expect(socketError).toBeDefined();

    const replacements = findCompatibleReplacements(socketError!, build, catalog);
    // mb-unknown-socket resolves the error to unknown, NOT pass! So it must NOT be included!
    expect(replacements.some((c) => c.item.id === 'mb-unknown-socket')).toBe(false);
    // mb-valid-am5 resolves the error to pass! It MUST be included!
    expect(replacements.some((c) => c.item.id === 'mb-valid-am5')).toBe(true);
  });

  it('allows unrelated pre-existing errors to remain and reports them in remainingIssues', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'repl-unrelated-error',
      title: 'Unrelated Error Test',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        // Error 1: RAM DDR4 vs MB DDR5
        { slotId: 's1', type: 'ram', hardwareId: 'ram-ddr4', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'motherboard', hardwareId: 'mb-ddr5-am5', userPrice: null, quantity: 1 },
        { slotId: 's3', type: 'cpu', hardwareId: 'cpu-am5', userPrice: null, quantity: 1 },
        // Error 2: GPU 350mm vs Case 300mm limit
        { slotId: 's4', type: 'gpu', hardwareId: 'gpu-350mm', userPrice: null, quantity: 1 },
        { slotId: 's5', type: 'case', hardwareId: 'case-300mm', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      { id: 'ram-ddr4', category: 'ram', specs: { 'ram.frequency': 'DDR4' } } as unknown as HardwareItem,
      { id: 'ram-ddr5', category: 'ram', specs: { 'ram.frequency': 'DDR5' } } as unknown as HardwareItem,
      { id: 'mb-ddr5-am5', category: 'motherboard', specs: { 'motherboard.ram': 'DDR5', 'motherboard.socket': 'AM5' } } as unknown as HardwareItem,
      { id: 'cpu-am5', category: 'cpu', specs: { 'cpu.socket': 'AM5' } } as unknown as HardwareItem,
      { id: 'gpu-350mm', category: 'gpu', specs: { 'gpu.dimensions': '350mm x 140mm' } } as unknown as HardwareItem,
      { id: 'case-300mm', category: 'case', specs: { 'case.maxGpuLength': '300mm' } } as unknown as HardwareItem,
    ];

    const report = checkBuildCompatibility(build, catalog);
    const ramError = report.rules.find((r) => r.ruleId === 'rule_ram_type_match' && r.status === 'error');
    expect(ramError).toBeDefined();

    // Even though the case-gpu error exists, findCompatibleReplacements for RAM should STILL find ram-ddr5!
    const candidates = findCompatibleReplacements(ramError!, build, catalog);
    expect(candidates.some((c) => c.item.id === 'ram-ddr5')).toBe(true);
    // And remainingIssues should include the case-gpu error
    const ramCand = candidates.find((c) => c.item.id === 'ram-ddr5');
    expect(ramCand?.remainingIssues.some((i) => i.ruleId === 'rule_gpu_length_clearance')).toBe(true);
  });
});
