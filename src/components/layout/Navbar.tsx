import { useEffect, useState } from 'react';
import { Cpu, BarChart3, Box, BookOpen, DollarSign, Search, Bell, Sun, Moon, Menu, X, Languages, Sliders } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomContent } from '../../context/CustomContentContext';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenChangelog: () => void;
  hasUnreadChangelog: boolean;
}

export function Navbar({ activeTab, onTabChange, onOpenSearch, onOpenChangelog, hasUnreadChangelog }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const { isDevMode, setIsEditorOpen } = useCustomContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    { id: 'wiki', label: t('navWiki'), icon: Cpu },
    { id: 'rankings', label: t('navRankings'), icon: BarChart3 },
    { id: 'simulator3d', label: t('nav3D'), icon: Box },
    { id: 'glossary', label: t('navGlossary'), icon: BookOpen },
    { id: 'builds', label: t('navBuilds'), icon: DollarSign },
  ] as const;

  useEffect(() => { setMenuOpen(false); }, [activeTab]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        document.getElementById('navigation-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const navigate = (tab: ActiveTab) => { onTabChange(tab); setMenuOpen(false); };
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>{lang === 'zh' ? '跳至主要内容' : 'Skip to content'}</a>
      <div className="header-inner">
        <button className="brand-lockup" onClick={() => navigate('wiki')} aria-label={lang === 'zh' ? 'SiliconWiki 首页' : 'SiliconWiki home'}>
          <img src="/logo-icon.svg" alt="" width="34" height="34" />
          <span>Silicon<span className="brand-word">Wiki</span><small>{lang === 'zh' ? '芯知硬件百科' : 'The hardware field guide'}</small></span>
        </button>
        <nav className="desktop-nav" aria-label={lang === 'zh' ? '主导航' : 'Main navigation'}>
          {items.map(({ id, label }) => <button key={id} onClick={() => navigate(id)} aria-current={activeTab === id ? 'page' : undefined} className={`nav-link ${activeTab === id ? 'is-active' : ''}`}>{label}</button>)}
        </nav>
        <div className="header-actions">
          <button className="header-search" onClick={onOpenSearch} aria-label={lang === 'zh' ? '全局搜索' : 'Search everything'}><Search size={16} /><kbd>Ctrl K</kbd></button>
          {isDevMode && <button className="icon-button" onClick={() => setIsEditorOpen(true)} title={t('diagFloatingBtnTitle')} aria-label={t('diagFloatingBtnTitle')}><Sliders size={17} /></button>}
          <button className="icon-button language-button" onClick={toggleLang} title={lang === 'zh' ? 'Switch to English' : '切换为简体中文'} aria-label={lang === 'zh' ? 'Switch to English' : '切换为简体中文'}><Languages size={16} /><span>{lang === 'zh' ? 'EN' : '中'}</span></button>
          <button className="icon-button changelog-button" onClick={onOpenChangelog} title={lang === 'zh' ? '更新公告' : 'Changelog'} aria-label={lang === 'zh' ? '更新公告' : 'Changelog'}><Bell size={17} />{hasUnreadChangelog && <span className="notification-dot" />}</button>
          <button className="icon-button" onClick={toggleTheme} title={t('toggleTheme')} aria-label={t('toggleTheme')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button id="navigation-toggle" className="icon-button mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={lang === 'zh' ? '切换导航菜单' : 'Toggle navigation menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label={lang === 'zh' ? '移动端导航' : 'Mobile navigation'}>{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} aria-current={activeTab === id ? 'page' : undefined}><Icon size={18} /><span>{label}</span><span className="mobile-nav-marker">↗</span></button>)}</nav>}
    </header>
  );
}
