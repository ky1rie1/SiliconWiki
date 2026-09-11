/** Export actual data values through the project's existing esbuild dependency. */
import { build } from 'esbuild';
const result = await build({
  stdin: { contents: `import { hardwareList as items, hardwareCatalog } from './src/data/hardware';
    import { hardwareDocumentLinks } from './src/utils/hardwareLinks';
    import { recommendedBuilds } from './src/data/builds';
    import * as guides from './src/data/bilibiliVideos';
    const hardwareList = items.map(item => { const record = hardwareCatalog.byId.get(item.id); return record ? { ...item, docsLinks: hardwareDocumentLinks(item, record, 'zh'), reviewLinks: record.links.reviews } : item; });
    console.log(JSON.stringify({hardwareList,recommendedBuilds,bilibiliVideos:guides.bilibiliVideos ?? [],bilibiliSearchGuides:guides.bilibiliSearchGuides ?? []}));`,
    resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
});
await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
