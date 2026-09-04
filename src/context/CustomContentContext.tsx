import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface CustomContentContextType {
  isDevMode: boolean;
  unlockDevMode: () => void;
  lockDevMode: () => void;
  overrides: Record<string, string>;
  setOverride: (original: string, replacement: string) => void;
  removeOverride: (original: string) => void;
  clearAllOverrides: () => void;
  isVisualEditMode: boolean;
  setIsVisualEditMode: (active: boolean) => void;
  selectedTextForEdit: string | null;
  setSelectedTextForEdit: (text: string | null) => void;
  isEditorOpen: boolean;
  setIsEditorOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'silicon_wiki_text_overrides';
const DEV_MODE_KEY = 'silicon_wiki_dev_mode';

const CustomContentContext = createContext<CustomContentContextType | undefined>(undefined);

export const useCustomContent = () => {
  const context = useContext(CustomContentContext);
  if (!context) {
    throw new Error('useCustomContent must be used within a CustomContentProvider');
  }
  return context;
};

export const CustomContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Developer Mode is hidden by default. Triggered by typing 'ky1rie1101' in search.
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEV_MODE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const unlockDevMode = useCallback(() => {
    setIsDevMode(true);
    try {
      localStorage.setItem(DEV_MODE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save dev mode', e);
    }
    setIsEditorOpen(true);
  }, []);

  const lockDevMode = useCallback(() => {
    setIsDevMode(false);
    setIsEditorOpen(false);
    setIsVisualEditMode(false);
    try {
      localStorage.removeItem(DEV_MODE_KEY);
    } catch (e) {
      console.warn('Failed to clear dev mode', e);
    }
  }, []);

  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isVisualEditMode, setIsVisualEditMode] = useState(false);
  const [selectedTextForEdit, setSelectedTextForEdit] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // WeakMap to track original node values so replacements can be safely applied/reverted
  const originalTextMap = useRef<WeakMap<Node, string>>(new WeakMap());
  const originalAttrMap = useRef<WeakMap<Element, Record<string, string>>>(new WeakMap());
  const isReplacingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Save overrides to localStorage
  const saveOverrides = useCallback((newOverrides: Record<string, string>) => {
    setOverrides(newOverrides);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    } catch (e) {
      console.warn('Failed to save text overrides to localStorage', e);
    }
  }, []);

  const setOverride = useCallback(
    (original: string, replacement: string) => {
      if (!original || original.trim() === '') return;
      saveOverrides({
        ...overrides,
        [original.trim()]: replacement,
      });
    },
    [overrides, saveOverrides]
  );

  const removeOverride = useCallback(
    (original: string) => {
      const updated = { ...overrides };
      delete updated[original.trim()];
      saveOverrides(updated);
    },
    [overrides, saveOverrides]
  );

  const clearAllOverrides = useCallback(() => {
    saveOverrides({});
  }, [saveOverrides]);

  // Robust Text and Attribute Replacement Engine
  const applyOverridesToNode = useCallback(
    (rootNode: Node) => {
      const keys = Object.keys(overrides);
      if (keys.length === 0) return;

      // 1. Scan and replace within individual Text nodes
      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;

            const tagName = parent.tagName.toLowerCase();
            if (
              tagName === 'script' ||
              tagName === 'style' ||
              tagName === 'textarea' ||
              tagName === 'noscript'
            ) {
              return NodeFilter.FILTER_REJECT;
            }

            if (parent.closest('[data-no-text-override]')) {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let currentNode = walker.nextNode();
      while (currentNode) {
        let original = originalTextMap.current.get(currentNode);
        if (original === undefined) {
          original = currentNode.nodeValue || '';
          originalTextMap.current.set(currentNode, original);
        }

        let newText = original;
        for (const key of keys) {
          if (newText.includes(key)) {
            newText = newText.split(key).join(overrides[key]);
          }
        }

        if (currentNode.nodeValue !== newText) {
          currentNode.nodeValue = newText;
        }

        currentNode = walker.nextNode();
      }

      // 2. Scan and replace in element attributes (placeholder, title, aria-label)
      const attrElements = document.querySelectorAll(
        '[placeholder]:not([data-no-text-override] *), [title]:not([data-no-text-override] *), [aria-label]:not([data-no-text-override] *)'
      );

      attrElements.forEach((el) => {
        if (el.closest('[data-no-text-override]')) return;

        let originalAttrs = originalAttrMap.current.get(el);
        if (!originalAttrs) {
          originalAttrs = {
            placeholder: el.getAttribute('placeholder') || '',
            title: el.getAttribute('title') || '',
            ariaLabel: el.getAttribute('aria-label') || '',
          };
          originalAttrMap.current.set(el, originalAttrs);
        }

        ['placeholder', 'title', 'aria-label'].forEach((attr) => {
          const origVal =
            attr === 'aria-label' ? originalAttrs!.ariaLabel : originalAttrs![attr];
          if (!origVal) return;

          let newVal = origVal;
          for (const key of keys) {
            if (newVal.includes(key)) {
              newVal = newVal.split(key).join(overrides[key]);
            }
          }
          if (el.getAttribute(attr) !== newVal) {
            el.setAttribute(attr, newVal);
          }
        });
      });

      // 3. Container Element direct text fallback (for elements with mixed inline tags)
      for (const key of keys) {
        // Find leaf containers whose text matches the key
        const potentialContainers = document.querySelectorAll('h1, h2, h3, h4, h5, p, span, button, a, label, li');
        potentialContainers.forEach((el) => {
          if (el.closest('[data-no-text-override]')) return;
          if (el.children.length === 0 && el.textContent?.trim() === key) {
            if (el.textContent !== overrides[key]) {
              el.textContent = overrides[key];
            }
          }
        });
      }
    },
    [overrides]
  );

  // Trigger replacement on overrides change and on DOM mutations
  useEffect(() => {
    if (Object.keys(overrides).length === 0) return;

    const runReplace = () => {
      if (isReplacingRef.current) return;
      isReplacingRef.current = true;
      try {
        applyOverridesToNode(document.body);
      } finally {
        isReplacingRef.current = false;
      }
    };

    runReplace();

    const scheduleReplace = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(runReplace);
    };

    const observer = new MutationObserver(() => {
      scheduleReplace();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title'],
    });

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      observer.disconnect();
    };
  }, [overrides, applyOverridesToNode]);

  // Visual Click-to-Edit Mode
  useEffect(() => {
    if (!isVisualEditMode) return;

    let currentHovered: HTMLElement | null = null;

    const getInnermostTextTarget = (el: HTMLElement): HTMLElement => {
      // Drill down to the most specific text container element
      let current = el;
      while (
        current.children.length === 1 &&
        current.firstElementChild instanceof HTMLElement &&
        current.firstElementChild.innerText?.trim() === current.innerText?.trim()
      ) {
        current = current.firstElementChild;
      }
      return current;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-no-text-override]')) return;

      const inner = getInnermostTextTarget(target);

      if (currentHovered && currentHovered !== inner) {
        currentHovered.style.outline = '';
        currentHovered.style.cursor = '';
      }

      currentHovered = inner;
      inner.style.outline = '2px dashed #3b82f6';
      inner.style.outlineOffset = '2px';
      inner.style.cursor = 'crosshair';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest('[data-no-text-override]')) {
        target.style.outline = '';
        target.style.cursor = '';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-no-text-override]')) return;

      e.preventDefault();
      e.stopPropagation();

      // Check if user has highlighted text with mouse cursor
      const selectedRangeText = window.getSelection()?.toString().trim();
      if (selectedRangeText && selectedRangeText.length > 0) {
        setSelectedTextForEdit(selectedRangeText);
        setIsEditorOpen(true);
        return;
      }

      const inner = getInnermostTextTarget(target);
      // Clean extracted text
      const text = inner.innerText?.trim() || inner.textContent?.trim() || '';
      if (text) {
        setSelectedTextForEdit(text);
        setIsEditorOpen(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisualEditMode(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (currentHovered) {
        currentHovered.style.outline = '';
        currentHovered.style.cursor = '';
      }
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisualEditMode]);

  return (
    <CustomContentContext.Provider
      value={{
        isDevMode,
        unlockDevMode,
        lockDevMode,
        overrides,
        setOverride,
        removeOverride,
        clearAllOverrides,
        isVisualEditMode,
        setIsVisualEditMode,
        selectedTextForEdit,
        setSelectedTextForEdit,
        isEditorOpen,
        setIsEditorOpen,
      }}
    >
      {children}
    </CustomContentContext.Provider>
  );
};
