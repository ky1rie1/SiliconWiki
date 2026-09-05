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
    id: 'term-3d-vcache-gen2',
    term: '3D V-Cache 第二代反向堆叠工艺 (下置大缓存技术)',
    alias: ['第二代3D缓存', '下置缓存', '反向堆叠', 'CCD倒装', '9800X3D架构'],
    category: 'cpu',
    shortDesc: 'AMD 9800X3D 首创将 64MB SRAM 缓存下置于计算核心底部，让发热的核心直接贴合散热顶盖，彻底打破 X3D 积热与超频枷锁。',
    fullExplanation:
      '在初代 5800X3D 和 7800X3D 上，64MB 的 3D V-Cache 硅片是堆叠在 CPU 计算核心（CCD）之上的。SRAM 晶圆导热系数较低，如同一层“隔热毯”覆盖在发热核心上方，导致热量难以及时传导给散热器，因此官方限制了运行电压与主频并锁死超频。而在第二代 3D V-Cache (Ryzen 7 9800X3D) 中，AMD 实现了颠覆性的结构倒置：将 64MB 缓存晶圆垫在底层，发热的 Zen 5 核心晶片放置在最顶层，直接通过导热材料贴合金属顶盖。不仅导热效率数倍跃升、积热彻底解决，更首次完全解锁全核自由超频，让游戏神 U 能在 5.4GHz+ 全核高频下稳定运行。',
    buyingAdvice:
      '这是 9800X3D 相比前代最根本的底层技术质变。不仅 1% Low 帧更坚挺，普通百元双塔风冷即可轻松吹透，彻底摆脱必须上昂贵 360 水冷的焦虑。',
    tags: ['AMD', '9800X3D', '3D缓存', '倒装工艺', '超频'],
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
    tags: ['显卡接口', 'PCIe带宽', '老电脑升级'],
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
    term: 'CUDIMM (时钟驱动器高频无缓冲内存)',
    alias: ['CUDIMM', 'CKD', 'Clocked Unbuffered DIMM', 'DDR5 8400+', '时钟驱动器内存'],
    category: 'motherboard',
    shortDesc: '在内存条 PCB 原生集成 CKD 时钟驱动芯片，突破 CPU 内存控制器信号衰减瓶颈，轻松冲击 8400~9600 MT/s 极限高频。',
    fullExplanation:
      '随着 DDR5 频率突破 7000MT/s，主板到 CPU 内存控制器（IMC）之间的时钟信号抖动剧烈。JEDEC 标准制定的 CUDIMM (Clocked Unbuffered DIMM) 在每根内存条 PCB 正中央增加了一颗微型 CKD (Client Clock Driver) 缓冲芯片，对输入时钟信号进行本地相位锁定 (PLL) 与整形放大。这极大减轻了 CPU 内存控制器的电气负载，使台式机在普通风冷环境下即可达成 8400MT/s、9200MT/s 乃至破万兆的高频稳定运行。当系统处于低频启动或未开启 XMP/EXPO 时，CKD 芯片可旁路运行，向下兼容普通 DDR5 插槽。',
    buyingAdvice:
      '搭配 Intel 酷睿 Ultra 200S (Z890 主板) 或高端 AMD X870E/B650 主板冲击 8000MHz+ 极速频宽首选；对于普通电竞玩家，DDR5 6000~6400MHz 普通条依然是高性价比甜点。',
    tags: ['前沿黑科技', '极限超频', 'DDR5', 'CKD', 'Z890'],
  },
  {
    id: 'term-camm2',
    term: 'CAMM2 (下一代压缩附加内存模块)',
    alias: ['CAMM2', 'LPCAMM2', '超薄贴片内存', '双通道单条', '笔记本内存革命'],
    category: 'motherboard',
    shortDesc: '取代服役近 25 年的传统 SO-DIMM 插槽的全新超薄、单片双通道内存规范，走线更短、厚度减半、频率更高。',
    fullExplanation:
      '传统笔记本 SO-DIMM 插槽厚度大、金手指接触点长，随着频率超过 6400MT/s 信号反射衰减极难克服。JEDEC 确立的 CAMM2 标准采用微型压缩贴片式螺丝锁固结构。单张 CAMM2 模块直接引出 128-bit 完整双通道，走线长度缩短 60% 以上，不仅支持标准 DDR5，更能直接搭载功耗更低、频率高达 7500~8533 MT/s 的 LPDDR5X (LPCAMM2)。厚度较传统插槽降低 57%，极大释放了轻薄本内部电池与散热空间，且依然保留了后期自行拆卸升级的自由度。台式机主板也已推出无遮挡 CAMM2 板型，消灭与风冷散热器的相互干涉。',
    buyingAdvice:
      '选购高端轻薄本与便携工作站时，LPCAMM2 兼备了板载焊死内存的高频省电与独立插槽的自由可扩容性，是未来 5 年笔电内存的演进方向。',
    tags: ['前沿标准', 'LPCAMM2', '笔记本内存', '双通道', '厚度减半'],
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
    id: 'term-pcie5-ssd-thermal',
    term: 'PCIe 5.0 SSD 散热与降频机制 (14GB/s 极限高温防撞墙)',
    alias: ['PCIe 5.0固态', '热节流', 'Thermal Throttling', '主动风冷马甲', '高温掉速'],
    category: 'storage',
    shortDesc: 'PCIe 5.0 固态读写高达 14,000MB/s，主控发热达 11~14W 极易撞上 85°C+ 保护性断崖掉速，必须配备纯铜热管或主动涡轮风冷。',
    fullExplanation:
      'PCIe 5.0 x4 NVMe SSD（采用群联 E26、慧荣 SM2508 等旗舰主控）将顺序读写速率推至 14GB/s 极限。极高数据吞吐使微小裸晶主控的发热量达到惊人的 11W~14W。若仅使用主板附带的普通薄铝片散热装甲，连续全速写入 1~2 分钟温度即飙升至 85°C~90°C，主控会触发强制 Thermal Throttling（热节流降频保护），读写速度瞬间腰斩至数百 MB/s 甚至掉盘断联。因此 PCIe 5.0 固态出厂普遍标配多层高塔散热鳍片、纯铜热管甚至自带微型主动静音涡轮风扇，对机箱内部风道提出极高要求。',
    buyingAdvice:
      '普通游戏电竞与日常办公选 PCIe 4.0 TLC（如致态 TiPlus7100 / 三星 990 PRO）发热极低且感知毫无差别；重度影视后期导片与大模型加载选 PCIe 5.0 盘时，务必挑选自带强力热管或主动风冷马甲的型号。',
    tags: ['PCIe 5.0', 'SSD散热', '热节流', '降频保护', '主动风冷'],
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
    term: 'ATX 3.1 12V-2x6 改进型微动感应引脚 (防烧卡新标准)',
    alias: ['12V-2x6', 'ATX 3.1', '12VHPWR改进版', '防烧头', '微动引脚', 'Sense Pin', '16Pin'],
    category: 'psu',
    shortDesc: '全面替换曾引发多起熔毁烧卡事故的 12VHPWR，通过缩短信号针脚实现“未插紧即断电”，从根本上消灭接触不良过热。',
    fullExplanation:
      '初代 12VHPWR (ATX 3.0 16-pin) 在 RTX 4090 上多次发生插头熔毁烧蚀，根本原因在于插头稍有松动倾斜时，4 根信号针依然能连通闭合，而此时个别大电流供电端子因接触电阻过大产生剧烈积热。PCI-SIG 组织制定的 ATX 3.1 规范彻底改版为 12V-2x6 标准：将 12 根主供电纯铜端子向外延长 0.25mm，并将 4 根 Sense 信号检测针向内缩回 1.7mm。这一反向差值构造形成了硬件级物理微动联锁——若用户未用尽全力将插头推入到底，信号检测针根本无法触碰闭合，显卡直接拒绝供电开机，从物理底层彻底消灭了“虚接通电导致的打火起火烧卡”风险。',
    buyingAdvice:
      '2025~2026 年新装机、尤其是搭配 RTX 4070Ti Super / 4080 Super / 5080 / 5090 等高功耗显卡，电源务必认准【ATX 3.1 / 12V-2x6】原生认证，尽量避免使用老旧分接转接线。',
    tags: ['电源安全', 'ATX 3.1', '12V-2x6', '防烧卡', '微动引脚'],
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

  // ========================================================
  // 进阶装机工艺、超频与电气原理全量扩展 (75+ 硬核词库)
  // ========================================================
  {
    id: 'term-thermal-paste-pattern',
    term: '硅脂涂抹法 (九点法 / X字法 / 刮刀薄涂)',
    alias: ['硅脂涂抹', '九点法', 'X法', '硅脂压平', '导热硅脂'],
    category: 'cooling',
    shortDesc: '散热器扣紧时依靠压力将硅脂均匀挤开填补微观金属坑洼，科学手法避免产生封闭气泡阻隔导热。',
    fullExplanation:
      'CPU 顶盖和散热底座肉眼看起来平整，微观下充满凹凸不平的金属沟壑。空气的导热系数极低（约 0.026 W/mK），硅脂的作用是排出空气填补间隙。在 LGA1700 长方形顶盖推荐【X字法+四角补点】或【九点法】；AM5 正方形顶盖推荐【五点梅花法】或中心米粒大小。散热器螺丝对角交叉拧紧时，强大下压力会把硅脂自然扩散成极薄均匀层。',
    buyingAdvice:
      '新手切忌“涂越多越好”！硅脂过厚反而增加热阻。只要涂装分布均匀，普通高导热硅脂（如信越 7921、利民 TF7、霍尼韦尔 7950）完全足够，无需冒险使用有导电短路风险的液金。',
    tags: ['装机实操', '散热工艺', '硅脂避坑'],
  },
  {
    id: 'term-anti-bending-frame',
    term: 'CPU 防弯扣具 (Contact Frame 接触压力均匀框)',
    alias: ['防弯扣具', 'LGA1700防弯', '利民防弯扣具', '顶盖变形'],
    category: 'cooling',
    shortDesc: '替换主板自带的单侧杠杆扣具，消除中央下压应力，防止长方形 CPU 弯曲变形导致散热器接触悬空。',
    fullExplanation:
      'Intel 12/13/14 代长方形插槽（LGA1700）原厂 ILM 扣具仅从中央两侧下压，长期锁紧会导致 CPU 中间微凸或下凹，甚至主板背面弯曲。安装铝合金 CNC 防弯扣具后，下压力被均匀分散在 CPU 四条边框四周，顶盖保持绝对平整，使水冷/风冷底座完全贴合，通常可降低满载核心温度 3°C ~ 8°C。',
    buyingAdvice:
      '搭配 Intel i7/i9 高发热处理器的装机强力推荐花 20~30 元加装第三方防弯扣具；拆原装扣具时务必保存好螺丝与原装卡扣以备官方保修。',
    tags: ['Intel必备', '防弯扣具', '降温神器'],
  },
  {
    id: 'term-undervolting-co',
    term: 'Curve Optimizer 负压降压超频 (PBO 曲线优化)',
    alias: ['降压超频', 'Curve Optimizer', '负压超频', 'PBO2', '降温提频'],
    category: 'cpu',
    shortDesc: '在保证系统绝对稳定的前提下调低电压，让 CPU 在功耗和温度墙限制内冲上更高的加速频率。',
    fullExplanation:
      '出厂时芯片厂商为保证百万颗体质差异的晶圆都能点亮，默认预设了较为保守的偏高电压。偏高电压会导致发热骤增并更快撞到 85°C/95°C 温度墙而降频。通过在 BIOS 中启用 AMD Curve Optimizer (全核 Negative -15 ~ -30) 或 Intel 动态电压偏移 (Offset -0.05V)，在减少废热的同时，睿频算法会在相同发热余量下维持更持久的高频。',
    buyingAdvice:
      '现代 CPU 传统“加压拉倍频”收益极低且发热爆炸，【降压防降频】才是主流高手的最优解。设置完后需运行 Cinebench R23 和 CoreCycler 烤机验证防蓝屏。',
    tags: ['超频技巧', '降温', 'PBO优化'],
  },
  {
    id: 'term-delidding',
    term: 'CPU 开盖换液态金属 (Delidding)',
    alias: ['开盖', '换液金', '纯铜顶盖', '直接裸晶散热'],
    category: 'cpu',
    shortDesc: '剥除 CPU 顶盖与芯片核心之间的原厂钎焊/硅脂，直接使用液金或直触水冷头压榨极限温度。',
    fullExplanation:
      '极端发烧友使用专用开盖夹具剥离金属 IHS 顶盖，清除原厂铟钎焊层，将导热系数高达 73 W/mK 的液态金属直接涂抹在裸露硅晶片（Die）上，再配合直接裸晶水冷头（Direct Die Frame）。此操作能带来 10°C ~ 18°C 的惊人降温。',
    buyingAdvice:
      '开盖将彻底失去官方保修，且液态金属具有强导电性与铝腐蚀性，一旦溢出必烧主板，仅适合极限跑分玩家，日常家用切勿轻易尝试！',
    tags: ['极限玩家', '高危操作', '开盖换液金'],
  },
  {
    id: 'term-coil-whine',
    term: '显卡与电源啸叫 (Coil Whine 封闭电感高频共振)',
    alias: ['显卡啸叫', '电感啸叫', '高频滋滋声', 'Coil Whine'],
    category: 'gpu',
    shortDesc: '高帧率或瞬时大电流通过供电滤波电感线圈时，产生的磁致伸缩机械微震动高频杂音。',
    fullExplanation:
      '当游戏帧率飙升至数百帧（如游戏大厅菜单 500+ FPS）或显卡满载瞬态电流极大变化时，供电回路中的封闭电感磁芯发生微观伸缩，发出像蟋蟀叫声或刺耳高频“滋滋”声。这属于物理声学现象，不影响硬件寿命与性能，也不是硬件损坏故障。',
    buyingAdvice:
      '在显卡驱动或游戏中开启【帧率上限限制】（如锁定为显示器刷新率 144/165 FPS）可显著消除大部分菜单啸叫；选用高品质日系低内阻电解电容的 ATX 3.1 电源也能有效抑制谐波。',
    tags: ['硬件杂音', '电感共振', '避坑妙招'],
  },
  {
    id: 'term-vapor-chamber',
    term: '均热板 VC (Vapor Chamber) vs 热管直触 (DTH)',
    alias: ['均热板', 'VC均热板', '热管直触', 'DTH', '纯铜镀镍底座'],
    category: 'cooling',
    shortDesc: '均热板是二维扁平真空微沸腾相变腔体，能将 GPU 核心与周边显存热量瞬间拉平扩散至整个散热鳍片。',
    fullExplanation:
      '热管直触 (Direct Touch) 虽省成本，但热管之间存在微小缝隙，且热量仅能沿一维轴向传递，容易出现核心局部热点（Hotspot）；均热板（VC）内部为真空毛细网孔并灌注微量去离子纯水，受热沸腾蒸发迅速向整个二维平面均匀扩散冷凝，导热均匀度比纯铜块高数倍，极大压制热点温差。',
    buyingAdvice:
      '选购 RTX 4070 Ti Super / 4080 Super 及以上高功耗旗舰显卡时，优先选择配备【大面积镀镍 VC 均热板】的型号，长期满载更静音低温。',
    tags: ['均热板', '旗舰散热', '温度控制'],
  },
  {
    id: 'term-gpu-bracket',
    term: '显卡防下垂支架 (Anti-Sag Bracket / 金手指防断裂)',
    alias: ['显卡支架', '防下垂支架', '金手指裂开', 'PCB弯折'],
    category: 'gpu',
    shortDesc: '支撑重达 2kg+ 的三槽厚重三风扇显卡尾端，防止主板 PCIe 插槽被拉裂及显卡金手指应力撕裂。',
    fullExplanation:
      '现代中高端显卡散热用料极其扎实，整卡自重常超过 1.8~2.5 千克。在立式机箱中仅靠后端两个机箱螺丝与主板 PCIe 插槽固定，长期下垂重力会在金手指与 PCB 拐角处产生巨大剪切应力，运输颠簸或长期使用极易导致显卡靠近卡扣处的 PCB 铜线断裂、显存虚焊花屏。',
    buyingAdvice:
      '只要显卡长度超过 28cm、厚度达 2.5 槽以上，装机时必须在显卡尾端安装立柱式旋转螺纹支架或横向千斤顶！主机长途搬运前必须拔下显卡单独打包包装。',
    tags: ['安全铁律', '显卡保护', '装机必看'],
  },
  {
    id: 'term-dp21-uhbr',
    term: 'DisplayPort 2.1 与 UHBR 超高带宽传输',
    alias: ['DP 2.1', 'UHBR20', 'UHBR13.5', '8K超清', '无损4K240Hz'],
    category: 'display',
    shortDesc: '新一代视频物理接口协议，带宽高达 80Gbps，支持原生无压缩传输 4K 240Hz 或 8K 60Hz 画面。',
    fullExplanation:
      'DP 1.4 带宽仅 32.4Gbps，输出 4K 144Hz 10-bit 色深时必须开启 DSC 压缩编码。DP 2.1 引入了 UHBR (Ultra-High Bit Rate) 传输模式，最高阶 UHBR20 达到惊人的 80Gbps 净吞吐量，带来真正的无损原生高刷超清。AMD RX 7000 系列及最新次世代显卡已原生搭载 DP 2.1。',
    buyingAdvice:
      '打算购买 4K 240Hz OLED 超旗舰电竞显示器的发烧友，注意核对显卡与显示器输入口是否同时支持满血 DP 2.1 UHBR 传输规范。',
    tags: ['视频接口', '高刷新率', '4K无损'],
  },
  {
    id: 'term-dsc',
    term: 'DSC 显示流压缩技术 (Display Stream Compression)',
    alias: ['DSC', '无损压缩', '黑屏闪烁', '超频带宽'],
    category: 'display',
    shortDesc: 'VESA 官方推出的视觉无损（Visually Lossless）超低延迟图像压缩算法，用旧接口跑出超规格高刷。',
    fullExplanation:
      'DSC 属于行级微秒内硬件编解码，压缩比通常为 3:1 或 2:1，人眼在动态游戏中几乎不可能分辨出任何画质损失。但开启 DSC 时，显卡会将两组显示流水线合并处理一个屏幕，可能会导致切换桌面全屏游戏时出现短暂黑屏闪烁，或在部分显卡上限用 NVIDIA DSR 动态超分辨率功能。',
    buyingAdvice:
      '购买 4K 144Hz 显示器如果发现切屏偶发黑屏一两秒，通常是因为触发了 DSC 压缩握手，属于正常技术现象不必慌张。',
    tags: ['图像压缩', '显示接口', '切屏黑屏'],
  },
  {
    id: 'term-dual-bios',
    term: '显卡双 BIOS 硬件开关 (Dual BIOS: Quiet / OC)',
    alias: ['双BIOS', '安静模式', '超频模式', '拨码开关'],
    category: 'gpu',
    shortDesc: '显卡顶部物理微型拨动开关，在“激进超频高风速”与“温和静音低转速”风扇温控策略间切换。',
    fullExplanation:
      '显卡搭载两颗独立的 SPI Flash 芯片。OC / Performance 档位风扇启停阈值更低、风速更高，核心温度低 5°C；Quiet 档位放宽温度上限，风扇转速压低 500 RPM，带来极致安静体验。此外，在刷 BIOS 失败黑屏时，拨到另一个 BIOS 即可安全救砖开机。',
    buyingAdvice:
      '追求书房静音的玩家，可关机后将显卡顶部小拨钮拨至【Q-Mode (Quiet)】；救砖玩家更视其为绝杀保险。',
    tags: ['显卡功能', '静音调校', '救砖神器'],
  },
  {
    id: 'term-ram-gear-mode',
    term: '内存 Gear 1 / Gear 2 分频法则 (控制器分频比)',
    alias: ['Gear 1', 'Gear 2', '同频', '分频', '内存控制器', 'IMC'],
    category: 'ram',
    shortDesc: 'CPU 内部内存控制器频率与内存实际工作频率的时钟比例：同频延迟极低，分频能冲击超高频率。',
    fullExplanation:
      'Gear 1 代表 IMC 时钟频率与内存频率 1:1 同频运行，内存延迟降至极低的 40~50ns，但在 DDR4 超过 3800MHz 或 DDR5 超过 6400MHz 时，CPU 内部控制器体质无法承受；Gear 2 切换为 1:2 分频，控制器压力减半，使内存能狂飙至 7200~8400MHz+，但会带来约 5~8ns 的分频延迟惩罚。',
    buyingAdvice:
      'AMD AM5 平台最甜点策略是【UCLK=MCLK 1:1 同频 6000MHz CL30】；Intel 平台如追求 7600MHz+ 超高带宽，则安心开启 Gear 2 模式。',
    tags: ['内存调校', '延迟性能', '分频避坑'],
  },
  {
    id: 'term-sub-timings',
    term: '内存小参 (tREFI / tRFC / tFAW) 与二次时序压缩',
    alias: ['内存小参', 'tREFI', 'tRFC', '二副时序', '吃鸡帧率'],
    category: 'ram',
    shortDesc: '决定内存内部电容刷新间隔、行周期等待与电荷恢复的微观时序，对电竞网游最低帧影响甚至超越主频！',
    fullExplanation:
      '普通玩家常只看 CL30 / CL36 这四个主时序，然而真正影响《永劫无间》《CS2》《绝地求生》1% Low 掉帧的是副时序：例如 tREFI（刷新间隔）开到最大 65535 可让内存减少无用等待，tRFC（刷新恢复时间）从默认的 800 压至 400 周期可大幅缩减寻址延迟。',
    buyingAdvice:
      '内存开启 XMP/EXPO 只是及格，精细优化海力士颗粒的 tREFI 和 tRFC 小参能让电竞网游最低帧暴涨 15%~25%！优化小参需在内存插槽旁加装微型风扇防止发热高温报错。',
    tags: ['深度超频', '网游电竞', '时序压缩'],
  },
  {
    id: 'term-ram-die-binning',
    term: '内存颗粒体质分级 (Hynix A-die / M-die vs 三星 B-die)',
    alias: ['A-die', 'M-die', 'B-die', '海力士颗粒', '特挑颗粒'],
    category: 'ram',
    shortDesc: 'DRAM 硅晶圆原厂颗粒代号，决定了这根内存能超频到的电压耐受度、频率上限与极小时序。',
    fullExplanation:
      '在 DDR5 时代，【海力士 A-die】和【新 M-die (3Gb/24GB单条)】是绝对霸主，能耐受 1.45V+ 高电压，能轻松超至 7200~8400MHz 且 tRFC 能压到极低；三星与镁光早期 DDR5 颗粒体质较差，难以突破 6000MHz 且时序松垮。在老 DDR4 时代，【三星 B-die】凭借强悍的耐压平跑 CL14 封神。',
    buyingAdvice:
      '选购 DDR5 内存时，无论买哪个品牌（光威、金百达、芝奇、宏碁），商品详情或颗粒参数必须认准【海力士 A-die 原厂颗粒】！',
    tags: ['颗粒体质', 'DDR5推荐', '必看真经'],
  },
  {
    id: 'term-pcb-layers',
    term: '主板 PCB 层数 (6层 vs 8层 vs 10层 阻抗控制)',
    alias: ['主板层数', '8层PCB', 'PCB信号完整性', '阻抗控制'],
    category: 'motherboard',
    shortDesc: '主板电路板内部压合的铜箔导电层数，层数越多高频信号抗干扰能力越强，超频越稳。',
    fullExplanation:
      'PCIe 5.0 和 DDR5 8000MHz+ 属于超高频高谐波信号，在 4 层板或劣质 6 层板中由于空间狭小，线路之间会产生强烈的电磁串扰（Crosstalk）导致数据包重传纠错、内存开机黑屏。8 层或 10 层服务器级 IT-180 覆铜板能单独划分出地线屏蔽层与纯净电源层，使内存高频信号走线保持极其严格的阻抗匹配。',
    buyingAdvice:
      '计划冲击 DDR5 7600MHz+ 极限超频或双路 PCIe 5.0 的用户，主板选购务必关注官方宣传的【服务器级 8 层 / 10 层 PCB】规格。',
    tags: ['硬件做工', '信号纯净', '高频超频'],
  },
  {
    id: 'term-vrm-phase-design',
    term: '直出供电 vs 并联供电 vs 倍相供电 (VRM 相数本质)',
    alias: ['直出供电', '并联供电', '倍相器', '供电相数', 'PWM主控'],
    category: 'motherboard',
    shortDesc: '主板多相供电的内部驱动拓扑：直出信号延迟最低响应最快，并联分摊电流发热，谨防虚标相数。',
    fullExplanation:
      '宣称“16 相供电”的主板通常有三种可能：①真正拥有 16 通道 PWM 主控的【原生直出供电】（成本极高，瞬态响应最完美）；②使用 8 颗倍相芯片（Doubler）将 8 相信号交替分时驱动为 16 相的【倍相供电】；③一个 PWM 信号直接挂载 2 颗并联 DrMOS 的【并联相数（8并16）】。并联相数虽然瞬态响应等同于 8 相，但有效分摊了通过每颗 MOS 管的热量。',
    buyingAdvice:
      '不要只数主板电感数量！12 相 90A 顶级原生直出 DrMOS，远胜劣质 20 相上下桥分离低端 MOS 管。认准 DrMOS 单相安培数与 PWM 芯片型号。',
    tags: ['主板供电', '做工解析', '虚标避坑'],
  },
  {
    id: 'term-q-code-debug',
    term: '主板 Q-Code 双位诊断数码管 (Debug LED Codes)',
    alias: ['Debug灯', 'Q-Code', '主板数码管', '卡00', '卡C5', '卡15'],
    category: 'motherboard',
    shortDesc: '主板自检时滚动的十六进制故障诊断双位数码管，能秒级精准定位无法开机的具体故障配件。',
    fullExplanation:
      '传统主板只有 4 颗红黄白绿四色简易 LED 提示。而高端主板配备双位 LED 显示屏，在上电自检（POST）过程中实时汇报主板执行的底层汇编测试步骤：例如显示【15 / C5】代表正在进行内存内存训练（Memory Training）；显示【00 / D0】代表 CPU 未就绪或针脚虚接；显示【99 / A0】代表自检通过移交操作系统。',
    buyingAdvice:
      '经常折腾超频或测试硬件的玩家强烈建议选购自带 Q-Code 数码管的主板；装机自检第一次开机卡在 15 往往是 DDR5 首次训练，耐性等待 2~3 分钟切勿强行断电。',
    tags: ['排障神器', '故障代码', '自检流程'],
  },
  {
    id: 'term-btf-back-connect',
    term: '背插主板与背插机箱生态 (BTF / Project Stealth)',
    alias: ['背插主板', 'BTF', '背插机箱', '无线机箱', '隐藏走线'],
    category: 'case',
    shortDesc: '将主板 24Pin 供电、CPU 供电、风扇跳线全部移至主板背面的全新设计，正面彻底告别杂乱线缆。',
    fullExplanation:
      '传统海景房机箱正面难免有黑粗的 24-Pin 和跳线挡住美观。华硕 BTF、微星 Project Zero、七彩虹等联合推出的背插方案将所有电源插座全部翻折到底面，配合背插显卡（通过高功率底部金手指直供电源而无需外挂 12V 供电线），从机箱正面看没有任何一根外露线缆，呈现极致纯粹的橱窗展览效果。',
    buyingAdvice:
      '背插主板必须搭配专用背板开孔的【背插机箱】才能安装！普通传统机箱缺少背部插座避让镂空孔，二者无法混用兼容。',
    tags: ['纯白海景房', '无线视觉', '装机新潮流'],
  },
  {
    id: 'term-usb4-thunderbolt',
    term: 'USB4 与雷电 4/5 极速全功能协议 (Thunderbolt)',
    alias: ['雷电4', '雷电5', 'USB4', 'Type-C', '40Gbps', '显卡拓展坞'],
    category: 'motherboard',
    shortDesc: '整合了高带宽 PCIe 数据传输、DisplayPort 高清视频输出与最高 240W PD 快速充电的万能接口。',
    fullExplanation:
      'USB4 与 Intel 雷电 4 基于相同底层架构，提供双向 40Gbps 带宽；最新雷电 5 更一跃达到 80~120Gbps。由于直接穿透 CPU 内部的 PCIe 通道，使得笔记本或迷你主机能够通过一根 Type-C 线无损外接桌面级独立显卡拓展坞（eGPU）、极速外置 RAID 磁盘阵列或双 4K 144Hz 专业显示器。',
    buyingAdvice:
      '选购高性能迷你主机、轻薄本或专业创作者主板时，认准机身带有【雷电 4】闪电标志或【USB4 40Gbps】字样，外设扩展潜力极大。',
    tags: ['万能接口', '外接显卡', '高速外设'],
  },
  {
    id: 'term-direct-storage',
    term: 'DirectStorage 微软直通存储与 GPU 硬件解压',
    alias: ['DirectStorage', '直接存储', '秒进游戏', 'GPU解压'],
    category: 'storage',
    shortDesc: '游戏直接从 NVMe 固态硬盘向显卡显存传输并依靠 GPU 实时解压数据，彻底消灭大型游戏载入加载条。',
    fullExplanation:
      '传统读取模式：固态硬盘数据 → 经过 PCIe 传给内存 → CPU 串行解压占用大量算力 → 再次传给显存。DirectStorage 技术允许数据直接从高速 NVMe 固态借由 PCIe 总线拷贝至显存，并调动 GPU 庞大的几千个着色器并行秒级解压，载入时间从十几秒缩短至 1 秒以内，且全程不占 CPU 运算资源。',
    buyingAdvice:
      '未来支持 DirectStorage 的次世代 3A 大作必须配合【PCIe 4.0 / 5.0 高速固态硬盘】才能发挥完全实力，尽量避免将游戏装在老旧机械硬盘或慢速 SATA 盘上。',
    tags: ['秒进游戏', '存储直通', 'GPU加速'],
  },
  {
    id: 'term-bifurcation',
    term: 'PCIe 通道拆分 (Bifurcation / x16 拆 x8+x8 或 4x4)',
    alias: ['通道拆分', 'Bifurcation', 'PCIe拆分', '四盘M.2转接卡'],
    category: 'motherboard',
    shortDesc: '主板在 BIOS 中将一条物理 x16 插槽划分为多个独立通道段（如 x8+x8 或 x4+x4+x4+x4）。',
    fullExplanation:
      '默认状态下一条 PCIe x16 插槽只能被单个显卡或单张扩展卡识别。开启通道拆分后，一根物理插槽可以插上【四盘位 M.2 NVMe 扩展卡】，主板分别将 4 条独立的 PCIe x4 通道路由给 4 块固态硬盘，系统能同时识别出 4 块独立硬盘并组建超高速 RAID 0 阵列。',
    buyingAdvice:
      '计划购买“单卡四盘 M.2 扩展卡”扩容固态的用户，务必先查阅主板说明书确认第 1 条 PCIe 插槽是否支持【PCIe Bifurcation (x4/x4/x4/x4)】功能。',
    tags: ['存储扩展', 'PCIe拆分', '高级玩法'],
  },
  {
    id: 'term-nand-binning',
    term: '原厂正片 vs 白片 vs 黑片 vs 拆机片 (NAND 晶圆真身)',
    alias: ['白片', '黑片', '原厂正片', '降级片', '拆机片', '自封片'],
    category: 'storage',
    shortDesc: '闪存芯片封装出厂时的晶圆质检等级：原厂正片寿命与稳定性最高，黑片白片是掉盘与丢失数据的元凶。',
    fullExplanation:
      '全球只有三星、美光、铠侠/闪迪、海力士、长江存储这几家掌握晶圆制造。①【原厂正片】：经过原厂最苛刻的高低温及坏块测试，印有清晰原厂 Logo 与批次；②【白片】：未通过原厂最高严苛测试、由第三方封测厂廉价打包的降级良品（Good Die）；③【黑片/划线片】：边角废弃物芯片重新私自打磨刻字，坏块率极高，数月内必掉盘；④【拆机片】：从老旧手机或服务器主板吹焊拆下的二手旧芯片。',
    buyingAdvice:
      '存储数据无价！绝对不要图便宜购买百元杂牌 SSD。认准长江存储原厂致态、三星原厂、铠侠原厂或美光英睿达等真正具备原厂正片资质的一线品牌。',
    tags: ['数据安全', '防坑防骗', '原厂正品'],
  },
  {
    id: 'term-power-ripple',
    term: '电源输出纹波与瞬态动态响应 (Voltage Ripple)',
    alias: ['纹波', '输出纹波', '瞬态响应', '纯净供电', '杂波'],
    category: 'psu',
    shortDesc: '直流供电输出中残留的微小高频交流杂波波动，纹波越低硬件运行越纯净耐用。',
    fullExplanation:
      '市电 220V 交流电经由变压器与整流滤波转化为 12V 直流电，在这个过程中不可避免会残留微弱的毫伏级高频交流波动（纹波）。Intel ATX 规范要求 12V 纹波必须低于 120mV；顶级金牌/白金电源采用全日系固态电解电容+LC滤波，能将满载纹波压制在惊人的 15mV ~ 20mV 以内，极大延长显卡供电模块与硬盘主控的使用寿命。',
    buyingAdvice:
      '选购电源不能只看标称功率！优秀的 850W 纯净低纹波电源比虚标瓦数的大号杂牌电源稳定十倍。',
    tags: ['电源品质', '纯净电流', '延长寿命'],
  },
  {
    id: 'term-fan-bearing',
    term: '风扇轴承种类 (FDB 流体液压 vs 双滚珠 vs 油封)',
    alias: ['FDB轴承', '双滚珠轴承', '液压轴承', '油封轴承', '风扇异响'],
    category: 'cooling',
    shortDesc: '风扇转子内部的轴承结构，决定了风扇的静音水平、抗震能力与长期旋转寿命。',
    fullExplanation:
      '①【油封轴承 (Sleeve)】：成本最低，润滑油受热易挥发，倒挂安装极易漏油磨损异响；②【双滚珠轴承 (Dual Ball)】：两个高硬度微型钢珠滚道，寿命高达 10 万小时，抗恶劣高温与各种方向安装，但运转有轻微金属沙沙声，常用于工业服务器与高转速暴力扇；③【FDB (流体动压轴承)】：轴心刻有人字形微油槽，旋转时利用流体动压使轴心悬浮在润滑油薄膜中，零机械金属摩擦，极其静音且寿命长达 6~8 年。',
    buyingAdvice:
      '家庭和书房机箱风扇首选配备【真 FDB 流体轴承】的型号（如猫头鹰、利民、德商德静界）；服务器或工业长时间高粉尘工况选【双滚珠】。',
    tags: ['风扇静音', '轴承寿命', '避坑选购'],
  },
  {
    id: 'term-fan-cfm-pressure',
    term: '风量 (CFM) 与风压 (mmH2O) 及冷排吹透法则',
    alias: ['风量', '风压', 'CFM', 'mmH2O', '冷排扇', '机箱风道扇'],
    category: 'cooling',
    shortDesc: '风量代表出风总容积，风压代表穿透密集障碍阻力的推力：吹透水冷排和厚鳍片必须选高风压扇！',
    fullExplanation:
      '风扇设计存在“鱼与熊掌”的权衡：大倾角宽扇叶专注推送大量空气（高 CFM，如 75+ CFM），但在遇到水冷排密集的细微铝鳍片时会被强烈反弹回流吹不透；高风压扇（如 2.5 ~ 3.5 mmH2O）拥有紧凑叶框间隙、镰刀导流曲率，能像空气活塞一样克服高风阻，强力穿透水冷排或厚重风冷塔。',
    buyingAdvice:
      '安装在水冷排或厚风冷散热塔上的风扇必须优先看【静压 (mmH2O)】参数；安装在机箱尾部直通排气的风扇可优先看【风量 (CFM)】。',
    tags: ['风扇选配', '冷排吹透', '散热效率'],
  },
  {
    id: 'term-aio-pump-orientation',
    term: '水冷冷排安装位置与气泡异响铁律',
    alias: ['水冷安装位置', '冷头异响', '冷排在顶', '气泡进水泵'],
    category: 'cooling',
    shortDesc: '一体式水冷系统中最高点必须是冷排而非水泵，防止气泡汇集在水冷头内引起水泵空转烧毁。',
    fullExplanation:
      '一体式水冷出厂时内部预留有约 2%~5% 的微量空气用于热胀冷缩缓冲。根据物理定律，密闭水路中的空气气泡必定永远向上移动并聚集在整个回路的【最高物理点】。如果将冷排安装在机箱底部，或者前置安装且冷排水管接口朝上高于冷排，气泡就会被吸入并滞留在位于最高点的 CPU 水泵内，产生烦人的刺耳咕嘟咕嘟流水异响，更会导致水泵陶瓷轴承干磨发热烧坏！',
    buyingAdvice:
      '水冷装机黄金铁律：【首选将水冷排安装在机箱顶部】！如果只能前置安装，必须确保冷排顶部高于水冷头！',
    tags: ['装机禁忌', '水冷避坑', '静音寿命'],
  },
  {
    id: 'term-power-cables-awg',
    term: '模组线线径规格 (16AWG vs 18AWG)',
    alias: ['线径', '16AWG', '18AWG', '定制线', '模组线发热'],
    category: 'psu',
    shortDesc: 'AWG 数字越小代表铜线越粗，能承载的电流越大、电阻发热越小，防止高功耗下线材过热。',
    fullExplanation:
      '普通电源线材多采用 18AWG 铜芯；而在大功率 12V-2x6 或高功耗显卡 PCIe 供电线上，优质电源和高端定制线会使用更粗的【16AWG 甚至 14AWG 纯铜无氧铜镀锡线】。粗铜线能大幅降低在大电流（如 40A~55A 瞬时通过）时的导线内阻与压降，彻底避免线材发热变软甚至插头塑料熔化。',
    buyingAdvice:
      '选购第三方好看的定制编织线时，切勿图便宜买杂牌 20AWG 细线！必须向卖家确认主供电采用【16AWG 镀锡铜线】并配备合金耐高流端子。',
    tags: ['线材安全', '定制线', '防烧防熔'],
  },
  {
    id: 'term-dimm-slot-routing',
    term: 'Daisy Chain (菊花链) vs T-Topology (T型) 内存布线',
    alias: ['菊花链', 'Daisy Chain', 'T-Topology', '2槽超频', '4槽插满'],
    category: 'motherboard',
    shortDesc: '主板 CPU 到 4 根内存插槽之间的物理布线架构：菊花链单插两根超频最强，T型四根插满最稳。',
    fullExplanation:
      '现代 95% 以上的主板采用【Daisy Chain (菊花链拓扑)】：CPU 的走线先到达第 1/3 插槽，再串行延伸到第 2/4 槽末端。这种设计下，如果将两根内存插在第 2/4 槽（末端），由于末端没有悬空的分支导线（Stub）产生高频反射波，信号反射干净利落，超频频率极高；相反如果插满 4 根，两端信号交织干扰，频率暴跌。',
    buyingAdvice:
      '使用菊花链主板（绝大多数主板）组装双通道，必须坚定不移地插在【2号和4号槽】！极限双槽超频主板（如 APEX、Tachyon）直接物理砍掉 1/3 槽，就是为了消灭走线残桩。',
    tags: ['插槽法则', '主板拓扑', '高频超频'],
  },
  {
    id: 'term-psu-japanese-caps',
    term: '105°C 日系固态/电解电容 (Japanese Capacitors)',
    alias: ['日系电容', '105度电容', '红宝石Rubycon', '黑金刚NCC', '尼吉康Nichicon'],
    category: 'psu',
    shortDesc: '电源内部高压滤波与输出稳压的核心元器件，日系三大厂以长寿命与耐受极端高温闻名。',
    fullExplanation:
      '电源工作时主变压器与散热片发热剧烈。低端电源使用 85°C 国产/台系普通电解液电容，在长期高温下电解液极易干涸鼓包漏液导致电源挂机炸机；【日系三大厂（Nippon Chemi-Con 黑金刚、Rubycon 红宝石、Nichicon 尼吉康）】的 105°C 工业级主电容采用高纯度电解铝箔与特殊耐热电解液，具备超高抗纹波电流能力与长达 10~12 年的超长寿命。',
    buyingAdvice:
      '购买台式机电源时，尽量认准官方标注【全日系 105°C 电容】或【全日系电解+固态电容】，配合 10 年质保更有保障。',
    tags: ['电源用料', '十年质保', '防炸机'],
  },
  {
    id: 'term-dc-pwm-dimming',
    term: 'DC 调光 vs 高频 PWM 调光与防频闪护眼',
    alias: ['DC调光', 'PWM调光', '频闪', '护眼显示器', '眼干眼涩'],
    category: 'display',
    shortDesc: '显示器降低亮度的两种电路方式：DC 调光直接降低电流无闪烁，劣质低频 PWM 通过频繁黑屏忽明忽暗伤眼。',
    fullExplanation:
      'DC (Direct Current) 调光通过直接线性改变背光 LED 的驱动电流来调暗亮度，全程光线平稳连续，绝对无频闪；而 PWM (脉冲宽度调制) 通过以极快频率不断开启和关闭背光来利用人眼视觉残留达到变暗效果。若 PWM 频率较低（如几百赫兹），人眼睫状肌会随看不见的明暗交替不自觉微抽搐，造成头痛、眼干与干眼症。',
    buyingAdvice:
      '长时间面对屏幕办公或深夜打游戏的玩家，显示器规格必须确认具备【DC 调光不闪屏认证】（TÜV 莱茵无频闪认证）。',
    tags: ['护眼健康', '调光方式', '屏幕选购'],
  },
  {
    id: 'term-10bit-frc',
    term: '原生 10-bit vs 8-bit + FRC 像素抖动色深',
    alias: ['10bit', '8bit', 'FRC', '色深', '色彩断层', '10.7亿色'],
    category: 'display',
    shortDesc: '8-bit 只能显示 1670 万色，10-bit 能呈现 10.7 亿色消除天空或渐变背景的色彩条纹断层。',
    fullExplanation:
      '色深决定了红绿蓝每种原色的明暗级数。8-bit 只有 256 个灰阶，在显示黄昏夕阳天空间隔较大时会出现一圈一圈明显的波纹断层（Color Banding）；10-bit 拥有 1024 个灰阶，色彩过渡柔和细腻。市场上部分平价显示器采用【8-bit + FRC (帧率控制)】通过两个相邻色块高速交替闪烁来“脑补抖动”出 10-bit，视觉体验接近但成本低廉。',
    buyingAdvice:
      '专业平面设计与影视调色优先选【原生 10-bit】专业屏；纯打游戏买【8-bit + FRC】完全够用，肉眼几乎看不出区别。',
    tags: ['色彩深度', '色彩断层', '面板参数'],
  },
  {
    id: 'term-hdr-standards',
    term: 'VESA DisplayHDR 400 / 600 / 1000 真实门槛',
    alias: ['HDR', 'HDR400', 'HDR600', 'HDR1000', '分区背光'],
    category: 'display',
    shortDesc: '高动态范围显示认证：HDR 400 只是及格门票无实质提升，配备硬件分区背光的 HDR 600+ 才有震撼对比。',
    fullExplanation:
      'HDR 400 只要求峰值亮度达到 400nits 且接受全局调光，在游戏中开启不仅黑场发灰发蒙而且对比度不足；HDR 600 要求具备至少几十个背光分区并支持广色域；而 DisplayHDR 1000 / True Black (OLED) 拥有数千个微米级硬件控光分区或像素级控光，能在同一画面中同时呈现太阳的高光耀斑与山洞深邃不见底的纯黑。',
    buyingAdvice:
      '不要被商家的“支持 HDR”宣传忽悠！【HDR 400 建议在 Windows 里常开关闭】，要获得真正震撼的 HDR 观影体验，认准【Mini-LED 1000 分区以上 HDR 1000】或【OLED 屏幕】。',
    tags: ['HDR画质', '避坑指南', '显示器真伪'],
  },
  {
    id: 'term-chipset-pcie-lanes',
    term: 'CPU 直连 PCIe 通道 vs 主板南桥芯片组通道',
    alias: ['直连通道', '芯片组通道', 'DMI总线', '延迟', 'M.2插槽优先级'],
    category: 'motherboard',
    shortDesc: 'CPU 内部引出的独立直通车道，相比借道主板芯片组中转的高速车道，延迟低、不挤占 DMI 共享带宽。',
    fullExplanation:
      '现代桌面 CPU 内部原生引出约 20~28 条 PCIe 高速通道（如 PCIe 5.0 x16 专门留给独立显卡，PCIe 4.0/5.0 x4 直连主板第一条靠近 CPU 的 M.2 固态插槽）；而主板下方的第二条、第三条 M.2 和声卡网卡走的是主板 PCH 芯片组通道，它们共享一条 DMI 4.0 x8 总线。当多个外设同时全速读取时容易出现带宽竞争瓶颈。',
    buyingAdvice:
      '安装操作系统所在的【系统启动盘】必须插在主板最上方、最靠近 CPU 的第一条自带散热装甲的 M.2 插槽（CPU 直连插槽），读取延迟最低！',
    tags: ['M.2插槽选择', '系统盘安装', '通道分布'],
  },
  {
    id: 'term-thermal-pads-thickness',
    term: '导热硅胶垫厚度选配 (0.5mm / 1.0mm / 1.5mm 公差压痕)',
    alias: ['导热垫', '硅胶垫厚度', '显存导热垫', '固态导热贴', '热阻公差'],
    category: 'cooling',
    shortDesc: '填补固态硬盘或显卡显存与金属散热马甲之间较大缝隙的弹性导热材料，厚度选错极易引发悬空或压弯。',
    fullExplanation:
      '硅脂只能用于 0.1mm 以下的极微小缝隙；对于 0.5mm ~ 2.0mm 的元器件间距（如 M.2 固态的闪存颗粒、显卡显存芯片），必须使用具备一定压缩率（压缩率 20%~40%）的导热硅胶垫。如果选得过厚（如该用 1.0mm 却装了 2.0mm），扣紧时会顶弯 PCB 板并导致核心悬空不导热；若太薄则两者根本接触不上，热量完全无法传导。',
    buyingAdvice:
      '更换显存或 M.2 散热片导热垫时，一定要查清原厂公差图或用卡尺测量厚度！选购导热系数 12.8 W/mK 以上高弹性相变垫片效果最佳。',
    tags: ['装机细节', '导热垫厚度', '防悬空'],
  },
];
