export interface TextOverrideState {
  source: string;
  rendered: string;
}

export type TextOverrideEntries = ReadonlyArray<readonly [string, string]>;

export function createTextOverrideEntries(
  overrides: Record<string, { zh: string; en: string }>,
  lang: 'zh' | 'en',
  translations: { zh: Record<string, string>; en: Record<string, string> },
): TextOverrideEntries {
  const englishByChinese = new Map<string, string[]>();
  if (lang === 'en') {
    for (const [key, chinese] of Object.entries(translations.zh)) {
      const english = translations.en[key];
      if (english) englishByChinese.set(chinese, [...(englishByChinese.get(chinese) || []), english]);
    }
  }
  const dictionary: Record<string, string> = Object.create(null);
  for (const [source, replacement] of Object.entries(overrides)) {
    if (!source) continue;
    dictionary[source] = replacement[lang];
    for (const english of englishByChinese.get(source) || []) dictionary[english] = replacement.en;
  }
  return Object.entries(dictionary);
}

export function resolveTextOverride(current: string, previous: TextOverrideState | undefined, dictionary: Record<string, string> | TextOverrideEntries): TextOverrideState {
  // A value different from our last write belongs to React (language, count, etc.).
  const source = previous && current === previous.rendered ? previous.source : current;
  let rendered = source;
  const entries: TextOverrideEntries = Array.isArray(dictionary) ? dictionary : Object.entries(dictionary);
  for (const [key, value] of entries) {
    if (key) rendered = rendered.split(key).join(value);
  }
  return { source, rendered };
}
