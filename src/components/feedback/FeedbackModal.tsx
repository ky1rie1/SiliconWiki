import React, { useState } from 'react';
import {
  X,
  MessageSquarePlus,
  Bug,
  Database,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { FeedbackItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [type, setType] = useState<FeedbackItem['type']>('bug');
  const [target, setTarget] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter your feedback description'
          : '请填写详细问题描述'
      );
      return;
    }

    const newItem: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      target: target.trim() || undefined,
      content: content.trim(),
      contact: contact.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const raw = localStorage.getItem('_sw_feedback_list');
      const list: FeedbackItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(newItem);
      localStorage.setItem('_sw_feedback_list', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('sw_feedback_updated'));
    } catch {
      // ignore
    }

    setIsSubmitted(true);
    setErrorMsg('');
  };

  const handleReset = () => {
    setType('bug');
    setTarget('');
    setContent('');
    setContact('');
    setIsSubmitted(false);
    setErrorMsg('');
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const typeOptions: {
    id: FeedbackItem['type'];
    labelZh: string;
    labelEn: string;
    descZh: string;
    descEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'bug',
      labelZh: '网页 Bug',
      labelEn: 'Bug Report',
      descZh: '页面报错、样式崩坏、渲染异常',
      descEn: 'Errors, visual glitches, crashes',
      icon: <Bug className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'data',
      labelZh: '数据不准/不及时',
      labelEn: 'Outdated / Inaccurate Data',
      descZh: '跑分偏差、价格偏离、参数疏漏',
      descEn: 'Specs, benchmark or pricing errors',
      icon: <Database className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'feature',
      labelZh: '功能建议',
      labelEn: 'Feature Request',
      descZh: '新功能灵感、交互改进需求',
      descEn: 'Ideas, UX improvement suggestions',
      icon: <Lightbulb className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'other',
      labelZh: '其他反馈',
      labelEn: 'Other Feedback',
      descZh: '意见、体验吐槽或其他事项',
      descEn: 'General inquiries or comments',
      icon: <HelpCircle className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[#e5a912] dark:text-[#F7D84A] border border-amber-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  {lang === 'en' ? 'Feedback & Suggestions' : '用户反馈与建议'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7D84A]/20 text-zinc-900 dark:text-[#F7D84A] font-bold font-mono">
                  SiliconWiki
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'en'
                  ? 'Help us refine hardware data, crush bugs, and build better tools'
                  : '反馈网页Bug、数据不准/不及时，我们将第一时间查证并更新'}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {isSubmitted ? (
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                  {lang === 'en' ? 'Feedback Submitted Successfully!' : '反馈已成功提交！'}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Thank you for contributing to SiliconWiki. Your report has been aggregated into the admin console for review.'
                    : '感谢你对 SiliconWiki 的支持！你的反馈已实时同步至后台管理看板，我们将核查并尽快处理。'}
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Submit Another' : '再提一条'}
                </button>
                <button
                  onClick={handleModalClose}
                  className="px-6 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Done' : '我知道了 / 关闭'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  {lang === 'en' ? 'Feedback Category' : '反馈类型'}
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {typeOptions.map((opt) => {
                    const isSelected = type === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        className={`flex items-start space-x-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F7D84A]/10 dark:bg-[#F7D84A]/15 border-[#e5a912] dark:border-[#F7D84A] shadow-xs ring-1 ring-[#F7D84A]/50'
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{opt.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {lang === 'en' ? opt.labelEn : opt.labelZh}
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                            {lang === 'en' ? opt.descEn : opt.descZh}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Page or Hardware */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  {lang === 'en' ? 'Target Page or Hardware (Optional)' : '涉及页面或硬件型号 (选填)'}
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g., Benchmark Ladder / 7800X3D / 3D Assembly Cooler / 5500 Build'
                      : '例如：天梯榜 7800X3D / 3D装机水冷 / 预算配置 5500元档'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#e5a912] dark:focus:border-[#F7D84A] focus:ring-1 focus:ring-[#F7D84A] transition-colors"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  {lang === 'en' ? 'Detailed Description' : '详细问题描述'}
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={
                    lang === 'en'
                      ? 'Please describe the bug, inaccurate parameter/pricing, or feature proposal in detail...'
                      : '请详细描述您遇到的 Bug 现象、或需要校准的具体硬件参数/价格，或希望增加的改进功能...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#e5a912] dark:focus:border-[#F7D84A] focus:ring-1 focus:ring-[#F7D84A] transition-colors resize-none"
                />
                {errorMsg && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errorMsg}</p>
                )}
              </div>

              {/* Contact info */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  {lang === 'en' ? 'Contact Info (Optional)' : '联系方式 (选填)'}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Email / GitHub / WeChat (Convenient for follow-up notifications)'
                      : '邮箱 / GitHub / 微信（便于向您同步排查进展）'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#e5a912] dark:focus:border-[#F7D84A] focus:ring-1 focus:ring-[#F7D84A] transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : '取消'}
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold shadow-md shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Submit Feedback' : '提交反馈'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
