import React from 'react';
import { ExternalLink, Heart, ShieldAlert, BookOpen } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenChangelog }) => {
  const { lang, t } = useLanguage();

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#09090b]/80 transition-colors mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden">
                <svg viewBox="0 0 512 512" className="w-full h-full" fill="none">
                  <rect width="512" height="512" rx="112" fill="#F7D84A" />
                  <rect x="92" y="92" width="328" height="328" rx="36" fill="#09090b" />
                  <rect x="120" y="120" width="272" height="272" rx="76" fill="none" stroke="#F7D84A" strokeWidth="11" />
                  <rect x="190" y="190" width="132" height="132" rx="14" fill="#F7D84A" />
                </svg>
              </div>
              <span className="text-base font-black tracking-tight text-zinc-900 dark:text-white font-mono">
                Silicon<span className="text-[#F7D84A]">Wiki</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t('brandDesc')}
            </p>
            <div className="pt-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-1">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
              <span>for PC Enthusiasts & Builders</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              {t('footerCoreModules')}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <button
                  onClick={() => onTabChange('wiki')}
                  className="hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors cursor-pointer"
                >
                  🖥️ {t('navWiki')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('rankings')}
                  className="hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors cursor-pointer"
                >
                  📊 {t('navRankings')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('simulator3d')}
                  className="hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors cursor-pointer"
                >
                  🛠️ {t('nav3D')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('glossary')}
                  className="hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors cursor-pointer"
                >
                  📖 {t('navGlossary')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('builds')}
                  className="hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors cursor-pointer"
                >
                  💰 {t('navBuilds')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources & Attribution */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              {t('footerDataSources')}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <a
                  href="https://socpk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors"
                >
                  <span>
                    {lang === 'en'
                      ? 'Geekerwan Official Benchmark Ladder'
                      : '极客湾 Geekerwan 天梯排行榜'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.techpowerup.com/gpu-specs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors"
                >
                  <span>
                    {lang === 'en'
                      ? 'TechPowerUp GPU Database'
                      : 'TechPowerUp GPU 官方芯片库'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.3dmark.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors"
                >
                  <span>
                    {lang === 'en'
                      ? 'UL 3DMark Benchmark Platform'
                      : 'UL 3DMark 基准测试平台'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ark.intel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 hover:text-amber-600 dark:hover:text-[#F7D84A] transition-colors"
                >
                  <span>
                    {lang === 'en'
                      ? 'Intel ARK & AMD Official Specs'
                      : 'Intel ARK & AMD 官方芯片白皮书'}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Updates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
              {t('footerPlatform')}
            </h4>
            <div className="space-y-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center space-x-1.5 text-amber-600 dark:text-[#F7D84A]">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {lang === 'zh'
                    ? '开放互动的计算机硬件知识维基'
                    : 'Open & Interactive Hardware Wiki'}
                </span>
              </div>
              <p>
                {lang === 'zh'
                  ? '配备智能电商搜索与实时跑分追踪，告别链接失效与过时数据。'
                  : 'Equipped with live e-commerce search anchors and verified benchmark ladders.'}
              </p>
              <button
                onClick={onOpenChangelog}
                className="inline-flex items-center space-x-1 text-amber-600 dark:text-[#F7D84A] hover:underline block font-medium cursor-pointer"
              >
                <span>{lang === 'zh' ? '查看版本更新日志与公告' : 'View Version Changelog'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimer */}
        <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F7D84A]" />
            <span>{t('footerDisclaimer')}</span>
          </div>
          <div>© {new Date().getFullYear()} SiliconWiki. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};
