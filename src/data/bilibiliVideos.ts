interface LocalizedGuideText {
  zh: string;
  en: string;
}

export interface BilibiliSearchGuide {
  id: string;
  title: LocalizedGuideText;
  description: LocalizedGuideText;
  /** Chinese keywords match the primarily Chinese-language Bilibili catalog. */
  query: string;
}

// Topic searches, not endorsements of individual videos or their creators.
export const bilibiliSearchGuides: BilibiliSearchGuide[] = [
  {
    id: 'assembly-basics',
    title: { zh: '基础装机：从零了解安装顺序', en: 'PC assembly basics' },
    description: {
      zh: '搜索 CPU、内存、散热器与机箱安装的完整演示，结合 3D 步骤观察零件方向和固定方式。',
      en: 'Find walkthroughs of CPU, memory, cooler and case installation. Compare component orientation and mounting with the 3D guide.',
    },
    query: '电脑装机 基础 完整教程',
  },
  {
    id: 'hardware-compatibility',
    title: { zh: '硬件兼容：插槽、尺寸与供电', en: 'Hardware compatibility' },
    description: {
      zh: '搜索 CPU 插槽、内存代际、显卡长度与电源接口的搭配说明，并按具体型号核对厂商规格。',
      en: 'Explore CPU sockets, memory generations, graphics-card clearance and power connectors. Check compatibility against the exact product specifications.',
    },
    query: '电脑装机 硬件兼容 插槽 尺寸 电源',
  },
  {
    id: 'cables-and-airflow',
    title: { zh: '理线风道：线材路径与风扇方向', en: 'Cable management and airflow' },
    description: {
      zh: '搜索机箱背线、进风与排风布局示范，观察线材如何避开风扇和主要通风路径。',
      en: 'Find case cable-routing and intake/exhaust examples, including ways to keep cables clear of fans and airflow paths.',
    },
    query: '机箱 理线 风道 风扇 安装',
  },
  {
    id: 'front-panel-wiring',
    title: { zh: '主板跳线：前面板接口与极性', en: 'Motherboard front-panel wiring' },
    description: {
      zh: '搜索 POWER SW、RESET SW 和 LED 接线演示。引脚排列与极性以实际主板手册为准。',
      en: 'Look up POWER SW, RESET SW and LED wiring demonstrations. Use the actual motherboard manual for pin assignments and polarity.',
    },
    query: '主板 前面板 跳线 POWER SW LED 教程',
  },
  {
    id: 'bios-and-os',
    title: { zh: 'BIOS 与系统安装：首次启动之后', en: 'BIOS setup and OS installation' },
    description: {
      zh: '搜索首次进入 BIOS、检查硬件识别和安装系统的操作流程，按主板与系统版本选择对应教程。',
      en: 'Find first-boot BIOS checks, hardware detection and operating-system installation guides that match your motherboard and OS version.',
    },
    query: '装机 首次开机 BIOS 系统安装 教程',
  },
];
