export interface TextOverrideState {
  source: string;
  rendered: string;
}

export function resolveTextOverride(current: string, previous: TextOverrideState | undefined, dictionary: Record<string, string>): TextOverrideState {
  // A value different from our last write belongs to React (language, count, etc.).
  const source = previous && current === previous.rendered ? previous.source : current;
  let rendered = source;
  for (const [key, value] of Object.entries(dictionary)) {
    if (key) rendered = rendered.split(key).join(value);
  }
  return { source, rendered };
}
