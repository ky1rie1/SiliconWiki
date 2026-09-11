import { describe, expect, it } from 'vitest';
import { cpuList } from '../data/hardware/cpus';
import { gpuList } from '../data/hardware/gpus';
import { applyVerifiedHardwareFacts, getHardwareVerification } from '../data/sources/verifiedHardware';

describe('audited hardware specification overlay', () => {
  it('corrects reference GPU power without treating historical prices or scores as verified', () => {
    const original = { ...gpuList.find(item => item.id === 'gpu-nvidia-rtx5090')!, tdpWatts: 600 };
    const [updated] = applyVerifiedHardwareFacts([original]);
    expect(updated.tdpWatts).toBe(575);
    expect(updated.specs['核心加速频率']).toBe('2.41 GHz（参考设计）');
    expect(updated.marketPriceRange).toBe(original.marketPriceRange);
    expect(updated.benchmarks).toBe(original.benchmarks);
    expect(original.tdpWatts).toBe(600);
  });

  it('distinguishes official two-DIMM memory speed from overclocking recommendations', () => {
    const original = cpuList.find(item => item.id === 'cpu-amd-9800x3d')!;
    const [updated] = applyVerifiedHardwareFacts([original]);
    expect(updated.specs['内存支持']).toBe('DDR5-5600（2×1R / 2×2R）；DDR5-3600（4×1R / 4×2R）');
    expect(getHardwareVerification(original.id)?.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getHardwareVerification(original.id)?.fields['内存支持'].sourceField).toBe('Max Memory Speed');
  });

  it('requires an exact model identity and leaves mixed 4090 / 4090D records unaudited', () => {
    const original = gpuList.find(item => item.id === 'gpu-nvidia-rtx5090')!;
    const variant = { ...original, name: 'NVIDIA GeForce RTX 5090D' };
    expect(applyVerifiedHardwareFacts([variant])[0]).toBe(variant);
    expect(getHardwareVerification('gpu-nvidia-rtx4090')).toBeUndefined();
    expect(getHardwareVerification('toString')).toBeUndefined();
  });
});
