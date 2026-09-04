import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Cpu,
  Tv,
  Monitor,
  HardDrive,
  Flame,
  Zap,
  ShieldAlert,
  Lightbulb,
  Microscope,
  Layers,
  Box,
} from 'lucide-react';
import { glossaryTerms } from '../../data/glossary';
import { GlossaryCategory } from '../../types';

export const GlossaryView: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<GlossaryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: GlossaryCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: '全部分类', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'cpu', label: '处理器 CPU 篇', icon: <Cpu className="w-4 h-4" /> },
    { id: 'gpu', label: '显卡与画质篇', icon: <Tv className="w-4 h-4" /> },
    { id: 'display', label: '屏幕与护眼篇', icon: <Monitor className="w-4 h-4" /> },
    { id: 'motherboard', label: '主板与超频篇', icon: <Zap className="w-4 h-4" /> },
    { id: 'storage', label: '固态存储篇', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'cooling', label: '散热与安全篇', icon: <Flame className="w-4 h-4" /> },
    { id: 'psu', label: '电源电气篇', icon: <Zap className="w-4 h-4" /> },
    { id: 'ram', label: '内存与时序篇', icon: <Layers className="w-4 h-4" /> },
    { id: 'case', label: '机箱与风道篇', icon: <Box className="w-4 h-4" /> },
  ];

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      if (selectedCat !== 'all' && term.category !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTerm = term.term.toLowerCase().includes(q);
        const matchAlias = term.alias?.some((a) => a.toLowerCase().includes(q));
        const matchDesc = term.shortDesc.toLowerCase().includes(q);
        const matchFull = term.fullExplanation.toLowerCase().includes(q);
        const matchTags = term.tags.some((t) => t.toLowerCase().includes(q));
        return matchTerm || matchAlias || matchDesc || matchFull || matchTags;
      }
      return true;
    });
  }, [selectedCat, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/40 via-blue-950/20 to-slate-900 border border-blue-200/50 dark:border-blue-800/40 backdrop-blur-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>计算机硬件名词术语宝典</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            拒绝黑话迷魂阵 · 让你像极客一样看懂参数
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            专为小白打造的“一句话大白话 + 底层物理架构 + 选购避坑指南”三段式词典。全站任意参数遇到疑问，随时查阅！
          </p>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCat === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索名词、缩写 (如 XMP, 撕膜, 功耗墙)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Terms Grid */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            未找到包含 "{searchQuery}" 的名词，尝试搜索其他关键词
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 hover:border-blue-400 dark:hover:border-cyan-700/60 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="space-y-3">
                {/* Title & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {term.term}
                    </h3>
                    {term.alias && term.alias.length > 0 && (
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-400">
                        <span>别名/缩写:</span>
                        <span className="font-mono">{term.alias.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 font-semibold border border-blue-200/60 dark:border-blue-900/60 uppercase shrink-0">
                    {term.category}
                  </span>
                </div>

                {/* 1. 一句话大白话 */}
                <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    <strong className="text-blue-700 dark:text-cyan-300">一句话人话：</strong>
                    {term.shortDesc}
                  </div>
                </div>

                {/* 2. 底层物理原理 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 flex items-start space-x-2.5">
                  <Microscope className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                    <strong className="text-slate-900 dark:text-slate-100 block">
                      深度技术与架构原理：
                    </strong>
                    <p>{term.fullExplanation}</p>
                  </div>
                </div>

                {/* 3. 选购避坑指南 */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    <strong className="block text-amber-800 dark:text-amber-300 mb-0.5">
                      💡 选购与装机避坑指南：
                    </strong>
                    {term.buyingAdvice}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                {term.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
