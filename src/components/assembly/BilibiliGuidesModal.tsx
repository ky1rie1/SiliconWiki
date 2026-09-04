import React from 'react';
import { X, Tv, ExternalLink, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { bilibiliVideos } from '../../data/bilibiliVideos';
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
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {lang === 'en'
                    ? 'Curated Masterclass PC Building Video Guides'
                    : 'B站公认好评 · 保姆级装机实操视频精选'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 font-bold">
                  {lang === 'en' ? 'Bilibili Top Pick' : 'Bilibili 优质推荐'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'en'
                  ? 'Combines 3D mechanical breakdown with multi-angle real-life video records of tactile force, cable management, and tips.'
                  : '结合 3D 原理拆解与真实多机位实录视频，手感、力度与走线一目了然'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Step Tip */}
        {targetStepTitle && (
          <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-800 dark:text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
              <span>
                {lang === 'en' ? 'Current Matching Step: ' : '当前对应装机步骤：'}
                <strong>{targetStepTitle}</strong>
              </span>
            </div>
            <span className="text-zinc-400 hidden sm:inline">
              {lang === 'en'
                ? 'Click any tutorial below to watch high-def video'
                : '点击下方任意教程直达高清视频'}
            </span>
          </div>
        )}

        {/* Video Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {bilibiliVideos.map((video) => (
            <div
              key={video.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                video.isRecommend
                  ? 'bg-pink-50/20 dark:bg-pink-950/10 border-pink-200/80 dark:border-pink-900/40 shadow-xs'
                  : 'bg-zinc-50/50 dark:bg-zinc-850/50 border-zinc-200/70 dark:border-zinc-800'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-bold text-xs text-pink-600 dark:text-pink-400 bg-pink-100/80 dark:bg-pink-950/80 px-2 py-0.5 rounded-lg">
                    UP: {video.upName}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {video.plays} · {video.danmaku}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {lang === 'en' ? `Duration ${video.duration}` : `时长 ${video.duration}`}
                  </span>
                </div>

                <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                  {video.title}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {video.description}
                </p>

                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 w-full md:w-auto">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{lang === 'en' ? 'Watch Full Video on Bilibili' : '前往 B 站观看完整视频'}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {lang === 'en'
                ? 'All links verified; redirects directly to official/top-rated masterclass videos on Bilibili.'
                : '所有链接均经人工精选验证，直接跳转哔哩哔哩对应官方自营/高赞搜索锚点'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Return to 3D Simulator' : '返回 3D 模拟室'}
          </button>
        </div>
      </div>
    </div>
  );
};
