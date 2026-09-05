import React, { useState } from 'react';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FeedbackModal } from './FeedbackModal';

interface FeedbackFloatingButtonProps {
  className?: string;
}

export const FeedbackFloatingButton: React.FC<FeedbackFloatingButtonProps> = ({
  className = '',
}) => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-end select-none ${className}`}
        data-no-text-override="true"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-950/90 dark:bg-zinc-900/90 hover:bg-slate-900 dark:hover:bg-zinc-800 text-white border-2 border-[#F7D84A]/60 dark:border-[#F7D84A]/50 shadow-[0_4px_20px_rgba(247,216,74,0.3)] hover:shadow-[0_8px_30px_rgba(247,216,74,0.55)] active:scale-95 hover:scale-110 hover:-translate-y-0.5 transition-all duration-300 ease-spring cursor-pointer backdrop-blur-xl"
          title={lang === 'zh' ? '反馈建议 / Feedback' : 'Feedback & Bug Report'}
          aria-label={lang === 'zh' ? '反馈建议 / Feedback' : 'Feedback & Bug Report'}
        >
          {/* Subtle Breathing Pulse Glow Halo */}
          <span className="absolute inset-0 rounded-full bg-[#F7D84A]/25 animate-ping opacity-60 pointer-events-none duration-1000" />
          <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#F7D84A]/30 to-amber-400/10 blur-xs opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Icon with Gold Accent */}
          <div className="relative flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5 text-[#F7D84A] group-hover:rotate-6 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7D84A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F7D84A] shadow-[0_0_8px_#F7D84A]" />
            </span>
          </div>

          {/* Desktop Hover Tooltip Label */}
          <div className="hidden sm:flex items-center space-x-1.5 absolute right-full mr-3.5 px-3 py-1.5 rounded-full bg-slate-950/95 dark:bg-zinc-900/95 backdrop-blur-md border border-[#F7D84A]/30 text-white shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-[#F7D84A]" />
            <span className="text-xs font-bold text-slate-100">
              {lang === 'zh' ? '反馈建议 / Feedback' : 'Feedback / Report'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7D84A] shadow-[0_0_4px_#F7D84A]" />
          </div>
        </button>
      </div>

      {/* Embedded Feedback Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
