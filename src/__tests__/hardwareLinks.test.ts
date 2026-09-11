import { describe, expect, it } from 'vitest';
import { hardwareShareUrl, hardwareDocumentLinks } from '../utils/hardwareLinks';
import { createHardwareCatalog } from '../utils/hardwareCatalog';
import { hardwareList } from '../data/hardware';
import { getHardwareVerification } from '../data/sources/verifiedHardware';

describe('hardware references', () => {
  it('creates resolvable share routes while retaining a subdirectory deployment', () => {
    const url = new URL(hardwareShareUrl('https://example.test/wiki/?tab=3d#old', 'cpu-amd-9800x3d'));
    expect(url.pathname).toBe('/wiki/'); expect(url.searchParams.get('tab')).toBe('wiki');
    expect(url.searchParams.get('hardware')).toBe('cpu-amd-9800x3d'); expect(url.hash).toBe('');
  });
  it('does not describe directory pages as model-specific technical documents', () => {
    const item = { ...hardwareList[0], docsLinks: [{ title: 'Exact model datasheet', url: 'https://detail.zol.com.cn/cpu/', platform: 'zol' as const }] };
    const record = createHardwareCatalog([item]).byId.get(item.id)!;
    const links = hardwareDocumentLinks(item, record, 'en');
    expect(links[0].title).toContain('directory'); expect(links[0].description).toContain('not a model-specific');
  });
  it('prefers traceable exact manufacturer facts and rejects script links', () => {
    const item = hardwareList.find(item => item.id === 'cpu-amd-9800x3d')!;
    const record = createHardwareCatalog([{ ...item, docsLinks: [{ title: 'Bad', url: 'javascript:alert(1)', platform: 'other' }] }], getHardwareVerification).byId.get(item.id)!;
    expect(record.links.documents).toEqual([]);
    const links = hardwareDocumentLinks(item, record, 'en');
    expect(links[0].url).toContain('amd-ryzen-7-9800x3d.html');
    expect(links.some(link => link.url.includes('2113342/param.shtml'))).toBe(true);
    expect(record.specifications.filter(field => field.evidence === 'manufacturer-checked')).toHaveLength(7);
  });
});
