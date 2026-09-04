import React from 'react';
import { Cpu, ExternalLink, Heart, ShieldAlert, BookOpen, Edit3 } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomContent } from '../../context/CustomContentContext';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenChangelog }) => {
  const { lang, t } = useLanguage();
  const { setIsEditorOpen } = useCustomContent();

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
                {t('brandName')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('brandDesc')}
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
              {t('footerCoreModules')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button
                  onClick={() => onTabChange('wiki')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  🖥️ {t('navWiki')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('rankings')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  📊 {t('navRankings')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('simulator3d')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  🛠️ {t('nav3D')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('glossary')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  📖 {t('navGlossary')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('builds')}
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  💰 {t('navBuilds')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Data Sources & Attribution */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              {t('footerDataSources')}
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
              {t('footerPlatform')}
            </h4>
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400">
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
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-cyan-400 hover:underline block"
              >
                <span>{lang === 'zh' ? '查看版本更新日志与公告' : 'View Version Changelog'}</span>
              </button>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors pt-1 block"
                title="快捷键: Alt + E"
              >
                <Edit3 className="w-3 h-3 text-cyan-500 inline" />
                <span>{lang === 'zh' ? '站长文案速改 (Alt+E)' : 'Content Customizer (Alt+E)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimer */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('footerDisclaimer')}</span>
          </div>
          <div>© {new Date().getFullYear()} SiliconWiki. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};
