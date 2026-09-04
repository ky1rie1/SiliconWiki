import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Cpu,
  BarChart3,
  BookOpen,
  Box,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { cpuRankings, gpuRankings } from '../../data/rankings';
import { glossaryTerms } from '../../data/glossary';
import { assemblyStepsData } from '../../data/assemblySteps';
import { recommendedBuilds } from '../../data/builds';
import { ActiveTab } from '../../types';
import { useCustomContent } from '../../context/CustomContentContext';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: '硬件型号' | '性能天梯' | '名词术语' | '装机步骤' | '推荐配置' | '开发者模式';
  targetTab: ActiveTab;
  badge?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { unlockDevMode } = useCustomContent();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Ctrl+K, /, and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Toggle search modal from parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregated Search Results
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();

    // Hidden Developer Secret: ky1rie1101 unlocks full webmaster developer mode
    if (q === 'ky1rie1101') {
      return [
        {
          id: 'dev-mode-secret',
          title: '🔓 开启开发者调试与文案速改工作台',
          subtitle: '暗号验证通过！按 Enter 或点击即可立即进入开发者工作台',
          category: '开发者模式',
          targetTab: 'wiki',
          badge: '站长特权',
        },
      ];
    }

    if (!q) {
      // Return hot suggestions when empty
      return [
        {
          id: 'sug-1',
          title: 'AMD Ryzen 7 9800X3D',
          subtitle: '新一代游戏之王 · 第二代 3D V-Cache',
          category: '硬件型号',
          targetTab: 'wiki',
          badge: '热门',
        },
        {
          id: 'sug-2',
          title: 'NVIDIA GeForce RTX 4070 Super',
          subtitle: '2K 游戏甜点旗舰 · DLSS 3.5 帧生成',
          category: '硬件型号',
          targetTab: 'wiki',
          badge: '热门',
        },
        {
          id: 'sug-3',
          title: '显卡与处理器综合性能天梯榜',
          subtitle: '极客湾 socpk 标准归一化战力排行',
          category: '性能天梯',
          targetTab: 'rankings',
        },
        {
          id: 'sug-4',
          title: 'Three.js 3D 实景全机爆炸拆解',
          subtitle: '一键三维展开透视内部所有硬件',
          category: '装机步骤',
          targetTab: 'simulator3d',
          badge: '3D',
        },
        {
          id: 'sug-5',
          title: 'XMP 3.0 / EXPO 一键内存超频',
          subtitle: '装机必开：进 BIOS 点一下开启 6000MHz 高频',
          category: '名词术语',
          targetTab: 'glossary',
        },
        {
          id: 'sug-6',
          title: '5500元档：1080P/2K 主流全能甜点神机',
          subtitle: '7500F + RTX 4060 + 32G D5 配置清单',
          category: '推荐配置',
          targetTab: 'builds',
        },
      ];
    }

    const items: SearchResultItem[] = [];

    // Helper for fuzzy acronym matching (e.g. 4070s -> 4070 super, 98x3d -> 9800x3d)
    const normalizeAcronym = (text: string) => {
      return text
        .toLowerCase()
        .replace(/4070s/g, '4070 super')
        .replace(/4060ti/g, '4060 ti')
        .replace(/4070ti/g, '4070 ti')
        .replace(/4080s/g, '4080 super')
        .replace(/98x3d/g, '9800x3d')
        .replace(/78x3d/g, '7800x3d')
        .replace(/zj/g, '装机');
    };

    const searchKeyword = normalizeAcronym(q);

    // 1. Hardware items
    hardwareList.forEach((h) => {
      const matchName = h.name.toLowerCase().includes(searchKeyword);
      const matchBrand = h.brand.toLowerCase().includes(searchKeyword);
      const matchSeries = h.series.toLowerCase().includes(searchKeyword);
      const matchHighlights = h.highlights.some((hl) => hl.toLowerCase().includes(searchKeyword));
      if (matchName || matchBrand || matchSeries || matchHighlights) {
        items.push({
          id: `hw-${h.id}`,
          title: h.name,
          subtitle: `${h.brand} · ${h.category.toUpperCase()} · ￥${h.marketPriceRange[0]}~${h.marketPriceRange[1]}`,
          category: '硬件型号',
          targetTab: 'wiki',
          badge: h.badge,
        });
      }
    });

    // 2. Benchmark rankings
    const allRanks = [...cpuRankings, ...gpuRankings];
    allRanks.forEach((r) => {
      if (r.name.toLowerCase().includes(searchKeyword)) {
        items.push({
          id: `rank-${r.id}`,
          title: r.name,
          subtitle: `跑分指数：${r.scores.gamingScore} 分 · TDP ${r.tdpWatts}W (${r.platform === 'desktop' ? '桌面' : '笔记本'})`,
          category: '性能天梯',
          targetTab: 'rankings',
        });
      }
    });

    // 3. Glossary terms
    glossaryTerms.forEach((g) => {
      const matchTerm = g.term.toLowerCase().includes(searchKeyword);
      const matchAlias = g.alias?.some((a) => a.toLowerCase().includes(searchKeyword));
      const matchDesc = g.shortDesc.toLowerCase().includes(searchKeyword);
      if (matchTerm || matchAlias || matchDesc) {
        items.push({
          id: `glossary-${g.id}`,
          title: g.term,
          subtitle: g.shortDesc,
          category: '名词术语',
          targetTab: 'glossary',
        });
      }
    });

    // 4. Assembly steps
    assemblyStepsData.forEach((s) => {
      const matchTitle = s.title.toLowerCase().includes(searchKeyword);
      const matchSubtitle = s.subtitle.toLowerCase().includes(searchKeyword);
      const matchWarn = s.criticalWarning?.toLowerCase().includes(searchKeyword);
      if (matchTitle || matchSubtitle || matchWarn) {
        items.push({
          id: `step-${s.stepNumber}`,
          title: `步骤 ${s.stepNumber}：${s.title}`,
          subtitle: s.subtitle,
          category: '装机步骤',
          targetTab: 'simulator3d',
          badge: '3D教学',
        });
      }
    });

    // 5. Recommended builds
    recommendedBuilds.forEach((b) => {
      const matchTitle = b.title.toLowerCase().includes(searchKeyword);
      const matchTagline = b.tagline.toLowerCase().includes(searchKeyword);
      const matchPart = b.parts.some((p) => p.name.toLowerCase().includes(searchKeyword));
      if (matchTitle || matchTagline || matchPart) {
        items.push({
          id: `build-${b.id}`,
          title: b.title,
          subtitle: `${b.budgetLevel} · 配件总计 ￥${b.totalPrice} · ${b.scenario}`,
          category: '推荐配置',
          targetTab: 'builds',
        });
      }
    });

    return items.slice(0, 15);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.id === 'dev-mode-secret' || query.trim().toLowerCase() === 'ky1rie1101') {
      unlockDevMode();
      onClose();
      return;
    }
    onNavigate(item.targetTab);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim().toLowerCase() === 'ky1rie1101') {
        unlockDevMode();
        onClose();
        return;
      }
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case '硬件型号':
        return <Cpu className="w-4 h-4 text-blue-500" />;
      case '性能天梯':
        return <BarChart3 className="w-4 h-4 text-indigo-500" />;
      case '名词术语':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case '装机步骤':
        return <Box className="w-4 h-4 text-cyan-500" />;
      case '推荐配置':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case '开发者模式':
        return <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="搜索任何硬件型号、跑分、名词术语或装机步骤 (支持拼音与缩写)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {!query && (
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>热门快速跳转</span>
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              未搜索到关于 "{query}" 的相关内容，请尝试换一个关键词
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-cyan-300 font-medium shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑ ↓ 上下切换</span>
            <span>↵ 回车跳转</span>
          </div>
          <span>支持型号/跑分/名词/装机步骤全局秒搜</span>
        </div>
      </div>
    </div>
  );
};
