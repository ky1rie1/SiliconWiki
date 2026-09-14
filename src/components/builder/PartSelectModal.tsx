import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Filter,
  ArrowUpDown,
  ShieldCheck,
} from 'lucide-react';
import { HardwareItem } from '../../types';
import { HardwareRecord } from '../../types/hardwareCatalog';
import { BuildSlotType, CustomBuild, CustomBuildSlotItem } from '../../types/pcBuilder';
import { checkBuildCompatibility, updateOrInsertSlot } from '../../utils/pcCompatibility';
import { formatHardwarePrice } from '../../utils/hardwareCatalog';
import { hardwareCatalog } from '../../data/hardware';
import { useLanguage } from '../../context/LanguageContext';

interface PartSelectModalProps {
  isOpen: boolean;
  slotType: BuildSlotType;
  currentBuild: CustomBuild;
  catalog: (HardwareItem | HardwareRecord)[];
  onClose: () => void;
  onSelectHardware: (item: HardwareItem) => void;
  onOpenSpecs?: (item: HardwareItem) => void;
}

export const PartSelectModal: React.FC<PartSelectModalProps> = ({
  isOpen,
  slotType,
  currentBuild,
  catalog,
  onClose,
  onSelectHardware,
  onOpenSpecs,
}) => {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'score'>('default');
  const [excludeKnownErrors, setExcludeKnownErrors] = useState<boolean>(true);

  // 当弹窗打开或槽位改变时重置搜索
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedBrand('all');
    }
  }, [isOpen, slotType]);

  // 键盘 Esc 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 将 HardwareRecord 映射为标准 HardwareItem 格式
  const mapRecordToItem = (record: HardwareRecord): HardwareItem => {
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

  // 获取当前品类的所有配件
  const categoryItems = useMemo(() => {
    const list: HardwareItem[] = [];
    const safeCatalog = Array.isArray(catalog) ? catalog : Array.from(hardwareCatalog.byId.values());
    for (const item of safeCatalog) {
      if ('identity' in item) {
        if (item.identity.category === slotType) {
          list.push(mapRecordToItem(item));
        }
      } else {
        if (item.category === slotType) {
          list.push(item);
        }
      }
    }
    // If list is empty (because catalog contains HardwareRecords), extract from hardwareCatalog
    if (list.length === 0) {
      const ids = hardwareCatalog.byCategory.get(slotType as any) || [];
      for (const id of ids) {
        const record = hardwareCatalog.byId.get(id);
        if (record) {
          list.push(mapRecordToItem(record));
        }
      }
    }
    return list;
  }, [catalog, slotType]);

  // 获取品牌列表
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const item of categoryItems) {
      if (item.brand) set.add(item.brand);
    }
    return ['all', ...Array.from(set).sort()];
  }, [categoryItems]);

  // 预检每个配件在当前配置下的兼容性预估
  const compatibilityEvaluations = useMemo(() => {
    const map = new Map<string, { status: 'pass' | 'warning' | 'error' | 'unknown'; reason?: string }>();

    for (const item of categoryItems) {
      // 沙盒克隆装机单：使用统一的 updateOrInsertSlot 保证即使槽位曾被删除也能正确注入
      const existingSlot = currentBuild.slots.find((s) => s.type === slotType);
      const sandboxSlot: CustomBuildSlotItem = {
        slotId: existingSlot?.slotId || `slot-${slotType}`,
        type: slotType,
        hardwareId: item.id,
        quantity: existingSlot?.quantity || 1,
        userPrice: null,
        isExplicitZeroPrice: false,
      };
      const sandboxBuild = updateOrInsertSlot(currentBuild, sandboxSlot);

      const report = checkBuildCompatibility(sandboxBuild, catalog);

      // 查找与当前配件直接相关的规则问题
      const relatedIssues = report.rules.filter((r) => r.involvedSlotTypes.includes(slotType));
      const hasError = relatedIssues.find((r) => r.status === 'error');
      const hasWarning = relatedIssues.find((r) => r.status === 'warning');
      const hasUnknown = relatedIssues.find((r) => r.status === 'unknown');

      if (hasError) {
        map.set(item.id, { status: 'error', reason: hasError.title });
      } else if (hasWarning) {
        map.set(item.id, { status: 'warning', reason: hasWarning.title });
      } else if (hasUnknown) {
        map.set(item.id, { status: 'unknown', reason: hasUnknown.title });
      } else {
        map.set(item.id, { status: 'pass' });
      }
    }

    return map;
  }, [categoryItems, currentBuild, slotType, catalog]);

  // 过滤与排序
  const filteredItems = useMemo(() => {
    let result = categoryItems;

    // 1. 排除已知冲突（保留通过、提示与待核验型号）
    if (excludeKnownErrors) {
      result = result.filter((item) => {
        const evalRes = compatibilityEvaluations.get(item.id);
        return evalRes?.status !== 'error';
      });
    }

    // 2. 品牌过滤
    if (selectedBrand !== 'all') {
      result = result.filter((item) => item.brand === selectedBrand);
    }

    // 3. 搜索过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.series.toLowerCase().includes(q)
        );
      });
    }

    // 4. 排序
    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc') {
        const priceA = a.marketPriceRange[0] || a.msrpRmb || 999999;
        const priceB = b.marketPriceRange[0] || b.msrpRmb || 999999;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = a.marketPriceRange[0] || a.msrpRmb || 0;
        const priceB = b.marketPriceRange[0] || b.msrpRmb || 0;
        return priceB - priceA;
      }
      if (sortBy === 'score') {
        const scoreA = a.benchmarks?.gamingScore || 0;
        const scoreB = b.benchmarks?.gamingScore || 0;
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [categoryItems, excludeKnownErrors, selectedBrand, searchQuery, sortBy, compatibilityEvaluations]);

  if (!isOpen) return null;

  const getSlotChineseName = (type: BuildSlotType) => {
    const map: Record<BuildSlotType, string> = {
      cpu: 'CPU 处理器',
      cooler: '散热器',
      motherboard: '主板',
      ram: '内存',
      gpu: '独立显卡',
      storage: '固态硬盘 / 存储',
      psu: '电源',
      case: '机箱',
    };
    return map[type] || type;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-part-select-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
          <div>
            <h2 id="modal-part-select-title" className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>选择配件：</span>
              <span className="text-primary-600 dark:text-primary-400">{getSlotChineseName(slotType)}</span>
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                共 {filteredItems.length} 款可选
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              从硬件百科结构化数据库中挑选配件，自动进行物理兼容性与功耗预检
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        {/* 筛选与搜索工具条 */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索型号、品牌或核心代号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* 品牌选择 */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部品牌 ({brands.length - 1})</option>
                {brands.filter((b) => b !== 'all').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="default">默认推荐排序</option>
                <option value="price-asc">价格由低到高</option>
                <option value="price-desc">价格由高到低</option>
                <option value="score">性能跑分优先</option>
              </select>
            </div>
          </div>

          {/* 准则过滤复选框 */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={excludeKnownErrors}
                onChange={(e) => setExcludeKnownErrors(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">排除已知冲突，保留待核实型号</span>
              <span className="text-neutral-400">(系统自动屏蔽与当前已选配件产生硬性干涉或插槽不符的硬件)</span>
            </label>
          </div>
        </div>

        {/* 配件列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 dark:text-neutral-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-base font-medium">未找到符合当前条件的配件</p>
              <p className="text-xs mt-1 text-neutral-400">
                {excludeKnownErrors ? '可能所有该品类配件均与当前已选配件冲突，可尝试取消勾选“排除已知冲突”查看' : '请尝试调整搜索关键词或重置筛选'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const evalRes = compatibilityEvaluations.get(item.id);
              const record = hardwareCatalog.byId.get(item.id);
              const formattedPrice = formatHardwarePrice(item.marketPriceRange, lang === 'en' ? 'en' : 'zh');

              return (
                <div
                  key={item.id}
                  className="pt-2.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* 图片 */}
                    <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-neutral-700">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-neutral-400 font-mono">{item.brand}</div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {item.brand}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </h4>

                        {/* Phase 2 可信度徽标 */}
                        {record && record.auditSummary && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                            title={`官方核验核心字段 ${record.auditSummary.verifiedCoreCount}/${record.auditSummary.coreFieldTotal} 项`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>核心 {record.auditSummary.verifiedCoreCount}/{record.auditSummary.coreFieldTotal}</span>
                          </span>
                        )}
                      </div>

                      {/* 亮点与主要参数 */}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                        {item.highlights.join(' · ') || `${item.series} / 功耗 ${item.tdpWatts}W`}
                      </p>

                      {/* 兼容性状态徽标 */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {evalRes?.status === 'pass' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>无已知硬冲突</span>
                          </span>
                        )}
                        {evalRes?.status === 'warning' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{evalRes.reason || '有安装注意事项'}</span>
                          </span>
                        )}
                        {evalRes?.status === 'unknown' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{evalRes.reason || '部分物理尺寸待核实'}</span>
                          </span>
                        )}
                        {evalRes?.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{evalRes.reason || '存在严重物理/电气冲突'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 价格与选择按钮 */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {formattedPrice}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        参考均价
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenSpecs && (
                        <button
                          type="button"
                          onClick={() => onOpenSpecs(item)}
                          className="px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 rounded-lg transition-colors"
                        >
                          详情
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHardware(item);
                          onClose();
                        }}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
                          evalRes?.status === 'error'
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-rose-600 hover:text-white'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {evalRes?.status === 'error' ? '仍要选择' : '选取配件'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部 */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 flex items-center justify-between text-xs text-neutral-500">
          <span>提示：选入装机单后可在各配件卡片中自由覆盖修改自定义买入价格。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};
