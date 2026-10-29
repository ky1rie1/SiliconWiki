// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DesignLab } from '../components/lab/DesignLab';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ChangelogModal } from '../components/changelog/ChangelogModal';
import { changelogList } from '../data/changelog';
import type { PrototypeCanvasProps } from '../components/lab/PrototypeCanvas';

vi.mock('../components/lab/PrototypeCanvas', () => ({ PrototypeCanvas: (props: PrototypeCanvasProps) => <div data-testid="scene" data-model={props.model} data-separation={props.separation} data-quality={props.quality} /> }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
describe('interactive preview and website dynamics', () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => { localStorage.clear(); localStorage.setItem('silicon_wiki_lang', 'en'); container = document.createElement('div'); document.body.append(container); root = createRoot(container); });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
  async function click(text: string) {
    const button = Array.from(container.querySelectorAll('button')).find(node => node.textContent?.trim() === text);
    expect(button, `button ${text}`).toBeTruthy();
    await act(async () => button!.click());
  }
  it('connects view, model, separation and effects controls to real scene props', async () => {
    const navigate = vi.fn();
    await act(async () => root.render(<ThemeProvider><LanguageProvider><DesignLab onNavigate={navigate} /></LanguageProvider></ThemeProvider>));
    expect(container.textContent).toContain('Understand hardware.');
    await click('Workbench');
    expect(container.querySelector('[data-testid="scene"]')?.getAttribute('data-separation')).toBe('0');
    await click('Separate parts');
    expect(container.querySelector('[data-testid="scene"]')?.getAttribute('data-separation')).toBe('1');
    await click('Full build');
    expect(container.querySelector('[data-testid="scene"]')?.getAttribute('data-model')).toBe('system');
    await click('Reduce effects');
    expect(container.querySelector('.design-lab')?.classList.contains('lab-reduced')).toBe(true);
    expect(container.querySelector('[data-testid="scene"]')?.getAttribute('data-quality')).toBe('saver');
    await click('Hardware library');
    expect(navigate).toHaveBeenCalledWith('wiki');
    expect(container.textContent).not.toMatch(/[\u3400-\u9fff]/);
  });
  it('publishes a bilingual prototype update with a working preview action', async () => {
    const latest = changelogList.find(log => log.version === 'v2.6.0-preview.1')!;
    expect(latest.version).toBe('v2.6.0-preview.1');
    expect(latest.previewTab).toBe('lab');
    expect(latest.titleEn).toBeTruthy();
    expect(latest.updates.every(update => update.textEn)).toBe(true);
    const navigate = vi.fn(); const close = vi.fn();
    await act(async () => root.render(<LanguageProvider><ChangelogModal isOpen onClose={close} onMarkAllAsRead={() => {}} onNavigate={navigate} /></LanguageProvider>));
    expect(container.textContent).toContain(latest.titleEn);
    await click('Explore preview');
    expect(navigate).toHaveBeenCalledWith('lab'); expect(close).toHaveBeenCalled();
  });
  it('links the latest bilingual release to the production assembly route', async () => {
    const latest = changelogList[0];
    expect(latest.version).toBe('v2.6.0');
    expect(latest.previewTab).toBe('simulator3d');
    expect(latest.titleEn).toBeTruthy();
    expect(latest.updates.every(update => update.textEn)).toBe(true);
    const navigate = vi.fn();
    await act(async () => root.render(<LanguageProvider><ChangelogModal isOpen onClose={() => {}} onMarkAllAsRead={() => {}} onNavigate={navigate} /></LanguageProvider>));
    await click('Open 3D assembly');
    expect(navigate).toHaveBeenCalledWith('simulator3d');
  });
});
