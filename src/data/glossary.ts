import { GlossaryTerm } from '../types';

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'term-3d-vcache',
    term: '3D V-Cache (3D 垂直堆叠缓存)',
    alias: ['X3D', '大缓存', '3D缓存'],
    category: 'cpu',
    shortDesc: '通过将超大容量的三级缓存（L3 Cache）直接 3D 堆叠在 CPU 核心上，大幅消灭游戏掉帧卡顿。',
    fullExplanation:
      'CPU 运算速度极快，但从内存读取数据需要数百个时钟周期。当游戏逻辑（如物理碰撞、同屏NPC、大量玩家位置）能全部装进 96MB+ 的超大 L3 缓存时，CPU 命中率高达 95% 以上，不再等待慢速内存，使得大型 3A 与《CS2》《魔兽世界》《绝地求生》等网游的平均帧率和 1% Low 帧爆发式提升。AMD 9800X3D 更将缓存移到底层，散热大幅改善，解锁自由超频。',
    buyingAdvice:
      '如果你配电脑 80% 以上的时间是打游戏，无脑优先选择带 X3D 后缀的处理器（如 7800X3D / 9800X3D），游戏体验断层式领先。',
    tags: ['AMD', '游戏神器', '帧率', '缓存'],
  },
  {
    id: 'term-ipc',
    term: 'IPC (每时钟周期指令数)',
    alias: ['Instructions Per Cycle', '架构能效'],
    category: 'cpu',
    shortDesc: 'CPU 的“单核内功”，代表在相同主频下每个时钟周期能够处理的计算任务量。',
    fullExplanation:
      'CPU 的绝对单核性能 = 频率 (GHz) × IPC。这就解释了为什么 10 年前 5.0 GHz 的老 CPU 打不过今天 4.0 GHz 的新 CPU，因为新架构优化了分支预测、流水线宽度与执行单元，使 IPC 提升了 200% 以上。',
    buyingAdvice: '不要盲目只看主频高低，新一代架构的 CPU 即使主频稍低，由于 IPC 大幅提升，实际性能往往更强。',
    tags: ['架构', '核心性能', '频率'],
  },
  {
    id: 'term-pe-cores',
    term: 'P-Core 与 E-Core (大小核架构)',
    alias: ['性能核', '能效核', '异构架构'],
    category: 'cpu',
    shortDesc: 'Intel 12~14 代采用的混合架构：P核负责游戏等重活，E核负责后台渲染和多任务。',
    fullExplanation:
      'P-Core (Performance Core) 拥有完整乱序执行、超线程和极高单核频率；E-Core (Efficient Core) 面积小巧能耗极低，4个 E 核面积只相当于 1 个 P 核，能在有限硅片面积内塞入更多核心，多核渲染得分飙升。依赖 Windows 11 的 Intel Thread Director 线程调度器智能分配任务。',
    buyingAdvice:
      '纯玩老游戏若遇到极少数反作弊软件不兼容，可在 BIOS 开启 Legacy Game Mode 或直接选全大核的 AMD 处理器；如果是视频剪辑与渲染，多 E 核能极大缩短导出时间。',
    tags: ['Intel', '核心调度', '生产力'],
  },
  {
    id: 'term-tdp-tgp',
    term: 'TDP 与 TGP (热设计功耗 / 整卡功耗)',
    alias: ['功耗', '功耗墙', 'PL1/PL2'],
    category: 'gpu',
    shortDesc: '硬件在设计最大负荷运转时消耗的电功率与释放的热量指标，直接决定电源瓦数与散热器规格。',
    fullExplanation:
      'TDP (Thermal Design Power) 传统指芯片发热功耗；显卡通常使用 TGP (Total Graphics Power，整卡功耗)，包含 GPU 核心、显存和供电模块总耗电。Intel 还有 PL1 (长时功耗) 和 PL2 (短时爆发功耗)；笔记本平台则有 Dynamic Boost 动态调节机制。',
    buyingAdvice:
      '选购电源瓦数公式：【CPU 满载 PL2 功耗 + 显卡 TGP 功耗 + 150W 周边配件余量】× 1.25 倍安全冗余。',
    tags: ['电源选择', '散热', '功耗计算'],
  },
  {
    id: 'term-vram-buswidth',
    term: '显存容量与显存位宽 (VRAM & Bus Width)',
    alias: ['显存', '位宽', '128bit', '256bit'],
    category: 'gpu',
    shortDesc: '显存决定能装下多大的高清贴图，位宽则像公路车道宽度，决定数据吞吐爆发力。',
    fullExplanation:
      '显存带宽 = 显存频率 × 显存位宽 ÷ 8。即使显存很大，若位宽被阉割为 128-bit，在 4K 超高分辨率下海量高精贴图并发写入时就会遇到“车道堵车”，导致帧率暴跌。而 256-bit 或 512-bit 则相当于 8 车道高速公路，高分辨率稳定性极强。',
    buyingAdvice:
      '玩 2K 游戏建议至少 12GB 显存，玩 4K 游戏建议 16GB 起步；本地跑 SD 生图或大语言模型至少需要 16GB~24GB。',
    tags: ['显卡选购', '显存防爆', '分辨率'],
  },
  {
    id: 'term-dlss-fsr',
    term: 'DLSS 与 FSR (超分辨率与帧生成技术)',
    alias: ['帧生成', '大力水手', 'AI插帧', 'Ray Reconstruction'],
    category: 'gpu',
    shortDesc: '利用 AI 算法在低分辨率下渲染画面，再高保真放大成 4K 并无中生有插入新帧，使帧率翻倍。',
    fullExplanation:
      'DLSS 3/3.5 是 NVIDIA 基于 Tensor Core 的深度学习超采样与帧生成；FSR 是 AMD 开源的跨平台技术。它们能让原本跑 40 帧卡顿的光追游戏瞬间飙升到 80~100 帧流畅运行，同时搭配 Reflex 技术控制输入延迟。',
    buyingAdvice: '支持 DLSS 3 的 RTX 40/50 系列显卡在次世代 3A 游戏中的实机体验生命周期远超老旧显卡。',
    tags: ['黑科技', '画质', '帧率翻倍'],
  },
  {
    id: 'term-xmp-expo',
    term: 'XMP 3.0 与 EXPO (一键内存超频)',
    alias: ['一键超频', 'DOCP', 'Gear模式'],
    category: 'motherboard',
    shortDesc: '内存出厂自带的最佳频率和时序预设档案，进 BIOS 点一下就能从默认丐版频率飞跃到标称高频。',
    fullExplanation:
      '刚买回来的 DDR5 内存插上主板默认只运行在 JEDEC 保底的 4800MHz。必须在开机按 Del 进 BIOS 开启 Intel XMP (Extreme Memory Profile) 或 AMD EXPO (Extended Profiles for Overclocking)，才能一键跑上 6000MHz CL30。',
    buyingAdvice: '装完新电脑第一件事：开机必须进 BIOS 打开 XMP/EXPO，否则白白浪费上百元的内存高频性能！',
    tags: ['必开设置', '装机关键', 'BIOS'],
  },
  {
    id: 'term-ram-timing-cl',
    term: '内存时序 (CAS Latency / CL)',
    alias: ['CL30', 'CL36', '小参', '延迟'],
    category: 'motherboard',
    shortDesc: '内存接收指令到输出数据之间的等待延迟周期数，数字越小，响应速度越快。',
    fullExplanation:
      '常见标识如 `DDR5 6000 CL30-36-36-76`，其中第一个数字 CL30 代表列寻址选通脉冲延迟。相同 6000MHz 下，CL30 的实际物理响应时间（约 10ns）显著优于 CL36 或 CL40，在吃内存延迟的竞技游戏（如绝地求生、英雄联盟）中 1% Low 帧表现更好。',
    buyingAdvice: 'DDR5 选购黄金法则：认准海力士颗粒的 6000MHz CL30 套条，稳定且体质优秀。',
    tags: ['内存参数', '低延迟', '颗粒'],
  },
  {
    id: 'term-dual-channel',
    term: '双通道内存 (Dual Channel)',
    alias: ['插槽2/4', '双通道法则', '1-3槽 vs 2-4槽'],
    category: 'motherboard',
    shortDesc: '两条内存同时并联读写，位宽从 64-bit 翻倍为 128-bit，带宽直接翻倍！',
    fullExplanation:
      '四槽主板从 CPU 往右数通常为 1、2、3、4 槽。主板走线大多采用 Daisy-Chain (菊花链) 拓扑，末端的第 2 和第 4 槽位信号完整度最好、反射杂波最少。插在 2 和 4 槽才能最稳定开启高频双通道。',
    buyingAdvice: '宁买两根 16G 组双通道，也不买单根 32G 单通道！插主板务必认准 2 和 4 槽！',
    tags: ['装机必看', '插槽顺序', '带宽'],
  },
  {
    id: 'term-nvme-pcie',
    term: 'NVMe 与 PCIe 4.0/5.0 协议',
    alias: ['固态硬盘协议', 'M.2通道', '读写速度'],
    category: 'storage',
    shortDesc: '专为极速闪存定制的直通 CPU 高速传输协议，速度数倍于老旧 SATA 机械盘。',
    fullExplanation:
      'SATA 固态上限仅 550MB/s；PCIe 3.0 NVMe 上限约 3500MB/s；PCIe 4.0 NVMe 上限约 7450MB/s；最新的 PCIe 5.0 固态可达 14000MB/s（但发热极高需风扇主动散热）。',
    buyingAdvice:
      '普通用户与游戏玩家首选成熟的 PCIe 4.0 TLC 固态（如致态 TiPlus7100 / 三星 990 PRO），PCIe 5.0 目前性价比低且发热过大。',
    tags: ['固态协议', '极速读取', '接口'],
  },
  {
    id: 'term-tlc-qlc',
    term: 'TLC vs QLC (闪存颗粒避坑)',
    alias: ['闪存类型', '擦写寿命', '掉速'],
    category: 'storage',
    shortDesc: 'TLC 每个单元存储 3bit 数据，寿命与缓外速度碾压 4bit 的 QLC 颗粒。',
    fullExplanation:
      'TLC (Triple-Level Cell) 擦写寿命约 1000~3000 次，缓外写入速度快；QLC (Quad-Level Cell) 写入寿命仅约 300~500 次，且当大文件写满模拟 SLC 缓存后，缓外真实写入速度甚至会断崖式暴跌到 50MB/s（比机械硬盘还慢）。',
    buyingAdvice: '选购固态硬盘务必认准【原厂 3D TLC 颗粒】，坚决避开把 QLC 当好盘卖的杂牌套路。',
    tags: ['避坑指南', '颗粒寿命', 'SSD'],
  },
  {
    id: 'term-atx3-12v2x6',
    term: 'ATX 3.1 规范与 12V-2x6 显卡接口',
    alias: ['16Pin', '12VHPWR', '防烧接口'],
    category: 'psu',
    shortDesc: '专为 RTX 40/50 时代大功率瞬态爆发设计的电源新标准，防呆插头大幅改善烧卡隐患。',
    fullExplanation:
      '上一代 12VHPWR 16Pin 接口由于感应针脚过短，一旦玩家没完全插紧就会打火烧毁接口。改良后的 ATX 3.1 采用 12V-2x6 接口：缩短感应针（没插紧直接不通电自保）并加长导电铜端子，彻底解决烧卡隐患，并能承受 200% 瞬时峰值动态冲击。',
    buyingAdvice: '新配中高端主机强烈建议认准标配 ATX 3.0/3.1 原生 16Pin 线的金牌全模组电源。',
    tags: ['电源安全', '防烧卡', '接口规范'],
  },
  {
    id: 'term-vrm-phases',
    term: '主板供电相数与 DrMOS (VRM)',
    alias: ['供电相数', '电压调节模块', '倍相', '并联'],
    category: 'motherboard',
    shortDesc: '把电源输入的 12V 高压降压转化为 CPU 核心所需 1.2V 纯净低压的“供电发动机组”。',
    fullExplanation:
      '相数越多，各相 MOS 管分摊的电流越小，发热越低，电压波纹越平稳。优质主板采用一体化封装的 DrMOS (Driver + MOSFET)，单颗承载能力可达 60A~90A，即使带动高功耗 i7/i9 也不会出现供电过热降频。',
    buyingAdvice: '带 i5/7500F 级别 8~10 相即可；带 i7/i9 建议选 14 相以上且带有厚实金属散热鳍片的主板。',
    tags: ['主板做工', '超频稳定', '散热马甲'],
  },
  {
    id: 'term-screen-panel',
    term: 'OLED / Mini-LED / Fast-IPS 屏幕面板',
    alias: ['屏幕材质', '高刷', '色域', '响应时间'],
    category: 'display',
    shortDesc: '显示器核心面板技术：OLED 纯黑对比度极强，Mini-LED 亮度极高，Fast-IPS 综合最护眼稳定。',
    fullExplanation:
      'OLED 像素级自发光，响应时间仅 0.03ms，黑场绝对纯黑，但有烧屏风险；Mini-LED 采用数千颗微型 LED 分区背光，HDR 亮度高达 1400nits+；Fast-IPS 技术成熟寿命长，无烧屏烦恼，是主流电竞游戏的主力。',
    buyingAdvice:
      '重度长时间打字办公选 Fast-IPS；追求极致 HDR 观影与 3A 沉浸感选 Mini-LED；竞技电竞发烧友选高刷 OLED。',
    tags: ['屏幕素质', '色彩对比', '护眼'],
  },
  {
    id: 'term-peel-film-warning',
    term: '终极警示：散热器与 M.2 散热片“撕膜”',
    alias: ['请撕此膜', '撕膜警告', '大火炉', '90度降频'],
    category: 'cooling',
    shortDesc: '装机新手最常见的“翻车第一名”：忘记撕下散热器底座铜底或主板导热胶上的透明塑料保护膜！',
    fullExplanation:
      '散热器出厂时为了防氧化划伤，底座会贴有一层写着“WARNING: PLEASE REMOVE BEFORE USE”的透明塑料膜。如果没撕就抹上硅脂扣在 CPU 上，塑料膜会变成绝热层，开机瞬间飙到 100°C 蓝屏降频！',
    buyingAdvice: '【牢记在心】：装散热器前、盖 M.2 散热马甲前，第一步检查膜撕了没有！',
    tags: ['装机必踩坑', '新手警告', '翻车第一名'],
  },
];
