import type { HardwareItem } from '../../types';

import type { HardwareVerification } from '../../types/hardwareSources';
export type { HardwareVerification } from '../../types/hardwareSources';

// A manually reviewed specification snapshot, not a live price or benchmark feed.
// Source labels are retained so a reviewer can repeat each field-level check.
const verifiedHardwareFacts: Record<string, HardwareVerification> = {
  'cpu-amd-9800x3d': {
    modelName: 'AMD Ryzen 7 9800X3D',
    sourceTitle: 'AMD Ryzen 7 9800X3D 官方规格',
    sourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验；内存速率为官方标准，不代表 EXPO 超频保证。',
    entityKind: 'reference-product',
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '8 核 / 16 线程', sourceField: '# of CPU Cores / # of Threads', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.7 GHz / 最高 5.2 GHz', sourceField: 'Base Clock / Max. Boost Clock', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '96 MB', sourceField: 'L3 Cache', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '120W 默认 TDP（非实测功耗）', sourceField: 'Default TDP', sourceKind: 'manufacturer', numericValue: 120, unit: 'W', condition: '默认 TDP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5600（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 4nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 120,
    powerSourceField: 'Default TDP',
    zol: {
      productId: '2113342',
      productUrl: 'https://detail.zol.com.cn/cpu/index2113342.shtml',
      parameterUrl: 'https://detail.zol.com.cn/2114/2113342/param.shtml',
      checkedAt: '2026-09-11',
    },
  },
  'cpu-amd-7800x3d': {
    modelName: 'AMD Ryzen 7 7800X3D',
    sourceTitle: 'AMD Ryzen 7 7800X3D 官方规格',
    sourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验；TDP 不等于游戏实测功耗。',
    entityKind: 'reference-product',
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '8 核 / 16 线程', sourceField: '# of CPU Cores / # of Threads', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.2 GHz / 最高 5.0 GHz', sourceField: 'Base Clock / Max. Boost Clock', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '96 MB', sourceField: 'L3 Cache', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '120W 默认 TDP（非实测功耗）', sourceField: 'Default TDP', sourceKind: 'manufacturer', numericValue: 120, unit: 'W', condition: '默认 TDP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5200（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 5nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 120,
    powerSourceField: 'Default TDP',
  },
  'cpu-amd-9950x': {
    modelName: 'AMD Ryzen 9 9950X',
    sourceTitle: 'AMD Ryzen 9 9950X 官方规格',
    sourceUrl: 'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验；最大加速频率不代表全核持续频率。',
    entityKind: 'reference-product',
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '16 核 / 32 线程', sourceField: '# of CPU Cores / # of Threads', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.3 GHz / 最高 5.7 GHz', sourceField: 'Base Clock / Max. Boost Clock', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '64 MB', sourceField: 'L3 Cache', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '170W 默认 TDP（非实测功耗）', sourceField: 'Default TDP', sourceKind: 'manufacturer', numericValue: 170, unit: 'W', condition: '默认 TDP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5600（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 4nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 170,
    powerSourceField: 'Default TDP',
  },
  'gpu-nvidia-rtx5090': {
    modelName: 'NVIDIA GeForce RTX 5090',
    sourceTitle: 'NVIDIA GeForce RTX 5090 官方规格',
    sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验，适用于 Founders Edition / 参考设计；不适用于 5090D 或非公版超频规格。',
    entityKind: 'reference-product',
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '32 GB GDDR7', sourceField: 'Standard Memory Config', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '21760', sourceField: 'NVIDIA CUDA Cores', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '核心加速频率': { fieldId: 'gpu.boostClock', value: '2.41 GHz（参考设计）', sourceField: 'Boost Clock (GHz)', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '575W TGP（参考设计）', sourceField: 'Total Graphics Power (W)', sourceKind: 'manufacturer', numericValue: 575, unit: 'W', condition: '参考设计 TGP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'Tensor 核心': { fieldId: 'gpu.tensorGeneration', value: '第 5 代', sourceField: 'Tensor Cores (AI)', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'AI 算力': { fieldId: 'gpu.aiTops', value: '3352 AI TOPS（厂商标称，不能与不同精度指标直接比较）', sourceField: 'Tensor Cores (AI)', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 575,
    powerSourceField: 'Total Graphics Power (W)',
  },
  'gpu-nvidia-rtx5080': {
    modelName: 'NVIDIA GeForce RTX 5080',
    sourceTitle: 'NVIDIA GeForce RTX 5080 官方规格',
    sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验，适用于 Founders Edition / 参考设计；非公版频率和功耗可能不同。',
    entityKind: 'reference-product',
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '16 GB GDDR7', sourceField: 'Standard Memory Config', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '10752', sourceField: 'NVIDIA CUDA Cores', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '核心加速频率': { fieldId: 'gpu.boostClock', value: '2.62 GHz（参考设计）', sourceField: 'Boost Clock (GHz)', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '360W TGP（参考设计）', sourceField: 'Total Graphics Power (W)', sourceKind: 'manufacturer', numericValue: 360, unit: 'W', condition: '参考设计 TGP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'Tensor 核心': { fieldId: 'gpu.tensorGeneration', value: '第 5 代', sourceField: 'Tensor Cores (AI)', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 360,
    powerSourceField: 'Total Graphics Power (W)',
  },
  'gpu-nvidia-rtx4070super': {
    modelName: 'NVIDIA GeForce RTX 4070 Super',
    sourceTitle: 'NVIDIA GeForce RTX 4070 系列官方规格',
    sourceUrl: 'https://www.nvidia.cn/geforce/graphics-cards/40-series/rtx-4070-family/',
    checkedAt: '2026-09-11',
    scope: '仅以下技术参数已核验，适用于 Founders Edition / 参考设计；不代表非公版散热与物理尺寸。',
    entityKind: 'reference-product',
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '12 GB GDDR6X', sourceField: 'Standard Memory Config', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '显存位宽/带宽': { fieldId: 'gpu.memoryBus', value: '192-bit / 504 GB/s', sourceField: 'Memory Interface Width / Bandwidth', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '7168 (较 4070 增加近 1300 个核心)', sourceField: 'NVIDIA CUDA Cores', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '220W', sourceField: 'Total Graphics Power (W)', sourceKind: 'manufacturer', numericValue: 220, unit: 'W', condition: '参考设计 TGP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 220,
    powerSourceField: 'Total Graphics Power (W)',
  },
  'gpu-colorful-rtx4070s-ultra-w': {
    modelName: '七彩虹 iGame GeForce RTX 4070 SUPER Ultra W OC 12GB',
    sourceTitle: '七彩虹官方 iGame GeForce RTX 4070 SUPER Ultra W OC 规格',
    sourceUrl: 'https://www.colorful.cn/en/home/product?mid=102&id=2088',
    checkedAt: '2026-09-11',
    scope: '已依据七彩虹官方规格表核验非公版物理尺寸、超频频率、供电接口及标称功耗。',
    entityKind: 'partner-variant',
    variantDetails: {
      brandPartner: 'Colorful (七彩虹)',
      modelVariant: 'iGame GeForce RTX 4070 SUPER Ultra W OC 12GB',
      lengthMm: 313.5,
      slotThickness: 2.5,
      powerConnectors: '16-pin (12VHPWR / 12V-2x6)',
    },
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '12 GB GDDR6X', sourceField: '显存规格', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '显存位宽/带宽': { fieldId: 'gpu.memoryBus', value: '192-bit / 504 GB/s', sourceField: '显存位宽', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '7168', sourceField: 'CUDA核心', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '核心加速频率': { fieldId: 'gpu.boostClock', value: '2475 MHz (一键超频 2580 MHz)', sourceField: '核心频率', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '220W (一键超频 245W)', sourceField: 'TGP', sourceKind: 'manufacturer', numericValue: 245, unit: 'W', condition: '一键超频 TGP', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '供电接口': { fieldId: 'gpu.powerConnectors', value: '16-pin (12VHPWR / 12V-2x6)', sourceField: '供电接口', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
      '显卡尺寸': { fieldId: 'gpu.dimensions', value: '313.5 x 118.8 x 50.5 mm (2.5 槽厚度)', sourceField: '产品尺寸', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11', condition: '七彩虹官方标称规格，非公卡专有' },
      '建议电源': { fieldId: 'gpu.recommendedPsu', value: '650W 及以上', sourceField: '建议电源', sourceKind: 'manufacturer', verificationStatus: 'verified', checkedAt: '2026-09-11' },
    },
    tdpWatts: 245,
    powerSourceField: '一键超频 TGP (245W)',
  },
};

export function getHardwareVerification(id: string): HardwareVerification | undefined {
  return Object.prototype.hasOwnProperty.call(verifiedHardwareFacts, id) ? verifiedHardwareFacts[id] : undefined;
}

export function applyVerifiedHardwareFacts(items: HardwareItem[]): HardwareItem[] {
  return items.map(item => {
    const verified = getHardwareVerification(item.id);
    if (!verified || item.name !== verified.modelName) return item;
    const specs = { ...item.specs };
    for (const [field, fact] of Object.entries(verified.fields)) specs[field] = fact.value;
    return { ...item, specs, tdpWatts: verified.tdpWatts };
  });
}
