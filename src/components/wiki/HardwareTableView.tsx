import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  ExternalLink,
  ShoppingBag,
  Swords,
  Eye,
  X,
  HelpCircle,
} from 'lucide-react';
import { HardwareItem, GlossaryTerm } from '../../types';
import { glossaryTerms } from '../../data/glossary';
import { HardwareImage } from './HardwareImage';
import { HardwareCompareModal } from './HardwareCompareModal';
import { useLanguage } from '../../context/LanguageContext';

export interface HardwareTableViewProps {
  items: HardwareItem[];
  onOpenSpecs?: (item: HardwareItem) => void;
  onOpenTerm?: (term: GlossaryTerm) => void;
}

type SortField = 'model' | 'price' | 'tdp' | null;
type SortDirection = 'asc' | 'desc';

export const HardwareTableView: React.FC<HardwareTableViewProps> = ({
  items,
  onOpenSpecs,
  onOpenTerm,
}) => {
  const { t, lang } = useLanguage();

  // Local column sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Comparison selection state
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Toggle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      // Default to descending for price and TDP, ascending for model
      setSortDirection(field === 'model' ? 'asc' : 'desc');
    }
  };

  // Sort items based on local column header sort (or fallback to items default)
  const sortedItems = useMemo(() => {
    if (!sortField) return items;

    const list = [...items];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'model') {
        comparison = a.name.localeCompare(b.name, 'zh-CN');
      } else if (sortField === 'price') {
        comparison = a.marketPriceRange[0] - b.marketPriceRange[0];
      } else if (sortField === 'tdp') {
        comparison = a.tdpWatts - b.tdpWatts;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [items, sortField, sortDirection]);

  // Toggle PK selection
  const toggleCompare = (item: HardwareItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedCompareIds.includes(item.id)) {
      setSelectedCompareIds(selectedCompareIds.filter((id) => id !== item.id));
    } else {
      if (selectedCompareIds.length >= 4) {
        alert(t('tableLimitNotice'));
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, item.id]);
    }
  };

  const removeCompareItem = (id: string) => {
    setSelectedCompareIds(selectedCompareIds.filter((i) => i !== id));
  };

  const compareItems = useMemo(() => {
    return items.filter((item) => selectedCompareIds.includes(item.id));
  }, [items, selectedCompareIds]);

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'Intel':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60';
      case 'AMD':
        return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60';
      case 'NVIDIA':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60';
      case 'Apple':
        return 'text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700';
      default:
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900/60';
    }
  };

  const getTrendBadge = (trend: HardwareItem['priceTrend']) => {
    switch (trend) {
      case 'down':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
            <TrendingDown className="w-3 h-3" />
            <span>{t('tableTrendDown')}</span>
          </span>
        );
      case 'up':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap">
            <TrendingUp className="w-3 h-3" />
            <span>{t('tableTrendUp')}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
            <AlertTriangle className="w-3 h-3" />
            <span>{t('tableTrendWarning')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
            <Minus className="w-3 h-3" />
            <span>{t('tableTrendStable')}</span>
          </span>
        );
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition-opacity ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-zinc-900 dark:text-[#F7D84A] ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-zinc-900 dark:text-[#F7D84A] ml-1" />
    );
  };

  // Helper to extract key specs concisely
  const getKeySpecs = (item: HardwareItem) => {
    const entries = Object.entries(item.specs);
    // Take first 3 prominent specs
    return entries.slice(0, 3);
  };

  // Helper to find relevant glossary terms for specs
  const getMatchedTerm = (text: string) => {
    const lower = text.toLowerCase();
    return glossaryTerms.find((gt) => {
      const aliasMatch = gt.alias?.some((a) => a.length >= 2 && lower.includes(a.toLowerCase()));
      const termKeyword = gt.term.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      return aliasMatch || (termKeyword.length >= 3 && lower.includes(termKeyword));
    });
  };

  return (
    <div className="relative w-full">
      {/* High-density Table Matrix Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-sm scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1020px]">
          {/* Table Headers */}
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 dark:text-zinc-400 select-none">
              {/* PK Compare Checkbox Column */}
              <th className="w-12 px-3 py-3 text-center" title={t('tableCompare')}>
                <span className="sr-only">{t('tableCompare')}</span>
                <Swords className="w-4 h-4 mx-auto text-zinc-400" />
              </th>

              {/* Pinned Model & Series Column */}
              <th
                onClick={() => handleSort('model')}
                className="w-72 px-4 py-3 cursor-pointer group sticky left-0 z-30 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center space-x-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <span>{t('tableColModel')}</span>
                  {renderSortIndicator('model')}
                </div>
              </th>

              {/* Brand */}
              <th className="w-24 px-3 py-3 text-center">
                <span>{t('tableColBrand')}</span>
              </th>

              {/* Architecture / Socket */}
              <th className="w-44 px-4 py-3">
                <span>{t('tableColArch')}</span>
              </th>

              {/* Key Specs */}
              <th className="min-w-[280px] px-4 py-3">
                <span>{t('tableColSpecs')}</span>
              </th>

              {/* TDP (Sortable) */}
              <th
                onClick={() => handleSort('tdp')}
                className="w-28 px-4 py-3 text-right cursor-pointer group"
              >
                <div className="flex items-center justify-end space-x-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <span>{t('tableColTdp')}</span>
                  {renderSortIndicator('tdp')}
                </div>
              </th>

              {/* Price Range (Sortable) */}
              <th
                onClick={() => handleSort('price')}
                className="w-44 px-4 py-3 text-right cursor-pointer group"
              >
                <div className="flex items-center justify-end space-x-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <span>{t('tableColPrice')}</span>
                  {renderSortIndicator('price')}
                </div>
              </th>

              {/* Trend */}
              <th className="w-36 px-4 py-3 text-center">
                <span>{t('tableColTrend')}</span>
              </th>

              {/* Quick Actions */}
              <th className="w-28 px-3 py-3 text-center">
                <span>{t('tableColActions')}</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70 text-xs">
            {sortedItems.map((item, index) => {
              const isSelectedForCompare = selectedCompareIds.includes(item.id);
              const keySpecs = getKeySpecs(item);
              const isZebra = index % 2 === 1;

              return (
                <tr
                  key={item.id}
                  onClick={() => onOpenSpecs?.(item)}
                  className={`group cursor-pointer transition-colors ${
                    isSelectedForCompare
                      ? 'bg-zinc-100 dark:bg-zinc-850/70'
                      : isZebra
                      ? 'bg-zinc-50/40 dark:bg-zinc-900/40'
                      : 'bg-white dark:bg-[#09090b]'
                  } hover:bg-zinc-100/60 dark:hover:bg-zinc-800/70`}
                >
                  {/* PK Checkbox */}
                  <td
                    onClick={(e) => toggleCompare(item, e)}
                    className="w-12 px-3 py-2.5 text-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelectedForCompare}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900 cursor-pointer accent-zinc-900 dark:accent-[#F7D84A]"
                      title={
                        isSelectedForCompare
                          ? lang === 'en'
                            ? 'Remove from comparison'
                            : '取消 PK 对比'
                          : lang === 'en'
                          ? 'Add to comparison'
                          : '加入 PK 对比'
                      }
                    />
                  </td>

                  {/* Pinned Model Column */}
                  <td
                    className={`w-72 px-4 py-2.5 sticky left-0 z-20 border-r border-zinc-200/80 dark:border-zinc-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] transition-colors ${
                      isSelectedForCompare
                        ? 'bg-zinc-100 dark:bg-zinc-900'
                        : isZebra
                        ? 'bg-zinc-50 dark:bg-zinc-900'
                        : 'bg-white dark:bg-zinc-900'
                    } group-hover:bg-zinc-100 dark:group-hover:bg-zinc-850`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <HardwareImage
                          category={item.category}
                          name={item.name}
                          brand={item.brand}
                          imageUrl={item.imageUrl}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-zinc-900 dark:text-white group-hover:text-[#e5a912] dark:group-hover:text-[#F7D84A] transition-colors truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                            {item.series}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="w-24 px-3 py-2.5 text-center">
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-md border font-semibold tracking-wide ${getBrandColor(
                        item.brand
                      )}`}
                    >
                      {item.brand}
                    </span>
                  </td>

                  {/* Architecture / Socket */}
                  <td className="w-44 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="font-mono text-zinc-800 dark:text-zinc-200 truncate" title={item.architecture}>
                        {item.architecture || '-'}
                      </div>
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {item.specs['插槽'] ||
                          item.specs['插槽接口'] ||
                          item.specs['插槽/平台'] ||
                          (lang === 'en' ? `Released in ${item.releaseYear}` : `${item.releaseYear} 年发布`)}
                      </div>
                    </div>
                  </td>

                  {/* Key Specs */}
                  <td className="min-w-[280px] px-4 py-2.5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {keySpecs.map(([k, v]) => {
                        const matchedTerm = getMatchedTerm(`${k} ${v}`);
                        return (
                          <span
                            key={k}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200/60 dark:border-zinc-750 max-w-[200px] truncate"
                            title={`${k}: ${v}`}
                          >
                            <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                              {k}:
                            </span>
                            <span className="font-medium truncate">{v}</span>
                            {matchedTerm && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenTerm?.(matchedTerm);
                                }}
                                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-[#F7D84A] ml-0.5 cursor-pointer"
                                title={lang === 'en' ? `Term explanation: ${matchedTerm.term}` : `名词解释: ${matchedTerm.term}`}
                              >
                                <HelpCircle className="w-2.5 h-2.5 inline" />
                              </button>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* TDP */}
                  <td className="w-28 px-4 py-2.5 text-right font-mono">
                    <div className="flex items-center justify-end space-x-1">
                      <Zap
                        className={`w-3.5 h-3.5 ${
                          item.tdpWatts > 200
                            ? 'text-rose-500'
                            : item.tdpWatts > 100
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {item.tdpWatts > 0 ? `${item.tdpWatts}W` : (lang === 'en' ? 'Standard' : '标准功耗')}
                      </span>
                    </div>
                  </td>

                  {/* Price Range */}
                  <td className="w-44 px-4 py-2.5 text-right font-mono">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-[#F7D84A] text-xs sm:text-sm">
                        ￥{item.marketPriceRange[0]} ~ ￥{item.marketPriceRange[1]}
                      </span>
                    </div>
                    {item.msrpRmb > 0 && (
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        MSRP: ￥{item.msrpRmb}
                      </div>
                    )}
                  </td>

                  {/* Trend */}
                  <td className="w-36 px-4 py-2.5 text-center">
                    {getTrendBadge(item.priceTrend)}
                  </td>

                  {/* Actions */}
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="w-28 px-3 py-2.5 text-center"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {/* View Specs Details Button */}
                      <button
                        onClick={() => onOpenSpecs?.(item)}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title={t('tableSpecsDetail')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* E-Commerce direct shortcut JD */}
                      <a
                        href={`https://search.jd.com/Search?keyword=${encodeURIComponent(
                          item.jdSearchQuery
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-500 hover:text-red-600 transition-colors"
                        title={lang === 'en' ? 'Search on JD.com' : '直达京东自营现货搜索'}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </a>

                      {/* External details link */}
                      <button
                        onClick={() => onOpenSpecs?.(item)}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                        title={lang === 'en' ? 'View deep benchmarks and reviews' : '查看深度评测与跑分'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Bottom PK Compare Dock */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto flex items-center justify-between sm:justify-start space-x-3 px-4 py-2.5 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md text-white rounded-2xl border border-zinc-700/80 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-[#F7D84A]">
              <Swords className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold whitespace-nowrap">
              {t('tableComparingCount', { count: selectedCompareIds.length })}
            </span>
          </div>

          {/* Mini Selected Item Badges */}
          <div className="hidden md:flex items-center space-x-1.5 overflow-x-auto max-w-xs scrollbar-none">
            {compareItems.map((ci) => (
              <span
                key={ci.id}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-200 border border-zinc-700 whitespace-nowrap font-mono"
              >
                <span className="truncate max-w-[90px]">{ci.name}</span>
                <button
                  onClick={() => removeCompareItem(ci.id)}
                  className="hover:text-rose-400 text-zinc-400 ml-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#F7D84A] text-zinc-950 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{t('tableLaunchCompare')}</span>
            </button>

            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {t('tableClearCompare')}
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side PK Comparison Modal */}
      <HardwareCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        items={compareItems}
        onRemoveItem={removeCompareItem}
        onOpenSpecs={onOpenSpecs}
      />
    </div>
  );
};
