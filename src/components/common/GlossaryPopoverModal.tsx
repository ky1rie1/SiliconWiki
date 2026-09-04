import React, { useEffect } from 'react';
import {
  X,
  Lightbulb,
  Cpu,
  ShieldCheck,
  Tag,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { GlossaryTerm } from '../../types';

interface GlossaryPopoverModalProps {
  term: GlossaryTerm;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGlossary?: () => void;
}

export const GlossaryPopoverModal: React.FC<GlossaryPopoverModalProps> = ({
  term,
  isOpen,
  onClose,
  onNavigateToGlossary,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'cpu':
        return {
          badge: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-900/60',
          accent: 'text-blue-500 dark:text-cyan-400',
          label: '处理器 CPU 核心',
        };
      case 'gpu':
        return {
          badge: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60',
          accent: 'text-emerald-500 dark:text-emerald-400',
          label: '图形卡 GPU 架构',
        };
      case 'motherboard':
        return {
          badge: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60',
          accent: 'text-indigo-500 dark:text-indigo-400',
          label: '主板与内存总线',
        };
      case 'storage':
        return {
          badge: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
          accent: 'text-amber-500 dark:text-amber-400',
          label: '固态存储与协议',
        };
      case 'psu':
        return {
          badge: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60',
          accent: 'text-purple-500 dark:text-purple-400',
          label: '电源与电气安全',
        };
      case 'cooling':
        return {
          badge: 'bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/60',
          accent: 'text-sky-500 dark:text-sky-400',
          label: '散热温控与风道',
        };
      case 'display':
        return {
          badge: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60',
          accent: 'text-rose-500 dark:text-rose-400',
          label: '显示器与色彩',
        };
      default:
        return {
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          accent: 'text-slate-500',
          label: '硬件技术名词',
        };
    }
  };

  const theme = getCategoryTheme(term.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      {/* Modal Shell */}
      <div
        className="relative w-full max-w-xl flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-850 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold tracking-wide ${theme.badge}`}
            >
              {theme.label}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500 inline" />
              <span>芯知名词宝典特辑</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pr-8 tracking-tight">
            {term.term}
          </h3>

          {term.alias && term.alias.length > 0 && (
            <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-y-1">
              <span className="text-[11px] text-slate-400 font-mono">常见俗称：</span>
              {term.alias.map((a, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-mono"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Layman Summary */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>一句话通俗解读：</span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pl-6">
              {term.shortDesc}
            </p>
          </div>

          {/* Deep Principle Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>底层技术原理与架构机理：</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
              {term.fullExplanation}
            </p>
          </div>

          {/* Buying Advice */}
          {term.buyingAdvice && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>实战避坑与选购心法：</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed pl-6">
                {term.buyingAdvice}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center space-x-1.5 pt-1 flex-wrap gap-y-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {term.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Navigation Action */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">SiliconWiki 技术词典系统</span>
          {onNavigateToGlossary && (
            <button
              onClick={() => {
                onClose();
                onNavigateToGlossary();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>翻阅全部 40+ 名词宝典</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
