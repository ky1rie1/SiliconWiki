import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { changelogList } from '../../data/changelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const getTypeBadge = (type: 'feature' | 'data' | 'price' | 'fix') => {
    switch (type) {
      case 'feature':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 font-semibold shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            <span>新功能</span>
          </span>
        );
      case 'data':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-semibold shrink-0">
            <Layers className="w-2.5 h-2.5" />
            <span>硬件跑分</span>
          </span>
        );
      case 'price':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>行情微调</span>
          </span>
        );
      case 'fix':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-semibold shrink-0">
            <Zap className="w-2.5 h-2.5" />
            <span>优化体验</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-cyan-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                版本更新日志与公告
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                记录每一次硬件数据库同步、天梯跑分更新与功能迭代
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-8">
          {changelogList.map((log, index) => (
            <div key={log.version} className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  index === 0
                    ? 'bg-blue-600 ring-4 ring-blue-500/20 animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />

              {/* Version & Date */}
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                  {log.version}
                </span>
                {log.tag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 font-bold">
                    {log.tag}
                  </span>
                )}
                <span className="text-xs text-slate-400 flex items-center space-x-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{log.date}</span>
                </span>
              </div>

              {/* Update Title */}
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {log.title}
              </h4>

              {/* Updates List */}
              <div className="space-y-2 bg-slate-50/70 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {log.updates.map((upd, uIdx) => (
                  <div key={uIdx} className="flex items-start space-x-2 text-xs leading-relaxed">
                    {getTypeBadge(upd.type)}
                    <span className="text-slate-700 dark:text-slate-300">{upd.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onMarkAllAsRead();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>已读全部更新提醒</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
