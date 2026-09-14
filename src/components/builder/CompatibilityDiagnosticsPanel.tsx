import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  CompatibilityReport,
  CompatibilityRuleId,
  CompatibilityStatus,
  CustomBuild,
  ReplacementCandidate,
} from '../../types/pcBuilder';
import { HardwareItem } from '../../types';
import { HardwareRecord } from '../../types/hardwareCatalog';
import { findCompatibleReplacements } from '../../utils/pcCompatibility';

interface CompatibilityDiagnosticsPanelProps {
  report: CompatibilityReport;
  currentBuild: CustomBuild;
  catalog: (HardwareItem | HardwareRecord)[];
  onApplyReplacement: (candidate: ReplacementCandidate, ruleId: CompatibilityRuleId) => void;
}

export const CompatibilityDiagnosticsPanel: React.FC<CompatibilityDiagnosticsPanelProps> = ({
  report,
  currentBuild,
  catalog,
  onApplyReplacement,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'error' | 'warning' | 'unknown' | 'pass'>('all');
  const [isUncoveredExpanded, setIsUncoveredExpanded] = useState<boolean>(false);

  // 过滤展示的规则项
  const filteredRules = useMemo(() => {
    if (activeFilter === 'all') return report.rules;
    return report.rules.filter((r) => r.status === activeFilter);
  }, [report.rules, activeFilter]);

  // 为每个 Error 规则计算候选替代方案
  const replacementsMap = useMemo(() => {
    const map = new Map<CompatibilityRuleId, ReplacementCandidate[]>();
    for (const rule of report.rules) {
      if (rule.status === 'error') {
        const candidates = findCompatibleReplacements(rule, currentBuild, catalog);
        map.set(rule.ruleId, candidates);
      }
    }
    return map;
  }, [report.rules, currentBuild, catalog]);

  const getStatusBadge = (status: CompatibilityStatus) => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>已知条件校验通过</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>注意事项</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>严重物理/电气冲突</span>
          </span>
        );
      case 'unknown':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>待核实参数</span>
          </span>
        );
      case 'not-applicable':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>无需评估</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* 头部摘要 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>装机兼容性与规则诊断</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                report.overallStatus === 'pass'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : report.overallStatus === 'error'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  : report.overallStatus === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {report.overallStatus === 'pass' && '✓ 全部已知规则通过'}
              {report.overallStatus === 'error' && `✕ 存在 ${report.errorCount} 项硬冲突`}
              {report.overallStatus === 'warning' && `! 存在 ${report.warningCount} 项注意事项`}
              {report.overallStatus === 'unknown' && '？ 待补全配件或参数'}
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {report.summaryText}
          </p>
        </div>

        {/* 过滤切换标签 */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            全部 ({report.rules.length})
          </button>
          {report.errorCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('error')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === 'error'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50'
              }`}
            >
              冲突 ({report.errorCount})
            </button>
          )}
          {report.warningCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('warning')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === 'warning'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50'
              }`}
            >
              提醒 ({report.warningCount})
            </button>
          )}
          {report.unknownCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('unknown')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activeFilter === 'unknown'
                  ? 'bg-neutral-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              待核验 ({report.unknownCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveFilter('pass')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeFilter === 'pass'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            通过 ({report.passCount})
          </button>
        </div>
      </div>

      {/* 规则卡片列表 */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const candidates = replacementsMap.get(rule.ruleId) || [];

          return (
            <div
              key={rule.ruleId}
              className={`p-4 rounded-xl border transition-all ${
                rule.status === 'error'
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                  : rule.status === 'warning'
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/15'
                  : rule.status === 'unknown'
                  ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30'
                  : 'border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {rule.category}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {rule.title}
                  </h4>
                </div>
                {getStatusBadge(rule.status)}
              </div>

              {/* 解释文案 */}
              <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2 leading-relaxed">
                {rule.message}
              </p>

              {/* 判定依据与适用条件 */}
              <div className="mt-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span>依据：{rule.basis}</span>
                {rule.condition && <span>前提：{rule.condition}</span>}
                {rule.missingFields && rule.missingFields.length > 0 && (
                  <span className="text-neutral-400 dark:text-neutral-500">
                    待补规格：{rule.missingFields.join(', ')}
                  </span>
                )}
              </div>

              {/* 智能替代建议区域 (仅当产生硬冲突且检索到可行替代项时呈现) */}
              {rule.status === 'error' && (
                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-rose-200 dark:border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>推荐消解冲突的可行替代方案：</span>
                  </div>

                  {candidates.length === 0 ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {rule.suggestedFix || '暂无满足当前整机其它配件且不引入新冲突的自动候选，请手动挑选适配型号。'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {candidates.map((cand) => (
                        <div
                          key={cand.item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-neutral-900 dark:text-white truncate">
                              {cand.item.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {cand.deltaPrice !== null
                                ? cand.deltaPrice >= 0
                                  ? `预计补差价 +¥${cand.deltaPrice}`
                                  : `预计省 ¥${Math.abs(cand.deltaPrice)}`
                                : '参考价以实际选购为准'}
                            </div>
                            {cand.remainingIssues && cand.remainingIssues.length > 0 && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                替换后仍存 {cand.remainingIssues.length} 项需注意
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onApplyReplacement(cand, rule.ruleId)}
                            className="flex-shrink-0 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-xs transition-colors flex items-center gap-1"
                          >
                            <span>替换</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 本版未覆盖装机检查项披露 (主动披露，杜绝冒充全知) */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setIsUncoveredExpanded(!isUncoveredExpanded)}
          className="flex items-center justify-between w-full py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>查看本版（V1）尚未覆盖的高阶装机物理检查项披露</span>
          </span>
          {isUncoveredExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isUncoveredExpanded && (
          <ul className="mt-2 pl-5 pr-2 py-2 space-y-1 list-disc text-[11px] text-neutral-400 dark:text-neutral-500 bg-neutral-50/60 dark:bg-neutral-800/30 rounded-lg">
            {report.uncoveredChecks.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
