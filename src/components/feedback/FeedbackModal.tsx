import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquarePlus,
  Bug,
  Database,
  Lightbulb,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { FeedbackItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  buildGitHubIssueUrl,
  formatFeedbackForClipboard,
  saveLocalFeedback,
} from '../../utils/feedback';
import { copyTextToClipboard } from '../../utils/clipboard';

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
  const [viewState, setViewState] = useState<'form' | 'confirm_github'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedStatus, setCopiedStatus] = useState<boolean | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    if (!content.trim()) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter your feedback description'
          : '请填写详细问题描述'
      );
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const persistDraftLocally = () => {
    const newItem: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      target: target.trim() || undefined,
      content: content.trim(),
      contact: contact.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const res = saveLocalFeedback(newItem);
    if (!res.success) {
      setStorageWarning(
        lang === 'en'
          ? 'Notice: Local draft could not be saved to this device (storage disabled or full).'
          : '提示：由于浏览器存储受限，本地草稿未保存到当前设备，但不影响前往 GitHub 提交或复制。'
      );
    } else {
      setStorageWarning(null);
    }
  };

  const handleGoToGitHub = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    persistDraftLocally();

    const issueUrl = buildGitHubIssueUrl({
      type,
      target: target.trim() || undefined,
      content: content.trim(),
      contact: contact.trim() || undefined,
      lang,
    });

    if (typeof window !== 'undefined') {
      window.open(issueUrl, '_blank', 'noopener,noreferrer');
    }

    setViewState('confirm_github');
  };

  const handleCopyContent = async () => {
    if (!validate()) return;

    persistDraftLocally();

    const textToCopy = formatFeedbackForClipboard({
      type,
      target: target.trim() || undefined,
      content: content.trim(),
      contact: contact.trim() || undefined,
      lang,
    });

    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedStatus(true);
      setManualCopyText(null);
      setTimeout(() => setCopiedStatus(null), 3000);
    } else {
      setCopiedStatus(false);
      setManualCopyText(textToCopy);
    }
  };

  const handleReset = () => {
    setType('bug');
    setTarget('');
    setContent('');
    setContact('');
    setViewState('form');
    setErrorMsg('');
    setCopiedStatus(null);
    setStorageWarning(null);
    setManualCopyText(null);
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
      labelZh: '数据校准',
      labelEn: 'Data Correction',
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
      labelEn: 'General Feedback',
      descZh: '意见、体验吐槽或其他事项',
      descEn: 'General inquiries or comments',
      icon: <HelpCircle className="w-4 h-4 text-purple-500" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-[#e5a912] dark:text-[#F7D84A] border border-amber-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="feedback-modal-title" className="text-lg font-black text-zinc-900 dark:text-white">
                  {lang === 'en' ? 'Feedback & Suggestions' : '用户反馈与建议'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7D84A]/20 text-zinc-900 dark:text-[#F7D84A] font-bold font-mono">
                  GitHub Issue
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {lang === 'en'
                  ? 'Open-source project feedback is submitted publicly via GitHub Issues'
                  : '开源静态项目，反馈将通过 GitHub Issue 公开提交或复制文本'}
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={lang === 'en' ? 'Close (Esc)' : '关闭 (Esc)'}
            aria-label={lang === 'en' ? 'Close' : '关闭'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {storageWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>{storageWarning}</span>
            </div>
          )}

          {viewState === 'confirm_github' ? (
            /* Confirmation after opening GitHub */
            <div className="py-6 px-2 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-[#e5a912] dark:text-[#F7D84A] border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <ExternalLink className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                  {lang === 'en'
                    ? 'Please Confirm Submission on GitHub'
                    : '请在 GitHub 页面确认提交'}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lang === 'en'
                    ? 'A new browser tab has opened with your structured feedback template pre-filled. Please review and click "Submit new issue" on GitHub to complete the submission.'
                    : '已为您打开 GitHub Issue 页面并预填了包含硬件与环境信息的反馈模板。请在 GitHub 页面核对后点击「Submit new issue」完成最终提交。'}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {lang === 'en'
                    ? '（A draft has also been saved to this device.）'
                    : '（草稿已安全保存在当前设备浏览器中）'}
                </p>
              </div>

              {/* Action Buttons in Confirmation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => handleGoToGitHub()}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Re-open GitHub' : '重新打开 GitHub'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedStatus === true ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copiedStatus === true
                      ? (lang === 'en' ? 'Copied' : '已复制')
                      : (lang === 'en' ? 'Copy Text' : '复制文本备用')}
                  </span>
                </button>
              </div>

              {manualCopyText && (
                <div className="w-full text-left space-y-1.5 pt-2">
                  <p className="text-[11px] text-rose-500 font-medium">
                    {lang === 'en'
                      ? 'Clipboard access denied. Please manually copy the text below:'
                      : '剪贴板访问受阻，请手动全选并复制下方文本：'}
                  </p>
                  <textarea
                    readOnly
                    rows={4}
                    value={manualCopyText}
                    onFocus={(e) => e.target.select()}
                    className="w-full p-2.5 rounded-xl text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 resize-none select-all"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Submit Another' : '再提一条'}</span>
                </button>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-bold cursor-pointer"
                >
                  {lang === 'en' ? 'Close Window' : '我知道了 / 关闭'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGoToGitHub} className="space-y-4">
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

              {/* Contact info with Privacy Callout */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {lang === 'en' ? 'Contact Info (Optional, Local Only)' : '联系方式 (选填，仅存本地)'}
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {lang === 'en' ? 'Won’t be posted to GitHub' : '不公开到 GitHub Issue'}
                  </span>
                </div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Email / WeChat (Stored on this device for your own record)'
                      : '邮箱 / 微信（仅保存在当前设备，方便您日后自查）'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-[#e5a912] dark:focus:border-[#F7D84A] focus:ring-1 focus:ring-[#F7D84A] transition-colors"
                />
              </div>

              {/* Privacy Warning Banner */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start space-x-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <span>
                  {lang === 'en'
                    ? 'Privacy Notice: GitHub Issues are publicly visible to all. Do not include sensitive private data like passwords or personal addresses in the description.'
                    : '隐私提示：GitHub Issue 属于公开讨论区。系统已自动剔除联系方式，请在描述中避免填写密码、住址等私密个人信息。'}
                </span>
              </div>

              {/* Manual Copy fallback if clipboard failed */}
              {manualCopyText && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-rose-500 font-medium">
                    {lang === 'en'
                      ? 'Clipboard access failed. Please select and copy manually:'
                      : '剪贴板写入失败，请手动全选并复制下方文本：'}
                  </p>
                  <textarea
                    readOnly
                    rows={4}
                    value={manualCopyText}
                    onFocus={(e) => e.target.select()}
                    className="w-full p-2.5 rounded-xl text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 resize-none select-all"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                    title={lang === 'en' ? 'Copy feedback markdown' : '复制反馈文本'}
                  >
                    {copiedStatus === true ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>
                      {copiedStatus === true
                        ? (lang === 'en' ? 'Copied' : '已复制')
                        : (lang === 'en' ? 'Copy Text' : '复制反馈文本')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? 'Cancel' : '取消'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold shadow-md shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Continue to GitHub Issue' : '前往 GitHub 提交'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
