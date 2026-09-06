import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Tv,
  Gamepad2,
  Zap,
  Layers,
  Swords,
  ExternalLink,
  Laptop,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { cpuRankings, gpuRankings } from '../../data/rankings';
import { BenchmarkItem } from '../../types';
import { HardwarePKModal } from './HardwarePKModal';
import { useLanguage } from '../../context/LanguageContext';

export interface RankedBenchmarkItem extends BenchmarkItem {
  globalRank: number;
  isTied?: boolean;
}

export const BenchmarkLadder: React.FC = () => {
  const { t, lang } = useLanguage();
  const [hardwareType, setHardwareType] = useState<'cpu' | 'gpu'>('gpu');
  const [scoreMode, setScoreMode] = useState<'gaming' | 'productivity' | 'efficiency'>('gaming');
  const [includeLaptop, setIncludeLaptop] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForPK, setSelectedForPK] = useState<string[]>([]);
  const [isPKModalOpen, setIsPKModalOpen] = useState(false);

  const rawList = hardwareType === 'cpu' ? cpuRankings : gpuRankings;

  const getScore = (item: BenchmarkItem) => {
    if (scoreMode === 'productivity') return item.scores.productivityScore;
    if (scoreMode === 'efficiency') return item.scores.efficiencyScore;
    return item.scores.gamingScore;
  };

  // 1. Filter by platform scope (desktop vs laptop chips)
  const platformFilteredList = useMemo(() => {
    return rawList.filter((item) => {
      if (!includeLaptop && item.platform === 'laptop') return false;
      return true;
    });
  }, [rawList, includeLaptop]);

  const getSecondaryScore = (item: BenchmarkItem) => {
    if (scoreMode === 'gaming') return item.scores.productivityScore;
    if (scoreMode === 'productivity') return item.scores.gamingScore;
    return item.scores.gamingScore;
  };

  // 2. Calculate true absolute rank in the tier list for currently selected score dimension
  // Multi-level deterministic sorting (Primary: score, Secondary: complementary score, Tertiary: ID)
  // Dense/competition ranking: items with identical scores share the exact same rank number
  const rankedBenchmarkList = useMemo<RankedBenchmarkItem[]>(() => {
    const sorted = [...platformFilteredList].sort((a, b) => {
      const primaryDiff = getScore(b) - getScore(a);
      if (primaryDiff !== 0) return primaryDiff;
      const secondaryDiff = getSecondaryScore(b) - getSecondaryScore(a);
      if (secondaryDiff !== 0) return secondaryDiff;
      return a.id.localeCompare(b.id);
    });

    const ranked: RankedBenchmarkItem[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      const isTiedWithPrev = i > 0 && getScore(item) === getScore(sorted[i - 1]);
      const globalRank = isTiedWithPrev ? ranked[i - 1].globalRank : i + 1;
      ranked.push({
        ...item,
        globalRank,
      });
    }

    // Mark items that share rank with others
    for (let i = 0; i < ranked.length; i++) {
      const prevScore = i > 0 ? getScore(ranked[i - 1]) : null;
      const nextScore = i < ranked.length - 1 ? getScore(ranked[i + 1]) : null;
      const curScore = getScore(ranked[i]);
      ranked[i].isTied = curScore === prevScore || curScore === nextScore;
    }

    return ranked;
  }, [platformFilteredList, scoreMode]);

  // 3. Filter according to search query, preserving true globalRank
  const filteredAndSortedList = useMemo(() => {
    if (!searchQuery.trim()) return rankedBenchmarkList;
    const q = searchQuery.toLowerCase();
    return rankedBenchmarkList.filter((item) => item.name.toLowerCase().includes(q));
  }, [rankedBenchmarkList, searchQuery]);

  const maxScore = useMemo(() => {
    if (rankedBenchmarkList.length === 0) return 100;
    return Math.max(...rankedBenchmarkList.map(getScore));
  }, [rankedBenchmarkList, scoreMode]);

  const getActiveDimensionDescription = () => {
    if (scoreMode === 'productivity') return t('ladderDimProductivity');
    if (scoreMode === 'efficiency') return t('ladderDimEfficiency');
    if (hardwareType === 'cpu') {
      return lang === 'en'
        ? '3A Gaming Performance (Normalized to Mainstream Core i5 / Ryzen 5 as 100 pts Baseline)'
        : '3A 游戏性能排行 (以主流游戏处理器 (Core i5 / Ryzen 5) 为 100 分基准标尺)';
    }
    return t('ladderDimGaming');
  };

  const getScoreDimensionLabel = (item: BenchmarkItem) => {
    if (scoreMode === 'productivity') return t('ladderScoreLabelProductivity');
    if (scoreMode === 'efficiency') return t('ladderScoreLabelEfficiency');
    if (hardwareType === 'gpu' && item.id === 'rank-gpu-4060') {
      return lang === 'en' ? 'Baseline: 100%' : '基准: 100%';
    }
    return t('ladderScoreLabelGaming');
  };

  const togglePKSelection = (id: string) => {
    if (selectedForPK.includes(id)) {
      setSelectedForPK(selectedForPK.filter((i) => i !== id));
    } else {
      if (selectedForPK.length >= 3) {
        alert(t('pkLimitAlert'));
        return;
      }
      setSelectedForPK([...selectedForPK, id]);
    }
  };

  const pkItems = rawList.filter((item) => selectedForPK.includes(item.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Geekerwan Attribution */}
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50/80 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden shadow-xs dark:shadow-2xl transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
              <span>{t('rankHeroBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {t('rankHeroTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('rankHeroDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://socpk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>{t('btnGeekerwan')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F7D84A] dark:text-[#d4990d]" />
            </a>
            <a
              href="https://www.techpowerup.com/gpu-specs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            >
              <span>{t('btnTechPowerUp')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Control Tabs & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Hardware Switch (CPU vs GPU) */}
        <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80">
          <button
            onClick={() => {
              setHardwareType('gpu');
              setSelectedForPK([]);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 hover:scale-[1.02] ${
              hardwareType === 'gpu'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
            <span>{t('tabGpuRank')}</span>
          </button>
          <button
            onClick={() => {
              setHardwareType('cpu');
              setSelectedForPK([]);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 hover:scale-[1.02] ${
              hardwareType === 'cpu'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
            <span>{t('tabCpuRank')}</span>
          </button>
        </div>

        {/* Score Dimension Switch */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { id: 'gaming', label: t('modeGaming'), icon: <Gamepad2 className="w-3.5 h-3.5" /> },
            { id: 'productivity', label: t('modeProductivity'), icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'efficiency', label: t('modeEfficiency'), icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setScoreMode(mode.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-95 hover:scale-[1.02] ${
                scoreMode === mode.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs ring-1 ring-zinc-900/10 dark:ring-white/20'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Laptop Switch & Search Filter */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLaptop}
              onChange={(e) => setIncludeLaptop(e.target.checked)}
              className="rounded text-zinc-900 focus:ring-zinc-900 w-4 h-4"
            />
            <span className="flex items-center space-x-1">
              <Laptop className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t('includeLaptopChips')}</span>
            </span>
          </label>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('filterModel')}
            className="w-32 sm:w-40 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
          />
        </div>
      </div>

      {/* Efficiency Disclaimer Banner */}
      {scoreMode === 'efficiency' && (
        <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed shadow-xs">
          <span className="shrink-0 text-base select-none">⚠️</span>
          <div>
            {lang === 'en'
              ? 'Performance-per-Watt efficiency reflects performance output per watt (mobile and low-power architectures naturally hold an advantage), rather than absolute maximum performance. To compare raw performance, please switch to [3A Gaming Performance] or [Multi-Core Productivity].'
              : '每瓦能效比反映的是每瓦性能产出（移动端与低功耗架构天然占优），并非纯粹绝对性能极限。如需对比纯战力，请切换至【3A 游戏性能】或【多核生产力】。'}
          </div>
        </div>
      )}

      {/* Ladder Chart Bars */}
      <div className="space-y-4 bg-white dark:bg-[#09090b] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Context Indicator & Brand Color Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          {/* Active Dimension Context */}
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
              {scoreMode === 'gaming' && <Gamepad2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              {scoreMode === 'productivity' && <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              {scoreMode === 'efficiency' && <Zap className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                {getActiveDimensionDescription()}
              </div>
            </div>
          </div>

          {/* Brand Color Legend (Glassmorphic Pill Badges) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 select-none">
              {t('ladderLegendTitle')}
            </span>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>{t('ladderBrandNvidia')}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <span>{t('ladderBrandAmd')}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span>{t('ladderBrandIntel')}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 dark:bg-zinc-800/60 border border-zinc-400/30 dark:border-zinc-600/40 text-zinc-700 dark:text-zinc-300 backdrop-blur-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>{t('ladderBrandApple')}</span>
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center justify-between pb-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          <span>{t('rankColRank')}</span>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span>{t('rankColPower')}</span>
            <span className="w-28 sm:w-36 text-right">{t('rankColScore')}</span>
            <span className="w-20 sm:w-22 text-center">{t('rankColPk')}</span>
          </div>
        </div>

        {filteredAndSortedList.length === 0 && (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-sm">
            {lang === 'en' ? 'No matching hardware found' : '未找到匹配的芯片型号'}
          </div>
        )}

        {filteredAndSortedList.map((item, searchIndex) => {
          const score = getScore(item);
          const percentage = maxScore > 0 ? Math.min(100, Math.max(8, Math.round((score / maxScore) * 100))) : 8;
          const isSelected = selectedForPK.includes(item.id);
          const isSearchActive = Boolean(searchQuery.trim());

          return (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-zinc-100 dark:bg-zinc-850/80 border-[#F7D84A] dark:border-[#F7D84A]/80 shadow-md'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/60 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
              }`}
            >
              {/* Left Title & Platform & Global Rank Badge */}
              <div className="flex items-center space-x-3 sm:w-1/3 min-w-0">
                {isSearchActive ? (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className="min-w-[1.75rem] h-6 px-1.5 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/80"
                      title={t('ladderSearchResultIndex', { index: searchIndex + 1 })}
                    >
                      №{searchIndex + 1}
                    </span>
                    <span
                      className={`min-w-[4.5rem] h-6 px-2 shrink-0 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-transform ${
                        item.globalRank === 1
                          ? 'bg-[#F7D84A] text-zinc-950 shadow-xs ring-1 ring-[#F7D84A]/60'
                          : item.globalRank === 2
                          ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white ring-1 ring-zinc-400/50'
                          : item.globalRank === 3
                          ? 'bg-amber-600/85 text-white ring-1 ring-amber-600/50'
                          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60'
                      }`}
                      title={item.isTied ? t('ladderTiedTooltip', { rank: item.globalRank }) : t('ladderGlobalRankBadge', { rank: item.globalRank })}
                    >
                      {t('ladderGlobalRankBadge', { rank: item.globalRank })}
                      {item.isTied && (
                        <span className="text-[9px] ml-1 px-1 rounded bg-black/10 dark:bg-white/15">
                          {t('ladderTiedBadge')}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span
                      className={`min-w-[2.25rem] h-6 px-1.5 shrink-0 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-transform ${
                        item.globalRank === 1
                          ? 'bg-[#F7D84A] text-zinc-950 shadow-xs ring-1 ring-[#F7D84A]/60'
                          : item.globalRank === 2
                          ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white ring-1 ring-zinc-400/50'
                          : item.globalRank === 3
                          ? 'bg-amber-600/85 text-white ring-1 ring-amber-600/50'
                          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60'
                      }`}
                      title={item.isTied ? t('ladderTiedTooltip', { rank: item.globalRank }) : `#${item.globalRank}`}
                    >
                      #{item.globalRank}
                    </span>
                    {item.isTied && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono border border-zinc-200/60 dark:border-zinc-700/60 shrink-0"
                        title={t('ladderTiedTooltip', { rank: item.globalRank })}
                      >
                        {t('ladderTiedBadge')}
                      </span>
                    )}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    {item.platform === 'laptop' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        {lang === 'en' ? 'Laptop' : '笔记本'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Precision Machined Grooved Benchmark Gauge */}
              <div className="flex-1 mx-2 sm:mx-4">
                <div className="machined-groove-track h-4.5 sm:h-5 w-full rounded-lg overflow-hidden p-0.5 flex items-center relative bg-zinc-200 dark:bg-zinc-850">
                  {/* Subtle Scale Divider Ticks */}
                  <div className="absolute inset-0 pointer-events-none flex justify-between px-[25%] opacity-30">
                    <div className="w-[1px] h-full bg-white/40" />
                    <div className="w-[1px] h-full bg-white/40" />
                  </div>
                  <div className="absolute inset-0 pointer-events-none flex justify-center opacity-40">
                    <div className="w-[1px] h-full bg-zinc-400/50" />
                  </div>

                  {/* Luminous Fill Bar with Eased Transition */}
                  <div
                    className={`h-full rounded-md transition-all duration-700 ease-out relative overflow-hidden flex items-center justify-end pr-1 shadow-xs ${
                      item.brand === 'NVIDIA'
                        ? 'bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-400 shadow-emerald-500/20'
                        : item.brand === 'AMD'
                        ? 'bg-gradient-to-r from-rose-700 via-rose-500 to-amber-400 shadow-rose-500/20'
                        : item.brand === 'Apple'
                        ? 'bg-gradient-to-r from-slate-600 via-slate-400 to-zinc-200 shadow-slate-400/20'
                        : 'bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-300 shadow-blue-500/20'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Top Specular Line */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    {/* End Cursor Glowing Pip */}
                    <div className="w-1.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#fff] shrink-0" />
                  </div>
                </div>
              </div>

              {/* Right Metrics & PK button */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 shrink-0">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 flex items-center">
                  <Zap className="w-3 h-3 text-amber-500 mr-0.5" />
                  {item.tdpWatts}W
                </span>

                <div className="w-28 sm:w-36 text-right shrink-0">
                  <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-tight truncate">
                    {getScoreDimensionLabel(item)}
                  </div>
                  <div className="text-sm font-black font-mono text-zinc-900 dark:text-white group-hover:text-[#d4990d] dark:group-hover:text-[#F7D84A] transition-colors leading-tight">
                    {score}{' '}
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                      {scoreMode === 'efficiency'
                        ? (lang === 'en' ? 'pts (Per-Watt)' : 'pts (每瓦效能)')
                        : 'pts'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => togglePKSelection(item.id)}
                  className={`w-20 sm:w-22 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none active:scale-[0.98] hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs ring-1 ring-zinc-900/10 dark:ring-white/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
                      <span>{t('btnAddedToPk')}</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{t('btnAddToPk')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Dock for Selected PK */}
      {selectedForPK.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-4 px-6 py-3.5 rounded-2xl bg-zinc-900/95 dark:bg-[#09090b]/95 text-white shadow-2xl border border-zinc-700 dark:border-zinc-800 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
            <Swords className="w-4 h-4 text-[#F7D84A]" />
            <span>{t('pkDockTitle', { count: selectedForPK.length })}</span>
          </div>

          <button
            onClick={() => setIsPKModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-[#F7D84A] text-zinc-950 font-bold text-xs hover:bg-[#e5a912] shadow-sm transition-colors cursor-pointer"
          >
            {t('btnOpenPk')}
          </button>

          <button
            onClick={() => setSelectedForPK([])}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {t('btnClearPk')}
          </button>
        </div>
      )}

      {/* PK Modal */}
      <HardwarePKModal
        isOpen={isPKModalOpen}
        onClose={() => setIsPKModalOpen(false)}
        selectedItems={pkItems}
        onRemoveItem={(id) => setSelectedForPK(selectedForPK.filter((i) => i !== id))}
        scoreMode={scoreMode}
      />
    </div>
  );
};
