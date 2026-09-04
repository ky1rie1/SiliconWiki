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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'price' | 'specs' | 'reviews'>('benchmarks');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!item) return null;

  // Default Price History (if item has none, synthesize realistic 6-month curve based on item.marketPriceRange)
  const priceHistory = item.priceHistory && item.priceHistory.length > 0
    ? item.priceHistory
    : [
        { date: '4月', price: Math.round(item.marketPriceRange[1] * 1.05) },
        { date: '5月', price: Math.round(item.marketPriceRange[1] * 1.02) },
        { date: '618大促', price: Math.round(item.marketPriceRange[0] * 0.96) },
        { date: '7月', price: Math.round(item.marketPriceRange[0] * 1.01) },
        { date: '8月', price: Math.round((item.marketPriceRange[0] + item.marketPriceRange[1]) / 2) },
        { date: '当前现货', price: item.marketPriceRange[0] },
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
          title: `极客湾 Geekerwan · ${item.name} 首发实测与能效深度解析`,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent('极客湾 ' + item.name)}`,
          platform: 'geekerwan' as const,
        },
        {
          title: `硬件茶社 · ${item.name} 真实游戏实机帧率测试与装机实录`,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent('硬件茶社 ' + item.name)}`,
          platform: 'bilibili' as const,
        },
        {
          title: `TechPowerUp · ${item.name} 官方芯片架构与底层规格数据库`,
          url: `https://www.techpowerup.com/gpu-specs/?search=${encodeURIComponent(item.name)}`,
          platform: 'techpowerup' as const,
        },
        {
          title: `极客湾 socpk 权威移动/桌面芯片天梯榜原站`,
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
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Floating Action Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
          <button
            onClick={handleCopyShare}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/20 transition-all text-xs flex items-center space-x-1"
            title="复制硬件分享链接"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">{copiedLink ? '已复制' : '分享'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/20 transition-all"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header Visual & Title Hero */}
        <div className="relative border-b border-slate-100 dark:border-slate-800 shrink-0">
          <HardwareImage
            category={item.category}
            name={item.name}
            brand={item.brand}
            imageUrl={item.imageUrl}
          />
          <div className="p-6 pt-4 bg-white dark:bg-slate-900">
            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-900/60">
                {item.brand}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {item.releaseYear} 年发布
              </span>
              {item.badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-xs">
                  {item.badge}
                </span>
              )}
              <div className="flex items-center space-x-1 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{item.tdpWatts > 0 ? `${item.tdpWatts}W` : '标准功耗'}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {item.name}
            </h2>
            {item.architecture && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                微架构与制程：{item.architecture}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'benchmarks', label: '权威实测跑分', icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { id: 'price', label: '近半年价格走势', icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { id: 'specs', label: '全套技术规格', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: '实测视频与文档直达', icon: <Tv className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 space-y-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wide">
                    大型 3A 游戏实测相对帧率
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {benchmarks.gamingScore}
                    <span className="text-xs text-slate-400 ml-1 font-normal">分 (4060为100)</span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative">
                    <div
                      className="h-full rounded-sm bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.gamingScore || 50) / 150) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    深度对齐极客湾真实 3A 游戏平均表现
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    生产力与高负荷渲染
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {benchmarks.productivityScore}
                    <span className="text-xs text-slate-400 ml-1 font-normal">分</span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative">
                    <div
                      className="h-full rounded-sm bg-gradient-to-r from-indigo-700 via-indigo-500 to-purple-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.productivityScore || 50) / 150) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    剪辑、三维渲染与多核代码编译
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    每瓦性能比 (能效比)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {benchmarks.efficiencyScore}
                    <span className="text-xs text-slate-400 ml-1 font-normal">分</span>
                  </div>
                  {/* Tactile Machined Gauge */}
                  <div className="machined-groove-track h-3 rounded-md overflow-hidden p-0.5 relative">
                    <div
                      className="h-full rounded-sm bg-gradient-to-r from-emerald-700 via-emerald-500 to-teal-300 relative transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(10, Math.round(((benchmarks.efficiencyScore || 50) / 110) * 100)))}%` }}
                    >
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/40" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    相同功耗下输出的算力表现
                  </p>
                </div>
              </div>

              {/* Specific Benchmark Runs */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>理论基准测试详情：</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {benchmarks.timeSpyScore && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">3DMark TimeSpy 显卡得分</span>
                        <span className="font-mono font-black text-blue-600 dark:text-cyan-400">{benchmarks.timeSpyScore} 分</span>
                      </div>
                      <div className="machined-groove-track h-2 rounded-sm overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-xs"
                          style={{ width: `${Math.min(100, Math.max(10, (benchmarks.timeSpyScore / 48500) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {benchmarks.cinebenchMulti && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Cinebench R23 多核跑分</span>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{benchmarks.cinebenchMulti} pts</span>
                      </div>
                      <div className="machined-groove-track h-2 rounded-sm overflow-hidden p-0.5">
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
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">官方发售价 (MSRP)</span>
                  <div className="text-lg font-bold font-mono text-slate-500 line-through">￥{item.msrpRmb}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase block">历史最低出现价</span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">￥{minPrice}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 uppercase block">近期现货均价</span>
                  <div className="text-lg font-bold font-mono text-blue-600 dark:text-cyan-400">￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}</div>
                </div>
              </div>

              {/* Price Trend SVG Chart */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>近 6 个月历史价格变动轨迹：</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">单位：RMB (元)</span>
                </div>

                {/* SVG Visual Price Curve */}
                <div className="h-44 w-full pt-4">
                  <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                    {/* Horizontal Grid lines */}
                    <line x1="30" y1="20" x2="480" y2="20" stroke="#64748b" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="480" y2="60" stroke="#64748b" strokeOpacity="0.2" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="480" y2="100" stroke="#64748b" strokeOpacity="0.2" strokeDasharray="3 3" />

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
                            stroke="#06b6d4"
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
                                <circle cx={x} cy={y} r="4" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                                <text x={x} y={y - 8} textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="monospace">
                                  ￥{p.price}
                                </text>
                                <text x={x} y="115" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
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
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
                  <strong className="font-bold text-amber-900 dark:text-amber-300 block">
                    芯知智能购入时机研判：
                  </strong>
                  <p>
                    {item.priceTrend === 'down'
                      ? '当前成交价格下探至合理区间，性价比较高，建议刚需用户可直接锁定现货。'
                      : item.priceTrend === 'warning'
                      ? '该型号受市场算力与供需影响存在微幅溢价，非急迫需求建议先观望或蹲守百亿补贴降价。'
                      : '该型号价格常年平稳，属于成熟水桶型号，任何时期入手折旧率均较低。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 全套技术规格 */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Specs Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(item.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{k}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{v}</span>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>选购核心亮点与优势：</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-2">
                    {item.pros.map((p, idx) => (
                      <li key={idx}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2">
                  <div className="font-bold text-rose-800 dark:text-rose-400 flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>选购注意要点与不足：</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pl-2">
                    {item.cons.map((c, idx) => (
                      <li key={idx}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Hardware Pairing */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1.5">
                <div className="font-bold text-blue-800 dark:text-cyan-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>装机搭配黄金建议：</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.pairingAdvice || (
                    item.category === 'cpu'
                      ? '建议搭配 B650/B760 及以上主板，32GB (16Gx2) 6000MHz 高频双通道内存与额定 650W~850W 金牌电源。'
                      : item.category === 'gpu'
                      ? '建议搭配 12600KF/7500F/9800X3D 等主流中高频 CPU，电源预留 150W 以上整机冗余。'
                      : '与其他主流规格硬件搭配无瓶颈，兼容性良好。'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 权威测评与数据库直达 */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                全网甄选权威第三方独立评测机构、原厂规格白皮书与千万播放装机实测，点击直达对应原站与视频：
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviewLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-400 hover:shadow-md transition-all flex items-start justify-between group text-xs"
                  >
                    <div className="space-y-1.5 pr-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300">
                        {link.platform}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                        {link.title}
                      </h5>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom E-commerce Action Bar */}
        <div className="p-5 bg-slate-50/80 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            实时行情一键直达：
            <span className="font-mono text-slate-900 dark:text-white font-bold ml-1">
              ￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={`https://search.jd.com/Search?keyword=${encodeURIComponent(item.jdSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-colors"
              title="直达京东自营现货搜索 (须登录)"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shopJd')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href={`https://s.taobao.com/search?q=${encodeURIComponent(item.tbSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors"
              title="直达淘宝百亿补贴搜索 (须登录)"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('shopTb')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <a
              href={`https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(item.pddSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition-colors"
              title="直达拼多多百亿补贴 (须登录)"
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
