import { GlossaryTerm } from '../types';

export const glossaryTerms: GlossaryTerm[] = [
  // ========================================================
  // CPU 处理器核心技术与原理
  // ========================================================
  {
    id: 'term-3d-vcache',
    term: '3D V-Cache (3D 垂直堆叠大缓存)',
    alias: ['X3D', '大缓存', '3D缓存', '9800X3D', '7800X3D'],
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
    alias: ['Instructions Per Cycle', '架构能效', '单核内功'],
    category: 'cpu',
    shortDesc: 'CPU 的“单核内功”，代表在相同主频下每个时钟周期能够处理的计算任务量。',
    fullExplanation:
      'CPU 的绝对单核性能 = 频率 (GHz) × IPC。这就解释了为什么 10 年前 5.0 GHz 的老 CPU 打不过今天 4.0 GHz 的新 CPU，因为新架构优化了分支预测、流水线宽度与执行单元，使 IPC 提升了 200% 以上。',
    buyingAdvice:
      '不要盲目只看主频数字高低，新一代架构的 CPU 即使主频稍低，由于 IPC 大幅提升，实际性能往往更强。',
    tags: ['架构', '核心性能', '频率'],
  },
  {
    id: 'term-pe-cores',
    term: 'P-Core 与 E-Core (大小核异构架构)',
    alias: ['性能核', '能效核', '异构架构', 'Thread Director'],
    category: 'cpu',
    shortDesc: 'Intel 12~14 代与酷睿 Ultra 采用的混合架构：P核负责游戏等重活，E核负责后台渲染和多任务。',
    fullExplanation:
      'P-Core (Performance Core) 拥有完整乱序执行、超高单核频率；E-Core (Efficient Core) 面积小巧能耗极低，4个 E 核面积只相当于 1 个 P 核，能在有限硅片面积内塞入更多核心，多核渲染得分飙升。依赖 Windows 11 的 Intel Thread Director 线程调度器智能分配任务。',
    buyingAdvice:
      '如果是视频剪辑、3D 建模渲染与多开，多 E 核能极大缩短导出时间；若追求纯粹的全大核电竞，AMD Ryzen 7 系列全大核体验更加简单省心。',
    tags: ['Intel', '核心调度', '生产力'],
  },
  {
    id: 'term-avx512',
    term: 'AVX-512 (512位高级矢量扩展指令集)',
    alias: ['AVX512', '矢量指令集', 'PS3模拟器神器'],
    category: 'cpu',
    shortDesc: '一次性能处理 512 位宽数据的超宽指令集，在主机模拟器、视频编码与 AI 计算中速度成倍提升。',
    fullExplanation:
      'AVX-512 原本主要用于数据中心至强服务器。AMD 从 Zen 4 (Ryzen 7000) 起原生支持 AVX-512，并采用双 256 位执行单元巧妙平衡了功耗。在运行 RPCS3 (PS3 模拟器)、Yuzu/Ryujinx、以及 Blender 渲染或本地推理时能带来最高 40% 的速度飞跃。',
    buyingAdvice:
      '重度主机模拟器发烧友或科学计算用户，优先选购原生完整支持 AVX-512 的 AMD Ryzen 7000/9000 系列处理器。',
    tags: ['模拟器', 'AI加速', '指令集'],
  },
  {
    id: 'term-npu',
    term: 'NPU (神经网络处理单元 / AI TOPS 算力)',
    alias: ['AI PC', 'TOPS', '神经计算引擎', 'Copilot+'],
    category: 'cpu',
    shortDesc: '集成在 CPU 芯片内部的低功耗 AI 专用硬件加速器，待机省电并全天候运行 AI 特效。',
    fullExplanation:
      '相比高功耗的独立 GPU，NPU 功耗仅数瓦，专门用于加速本地轻量 AI 任务，如摄像头实时背景虚化与目光校正、实时降噪、本地语音离线听写，以及 Windows 11 Copilot+ 要求的 40+ TOPS 本地端侧 AI 推理。',
    buyingAdvice:
      '轻薄笔记本非常看重 NPU（提升长续航 AI 体验）；台式机玩家打游戏和玩大模型主力仍是独立显卡（独显算力数倍于 NPU）。',
    tags: ['AI PC', '低功耗', '笔记本'],
  },
  {
    id: 'term-hyper-threading',
    term: '超线程 (Hyper-Threading / SMT)',
    alias: ['SMT', '逻辑处理器', '双线程'],
    category: 'cpu',
    shortDesc: '让单个物理核心在硬件层面模拟出两个逻辑线程，榨干核心闲置执行单元。',
    fullExplanation:
      '当一个线程因为等待内存读取而暂停时，另一个线程可以借用核心内空闲的算术单元继续工作，从而使多核生产力性能提升 20%~30%。Intel 在最新的酷睿 Ultra 200S (Arrow Lake) 架构中为了极致能效比和游戏延迟，取消了 P 核超线程。',
    buyingAdvice:
      '核心并非越多越好，纯打游戏 8 个高性能物理大核已是黄金甜点，不要为用不上的几十个后台虚拟线程过度付费。',
    tags: ['线程', '并发', 'CPU架构'],
  },
  {
    id: 'term-tdp-pl1-pl2',
    term: 'TDP 与 PL1/PL2 (功耗墙与爆发功耗)',
    alias: ['功耗墙', 'PL1', 'PL2', 'Tau', '热设计功耗'],
    category: 'cpu',
    shortDesc: 'CPU 的耗电与发热指标，PL1 为长时稳定功耗，PL2 为短时爆发狂飙功耗。',
    fullExplanation:
      'TDP (Thermal Design Power) 传统指基准散热要求。现代 Intel 处理器引入 PL1 (长时功耗限制) 与 PL2 (瞬时超频爆发功耗限制)。例如 i7 标称 125W，但高负荷瞬间 PL2 可冲到 253W 甚至无上限，如果主板供电或散热器接不住就会撞墙降频。',
    buyingAdvice:
      '选配散热器与电源时，绝不能只看官方标称的基准 TDP，必须按照该 CPU 真实的【PL2 满载爆发功耗】来选择散热与供电。',
    tags: ['功耗', '散热选择', '降频'],
  },
  {
    id: 'term-cpu-socket',
    term: 'CPU 插槽与防呆 (LGA vs PGA / AM5)',
    alias: ['接口类型', '触点', '针脚', 'LGA1700', 'AM5'],
    category: 'cpu',
    shortDesc: 'CPU 与主板的物理对接插座：LGA 针脚在主板上，需极度小心严防弯针。',
    fullExplanation:
      '当前主流台式机均为 LGA (Land Grid Array 触点阵列) 架构：CPU 底面为平整纯铜触点，而主板插槽上排列着数千根微米级弹性金针（如 LGA 1700 / LGA 1851 / AMD AM5）。安装时需对齐防呆金色三角形与凹槽，严禁手指触碰主板针脚或斜放压弯。',
    buyingAdvice:
      '新手装机切记轻拿轻放！主板针脚极其脆弱，一旦压弯可能导致不认内存双通道或彻底无法开机。',
    tags: ['装机注意', '主板插槽', '防呆'],
  },
  {
    id: 'term-process-node',
    term: '制程工艺 (nm / FinFET / GAA 环绕栅极)',
    alias: ['纳米工艺', '台积电', 'Intel 20A', '漏电率'],
    category: 'cpu',
    shortDesc: '制造芯片上晶体管的物理精度级别，工艺越先进，晶体管密度越高、能耗越低、主频越强。',
    fullExplanation:
      '随着制程向 3nm / 2nm 推进，传统 FinFET 鳍式晶体管面临漏电物理极限，进而演进为 GAA (Gate-All-Around 纳米片环绕栅极) 结构，全方位包裹通道以实现更强电流控制，在相同功耗下释放更高主频。',
    buyingAdvice:
      '先进制造工艺直接决定芯片能耗比。台积电 N4P / N3E 工艺在当前世代能耗与发热控制表现极佳。',
    tags: ['半导体', '制造工艺', '晶体管'],
  },

  // ========================================================
  // GPU 显卡核心架构与前沿技术
  // ========================================================
  {
    id: 'term-dlss-fsr',
    term: 'DLSS 4 / 3.5 与 FSR 3.1 / XeSS (超分辨率)',
    alias: ['DLSS', 'FSR', 'XeSS', '大力水手', '超采样'],
    category: 'gpu',
    shortDesc: '利用 AI 算法在低分辨率下渲染画面，再高保真放大成 4K 并修复光影细节，使帧率翻倍。',
    fullExplanation:
      'DLSS 3/3.5 是 NVIDIA 基于 Tensor Core 的深度学习超采样与 Ray Reconstruction 光线重建；FSR 是 AMD 开源的跨平台技术；XeSS 是 Intel 对应方案。它们能让原本跑 40 帧卡顿的光追游戏瞬间飙升到 80~100 帧流畅运行，同时搭配 Reflex 技术将输入延迟压缩到极限。',
    buyingAdvice:
      '支持 DLSS 3/4 的 NVIDIA 显卡在次世代 3A 游戏中的实机体验生命周期更长，AI 算法稳定性目前处于行业领先地位。',
    tags: ['NVIDIA', '黑科技', '画质', '帧率翻倍'],
  },
  {
    id: 'term-frame-generation',
    term: '帧生成 (Frame Generation / AI 插帧)',
    alias: ['插帧', 'AFMF', '光流加速器', '多帧插帧'],
    category: 'gpu',
    shortDesc: '利用显卡光流加速器计算前后两帧运动矢量，AI 在两帧之间“无中生有”凭空捏造全新画面帧。',
    fullExplanation:
      '传统渲染需要 CPU 运算物理逻辑后 GPU 画出完整三角形。帧生成跳过了传统渲染流水线，直接在显示输出前插入由神经网络生成的中间帧，使画面的肉眼流畅度翻倍（例如 60fps 提升到 120fps），在 CPU 瓶颈的游戏中尤其神效。',
    buyingAdvice:
      '开启帧生成建议原生帧率至少达到 50~60 帧以上，若原生只有 20 帧，强行插帧虽然帧数好看但手感操作延迟依然会很明显。',
    tags: ['高刷', '流畅度', '显卡技术'],
  },
  {
    id: 'term-ray-tracing',
    term: '全景光线追踪与路径追踪 (Path Tracing)',
    alias: ['光追', 'Ray Tracing', '路径追踪', 'RT Core'],
    category: 'gpu',
    shortDesc: '物理级真实模拟光线的折射、漫反射与环境光遮蔽，画面告别传统贴图假光。',
    fullExplanation:
      '传统游戏使用预烘焙光影贴图（假光）；光线追踪（如《黑神话：悟空》《赛博朋克 2077》）通过专用 RT Core 硬件实时计算数百万条光线在水面、金属、玻璃等各种材质上的弹射轨迹。全景路径追踪更是整张画面 100% 纯光线物理计算，极度消耗算力。',
    buyingAdvice:
      '沉迷高画质 3A 光追大作的玩家首选配备强劲 RT Core 的 NVIDIA RTX 4070 及以上级别显卡。',
    tags: ['画质巅峰', '真实光影', '次世代'],
  },
  {
    id: 'term-vram-buswidth',
    term: '显存容量与显存位宽 (VRAM & Bus Width)',
    alias: ['显存', '位宽', '128bit', '256bit', '爆显存'],
    category: 'gpu',
    shortDesc: '显存决定能装下多大的高清贴图，位宽则像公路车道宽度，决定数据吞吐爆发力。',
    fullExplanation:
      '显存带宽 = 显存频率 × 显存位宽 ÷ 8。即使显存很大，若位宽被阉割为 128-bit，在 4K 超高分辨率下海量高精贴图并发写入时就会遇到“车道堵车”，导致帧率暴跌。而 256-bit 或 512-bit 则相当于 8 车道高速公路，高分辨率稳定性极强。',
    buyingAdvice:
      '玩 2K 游戏建议至少 12GB 显存，玩 4K 游戏建议 16GB 起步；本地跑 SD 生图或大语言模型至少需要 16GB~24GB。',
    tags: ['显卡选购', '显存防爆', '分辨率'],
  },
  {
    id: 'term-gddr7',
    term: 'GDDR7 新一代显存标准',
    alias: ['PAM3', 'GDDR7显存', '高速显存'],
    category: 'gpu',
    shortDesc: 'RTX 50 系列采用的新显存标准，采用 PAM3 脉冲编码，单颗带宽暴涨 50% 以上。',
    fullExplanation:
      'GDDR7 放弃了传统的 NRZ 二进制信号，改用 PAM3 (3 级脉冲幅度调制) 信号传输，在相同时间内传输数据量提升 50%，初始引脚速率即可达 28~32 Gbps，功耗更低且发热可控，为 4K/8K 极端画质提供海量吞吐。',
    buyingAdvice:
      '搭载 GDDR7 显存的新一代显卡在高分辨率抗锯齿与高负荷大模型训练中优势显著。',
    tags: ['次世代', '高带宽', 'RTX50'],
  },
  {
    id: 'term-encoder-av1',
    term: '硬件编解码器 (NVENC & AV1 格式)',
    alias: ['NVENC', 'AV1', '推流', '硬解', '直播神器'],
    category: 'gpu',
    shortDesc: '显卡自带的独立视频压缩引擎，直播、录屏与剪辑时不占用任何 CPU 算力。',
    fullExplanation:
      '相比传统的 H.264，新一代开源免版税的 AV1 编码在相同画质下码率节省 30% 以上。B站与 YouTube 均已全面支持 AV1 4K 60fps 直播，利用 RTX 40/50 系列或 Intel Arc 的双 NVENC/AV1 编码器录制 4K 视频既清晰又体积小巧。',
    buyingAdvice:
      '做自媒体、游戏直播或剪辑的用户，选购支持 AV1 双硬件编码器的显卡体验极佳。',
    tags: ['自媒体', '直播', '视频剪辑'],
  },
  {
    id: 'term-pcie-lanes-cut',
    term: 'PCIe 通道拆分与 x8 缩水陷阱',
    alias: ['PCIe x8', '带宽缩水', '老主板掉帧'],
    category: 'gpu',
    shortDesc: '部分入门显卡物理金手指仅设计为 PCIe x8，插在老主板 PCIe 3.0 插槽上会导致性能损失。',
    fullExplanation:
      '标准显卡插槽提供 PCIe x16 全通道。但如 RTX 4060 / 4060 Ti / RX 7600 等为了节约成本仅走 PCIe 4.0 x8。如果你用的是 B450 / B360 等 PCIe 3.0 老主板，显卡就会被迫降速运行在 PCIe 3.0 x8（带宽仅相当于 PCIe 4.0 的四分之一），在显存爆满时会引起严重掉帧。',
    buyingAdvice:
      '老电脑升级显卡时务必确认主板是否支持 PCIe 4.0；若为主板仅支持 PCIe 3.0，建议优先挑选原生 PCIe x16 的显卡型号。',
    tags: ['避坑指南', '带宽陷阱', '老机升级'],
  },
  {
    id: 'term-vapor-chamber',
    term: '均热板 (VC 均温板) vs 热管直触',
    alias: ['均热板', 'VC', '热管直触', '热管回流焊'],
    category: 'gpu',
    shortDesc: '高端显卡核心散热利器，扁平铜腔内液体相变蒸发，导热均匀度远超传统铜管。',
    fullExplanation:
      '传统热管直触容易在铜管接缝处产生空气微缝，接触不平整。而均温板（Vapor Chamber）是一个高真空金属扁平腔体，内部充有微量工质和毛细微结构，热源接触点瞬间沸腾蒸发，蒸汽扩散至冷端冷凝回流，把热量以二维平面极速铺开至整个鳍片群。',
    buyingAdvice:
      'TGP 超过 280W 的中高端显卡（如 4070Ti S / 4080S / 5080），选购配备镀镍均热板铜底的非公版卡散热和噪音表现明显更好。',
    tags: ['显卡散热', '噪音控制', '做工用料'],
  },

  // ========================================================
  // 主板与内存核心参数
  // ========================================================
  {
    id: 'term-xmp-expo',
    term: 'XMP 3.0 与 EXPO (一键内存高频超频)',
    alias: ['一键超频', 'DOCP', 'Gear模式', 'BIOS必开'],
    category: 'motherboard',
    shortDesc: '内存出厂自带的最佳频率和时序预设档案，进 BIOS 点一下就能从默认保底频率飞跃到标称高频。',
    fullExplanation:
      '刚买回来的 DDR5 内存插上主板默认只运行在 JEDEC 保底的 4800MHz。必须在开机按 Del 进 BIOS 开启 Intel XMP (Extreme Memory Profile) 或 AMD EXPO (Extended Profiles for Overclocking)，才能一键跑上 6000MHz CL30。',
    buyingAdvice:
      '装完新电脑第一件事：开机必须进 BIOS 打开 XMP/EXPO，否则白白浪费上百元的内存高频性能！',
    tags: ['必开设置', '装机关键', 'BIOS'],
  },
  {
    id: 'term-cudimm',
    term: 'CUDIMM 内存与 CKD 时钟驱动芯片',
    alias: ['CUDIMM', 'CKD', 'DDR5 8400', '新一代内存'],
    category: 'motherboard',
    shortDesc: '在内存条自带微型时钟缓冲芯片（CKD），大幅消灭信号抖动，轻松突破 8000~9200 MT/s。',
    fullExplanation:
      '传统 UDIMM 内存的高频信号直接受 CPU 内存控制器驱动，受主板走线物理干扰严重，突破 7600MHz 极难稳定。CUDIMM (Clocked Unbuffered DIMM) 在 PCB 核心中央加装了一颗 CKD 客户端时钟驱动芯片，在本地重新锁相放大时钟信号，使高速 DDR5 频率轻松挺进 8400~9000MHz+。',
    buyingAdvice:
      '搭配 Intel Z890 / B860 及后续平台可优先选购 CUDIMM 套条，高频超频稳定性跨代提升。',
    tags: ['前沿黑科技', '极限超频', 'DDR5'],
  },
  {
    id: 'term-ram-timing-cl',
    term: '内存时序 (CAS Latency / CL & 小参)',
    alias: ['CL30', 'CL36', '小参', '延迟', 'tRCD', 'tRP'],
    category: 'motherboard',
    shortDesc: '内存接收指令到输出数据之间的等待延迟周期数，数字越小，响应速度越快。',
    fullExplanation:
      '常见标识如 `DDR5 6000 CL30-36-36-76`，其中第一个数字 CL30 代表列寻址选通脉冲延迟。相同 6000MHz 下，CL30 的实际物理响应时间（约 10ns）显著优于 CL36 或 CL40，在吃内存延迟的竞技游戏（如绝地求生、永劫无间、CS2）中 1% Low 帧表现更好。',
    buyingAdvice:
      'DDR5 选购黄金法则：认准海力士 A-die / M-die 颗粒的 6000MHz CL30 或 6400MHz CL32 套条，稳定且体质优秀。',
    tags: ['内存参数', '低延迟', '颗粒'],
  },
  {
    id: 'term-dual-channel',
    term: '双通道内存法则 (Dual Channel 必须插 2、4 槽)',
    alias: ['插槽2/4', '双通道法则', '1-3槽 vs 2-4槽', '内存插法'],
    category: 'motherboard',
    shortDesc: '两条内存同时并联读写，位宽从 64-bit 翻倍为 128-bit，带宽直接翻倍！',
    fullExplanation:
      '四槽主板从 CPU 往右数通常为 1、2、3、4 槽。主板走线大多采用 Daisy-Chain (菊花链) 拓扑，末端的第 2 和第 4 槽位信号完整度最好、反射杂波最少。插在 2 和 4 槽才能最稳定开启高频双通道。',
    buyingAdvice:
      '【装机铁律】：宁买两根 16G 组双通道，绝不买单根 32G 单通道！插主板务必认准 2 和 4 槽！',
    tags: ['装机必看', '插槽顺序', '带宽翻倍'],
  },
  {
    id: 'term-fclk-gear',
    term: 'AMD FCLK 总线与 Intel Gear 1/2 模式',
    alias: ['FCLK', 'Gear 1', 'Gear 2', '甜点频率', '分频'],
    category: 'motherboard',
    shortDesc: '内存控制器与 CPU 核心时钟的同步倍率，一旦分频延迟暴增，得不偿失。',
    fullExplanation:
      'AMD Ryzen 7000/9000 采用小芯片（Chiplet）设计，CPU 核心与内存控制器通过 Infinity Fabric 总线连接。FCLK 甜点频率为 2000MHz，对应 DDR5-6000 (1:1 同频最佳延迟)。如果盲目买 DDR5-7200，内存控制器会被迫切换到 1:2 分频，延迟剧烈增加，游戏反而掉帧。',
    buyingAdvice:
      'AMD AM5 平台最甜点内存频率就是 6000MHz CL28/CL30，不要花冤枉钱买 7200MHz+ 高频条！',
    tags: ['AMD', '延迟优化', '装机避坑'],
  },
  {
    id: 'term-vrm-phases',
    term: '主板供电相数与 DrMOS (VRM 核心供电)',
    alias: ['供电相数', '电压调节模块', '倍相', '并联', 'DrMOS'],
    category: 'motherboard',
    shortDesc: '把电源输入的 12V 高压降压转化为 CPU 核心所需 1.2V 纯净低压的“发动机组”。',
    fullExplanation:
      '相数越多，各相 MOS 管分摊的电流越小，发热越低，电压波纹越平稳。优质主板采用一体化封装的 DrMOS (Driver + MOSFET)，单颗承载能力可达 60A~110A，即使带动高功耗 i7/i9 也不会出现供电过热降频。',
    buyingAdvice:
      '带 i5/7500F 级别 8~10 相即可；带 i7/i9/9950X 建议选 12+1+1 相以上且带有厚实金属散热鳍片的主板。',
    tags: ['主板做工', '超频稳定', '散热马甲'],
  },
  {
    id: 'term-bios-flashback',
    term: '无 CPU 盲刷 BIOS (BIOS Flashback)',
    alias: ['Flashback', '免CPU刷BIOS', '一键救砖'],
    category: 'motherboard',
    shortDesc: '无需安装 CPU、内存和显卡，只插主板供电和 U 盘就能一键升级 BIOS 点亮新 CPU。',
    fullExplanation:
      '新上市的 CPU 往往需要新版本 BIOS 才能点亮。如果买到出厂老库存主板，以前必须借一颗旧 CPU 才能进系统更新。而配备 BIOS Flashback 按键的主板，只需将改名后的固件拷入 FAT32 U 盘插在专用孔上，长按按键 3 秒即自动刷入，防翻车救砖神器。',
    buyingAdvice:
      '购买跨代支持的新平台主板（如 B650 配 9800X3D），强烈建议挑选后置面板带 Flashback 实体按键的主板。',
    tags: ['主板功能', '装机救砖', '防翻车'],
  },
  {
    id: 'term-rebar',
    term: 'Resizable BAR (智能显存访问 / SAM)',
    alias: ['ReBAR', 'Smart Access Memory', 'SAM', '显存直通'],
    category: 'motherboard',
    shortDesc: '打破 CPU 每次只能访问 256MB 显存的传统限制，让 CPU 自由全盘读取显存。',
    fullExplanation:
      '在传统的 32 位寻址遗留规范中，CPU 每次只能透过一个 256MB 的小窗口向显存传递数据。开启 Resizable BAR 后，CPU 可以一次性全盘访问全部 16GB/24GB 显存，消灭纹理交换瓶颈，在绝大多数现代游戏中能白嫖 5%~15% 的帧率提升。',
    buyingAdvice:
      '装完电脑进主板 BIOS 必须确认开启【Above 4G Decoding】和【Re-Size BAR Support】。',
    tags: ['必开设置', '免费提升', '显存加速'],
  },
  {
    id: 'term-wifi7-25g',
    term: 'Wi-Fi 7 与 2.5G 电竞网口',
    alias: ['Wi-Fi 7', '2.5GbE', '320MHz频宽', '低延迟无线'],
    category: 'motherboard',
    shortDesc: '现代主板标配的高速网络通道：Wi-Fi 7 带来 320MHz 超宽频与极低无线抖动，2.5G 跑满千兆 NAS。',
    fullExplanation:
      'Wi-Fi 7 引入了 MLO (多链路聚合) 技术，允许设备同时连接 5GHz 和 6GHz 双频段，彻底解决游戏无线网络偶发跳 Ping 的痼疾；板载 2.5G 千兆网口则使局域网 NAS 传输速度从 110MB/s 飙升至 280MB/s。',
    buyingAdvice:
      '家庭没有布网线或习惯用无线的玩家，建议直接加几十元选购板载 WIFI 7 / WIFI 6E 的主板版本。',
    tags: ['网络', '电竞', '主板接口'],
  },

  // ========================================================
  // 固态硬盘与存储核心概念
  // ========================================================
  {
    id: 'term-nvme-pcie',
    term: 'NVMe 与 PCIe 4.0/5.0 固态协议',
    alias: ['固态硬盘协议', 'M.2通道', 'PCIe 4.0', 'PCIe 5.0'],
    category: 'storage',
    shortDesc: '专为极速闪存定制的直通 CPU 高速传输协议，速度数十倍于老旧 SATA 机械盘。',
    fullExplanation:
      'SATA 固态上限仅 550MB/s；PCIe 3.0 NVMe 上限约 3500MB/s；主流 PCIe 4.0 NVMe 上限约 7450MB/s；最新的 PCIe 5.0 固态可达 14000MB/s（但发热极高需风扇主动散热）。',
    buyingAdvice:
      '普通用户与电竞玩家首选成熟的 PCIe 4.0 TLC 固态（如致态 TiPlus7100 / 三星 990 PRO），PCIe 5.0 目前性价比低且发热过大。',
    tags: ['固态协议', '极速读取', '接口'],
  },
  {
    id: 'term-tlc-qlc',
    term: '原厂 3D TLC vs QLC (闪存颗粒防坑秘籍)',
    alias: ['TLC', 'QLC', '黑片', '白片', '大号U盘', '擦写寿命'],
    category: 'storage',
    shortDesc: 'TLC 每个单元存储 3bit 数据，寿命与缓外速度碾压 4bit 的 QLC 颗粒。',
    fullExplanation:
      'TLC (Triple-Level Cell) 擦写寿命约 1000~3000 次，缓外写入速度快；QLC (Quad-Level Cell) 写入寿命仅约 300~500 次，且当大文件写满模拟 SLC 缓存后，缓外真实写入速度甚至会断崖式暴跌到 50MB/s（比机械硬盘还慢）。',
    buyingAdvice:
      '【选购铁律】：选购固态硬盘务必认准【原厂 3D TLC 颗粒】，坚决避开把 QLC 当好盘卖、或者用不知名黑片的小杂牌。',
    tags: ['避坑指南', '颗粒寿命', 'SSD'],
  },
  {
    id: 'term-dram-cache-hmb',
    term: '独立 DRAM 缓存 vs HMB (主机内存缓冲)',
    alias: ['DRAM缓存', 'HMB', '无缓盘', '全盘映射'],
    category: 'storage',
    shortDesc: '有独立缓存的盘高负荷小文件寻址更强，而无缓盘利用 HMB 借用系统内存性价比极高。',
    fullExplanation:
      '高性能旗舰盘（如三星 990 Pro / 致态 TiPro7000）板载独立 LPDDR4 缓存芯片，专门存放全盘 FTL 映射表，在极端重度写入时不掉速；而性价比盘（如致态 TiPlus7100）采用 HMB (Host Memory Buffer) 技术借用电脑主内存 64MB 存放映射表，日常游戏使用体验几乎毫无差异且发热更低。',
    buyingAdvice:
      '纯日常与电竞打游戏，支持 HMB 的无缓盘性价比极高且发热更低；做专业 4K 剪辑与大工程渲染建议选带独立 DRAM 缓存的旗舰盘。',
    tags: ['SSD技术', '缓存', '选购对比'],
  },
  {
    id: 'term-slc-cache',
    term: '模拟 SLC 缓存与缓外断崖掉速',
    alias: ['SLC Cache', '缓外速度', '全盘模拟SLC'],
    category: 'storage',
    shortDesc: 'SSD 将部分 TLC 颗粒模拟成单比特极速写入，一旦写满缓存就会被打回原形暴露真实慢速。',
    fullExplanation:
      '为了跑出好看的连续写入成绩，固态主控会在空闲空间开辟几十到上百 GB 的“模拟 SLC 缓存”，在此区间写入速度高达 5000MB/s。但一口气写入 200GB 超大文件时，缓存耗尽主控必须边搬运数据边写入，就会出现“缓外掉速”。优质原厂盘缓外仍有 1500MB/s+，劣质盘直接跌到 100MB/s。',
    buyingAdvice:
      '挑选固态硬盘不能只看店铺详情页标称的“最高写入速度”，一定要查阅评测里的【缓外真实写入速度】。',
    tags: ['SSD真相', '掉速', '主控算法'],
  },
  {
    id: 'term-4k-random-iops',
    term: '4K 随机读写 (IOPS 吞吐量)',
    alias: ['4K随机', 'IOPS', '系统开机速度', '软件响应'],
    category: 'storage',
    shortDesc: '决定 Windows 系统流畅度、开机秒进与软件秒开的核心指标，比连续读写更重要。',
    fullExplanation:
      '连续读写速度（如 7000MB/s）只在拷电影等大文件时生效。而操作系统和游戏日常运行是由海量 4KB 的零碎碎文件构成的。4K 单队列随机读取速度（4K QD1 Read，通常在 70~90MB/s）越高，系统点击任何图标越有“指哪打哪”的瞬间响应感。',
    buyingAdvice:
      '做系统盘时，认准 4K 随机读取性能优秀的知名大厂原厂主控与闪存颗粒。',
    tags: ['系统盘', '流畅度', 'IOPS'],
  },

  // ========================================================
  // 电源与电气规范
  // ========================================================
  {
    id: 'term-atx3-12v2x6',
    term: 'ATX 3.1 规范与 12V-2x6 显卡接口',
    alias: ['16Pin', '12VHPWR', '12V-2x6', '防烧接口', 'ATX3.1'],
    category: 'psu',
    shortDesc: '专为次世代显卡大功率瞬态爆发设计的电源新标准，防呆插头大幅改善烧卡隐患。',
    fullExplanation:
      '上一代 12VHPWR 16Pin 接口由于感应针脚过短，一旦玩家没完全插紧就会打火烧毁接口。改良后的 ATX 3.1 采用 12V-2x6 接口：缩短感应针（没插紧直接不通电自保）并加长导电铜端子，彻底解决烧卡隐患，并能承受 200% 瞬时峰值动态冲击。',
    buyingAdvice:
      '新配中高端主机强烈建议认准标配 ATX 3.0/3.1 原生 16Pin 线的金牌全模组电源，严防用老旧转接线。',
    tags: ['电源安全', '防烧卡', '接口规范'],
  },
  {
    id: 'term-80plus-cybenetics',
    term: '80 PLUS 与 Cybenetics 电源能效认证',
    alias: ['80Plus金牌', '白金牌', '钛金', 'Cybenetics', '转换效率'],
    category: 'psu',
    shortDesc: '衡量电源将 220V 交流电转换为电脑直流电时浪费了多少电能与热量的认证等级。',
    fullExplanation:
      '80 PLUS 金牌要求在 50% 典型负载下转换效率达到 90% 以上，浪费的热量更少、电源风扇更静音。新型 Cybenetics 认证除了测试多达数千种负载点的综合效率（ETA）外，还对电源风扇全工况噪音进行了严苛分级（LAMBDA），权威度更高。',
    buyingAdvice:
      '主流装机闭眼选【80 PLUS 金牌认证】或【Cybenetics Gold】以上电源，杂牌白牌或虚标“红牌”切勿碰。',
    tags: ['能效', '省电', '静音认证'],
  },
  {
    id: 'term-single-multi-12v',
    term: '单路 12V vs 多路 12V 供电设计',
    alias: ['单路12V', '多路12V', '过流保护', 'OCP触发'],
    category: 'psu',
    shortDesc: '单路 12V 将全部电量汇聚在一起供显卡和 CPU 自由调用，避免大显卡瞬时过流误关机。',
    fullExplanation:
      '多路 12V 针对每条供电线设置了严格的过流断电保护阈值（OCP），在面对 RTX 30/40/50 时代显卡瞬间微秒级翻倍的瞬态脉冲时，极易因触碰单路阈值而莫名黑屏断电。因此现代高端电源普遍采用单路 12V 大电流设计，给显卡最宽裕的爆发余量。',
    buyingAdvice:
      '搭配 70 级别以上大显卡时，优先选择单路 12V 输出能力占比达到 100% 的高品质电源。',
    tags: ['电源架构', '防断电', '显卡供电'],
  },
  {
    id: 'term-modular-cable-danger',
    term: '模组线防混插高危警示 (混插直接烧硬盘/主板)',
    alias: ['模组线混插', '定制线烧盘', '线序陷阱'],
    category: 'psu',
    shortDesc: '不同品牌甚至同品牌不同批次电源的模组线绝对不可混用！线序不同通电瞬间烧毁硬件！',
    fullExplanation:
      '模组电源插头在接入硬件的那一端（主板、显卡、SATA）符合行业标准，但电源外壳那一侧的接口定义和引脚线序没有任何国家统一标准！海韵、海盗船、振华、长城的线序往往完全不同。一旦将 A 电源的 SATA 线插进 B 电源，12V 电压可能会直接通入 5V 引脚，瞬间烧穿并冒烟报废机械硬盘与主板！',
    buyingAdvice:
      '【终极保命铁律】：换新电源时，必须把老电源附带的所有线缆全部拔下换新，严禁留用老模组线！',
    tags: ['高危陷阱', '装机必看', '翻车烧件'],
  },

  // ========================================================
  // 散热与机箱风道
  // ========================================================
  {
    id: 'term-peel-film-warning',
    term: '终极警示：散热器底座与 M.2 散热片“撕膜”',
    alias: ['请撕此膜', '撕膜警告', '大火炉', '90度降频', '未撕膜'],
    category: 'cooling',
    shortDesc: '装机新手最常见的“翻车第一名”：忘记撕下散热器底座纯铜面或主板导热垫上的透明保护膜！',
    fullExplanation:
      '散热器出厂时为了防氧化划伤，底座会贴有一层写着“WARNING: PLEASE REMOVE BEFORE USE”的透明塑料膜。如果没撕就抹上硅脂扣在 CPU 上，塑料膜会变成绝热层，开机瞬间飙到 100°C 蓝屏降频！同理，主板自带的 M.2 固态散热马甲背面的导热贴双面也有透明保护膜，盖上前必须全部撕干净。',
    buyingAdvice:
      '【刻进脑海】：装散热器前、扣固态马甲前，第一动作是用指甲抠一下膜撕了没有！',
    tags: ['装机必踩坑', '新手警告', '翻车第一名'],
  },
  {
    id: 'term-water-cooling-aio',
    term: '一体式水冷 (AIO 240/360) 与排气走法',
    alias: ['水冷', '240冷排', '360水冷', '漏液包赔', '水泵异响'],
    category: 'cooling',
    shortDesc: '利用冷头微水道和水泵将热量输送至机箱边缘的铝制冷排，通过大面积风扇迅速吹散。',
    fullExplanation:
      '360 水冷（3 个 12cm 风扇）解热面积远超风冷，适合压制满载 250W+ 的高端 i7/i9 处理器。安装时最忌讳将冷排装在机箱底部而冷头高于冷排，因为水冷内部的微量空气气泡会顺着浮力聚集在冷头水泵处导致干转空磨发热损坏。冷排应优先装在机箱顶部（顶部排风）。',
    buyingAdvice:
      '选择水冷务必挑选支持“全额漏液包赔”（含受损硬件折旧赔偿）的知名大厂，如利民、瓦尔基里、雅浚、追风者。',
    tags: ['水冷安装', '漏液保障', '高温压制'],
  },
  {
    id: 'term-phase-change-pad',
    term: '相变导热片 (PTM7950) vs 传统硅脂',
    alias: ['PTM7950', '相变片', '硅脂', '泵出效应', '长效导热'],
    category: 'cooling',
    shortDesc: '常温下为固体薄片安装极方便，达到 45°C 融化为液态高导热层，彻底杜绝硅油干涸与泵出。',
    fullExplanation:
      '高性能笔记本与高功耗 CPU/GPU 长期反复冷热交替，传统液态硅脂中的硅油会被热膨胀挤出核心（泵出效应），导致 3~6 个月后温度急剧恶化。霍尼韦尔 PTM7950 相变材料在 45°C 发生固液相变，填补纳米微隙且表面张力极高不会流出，寿命可达数年无需频繁拆机换硅脂。',
    buyingAdvice:
      '笔记本清灰换硅脂、或显卡翻新压温强烈推荐直接上霍尼韦尔 PTM7950 相变片；台式机常规可选用利民 TF7 / 信越 7921。',
    tags: ['导热材料', '笔记本压温', '黑科技'],
  },
  {
    id: 'term-air-flow-pressure',
    term: '机箱风道设计：正压差 vs 负压差防尘法则',
    alias: ['正压差', '负压差', '机箱风道', '前进后出', '防尘'],
    category: 'cooling',
    shortDesc: '进风量大于出风量为“正压差”，所有缝隙向外吹风，有效阻挡外界灰尘灌入。',
    fullExplanation:
      '经典风道为“前进后出、下进上出”。如果进风扇数量或转速总风量大于出风扇（正压差），机箱内部微弱增压，缝隙只会往外排气，灰尘只能从带有防尘网的进风口过滤；若出风大于进风（负压差），机箱将变成吸尘器，从所有无滤网缝隙吸入大量毛屑。',
    buyingAdvice:
      '组装海景房或多风扇机箱时，尽量保证进风风扇数量略多于出风风扇，保持机箱微正压差以大幅减少积灰频率。',
    tags: ['风道规划', '机箱防尘', '静音'],
  },

  // ========================================================
  // 显示器与电竞视觉
  // ========================================================
  {
    id: 'term-screen-panel',
    term: 'OLED / Mini-LED / Fast-IPS 屏幕面板',
    alias: ['屏幕材质', '高刷', '色域', '响应时间', 'OLED', 'Mini-LED'],
    category: 'display',
    shortDesc: '显示器核心面板技术：OLED 纯黑对比度极强，Mini-LED 亮度极高，Fast-IPS 综合最护眼稳定。',
    fullExplanation:
      'OLED 像素级自发光，响应时间仅 0.03ms，黑场绝对纯黑，但有烧屏风险；Mini-LED 采用数千颗微型 LED 分区背光，HDR 亮度高达 1400nits+；Fast-IPS 技术成熟寿命长，无烧屏烦恼，是主流电竞游戏的主力。',
    buyingAdvice:
      '重度长时间打字办公选 Fast-IPS；追求极致 HDR 观影与 3A 沉浸感选 Mini-LED；竞技电竞发烧友选高刷 OLED。',
    tags: ['屏幕素质', '色彩对比', '护眼'],
  },
  {
    id: 'term-vrr-gsync',
    term: 'VRR / G-Sync / FreeSync 可变刷新率技术',
    alias: ['G-Sync', 'FreeSync', 'VRR', '防撕裂', '垂直同步'],
    category: 'display',
    shortDesc: '让显示器刷新率动态跟随显卡实际帧率实时变动，从物理上消灭画面撕裂和卡顿感。',
    fullExplanation:
      '传统显示器以固定的 60Hz 或 144Hz 扫描，若显卡跑出 82 帧，前后两帧在同一扫描周期重叠就会出现水平撕裂线；开启垂直同步又会引入高达几十毫秒的操作输入延迟。VRR 技术让显卡画出一帧显示器才刷新一帧，画面丝滑如丝绸且输入零延迟。',
    buyingAdvice:
      '买电竞显示器必须认准支持【G-Sync Compatible】或【AMD FreeSync Premium】，在驱动控制面板中勾选开启。',
    tags: ['电竞必备', '丝滑流畅', '防撕裂'],
  },
  {
    id: 'term-color-gamut-deltae',
    term: '色域覆盖 (sRGB / DCI-P3) 与色准 Delta E',
    alias: ['色域', 'Delta E', 'sRGB', 'DCI-P3', '校色', '专业设计'],
    category: 'display',
    shortDesc: '色域决定显示器能展现出多么鲜艳的自然色彩，Delta E < 2 代表肉眼分辨不出偏色。',
    fullExplanation:
      'sRGB 是 Windows 系统与绝大部分互联网网页的标准色彩空间；DCI-P3 是好莱坞数字影院标准，绿色与红色表现更饱满鲜活。Delta E (ΔE) 是色彩偏离标准值的误差量，ΔE < 2 已达到专业印前与影视后期调色水准。广色域显示器若无 sRGB 色彩缩限模式在 Windows 下容易饱和度过高造成人脸过红泛光。',
    buyingAdvice:
      '摄影修图与影视剪辑认准 100% sRGB + 95% DCI-P3 广色域，且出厂自带原厂校色报告（ΔE < 2）的显示器。',
    tags: ['色彩还原', '修图剪辑', '显示器参数'],
  },
];
