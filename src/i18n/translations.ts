export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    brandName: 'SiliconWiki 芯知',
    brandTagline: '电脑硬件百科 & 3D 交互装机全书',
    brandDesc:
      '面向硬件爱好者、装机新手与数码选购人群的现代化交互式硬件百科全书与 3D 装机互动平台。',

    // Nav
    navWiki: '硬件百科',
    navRankings: '性能天梯',
    nav3D: '3D 实景装机',
    navGlossary: '名词宝典',
    navBuilds: '预算配置',
    searchPlaceholder: '全站搜索... (Ctrl+K)',
    searchShortcut: 'Ctrl K',
    toggleTheme: '切换深浅色主题',
    toggleLang: 'English',

    // Wiki
    wikiTitle: '计算机硬件全景百科',
    wikiSubtitle: '深度科普核心硬件做工用料、底层架构与选购要点',
    catAll: '全配件一览',
    catCpu: '中央处理器 CPU',
    catGpu: '图形显卡 GPU',
    catLaptop: '💻 笔记本专区',
    catMotherboard: '主板 Motherboard',
    catRam: '内存 RAM',
    catStorage: '高速固态 SSD',
    catPsu: '电源 PSU',
    catCooler: '散热系统 Cooler',
    catCase: '机箱 Chassis',
    brandFilter: '品牌:',
    allBrands: '全部',
    sortBy: '排序方式',
    sortDefault: '默认推荐',
    sortPriceAsc: '参考价从低到高',
    sortPriceDesc: '参考价从高到低',
    sortTdp: '功耗从大到小',
    msrpLabel: '官方指导价 (MSRP)',
    marketPriceLabel: '近期参考均价',
    shopJd: '京东自营 (须登录)',
    shopTb: '淘宝百亿补贴 (须登录)',
    shopPdd: '拼多多 (须登录)',
    tdpUnits: 'W',

    // Laptop
    laptopHeroTitle: '拆解移动端迷思：拒绝同名不同芯与残血缩水',
    laptopHeroDesc:
      '笔记本选购与台式机截然不同。同样的芯片型号，在不同模具散热与供电策略下，性能差异可达 40% 以上。',
    laptopTabVs: '移动版 vs 桌面版芯片差异',
    laptopTabTgp: '功耗墙与残血/满血识别',
    laptopTabScreen: '屏幕素质 (IPS/OLED/MiniLED)',
    laptopTabCooling: '模具均热板与液金避坑',

    // Rankings
    rankHeroTitle: '标准归一化战力天梯 · 权威能效与游戏实测',
    rankHeroDesc:
      '数据深度整合极客湾（socpk.com）实测能效比体系与 UL 3DMark TimeSpy 基准。以 RTX 4060 桌面版作为 100% 基准标尺。',
    btnGeekerwan: '极客湾官方天梯直达',
    btnTechPowerUp: 'TechPowerUp 数据库',
    tabGpuRank: '显卡 GPU 天梯',
    tabCpuRank: '处理器 CPU 天梯',
    modeGaming: '大型 3A 游戏表现',
    modeProductivity: '生产力 / 渲染剪辑',
    modeEfficiency: '每瓦能效比',
    includeLaptopChips: '包含移动笔记本芯片',
    filterModel: '过滤型号...',
    rankColRank: '排名 / 芯片型号',
    rankColPower: '功耗',
    rankColScore: '综合战力指标',
    rankColPk: 'PK 对比',
    btnAddToPk: '对比',
    btnAddedToPk: '已加入',
    pkDockTitle: '已选择 {count} 款硬件待比拼',
    btnOpenPk: '开启横向 PK 对决',
    btnClearPk: '清空',

    // 3D Assembly
    assemblyHeroTitle: '全三维分步实景拼装 · 零成本体验装机手感',
    assemblyHeroDesc:
      '支持 360° 自由旋转平移、一键全机爆炸拆解、关键硬件防呆防坑解析，更配有 B 站保姆级实操视频直达。',
    btnBilibiliGuides: '📺 B站保姆级视频精选',
    btnExplodeToggle: '💥 一键爆炸拆解透视',
    btnExplodeRestore: '合体复原主机',
    btnResetView: '重置视角',
    canvasHint: '🖱️ 按住鼠标左键拖拽 360° 旋转 · 滚轮缩放',
    stepTitle: 'STEP {current} / {total}',
    guideTitle: '标准安装操作指引：',
    warningTitle: '防呆防坑高危警示',
    debugTitle: '安装完成自检：',
    btnViewVideoStep: '查看此步骤对应 B 站实操精讲 ({time})',
    btnPrevStep: '上一步',
    btnNextStep: '下一步',

    // Glossary
    glossaryHeroTitle: '拒绝黑话迷魂阵 · 让你像极客一样看懂参数',
    glossaryHeroDesc:
      '专为小白打造的“一句话大白话 + 底层物理架构 + 选购避坑指南”三段式词典。全站任意参数遇到疑问，随时查阅！',
    glossarySearchPlaceholder: '搜索名词、缩写 (如 XMP, 撕膜, 功耗墙)...',
    termPlainLabel: '一句话人话：',
    termTechLabel: '深度技术与架构原理：',
    termBuyingLabel: '💡 选购与装机避坑指南：',

    // Builds
    buildsHeroTitle: '从 3000 到 25000 元 · 每一分钱都花在刀刃上',
    buildsHeroDesc:
      '遵循业界黄金装机铁律：游戏机型显卡占比 45%~50%，电源散热稳留冗余，原厂闪存拒绝缩水。',
    btnCopyBuild: '一键复制配置',
    btnCopiedBuild: '已复制!',
    thHardware: '硬件',
    thModel: '推荐具体型号',
    thSpecs: '规格要点',
    thPrice: '参考均价',
    thAction: '电商比价',
    buildNotesTitle: '配置选购避坑与搭配理由：',

    // Footer
    footerCoreModules: '核心功能板块',
    footerDataSources: '数据致敬与权威溯源',
    footerPlatform: '关于 SiliconWiki',
    footerDisclaimer:
      '免责声明：硬件市场行情因批次与促销可能存在小幅浮动，跑分供选购参考，实际以官方实机实测为准。',
  },
  en: {
    brandName: 'SiliconWiki',
    brandTagline: 'Computer Hardware Encyclopedia & 3D Interactive Builder',
    brandDesc:
      'A modern, interactive computer hardware encyclopedia and 3D PC assembly platform for enthusiasts, gamers, and builders.',

    // Nav
    navWiki: 'Hardware Wiki',
    navRankings: 'Benchmark Tier',
    nav3D: '3D Assembly',
    navGlossary: 'Glossary',
    navBuilds: 'Build Guides',
    searchPlaceholder: 'Search wiki... (Ctrl+K)',
    searchShortcut: 'Ctrl K',
    toggleTheme: 'Toggle theme',
    toggleLang: '中文',

    // Wiki
    wikiTitle: 'Hardware Encyclopedia',
    wikiSubtitle:
      'In-depth architectural analysis, build quality guidelines, and buying recommendations',
    catAll: 'All Components',
    catCpu: 'Processors (CPU)',
    catGpu: 'Graphics Cards (GPU)',
    catLaptop: '💻 Laptop Guides',
    catMotherboard: 'Motherboards',
    catRam: 'Memory (RAM)',
    catStorage: 'NVMe SSDs',
    catPsu: 'Power Supplies (PSU)',
    catCooler: 'Cooling Systems',
    catCase: 'Chassis Cases',
    brandFilter: 'Brand:',
    allBrands: 'All',
    sortBy: 'Sort By',
    sortDefault: 'Recommended',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortTdp: 'TDP Power Draw',
    msrpLabel: 'MSRP Guide Price',
    marketPriceLabel: 'Market Average Price',
    shopJd: 'JD.com (Login Req.)',
    shopTb: 'Taobao (Login Req.)',
    shopPdd: 'PDD (Login Req.)',
    tdpUnits: 'W',

    // Laptop
    laptopHeroTitle: 'Demystifying Laptop Hardware: Beyond Model Names & Power Walls',
    laptopHeroDesc:
      'Laptops differ vastly from desktops. Identical chip model names can exhibit over 40% performance gaps under constrained thermal envelopes and TGP power limits.',
    laptopTabVs: 'Mobile vs. Desktop Architectures',
    laptopTabTgp: 'TGP Power Envelopes',
    laptopTabScreen: 'Display Panels (IPS/OLED/Mini-LED)',
    laptopTabCooling: 'Vapor Chambers & Liquid Metal',

    // Rankings
    rankHeroTitle: 'Normalized Benchmark Tier Lists · Real-World Game & Efficiency Testing',
    rankHeroDesc:
      'Directly aligned with Geekerwan (socpk.com) real-world energy efficiency metrics and UL 3DMark TimeSpy scores. Normalized to RTX 4060 Desktop as 100% baseline.',
    btnGeekerwan: 'Geekerwan Official Ladder',
    btnTechPowerUp: 'TechPowerUp GPU Specs',
    tabGpuRank: 'Graphics (GPU) Tier',
    tabCpuRank: 'Processors (CPU) Tier',
    modeGaming: '3A Gaming Performance',
    modeProductivity: 'Multi-Core Productivity',
    modeEfficiency: 'Performance-per-Watt Efficiency',
    includeLaptopChips: 'Include Laptop Mobile Chips',
    filterModel: 'Filter model...',
    rankColRank: 'Rank / Chip Model',
    rankColPower: 'TDP',
    rankColScore: 'Relative Score',
    rankColPk: 'PK Compare',
    btnAddToPk: 'Compare',
    btnAddedToPk: 'Selected',
    pkDockTitle: '{count} hardware items selected for showdown',
    btnOpenPk: 'Launch Side-by-Side PK',
    btnClearPk: 'Clear',

    // 3D Assembly
    assemblyHeroTitle: 'Interactive 3D Virtual PC Building Simulator',
    assemblyHeroDesc:
      'Features 360° orbit inspection, 1-click exploded view, step-by-step guided installation, safety precautions, and curated video masterclasses.',
    btnBilibiliGuides: '📺 Video Masterclasses (15M+ views)',
    btnExplodeToggle: '💥 3D Exploded View',
    btnExplodeRestore: 'Reassemble PC',
    btnResetView: 'Reset Camera',
    canvasHint: '🖱️ Left click & drag to rotate 360° · Scroll wheel to zoom',
    stepTitle: 'STEP {current} / {total}',
    guideTitle: 'Installation Checklist & Guidelines:',
    warningTitle: 'Critical Safety Precautions',
    debugTitle: 'Self-Check Checklist:',
    btnViewVideoStep: 'Watch Video Tutorial for this Step ({time})',
    btnPrevStep: 'Previous',
    btnNextStep: 'Next Step',

    // Glossary
    glossaryHeroTitle: 'Hardware Terminology Dictionary',
    glossaryHeroDesc:
      'Translating jargon into plain English, underlying physical architecture, and practical buying tips. Never get confused by spec sheets again.',
    glossarySearchPlaceholder: 'Search terminology (e.g. XMP, 3D V-Cache, TDP, TLC)...',
    termPlainLabel: 'In Plain English:',
    termTechLabel: 'Underlying Architecture & Technology:',
    termBuyingLabel: '💡 Practical Buying Advice:',

    // Builds
    buildsHeroTitle: 'Balanced Build Guides from Budget to Enthusiast',
    buildsHeroDesc:
      'Following golden PC building rules: GPU accounts for 45%~50% of gaming budget, redundant power & cooling, and genuine high-end flash memory.',
    btnCopyBuild: 'Copy Build BOM',
    btnCopiedBuild: 'Copied!',
    thHardware: 'Component',
    thModel: 'Recommended Model',
    thSpecs: 'Key Specs',
    thPrice: 'Approx Price',
    thAction: 'Live Pricing',
    buildNotesTitle: 'Building Tips & Component Pairing Rationale:',

    // Footer
    footerCoreModules: 'Core Modules',
    footerDataSources: 'Data Sources & Acknowledgements',
    footerPlatform: 'About SiliconWiki',
    footerDisclaimer:
      'Disclaimer: Market prices fluctuate with promotions. Benchmark scores are for buying reference; verify with official hardware documentation.',
  },
};
