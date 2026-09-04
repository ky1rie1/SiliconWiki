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
import { useLanguage } from '../../context/LanguageContext';

export const GlossaryView: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedCat, setSelectedCat] = useState<GlossaryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: GlossaryCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: lang === 'en' ? 'All Categories' : '全部分类', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'cpu', label: lang === 'en' ? 'Processors (CPU)' : '处理器 CPU 篇', icon: <Cpu className="w-4 h-4" /> },
    { id: 'gpu', label: lang === 'en' ? 'Graphics & Visuals' : '显卡与画质篇', icon: <Tv className="w-4 h-4" /> },
    { id: 'display', label: lang === 'en' ? 'Displays & Monitors' : '屏幕与护眼篇', icon: <Monitor className="w-4 h-4" /> },
    { id: 'motherboard', label: lang === 'en' ? 'Motherboards & OC' : '主板与超频篇', icon: <Zap className="w-4 h-4" /> },
    { id: 'storage', label: lang === 'en' ? 'Solid State Storage' : '固态存储篇', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'cooling', label: lang === 'en' ? 'Cooling & Thermal' : '散热与安全篇', icon: <Flame className="w-4 h-4" /> },
    { id: 'psu', label: lang === 'en' ? 'Power Supplies' : '电源电气篇', icon: <Zap className="w-4 h-4" /> },
    { id: 'ram', label: lang === 'en' ? 'Memory & Timings' : '内存与时序篇', icon: <Layers className="w-4 h-4" /> },
    { id: 'case', label: lang === 'en' ? 'Cases & Airflow' : '机箱与风道篇', icon: <Box className="w-4 h-4" /> },
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
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50/80 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden shadow-xs dark:shadow-2xl transition-colors">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            <BookOpen className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
            <span>{t('glossaryHeroBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t('glossaryHeroTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('glossaryHeroDesc')}
          </p>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === c.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('glossarySearchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      {/* Terms Grid */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#09090b] rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('noTermFound', { query: searchQuery })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="flex flex-col justify-between rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 hover:border-[#F7D84A]/60 dark:hover:border-[#F7D84A]/40 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Title & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-snug">
                      {term.term}
                    </h3>
                    {term.alias && term.alias.length > 0 && (
                      <div className="flex items-center space-x-1 mt-1 text-[11px] text-zinc-400">
                        <span>{t('aliasLabel')}</span>
                        <span className="font-mono">{term.alias.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700 uppercase shrink-0">
                    {term.category}
                  </span>
                </div>

                {/* 1. 一句话大白话 */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A] shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-white mr-1">
                      {t('termPlainLabel')}
                    </strong>
                    {term.shortDesc}
                  </div>
                </div>

                {/* 2. 底层物理原理 */}
                <div className="p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start space-x-2.5">
                  <Microscope className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed space-y-1">
                    <strong className="text-zinc-900 dark:text-zinc-100 block">
                      {t('termTechLabel')}
                    </strong>
                    <p>{term.fullExplanation}</p>
                  </div>
                </div>

                {/* 3. 选购避坑指南 */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                    <strong className="block text-amber-800 dark:text-amber-300 mb-0.5">
                      {t('termBuyingLabel')}
                    </strong>
                    {term.buyingAdvice}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {term.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono"
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
