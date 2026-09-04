import React from 'react';
import { X, Swords, Zap, ExternalLink, Trophy, Check } from 'lucide-react';
import { BenchmarkItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t, lang } = useLanguage();
  if (!isOpen || selectedItems.length === 0) return null;

  const getActiveScore = (item: BenchmarkItem) => {
    if (scoreMode === 'productivity') return item.scores.productivityScore;
    if (scoreMode === 'efficiency') return item.scores.efficiencyScore;
    return item.scores.gamingScore;
  };

  const maxScore = Math.max(...selectedItems.map((item) => getActiveScore(item)));

  const scoreDifferencePercentage =
    selectedItems.length >= 2
      ? Math.abs(
          Math.round(
            ((getActiveScore(selectedItems[0]) - getActiveScore(selectedItems[1])) /
              Math.min(
                getActiveScore(selectedItems[0]),
                getActiveScore(selectedItems[1])
              )) *
              100
          )
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#F7D84A]">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                {t('pkModalTitle')}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('pkCurrentMode')}
                {scoreMode === 'gaming' && t('pkModeGamingDesc')}
                {scoreMode === 'productivity' && t('pkModeProductivityDesc')}
                {scoreMode === 'efficiency' && t('pkModeEfficiencyDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      ? 'bg-zinc-50/80 dark:bg-zinc-900/60 border-[#F7D84A] dark:border-[#F7D84A]/80 shadow-md'
                      : 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  {isWinner && (
                    <div className="absolute -top-3 right-4 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#F7D84A] text-zinc-950 text-[11px] font-bold shadow-sm">
                      <Trophy className="w-3 h-3 text-zinc-950" />
                      <span>{t('pkLeadingBadge')}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.brand} ·{' '}
                          {item.platform === 'desktop'
                            ? lang === 'en'
                              ? 'Desktop'
                              : '桌面端'
                            : lang === 'en'
                            ? 'Mobile Laptop'
                            : '移动笔记本'}
                        </span>
                        <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5 leading-snug">
                          {item.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs text-zinc-400 hover:text-rose-500 cursor-pointer"
                        title={t('pkRemoveTip')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'Normalized Score' : '综合归一化分'}
                        </span>
                        <span className="font-extrabold text-zinc-900 dark:text-[#F7D84A] text-sm">
                          {currentScore} {t('scoreUnitPts')}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-zinc-700 via-zinc-900 to-[#F7D84A] dark:from-zinc-600 dark:via-zinc-400 dark:to-[#F7D84A] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Detailed Metrics Table */}
                    <div className="space-y-2 text-xs border-t border-zinc-200/60 dark:border-zinc-800 pt-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'TDP Power Rating' : 'TDP 满载功耗'}
                        </span>
                        <span className="font-mono font-medium text-zinc-900 dark:text-white flex items-center">
                          <Zap className="w-3 h-3 text-amber-500 mr-1" />
                          {item.tdpWatts}W
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'Gaming Benchmark' : '游戏性能基准'}
                        </span>
                        <span className="font-mono font-medium text-zinc-900 dark:text-white">
                          {item.scores.gamingScore}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'Productivity Benchmark' : '多核生产力基准'}
                        </span>
                        <span className="font-mono font-medium text-zinc-900 dark:text-white">
                          {item.scores.productivityScore}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {lang === 'en' ? 'Efficiency Score' : '能效比指数'}
                        </span>
                        <span className="font-mono font-medium text-zinc-900 dark:text-white">
                          {item.scores.efficiencyScore}
                        </span>
                      </div>
                      {item.scores.timeSpyScore && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'en' ? 'TimeSpy Graphics' : 'TimeSpy 显卡分'}
                          </span>
                          <span className="font-mono font-medium text-zinc-900 dark:text-[#F7D84A]">
                            {item.scores.timeSpyScore}
                          </span>
                        </div>
                      )}
                      {item.scores.cinebenchR23Multi && (
                        <div className="flex justify-between">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {lang === 'en' ? 'R23 Multi-Core' : 'R23 多核渲染'}
                          </span>
                          <span className="font-mono font-medium text-zinc-900 dark:text-[#F7D84A]">
                            {item.scores.cinebenchR23Multi}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Outbound link */}
                  <div className="pt-4 mt-4 border-t border-zinc-200/60 dark:border-zinc-800">
                    <a
                      href={item.geekerwanUrl || 'https://socpk.com/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>
                        {lang === 'en'
                          ? 'Geekerwan Official Test Page'
                          : '极客湾权威测评页'}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-1 text-[#e5a912] dark:text-[#F7D84A]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict Summary Box */}
          {selectedItems.length >= 2 && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center space-x-2 text-zinc-900 dark:text-white font-bold text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>
                  {lang === 'en'
                    ? 'Smart Buying Decision Advice'
                    : '智能选购对比决策建议'}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {lang === 'en' ? (
                  <>
                    The relative performance difference between the two hardware items is approximately{' '}
                    <strong className="text-zinc-900 dark:text-[#F7D84A] font-mono">
                      {scoreDifferencePercentage}%
                    </strong>
                    . If their retail price gap is within this percentage margin, the higher-scoring item delivers better value per dollar. For gaming setups, prioritize the Gaming Benchmark and TDP thermal headroom.
                  </>
                ) : (
                  <>
                    两款硬件的综合跑分相差约{' '}
                    <strong className="text-zinc-900 dark:text-[#F7D84A] font-mono">
                      {scoreDifferencePercentage}%
                    </strong>
                    。如果两者价格差异在该百分比范围内，更高跑分款性价比更突出；如果主要是玩 3A 游戏，建议更偏重游戏基准分与 TDP 散热压力。
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Finish Comparison & Close' : '完成对比并关闭'}
          </button>
        </div>
      </div>
    </div>
  );
};
