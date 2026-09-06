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
  Download,
  FileSpreadsheet,
  MessageSquareText,
  Bug,
  Database,
  Lightbulb,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react';
import { useCustomContent } from '../../context/CustomContentContext';
import { useLanguage } from '../../context/LanguageContext';
import { FeedbackItem } from '../../types';

const PRESET_CONFIGS = [
  {
    id: 'brand',
    labelKey: 'presetBrandLabel' as const,
    original: 'SiliconWiki | 芯知硬件百科',
    placeholderKey: 'presetBrandPlaceholder' as const,
  },
  {
    id: 'slogan',
    labelKey: 'presetSloganLabel' as const,
    original: '探索 PC 硬件的无限细节，零基础也能轻松掌握装机与选购精髓',
    placeholderKey: 'presetSloganPlaceholder' as const,
  },
  {
    id: 'badge',
    labelKey: 'presetBadgeLabel' as const,
    original: '全方位硬件指南 · 3D 互动装机 · 真实天梯跑分',
    placeholderKey: 'presetBadgePlaceholder' as const,
  },
  {
    id: 'rankings',
    labelKey: 'presetRankingsLabel' as const,
    original: '汇聚多维度综合跑分测试结果，直观量化不同世代处理器的性能阶梯',
    placeholderKey: 'presetRankingsPlaceholder' as const,
  },
  {
    id: 'assembly',
    labelKey: 'presetAssemblyLabel' as const,
    original: '真实比例体素化部件与气流模拟，沉浸式体验从零搭建一台理想主机',
    placeholderKey: 'presetAssemblyPlaceholder' as const,
  },
  {
    id: 'glossary',
    labelKey: 'presetGlossaryLabel' as const,
    original: '深度解析 75+ 核心技术术语，从底层芯片架构到散热微结构一览无余',
    placeholderKey: 'presetGlossaryPlaceholder' as const,
  },
];

