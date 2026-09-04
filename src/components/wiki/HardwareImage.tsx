import React, { useState } from 'react';
import { HardwareCategory } from '../../types';
import {
  Cpu,
  Tv,
  HardDrive,
  Zap,
  Flame,
  Box,
  Laptop,
} from 'lucide-react';

interface HardwareImageProps {
  category: HardwareCategory;
  name: string;
  brand: string;
  imageUrl?: string;
}

export const HardwareImage: React.FC<HardwareImageProps> = ({
  category,
  name,
  brand,
  imageUrl,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Category Theme Colors
  const getTheme = () => {
    switch (category) {
      case 'cpu':
        return {
          gradient: 'from-amber-500/10 via-slate-100/50 to-slate-100 dark:from-amber-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-amber-600 dark:text-amber-500',
          border: 'border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        };
      case 'gpu':
        return {
          gradient: 'from-emerald-500/10 via-slate-100/50 to-slate-100 dark:from-emerald-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-emerald-600 dark:text-emerald-500',
          border: 'border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        };
      case 'motherboard':
        return {
          gradient: 'from-indigo-500/10 via-slate-100/50 to-slate-100 dark:from-indigo-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-indigo-600 dark:text-indigo-500',
          border: 'border-indigo-500/20',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        };
      case 'ram':
        return {
          gradient: 'from-cyan-500/10 via-slate-100/50 to-slate-100 dark:from-cyan-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-cyan-600 dark:text-cyan-500',
          border: 'border-cyan-500/20',
          badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        };
      case 'storage':
        return {
          gradient: 'from-violet-500/10 via-slate-100/50 to-slate-100 dark:from-violet-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-violet-600 dark:text-violet-500',
          border: 'border-violet-500/20',
          badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        };
      case 'psu':
        return {
          gradient: 'from-yellow-500/10 via-slate-100/50 to-slate-100 dark:from-yellow-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-yellow-600 dark:text-yellow-500',
          border: 'border-yellow-500/20',
          badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        };
      case 'cooler':
        return {
          gradient: 'from-sky-500/10 via-slate-100/50 to-slate-100 dark:from-sky-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-sky-600 dark:text-sky-500',
          border: 'border-sky-500/20',
          badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        };
      case 'case':
        return {
          gradient: 'from-blue-500/10 via-slate-100/50 to-slate-100 dark:from-blue-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-blue-600 dark:text-blue-500',
          border: 'border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        };
      case 'laptop':
      default:
        return {
          gradient: 'from-purple-500/10 via-slate-100/50 to-slate-100 dark:from-purple-500/10 dark:via-slate-900/60 dark:to-[#070b14]',
          accent: 'text-purple-600 dark:text-purple-500',
          border: 'border-purple-500/20',
          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        };
    }
  };

  const theme = getTheme();

  // High-Tech Schematic SVG Illustrations for each hardware category
  const renderSchematicSvg = () => {
    switch (category) {
      case 'cpu':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* Silicon Substrate */}
            <rect x="55" y="15" width="90" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
            {/* Integrated Heat Spreader (IHS) */}
            <rect x="65" y="25" width="70" height="70" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="75" y="35" width="50" height="50" rx="3" fill="#475569" />
            {/* Pin 1 Golden Alignment Triangle */}
            <polygon points="57,17 67,17 57,27" fill="#f59e0b" />
            {/* Circuit Traces */}
            <line x1="20" y1="40" x2="55" y2="40" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="20" y1="60" x2="55" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="20" y1="80" x2="55" y2="80" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="145" y1="40" x2="180" y2="40" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="145" y1="60" x2="180" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="145" y1="80" x2="180" y2="80" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
            {/* Surface Mount Capacitors */}
            <rect x="85" y="98" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="97" y="98" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="109" y="98" width="8" height="4" fill="#fbbf24" rx="1" />
            {/* Center Laser Marking Text */}
            <text x="100" y="58" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="bold" fontFamily="monospace">
              {brand}
            </text>
            <text x="100" y="70" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
              LGA / AM5
            </text>
          </svg>
        );

      case 'gpu':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* GPU Shroud & Backplate */}
            <rect x="25" y="25" width="150" height="70" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
            {/* Cooling Fin Lines */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={i} x1={32 + i * 7.8} y1="32" x2={32 + i * 7.8} y2="88" stroke="#334155" strokeWidth="1" />
            ))}
            {/* Fan 1 */}
            <circle cx="65" cy="60" r="24" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
            <circle cx="65" cy="60" r="8" fill="#334155" />
            <path d="M65,40 C75,48 75,54 65,60 C55,54 55,48 65,40 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M65,80 C75,72 75,66 65,60 C55,66 55,72 65,80 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M45,60 C53,70 59,70 65,60 C59,50 53,50 45,60 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M85,60 C77,70 71,70 65,60 C71,50 77,50 85,60 Z" fill="#10b981" fillOpacity="0.5" />
            {/* Fan 2 */}
            <circle cx="135" cy="60" r="24" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
            <circle cx="135" cy="60" r="8" fill="#334155" />
            <path d="M135,40 C145,48 145,54 135,60 C125,54 125,48 135,40 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M135,80 C145,72 145,66 135,60 C125,66 125,72 135,80 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M115,60 C123,70 129,70 135,60 C129,50 123,50 115,60 Z" fill="#10b981" fillOpacity="0.5" />
            <path d="M155,60 C147,70 141,70 135,60 C141,50 147,50 155,60 Z" fill="#10b981" fillOpacity="0.5" />
            {/* PCIe Golden Finger */}
            <rect x="50" y="95" width="80" height="8" rx="1" fill="#f59e0b" />
            {/* Metal I/O Bracket */}
            <rect x="18" y="20" width="8" height="80" rx="2" fill="#94a3b8" />
          </svg>
        );

      case 'ram':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* RAM Stick 1 */}
            <rect x="30" y="20" width="140" height="36" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            {/* RGB Light Bar on top */}
            <rect x="32" y="22" width="136" height="6" rx="2" fill="url(#rgbGradient)" />
            {/* Heatspreader grooves */}
            <line x1="60" y1="34" x2="100" y2="34" stroke="#475569" strokeWidth="2" />
            <line x1="60" y1="40" x2="120" y2="40" stroke="#475569" strokeWidth="2" />
            {/* Gold pins */}
            <rect x="36" y="56" width="60" height="4" fill="#fbbf24" />
            <rect x="102" y="56" width="62" height="4" fill="#fbbf24" />

            {/* RAM Stick 2 */}
            <rect x="30" y="65" width="140" height="36" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="32" y="67" width="136" height="6" rx="2" fill="url(#rgbGradient)" />
            <line x1="60" y1="79" x2="100" y2="79" stroke="#475569" strokeWidth="2" />
            <line x1="60" y1="85" x2="120" y2="85" stroke="#475569" strokeWidth="2" />
            <rect x="36" y="101" width="60" height="4" fill="#fbbf24" />
            <rect x="102" y="101" width="62" height="4" fill="#fbbf24" />

            <defs>
              <linearGradient id="rgbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="35%" stopColor="#8b5cf6" />
                <stop offset="70%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'storage':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* M.2 2280 PCB */}
            <rect x="25" y="38" width="150" height="44" rx="4" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
            {/* Golden Pins */}
            <rect x="25" y="44" width="8" height="32" fill="#fbbf24" />
            {/* Screw mounting notch */}
            <circle cx="175" cy="60" r="5" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1" />
            {/* Controller Chip */}
            <rect x="42" y="45" width="22" height="22" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x="53" y="58" textAnchor="middle" fill="#e2e8f0" fontSize="6" fontFamily="monospace">
              PCIe 4.0
            </text>
            {/* DRAM Cache */}
            <rect x="70" y="48" width="14" height="18" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
            {/* NAND Flash Die 1 & 2 */}
            <rect x="92" y="44" width="32" height="32" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
            <text x="108" y="62" textAnchor="middle" fill="#c084fc" fontSize="7" fontFamily="monospace">
              TLC 3D
            </text>
            <rect x="130" y="44" width="32" height="32" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
            <text x="146" y="62" textAnchor="middle" fill="#c084fc" fontSize="7" fontFamily="monospace">
              NAND
            </text>
          </svg>
        );

      case 'motherboard':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* ATX Mainboard PCB */}
            <rect x="35" y="10" width="130" height="100" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
            {/* VRM Heatsink 1 */}
            <rect x="42" y="20" width="20" height="40" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            {/* VRM Heatsink 2 */}
            <rect x="66" y="15" width="35" height="15" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            {/* CPU Socket */}
            <rect x="66" y="34" width="35" height="35" rx="2" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="83.5" cy="51.5" r="8" fill="#334155" />
            {/* RAM Slots (4 Channels) */}
            <rect x="110" y="24" width="5" height="45" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="118" y="24" width="5" height="45" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="126" y="24" width="5" height="45" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="134" y="24" width="5" height="45" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            {/* PCIe Slots */}
            <rect x="45" y="78" width="75" height="6" rx="1" fill="#cbd5e1" />
            <rect x="45" y="92" width="75" height="5" rx="1" fill="#64748b" />
            {/* Chipset Heatsink Armor */}
            <rect x="125" y="75" width="32" height="26" rx="4" fill="#334155" stroke="#818cf8" strokeWidth="1" />
            {/* Rear I/O */}
            <rect x="30" y="16" width="6" height="50" rx="1" fill="#94a3b8" />
          </svg>
        );

      case 'psu':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* PSU Box Housing */}
            <rect x="40" y="18" width="120" height="84" rx="6" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />
            {/* 120mm Fan Grill Honeycomb */}
            <circle cx="100" cy="55" r="30" fill="#09090b" stroke="#eab308" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="100" cy="55" r="10" fill="#27272a" />
            {/* 80Plus Gold Badge */}
            <rect x="50" y="82" width="30" height="12" rx="2" fill="#eab308" />
            <text x="65" y="91" textAnchor="middle" fill="#000" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              GOLD
            </text>
            {/* ATX 3.1 12V-2x6 indicator */}
            <text x="130" y="91" textAnchor="middle" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">
              ATX 3.1
            </text>
          </svg>
        );

      case 'cooler':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* Dual Radiator Towers */}
            <rect x="45" y="20" width="45" height="75" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="110" y="20" width="45" height="75" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
            {/* Fins */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="45" y1={25 + i * 5.8} x2="90" y2={25 + i * 5.8} stroke="#475569" strokeWidth="1" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="110" y1={25 + i * 5.8} x2="155" y2={25 + i * 5.8} stroke="#475569" strokeWidth="1" />
            ))}
            {/* Copper Heat Pipes */}
            <path d="M55,95 C55,108 80,108 80,95" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <path d="M120,95 C120,108 145,108 145,95" fill="none" stroke="#f59e0b" strokeWidth="3" />
            {/* Nickel Base */}
            <rect x="70" y="100" width="60" height="10" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        );

      case 'case':
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* Sea View Chassis Frame */}
            <rect x="45" y="12" width="110" height="96" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Panoramic Tempered Glass (Dual sides) */}
            <polygon points="48,15 125,15 125,105 48,105" fill="#38bdf8" fillOpacity="0.12" stroke="#38bdf8" strokeWidth="0.8" />
            {/* Internal Motherboard Outline */}
            <rect x="58" y="24" width="55" height="60" rx="3" fill="#1e293b" fillOpacity="0.6" stroke="#64748b" strokeWidth="1" />
            {/* GPU Horizontal Card */}
            <rect x="58" y="58" width="50" height="12" rx="2" fill="#10b981" fillOpacity="0.5" />
            {/* Top Mesh Fan Grills */}
            <line x1="55" y1="18" x2="145" y2="18" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        );

      case 'laptop':
      default:
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-65 dark:opacity-75">
            {/* Laptop Display Screen */}
            <rect x="40" y="12" width="120" height="74" rx="5" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="45" y="17" width="110" height="64" rx="3" fill="#1e1e2e" />
            {/* Display Wallpaper Waves */}
            <path d="M45,65 Q75,35 100,55 T155,45 L155,81 L45,81 Z" fill="#8b5cf6" fillOpacity="0.3" />
            {/* Base Keyboard Deck */}
            <polygon points="25,92 175,92 165,106 35,106" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.2" />
            {/* Trackpad */}
            <rect x="85" y="96" width="30" height="8" rx="1.5" fill="#334155" />
          </svg>
        );
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'cpu':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'gpu':
        return <Tv className="w-3.5 h-3.5" />;
      case 'motherboard':
      case 'ram':
      case 'psu':
        return <Zap className="w-3.5 h-3.5" />;
      case 'storage':
        return <HardDrive className="w-3.5 h-3.5" />;
      case 'cooler':
        return <Flame className="w-3.5 h-3.5" />;
      case 'case':
        return <Box className="w-3.5 h-3.5" />;
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      default:
        return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`relative w-full h-44 sm:h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br ${theme.gradient} bg-slate-100 dark:bg-[#070b14] flex items-center justify-center group/img`}>
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Hardware Schematic Blueprint Illustration */}
      <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none transition-transform duration-500 group-hover/img:scale-105">
        {renderSchematicSvg()}
      </div>

      {/* Product Photography (if provided and loads successfully) */}
      {imageUrl && !imgError && (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`absolute inset-0 w-full h-full object-cover opacity-85 dark:opacity-75 dark:mix-blend-lighten group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-500 ${
            imgLoaded ? 'block' : 'hidden'
          }`}
        />
      )}

      {/* Bottom Subtle Gradient Fade to Content */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />

      {/* Category Tag Watermark Badge */}
      <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-950/75 border border-slate-200/90 dark:border-slate-700/60 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-xs pointer-events-none">
        <span className={theme.accent}>{getCategoryIcon()}</span>
        <span className="uppercase tracking-wider font-mono text-[10px]">{category}</span>
      </div>

      {/* Brand Watermark (Bottom Right) */}
      <div className="absolute bottom-2 right-3 text-[11px] font-mono font-black text-slate-400/50 dark:text-slate-500/40 uppercase tracking-widest pointer-events-none select-none">
        {brand}
      </div>
    </div>
  );
};
