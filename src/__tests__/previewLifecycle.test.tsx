// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PrototypeCanvas } from '../components/lab/PrototypeCanvas';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const sceneMock = vi.hoisted(() => ({ fail: true, onFailure: () => {}, dispose: vi.fn(), setView: vi.fn(), constructed: vi.fn() }));
vi.mock('../components/lab/PrototypeScene', () => ({ PrototypeScene: class {
  constructor(_host: HTMLElement, onFailure: () => void) { sceneMock.constructed(); if (sceneMock.fail) throw new Error('WebGL unavailable'); sceneMock.onFailure = onFailure; }
  dispose = sceneMock.dispose; setView = sceneMock.setView;
  setTheme() {} setQuality() {} resetCamera() {} rotateQuarter() {}
} }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement; let root: Root;
beforeEach(() => { vi.clearAllMocks(); sceneMock.fail = true; localStorage.setItem('silicon_wiki_lang', 'en'); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
it('keeps failure and retry accessible, synchronizes the new scene, and disposes on context loss', async () => {
  await act(async () => root.render(<ThemeProvider><LanguageProvider><PrototypeCanvas model="system" separation={.4} quality="saver" resetKey={0} rotateKey={0} /></LanguageProvider></ThemeProvider>));
  expect(container.querySelector('[role="group"] [role="status"]')?.textContent).toContain('3D preview unavailable');
  const retry = container.querySelector('button'); expect(retry?.textContent).toContain('Try again');
  sceneMock.fail = false;
  await act(async () => retry!.click());
  expect(sceneMock.constructed).toHaveBeenCalledTimes(2);
  expect(sceneMock.setView).toHaveBeenLastCalledWith('system', .4);
  expect(container.querySelector('[role="status"]')).toBeNull();
  await act(async () => sceneMock.onFailure());
  expect(sceneMock.dispose).toHaveBeenCalledTimes(1);
  expect(container.querySelector('button')?.textContent).toContain('Try again');
});
it('releases the active renderer on route unmount', async () => {
  sceneMock.fail = false;
  await act(async () => root.render(<ThemeProvider><LanguageProvider><PrototypeCanvas model="socket" separation={0} quality="balanced" resetKey={0} rotateKey={0} /></LanguageProvider></ThemeProvider>));
  await act(async () => root.render(null));
  expect(sceneMock.dispose).toHaveBeenCalledTimes(1);
});