export const QuickTextEditorModal: React.FC = () => {
  const { t, lang } = useLanguage();
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

  const [activeTab, setActiveTab] = useState<'custom' | 'presets' | 'list' | 'export' | 'feedbacks'>('custom');
  const [originalInput, setOriginalInput] = useState('');
  const [replacementInput, setReplacementInput] = useState('');
  const [replacementEnInput, setReplacementEnInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedTs, setCopiedTs] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [appliedNotice, setAppliedNotice] = useState(false);

  // User Feedbacks State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const raw = localStorage.getItem('_sw_feedback_list');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'bug' | 'data' | 'feature' | 'other' | 'pending'>('all');
  const [copiedFeedbackJson, setCopiedFeedbackJson] = useState(false);

  const refreshFeedbacks = () => {
    try {
      const raw = localStorage.getItem('_sw_feedback_list');
      setFeedbacks(raw ? JSON.parse(raw) : []);
    } catch {
      setFeedbacks([]);
    }
  };

  useEffect(() => {
    window.addEventListener('sw_feedback_updated', refreshFeedbacks);
    window.addEventListener('storage', refreshFeedbacks);
    return () => {
      window.removeEventListener('sw_feedback_updated', refreshFeedbacks);
      window.removeEventListener('storage', refreshFeedbacks);
    };
  }, []);

  useEffect(() => {
    if (isEditorOpen && activeTab === 'feedbacks') {
      refreshFeedbacks();
    }
  }, [isEditorOpen, activeTab]);

  const handleDeleteFeedback = (id: string) => {
    const updated = feedbacks.filter((item) => item.id !== id);
    setFeedbacks(updated);
    localStorage.setItem('_sw_feedback_list', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sw_feedback_updated'));
  };

  const handleToggleFeedbackStatus = (id: string) => {
    const updated = feedbacks.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: (item.status === 'resolved' ? 'pending' : 'resolved') as 'pending' | 'resolved',
        };
      }
      return item;
    });
    setFeedbacks(updated);
    localStorage.setItem('_sw_feedback_list', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sw_feedback_updated'));
  };

  const handleClearAllFeedbacks = () => {
    const confirmMsg =
      lang === 'en'
        ? 'Are you sure you want to clear all feedback items? This cannot be undone.'
        : '确定要清空所有用户反馈记录吗？此操作不可恢复。';
    if (window.confirm(confirmMsg)) {
      setFeedbacks([]);
      localStorage.removeItem('_sw_feedback_list');
      window.dispatchEvent(new CustomEvent('sw_feedback_updated'));
    }
  };

  const handleExportFeedbackJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(feedbacks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `siliconwiki_feedbacks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    navigator.clipboard.writeText(JSON.stringify(feedbacks, null, 2));
    setCopiedFeedbackJson(true);
    setTimeout(() => setCopiedFeedbackJson(false), 2000);
  };

  const handleExportFeedbackCsv = () => {
    if (feedbacks.length === 0) return;
    const headers =
      lang === 'en'
        ? ['ID', 'Type', 'Target Page/Hardware', 'Description', 'Contact', 'Timestamp', 'Status']
        : ['ID', '反馈类型', '涉及页面/硬件', '详细描述', '联系方式', '提交时间', '处理状态'];
    const rows = feedbacks.map((fb) => {
      const typeLabel =
        lang === 'en'
          ? fb.type === 'bug'
            ? 'Web Bug'
            : fb.type === 'data'
            ? 'Data Issue'
            : fb.type === 'feature'
            ? 'Feature Suggestion'
            : 'Other'
          : fb.type === 'bug'
          ? '网页 Bug'
          : fb.type === 'data'
          ? '数据不准/不及时'
          : fb.type === 'feature'
          ? '功能建议'
          : '其他';
      const statusLabel =
        lang === 'en'
          ? fb.status === 'resolved'
            ? 'Resolved'
            : 'Pending'
          : fb.status === 'resolved'
          ? '已处理'
          : '待处理';
      return [
        `"${fb.id}"`,
        `"${typeLabel}"`,
        `"${(fb.target || '').replace(/"/g, '""')}"`,
        `"${fb.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(fb.contact || '').replace(/"/g, '""')}"`,
        `"${fb.createdAt}"`,
        `"${statusLabel}"`,
      ];
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `siliconwiki_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
    const code = `// Bilingual Text Overrides Configuration\nexport const customTextOverrides = ${JSON.stringify(overrides, null, 2)};\n`;
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
 * SiliconWiki Bilingual Content Configuration
 * Permanent default overrides deployed to repository.
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
      setImportMsg(t('importSuccessNotice', { count }));
      setImportJsonInput('');
      setTimeout(() => setImportMsg(''), 3000);
    } catch {
      setImportMsg(t('importErrorNotice'));
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
              <strong>{t('visualBannerTitle')}</strong>: {t('visualBannerDesc')}
            </span>
          </div>
          <button
            onClick={() => setIsVisualEditMode(false)}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-md text-xs font-semibold backdrop-blur-sm transition-all flex items-center space-x-1 shrink-0"
          >
            <span>{t('visualBannerExit')}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Bottom Action Trigger (Only visible in Diagnostics Mode) */}
      {isDevMode && (
        <div data-no-text-override="true" className="fixed bottom-22 right-6 z-[90] flex items-center space-x-2">
          <button
            onClick={() => setIsEditorOpen(true)}
            title={t('diagFloatingBtnTitle')}
            className="group relative flex items-center space-x-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-600 dark:to-cyan-600 text-white shadow-xl hover:shadow-2xl border border-white/15 dark:border-cyan-400/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Edit3 className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold tracking-tight hidden sm:inline">{t('diagFloatingBtn')}</span>
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
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{t('diagModalTitle')}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{t('diagBadgePersistent')}</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('diagSubtitle')}
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
                  title={t('diagExitModeTitle')}
                >
                  {t('diagExitMode')}
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
            <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  activeTab === 'custom'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{t('tabCustom')}</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  activeTab === 'presets'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t('tabPresets')}</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t('tabList')} ({overridesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  activeTab === 'export'
                    ? 'border-blue-600 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{t('tabExport')}</span>
              </button>

              {/* User Feedbacks Tab */}
              <button
                onClick={() => setActiveTab('feedbacks')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  activeTab === 'feedbacks'
                    ? 'border-amber-500 text-amber-600 dark:text-[#F7D84A] bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'User Feedbacks' : '用户反馈汇总'} ({feedbacks.length})</span>
                {feedbacks.some((f) => f.status === 'pending') && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
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
                        <span>{t('visualModeCardTitle')}</span>
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        {t('visualModeCardDesc')}
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
                      {t('visualModeCardBtn')}
                    </button>
                  </div>

                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('labelOriginalText')}
                      </label>
                      <textarea
                        rows={2}
                        value={originalInput}
                        onChange={(e) => setOriginalInput(e.target.value)}
                        placeholder={t('placeholderOriginalText')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {t('labelZhReplacement')}
                      </label>
                      <textarea
                        rows={2}
                        value={replacementInput}
                        onChange={(e) => handleZhChange(e.target.value)}
                        placeholder={t('placeholderZhReplacement')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                          <span>{t('labelEnReplacement')}</span>
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40 font-mono">
                            {t('badgeAutoBilingual')}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setReplacementEnInput(autoTranslate(replacementInput))}
                          className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{t('btnRetranslate')}</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={replacementEnInput}
                        onChange={(e) => setReplacementEnInput(e.target.value)}
                        placeholder={t('placeholderEnReplacement')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {appliedNotice && (
                          <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center space-x-1 animate-in fade-in">
                            <Check className="w-3.5 h-3.5 inline" />
                            <span>{t('noticeAppliedSuccess')}</span>
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
                          {t('btnClearInput')}
                        </button>
                        <button
                          type="submit"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('btnSaveApply')}</span>
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
                    {t('presetsIntro')}
                  </p>
                  <div className="space-y-3">
                    {PRESET_CONFIGS.map((preset) => {
                      const currentVal = overrides[preset.original];
                      const currentZh = typeof currentVal === 'string' ? currentVal : currentVal?.zh || '';
                      return (
                        <div
                          key={preset.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <span>{t(preset.labelKey)}</span>
                            {currentZh && (
                              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-md">
                                {t('presetCustomizedBadge')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500">{t('presetOrigPrefix')} </span>
                            {preset.original}
                          </div>
                          <div className="flex items-center space-x-2 pt-1">
                            <input
                              type="text"
                              defaultValue={currentZh}
                              placeholder={t(preset.placeholderKey)}
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
                              {t('btnRefinePreset')}
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
                      {t('activeListTitle', { count: overridesCount })}
                    </span>
                    {overridesCount > 0 && (
                      <button
                        onClick={clearAllOverrides}
                        className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('btnRestoreDefaults')}</span>
                      </button>
                    )}
                  </div>

                  {overridesCount === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Edit3 className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('emptyListTitle')}
                      </p>
                      <button
                        onClick={() => setActiveTab('custom')}
                        className="text-xs text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        {t('emptyListAction')}
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
                                <span className="text-rose-500 dark:text-rose-400 font-semibold">{t('tagOriginal')}</span> {orig}
                              </div>
                              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-medium break-words">
                                <span className="text-emerald-500 font-semibold">{t('tagZh')}</span> {zh}
                              </div>
                              {en && (
                                <div className="font-mono text-cyan-600 dark:text-cyan-400 font-medium break-words text-[11px]">
                                  <span className="text-cyan-500 font-semibold">{t('tagEn')}</span> {en}
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
                                title={t('btnEditItemTitle')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeOverride(orig)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                                title={t('btnDeleteItemTitle')}
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
                      {t('exportSectionTitle')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('exportSectionDesc')}
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
                        title={t('btnCopyJson')}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t('btnCopiedJson')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('btnCopyJson')}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCopyFullTsFile}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center space-x-1 transition-all"
                        title={t('btnCopyTs')}
                      >
                        {copiedTs ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-200" />
                            <span>{t('btnCopiedTs')}</span>
                          </>
                        ) : (
                          <>
                            <FileCode className="w-3.5 h-3.5" />
                            <span>{t('btnCopyTs')}</span>
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
                        <span>{t('importSectionTitle')}</span>
                      </span>
                      {importMsg && (
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            importMsg.includes('成功') || importMsg.includes('Successfully')
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {importMsg}
                        </span>
                      )}
                    </div>
                    <textarea
                      value={importJsonInput}
                      onChange={(e) => setImportJsonInput(e.target.value)}
                      placeholder={t('importPlaceholder')}
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
                        <span>{t('btnImportMerge')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{t('notesTitle')}</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>{t('note1')}</li>
                      <li>{t('note2')}</li>
                      <li>{t('note3')}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 5: User Feedbacks Aggregator Console */}
              {activeTab === 'feedbacks' && (
                <div className="space-y-5">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {lang === 'en' ? 'Total Feedback' : '全部反馈'}
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                        {feedbacks.length}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center space-x-1">
                        <Bug className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Bugs' : '网页 Bug'}</span>
                      </div>
                      <div className="text-xl font-black text-rose-700 dark:text-rose-300 font-mono mt-0.5">
                        {feedbacks.filter((f) => f.type === 'bug').length}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center space-x-1">
                        <Database className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Data Issues' : '数据不准'}</span>
                      </div>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                        {feedbacks.filter((f) => f.type === 'data').length}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Pending' : '待处理'}</span>
                      </div>
                      <div className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono mt-0.5">
                        {feedbacks.filter((f) => f.status === 'pending').length}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    {/* Filter Pills */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {(
                        [
                          { id: 'all', labelZh: '全部', labelEn: 'All' },
                          { id: 'bug', labelZh: 'Bug', labelEn: 'Bugs' },
                          { id: 'data', labelZh: '数据', labelEn: 'Data' },
                          { id: 'feature', labelZh: '功能', labelEn: 'Features' },
                          { id: 'pending', labelZh: '待处理', labelEn: 'Pending' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setFeedbackFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            feedbackFilter === tab.id
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {lang === 'en' ? tab.labelEn : tab.labelZh}
                        </button>
                      ))}
                    </div>

                    {/* Export & Manage Buttons */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={handleExportFeedbackJson}
                        disabled={feedbacks.length === 0}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Export as JSON' : '导出为 JSON 文件'}
                      >
                        {copiedFeedbackJson ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {lang === 'en' ? 'Copied' : '已复制'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-blue-500" />
                            <span>{lang === 'en' ? 'JSON' : '导出 JSON'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleExportFeedbackCsv}
                        disabled={feedbacks.length === 0}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Export as CSV table' : '导出为 CSV 表格'}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === 'en' ? 'CSV' : '导出 CSV'}</span>
                      </button>

                      <button
                        onClick={handleClearAllFeedbacks}
                        disabled={feedbacks.length === 0}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                        title={lang === 'en' ? 'Clear All Feedbacks' : '清空所有反馈'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{lang === 'en' ? 'Clear' : '清空'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Items List */}
                  <div className="space-y-3">
                    {(() => {
                      const filteredList = feedbacks.filter((item) => {
                        if (feedbackFilter === 'all') return true;
                        if (feedbackFilter === 'pending') return item.status === 'pending';
                        return item.type === feedbackFilter;
                      });

                      if (filteredList.length === 0) {
                        return (
                          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Inbox className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {lang === 'en' ? 'No Feedbacks Found' : '暂无对应的用户反馈记录'}
                              </div>
                              <p className="text-[11px] text-slate-400 max-w-sm">
                                {lang === 'en'
                                  ? 'User feedback submitted via the bottom-right floating button will be listed here in real-time.'
                                  : '用户通过右下角「反馈建议」悬浮球提交的网页 Bug 与数据建议将实时汇总在此处。'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return filteredList.map((item) => {
                        const isBug = item.type === 'bug';
                        const isData = item.type === 'data';
                        const isFeature = item.type === 'feature';

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
                          >
                            {/* Card Top: Badges & Actions */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                {/* Type Badge */}
                                <span
                                  className={`inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                                    isBug
                                      ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                      : isData
                                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                                      : isFeature
                                      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                                      : 'bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900'
                                  }`}
                                >
                                  {isBug && <Bug className="w-3 h-3" />}
                                  {isData && <Database className="w-3 h-3" />}
                                  {isFeature && <Lightbulb className="w-3 h-3" />}
                                  <span>
                                    {isBug
                                      ? lang === 'en' ? 'Bug Report' : '网页 Bug'
                                      : isData
                                      ? lang === 'en' ? 'Data Error' : '数据不准/不及时'
                                      : isFeature
                                      ? lang === 'en' ? 'Feature Idea' : '功能建议'
                                      : lang === 'en' ? 'Other' : '其他反馈'}
                                  </span>
                                </span>

                                {/* Status Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeedbackStatus(item.id)}
                                  className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                    item.status === 'resolved'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                                  }`}
                                  title={
                                    item.status === 'resolved'
                                      ? lang === 'en'
                                        ? 'Click to reset to Pending'
                                        : '点击重置为待处理'
                                      : lang === 'en'
                                      ? 'Click to mark as Resolved'
                                      : '点击标记为已处理'
                                  }
                                >
                                  {item.status === 'resolved' ? (
                                    <>
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      <span>{lang === 'en' ? 'Resolved' : '已处理'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>{lang === 'en' ? 'Pending (Click to Resolve)' : '待处理 (点击标记)'}</span>
                                    </>
                                  )}
                                </button>

                                {/* Target tag */}
                                {item.target && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    📌 {item.target}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  {new Date(item.createdAt).toLocaleString(
                                    lang === 'en' ? 'en-US' : 'zh-CN',
                                    {
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFeedback(item.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title={lang === 'en' ? 'Delete Item' : '删除记录'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Card Content Description */}
                            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                              {item.content}
                            </div>

                            {/* Contact info footer if provided */}
                            {item.contact && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 font-mono pt-0.5">
                                <span>{lang === 'en' ? 'Contact:' : '联系方式:'}</span>
                                <span className="text-blue-600 dark:text-cyan-400 font-semibold selection:bg-blue-200">
                                  {item.contact}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {t('footerShortcutHint')}
              </span>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setSelectedTextForEdit(null);
                }}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
              >
                {t('btnDone')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
