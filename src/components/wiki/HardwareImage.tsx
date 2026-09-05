import React from 'react';
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
}) => {
  // Brand-Aware Category Theme Colors & Accents
  const getTheme = () => {
    switch (category) {
      case 'cpu': {
        const isIntel = brand.toUpperCase().includes('INTEL') || name.toUpperCase().includes('INTEL');
        const isApple = brand.toUpperCase().includes('APPLE') || name.toUpperCase().includes('APPLE') || name.toUpperCase().includes('M4');
        if (isIntel) {
          return {
            gradient: 'from-sky-500/15 via-blue-500/10 to-slate-200/40 dark:from-sky-500/10 dark:via-blue-950/80 dark:to-[#070b14]',
            accent: 'text-sky-600 dark:text-sky-400',
            border: 'border-sky-500/20',
            badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            glow: 'rgba(2, 132, 199, 0.15)',
          };
        }
        if (isApple) {
          return {
            gradient: 'from-zinc-400/15 via-slate-200/50 to-slate-200/40 dark:from-zinc-400/10 dark:via-zinc-900/80 dark:to-[#070b14]',
            accent: 'text-zinc-600 dark:text-zinc-300',
            border: 'border-zinc-500/20',
            badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
            glow: 'rgba(161, 161, 170, 0.15)',
          };
        }
        return {
          gradient: 'from-amber-500/15 via-orange-500/10 to-slate-200/40 dark:from-orange-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          glow: 'rgba(245, 158, 11, 0.15)',
        };
      }
      case 'gpu': {
        const isAmd = brand.toUpperCase().includes('AMD') || name.toUpperCase().includes('RADEON') || name.toUpperCase().includes('RX');
        const isIntel = brand.toUpperCase().includes('INTEL') || name.toUpperCase().includes('ARC');
        if (isAmd) {
          return {
            gradient: 'from-rose-600/15 via-red-500/10 to-slate-200/40 dark:from-rose-600/10 dark:via-red-950/80 dark:to-[#070b14]',
            accent: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-500/20',
            badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            glow: 'rgba(225, 29, 72, 0.15)',
          };
        }
        if (isIntel) {
          return {
            gradient: 'from-cyan-500/15 via-sky-500/10 to-slate-200/40 dark:from-cyan-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
            accent: 'text-cyan-600 dark:text-cyan-400',
            border: 'border-cyan-500/20',
            badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
            glow: 'rgba(6, 182, 212, 0.15)',
          };
        }
        return {
          gradient: 'from-emerald-500/15 via-teal-500/10 to-slate-200/40 dark:from-emerald-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          glow: 'rgba(16, 185, 129, 0.15)',
        };
      }
      case 'motherboard': {
        const upperBrand = brand.toUpperCase();
        const upperName = name.toUpperCase();
        const isRog = upperName.includes('ROG') || upperName.includes('STRIX') || upperName.includes('MAXIMUS');
        const isTuf = upperName.includes('TUF');
        const isAorus = upperBrand.includes('GIGABYTE') || upperName.includes('AORUS');
        const isMsi = upperBrand.includes('MSI') || upperName.includes('MORTAR') || upperName.includes('TOMAHAWK') || upperName.includes('MAG');

        if (isRog) {
          return {
            gradient: 'from-red-600/15 via-slate-100/60 to-slate-200/40 dark:from-red-600/10 dark:via-slate-900/80 dark:to-[#070b14]',
            accent: 'text-red-600 dark:text-red-400',
            border: 'border-red-500/20',
            badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
            glow: 'rgba(239, 68, 68, 0.15)',
          };
        }
        if (isTuf) {
          return {
            gradient: 'from-amber-500/15 via-yellow-500/10 to-slate-200/40 dark:from-amber-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
            accent: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-500/20',
            badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            glow: 'rgba(245, 158, 11, 0.15)',
          };
        }
        if (isAorus) {
          return {
            gradient: 'from-orange-500/15 via-amber-500/10 to-slate-200/40 dark:from-orange-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
            accent: 'text-orange-600 dark:text-orange-400',
            border: 'border-orange-500/20',
            badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
            glow: 'rgba(249, 115, 22, 0.15)',
          };
        }
        if (isMsi) {
          return {
            gradient: 'from-rose-500/15 via-red-500/10 to-slate-200/40 dark:from-rose-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
            accent: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-500/20',
            badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
            glow: 'rgba(244, 63, 94, 0.15)',
          };
        }
        return {
          gradient: 'from-indigo-500/15 via-slate-100/60 to-slate-200/40 dark:from-indigo-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-500/20',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
          glow: 'rgba(99, 102, 241, 0.15)',
        };
      }
      case 'ram':
        return {
          gradient: 'from-cyan-500/15 via-slate-100/60 to-slate-200/40 dark:from-cyan-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-cyan-600 dark:text-cyan-400',
          border: 'border-cyan-500/20',
          badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
          glow: 'rgba(6, 182, 212, 0.15)',
        };
      case 'storage':
        return {
          gradient: 'from-violet-500/15 via-slate-100/60 to-slate-200/40 dark:from-violet-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-violet-600 dark:text-violet-400',
          border: 'border-violet-500/20',
          badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
          glow: 'rgba(139, 92, 246, 0.15)',
        };
      case 'psu':
        return {
          gradient: 'from-yellow-500/15 via-slate-100/60 to-slate-200/40 dark:from-yellow-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-500/20',
          badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
          glow: 'rgba(234, 179, 8, 0.15)',
        };
      case 'cooler':
        return {
          gradient: 'from-sky-500/15 via-slate-100/60 to-slate-200/40 dark:from-sky-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-sky-600 dark:text-sky-400',
          border: 'border-sky-500/20',
          badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
          glow: 'rgba(56, 189, 248, 0.15)',
        };
      case 'case':
        return {
          gradient: 'from-blue-500/15 via-slate-100/60 to-slate-200/40 dark:from-blue-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          glow: 'rgba(59, 130, 246, 0.15)',
        };
      case 'laptop':
      default:
        return {
          gradient: 'from-purple-500/15 via-slate-100/60 to-slate-200/40 dark:from-purple-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-500/20',
          badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          glow: 'rgba(168, 85, 247, 0.15)',
        };
    }
  };

  const theme = getTheme();

  // Extract short model label for blueprint engraving
  const getShortLabel = () => {
    // e.g. "AMD Ryzen 7 9800X3D" -> "9800X3D"
    const words = name.split(' ');
    return words[words.length - 1] || brand;
  };

  const shortLabel = getShortLabel();

  // ==========================================
  // CPU Vector Schematics
  // ==========================================

  // 1. Intel CPU: Elongated rectangular LGA1700/LGA1851 substrate and IHS, with Intel Blue accent, LGA gold pads, laser engraving
  const renderIntelCpuSvg = () => {
    const isUltra = name.includes('Ultra') || name.includes('285') || name.includes('265') || name.includes('245');
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* Elongated Rectangular LGA1700/LGA1851 Substrate */}
        <rect x="68" y="10" width="84" height="100" rx="4" fill="#0b1329" stroke="#0284c7" strokeWidth="1.5" />
        <rect x="70" y="12" width="80" height="96" rx="3" fill="#080e1e" />

        {/* LGA Alignment Key Notches */}
        <rect x="67" y="55" width="2.5" height="10" fill="#080e1e" />
        <rect x="150.5" y="55" width="2.5" height="10" fill="#080e1e" />

        {/* Pin 1 Golden Alignment Triangle */}
        <polygon points="70,12 80,12 70,22" fill="#f59e0b" />

        {/* Corner Gold Test Pads */}
        <rect x="143" y="14" width="4.5" height="4.5" rx="1" fill="#f59e0b" />
        <rect x="72" y="101" width="4.5" height="4.5" rx="1" fill="#f59e0b" />
        <rect x="143" y="101" width="4.5" height="4.5" rx="1" fill="#f59e0b" />

        {/* LGA Independent Loading Mechanism (ILM) Retention Wings */}
        <rect x="73" y="44" width="74" height="32" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="0.8" />

        {/* Elongated Nickel-plated Integrated Heat Spreader (IHS) */}
        <rect x="75" y="18" width="70" height="84" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
        <rect x="79" y="22" width="62" height="76" rx="3" fill="#1e293b" />

        {/* Intel Blue Accent Badge */}
        <rect x="85" y="27" width="50" height="12" rx="2.5" fill="#0071c5" fillOpacity="0.9" />
        <text x="110" y="35.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="monospace">
          {isUltra ? 'intel. ULTRA' : 'intel. CORE'}
        </text>

        {/* Laser Engraved Model & Socket */}
        <text x="110" y="54" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontWeight="900" fontFamily="monospace">
          {shortLabel}
        </text>
        <text x="110" y="66" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">
          {isUltra ? 'LGA 1851' : 'LGA 1700'}
        </text>
        <text x="110" y="76" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">
          HYBRID ARCHITECTURE
        </text>

        {/* Surface Mount Capacitors / LGA Contact Points */}
        <rect x="87" y="84" width="6" height="3.5" rx="0.5" fill="#fbbf24" />
        <rect x="96" y="84" width="6" height="3.5" rx="0.5" fill="#fbbf24" />
        <rect x="105" y="84" width="6" height="3.5" rx="0.5" fill="#fbbf24" />
        <rect x="114" y="84" width="6" height="3.5" rx="0.5" fill="#fbbf24" />
        <rect x="123" y="84" width="6" height="3.5" rx="0.5" fill="#fbbf24" />

        {/* Intel Cyan Circuit Traces */}
        <line x1="15" y1="35" x2="68" y2="35" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="15" y1="60" x2="68" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="15" y1="85" x2="68" y2="85" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="152" y1="35" x2="205" y2="35" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="152" y1="60" x2="205" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="152" y1="85" x2="205" y2="85" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    );
  };

  // 2. AMD CPU: AM5 octagonal cutout IHS, Ryzen Orange/Red theme, Zen architecture label, AM5 pins
  const renderAmdCpuSvg = () => {
    const is3D = name.includes('X3D');
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* Square AM5 Silicon Substrate */}
        <rect x="58" y="10" width="104" height="100" rx="6" fill="#18181b" stroke="#ea580c" strokeWidth="1.5" />
        <rect x="60" y="12" width="100" height="96" rx="5" fill="#0f1014" />

        {/* Pin 1 Golden Alignment Triangle */}
        <polygon points="61,13 72,13 61,24" fill="#f59e0b" />

        {/* AM5 Distinctive Octagonal Cutout IHS (Spider-leg Heatspreader with 8 cutouts) */}
        <path
          d="M 84,20 H 92 V 28 H 100 V 20 H 120 V 28 H 128 V 20 H 136 V 36 H 128 V 46 H 136 V 74 H 128 V 84 H 136 V 100 H 128 V 92 H 120 V 100 H 100 V 92 H 92 V 100 H 84 V 84 H 92 V 74 H 84 V 46 H 92 V 36 H 84 Z"
          fill="#334155"
          stroke="#ea580c"
          strokeWidth="1.2"
        />

        {/* Exposed Surface Mount Capacitors in the 8 Cutout Bays */}
        <rect x="94" y="22" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="122" y="22" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="130" y="39" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="130" y="77" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="122" y="94" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="94" y="94" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="86" y="77" width="4" height="4" fill="#fbbf24" rx="0.5" />
        <rect x="86" y="39" width="4" height="4" fill="#fbbf24" rx="0.5" />

        {/* Central IHS Recessed Plate */}
        <rect x="86" y="32" width="48" height="56" rx="3" fill="#1e293b" />

        {/* 3D V-Cache Badge or Ryzen Orange Badge */}
        {is3D ? (
          <g>
            <rect x="88" y="36" width="44" height="11" rx="2" fill="#ef4444" fillOpacity="0.9" />
            <text x="110" y="44" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
              3D V-CACHE
            </text>
          </g>
        ) : (
          <g>
            <rect x="88" y="36" width="44" height="11" rx="2" fill="#ea580c" fillOpacity="0.9" />
            <text x="110" y="44" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
              AMD RYZEN™
            </text>
          </g>
        )}

        {/* Laser Engraved Model & Socket */}
        <text x="110" y="59" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="900" fontFamily="monospace">
          {shortLabel}
        </text>
        <text x="110" y="71" textAnchor="middle" fill="#fb923c" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          SOCKET AM5
        </text>
        <text x="110" y="81" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">
          ZEN ARCHITECTURE
        </text>

        {/* Ryzen Circuit Traces */}
        <line x1="15" y1="35" x2="58" y2="35" stroke="#ea580c" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="15" y1="60" x2="58" y2="60" stroke="#ea580c" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="15" y1="85" x2="58" y2="85" stroke="#ea580c" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="162" y1="35" x2="205" y2="35" stroke="#ea580c" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="162" y1="60" x2="205" y2="60" stroke="#ea580c" strokeWidth="1.5" strokeOpacity="0.8" />
        <line x1="162" y1="85" x2="205" y2="85" stroke="#ea580c" strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    );
  };

  // 3. Apple Silicon: Dark minimalist unibody aluminum chip with unified memory package
  const renderAppleCpuSvg = () => {
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* Dark Minimalist Space Black Substrate */}
        <rect x="42" y="14" width="136" height="92" rx="8" fill="#18181b" stroke="#71717a" strokeWidth="1.2" />
        <rect x="44" y="16" width="132" height="88" rx="6" fill="#0c0d10" />

        {/* Center-Left: Main Apple Silicon SoC Die */}
        <rect x="52" y="24" width="68" height="72" rx="5" fill="#24262d" stroke="#71717a" strokeWidth="1" />

        {/* Apple Silhouette Logo */}
        <path d="M 85 33 C 85.5 32 87 32 87.5 33 C 88 34 87.5 35 87 35 C 86.5 35 86 34 85 33 Z" fill="#e2e8f0" />
        <path
          d="M 81.5 40.5 C 81.5 37.8 83.2 36.5 85 36.5 C 86 36.5 86.8 37.1 87.4 37.1 C 88 37.1 88.8 36.5 89.8 36.5 C 91.5 36.5 92.8 37.8 92.8 40 C 92.8 43 90.8 46 89.2 46 C 88.4 46 87.9 45.4 87.1 45.4 C 86.3 45.4 85.7 46 85 46 C 83.2 46 81.5 43 81.5 40.5 Z"
          fill="#e2e8f0"
        />

        {/* Apple Engraving */}
        <text x="86" y="55" textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold" fontFamily="monospace">
          Apple Silicon
        </text>
        <text x="86" y="67" textAnchor="middle" fill="#38bdf8" fontSize="10.5" fontWeight="900" fontFamily="monospace">
          {shortLabel}
        </text>
        <text x="86" y="78" textAnchor="middle" fill="#a1a1aa" fontSize="6.5" fontFamily="monospace">
          3nm UNIFIED ARCH
        </text>

        {/* Right: Dual Unified Memory Package Dies (UMA) */}
        <rect x="126" y="26" width="44" height="32" rx="3" fill="#24262d" stroke="#52525b" strokeWidth="0.8" />
        <text x="148" y="42" textAnchor="middle" fill="#f1f5f9" fontSize="7" fontWeight="bold" fontFamily="monospace">
          LPDDR5X
        </text>
        <text x="148" y="51" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">
          UNIFIED RAM
        </text>

        <rect x="126" y="62" width="44" height="32" rx="3" fill="#24262d" stroke="#52525b" strokeWidth="0.8" />
        <text x="148" y="78" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">
          273 GB/s
        </text>
        <text x="148" y="87" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontFamily="monospace">
          ULTRA-WIDE
        </text>

        {/* Gold High-Speed Interconnect Bus */}
        <line x1="120" y1="36" x2="126" y2="36" stroke="#f59e0b" strokeWidth="1" />
        <line x1="120" y1="42" x2="126" y2="42" stroke="#f59e0b" strokeWidth="1" />
        <line x1="120" y1="48" x2="126" y2="48" stroke="#f59e0b" strokeWidth="1" />
        <line x1="120" y1="72" x2="126" y2="72" stroke="#f59e0b" strokeWidth="1" />
        <line x1="120" y1="78" x2="126" y2="78" stroke="#f59e0b" strokeWidth="1" />
        <line x1="120" y1="84" x2="126" y2="84" stroke="#f59e0b" strokeWidth="1" />

        {/* Minimalist Alignment Dots */}
        <circle cx="48" cy="20" r="1.5" fill="#71717a" />
        <circle cx="172" cy="20" r="1.5" fill="#71717a" />
        <circle cx="48" cy="100" r="1.5" fill="#71717a" />
        <circle cx="172" cy="100" r="1.5" fill="#71717a" />
      </svg>
    );
  };

  // ==========================================
  // GPU Vector Schematics
  // ==========================================

  // 4. NVIDIA GPU: GeForce RTX dual/triple fan shroud with green accents and 12V-2x6 header
  const renderNvidiaGpuSvg = () => {
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* GPU Titanium & Gunmetal Shroud */}
        <rect x="18" y="16" width="184" height="86" rx="8" fill="#18181b" stroke="#334155" strokeWidth="1.5" />

        {/* Cooling Fins Background */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={26 + i * 7.2} y1="22" x2={26 + i * 7.2} y2="96" stroke="#27272a" strokeWidth="1" />
        ))}

        {/* Angled Titanium Plates */}
        <polygon points="26,20 80,20 90,32 26,32" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
        <polygon points="130,86 194,86 194,98 140,98" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />

        {/* GeForce Signature Neon Green LED Accent Strip */}
        <path d="M 28 24 L 160 24" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 28 24 L 160 24" stroke="#34d399" strokeWidth="1" strokeLinecap="round" />

        {/* Triple Axial Fans */}
        {/* Fan 1 */}
        <circle cx="54" cy="59" r="23" fill="#09090b" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="54" cy="59" r="8" fill="#334155" />
        <path d="M54,39 C62,47 62,53 54,59 C46,53 46,47 54,39 Z" fill="#10b981" fillOpacity="0.5" />
        <path d="M54,79 C62,71 62,65 54,59 C46,65 46,71 54,79 Z" fill="#10b981" fillOpacity="0.5" />

        {/* Fan 2 (Center) */}
        <circle cx="110" cy="59" r="23" fill="#09090b" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="110" cy="59" r="8" fill="#334155" />
        <path d="M110,39 C118,47 118,53 110,59 C102,53 102,47 110,39 Z" fill="#10b981" fillOpacity="0.5" />
        <path d="M110,79 C118,71 118,65 110,59 C102,65 102,71 110,79 Z" fill="#10b981" fillOpacity="0.5" />

        {/* Fan 3 */}
        <circle cx="166" cy="59" r="23" fill="#09090b" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="166" cy="59" r="8" fill="#334155" />
        <path d="M166,39 C174,47 174,53 166,59 C158,53 158,47 166,39 Z" fill="#10b981" fillOpacity="0.5" />
        <path d="M166,79 C174,71 174,65 166,59 C158,65 158,71 166,79 Z" fill="#10b981" fillOpacity="0.5" />

        {/* 12V-2x6 (12VHPWR) Native 16-Pin Power Header */}
        <rect x="166" y="10" width="22" height="7" rx="1.5" fill="#09090b" stroke="#10b981" strokeWidth="1" />
        <rect x="169" y="12" width="16" height="3" fill="#fbbf24" rx="0.5" />
        <text x="177" y="9" textAnchor="middle" fill="#10b981" fontSize="5" fontWeight="bold" fontFamily="monospace">
          12V-2x6
        </text>

        {/* GeForce RTX Center Badge */}
        <rect x="94" y="20" width="32" height="10" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="0.8" />
        <text x="110" y="27.5" textAnchor="middle" fill="#10b981" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
          GEFORCE RTX
        </text>

        {/* PCIe 5.0 Gold Connector */}
        <rect x="50" y="102" width="115" height="7" rx="1" fill="#f59e0b" />

        {/* Metal I/O Bracket */}
        <rect x="12" y="12" width="6" height="94" rx="2" fill="#94a3b8" />
      </svg>
    );
  };

  // 5. AMD Radeon GPU: Radeon red/black shroud with RDNA 3 triple fan layout and dual 8-pin headers
  const renderAmdRadeonGpuSvg = () => {
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* GPU Industrial Dark Shroud with Crimson Red Accent */}
        <rect x="18" y="16" width="184" height="86" rx="8" fill="#18181b" stroke="#e11d48" strokeWidth="1.5" />

        {/* Cooling Fins */}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={26 + i * 7.2} y1="22" x2={26 + i * 7.2} y2="96" stroke="#27272a" strokeWidth="1" />
        ))}

        {/* Signature Radeon Crimson Red Accent Stripes */}
        <path d="M 28 23 L 192 23" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 28 95 L 192 95" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />

        {/* Triple RDNA 3 Axial Fans */}
        {/* Fan 1 */}
        <circle cx="54" cy="59" r="23" fill="#09090b" stroke="#e11d48" strokeWidth="1.2" strokeOpacity="0.5" />
        <circle cx="54" cy="59" r="8" fill="#334155" />
        <path d="M54,39 C62,47 62,53 54,59 C46,53 46,47 54,39 Z" fill="#e11d48" fillOpacity="0.5" />
        <path d="M54,79 C62,71 62,65 54,59 C46,65 46,71 54,79 Z" fill="#e11d48" fillOpacity="0.5" />

        {/* Fan 2 (Center with iconic Radeon 'R' emblem) */}
        <circle cx="110" cy="59" r="23" fill="#09090b" stroke="#e11d48" strokeWidth="1.2" strokeOpacity="0.7" />
        <circle cx="110" cy="59" r="9" fill="#262626" stroke="#e11d48" strokeWidth="1" />
        <text x="110" y="62.5" textAnchor="middle" fill="#e11d48" fontSize="10" fontWeight="900" fontFamily="sans-serif">
          R
        </text>

        {/* Fan 3 */}
        <circle cx="166" cy="59" r="23" fill="#09090b" stroke="#e11d48" strokeWidth="1.2" strokeOpacity="0.5" />
        <circle cx="166" cy="59" r="8" fill="#334155" />
        <path d="M166,39 C174,47 174,53 166,59 C158,53 158,47 166,39 Z" fill="#e11d48" fillOpacity="0.5" />
        <path d="M166,79 C174,71 174,65 166,59 C158,65 158,71 166,79 Z" fill="#e11d48" fillOpacity="0.5" />

        {/* Dual 8-Pin Traditional PCIe Power Headers */}
        <rect x="152" y="10" width="15" height="7" rx="1" fill="#09090b" stroke="#ef4444" strokeWidth="1" />
        <rect x="171" y="10" width="15" height="7" rx="1" fill="#09090b" stroke="#ef4444" strokeWidth="1" />
        <text x="169" y="8" textAnchor="middle" fill="#ef4444" fontSize="5" fontWeight="bold" fontFamily="monospace">
          2x 8-PIN
        </text>

        {/* Radeon Center Top Badge */}
        <rect x="94" y="20" width="32" height="10" rx="2" fill="#e11d48" />
        <text x="110" y="27.5" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="900" fontFamily="sans-serif">
          RADEON
        </text>

        {/* PCIe 4.0 Gold Connector */}
        <rect x="50" y="102" width="115" height="7" rx="1" fill="#f59e0b" />

        {/* Metal I/O Bracket */}
        <rect x="12" y="12" width="6" height="94" rx="2" fill="#94a3b8" />
      </svg>
    );
  };

  // 6. Intel Arc GPU: Dual fan minimalist stealth design with Intel blue LED perimeter ring
  const renderIntelArcGpuSvg = () => {
    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* Stealth Arc Curved Body */}
        <rect x="22" y="16" width="176" height="86" rx="12" fill="#0b1329" stroke="#0284c7" strokeWidth="1.5" />

        {/* Continuous Arc Blue Glowing Perimeter Lightbar */}
        <rect x="25" y="19" width="170" height="80" rx="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.85" />

        {/* Dual Large Low-Noise Fans */}
        <circle cx="70" cy="59" r="26" fill="#060c1c" stroke="#0284c7" strokeWidth="1.2" />
        <circle cx="70" cy="59" r="9" fill="#1e293b" />
        <path d="M70,36 C79,46 79,52 70,59 C61,52 61,46 70,36 Z" fill="#38bdf8" fillOpacity="0.6" />
        <path d="M70,82 C79,72 79,66 70,59 C61,66 61,72 70,82 Z" fill="#38bdf8" fillOpacity="0.6" />

        <circle cx="150" cy="59" r="26" fill="#060c1c" stroke="#0284c7" strokeWidth="1.2" />
        <circle cx="150" cy="59" r="9" fill="#1e293b" />
        <path d="M150,36 C159,46 159,52 150,59 C141,52 141,46 150,36 Z" fill="#38bdf8" fillOpacity="0.6" />
        <path d="M150,82 C159,72 159,66 150,59 C141,66 141,72 150,82 Z" fill="#38bdf8" fillOpacity="0.6" />

        {/* Center Intel Arc Metal Badge */}
        <rect x="98" y="48" width="24" height="22" rx="3" fill="#0284c7" />
        <text x="110" y="57" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
          intel
        </text>
        <text x="110" y="65" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif">
          ARC
        </text>

        {/* PCIe 5.0 Gold Connector */}
        <rect x="52" y="102" width="112" height="7" rx="1" fill="#f59e0b" />

        {/* Metal I/O Bracket */}
        <rect x="16" y="12" width="6" height="94" rx="2" fill="#94a3b8" />
      </svg>
    );
  };

  // ==========================================
  // Motherboard Vector Schematics (Brand-Tailored)
  // ==========================================
  const renderMotherboardSvg = () => {
    const upperBrand = brand.toUpperCase();
    const upperName = name.toUpperCase();
    const isRog = upperName.includes('ROG') || upperName.includes('STRIX') || upperName.includes('MAXIMUS');
    const isTuf = upperName.includes('TUF');
    const isAorus = upperBrand.includes('GIGABYTE') || upperName.includes('AORUS');
    const isMsi = upperBrand.includes('MSI') || upperName.includes('MORTAR') || upperName.includes('TOMAHAWK') || upperName.includes('MAG');

    const getPcbBorderColor = () => {
      if (isRog) return '#ef4444';
      if (isTuf) return '#eab308';
      if (isAorus) return '#f97316';
      if (isMsi) return '#f43f5e';
      return '#6366f1';
    };

    return (
      <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
        {/* ATX Mainboard PCB */}
        <rect x="38" y="8" width="144" height="104" rx="6" fill="#0f172a" stroke={getPcbBorderColor()} strokeWidth="1.5" />

        {/* CPU Socket with Metal Load Mechanism */}
        <rect x="72" y="30" width="38" height="38" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="91" cy="49" r="8" fill="#334155" />
        <line x1="72" y1="34" x2="68" y2="48" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

        {/* 4x DDR5 Memory Slots */}
        <rect x="122" y="20" width="4" height="50" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
        <rect x="129" y="20" width="4" height="50" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
        <rect x="136" y="20" width="4" height="50" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
        <rect x="143" y="20" width="4" height="50" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />

        {/* Reinforced PCIe 5.0 x16 Steel Armor Slot */}
        <rect x="50" y="76" width="85" height="8" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />

        {/* Secondary PCIe Slot */}
        <rect x="50" y="96" width="65" height="6" rx="1" fill="#334155" />

        {/* Brand-Specific VRM, Chipset, and M.2 Shielding */}
        {isRog ? (
          // ASUS ROG: Cyber red styling, diagonal cut, ROG Eye
          <g>
            <polygon points="44,16 68,16 68,64 44,64" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
            <line x1="48" y1="22" x2="64" y2="38" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="48" y1="34" x2="64" y2="50" stroke="#ef4444" strokeWidth="1.5" />
            <text x="56" y="58" textAnchor="middle" fill="#f87171" fontSize="5" fontWeight="bold" fontFamily="monospace">
              ROG
            </text>
            <rect x="72" y="12" width="44" height="14" rx="2" fill="#334155" stroke="#ef4444" strokeWidth="1" />
            <rect x="136" y="78" width="36" height="30" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="1.2" />
            <polygon points="146,88 162,88 154,96" fill="#ef4444" />
            <text x="154" y="103" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
              STRIX
            </text>
            <rect x="50" y="87" width="75" height="6" rx="1" fill="#1e293b" stroke="#ef4444" strokeWidth="0.8" />
            <text x="87" y="92" textAnchor="middle" fill="#fca5a5" fontSize="4.5" fontFamily="monospace">
              ROG M.2 ARMOR
            </text>
          </g>
        ) : isTuf ? (
          // ASUS TUF: Tactical yellow / military gray styling
          <g>
            <rect x="44" y="16" width="22" height="48" rx="2" fill="#334155" stroke="#eab308" strokeWidth="1" />
            <line x1="48" y1="22" x2="62" y2="22" stroke="#eab308" strokeWidth="1.5" />
            <line x1="48" y1="26" x2="62" y2="26" stroke="#eab308" strokeWidth="1.5" />
            <text x="55" y="44" textAnchor="middle" fill="#fde047" fontSize="5" fontWeight="bold" fontFamily="monospace">
              TUF
            </text>
            <text x="55" y="54" textAnchor="middle" fill="#cbd5e1" fontSize="4.5" fontFamily="monospace">
              MIL-STD
            </text>
            <rect x="72" y="12" width="44" height="14" rx="2" fill="#334155" stroke="#eab308" strokeWidth="1" />
            <rect x="136" y="78" width="36" height="30" rx="3" fill="#334155" stroke="#eab308" strokeWidth="1.2" />
            <polygon points="146,86 162,86 154,94" fill="#eab308" />
            <text x="154" y="103" textAnchor="middle" fill="#fef08a" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
              GAMING
            </text>
            <rect x="50" y="87" width="75" height="6" rx="1" fill="#1e293b" stroke="#eab308" strokeWidth="0.8" />
            <text x="87" y="92" textAnchor="middle" fill="#fde047" fontSize="4.5" fontFamily="monospace">
              TUF M.2 SHIELD
            </text>
          </g>
        ) : isMsi ? (
          // MSI MAG / Mortar / Tomahawk: Heavy steel armor & crimson dragon badge
          <g>
            <rect x="44" y="16" width="22" height="48" rx="2" fill="#1e293b" stroke="#f43f5e" strokeWidth="1" />
            <text x="55" y="38" textAnchor="middle" fill="#fda4af" fontSize="5.5" fontWeight="900" fontFamily="monospace">
              MAG
            </text>
            <text x="55" y="48" textAnchor="middle" fill="#cbd5e1" fontSize="4.5" fontFamily="monospace">
              MORTAR
            </text>
            <rect x="46" y="54" width="18" height="4" fill="#475569" />
            <rect x="72" y="12" width="44" height="14" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <rect x="136" y="78" width="36" height="30" rx="3" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="154" y="92" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="monospace">
              MSI
            </text>
            <text x="154" y="102" textAnchor="middle" fill="#fda4af" fontSize="5" fontFamily="monospace">
              ARSENAL
            </text>
            <rect x="50" y="87" width="75" height="6" rx="1" fill="#1e293b" stroke="#f43f5e" strokeWidth="0.8" />
            <text x="87" y="92" textAnchor="middle" fill="#fda4af" fontSize="4.5" fontFamily="monospace">
              M.2 SHIELD FROZR
            </text>
          </g>
        ) : isAorus ? (
          // Gigabyte Aorus: Falcon orange & metallic direct-touch armor
          <g>
            <rect x="44" y="16" width="22" height="48" rx="2" fill="#1e293b" stroke="#f97316" strokeWidth="1" />
            <polygon points="48,22 62,22 55,32" fill="#f97316" />
            <text x="55" y="44" textAnchor="middle" fill="#fed7aa" fontSize="5.5" fontWeight="900" fontFamily="monospace">
              AORUS
            </text>
            <text x="55" y="54" textAnchor="middle" fill="#94a3b8" fontSize="4.5" fontFamily="monospace">
              ELITE
            </text>
            <rect x="72" y="12" width="44" height="14" rx="2" fill="#334155" stroke="#f97316" strokeWidth="1" />
            <rect x="136" y="78" width="36" height="30" rx="3" fill="#1e293b" stroke="#f97316" strokeWidth="1.2" />
            <polygon points="146,86 162,86 154,94" fill="#f97316" />
            <text x="154" y="103" textAnchor="middle" fill="#ffedd5" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
              FIGHT ON
            </text>
            <rect x="50" y="87" width="75" height="6" rx="1" fill="#1e293b" stroke="#f97316" strokeWidth="0.8" />
            <text x="87" y="92" textAnchor="middle" fill="#fdba74" fontSize="4.5" fontFamily="monospace">
              M.2 THERMAL GUARD
            </text>
          </g>
        ) : (
          // Standard / ASRock / Colorful Motherboard
          <g>
            <rect x="48" y="18" width="18" height="44" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <rect x="75" y="14" width="40" height="14" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <rect x="138" y="78" width="34" height="28" rx="3" fill="#334155" stroke="#6366f1" strokeWidth="1.2" />
            <text x="155" y="94" textAnchor="middle" fill="#f8fafc" fontSize="7" fontWeight="bold" fontFamily="monospace">
              {shortLabel.slice(0, 5)}
            </text>
            <rect x="52" y="87" width="75" height="7" rx="2" fill="#1e293b" stroke="#818cf8" strokeWidth="1" />
            <text x="89" y="93" textAnchor="middle" fill="#a5b4fc" fontSize="5.5" fontFamily="monospace">
              PCIe 5.0 M.2 SHIELD
            </text>
          </g>
        )}
      </svg>
    );
  };

  // High-Precision Architectural Schematic SVG Dispatcher
  const renderSchematicSvg = () => {
    switch (category) {
      case 'cpu': {
        const isIntel = brand.toUpperCase().includes('INTEL') || name.toUpperCase().includes('INTEL');
        const isApple = brand.toUpperCase().includes('APPLE') || name.toUpperCase().includes('APPLE') || name.toUpperCase().includes('M4');
        if (isApple) return renderAppleCpuSvg();
        if (isIntel) return renderIntelCpuSvg();
        return renderAmdCpuSvg();
      }

      case 'gpu': {
        const isAmd = brand.toUpperCase().includes('AMD') || name.toUpperCase().includes('RADEON') || name.toUpperCase().includes('RX');
        const isIntel = brand.toUpperCase().includes('INTEL') || name.toUpperCase().includes('ARC');
        if (isAmd) return renderAmdRadeonGpuSvg();
        if (isIntel) return renderIntelArcGpuSvg();
        return renderNvidiaGpuSvg();
      }

      case 'motherboard':
        return renderMotherboardSvg();

      case 'ram': {
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* RAM Module 1 */}
            <rect x="35" y="18" width="150" height="38" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="37" y="20" width="146" height="6" rx="2" fill="url(#rgbBarGradient)" />
            <line x1="65" y1="32" x2="115" y2="32" stroke="#475569" strokeWidth="2" />
            <line x1="65" y1="38" x2="135" y2="38" stroke="#475569" strokeWidth="2" />
            <text x="155" y="46" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="bold" fontFamily="monospace">
              DDR5
            </text>
            <rect x="42" y="56" width="66" height="4" fill="#fbbf24" />
            <rect x="112" y="56" width="68" height="4" fill="#fbbf24" />

            {/* RAM Module 2 */}
            <rect x="35" y="64" width="150" height="38" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="37" y="66" width="146" height="6" rx="2" fill="url(#rgbBarGradient)" />
            <line x1="65" y1="78" x2="115" y2="78" stroke="#475569" strokeWidth="2" />
            <line x1="65" y1="84" x2="135" y2="84" stroke="#475569" strokeWidth="2" />
            <text x="155" y="92" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {shortLabel.slice(0, 6)}
            </text>
            <rect x="42" y="102" width="66" height="4" fill="#fbbf24" />
            <rect x="112" y="102" width="68" height="4" fill="#fbbf24" />

            <defs>
              <linearGradient id="rgbBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="35%" stopColor="#8b5cf6" />
                <stop offset="70%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        );
      }

      case 'storage': {
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* M.2 2280 PCB Form Factor */}
            <rect x="25" y="38" width="170" height="44" rx="4" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5" />
            {/* Golden Pins Connector */}
            <rect x="25" y="43" width="9" height="34" fill="#fbbf24" />
            {/* Screw Mounting Semi-circle Notch */}
            <circle cx="195" cy="60" r="5" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1" />

            {/* Controller Chip with Heat Spreader */}
            <rect x="45" y="45" width="24" height="24" rx="2" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
            <text x="57" y="59" textAnchor="middle" fill="#f8fafc" fontSize="6" fontWeight="bold" fontFamily="monospace">
              PCIe 4/5
            </text>

            {/* DRAM Cache IC */}
            <rect x="76" y="48" width="15" height="20" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1" />

            {/* 3D TLC NAND Flash Dies */}
            <rect x="98" y="44" width="36" height="32" rx="3" fill="#1e293b" stroke="#c084fc" strokeWidth="1.2" />
            <text x="116" y="62" textAnchor="middle" fill="#e9d5ff" fontSize="8" fontWeight="bold" fontFamily="monospace">
              TLC 3D
            </text>
            <rect x="142" y="44" width="36" height="32" rx="3" fill="#1e293b" stroke="#c084fc" strokeWidth="1.2" />
            <text x="160" y="62" textAnchor="middle" fill="#e9d5ff" fontSize="8" fontWeight="bold" fontFamily="monospace">
              NAND
            </text>
          </svg>
        );
      }

      case 'cooler': {
        const isWater = name.includes('360') || name.includes('240') || name.includes('水冷');
        if (isWater) {
          return (
            <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
              {/* Radiator Box (360mm) */}
              <rect x="20" y="20" width="180" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
              {/* 3x Radiator Fans */}
              <circle cx="55" cy="42" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="110" cy="42" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="165" cy="42" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />

              {/* Braided Water Tubes */}
              <path d="M35,65 Q50,95 85,90" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              <path d="M45,65 Q60,105 95,95" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />

              {/* RGB Pump Block with Infinity Mirror */}
              <rect x="90" y="75" width="40" height="35" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="110" cy="92" r="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="110" y="95" textAnchor="middle" fill="#38bdf8" fontSize="6" fontWeight="bold" fontFamily="monospace">
                RGB
              </text>
            </svg>
          );
        }
        // Dual Tower Air Cooler
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* Twin Fin Stacks */}
            <rect x="45" y="18" width="50" height="78" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="125" y="18" width="50" height="78" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />

            {/* Aluminum Fin Lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <React.Fragment key={i}>
                <line x1="45" y1={24 + i * 5.8} x2="95" y2={24 + i * 5.8} stroke="#334155" strokeWidth="1" />
                <line x1="125" y1={24 + i * 5.8} x2="175" y2={24 + i * 5.8} stroke="#334155" strokeWidth="1" />
              </React.Fragment>
            ))}

            {/* 6 Copper Heatpipes */}
            <path d="M55,96 C55,106 100,106 105,106" fill="none" stroke="#f59e0b" strokeWidth="3" />
            <path d="M165,96 C165,106 120,106 115,106" fill="none" stroke="#f59e0b" strokeWidth="3" />

            {/* Pure Copper Base */}
            <rect x="88" y="102" width="44" height="8" rx="2" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />

            {/* Center Fan Blade Frame */}
            <rect x="100" y="22" width="20" height="72" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          </svg>
        );
      }

      case 'psu': {
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* PSU Metal Enclosure */}
            <rect x="45" y="15" width="130" height="90" rx="6" fill="#18181b" stroke="#eab308" strokeWidth="1.5" />

            {/* 135mm FDB Fan Honeycomb Grill */}
            <circle cx="110" cy="55" r="32" fill="#09090b" stroke="#eab308" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="110" cy="55" r="10" fill="#27272a" />

            {/* 80Plus Gold / Platinum Emblem */}
            <rect x="55" y="84" width="32" height="13" rx="2" fill="#eab308" />
            <text x="71" y="93" textAnchor="middle" fill="#000" fontSize="7" fontWeight="900" fontFamily="sans-serif">
              GOLD
            </text>

            {/* ATX 3.1 12V-2x6 Native Label */}
            <text x="145" y="93" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold" fontFamily="monospace">
              ATX 3.1
            </text>

            {/* Power Switch & AC Receptacle */}
            <rect x="155" y="25" width="14" height="20" rx="2" fill="#27272a" stroke="#71717a" strokeWidth="1" />
          </svg>
        );
      }

      case 'case': {
        const isNorth = name.includes('North') || name.includes('原木');
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* Chassis Outer Frame */}
            <rect x="55" y="12" width="110" height="96" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />

            {isNorth ? (
              // Natural Wood Slats Front Panel (Fractal North style)
              <g>
                <rect x="58" y="15" width="28" height="90" rx="2" fill="#78350f" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <rect key={i} x={60 + i * 4.4} y="17" width="2.5" height="86" rx="1" fill="#d97706" />
                ))}
                {/* Clear Tempered Glass Window */}
                <rect x="89" y="15" width="73" height="90" rx="2" fill="#1e293b" fillOpacity="0.8" stroke="#64748b" strokeWidth="0.8" />
              </g>
            ) : (
              // 270-degree Panoramic Seamless Glass (O11 Dynamic Sea-view style)
              <g>
                <rect x="58" y="15" width="104" height="90" rx="4" fill="#1e293b" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1" />
                <polygon points="58,15 135,15 135,105 58,105" fill="#38bdf8" fillOpacity="0.1" />
              </g>
            )}

            {/* Internal Motherboard + GPU Silhouette */}
            <rect x="92" y="25" width="50" height="52" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <rect x="92" y="55" width="46" height="10" rx="2" fill="#10b981" fillOpacity="0.6" />
          </svg>
        );
      }

      case 'laptop':
      default: {
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* Display Lid & Panel */}
            <rect x="45" y="10" width="130" height="78" rx="6" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5" />
            <rect x="50" y="15" width="120" height="68" rx="4" fill="#1e1e2e" />
            {/* Screen Wallpaper Wave */}
            <path d="M50,65 Q85,30 115,55 T170,45 L170,83 L50,83 Z" fill="#8b5cf6" fillOpacity="0.35" />

            {/* Base Keyboard Deck */}
            <polygon points="30,94 190,94 180,108 40,108" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.2" />
            {/* Precision Trackpad */}
            <rect x="95" y="98" width="30" height="8" rx="1.5" fill="#334155" />
          </svg>
        );
      }
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
    <div
      className={`relative w-full h-44 sm:h-48 overflow-hidden rounded-t-2xl bg-gradient-to-br ${theme.gradient} bg-slate-100 dark:bg-[#070b14] flex items-center justify-center group/img select-none`}
    >
      {/* Silicon Wafer Die Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Micro-Die Wafer Dot Matrix Overlay */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148, 163, 184, 0.4) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />

      {/* Brand-Accurate Central Silicon Die Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-75 transition-opacity duration-300 group-hover/img:opacity-80"
        style={{
          background: `radial-gradient(circle 90px at center, ${theme.glow} 0%, transparent 75%)`,
        }}
      />

      {/* Engineering CAD Alignment Crosshair Marks (Corner Accents) */}
      <div className="absolute top-2.5 right-3 flex items-center space-x-1 font-mono text-[9px] text-slate-400/50 dark:text-slate-500/40 uppercase tracking-widest pointer-events-none select-none">
        <span className="text-amber-500/60 dark:text-[#F7D84A]/60">⌖</span>
        <span>DIE // SCHEMATIC</span>
      </div>

      {/* Pure Vector Hardware Blueprint Schematic Stage (Centerpiece) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-3 pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/img:scale-[1.04]">
        {renderSchematicSvg()}
      </div>

      {/* Bottom Subtle Gradient Fade into content card */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />

      {/* Category Tag Watermark Badge (Top-Left) */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700/60 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-xs pointer-events-none">
        <span className={theme.accent}>{getCategoryIcon()}</span>
        <span className="uppercase tracking-wider font-mono text-[10px]">{category}</span>
      </div>

      {/* Brand & Model Watermark (Bottom-Right) */}
      <div className="absolute bottom-2 right-3 z-20 text-[11px] font-mono font-black text-slate-400/70 dark:text-slate-500/60 uppercase tracking-widest pointer-events-none select-none">
        {brand}
      </div>
    </div>
  );
};
