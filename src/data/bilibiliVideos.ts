export interface BilibiliVideo {
  id: string;
  title: string;
  upName: string;
  plays: string;
  danmaku: string;
  duration: string;
  description: string;
  tags: string[];
  url: string;
  isRecommend?: boolean;
}

export const bilibiliVideos: BilibiliVideo[] = [
  {
    id: 'bv-chaguan-pc-guide',
    title: '【装机教程】保姆级装机教程，从零开始手把手教你组装一台电脑！',
    upName: '硬件茶社',
    plays: '1500万+ 播放',
    danmaku: '12万+ 弹幕',
    duration: '42:18',
    description:
      '全网公认标杆级的装机实操教科书。视频全景特写镜头、多机位慢动作演示，从 CPU 安装防呆、内存双通道、散热器撕膜、机箱铜柱固定到最让新手头疼的跳线连接，每一秒都干货满满。',
    tags: ['保姆级教程', '零基础必看', '全网最高赞', '多机位特写'],
    url: 'https://www.bilibili.com/video/BV1eW411w7pn',
    isRecommend: true,
  },
  {
    id: 'bv-geekerwan-assembly',
    title: '【极客湾】如何装一台电脑？硬件搭配、避坑技巧与实测装机',
    upName: '极客湾 Geekerwan',
    plays: '800万+ 播放',
    danmaku: '8万+ 弹幕',
    duration: '35:40',
    description:
      '极客湾官方出品，从软硬件底层原理切入，不仅教你怎么插零件，更告诉你为什么这么设计、不同硬件规格的真实性能差异与避坑秘籍。',
    tags: ['极客湾权威', '底层逻辑', '装机避坑', '硬件搭配'],
    url: 'https://www.bilibili.com/video/BV1wA411b7q7',
    isRecommend: true,
  },
  {
    id: 'bv-zjy-pc',
    title: '【装机猿】装机其实很简单，看一遍就会的装机实录',
    upName: '装机猿',
    plays: '650万+ 播放',
    danmaku: '6万+ 弹幕',
    duration: '28:30',
    description:
      '风趣幽默的大白话装机教学，重点强调各种防呆口防反手感、螺丝力度以及海景房机箱风道优化与背线整理技巧。',
    tags: ['幽默通俗', '理线技巧', '背插主板', '风道实操'],
    url: 'https://www.bilibili.com/video/BV1b54y1V7y4',
  },
  {
    id: 'bv-tiaoxian-jumpers',
    title: '【跳线专题】告别恐惧！主板跳线 3 分钟极速搞定指南',
    upName: '搞机所',
    plays: '320万+ 播放',
    danmaku: '3万+ 弹幕',
    duration: '06:15',
    description:
      '专门针对装机新手最害怕的 POWER SW、RESET、HDD LED 跳线连接制作的微距教学，带超大图解丝印对比，一秒学会。',
    tags: ['跳线专题', '短视频秒懂', 'POWER SW', '前置面板'],
    url: 'https://www.bilibili.com/video/BV1b441197UX',
  },
  {
    id: 'bv-bios-win11',
    title: '【点亮与系统】装机后首次开机进 BIOS 开启 XMP 与 Windows 11 安装',
    upName: '电脑吧评测室',
    plays: '460万+ 播放',
    danmaku: '4万+ 弹幕',
    duration: '18:50',
    description:
      '硬件拼好之后的下半场！手把手带你使用微软官方 MediaCreationTool 制作纯净无捆绑的 Win11 安装 U 盘，并在 BIOS 中一键开启 XMP/EXPO 与 TPM 2.0。',
    tags: ['系统安装', 'BIOS设置', '开启XMP', '纯净系统'],
    url: 'https://www.bilibili.com/video/BV1ya411c7A2',
  },
];
