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

  // Category Theme Colors & Accents
  const getTheme = () => {
    switch (category) {
      case 'cpu':
        return {
          gradient: 'from-amber-500/15 via-slate-100/60 to-slate-200/40 dark:from-amber-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          glow: 'rgba(245, 158, 11, 0.15)',
        };
      case 'gpu':
        return {
          gradient: 'from-emerald-500/15 via-slate-100/60 to-slate-200/40 dark:from-emerald-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          glow: 'rgba(16, 185, 129, 0.15)',
        };
      case 'motherboard':
        return {
          gradient: 'from-indigo-500/15 via-slate-100/60 to-slate-200/40 dark:from-indigo-500/10 dark:via-slate-900/80 dark:to-[#070b14]',
          accent: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-500/20',
          badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
          glow: 'rgba(99, 102, 241, 0.15)',
        };
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

  // High-Precision Architectural Schematic SVG
  const renderSchematicSvg = () => {
    switch (category) {
      case 'cpu': {
        const isAmd = brand.toUpperCase().includes('AMD') || name.includes('Ryzen');
        const is3D = name.includes('X3D');
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* Silicon Substrate with golden contact bevels */}
            <rect x="55" y="12" width="110" height="96" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="57" y="14" width="106" height="92" rx="6" fill="#0f172a" />

            {/* Integrated Heat Spreader (IHS) */}
            <rect x="66" y="22" width="88" height="76" rx="5" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="74" y="30" width="72" height="60" rx="4" fill="#1e293b" />

            {/* Pin 1 Golden Alignment Triangle */}
            <polygon points="58,15 70,15 58,27" fill="#f59e0b" />

            {/* 3D V-Cache Badge or Intel Hybrid Badge */}
            {is3D ? (
              <g>
                <rect x="82" y="34" width="56" height="12" rx="2" fill="#ef4444" fillOpacity="0.8" />
                <text x="110" y="43" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  3D V-CACHE
                </text>
              </g>
            ) : (
              <g>
                <rect x="82" y="34" width="56" height="12" rx="2" fill="#3b82f6" fillOpacity="0.8" />
                <text x="110" y="43" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  {isAmd ? 'ZEN ARCH' : 'HYBRID CORE'}
                </text>
              </g>
            )}

            {/* Laser Marking Text */}
            <text x="110" y="60" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="900" fontFamily="monospace">
              {shortLabel}
            </text>
            <text x="110" y="73" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {isAmd ? 'SOCKET AM5' : 'LGA 1851 / 1700'}
            </text>

            {/* Surface Mount Capacitors (SMD) */}
            <rect x="80" y="78" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="92" y="78" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="104" y="78" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="116" y="78" width="8" height="4" fill="#fbbf24" rx="1" />
            <rect x="128" y="78" width="8" height="4" fill="#fbbf24" rx="1" />

            {/* Circuit Traces Left & Right */}
            <line x1="15" y1="35" x2="55" y2="35" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="15" y1="60" x2="55" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="15" y1="85" x2="55" y2="85" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="165" y1="35" x2="205" y2="35" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="165" y1="60" x2="205" y2="60" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="165" y1="85" x2="205" y2="85" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />
          </svg>
        );
      }

      case 'gpu': {
        const isNvidia = brand.toUpperCase().includes('NVIDIA') || name.includes('RTX');
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* GPU Metal Shroud */}
            <rect x="20" y="20" width="180" height="80" rx="10" fill="#1e293b" stroke={isNvidia ? '#10b981' : '#f43f5e'} strokeWidth="1.5" />
            {/* Cooling Fin Lines */}
            {Array.from({ length: 22 }).map((_, i) => (
              <line key={i} x1={28 + i * 7.5} y1="26" x2={28 + i * 7.5} y2="94" stroke="#334155" strokeWidth="1" />
            ))}

            {/* Dual Axial Fans */}
            <circle cx="70" cy="60" r="26" fill="#0f172a" stroke={isNvidia ? '#10b981' : '#f43f5e'} strokeWidth="1.5" />
            <circle cx="70" cy="60" r="9" fill="#334155" />
            <circle cx="150" cy="60" r="26" fill="#0f172a" stroke={isNvidia ? '#10b981' : '#f43f5e'} strokeWidth="1.5" />
            <circle cx="150" cy="60" r="9" fill="#334155" />

            {/* Fan Blades (styled paths) */}
            <path d="M70,38 C80,47 80,53 70,60 C60,53 60,47 70,38 Z" fill={isNvidia ? '#10b981' : '#f43f5e'} fillOpacity="0.6" />
            <path d="M70,82 C80,73 80,67 70,60 C60,67 60,73 70,82 Z" fill={isNvidia ? '#10b981' : '#f43f5e'} fillOpacity="0.6" />
            <path d="M150,38 C160,47 160,53 150,60 C140,53 140,47 150,38 Z" fill={isNvidia ? '#10b981' : '#f43f5e'} fillOpacity="0.6" />
            <path d="M150,82 C160,73 160,67 150,60 C140,67 140,73 150,82 Z" fill={isNvidia ? '#10b981' : '#f43f5e'} fillOpacity="0.6" />

            {/* Center Model Plate */}
            <rect x="98" y="48" width="24" height="24" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
            <text x="110" y="63" textAnchor="middle" fill="#f8fafc" fontSize="7" fontWeight="bold" fontFamily="monospace">
              {isNvidia ? 'RTX' : 'RDNA'}
            </text>

            {/* PCIe 5.0 Golden Fingers */}
            <rect x="55" y="101" width="100" height="7" rx="1" fill="#f59e0b" />

            {/* Metal I/O Bracket */}
            <rect x="14" y="14" width="6" height="92" rx="2" fill="#94a3b8" />

            {/* 12V-2x6 Power Connector */}
            <rect x="175" y="16" width="16" height="6" rx="1" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
          </svg>
        );
      }

      case 'motherboard': {
        return (
          <svg viewBox="0 0 220 120" className="w-full h-full drop-shadow-sm select-none">
            {/* ATX Mainboard PCB */}
            <rect x="40" y="8" width="140" height="104" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />

            {/* VRM Heatsink 1 (Top) */}
            <rect x="75" y="14" width="40" height="14" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            {/* VRM Heatsink 2 (Left) */}
            <rect x="48" y="18" width="18" height="44" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />

            {/* CPU Socket with Lever */}
            <rect x="72" y="32" width="38" height="38" rx="3" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="91" cy="51" r="9" fill="#334155" />

            {/* 4x DDR5 RAM Slots */}
            <rect x="122" y="22" width="4" height="48" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="130" y="22" width="4" height="48" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="138" y="22" width="4" height="48" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="146" y="22" width="4" height="48" rx="1" fill="#475569" stroke="#38bdf8" strokeWidth="0.8" />

            {/* Reinforced PCIe 5.0 x16 Slot */}
            <rect x="52" y="78" width="80" height="7" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
            {/* M.2 Armor Shield */}
            <rect x="52" y="89" width="75" height="12" rx="2" fill="#1e293b" stroke="#818cf8" strokeWidth="1" />
            <text x="89" y="98" textAnchor="middle" fill="#a5b4fc" fontSize="6" fontFamily="monospace">
              PCIe 5.0 M.2 SHIELD
            </text>

            {/* Chipset Heatsink */}
            <rect x="138" y="78" width="34" height="28" rx="3" fill="#334155" stroke="#6366f1" strokeWidth="1.2" />
            <text x="155" y="94" textAnchor="middle" fill="#f8fafc" fontSize="7" fontWeight="bold" fontFamily="monospace">
              {shortLabel.slice(0, 5)}
            </text>
          </svg>
        );
      }

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
      {/* Background Engineering Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Vector Hardware Blueprint Schematic Stage */}
      <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none transition-transform duration-500 group-hover/img:scale-105">
        {renderSchematicSvg()}
      </div>

      {/* Product Photography Backdrop (Clean overlay without destructive mix-blend) */}
      {imageUrl && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover/img:scale-105 ${
              imgLoaded ? 'opacity-25 dark:opacity-20 contrast-110' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-slate-900 dark:via-slate-900/40 dark:to-transparent" />
        </div>
      )}

      {/* Bottom Subtle Gradient Fade into content card */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />

      {/* Category Tag Watermark Badge (Top-Left) */}
      <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-950/80 border border-slate-200/90 dark:border-slate-700/60 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-xs pointer-events-none">
        <span className={theme.accent}>{getCategoryIcon()}</span>
        <span className="uppercase tracking-wider font-mono text-[10px]">{category}</span>
      </div>

      {/* Brand & Model Watermark (Bottom-Right) */}
      <div className="absolute bottom-2 right-3 text-[11px] font-mono font-black text-slate-400/60 dark:text-slate-500/50 uppercase tracking-widest pointer-events-none select-none">
        {brand}
      </div>
    </div>
  );
};
