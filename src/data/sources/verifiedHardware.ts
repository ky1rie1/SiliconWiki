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
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '8 核 / 16 线程', sourceField: '# of CPU Cores / # of Threads' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.7 GHz / 最高 5.2 GHz', sourceField: 'Base Clock / Max. Boost Clock' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '96 MB', sourceField: 'L3 Cache' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '120W 默认 TDP（非实测功耗）', sourceField: 'Default TDP' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5600（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 4nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die' },
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
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '8 核 / 16 线程', sourceField: '# of CPU Cores / # of Threads' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.2 GHz / 最高 5.0 GHz', sourceField: 'Base Clock / Max. Boost Clock' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '96 MB', sourceField: 'L3 Cache' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '120W 默认 TDP（非实测功耗）', sourceField: 'Default TDP' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5200（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 5nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die' },
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
    fields: {
      '核心/线程': { fieldId: 'cpu.coresThreads', value: '16 核 / 32 线程', sourceField: '# of CPU Cores / # of Threads' },
      '基础/加速频率': { fieldId: 'cpu.clocks', value: '4.3 GHz / 最高 5.7 GHz', sourceField: 'Base Clock / Max. Boost Clock' },
      '三级缓存 (L3)': { fieldId: 'cpu.l3Cache', value: '64 MB', sourceField: 'L3 Cache' },
      '基础功耗 / 最大睿频功耗': { fieldId: 'cpu.defaultTdp', value: '170W 默认 TDP（非实测功耗）', sourceField: 'Default TDP' },
      '插槽接口': { fieldId: 'cpu.socket', value: 'AM5', sourceField: 'CPU Socket' },
      '内存支持': { fieldId: 'memory.support', value: 'DDR5-5600（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）', sourceField: 'Max Memory Speed' },
      '制程工艺': { fieldId: 'cpu.process', value: 'CPU 核心 TSMC 4nm FinFET；I/O Die TSMC 6nm FinFET', sourceField: 'Processor Technology for CPU Cores / Processor Technology for I/O Die' },
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
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '32 GB GDDR7', sourceField: 'Standard Memory Config' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '21760', sourceField: 'NVIDIA CUDA Cores' },
      '核心加速频率': { fieldId: 'gpu.boostClock', value: '2.41 GHz（参考设计）', sourceField: 'Boost Clock (GHz)' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '575W TGP（参考设计）', sourceField: 'Total Graphics Power (W)' },
      'Tensor 核心': { fieldId: 'gpu.tensorGeneration', value: '第 5 代', sourceField: 'Tensor Cores (AI)' },
      'AI 算力': { fieldId: 'gpu.aiTops', value: '3352 AI TOPS（厂商标称，不能与不同精度指标直接比较）', sourceField: 'Tensor Cores (AI)' },
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
    fields: {
      '显存容量/类型': { fieldId: 'gpu.memory', value: '16 GB GDDR7', sourceField: 'Standard Memory Config' },
      'CUDA 核心数': { fieldId: 'gpu.cudaCores', value: '10752', sourceField: 'NVIDIA CUDA Cores' },
      '核心加速频率': { fieldId: 'gpu.boostClock', value: '2.62 GHz（参考设计）', sourceField: 'Boost Clock (GHz)' },
      '整卡功耗 (TGP/TBP)': { fieldId: 'gpu.tgp', value: '360W TGP（参考设计）', sourceField: 'Total Graphics Power (W)' },
      'Tensor 核心': { fieldId: 'gpu.tensorGeneration', value: '第 5 代', sourceField: 'Tensor Cores (AI)' },
    },
    tdpWatts: 360,
    powerSourceField: 'Total Graphics Power (W)',
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
