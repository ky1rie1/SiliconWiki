import React, { useState } from 'react';
import {
  Cpu,
  BarChart3,
  Box,
  BookOpen,
  DollarSign,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Languages,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenChangelog: () => void;
  hasUnreadChangelog: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenChangelog,
  hasUnreadChangelog,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'wiki', label: t('navWiki'), icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'rankings', label: t('navRankings'), icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'simulator3d', label: t('nav3D'), icon: <Box className="w-3.5 h-3.5" />, badge: '3D' },
    { id: 'glossary', label: t('navGlossary'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'builds', label: t('navBuilds'), icon: <DollarSign className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-3 z-50 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 transition-spring">
      {/* Floating Fluid Island Glass Pill */}
      <div className="relative rounded-2xl sm:rounded-full bg-white/95 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-3 sm:px-4 md:px-5 py-2 flex items-center justify-between transition-spring gap-2">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0"
          onClick={() => onTabChange('wiki')}
        >
          <div className="relative p-2 rounded-xl sm:rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 group-active:scale-95 transition-spring">
            <Cpu className="w-4 h-4" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
              Silicon<span className="text-blue-600 dark:text-cyan-400">Wiki</span>
            </span>
            <span className="hidden xl:inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium tracking-wide">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <span>{lang === 'zh' ? '芯知百科' : 'Wiki'}</span>
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 p-1 rounded-full bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center space-x-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-spring ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500 text-white font-bold leading-tight uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Tools */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Omnisearch Command Bar Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-blue-400 dark:hover:border-cyan-400 text-xs font-medium transition-spring"
            title={lang === 'zh' ? '全局搜索 (快捷键: / 或 Ctrl+K)' : 'Omnisearch (Shortcut: / or Ctrl+K)'}
          >
            <Search className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            <span className="hidden 2xl:inline text-slate-600 dark:text-slate-300 font-sans">{t('searchPlaceholder')}</span>
            <kbd className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-medium rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
              {t('searchShortcut')}
            </kbd>
          </button>

          {/* Language Switch */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-spring"
            title={lang === 'zh' ? 'Switch to English' : '切换为简体中文'}
          >
            <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="font-mono text-[11px]">{lang === 'zh' ? 'EN' : '中'}</span>
          </button>

          {/* Changelog / Announcement Button */}
          <button
            onClick={onOpenChangelog}
            className="relative p-2 rounded-full border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-spring"
            title={lang === 'zh' ? '版本更新公告与日志' : 'Version Changelog & Announcements'}
          >
            <Bell className="w-3.5 h-3.5" />
            {hasUnreadChangelog && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-spring"
            title={t('toggleTheme')}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-3 rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-spring ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
