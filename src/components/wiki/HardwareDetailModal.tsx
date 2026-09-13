import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ExternalLink,
  Zap,
  TrendingDown,
  ShoppingBag,
  BarChart2,
  Layers,
  Tv,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Share2,
  FileText,
  Video,
} from 'lucide-react';
import { HardwareItem } from '../../types';
import { HardwareImage } from './HardwareImage';
import { useLanguage } from '../../context/LanguageContext';
import { hardwareCatalog } from '../../data/hardware';
import { createHardwareCatalog } from '../../utils/hardwareCatalog';
import { hardwareDocumentLinks, hardwareShareUrl } from '../../utils/hardwareLinks';
import { copyTextToClipboard } from '../../utils/clipboard';
import { HardwareMeasurements, HardwareEvidence } from './HardwareMeasurements';

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
  const [copyFailed, setCopyFailed] = useState(false);
  const copyGeneration = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => { copyGeneration.current++; clearTimeout(copyTimer.current); }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item) return null;

  const record = hardwareCatalog.byId.get(item.id) || createHardwareCatalog([item]).byId.get(item.id)!;
  const docsLinks = hardwareDocumentLinks(item, record, lang);

  // Review & Testing Videos (Bilibili & YouTube direct links)
  const reviewLinks = record.links.reviews.length > 0
    ? record.links.reviews
    : [
        {
          title: lang === 'en'
            ? `YouTube · ${item.name} review search`
            : `YouTube · ${item.name} 评测搜索`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.brand} ${item.name} review benchmark`)}`,
          platform: 'youtube' as const,
          summary: lang === 'en'
            ? 'Search results; verify the video title, exact model and testing conditions.'
            : '打开搜索结果；请核对视频标题、具体型号和测试条件。',
        },
        {
          title: lang === 'en'
            ? `Bilibili · ${item.name} review search`
            : `B站 · ${item.name} 评测搜索`,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${item.brand} ${item.name} 评测`)}`,
          platform: 'bilibili' as const,
          summary: lang === 'en'
            ? 'Search results, not a selected or verified video.'
            : '打开搜索结果，不代表已精选或核验具体视频。',
        },
      ];

  const handleCopyShare = async () => {
    const generation = ++copyGeneration.current;
    clearTimeout(copyTimer.current); setCopiedLink(false); setCopyFailed(false);
    const copied = await copyTextToClipboard(hardwareShareUrl(window.location.href, item.id));
    if (generation !== copyGeneration.current) return;
    setCopiedLink(copied); setCopyFailed(!copied);
    if (copied) copyTimer.current = setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="hardware-detail-title" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
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
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  record.entityKind === 'partner-variant'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : record.entityKind === 'chip'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}
              >
                {record.entityKind === 'partner-variant'
                  ? lang === 'en'
                    ? 'Partner Variant'
                    : '品牌非公版'
                  : record.entityKind === 'chip'
                  ? lang === 'en'
                    ? 'Silicon Core'
                    : '核心/架构'
                  : lang === 'en'
                  ? 'Reference Spec'
                  : '公版/标准品'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1 border ${
                  record.auditSummary.verifiedFieldCount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {lang === 'en'
                    ? `${record.auditSummary.verifiedFieldCount}/${record.auditSummary.coreFieldTotal} Verified`
                    : `已核验 ${record.auditSummary.verifiedFieldCount}/${record.auditSummary.coreFieldTotal} 项`}
                </span>
              </span>
              {item.badge && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7D84A] text-zinc-950 font-medium shadow-xs">
                  {item.badge}
                </span>
              )}
              <div className="flex items-center space-x-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{item.tdpWatts > 0 ? `${item.tdpWatts}W` : (lang === 'en' ? 'Power not recorded' : '功耗未记录')}</span>
              </div>
            </div>

            <h2 id="hardware-detail-title" className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
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
            { id: 'benchmarks', label: lang === 'en' ? 'Reference scores' : '性能参考', icon: <BarChart2 className="w-3.5 h-3.5" /> },
            { id: 'price', label: lang === 'en' ? 'Price references' : '价格记录', icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { id: 'specs', label: lang === 'en' ? 'Full Tech Specs' : '全套技术规格', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'reviews', label: lang === 'en' ? 'Reviews & Guides' : '实测视频与文档直达', icon: <Tv className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              data-detail-tab={tab.id}
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
          {copyFailed && <p role="alert" className="text-xs text-red-600">{lang === 'zh' ? '复制失败，请检查剪贴板权限。' : 'Copy failed. Check clipboard permissions.'}</p>}
          {activeTab === 'benchmarks' && <HardwareMeasurements record={record} view="benchmarks" lang={lang} />}
          {activeTab === 'price' && <HardwareMeasurements record={record} view="price" lang={lang} />}
          {/* TAB 3: 全套技术规格 */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <HardwareEvidence record={record} lang={lang} />

              {/* Specs Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {record.specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">{spec.label}</span>
                      {spec.verificationStatus === 'verified' && (
                        <span
                          className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono"
                          title={
                            spec.checkedAt
                              ? lang === 'en'
                                ? `Verified against source on ${spec.checkedAt}`
                                : `已核验对照：${spec.checkedAt}`
                              : lang === 'en'
                              ? 'Verified against source'
                              : '已核验对照'
                          }
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-right">{spec.value}</span>
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
                      ? 'Check socket, dimensions, power connections and firmware compatibility in the product manuals.'
                      : '请按产品说明书核对插槽、尺寸、供电与固件兼容性。'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 权威测评与数据库直达 */}
          {/* TAB 4: 权威技术白皮书与 B站实测视频直达 */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* 1. 官方技术白皮书与权威规格直达 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-bold text-zinc-900 dark:text-white">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {lang === 'en'
                        ? 'Specification sources & reading references'
                        : '规格来源与延伸资料'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                    {lang === 'en' ? `${docsLinks.length} Direct Links` : `${docsLinks.length} 个直达链接`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {docsLinks.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md transition-all flex items-start justify-between group text-xs cursor-pointer"
                    >
                      <div className="space-y-1.5 pr-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase inline-block ${
                            doc.platform === 'zol'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                              : doc.platform === 'intel-ark'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800'
                              : doc.platform === 'amd'
                              ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300/60 dark:border-red-800'
                              : doc.platform === 'nvidia'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {doc.platform === 'zol'
                            ? 'ZOL 中关村在线'
                            : doc.platform === 'intel-ark'
                            ? 'Intel ARK'
                            : doc.platform === 'amd'
                            ? 'AMD 官方'
                            : doc.platform === 'nvidia'
                            ? 'NVIDIA 官方'
                            : doc.platform === 'techpowerup'
                            ? 'TechPowerUp'
                            : (lang === 'en' ? 'Reference site' : '资料站点')}
                        </span>
                        <h5 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {doc.title}
                        </h5>
                        {doc.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* 2. 权威评测与实机视频精选 (Bilibili / YouTube 高清直达) */}
              <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm font-bold text-zinc-900 dark:text-white">
                    <Video className="w-4 h-4 text-pink-500" />
                    <span>
                      {lang === 'en'
                        ? 'Reviews & video search'
                        : '评测资料与视频搜索'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/40">
                    {lang === 'en' ? `${reviewLinks.length} links` : `${reviewLinks.length} 条链接`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reviewLinks.map((link, idx) => {
                    const isYouTube = link.platform === 'youtube' || (link.url && link.url.includes('youtube.com'));
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all flex items-start justify-between group text-xs cursor-pointer ${
                          isYouTube
                            ? 'hover:border-red-500/50'
                            : 'hover:border-pink-500/50'
                        }`}
                      >
                        <div className="space-y-1.5 pr-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase inline-block ${
                              isYouTube
                                ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60'
                                : 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60'
                            }`}
                          >
                              {isYouTube ? 'YouTube' : /(^|\.)bilibili\.com$/.test(new URL(link.url).hostname) ? 'Bilibili' : new URL(link.url).hostname}
                              {link.author ? ` · ${link.author}` : ''}
                          </span>
                          <h5
                            className={`font-bold text-zinc-900 dark:text-white transition-colors leading-snug ${
                              isYouTube ? 'group-hover:text-red-500' : 'group-hover:text-pink-500'
                            }`}
                          >
                            {link.title}
                          </h5>
                          {link.summary && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              💡 {link.summary}
                            </p>
                          )}
                        </div>
                        <ExternalLink
                          className={`w-4 h-4 text-zinc-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                            isYouTube ? 'group-hover:text-red-500' : 'group-hover:text-pink-500'
                          }`}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom E-commerce Action Bar */}
        <div className="p-5 bg-zinc-50/80 dark:bg-zinc-950/70 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            {lang === 'en' ? 'Reference price range: ' : '参考价格区间：'}
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
