import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  Calendar,
  Layers,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { changelogList } from '../../data/changelog';
import { useLanguage } from '../../context/LanguageContext';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  onMarkAllAsRead: () => void;
  latestVersion?: string;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  onMarkAllAsRead,
  latestVersion,
}) => {
  const { lang } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = React.useState(true);
  if (!isOpen) return null;

  const getTypeBadge = (type: 'feature' | 'data' | 'price' | 'fix') => {
    switch (type) {
      case 'feature':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#F7D84A] font-semibold shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{lang === 'en' ? 'Feature' : '新功能'}</span>
          </span>
        );
      case 'data':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-semibold shrink-0">
            <Layers className="w-2.5 h-2.5" />
            <span>{lang === 'en' ? 'Benchmarks' : '硬件跑分'}</span>
          </span>
        );
      case 'price':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>{lang === 'en' ? 'Pricing' : '行情微调'}</span>
          </span>
        );
      case 'fix':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
            <Zap className="w-2.5 h-2.5" />
            <span>{lang === 'en' ? 'Refinement' : '优化体验'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-[#F7D84A]">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {lang === 'en' ? 'Version Changelog & Announcements' : '版本更新日志与公告'}
                </h3>
                {latestVersion && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7D84A]/20 text-zinc-900 dark:text-[#F7D84A] font-mono font-bold">
                    {latestVersion}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lang === 'en'
                  ? 'Tracking hardware database syncs, benchmark ladders, and feature iterations'
                  : '记录每一次硬件数据库同步、天梯跑分更新与功能迭代'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onClose(dontShowAgain)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          {changelogList.map((log, index) => (
            <div key={log.version} className="relative pl-6 sm:pl-8 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-3">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#09090b] ${
                  index === 0
                    ? 'bg-[#F7D84A] ring-4 ring-[#F7D84A]/30'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />

              {/* Version & Date */}
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                  {log.version}
                </span>
                {log.tag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    {log.tag}
                  </span>
                )}
                <span className="text-xs text-zinc-400 flex items-center space-x-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{log.date}</span>
                </span>
              </div>

              {/* Update Title */}
              <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {log.title}
              </h4>

              {/* Updates List */}
              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                {log.updates.map((upd, uIdx) => (
                  <div key={upd.type + uIdx} className="flex items-start space-x-2 text-xs leading-relaxed">
                    {getTypeBadge(upd.type)}
                    <span className="text-zinc-700 dark:text-zinc-300">{upd.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
            <span className="font-medium">
              {lang === 'en'
                ? 'Do not show again for this version'
                : '本次更新不再主动提醒 (下次有新版本时再通知)'}
            </span>
          </label>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onMarkAllAsRead();
                onClose(dontShowAgain);
              }}
              className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Got it' : '我知道了'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
