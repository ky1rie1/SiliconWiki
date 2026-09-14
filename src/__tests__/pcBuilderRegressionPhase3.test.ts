import { describe, it, expect } from 'vitest';
import {
  extractMotherboardSocket,
  extractMotherboardRamSupport,
  extractRamSpecs,
  extractPsuSpecs,
  extractCaseClearance,
  extractDisplayOutputInfo,
  parseGpuPowerConnectors,
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
  generateBuildPlainText,
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

describe('Phase 3 Regression: Extended Verification Suites', () => {
  it('Rule 3: returns unknown when CPU RAM support is unknown but MB support is known', () => {
    const build: CustomBuild = {
      schemaVersion: 1,
      id: 'b-ram-cpu-unknown',
      title: 'RAM CPU Unknown',
      targetBudget: null,
      createdAt: '',
      updatedAt: '',
      slots: [
        { slotId: 's1', type: 'cpu', hardwareId: 'cpu-vague-ram', userPrice: null, quantity: 1 },
        { slotId: 's2', type: 'motherboard', hardwareId: 'mb-ddr5', userPrice: null, quantity: 1 },
        { slotId: 's3', type: 'ram', hardwareId: 'ram-ddr5', userPrice: null, quantity: 1 },
      ],
    };
    const catalog = [
      { id: 'cpu-vague-ram', category: 'cpu', specs: {} } as unknown as HardwareItem, // no RAM spec & no socket
      { id: 'mb-ddr5', category: 'motherboard', specs: { 'motherboard.socket': 'AM5', 'motherboard.ram': 'DDR5' } } as unknown as HardwareItem,
      { id: 'ram-ddr5', category: 'ram', specs: { 'ram.frequency': 'DDR5' } } as unknown as HardwareItem,
    ];
    const report = checkBuildCompatibility(build, catalog);
    const rule3 = report.rules.find((r) => r.ruleId === 'rule_ram_type_match');
    expect(rule3).toBeDefined();
    expect(rule3?.status).toBe('unknown');
    expect(rule3?.message).toMatch(/配件库未记录该 CPU 的内存代际支持规格/);
  });

  describe('GPU Power Connectors & Multipliers', () => {
    it('correctly parses "8-pin × 3" and "8-pin * 3" without collapsing into 1', () => {
      const res1 = parseGpuPowerConnectors('8-pin × 3');
      expect(res1?.count8Pin).toBe(3);
      expect(res1?.count6Pin).toBe(0);
      expect(res1?.count16Pin).toBe(0);

      const res2 = parseGpuPowerConnectors('3 x 8-pin');
      expect(res2?.count8Pin).toBe(3);

      const res3 = parseGpuPowerConnectors('8-pin + 8-pin + 8-pin');
      expect(res3?.count8Pin).toBe(3);
    });

    it('correctly parses "6-pin + 6-pin" and "2 x 6-pin" without collapsing into 1', () => {
      const res1 = parseGpuPowerConnectors('6-pin + 6-pin');
      expect(res1?.count6Pin).toBe(2);
      expect(res1?.count8Pin).toBe(0);

      const res2 = parseGpuPowerConnectors('2 x 6-pin');
      expect(res2?.count6Pin).toBe(2);
    });

    it('flags unparseable connector text as isUnparseable', () => {
      const res = parseGpuPowerConnectors('待核实');
      expect(res?.isUnparseable).toBe(true);
      expect(res?.count8Pin).toBe(0);
      expect(res?.count6Pin).toBe(0);
      expect(res?.count16Pin).toBe(0);
    });

    it('identifies slot-power-only GPUs and Rule 9 evaluates to pass without PSU PCIe ports', () => {
      const res = parseGpuPowerConnectors('PCIe 插槽直接供电 (无需外接供电)');
      expect(res?.isSlotPowerOnly).toBe(true);

      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-slot-power',
        title: 'Slot Power Only',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-gt1030', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'psu', hardwareId: 'psu-basic', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        { id: 'gpu-gt1030', category: 'gpu', specs: { '供电接口': '无需外接电源' } } as unknown as HardwareItem,
        { id: 'psu-basic', category: 'psu', specs: { '额定功率': '300W', '显卡原生接口': '无独立供电线' } } as unknown as HardwareItem,
      ];
      const report = checkBuildCompatibility(build, catalog);
      const rule9 = report.rules.find((r) => r.ruleId === 'rule_gpu_power_connectors');
      expect(rule9?.status).toBe('pass');
      expect(rule9?.message).toMatch(/无需从电源引出独立供电线/);
    });

    it('16-pin GPU on PSU without native 16-pin returns unknown, not asserting drivability', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-16pin',
        title: '16-Pin Adapter',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-4080', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'psu', hardwareId: 'psu-old-8pin', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        { id: 'gpu-4080', category: 'gpu', specs: { '供电接口': '16-pin (12VHPWR)' } } as unknown as HardwareItem,
        { id: 'psu-old-8pin', category: 'psu', specs: { '额定功率': '850W', '显卡原生接口': 'PCIe 8-pin x 4' } } as unknown as HardwareItem,
      ];
      const report = checkBuildCompatibility(build, catalog);
      const rule9 = report.rules.find((r) => r.ruleId === 'rule_gpu_power_connectors');
      expect(rule9?.status).toBe('unknown');
      expect(rule9?.message).toMatch(/未确认具体转接方案前/);
    });
  });

  describe('Conditional Dimensions & Radiator Extraction', () => {
    it('handles 330/380mm multi-condition limits: 350mm GPU evaluates to unknown, not hard error', () => {
      const caseItem: Partial<HardwareItem> = {
        id: 'case-conditional',
        category: 'case',
        specs: { '显卡限长': '前置安装水冷时限长 330mm，无前置水冷 380mm' },
      };

      const build350: CustomBuild = {
        schemaVersion: 1,
        id: 'b-350',
        title: '350mm GPU',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-350', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'case', hardwareId: 'case-conditional', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        caseItem as HardwareItem,
        { id: 'gpu-350', category: 'gpu', specs: { '尺寸': '350mm x 140mm' } } as unknown as HardwareItem,
        { id: 'gpu-390', category: 'gpu', specs: { '尺寸': '390mm x 140mm' } } as unknown as HardwareItem,
        { id: 'gpu-320', category: 'gpu', specs: { '尺寸': '320mm x 140mm' } } as unknown as HardwareItem,
      ];

      const report350 = checkBuildCompatibility(build350, catalog);
      const rule7_350 = report350.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
      expect(rule7_350?.status).toBe('unknown');
      expect(rule7_350?.message).toMatch(/需待核实实物安装条件/);

      // 390mm > 380mm -> error
      const build390: CustomBuild = {
        ...build350,
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-390', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'case', hardwareId: 'case-conditional', userPrice: null, quantity: 1 },
        ],
      };
      const report390 = checkBuildCompatibility(build390, catalog);
      const rule7_390 = report390.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
      expect(rule7_390?.status).toBe('error');

      // 300mm <= 330mm with >15mm margin -> pass
      const build300: CustomBuild = {
        ...build350,
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-300', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'case', hardwareId: 'case-conditional', userPrice: null, quantity: 1 },
        ],
      };
      const report300 = checkBuildCompatibility(build300, [
        caseItem as HardwareItem,
        { id: 'gpu-300', category: 'gpu', specs: { '尺寸': '300mm x 140mm' } } as unknown as HardwareItem,
      ]);
      const rule7_300 = report300.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
      expect(rule7_300?.status).toBe('pass');

      // 320mm <= 330mm but clearance < 15mm -> warning
      const build320: CustomBuild = {
        ...build350,
        slots: [
          { slotId: 's1', type: 'gpu', hardwareId: 'gpu-320', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'case', hardwareId: 'case-conditional', userPrice: null, quantity: 1 },
        ],
      };
      const report320 = checkBuildCompatibility(build320, [
        caseItem as HardwareItem,
        { id: 'gpu-320', category: 'gpu', specs: { '尺寸': '320mm x 140mm' } } as unknown as HardwareItem,
      ]);
      const rule7_320 = report320.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
      expect(rule7_320?.status).toBe('warning');
    });

    it('extracts all radiator sizes in each position clause into array', () => {
      const caseItem: Partial<HardwareItem> = {
        id: 'case-rads',
        category: 'case',
        specs: { '冷排支持': '顶部支持 240/280/360mm，前置支持 240/280/360/420mm' },
      };
      const res = extractCaseClearance(caseItem as HardwareItem);
      expect(res.value?.radiatorPositions).toBeDefined();
      const topPos = res.value?.radiatorPositions?.find((p) => p.position === 'top');
      expect(topPos?.sizesMm).toEqual(expect.arrayContaining([240, 280, 360]));
      const frontPos = res.value?.radiatorPositions?.find((p) => p.position === 'front');
      expect(frontPos?.sizesMm).toEqual(expect.arrayContaining([240, 280, 360, 420]));
    });
  });

  describe('Import Raw Value Validation', () => {
    it('rejects URL parameter exceeding 2048 characters before decode', () => {
      const hugeParam = 'a'.repeat(2049);
      expect(deserializeBuildFromUrl(hugeParam)).toBeNull();
    });

    it('rejects string "false" for isExplicitZeroPrice', () => {
      const rawBuild = {
        schemaVersion: 1,
        title: 'String False Test',
        slots: [
          {
            slotId: 's1',
            type: 'cpu',
            hardwareId: null,
            quantity: 1,
            userPrice: 1000,
            isExplicitZeroPrice: 'false', // invalid type!
          },
        ],
      };
      const res = validateCustomBuild(rawBuild);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/isExplicitZeroPrice 必须为布尔值/);
    });

    it('rejects negative userPrice in validateCustomBuild', () => {
      const rawBuild = {
        schemaVersion: 1,
        title: 'Negative Price Test',
        slots: [
          {
            slotId: 's1',
            type: 'cpu',
            hardwareId: null,
            quantity: 1,
            userPrice: -500,
          },
        ],
      };
      const res = validateCustomBuild(rawBuild);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/自定义价格必须为非负数值/);
    });

    it('rejects string quantity in validateCustomBuild', () => {
      const rawBuild = {
        schemaVersion: 1,
        title: 'String Qty Test',
        slots: [
          {
            slotId: 's1',
            type: 'ram',
            hardwareId: null,
            quantity: '2', // string, not integer!
          },
        ],
      };
      const res = validateCustomBuild(rawBuild);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/数量必须为正整数/);
    });
  });

  describe('Plain Text BOM Hardware Resolution', () => {
    it('outputs real hardware model name even when user custom price is set', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-bom',
        title: 'BOM Model Test',
        targetBudget: 10000,
        createdAt: '',
        updatedAt: '',
        slots: [
          {
            slotId: 's1',
            type: 'cpu',
            hardwareId: 'amd-r7-7800x3d',
            userPrice: 2399, // user custom price!
            quantity: 1,
          },
        ],
      };
      const catalog: HardwareItem[] = [
        {
          id: 'amd-r7-7800x3d',
          name: 'AMD Ryzen 7 7800X3D',
          brand: 'AMD',
          category: 'cpu',
          series: 'Ryzen 7000',
          marketPriceRange: [2400, 2600],
          highlights: [],
          specs: {},
        } as unknown as HardwareItem,
      ];
      const plainText = generateBuildPlainText(build, catalog, 'zh');
      // Must contain real model name!
      expect(plainText).toContain('AMD Ryzen 7 7800X3D');
      expect(plainText).not.toContain('未选配件');
      expect(plainText).toContain('￥2399 (自选报价)');
    });
  });

  describe('Power Calculation & Evidence Copy', () => {
    it('does not parse range wattage "650–750 W" as a single recommendation or 650750W', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-pwr-range',
        title: 'Range Wattage Test',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'gpu', hardwareId: 'gpu-range-spec', userPrice: null, quantity: 1 },
          { slotId: 's3', type: 'psu', hardwareId: 'psu-1', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        { id: 'cpu-1', category: 'cpu', tdpWatts: 120, specs: {} } as unknown as HardwareItem,
        {
          id: 'gpu-range-spec',
          category: 'gpu',
          tdpWatts: 250,
          specifications: [
            {
              id: 'gpu.recommendedPsu',
              label: '建议电源',
              value: '650–750 W', // range string!
              verificationStatus: 'verified',
              sourceKind: 'manufacturer',
            },
          ],
        } as unknown as HardwareRecord,
        { id: 'psu-1', category: 'psu', specs: { '额定功率': '650W' } } as unknown as HardwareItem,
      ];
      const power = calculateBuildPower(build, catalog);
      // manufacturerPsuRecommendationWatts must NOT be 650750! It must be null.
      expect(power.manufacturerPsuRecommendationWatts).toBeNull();
    });

    it('does not fall back to editorial cons/pairingAdvice for official recommendation', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-pwr-cons',
        title: 'Cons Fallback Test',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'gpu', hardwareId: 'gpu-cons', userPrice: null, quantity: 1 },
          { slotId: 's3', type: 'psu', hardwareId: 'psu-1', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        { id: 'cpu-1', category: 'cpu', tdpWatts: 100, specs: {} } as unknown as HardwareItem,
        {
          id: 'gpu-cons',
          category: 'gpu',
          tdpWatts: 200,
          cons: ['建议系统电源 850W'], // editorial text!
          pairingAdvice: '建议系统电源 850W',
          specs: {},
        } as unknown as HardwareItem,
        { id: 'psu-1', category: 'psu', specs: { '额定功率': '650W' } } as unknown as HardwareItem,
      ];
      const power = calculateBuildPower(build, catalog);
      expect(power.manufacturerPsuRecommendationWatts).toBeNull();
    });

    it('power notes do not contain unevidenced marketing claims', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-copy',
        title: 'Copy Clean Test',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-1', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'gpu', hardwareId: 'gpu-1', userPrice: null, quantity: 1 },
          { slotId: 's3', type: 'psu', hardwareId: 'psu-1', userPrice: null, quantity: 1 },
        ],
      };
      const catalog = [
        { id: 'cpu-1', category: 'cpu', tdpWatts: 65, specs: {} } as unknown as HardwareItem,
        { id: 'gpu-1', category: 'gpu', tdpWatts: 150, specs: {} } as unknown as HardwareItem,
        { id: 'psu-1', category: 'psu', specs: { '额定功率': '850W' } } as unknown as HardwareItem,
      ];
      const power = calculateBuildPower(build, catalog);
      const allNotes = power.notes.join(' ');
      expect(allNotes).not.toContain('黄金能效区间');
      expect(allNotes).not.toContain('极大概率断电');
    });
  });

  describe('Sandbox Replacement Delta Pricing', () => {
    it('calculates replacement price delta considering slot quantity, user price, and market range', () => {
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-repl-price',
        title: 'Repl Price Test',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-am5', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'motherboard', hardwareId: 'mb-lga1700', userPrice: 1500, quantity: 1 }, // user price 1500
        ],
      };
      const catalog: HardwareItem[] = [
        { id: 'cpu-am5', name: 'AM5 CPU', brand: 'AMD', category: 'cpu', series: '', marketPriceRange: [2000, 2000], highlights: [], specs: { 'cpu.socket': 'AM5' } } as unknown as HardwareItem,
        { id: 'mb-lga1700', name: 'LGA1700 MB', brand: 'MSI', category: 'motherboard', series: '', marketPriceRange: [1200, 1400], highlights: [], specs: { 'motherboard.socket': 'LGA1700' } } as unknown as HardwareItem,
        { id: 'mb-am5-range', name: 'AM5 MB Range', brand: 'ASUS', category: 'motherboard', series: '', marketPriceRange: [1800, 2100], highlights: [], specs: { 'motherboard.socket': 'AM5' } } as unknown as HardwareItem,
      ];

      const report = checkBuildCompatibility(build, catalog);
      const socketError = report.rules.find((r) => r.ruleId === 'rule_socket_match');
      expect(socketError).toBeDefined();

      const candidates = findCompatibleReplacements(socketError!, build, catalog);
      const cand = candidates.find((c) => c.item.id === 'mb-am5-range');
      expect(cand).toBeDefined();
      // Candidate market range: [1800, 2100]. Current user price: 1500.
      // Delta min = 1800 - 1500 = 300. Delta max = 2100 - 1500 = 600.
      expect(cand?.deltaPriceMin).toBe(300);
      expect(cand?.deltaPriceMax).toBe(600);
      expect(cand?.deltaPrice).toBeNull(); // range, not single number
    });
  });

  describe('Phase 3 Closure: Rigorous Power Verification & Radiator-Coupled Clearance', () => {
    const baseGpuSpecs = (sourceKind: 'manufacturer' | 'product-database', verificationStatus: 'verified' | 'unverified'): HardwareRecord => ({
      schemaVersion: 1,
      entityKind: 'reference-product',
      identity: {
        id: 'gpu-power-test',
        name: 'Test GPU',
        brand: 'NVIDIA',
        category: 'gpu',
        series: 'RTX 40',
        releaseYear: 2024,
        platform: 'desktop',
      },
      specifications: [
        {
          id: 'gpu.recommendedPsu',
          label: '建议系统供电',
          value: '750W',
          numericValue: 750,
          unit: 'W',
          evidence: sourceKind === 'manufacturer' && verificationStatus === 'verified' ? 'manufacturer-checked' : 'editorial-reference',
          sourceKind,
          verificationStatus,
          condition: '搭配标准系统平台',
        },
      ],
      power: { watts: 250, isKnown: true, evidence: 'editorial-reference', meaning: 'TGP' },
      auditSummary: {
        entityKind: 'reference-product',
        verifiedFieldCount: 1,
        verifiedCoreCount: 1,
        coreFieldTotal: 5,
        verificationRate: 0.2,
        hasOfficialSource: sourceKind === 'manufacturer',
        lastCheckedAt: null,
        missingCoreFields: [],
      },
      sources: sourceKind === 'manufacturer' ? [{ id: 'src-mfg', title: 'Official', url: 'https://nvidia.com', kind: 'manufacturer', checkedAt: '2024-01-01' }] : [],
    } as unknown as HardwareRecord);

    it('Item 1.1: manufacturer + verified 正向 -> 进入显卡厂商官方建议电源', () => {
      const gpuRec = baseGpuSpecs('manufacturer', 'verified');
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-psu-mfg-v',
        title: '',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [{ slotId: 's1', type: 'gpu', hardwareId: 'gpu-power-test', userPrice: null, quantity: 1 }],
      };
      const est = calculateBuildPower(build, [gpuRec]);
      expect(est.manufacturerPsuRecommendationWatts).toBe(750);
      expect(est.manufacturerPsuSource?.sourceKind).toBe('manufacturer');
    });

    it('Item 1.2: manufacturer + unverified 反向 -> 不得显示成厂商官方建议，进入参考说明', () => {
      const gpuRec = baseGpuSpecs('manufacturer', 'unverified');
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-psu-mfg-u',
        title: '',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [{ slotId: 's1', type: 'gpu', hardwareId: 'gpu-power-test', userPrice: null, quantity: 1 }],
      };
      const est = calculateBuildPower(build, [gpuRec]);
      expect(est.manufacturerPsuRecommendationWatts).toBeNull();
      expect(est.notes.some((n) => n.includes('非显卡厂商官方核验建议'))).toBe(true);
    });

    it('Item 1.3: product-database + verified 反向 -> 第三方不可显示为厂商官方建议', () => {
      const gpuRec = baseGpuSpecs('product-database', 'verified');
      const build: CustomBuild = {
        schemaVersion: 1,
        id: 'b-psu-pdb-v',
        title: '',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [{ slotId: 's1', type: 'gpu', hardwareId: 'gpu-power-test', userPrice: null, quantity: 1 }],
      };
      const est = calculateBuildPower(build, [gpuRec]);
      expect(est.manufacturerPsuRecommendationWatts).toBeNull();
      expect(est.notes.some((n) => n.includes('非显卡厂商官方核验建议'))).toBe(true);
    });

    it('Item 2: 区分确定证据的容量不足 (error) 与经验估算风险 (warning)', () => {
      // 场景 A: 确定证据容量不足（标称基础之和已超过电源额定）
      // CPU 150W + GPU 300W = 450W > 400W 电源
      const cpu150 = { id: 'cpu-150', category: 'cpu', tdpWatts: 150, specs: {} } as unknown as HardwareItem;
      const gpu300 = { id: 'gpu-300w', category: 'gpu', tdpWatts: 300, specs: {} } as unknown as HardwareItem;
      const psu400 = { id: 'psu-400', category: 'psu', tdpWatts: 400, specs: { '额定功率': '400W' } } as unknown as HardwareItem;

      const buildA: CustomBuild = {
        schemaVersion: 1,
        id: 'b-cap-err',
        title: '',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-150', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'gpu', hardwareId: 'gpu-300w', userPrice: null, quantity: 1 },
          { slotId: 's3', type: 'psu', hardwareId: 'psu-400', userPrice: null, quantity: 1 },
        ],
      };
      const estA = calculateBuildPower(buildA, [cpu150, gpu300, psu400]);
      expect(estA.status).toBe('error');
      const repA = checkBuildCompatibility(buildA, [cpu150, gpu300, psu400]);
      const ruleA = repA.rules.find((r) => r.ruleId === 'rule_psu_capacity');
      expect(ruleA?.status).toBe('error');
      expect(ruleA?.title).toContain('电源额定功率低于配件标称功耗');

      // 场景 B: 经验估算风险（高于标称基础 265W，但低于经验预估峰值 355W）
      // CPU 65W + GPU 200W = 265W <= 300W 电源，峰值估算 355W > 300W
      const cpu65 = { id: 'cpu-65', category: 'cpu', tdpWatts: 65, specs: {} } as unknown as HardwareItem;
      const gpu200 = { id: 'gpu-200', category: 'gpu', tdpWatts: 200, specs: {} } as unknown as HardwareItem;
      const psu300 = { id: 'psu-300', category: 'psu', tdpWatts: 300, specs: { '额定功率': '300W' } } as unknown as HardwareItem;

      const buildB: CustomBuild = {
        schemaVersion: 1,
        id: 'b-emp-warn',
        title: '',
        targetBudget: null,
        createdAt: '',
        updatedAt: '',
        slots: [
          { slotId: 's1', type: 'cpu', hardwareId: 'cpu-65', userPrice: null, quantity: 1 },
          { slotId: 's2', type: 'gpu', hardwareId: 'gpu-200', userPrice: null, quantity: 1 },
          { slotId: 's3', type: 'psu', hardwareId: 'psu-300', userPrice: null, quantity: 1 },
        ],
      };
      const estB = calculateBuildPower(buildB, [cpu65, gpu200, psu300]);
      expect(estB.status).toBe('warning'); // NOT error!
      const repB = checkBuildCompatibility(buildB, [cpu65, gpu200, psu300]);
      const ruleB = repB.rules.find((r) => r.ruleId === 'rule_psu_capacity');
      expect(ruleB?.status).toBe('warning'); // NOT error!
      expect(ruleB?.title).toContain('电源额定功率低于经验预估峰值负载');
    });

    describe('Item 3: 打通冷排安装位置与显卡条件限长', () => {
      // 机箱设定：顶部仅 240，前置支持 360；无前置冷排 380mm，前置冷排 330mm
      const caseTop240Front360 = {
        id: 'case-top240-front360',
        name: '前置360机箱',
        category: 'case',
        specs: {
          '冷排支持': '顶部最大支持 240mm 冷排，前置最大支持 360mm 冷排',
          '显卡限长': '前置冷排 330mm，无前置冷排 380mm',
        },
      } as unknown as HardwareItem;

      const cooler360 = {
        id: 'cooler-aio-360',
        name: '360 一体式水冷',
        category: 'cooler',
        specs: {
          'cooler.type': '水冷',
          'cooler.radiator': '360mm',
        },
      } as unknown as HardwareItem;

      const gpu350 = {
        id: 'gpu-350mm',
        name: '350mm 显卡',
        category: 'gpu',
        specs: {
          '尺寸': '350mm x 140mm x 60mm',
        },
      } as unknown as HardwareItem;

      const gpu300 = {
        id: 'gpu-300mm',
        name: '300mm 显卡',
        category: 'gpu',
        specs: {
          '尺寸': '300mm x 120mm x 45mm',
        },
      } as unknown as HardwareItem;

      it('3.1 强制前置场景：360水冷只能前置，显卡350mm超过330mm限长返回 error', () => {
        const build: CustomBuild = {
          schemaVersion: 1,
          id: 'b-forced-front-err',
          title: '',
          targetBudget: null,
          createdAt: '',
          updatedAt: '',
          slots: [
            { slotId: 's1', type: 'cooler', hardwareId: 'cooler-aio-360', userPrice: null, quantity: 1 },
            { slotId: 's2', type: 'gpu', hardwareId: 'gpu-350mm', userPrice: null, quantity: 1 },
            { slotId: 's3', type: 'case', hardwareId: 'case-top240-front360', userPrice: null, quantity: 1 },
          ],
        };

        const report = checkBuildCompatibility(build, [caseTop240Front360, cooler360, gpu350]);

        // Rule 8 确定为前置安装
        const rule8 = report.rules.find((r) => r.ruleId === 'rule_cooler_clearance');
        expect(rule8?.status).toBe('pass');
        expect(rule8?.condition).toBe('水冷排前置安装');
        expect(rule8?.title).toContain('仅支持前置');

        // Rule 7 共享已确定的“前置冷排”条件，使用 330mm 进行判断，350mm 超长返回 error！
        const rule7 = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
        expect(rule7?.status).toBe('error');
        expect(rule7?.condition).toBe('水冷排前置安装');
        expect(rule7?.title).toContain('前置冷排占用显卡空间导致超长干涉');
      });

      it('3.2 强制前置场景：360水冷只能前置，显卡300mm满足330mm限长返回 pass', () => {
        const build: CustomBuild = {
          schemaVersion: 1,
          id: 'b-forced-front-pass',
          title: '',
          targetBudget: null,
          createdAt: '',
          updatedAt: '',
          slots: [
            { slotId: 's1', type: 'cooler', hardwareId: 'cooler-aio-360', userPrice: null, quantity: 1 },
            { slotId: 's2', type: 'gpu', hardwareId: 'gpu-300mm', userPrice: null, quantity: 1 },
            { slotId: 's3', type: 'case', hardwareId: 'case-top240-front360', userPrice: null, quantity: 1 },
          ],
        };

        const report = checkBuildCompatibility(build, [caseTop240Front360, cooler360, gpu300]);
        const rule7 = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
        expect(rule7?.status).toBe('pass');
        expect(rule7?.condition).toBe('水冷排前置安装');
      });

      it('3.3 顶部可装 360 场景：不影响前置显卡限长，350mm 显卡满足 380mm 返回 pass', () => {
        // 机箱顶部支持 360，前置不支持 360（仅 240）
        const caseTop360Front240 = {
          id: 'case-top360-front240',
          name: '顶置360机箱',
          category: 'case',
          specs: {
            '冷排支持': '顶部支持 240/360mm 冷排，前置支持 240mm 冷排',
            '显卡限长': '前置冷排 330mm，无前置冷排 380mm',
          },
        } as unknown as HardwareItem;

        const build: CustomBuild = {
          schemaVersion: 1,
          id: 'b-top360-pass',
          title: '',
          targetBudget: null,
          createdAt: '',
          updatedAt: '',
          slots: [
            { slotId: 's1', type: 'cooler', hardwareId: 'cooler-aio-360', userPrice: null, quantity: 1 },
            { slotId: 's2', type: 'gpu', hardwareId: 'gpu-350mm', userPrice: null, quantity: 1 },
            { slotId: 's3', type: 'case', hardwareId: 'case-top360-front240', userPrice: null, quantity: 1 },
          ],
        };

        const report = checkBuildCompatibility(build, [caseTop360Front240, cooler360, gpu350]);
        const rule8 = report.rules.find((r) => r.ruleId === 'rule_cooler_clearance');
        expect(rule8?.condition).toBe('水冷排顶置安装');

        const rule7 = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
        expect(rule7?.status).toBe('pass');
        expect(rule7?.condition).toBe('水冷排顶置安装');
        expect(rule7?.title).toContain('冷排顶置不占前置进深');
      });

      it('3.4 多个安装位均可选场景：顶部与前置均支持 360，350mm 显卡保留 unknown 与条件提示', () => {
        // 顶部与前置均支持 360
        const caseDual360 = {
          id: 'case-dual360',
          name: '全能360机箱',
          category: 'case',
          specs: {
            '冷排支持': '顶部支持 240/360mm 冷排，前置支持 240/360mm 冷排',
            '显卡限长': '前置冷排 330mm，无前置冷排 380mm',
          },
        } as unknown as HardwareItem;

        const build: CustomBuild = {
          schemaVersion: 1,
          id: 'b-dual360-unknown',
          title: '',
          targetBudget: null,
          createdAt: '',
          updatedAt: '',
          slots: [
            { slotId: 's1', type: 'cooler', hardwareId: 'cooler-aio-360', userPrice: null, quantity: 1 },
            { slotId: 's2', type: 'gpu', hardwareId: 'gpu-350mm', userPrice: null, quantity: 1 },
            { slotId: 's3', type: 'case', hardwareId: 'case-dual360', userPrice: null, quantity: 1 },
          ],
        };

        const report = checkBuildCompatibility(build, [caseDual360, cooler360, gpu350]);
        const rule7 = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
        expect(rule7?.status).toBe('unknown');
        expect(rule7?.title).toContain('显卡限长取决于水冷排安装位置');
        expect(rule7?.condition).toContain('需选择顶置水冷排以避开显卡干涉');
      });

      it('3.5 风冷散热场景：前置未安装水冷排，享受无前置冷排 380mm 限长，350mm 显卡返回 pass', () => {
        const airCooler = {
          id: 'cooler-air',
          name: '双塔风冷',
          category: 'cooler',
          specs: {
            'cooler.type': '风冷',
            'cooler.height': '155mm',
          },
        } as unknown as HardwareItem;

        const build: CustomBuild = {
          schemaVersion: 1,
          id: 'b-air-pass',
          title: '',
          targetBudget: null,
          createdAt: '',
          updatedAt: '',
          slots: [
            { slotId: 's1', type: 'cooler', hardwareId: 'cooler-air', userPrice: null, quantity: 1 },
            { slotId: 's2', type: 'gpu', hardwareId: 'gpu-350mm', userPrice: null, quantity: 1 },
            { slotId: 's3', type: 'case', hardwareId: 'case-top240-front360', userPrice: null, quantity: 1 },
          ],
        };

        const report = checkBuildCompatibility(build, [caseTop240Front360, airCooler, gpu350]);
        const rule7 = report.rules.find((r) => r.ruleId === 'rule_gpu_length_clearance');
        expect(rule7?.status).toBe('pass');
        expect(rule7?.condition).toBe('未安装前置冷排');
      });
    });
  });
});


