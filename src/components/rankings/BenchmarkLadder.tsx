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

  const filteredAndSortedList = useMemo(() => {
    return rawList
      .filter((item) => {
        if (!includeLaptop && item.platform === 'laptop') return false;
        if (searchQuery.trim()) {
          return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => getScore(b) - getScore(a));
  }, [rawList, includeLaptop, searchQuery, scoreMode]);

  const maxScore = useMemo(() => {
    if (filteredAndSortedList.length === 0) return 100;
    return Math.max(...filteredAndSortedList.map(getScore));
  }, [filteredAndSortedList, scoreMode]);

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
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                scoreMode === mode.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
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

      {/* Ladder Chart Bars */}
      <div className="space-y-3 bg-white dark:bg-[#09090b] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{t('rankColRank')}</span>
          <div className="flex items-center space-x-6">
            <span>{t('rankColPower')}</span>
            <span className="w-24 text-right">{t('rankColScore')}</span>
            <span className="w-16 text-center">{t('rankColPk')}</span>
          </div>
        </div>

        {filteredAndSortedList.map((item, index) => {
          const score = getScore(item);
          const percentage = Math.max(8, Math.round((score / maxScore) * 100));
          const isSelected = selectedForPK.includes(item.id);

          return (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-zinc-100 dark:bg-zinc-850/80 border-[#F7D84A] dark:border-[#F7D84A]/80 shadow-md'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/60 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
              }`}
            >
              {/* Left Title & Platform */}
              <div className="flex items-center space-x-3 sm:w-1/3 min-w-0">
                <span
                  className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    index === 0
                      ? 'bg-[#F7D84A] text-zinc-950 shadow-xs'
                      : index === 1
                      ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white'
                      : index === 2
                      ? 'bg-amber-600/80 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {index + 1}
                </span>

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

                  {/* Luminous Fill Bar */}
                  <div
                    className={`h-full rounded-md transition-all duration-700 relative overflow-hidden flex items-center justify-end pr-1 shadow-xs ${
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

                  {/* Micro Relative Scale Text overlay */}
                  <span className="absolute right-2 text-[9px] font-mono text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white pointer-events-none transition-colors">
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Right Metrics & PK button */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 flex items-center">
                  <Zap className="w-3 h-3 text-amber-500 mr-0.5" />
                  {item.tdpWatts}W
                </span>

                <div className="w-24 text-right">
                  <span className="text-sm font-black font-mono text-zinc-900 dark:text-white group-hover:text-[#F7D84A] dark:group-hover:text-[#F7D84A] transition-colors">
                    {score}
                  </span>
                  <span className="text-[10px] text-zinc-400 ml-1">{t('scoreUnitPts')}</span>
                </div>

                <button
                  onClick={() => togglePKSelection(item.id)}
                  className={`w-20 flex items-center justify-center space-x-1 py-1 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckSquare className="w-3 h-3" />
                      <span>{t('btnAddedToPk')}</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3" />
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
