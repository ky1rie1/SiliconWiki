import type { HardwareRecord } from '../../types/hardwareCatalog';

export function HardwareMeasurements({ record, view, lang }: { record: HardwareRecord; view: 'price' | 'benchmarks'; lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const panel = 'rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4';
  if (view === 'benchmarks') {
    const labels = {
      gamingScore: zh ? '游戏参考分' : 'Gaming reference score',
      productivityScore: zh ? '生产力参考分' : 'Productivity reference score',
      efficiencyScore: zh ? '能效参考分' : 'Efficiency reference score',
      timeSpyScore: '3DMark Time Spy Graphics', cinebenchMulti: 'Cinebench R23 Multi', cinebenchSingle: 'Cinebench R23 Single',
    };
    const scores = Object.entries(record.benchmarks.scores);
    return <section className="space-y-4" data-measurements="benchmarks">
      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{zh ? '以下为仓库维护的参考分数，尚未逐项附上测试环境与原始报告，不标记为已核验实测。' : 'These catalog reference scores do not yet include complete test conditions and original reports. They are not verified measurements.'}</p>
      {scores.length ? <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">{scores.map(([key, value]) => <div key={key} className={panel}><dt className="text-xs text-zinc-500 dark:text-zinc-400">{labels[key as keyof typeof labels]}</dt><dd className="mt-2 font-mono text-2xl font-semibold">{value?.toLocaleString(lang)}</dd></div>)}</dl> : <p className={`${panel} text-sm`} role="status">{zh ? '暂无跑分记录，不根据售价推算性能。' : 'No benchmark records. Performance is not inferred from price.'}</p>}
    </section>;
  }
  const price = record.pricing;
  return <section className="space-y-4" data-measurements="price">
    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{zh ? '价格为仓库参考信息，未接入实时成交价。网页报价快照与历史记录需要各自的来源和采集时间。' : 'Prices are catalog references, not a live transaction feed. Quote snapshots and historical records need their own sources and observation dates.'}</p>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className={panel}><dt className="text-xs text-zinc-500 dark:text-zinc-400">{zh ? '参考价格区间 / CNY' : 'Reference price range / CNY'}</dt><dd className="mt-2 font-mono text-xl">¥{price.referenceRange.min.toLocaleString()} – ¥{price.referenceRange.max.toLocaleString()}</dd></div><div className={panel}><dt className="text-xs text-zinc-500 dark:text-zinc-400">{zh ? '发布价格参考（未核验）' : 'Launch price reference (unverified)'}</dt><dd className="mt-2 font-mono text-xl">{price.launchReference ? `¥${price.launchReference.toLocaleString()}` : (zh ? '未记录' : 'Not recorded')}</dd></div></dl>
    {price.history.length ? <div className={panel}><h4 className="mb-3 text-sm font-semibold">{zh ? '已有价格记录（参考）' : 'Existing price records (reference)'}</h4><dl className="space-y-2">{price.history.map((entry, index) => <div key={`${entry.label}-${index}`} className="flex justify-between gap-3 text-xs"><dt>{entry.label}</dt><dd className="font-mono">¥{entry.amount.toLocaleString()}</dd></div>)}</dl></div> : <p className={`${panel} text-sm`} role="status">{zh ? '暂无历史价格记录。' : 'No historical price records.'}</p>}
  </section>;
}

export function HardwareEvidence({ record, lang }: { record: HardwareRecord; lang: 'zh' | 'en' }) {
  const checked = record.specifications.filter(field => field.evidence === 'manufacturer-checked');
  const zh = lang === 'zh';
  return <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3" data-hardware-evidence>
    <div className="flex flex-wrap justify-between items-center gap-2"><h4 className="text-sm font-semibold">{zh ? '数据来源与核验范围' : 'Sources & verification scope'}</h4><span className="text-xs text-zinc-500 dark:text-zinc-400">{checked.length ? (zh ? `${checked.length} 项官方参数已核验` : `${checked.length} manufacturer fields checked`) : (zh ? '仓库参考资料' : 'Catalog reference')}</span></div>
    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{checked.length ? (zh ? '仅列出的字段与官方规格逐项比对；价格、跑分、选购文案不包含在本次核验中。' : 'Only the listed fields were checked against manufacturer specifications. Prices, scores and editorial advice are outside that scope.') : (zh ? '此型号尚未完成字段级官方核验。外部目录与评测链接供进一步查阅。' : 'This model has not received a field-by-field manufacturer check. External catalogs and reviews are reading references.')}</p>
    {checked.length > 0 && <details className="text-xs"><summary className="cursor-pointer font-medium">{zh ? '查看已核验字段' : 'View checked fields'}</summary><ul className="mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-300">{checked.map(field => <li key={field.id}>{zh ? field.label : field.sourceField}</li>)}</ul></details>}
    {record.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="flex flex-wrap justify-between gap-2 text-xs text-zinc-700 dark:text-zinc-200 hover:underline"><span>{source.kind === 'manufacturer' ? (zh ? '制造商规格原页' : 'Manufacturer specification page') : (zh ? 'ZOL 对应产品参数页' : 'Matching ZOL parameter page')} ↗</span><time dateTime={source.checkedAt} className="font-mono text-zinc-500 dark:text-zinc-400">{source.checkedAt}</time></a>)}
  </section>;
}
