import { useState } from 'react';
import { ArrowRight, ArrowUpRight, RotateCcw, Rotate3D, SlidersHorizontal, Cpu, Box } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { HardwareImage } from '../wiki/HardwareImage';
import { PrototypeCanvas } from './PrototypeCanvas';
import { clampSeparation, previewSources, type PreviewModel } from './previewState';
import type { RenderingQuality } from '../assembly/renderingBudget';
import type { ActiveTab, HardwareCategory } from '../../types';
import { computeTabNavigationUrl } from '../../utils/navigation';
import './lab.css';

export function DesignLab({ onNavigate }: { onNavigate: (tab: ActiveTab, options?: { targetUrl?: string }) => void }) {
  const { lang } = useLanguage(); const en = lang === 'en';
  const [studio, setStudio] = useState(false);
  const [model, setModel] = useState<PreviewModel>('socket');
  const [separation, setSeparation] = useState(1);
  const [quality, setQuality] = useState<RenderingQuality>('balanced');
  const [reduced, setReduced] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [rotateKey, setRotateKey] = useState(0);
  function selectView(next: boolean) { setStudio(next); setSeparation(next ? 0 : 1); setModel('socket'); setResetKey(value => value + 1); }
  function explore(category: HardwareCategory) {
    const url = new URL(computeTabNavigationUrl(window.location.href, 'wiki'), window.location.origin);
    url.searchParams.set('category', category);
    onNavigate('wiki', { targetUrl: `${url.pathname}${url.search}${url.hash}` });
  }
  const socketSteps = en
    ? [['01', 'Release the retention', 'The frame opens before the processor moves.'], ['02', 'Align the corner mark', 'LGA contacts stay in the socket; the package stays intact.'], ['03', 'Observe the fit', 'Use separation to understand the structure, not as an installation guide.']]
    : [['01', '先打开压框', '压框与锁杆松开后，处理器才能向上分离。'], ['02', '认准三角标记', '触点留在插槽内，处理器始终保持完整封装。'], ['03', '看清装配关系', '通过分解观察结构；实际安装请遵循主板说明书。']];
  const systemSteps = en
    ? [['01', 'Start with the board', 'Locate the processor, memory and storage on their shared foundation.'], ['02', 'Follow the airflow', 'Observe the tower cooler, case fans and graphics card.'], ['03', 'Read the layers', 'Separation reveals component relationships; it does not verify clearance.']]
    : [['01', '从主板开始', '观察处理器、内存与存储，理解它们共同的装配基础。'], ['02', '沿着风道观察', '找到塔式散热器、机箱风扇与显卡的位置关系。'], ['03', '看清装配层次', '展开零件以理解结构，不以模型间隙判断兼容性。']];
  const steps = model === 'socket' ? socketSteps : systemSteps;
  return <section className={`design-lab ${reduced ? 'lab-reduced' : ''}`} aria-labelledby="lab-title">
    <div className="lab-topline">
      <span className="lab-edition"><i />{en ? 'Design preview' : '设计样稿'}<span>01 — 2026.10</span></span>
      <div className="lab-view-switch lab-glass" role="group" aria-label={en ? 'Preview layout' : '样稿视图'}>
        <button aria-pressed={!studio} onClick={() => selectView(false)}>{en ? 'Showroom' : '展厅'}</button>
        <button aria-pressed={studio} onClick={() => selectView(true)}>{en ? 'Workbench' : '装配台'}</button>
      </div>
    </div>

    {studio && <div className="lab-studio-heading"><div><h1 id="lab-title">{en ? 'Every detail, considered.' : '每一个细节，都有依据。'}</h1><p>{en ? 'Observe the structure. Understand the assembly.' : '观察结构，理解装配。'}</p></div><button className="lab-text-button" onClick={() => onNavigate('wiki')}>{en ? 'Hardware library' : '硬件资料库'}<ArrowUpRight size={16} /></button></div>}
    <div className={studio ? 'lab-workbench' : 'lab-showroom'}>
      {!studio && <div className="lab-hero-copy"><span className="lab-kicker">SILICON / MATERIAL STUDIES</span><h1 id="lab-title">{en ? <>Understand hardware.<br /><em>See the precision.</em></> : <>读懂硬件。<br /><em>看见精密。</em></>}</h1><p>{en ? <>From a single processor to a complete build.<br />Make informed choices through real structure.</> : <>从一枚处理器，到一台电脑。<br />在真实的结构里，理解每一次选择。</>}</p><div className="lab-hero-actions"><button className="lab-primary" onClick={() => selectView(true)}>{en ? 'Enter workbench' : '进入装配台'}<ArrowRight size={17} /></button><button className="lab-text-button" onClick={() => onNavigate('wiki')}>{en ? 'Hardware library' : '硬件资料库'}<ArrowUpRight size={16} /></button></div><div className="lab-hero-footnote"><span>01 / AM5</span><span>{en ? 'An original structural study' : '原创结构教学样稿'}</span></div></div>}

      <div className={`lab-stage ${studio ? 'lab-stage-studio' : ''}`}>
        <div className="lab-stage-caption"><span>{model === 'socket' ? 'PROCESSOR / SOCKET' : 'SYSTEM / ASSEMBLY'}</span><span>{en ? 'REPRESENTATIVE MODEL' : '代表性模型'}</span></div>
        <PrototypeCanvas model={model} separation={separation} quality={reduced ? 'saver' : quality} resetKey={resetKey} rotateKey={rotateKey} />
        <p className="lab-gesture-note">{en ? 'Drag to orbit · Scroll to zoom' : '拖动旋转 · 滚轮缩放'}</p>
        <div className="lab-model-toolbar lab-glass" role="group" aria-label={en ? 'Model controls' : '模型控制'}>
          <button aria-pressed={model === 'socket'} onClick={() => setModel('socket')}><Cpu size={16} /><span>{en ? 'CPU & socket' : '处理器与插槽'}</span></button>
          <button aria-pressed={model === 'system'} onClick={() => setModel('system')}><Box size={16} /><span>{en ? 'Full build' : '整机'}</span></button>
          <span className="lab-divider" />
          <button onClick={() => setRotateKey(value => value + 1)} aria-label={en ? 'Rotate view 45 degrees' : '旋转视角 45 度'} title={en ? 'Rotate view 45 degrees' : '旋转视角 45 度'}><Rotate3D size={17} /></button>
          <button onClick={() => setResetKey(value => value + 1)} aria-label={en ? 'Reset view' : '重置视角'} title={en ? 'Reset view' : '重置视角'}><RotateCcw size={16} /></button>
        </div>
      </div>

      {studio && <aside className="lab-inspector" aria-label={en ? 'Model details' : '模型说明'}>
        <div className="lab-inspector-index">{model === 'socket' ? '01' : '02'}<span>{en ? 'STRUCTURE STUDY' : '结构观察'}</span></div>
        <h2>{model === 'socket' ? (en ? 'Processor & socket' : '处理器与插槽') : (en ? 'Inside the build' : '从零件到整机')}</h2>
        <p className="lab-inspector-intro">{model === 'socket' ? (en ? 'Find the corner mark. Understand how the package meets the socket.' : '对齐三角标记，看清封装与插槽如何接合。') : (en ? 'Follow the motherboard, cooling and graphics card through the chassis.' : '沿着主板、散热器与显卡，观察机箱内的装配层次。')}</p>
        <dl className="lab-model-facts"><div><dt>{en ? 'Study' : '结构参考'}</dt><dd>{model === 'socket' ? 'AM5 / LGA' : 'ATX / Mid tower'}</dd></div><div><dt>{en ? 'Materials' : '材质观察'}</dt><dd>{en ? 'Metal · PCB · Polymer' : '金属 · PCB · 塑料'}</dd></div><div><dt>{en ? 'Precision' : '精度说明'}</dt><dd>{en ? 'Representative geometry' : '代表性几何'}</dd></div></dl>
        <div className="lab-separation"><label htmlFor="lab-separation">{en ? 'Separation' : '分解程度'}<output htmlFor="lab-separation">{Math.round(separation * 100)}%</output></label><input id="lab-separation" type="range" min="0" max="100" step="1" value={separation * 100} onChange={event => setSeparation(clampSeparation(Number(event.target.value) / 100))} /><div><span>{en ? 'Assembled' : '合拢'}</span><span>{en ? 'Separated' : '展开'}</span></div></div>
        <button className="lab-primary lab-separate-button" onClick={() => setSeparation(separation < .5 ? 1 : 0)}>{separation < .5 ? (en ? 'Separate parts' : '分解观察') : (en ? 'Reassemble' : '合拢观察')}<ArrowRight size={17} /></button>
        <p className="lab-accuracy-note">{en ? 'Original teaching geometry, not product CAD. Contact count, dimensions and clearances are simplified and must not be used for fit checks.' : '原创教学几何，非产品 CAD。触点数量、尺寸与间隙均作简化，不作为硬件兼容性判断依据。'}</p>
        <details className="lab-sources"><summary>{en ? 'Structure references' : '查看结构参考来源'}</summary>{previewSources.map(source => <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={14} /></a>)}<p>{en ? 'References support alignment and installation order, not the dimensions of this model. Reviewed 2026-10-29.' : '来源用于核对对齐与安装顺序，不证明模型尺寸精度。核对日期：2026-10-29。'}</p></details>
      </aside>}
    </div>

    <div className="lab-display-settings"><span><SlidersHorizontal size={14} />{en ? 'Display' : '显示效果'}</span><label htmlFor="lab-quality" className="lab-sr-only">{en ? 'Rendering quality' : '渲染画质'}</label><select id="lab-quality" value={reduced ? 'saver' : quality} disabled={reduced} onChange={event => setQuality(event.target.value as RenderingQuality)}><option value="saver">{en ? 'Power saving' : '省电'}</option><option value="balanced">{en ? 'Balanced' : '均衡'}</option><option value="quality">{en ? 'Detailed' : '精细'}</option></select><button className="lab-effects-toggle" aria-pressed={reduced} onClick={() => setReduced(value => !value)}><span className="lab-toggle-track"><i /></span>{en ? 'Reduce effects' : '减少效果'}</button><span className="lab-idle-note">{en ? 'Renders only when the view changes' : '仅在视图变化时绘制'}</span></div>

    {studio ? <div className="lab-steps">{steps.map(([number, title, detail]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div> : <section className="lab-explore" aria-labelledby="lab-explore-title"><div className="lab-section-heading"><h2 id="lab-explore-title">{en ? 'Start at the core.' : '从核心开始探索'}</h2><span>{en ? 'Three ways into the hardware library' : '从三个切面，走进硬件世界'}</span></div><div className="lab-category-grid">{([
      ['cpu', en ? 'Processors' : '处理器', en ? 'Where every instruction begins.' : '每一条指令，从这里开始。', '01'],
      ['gpu', en ? 'Graphics cards' : '显卡', en ? 'Turn computation into something you can see.' : '让运算，成为看得见的力量。', '02'],
      ['ram', en ? 'Memory' : '内存', en ? 'Keep pace with every task.' : '承接数据，跟上每一拍节奏。', '03'],
    ] as const).map(([category, title, copy, number]) => <button className="lab-category" key={category} onClick={() => explore(category)}><div className="lab-category-top"><span>{number}</span><ArrowUpRight size={20} /></div><div className="lab-category-art"><HardwareImage category={category} brand="SiliconWiki" name={title} /></div><h3>{title}</h3><p>{copy}</p></button>)}</div></section>}
    <div className="lab-bottom-note"><span>{en ? 'Visual & model preview · v2.6.0-preview.1' : '视觉与模型样稿 · v2.6.0-preview.1'}</span><span>{en ? 'Illustrative assets. No live pricing feed is connected in this preview.' : '图像与模型均为示意，本样稿尚未接入实时价格。'}</span></div>
  </section>;
}
