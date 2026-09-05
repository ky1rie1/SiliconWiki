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
  Sliders,
} from 'lucide-react';
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

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenChangelog,
  hasUnreadChangelog,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const { isDevMode, setIsEditorOpen } = useCustomContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [hasUnread, setHasUnread] = useState<boolean>(() => {
    try {
      return localStorage.getItem('_sw_last_seen_changelog_ver') !== 'v2.4.0';
    } catch {
      return true;
    }
  });

  React.useEffect(() => {
    try {
      const isUnread = localStorage.getItem('_sw_last_seen_changelog_ver') !== 'v2.4.0';
      setHasUnread(isUnread);
    } catch {
      // fallback
    }
  }, [hasUnreadChangelog]);

  const handleOpenChangelog = () => {
    try {
      localStorage.setItem('_sw_last_seen_changelog_ver', 'v2.4.0');
    } catch {
      // ignore
    }
    setHasUnread(false);
    onOpenChangelog();
  };

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
          className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 ease-fluid"
          onClick={() => onTabChange('wiki')}
        >
          {/* Iconic Chip Mark */}
          <div className="relative w-8 h-8 rounded-xl shadow-md shadow-[#F7D84A]/20 group-hover:scale-105 group-hover:shadow-[#F7D84A]/40 group-active:scale-95 transition-all duration-200 ease-fluid shrink-0 overflow-hidden">
            <svg viewBox="0 0 512 512" className="w-full h-full" fill="none">
              <rect width="512" height="512" rx="112" fill="#F7D84A" />
              <rect x="92" y="92" width="328" height="328" rx="36" fill="#09090b" />
              <rect x="120" y="120" width="272" height="272" rx="76" fill="none" stroke="#F7D84A" strokeWidth="11" />
              <rect x="190" y="190" width="132" height="132" rx="14" fill="#F7D84A" />
            </svg>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-mono leading-none">
              Silicon<span className="text-[#F7D84A] drop-shadow-[0_0_12px_rgba(247,216,74,0.35)]">Wiki</span>
            </span>
            <span className="hidden xl:inline-flex items-center space-x-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#F7D84A]/10 border border-[#F7D84A]/30 text-amber-900 dark:text-[#F7D84A] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7D84A] shadow-[0_0_6px_#F7D84A]" />
              <span>{lang === 'zh' ? '芯知硬件百科' : 'SiliconWiki'}</span>
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
                className={`relative flex items-center space-x-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-fluid active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-md shadow-black/20 dark:bg-slate-900 dark:text-white ring-1 ring-[#F7D84A]/70 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-xs'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F7D84A] text-slate-950 font-black leading-tight uppercase shadow-sm">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#F7D84A] shadow-[0_0_6px_#F7D84A]" />
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
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-[#F7D84A]/60 dark:hover:border-[#F7D84A]/60 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all duration-200 ease-fluid active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] group cursor-pointer"
            title={lang === 'zh' ? '全局搜索 (快捷键: / 或 Ctrl+K)' : 'Omnisearch (Shortcut: / or Ctrl+K)'}
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#F7D84A] transition-colors" />
            <span className="hidden 2xl:inline text-slate-600 dark:text-slate-300 font-sans">{t('searchPlaceholder')}</span>
            <kbd className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-medium rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-[#F7D84A]/40 transition-colors">
              {t('searchShortcut')}
            </kbd>
          </button>

          {/* Persistent Diagnostics & Content Calibration Launcher */}
          {isDevMode && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/10 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-200 ease-fluid border border-slate-700 dark:border-blue-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer"
              title={t('diagFloatingBtnTitle')}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">{t('diagFloatingBtn')}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-[#F7D84A]/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-fluid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer"
            title={lang === 'zh' ? 'Switch to English' : '切换为简体中文'}
          >
            <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="font-mono text-[11px]">{lang === 'zh' ? 'EN' : '中'}</span>
          </button>

          {/* Changelog / Announcement Button */}
          <button
            onClick={handleOpenChangelog}
            className="relative flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:border-[#F7D84A]/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-fluid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer group"
            title="更新公告 / Changelog"
            aria-label="更新公告 / Changelog"
          >
            <div className="relative flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 group-hover:text-[#F7D84A] transition-colors" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7D84A] opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7D84A] shadow-[0_0_6px_#F7D84A]" />
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
              {lang === 'zh' ? '更新公告' : 'Changelog'}
            </span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:border-[#F7D84A]/50 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-fluid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer"
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
            className="md:hidden p-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-[0.98] transition-all duration-200 ease-fluid cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F7D84A]"
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
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all duration-200 ease-fluid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-slate-900 dark:text-white ring-1 ring-[#F7D84A]/60 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F7D84A] text-slate-950 font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Changelog Button */}
          <button
            onClick={() => {
              handleOpenChangelog();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-[#F7D84A]" />
              <span>{lang === 'zh' ? '更新公告 / Changelog' : 'Changelog / Updates'}</span>
            </div>
            {hasUnread && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7D84A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7D84A]" />
              </span>
            )}
          </button>

          {isDevMode && (
            <button
              onClick={() => {
                setIsEditorOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white shadow-sm active:scale-[0.98] transition-all duration-200 ease-fluid mt-2 border border-slate-800 dark:border-blue-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D84A] cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-4 h-4 text-cyan-300" />
                <span>{t('diagModalTitle')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 dark:bg-white/20 text-cyan-200 font-mono">Alt+E</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
