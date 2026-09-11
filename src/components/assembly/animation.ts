export type Vec3 = [number, number, number];
export const BOARD_MOUNT: Vec3 = [-.55, .4, -.72];
export const BOARD_BENCH: Vec3 = [0, -1.82, 0];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const phase = (t: number, start: number, end: number) => smooth((t - start) / (end - start));
const mix = (a: Vec3, b: Vec3, t: number): Vec3 => a.map((v, i) => v + (b[i] - v) * t) as Vec3;

/** Pure, absolute poses. +Z is the motherboard insertion normal. */
export function assemblyFrame(step: number, progress: number) {
  const t = clamp(progress);
  let boardPosition: Vec3 = step < 5 ? [...BOARD_BENCH] : [...BOARD_MOUNT];
  let boardRotation = step < 5 ? -Math.PI / 2 : 0;
  if (step === 5 && t < 1) {
    const outside: Vec3 = [BOARD_MOUNT[0], BOARD_MOUNT[1], 3.2];
    boardPosition = t < .42
      ? mix([0, -.7, 3.2], outside, phase(t, 0, .42))
      : mix(outside, BOARD_MOUNT, phase(t, .42, 1));
    boardRotation = -Math.PI / 2 * (1 - phase(t, 0, .42));
  }
  return {
    boardPosition, boardRotation,
    cpuLift: step === 1 ? .7 * (1 - phase(t, .22, .7)) : 0,
    cpuLatch: step === 1 ? 1 - phase(t, .72, 1) : 0,
    ramLift: step === 2 ? [.65 * (1 - phase(t, .08, .48)), .65 * (1 - phase(t, .48, .88))] : [0, 0],
    ssdLift: step === 3 ? .18 * (1 - phase(t, 0, .3)) : 0,
    ssdAngle: step === 3 ? -Math.PI / 6 * (1 - phase(t, .32, .68)) : 0,
    ssdShieldLift: step === 3 ? .5 * (1 - phase(t, .72, 1)) : 0,
    coolerLift: step === 4 ? 1.15 * (1 - phase(t, .32, .85)) : 0,
    pasteAmount: step === 4 ? phase(t, 0, .22) : 1,
    pasteSpread: step === 4 ? phase(t, .8, 1) : 1,
    filmPeel: step === 4 ? phase(t, .12, .35) : 1,
    psuSlide: step === 6 ? -1.5 * (1 - phase(t, 0, .6)) : 0,
    powerCableSeat: step === 6 ? phase(t, .6, 1) : 1,
    gpuLift: step === 7 ? .85 * (1 - phase(t, .12, .78)) : 0,
    gpuCableSeat: step === 7 ? phase(t, .78, 1) : 1,
    cableSeat: step === 8 ? phase(t, .05, .95) : 1,
    glassSlide: step === 9 ? .9 * (1 - phase(t, 0, .55)) : 0,
    powered: step === 9 && t >= .72,
    postProgress: step === 9 ? clamp((t - .72) / .28) : 0,
  };
}

export type AnimationResult = 'completed' | 'cancelled';

/** One owner for completion and cancellation; no per-mesh timers. */
export class AssemblyTimeline {
  private startedAt = 0;
  private duration = 0;
  private callback?: (result: AnimationResult) => void;
  running = false;

  start(now: number, duration: number, callback?: (result: AnimationResult) => void) {
    this.cancel();
    this.startedAt = now;
    this.duration = Math.max(1, duration);
    this.callback = callback;
    this.running = true;
  }

  progress(now: number) {
    if (!this.running) return 1;
    const t = clamp((now - this.startedAt) / this.duration);
    if (t === 1) this.finish('completed');
    return t;
  }

  cancel() { if (this.running) this.finish('cancelled'); }

  private finish(result: AnimationResult) {
    const callback = this.callback;
    this.running = false;
    this.callback = undefined;
    callback?.(result);
  }
}
