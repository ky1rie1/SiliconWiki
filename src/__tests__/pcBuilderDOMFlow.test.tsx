// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BudgetBuilds } from '../components/builds/BudgetBuilds';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CustomContentProvider } from '../context/CustomContentContext';
import { CustomBuild } from '../types/pcBuilder';
import { exportBuildToJson, serializeBuildToUrl } from '../utils/pcBuildShare';

// Configure React 18 act testing environment for happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const DRAFT_STORAGE_KEY = '_sw_custom_builder_draft_v1';

describe('Phase 3 Regression: Full Client-Side DOM Interaction Chain Flow', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('silicon_wiki_lang', 'zh');
    window.location.hash = '#/builds?view=custom';
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
  });

  async function renderBudgetBuilds() {
    await act(async () => {
      root!.render(
        <ThemeProvider>
          <LanguageProvider>
            <CustomContentProvider>
              <BudgetBuilds />
            </CustomContentProvider>
          </LanguageProvider>
        </ThemeProvider>
      );
    });
  }

  async function reloadApp(initialHash: string = '#/builds?view=custom') {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      container.remove();
    }
    window.location.hash = initialHash;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    await renderBudgetBuilds();
  }

  function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(textarea, value);
    } else {
      textarea.value = value;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  it('DOM Flow: pick -> conflict -> replace -> report update -> save/reload', async () => {
    // 1. Initial Render in Custom View
    await renderBudgetBuilds();
    expect(container!.textContent).toContain('自选装机配置器');
    expect(container!.textContent).toContain('装机兼容性与规则诊断');

    // 2. Simulate Setting Conflicted Hardware in Draft Storage to reproduce physical conflict (Pick -> Conflict)
    // We pick AMD AM5 CPU (cpu-amd-9800x3d) and Intel LGA1700 Motherboard (mb-msi-b760m-mortar-wifi-ii)
    const conflictBuild: CustomBuild = {
      schemaVersion: 1,
      id: 'test-flow-build',
      title: '冲突测试单',
      targetBudget: 10000,
      slots: [
        { slotId: 'slot-cpu', type: 'cpu', hardwareId: 'cpu-amd-9800x3d', userPrice: 3799, quantity: 1 },
        { slotId: 'slot-motherboard', type: 'motherboard', hardwareId: 'mb-msi-b760m-mortar-wifi-ii', userPrice: 1199, quantity: 1 },
        { slotId: 'slot-cooler', type: 'cooler', hardwareId: 'cooler-thermalright-pa120', userPrice: 169, quantity: 1 },
        { slotId: 'slot-ram', type: 'ram', hardwareId: 'ram-klevv-bolt-v-ddr5-6000-32g', userPrice: 659, quantity: 1 },
        { slotId: 'slot-gpu', type: 'gpu', hardwareId: 'gpu-nvidia-rtx4070super', userPrice: 4799, quantity: 1 },
        { slotId: 'slot-storage', type: 'storage', hardwareId: 'ssd-tiplus7100-1tb', userPrice: 499, quantity: 1 },
        { slotId: 'slot-psu', type: 'psu', hardwareId: 'psu-a650bn', userPrice: 329, quantity: 1 },
        { slotId: 'slot-case', type: 'case', hardwareId: 'case-h9-flow', userPrice: 799, quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, exportBuildToJson(conflictBuild));

    // Reload App to pick up saved draft from localStorage
    await reloadApp();

    // Verify Conflict is Detected: Socket Mismatch Error
    expect(container!.textContent).toContain('冲突 (1)');
    expect(container!.textContent).toContain('CPU 与主板插槽物理不兼容');
    expect(container!.textContent).toContain('推荐消解冲突的可行替代方案');

    // 3. Find Replacement Candidate and Click "替换" (Replace)
    const allButtons = Array.from(container!.querySelectorAll('button'));
    const replaceBtn = allButtons.find(
      (b) => b.textContent?.includes('替换') && b.closest('.bg-rose-50\\/40, [class*="bg-rose"]')
    );
    expect(replaceBtn).toBeDefined();

    await act(async () => {
      replaceBtn!.click();
    });

    // 4. Verify Report Update: Hard Conflict Should Be Resolved (Report Update)
    expect(container!.textContent).not.toContain('CPU 与主板插槽物理不兼容');
    expect(container!.textContent).not.toContain('冲突 (1)');

    // 5. Verify Save/Reload: Check that LocalStorage Draft was Updated and Reloads
    const updatedDraftJson = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    expect(updatedDraftJson).toBeTruthy();
    expect(updatedDraftJson).not.toContain('mb-msi-b760m-mortar-wifi-ii');

    // Re-mount component simulating browser refresh
    await reloadApp();
    expect(container!.textContent).not.toContain('mb-msi-b760m-mortar-wifi-ii');
    expect(container!.textContent).not.toContain('CPU 与主板插槽物理不兼容');
  });

  it('DOM Flow: import preview cancel/apply preserves active draft on cancel and updates on apply', async () => {
    // 1. Setup an active draft
    const initialBuild: CustomBuild = {
      schemaVersion: 1,
      id: 'active-user-draft',
      title: '用户正在编辑的草稿',
      targetBudget: 5000,
      slots: [
        { slotId: 'slot-cpu', type: 'cpu', hardwareId: 'cpu-intel-14600kf', userPrice: 1800, quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, exportBuildToJson(initialBuild));

    await renderBudgetBuilds();
    expect(container!.textContent).toContain('用户正在编辑的草稿');

    // 2. Open JSON Import Modal
    const importBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('导入 JSON')
    );
    expect(importBtn).toBeDefined();

    await act(async () => {
      importBtn!.click();
    });
    expect(container!.textContent).toContain('导入装机单 JSON');

    // 3. Prepare an incoming build to import
    const incomingBuild: CustomBuild = {
      schemaVersion: 1,
      id: 'incoming-imported-build',
      title: '外部导入新配置',
      targetBudget: 9000,
      slots: [
        { slotId: 'slot-cpu', type: 'cpu', hardwareId: 'cpu-amd-9800x3d', userPrice: 3799, quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const incomingJson = exportBuildToJson(incomingBuild);

    const textarea = container!.querySelector('textarea');
    expect(textarea).toBeDefined();

    // 4. Test Preview & Cancel: Type JSON into textarea, then click Cancel
    await act(async () => {
      setTextareaValue(textarea!, incomingJson);
    });

    // Verify preview appears in modal
    expect(container!.textContent).toContain('外部导入新配置');
    expect(container!.textContent).toContain('配置单格式有效，预览就绪');

    // Click "取消" Button
    const cancelBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.trim() === '取消'
    );
    expect(cancelBtn).toBeDefined();
    await act(async () => {
      cancelBtn!.click();
    });

    // Modal closed: Active draft MUST BE PRESERVED!
    expect(container!.textContent).toContain('用户正在编辑的草稿');
    expect(container!.textContent).not.toContain('外部导入新配置');
    const preservedStorage = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    expect(preservedStorage).toContain('用户正在编辑的草稿');

    // 5. Test Apply: Re-open modal, paste JSON, and click Apply ("确认载入配置单")
    const reImportBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('导入 JSON')
    );
    await act(async () => {
      reImportBtn!.click();
    });

    const reTextarea = container!.querySelector('textarea');
    await act(async () => {
      setTextareaValue(reTextarea!, incomingJson);
    });

    const confirmApplyBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('确认载入配置单')
    );
    expect(confirmApplyBtn).toBeDefined();
    expect((confirmApplyBtn as HTMLButtonElement).disabled).toBe(false);

    await act(async () => {
      confirmApplyBtn!.click();
    });

    // Now draft is updated to incoming build!
    expect(container!.textContent).toContain('外部导入新配置');
    const updatedStorage = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    expect(updatedStorage).toContain('外部导入新配置');
  });

  it('DOM Flow: draft protection on corrupted import and shared link prompt', async () => {
    // 1. Setup active draft
    const myDraft: CustomBuild = {
      schemaVersion: 1,
      id: 'my-sacred-draft',
      title: '珍贵本地草稿',
      targetBudget: 6666,
      slots: [
        { slotId: 'slot-cpu', type: 'cpu', hardwareId: 'cpu-intel-14600kf', userPrice: 1800, quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, exportBuildToJson(myDraft));

    await renderBudgetBuilds();
    expect(container!.textContent).toContain('珍贵本地草稿');

    // 2. Corrupted JSON Import Protection
    const importBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('导入 JSON')
    );
    await act(async () => {
      importBtn!.click();
    });

    const textarea = container!.querySelector('textarea');
    const corruptedJson = '{"schemaVersion": 1, "slots": "invalid_array"}';

    await act(async () => {
      setTextareaValue(textarea!, corruptedJson);
    });

    // Error message displayed, confirm button is disabled
    expect(container!.textContent).toContain('必须是数组');
    const confirmApplyBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('确认载入配置单')
    );
    expect((confirmApplyBtn as HTMLButtonElement)?.disabled).toBe(true);

    // Close modal via Cancel
    const cancelBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.trim() === '取消'
    );
    await act(async () => {
      cancelBtn!.click();
    });

    // Active draft still untouched!
    expect(container!.textContent).toContain('珍贵本地草稿');

    // 3. Shared Link Banner Protection: Incoming Shared Build Prompt
    const foreignBuild: CustomBuild = {
      schemaVersion: 1,
      id: 'foreign-build',
      title: '朋友分享的装机单',
      targetBudget: 12000,
      slots: [
        { slotId: 'slot-cpu', type: 'cpu', hardwareId: 'cpu-intel-14600kf', userPrice: 1800, quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const shareRes = serializeBuildToUrl(foreignBuild);
    expect(shareRes.success).toBe(true);

    // Simulate URL hash change with share parameter
    await act(async () => {
      window.location.hash = `#/builds?view=custom&share=${shareRes.urlParam}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    // Detection banner should appear
    expect(container!.textContent).toContain('检测到来自分享链接的装机单');
    expect(container!.textContent).toContain('朋友分享的装机单');

    // User chooses to keep local draft
    const keepDraftBtn = Array.from(container!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('保留本地草稿')
    );
    expect(keepDraftBtn).toBeDefined();

    await act(async () => {
      keepDraftBtn!.click();
    });

    // Shared banner disappears, and local draft remains active
    expect(container!.textContent).not.toContain('检测到来自分享链接的装机单');
    expect(container!.textContent).toContain('珍贵本地草稿');
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('珍贵本地草稿');
  });
});