import { HardwareItem } from '../types';

/**
 * Common hardware abbreviations, gamer pinyin initials, and model aliases
 */
export const HARDWARE_ALIASES: Record<string, string[]> = {
  // Motherboards & Series pinyin / nicknames
  zps: ['重炮手'],
  pjp: ['迫击炮', 'mortar'],
  xd: ['小雕', 'aorus elite', '技嘉小雕', 'elite ax'],
  dtr: ['大雕', '雕', 'aorus'],
  dd: ['大雕', 'aorus master', 'aorus xtreme'],
  thk: ['战斧导弹', '战斧', 'tomahawk'],
  dyt: ['刀锋钛', 'edgeti', 'edge ti'],
  cx: ['吹雪', 'strix-a', 'strix a', 'roast snow'],
  mq: ['猛禽', 'strix'],
  ly: ['雷鹰', 'strix-e'],
  hjf: ['海景房', '全景', '无立柱'],

  // GPU nicknames & short codes
  '4070s': ['4070 super', 'rtx 4070 super', '4070s'],
  '4070tis': ['4070 ti super', 'rtx 4070 ti super', '4070tis'],
  '4080s': ['4080 super', 'rtx 4080 super', '4080s'],
  '4060ti': ['4060 ti', 'rtx 4060 ti'],
  '4070ti': ['4070 ti', 'rtx 4070 ti'],
  '4090d': ['4090 d', 'rtx 4090 d'],
  '5070': ['rtx 5070', 'geforce rtx 5070'],
  '5080': ['rtx 5080', 'geforce rtx 5080'],
  '5090': ['rtx 5090', 'geforce rtx 5090'],
  '5090d': ['rtx 5090 d', 'rtx 5090d'],
  '79xtx': ['7900 xtx', '7900xtx', 'rx 7900 xtx'],
  '79xt': ['7900 xt', '7900xt', 'rx 7900 xt'],
  '78xt': ['7800 xt', '7800xt', 'rx 7800 xt'],
  '77xt': ['7700 xt', '7700xt', 'rx 7700 xt'],
  '76xt': ['7600 xt', '7600xt', 'rx 7600 xt'],
  '675gre': ['6750 gre', 'rx 6750 gre', '6750gre'],

  // CPU shorthand
  '98x3d': ['9800x3d', 'ryzen 7 9800x3d', '9800 x3d'],
  '78x3d': ['7800x3d', 'ryzen 7 7800x3d', '7800 x3d'],
  '79x3d': ['7900x3d', 'ryzen 9 7900x3d'],
  '795x3d': ['7950x3d', 'ryzen 9 7950x3d'],
  '995x3d': ['9950x3d', 'ryzen 9 9950x3d'],
  '57x3d': ['5700x3d', 'ryzen 7 5700x3d'],
  '58x3d': ['5800x3d', 'ryzen 7 5800x3d'],
  '75f': ['7500f', 'ryzen 5 7500f'],
  '126kf': ['12600kf', 'i5-12600kf', 'core i5-12600kf'],
  '136kf': ['13600kf', 'i5-13600kf', 'core i5-13600kf'],
  '146kf': ['14600kf', 'i5-14600kf', 'core i5-14600kf'],
  '147kf': ['14700kf', 'i7-14700kf', 'core i7-14700kf'],
  '149kf': ['14900kf', 'i9-14900kf', 'core i9-14900kf'],
  '124f': ['12400f', 'i5-12400f'],
  '134f': ['13400f', 'i5-13400f'],
  '144f': ['14400f', 'i5-14400f'],
  '127kf': ['12700kf', 'i7-12700kf'],
  '137kf': ['13700kf', 'i7-13700kf'],
  '97x': ['9700x', 'ryzen 7 9700x'],
  '96x': ['9600x', 'ryzen 5 9600x'],
  '99x': ['9900x', 'ryzen 9 9900x'],
  '995x': ['9950x', 'ryzen 9 9950x'],
  '77x': ['7700x', 'ryzen 7 7700x'],
  '76x': ['7600x', 'ryzen 5 7600x'],
  ultra7: ['ultra 7', 'core ultra 7', '265k'],
  ultra9: ['ultra 9', 'core ultra 9', '285k'],
  ultra5: ['ultra 5', 'core ultra 5', '245k'],

  // Capacity / VRAM / Storage shorthand
  '8g': ['8gb', '8 g'],
  '12g': ['12gb', '12 g'],
  '16g': ['16gb', '16 g'],
  '24g': ['24gb', '24 g'],
  '32g': ['32gb', '32 g'],
  '64g': ['64gb', '64 g'],
  '1t': ['1tb', '1024gb', '1 t'],
  '2t': ['2tb', '2048gb', '2 t'],
  '4t': ['4tb', '4 t'],
  '512g': ['512gb'],

  // Form factor shorthand
  matx: ['m-atx', 'micro-atx', '紧凑级'],
  atx: ['atx', '标准大板'],
  itx: ['itx', 'mini-itx', '迷你'],

  // PSU wattage & cooling
  '650w': ['650 w', '650w'],
  '750w': ['750 w', '750w'],
  '850w': ['850 w', '850w'],
  '1000w': ['1000 w', '1000w', '1kw'],
  '1200w': ['1200 w', '1200w'],
  sl: ['水冷', '一体水冷', 'aio'],
  fl: ['风冷', '双塔', '单塔'],
  '360sl': ['360 水冷', '360水冷', '360 aio'],
  '240sl': ['240 水冷', '240水冷', '240 aio'],

  // Brands / Vendors
  hs: ['华硕', 'asus'],
  wx: ['微星', 'msi'],
  jj: ['技嘉', 'gigabyte'],
  qch: ['七彩虹', 'colorful', 'igame'],
  hq: ['华擎', 'asrock'],
  ywd: ['英伟达', 'nvidia'],
  hy: ['海韵', 'seasonic'],
  hdc: ['海盗船', 'corsair'],
  cc: ['长城', 'greatwall'],
  zh: ['振华', 'superflower'],
  lm: ['利民', 'thermalright'],
  jzfs: ['九州风神', 'deepcool'],
  wejl: ['瓦尔基里', 'valkyrie'],
  mty: ['猫头鹰', 'noctua'],
  ll: ['联力', 'lian li', 'lianli'],
  qsb: ['乔思伯', 'jonsbo'],
  ej: ['恩杰', 'nzxt'],
  zt: ['致态', 'zhitai', 'tiplus'],
  sx: ['三星', 'samsung'],
  xs: ['西数', 'western digital', 'wd'],
  jsd: ['金士顿', 'kingston', 'fury'],
  zq: ['芝奇', 'g.skill', 'gskill'],
  jbd: ['金百达', 'kingbank'],
};

