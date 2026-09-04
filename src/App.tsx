import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
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

  // Check unread version on mount
  useEffect(() => {
    const latestVersion = changelogList[0]?.version || 'v1.0.0';
    const lastReadVersion = localStorage.getItem('silicon_wiki_read_version');
    if (lastReadVersion === latestVersion) {
      setHasUnreadChangelog(false);
    }
  }, []);

  const handleMarkAllAsRead = () => {
    const latestVersion = changelogList[0]?.version || 'v1.0.0';
    localStorage.setItem('silicon_wiki_read_version', latestVersion);
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
          {activeTab === 'wiki' && <HardwareWiki />}
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
          onClose={() => setIsChangelogOpen(false)}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      </div>
    </ThemeProvider>
  );
}
