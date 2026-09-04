import { translations } from '../i18n/translations';

// Hardware term dictionary for accurate terminology translation
const HARDWARE_DICT: [RegExp, string][] = [
  // Full Brand & App Names
  [/SiliconWiki\s*\|\s*芯知硬件百科/gi, 'SiliconWiki | Core Hardware Encyclopedia'],
  [/芯知硬件百科/g, 'Core Hardware Encyclopedia'],
  [/SiliconWiki\s*芯知/g, 'SiliconWiki'],
  [/芯知/g, 'SiliconWiki'],

  // Core Slogans
  [/探索\s*PC\s*硬件的无限细节[，,]?\s*零基础也能轻松掌握装机与选购精髓/g, 'Explore the infinite details of PC hardware, mastering PC building & selection from scratch'],
  [/全方位硬件指南\s*[·•]\s*3D\s*互动装机\s*[·•]\s*真实天梯跑分/g, 'Comprehensive Hardware Guide · 3D Interactive Assembly · Verified Benchmark Ladders'],
  [/拒绝黑话迷魂阵\s*[·•]\s*让你像极客一样看懂参数/g, 'Demystify Tech Jargon · Understand Hardware Like a True Geek'],
  [/从\s*3000\s*到\s*25000\s*元\s*[·•]\s*每一分钱都花在刀刃上/g, 'From 3,000 to 25,000+ RMB · Every Cent Counted for Pure Performance'],
  [/全三维分步实景拼装\s*[·•]\s*零成本体验装机手感/g, 'Full 3D Step-by-Step Guided Assembly · Zero-Cost Hands-on Building Experience'],
  [/标准归一化战力天梯\s*[·•]\s*权威能效与游戏实测/g, 'Normalized Benchmark Ladder · Authoritative Efficiency & Gaming Performance'],

  // Hardware Categories & Terms
  [/中央处理器|处理器/g, 'CPU Processor'],
  [/图形显卡|独立显卡|显卡/g, 'Graphics Card (GPU)'],
  [/主板/g, 'Motherboard'],
  [/内存条|内存/g, 'RAM Memory'],
  [/固态硬盘|固态|SSD/gi, 'NVMe SSD'],
  [/散热系统|散热器|水冷|风冷/g, 'Cooling System'],
  [/电源供应器|电源/g, 'Power Supply (PSU)'],
  [/机箱/g, 'Chassis Case'],
  [/笔记本电脑|笔记本/g, 'Laptop'],
  [/台式机/g, 'Desktop PC'],

  // Benchmark & Technical Words
  [/性能天梯|天梯排行榜|天梯榜|天梯/g, 'Benchmark Ladder'],
  [/跑分/g, 'Benchmark Score'],
  [/能效比/g, 'Efficiency Ratio'],
  [/生产力/g, 'Productivity'],
  [/帧率|帧数|FPS/gi, 'Framerate (FPS)'],
  [/做工用料/g, 'Build Quality & Components'],
  [/选购避坑|避坑指南|选购建议/g, 'Buyer Guide & Tips'],
  [/底层架构/g, 'Silicon Architecture'],
  [/官方指导价/g, 'MSRP'],
  [/参考均价|近期参考成交均价/g, 'Recent Market Price'],
  [/京东自营/g, 'JD.com Official'],
  [/淘宝百亿补贴/g, 'Taobao Subsidy'],
  [/拼多多/g, 'Pinduoduo'],
  [/须登录/g, 'Login Required'],
  [/最新发布/g, 'Latest Release'],
  [/重大里程碑/g, 'Major Milestone'],
  [/核心功能/g, 'Core Feature'],
  [/数据同步/g, 'Data Sync'],
  [/修复/g, 'Fix'],
  [/上线|发布/g, 'Launch'],
  [/支持/g, 'Support'],
  [/优化/g, 'Optimize'],
  [/全量|全方位/g, 'Comprehensive'],
  [/极速/g, 'High-Speed'],
  [/权威/g, 'Authoritative'],
  [/真实/g, 'Real-World Verified'],
];

/**
 * Automatically translates Chinese hardware content into clean, natural English
 */
export function autoTranslateHardwareZhToEn(zhText: string): string {
  if (!zhText || !zhText.trim()) return '';

  const clean = zhText.trim();

  // 1. Direct match in translations dictionary
  const zhDict = translations.zh as Record<string, string>;
  const enDict = translations.en as Record<string, string>;

  for (const key of Object.keys(zhDict)) {
    if (zhDict[key] === clean && enDict[key]) {
      return enDict[key];
    }
  }

  // 2. Terminology & Regex dictionary replacement
  let result = clean;
  for (const [pattern, replacement] of HARDWARE_DICT) {
    result = result.replace(pattern, replacement);
  }

  // 3. Fallback translation for standard Chinese characters if any remains
  const genericReplacements: [RegExp, string][] = [
    [/的/g, ' '],
    [/与|及|和/g, ' & '],
    [/为|针对/g, ' for '],
    [/打造|构建/g, ' crafted '],
    [/提供/g, ' provides '],
    [/系统/g, ' System'],
    [/指南/g, ' Guide'],
    [/全书|百科/g, ' Wiki'],
    [/模块/g, ' Module'],
    [/工作台|平台/g, ' Platform'],
    [/体验/g, ' Experience'],
    [/专区/g, ' Section'],
    [/配置单|配置/g, ' Build Configuration'],
    [/零基础/g, ' Beginner-friendly'],
    [/轻松/g, ' Easily'],
    [/实测/g, ' Tested'],
    [/实景/g, ' Realistic Studio'],
    [/仿真|模拟/g, ' Simulator'],
  ];

  for (const [pattern, replacement] of genericReplacements) {
    result = result.replace(pattern, replacement);
  }

  // Clean up excessive whitespace
  return result.replace(/\s+/g, ' ').trim();
}
