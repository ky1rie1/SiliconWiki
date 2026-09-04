import { ChangelogItem } from '../types';

export const changelogList: ChangelogItem[] = [
  {
    version: 'v1.6.0',
    date: '2026-09-04',
    title: '硬件全动态筛选器、微架构高精工程展台、系统诊断与内容校准记忆与中关村在线 (ZOL) 数据库联动',
    tag: '最新发布',
    updates: [
      {
        type: 'feature',
        text: '全动态品牌与规格筛选体系：彻底解决品类品牌错乱（主板/内存/散热器筛选为0或串品类）的问题，切换品类自动复位对应真实品牌池，并新增 ZOL 级细分规格（AM5/LGA1851、显存容量、板型、DDR5/4、PCIe 5.0等）。',
      },
      {
        type: 'feature',
        text: '硬件视觉呈现与微架构工程展台：重构 HardwareImage 组件，移除导致暗色模式照片发浅反色的图层，针对各品类芯片、显卡风扇、主板VRM、水冷冷头等动态渲染高精矢量微架构工程蓝图。',
      },
      {
        type: 'feature',
        text: '系统诊断与内容校准工作台记忆与代码库固化：激活后本地永久保持，导航栏顶部常驻「内容校准」快捷入口；支持一键生成并复制 defaultTextOverrides.ts 完整代码文件，新增 JSON 补丁导入功能。',
      },
      {
        type: 'data',
        text: '全面接轨中关村在线 (diy.zol.com.cn) 硬件全参数规范：硬件详情页深度覆盖插槽封装、制造工艺、基础/加速频率、供电相数、通道拆分等维度，并提供一键直达 ZOL 拆解与天梯原站。',
      },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2026-09-04',
    title: '天梯排重修复、75+条全量硬核名词宝典、高精拟真3D风扇与站长文案速改系统',
    tag: '重大更新',
    updates: [
      {
        type: 'fix',
        text: '修复天梯排行榜数据项重复与 3060Ti 重复问题：彻底解决 ID 碰撞与多余记录，排行动画与 PK 状态完全稳固。',
      },
      {
        type: 'feature',
        text: '上线「站长文案速改系统 (Content Customizer)」：支持在浏览器中直接检索、在屏编辑修改任意词条与文案，并一键本地持久化与导出代码补丁！',
      },
      {
        type: 'feature',
        text: '3D 装机室风扇全维度拟真重塑：告别简单立方体，升级为 9 镰刀流线导流曲面叶片、圆弧导流进风筒、定子后骨架、硅胶减震耳与中心拉丝金属徽标。',
      },
      {
        type: 'data',
        text: '名词宝典大扩充至 75+ 条硬核词典：全量收录九点涂硅脂法、防弯扣具、显卡啸叫机理、均热板VC、Gear 1/2分频、内存小参、PCB层数、DirectStorage、FDB轴承等。',
      },
      {
        type: 'data',
        text: '大幅扩充硬盘、内存、散热器、主板、电源、机箱与笔记本全品类数据库，补充热销主流型号。',
      },
      {
        type: 'fix',
        text: '导航栏视觉净化：移除冗余的 Live 徽章链接，导航体验更加纯粹清爽。',
      },
    ],
  },
  {
    version: 'v1.4.0',
    date: '2026-09-04',
    title: '全量硬件库扩充、42条硬核名词宝典、划词解释卡片与 CNC 机械跑分规',
    tag: '重大里程碑',
    updates: [
      {
        type: 'feature',
        text: '3D 虚拟装机室基石重构：主板自第 1 步起平稳显现于赛博工作台上，消除 CPU、内存与散热器浮空装配的问题。',
      },
      {
        type: 'feature',
        text: '硬件界面划词/点击直达技术卡片：支持在硬件百科界面任意划词或点击卡片热词标签，即刻弹出「大白话+技术机理+选购避坑」三段式深度卡片。',
      },
      {
        type: 'data',
        text: '名词宝典扩展至 42+ 条硬核词典：全品类覆盖 3D V-Cache、CUDIMM、DLSS 4、ATX 3.1、TLC/QLC 避坑、DrMOS 供电、双通道插槽法则等。',
      },
      {
        type: 'feature',
        text: '拉条组件全面高规格重构：天梯排行榜升级为 CNC 机械凹槽跑分规（Machined Groove Gauge），3D 装机室配备贯通式发光流水线能量导轨。',
      },
      {
        type: 'fix',
        text: '亮色与暗色模式深度色彩修正：彻底修复暗色模式下硬件卡片背景发浅发灰的问题。',
      },
      {
        type: 'feature',
        text: '公告智能弹窗系统：支持新版本首次访问自动弹出更新公告，并支持“本次更新不再提示”本地持久化记录。',
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: '2026-09-04',
    title: '硬件卡片高科技矢量蓝图、电商直达与 3D 体素模型升级',
    tag: '重大更新',
    updates: [
      {
        type: 'feature',
        text: '硬件百科卡片全新上线产品专属实物与芯片微架构电路矢量展示区，解决无图空泛感。',
      },
      {
        type: 'feature',
        text: '3D 虚拟装机室全面升级为高精细度体素（Voxel）机械艺术建模，支持旋转风扇与透视。',
      },
      {
        type: 'feature',
        text: '全站电商直达搜索按钮统一附带「(须登录)」提示，精准直达京东自营、淘宝百亿补贴。',
      },
      {
        type: 'data',
        text: '大幅扩充 Intel 12/13/14 代与 Core Ultra 200S、AMD 5000/7000/9000/X3D 全系硬件数据库。',
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-09-04',
    title: '次世代硬件与极客湾天梯权威跑分全面同步',
    tag: '数据同步',
    updates: [
      {
        type: 'data',
        text: '全量同步 AMD Ryzen 7 9800X3D（第二代下置 3D 缓存神U）与 RTX 50 系列顶级卡皇的实测能效与跑分。',
      },
      {
        type: 'feature',
        text: '深度对齐极客湾（socpk.com）桌面及移动端能效比基准与 3DMark TimeSpy 理论跑分体系。',
      },
      {
        type: 'price',
        text: '根据国内电商近期真实成交均价，校准 2TB PCIe 4.0 固态、海力士 A-Die DDR5 6000 内存价格区间。',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-09-04',
    title: 'Three.js 3D 实景装机室与 B 站保姆级视频精讲上线',
    tag: '核心功能',
    updates: [
      {
        type: 'feature',
        text: '全新上线基于 WebGL/Three.js 打造的 3D 实景装机模拟器，支持 360° 自由旋转平移与分步拼装。',
      },
      {
        type: 'feature',
        text: '重磅加入【一键全机爆炸拆解透视 (Exploded View)】：内部硬件三维平滑展开悬浮。',
      },
      {
        type: 'feature',
        text: '精选接入 B 站播放量超千万的小白装机保姆级视频，分步直达实操时间点。',
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-09-04',
    title: 'SiliconWiki 芯知百科正式上线',
    tag: '首次发布',
    updates: [
      {
        type: 'feature',
        text: '完整构建台式机全配件（CPU/主板/显卡/内存/SSD/电源/散热/机箱）及笔记本专项知识百科。',
      },
      {
        type: 'feature',
        text: '支持深色极客科技暗黑与浅色纯净工程明亮一键平滑切换。',
      },
      {
        type: 'feature',
        text: '上线从 3000 元至 25000 元精选推荐装机配置单，包含完整清单与一键复制功能。',
      },
    ],
  },
];
