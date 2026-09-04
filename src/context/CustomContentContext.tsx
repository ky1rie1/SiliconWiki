import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface CustomContentContextType {
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

const CustomContentContext = createContext<CustomContentContextType | undefined>(undefined);

export const useCustomContent = () => {
  const context = useContext(CustomContentContext);
  if (!context) {
    throw new Error('useCustomContent must be used within a CustomContentProvider');
  }
  return context;
};

export const CustomContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const isReplacingRef = useRef(false);

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

  // DOM Text Replacement Engine
  const applyOverridesToNode = useCallback(
    (rootNode: Node) => {
      const keys = Object.keys(overrides);
      if (keys.length === 0) return;

      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;

            // Skip script, style, input, textarea, code blocks, and editor modal itself
            const tagName = parent.tagName.toLowerCase();
            if (
              tagName === 'script' ||
              tagName === 'style' ||
              tagName === 'input' ||
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

    const observer = new MutationObserver(() => {
      runReplace();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [overrides, applyOverridesToNode]);

  // Visual Click-to-Edit Mode
  useEffect(() => {
    if (!isVisualEditMode) return;

    let currentHovered: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-no-text-override]')) return;

      if (currentHovered && currentHovered !== target) {
        currentHovered.style.outline = '';
        currentHovered.style.cursor = '';
      }

      currentHovered = target;
      target.style.outline = '2px dashed #3b82f6';
      target.style.outlineOffset = '2px';
      target.style.cursor = 'crosshair';
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

      const text = target.innerText?.trim() || target.textContent?.trim() || '';
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
