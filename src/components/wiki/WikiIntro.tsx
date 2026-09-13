import { ArrowDown, ArrowUpRight, BarChart3, Box } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { hardwareList } from '../../data/hardware';
import { glossaryTerms } from '../../data/glossary';
import { ActiveTab } from '../../types';

export function WikiIntro({ onNavigate }: { onNavigate: (tab: ActiveTab) => void }) {
  const { lang } = useLanguage();
  const en = lang === 'en';
  return (
    <section className="wiki-intro" aria-labelledby="wiki-title">
      <div className="wiki-intro-copy">
        <p className="section-eyebrow"><span />{en ? 'A field guide to computer hardware' : '芯知 · 计算机硬件知识库'}</p>
        <h1 id="wiki-title">{en ? <>Know your hardware.<br /><em>Build with confidence.</em></> : <>读懂每一块硬件。<br /><em>装出自己的答案。</em></>}</h1>
        <p className="page-description">{en ? 'Explore the specs, compare the performance, and understand how it all fits together. Your next build starts here.' : '从核心参数到性能差距，从选购思路到动手装机。把复杂的硬件知识，变成每一次选择的底气。'}</p>
        <div className="intro-actions">
          <a
            href="#hardware-catalog"
            className="primary-action"
            onClick={(event) => {
              event.preventDefault();
              const target = document.getElementById('hardware-catalog');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.focus({ preventScroll: true });
              }
            }}
          >
            {en ? 'Explore hardware' : '探索硬件库'}
            <ArrowDown size={16} />
          </a>
          <button className="text-action" onClick={() => onNavigate('builds')}>
            {en ? 'Find your next build' : '按预算找配置'}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <dl className="intro-stats">
          <div><dt>{en ? 'Hardware models' : '硬件型号'}</dt><dd>{hardwareList.length}<span>+</span></dd></div>
          <div><dt>{en ? 'Categories' : '硬件分类'}</dt><dd>{new Set(hardwareList.map(item => item.category)).size.toString().padStart(2, '0')}</dd></div>
          <div><dt>{en ? 'Explained terms' : '技术名词'}</dt><dd>{glossaryTerms.length}<span>+</span></dd></div>
        </dl>
      </div>
      <div className="intro-visual">
        <div className="chip-blueprint" aria-hidden="true">
          <div className="blueprint-caption"><span>SILICON / FIELD NOTES</span><span>FIG. 01</span></div>
          <div className="chip-orbit orbit-one" /><div className="chip-orbit orbit-two" />
          <div className="chip-package"><div className="chip-die"><img src="/logo-icon.svg" alt="" width="24" height="24" /><span>Si</span><small>EVERY BIT MATTERS</small></div></div>
          <span className="blueprint-coordinate">01 / EXPLORE THE CORE</span><span className="blueprint-cross">+</span>
        </div>
        <div className="intro-tool-links">
          <button onClick={() => onNavigate('rankings')}><BarChart3 size={19} /><span><strong>{en ? 'Performance ladder' : '性能天梯'}</strong><small>{en ? 'Put the numbers in perspective' : '让性能差距一目了然'}</small></span><ArrowUpRight size={16} /></button>
          <button onClick={() => onNavigate('simulator3d')}><Box size={19} /><span><strong>{en ? '3D assembly studio' : '3D 装机实验室'}</strong><small>{en ? 'Discover how the parts fit' : '从零件到整机，亲手探索'}</small></span><ArrowUpRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}
