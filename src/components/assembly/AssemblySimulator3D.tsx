import { PageHeader } from '../layout/PageHeader';
import React, { useState, useEffect, useRef } from 'react';
import {
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
  Scan,
  Focus,
  Box,
} from 'lucide-react';
import { assemblyStepsData } from '../../data/assemblySteps';
import {
  stepSpecsMapZh,
  stepSpecsMapEn,
  componentNameMapZh,
  componentNameMapEn,
  stepTranslationsEn,
} from '../../data/assemblyTranslationsEn';
import { PCScene3D } from './PCScene3D';
import { BilibiliGuidesModal } from './BilibiliGuidesModal';
import { useLanguage } from '../../context/LanguageContext';

export const AssemblySimulator3D: React.FC = () => {
  const { t, lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PCScene3D | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [isBilibiliModalOpen, setIsBilibiliModalOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hoveredComponentName, setHoveredComponentName] = useState<string | null>(null);

  const [sceneError, setSceneError] = useState(false);
  const [sceneVersion, setSceneVersion] = useState(0);
  const [installProgress, setInstallProgress] = useState(100);
  const mountedRef = useRef(false);

  const rawStep = assemblyStepsData[currentStepIndex];
  const stepTranslation = lang === 'en' ? stepTranslationsEn[rawStep.stepNumber] : undefined;
  const currentStep = {
    ...rawStep,
    title: stepTranslation?.title || rawStep.title,
    subtitle: stepTranslation?.subtitle || rawStep.subtitle,
    summary: stepTranslation?.summary || rawStep.summary,
    instructions: stepTranslation?.instructions || rawStep.instructions,
    criticalWarning: stepTranslation?.criticalWarning ?? rawStep.criticalWarning,
    debugCheck: stepTranslation?.debugCheck ?? rawStep.debugCheck,
  };

  const stepSpecsMap = lang === 'en' ? stepSpecsMapEn : stepSpecsMapZh;
  const componentNameMap = lang === 'en' ? componentNameMapEn : componentNameMapZh;
  const stepSpec = stepSpecsMap[currentStep.componentKey];

  const handleStepChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= assemblyStepsData.length) return;
    setCurrentStepIndex(newIndex);
    setIsInstalling(false);
    const step = assemblyStepsData[newIndex];
    if (sceneRef.current) {
      sceneRef.current.setStep(step.stepNumber);

    }
  };

  const handleStepChangeRef = useRef(handleStepChange);
  handleStepChangeRef.current = handleStepChange;

  useEffect(() => {
    if (!containerRef.current) return;

    mountedRef.current = true;
    let scene: PCScene3D;
    try { scene = new PCScene3D(containerRef.current); }
    catch { setSceneError(true); return () => { mountedRef.current = false; }; }
    sceneRef.current = scene;
    setSceneError(false);
    scene.onError = () => { setSceneError(true); setIsInstalling(false); sceneRef.current = null; };
    scene.onAnimationProgress = setInstallProgress;

    // Set initial step
    const selected = assemblyStepsData[currentStepIndex];
    scene.setStep(selected.stepNumber);
    scene.setExploded(isExploded);

    // 3D Model click syncs to React state and updates right-hand panel
    scene.onComponentClick = (componentId: string) => {
      const targetIndex = assemblyStepsData.findIndex(
        (s) =>
          s.componentKey === componentId ||
          (componentId === 'thermal-paste' && (s.componentKey === 'cooler' || s.stepNumber === 4)) ||
          (componentId === 'case-glass' && (s.componentKey === 'case' || s.stepNumber === 9))
      );
      if (targetIndex !== -1) {
        handleStepChangeRef.current(targetIndex);
      }
    };

    scene.onComponentHover = (compName: string | null) => {
      setHoveredComponentName(compName);
    };

    return () => {
      mountedRef.current = false;
      scene.onAnimationProgress = undefined;
      scene.onComponentHover = undefined;
      scene.dispose();
      sceneRef.current = null;
    };
    // The live controller handles step/explode changes; retry alone recreates the scene.
  }, [sceneVersion]);

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
    setIsExploded(false);
    sceneRef.current.animateInstallStep(currentStep.stepNumber, () => {
      if (mountedRef.current) setIsInstalling(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader eyebrow={t('assemblyHeroBadge')} title={t('assemblyHeroTitle')} description={t('assemblyHeroDesc')} actions={<button className="primary-action" onClick={() => setIsBilibiliModalOpen(true)}><Tv size={16} />{t('btnBilibiliGuides')}</button>} />

      {/* Main 3D Canvas + Step Instructions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Stage (7 Cols) */}
        <div className="assembly-studio lg:col-span-7 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative transition-colors">
          <div className="assembly-studio-heading">
            <div><span className="assembly-studio-kicker">SILICON WIKI / LAB 01</span><h3>{lang === 'zh' ? '装配研究室' : 'Assembly studio'}</h3></div>
            <span className="assembly-studio-spec">ATX · AM5<br /><span>{lang === 'zh' ? '示意模型' : 'Illustrative model'}</span></span>
          </div>
          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="assembly-viewport w-full h-[400px] sm:h-[520px] cursor-grab active:cursor-grabbing relative z-10 overflow-hidden"
          >
            {sceneError && <div className="assembly-scene-error" role="status"><Box size={36} /><strong>{lang === 'zh' ? '3D 场景暂不可用' : '3D view is unavailable'}</strong><p>{lang === 'zh' ? '可继续阅读装机步骤，或重试加载场景。' : 'Follow the written guide, or try loading the scene again.'}</p><button className="primary-action" onClick={() => setSceneVersion(value => value + 1)}>{lang === 'zh' ? '重新加载' : 'Retry'}</button></div>}
            {/* On-canvas Controls Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
              <button
                onClick={handleToggleExplode}
                disabled={sceneError}
                aria-pressed={isExploded}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isExploded
                    ? 'bg-[#F7D84A] text-zinc-950 ring-2 ring-[#F7D84A]/50 font-bold'
                    : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isExploded ? t('btnExplodeRestore') : t('btnExplodeToggle')}</span>
              </button>

              <button
                onClick={handleResetCamera}
                disabled={sceneError}
                aria-label={t('btnResetView')}
                className="p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs cursor-pointer"
                title={t('btnResetView')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button className="assembly-camera-button" disabled={sceneError} onClick={() => sceneRef.current?.setCameraView('front')} title={lang === 'zh' ? '正面查看' : 'Front view'} aria-label={lang === 'zh' ? '正面查看' : 'Front view'}><Scan size={15} /></button>
              <button className="assembly-camera-button" disabled={sceneError} onClick={() => sceneRef.current?.setCameraView('detail')} title={lang === 'zh' ? '零件特写' : 'Component detail'} aria-label={lang === 'zh' ? '零件特写' : 'Component detail'}><Focus size={15} /></button>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredComponentName && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold backdrop-blur-md shadow-lg pointer-events-none animate-in fade-in duration-150 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F7D84A] animate-pulse" />
                <span>{t('componentLabel', { name: componentNameMap[hoveredComponentName] || (hoveredComponentName === 'case-glass' ? (lang === 'zh' ? '侧面玻璃' : 'Side glass') : hoveredComponentName) })}</span>
              </div>
            )}

            {/* Hint in canvas bottom */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[11px] text-zinc-600 dark:text-zinc-400 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span>{t('cameraHintFull')}</span>
              <span className="hidden sm:inline text-zinc-800 dark:text-zinc-200 font-medium">
                {currentStepIndex < 4 ? (lang === 'zh' ? '平放预装' : 'Bench assembly') : (lang === 'zh' ? '机箱装配' : 'Case assembly')}
              </span>
            </div>
          </div>

          <div className="assembly-status-line" aria-live="polite"><span className={`assembly-status-dot ${currentStepIndex === 8 && !isExploded && installProgress >= 72 ? 'is-powered' : ''}`} /><span>{isInstalling ? (lang === 'zh' ? `装配演示 · ${installProgress}%` : `Installing · ${installProgress}%`) : isExploded ? (lang === 'zh' ? '分解观察 · 线缆暂时隐藏' : 'Exploded view · cables hidden') : currentStepIndex === 8 ? (lang === 'zh' ? '通电状态示意 · 非实际 POST 检测' : 'Power-on illustration · no POST diagnostics') : (lang === 'zh' ? '断电装配 · 风扇静止' : 'Power disconnected · fans stopped')}</span><span className="ml-auto font-mono">{String(currentStepIndex + 1).padStart(2, '0')} / 09</span></div>
          {/* Stepper & Progress Rail below Canvas */}
          <div className="p-4 bg-zinc-50 dark:bg-slate-900 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#e5a912] dark:text-[#F7D84A]" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {t('standardizedAssemblySteps')}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                  · {t('currentStepLabel')} {currentStep.title}
                </span>
              </div>
              <div className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono shadow-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{t('progressLabel')}</span>
                <span className="text-zinc-900 dark:text-[#F7D84A] font-bold">
                  {Math.round(((currentStepIndex + 1) / assemblyStepsData.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Tactile Pipeline Rail */}
            <div className="relative pt-2 pb-1 px-3">
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 pointer-events-none" />

              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-1.5 rounded-full bg-zinc-900 dark:bg-[#F7D84A] transition-all duration-500 pointer-events-none"
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
                  const localizedStep = lang === 'en' ? stepTranslationsEn[s.stepNumber] : undefined;
                  const displayTitle = localizedStep?.title || s.title;

                  return (
                    <button
                      key={s.stepNumber}
                      onClick={() => handleStepChange(idx)}
                      className={`group/step relative flex flex-col items-center transition-all cursor-pointer ${
                        isCurrent ? 'scale-110 z-20' : 'hover:scale-105'
                      }`}
                      title={`${s.stepNumber}. ${displayTitle}`}
                      aria-label={`${s.stepNumber}. ${displayTitle}`}
                      aria-current={isCurrent ? 'step' : undefined}
                      data-step={s.stepNumber}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 ring-4 ring-[#F7D84A]/50 shadow-sm'
                            : isPassed
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        {s.stepNumber}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium hidden md:inline-block max-w-[65px] truncate transition-colors ${
                          isCurrent
                            ? 'text-zinc-900 dark:text-[#F7D84A] font-bold'
                            : isPassed
                            ? 'text-zinc-700 dark:text-zinc-300'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {displayTitle.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Step Detailed Guide Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-md p-6 transition-colors">
          <div key={currentStepIndex} className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-mono">
                    {t('stepTitle', { current: currentStep.stepNumber, total: assemblyStepsData.length })}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7D84A]/10 text-zinc-900 dark:text-[#F7D84A] border border-[#F7D84A]/30 shadow-xs">
                    {t('currentStepFocus')}{componentNameMap[currentStep.componentKey] || currentStep.title.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium border border-emerald-200/50 dark:border-emerald-800/40">
                    {t('synced3DView')}
                  </span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Prev / Next Step Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => handleStepChange(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title={t('btnPrevStep')}
                  aria-label={t('btnPrevStep')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStepChange(currentStepIndex + 1)}
                  disabled={currentStepIndex === assemblyStepsData.length - 1}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-30 text-white dark:text-zinc-900 transition-colors cursor-pointer"
                  title={t('btnNextStep')}
                  aria-label={t('btnNextStep')}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Step Summary Box (Crucial overview of current step) */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-200 flex items-start space-x-2.5 leading-relaxed">
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-bold mt-0.5 shadow-xs">
                {t('stepSummaryBadge')}
              </span>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{currentStep.summary}</p>
            </div>

            {/* Interactive Simulate Action Button */}
            <button
              onClick={handleSimulateInstall}
              disabled={isInstalling || sceneError}
              data-action="install"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-950 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-[#F7D84A] dark:text-[#d4990d] ${isInstalling ? 'animate-spin' : ''}`} />
              <span>{isInstalling ? t('simulatingInstallBtn') : t('simulateInstallBtn')}</span>
            </button>

            {/* Hardware Craft & Specs Snapshot */}
            {stepSpec && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex flex-col gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <span className="flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#e5a912] dark:text-[#F7D84A]" />
                    <span>{t('hardwareCraftSnapshot')}</span>
                  </span>
                  <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
                    {stepSpec.highlightTip}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono">
                  {stepSpec.craft}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {stepSpec.specs.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-0.5"
                    >
                      <div className="text-zinc-400 dark:text-zinc-500 text-[10px]">{sp.label}</div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed break-words">
                        {sp.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Instructions List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t('guideTitle')}
              </div>
              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {currentStep.instructions.map((ins, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-[#F7D84A] mt-0.5 shrink-0" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* High-risk Warning Box */}
            {currentStep.criticalWarning && (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('warningTitle')}</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                  {currentStep.criticalWarning}
                </p>
              </div>
            )}

            {/* Debug / Self-check tip */}
            {currentStep.debugCheck && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs flex items-start space-x-2 text-zinc-700 dark:text-zinc-300">
                <HelpCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200 mr-1">{t('debugTitle')}</strong>
                  <span>{currentStep.debugCheck}</span>
                </div>
              </div>
            )}

            {/* Video timestamp shortcut button */}
            <div className="pt-2">
              <button
                onClick={() => setIsBilibiliModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Tv className="w-4 h-4 text-[#F7D84A]" />
                  <span>{t('btnViewVideoStep', { time: currentStep.bilibiliTimestamp || '' })}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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