/**
 * Normalizes text by lowercasing and stripping punctuation, spaces, hyphens, etc.
 */
export function normalizeHardwareText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\s\-_/\\,.()+·【】「」:："'“”‘’\[\]]/g, '');
}

/**
 * Build a structured searchable representation of a hardware item
 */
export function buildHardwareSearchContext(item: HardwareItem): {
  raw: string;
  normalized: string;
} {
  const specTokens: string[] = [];
  if (item.specs) {
    Object.entries(item.specs).forEach(([k, v]) => {
      specTokens.push(k, v);
    });
  }

  const parts = [
    item.name,
    item.brand,
    item.series,
    item.architecture || '',
    item.badge || '',
    item.trendText || '',
    item.category,
    item.pairingAdvice || '',
    ...(item.highlights || []),
    ...(item.pros || []),
    ...(item.cons || []),
    ...specTokens,
    item.jdSearchQuery || '',
    item.tbSearchQuery || '',
    item.pddSearchQuery || '',
  ];

  const raw = parts.filter(Boolean).join(' ').toLowerCase();
  const normalized = normalizeHardwareText(raw);

  return { raw, normalized };
}

/**
 * Test if a hardware search context matches a single search token
 */
function tokenMatchesContext(
  token: string,
  raw: string,
  normalized: string
): boolean {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return true;

  const normalizedToken = normalizeHardwareText(trimmed);

  // 1. Direct substring match in raw lowercase text
  if (raw.includes(trimmed)) {
    return true;
  }

  // 2. Normalized punctuation-stripped substring match
  if (normalizedToken && normalized.includes(normalizedToken)) {
    return true;
  }

  // 3. Alias / Pinyin abbreviation match
  const aliases = HARDWARE_ALIASES[normalizedToken] || HARDWARE_ALIASES[trimmed];
  if (aliases && aliases.length > 0) {
    for (const alias of aliases) {
      const lowerAlias = alias.toLowerCase();
      const normAlias = normalizeHardwareText(alias);
      if (raw.includes(lowerAlias) || (normAlias && normalized.includes(normAlias))) {
        return true;
      }
    }
  }

  // 4. Handle trailing numbers or units (e.g. "4070s" -> "4070" + "super", "12g" -> "12gb", "2t" -> "2tb")
  if (/^\d+[gt]b?$/i.test(trimmed)) {
    const num = trimmed.replace(/\D/g, '');
    const unit = trimmed.includes('t') ? 'tb' : 'gb';
    const target = `${num}${unit}`;
    if (raw.includes(target) || normalized.includes(target)) {
      return true;
    }
  }

  // 5. Handle model suffix e.g. "b650m" matching "b650"
  if (/^[a-z]\d{3}[a-z]?$/i.test(normalizedToken)) {
    const prefix = normalizedToken.slice(0, 4);
    if (normalized.includes(prefix)) {
      return true;
    }
  }

  return false;
}

/**
 * Advanced multi-token fuzzy search for hardware items
 * Supports:
 * - Multi-token splitting (AND logic: all tokens must match)
 * - Pinyin initials & colloquial aliases (zps -> 重炮手, pjp -> 迫击炮, xd -> 小雕, 4070s -> 4070 super, etc.)
 * - Punctuation/hyphen/case-insensitive fuzzy substring matching
 */
export function matchHardwareFuzzy(
  item: HardwareItem,
  query: string,
  cachedContext?: { raw: string; normalized: string }
): boolean {
  const cleanQuery = query.trim();
  if (!cleanQuery) return true;

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const context = cachedContext || buildHardwareSearchContext(item);

  // ALL tokens must match the item (AND conjunction)
  return tokens.every((token) =>
    tokenMatchesContext(token, context.raw, context.normalized)
  );
}

/**
 * Calculate relevance score for search sorting
 */
export function calculateHardwareSearchScore(
  item: HardwareItem,
  query: string
): number {
  const cleanQuery = query.trim();
  if (!cleanQuery) return 0;

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  let score = 0;
  const nameLower = item.name.toLowerCase();
  const brandLower = item.brand.toLowerCase();
  const seriesLower = item.series.toLowerCase();

  tokens.forEach((t) => {
    const lowerT = t.toLowerCase();
    const normT = normalizeHardwareText(t);

    if (nameLower.includes(lowerT)) score += 50;
    if (brandLower.includes(lowerT)) score += 30;
    if (seriesLower.includes(lowerT)) score += 20;

    const aliases = HARDWARE_ALIASES[normT] || HARDWARE_ALIASES[lowerT];
    if (aliases) {
      for (const a of aliases) {
        if (nameLower.includes(a.toLowerCase())) score += 40;
        if (brandLower.includes(a.toLowerCase())) score += 25;
      }
    }
  });

  return score;
}
