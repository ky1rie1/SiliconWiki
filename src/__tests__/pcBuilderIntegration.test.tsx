// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BudgetBuilds } from '../components/builds/BudgetBuilds';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CustomContentProvider } from '../context/CustomContentContext';
import { CustomBuild } from '../types/pcBuilder';
import { hardwareCatalog } from '../data/hardware';
import { checkBuildCompatibility } from '../utils/pcCompatibility';
import { exportBuildToJson, importBuildFromJson } from '../utils/pcBuildShare';

// Configure React 18 act testing environment for happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('PC Builder Integration Suite (自选装机与兼容性全链路 DOM 测试)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('silicon_wiki_lang', 'zh');
    window.location.hash = '';
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

  it('能展示官方精选配置与自选装机配置器双子页面切换器并支持点击切换', async () => {
    await renderBudgetBuilds();

    // 默认展示官方精选配置
    expect(container!.textContent).toContain('官方精选配置');
    expect(container!.textContent).toContain('自选装机配置器');

    // 找到并点击“自选装机配置器”按钮
    const buttons = Array.from(container!.querySelectorAll('button'));
    const customTabBtn = buttons.find((b) => b.textContent?.includes('自选装机配置器'));
    expect(customTabBtn).toBeDefined();

    await act(async () => {
      customTabBtn!.click();
    });

    // 切换后展示核心配件槽位与诊断标题
    expect(container!.textContent).toContain('CPU 处理器');
    expect(container!.textContent).toContain('主板');
    expect(container!.textContent).toContain('电源 (PSU)');
    expect(container!.textContent).toContain('装机兼容性与规则诊断');
  });

  it('点击精选配置卡片中的「以此为蓝本自选」能一键将配置载入自选装机单', async () => {
    await renderBudgetBuilds();

    // 找到所有“以此为蓝本自选”按钮
    const buttons = Array.from(container!.querySelectorAll('button'));
    const customizeBtn = buttons.find((b) => b.getAttribute('title')?.includes('以此为蓝本自选') || b.textContent?.includes('以此为蓝本自选'));
    expect(customizeBtn).toBeDefined();

    await act(async () => {
      customizeBtn!.click();
    });

    // 应该平滑切换至自选装机单页面并呈现功耗与诊断面板
    expect(container!.textContent).toContain('自选装机单与五态兼容性诊断');
    expect(container!.textContent).toContain('整机满载预估功耗与电源负荷');
    expect(container!.textContent).toContain('装机兼容性与规则诊断');
  });

  it('在自选配置单中点击挑选配件能够打开配件选择弹窗并展示智能过滤', async () => {
    await renderBudgetBuilds();

    // 切换到自选模式
    const buttons = Array.from(container!.querySelectorAll('button'));
    const customTabBtn = buttons.find((b) => b.textContent?.includes('自选装机配置器'));
    await act(async () => {
      customTabBtn!.click();
    });

    // 点击“挑选 CPU”
    const allButtons = Array.from(container!.querySelectorAll('button'));
    const pickCpuBtn = allButtons.find((b) => b.textContent?.includes('挑选 CPU'));
    expect(pickCpuBtn).toBeDefined();

    await act(async () => {
      pickCpuBtn!.click();
    });

    // 弹窗应该弹出，展示过滤器与搜索框
    expect(document.body.textContent).toContain('排除已知冲突，保留待核实型号');
    expect(document.body.querySelector('input[placeholder*="搜索型号"]')).toBeDefined();
  });

  it('五态兼容性引擎规则检查：未选配件时状态为 unknown / 待核实，绝不虚假宣告通过', () => {
    const emptyBuild: CustomBuild = {
      schemaVersion: 1,
      id: 'empty-test',
      title: '空装机单',
      targetBudget: null,
      slots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const catalogList = Array.from(hardwareCatalog.byId.values());
    const report = checkBuildCompatibility(emptyBuild, catalogList);

    // 缺件时整机状态严禁为 pass
    expect(report.overallStatus).not.toBe('pass');
    expect(report.missingCoreSlotTypes).toContain('cpu');
    expect(report.missingCoreSlotTypes).toContain('motherboard');
    expect(report.missingCoreSlotTypes).toContain('psu');
  });

  it('JSON 导出与导入能够无损往返并正确解析自定义 0 元白嫖价格', () => {
    const buildWithZeroPrice: CustomBuild = {
      schemaVersion: 1,
      id: 'zero-price-build',
      title: '自备显卡 0 元装机单',
      targetBudget: 4000,
      slots: [
        {
          slotId: 'slot-gpu',
          type: 'gpu',
          hardwareId: null,
          customName: '朋友送的二手 GTX 1060',
          userPrice: 0,
          isExplicitZeroPrice: true,
          quantity: 1,
        },
      ],
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    };

    const exported = exportBuildToJson(buildWithZeroPrice);
    const imported = importBuildFromJson(exported);

    expect(imported.success).toBe(true);
    expect(imported.build?.slots[0].userPrice).toBe(0);
    expect(imported.build?.slots[0].isExplicitZeroPrice).toBe(true);
    expect(imported.build?.slots[0].customName).toBe('朋友送的二手 GTX 1060');
  });
});
