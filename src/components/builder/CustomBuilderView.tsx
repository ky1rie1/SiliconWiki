import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Fan,
  Layers,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Plus,
  Trash2,
  Share2,
  Download,
  Upload,
  Copy,
  Check,
  AlertTriangle,
  XCircle,
  Edit3,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  BuildSlotType,
  CustomBuild,
  CustomBuildSlotItem,
  ReplacementCandidate,
} from '../../types/pcBuilder';
import { HardwareItem } from '../../types';
import { HardwareRecord } from '../../types/hardwareCatalog';
import {
  checkBuildCompatibility,
  calculateBuildPower,
  calculateBuildCost,
} from '../../utils/pcCompatibility';
import { hardwareCatalog } from '../../data/hardware';
import { PartSelectModal } from './PartSelectModal';
import { CompatibilityDiagnosticsPanel } from './CompatibilityDiagnosticsPanel';

interface CustomBuilderViewProps {
  build: CustomBuild;
  onUpdateBuild: (updated: CustomBuild) => void;
  catalog: (HardwareItem | HardwareRecord)[];
  onExportJson: () => void;
  onOpenImportModal: () => void;
  onShareUrl: () => void;
  onCopyText: () => void;
  onResetBuild: () => void;
  onOpenSpecs?: (item: HardwareItem) => void;
}

