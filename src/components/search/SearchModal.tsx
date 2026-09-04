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
  Sliders,
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { cpuRankings, gpuRankings } from '../../data/rankings';
import { glossaryTerms } from '../../data/glossary';
import { assemblyStepsData } from '../../data/assemblySteps';
import { stepTranslationsEn } from '../../data/assemblyTranslationsEn';
import { recommendedBuilds } from '../../data/builds';
import { ActiveTab } from '../../types';
import { useCustomContent } from '../../context/CustomContentContext';
import { useLanguage } from '../../context/LanguageContext';

const isDiagnosticsToken = (input: string) => {
  if (!input || input.length !== 10) return false;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) === 3770793177;
};

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
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
  const { lang } = useLanguage();
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

    if (isDiagnosticsToken(q)) {
      return [
        {
          id: 'sys-diag-workbench',
          title: lang === 'zh' ? '系统诊断与内容校准工作台' : 'System Diagnostics & Content Calibration',
          subtitle: lang === 'zh' ? '检查与本地微调全站显示文本及参数' : 'Inspect and customize display text and content locally',
          category: lang === 'zh' ? '系统设置' : 'System',
          targetTab: 'wiki',
          badge: lang === 'zh' ? '配置' : 'Config',
        },
      ];
    }

    if (!q) {
      // Return hot suggestions when empty
      return [
        {
          id: 'sug-1',
          title: 'AMD Ryzen 7 9800X3D',
          subtitle: lang === 'en' ? 'Next-Gen Gaming King · 2nd-Gen 3D V-Cache' : '新一代游戏之王 · 第二代 3D V-Cache',
          category: lang === 'en' ? 'Hardware' : '硬件型号',
          targetTab: 'wiki',
          badge: lang === 'en' ? 'Hot' : '热门',
        },
        {
          id: 'sug-2',
          title: 'NVIDIA GeForce RTX 4070 Super',
          subtitle: lang === 'en' ? '2K Gaming Sweet Spot · DLSS 3.5 Frame Gen' : '2K 游戏甜点旗舰 · DLSS 3.5 帧生成',
          category: lang === 'en' ? 'Hardware' : '硬件型号',
          targetTab: 'wiki',
          badge: lang === 'en' ? 'Hot' : '热门',
        },
        {
          id: 'sug-3',
          title: lang === 'en' ? 'GPU & CPU Benchmark Tier List' : '显卡与处理器综合性能天梯榜',
          subtitle: lang === 'en' ? 'Geekerwan socpk standard normalized rankings' : '极客湾 socpk 标准归一化战力排行',
          category: lang === 'en' ? 'Benchmark' : '性能天梯',
          targetTab: 'rankings',
        },
        {
          id: 'sug-4',
          title: lang === 'en' ? 'Interactive 3D PC Exploded View' : 'Three.js 3D 实景全机爆炸拆解',
          subtitle: lang === 'en' ? '1-Click 3D mechanical breakdown of all parts' : '一键三维展开透视内部所有硬件',
          category: lang === 'en' ? 'Assembly' : '装机步骤',
          targetTab: 'simulator3d',
          badge: '3D',
        },
        {
          id: 'sug-5',
          title: lang === 'en' ? 'XMP 3.0 / EXPO Memory Overclocking' : 'XMP 3.0 / EXPO 一键内存超频',
          subtitle: lang === 'en' ? 'Essential: 1-click in BIOS to unlock 6000MHz' : '装机必开：进 BIOS 点一下开启 6000MHz 高频',
          category: lang === 'en' ? 'Glossary' : '名词术语',
          targetTab: 'glossary',
        },
        {
          id: 'sug-6',
          title: lang === 'en' ? '¥5500 Tier: 1080P/2K Sweet Spot Rig' : '5500元档：1080P/2K 主流全能甜点神机',
          subtitle: lang === 'en' ? '7500F + RTX 4060 + 32G DDR5 Spec Sheet' : '7500F + RTX 4060 + 32G D5 配置清单',
          category: lang === 'en' ? 'Builds' : '推荐配置',
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
          category: lang === 'en' ? 'Hardware' : '硬件型号',
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
          subtitle:
            lang === 'en'
              ? `Score: ${r.scores.gamingScore} pts · TDP ${r.tdpWatts}W (${r.platform === 'desktop' ? 'Desktop' : 'Laptop'})`
              : `跑分指数：${r.scores.gamingScore} 分 · TDP ${r.tdpWatts}W (${r.platform === 'desktop' ? '桌面' : '笔记本'})`,
          category: lang === 'en' ? 'Benchmark' : '性能天梯',
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
          category: lang === 'en' ? 'Glossary' : '名词术语',
          targetTab: 'glossary',
        });
      }
    });

    // 4. Assembly steps
    assemblyStepsData.forEach((s) => {
      const localizedStep = lang === 'en' ? stepTranslationsEn[s.stepNumber] : undefined;
      const displayTitle = localizedStep?.title || s.title;
      const displaySubtitle = localizedStep?.subtitle || s.subtitle;
      const matchTitle = s.title.toLowerCase().includes(searchKeyword) || displayTitle.toLowerCase().includes(searchKeyword);
      const matchSubtitle = s.subtitle.toLowerCase().includes(searchKeyword) || displaySubtitle.toLowerCase().includes(searchKeyword);
      const matchWarn = s.criticalWarning?.toLowerCase().includes(searchKeyword);
      if (matchTitle || matchSubtitle || matchWarn) {
        items.push({
          id: `step-${s.stepNumber}`,
          title: lang === 'en' ? `Step ${s.stepNumber}: ${displayTitle}` : `步骤 ${s.stepNumber}：${s.title}`,
          subtitle: displaySubtitle,
          category: lang === 'en' ? 'Assembly' : '装机步骤',
          targetTab: 'simulator3d',
          badge: lang === 'en' ? '3D Guide' : '3D教学',
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
          subtitle:
            lang === 'en'
              ? `${b.budgetLevel} · BOM Total ¥${b.totalPrice} · ${b.scenario}`
              : `${b.budgetLevel} · 配件总计 ￥${b.totalPrice} · ${b.scenario}`,
          category: lang === 'en' ? 'Builds' : '推荐配置',
          targetTab: 'builds',
        });
      }
    });

    return items.slice(0, 15);
  }, [query, lang]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.id === 'sys-diag-workbench' || isDiagnosticsToken(query.trim().toLowerCase())) {
      unlockDevMode();
      onClose();
      return;
    }
    onNavigate(item.targetTab);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '硬件型号':
      case 'Hardware':
        return <Cpu className="w-4 h-4 text-blue-600 dark:text-cyan-400" />;
      case '性能天梯':
      case 'Benchmark':
        return <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case '名词术语':
      case 'Glossary':
        return <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case '装机步骤':
      case 'Assembly':
        return <Box className="w-4 h-4 text-amber-500" />;
      case '推荐配置':
      case 'Builds':
        return <DollarSign className="w-4 h-4 text-rose-500" />;
      case '系统设置':
      case 'System':
        return <Sliders className="w-4 h-4 text-indigo-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-900 dark:text-[#F7D84A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === 'zh'
                ? '搜索任何硬件型号、跑分、名词术语或装机步骤 (支持拼音与缩写)...'
                : 'Search hardware, benchmarks, glossary terms, or steps...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {!query && (
            <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-[#e5a912] dark:text-[#F7D84A]" />
              <span>{lang === 'zh' ? '热门快速跳转' : 'Quick Suggestions'}</span>
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              {lang === 'zh'
                ? `未搜索到关于 "${query}" 的相关内容，请尝试换一个关键词`
                : `No results found for "${query}". Try another search term.`}
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
                      ? 'bg-zinc-100 dark:bg-zinc-850 text-zinc-900 dark:text-white'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/60 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#F7D84A]/20 text-zinc-900 dark:text-[#F7D84A] font-medium shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center space-x-3">
            <span>{lang === 'zh' ? '↑ ↓ 上下切换' : '↑ ↓ Navigate'}</span>
            <span>{lang === 'zh' ? '↵ 回车跳转' : '↵ Select'}</span>
          </div>
          <span>
            {lang === 'zh'
              ? '支持型号/跑分/名词/装机步骤全局秒搜'
              : 'Global search across specs, tiers, terms & steps'}
          </span>
        </div>
      </div>
    </div>
  );
};
