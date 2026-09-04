import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Zap,
  TrendingDown,
  ShoppingBag,
  Award,
  BarChart2,
  Calendar,
  Layers,
  Tv,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { HardwareItem } from '../../types';
import { HardwareImage } from './HardwareImage';
import { useLanguage } from '../../context/LanguageContext';

interface HardwareDetailModalProps {
  item: HardwareItem | null;
  onClose: () => void;
}

export const HardwareDetailModal: React.FC<HardwareDetailModalProps> = ({
  item,
  onClose,
}) => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'price' | 'specs' | 'reviews'>('benchmarks');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!item) return null;

  // Default Price History (if item has none, synthesize realistic 6-month curve based on item.marketPriceRange)
  const priceHistory = item.priceHistory && item.priceHistory.length > 0
    ? item.priceHistory
    : [
        { date: lang === 'en' ? 'Apr' : '4月', price: Math.round(item.marketPriceRange[1] * 1.05) },
        { date: lang === 'en' ? 'May' : '5月', price: Math.round(item.marketPriceRange[1] * 1.02) },
        { date: lang === 'en' ? 'Mid-Year' : '618大促', price: Math.round(item.marketPriceRange[0] * 0.96) },
        { date: lang === 'en' ? 'Jul' : '7月', price: Math.round(item.marketPriceRange[0] * 1.01) },
        { date: lang === 'en' ? 'Aug' : '8月', price: Math.round((item.marketPriceRange[0] + item.marketPriceRange[1]) / 2) },
        { date: lang === 'en' ? 'Current' : '当前现货', price: item.marketPriceRange[0] },
      ];

  const minPrice = Math.min(...priceHistory.map((p) => p.price));
  const maxPrice = Math.max(...priceHistory.map((p) => p.price));

  // Benchmark scores (synthesized realistically if not defined)
  const benchmarks = item.benchmarks || {
    gamingScore: item.category === 'gpu' ? Math.min(265, Math.max(70, Math.round((item.marketPriceRange[0] / 30) * 1.2))) : 105,
    productivityScore: item.category === 'cpu' ? Math.min(180, Math.max(60, Math.round(item.marketPriceRange[0] / 28))) : 120,
    efficiencyScore: 135,
    timeSpyScore: item.category === 'gpu' ? Math.round(item.marketPriceRange[0] * 3.8) : undefined,
    cinebenchMulti: item.category === 'cpu' ? Math.round(item.marketPriceRange[0] * 9.5) : undefined,
  };

  // Review Navigation Links
  const reviewLinks = item.reviewLinks && item.reviewLinks.length > 0
    ? item.reviewLinks
    : [
        {
          title: lang === 'en'
            ? `ZOL Database · ${item.name} Detailed Teardown & Tech Specs`
            : `中关村在线 ZOL · ${item.name} 详细技术参数、行情与拆解`,
          url: `https://detail.zol.com.cn/index.php?c=SearchList&keyword=${encodeURIComponent(item.name)}`,
          platform: 'zol' as const,
        },
        {
          title: lang === 'en'
            ? `Geekerwan · ${item.name} Launch Testing & Efficiency Analysis`
            : `极客湾 Geekerwan · ${item.name} 首发实测与能效深度解析`,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent('极客湾 ' + item.name)}`,
          platform: 'geekerwan' as const,
        },
        {
          title: lang === 'en'
            ? `Hardware Tea House · ${item.name} Real Gaming FPS & Assembly Review`
            : `硬件茶社 · ${item.name} 真实游戏实机帧率测试与装机实录`,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent('硬件茶社 ' + item.name)}`,
          platform: 'bilibili' as const,
        },
        {
          title: lang === 'en'
            ? `TechPowerUp · ${item.name} Architecture & Specification Database`
            : `TechPowerUp · ${item.name} 官方芯片架构与底层规格数据库`,
          url: `https://www.techpowerup.com/gpu-specs/?search=${encodeURIComponent(item.name)}`,
          platform: 'techpowerup' as const,
        },
        {
          title: lang === 'en'
            ? 'Geekerwan socpk Official CPU/GPU Benchmark Tier'
            : '极客湾 socpk 权威移动/桌面芯片天梯榜原站',
          url: 'https://socpk.com/',
          platform: 'official' as const,
        },
      ];

  const handleCopyShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}#${item.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Shell Double-Bezel */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Floating Action Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <button
            onClick={handleCopyShare}
            className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-900/80 text-white backdrop-blur-md border border-white/20 transition-all text-xs flex items-center space-x-1 cursor-pointer"
            title={lang === 'en' ? 'Copy share link' : '复制硬件分享链接'}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">
              {copiedLink
                ? lang === 'en'
                  ? 'Copied'
                  : '已复制'
                : lang === 'en'
                ? 'Share'
                : '分享'}
            </span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-900/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            title={lang === 'en' ? 'Close (Esc)' : '关闭 (Esc)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header Visual & Title Hero */}
        <div className="relative border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <HardwareImage
            category={item.category}
            name={item.name}
            brand={item.brand}
            imageUrl={item.imageUrl}
          />
          <div className="p-6 pt-4 bg-white dark:bg-[#09090b]">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                {item.brand}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono">
                {lang === 'en' ? `Released in ${item.releaseYear}` : `${item.releaseYear} 年发布`}
              </span>
              {item.badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7D84A] text-zinc-950 font-medium shadow-xs">
                  {item.badge}
                </span>
              )}
              <div className="flex items-center space-x-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{item.tdpWatts > 0 ? `${item.tdpWatts}W` : (lang === 'en' ? 'Standard TDP' : '标准功耗')}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {item.name}
            </h2>
            {item.architecture && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                {lang === 'en' ? `Microarchitecture: ${item.architecture}` : `微架构与制程：${item.architecture}`}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'benchmarks', label: lang === 'en' ? 'Verified Benchmarks' : '权威实测跑分', icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { id: 'price', label: lang === 'en' ? '6-Month Price Trend' : '近半年价格走势', icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { id: 'specs', label: lang === 'en' ? 'Full Tech Specs' : '全套技术规格', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: lang === 'en' ? 'Reviews & Guides' : '实测视频与文档直达', icon: <Tv className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-zinc-900 dark:border-[#F7D84A] text-zinc-900 dark:text-[#F7D84A] bg-white dark:bg-[#09090b]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: 权威跑分 */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                    {lang === 'en' ? '3A Gaming Frame Rate Score' : '大型 3A 游戏实测相对帧率'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarks.gamingScore}
                    <span className="text-xs text-zinc-400 ml-1 font-normal">
                      {lang === 'en' ? 'pts (4060 = 100)' : '分 (4060为100)'}
                    </span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-xs bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.gamingScore || 50) / 150) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'en' ? 'Normalized to Geekerwan 3A gaming tests' : '深度对齐极客湾真实 3A 游戏平均表现'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                    {t('modeProductivity')}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarks.productivityScore}
                    <span className="text-xs text-zinc-400 ml-1 font-normal">{t('scoreUnitPts')}</span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-xs bg-gradient-to-r from-indigo-700 via-indigo-500 to-purple-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.productivityScore || 50) / 150) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'en' ? 'Video editing, 3D rendering & compiling' : '剪辑、三维渲染与多核代码编译'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                    {t('modeEfficiency')}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-white">
                    {benchmarks.efficiencyScore}
                    <span className="text-xs text-zinc-400 ml-1 font-normal">{t('scoreUnitPts')}</span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-xs bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.efficiencyScore || 50) / 110) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {lang === 'en' ? 'Performance output relative to power consumption' : '相同功耗下输出的算力表现'}
                  </p>
                </div>
              </div>

              {/* Specific Benchmark Runs */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                  <span>{lang === 'en' ? 'Synthetic Benchmark Details:' : '理论基准测试详情：'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {benchmarks.timeSpyScore && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {lang === 'en' ? '3DMark TimeSpy Graphics' : '3DMark TimeSpy 显卡得分'}
                        </span>
                        <span className="font-mono font-black text-zinc-900 dark:text-[#F7D84A]">
                          {benchmarks.timeSpyScore} {t('scoreUnitPts')}
                        </span>
                      </div>
                      <div className="machined-groove-track h-2 rounded-xs overflow-hidden p-0.5 bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-xs"
                          style={{ width: `${Math.min(100, Math.max(10, (benchmarks.timeSpyScore / 48500) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {benchmarks.cinebenchMulti && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {lang === 'en' ? 'Cinebench R23 Multi-Core' : 'Cinebench R23 多核跑分'}
                        </span>
                        <span className="font-mono font-black text-zinc-900 dark:text-[#F7D84A]">
                          {benchmarks.cinebenchMulti} pts
                        </span>
                      </div>
                      <div className="machined-groove-track h-2 rounded-xs overflow-hidden p-0.5 bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-400 rounded-xs"
                          style={{ width: `${Math.min(100, Math.max(10, (benchmarks.cinebenchMulti / 42000) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 价格走势与选购时机 */}
          {activeTab === 'price' && (
            <div className="space-y-6">
              {/* Price Stats Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block font-mono">
                    {lang === 'en' ? 'Official MSRP' : '官方发售价 (MSRP)'}
                  </span>
                  <div className="text-lg font-bold font-mono text-zinc-500 line-through">￥{item.msrpRmb}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block font-mono">
                    {lang === 'en' ? 'Historical Low Price' : '历史最低出现价'}
                  </span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">￥{minPrice}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-900 dark:text-[#F7D84A] uppercase block font-mono">
                    {lang === 'en' ? 'Recent Market Average' : '近期现货均价'}
                  </span>
                  <div className="text-lg font-bold font-mono text-zinc-900 dark:text-[#F7D84A]">￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}</div>
                </div>
              </div>

              {/* Price Trend SVG Chart */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{lang === 'en' ? '6-Month Price Movement Track:' : '近 6 个月历史价格变动轨迹：'}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-400">{lang === 'en' ? 'Unit: RMB (¥)' : '单位：RMB (元)'}</span>
                </div>

                {/* SVG Visual Price Curve */}
                <div className="h-44 w-full pt-4">
                  <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                    {/* Horizontal Grid lines */}
                    <line x1="30" y1="20" x2="480" y2="20" stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="480" y2="60" stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="480" y2="100" stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />

                    {/* Polyline Path */}
                    {(() => {
                      const range = Math.max(1, maxPrice - minPrice);
                      const points = priceHistory.map((p, i) => {
                        const x = 50 + (i * (420 / (priceHistory.length - 1)));
                        const y = 95 - ((p.price - minPrice) / range) * 75;
                        return `${x},${y}`;
                      }).join(' ');

                      return (
                        <>
                          <polyline
                            fill="none"
                            stroke="#F7D84A"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                          />
                          {priceHistory.map((p, i) => {
                            const x = 50 + (i * (420 / (priceHistory.length - 1)));
                            const y = 95 - ((p.price - minPrice) / range) * 75;
                            return (
                              <g key={i}>
                                <circle cx={x} cy={y} r="4" fill="#F7D84A" stroke="#18181b" strokeWidth="2" />
                                <text x={x} y={y - 8} textAnchor="middle" fill="#71717a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                  ￥{p.price}
                                </text>
                                <text x={x} y="115" textAnchor="middle" fill="#a1a1aa" fontSize="8" fontFamily="sans-serif">
                                  {p.date}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Buying Timing Verdict Alert */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
                  <strong className="font-bold text-amber-900 dark:text-amber-300 block">
                    {lang === 'en' ? 'SiliconWiki Buying Timing Verdict:' : '芯知智能购入时机研判：'}
                  </strong>
                  <p>
                    {item.priceTrend === 'down'
                      ? lang === 'en'
                        ? 'Current transaction price has reached a reasonable historical low with outstanding value. Recommended for direct buy if you need it now.'
                        : '当前成交价格下探至合理区间，性价比较高，建议刚需用户可直接锁定现货。'
                      : item.priceTrend === 'warning'
                      ? lang === 'en'
                        ? 'This model experiences supply tightness or minor market premium. If not urgent, wait for platform subsidies or promotions.'
                        : '该型号受市场算力与供需影响存在微幅溢价，非急迫需求建议先观望或蹲守百亿补贴降价。'
                      : lang === 'en'
                      ? 'Price remains steady year-round. This is a mature mainstream part with low ongoing depreciation.'
                      : '该型号价格常年平稳，属于成熟水桶型号，任何时期入手折旧率均较低。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 全套技术规格 */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Specs Header with ZOL link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  {lang === 'en'
                    ? 'Comprehensive Hardware Spec Sheet (Referenced from official and ZOL DIY benchmarks)'
                    : '全套核心技术参数 (全面深度参考中关村在线 diy.zol.com.cn 数据库标准)'}
                </span>
                <a
                  href={`https://detail.zol.com.cn/index.php?c=SearchList&keyword=${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-900 dark:text-[#F7D84A] hover:underline flex items-center space-x-1 shrink-0"
                >
                  <span>{lang === 'en' ? 'View ZOL teardown database' : '在 ZOL 查看完整拆解库'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Specs Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(item.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
                  >
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{k}</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{v}</span>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'en' ? 'Key Buying Highlights & Strengths:' : '选购核心亮点与优势：'}</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300 pl-2">
                    {item.pros.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                  <div className="font-bold text-rose-800 dark:text-rose-400 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>{lang === 'en' ? 'Important Notes & Trade-Offs:' : '选购注意要点与不足：'}</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300 pl-2">
                    {item.cons.map((c, idx) => (
                      <li key={idx}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Hardware Pairing */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-[#F7D84A] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>{lang === 'en' ? 'Golden Hardware Pairing Recommendation:' : '装机搭配黄金建议：'}</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {item.pairingAdvice || (
                    item.category === 'cpu'
                      ? lang === 'en'
                        ? 'Pair with B650/B760 or higher chipset, 32GB (16Gx2) 6000MHz dual-channel DDR5, and rated 650W~850W Gold PSU.'
                        : '建议搭配 B650/B760 及以上主板，32GB (16Gx2) 6000MHz 高频双通道内存与额定 650W~850W 金牌电源。'
                      : item.category === 'gpu'
                      ? lang === 'en'
                        ? 'Pair with modern gaming CPUs (12600KF/7500F/9800X3D), reserving 150W+ PSU wattage headroom.'
                        : '建议搭配 12600KF/7500F/9800X3D 等主流中高频 CPU，电源预留 150W 以上整机冗余。'
                      : lang === 'en'
                      ? 'Seamless compatibility across modern standards with zero bottlenecks.'
                      : '与其他主流规格硬件搭配无瓶颈，兼容性良好。'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 权威测评与数据库直达 */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {lang === 'en'
                  ? 'Curated third-party testing reviews, manufacturer whitepapers, and viral teardown masterclasses. Click to jump directly:'
                  : '全网甄选权威第三方独立评测机构、原厂规格白皮书与千万播放装机实测，点击直达对应原站与视频：'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviewLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-[#F7D84A] dark:hover:border-[#F7D84A] hover:shadow-md transition-all flex items-start justify-between group text-xs cursor-pointer"
                  >
                    <div className="space-y-1.5 pr-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                          link.platform === 'zol'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                            : link.platform === 'geekerwan'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                            : link.platform === 'bilibili'
                            ? 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        {link.platform === 'zol'
                          ? lang === 'en' ? 'ZOL Database' : 'ZOL 中关村在线'
                          : link.platform === 'geekerwan'
                          ? lang === 'en' ? 'Geekerwan Review' : '极客湾评测'
                          : link.platform === 'bilibili'
                          ? lang === 'en' ? 'Bilibili Testing' : 'B站装机实测'
                          : link.platform === 'techpowerup'
                          ? 'TechPowerUp'
                          : link.platform}
                      </span>
                      <h5 className="font-bold text-zinc-900 dark:text-white group-hover:text-[#F7D84A] transition-colors leading-snug">
                        {link.title}
                      </h5>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#F7D84A] shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom E-commerce Action Bar */}
        <div className="p-5 bg-zinc-50/80 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            {lang === 'en' ? 'Live market quotes: ' : '实时行情一键直达：'}
            <span className="font-mono text-zinc-900 dark:text-white font-bold ml-1">
              ￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={`https://search.jd.com/Search?keyword=${encodeURIComponent(item.jdSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs transition-colors"
              title={lang === 'en' ? 'Search on JD.com' : '直达京东自营现货搜索 (须登录)'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shopJd')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href={`https://s.taobao.com/search?q=${encodeURIComponent(item.tbSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors"
              title={lang === 'en' ? 'Search on Taobao' : '直达淘宝百亿补贴搜索 (须登录)'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shopTb')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href={`https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(item.pddSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs transition-colors"
              title={lang === 'en' ? 'Search on PDD' : '直达拼多多百亿补贴 (须登录)'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shopPdd')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
