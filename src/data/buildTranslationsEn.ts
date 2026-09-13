import { RecommendedBuild } from '../types';

export interface BuildTranslationEn {
  title: string;
  tagline: string;
  scenario: string;
  notes: string[];
  parts: Record<number, { name: string; spec: string }>;
  upgradeOptions: Record<string, { title: string; description: string; partName: string }>;
}

export const buildTranslationsEn: Record<string, BuildTranslationEn> = {
  'build-3500-entry': {
    title: '¥3,500 Tier: High-Efficiency 1080P Esports Build',
    tagline: 'Smooth high-framerate 1080P competitive gaming with verified balanced hardware',
    scenario: '1080P competitive esports (CS2 / Valorant / Naraka / LoL), everyday office work, and academic study',
    notes: [
      'All components are selected from tier-1 manufacturers\' mainstream lines with zero second-hand or pull parts.',
      'Both i5-12400F and Ryzen 5 5600 feature pure performance cores, guaranteeing smooth, anomaly-free scheduling in Windows 10/11.',
      'RX 6750 GRE 10GB provides ample raster performance to run modern esports and AAA titles smoothly at high 1080P settings.',
    ],
    parts: {
      0: { name: 'Intel Core i5-12400F / AMD Ryzen 5 5600 Tray', spec: '6C/12T / Pure P-Core Architecture Stable Scheduling' },
      1: { name: 'Maxsun MS-Terminator H610M / ASRock B450M-HDV', spec: 'M-ATX / Reliable VRM / Dual-Channel DDR4' },
      2: { name: 'AMD Radeon RX 6750 GRE 10GB / RTX 4060 8GB', spec: '10GB/8GB VRAM / Smooth 1080P High-Preset Gaming' },
      3: { name: 'Gloway / Kingbank Silver DDR4 3200 16GB (8GBx2)', spec: '16GB Dual-Channel Kit / Original Manufacturer DRAM' },
      4: { name: 'ZhiTai TiPlus5000 / Kioxia G3 1TB PCIe 4.0 NVMe SSD', spec: '1TB / Original 3D TLC Flash / 5000 MB/s Read' },
      5: { name: 'Thermalright Assassin X 120 Refined SE Air Cooler', spec: '4 Nickel Heatpipes / 120mm PWM Fan' },
      6: { name: 'SAMA / Xuanwu 550W Bronze/Gold Certified PSU', spec: '550W Continuous / Stable Single +12V Rail' },
      7: { name: 'SAMA Flathead / WJ MATX High-Airflow Chassis', spec: 'Optimized Front-to-Top Airflow / Magnetic Dust Filters' },
    },
    upgradeOptions: {
      'opt-3500-cpu-box': {
        title: 'CPU Option: Upgrade to Retail Boxed (with Stock Cooler & 3-Yr Warranty)',
        description: 'Official 3-year replacement warranty, includes boxed cooler and authentic packaging for peace of mind.',
        partName: 'Intel Core i5-12400F Boxed Processor',
      },
      'opt-3500-gpu-4060': {
        title: 'GPU Option: Switch to RTX 4060 8GB (DLSS 3 + Ultra-Low 115W TDP)',
        description: 'Enables DLSS 3 Frame Generation and NVENC hardware encoder, faster media exports and cooler operation.',
        partName: 'MSI GeForce RTX 4060 8GB Ventus / Inno3D',
      },
      'opt-3500-ram-32g': {
        title: 'RAM Option: Expand from 16GB (8Gx2) to 32GB (16Gx2) Dual Channel',
        description: 'Run dozens of browser tabs, background apps, and games simultaneously without memory limits.',
        partName: 'Kingbank Silver DDR4 3200 32GB (16GBx2) Kit',
      },
      'opt-3500-ssd-2tb': {
        title: 'Storage Option: Expand 1TB to 2TB ZhiTai TiPlus5000',
        description: 'Massive capacity with zero anxiety, easily housing 15+ modern 100GB+ AAA games.',
        partName: 'ZhiTai TiPlus5000 2TB PCIe 3.0 NVMe SSD',
      },
      'opt-3500-case-view': {
        title: 'Chassis Option: Upgrade to 270° Panoramic Dual-Glass Case (with ARGB Fans)',
        description: 'Dual-pane pillarless tempered glass with motherboard ARGB synchronization.',
        partName: 'WJ Mini White Panoramic Glass Chassis',
      },
    },
  },
  'build-5500-mainstream': {
    title: '¥5,500 Tier: 2K Gaming Sweet-Spot Build',
    tagline: 'Modern AM5 Zen 4 platform with DDR5 support for mainstream 2K raster and ray-traced gaming',
    scenario: '2K resolution gaming at mainstream settings, lightweight local AI inference, and video editing in Premiere / CapCut',
    notes: [
      'The AM5 platform guarantees long-term upgradeability; the motherboard and DDR5 memory will seamlessly support future-gen CPU drops.',
      'The RX 6750 GRE 12GB features a 192-bit bus with 12GB VRAM, preventing memory spillover at demanding 2K settings.',
      'Excellent system energy efficiency, with measured full-load power draw around 280W for easy acoustic and thermal control.',
    ],
    parts: {
      0: { name: 'AMD Ryzen 5 7500F Tray Processor', spec: '6C/12T / Zen 4 Architecture / 5.0 GHz Max Boost' },
      1: { name: 'Maxsun B650M Challenger / ASRock B650M-H/M.2', spec: 'AM5 Socket / Robust VRM / Dual M.2 PCIe 4.0 Slots' },
      2: { name: 'AMD Radeon RX 6750 GRE 12GB / RTX 4060 8GB', spec: '12GB High-Speed VRAM / DLSS 3 & FSR 3 Support' },
      3: { name: 'Kingbank / Gloway DDR5 6000 32GB (16GBx2)', spec: '32GB Dual Channel / Hynix DRAM / Low-Latency Tuning' },
      4: { name: 'ZhiTai TiPlus7100 / Kioxia 1TB PCIe 4.0 NVMe SSD', spec: '7000 MB/s Sequential Read / Original 3D TLC' },
      5: { name: 'Thermalright Burst Assassin 120 6-Heatpipe Cooler', spec: '6 AGHP Heatpipes / Reflow Soldered Copper Base' },
      6: { name: 'Huntkey WD650 / Great Wall 650W 80 PLUS Gold PSU', spec: '650W Rated / Active PFC / 80 PLUS Gold Certified' },
      7: { name: 'SAMA New Vision / MATX Optimized Airflow Chassis', spec: 'Dual-Pane Tempered Glass / Independent Vertical Airflow' },
    },
    upgradeOptions: {
      'opt-5500-cpu-7700': {
        title: 'CPU Option: Upgrade Ryzen 5 7500F to Ryzen 7 7700 (8C/16T)',
        description: 'Adds two physical cores for faster rendering exports and higher 1% low FPS.',
        partName: 'AMD Ryzen 7 7700 8-Core/16-Thread Tray Processor',
      },
      'opt-5500-gpu-4060ti': {
        title: 'GPU Option: Upgrade to RTX 4060 Ti 8GB (Ada Lovelace)',
        description: 'Significantly enhances ray tracing performance and local AI image generation at 160W TDP.',
        partName: 'Colorful GeForce RTX 4060 Ti BattleAx 8GB',
      },
      'opt-5500-ssd-2tb': {
        title: 'Storage Option: Expand 1TB to 2TB ZhiTai TiPlus7100 (7000MB/s Gen4)',
        description: 'Original Xtacking 3.0 TLC flash with 1200 TBW endurance, ending storage limits.',
        partName: 'ZhiTai TiPlus7100 2TB PCIe 4.0 NVMe SSD',
      },
      'opt-5500-cooler-aio': {
        title: 'Cooling Option: Upgrade Air Cooler to 240mm AIO Liquid Cooler',
        description: 'Dual-fan top exhaust radiator clearing internal case heat with clean aesthetic.',
        partName: 'Thermalright Frozen Prism 240 AIO Liquid Cooler',
      },
    },
  },
  'build-8500-2k-enthusiast': {
    title: '¥8,500 Tier: 2K High-Refresh / 4K Esports Powerhouse',
    tagline: 'Uncut 12GB VRAM core paired with low-latency DDR5 for high-FPS esports and entry 4K gaming',
    scenario: '2K 180Hz+ high-refresh competitive esports, 4K mainstream gaming, local 7B/14B LLM inference, and 4K video editing',
    notes: [
      'RTX 4070 SUPER delivers stable 90+ FPS in mainstream 2K AAA titles with full ray tracing and DLSS Frame Generation enabled.',
      'CL30 ultra-low latency DDR5 memory noticeably improves 1% low FPS stability during intense combat.',
      'Native ATX 3.0 16-pin power delivery provides certified transient spike headroom and reduced connector temperatures.',
    ],
    parts: {
      0: { name: 'AMD Ryzen 5 7500F / Intel Core i5-14600KF Tray', spec: 'High Boost Clocks / Low-Latency Large Cache for Esports' },
      1: { name: 'ASUS TUF GAMING B650M-PLUS / MSI B760M Mortar', spec: '12+2 Phase Power / 2.5G Ethernet + Wi-Fi 6E' },
      2: { name: 'NVIDIA GeForce RTX 4070 SUPER 12GB', spec: 'AD104 Die / 7168 CUDA Cores / DLSS 3.5 Ray Reconstruction' },
      3: { name: 'Acer Predator / G.Skill DDR5 6000 C30 32GB (16GBx2)', spec: 'Hynix A-die / 6000MHz CL30 Ultra-Low Latency' },
      4: { name: 'ZhiTai TiPlus7100 1TB PCIe 4.0 NVMe SSD', spec: 'Xtacking 3.0 / 7000 MB/s Read / 600 TBW Endurance' },
      5: { name: 'Thermalright Peerless Assassin 120 (PA120) Dual Tower', spec: '6 Heatpipes / Dual 120mm Fans / 200W+ Dissipation' },
      6: { name: 'SAMA Black Diamond / Super Flower 750W ATX 3.0 Gold Modular', spec: '750W Rated / Native PCIe 5.0 12V-2x6 / All-Japanese Caps' },
      7: { name: 'Lian Li Lancool 216 / Mechanic Master Airflow Chassis', spec: 'Dual Large Front Intake Fans / High-Porosity Mesh Panel' },
    },
    upgradeOptions: {
      'opt-8500-cpu-7800x3d': {
        title: 'CPU Option: Upgrade to AMD Ryzen 7 7800X3D (3D V-Cache Gaming King)',
        description: '96MB on-die L3 cache delivers massive framerate jumps and unyielding 1% low stability.',
        partName: 'AMD Ryzen 7 7800X3D Boxed Processor',
      },
      'opt-8500-gpu-4070tis': {
        title: 'GPU Option: Upgrade to RTX 4070 Ti SUPER 16GB (AD103 / 256-Bit VRAM)',
        description: 'VRAM jumps from 12GB to 16GB 256-bit, easily conquering 4K heavy ray tracing 3A titles.',
        partName: 'Gainward / Galaxy GeForce RTX 4070 Ti SUPER 16GB',
      },
      'opt-8500-ssd-2tb': {
        title: 'Storage Option: Expand 1TB to 2TB ZhiTai TiPlus7100',
        description: '2TB large capacity with high endurance, tailored for large 4K game libraries.',
        partName: 'ZhiTai TiPlus7100 2TB PCIe 4.0 SSD',
      },
      'opt-8500-case-tk2': {
        title: 'Chassis Option: Upgrade to Jonsbo TK-2 270° Curved Glass Case',
        description: 'Dual-curved wraparound tempered glass elevating desktop transparency and industrial design.',
        partName: 'Jonsbo TK-2 Black Curved Panoramic Case',
      },
    },
  },
  'build-13000-pure-gaming': {
    title: '¥13,000 Tier: 4K Esports & Pro Creative Workstation',
    tagline: 'High-efficiency stacked cache paired with 16GB 256-bit VRAM for demanding 4K loads and professional workflows',
    scenario: 'Native 4K ultra-preset AAA gaming, Unreal Engine 5 / Blender 3D rendering, engineering simulation, and 4K multi-track production',
    notes: [
      '16GB 256-bit VRAM comfortably buffers high-resolution 4K textures and local quantized AI model weights.',
      'Ryzen 7 9800X3D\'s massive 3D V-Cache maintains rock-solid 1% low framerates in physics-heavy and multi-unit scenarios.',
      'Entire configuration adheres to ATX 3.1 standards with generous transient power headroom and extended component longevity.',
    ],
    parts: {
      0: { name: 'AMD Ryzen 7 9800X3D / Intel Core Ultra 7 265K', spec: '2nd Gen 3D V-Cache / High Frequency Multi-Core High Efficiency' },
      1: { name: 'MSI MAG B650M MORTAR WIFI / ASUS Z890 High-End Board', spec: 'High-Tier Digital VRM / PCIe 5.0 GPU Slot / Dual 2.5G Expansion' },
      2: { name: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB', spec: '16GB 256-bit GDDR6X / AD103 Die / 8448 CUDA Cores' },
      3: { name: 'G.Skill Trident Z5 / Acer Predator DDR5 6000 C30 32GB (16GBx2)', spec: '32GB Dual Channel / Low-Latency Binned ICs / Heavy Heatsinks' },
      4: { name: 'ZhiTai TiPlus7100 2TB PCIe 4.0 NVMe SSD', spec: '2TB Capacity / 7000 MB/s / 1200 TBW Endurance' },
      5: { name: 'Valkyrie GL360 / ProArtist 360 AIO Liquid Cooler', spec: '360mm Radiator / High-Head Silent Pump / High Transient Taming' },
      6: { name: 'Super Flower LEADEX / SAMA 850W ATX 3.1 Gold Modular', spec: '850W Continuous / ATX 3.1 Certified / 12V-2x6 Safe Connector' },
      7: { name: 'Lian Li Lancool 216 / SAMA High-Flow Panoramic Chassis', spec: 'Modular Airflow Layout / 360 Radiator Top Mount & Long GPU Fit' },
    },
    upgradeOptions: {
      'opt-13000-cpu-265k': {
        title: 'CPU Option: Switch to Intel Core Ultra 7 265K (20C/20T All-Round Creator)',
        description: 'Arrow Lake architecture delivering stronger multi-core export and outstanding thermal efficiency.',
        partName: 'Intel Core Ultra 7 265K Boxed Processor',
      },
      'opt-13000-gpu-4080s': {
        title: 'GPU Option: Upgrade to RTX 4080 SUPER 16GB (AD103 Uncut 10240 CUDA)',
        description: 'Uncut 4K native ray tracing powerhouse with massive shader compute for high-refresh 4K gaming.',
        partName: 'Colorful iGame GeForce RTX 4080 SUPER Ultra W 16GB',
      },
      'opt-13000-ram-64g': {
        title: 'RAM Option: Upgrade 32GB to 64GB (32GBx2) DDR5 6000 C30 Kit',
        description: 'Handles large local AI model quantization, complex UE5 scenes, and real-time 4K timeline scrubbing.',
        partName: 'Acer Predator DDR5 6000 C30 64GB (32GBx2) Kit',
      },
      'opt-13000-psu-1000w': {
        title: 'Power Option: Upgrade 850W to 1000W ATX 3.1 Platinum Modular',
        description: 'Provides excessive transient headroom, eliminating PSU replacement for future 50-series flagship upgrades.',
        partName: 'SAMA Black Diamond 1000W ATX 3.1 Platinum/Gold Modular',
      },
    },
  },
  'build-25000-ultimate': {
    title: '¥25,000+ Tier: Ultimate Enthusiast Flagship',
    tagline: 'Workstation-class computing power and massive VRAM designed for extreme simulation, industrial graphics, and enthusiast rigs',
    scenario: '8K / 4K extreme path-traced rendering, local 70B LLM quantization, high-throughput engineering simulation, and flagship gaming',
    notes: [
      'Every component represents current industry-leading specifications, maximizing compute stability and future expansion.',
      'Equipped with 64GB DDR5 dual-channel memory and ultra-large VRAM, comfortably handling enterprise model tuning and complex 3D scenes.',
      'Power delivery and liquid cooling systems feature excessive thermal margins for sustained 24/7 high-load reliability.',
    ],
    parts: {
      0: { name: 'AMD Ryzen 7 9800X3D / Ryzen 9 9950X Boxed Processor', spec: '16C/32T or 3D V-Cache Architecture / Flagship Compute Silicon' },
      1: { name: 'ASUS ROG STRIX X870E-F / MSI X870E Flagship Board', spec: '18+2+2 Power Stages / Dual USB4 / Full PCIe 5.0 Slots' },
      2: { name: 'NVIDIA GeForce RTX 5090 32GB / RTX 4090 24GB', spec: 'Flagship GPU Core / 32GB/24GB VRAM / Extreme Raster & AI Compute' },
      3: { name: 'G.Skill Trident Z5 DDR5 6400 64GB (32GBx2) High-Speed Kit', spec: '64GB Dual Channel / CL32 / Premium Anodized Aluminum Armor' },
      4: { name: 'Kioxia EXCERIA PLUS G3 2TB Gen5 / ZhiTai 4TB Gen4 SSD', spec: 'PCIe 5.0 Extreme Speed / 3D TLC / Dedicated DRAM Cache' },
      5: { name: 'NZXT Kraken Elite 360 / Valkyrie 360 AIO Liquid Cooler', spec: 'High-Performance Pump / Thick Radiator / High-Pressure Silent Fans' },
      6: { name: 'Seasonic VERTEX GX-1000 / Super Flower 1000W-1200W ATX 3.1', spec: '1000W-1200W / ATX 3.1 & PCIe 5.1 / Platinum/Gold Efficiency' },
      7: { name: 'Lian Li O11 Dynamic EVO RGB Dual-Chamber Glass Chassis', spec: 'Dual-Pane Pillarless Glass / Dual-Chamber Thermal Isolation' },
    },
    upgradeOptions: {
      'opt-25000-cpu-9950x': {
        title: 'CPU Option: Switch to AMD Ryzen 9 9950X (16C/32T Multi-Core Titan)',
        description: 'Dual full-core CCDs with massive parallel throughput, significantly outperforming single-CCD CPUs in Cinema 4D / V-Ray.',
        partName: 'AMD Ryzen 9 9950X Boxed Processor',
      },
      'opt-25000-gpu-5090': {
        title: 'GPU Option: Upgrade to Next-Gen Blackwell Flagship RTX 5090 32GB',
        description: 'Equipped with 32GB 512-bit VRAM and groundbreaking AI TOPS, the ultimate weapon for local 70B LLMs and 8K creation.',
        partName: 'NVIDIA GeForce RTX 5090 32GB Flagship Graphics Card',
      },
      'opt-25000-ssd-raid': {
        title: 'Storage Option: Dual-Drive Array (4TB Gen4 Storage + 2TB Gen5 OS Drive)',
        description: 'PCIe 5.0 blazing OS drive paired with 4TB mass production assets SSD, completely freeing creative workflow.',
        partName: 'ZhiTai TiPlus7100 4TB PCIe 4.0 SSD (Secondary Drive)',
      },
      'opt-25000-case-north': {
        title: 'Chassis Option: Switch to Fractal Design North XL Solid Walnut/Oak Silent Chassis',
        description: 'Real North American walnut/oak front slats, quiet zero-RGB Scandinavian aesthetic with high-flow design.',
        partName: 'Fractal Design North XL Charcoal Black / Chalk White',
      },
    },
  },
};

export function getLocalizedBuildTitle(build: RecommendedBuild, lang: string): string {
  if (lang === 'en' && buildTranslationsEn[build.id]?.title) {
    return buildTranslationsEn[build.id].title;
  }
  return build.title;
}

export function getLocalizedBuildTagline(build: RecommendedBuild, lang: string): string {
  if (lang === 'en' && buildTranslationsEn[build.id]?.tagline) {
    return buildTranslationsEn[build.id].tagline;
  }
  return build.tagline;
}

export function getLocalizedBuildScenario(build: RecommendedBuild, lang: string): string {
  if (lang === 'en' && buildTranslationsEn[build.id]?.scenario) {
    return buildTranslationsEn[build.id].scenario;
  }
  return build.scenario;
}

export function getLocalizedBuildNotes(build: RecommendedBuild, lang: string): string[] {
  if (lang === 'en' && buildTranslationsEn[build.id]?.notes) {
    return buildTranslationsEn[build.id].notes;
  }
  return build.notes;
}

export function getLocalizedPartName(buildId: string, partIdx: number, defaultName: string, lang: string): string {
  if (lang === 'en' && buildTranslationsEn[buildId]?.parts[partIdx]?.name) {
    return buildTranslationsEn[buildId].parts[partIdx].name;
  }
  return defaultName;
}

export function getLocalizedPartSpec(buildId: string, partIdx: number, defaultSpec: string, lang: string): string {
  if (lang === 'en' && buildTranslationsEn[buildId]?.parts[partIdx]?.spec) {
    return buildTranslationsEn[buildId].parts[partIdx].spec;
  }
  return defaultSpec;
}

export function getLocalizedUpgradeOption(
  buildId: string,
  optionId: string,
  defaultOption: { title: string; description: string; partName: string },
  lang: string
): { title: string; description: string; partName: string } {
  if (lang === 'en' && buildTranslationsEn[buildId]?.upgradeOptions[optionId]) {
    return buildTranslationsEn[buildId].upgradeOptions[optionId];
  }
  return defaultOption;
}
