import { PageHeader } from '../layout/PageHeader';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Info,
  SlidersHorizontal,
  RotateCcw,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { recommendedBuilds } from '../../data/builds';
import {
  getLocalizedBuildTitle,
  getLocalizedBuildTagline,
  getLocalizedBuildScenario,
  getLocalizedBuildNotes,
  getLocalizedPartName,
  getLocalizedPartSpec,
  getLocalizedUpgradeOption,
} from '../../data/buildTranslationsEn';
import { RecommendedBuild } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { copyTextToClipboard } from '../../utils/clipboard';
import { CustomBuilderView } from '../builder/CustomBuilderView';
import { JsonImportModal } from '../builder/JsonImportModal';
import { CustomBuild } from '../../types/pcBuilder';
import { hardwareCatalog } from '../../data/hardware';
import {
  exportBuildToJson,
  importBuildFromJson,
  serializeBuildToUrl,
  deserializeBuildFromUrl,
  generateBuildPlainText,
  getBuildUrlParams,
  convertRecommendedBuildToCustomBuild,
} from '../../utils/pcBuildShare';
import { safeGetItem, safeSetItem } from '../../utils/storage';

const DRAFT_STORAGE_KEY = '_sw_custom_builder_draft_v1';

function createInitialBuild(): CustomBuild {
  return {
    schemaVersion: 1,
    id: `build-${Date.now()}`,
    title: '我的自选装机单',
    targetBudget: null,
    slots: [
      { slotId: 'slot-cpu', type: 'cpu', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-cooler', type: 'cooler', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-motherboard', type: 'motherboard', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-ram', type: 'ram', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-gpu', type: 'gpu', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-storage', type: 'storage', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-psu', type: 'psu', hardwareId: null, userPrice: null, quantity: 1 },
      { slotId: 'slot-case', type: 'case', hardwareId: null, userPrice: null, quantity: 1 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const BudgetBuilds: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const copyRequestRef = useRef(0);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeUpgrades, setActiveUpgrades] = useState<Record<string, string[]>>({});

  // 阶段 3：子视图与自选装机单状态管理
  const allHardwareRecords = useMemo(() => Array.from(hardwareCatalog.byId.values()), []);
  const [currentView, setCurrentView] = useState<'recommended' | 'custom'>(() => {
    return getBuildUrlParams().view;
  });
  const [customBuild, setCustomBuild] = useState<CustomBuild>(createInitialBuild);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [pendingSharedBuild, setPendingSharedBuild] = useState<CustomBuild | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  // 监听浏览器 Hash 变化以支持前进后退与子路由跳转
  useEffect(() => {
    const handleHashChange = () => {
      const { view, sharePayload } = getBuildUrlParams();
      setCurrentView(view);
      if (sharePayload) {
        const shared = deserializeBuildFromUrl(sharePayload);
        if (shared) {
          setPendingSharedBuild(shared);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 首次挂载水合：读取 URL 参数与本地草稿（门禁保护，防止初始空状态冲刷草稿）
  useEffect(() => {
    const { view, sharePayload } = getBuildUrlParams();
    if (view === 'custom') {
      setCurrentView('custom');
    }

    if (sharePayload) {
      const shared = deserializeBuildFromUrl(sharePayload);
      if (shared) {
        setPendingSharedBuild(shared);
      }
    }

    const savedDraft = safeGetItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      const res = importBuildFromJson(savedDraft);
      if (res.success && res.build) {
        setCustomBuild(res.build);
      }
    }

    setIsHydrated(true);
  }, []);

  // 本地草稿自动保存（受 isHydrated 门禁防护）
  useEffect(() => {
    if (!isHydrated) return;
    const json = exportBuildToJson(customBuild);
    const success = safeSetItem(DRAFT_STORAGE_KEY, json);
    setSaveFailed(!success);
  }, [customBuild, isHydrated]);

  useEffect(() => () => {
    copyRequestRef.current += 1;
    if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
  }, []);

  const tiers = [
    { id: 'all', label: lang === 'en' ? 'All Price Tiers' : '全部价位段' },
    { id: '3500元档', label: lang === 'en' ? '¥3500 Entry Esports' : '3500元 入门配置' },
    { id: '5500元档', label: lang === 'en' ? '¥5500 2K Sweet Spot' : '5500元 2K甜点' },
    { id: '8500元档', label: lang === 'en' ? '¥8500 High-FPS Powerhouse' : '8500元 高刷主力' },
    { id: '13000元档', label: lang === 'en' ? '¥13000 4K Esports & Pro' : '1.3万元 4K电竞生产力' },
    { id: '25000元档+', label: lang === 'en' ? '¥25000+ Ultimate Flagship' : '2.5万+ 顶级发烧配置' },
  ];

  const getLocalizedPartType = (type: string) => {
    if (lang !== 'en') return type;
    const typeMap: Record<string, string> = {
      CPU: 'CPU',
      主板: 'Motherboard',
      散热: 'Cooler',
      散热器: 'Cooler',
      内存: 'RAM',
      固态: 'SSD',
      固态硬盘: 'SSD',
      显卡: 'GPU',
      电源: 'PSU',
      机箱: 'Case',
    };
    return typeMap[type] || type;
  };

  const toggleUpgrade = (buildId: string, upgradeId: string) => {
    setActiveUpgrades((prev) => {
      const current = prev[buildId] || [];
      if (current.includes(upgradeId)) {
        return { ...prev, [buildId]: current.filter((id) => id !== upgradeId) };
      }
      return { ...prev, [buildId]: [...current, upgradeId] };
    });
  };

  const resetBuildUpgrades = (buildId: string) => {
    setActiveUpgrades((prev) => ({ ...prev, [buildId]: [] }));
  };

  const filteredBuilds =
    selectedTier === 'all'
      ? recommendedBuilds
      : recommendedBuilds.filter((b) => b.budgetLevel === selectedTier);

  const copyBuildText = async (build: RecommendedBuild) => {
    const request = ++copyRequestRef.current;
    if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    setCopiedId(null);
    setCopyFailed(false);
    setCopyingId(build.id);
    const buildUpgradeIds = activeUpgrades[build.id] || [];
    const appliedUpgrades = (build.upgradeOptions || []).filter((u) =>
      buildUpgradeIds.includes(u.id)
    );
    const deltaSum = appliedUpgrades.reduce((sum, u) => sum + u.priceDelta, 0);
    const finalPrice = build.totalPrice + deltaSum;

    const text =
      lang === 'en'
        ? [
            `[SiliconWiki Recommended Build] ${getLocalizedBuildTitle(build, lang)}`,
            `Target Budget: ¥${build.targetPrice} | ${appliedUpgrades.length > 0 ? `Customized Total: ¥${finalPrice} (${deltaSum >= 0 ? `+¥${deltaSum}` : `-¥${Math.abs(deltaSum)}`})` : `Components Total: ¥${build.totalPrice}`}`,
            `Ideal Scenario: ${getLocalizedBuildScenario(build, lang)}`,
            '--------------------------------',
            'Base Configuration BOM:',
            ...build.parts.map(
              (p, idx) =>
                `${getLocalizedPartType(p.type).padEnd(12, ' ')}: ${getLocalizedPartName(build.id, idx, p.name, lang)} (${getLocalizedPartSpec(build.id, idx, p.spec, lang)}) — Approx. ¥${p.approxPrice}`
            ),
            ...(appliedUpgrades.length > 0
              ? [
                  '--------------------------------',
                  'Applied Optional Upgrades & Customizations:',
                  ...appliedUpgrades.map((u) => {
                    const localizedU = getLocalizedUpgradeOption(build.id, u.id, u, lang);
                    return `• [${getLocalizedPartType(u.targetComponent)}] ${localizedU.title} (${u.priceDelta >= 0 ? `+¥${u.priceDelta}` : `-¥${Math.abs(u.priceDelta)}`}): ${localizedU.partName}`;
                  }),
                ]
              : []),
            '--------------------------------',
            'Building Tips & Pairing Notes:',
            ...getLocalizedBuildNotes(build, lang).map((n) => `• ${n}`),
          ].join('\n')
        : [
            `【SiliconWiki 芯知推荐配置】${build.title}`,
            `目标预算：￥${build.targetPrice} | ${appliedUpgrades.length > 0 ? `选配后合计：￥${finalPrice} (${deltaSum >= 0 ? `+￥${deltaSum}` : `-￥${Math.abs(deltaSum)}`})` : `配件合计：￥${build.totalPrice}`}`,
            `适用场景：${build.scenario}`,
            '--------------------------------',
            '基准配置清单：',
            ...build.parts.map(
              (p) => `${p.type.padEnd(4, ' ')}：${p.name} (${p.spec}) —— 约 ￥${p.approxPrice}`
            ),
            ...(appliedUpgrades.length > 0
              ? [
                  '--------------------------------',
                  '已选定制选配方案：',
                  ...appliedUpgrades.map(
                    (u) =>
                      `• 【${u.targetComponent}选配】${u.title} (${u.priceDelta >= 0 ? `+￥${u.priceDelta}` : `-￥${Math.abs(u.priceDelta)}`})：${u.partName}`
                  ),
                ]
              : []),
            '--------------------------------',
            '选购建议：',
            ...build.notes.map((n) => `• ${n}`),
          ].join('\n');

    const copied = await copyTextToClipboard(text);
    if (request !== copyRequestRef.current) return;
    setCopyingId(null);
    if (!copied) {
      setCopyFailed(true);
      return;
    }
    setCopiedId(build.id);
    copyTimerRef.current = setTimeout(() => {
      setCopiedId(null);
      copyTimerRef.current = null;
    }, 2000);
  };

  // 切换视图模式（推荐 / 自选）
  const handleSwitchView = (newView: 'recommended' | 'custom') => {
    setCurrentView(newView);
    try {
      window.history.replaceState(window.history.state, '', `#/builds?view=${newView}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 以推荐配置为蓝本载入自选装机单
  const handleLoadRecommendedIntoCustom = (recBuild: RecommendedBuild) => {
    const converted = convertRecommendedBuildToCustomBuild(recBuild, allHardwareRecords);
    setCustomBuild(converted);
    setCurrentView('custom');
    try {
      window.history.replaceState(window.history.state, '', '#/builds?view=custom');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(
      lang === 'en'
        ? `Loaded "${recBuild.title}" into Custom Builder!`
        : `已将「${recBuild.title}」载入自选装机配置器！`
    );
  };

  // 导出 JSON
  const handleExportJson = () => {
    const jsonStr = exportBuildToJson(customBuild);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (customBuild.title || 'silicon-wiki-build')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 30);
    link.download = `${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'en' ? 'Build exported as JSON file' : '装机单已成功导出为 JSON 文件');
  };

  // 分享 URL 链接
  const handleShareUrl = async () => {
    const res = serializeBuildToUrl(customBuild);
    if (!res.success || !res.urlParam) {
      alert(res.error || '生成分享链接失败');
      return;
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.hash = `#/builds?view=custom&share=${res.urlParam}`;
    const shareUrl = currentUrl.toString();
    const copied = await copyTextToClipboard(shareUrl);
    if (copied) {
      showToast(lang === 'en' ? 'Share link copied to clipboard!' : '分享链接已复制到剪贴板！');
    } else {
      window.prompt(lang === 'en' ? 'Copy the share link:' : '请手动复制以下分享链接：', shareUrl);
    }
  };

  // 复制格式化纯文本
  const handleCopyText = async () => {
    const text = generateBuildPlainText(customBuild, allHardwareRecords, lang === 'en' ? 'en' : 'zh');
    const copied = await copyTextToClipboard(text);
    if (copied) {
      showToast(lang === 'en' ? 'Build copied as text format!' : '纯文本配置单已复制到剪贴板！');
    }
  };

  // 重置装机单
  const handleResetBuild = () => {
    const msg =
      lang === 'en'
        ? 'Reset current custom build? All selected components will be cleared.'
        : '确定要重置当前自选装机单吗？所有已选配件将被清空。';
    if (window.confirm(msg)) {
      setCustomBuild(createInitialBuild());
      showToast(lang === 'en' ? 'Build has been reset' : '自选装机单已重置');
    }
  };

  const hasCustomParts = customBuild.slots.some((s) => s.hardwareId !== null);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 顶部标题区 */}
      <PageHeader
        eyebrow={currentView === 'custom' ? (lang === 'en' ? 'Custom Builder' : '自选装机配置器') : t('buildsHeroBadge')}
        title={currentView === 'custom' ? (lang === 'en' ? 'PC Builder & Diagnostics' : '自选装机单与五态兼容性诊断') : t('buildsHeroTitle')}
        description={
          currentView === 'custom'
            ? (lang === 'en'
                ? 'Pick components from the verified catalog, inspect physical clearances & power estimation, and resolve conflicts with explainable alternatives.'
                : '从结构化硬件目录中自选 8 大核心配件，实时获得插槽、板型、限长、冷排及电源额定功率诊断，支持一键沙盒替代建议。')
            : t('buildsHeroDesc')
        }
      />

      {/* 复制失败预警 */}
      {copyFailed && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {lang === 'en'
            ? 'Could not copy the build. Check clipboard permissions and try again.'
            : '复制配置失败，请检查浏览器的剪贴板权限后重试。'}
        </p>
      )}

      {/* 本地存储受限提示 */}
      {saveFailed && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200/60 dark:border-amber-800/60">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            {lang === 'en'
              ? 'Notice: Local storage is unavailable. Your draft will not be persisted across browser sessions. Use "Export JSON" to save.'
              : '提示：本地存储不可用（可能处于隐私无痕模式）。配置单草稿未保存到本地，建议使用「导出 JSON」备份。'}
          </span>
        </div>
      )}

      {/* 分享链接载入待确认横幅 */}
      {pendingSharedBuild && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {lang === 'en' ? 'Shared Build Detected' : '检测到来自分享链接的装机单'}
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {lang === 'en'
                  ? `Do you want to load "${pendingSharedBuild.title}"? This will replace your current local draft.`
                  : `配置单名称：「${pendingSharedBuild.title}」（包含 ${pendingSharedBuild.slots.length} 项配件）。载入将替换您当前的本地草稿。`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setPendingSharedBuild(null)}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-amber-100/80 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Keep Local Draft' : '保留本地草稿'}
            </button>
            <button
              onClick={() => {
                setCustomBuild(pendingSharedBuild);
                setPendingSharedBuild(null);
                setCurrentView('custom');
                showToast(lang === 'en' ? 'Shared build loaded!' : '已成功载入分享配置单！');
              }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              {lang === 'en' ? 'Load & Replace Draft' : '确认载入此配置'}
            </button>
          </div>
        </div>
      )}

      {/* 轻量 Toast 提示条 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-4 py-3 rounded-2xl shadow-xl border border-neutral-700/60 dark:border-neutral-200 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 子页面模式切换器 */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => handleSwitchView('recommended')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none ${
            currentView === 'recommended'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
          <span>{lang === 'en' ? 'Curated Recommendations' : '官方精选配置'}</span>
        </button>

        <button
          onClick={() => handleSwitchView('custom')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none ${
            currentView === 'custom'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Wrench className="w-4 h-4 text-primary-500" />
          <span>{lang === 'en' ? 'Custom PC Builder' : '自选装机配置器'}</span>
          {hasCustomParts && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 视图 1：自选装机配置器 */}
      {currentView === 'custom' ? (
        <>
          <CustomBuilderView
            build={customBuild}
            onUpdateBuild={setCustomBuild}
            catalog={allHardwareRecords}
            onExportJson={handleExportJson}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onShareUrl={handleShareUrl}
            onCopyText={handleCopyText}
            onResetBuild={handleResetBuild}
          />

          <JsonImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onApplyBuild={(importedBuild) => {
              setCustomBuild(importedBuild);
              showToast(lang === 'en' ? 'Build imported successfully!' : '装机单已成功载入！');
            }}
          />
        </>
      ) : (
        /* 视图 2：官方精选配置 */
        <>
          {/* Tier Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {tiers.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setSelectedTier(tItem.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                  selectedTier === tItem.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          {/* Builds Cards */}
          <div className="space-y-8">
            {filteredBuilds.map((build) => {
              const isCopied = copiedId === build.id;
              const buildSelectedUpgradeIds = activeUpgrades[build.id] || [];
              const selectedUpgradeItems = (build.upgradeOptions || []).filter((u) =>
                buildSelectedUpgradeIds.includes(u.id)
              );
              const deltaSum = selectedUpgradeItems.reduce((acc, u) => acc + u.priceDelta, 0);
              const dynamicTotalPrice = build.totalPrice + deltaSum;

              return (
                <div
                  key={build.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold font-mono border border-zinc-200 dark:border-zinc-700">
                          {build.budgetLevel}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {getLocalizedBuildScenario(build, lang)}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                        {getLocalizedBuildTitle(build, lang)}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {getLocalizedBuildTagline(build, lang)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-2">
                      <div className="text-right mr-1">
                        <span className="text-[10px] text-zinc-400 block uppercase font-mono">
                          {deltaSum !== 0 ? t('buildCustomizedTotal') : t('bomTotalPriceLabel')}
                        </span>
                        <div className="flex items-center justify-end space-x-1.5">
                          <span className="text-2xl font-black text-zinc-900 dark:text-[#F7D84A] font-mono">
                            ￥{dynamicTotalPrice}
                          </span>
                          {deltaSum !== 0 && (
                            <span
                              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                deltaSum > 0
                                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {deltaSum > 0 ? `+￥${deltaSum}` : `-￥${Math.abs(deltaSum)}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 以此为蓝本自选装机 */}
                      <button
                        onClick={() => handleLoadRecommendedIntoCustom(build)}
                        className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 text-xs font-bold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] border border-primary-200/60 dark:border-primary-800/60"
                        title={lang === 'en' ? 'Load this build into Custom PC Builder' : '以该配置为蓝本自选装机'}
                      >
                        <Wrench className="w-3.5 h-3.5 text-primary-500" />
                        <span>{lang === 'en' ? 'Customize' : '以此为蓝本自选'}</span>
                      </button>

                      {/* 复制配置 */}
                      <button
                        onClick={() => copyBuildText(build)}
                        disabled={copyingId === build.id}
                        aria-busy={copyingId === build.id}
                        className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] border border-zinc-200 dark:border-zinc-700"
                        title={t('btnCopyBuild')}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {t('btnCopiedBuild')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>
                              {copyingId === build.id
                                ? lang === 'en'
                                  ? 'Copying…'
                                  : '正在复制…'
                                : t('btnCopyBuild')}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* BOM Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                          <th className="pb-3 font-semibold w-24">{t('thHardware')}</th>
                          <th className="pb-3 font-semibold">{t('thModel')}</th>
                          <th className="pb-3 font-semibold hidden md:table-cell">{t('thSpecs')}</th>
                          <th className="pb-3 font-semibold text-right">{t('thPrice')}</th>
                          <th className="pb-3 font-semibold text-center w-36">{t('thAction')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {build.parts.map((part, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40 transition-colors"
                          >
                            <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                              {getLocalizedPartType(part.type)}
                            </td>
                            <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                              {getLocalizedPartName(build.id, idx, part.name, lang)}
                            </td>
                            <td className="py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell font-mono">
                              {getLocalizedPartSpec(build.id, idx, part.spec, lang)}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                              ￥{part.approxPrice}
                            </td>
                            <td className="py-3 text-center">
                              <a
                                href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                                  part.jdQuery
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] transition-all duration-150 cursor-pointer select-none active:scale-[0.98] border border-zinc-200 dark:border-zinc-700"
                              >
                                <ShoppingBag className="w-3 h-3 text-[#e5a912] dark:text-[#F7D84A]" />
                                <span>{t('shopJd')}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Interactive Upgrade Options Section */}
                  {build.upgradeOptions && build.upgradeOptions.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3">
                        <div className="flex items-center space-x-2">
                          <SlidersHorizontal className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                            {t('buildUpgradesTitle')}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-bold">
                            {build.upgradeOptions.length}
                          </span>
                          {selectedUpgradeItems.length > 0 && (
                            <button
                              onClick={() => resetBuildUpgrades(build.id)}
                              className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-2 cursor-pointer transition-colors"
                              title={t('buildUpgradeRevert')}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{t('buildUpgradeRevert')}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {t('buildUpgradesDesc')}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {build.upgradeOptions.map((opt) => {
                          const isApplied = buildSelectedUpgradeIds.includes(opt.id);
                          const localizedOpt = getLocalizedUpgradeOption(build.id, opt.id, opt, lang);
                          return (
                            <div
                              key={opt.id}
                              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
                                isApplied
                                  ? 'bg-amber-500/10 dark:bg-[#F7D84A]/10 border-amber-400/80 dark:border-[#F7D84A]/60 shadow-xs'
                                  : 'bg-white dark:bg-zinc-850/60 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                    {getLocalizedPartType(opt.targetComponent)}
                                  </span>
                                  <span
                                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                                      opt.priceDelta > 0
                                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                        : opt.priceDelta < 0
                                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                                  >
                                    {opt.priceDelta > 0
                                      ? `+￥${opt.priceDelta}`
                                      : opt.priceDelta < 0
                                      ? `-￥${Math.abs(opt.priceDelta)}`
                                      : '￥0'}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                                  {localizedOpt.title}
                                </h5>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                  {localizedOpt.description}
                                </p>
                                <div className="text-[10px] text-zinc-400 font-mono truncate">
                                  {t('buildUpgradeReplaces')}{' '}
                                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                                    {localizedOpt.partName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                                {opt.jdQuery ? (
                                  <a
                                    href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                                      opt.jdQuery
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                  >
                                    <ShoppingBag className="w-2.5 h-2.5 text-[#e5a912] dark:text-[#F7D84A]" />
                                    <span>{t('shopJd')}</span>
                                    <ExternalLink className="w-2 h-2 opacity-60 ml-0.5" />
                                  </a>
                                ) : (
                                  <div />
                                )}

                                <button
                                  onClick={() => toggleUpgrade(build.id, opt.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                                    isApplied
                                      ? 'bg-[#F7D84A] text-zinc-950 shadow-xs ring-1 ring-[#F7D84A]/60'
                                      : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                                  }`}
                                >
                                  {isApplied ? t('buildUpgradeApplied') : t('buildUpgradeApply')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes & Advice */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                      <span>{t('buildNotesTitle')}</span>
                    </div>
                    <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 pl-5 list-disc">
                      {getLocalizedBuildNotes(build, lang).map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
