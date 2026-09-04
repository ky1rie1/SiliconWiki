import React, { useState, useRef, useEffect } from 'react';
import { glossaryTerms } from '../../data/glossary';
import { HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { GlossaryTerm } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SmartTooltipProps {
  termKey: string; // matches term id, term name, or alias
  children?: React.ReactNode;
  onNavigateGlossary?: () => void;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  termKey,
  children,
  onNavigateGlossary,
}) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const matchedTerm: GlossaryTerm | undefined = glossaryTerms.find(
    (t) =>
      t.id === termKey ||
      t.term.toLowerCase().includes(termKey.toLowerCase()) ||
      t.alias?.some((a) => a.toLowerCase() === termKey.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!matchedTerm) {
    return <>{children || termKey}</>;
  }

  return (
    <span className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="inline-flex items-center space-x-0.5 text-blue-600 dark:text-cyan-400 font-medium underline decoration-blue-400/60 dark:decoration-cyan-400/60 decoration-dashed underline-offset-4 cursor-help hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
      >
        <span>{children || matchedTerm.term.split(' ')[0]}</span>
        <HelpCircle className="w-3 h-3 opacity-70 inline ml-0.5" />
      </button>

      {/* Popover Bubble */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150 text-left">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {matchedTerm.term}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 font-medium shrink-0">
              {matchedTerm.category.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-snug">
              {matchedTerm.shortDesc}
            </p>

            {matchedTerm.buyingAdvice && (
              <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>{lang === 'en' ? 'Buying Tip: ' : '选购提示：'}</strong>
                  {matchedTerm.buyingAdvice}
                </span>
              </div>
            )}
          </div>

          {onNavigateGlossary && (
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateGlossary();
              }}
              className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-[11px] text-blue-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              <span>{lang === 'en' ? 'View Full Tech Breakdown' : '查看名词宝典完整原理'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-900" />
        </div>
      )}
    </span>
  );
};
