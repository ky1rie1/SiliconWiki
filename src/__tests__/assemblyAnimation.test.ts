import { describe, expect, it } from 'vitest';
import { assemblyFrame, AssemblyTimeline, BOARD_MOUNT, BOARD_BENCH } from '../components/assembly/animation';

describe('assembly poses', () => {
  it('keeps the motherboard flat before case installation and carries the entire board assembly into its mount', () => {
    expect(assemblyFrame(4, 1).boardPosition).toEqual(BOARD_BENCH);
    expect(assemblyFrame(4, 1).boardRotation).toBe(-Math.PI / 2);
    expect(assemblyFrame(5, 1).boardPosition).toEqual(BOARD_MOUNT);
    expect(assemblyFrame(5, 1).boardRotation).toBe(0);
  });
  it('inserts M.2 at an angle before pressing it flat and lowering the shield', () => {
    const start = assemblyFrame(3, 0);
    expect(start.ssdAngle).toBeCloseTo(-Math.PI / 6);
    expect(assemblyFrame(3, .3).ssdAngle).toBeCloseTo(-Math.PI / 6);
    expect(assemblyFrame(3, .7).ssdAngle).toBeCloseTo(0);
    expect(assemblyFrame(3, .7).ssdShieldLift).toBeGreaterThan(0);
    expect(assemblyFrame(3, 1).ssdShieldLift).toBe(0);
  });
  it('does not power fans while installing or while a final replay is incomplete', () => {
    for (let step = 1; step < 9; step++) expect(assemblyFrame(step, 1).powered).toBe(false);
    expect(assemblyFrame(9, .5).powered).toBe(false);
    expect(assemblyFrame(9, 1).powered).toBe(true);
  });
  it('seats parts without offsets and has repeatable final poses', () => {
    for (let step = 1; step <= 9; step++) {
      const frame = assemblyFrame(step, 1);
      for (const offset of [frame.cpuLift, ...frame.ramLift, frame.ssdLift, frame.coolerLift, frame.psuSlide, frame.gpuLift, frame.glassSlide]) expect(offset).toBeCloseTo(0);
      expect(assemblyFrame(step, 5)).toEqual(frame);
    }
  });
});

describe('cancelable animation timeline', () => {
  it('completes exactly once and releases callbacks', () => {
    const timeline = new AssemblyTimeline();
    const calls: string[] = [];
    timeline.start(100, 1000, result => calls.push(result));
    expect(timeline.progress(600)).toBe(.5);
    expect(timeline.progress(1100)).toBe(1);
    timeline.progress(1200);
    expect(calls).toEqual(['completed']);
    expect(timeline.running).toBe(false);
  });
  it('cancels old work before starting another step and never runs stale completion', () => {
    const timeline = new AssemblyTimeline();
    const calls: string[] = [];
    timeline.start(0, 1000, result => calls.push(`old:${result}`));
    timeline.start(400, 1000, result => calls.push(`new:${result}`));
    timeline.cancel();
    timeline.progress(5000);
    expect(calls).toEqual(['old:cancelled', 'new:cancelled']);
  });
});
