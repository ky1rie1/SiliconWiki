import { ArrowUpRight } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenChangelog: () => void;
}

export function Footer({ onTabChange, onOpenChangelog }: FooterProps) {
  const { lang, t } = useLanguage();
  const links = [
    { tab: 'wiki', label: t('navWiki') },
    { tab: 'rankings', label: t('navRankings') },
    { tab: 'simulator3d', label: t('nav3D') },
    { tab: 'glossary', label: t('navGlossary') },
    { tab: 'builds', label: t('navBuilds') },
  ] as const;
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-about">
            <button className="brand-lockup" onClick={() => onTabChange('wiki')}><img src="/logo-icon.svg" width="30" height="30" alt="" /><span>Silicon<span className="brand-word">Wiki</span></span></button>
            <p>{lang === 'zh' ? '让硬件知识触手可及。为好奇心而探索，为每一台属于自己的电脑。' : 'Hardware knowledge, within reach. For curious minds and computers you can call your own.'}</p>
          </div>
          <nav className="footer-links" aria-label={lang === 'zh' ? '页脚导航与数据来源' : 'Footer navigation and sources'}>
            {links.map(({ tab, label }) => <button key={tab} onClick={() => onTabChange(tab)}>{label}</button>)}
            <button onClick={onOpenChangelog}>{lang === 'zh' ? '更新日志' : 'Changelog'}<ArrowUpRight size={13} /></button>
            <a href="https://socpk.com/" target="_blank" rel="noopener noreferrer">Geekerwan<ArrowUpRight size={13} /></a>
            <a href="https://www.techpowerup.com/gpu-specs/" target="_blank" rel="noopener noreferrer">TechPowerUp<ArrowUpRight size={13} /></a>
            <a href="https://www.3dmark.com/" target="_blank" rel="noopener noreferrer">3DMark<ArrowUpRight size={13} /></a>
            <a href="https://ark.intel.com/" target="_blank" rel="noopener noreferrer">Intel ARK<ArrowUpRight size={13} /></a>
          </nav>
        </div>
        <div className="footer-bottom"><span>{t('footerDisclaimer')}</span><span>© {new Date().getFullYear()} SiliconWiki · {lang === 'zh' ? '为每一份好奇心' : 'Made for curious minds'}</span></div>
      </div>
    </footer>
  );
}
