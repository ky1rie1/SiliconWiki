import { useEffect, useRef, useState } from 'react';
import { Box, RotateCcw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { PreviewModel } from './previewState';
import type { RenderingQuality } from '../assembly/renderingBudget';
import type { PrototypeScene } from './PrototypeScene';

export interface PrototypeCanvasProps {
  model: PreviewModel;
  separation: number;
  quality: RenderingQuality;
  resetKey: number;
  rotateKey: number;
}

export function PrototypeCanvas(props: PrototypeCanvasProps) {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const en = lang === 'en';
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<PrototypeScene>();
  const latest = useRef({ ...props, theme }); latest.current = { ...props, theme };
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const failed = () => { if (!cancelled) { scene.current?.dispose(); scene.current = undefined; setStatus('failed'); } };
    import('./PrototypeScene').then(({ PrototypeScene }) => {
      if (cancelled || !host.current) return;
      scene.current = new PrototypeScene(host.current, failed);
      const current = latest.current;
      scene.current.setTheme(current.theme === 'dark');
      scene.current.setQuality(current.quality);
      scene.current.setView(current.model, current.separation);
      setStatus('ready');
    }).catch(failed);
    return () => { cancelled = true; scene.current?.dispose(); scene.current = undefined; };
  }, [attempt]);
  useEffect(() => { scene.current?.setView(props.model, props.separation); }, [props.model, props.separation]);
  useEffect(() => { scene.current?.setQuality(props.quality); }, [props.quality]);
  useEffect(() => { scene.current?.setTheme(theme === 'dark'); }, [theme]);
  useEffect(() => { scene.current?.resetCamera(); }, [props.resetKey]);
  useEffect(() => { if (props.rotateKey) scene.current?.rotateQuarter(); }, [props.rotateKey]);
  return <div className="lab-canvas-wrap" role="group" aria-label={en ? 'Interactive hardware teaching model. Use the view and separation controls below.' : '交互式硬件教学模型，可用下方视角与分解控件操作。'}>
    <div ref={host} className="lab-canvas" />
    {status !== 'ready' && <div className="lab-canvas-message" role="status">
      <Box size={32} strokeWidth={1} />
      <strong>{status === 'failed' ? (en ? '3D preview unavailable' : '暂时无法显示 3D 样稿') : (en ? 'Preparing the study…' : '正在准备模型样稿…')}</strong>
      {status === 'failed' && <><p>{en ? 'Try again with WebGL enabled. The notes and hardware library remain available.' : '请启用 WebGL 后重试，仍可查看结构说明与硬件库。'}</p><button className="lab-text-button" onClick={() => setAttempt(value => value + 1)}><RotateCcw size={16} />{en ? 'Try again' : '重新加载'}</button></>}
    </div>}
  </div>;
}
