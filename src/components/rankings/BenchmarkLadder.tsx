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

export const BenchmarkLadder: React.FC = () => {
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
        alert('PK 对比台最多支持同时比对 3 款硬件！');
        return;
      }
      setSelectedForPK([...selectedForPK, id]);
    }
  };

  const pkItems = rawList.filter((item) => selectedForPK.includes(item.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Geekerwan Attribution */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-200/50 dark:border-blue-800/40 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>多维性能天梯排行榜</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              标准归一化战力天梯 · 拒绝盲目跑分
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              数据深度整合<strong>极客湾（Geekerwan / socpk.com）</strong>
              实测能效比体系与 UL 3DMark TimeSpy 基准。以经典甜点卡 RTX 4060 桌面版作为 100%
              基准标尺，直观洞悉性能差距。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://socpk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>极客湾官方天梯直达</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.techpowerup.com/gpu-specs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <span>TechPowerUp 数据库</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Control Tabs & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        {/* Hardware Switch (CPU vs GPU) */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => {
              setHardwareType('gpu');
              setSelectedForPK([]);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              hardwareType === 'gpu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>显卡 GPU 天梯</span>
          </button>
          <button
            onClick={() => {
              setHardwareType('cpu');
              setSelectedForPK([]);
            }}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              hardwareType === 'cpu'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>处理器 CPU 天梯</span>
          </button>
        </div>

        {/* Score Dimension Switch */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { id: 'gaming', label: '大型 3A 游戏表现', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
            { id: 'productivity', label: '生产力 / 渲染剪辑', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'efficiency', label: '每瓦能效比', icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setScoreMode(mode.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                scoreMode === mode.id
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-900'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Laptop Switch & Search Filter */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLaptop}
              onChange={(e) => setIncludeLaptop(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="flex items-center space-x-1">
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>包含移动笔记本芯片</span>
            </span>
          </label>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="过滤型号..."
            className="w-32 sm:w-40 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Ladder Chart Bars */}
      <div className="space-y-3 bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          <span>排名 / 芯片型号</span>
          <div className="flex items-center space-x-6">
            <span>功耗</span>
            <span className="w-24 text-right">综合战力指标</span>
            <span className="w-16 text-center">PK 对比</span>
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
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-cyan-500/80 shadow-md'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-850/60 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
              }`}
            >
              {/* Left Title & Platform */}
              <div className="flex items-center space-x-3 sm:w-1/3 min-w-0">
                <span
                  className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                    index === 0
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : index === 1
                      ? 'bg-slate-300 text-slate-900'
                      : index === 2
                      ? 'bg-amber-700/60 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    {item.platform === 'laptop' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                        笔记本
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Relative Bar */}
              <div className="flex-1 mx-2 sm:mx-4">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.brand === 'NVIDIA'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : item.brand === 'AMD'
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : item.brand === 'Apple'
                        ? 'bg-gradient-to-r from-slate-600 to-slate-400'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Right Metrics & PK button */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center">
                  <Zap className="w-3 h-3 text-amber-500 mr-0.5" />
                  {item.tdpWatts}W
                </span>

                <div className="w-24 text-right">
                  <span className="text-sm font-black font-mono text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {score}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">分</span>
                </div>

                <button
                  onClick={() => togglePKSelection(item.id)}
                  className={`w-20 flex items-center justify-center space-x-1 py-1 px-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckSquare className="w-3 h-3" />
                      <span>已加入</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3" />
                      <span>对比</span>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-4 px-6 py-3.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-slate-700 dark:border-cyan-700/60 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>已选择 {selectedForPK.length} 款硬件待比拼</span>
          </div>

          <button
            onClick={() => setIsPKModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-md transition-colors"
          >
            开启横向 PK 对决
          </button>

          <button
            onClick={() => setSelectedForPK([])}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            清空
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
