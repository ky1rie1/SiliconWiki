import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { HardwareCard } from './HardwareCard';
import { LaptopSection } from './LaptopSection';
import { HardwareCategory } from '../../types';

export const HardwareWiki: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'tdp'>('default');

  const categories: { id: HardwareCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: '全配件一览', icon: <Layers className="w-4 h-4" /> },
    { id: 'cpu', label: '中央处理器 CPU', icon: <Cpu className="w-4 h-4" /> },
    { id: 'gpu', label: '图形显卡 GPU', icon: <Tv className="w-4 h-4" /> },
    { id: 'laptop', label: '💻 笔记本专区', icon: <Laptop className="w-4 h-4" /> },
    { id: 'motherboard', label: '主板 Motherboard', icon: <Zap className="w-4 h-4" /> },
    { id: 'ram', label: '内存 RAM', icon: <Zap className="w-4 h-4" /> },
    { id: 'storage', label: '高速固态 SSD', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'psu', label: '电源 PSU', icon: <Zap className="w-4 h-4" /> },
    { id: 'cooler', label: '散热系统 Cooler', icon: <Flame className="w-4 h-4" /> },
    { id: 'case', label: '机箱 Chassis', icon: <Box className="w-4 h-4" /> },
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
                品牌:
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
                  {b === 'all' ? '全部' : b}
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
                <option value="default">默认推荐排序</option>
                <option value="price-asc">参考价从低到高</option>
                <option value="price-desc">参考价从高到低</option>
                <option value="tdp">功耗从大到小</option>
              </select>
            </div>
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
                <HardwareCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
