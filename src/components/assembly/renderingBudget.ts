export type RenderingQuality = 'balanced' | 'saver' | 'quality';

/** Bound the actual framebuffer, not just DPR, on high-density and large screens. */
export function renderingBudget(quality: RenderingQuality, width: number, height: number, devicePixelRatio: number) {
  const profiles = {
    balanced: { maxDpr: 1.5, maxPixels: 900_000, fanInterval: 1000 / 30, shadows: true },
    saver: { maxDpr: 1, maxPixels: 450_000, fanInterval: 1000 / 20, shadows: false },
    quality: { maxDpr: 2, maxPixels: 1_600_000, fanInterval: 1000 / 60, shadows: true },
  };
  const profile = profiles[quality];
  return {
    pixelRatio: Math.min(Math.max(.1, devicePixelRatio || 1), profile.maxDpr, Math.sqrt(profile.maxPixels / Math.max(1, width * height))),
    fanInterval: profile.fanInterval,
    shadows: profile.shadows,
  };
}
