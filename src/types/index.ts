export type HardwareCategory =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'cooler'
  | 'case'
  | 'laptop';

export type PriceTrend = 'down' | 'stable' | 'up' | 'warning';

export interface HardwareItem {
  id: string;
  name: string;
  category: HardwareCategory;
  brand: string;
  series: string;
  architecture?: string;
  releaseYear: number;
  specs: Record<string, string>;
  highlights: string[];
  pros: string[];
  cons: string[];
  tdpWatts: number;
  msrpRmb: number;
  marketPriceRange: [number, number]; // [min, max]
  priceTrend: PriceTrend;
  trendText?: string;
  badge?: string;
  jdSearchQuery: string;
  tbSearchQuery: string;
  pddSearchQuery: string;
  imageUrl?: string;
  isLaptop?: boolean;
}

export interface BenchmarkItem {
  id: string;
  name: string;
  type: 'cpu' | 'gpu';
  platform: 'desktop' | 'laptop';
  brand: 'Intel' | 'AMD' | 'NVIDIA' | 'Apple';
  scores: {
    gamingScore: number; // 相对 100% 归一化分
    productivityScore: number;
    efficiencyScore: number; // 能耗比分
    timeSpyScore?: number; // 3DMark TimeSpy Graphics
    cinebenchR23Multi?: number;
    cinebenchR23Single?: number;
  };
  tdpWatts: number;
  geekerwanUrl?: string;
  techPowerUpUrl?: string;
  passmarkUrl?: string;
}

export type GlossaryCategory =
  | 'cpu'
  | 'gpu'
  | 'display'
  | 'storage'
  | 'motherboard'
  | 'cooling'
  | 'psu';

export interface GlossaryTerm {
  id: string;
  term: string;
  alias?: string[];
  category: GlossaryCategory;
  shortDesc: string; // 一句话大白话
  fullExplanation: string; // 深度技术原理
  buyingAdvice: string; // 选购避坑指南
  tags: string[];
}

export interface AssemblyStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  instructions: string[];
  criticalWarning?: string; // 撕膜、防呆等高危提示
  debugCheck?: string; // Debug灯与排障检查
  componentKey: string; // 关联 3D 部件标识
  cameraFocus: [number, number, number];
  bilibiliTimestamp?: string; // 对应视频时间点
}

export interface BuildPart {
  type: string;
  name: string;
  spec: string;
  approxPrice: number;
  jdQuery: string;
}

export interface RecommendedBuild {
  id: string;
  title: string;
  budgetLevel: string; // e.g. "3000元档"
  targetPrice: number;
  tagline: string;
  scenario: string; // 适用场景
  parts: BuildPart[];
  totalPrice: number;
  notes: string[];
}

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  tag?: string;
  updates: {
    type: 'feature' | 'data' | 'price' | 'fix';
    text: string;
  }[];
}

export type ActiveTab =
  | 'wiki'
  | 'rankings'
  | 'simulator3d'
  | 'glossary'
  | 'builds';
