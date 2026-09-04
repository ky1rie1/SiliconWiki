import React, { useState } from 'react';
import {
  DollarSign,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Info,
} from 'lucide-react';
import { recommendedBuilds } from '../../data/builds';
import { RecommendedBuild } from '../../types';

export const BudgetBuilds: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tiers = [
    { id: 'all', label: '全部价位段' },
    { id: '3500元档', label: '3500元 入门网游' },
    { id: '5500元档', label: '5500元 2K甜点' },
    { id: '8500元档', label: '8500元 高刷主力' },
    { id: '15000元档', label: '1.5万元 4K电竞' },
    { id: '25000元档', label: '2.5万+ 旗舰机皇' },
  ];

  const filteredBuilds =
    selectedTier === 'all'
      ? recommendedBuilds
      : recommendedBuilds.filter((b) => b.budgetLevel === selectedTier);

  const copyBuildText = (build: RecommendedBuild) => {
    const text = [
      `【SiliconWiki 芯知推荐配置】${build.title}`,
      `目标预算：￥${build.targetPrice} | 配件合计：￥${build.totalPrice}`,
      `适用场景：${build.scenario}`,
      '--------------------------------',
      ...build.parts.map(
        (p) => `${p.type.padEnd(4, ' ')}：${p.name} (${p.spec}) —— 约 ￥${p.approxPrice}`
      ),
      '--------------------------------',
      '选购建议：',
      ...build.notes.map((n) => `• ${n}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedId(build.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-200/50 dark:border-emerald-800/40 backdrop-blur-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>科学装机配置单与实时行情比价</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            从 3000 到 25000 元 · 每一分钱都花在刀刃上
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            遵循业界黄金装机铁律：游戏机型显卡占比 45%~50%，电源散热稳留冗余，原厂闪存拒绝缩水。点击每个配件可一键直达京东自营搜索实时好价。
          </p>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {tiers.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTier(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              selectedTier === t.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Builds Cards */}
      <div className="space-y-8">
        {filteredBuilds.map((build) => {
          const isCopied = copiedId === build.id;

          return (
            <div
              key={build.id}
              className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                      {build.budgetLevel}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {build.scenario}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {build.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {build.tagline}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">
                      配件参考总价
                    </span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ￥{build.totalPrice}
                    </div>
                  </div>

                  <button
                    onClick={() => copyBuildText(build)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    title="复制完整配置文本"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">已复制!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>一键复制配置</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold w-16">硬件</th>
                      <th className="pb-3 font-semibold">推荐具体型号</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">规格要点</th>
                      <th className="pb-3 font-semibold text-right">参考均价</th>
                      <th className="pb-3 font-semibold text-center w-28">电商比价</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {build.parts.map((part, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors"
                      >
                        <td className="py-3 font-bold text-blue-600 dark:text-cyan-400">
                          {part.type}
                        </td>
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                          {part.name}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell font-mono">
                          {part.spec}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ￥{part.approxPrice}
                        </td>
                        <td className="py-3 text-center">
                          <a
                            href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                              part.jdQuery
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 font-medium text-[11px] transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>京东现货</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes & Advice */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>配置选购避坑与搭配理由：</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 pl-5 list-disc">
                  {build.notes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
