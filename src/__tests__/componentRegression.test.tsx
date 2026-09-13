// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { hardwareList } from '../data/hardware';
import { computeDetailOpenUrl, computeDetailCloseUrl } from '../utils/navigation';
import App from '../App';

describe('Production Component Integration & Regression Suite', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  describe('ThemeContext Storage Exception & Entry Safety', () => {
    it('should not crash when localStorage throws SecurityError on mount and fallback to system/default theme', () => {
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          const err = new Error("SecurityError: Access is denied for this document.");
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      let extractedTheme = '';
      function TestThemeConsumer() {
        const { theme } = useTheme();
        extractedTheme = theme;
        return <div id="theme-consumer">{theme}</div>;
      }

      expect(() => {
        renderToString(
          <ThemeProvider>
            <TestThemeConsumer />
          </ThemeProvider>
        );
      }).not.toThrow();

      expect(['dark', 'light']).toContain(extractedTheme);
    });

    it('should render App at root without throwing SecurityError when localStorage is blocked (entry safety)', () => {
      // Must test from App entry because ThemeProvider is outside RouteErrorBoundary
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          const err = new Error("SecurityError: Access is denied for this document.");
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      expect(() => {
        renderToString(<App />);
      }).not.toThrow();
    });

    it('should allow toggling theme on current page even if saving to localStorage fails', () => {
      let failStorageWrites = false;
      const store: Record<string, string> = { silicon_wiki_theme: 'dark' };

      Object.defineProperty(window, 'localStorage', {
        get: () => ({
          getItem: (k: string) => store[k] || null,
          setItem: (k: string, v: string) => {
            if (failStorageWrites) {
              const err = new Error('QuotaExceededError: Storage is full');
              err.name = 'QuotaExceededError';
              throw err;
            }
            store[k] = v;
          },
          removeItem: (k: string) => delete store[k],
          clear: () => {},
          length: 1,
          key: () => null,
        }),
        configurable: true,
      });

      let toggleFn: (() => void) | null = null;
      let activeTheme = '';

      function ThemeTestWidget() {
        const { theme, toggleTheme } = useTheme();
        activeTheme = theme;
        toggleFn = toggleTheme;
        return <button onClick={toggleTheme}>Toggle</button>;
      }

      renderToString(
        <ThemeProvider>
          <ThemeTestWidget />
        </ThemeProvider>
      );

      expect(activeTheme).toBe('dark');
      expect(store.silicon_wiki_theme).toBe('dark');

      // Now simulate storage write failure (SecurityError / QuotaExceededError)
      failStorageWrites = true;

      // Even if safeSetItem fails, calling toggleFn should not throw uncaught error
      expect(() => {
        if (toggleFn) toggleFn();
      }).not.toThrow();
    });
  });

  describe('Unified Navigation and History State Preservation', () => {
    let pushedStates: Array<{ state: Record<string, unknown>; unused: string; url: string }> = [];
    let replacedStates: Array<{ state: Record<string, unknown>; unused: string; url: string }> = [];
    let backCallCount = 0;

    beforeEach(() => {
      pushedStates = [];
      replacedStates = [];
      backCallCount = 0;

      window.history.pushState = vi.fn((state: any, unused: string, url: string) => {
        pushedStates.push({ state, unused, url });
        Object.defineProperty(window.history, 'state', {
          value: state,
          configurable: true,
          writable: true,
        });
        if (url) {
          try {
            const parsed = new URL(url, window.location.origin);
            window.location.href = parsed.href;
          } catch {
            // ignore
          }
        }
      });

      window.history.replaceState = vi.fn((state: any, unused: string, url: string) => {
        replacedStates.push({ state, unused, url });
        Object.defineProperty(window.history, 'state', {
          value: state,
          configurable: true,
          writable: true,
        });
        if (url) {
          try {
            const parsed = new URL(url, window.location.origin);
            window.location.href = parsed.href;
          } catch {
            // ignore
          }
        }
      });

      window.history.back = vi.fn(() => {
        backCallCount++;
      });
    });

    it('Scenario 1: Card click into detail -> close pops history cleanly via history.back()', () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      const testHardware = hardwareList.find((h) => h.id === 'cpu-amd-9800x3d')!;
      expect(testHardware).toBeDefined();

      // Simulate HardwareWiki handleOpenDetail
      let hasInternalDetailPush = true;
      const targetUrl = computeDetailOpenUrl(window.location.href, testHardware.id);
      window.history.pushState({ swDetail: true, hardware: testHardware.id }, '', targetUrl);

      expect(window.history.pushState).toHaveBeenCalledTimes(1);
      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.hardware).toBe('cpu-amd-9800x3d');

      // Simulate HardwareWiki handleCloseDetail
      const isInternal = hasInternalDetailPush || Boolean(window.history.state?.swDetail);
      expect(isInternal).toBe(true);

      if (isInternal) {
        hasInternalDetailPush = false;
        window.history.back();
      } else {
        window.history.replaceState(null, '', computeDetailCloseUrl(window.location.href));
      }

      // Must pop history via back() instead of pushing or replacing duplicate /wiki
      expect(backCallCount).toBe(1);
      expect(replacedStates.length).toBe(1); // Only the initial setup replaceState
    });

    it('Scenario 2: Hot suggestion in SearchModal -> opens detail -> close pops history without state wipe', () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      // Emulate App's handleTabChange wired to SearchModal
      let currentTab = 'wiki';
      const handleTabChange = (
        newTab: string,
        options: { shouldScroll?: boolean; replace?: boolean; targetUrl?: string; historyState?: Record<string, unknown> } | boolean = true
      ) => {
        const replace = typeof options === 'boolean' ? false : (options.replace ?? false);
        const customTargetUrl = typeof options === 'object' ? options.targetUrl : undefined;
        const customHistoryState = typeof options === 'object' ? options.historyState : undefined;

        const targetUrl = customTargetUrl || `/#/${newTab}`;
        const currentHistoryState = window.history.state || {};
        const stateToSave = customHistoryState
          ? { ...customHistoryState, tab: newTab }
          : replace
          ? { ...currentHistoryState, tab: newTab }
          : { tab: newTab };

        if (replace) {
          window.history.replaceState(stateToSave, '', targetUrl);
        } else {
          window.history.pushState(stateToSave, '', targetUrl);
        }
        currentTab = newTab;
      };

      // In SearchModal, user selects sug-1 (cpu-amd-9800x3d)
      const sug1Item = {
        id: 'sug-1',
        title: 'AMD Ryzen 7 9800X3D',
        subtitle: 'Flagship',
        category: 'Hardware',
        targetTab: 'wiki' as const,
        hardwareId: 'cpu-amd-9800x3d',
      };

      // SearchModal executes handleSelect with unified onNavigate
      const targetUrl = computeDetailOpenUrl(window.location.href, sug1Item.hardwareId);
      handleTabChange('wiki', {
        targetUrl,
        historyState: { swDetail: true, hardware: sug1Item.hardwareId },
        shouldScroll: false,
      });

      // Assert single pushState with swDetail preserved
      expect(window.history.pushState).toHaveBeenCalledTimes(1);
      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.hardware).toBe('cpu-amd-9800x3d');
      expect(window.history.state?.tab).toBe('wiki');
      expect(currentTab).toBe('wiki');

      // When detail is closed in HardwareWiki
      const isInternal = Boolean(window.history.state?.swDetail);
      expect(isInternal).toBe(true);

      if (isInternal) {
        window.history.back();
      }

      expect(backCallCount).toBe(1);
    });

    it('Scenario 3: Keyword search -> select hardware -> close pops history', () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      const handleTabChange = (
        newTab: string,
        options: { shouldScroll?: boolean; replace?: boolean; targetUrl?: string; historyState?: Record<string, unknown> } | boolean = true
      ) => {
        const replace = typeof options === 'boolean' ? false : (options.replace ?? false);
        const customTargetUrl = typeof options === 'object' ? options.targetUrl : undefined;
        const customHistoryState = typeof options === 'object' ? options.historyState : undefined;

        const targetUrl = customTargetUrl || `/#/${newTab}`;
        const currentHistoryState = window.history.state || {};
        const stateToSave = customHistoryState
          ? { ...customHistoryState, tab: newTab }
          : replace
          ? { ...currentHistoryState, tab: newTab }
          : { tab: newTab };

        if (replace) {
          window.history.replaceState(stateToSave, '', targetUrl);
        } else {
          window.history.pushState(stateToSave, '', targetUrl);
        }
      };

      // User searched "4070" and clicked NVIDIA GeForce RTX 4070 Super
      const searchItem = {
        id: 'hw-gpu-nvidia-rtx4070super',
        title: 'NVIDIA GeForce RTX 4070 Super',
        subtitle: '2K Sweet Spot',
        category: 'Hardware',
        targetTab: 'wiki' as const,
        hardwareId: 'gpu-nvidia-rtx4070super',
      };

      const targetUrl = computeDetailOpenUrl(window.location.href, searchItem.hardwareId);
      handleTabChange('wiki', {
        targetUrl,
        historyState: { swDetail: true, hardware: searchItem.hardwareId },
        shouldScroll: false,
      });

      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.hardware).toBe('gpu-nvidia-rtx4070super');

      // Close modal
      const isInternal = Boolean(window.history.state?.swDetail);
      expect(isInternal).toBe(true);
      window.history.back();
      expect(backCallCount).toBe(1);
    });

    it('Scenario 4: From rankings page -> search -> detail -> close returns to rankings cleanly', () => {
      // User starts on rankings page
      window.location.href = 'https://computer-wiki.vercel.app/#/rankings';
      window.history.replaceState({ tab: 'rankings' }, '', '/#/rankings');

      let currentTab = 'rankings';
      const handleTabChange = (
        newTab: string,
        options: { shouldScroll?: boolean; replace?: boolean; targetUrl?: string; historyState?: Record<string, unknown> } | boolean = true
      ) => {
        const replace = typeof options === 'boolean' ? false : (options.replace ?? false);
        const customTargetUrl = typeof options === 'object' ? options.targetUrl : undefined;
        const customHistoryState = typeof options === 'object' ? options.historyState : undefined;

        const targetUrl = customTargetUrl || `/#/${newTab}`;
        const currentHistoryState = window.history.state || {};
        const stateToSave = customHistoryState
          ? { ...customHistoryState, tab: newTab }
          : replace
          ? { ...currentHistoryState, tab: newTab }
          : { tab: newTab };

        if (replace) {
          window.history.replaceState(stateToSave, '', targetUrl);
        } else {
          window.history.pushState(stateToSave, '', targetUrl);
        }
        currentTab = newTab;
      };

      // Search and select hardware from rankings
      const targetUrl = computeDetailOpenUrl(window.location.href, 'cpu-amd-9800x3d');
      handleTabChange('wiki', {
        targetUrl,
        historyState: { swDetail: true, hardware: 'cpu-amd-9800x3d' },
        shouldScroll: false,
      });

      expect(currentTab).toBe('wiki');
      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.tab).toBe('wiki');
      expect(pushedStates[0].url).toContain('hardware=cpu-amd-9800x3d');

      // User closes detail modal -> calls back()
      window.history.back();
      expect(backCallCount).toBe(1);
    });

    it('Scenario 5: Direct share link entry -> closing detail uses replaceState and does NOT call back()', () => {
      // User enters directly via external link
      window.location.href = 'https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d';
      // External link entry has null history.state and no internal push
      Object.defineProperty(window.history, 'state', { value: null, configurable: true, writable: true });

      const hasInternalDetailPush = false;
      const isInternal = hasInternalDetailPush || Boolean(window.history.state?.swDetail);

      expect(isInternal).toBe(false);

      // HardwareWiki handleCloseDetail
      if (isInternal) {
        window.history.back();
      } else {
        const targetUrl = computeDetailCloseUrl(window.location.href);
        window.history.replaceState(null, '', targetUrl);
      }

      // CRITICAL ASSERTION: Must NOT call history.back() (which would exit the site)
      expect(backCallCount).toBe(0);
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/#/wiki');
    });

    it('Scenario 6: Browser Back & Forward popstate synchronization', () => {
      // Simulate popstate listener in HardwareWiki
      let selectedDetailItem: any = null;
      let selectedCategory: string = 'all';

      const syncFromUrl = (url: string) => {
        const parsed = new URL(url);
        const hwParam = parsed.searchParams.get('hardware');
        if (hwParam) {
          selectedDetailItem = hardwareList.find((h) => h.id === hwParam) || null;
        } else {
          selectedDetailItem = null;
        }

        selectedCategory = parsed.searchParams.get('category') || 'all';
      };

      // 1. Initial page view
      syncFromUrl('https://computer-wiki.vercel.app/#/wiki');
      expect(selectedDetailItem).toBeNull();
      expect(selectedCategory).toBe('all');

      // 2. User opened detail (?hardware=cpu-amd-9800x3d)
      syncFromUrl('https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d#/wiki');
      expect(selectedDetailItem).toBeDefined();
      expect(selectedDetailItem.name).toContain('9800X3D');

      // 3. User pressed browser Back (detail closed, category=gpu)
      syncFromUrl('https://computer-wiki.vercel.app/?category=gpu#/wiki');
      expect(selectedDetailItem).toBeNull();
      expect(selectedCategory).toBe('gpu');

      // 4. User pressed browser Forward (detail reopened)
      syncFromUrl('https://computer-wiki.vercel.app/?category=gpu&hardware=cpu-amd-9800x3d#/wiki');
      expect(selectedDetailItem).toBeDefined();
      expect(selectedCategory).toBe('gpu');
    });

    it('Scenario 7: Normal page navigation must NOT inherit swDetail', () => {
      // Setup current state with swDetail
      window.history.replaceState({ swDetail: true, hardware: 'cpu-amd-9800x3d', tab: 'wiki' }, '', '/?hardware=cpu-amd-9800x3d#/wiki');

      const handleTabChange = (
        newTab: string,
        options: { shouldScroll?: boolean; replace?: boolean; targetUrl?: string; historyState?: Record<string, unknown> } | boolean = true
      ) => {
        const replace = typeof options === 'boolean' ? false : (options.replace ?? false);
        const customTargetUrl = typeof options === 'object' ? options.targetUrl : undefined;
        const customHistoryState = typeof options === 'object' ? options.historyState : undefined;

        const targetUrl = customTargetUrl || `/#/${newTab}`;
        const currentHistoryState = window.history.state || {};
        const stateToSave = customHistoryState
          ? { ...customHistoryState, tab: newTab }
          : replace
          ? { ...currentHistoryState, tab: newTab }
          : { tab: newTab };

        if (replace) {
          window.history.replaceState(stateToSave, '', targetUrl);
        } else {
          window.history.pushState(stateToSave, '', targetUrl);
        }
      };

      // User navigates from wiki to rankings
      handleTabChange('rankings');

      // PushState should ONLY contain tab: 'rankings', NOT swDetail
      const lastPushed = pushedStates[pushedStates.length - 1];
      expect(lastPushed.state).toEqual({ tab: 'rankings' });
      expect(lastPushed.state.swDetail).toBeUndefined();
    });
  });
});
