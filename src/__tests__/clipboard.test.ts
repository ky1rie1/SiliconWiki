import { describe, expect, it } from 'vitest';
import { copyTextToClipboard } from '../utils/clipboard';

describe('clipboard writes', () => {
  it('reports success only after the clipboard accepts the text', async () => {
    let accept!: () => void;
    let received = '';
    const pending = new Promise<void>((resolve) => { accept = resolve; });
    let completed = false;
    const result = copyTextToClipboard('PC build', { writeText: (text) => { received = text; return pending; } })
      .then((success) => { completed = true; return success; });
    await Promise.resolve();
    expect(completed).toBe(false);
    accept();
    expect(await result).toBe(true);
    expect(received).toBe('PC build');
  });

  it('reports permission failure without an unhandled rejection', async () => {
    expect(await copyTextToClipboard('PC build', { writeText: async () => { throw new Error('Permission denied'); } })).toBe(false);
  });

  it('handles browsers without the Clipboard API', async () => {
    expect(await copyTextToClipboard('PC build', null)).toBe(false);
  });
});
