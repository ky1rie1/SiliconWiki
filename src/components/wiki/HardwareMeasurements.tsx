import type { HardwareRecord } from '../../types/hardwareCatalog';

export function HardwareMeasurements({
  record,
  view,
  lang,
}: {
  record: HardwareRecord;
  view: 'price' | 'benchmarks';
  lang: 'zh' | 'en';
}) {
  const zh = lang === 'zh';
  const panel =
    'rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4';

  if (view === 'benchmarks') {
    const labels = {
      gamingScore: zh ? '游戏参考分' : 'Gaming reference score',
      productivityScore: zh ? '生产力参考分' : 'Productivity reference score',
      efficiencyScore: zh ? '能效参考分' : 'Efficiency reference score',
      timeSpyScore: '3DMark Time Spy Graphics',
      cinebenchMulti: 'Cinebench R23 Multi',
      cinebenchSingle: 'Cinebench R23 Single',
    };
    const scores = Object.entries(record.benchmarks.scores);
    return (
      <section className="space-y-4" data-measurements="benchmarks">
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {zh
            ? '以下为仓库维护的参考分数，尚未逐项附上测试环境与原始报告，不标记为已核验实测。'
            : 'These catalog reference scores do not yet include complete test conditions and original reports. They are not verified measurements.'}
        </p>
        {scores.length ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scores.map(([key, value]) => (
              <div key={key} className={panel}>
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                  {labels[key as keyof typeof labels]}
                </dt>
                <dd className="mt-2 font-mono text-2xl font-semibold">
                  {value?.toLocaleString(lang)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={`${panel} text-sm`} role="status">
            {zh
              ? '暂无跑分记录，不根据售价推算性能。'
              : 'No benchmark records. Performance is not inferred from price.'}
          </p>
        )}
      </section>
    );
  }

  const price = record.pricing;
  const isKnown =
    price.isKnownRange &&
    price.referenceRange.min !== null &&
    price.referenceRange.max !== null;

  return (
    <section className="space-y-4" data-measurements="price">
      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {zh
          ? '价格为仓库参考信息，未接入实时成交价。网页报价快照与历史记录需要各自的来源和采集时间。'
          : 'Prices are catalog references, not a live transaction feed. Quote snapshots and historical records need their own sources and observation dates.'}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={panel}>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">
            {zh ? '参考价格区间 / CNY' : 'Reference price range / CNY'}
          </dt>
          <dd className="mt-2 font-mono text-xl">
            {isKnown
              ? `¥${price.referenceRange.min!.toLocaleString()} – ¥${price.referenceRange.max!.toLocaleString()}`
              : zh
              ? '暂无价格参考（未记录）'
              : 'Price reference unavailable'}
          </dd>
        </div>
        <div className={panel}>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">
            {zh ? '发布价格参考（未核验）' : 'Launch price reference (unverified)'}
          </dt>
          <dd className="mt-2 font-mono text-xl">
            {price.launchReference
              ? `¥${price.launchReference.toLocaleString()}`
              : zh
              ? '未记录'
              : 'Not recorded'}
          </dd>
        </div>
      </dl>
      {price.history.length ? (
        <div className={panel}>
          <h4 className="mb-3 text-sm font-semibold">
            {zh ? '已有价格记录（参考）' : 'Existing price records (reference)'}
          </h4>
          <dl className="space-y-2">
            {price.history.map((entry, index) => (
              <div
                key={`${entry.label}-${index}`}
                className="flex justify-between gap-3 text-xs"
              >
                <dt>{entry.label}</dt>
                <dd className="font-mono">¥{entry.amount.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className={`${panel} text-sm`} role="status">
          {zh ? '暂无历史价格记录。' : 'No historical price records.'}
        </p>
      )}
    </section>
  );
}

export function HardwareEvidence({
  record,
  lang,
}: {
  record: HardwareRecord;
  lang: 'zh' | 'en';
}) {
  const zh = lang === 'zh';
  const checked = record.specifications.filter(
    (field) => field.verificationStatus === 'verified'
  );
  const audit = record.auditSummary;

  const entityLabel = {
    chip: zh ? '核心/架构基准' : 'Silicon Chip / Architecture Base',
    'reference-product': zh ? '公版/原厂标准品' : 'Official Reference / Boxed Retail',
    'partner-variant': zh ? '品牌非公版变体' : 'Partner Retail Variant',
  }[record.entityKind];

  const sourceKindLabel = (kind: string) => {
    switch (kind) {
      case 'manufacturer':
        return zh ? '官方规格原页' : 'Manufacturer spec page';
      case 'product-database':
        return zh ? '第三方数据库' : 'Third-party database';
      case 'editorial':
        return zh ? '编辑整理参考' : 'Editorial reference';
      default:
        return zh ? '参考资料' : 'Reference';
    }
  };

  return (
    <section
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30"
      data-hardware-evidence
    >
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-semibold">
            {zh ? '数据来源与核验范围' : 'Sources & verification scope'}
          </h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {entityLabel}
          </span>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            checked.length > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          {zh
            ? `已核验 ${audit.verifiedFieldCount}/${audit.coreFieldTotal} 项标准核心字段`
            : `${audit.verifiedFieldCount}/${audit.coreFieldTotal} benchmark fields checked`}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {checked.length
          ? zh
            ? `本条目共比对核验 ${checked.length} 项具体字段。分母基于该品类 ${audit.coreFieldTotal} 项核心基准参数计算。价格、跑分及选购文案未纳入官方核验范围。`
            : `Verified ${checked.length} specific fields against sources. Denominator is fixed at ${audit.coreFieldTotal} category benchmark fields. Prices and scores remain references.`
          : zh
          ? `此型号尚未完成字段级官方核验（0/${audit.coreFieldTotal}），目前规格来自编辑整理或通用公开资料。`
          : `This model has not received a field-by-field check (0/${audit.coreFieldTotal}). Specs are currently editorial references.`}
      </p>

      {record.variantDetails && (
        <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs space-y-1">
          <div className="font-semibold text-purple-900 dark:text-purple-300">
            {zh ? '非公卡专属物理参数提示：' : 'Partner variant physical specifications:'}
          </div>
          <p className="text-purple-700 dark:text-purple-400">
            {zh
              ? `本卡为 ${record.variantDetails.brandPartner || record.identity.brand} 品牌非公型号。其物理尺寸（${
                  record.variantDetails.lengthMm
                    ? `${record.variantDetails.lengthMm}mm`
                    : '长'
                }、${
                  record.variantDetails.slotThickness
                    ? `${record.variantDetails.slotThickness}槽`
                    : '厚度'
                }）与供电接口（${
                  record.variantDetails.powerConnectors || '特定接口'
                }）仅适用于该变体，不代表公版或其他非公卡。`
              : 'Physical dimensions, slot thickness, and power connectors belong strictly to this specific retail partner board.'}
          </p>
        </div>
      )}

      {checked.length > 0 && (
        <details className="text-xs" open>
          <summary className="cursor-pointer font-medium text-emerald-700 dark:text-emerald-400">
            {zh
              ? `查看已核验字段清单 (${checked.length} 项)`
              : `View verified fields (${checked.length})`}
          </summary>
          <ul className="mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-300 pl-2">
            {checked.map((field) => (
              <li key={field.id} className="flex items-center justify-between gap-2">
                <span>
                  <strong>{field.label}</strong>
                  {field.sourceField && (
                    <span className="text-zinc-400 ml-1.5 font-mono text-[11px]">
                      (源字段: {field.sourceField})
                    </span>
                  )}
                </span>
                {field.checkedAt && (
                  <time className="text-[11px] font-mono text-zinc-400 shrink-0">
                    {field.checkedAt}
                  </time>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {audit.missingCoreFields.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-amber-700 dark:text-amber-400">
            {zh
              ? `未核验的核心关键字段 (${audit.missingCoreFields.length} 项)`
              : `Unverified core benchmark fields (${audit.missingCoreFields.length})`}
          </summary>
          <ul className="mt-2 space-y-1 text-zinc-500 dark:text-zinc-400 pl-2">
            {audit.missingCoreFields.map((name) => (
              <li key={name}>• {name}（待权威源进一步核对）</li>
            ))}
          </ul>
        </details>
      )}

      {record.sources.length > 0 && (
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            {zh ? '核验对照源链接' : 'Verification Source Links'}
          </span>
          {record.sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap justify-between gap-2 text-xs text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
            >
              <span>
                [{sourceKindLabel(source.kind)}] {source.title} ↗
              </span>
              <time dateTime={source.checkedAt} className="font-mono text-zinc-400">
                {source.checkedAt}
              </time>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

