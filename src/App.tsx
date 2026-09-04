import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CustomContentProvider } from './context/CustomContentContext';
import { QuickTextEditorModal } from './components/admin/QuickTextEditorModal';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HardwareWiki } from './components/wiki/HardwareWiki';
import { BenchmarkLadder } from './components/rankings/BenchmarkLadder';
import { AssemblySimulator3D } from './components/assembly/AssemblySimulator3D';
import { GlossaryView } from './components/glossary/GlossaryView';
import { BudgetBuilds } from './components/builds/BudgetBuilds';
import { SearchModal } from './components/search/SearchModal';
import { ChangelogModal } from './components/changelog/ChangelogModal';
import { ActiveTab } from './types';
import { changelogList } from './data/changelog';

/**
 * Parses current route from URL query params, hash, pathname, or hostname subdomain.
 * Priority: Query Param > URL Hash > Pathname > Subdomain > Default ('wiki')
 */
function parseRouteToTab(): ActiveTab {
  if (typeof window === 'undefined') return 'wiki';

  // 1. URL Query Parameter (?tab=simulator3d, ?tab=rankings, ?tab=3d, etc.)
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab')?.toLowerCase();
  if (tabParam) {
    if (tabParam === 'simulator3d' || tabParam === '3d' || tabParam === 'build') return 'simulator3d';
    if (tabParam === 'rankings' || tabParam === 'rank' || tabParam === 'ladder') return 'rankings';
    if (tabParam === 'wiki') return 'wiki';
    if (tabParam === 'glossary' || tabParam === 'dict') return 'glossary';
    if (tabParam === 'builds' || tabParam === 'budget') return 'builds';
  }

  // 2. URL Hash (/#/3d, #/rankings, #simulator3d, #builds, etc.)
  const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').trim();
  if (rawHash) {
    if (rawHash === 'simulator3d' || rawHash === '3d' || rawHash === 'build') return 'simulator3d';
    if (rawHash === 'rankings' || rawHash === 'rank' || rawHash === 'ladder') return 'rankings';
    if (rawHash === 'wiki') return 'wiki';
    if (rawHash === 'glossary' || rawHash === 'dict') return 'glossary';
    if (rawHash === 'builds' || rawHash === 'budget') return 'builds';
  }

  // 3. Pathname for SPA rewrites (/3d, /rankings, /wiki, /glossary, /builds)
  const pathname = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '').trim();
  if (pathname) {
    if (pathname === 'simulator3d' || pathname === '3d' || pathname === 'build') return 'simulator3d';
    if (pathname === 'rankings' || pathname === 'rank' || pathname === 'ladder') return 'rankings';
    if (pathname === 'wiki') return 'wiki';
    if (pathname === 'glossary' || pathname === 'dict') return 'glossary';
    if (pathname === 'builds' || pathname === 'budget') return 'builds';
  }

  // 4. Subdomain from hostname
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.startsWith('3d.') || hostname.startsWith('build.')) return 'simulator3d';
  if (hostname.startsWith('rank.') || hostname.startsWith('ladder.')) return 'rankings';
  if (hostname.startsWith('wiki.')) return 'wiki';
  if (hostname.startsWith('dict.') || hostname.startsWith('glossary.')) return 'glossary';
  if (hostname.startsWith('budget.')) return 'builds';

  return 'wiki';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(parseRouteToTab);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [hasUnreadChangelog, setHasUnreadChangelog] = useState(true);

  // Synchronize tab changes to URL hash or query cleanly
  const handleTabChange = useCallback((newTab: ActiveTab, shouldScroll = true) => {
    setActiveTab(newTab);

    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('tab')) {
        url.searchParams.set('tab', newTab);
        url.hash = '';
        window.history.replaceState(null, '', url.pathname + url.search);
      } else {
        window.history.replaceState(null, '', `#/${newTab}`);
      }
    } catch {
      window.location.hash = `#/${newTab}`;
    }

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen for browser Back / Forward buttons and external hash changes
  useEffect(() => {
    const handlePopState = () => {
      const parsedTab = parseRouteToTab();
      setActiveTab((current) => (current !== parsedTab ? parsedTab : current));
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Check if current version announcement was already dismissed by user
  useEffect(() => {
    const latestVersion = changelogList[0]?.version || 'v1.0.0';
    const dismissedVersion = localStorage.getItem('silicon_wiki_dismissed_version');
    if (dismissedVersion !== latestVersion) {
      // Auto-open notification on new update version!
      setIsChangelogOpen(true);
      setHasUnreadChangelog(true);
    } else {
      setHasUnreadChangelog(false);
    }
  }, []);

  const handleCloseChangelog = (dontShowAgain?: boolean) => {
    const latestVersion = changelogList[0]?.version || 'v1.0.0';
    if (dontShowAgain) {
      localStorage.setItem('silicon_wiki_dismissed_version', latestVersion);
      setHasUnreadChangelog(false);
    }
    setIsChangelogOpen(false);
  };

  const handleMarkAllAsRead = () => {
    const latestVersion = changelogList[0]?.version || 'v1.0.0';
    localStorage.setItem('silicon_wiki_dismissed_version', latestVersion);
    setHasUnreadChangelog(false);
  };

  // Listen for global / or Ctrl+K key shortcut to trigger search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CustomContentProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 selection:bg-[#F7D84A]/30 selection:text-slate-950 dark:selection:text-[#F7D84A] transition-colors duration-200">
            {/* Global Navbar */}
            <Navbar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenChangelog={() => setIsChangelogOpen(true)}
              hasUnreadChangelog={hasUnreadChangelog}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              {activeTab === 'wiki' && (
                <HardwareWiki
                  onNavigateToGlossary={() => handleTabChange('glossary')}
                />
              )}
              {activeTab === 'rankings' && <BenchmarkLadder />}
              {activeTab === 'simulator3d' && <AssemblySimulator3D />}
              {activeTab === 'glossary' && <GlossaryView />}
              {activeTab === 'builds' && <BudgetBuilds />}
            </main>

            {/* Global Footer */}
            <Footer
              onTabChange={handleTabChange}
              onOpenChangelog={() => setIsChangelogOpen(true)}
            />

            {/* Global Omnisearch Modal */}
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={handleTabChange}
            />

            {/* Changelog & Announcements Modal */}
            <ChangelogModal
              isOpen={isChangelogOpen}
              onClose={handleCloseChangelog}
              onMarkAllAsRead={handleMarkAllAsRead}
              latestVersion={changelogList[0]?.version}
            />

            {/* Quick In-Browser Text Customizer System */}
            <QuickTextEditorModal />
          </div>
        </CustomContentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