export const CustomBuilderView: React.FC<CustomBuilderViewProps> = ({
  build,
  onUpdateBuild,
  catalog,
  onExportJson,
  onOpenImportModal,
  onShareUrl,
  onCopyText,
  onResetBuild,
  onOpenSpecs,
}) => {
  const [modalSlotType, setModalSlotType] = useState<BuildSlotType | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>(
    build.targetBudget ? String(build.targetBudget) : ''
  );

  // 8 大核心桌面配件槽位定义
  const slotDefinitions: {
    type: BuildSlotType;
    label: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
  }[] = [
    { type: 'cpu', label: 'CPU 处理器', icon: Cpu },
    { type: 'cooler', label: 'CPU 散热器', icon: Fan },
    { type: 'motherboard', label: '主板', icon: Layers },
    { type: 'ram', label: '内存 (RAM)', icon: MemoryStick },
    { type: 'gpu', label: '独立显卡 (GPU)', icon: Monitor },
    { type: 'storage', label: '固态硬盘 / 存储', icon: HardDrive },
    { type: 'psu', label: '电源 (PSU)', icon: Zap },
    { type: 'case', label: '机箱 (Chassis)', icon: Box },
  ];

  // 计算兼容性诊断报告
  const report = useMemo(() => {
    return checkBuildCompatibility(build, catalog);
  }, [build, catalog]);

  // 计算整机功耗预估
  const powerEst = useMemo(() => {
    return calculateBuildPower(build, catalog);
  }, [build, catalog]);

  // 计算整机总花费与预算偏离
  const costSummary = useMemo(() => {
    return calculateBuildCost(build, catalog);
  }, [build, catalog]);

  // 根据 slotId 查找硬件信息
  const getHardwareForSlot = (hardwareId: string | null): HardwareItem | null => {
    if (!hardwareId) return null;
    const record = hardwareCatalog.byId.get(hardwareId);
    if (!record) return null;
    return {
      id: record.identity.id,
      name: record.identity.name,
      category: record.identity.category,
      brand: record.identity.brand,
      series: record.identity.series,
      releaseYear: record.identity.releaseYear,
      specs: {},
      highlights: [],
      pros: [],
      cons: [],
      tdpWatts: record.power.watts ?? 0,
      msrpRmb: record.pricing.launchReference ?? 0,
      marketPriceRange: [record.pricing.referenceRange.min ?? 0, record.pricing.referenceRange.max ?? 0],
      priceTrend: 'stable',
      jdSearchQuery: record.identity.name,
      tbSearchQuery: record.identity.name,
      pddSearchQuery: record.identity.name,
    };
  };

  // 选取或更换配件
  const handleSelectHardware = (item: HardwareItem) => {
    if (!modalSlotType) return;
    const updatedSlots = [...build.slots];
    const existingIndex = updatedSlots.findIndex((s) => s.type === modalSlotType);

    const newSlot: CustomBuildSlotItem = {
      slotId: existingIndex !== -1 ? updatedSlots[existingIndex].slotId : `slot-${modalSlotType}-${Date.now()}`,
      type: modalSlotType,
      hardwareId: item.id,
      customName: undefined,
      userPrice: null, // 更换型号时清空原型号自定义改价，严禁静默继承！
      isExplicitZeroPrice: false,
      quantity: 1,
    };

    if (existingIndex !== -1) {
      updatedSlots[existingIndex] = newSlot;
    } else {
      updatedSlots.push(newSlot);
    }

    onUpdateBuild({
      ...build,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  // 清除槽位配件
  const handleClearSlot = (slotType: BuildSlotType) => {
    const updatedSlots = build.slots.filter((s) => s.type !== slotType);
    onUpdateBuild({
      ...build,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  // 用户修改价格
  const handleUpdatePrice = (slotType: BuildSlotType, newPrice: number | null, isExplicitZero: boolean = false) => {
    const updatedSlots = build.slots.map((s) => {
      if (s.type === slotType) {
        return {
          ...s,
          userPrice: newPrice,
          isExplicitZeroPrice: isExplicitZero,
        };
      }
      return s;
    });
    onUpdateBuild({
      ...build,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  // 修改配件数量
  const handleUpdateQuantity = (slotType: BuildSlotType, delta: number) => {
    const updatedSlots = build.slots.map((s) => {
      if (s.type === slotType) {
        const nextQty = Math.max(1, (s.quantity || 1) + delta);
        // 核心单件配件限制最大 1 个
        if (['cpu', 'motherboard', 'case', 'psu', 'cooler'].includes(slotType) && nextQty > 1) {
          return s;
        }
        if (slotType === 'storage' && nextQty > 4) return s; // 存储上限 4 块
        if (slotType === 'ram' && nextQty > 2) return s; // 内存套数上限 2 套
        return { ...s, quantity: nextQty };
      }
      return s;
    });
    onUpdateBuild({
      ...build,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  // 保存目标预算
  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetInput);
    const validBudget = !isNaN(parsed) && parsed > 0 ? Math.round(parsed) : null;
    onUpdateBuild({
      ...build,
      targetBudget: validBudget,
      updatedAt: new Date().toISOString(),
    });
    setEditingBudget(false);
  };

  // 应用替代建议
  const handleApplyReplacement = (candidate: ReplacementCandidate) => {
    const slotType = candidate.item.category as BuildSlotType;
    const exists = build.slots.some((s) => s.type === slotType);
    let updatedSlots: CustomBuildSlotItem[];
    if (exists) {
      updatedSlots = build.slots.map((s) => {
        if (s.type === slotType) {
          return {
            ...s,
            hardwareId: candidate.item.id,
            customName: undefined,
            userPrice: null, // 更换型号时清空原型号自定义改价，严禁静默继承！
            isExplicitZeroPrice: false,
          };
        }
        return s;
      });
    } else {
      updatedSlots = [
        ...build.slots,
        {
          slotId: `slot-${slotType}-${Date.now()}`,
          type: slotType,
          hardwareId: candidate.item.id,
          userPrice: null,
          isExplicitZeroPrice: false,
          quantity: 1,
        },
      ];
    }
    onUpdateBuild({
      ...build,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* 顶部指标与状态总览栏 */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                {build.title || '我的自选装机单'}
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
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
                {report.overallStatus === 'unknown' && '？ 待补全配件/规格'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              已选 {costSummary.filledSlotsCount}/8 项核心配件 · 支持自定义价格与纯函数物理干涉检查
            </p>
          </div>

          {/* 操作工具按钮组 */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={onCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors font-medium"
              title="复制排版优雅的纯文本配置单，适配论坛/微信群分享"
            >
              <Copy size={14} />
              <span>复制配置单</span>
            </button>
            <button
              type="button"
              onClick={onShareUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors font-medium"
              title="生成轻量紧凑分享链接"
            >
              <Share2 size={14} />
              <span>分享链接</span>
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors font-medium"
              title="导出包含自定义价格的标准装机单 JSON 文件"
            >
              <Download size={14} />
              <span>导出 JSON</span>
            </button>
            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl transition-colors font-medium"
              title="从备份 JSON 文件恢复装机单"
            >
              <Upload size={14} />
              <span>导入 JSON</span>
            </button>
            <button
              type="button"
              onClick={onResetBuild}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-medium"
              title="清空当前装机单所有选配"
            >
              <Trash2 size={14} />
              <span>清空</span>
            </button>
          </div>
        </div>

        {/* 关键数据卡片栏：预算花费 & 预估功耗 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          {/* 预算总花费卡片 */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold">
                {costSummary.hasUnknownPrices ? '已知部分合计金额' : '整机装机参考总花费'}
              </span>
              <div className="flex items-center gap-1.5">
                {editingBudget ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px]">目标: ¥</span>
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-20 px-2 py-0.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveBudget}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingBudget(true)}
                    className="inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span>预算目标: {build.targetBudget ? `¥${build.targetBudget}` : '未设定'}</span>
                    <Edit3 size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                ¥{costSummary.knownTotalCost.toLocaleString()}
              </span>
              {build.targetBudget && (
                <span
                  className={`text-xs font-semibold ${
                    costSummary.isBudgetExceeded
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {costSummary.isBudgetExceeded
                    ? `超出预算 ¥${Math.abs(costSummary.budgetDifference!).toLocaleString()}`
                    : `剩余预算 ¥${Math.abs(costSummary.budgetDifference!).toLocaleString()}`}
                </span>
              )}
            </div>

            {costSummary.hasUnknownPrices && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                提示：当前有 {costSummary.unknownPriceSlotCount} 件配件暂无参考报价，上方金额仅为已知部件合计，未包含全部费用。
              </p>
            )}
          </div>

          {/* 预估功耗与电源负荷卡片 */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold">整机满载预估功耗与电源负荷</span>
              <span>
                {powerEst.psuRatedWatts ? `当前电源: 额定 ${powerEst.psuRatedWatts}W` : '尚未选配电源'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              {powerEst.estimatedPeakWatts !== null ? (
                <>
                  <span className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
                    ~{powerEst.estimatedPeakWatts}W
                  </span>
                  <span className="text-xs text-neutral-500">
                    预估峰值 (CPU {powerEst.cpuWatts}W + 独显 {powerEst.gpuWatts}W + 平台基底 60W)
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-neutral-500">
                  功耗数据不完整 (缺少 {powerEst.missingInputs.join('、')})
                </span>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight">
              {powerEst.basePlatformAssumptionText}
            </p>
          </div>
        </div>
      </div>

      {/* 8 大核心槽位卡片列表 */}
      <div className="space-y-3">
        {slotDefinitions.map(({ type, label, icon: Icon }) => {
          const slotItem = build.slots.find((s) => s.type === type && s.hardwareId);
          const hardware = slotItem ? getHardwareForSlot(slotItem.hardwareId) : null;
          const record = slotItem?.hardwareId ? hardwareCatalog.byId.get(slotItem.hardwareId) : null;

          // 找出当前槽位直接涉及的冲突或警告
          const slotIssues = report.rules.filter(
            (r) => r.involvedSlotTypes.includes(type) && (r.status === 'error' || r.status === 'warning')
          );

          return (
            <div
              key={type}
              className={`p-4 rounded-2xl border transition-all ${
                slotItem && hardware
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  : 'bg-neutral-50/50 dark:bg-neutral-900/30 border-dashed border-neutral-300 dark:border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* 槽位图标与标题 */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      slotItem
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  {slotItem && hardware ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {label}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {hardware.brand}
                        </span>
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {hardware.name}
                        </h3>

                        {/* Phase 2 可信度徽标 */}
                        {record?.auditSummary && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            title={`官方核验核心字段 ${record.auditSummary.verifiedCoreCount}/${record.auditSummary.coreFieldTotal} 项`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>核心 {record.auditSummary.verifiedCoreCount}/{record.auditSummary.coreFieldTotal}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                        {hardware.highlights.join(' · ') || `${hardware.series} / 功耗 ${hardware.tdpWatts}W`}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 py-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {label}
                      </span>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        未选配配件（点击右侧按钮挑选或配置）
                      </p>
                    </div>
                  )}
                </div>

                {/* 价格与操作区域 */}
                <div className="flex items-center gap-3 justify-between sm:justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  {slotItem && hardware ? (
                    <>
                      {/* 数量调整 (仅对内存与存储开放) */}
                      {(type === 'ram' || type === 'storage') && (
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden text-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(type, -1)}
                            className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                            {slotItem.quantity || 1}{type === 'ram' ? '套' : '块'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(type, 1)}
                            className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* 价格输入与状态 */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs text-neutral-400">¥</span>
                          <input
                            type="number"
                            value={
                              slotItem.isExplicitZeroPrice
                                ? '0'
                                : typeof slotItem.userPrice === 'number'
                                ? slotItem.userPrice
                                : hardware.marketPriceRange[0] || hardware.msrpRmb || ''
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                handleUpdatePrice(type, null);
                              } else {
                                const parsed = parseFloat(val);
                                if (!isNaN(parsed)) {
                                  handleUpdatePrice(type, parsed, parsed === 0);
                                }
                              }
                            }}
                            placeholder="自定义价格"
                            className="w-20 px-2 py-1 text-sm font-bold text-right font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-primary-600 dark:text-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            title="可输入您的实际入手价格"
                          />
                        </div>

                        <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center justify-end gap-1">
                          {slotItem.isExplicitZeroPrice ? (
                            <span className="text-emerald-600 dark:text-emerald-400">自备 (¥0)</span>
                          ) : typeof slotItem.userPrice === 'number' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdatePrice(type, null)}
                              className="text-neutral-500 hover:text-primary-600 underline"
                              title="点击恢复为官方参考价"
                            >
                              恢复参考价
                            </button>
                          ) : (
                            <span>参考均价</span>
                          )}
                        </div>
                      </div>

                      {/* 更换与移除按钮 */}
                      <div className="flex items-center gap-1">
                        {onOpenSpecs && (
                          <button
                            type="button"
                            onClick={() => onOpenSpecs(hardware)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="在百科中查看此配件规格"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setModalSlotType(type)}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                        >
                          更换
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearSlot(type)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="移除配件"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalSlotType(type)}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 rounded-xl transition-colors border border-primary-200/60 dark:border-primary-800/60"
                    >
                      <Plus size={14} />
                      <span>挑选 {label.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 该槽位专属就地预警提醒 */}
              {slotIssues.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                  {slotIssues.map((issue) => (
                    <div
                      key={issue.ruleId}
                      className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                        issue.status === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {issue.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold mr-1">{issue.title}：</span>
                        <span>{issue.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部详细诊断报告面板 */}
      <CompatibilityDiagnosticsPanel
        report={report}
        currentBuild={build}
        catalog={catalog}
        onApplyReplacement={handleApplyReplacement}
      />

      {/* 配件选择弹窗 */}
      {modalSlotType && (
        <PartSelectModal
          isOpen={true}
          slotType={modalSlotType}
          currentBuild={build}
          catalog={catalog}
          onClose={() => setModalSlotType(null)}
          onSelectHardware={handleSelectHardware}
          onOpenSpecs={onOpenSpecs}
        />
      )}
    </div>
  );
};
