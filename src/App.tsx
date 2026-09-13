import { Component, lazy, Suspense, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CustomContentProvider } from './context/CustomContentContext';
import { QuickTextEditorModal } from './components/admin/QuickTextEditorModal';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HardwareWiki } from './components/wiki/HardwareWiki';
import { SearchModal } from './components/search/SearchModal';
import { ChangelogModal } from './components/changelog/ChangelogModal';
import { FeedbackFloatingButton } from './components/feedback/FeedbackFloatingButton';
import { ActiveTab } from './types';
import { changelogList } from './data/changelog';
import { computeTabNavigationUrl } from './utils/navigation';
import { safeGetItem, safeSetItem } from './utils/storage';

const BenchmarkLadder = lazy(() => import('./components/rankings/BenchmarkLadder').then((module) => ({ default: module.BenchmarkLadder })));
const AssemblySimulator3D = lazy(() => import('./components/assembly/AssemblySimulator3D').then((module) => ({ default: module.AssemblySimulator3D })));
const GlossaryView = lazy(() => import('./components/glossary/GlossaryView').then((module) => ({ default: module.GlossaryView })));
const BudgetBuilds = lazy(() => import('./components/builds/BudgetBuilds').then((module) => ({ default: module.BudgetBuilds })));

function RouteFeedback({ failed = false }: { failed?: boolean }) {
  const { lang } = useLanguage();
  return (
    <div className="py-16 text-center space-y-4" role={failed ? 'alert' : 'status'} aria-live="polite" aria-busy={!failed}>
      <p>{failed
        ? (lang === 'en' ? 'This tool could not load. Reload the page to try again.' : '工具加载失败，请重新加载页面后再试。')
        : (lang === 'en' ? 'Loading your tool…' : '正在加载工具…')}</p>
      {failed && <button className="primary-action" onClick={() => window.location.reload()}>{lang === 'en' ? 'Reload page' : '重新加载页面'}</button>}
    </div>
  );
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() { return this.state.failed ? <RouteFeedback failed /> : this.props.children; }
}

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

  // Synchronize tab changes to URL hash or query cleanly with appropriate history semantics
  const handleTabChange = useCallback(
    (
      newTab: ActiveTab,
      options: { shouldScroll?: boolean; replace?: boolean; targetUrl?: string } | boolean = true
    ) => {
      const shouldScroll = typeof options === 'boolean' ? options : (options.shouldScroll ?? true);
      const replace = typeof options === 'boolean' ? false : (options.replace ?? false);
      const customTargetUrl = typeof options === 'object' ? options.targetUrl : undefined;

      try {
        const isSameTab = activeTab === newTab;
        const targetUrl = customTargetUrl || computeTabNavigationUrl(window.location.href, newTab);

        if (replace || (isSameTab && !customTargetUrl)) {
          window.history.replaceState({ tab: newTab }, '', targetUrl);
        } else {
          window.history.pushState({ tab: newTab }, '', targetUrl);
        }
      } catch {
        window.location.hash = `#/${newTab}`;
      }

      setActiveTab(newTab);

      if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [activeTab]
  );

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

  // Check if current version announcement was already dismissed or seen by user
  useEffect(() => {
    const latestVersion = changelogList[0]?.version || 'v2.5.0';
    const seenVersion = safeGetItem('_sw_last_seen_changelog_ver');
    if (seenVersion !== latestVersion) {
      setHasUnreadChangelog(true);
    } else {
      setHasUnreadChangelog(false);
    }
  }, []);

  const handleCloseChangelog = (dontShowAgain?: boolean) => {
    const latestVersion = changelogList[0]?.version || 'v2.5.0';
    safeSetItem('_sw_last_seen_changelog_ver', latestVersion);
    if (dontShowAgain) {
      safeSetItem('silicon_wiki_dismissed_version', latestVersion);
    }
    setHasUnreadChangelog(false);
    setIsChangelogOpen(false);
  };

  const handleMarkAllAsRead = () => {
    const latestVersion = changelogList[0]?.version || 'v2.5.0';
    safeSetItem('_sw_last_seen_changelog_ver', latestVersion);
    safeSetItem('silicon_wiki_dismissed_version', latestVersion);
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
          <div className="app-shell min-h-screen flex flex-col">
            {/* Global Navbar */}
            <Navbar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenChangelog={() => setIsChangelogOpen(true)}
              hasUnreadChangelog={hasUnreadChangelog}
            />

            {/* Main Content Area */}
            <main id="main-content" tabIndex={-1} className="main-content flex-1">
              <RouteErrorBoundary key={activeTab}>
                <Suspense fallback={<RouteFeedback />}>
                  {activeTab === 'wiki' && (
                    <HardwareWiki
                      onNavigate={handleTabChange}
                      onNavigateToGlossary={() => handleTabChange('glossary')}
                    />
                  )}
                  {activeTab === 'rankings' && <BenchmarkLadder />}
                  {activeTab === 'simulator3d' && <AssemblySimulator3D />}
                  {activeTab === 'glossary' && <GlossaryView />}
                  {activeTab === 'builds' && <BudgetBuilds />}
                </Suspense>
              </RouteErrorBoundary>
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

            {/* Floating User Feedback Ball & System */}
            <FeedbackFloatingButton />

            {/* Quick In-Browser Text Customizer System */}
            <QuickTextEditorModal />
          </div>
        </CustomContentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
