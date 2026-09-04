import React from 'react';
import { X, Swords, Zap, ExternalLink, Trophy, Check } from 'lucide-react';
import { BenchmarkItem } from '../../types';

interface HardwarePKModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: BenchmarkItem[];
  onRemoveItem: (id: string) => void;
  scoreMode: 'gaming' | 'productivity' | 'efficiency';
}

export const HardwarePKModal: React.FC<HardwarePKModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onRemoveItem,
  scoreMode,
}) => {
  if (!isOpen || selectedItems.length === 0) return null;

  const getActiveScore = (item: BenchmarkItem) => {
    if (scoreMode === 'productivity') return item.scores.productivityScore;
    if (scoreMode === 'efficiency') return item.scores.efficiencyScore;
    return item.scores.gamingScore;
  };

  const maxScore = Math.max(...selectedItems.map((item) => getActiveScore(item)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                硬件横向 PK 比拼对决台
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                当前比拼模式：
                {scoreMode === 'gaming' && '大型 3A 游戏相对帧率'}
                {scoreMode === 'productivity' && '多核高负荷生产力渲染'}
                {scoreMode === 'efficiency' && '每瓦性能比 (能耗比)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Side by Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedItems.map((item) => {
              const currentScore = getActiveScore(item);
              const percentage = Math.round((currentScore / maxScore) * 100);
              const isWinner = currentScore === maxScore;

              return (
                <div
                  key={item.id}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isWinner
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-cyan-500/80 shadow-lg'
                      : 'bg-slate-50/60 dark:bg-slate-850/60 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md">
                      <Trophy className="w-3 h-3 text-amber-300" />
                      <span>性能领先</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.brand} · {item.platform === 'desktop' ? '桌面端' : '移动笔记本'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-slate-400 hover:text-rose-500"
                        title="移出对比"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500 dark:text-slate-400">综合归一化分</span>
                        <span className="font-extrabold text-blue-600 dark:text-cyan-400 text-sm">
                          {currentScore} 分
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Detailed Metrics Table */}
                    <div className="space-y-2 text-xs border-t border-slate-200/60 dark:border-slate-800 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">TDP 满载功耗</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white flex items-center">
                          <Zap className="w-3 h-3 text-amber-500 mr-1" />
                          {item.tdpWatts}W
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">游戏性能基准</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          {item.scores.gamingScore}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">多核生产力基准</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          {item.scores.productivityScore}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">能效比指数</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          {item.scores.efficiencyScore}
                        </span>
                      </div>
                      {item.scores.timeSpyScore && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">TimeSpy 显卡分</span>
                          <span className="font-mono font-medium text-blue-600 dark:text-cyan-400">
                            {item.scores.timeSpyScore}
                          </span>
                        </div>
                      )}
                      {item.scores.cinebenchR23Multi && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">R23 多核渲染</span>
                          <span className="font-mono font-medium text-blue-600 dark:text-cyan-400">
                            {item.scores.cinebenchR23Multi}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Outbound link */}
                  <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800">
                    <a
                      href={item.geekerwanUrl || 'https://socpk.com/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-cyan-400 text-xs font-medium transition-colors"
                    >
                      <span>极客湾权威测评页</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict Summary Box */}
          {selectedItems.length >= 2 && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-cyan-400 font-bold text-sm">
                <Check className="w-4 h-4" />
                <span>智能选购对比决策建议</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                两款硬件的综合跑分相差约{' '}
                <strong className="text-blue-600 dark:text-cyan-400 font-mono">
                  {Math.abs(
                    Math.round(
                      ((getActiveScore(selectedItems[0]) - getActiveScore(selectedItems[1])) /
                        Math.min(
                          getActiveScore(selectedItems[0]),
                          getActiveScore(selectedItems[1])
                        )) *
                        100
                    )
                  )}
                  %
                </strong>
                。如果两者价格差异在该百分比范围内，更高跑分款性价比更突出；如果主要是玩 3A 游戏，建议更偏重游戏基准分与 TDP 散热压力。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors"
          >
            完成对比并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
