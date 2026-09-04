import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Cpu,
  Tv,
  HardDrive,
  Box,
  Laptop,
  Flame,
  Zap,
  Filter,
  Search,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { hardwareList } from '../../data/hardware';
import { glossaryTerms } from '../../data/glossary';
import { HardwareCard } from './HardwareCard';
import { LaptopSection } from './LaptopSection';
import { HardwareDetailModal } from './HardwareDetailModal';
import { GlossaryPopoverModal } from '../common/GlossaryPopoverModal';
import { HardwareCategory, HardwareItem, GlossaryTerm } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  matchHardwareFuzzy,
  calculateHardwareSearchScore,
} from '../../utils/hardwareSearch';

interface HardwareWikiProps {
  onNavigateToGlossary?: () => void;
}

interface SpecFilterOption {
  id: string;
  label: string;
  matcher: (item: HardwareItem) => boolean;
}

interface SpecDimension {
  id: string;
  label: string;
  options: SpecFilterOption[];
}

export const HardwareWiki: React.FC<HardwareWikiProps> = ({ onNavigateToGlossary }) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'tdp'>('default');
  const [selectedDetailItem, setSelectedDetailItem] = useState<HardwareItem | null>(null);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const [selectionTooltip, setSelectionTooltip] = useState<{
    text: string;
    term: GlossaryTerm;
    x: number;
    y: number;
  } | null>(null);

  // When category changes, reset brand and specs to prevent 0-result trap
  const handleCategoryChange = (newCat: HardwareCategory | 'all') => {
    setSelectedCategory(newCat);
    setSelectedBrand('all');
    setSelectedSpecs({});
  };

  // Toggle or select a specific specification dimension
  const handleSpecSelect = (dimensionId: string, optionId: string) => {
    setSelectedSpecs((prev) => {
      if (prev[dimensionId] === optionId || optionId === 'all') {
        const next = { ...prev };
        delete next[dimensionId];
        return next;
      }
      return { ...prev, [dimensionId]: optionId };
    });
  };

  // Listen for user text selection to trigger term explanation card
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.glossary-selection-pill') || target.closest('[role="dialog"]')) {
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText || selectedText.length < 2 || selectedText.length > 30) {
        setSelectionTooltip(null);
        return;
      }

      const lower = selectedText.toLowerCase();
      const matched = glossaryTerms.find((gt) => {
        const idKey = gt.id.replace('term-', '').toLowerCase();
        const mainTerm = gt.term.toLowerCase();
        const aliasMatch = gt.alias?.some(
          (a) => a.toLowerCase() === lower || (a.length >= 3 && lower.includes(a.toLowerCase()))
        );
        return lower === idKey || mainTerm.includes(lower) || aliasMatch;
      });

      if (matched) {
        setSelectionTooltip({
          text: selectedText,
          term: matched,
          x: Math.min(window.innerWidth - 220, Math.max(10, e.clientX - 60)),
          y: Math.max(10, e.clientY - 45),
        });
      } else {
        setSelectionTooltip(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Quick technical terms
  const quickTerms = useMemo(() => {
    if (selectedCategory === 'all') {
      const preferredIds = [
        'term-3d-vcache',
        'term-dlss-fsr',
        'term-atx3-12v2x6',
        'term-cudimm',
        'term-tlc-qlc',
        'term-vrm-phases',
        'term-ram-timing-cl',
        'term-peel-film-warning',
        'term-vapor-chamber',
      ];
      return preferredIds
        .map((id) => glossaryTerms.find((g) => g.id === id))
        .filter((g): g is GlossaryTerm => !!g);
    }

    const catMap: Record<string, string> = {
      cpu: 'cpu',
      gpu: 'gpu',
      motherboard: 'motherboard',
      ram: 'ram',
      storage: 'storage',
      psu: 'psu',
      cooler: 'cooling',
      case: 'case',
      laptop: 'display',
    };

    const targetGlossaryCat = catMap[selectedCategory] || selectedCategory;
    const categoryTerms = glossaryTerms.filter((gt) => gt.category === targetGlossaryCat);
    return categoryTerms.slice(0, 10);
  }, [selectedCategory]);

  // Live item counts per category (strict validation)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: hardwareList.length,
    };
    hardwareList.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const categories: { id: HardwareCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('catAll') || '全部分类', icon: <Layers className="w-4 h-4" /> },
    { id: 'cpu', label: t('catCpu') || '处理器 (CPU)', icon: <Cpu className="w-4 h-4" /> },
    { id: 'gpu', label: t('catGpu') || '独立显卡 (GPU)', icon: <Tv className="w-4 h-4" /> },
    { id: 'laptop', label: t('catLaptop') || '笔记本 (Laptop)', icon: <Laptop className="w-4 h-4" /> },
    { id: 'motherboard', label: t('catMotherboard') || '主板 (MB)', icon: <Zap className="w-4 h-4" /> },
    { id: 'ram', label: t('catRam') || '内存 (RAM)', icon: <Zap className="w-4 h-4" /> },
    { id: 'storage', label: t('catStorage') || '固态硬盘 (SSD)', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'psu', label: t('catPsu') || '电源 (PSU)', icon: <Zap className="w-4 h-4" /> },
    { id: 'cooler', label: t('catCooler') || '散热器 (Cooler)', icon: <Flame className="w-4 h-4" /> },
    { id: 'case', label: t('catCase') || '机箱 (Case)', icon: <Box className="w-4 h-4" /> },
  ];

  // Base hardware pool for currently selected category (strictly filtered)
  const baseCategoryPool = useMemo(() => {
    if (selectedCategory === 'all') {
      return hardwareList;
    }
    return hardwareList.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Dynamically compute brands and their item counts for currently active category
  const brandListWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseCategoryPool.forEach((item) => {
      const b = item.brand?.trim();
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });

    const sortedBrands = Object.keys(counts).sort((a, b) => {
      if (counts[b] !== counts[a]) {
        return counts[b] - counts[a];
      }
      return a.localeCompare(b);
    });

    return [
      { name: 'all', label: t('allBrands') || '全部品牌', count: baseCategoryPool.length },
      ...sortedBrands.map((b) => ({ name: b, label: b, count: counts[b] })),
    ];
  }, [baseCategoryPool, t]);

  // Comprehensive ZOL multi-dimensional specification shelves per category
  const currentDimensions = useMemo((): SpecDimension[] => {
    switch (selectedCategory) {
      case 'cpu':
        return [
          {
            id: 'socket',
            label: '平台插槽',
            options: [
              { id: 'all', label: '全部平台', matcher: () => true },
              {
                id: 'am5',
                label: 'AMD AM5 (9000/7000系列)',
                matcher: (i) =>
                  (i.specs['插槽接口'] || '').includes('AM5') ||
                  (i.architecture || '').includes('Zen 5') ||
                  (i.architecture || '').includes('Zen 4'),
              },
              {
                id: 'lga1851',
                label: 'Intel LGA1851 (Ultra 200S)',
                matcher: (i) =>
                  (i.specs['插槽接口'] || '').includes('1851') ||
                  i.series.includes('Ultra'),
              },
              {
                id: 'lga1700',
                label: 'Intel LGA1700 (14/13/12代)',
                matcher: (i) =>
                  (i.specs['插槽接口'] || '').includes('1700') ||
                  i.series.includes('14') ||
                  i.series.includes('13') ||
                  i.series.includes('12'),
              },
              {
                id: 'am4',
                label: 'AMD AM4 (5000性价比)',
                matcher: (i) =>
                  (i.specs['插槽接口'] || '').includes('AM4') ||
                  i.series.includes('5000'),
              },
            ],
          },
          {
            id: 'feature',
            label: '核心定位',
            options: [
              { id: 'all', label: '全部定位', matcher: () => true },
              {
                id: 'x3d',
                label: '3D V-Cache 游戏神U',
                matcher: (i) =>
                  i.name.includes('X3D') ||
                  i.highlights.some((h) => h.includes('3D V-Cache')),
              },
              {
                id: 'oc',
                label: '可超频 (K/KF/X)',
                matcher: (i) =>
                  /([0-9]+[kfx]+)/i.test(i.name) ||
                  i.name.includes('K') ||
                  i.name.includes('X'),
              },
              {
                id: 'f-series',
                label: '甜点无核显 (F系列)',
                matcher: (i) =>
                  /([0-9]+f)/i.test(i.name) ||
                  (i.specs['核显'] || '').includes('无'),
              },
              {
                id: 'high-core',
                label: '多核生产力 (14核+)',
                matcher: (i) => {
                  const c = parseInt(i.specs['核心/线程'] || '0', 10);
                  return c >= 14 || Boolean(i.specs['核心数'] && parseInt(i.specs['核心数'], 10) >= 12);
                },
              },
            ],
          },
        ];

      case 'gpu':
        return [
          {
            id: 'series',
            label: '架构代系',
            options: [
              { id: 'all', label: '全部代系', matcher: () => true },
              {
                id: 'rtx50',
                label: 'NVIDIA RTX 50 系列 (Blackwell)',
                matcher: (i) =>
                  i.series.includes('50') ||
                  i.name.includes('5090') ||
                  i.name.includes('5080') ||
                  i.name.includes('5070'),
              },
              {
                id: 'rtx40',
                label: 'NVIDIA RTX 40 系列 (Ada)',
                matcher: (i) =>
                  i.series.includes('40') ||
                  i.name.includes('4090') ||
                  i.name.includes('4080') ||
                  i.name.includes('4070') ||
                  i.name.includes('4060'),
              },
              {
                id: 'rx7000',
                label: 'AMD RX 7000 系列 (RDNA 3)',
                matcher: (i) =>
                  i.brand === 'AMD' ||
                  i.name.includes('RX 7') ||
                  i.series.includes('7000'),
              },
            ],
          },
          {
            id: 'vram',
            label: '显存规格',
            options: [
              { id: 'all', label: '全部显存', matcher: () => true },
              {
                id: 'vram16g',
                label: '16GB及以上 (4K/AI大显存)',
                matcher: (i) => {
                  const v =
                    (i.specs['显存容量/类型'] || '') +
                    (i.specs['显存容量'] || '');
                  return (
                    v.includes('16GB') ||
                    v.includes('20GB') ||
                    v.includes('24GB') ||
                    v.includes('32GB')
                  );
                },
              },
              {
                id: 'vram12g',
                label: '12GB 甜点主流',
                matcher: (i) => {
                  const v =
                    (i.specs['显存容量/类型'] || '') +
                    (i.specs['显存容量'] || '');
                  return v.includes('12GB');
                },
              },
              {
                id: 'vram8g',
                label: '8GB 高性价比',
                matcher: (i) => {
                  const v =
                    (i.specs['显存容量/类型'] || '') +
                    (i.specs['显存容量'] || '');
                  return v.includes('8GB');
                },
              },
            ],
          },
        ];

      case 'motherboard':
        return [
          {
            id: 'formFactor',
            label: '主板板型',
            options: [
              { id: 'all', label: '全部板型', matcher: () => true },
              {
                id: 'matx',
                label: 'M-ATX 紧凑主流',
                matcher: (i) =>
                  (i.specs['主板板型'] || '').includes('M-ATX') ||
                  (i.specs['主板板型'] || '').includes('Micro-ATX') ||
                  i.name.includes('M-'),
              },
              {
                id: 'atx',
                label: 'ATX 标准大板',
                matcher: (i) =>
                  (i.specs['主板板型'] || '').includes('ATX') &&
                  !(i.specs['主板板型'] || '').includes('M-ATX'),
              },
              {
                id: 'itx',
                label: 'ITX 迷你钢炮',
                matcher: (i) =>
                  (i.specs['主板板型'] || '').includes('ITX') ||
                  i.name.includes('ITX'),
              },
            ],
          },
          {
            id: 'chipset',
            label: '芯片组平台',
            options: [
              { id: 'all', label: '全部芯片组', matcher: () => true },
              {
                id: 'amd-am5',
                label: 'AMD AM5 (B650 / X870)',
                matcher: (i) =>
                  i.name.includes('B650') ||
                  i.name.includes('X870') ||
                  i.name.includes('X670') ||
                  (i.specs['CPU 插槽'] || '').includes('AM5'),
              },
              {
                id: 'intel-lga1700',
                label: 'Intel LGA1700 (B760 / Z790)',
                matcher: (i) =>
                  i.name.includes('B760') ||
                  i.name.includes('Z790') ||
                  (i.specs['CPU 插槽'] || '').includes('1700'),
              },
              {
                id: 'intel-lga1851',
                label: 'Intel LGA1851 (Z890)',
                matcher: (i) =>
                  i.name.includes('Z890') ||
                  i.name.includes('B860') ||
                  (i.specs['CPU 插槽'] || '').includes('1851'),
              },
            ],
          },
          {
            id: 'feature',
            label: '特色设计',
            options: [
              { id: 'all', label: '全部设计', matcher: () => true },
              {
                id: 'pcie5',
                label: '原生 PCIe 5.0 M.2',
                matcher: (i) =>
                  (i.specs['M.2 接口'] || '').includes('5.0') ||
                  (i.specs['PCIe 规格'] || '').includes('5.0') ||
                  i.highlights.some((h) => h.includes('5.0')),
              },
              {
                id: 'white',
                label: '纯白/银白马甲',
                matcher: (i) =>
                  i.name.includes('白色') ||
                  i.name.includes('吹雪') ||
                  i.name.includes('Pro RS') ||
                  i.name.includes('Frozen') ||
                  i.highlights.some((h) => h.includes('白')),
              },
              {
                id: 'wifi',
                label: '标配 Wi-Fi 无线网卡',
                matcher: (i) =>
                  i.name.includes('WIFI') ||
                  i.name.includes('AX') ||
                  (i.specs['网络连接'] || '').includes('Wi-Fi') ||
                  (i.specs['网络配置'] || '').includes('Wi-Fi'),
              },
            ],
          },
        ];

      case 'ram':
        return [
          {
            id: 'gen',
            label: '内存代系',
            options: [
              { id: 'all', label: '全部代系', matcher: () => true },
              {
                id: 'ddr5',
                label: 'DDR5 新一代主流',
                matcher: (i) =>
                  i.name.includes('DDR5') ||
                  (i.specs['标称频率'] || '').includes('DDR5') ||
                  (i.specs['内存类型'] || '').includes('DDR5'),
              },
              {
                id: 'ddr4',
                label: 'DDR4 经典性价比',
                matcher: (i) =>
                  i.name.includes('DDR4') ||
                  (i.specs['标称频率'] || '').includes('DDR4') ||
                  (i.specs['内存类型'] || '').includes('DDR4'),
              },
            ],
          },
          {
            id: 'freq',
            label: '标称频率',
            options: [
              { id: 'all', label: '全部频率', matcher: () => true },
              {
                id: 'f6000',
                label: '6000~6400 MT/s 甜点',
                matcher: (i) => {
                  const s = i.name + (i.specs['标称频率'] || '');
                  return s.includes('6000') || s.includes('6400');
                },
              },
              {
                id: 'f6800',
                label: '6800~7200+ MT/s 极速特挑',
                matcher: (i) => {
                  const s = i.name + (i.specs['标称频率'] || '');
                  return (
                    s.includes('6800') ||
                    s.includes('7200') ||
                    s.includes('8000')
                  );
                },
              },
              {
                id: 'f3200',
                label: '3200~3600 MT/s DDR4',
                matcher: (i) => {
                  const s = i.name + (i.specs['标称频率'] || '');
                  return s.includes('3200') || s.includes('3600');
                },
              },
            ],
          },
          {
            id: 'rgb',
            label: '灯效外观',
            options: [
              { id: 'all', label: '全部外观', matcher: () => true },
              {
                id: 'rgb',
                label: 'ARGB 神光同步',
                matcher: (i) =>
                  i.name.includes('RGB') ||
                  (i.specs['外观散热'] || '').includes('RGB') ||
                  i.highlights.some((h) => h.includes('RGB') || h.includes('灯')),
              },
              {
                id: 'no-rgb',
                label: '无光金属低调马甲',
                matcher: (i) =>
                  !i.name.includes('RGB') &&
                  !(i.specs['外观散热'] || '').includes('RGB'),
              },
            ],
          },
        ];

      case 'storage':
        return [
          {
            id: 'bus',
            label: '接口协议',
            options: [
              { id: 'all', label: '全部协议', matcher: () => true },
              {
                id: 'pcie4',
                label: 'PCIe 4.0 满速 (7000MB/s+)',
                matcher: (i) =>
                  (i.specs['接口总线'] || '').includes('4.0') ||
                  i.name.includes('4.0') ||
                  i.name.includes('TiPlus') ||
                  i.name.includes('990') ||
                  i.name.includes('SN850'),
              },
              {
                id: 'pcie5',
                label: 'PCIe 5.0 旗舰 (10000MB/s+)',
                matcher: (i) =>
                  (i.specs['接口总线'] || '').includes('5.0') ||
                  i.name.includes('5.0'),
              },
            ],
          },
          {
            id: 'capacity',
            label: '容量规格',
            options: [
              { id: 'all', label: '全部容量', matcher: () => true },
              {
                id: 'cap2tb',
                label: '2TB 及以上大容量',
                matcher: (i) =>
                  i.name.includes('2TB') ||
                  i.name.includes('4TB') ||
                  (i.specs['容量'] || '').includes('2TB') ||
                  (i.specs['容量'] || '').includes('2 TB'),
              },
              {
                id: 'cap1tb',
                label: '1TB 主流甜点',
                matcher: (i) =>
                  i.name.includes('1TB') ||
                  (i.specs['容量'] || '').includes('1TB') ||
                  (i.specs['容量'] || '').includes('1 TB'),
              },
            ],
          },
          {
            id: 'dram',
            label: '缓存架构',
            options: [
              { id: 'all', label: '全部架构', matcher: () => true },
              {
                id: 'dram-yes',
                label: '独立物理 DRAM 缓存',
                matcher: (i) => {
                  const c =
                    (i.specs['独立缓存 (DRAM)'] || '') +
                    (i.specs['独立缓存'] || '');
                  return (
                    c.includes('独立') ||
                    c.includes('LPDDR') ||
                    c.includes('DDR4') ||
                    c.includes('2GB') ||
                    c.includes('1GB')
                  );
                },
              },
              {
                id: 'hmb',
                label: 'HMB 高性价比无缓',
                matcher: (i) => {
                  const c =
                    (i.specs['独立缓存 (DRAM)'] || '') +
                    (i.specs['独立缓存'] || '');
                  return (
                    c.includes('HMB') ||
                    c.includes('无缓') ||
                    (!c.includes('独立') && !c.includes('GB'))
                  );
                },
              },
            ],
          },
        ];

      case 'cooler':
        return [
          {
            id: 'type',
            label: '散热形态',
            options: [
              { id: 'all', label: '全部形态', matcher: () => true },
              {
                id: 'aio360',
                label: '360 一体水冷',
                matcher: (i) =>
                  i.name.includes('360') ||
                  (i.specs['散热类型'] || '').includes('360'),
              },
              {
                id: 'aio240',
                label: '240 一体水冷',
                matcher: (i) =>
                  i.name.includes('240') ||
                  (i.specs['散热类型'] || '').includes('240'),
              },
              {
                id: 'air-dual',
                label: '双塔双扇顶级风冷',
                matcher: (i) =>
                  (i.specs['散热类型'] || '').includes('双塔') ||
                  i.name.includes('双塔') ||
                  i.name.includes('PS120') ||
                  i.name.includes('FC140') ||
                  i.name.includes('AK620') ||
                  i.name.includes('D15'),
              },
              {
                id: 'air-single',
                label: '单塔四热管风冷',
                matcher: (i) =>
                  (i.specs['散热类型'] || '').includes('单塔') ||
                  i.name.includes('单塔') ||
                  i.name.includes('AX120') ||
                  (i.specs['热管规格'] || '').includes('4'),
              },
            ],
          },
          {
            id: 'tdp',
            label: '解热能力',
            options: [
              { id: 'all', label: '全部解热功耗', matcher: () => true },
              {
                id: 'tdp250',
                label: '250W+ 旗舰压制 (i9/9950X)',
                matcher: (i) => {
                  const raw =
                    i.specs['标称解热功耗 (D-TDP)'] ||
                    i.specs['标称解热能力'] ||
                    '';
                  const t = parseInt(raw.replace(/\D/g, ''), 10);
                  return t >= 250 || i.tdpWatts >= 250 || i.name.includes('360');
                },
              },
              {
                id: 'tdp200',
                label: '200W~240W 甜点压制',
                matcher: (i) => {
                  const raw =
                    i.specs['标称解热功耗 (D-TDP)'] ||
                    i.specs['标称解热能力'] ||
                    '';
                  const t = parseInt(raw.replace(/\D/g, ''), 10);
                  return (t >= 200 && t < 250) || i.name.includes('双塔');
                },
              },
              {
                id: 'tdp150',
                label: '150W~180W 甜点日常',
                matcher: (i) =>
                  i.name.includes('单塔') ||
                  i.name.includes('AX120') ||
                  i.tdpWatts < 200,
              },
            ],
          },
        ];

      case 'psu':
        return [
          {
            id: 'wattage',
            label: '额定功率',
            options: [
              { id: 'all', label: '全部功率', matcher: () => true },
              {
                id: '1000w',
                label: '1000W+ 旗舰怪兽',
                matcher: (i) =>
                  i.name.includes('1000W') ||
                  i.name.includes('1200W') ||
                  i.name.includes('1300W') ||
                  (i.specs['额定功率'] || '').includes('1000') ||
                  (i.specs['额定功率'] || '').includes('1200'),
              },
              {
                id: '850w',
                label: '850W 主流 3A 甜点',
                matcher: (i) =>
                  i.name.includes('850W') ||
                  (i.specs['额定功率'] || '').includes('850'),
              },
              {
                id: '750w',
                label: '650W~750W 性价比',
                matcher: (i) =>
                  i.name.includes('750W') ||
                  i.name.includes('650W') ||
                  (i.specs['额定功率'] || '').includes('750') ||
                  (i.specs['额定功率'] || '').includes('650'),
              },
            ],
          },
          {
            id: 'standard',
            label: '标准规范',
            options: [
              { id: 'all', label: '全部规范', matcher: () => true },
              {
                id: 'atx3',
                label: '原生 ATX 3.0 / 3.1 (12V-2x6)',
                matcher: (i) =>
                  i.name.includes('ATX 3') ||
                  (i.specs['标准规范'] || '').includes('ATX 3') ||
                  (i.specs['显卡原生接口'] || '').includes('12V') ||
                  (i.specs['标准'] || '').includes('ATX 3'),
              },
              {
                id: 'atx2',
                label: '经典 ATX 2.x',
                matcher: (i) =>
                  !i.name.includes('ATX 3') &&
                  !(i.specs['标准规范'] || '').includes('ATX 3'),
              },
            ],
          },
        ];

      case 'case':
        return [
          {
            id: 'structure',
            label: '机箱结构',
            options: [
              { id: 'all', label: '全部结构', matcher: () => true },
              {
                id: 'panoramic',
                label: '270°全景无立柱海景房',
                matcher: (i) =>
                  i.name.includes('海景房') ||
                  (i.specs['机箱结构'] || '').includes('海景房') ||
                  i.highlights.some((h) => h.includes('海景房')) ||
                  i.name.includes('包豪斯') ||
                  i.name.includes('O11') ||
                  i.name.includes('D300'),
              },
              {
                id: 'mid-tower',
                label: '中塔标准风道/静音木纹',
                matcher: (i) =>
                  (i.specs['机箱结构'] || '').includes('中塔') ||
                  i.name.includes('North') ||
                  i.name.includes('H5') ||
                  i.name.includes('P30'),
              },
              {
                id: 'compact',
                label: '紧凑便携 M-ATX / ITX',
                matcher: (i) =>
                  (i.specs['主板兼容'] || '').includes('ITX') ||
                  i.name.includes('AP201') ||
                  i.name.includes('A4') ||
                  i.name.includes('D300'),
              },
            ],
          },
        ];

      case 'all':
      default:
        return [
          {
            id: 'quickTag',
            label: '装机精选',
            options: [
              { id: 'all', label: '全部硬件', matcher: () => true },
              {
                id: 'x3d-combo',
                label: '9800X3D / 7800X3D 绝配',
                matcher: (i) =>
                  (i.pairingAdvice || '').includes('9800X3D') ||
                  (i.pairingAdvice || '').includes('7800X3D') ||
                  i.name.includes('9800X3D') ||
                  i.name.includes('7800X3D'),
              },
              {
                id: 'rtx4070-combo',
                label: 'RTX 4070 / 4070S 甜点搭档',
                matcher: (i) =>
                  (i.pairingAdvice || '').includes('4070') ||
                  i.name.includes('4070'),
              },
              {
                id: 'white-theme',
                label: '纯白颜值海景房',
                matcher: (i) =>
                  i.name.includes('白色') ||
                  i.name.includes('吹雪') ||
                  i.name.includes('海景房') ||
                  i.highlights.some((h) => h.includes('白') || h.includes('海景房')),
              },
              {
                id: 'flagship',
                label: '旗舰机皇标杆',
                matcher: (i) =>
                  i.marketPriceRange[0] >= 3000 ||
                  (i.badge || '').includes('旗舰') ||
                  (i.badge || '').includes('机皇'),
              },
              {
                id: 'value',
                label: '高性价比爆款',
                matcher: (i) =>
                  (i.badge || '').includes('性价比') ||
                  (i.badge || '').includes('爆款') ||
                  (i.badge || '').includes('国民'),
              },
            ],
          },
        ];
    }
  }, [selectedCategory]);

  // Compute live match count for a spec option within current category and brand
  const getSpecOptionCount = (opt: SpecFilterOption) => {
    if (opt.id === 'all') {
      return baseCategoryPool.length;
    }
    return baseCategoryPool.filter((item) => {
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
        return false;
      }
      return opt.matcher(item);
    }).length;
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedBrand('all');
    setSelectedSpecs({});
    setSearchQuery('');
  };

  // Active spec filter chips
  const activeSpecEntries = useMemo(() => {
    return Object.entries(selectedSpecs)
      .filter(([_, optId]) => optId && optId !== 'all')
      .map(([dimId, optId]) => {
        const dim = currentDimensions.find((d) => d.id === dimId);
        const opt = dim?.options.find((o) => o.id === optId);
        return {
          dimId,
          optId,
          dimLabel: dim?.label || dimId,
          optLabel: opt?.label || optId,
        };
      });
  }, [selectedSpecs, currentDimensions]);

  const hasActiveFilters =
    selectedBrand !== 'all' ||
    activeSpecEntries.length > 0 ||
    searchQuery.trim() !== '';

  // Filter and sort items with strict category isolation & advanced fuzzy search
  const filteredItems = useMemo(() => {
    const result = hardwareList.filter((item) => {
      // 1. Strict Category filter (Prevents cross-category leakage)
      if (selectedCategory !== 'all') {
        if (item.category !== selectedCategory) {
          return false;
        }
      }

      // 2. Strict Brand filter
      if (selectedBrand !== 'all') {
        if (item.brand !== selectedBrand) {
          return false;
        }
      }

      // 3. Multi-dimension ZOL specification filters
      for (const dim of currentDimensions) {
        const activeOptionId = selectedSpecs[dim.id];
        if (activeOptionId && activeOptionId !== 'all') {
          const opt = dim.options.find((o) => o.id === activeOptionId);
          if (opt && !opt.matcher(item)) {
            return false;
          }
        }
      }

      // 4. Advanced Multi-token, Pinyin & Colloquial Fuzzy Search
      if (searchQuery.trim()) {
        if (!matchHardwareFuzzy(item, searchQuery)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.marketPriceRange[0] - b.marketPriceRange[0]);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.marketPriceRange[0] - a.marketPriceRange[0]);
    } else if (sortBy === 'tdp') {
      result.sort((a, b) => b.tdpWatts - a.tdpWatts);
    } else if (sortBy === 'default' && searchQuery.trim()) {
      result.sort(
        (a, b) =>
          calculateHardwareSearchScore(b, searchQuery) -
          calculateHardwareSearchScore(a, searchQuery)
      );
    }

    return result;
  }, [
    selectedCategory,
    selectedBrand,
    selectedSpecs,
    currentDimensions,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Category Pills Bar with Live Item Counts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`group flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/40 dark:ring-cyan-400/40 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-cyan-700 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-blue-500 dark:text-cyan-400'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Special Laptop Guide Section */}
      {selectedCategory === 'laptop' ? (
        <LaptopSection />
      ) : (
        <>
          {/* Modern Control Panel Card */}
          <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            {/* Top Row: Search Input + Sorting */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Fuzzy Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="模糊搜索：支持空格多词 (如 华硕 b650, 4070 12g) 或拼音别名 (zps, pjp, xd, 98x3d, 75f)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="清空搜索"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs text-slate-400 hidden sm:inline">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                >
                  <option value="default">{t('sortDefault') || '默认推荐'}</option>
                  <option value="price-asc">{t('sortPriceAsc') || '价格：从低到高'}</option>
                  <option value="price-desc">{t('sortPriceDesc') || '价格：从高到低'}</option>
                  <option value="tdp">{t('sortTdp') || '功耗：TDP 从大到小'}</option>
                </select>
              </div>
            </div>

            {/* Brand Filter Shelf */}
            <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 min-w-[76px] flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                品牌筛选:
              </span>
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                {brandListWithCounts.map((b) => {
                  const isBrandActive = selectedBrand === b.name;
                  return (
                    <button
                      key={b.name}
                      onClick={() => setSelectedBrand(b.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                        isBrandActive
                          ? 'bg-blue-600 dark:bg-cyan-500 text-white shadow-xs scale-[1.02]'
                          : 'bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span>{b.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded-full ${
                          isBrandActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/70 dark:bg-slate-700 text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        {b.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ZOL Multi-Dimensional Specification Shelves */}
            {currentDimensions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {currentDimensions.map((dim) => {
                  const activeOptionId = selectedSpecs[dim.id] || 'all';
                  return (
                    <div
                      key={dim.id}
                      className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none"
                    >
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 min-w-[76px] flex items-center">
                        <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                        {dim.label}:
                      </span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                        {dim.options.map((opt) => {
                          const isOptionActive = activeOptionId === opt.id;
                          const optCount = getSpecOptionCount(opt);
                          const isDisabled = optCount === 0 && !isOptionActive;

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSpecSelect(dim.id, opt.id)}
                              disabled={isDisabled}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                                isOptionActive
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs'
                                  : isDisabled
                                  ? 'bg-slate-50/50 dark:bg-slate-850/40 text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
                                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60'
                              }`}
                            >
                              <span>{opt.label}</span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isOptionActive
                                    ? 'text-white/80 dark:text-slate-800'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                ({optCount})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Clear Active Filters Banner */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">
                    当前筛选条件:
                  </span>

                  {/* Brand Chip */}
                  {selectedBrand !== 'all' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-900 font-medium">
                      <span>品牌: {selectedBrand}</span>
                      <button
                        onClick={() => setSelectedBrand('all')}
                        className="hover:bg-blue-200/50 dark:hover:bg-blue-800/50 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Spec Chips */}
                  {activeSpecEntries.map((entry) => (
                    <span
                      key={entry.dimId}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900 font-medium"
                    >
                      <span>
                        {entry.dimLabel}: {entry.optLabel}
                      </span>
                      <button
                        onClick={() => handleSpecSelect(entry.dimId, 'all')}
                        className="hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Search Query Chip */}
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900 font-medium">
                      <span>搜索: "{searchQuery.trim()}"</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono ml-1">
                    (共找到 {filteredItems.length} 款硬件)
                  </span>
                </div>

                <button
                  onClick={resetAllFilters}
                  className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-900 transition-colors shrink-0 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置全部筛选</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Technical Term Shelf */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0 mr-1 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>核心技术速查：</span>
            </div>
            {quickTerms.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedGlossaryTerm(term)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-600 hover:bg-blue-50/50 dark:hover:bg-slate-850 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 whitespace-nowrap shadow-2xs transition-all"
                title={`点击查看「${term.term}」详细技术名词解释`}
              >
                <span>{term.term.split(' ')[0]}</span>
                {term.alias?.[0] && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({term.alias[0]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Hardware Cards Grid or Empty State */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                未找到匹配条件的硬件型号
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                当前分类: {selectedCategory}
                {selectedBrand !== 'all' ? ` · 品牌: ${selectedBrand}` : ''}
                {searchQuery ? ` · 搜索: "${searchQuery}"` : ''}
                ，建议尝试调整筛选标签或更换关键词。
              </p>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>一键清除全部筛选并查看全部硬件</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <HardwareCard
                  key={item.id}
                  item={item}
                  onOpenSpecs={(hardware) => setSelectedDetailItem(hardware)}
                  onOpenTerm={(term) => setSelectedGlossaryTerm(term)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Selection Tooltip Badge */}
      {selectionTooltip && (
        <div
          style={{ top: `${selectionTooltip.y}px`, left: `${selectionTooltip.x}px` }}
          className="fixed z-40 glossary-selection-pill animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              setSelectedGlossaryTerm(selectionTooltip.term);
              setSelectionTooltip(null);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-blue-500/30 transition-transform active:scale-95 border border-white/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>解读「{selectionTooltip.term.term.split(' ')[0]}」</span>
          </button>
        </div>
      )}

      {/* Hardware Deep Dive Inspection Modal */}
      {selectedDetailItem && (
        <HardwareDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Interactive Glossary Term Popover Modal */}
      {selectedGlossaryTerm && (
        <GlossaryPopoverModal
          term={selectedGlossaryTerm}
          isOpen={!!selectedGlossaryTerm}
          onClose={() => setSelectedGlossaryTerm(null)}
          onNavigateToGlossary={onNavigateToGlossary}
        />
      )}
    </div>
  );
};
