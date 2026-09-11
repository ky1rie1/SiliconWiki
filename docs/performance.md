# 3D rendering budget / 渲染开销

Measured on 2026-09-11 using the same headless Edge / SwiftShader environment, 740 × 520 canvas, DPR 1, assembled step 9, after a two-second warmup. Each sample covers three seconds. These are comparative software-renderer measurements, not GPU frame-rate promises.

| Metric | Before | After |
| --- | ---: | ---: |
| Visible mesh objects | 455 | 153 |
| Draw calls per steady-state frame | 475 | 173 |
| Submitted triangles | 76,041 | 76,041 |
| Resident geometry objects | 167 | 104 |
| Repeated assembly pose updates in sample | 33 | 0 |
| Shadow-map updates in sample | 33 | 0 |
| Median CPU render submission | 2.8 ms | 1.6 ms |
| 95th percentile CPU render submission | 3.4 ms | 2.1 ms |

Draw calls decrease by **63.6%** while triangle detail is retained. CPU timings vary by browser and machine; the sample does not measure physical GPU execution time or guarantee a particular FPS.

## What changed

- Opaque static siblings with compatible materials are merged inside their existing assembly group. CPU, RAM, SSD, cooler, fan rotors and connectors keep independent animation transforms. Transparent glass and pickable component boundaries remain separate.
- Static mesh matrices are frozen locally; moving parent groups still update their world transforms.
- Identical assembly poses reuse the prior result. Picking candidates and selection bounds refresh only when necessary.
- Shadow maps update after a geometry/pose/quality change. Tiny moving fan blades do not cast separate animated shadows; the fan housing still does.
- A steady powered scene targets 30 Hz in Balanced mode. Camera interaction and installation animation request immediate frames. Idle, hidden and offscreen scenes stop rendering; pending timers and animation frames are canceled during cleanup.
- Pixel budgets cap framebuffer size on large/high-density displays. Saver: DPR ≤ 1, 450k pixels, no shadows, 20 Hz fan target. Balanced: DPR ≤ 1.5, 900k pixels, cached shadows, 30 Hz. Detailed: DPR ≤ 2, 1.6m pixels, cached shadows, 60 Hz. Actual frame rate can be lower.

## Validation

`assemblyPerformance.test.ts` checks batching bounds, animated parents, dynamic/transparent/instanced exclusions and pixel budgets. Existing `pcModel.test.ts` and `assemblyAnimation.test.ts` cover assembly hierarchy, restoration, fan directions, M.2 placement, cancellation and resource disposal.

For a browser comparison, keep viewport, DPR, camera, quality, step and warmup constant. Inspect `WebGLRenderer.info.render` and CPU submission duration separately; compare steady-state and installation samples separately because moving geometry legitimately refreshes shadows.
