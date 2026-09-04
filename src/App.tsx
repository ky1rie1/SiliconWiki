import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wiki');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [hasUnreadChangelog, setHasUnreadChangelog] = useState(true);

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
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
          {/* Global Navbar */}
          <Navbar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenChangelog={() => setIsChangelogOpen(true)}
            hasUnreadChangelog={hasUnreadChangelog}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {activeTab === 'wiki' && (
              <HardwareWiki
                onNavigateToGlossary={() => {
                  setActiveTab('glossary');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
            {activeTab === 'rankings' && <BenchmarkLadder />}
            {activeTab === 'simulator3d' && <AssemblySimulator3D />}
            {activeTab === 'glossary' && <GlossaryView />}
            {activeTab === 'builds' && <BudgetBuilds />}
          </main>

          {/* Global Footer */}
          <Footer
            onTabChange={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChangelog={() => setIsChangelogOpen(true)}
          />

          {/* Global Omnisearch Modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Changelog & Announcements Modal */}
          <ChangelogModal
            isOpen={isChangelogOpen}
            onClose={handleCloseChangelog}
            onMarkAllAsRead={handleMarkAllAsRead}
            latestVersion={changelogList[0]?.version}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
