import React from 'react';
import {
  X,
  Swords,
  Zap,
  ExternalLink,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { HardwareItem } from '../../types';
import { HardwareImage } from './HardwareImage';
import { useLanguage } from '../../context/LanguageContext';

interface HardwareCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: HardwareItem[];
  onRemoveItem: (id: string) => void;
  onOpenSpecs?: (item: HardwareItem) => void;
}

export const HardwareCompareModal: React.FC<HardwareCompareModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onOpenSpecs,
}) => {
  const { t, lang } = useLanguage();

  if (!isOpen || items.length === 0) return null;

  // Collect all unique specification keys across all compared items
  const allSpecKeys = Array.from(
    new Set(items.flatMap((item) => Object.keys(item.specs)))
  ).slice(0, 10);

  // Highest benchmark scores among compared items
  const maxGaming = Math.max(...items.map((i) => i.benchmarks?.gamingScore || 0));
  const maxProductivity = Math.max(...items.map((i) => i.benchmarks?.productivityScore || 0));
  const maxEfficiency = Math.max(...items.map((i) => i.benchmarks?.efficiencyScore || 0));
  const maxTdp = Math.max(...items.map((i) => i.tdpWatts || 100));

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'Intel':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60';
      case 'AMD':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60';
      case 'NVIDIA':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60';
      case 'Apple':
        return 'text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700';
      default:
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/60';
    }
  };

  const getTrendBadge = (trend: HardwareItem['priceTrend']) => {
    switch (trend) {
      case 'down':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>{t('tableTrendDown')}</span>
          </span>
        );
      case 'up':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{t('tableTrendUp')}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('tableTrendWarning')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
            <Minus className="w-3 h-3" />
            <span>{t('tableTrendStable')}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {t('tableCompareModalTitle')}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono font-medium">
                  {items.length}/4
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {t('tableCompareModalDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={lang === 'en' ? 'Close comparison (Esc)' : '关闭对比台 (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Matrix Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 scrollbar-thin">
          <div
            className="grid gap-4 min-w-[720px]"
            style={{
              gridTemplateColumns: `repeat(${items.length}, minmax(240px, 1fr))`,
            }}
          >
            {items.map((item) => {
              const gaming = item.benchmarks?.gamingScore || 0;
              const productivity = item.benchmarks?.productivityScore || 0;
              const efficiency = item.benchmarks?.efficiencyScore || 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl bg-neutral-50/70 dark:bg-neutral-850/50 border border-neutral-200/90 dark:border-neutral-800 overflow-hidden shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  {/* Top Item Card Head */}
                  <div className="relative p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors z-10 cursor-pointer"
                      title={t('pkRemoveTip')}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="h-28 rounded-xl overflow-hidden mb-3 bg-neutral-100 dark:bg-neutral-950">
                      <HardwareImage
                        category={item.category}
                        name={item.name}
                        brand={item.brand}
                        imageUrl={item.imageUrl}
                      />
                    </div>

                    <div className="flex items-center space-x-1.5 mb-1.5 flex-wrap gap-y-1">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${getBrandColor(
                          item.brand
                        )}`}
                      >
                        {item.brand}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                        {item.releaseYear}
                      </span>
                      {item.badge && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-cyan-400 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </h4>
                    {item.architecture && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate font-mono mt-0.5">
                        {item.architecture}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Trend */}
                  <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block mb-1">
                      {t('marketPriceLabel')}
                    </span>
                    <div className="text-lg font-black text-blue-600 dark:text-cyan-400 font-mono">
                      ￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-neutral-400">
                      <span>MSRP: ￥{item.msrpRmb}</span>
                      {getTrendBadge(item.priceTrend)}
                    </div>
                  </div>

                  {/* TDP & Power */}
                  <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('tableColTdp')}</span>
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {item.tdpWatts > 0
                          ? `${item.tdpWatts}W`
                          : lang === 'en'
                          ? 'Standard TDP'
                          : '标准功耗'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{
                          width: `${Math.min(100, Math.round(((item.tdpWatts || 65) / (maxTdp || 300)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Benchmark Performance Bars (if available) */}
                  {(gaming > 0 || productivity > 0 || efficiency > 0) && (
                    <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block">
                        {lang === 'en' ? 'Normalized Benchmark Tier' : '综合战力指数'}
                      </span>
                      {gaming > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400 flex items-center space-x-1">
                              <span>{t('modeGaming')}</span>
                              {gaming === maxGaming && maxGaming > 0 && (
                                <Award className="w-3 h-3 text-amber-500" />
                              )}
                            </span>
                            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                              {gaming}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 dark:bg-cyan-500"
                              style={{ width: `${Math.min(100, (gaming / 200) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {productivity > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400 flex items-center space-x-1">
                              <span>{t('modeProductivity')}</span>
                              {productivity === maxProductivity && maxProductivity > 0 && (
                                <Award className="w-3 h-3 text-amber-500" />
                              )}
                            </span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {productivity}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                              style={{ width: `${Math.min(100, (productivity / 200) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {efficiency > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400 flex items-center space-x-1">
                              <span>{t('modeEfficiency')}</span>
                              {efficiency === maxEfficiency && maxEfficiency > 0 && (
                                <Award className="w-3 h-3 text-emerald-500" />
                              )}
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {efficiency}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
                              style={{ width: `${Math.min(100, (efficiency / 180) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Specifications Table */}
                  <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 space-y-2 flex-1">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 dark:text-neutral-500 block mb-1">
                      {t('tableColSpecs')}
                    </span>
                    <div className="space-y-1.5">
                      {allSpecKeys.map((key) => {
                        const val = item.specs[key];
                        return (
                          <div
                            key={key}
                            className="flex items-baseline justify-between text-xs border-b border-neutral-100 dark:border-neutral-800/60 pb-1"
                          >
                            <span className="text-neutral-400 dark:text-neutral-500 shrink-0 mr-2 text-[11px]">
                              {key}
                            </span>
                            <span
                              className="font-mono text-neutral-800 dark:text-neutral-200 text-right truncate"
                              title={val || '-'}
                            >
                              {val || '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Highlights, Pros & Cons */}
                  <div className="p-4 space-y-2 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/20 text-xs">
                    {item.pros[0] && (
                      <div className="flex items-start space-x-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.pros[0]}</span>
                      </div>
                    )}
                    {item.cons[0] && (
                      <div className="flex items-start space-x-1.5 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.cons[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions: View Detail & E-Commerce */}
                  <div className="p-4 space-y-2.5 bg-white dark:bg-neutral-900 mt-auto">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSpecs?.(item);
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F7D84A] dark:text-[#d4990d]" />
                      <span>
                        {t('tableSpecsDetail')}{' '}
                        {lang === 'en' ? '/ Deep Specs' : '/ 深度评测'}
                      </span>
                    </button>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <a
                        href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                          item.jdSearchQuery
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 py-1 px-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-[10px] font-medium transition-colors"
                        title={lang === 'en' ? 'Search on JD.com' : '直达京东自营搜索'}
                      >
                        <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                        <span>JD</span>
                        <ExternalLink className="w-2 h-2 opacity-60 shrink-0" />
                      </a>
                      <a
                        href={`https://s.taobao.com/search?q=${encodeURIComponent(item.tbSearchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 py-1 px-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-600 dark:text-amber-400 text-[10px] font-medium transition-colors"
                        title={lang === 'en' ? 'Search on Taobao' : '直达淘宝百亿补贴搜索'}
                      >
                        <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                        <span>TB</span>
                        <ExternalLink className="w-2 h-2 opacity-60 shrink-0" />
                      </a>
                      <a
                        href={`https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(
                          item.pddSearchQuery
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-1 py-1 px-1.5 rounded-lg bg-orange-600/10 hover:bg-orange-600/20 text-orange-600 dark:text-orange-400 text-[10px] font-medium transition-colors"
                        title={lang === 'en' ? 'Search on PDD' : '直达拼多多百亿补贴搜索'}
                      >
                        <ShoppingBag className="w-2.5 h-2.5 shrink-0" />
                        <span>PDD</span>
                        <ExternalLink className="w-2 h-2 opacity-60 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
