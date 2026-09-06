import React, { useState } from 'react';
import {
  DollarSign,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Info,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { recommendedBuilds } from '../../data/builds';
import { RecommendedBuild } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const BudgetBuilds: React.FC = () => {
  const { t, lang } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeUpgrades, setActiveUpgrades] = useState<Record<string, string[]>>({});

  const tiers = [
    { id: 'all', label: lang === 'en' ? 'All Price Tiers' : '全部价位段' },
    { id: '3500元档', label: lang === 'en' ? '¥3500 Entry Esports' : '3500元 入门配置' },
    { id: '5500元档', label: lang === 'en' ? '¥5500 2K Sweet Spot' : '5500元 2K甜点' },
    { id: '8500元档', label: lang === 'en' ? '¥8500 High-FPS Powerhouse' : '8500元 高刷主力' },
    { id: '13000元档', label: lang === 'en' ? '¥13000 4K Esports & Pro' : '1.3万元 4K电竞生产力' },
    { id: '25000元档+', label: lang === 'en' ? '¥25000+ Ultimate Flagship' : '2.5万+ 顶级发烧配置' },
  ];

  const getLocalizedPartType = (type: string) => {
    if (lang !== 'en') return type;
    const typeMap: Record<string, string> = {
      CPU: 'CPU',
      主板: 'Motherboard',
      散热: 'Cooler',
      散热器: 'Cooler',
      内存: 'RAM',
      固态: 'SSD',
      固态硬盘: 'SSD',
      显卡: 'GPU',
      电源: 'PSU',
      机箱: 'Case',
    };
    return typeMap[type] || type;
  };

  const toggleUpgrade = (buildId: string, upgradeId: string) => {
    setActiveUpgrades((prev) => {
      const current = prev[buildId] || [];
      if (current.includes(upgradeId)) {
        return { ...prev, [buildId]: current.filter((id) => id !== upgradeId) };
      }
      return { ...prev, [buildId]: [...current, upgradeId] };
    });
  };

  const resetBuildUpgrades = (buildId: string) => {
    setActiveUpgrades((prev) => ({ ...prev, [buildId]: [] }));
  };

  const filteredBuilds =
    selectedTier === 'all'
      ? recommendedBuilds
      : recommendedBuilds.filter((b) => b.budgetLevel === selectedTier);

  const copyBuildText = (build: RecommendedBuild) => {
    const buildUpgradeIds = activeUpgrades[build.id] || [];
    const appliedUpgrades = (build.upgradeOptions || []).filter((u) =>
      buildUpgradeIds.includes(u.id)
    );
    const deltaSum = appliedUpgrades.reduce((sum, u) => sum + u.priceDelta, 0);
    const finalPrice = build.totalPrice + deltaSum;

    const text =
      lang === 'en'
        ? [
            `[SiliconWiki Recommended Build] ${build.title}`,
            `Target Budget: ¥${build.targetPrice} | ${appliedUpgrades.length > 0 ? `Customized Total: ¥${finalPrice} (${deltaSum >= 0 ? `+¥${deltaSum}` : `-¥${Math.abs(deltaSum)}`})` : `Components Total: ¥${build.totalPrice}`}`,
            `Ideal Scenario: ${build.scenario}`,
            '--------------------------------',
            'Base Configuration BOM:',
            ...build.parts.map(
              (p) =>
                `${getLocalizedPartType(p.type).padEnd(12, ' ')}: ${p.name} (${p.spec}) — Approx. ¥${p.approxPrice}`
            ),
            ...(appliedUpgrades.length > 0
              ? [
                  '--------------------------------',
                  'Applied Optional Upgrades & Customizations:',
                  ...appliedUpgrades.map(
                    (u) =>
                      `• [${getLocalizedPartType(u.targetComponent)}] ${u.title} (${u.priceDelta >= 0 ? `+¥${u.priceDelta}` : `-¥${Math.abs(u.priceDelta)}`}): ${u.partName}`
                  ),
                ]
              : []),
            '--------------------------------',
            'Building Tips & Pairing Notes:',
            ...build.notes.map((n) => `• ${n}`),
          ].join('\n')
        : [
            `【SiliconWiki 芯知推荐配置】${build.title}`,
            `目标预算：￥${build.targetPrice} | ${appliedUpgrades.length > 0 ? `选配后合计：￥${finalPrice} (${deltaSum >= 0 ? `+￥${deltaSum}` : `-￥${Math.abs(deltaSum)}`})` : `配件合计：￥${build.totalPrice}`}`,
            `适用场景：${build.scenario}`,
            '--------------------------------',
            '基准配置清单：',
            ...build.parts.map(
              (p) => `${p.type.padEnd(4, ' ')}：${p.name} (${p.spec}) —— 约 ￥${p.approxPrice}`
            ),
            ...(appliedUpgrades.length > 0
              ? [
                  '--------------------------------',
                  '已选定制选配方案：',
                  ...appliedUpgrades.map(
                    (u) =>
                      `• 【${u.targetComponent}选配】${u.title} (${u.priceDelta >= 0 ? `+￥${u.priceDelta}` : `-￥${Math.abs(u.priceDelta)}`})：${u.partName}`
                  ),
                ]
              : []),
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
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50/80 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden shadow-xs dark:shadow-2xl transition-colors">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            <DollarSign className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
            <span>{t('buildsHeroBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t('buildsHeroTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('buildsHeroDesc')}
          </p>
        </div>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {tiers.map((tItem) => (
          <button
            key={tItem.id}
            onClick={() => setSelectedTier(tItem.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
              selectedTier === tItem.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                : 'bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Builds Cards */}
      <div className="space-y-8">
        {filteredBuilds.map((build) => {
          const isCopied = copiedId === build.id;
          const buildSelectedUpgradeIds = activeUpgrades[build.id] || [];
          const selectedUpgradeItems = (build.upgradeOptions || []).filter((u) =>
            buildSelectedUpgradeIds.includes(u.id)
          );
          const deltaSum = selectedUpgradeItems.reduce((acc, u) => acc + u.priceDelta, 0);
          const dynamicTotalPrice = build.totalPrice + deltaSum;

          return (
            <div
              key={build.id}
              className="rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold font-mono border border-zinc-200 dark:border-zinc-700">
                      {build.budgetLevel}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {build.scenario}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    {build.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {build.tagline}
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase font-mono">
                      {deltaSum !== 0 ? t('buildCustomizedTotal') : t('bomTotalPriceLabel')}
                    </span>
                    <div className="flex items-center justify-end space-x-1.5">
                      <span className="text-2xl font-black text-zinc-900 dark:text-[#F7D84A] font-mono">
                        ￥{dynamicTotalPrice}
                      </span>
                      {deltaSum !== 0 && (
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                            deltaSum > 0
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {deltaSum > 0 ? `+￥${deltaSum}` : `-￥${Math.abs(deltaSum)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => copyBuildText(build)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] border border-zinc-200 dark:border-zinc-700"
                    title={t('btnCopyBuild')}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {t('btnCopiedBuild')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('btnCopyBuild')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* BOM Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                      <th className="pb-3 font-semibold w-24">{t('thHardware')}</th>
                      <th className="pb-3 font-semibold">{t('thModel')}</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">{t('thSpecs')}</th>
                      <th className="pb-3 font-semibold text-right">{t('thPrice')}</th>
                      <th className="pb-3 font-semibold text-center w-36">{t('thAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {build.parts.map((part, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-850/40 transition-colors"
                      >
                        <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {getLocalizedPartType(part.type)}
                        </td>
                        <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {part.name}
                        </td>
                        <td className="py-3 text-zinc-500 dark:text-zinc-400 hidden md:table-cell font-mono">
                          {part.spec}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          ￥{part.approxPrice}
                        </td>
                        <td className="py-3 text-center">
                          <a
                            href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                              part.jdQuery
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] transition-all duration-150 cursor-pointer select-none active:scale-[0.98] border border-zinc-200 dark:border-zinc-700"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#e5a912] dark:text-[#F7D84A]" />
                            <span>{t('shopJd')}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interactive Upgrade Options Section */}
              {build.upgradeOptions && build.upgradeOptions.length > 0 && (
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3">
                    <div className="flex items-center space-x-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                        {t('buildUpgradesTitle')}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-bold">
                        {build.upgradeOptions.length}
                      </span>
                      {selectedUpgradeItems.length > 0 && (
                        <button
                          onClick={() => resetBuildUpgrades(build.id)}
                          className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-2 cursor-pointer transition-colors"
                          title={t('buildUpgradeRevert')}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('buildUpgradeRevert')}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {t('buildUpgradesDesc')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {build.upgradeOptions.map((opt) => {
                      const isApplied = buildSelectedUpgradeIds.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
                            isApplied
                              ? 'bg-amber-500/10 dark:bg-[#F7D84A]/10 border-amber-400/80 dark:border-[#F7D84A]/60 shadow-xs'
                              : 'bg-white dark:bg-zinc-850/60 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                {getLocalizedPartType(opt.targetComponent)}
                              </span>
                              <span
                                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                                  opt.priceDelta > 0
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                    : opt.priceDelta < 0
                                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}
                              >
                                {opt.priceDelta > 0 ? `+￥${opt.priceDelta}` : opt.priceDelta < 0 ? `-￥${Math.abs(opt.priceDelta)}` : '￥0'}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                              {opt.title}
                            </h5>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {opt.description}
                            </p>
                            <div className="text-[10px] text-zinc-400 font-mono truncate">
                              {t('buildUpgradeReplaces')} <span className="text-zinc-700 dark:text-zinc-300 font-medium">{opt.partName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                            {opt.jdQuery ? (
                              <a
                                href={`https://search.jd.com/Search?keyword=${encodeURIComponent(opt.jdQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                              >
                                <ShoppingBag className="w-2.5 h-2.5 text-[#e5a912] dark:text-[#F7D84A]" />
                                <span>{t('shopJd')}</span>
                                <ExternalLink className="w-2 h-2 opacity-60 ml-0.5" />
                              </a>
                            ) : <div />}

                            <button
                              onClick={() => toggleUpgrade(build.id, opt.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                                isApplied
                                  ? 'bg-[#F7D84A] text-zinc-950 shadow-xs ring-1 ring-[#F7D84A]/60'
                                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                              }`}
                            >
                              {isApplied ? t('buildUpgradeApplied') : t('buildUpgradeApply')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes & Advice */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                  <span>{t('buildNotesTitle')}</span>
                </div>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 pl-5 list-disc">
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
