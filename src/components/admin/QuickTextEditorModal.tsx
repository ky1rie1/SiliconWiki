import React, { useState, useEffect } from 'react';
import {
  Edit3,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  FileCode,
  Sliders,
  HelpCircle,
  Languages,
} from 'lucide-react';
import { useCustomContent } from '../../context/CustomContentContext';

const PRESET_TEXTS = [
  {
    label: '站点主标题 (Brand Name)',
    original: 'SiliconWiki | 芯知硬件百科',
    placeholder: '自定义站点主标题',
  },
  {
    label: '主页 Slogan 副标题',
    original: '探索 PC 硬件的无限细节，零基础也能轻松掌握装机与选购精髓',
    placeholder: '自定义主页副标题',
  },
  {
    label: '主页顶部小徽标',
    original: '全方位硬件指南 · 3D 互动装机 · 真实天梯跑分',
    placeholder: '自定义徽标标语',
  },
  {
    label: '天梯榜单副标题',
    original: '汇聚多维度综合跑分测试结果，直观量化不同世代处理器的性能阶梯',
    placeholder: '自定义天梯榜说明',
  },
  {
    label: '3D装机工坊副标题',
    original: '真实比例体素化部件与气流模拟，沉浸式体验从零搭建一台理想主机',
    placeholder: '自定义3D装机副标题',
  },
  {
    label: '名词宝典副标题',
    original: '深度解析 75+ 核心技术术语，从底层芯片架构到散热微结构一览无余',
    placeholder: '自定义名词宝典副标题',
  },
];

