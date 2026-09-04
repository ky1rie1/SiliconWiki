import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  RotateCcw,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Tv,
  HelpCircle,
  Sparkles,
  Cpu,
  Wrench,
} from 'lucide-react';
import { assemblyStepsData } from '../../data/assemblySteps';
import { PCScene3D } from './PCScene3D';
import { BilibiliGuidesModal } from './BilibiliGuidesModal';

interface HardwareSpecDetail {
  craft: string;
  specs: { label: string; val: string }[];
  highlightTip: string;
}

const stepSpecsMap: Record<string, HardwareSpecDetail> = {
  cpu: {
    craft: 'TSMC N4P 先进制程 · 镀镍紫铜 IHS 均热顶盖 · 金色防呆三角对位标',
    specs: [
      { label: '插槽封装', val: 'LGA1700 / AM5 (1718 Pin)' },
      { label: '热设计功耗', val: '120W - 253W 动态功耗' },
      { label: '操作关键', val: '认准金色三角，切勿触碰底座针脚' },
    ],
    highlightTip: '金手指标记与插槽缺口严密对齐，零压力自由落座',
  },
  ram: {
    craft: '10层服务器级 PCB · 原厂海力士 A-die 颗粒 · 阳极氧化厚重铝马甲',
    specs: [
      { label: '技术规范', val: 'DDR5 6000MHz CL30 双通道' },
      { label: '插槽推荐', val: '优先插入第 2 槽与第 4 槽 (A2/B2)' },
      { label: '超频支持', val: '支持 Intel XMP 3.0 & AMD EXPO' },
    ],
    highlightTip: '两端听到“咔哒”锁定声，卡扣自动回弹咬紧',
  },
  ssd: {
    craft: 'PCIe 4.0 x4 NVMe 2.0 · 3D TLC 高速颗粒 · 独立高速 DRAM 物理缓存',
    specs: [
      { label: '传输速度', val: '读取 7400 MB/s · 写入 6500 MB/s' },
      { label: '固定形式', val: 'M.2 2280 规格 · 免工具旋转卡扣 / 螺丝' },
      { label: '散热提醒', val: '主板金属散热马甲背后蓝色导热垫膜必撕！' },
    ],
    highlightTip: '30°~45° 倾斜入槽到底，向下轻压旋紧固定',
  },
  cooler: {
    craft: '双塔穿 FIN 工艺 · 6x 6mm 逆重力烧结纯铜热管 · FDB 液压静音轴承风扇',
    specs: [
      { label: '解热能力', val: '最高压制 260W TDP 核心发热' },
      { label: '风扇规格', val: '120mm PWM 温控静音扇 (800-1850RPM)' },
      { label: '供电接口', val: '主板 CPU_FAN 4-Pin 专用排针' },
    ],
    highlightTip: '铜底撕膜后点涂黄豆粒硅脂，对角线交替旋紧螺丝',
  },
  motherboard: {
    craft: '标准 ATX 版型 · 16+1+2 相 90A 旗舰供电 · 8层 2oz 加厚铜箔 PCB',
    specs: [
      { label: '扩展插槽', val: 'PCIe 5.0 x16 金属加固槽 + 4x M.2' },
      { label: '后置 I/O', val: '一体化预装金属挡板 + Wi-Fi 7 天线接口' },
      { label: '机箱对位', val: '主板 9 孔螺丝位，必须与机箱铜柱一一对应' },
    ],
    highlightTip: '主板斜向滑入机箱卡稳 I/O 挡板，严防多余铜柱短路',
  },
  psu: {
    craft: 'ATX 3.0 规范 · 80 PLUS 金牌全模组 · 105°C 日系全固态/电解电容',
    specs: [
      { label: '额定功率', val: '850W 纯净单路 12V 稳压输出' },
      { label: '新显卡线', val: '原生 PCIe 5.0 12V-2x6 600W 接口' },
      { label: '风道方向', val: '风扇朝下对准机箱底面防尘网进风' },
    ],
    highlightTip: '装箱前先插好线缆，CPU 8Pin 与 PCIe 8Pin 绝不可插反',
  },
  gpu: {
    craft: 'Ada / RDNA3 旗舰核心 · 3x 逆向环形导流风扇 · 金属穿透散热背板',
    specs: [
      { label: '视频输出', val: '3x DP 2.1 + 1x HDMI 2.1 高刷接口' },
      { label: '槽位规格', val: '2.5 槽加厚散热体 · 双金属挡片牢靠固定' },
      { label: '供电注意事项', val: '16-Pin 接口必须垂直完全插到底零缝隙' },
    ],
    highlightTip: '推入 PCIe 槽发出咔哒锁死，机箱挡片螺丝紧固防下垂',
  },
  cables: {
    craft: '高密度编织蛇皮网 · 镀金端子触点 · 附赠高刚性透明工程理线梳',
    specs: [
      { label: '开机核心', val: 'POWER SW 双针 (插 JFP1 无正负极)' },
      { label: '高速传输', val: '前置 USB 3.0 19-Pin (防呆缺口严防断针)' },
      { label: '音频走线', val: 'HD AUDIO 9-Pin 防呆插座 (防呆缺一针)' },
    ],
    highlightTip: '分束梳理顺直走背线，扎带固定提升机箱内部风道效能',
  },
  case: {
    craft: '270° 无立柱海景房 · 4mm 超白钢化防爆玻璃 · 独立下置电源仓分舱',
    specs: [
      { label: '点亮自检', val: '观察主板 CPU->DRAM->VGA->BOOT 4颗灯' },
      { label: '视频接线', val: '视频线务必插在独显后置接口，严禁插主板' },
      { label: '首开进系统', val: '狂按 Del 进 BIOS 开启 XMP / EXPO 内存加速' },
    ],
    highlightTip: '通电自检全绿即大功告成，享受首次点亮主机的仪式感！',
  },
};

