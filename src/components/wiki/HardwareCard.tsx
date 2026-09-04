import React from 'react';
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { HardwareItem } from '../../types';

interface HardwareCardProps {
  item: HardwareItem;
  onOpenSpecs?: (item: HardwareItem) => void;
}

export const HardwareCard: React.FC<HardwareCardProps> = ({ item }) => {
  const getTrendBadge = (trend: HardwareItem['priceTrend']) => {
    switch (trend) {
      case 'down':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>近期微跌 · 性价比高</span>
          </span>
        );
      case 'up':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>略有上涨</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>溢价明显 / 紧俏</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            <Minus className="w-3 h-3" />
            <span>行情平稳</span>
          </span>
        );
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'Intel':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60';
      case 'AMD':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60';
      case 'NVIDIA':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60';
      case 'Apple':
        return 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
      default:
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/60';
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-700/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Top Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold tracking-wide ${getBrandColor(
                item.brand
              )}`}
            >
              {item.brand}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {item.releaseYear} 年
            </span>
            {item.badge && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-xs">
                {item.badge}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{item.tdpWatts > 0 ? `${item.tdpWatts}W` : '标准功耗'}</span>
          </div>
        </div>

        {/* Title & Architecture */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
          {item.name}
        </h3>
        {item.architecture && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {item.architecture}
          </p>
        )}
      </div>

      {/* Highlights */}
      <div className="px-5 py-2">
        <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-850/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
          {item.highlights.slice(0, 3).map((hl, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-blue-500 dark:text-cyan-400 font-bold mt-0.5">•</span>
              <span className="leading-snug">{hl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="px-5 py-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs border-t border-b border-slate-100 dark:border-slate-800/80 py-2.5">
          {Object.entries(item.specs)
            .slice(0, 6)
            .map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                  {k}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate font-mono" title={v}>
                  {v}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="px-5 py-2 space-y-1 text-xs">
        {item.pros[0] && (
          <div className="flex items-start space-x-1.5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{item.pros[0]}</span>
          </div>
        )}
        {item.cons[0] && (
          <div className="flex items-start space-x-1.5 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{item.cons[0]}</span>
          </div>
        )}
      </div>

      {/* Price & E-commerce Direct Search Bar */}
      <div className="p-5 pt-3 mt-2 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/70">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">
              官方指导价 (MSRP)
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
              ￥{item.msrpRmb}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">
              近期参考成交均价
            </span>
            <div className="text-base font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
              ￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          {getTrendBadge(item.priceTrend)}
          {item.trendText && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {item.trendText}
            </span>
          )}
        </div>

        {/* E-commerce Direct Resilient Links */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <a
            href={`https://search.jd.com/Search?keyword=${encodeURIComponent(item.jdSearchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-xs font-medium transition-colors"
            title="直达京东自营搜索最新现货报价"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>京东自营</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href={`https://s.taobao.com/search?q=${encodeURIComponent(item.tbSearchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-600 dark:text-amber-400 text-xs font-medium transition-colors"
            title="直达淘宝百亿补贴精选现货搜索"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>淘宝特惠</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href={`https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(
              item.pddSearchQuery
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-orange-600/10 hover:bg-orange-600/20 text-orange-600 dark:text-orange-400 text-xs font-medium transition-colors"
            title="直达拼多多百亿补贴搜索"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>拼多多</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
};
