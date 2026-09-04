import React, { useState } from 'react';
import {
  Laptop,
  Flame,
  Monitor,
  Cpu,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { HardwareCard } from './HardwareCard';
import { useLanguage } from '../../context/LanguageContext';

export const LaptopSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const [activeGuideTab, setActiveGuideTab] = useState<
    'vs' | 'tgp' | 'screen' | 'cooling' | 'matrix'
  >('vs');

  const laptopItems = hardwareList.filter((item) => item.category === 'laptop');

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50/80 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl relative overflow-hidden shadow-xs dark:shadow-2xl transition-colors">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            <Laptop className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
            <span>
              {lang === 'en'
                ? 'Laptop Mobile Architecture & Buyer Guide'
                : '笔记本移动端专项全景指南'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {t('laptopHeroTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {t('laptopHeroDesc')}
          </p>
        </div>
      </div>

      {/* Guide Sub-tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'vs', label: t('laptopTabVs'), icon: <Cpu className="w-4 h-4" /> },
          { id: 'tgp', label: t('laptopTabTgp'), icon: <Flame className="w-4 h-4" /> },
          { id: 'screen', label: t('laptopTabScreen'), icon: <Monitor className="w-4 h-4" /> },
          { id: 'cooling', label: t('laptopTabCooling'), icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGuideTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeGuideTab === tab.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                : 'bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Guide Content Panels */}
      <div className="bg-white dark:bg-[#09090b] rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {activeGuideTab === 'vs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-[#F7D84A]" />
              <span>
                {lang === 'en'
                  ? 'Exposed: "Identical Model Name, Different Silicon" Trap'
                  : '揭秘：“同名不同芯”的行业潜规则'}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lang === 'en'
                ? 'To control heat inside thin chassis with limited battery life, manufacturers drastically trim core counts or power limits on mobile chips. Never equate laptop parts directly with desktops:'
                : '为了在笔记本有限的轻薄电池与狭窄空间中压制发热，厂商往往会对移动端芯片进行大幅度的核心精简或频率阉割，请勿将笔记本型号与台式机简单划等号：'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
                <div className="font-bold text-sm text-zinc-900 dark:text-[#F7D84A]">
                  {lang === 'en' ? 'GPU Architecture Divergence' : 'GPU 显卡断层对比'}
                </div>
                <ul className="text-xs space-y-2 text-zinc-600 dark:text-zinc-300">
                  <li>
                    • <strong>RTX 4090 Laptop</strong>: {lang === 'en' ? 'Not the desktop AD102 core, but desktop RTX 4080-grade AD103 with 16GB VRAM (vs 24GB on desktop). Performs on par with desktop RTX 4070 Ti.' : '并不是桌面 4090（AD102），实际采用的是桌面 RTX 4080 级别的 AD103 核心，显存仅 16GB（桌面为 24GB），性能相当于桌面 RTX 4070 Ti。'}
                  </li>
                  <li>
                    • <strong>RTX 4070 Laptop</strong>: {lang === 'en' ? 'Limited SM count; actual gaming performance closely mirrors desktop RTX 4060 Ti.' : '由于流处理器限制，实际性能表现更接近桌面端 RTX 4060 Ti。'}
                  </li>
                  <li>
                    • <strong>RTX 4060 Laptop</strong>: {lang === 'en' ? 'Most faithful conversion; core count matches desktop, and at 140W max TGP reaches 95% of desktop RTX 4060!' : '规格最良心，核心数与桌面版基本一致，满血 140W 下性能几乎达到桌面 RTX 4060 的 95%！'}
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
                <div className="font-bold text-sm text-zinc-900 dark:text-[#F7D84A]">
                  {lang === 'en' ? 'CPU Suffix Decoder' : 'CPU 处理器字母后缀玄机'}
                </div>
                <ul className="text-xs space-y-2 text-zinc-600 dark:text-zinc-300">
                  <li>
                    • <strong>HX Suffix (e.g. i9-14900HX)</strong>: {lang === 'en' ? 'Desktop die packaged into BGA socket. Full 24 cores / 32 threads, monstrous peak burst speed, but drains battery swiftly.' : '桌面端芯片直接封装为 BGA 焊在笔记本主板上，完整 24 核 32 线程，性能极限最猛，但耗电极快。'}
                  </li>
                  <li>
                    • <strong>H / HS Suffix (e.g. 8845H)</strong>: {lang === 'en' ? 'Standard mobile voltage processor balancing high computing throughput and battery life with strong iGPU.' : '正统移动标压处理器，兼顾高性能与日常续航，核显性能强大。'}
                  </li>
                  <li>
                    • <strong>U Suffix (e.g. 150U)</strong>: {lang === 'en' ? 'Ultra-low power 15W chip strictly for thin-and-light office productivity and media browsing. Avoid for 3A gaming.' : '超低功耗超轻薄办公芯片（15W），只适合文字处理网页浏览，拒绝打大型 3A 游戏。'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'tgp' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-rose-500" />
              <span>
                {lang === 'en'
                  ? 'Beware Constrained Power Walls: TGP vs. Real-World Output'
                  : '警惕“残血版”功耗墙：TGP 与性能释放'}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lang === 'en'
                ? 'Two laptops with the exact same spec sheet (both reading RTX 4060) can differ dramatically: a 45W throttled model versus a 140W full-power chassis exhibits up to a 35%~45% FPS gap!'
                : '在笔记本中，哪怕两台电脑配置表一模一样（都写着 RTX 4060），但如果一台给的功耗是 45W（残血轻薄款），另一台给的是 140W（满血游戏本），真实游戏帧率差距可达 35%~45%！'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  {lang === 'en' ? 'Constrained (45W~65W)' : '残血版 (45W~65W)'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
                  ~60% {lang === 'en' ? 'Perf' : '性能'}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                  {lang === 'en'
                    ? 'Found in ultra-thin "creator" chassis; heavily throttles under sustained 3A loads.'
                    : '常见于部分打着全能本旗号的超薄机型，高画质极易过热撞墙降频。'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/80 border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-900 dark:text-[#F7D84A] font-semibold mb-1">
                  {lang === 'en' ? 'Sweet Spot (100W~115W)' : '甜点释放 (100W~115W)'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
                  ~95% {lang === 'en' ? 'Perf' : '性能'}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                  {lang === 'en'
                    ? 'Due to Ada architecture efficiency, returns diminish past 100W. Best noise & thermal balance.'
                    : 'Ada 架构能效比优异，4060 在 100W 之后性能边际效应递减，此区间温度噪音最均衡。'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  {lang === 'en' ? 'Full TGP (140W)' : '满血版 (140W TGP)'}
                </div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white font-mono">
                  100% {lang === 'en' ? 'Output' : '满血'}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                  {lang === 'en'
                    ? 'Standard for dedicated gaming laptops (Legion, Omen, TUF) with full Dynamic Boost enabled.'
                    : '主流正规游戏本标配（如拯救者、天选、暗影精灵），带 Dynamic Boost 动态功耗拉满。'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'screen' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-cyan-500" />
              <span>
                {lang === 'en'
                  ? '4 Display Pillars: Panel, Gamut, Refresh Rate & Eye Comfort'
                  : '笔记本屏幕四大金刚指标：面板、色域、高刷与护眼'}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-[#F7D84A] block text-sm">
                  IPS (Fast-IPS)
                </span>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {lang === 'en'
                    ? 'Mainstream pick for gaming laptops. Zero burn-in risk, long lifespan, flicker-free DC dimming. Require 100% sRGB and 144Hz/240Hz refresh rate.'
                    : '当前游戏本最主流的选择。优点是无烧屏风险、寿命长、DC 调光不闪烁护眼。选购必须认准 100% sRGB 色域 + 144Hz/240Hz 高刷，坚决远离 45% NTSC 劣质瞎眼屏。'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-[#F7D84A] block text-sm">
                  OLED
                </span>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {lang === 'en'
                    ? 'Thin-and-light creator favorite. Self-emissive pure blacks, 100% DCI-P3 wide color gamut. Look for high-frequency PWM dimming for eye comfort.'
                    : '轻薄全能本宠儿。像素点纯黑自发光，色彩极其艳丽（100% DCI-P3 广色域），观影震撼。缺点是长时间固定显示桌面图标有烧屏可能，低亮度需关注 PWM 高频调光防频闪。'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-[#F7D84A] block text-sm">
                  Mini-LED
                </span>
                <p className="text-zinc-600 dark:text-zinc-300">
                  {lang === 'en'
                    ? 'High-end flagship and MacBook Pro benchmark. Thousands of micro dimming zones, 1000~1600 nits peak brightness, breathtaking HDR with zero burn-in anxiety.'
                    : '高端发烧本与 MacBook Pro 标配。拥有数千个微米级背光分区，峰值亮度轻松突破 1000~1600 nits，HDR 效果毁天灭地，且完全没有 OLED 的烧屏焦虑。'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'cooling' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-emerald-500" />
              <span>
                {lang === 'en'
                  ? 'Thermal Solution: Vapor Chamber (VC) & Liquid Metal'
                  : '模具散热：均热板 (VC) 与液金导热注意事项'}
              </span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>{lang === 'en' ? 'Vapor Chamber (VC)' : '均热板 (Vapor Chamber)'}</strong>：
                  {lang === 'en'
                    ? 'Spreads heat across a surface area multiple times larger than heatpipes via phase change. The hallmark of premium thin-and-lights and flagship gaming laptops.'
                    : '比传统铜管导热面积大数倍，内部真空腔体利用液体相变循环散热，能把发热大户的热量迅速均摊到整个出风口，是顶级轻薄本和旗舰游戏本的标志。'}
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong>{lang === 'en' ? 'Liquid Metal Compound' : '液态金属导热'}</strong>：
                  {lang === 'en'
                    ? 'Boasts ~10x higher thermal conductivity than standard paste. However, it is electrically conductive — never disassemble liquid metal heatsinks yourself!'
                    : '导热系数比普通硅脂高 10 倍，能大幅压低 CPU 核心温度。但液金具备导电性，长期立放或剧烈磕碰一旦密封泡棉老化漏液会导致主板短路烧毁。小白用户日常使用切忌私自拆卸液金散热器！'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Laptop Models Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {lang === 'en'
                ? 'Curated Benchmark Laptop Models & Live Pricing'
                : '精选标杆笔记本系列与实时比价'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'en'
                ? 'Covering high-refresh esports rigs, all-day battery thin-and-lights, and creative flagships'
                : '涵盖专业电竞游戏本、超长续航全能本与苹果移动创作旗舰'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {laptopItems.map((laptop) => (
            <HardwareCard key={laptop.id} item={laptop} />
          ))}
        </div>
      </div>
    </div>
  );
};
