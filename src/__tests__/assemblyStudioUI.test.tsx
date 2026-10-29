// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { AssemblySimulator3D } from '../components/assembly/AssemblySimulator3D';
import { LanguageProvider } from '../context/LanguageContext';

const controller = vi.hoisted(() => ({ setStep: vi.fn(), setQuality: vi.fn(), setReducedEffects: vi.fn(), setExploded: vi.fn(), dispose: vi.fn(), install: vi.fn() }));
vi.mock('../components/assembly/PCScene3D', () => ({ PCScene3D: class {
  setStep = controller.setStep; setQuality = controller.setQuality; setReducedEffects = controller.setReducedEffects;
  setExploded = controller.setExploded; dispose = controller.dispose; animateInstallStep = controller.install;
  resetCamera() {} setCameraView() {}
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement; let root: Root;
beforeEach(() => { vi.clearAllMocks(); localStorage.setItem('silicon_wiki_lang', 'zh'); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
it('uses glass and reduced effects on the existing nine-step assembly controller', async () => {
  await act(async () => root.render(<LanguageProvider><AssemblySimulator3D /></LanguageProvider>));
  expect(host.querySelector('.assembly-liquid-glass')).toBeTruthy();
  expect(host.querySelectorAll('button[data-step]')).toHaveLength(9);
  await act(async () => host.querySelector<HTMLButtonElement>('[data-step="7"]')!.click());
  expect(controller.setStep).toHaveBeenLastCalledWith(7);
  expect(host.querySelector('[aria-current="step"]')?.getAttribute('data-step')).toBe('7');
  const toggle = host.querySelector<HTMLButtonElement>('[data-action="reduce-effects"]');
  expect(toggle).toBeTruthy();
  await act(async () => toggle!.click());
  expect(controller.setReducedEffects).toHaveBeenLastCalledWith(true);
  expect(controller.setQuality).toHaveBeenLastCalledWith('saver');
  expect(host.querySelector('.assembly-experience')?.classList.contains('assembly-reduced')).toBe(true);
  await act(async () => toggle!.click());
  expect(controller.setQuality).toHaveBeenLastCalledWith('balanced');
  await act(async () => host.querySelector<HTMLButtonElement>('[data-action="install"]')!.click());
  expect(controller.install).toHaveBeenCalledWith(7, expect.any(Function));
});
