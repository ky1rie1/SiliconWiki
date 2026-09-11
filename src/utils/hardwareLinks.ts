import type { HardwareItem } from '../types';
import type { HardwareRecord } from '../types/hardwareCatalog';

export function hardwareShareUrl(base: string, hardwareId: string) {
  const url = new URL(base);
  url.searchParams.set('tab', 'wiki'); url.searchParams.set('hardware', hardwareId); url.hash = '';
  return url.toString();
}

export function hardwareDocumentLinks(item: HardwareItem, record: HardwareRecord, lang: 'zh' | 'en'): NonNullable<HardwareItem['docsLinks']> {
  const zh = lang === 'zh';
  const checked: NonNullable<HardwareItem['docsLinks']> = record.sources.map(source => ({ title: source.kind === 'manufacturer' ? (zh ? `${item.name} · 已核验规格来源` : `${item.name} · checked specification source`) : (zh ? `${item.name} · ZOL 参数页` : `${item.name} · ZOL parameters`), url: source.url, platform: source.kind === 'manufacturer' ? 'official' : 'zol', description: `${zh ? '核对日期' : 'Checked'}: ${source.checkedAt}` }));
  const existing = record.links.documents.map(link => {
    const url = new URL(link.url);
    const isDirectory = /^\/(?:[a-z-]{2,5}\/)?$/.test(url.pathname) || /\/(cpu-specs|gpu-specs|cpu|vga|motherboard|memory|solid_state_drive)\/?$/.test(url.pathname);
    return isDirectory ? { ...link, title: `${url.hostname} · ${zh ? '产品目录 / 站点入口' : 'Catalog / site directory'}`, description: zh ? '分类或站点入口，不是此型号的专属参数页。' : 'A directory or website entry, not a model-specific specification page.' } : link;
  });
  const links = [...checked, ...existing];
  if (!links.length) links.push({ title: zh ? 'ZOL 产品目录' : 'ZOL product directory', url: 'https://detail.zol.com.cn/', platform: 'zol', description: zh ? '在目录中查找对应型号，核对具体版本。' : 'Find the exact model and variant in the catalog.' });
  return links.filter((link, i) => links.findIndex(other => other.url === link.url) === i);
}