export const AssemblySimulator3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PCScene3D | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [isBilibiliModalOpen, setIsBilibiliModalOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hoveredComponentName, setHoveredComponentName] = useState<string | null>(null);

  const currentStep = assemblyStepsData[currentStepIndex];
  const stepSpec = stepSpecsMap[currentStep.componentKey];

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D WebGL scene
    const scene = new PCScene3D(containerRef.current);
    sceneRef.current = scene;

    // Set initial step
    scene.setStep(assemblyStepsData[0].stepNumber);

    // 3D Model click syncs to React state and updates right-hand panel
    scene.onComponentClick = (componentId: string) => {
      const targetIndex = assemblyStepsData.findIndex((s) => s.componentKey === componentId);
      if (targetIndex !== -1) {
        handleStepChange(targetIndex);
      }
    };

    scene.onComponentHover = (compName: string | null) => {
      setHoveredComponentName(compName);
    };

    const handleResize = () => {
      scene.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleStepChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= assemblyStepsData.length) return;
    setCurrentStepIndex(newIndex);
    const step = assemblyStepsData[newIndex];
    if (sceneRef.current) {
      sceneRef.current.setStep(step.stepNumber);
      sceneRef.current.focusComponent(step.componentKey);
    }
  };

  const handleToggleExplode = () => {
    const next = !isExploded;
    setIsExploded(next);
    if (sceneRef.current) {
      sceneRef.current.setExploded(next);
    }
  };

  const handleResetCamera = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera();
    }
  };

  const handleSimulateInstall = () => {
    if (isInstalling || !sceneRef.current) return;
    setIsInstalling(true);
    sceneRef.current.animateInstallStep(currentStep.stepNumber, () => {
      setIsInstalling(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
            <Box className="w-3.5 h-3.5" />
            <span>三维实景装机工坊 · 仿真硬件结构</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            全三维分步实景拼装 · 零门槛掌握装机逻辑
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            点击画布硬件可直接联动右侧工序说明。支持 360° 无死角旋转、部件对位仿真、防呆防坑要点，附 B 站实操精讲直达。
          </p>
        </div>

        {/* Video Tutorial Launcher Button */}
        <button
          onClick={() => setIsBilibiliModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Tv className="w-4 h-4" />
          <span>📺 B站保姆级视频精选</span>
        </button>
      </div>

      {/* Main 3D Canvas + Step Instructions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Stage (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-slate-900/95 dark:bg-slate-950 border border-slate-700/60 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="w-full h-[400px] sm:h-[500px] cursor-grab active:cursor-grabbing relative z-10"
          >
            {/* On-canvas Controls Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
              <button
                onClick={handleToggleExplode}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isExploded
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : 'bg-slate-800/80 backdrop-blur-md text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isExploded ? '合体复原主机' : '一键爆炸拆解透视'}</span>
              </button>

              <button
                onClick={handleResetCamera}
                className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-md cursor-pointer"
                title="重置视角"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredComponentName && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/40 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in duration-150 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>部件：{hoveredComponentName} (点击聚焦)</span>
              </div>
            )}

            {/* Hint in canvas bottom */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[11px] text-slate-400 bg-slate-900/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-700/40">
              <span>🖱️ 按住鼠标左键 360° 旋转 · 滚轮缩放 · 点击硬件直接聚焦联动</span>
              <span className="hidden sm:inline text-blue-400">专业防静电操作台环境</span>
            </div>
          </div>

          {/* Stepper & Progress Rail below Canvas */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-slate-200">
                  标准化装配工序
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  · 当前步骤: {currentStep.title}
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center space-x-1.5 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                <span className="text-slate-400">进度:</span>
                <span className="text-blue-400 font-bold">
                  {Math.round(((currentStepIndex + 1) / assemblyStepsData.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Tactile Pipeline Rail */}
            <div className="relative pt-2 pb-1 px-3">
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 rounded-full bg-slate-800 pointer-events-none" />

              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-1.5 rounded-full bg-blue-600 transition-all duration-500 pointer-events-none"
                style={{
                  width: `calc(${
                    (currentStepIndex / (assemblyStepsData.length - 1)) * 100
                  }% * 0.88)`,
                }}
              />

              {/* Step Node Pucks */}
              <div className="relative z-10 flex items-center justify-between">
                {assemblyStepsData.map((s, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const isPassed = currentStepIndex > idx;
                  return (
                    <button
                      key={s.stepNumber}
                      onClick={() => handleStepChange(idx)}
                      className={`group/step relative flex flex-col items-center transition-all cursor-pointer ${
                        isCurrent ? 'scale-110 z-20' : 'hover:scale-105'
                      }`}
                      title={`${s.stepNumber}. ${s.title} - ${s.subtitle}`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-400/30 shadow-md shadow-blue-500/30'
                            : isPassed
                            ? 'bg-slate-700 text-slate-200 border border-slate-600'
                            : 'bg-slate-850 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {s.stepNumber}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium hidden md:inline-block max-w-[65px] truncate transition-colors ${
                          isCurrent
                            ? 'text-blue-400 font-bold'
                            : isPassed
                            ? 'text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Step Detailed Guide Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-5">
          {/* Step Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  STEP {currentStep.stepNumber} / {assemblyStepsData.length}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50 dark:border-emerald-800/40">
                  已同步 3D 视角
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Prev / Next Step Buttons */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => handleStepChange(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="上一步"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(currentStepIndex + 1)}
                disabled={currentStepIndex === assemblyStepsData.length - 1}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white transition-colors cursor-pointer"
                title="下一步"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Simulate Action Button */}
          <button
            onClick={handleSimulateInstall}
            disabled={isInstalling}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isInstalling ? 'animate-spin' : ''}`} />
            <span>{isInstalling ? '正在执行安装位移...' : '✨ 模拟执行本步骤安装动作'}</span>
          </button>

          {/* Hardware Craft & Specs Snapshot */}
          {stepSpec && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>实时硬件规格与材质快照</span>
                </span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  {stepSpec.highlightTip}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-750 font-mono">
                {stepSpec.craft}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {stepSpec.specs.map((sp, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/40 dark:border-slate-800 text-[11px] space-y-0.5"
                  >
                    <div className="text-slate-400 dark:text-slate-500 text-[10px]">{sp.label}</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {sp.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Instructions List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              标准安装操作指引：
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.instructions.map((ins, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* High-risk Warning Box */}
          {currentStep.criticalWarning && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>防呆防坑高危警示</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {currentStep.criticalWarning}
              </p>
            </div>
          )}

          {/* Debug / Self-check tip */}
          {currentStep.debugCheck && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 text-xs flex items-start space-x-2 text-slate-600 dark:text-slate-300">
              <HelpCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <strong>安装完成自检：</strong>
                <span>{currentStep.debugCheck}</span>
              </div>
            </div>
          )}

          {/* Video timestamp shortcut button */}
          <div className="pt-2">
            <button
              onClick={() => setIsBilibiliModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 hover:bg-pink-100/80 border border-pink-200/80 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 text-xs font-bold transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4" />
                <span>查看此步骤对应 B 站实操精讲 ({currentStep.bilibiliTimestamp})</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bilibili Video Modal */}
      <BilibiliGuidesModal
        isOpen={isBilibiliModalOpen}
        onClose={() => setIsBilibiliModalOpen(false)}
        targetStepTitle={currentStep.title}
      />
    </div>
  );
};
