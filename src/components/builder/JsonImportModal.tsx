import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { CustomBuild } from '../../types/pcBuilder';
import { importBuildFromJson } from '../../utils/pcBuildShare';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBuild: (build: CustomBuild) => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onClose,
  onApplyBuild,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewBuild, setPreviewBuild] = useState<CustomBuild | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    setErrorMsg(null);

    if (!val.trim()) {
      setPreviewBuild(null);
      return;
    }

    const res = importBuildFromJson(val);
    if (res.success && res.build) {
      setPreviewBuild(res.build);
      setErrorMsg(null);
    } else {
      setPreviewBuild(null);
      setErrorMsg(res.error || '配置单解析失败');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 65536) {
      setErrorMsg('文件体积超出限制（最大允许 64KB）');
      setPreviewBuild(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      const res = importBuildFromJson(content);
      if (res.success && res.build) {
        setPreviewBuild(res.build);
        setErrorMsg(null);
      } else {
        setPreviewBuild(null);
        setErrorMsg(res.error || '文件内容无法作为配置单解析');
      }
    };
    reader.onerror = () => {
      setErrorMsg('读取本地文件失败');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!previewBuild) return;
    onApplyBuild(previewBuild);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* 头部 */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white">导入装机单 JSON</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 主体 */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                选择本地 JSON 文件或直接粘贴代码：
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                <FileText size={13} />
                <span>浏览文件...</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <textarea
              value={jsonText}
              onChange={handleTextChange}
              placeholder="在此粘贴包含 schemaVersion: 1 的装机单 JSON 字符串..."
              className="w-full h-36 font-mono text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-primary-500/30 resize-none"
            />
          </div>

          {/* 错误提示 */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200/60 dark:border-rose-800/60">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">校验失败：</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* 成功预览 */}
          {previewBuild && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 size={16} />
                <span>配置单格式有效，预览就绪</span>
              </div>
              <div className="space-y-1 text-emerald-900 dark:text-emerald-200">
                <div>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">配置单名称：</span>
                  <span className="font-bold">{previewBuild.title}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">目标预算：</span>
                  <span>{previewBuild.targetBudget ? `￥${previewBuild.targetBudget}` : '未设定'}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-400">配件数量：</span>
                  <span>包含 {previewBuild.slots.length} 项配件</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                * 确认导入将覆盖当前未保存的本地草稿，请确认是否继续。
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!previewBuild}
            onClick={handleConfirmImport}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              previewBuild
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-xs'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            }`}
          >
            确认载入配置单
          </button>
        </div>
      </div>
    </div>
  );
};
