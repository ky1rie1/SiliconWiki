import React from 'react';
import { Cpu, ExternalLink, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { ActiveTab } from '../../types';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenChangelog }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 transition-colors mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                SiliconWiki 芯知
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              致力于打造纯净、专业、免维护的计算机软硬件知识与三维装机实景互动全书。让每一个热爱数码与 DIY 的人都能轻松看懂硬件。
            </p>
            <div className="pt-1 text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
              <span>for PC Enthusiasts & Builders</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              核心功能板块
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onTabChange('wiki')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  🖥️ 硬件全景百科（台式机/笔记本）
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('rankings')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  📊 性能天梯榜与 PK 横向比拼台
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('simulator3d')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  🛠️ Three.js 3D 实景装机与爆炸拆解
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('glossary')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  📖 硬件名词大白话通俗宝典
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('builds')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  💰 3000~25000元预算精选配置单
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources & Attribution */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              数据致敬与权威溯源
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <a
                  href="https://socpk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>极客湾 Geekerwan 天梯排行榜</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.techpowerup.com/gpu-specs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>TechPowerUp GPU 官方芯片库</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.3dmark.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>UL 3DMark 基准测试平台</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ark.intel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <span>Intel ARK & AMD 官方芯片白皮书</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Updates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              部署与日志
            </h4>
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">100% 静态免服架构 · 支持 Vercel 免费部署</span>
              </div>
              <p>
                已配置永久有效的自营语义搜索锚点，彻底避免商品详情页下架 404 失效。
              </p>
              <button
                onClick={onOpenChangelog}
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-cyan-400 hover:underline"
              >
                <span>查看版本更新日志与公告</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimer */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>
              免责声明：硬件市场行情因批次与促销可能存在小幅浮动，跑分供选购参考，实际以官方实机实测为准。
            </span>
          </div>
          <div>© {new Date().getFullYear()} SiliconWiki. Open for everyone.</div>
        </div>
      </div>
    </footer>
  );
};
