import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** A bounded CSS glass surface; pointer light follows at most once per display frame. */
export function LiquidGlass({ children, className = '', reduced = false, style, label }: {
  children: ReactNode; className?: string; reduced?: boolean; style?: CSSProperties; label?: string;
}) {
  const node = useRef<HTMLDivElement>(null); const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return <div ref={node} className={`assembly-liquid-glass ${className}`} style={style} role={label ? 'group' : undefined} aria-label={label}
    onPointerMove={event => {
      if (reduced || event.pointerType === 'touch') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left; const y = event.clientY - bounds.top;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => { node.current?.style.setProperty('--glass-x', `${x}px`); node.current?.style.setProperty('--glass-y', `${y}px`); });
    }}
    onPointerLeave={() => { cancelAnimationFrame(frame.current); node.current?.style.removeProperty('--glass-x'); node.current?.style.removeProperty('--glass-y'); }}>
    {children}
  </div>;
}
