import React from 'react';
import { X, Tv, ExternalLink, Search, BookOpen } from 'lucide-react';
import { bilibiliSearchGuides } from '../../data/bilibiliVideos';
import { useLanguage } from '../../context/LanguageContext';

interface BilibiliGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStepTitle?: string;
}

export const BilibiliGuidesModal: React.FC<BilibiliGuidesModalProps> = ({
  isOpen,
  onClose,
  targetStepTitle,
}) => {
  const { lang } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex min-w-0 items-start space-x-3">
            <div className="shrink-0 p-2.5 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {lang === 'en'
                    ? 'PC building topics on Bilibili'
                    : 'B 站装机主题搜索'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-bold">
                  {lang === 'en' ? 'Search links' : '搜索入口'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'en'
                  ? 'Browse videos by topic. Searches use Chinese keywords; results are mostly in Chinese.'
                  : '按主题查找装机演示，结合具体型号与产品手册选择适合的内容。'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={lang === 'en' ? 'Close topic searches' : '关闭主题搜索'}
            className="shrink-0 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Step Tip */}
        {targetStepTitle && (
          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-800 dark:text-zinc-200">
              <BookOpen className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
              <span>
                {lang === 'en' ? 'Current assembly step: ' : '当前装机步骤：'}
                <strong>{targetStepTitle}</strong>
              </span>
            </div>
            <span className="text-zinc-400 hidden sm:inline">
              {lang === 'en'
                ? 'Choose a topic to search'
                : '选择下方主题打开搜索结果'}
            </span>
          </div>
        )}

        {/* Topic search entries */}
        <div className="p-6 overflow-y-auto space-y-4">
          {bilibiliSearchGuides.map((guide, index) => (
            <div
              key={guide.id}
              className="p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-850/50 border-zinc-200/70 dark:border-zinc-800"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-bold text-xs text-pink-600 dark:text-pink-400 bg-pink-100/80 dark:bg-pink-950/80 px-2 py-0.5 rounded-lg">
                    {String(index + 1).padStart(2, '0')} · {lang === 'en' ? 'Topic search' : '主题搜索'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                  {guide.title[lang]}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {guide.description[lang]}
                </p>

              </div>

              {/* Action Button */}
              <div className="shrink-0 w-full md:w-auto">
                <a
                  href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(guide.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Search Bilibili' : '在 B 站搜索'}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-1">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'en'
                ? 'Links open search results, not reviewed or endorsed videos.'
                : '链接打开主题搜索结果，具体视频内容未经本站逐条审核或推荐。'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Return to 3D Simulator' : '返回 3D 模拟室'}
          </button>
        </div>
      </div>
    </div>
  );
};
