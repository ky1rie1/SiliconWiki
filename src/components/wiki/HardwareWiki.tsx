import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Cpu,
  Tv,
  HardDrive,
  Box,
  Laptop,
  Flame,
  Zap,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { glossaryTerms } from '../../data/glossary';
import { HardwareCard } from './HardwareCard';
import { LaptopSection } from './LaptopSection';
import { HardwareDetailModal } from './HardwareDetailModal';
import { GlossaryPopoverModal } from '../common/GlossaryPopoverModal';
import { HardwareCategory, HardwareItem, GlossaryTerm } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HardwareWikiProps {
  onNavigateToGlossary?: () => void;
}

export const HardwareWiki: React.FC<HardwareWikiProps> = ({ onNavigateToGlossary }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'tdp'>('default');
  const [selectedDetailItem, setSelectedDetailItem] = useState<HardwareItem | null>(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const [selectionTooltip, setSelectionTooltip] = useState<{
    text: string;
    term: GlossaryTerm;
    x: number;
    y: number;
  } | null>(null);

  // Listen for user text selection to trigger term explanation card
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.glossary-selection-pill') || target.closest('[role="dialog"]')) {
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText || selectedText.length < 2 || selectedText.length > 30) {
        setSelectionTooltip(null);
        return;
      }

      const lower = selectedText.toLowerCase();
      const matched = glossaryTerms.find((gt) => {
        const idKey = gt.id.replace('term-', '').toLowerCase();
        const mainTerm = gt.term.toLowerCase();
        const aliasMatch = gt.alias?.some(
          (a) => a.toLowerCase() === lower || (a.length >= 3 && lower.includes(a.toLowerCase()))
        );
        return lower === idKey || mainTerm.includes(lower) || aliasMatch;
      });

      if (matched) {
        setSelectionTooltip({
          text: selectedText,
          term: matched,
          x: Math.min(window.innerWidth - 220, Math.max(10, e.clientX - 60)),
          y: Math.max(10, e.clientY - 45),
        });
      } else {
        setSelectionTooltip(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const quickTerms = useMemo(() => {
    const preferredIds = [
      'term-3d-vcache',
      'term-dlss-fsr',
      'term-atx3-12v2x6',
      'term-cudimm',
      'term-tlc-qlc',
      'term-vrm-phases',
      'term-ram-timing-cl',
      'term-dual-channel',
      'term-peel-film-warning',
      'term-vapor-chamber',
      'term-slc-cache',
      'term-wifi7-25g',
      'term-screen-panel',
    ];
    return preferredIds
      .map((id) => glossaryTerms.find((g) => g.id === id))
      .filter((g): g is GlossaryTerm => !!g);
  }, []);

  const categories: { id: HardwareCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('catAll'), icon: <Layers className="w-4 h-4" /> },
    { id: 'cpu', label: t('catCpu'), icon: <Cpu className="w-4 h-4" /> },
    { id: 'gpu', label: t('catGpu'), icon: <Tv className="w-4 h-4" /> },
    { id: 'laptop', label: t('catLaptop'), icon: <Laptop className="w-4 h-4" /> },
    { id: 'motherboard', label: t('catMotherboard'), icon: <Zap className="w-4 h-4" /> },
    { id: 'ram', label: t('catRam'), icon: <Zap className="w-4 h-4" /> },
    { id: 'storage', label: t('catStorage'), icon: <HardDrive className="w-4 h-4" /> },
    { id: 'psu', label: t('catPsu'), icon: <Zap className="w-4 h-4" /> },
    { id: 'cooler', label: t('catCooler'), icon: <Flame className="w-4 h-4" /> },
    { id: 'case', label: t('catCase'), icon: <Box className="w-4 h-4" /> },
  ];

  const brands = ['all', 'Intel', 'AMD', 'NVIDIA', 'Apple'];

  const filteredItems = useMemo(() => {
    let result = hardwareList.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesSeries = item.series.toLowerCase().includes(query);
        const matchesHighlights = item.highlights.some((h) => h.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesSeries && !matchesHighlights) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.marketPriceRange[0] - b.marketPriceRange[0]);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.marketPriceRange[0] - a.marketPriceRange[0]);
    } else if (sortBy === 'tdp') {
      result.sort((a, b) => b.tdpWatts - a.tdpWatts);
    }

    return result;
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Special Laptop Guide Section */}
      {selectedCategory === 'laptop' ? (
        <LaptopSection />
      ) : (
        <>
          {/* Filter, Search and Sorting Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索型号、核心、特性 (如 9800X3D, 4070S, 3D V-Cache)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
              />
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1" />
                {t('brandFilter')}
              </span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedBrand === b
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {b === 'all' ? t('allBrands') : b}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="default">{t('sortDefault')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="tdp">{t('sortTdp')}</option>
              </select>
            </div>
          </div>

          {/* Quick Technical Term Shelf */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 mr-1 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>核心技术宝典速查：</span>
            </div>
            {quickTerms.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedGlossaryTerm(term)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-600 hover:bg-blue-50/50 dark:hover:bg-slate-850 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 whitespace-nowrap shadow-2xs transition-all"
                title={`点击查看「${term.term}」详细技术名词解释`}
              >
                <span>{term.term.split(' ')[0]}</span>
                {term.alias?.[0] && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({term.alias[0]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Hardware Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                未找到匹配 "{searchQuery}" 的硬件型号，请尝试更换关键词
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <HardwareCard
                  key={item.id}
                  item={item}
                  onOpenSpecs={(hardware) => setSelectedDetailItem(hardware)}
                  onOpenTerm={(term) => setSelectedGlossaryTerm(term)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Selection Tooltip Badge */}
      {selectionTooltip && (
        <div
          style={{ top: `${selectionTooltip.y}px`, left: `${selectionTooltip.x}px` }}
          className="fixed z-40 glossary-selection-pill animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              setSelectedGlossaryTerm(selectionTooltip.term);
              setSelectionTooltip(null);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-blue-500/30 transition-transform active:scale-95 border border-white/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>解读「{selectionTooltip.term.term.split(' ')[0]}」</span>
          </button>
        </div>
      )}

      {/* Hardware Deep Dive Inspection Modal */}
      {selectedDetailItem && (
        <HardwareDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Interactive Glossary Term Popover Modal */}
      {selectedGlossaryTerm && (
        <GlossaryPopoverModal
          term={selectedGlossaryTerm}
          isOpen={!!selectedGlossaryTerm}
          onClose={() => setSelectedGlossaryTerm(null)}
          onNavigateToGlossary={onNavigateToGlossary}
        />
      )}
    </div>
  );
};
