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
} from 'lucide-react';
import { assemblyStepsData } from '../../data/assemblySteps';
import { PCScene3D } from './PCScene3D';
import { BilibiliGuidesModal } from './BilibiliGuidesModal';

export const AssemblySimulator3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PCScene3D | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [isBilibiliModalOpen, setIsBilibiliModalOpen] = useState(false);

  const currentStep = assemblyStepsData[currentStepIndex];

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D WebGL scene
    const scene = new PCScene3D(containerRef.current);
    sceneRef.current = scene;

    // Set initial step
    scene.setStep(assemblyStepsData[0].stepNumber);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-200/50 dark:border-blue-800/40 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
            <Box className="w-3.5 h-3.5" />
            <span>Three.js 交互式 3D 实景虚拟装机室</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            全三维分步实景拼装 · 零成本体验装机手感
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            支持 360° 自由旋转平移、一键全机爆炸拆解、关键硬件防呆防坑解析，更配有 B 站保姆级实操视频直达。
          </p>
        </div>

        {/* Video Tutorial Launcher Button */}
        <button
          onClick={() => setIsBilibiliModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/25 transition-all shrink-0"
        >
          <Tv className="w-4 h-4" />
          <span>📺 B站保姆级视频精选 (1500万+播放)</span>
        </button>
      </div>

      {/* Main 3D Canvas + Step Instructions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Stage (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1726] to-[#0a0f1d] border border-slate-700/80 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
          {/* Ambient Studio Lighting Glow Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(56,189,248,0.18),transparent_65%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none" />
          {/* Subtle Cyber Grid Floor Markings */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf806_1px,transparent_1px),linear-gradient(to_bottom,#38bdf806_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="w-full h-[400px] sm:h-[500px] cursor-grab active:cursor-grabbing relative z-10"
          >
            {/* On-canvas Controls Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
              <button
                onClick={handleToggleExplode}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isExploded
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                    : 'bg-slate-800/80 backdrop-blur-md text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isExploded ? '合体复原主机' : '💥 一键爆炸拆解透视'}</span>
              </button>

              <button
                onClick={handleResetCamera}
                className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-md"
                title="重置视角"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hint in canvas bottom */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur-xs px-3 py-1.5 rounded-xl">
              <span>🖱️ 按住鼠标左键拖拽 360° 旋转 · 滚轮缩放</span>
              <span className="hidden sm:inline">硬件安装高亮联动中</span>
            </div>
          </div>

          {/* Cyber Pipeline Stepper & Progress Rail below Canvas */}
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-cyan-400 font-bold tracking-wider">
                  CYBER 装机流水线
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  · 当前步骤: {currentStep.title}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-300 flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-500">工序进度:</span>
                <span className="text-cyan-400 font-bold">
                  {Math.round(((currentStepIndex + 1) / assemblyStepsData.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Tactile Pipeline Groove Rail */}
            <div className="relative pt-2 pb-1 px-3">
              {/* Background Groove Rail */}
              <div className="machined-groove-track absolute top-1/2 left-6 right-6 -translate-y-1/2 h-2 rounded-full pointer-events-none" />

              {/* Active Illuminated Progress Fill */}
              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 shadow-[0_0_12px_rgba(6,182,212,0.8)] transition-all duration-500 pointer-events-none"
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
                      className={`group/step relative flex flex-col items-center transition-all ${
                        isCurrent ? 'scale-110 z-20' : 'hover:scale-105'
                      }`}
                      title={`${s.stepNumber}. ${s.title} - ${s.subtitle}`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-black transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 ring-4 ring-cyan-400/30 shadow-[0_0_16px_rgba(6,182,212,0.9)]'
                            : isPassed
                            ? 'bg-blue-600 text-white shadow-xs border border-blue-400'
                            : 'bg-slate-850 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {s.stepNumber}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium hidden md:inline-block max-w-[65px] truncate transition-colors ${
                          isCurrent
                            ? 'text-cyan-400 font-bold'
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
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 space-y-5">
          {/* Step Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                STEP {currentStep.stepNumber} / {assemblyStepsData.length}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Prev / Next Step Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handleStepChange(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="上一步"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(currentStepIndex + 1)}
                disabled={currentStepIndex === assemblyStepsData.length - 1}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white transition-colors"
                title="下一步"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actionable Instructions List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              标准安装操作指引：
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentStep.instructions.map((ins, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 mt-0.5 shrink-0" />
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
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 hover:bg-pink-100/80 border border-pink-200/80 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 text-xs font-bold transition-all"
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
