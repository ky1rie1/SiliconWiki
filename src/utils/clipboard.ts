export async function copyTextToClipboard(
  text: string,
  clipboard: Pick<Clipboard, 'writeText'> | null | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> {
  try {
    if (!clipboard) return false;
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