export const QuickTextEditorModal: React.FC = () => {
  const {
    isDevMode,
    lockDevMode,
    overrides,
    setOverride,
    removeOverride,
    clearAllOverrides,
    isVisualEditMode,
    setIsVisualEditMode,
    selectedTextForEdit,
    setSelectedTextForEdit,
    isEditorOpen,
    setIsEditorOpen,
    autoTranslate,
  } = useCustomContent();

  const [activeTab, setActiveTab] = useState<'custom' | 'presets' | 'list' | 'export'>('custom');
  const [originalInput, setOriginalInput] = useState('');
  const [replacementInput, setReplacementInput] = useState('');
  const [replacementEnInput, setReplacementEnInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedTs, setCopiedTs] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Sync selected text from visual click into inputs
  useEffect(() => {
    if (selectedTextForEdit) {
      setOriginalInput(selectedTextForEdit);
      const existing = overrides[selectedTextForEdit];
      const initialZh = typeof existing === 'string' ? existing : existing?.zh || '';
      const initialEn = typeof existing === 'object' ? existing?.en : autoTranslate(initialZh);

      setReplacementInput(initialZh);
      setReplacementEnInput(initialEn || autoTranslate(selectedTextForEdit));
      setActiveTab('custom');
    }
  }, [selectedTextForEdit, overrides, autoTranslate]);

  // Handle auto translation as user types Chinese
  const handleZhChange = (val: string) => {
    setReplacementInput(val);
    const translated = autoTranslate(val);
    setReplacementEnInput(translated);
  };

  // Global shortcut to toggle editor (Alt + E) - only works when in Developer Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'e') {
        if (isDevMode) {
          e.preventDefault();
          setIsEditorOpen(!isEditorOpen);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevMode, isEditorOpen, setIsEditorOpen]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalInput.trim()) return;

    setOverride(originalInput.trim(), replacementInput, replacementEnInput);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2500);

    // If in visual mode, exit visual mode to enjoy result
    if (isVisualEditMode) {
      setIsVisualEditMode(false);
      setSelectedTextForEdit(null);
    }
  };

  const handleCopyCode = () => {
    const code = `// 站长双语文案自定义配置补丁 (Bilingual Text Overrides Config)\nexport const customTextOverrides = ${JSON.stringify(overrides, null, 2)};\n`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFullTsFile = () => {
    const tsCode = `export interface BilingualOverride {
  zh: string;
  en: string;
}

/**
 * 芯知百科 (SiliconWiki) 官方默认文案与站长双语配置字典
 * 提交并永久固化至 GitHub 仓库，全平台、所有设备与 Vercel 部署即时生效。
 */
export const defaultTextOverrides: Record<string, BilingualOverride> = ${JSON.stringify(overrides, null, 2)};
`;
    navigator.clipboard.writeText(tsCode);
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2000);
  };

  const handleImportJson = () => {
    if (!importJsonInput.trim()) return;
    try {
      const parsed = JSON.parse(importJsonInput.trim());
      let count = 0;
      Object.entries(parsed).forEach(([key, val]) => {
        if (typeof val === 'string') {
          setOverride(key, val, autoTranslate(val));
          count++;
        } else if (val && typeof val === 'object') {
          const zh = (val as any).zh || '';
          const en = (val as any).en || autoTranslate(zh);
          if (zh) {
            setOverride(key, zh, en);
            count++;
          }
        }
      });
      setImportMsg(`成功导入 ${count} 条配置补丁并即刻生效！`);
      setImportJsonInput('');
      setTimeout(() => setImportMsg(''), 3000);
    } catch {
      setImportMsg('解析失败：请确保粘贴的是合法的 JSON 格式字符串');
      setTimeout(() => setImportMsg(''), 3500);
    }
  };

  const overrideKeys = Object.keys(overrides);
  const overridesCount = overrideKeys.length;

  return (
    <>
      {/* Visual Edit Mode Top Notification Banner */}
      {isVisualEditMode && (
        <div
          data-no-text-override="true"
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium animate-in slide-in-from-top duration-200 backdrop-blur-md"
        >
          <div className="flex items-center space-x-2.5 max-w-4xl mx-auto flex-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <MousePointerClick className="w-4 h-4 text-cyan-200 shrink-0" />
            <span className="truncate">
              <strong>点选修改模式已激活</strong>：直接在网页上点击任意文字，即可瞬间打开改写弹窗！
            </span>
          </div>
          <button
            onClick={() => setIsVisualEditMode(false)}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold backdrop-blur-sm transition-all flex items-center space-x-1 shrink-0"
          >
            <span>退出 (Esc)</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Action Trigger (Only visible in Developer Mode) */}
      {isDevMode && (
        <div data-no-text-override="true" className="fixed bottom-5 right-5 z-[90] flex items-center space-x-2">
          <button
            onClick={() => setIsEditorOpen(true)}
            title="开发者文案速改工作台 (快捷键: Alt + E)"
            className="group relative flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-600 dark:to-cyan-600 text-white shadow-xl hover:shadow-2xl border border-white/15 dark:border-cyan-400/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Edit3 className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold tracking-tight hidden sm:inline">开发者文案速改</span>
            {overridesCount > 0 && (
              <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full">
                {overridesCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Quick Text Editor Modal */}
      {isEditorOpen && (
        <div
          data-no-text-override="true"
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>站长双语文案速改系统</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>特权已永久记忆</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    改完中文自动同步生成英文版本 · 刷新或新窗口访问自动保持特权
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    lockDevMode();
                    setSelectedTextForEdit(null);
                  }}
                  className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg border border-rose-200/60 dark:border-rose-900/60 transition-colors"
                  title="锁定并退出开发者模式"
                >
                  退出开发者模式
                </button>
                <button
                  onClick={() => {
                    setIsEditorOpen(false);
                    setSelectedTextForEdit(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === 'custom'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>双语同步替换</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === 'presets'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>核心预设修改</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>已修改清单 ({overridesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activeTab === 'export'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>导出代码补丁</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tab 1: Custom Replace */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  {/* Point & Click helper button */}
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-1">
                        <MousePointerClick className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        <span>不想手动输入原文本？</span>
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        开启点选模式后，直接在网页上点击想要修改的文字即可自动选中！
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisualEditMode(true);
                        setIsEditorOpen(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
                    >
                      开启页面点选模式
                    </button>
                  </div>

                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        原中文文本 (页面中当前显示的文本)
                      </label>
                      <textarea
                        rows={2}
                        value={originalInput}
                        onChange={(e) => setOriginalInput(e.target.value)}
                        placeholder="例如：探索 PC 硬件的无限细节，或者输入任何想要替换的中文..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        🇨🇳 修改后的中文文本
                      </label>
                      <textarea
                        rows={2}
                        value={replacementInput}
                        onChange={(e) => handleZhChange(e.target.value)}
                        placeholder="输入您希望展示的全新中文文案..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                          <span>🌐 自动匹配的英文版本 (Auto-matched English)</span>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 font-mono">
                            自动适配双语
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setReplacementEnInput(autoTranslate(replacementInput))}
                          className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>重新自动翻译</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={replacementEnInput}
                        onChange={(e) => setReplacementEnInput(e.target.value)}
                        placeholder="根据中文自动生成英文对应版本，您亦可随时手动润色..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {appliedNotice && (
                          <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center space-x-1 animate-in fade-in">
                            <Check className="w-3.5 h-3.5 inline" />
                            <span>中英文案已即时同步生效并持久化存储！</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOriginalInput('');
                            setReplacementInput('');
                            setReplacementEnInput('');
                          }}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          清空输入
                        </button>
                        <button
                          type="submit"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>立即保存并双语应用</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 2: Presets */}
              {activeTab === 'presets' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    这里收录了站点最常修改的品牌标题、Slogan 与板块说明，改动中文后会自动同步匹配英文：
                  </p>
                  <div className="space-y-3">
                    {PRESET_TEXTS.map((preset, idx) => {
                      const currentVal = overrides[preset.original];
                      const currentZh = typeof currentVal === 'string' ? currentVal : currentVal?.zh || '';
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <span>{preset.label}</span>
                            {currentZh && (
                              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-md">
                                已自定义双语
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500">原文: </span>
                            {preset.original}
                          </div>
                          <div className="flex items-center space-x-2 pt-1">
                            <input
                              type="text"
                              defaultValue={currentZh}
                              placeholder={preset.placeholder}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val) {
                                  setOverride(preset.original, val, autoTranslate(val));
                                } else {
                                  removeOverride(preset.original);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setOriginalInput(preset.original);
                                setReplacementInput(currentZh);
                                setReplacementEnInput(autoTranslate(currentZh));
                                setActiveTab('custom');
                              }}
                              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg transition-colors shrink-0"
                            >
                              双语微调
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Overrides List */}
              {activeTab === 'list' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      当前已生效的自定义文案 ({overridesCount} 条)
                    </span>
                    {overridesCount > 0 && (
                      <button
                        onClick={clearAllOverrides}
                        className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>恢复全部默认文案</span>
                      </button>
                    )}
                  </div>

                  {overridesCount === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Edit3 className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        暂无自定义修改记录，所有文案保持代码默认设置。
                      </p>
                      <button
                        onClick={() => setActiveTab('custom')}
                        className="text-xs text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        去添加第一条自定义文案 &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto">
                      {overrideKeys.map((orig) => {
                        const item = overrides[orig];
                        const zh = typeof item === 'string' ? item : item?.zh || '';
                        const en = typeof item === 'object' ? item?.en : '';
                        return (
                          <div
                            key={orig}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="font-mono text-slate-500 dark:text-slate-400 break-words">
                                <span className="text-rose-500 dark:text-rose-400 font-semibold">[原]</span> {orig}
                              </div>
                              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-medium break-words">
                                <span className="text-emerald-500 font-semibold">[中]</span> {zh}
                              </div>
                              {en && (
                                <div className="font-mono text-cyan-600 dark:text-cyan-400 font-medium break-words text-[11px]">
                                  <span className="text-cyan-500 font-semibold">[英]</span> {en}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                onClick={() => {
                                  setOriginalInput(orig);
                                  setReplacementInput(zh);
                                  setReplacementEnInput(en);
                                  setActiveTab('custom');
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                title="再次修改"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeOverride(orig)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                                title="删除此项并恢复默认"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Export & Import Code Patch */}
              {activeTab === 'export' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      将双语文案永久固化到代码库 (GitHub 同步)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      在浏览器中修改的内容已通过本地存储永久记忆。若要提交并部署至 GitHub 与 Vercel，可一键复制下方配置并提交：
                    </p>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-[25vh] border border-slate-800">
                      {JSON.stringify(overrides, null, 2)}
                    </pre>
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5">
                      <button
                        onClick={handleCopyCode}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1 transition-all border border-slate-700"
                        title="复制 JSON 字典"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>已复制 JSON</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制 JSON</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCopyFullTsFile}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1 transition-all"
                        title="一键生成 defaultTextOverrides.ts 完整文件源码"
                      >
                        {copiedTs ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-200" />
                            <span>已复制 TS 源码</span>
                          </>
                        ) : (
                          <>
                            <FileCode className="w-3.5 h-3.5" />
                            <span>复制 TS 代码文件</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Import JSON Patch Box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5 text-blue-500" />
                        <span>导入 JSON 文案补丁</span>
                      </span>
                      {importMsg && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          importMsg.includes('成功') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {importMsg}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={importJsonInput}
                      onChange={(e) => setImportJsonInput(e.target.value)}
                      placeholder='在此粘贴 JSON 配置，如：{"旧文案": "新文案"}'
                      rows={2}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleImportJson}
                        disabled={!importJsonInput.trim()}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>立即合并导入</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">💡 记忆与同步说明：</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><strong>永久记忆已开启</strong>：开发者特权已保存在本地，下次刷新或直接访问时，无需在搜索栏重新输入指令。</li>
                      <li><strong>顶部常驻入口</strong>：导航栏右侧常驻「文案速改」快捷按钮，随时点击均可弹出此面板。</li>
                      <li><strong>双语自动同步</strong>：改动中文文案后，切换为英文时自动显示对应译文。</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                快捷键: <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">Alt + E</kbd> 开关弹窗
              </span>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setSelectedTextForEdit(null);
                }}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
              >
                完成退出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
