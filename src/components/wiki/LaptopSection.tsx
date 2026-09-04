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

export const LaptopSection: React.FC = () => {
  const [activeGuideTab, setActiveGuideTab] = useState<
    'vs' | 'tgp' | 'screen' | 'cooling' | 'matrix'
  >('vs');

  const laptopItems = hardwareList.filter((item) => item.category === 'laptop');

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-900/20 via-blue-900/10 to-slate-900/20 border border-blue-200/50 dark:border-blue-800/40 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-400 text-xs font-semibold">
            <Laptop className="w-3.5 h-3.5" />
            <span>笔记本移动端专项全景指南</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            拆解移动端迷思：拒绝同名不同芯与残血缩水
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            笔记本选购与台式机截然不同。同样的芯片型号，在不同模具散热与供电策略下，性能差异可达 40% 以上。本专区为您揭秘功耗墙机制、屏幕面板素质与真实选购决策。
          </p>
        </div>
      </div>

      {/* Guide Sub-tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'vs', label: '移动版 vs 桌面版芯片差异', icon: <Cpu className="w-4 h-4" /> },
          { id: 'tgp', label: '功耗墙与残血/满血识别', icon: <Flame className="w-4 h-4" /> },
          { id: 'screen', label: '屏幕素质 (IPS/OLED/MiniLED)', icon: <Monitor className="w-4 h-4" /> },
          { id: 'cooling', label: '模具均热板与液金避坑', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGuideTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeGuideTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Guide Content Panels */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        {activeGuideTab === 'vs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-blue-600" />
              <span>揭秘：“同名不同芯”的行业潜规则</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              为了在笔记本有限的轻薄电池与狭窄空间中压制发热，厂商往往会对移动端芯片进行大幅度的核心精简或频率阉割，请勿将笔记本型号与台式机简单划等号：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="font-bold text-sm text-blue-600 dark:text-cyan-400">
                  GPU 显卡断层对比
                </div>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <li>
                    • <strong>RTX 4090 Laptop</strong>：并不是桌面 4090（AD102），实际采用的是桌面 RTX 4080 级别的 AD103 核心，显存仅 16GB（桌面为 24GB），性能相当于桌面 RTX 4070 Ti。
                  </li>
                  <li>
                    • <strong>RTX 4070 Laptop</strong>：由于流处理器限制，实际性能表现更接近桌面端 RTX 4060 Ti。
                  </li>
                  <li>
                    • <strong>RTX 4060 Laptop</strong>：规格最良心，核心数与桌面版基本一致，满血 140W 下性能几乎达到桌面 RTX 4060 的 95%！
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  CPU 处理器字母后缀玄机
                </div>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <li>
                    • <strong>HX 后缀 (如 i9-14900HX)</strong>：桌面端芯片直接封装为 BGA 焊在笔记本主板上，完整 24 核 32 线程，性能极限最猛，但耗电极快。
                  </li>
                  <li>
                    • <strong>H / HS 后缀 (如 8845H)</strong>：正统移动标压处理器，兼顾高性能与日常续航，核显性能强大。
                  </li>
                  <li>
                    • <strong>U 后缀 (如 150U)</strong>：超低功耗超轻薄办公芯片（15W），只适合文字处理网页浏览，拒绝打大型 3A 游戏。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'tgp' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-rose-500" />
              <span>警惕“残血版”功耗墙：TGP 与性能释放</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              在笔记本中，哪怕两台电脑配置表一模一样（都写着 RTX 4060），但如果一台给的功耗是 45W（残血轻薄款），另一台给的是 140W（满血游戏本），真实游戏帧率差距可达 35%~45%！
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
                  残血版 (45W~65W)
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  ~60% 性能
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  常见于部分打着全能本旗号的超薄机型，高画质极易过热撞墙降频。
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold mb-1">
                  甜点释放 (100W~115W)
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  ~95% 性能
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Ada 架构能效比优异，4060 在 100W 之后性能边际效应递减，此区间温度噪音最均衡。
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  满血版 (140W TGP)
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  100% 满血
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  主流正规游戏本标配（如拯救者、天选、暗影精灵），带 Dynamic Boost 动态功耗拉满。
                </div>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'screen' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-cyan-500" />
              <span>笔记本屏幕四大金刚指标：面板、色域、高刷与护眼</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block text-sm">
                  IPS 面板 (Fast-IPS)
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  当前游戏本最主流的选择。优点是无烧屏风险、寿命长、DC 调光不闪烁护眼。选购必须认准 100% sRGB 色域 + 144Hz/240Hz 高刷，坚决远离 45% NTSC 劣质瞎眼屏。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  OLED 面板
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  轻薄全能本宠儿。像素点纯黑自发光，色彩极其艳丽（100% DCI-P3 广色域），观影震撼。缺点是长时间固定显示桌面图标有烧屏可能，低亮度需关注 PWM 高频调光防频闪。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 block text-sm">
                  Mini-LED 面板
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  高端发烧本与 MacBook Pro 标配。拥有数千个微米级背光分区，峰值亮度轻松突破 1000~1600 nits，HDR 效果毁天灭地，且完全没有 OLED 的烧屏焦虑。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeGuideTab === 'cooling' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="w-2 h-6 rounded-full bg-emerald-500" />
              <span>模具散热：均热板 (VC) 与液金导热注意事项</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  <strong>均热板 (Vapor Chamber)</strong>：比传统铜管导热面积大数倍，内部真空腔体利用液体相变循环散热，能把发热大户的热量迅速均摊到整个出风口，是顶级轻薄本和旗舰游戏本的标志。
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong>液态金属导热</strong>：导热系数比普通硅脂高 10 倍，能大幅压低 CPU 核心温度。但液金具备导电性，长期立放或剧烈磕碰一旦密封泡棉老化漏液会导致主板短路烧毁。小白用户日常使用切忌私自拆卸液金散热器！
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              精选标杆笔记本系列与实时比价
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              涵盖专业电竞游戏本、超长续航全能本与苹果移动创作旗舰
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
