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
  RotateCcw,
  SlidersHorizontal,
  X,
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

interface SubFilterOption {
  id: string;
  label: string;
  matcher: (item: HardwareItem) => boolean;
}

export const HardwareWiki: React.FC<HardwareWikiProps> = ({ onNavigateToGlossary }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('all');
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

  // When category changes, reset brand and subfilter to prevent 0-result lock
  const handleCategoryChange = (newCat: HardwareCategory | 'all') => {
    setSelectedCategory(newCat);
    setSelectedBrand('all');
    setSelectedSubFilter('all');
  };

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
    if (selectedCategory === 'all') {
      const preferredIds = [
        'term-3d-vcache',
        'term-dlss-fsr',
        'term-atx3-12v2x6',
        'term-cudimm',
        'term-tlc-qlc',
        'term-vrm-phases',
        'term-ram-timing-cl',
        'term-peel-film-warning',
        'term-vapor-chamber',
      ];
      return preferredIds
        .map((id) => glossaryTerms.find((g) => g.id === id))
        .filter((g): g is GlossaryTerm => !!g);
    }

    // Map hardware category to glossary category
    const catMap: Record<string, string> = {
      cpu: 'cpu',
      gpu: 'gpu',
      motherboard: 'motherboard',
      ram: 'ram',
      storage: 'storage',
      psu: 'psu',
      cooler: 'cooling',
      case: 'case',
      laptop: 'display',
    };

    const targetGlossaryCat = catMap[selectedCategory] || selectedCategory;
    const categoryTerms = glossaryTerms.filter((gt) => gt.category === targetGlossaryCat);
    return categoryTerms.slice(0, 10);
  }, [selectedCategory]);

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

  // Dynamically compute brands from currently selected category
  const availableBrands = useMemo(() => {
    const pool = selectedCategory === 'all'
      ? hardwareList
      : hardwareList.filter((item) => item.category === selectedCategory);
    const set = new Set<string>();
    pool.forEach((item) => {
      if (item.brand && item.brand.trim()) {
        set.add(item.brand.trim());
      }
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [selectedCategory]);

  // Sub-category / Spec filter options for fine-grained ZOL-style breakdown
  const subFilterOptions = useMemo((): SubFilterOption[] => {
    switch (selectedCategory) {
      case 'cpu':
        return [
          { id: 'all', label: '全部平台', matcher: () => true },
          { id: 'am5', label: 'AMD AM5 (9000/7000)', matcher: (i) => (i.specs['插槽接口'] || '').includes('AM5') || (i.architecture || '').includes('Zen 5') || (i.architecture || '').includes('Zen 4') },
          { id: 'lga1851', label: 'Intel LGA1851 (Ultra 200S)', matcher: (i) => (i.specs['插槽接口'] || '').includes('LGA1851') || i.series.includes('Ultra') },
          { id: 'lga1700', label: 'Intel LGA1700 (14/13/12代)', matcher: (i) => (i.specs['插槽接口'] || '').includes('LGA1700') || i.series.includes('14') || i.series.includes('13') || i.series.includes('12') },
          { id: 'am4', label: 'AMD AM4 (5000性价比)', matcher: (i) => (i.specs['插槽接口'] || '').includes('AM4') || i.series.includes('5000') },
          { id: 'x3d', label: '3D V-Cache 缓存神U', matcher: (i) => i.name.includes('X3D') || i.highlights.some(h => h.includes('3D V-Cache')) },
        ];
      case 'gpu':
        return [
          { id: 'all', label: '全部显卡规格', matcher: () => true },
          { id: 'rtx50', label: 'RTX 50 系列 (Blackwell)', matcher: (i) => i.series.includes('50') || i.name.includes('5090') || i.name.includes('5080') || i.name.includes('5070') },
          { id: 'rtx40', label: 'RTX 40 系列 (Ada)', matcher: (i) => i.series.includes('40') || i.name.includes('4090') || i.name.includes('4080') || i.name.includes('4070') || i.name.includes('4060') },
          { id: 'rx7000', label: 'AMD RX 7000 系列', matcher: (i) => i.brand === 'AMD' && (i.series.includes('7000') || i.name.includes('7900') || i.name.includes('7800') || i.name.includes('7700') || i.name.includes('7600')) },
          {
            id: 'vram16g',
            label: '16GB+ 大显存 (4K/AI)',
            matcher: (i) => {
              const v = (i.specs['显存容量/类型'] || '') + (i.specs['显存容量'] || '');
              return v.includes('16GB') || v.includes('24GB') || v.includes('32GB');
            },
          },
          {
            id: 'vram12g',
            label: '12GB 甜点主流',
            matcher: (i) => {
              const v = (i.specs['显存容量/类型'] || '') + (i.specs['显存容量'] || '');
              return v.includes('12GB');
            },
          },
          {
            id: 'vram8g',
            label: '8GB 高性价比',
            matcher: (i) => {
              const v = (i.specs['显存容量/类型'] || '') + (i.specs['显存容量'] || '');
              return v.includes('8GB');
            },
          },
        ];
      case 'motherboard':
        return [
          { id: 'all', label: '全部板型/芯片组', matcher: () => true },
          { id: 'matx', label: 'M-ATX 紧凑主流', matcher: (i) => (i.specs['主板板型'] || '').includes('M-ATX') || (i.specs['主板板型'] || '').includes('Micro-ATX') || i.name.includes('M-') },
          { id: 'atx', label: 'ATX 标准大板', matcher: (i) => (i.specs['主板板型'] || '').includes('ATX') && !(i.specs['主板板型'] || '').includes('M-ATX') },
          { id: 'itx', label: 'ITX 迷你钢炮', matcher: (i) => (i.specs['主板板型'] || '').includes('ITX') || i.name.includes('ITX') },
          { id: 'b650', label: 'AMD B650 / X870', matcher: (i) => i.name.includes('B650') || i.name.includes('X870') || i.name.includes('X670') },
          { id: 'intel-board', label: 'Intel B760 / Z790 / Z890', matcher: (i) => i.name.includes('B760') || i.name.includes('Z790') || i.name.includes('Z890') },
        ];
      case 'ram':
        return [
          { id: 'all', label: '全部内存类型', matcher: () => true },
          { id: 'ddr5', label: 'DDR5 新一代', matcher: (i) => i.name.includes('DDR5') || (i.specs['标称频率'] || '').includes('DDR5') },
          { id: 'ddr4', label: 'DDR4 成熟实惠', matcher: (i) => i.name.includes('DDR4') || (i.specs['标称频率'] || '').includes('DDR4') },
          {
            id: 'freq6000',
            label: '6000MHz+ 甜点高频',
            matcher: (i) => {
              const f = (i.specs['标称频率'] || '') + i.name;
              return f.includes('6000') || f.includes('6400') || f.includes('6800') || f.includes('7200') || f.includes('8000');
            },
          },
          { id: 'rgb', label: 'RGB 神光同步', matcher: (i) => i.name.includes('RGB') || (i.specs['外观散热'] || '').includes('RGB') },
        ];
      case 'storage':
        return [
          { id: 'all', label: '全部固态规格', matcher: () => true },
          { id: 'pcie5', label: 'PCIe 5.0 旗舰 (10000MB/s+)', matcher: (i) => (i.specs['接口总线'] || '').includes('5.0') || i.name.includes('5.0') },
          { id: 'pcie4', label: 'PCIe 4.0 甜点 (7000MB/s+)', matcher: (i) => (i.specs['接口总线'] || '').includes('4.0') || i.name.includes('4.0') || i.name.includes('TiPlus') || i.name.includes('990') },
          {
            id: 'dram',
            label: '带独立 DRAM 缓存',
            matcher: (i) => {
              const c = (i.specs['独立缓存 (DRAM)'] || '');
              return c.includes('独立') || c.includes('LPDDR') || c.includes('DDR4') || c.includes('2GB') || c.includes('1GB');
            },
          },
          { id: 'cap2tb', label: '2TB 及以上大容量', matcher: (i) => i.name.includes('2TB') || i.name.includes('4TB') || (i.specs['容量'] || '').includes('2TB') },
        ];
      case 'cooler':
        return [
          { id: 'all', label: '全部散热形态', matcher: () => true },
          { id: 'aio360', label: '360 一体水冷', matcher: (i) => i.name.includes('360') || (i.specs['散热类型'] || '').includes('360') },
          { id: 'aio240', label: '240 一体水冷', matcher: (i) => i.name.includes('240') || (i.specs['散热类型'] || '').includes('240') },
          { id: 'air-dual', label: '双塔双扇六热管风冷', matcher: (i) => (i.specs['散热类型'] || '').includes('双塔') || i.name.includes('双塔') || (i.name.includes('120') && !i.name.includes('360')) },
          { id: 'air-single', label: '单塔四热管风冷', matcher: (i) => (i.specs['散热类型'] || '').includes('单塔') || i.name.includes('单塔') || (i.specs['热管规格'] || '').includes('4') },
        ];
      case 'psu':
        return [
          { id: 'all', label: '全部电源规格', matcher: () => true },
          { id: 'atx3', label: 'ATX 3.0 / 3.1 原生', matcher: (i) => i.name.includes('ATX 3') || (i.specs['标准规范'] || '').includes('ATX 3') || (i.specs['显卡原生接口'] || '').includes('12V') },
          { id: '1000w', label: '1000W+ 旗舰怪兽', matcher: (i) => i.name.includes('1000W') || i.name.includes('1200W') || i.name.includes('1300W') || (i.specs['额定功率'] || '').includes('1000W') },
          { id: '850w', label: '850W 主流 3A 甜点', matcher: (i) => i.name.includes('850W') || (i.specs['额定功率'] || '').includes('850W') },
          { id: '750w', label: '650W~750W 性价比', matcher: (i) => i.name.includes('750W') || i.name.includes('650W') || (i.specs['额定功率'] || '').includes('750W') || (i.specs['额定功率'] || '').includes('650W') },
        ];
      case 'case':
        return [
          { id: 'all', label: '全部机箱结构', matcher: () => true },
          { id: 'panoramic', label: '全景无立柱海景房', matcher: (i) => i.name.includes('海景房') || (i.specs['机箱结构'] || '').includes('海景房') || i.highlights.some(h => h.includes('海景房')) },
          { id: 'mid-tower', label: '中塔标准风道/静音', matcher: (i) => (i.specs['机箱结构'] || '').includes('中塔') || i.name.includes('North') || i.name.includes('D300') },
          { id: 'itx-matx', label: '紧凑 M-ATX / ITX', matcher: (i) => (i.specs['主板兼容'] || '').includes('ITX') || i.name.includes('AP201') || i.name.includes('A4') },
        ];
      default:
        return [];
    }
  }, [selectedCategory]);

  const activeSubFilterObj = subFilterOptions.find((o) => o.id === selectedSubFilter);

  const resetAllFilters = () => {
    setSelectedBrand('all');
    setSelectedSubFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedBrand !== 'all' || selectedSubFilter !== 'all' || searchQuery.trim() !== '';

  const filteredItems = useMemo(() => {
    let result = hardwareList.filter((item) => {
      // 1. Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // 2. Brand filter
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
        return false;
      }
      // 3. Subcategory / spec filter
      if (activeSubFilterObj && activeSubFilterObj.id !== 'all') {
        if (!activeSubFilterObj.matcher(item)) {
          return false;
        }
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesBrand = item.brand.toLowerCase().includes(query);
        const matchesSeries = item.series.toLowerCase().includes(query);
        const matchesSpecs = Object.entries(item.specs).some(
          ([k, v]) => k.toLowerCase().includes(query) || v.toLowerCase().includes(query)
        );
        const matchesHighlights = item.highlights.some((h) => h.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesSeries && !matchesSpecs && !matchesHighlights) {
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
  }, [selectedCategory, selectedBrand, activeSubFilterObj, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
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
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            {/* Top row: Search input + Sorting dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索型号、核心架构、特性 (如 9800X3D, 4070S, AM5, 3D V-Cache)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="default">{t('sortDefault')}</option>
                  <option value="price-asc">{t('sortPriceAsc')}</option>
                  <option value="price-desc">{t('sortPriceDesc')}</option>
                  <option value="tdp">{t('sortTdp')}</option>
                </select>
              </div>
            </div>

            {/* Middle row: Brand Filter Pills (Dynamic to current category) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 scrollbar-none">
              <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 flex items-center shrink-0 font-medium">
                <Filter className="w-3.5 h-3.5 mr-1 text-blue-500" />
                品牌筛选:
              </span>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedBrand === b
                      ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  {b === 'all' ? t('allBrands') : b}
                </button>
              ))}
            </div>

            {/* Bottom row: Subcategory Specification Filter (ZOL Style) */}
            {subFilterOptions.length > 0 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
                <span className="text-xs text-slate-400 dark:text-slate-500 mr-1 flex items-center shrink-0 font-medium">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                  规格深度:
                </span>
                {subFilterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSubFilter(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedSubFilter === opt.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
                  <span className="text-slate-400 text-[11px]">当前筛选:</span>
                  {selectedBrand !== 'all' && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-900 font-mono">
                      <span>品牌: {selectedBrand}</span>
                      <button onClick={() => setSelectedBrand('all')} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedSubFilter !== 'all' && activeSubFilterObj && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900">
                      <span>规格: {activeSubFilterObj.label}</span>
                      <button onClick={() => setSelectedSubFilter('all')} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900">
                      <span>搜索: "{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    (找到 {filteredItems.length} 款硬件)
                  </span>
                </div>

                <button
                  onClick={resetAllFilters}
                  className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 text-xs font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置全部筛选</span>
                </button>
              </div>
            )}
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
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                未找到匹配条件的硬件型号 (已选中分类: {selectedCategory}，品牌: {selectedBrand})
              </p>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>一键清除全部筛选并查看全部硬件</span>
              </button>
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
