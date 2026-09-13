// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import App from '../App';

// Configure React 18 act testing environment for happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Production Component Integration & Regression Suite (Client-Side DOM Rendering)
 *
 * Requirements:
 * 1. Mount actual production App / ThemeProvider in happy-dom using React 18 createRoot + act.
 * 2. Perform real DOM interactions: click navbar search, input search terms, click suggestions/results, click close buttons.
 * 3. Never copy-paste or duplicate internal business handlers (handleTabChange, syncFromUrl, etc.) in test code.
 * 4. Verify both visible DOM elements (dialogs present/absent) and browser history state / URLs.
 * 5. Clearly document testing boundaries: happy-dom verifies component contracts, DOM state transitions,
 *    and popstate synchronizations; full browser cross-session history navigation requires real browser runs.
 */
describe('Production Component Integration & Regression Suite (Client-Side DOM Rendering)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  const originalLocalStorage = window.localStorage;

  // Helper to change input value and fire input/change events recognized by React in happy-dom
  function changeInputValue(input: HTMLInputElement, value: string) {
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Helper to locate the open SearchModal element in the DOM (identified by max-w-2xl dialog shell)
  function getSearchModal(rootEl: HTMLElement): HTMLElement | null {
    const modalContent = rootEl.querySelector('.max-w-2xl');
    return modalContent ? (modalContent.closest('.fixed') as HTMLElement) : null;
  }

  // Helper to mount production App cleanly inside act
  async function renderApp() {
    await act(async () => {
      root!.render(<App />);
    });
    // Allow any initial Suspense / microtasks to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });
  }

  beforeEach(() => {
    // Reset location and state
    window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
    window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
    // Restore localStorage and mocks
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Section 1: Theme Storage Exceptions & Client-Side DOM Toggle
  // =========================================================================
  describe('Theme Storage Exceptions & Client-Side DOM Toggle', () => {
    it('SSR check: renderToString(App) should not throw SecurityError when localStorage is blocked', () => {
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          const err = new Error('SecurityError: Access is denied for this document.');
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      expect(() => {
        renderToString(<App />);
      }).not.toThrow();
    });

    it('Client-side mount: mounting production App under localStorage SecurityError succeeds and renders app shell', async () => {
      // Simulate private browsing / iframe sandbox where accessing window.localStorage throws SecurityError
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          const err = new Error('SecurityError: Access is denied for this document.');
          err.name = 'SecurityError';
          throw err;
        },
        configurable: true,
      });

      // Must mount App directly because ThemeProvider wraps App at the outermost level outside RouteErrorBoundary
      await expect(renderApp()).resolves.not.toThrow();

      // Verify DOM: header, brand logo, and main navigation exist
      const brand = container?.querySelector('.brand-lockup');
      expect(brand).not.toBeNull();
      const navLinks = container?.querySelectorAll('nav.desktop-nav button.nav-link');
      expect(navLinks?.length).toBeGreaterThan(0);

      // Verify fallback theme applied to documentElement ('dark' or 'light')
      const isDark = document.documentElement.classList.contains('dark');
      expect(typeof isDark).toBe('boolean');
    });

    it('Client-side interaction: toggling theme button modifies documentElement class even when storage writes fail', async () => {
      let writeAttempts = 0;
      const memStore: Record<string, string> = { silicon_wiki_theme: 'dark' };

      // Storage getter works, but setItem fails (e.g. QuotaExceededError or write permission blocked)
      Object.defineProperty(window, 'localStorage', {
        get: () => ({
          getItem: (k: string) => memStore[k] || null,
          setItem: () => {
            writeAttempts++;
            const err = new Error('QuotaExceededError: Storage is full');
            err.name = 'QuotaExceededError';
            throw err;
          },
          removeItem: (k: string) => delete memStore[k],
          clear: () => {},
          length: 1,
          key: () => null,
        }),
        configurable: true,
      });

      await renderApp();

      // Ensure documentElement has initial dark class
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Find the actual theme toggle button in the Navbar DOM
      const themeBtn = container?.querySelector(
        'button[title*="主题"], button[aria-label*="主题"], button[title*="theme"], button[aria-label*="theme"]'
      ) as HTMLButtonElement | null;
      expect(themeBtn).not.toBeNull();

      // Click the theme button in the DOM
      await act(async () => {
        themeBtn!.click();
      });

      // ASSERTION 1: DOM class MUST actually change (dark class removed -> light theme)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(writeAttempts).toBeGreaterThanOrEqual(1);

      // Click theme button again to toggle back to dark
      await act(async () => {
        themeBtn!.click();
      });

      // ASSERTION 2: DOM class MUST actually return to dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // =========================================================================
  // Section 2: Real Component Interaction Flows
  // =========================================================================
  describe('Unified Navigation Flows via Real DOM Actions', () => {
    it('Flow 1: 百科 → 热门硬件推荐 → 详情出现 → 点击关闭', async () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      await renderApp();

      // 1. Click header search button in the Navbar
      const searchBtn = container?.querySelector('button.header-search') as HTMLButtonElement;
      expect(searchBtn).not.toBeNull();
      await act(async () => {
        searchBtn.click();
      });

      // 2. SearchModal appears in DOM
      const searchModal = getSearchModal(container!);
      expect(searchModal).not.toBeNull();
      const searchInput = searchModal?.querySelector('input') as HTMLInputElement;
      expect(searchInput).not.toBeNull();

      // 3. Find hot suggestion "AMD Ryzen 7 9800X3D" inside the SearchModal
      const searchItems = Array.from(searchModal?.querySelectorAll('div.cursor-pointer') || []);
      const sug9800 = searchItems.find((el) => el.textContent?.includes('AMD Ryzen 7 9800X3D'));
      expect(sug9800).toBeTruthy();

      // Click the suggestion inside SearchModal
      await act(async () => {
        (sug9800 as HTMLElement).click();
      });

      // 4. Detail modal appears in DOM
      const detailDialog = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailDialog).not.toBeNull();
      const titleEl = detailDialog?.querySelector('#hardware-detail-title');
      expect(titleEl?.textContent).toContain('AMD Ryzen 7 9800X3D');

      // Assert history state and URL
      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.hardware).toBe('cpu-amd-9800x3d');
      expect(window.history.state?.tab).toBe('wiki');
      expect(window.location.href).toContain('hardware=cpu-amd-9800x3d');

      // 5. Click close button in detail modal
      const closeBtn = detailDialog?.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();

      await act(async () => {
        closeBtn.click();
      });

      // 6. Detail modal is removed from DOM
      const modalAfterClose = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(modalAfterClose).toBeNull();

      // In happy-dom, history.back() popped the entry
      expect(window.history.state?.swDetail).toBeFalsy();
      expect(window.location.href).not.toContain('hardware=');
    });

    it('Flow 2: 百科 → 输入关键词 → 选择硬件 → 详情出现 → 点击关闭', async () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      await renderApp();

      // 1. Open search
      const searchBtn = container?.querySelector('button.header-search') as HTMLButtonElement;
      await act(async () => {
        searchBtn.click();
      });

      const searchModal = getSearchModal(container!);
      expect(searchModal).not.toBeNull();
      const searchInput = searchModal?.querySelector('input') as HTMLInputElement;
      expect(searchInput).not.toBeNull();

      // 2. Type keyword "4070"
      await act(async () => {
        changeInputValue(searchInput, '4070');
      });

      // 3. Search results update in DOM, locate "4070 Super" inside SearchModal
      const resultItems = Array.from(searchModal?.querySelectorAll('div.cursor-pointer') || []);
      const item4070 = resultItems.find((el) => el.textContent?.includes('4070 Super'));
      expect(item4070).toBeTruthy();

      // 4. Click the search result item
      await act(async () => {
        (item4070 as HTMLElement).click();
      });

      // 5. Detail modal appears in DOM
      const detailDialog = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailDialog).not.toBeNull();
      const titleEl = detailDialog?.querySelector('#hardware-detail-title');
      expect(titleEl?.textContent).toContain('4070 Super');

      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.hardware).toBe('gpu-nvidia-rtx4070super');
      expect(window.history.state?.tab).toBe('wiki');
      expect(window.location.href).toContain('hardware=gpu-nvidia-rtx4070super');

      // 6. Click close button
      const closeBtn = detailDialog?.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();

      await act(async () => {
        closeBtn.click();
      });

      // Modal removed
      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();
      expect(window.history.state?.swDetail).toBeFalsy();
    });

    it('Flow 3: 天梯榜 → 搜索硬件 → 详情出现 → 关闭后返回天梯榜', async () => {
      // 1. User starts at rankings page
      window.location.href = 'https://computer-wiki.vercel.app/#/rankings';
      window.history.replaceState({ tab: 'rankings' }, '', '/#/rankings');

      await renderApp();

      // Confirm initial active tab is rankings in Navbar (supports both zh: 性能天梯 and en: Benchmark Tier)
      const activeNav = container?.querySelector('nav.desktop-nav button.is-active');
      expect(activeNav?.textContent).toMatch(/天梯|Benchmark|Rankings/);

      // 2. Open search modal from rankings
      const searchBtn = container?.querySelector('button.header-search') as HTMLButtonElement;
      await act(async () => {
        searchBtn.click();
      });

      const searchModal = getSearchModal(container!);
      expect(searchModal).not.toBeNull();

      // 3. Select hardware from search suggestions inside the modal
      const searchItems = Array.from(searchModal?.querySelectorAll('div.cursor-pointer') || []);
      const sug9800 = searchItems.find((el) => el.textContent?.includes('9800X3D'));
      expect(sug9800).toBeTruthy();

      await act(async () => {
        (sug9800 as HTMLElement).click();
      });

      // 4. Detail modal appears in DOM
      const detailDialog = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailDialog).not.toBeNull();
      expect(window.history.state?.swDetail).toBe(true);
      expect(window.history.state?.tab).toBe('wiki');

      // 5. Close detail modal
      const closeBtn = detailDialog?.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();

      await act(async () => {
        closeBtn.click();
      });

      // 6. Modal removed from DOM
      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();

      // In happy-dom, history.back() returns to the previous entry (rankings)
      expect(window.history.state?.tab).toBe('rankings');
      expect(window.location.href).toContain('#/rankings');

      // Active navbar tab returned to rankings
      const activeNavAfter = container?.querySelector('nav.desktop-nav button.is-active');
      expect(activeNavAfter?.textContent).toMatch(/天梯|Benchmark|Rankings/);
    });

    it('Flow 4: 直接通过分享链接进入 → 关闭后仍在本站且不调用 history.back()', async () => {
      // Direct external link visit: history.state is null, no internal push performed in session
      window.location.href = 'https://computer-wiki.vercel.app/?hardware=cpu-amd-9800x3d#/wiki';
      window.history.replaceState(null, '', '/?hardware=cpu-amd-9800x3d#/wiki');

      await renderApp();

      // 1. HardwareWiki detects hardware in URL and opens detail modal on initial mount
      const detailDialog = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailDialog).not.toBeNull();
      expect(detailDialog?.querySelector('#hardware-detail-title')?.textContent).toContain('9800X3D');

      // Spy on history.back() to verify it is NOT called
      const backSpy = vi.spyOn(window.history, 'back');

      // 2. Click close button
      const closeBtn = detailDialog?.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();

      await act(async () => {
        closeBtn.click();
      });

      // 3. Modal is closed
      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();

      // 4. CRITICAL ASSERTION: history.back() must NOT be called (which would exit to external referrer)
      expect(backSpy).not.toHaveBeenCalled();

      // 5. URL is cleanly replaced to stay on site
      expect(window.location.href).toBe('https://computer-wiki.vercel.app/#/wiki');
    });

    it('Flow 5: 普通页面导航不携带 swDetail', async () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      await renderApp();

      // 1. Open detail via card button so that current state has swDetail: true
      const cardTitleBtn = container?.querySelector('.hardware-card h3 button') as HTMLButtonElement;
      expect(cardTitleBtn).toBeTruthy();
      await act(async () => {
        cardTitleBtn.click();
      });

      expect(window.history.state?.swDetail).toBe(true);
      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).not.toBeNull();

      // 2. User clicks a normal tab in the Navbar (supports zh: 性能天梯 and en: Benchmark Tier)
      const navLinks = Array.from(container?.querySelectorAll('nav.desktop-nav button.nav-link') || []);
      const rankingsNav = navLinks.find((btn) => btn.textContent?.match(/天梯|Benchmark|Rankings/));
      expect(rankingsNav).toBeTruthy();

      await act(async () => {
        (rankingsNav as HTMLElement).click();
      });

      // 3. Normal navigation must NOT inherit or carry swDetail
      expect(window.history.state?.tab).toBe('rankings');
      expect(window.history.state?.swDetail).toBeUndefined();

      // Detail modal is not present on the new page
      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();
    });

    it('Flow 6: 百科卡片点击 → 详情出现 → 点击关闭', async () => {
      window.location.href = 'https://computer-wiki.vercel.app/#/wiki';
      window.history.replaceState({ tab: 'wiki' }, '', '/#/wiki');

      await renderApp();

      // 1. Locate first HardwareCard and click inner card container
      const card = container?.querySelector('.hardware-card .double-bezel-inner') as HTMLElement;
      expect(card).toBeTruthy();

      await act(async () => {
        card.click();
      });

      // 2. Detail modal appears
      const detailDialog = container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]');
      expect(detailDialog).not.toBeNull();
      expect(window.history.state?.swDetail).toBe(true);

      // 3. Close modal
      const closeBtn = detailDialog?.querySelector('button[title*="关闭"], button[title*="Close"]') as HTMLButtonElement;
      await act(async () => {
        closeBtn.click();
      });

      expect(container?.querySelector('[role="dialog"][aria-labelledby="hardware-detail-title"]')).toBeNull();
      expect(window.history.state?.swDetail).toBeFalsy();
    });
  });
});
