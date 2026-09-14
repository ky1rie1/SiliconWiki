import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Layers,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { hardwareCatalog } from '../../data/hardware';
import { computeCatalogCredibilityStats } from '../../utils/dataCredibilityStats';
import { CATEGORY_CORE_FIELDS } from '../../utils/hardwareCatalog';
import type { HardwareCategory } from '../../types';

interface DataCredibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataCredibilityModal: React.FC<DataCredibilityModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const zh = lang === 'zh';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stats = computeCatalogCredibilityStats(hardwareCatalog);

  const categoryNames: Record<HardwareCategory, { zh: string; en: string }> = {
    cpu: { zh: '处理器 (CPU)', en: 'Processors (CPU)' },
    gpu: { zh: '显卡 (GPU)', en: 'Graphics Cards (GPU)' },
    motherboard: { zh: '主板 (Motherboard)', en: 'Motherboards' },
    ram: { zh: '内存 (RAM)', en: 'Memory (RAM)' },
    storage: { zh: '固态存储 (SSD)', en: 'Solid State Storage (SSD)' },
    psu: { zh: '电源 (PSU)', en: 'Power Supplies (PSU)' },
    cooler: { zh: '散热器 (Cooler)', en: 'Cooling Systems' },
    case: { zh: '机箱 (Case)', en: 'PC Cases' },
    laptop: { zh: '笔记本 (Laptop)', en: 'Laptops' },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credibility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="credibility-modal-title"
                className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white"
              >
                {zh ? '数据可信度与规格核验状态汇总' : 'Data Credibility & Verification Audit'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {zh
                  ? '透明统计来源分布、标准核心参数核验率与实体层级划分'
                  : 'Real-time metrics on sources, core benchmark verification rates & entity levels'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={zh ? '关闭窗口' : 'Close modal'}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {zh ? '收录硬件总数' : 'Total Items'}
              </span>
              <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {stats.totalItems}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                {zh ? '全 9 大硬件品类' : 'Across 9 categories'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                {zh ? '原厂官方核验' : 'Officially Verified'}
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {stats.totalOfficiallyVerified}
              </div>
              <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 block">
                {zh ? '含原厂核验字段（可并存）' : 'Has official verified fields'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                {zh ? '第三方结构化库' : 'Third-Party DB'}
              </span>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {stats.totalThirdPartyVerified}
              </div>
              <span className="text-[10px] text-blue-700/70 dark:text-blue-400/70 block">
                {zh ? '含第三方核验字段（可并存）' : 'Has 3rd-party verified fields'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-1">
              <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">
                {zh ? '非公卡/独立变体' : 'Partner Variants'}
              </span>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {stats.totalPartnerVariants}
              </div>
              <span className="text-[10px] text-purple-700/70 dark:text-purple-400/70 block">
                {zh ? '独立物理尺寸与供电' : 'Distinct dimensions & power'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                {zh ? '全库平均核验率' : 'Avg Verification Rate'}
              </span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {Math.round(stats.overallVerificationRate * 100)}%
              </div>
              <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 block">
                {zh ? '品类核心基准标准' : 'Category core benchmark standard'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {zh ? '最近核验日期' : 'Latest Check Date'}
              </span>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white pt-1">
                {stats.latestVerificationDate || '—'}
              </div>
              <span className="text-[10px] text-zinc-400 block">
                {zh ? '真实比对执行时间' : 'Audit run timestamp'}
              </span>
            </div>
          </div>

          {/* Verification Methodology Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-blue-500" />
              <span>{zh ? 'SiliconWiki 数据可信度与分母口径准则' : 'Credibility & Denominator Standards'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              <div>
                <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">
                  1. 分母 Y 固定且未核验项如实计入
                </strong>
                {zh
                  ? '各硬件品类严格固定核心基准参数集（如 CPU 7项、GPU 8项）。未核验项计入分母，杜绝通过漏算未核验项虚抬核验率。'
                  : 'Core benchmark fields are fixed per category. Unverified items remain in denominator Y to prevent inflation.'}
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">
                  2. 来源类别与核验状态彻底分离
                </strong>
                {zh
                  ? '区分官方原厂规格、第三方产品库与社区编辑参考。统计严格基于实际已核验字段：仅附第三方链接无核验字段不计入第三方核验；支持单条硬件同时具有原厂与第三方核验字段。'
                  : 'Sources are categorized as manufacturer, database, or editorial. Verification metrics require actual verified fields; items can contain both official and 3rd-party verified fields.'}
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">
                  3. 未知值严谨为 null，不污染排序
                </strong>
                {zh
                  ? '未记录的功耗与价格严格保持 null 或未知标记，绝对不转为 0W、¥0 或“默认装得下”，排序与对比均杜绝 NaN / Infinity。'
                  : 'Missing TDP and prices remain null, never defaulting to 0W or ¥0, preventing sorting anomalies.'}
              </div>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#F7D84A]" />
              <span>{zh ? '分品类核验进度与实体覆盖表' : 'Category Breakdown & Entity Coverage'}</span>
            </h3>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                      <th className="py-2.5 px-4">{zh ? '硬件品类' : 'Category'}</th>
                      <th className="py-2.5 px-3">{zh ? '标准参数基数 Y' : 'Core Specs Y'}</th>
                      <th className="py-2.5 px-3">{zh ? '收录数量' : 'Count'}</th>
                      <th className="py-2.5 px-3">{zh ? '形态划分 (公版/非公)' : 'Entity (Ref / Partner)'}</th>
                      <th className="py-2.5 px-3">{zh ? '官方核验条目' : 'Official Verified'}</th>
                      <th className="py-2.5 px-3">{zh ? '第三方参数库' : '3rd-Party DB'}</th>
                      <th className="py-2.5 px-3">{zh ? '平均核心核验率' : 'Avg Verification'}</th>
                      <th className="py-2.5 px-3">{zh ? '功耗已知率' : 'Known Power'}</th>
                      <th className="py-2.5 px-4">{zh ? '价格已知率' : 'Known Price'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-mono text-[11px]">
                    {Object.values(stats.categories).map((catStat) => {
                      const coreFields = CATEGORY_CORE_FIELDS[catStat.category] || [];
                      const names = categoryNames[catStat.category];
                      const powerPct =
                        catStat.totalCount > 0
                          ? Math.round((catStat.knownPowerCount / catStat.totalCount) * 100)
                          : 0;
                      const pricePct =
                        catStat.totalCount > 0
                          ? Math.round((catStat.knownPriceCount / catStat.totalCount) * 100)
                          : 0;

                      return (
                        <tr
                          key={catStat.category}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                            {zh ? names.zh : names.en}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400">
                            {coreFields.length} {zh ? '项标准字段' : 'fields'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">
                            {catStat.totalCount}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300 font-sans text-[10px]">
                            {catStat.chipsAndSeriesCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mr-1">
                                {catStat.chipsAndSeriesCount} {zh ? '公版/核心' : 'Ref'}
                              </span>
                            )}
                            {catStat.partnerVariantsCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                                {catStat.partnerVariantsCount} {zh ? '非公变体' : 'Partner'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {catStat.officiallyVerifiedCount}
                          </td>
                          <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">
                            {catStat.thirdPartyVerifiedCount}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                catStat.averageVerificationRate > 0.5
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : catStat.averageVerificationRate > 0
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {Math.round(catStat.averageVerificationRate * 100)}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                            {powerPct}% ({catStat.knownPowerCount}/{catStat.totalCount})
                          </td>
                          <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                            {pricePct}% ({catStat.knownPriceCount}/{catStat.totalCount})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {zh
              ? 'SiliconWiki 承诺所有参数透明标明来源，不伪造测试数据与报价。'
              : 'SiliconWiki guarantees transparent source attribution and no fabricated benchmarks.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            {zh ? '完成' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
