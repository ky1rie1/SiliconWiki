# Hardware data model / 硬件数据模型

`hardwareCatalog` is the canonical read model exported by `src/data/hardware.ts`. It indexes 152 exact model IDs using `byId` and `byCategory`; array order remains available through `ids`. The existing `hardwareList` stays as a compatibility view for search, rankings and build selection.

## Record boundaries

| Field | Responsibility |
| --- | --- |
| `identity` | Stable ID, exact name, brand, category, series, release year and platform |
| `specifications` | Stable field ID, display label/value and field-level evidence |
| `sources` | Source identity, URL, type and observation date |
| `power` | Watts or `null`, evidence and the original meaning of the power field |
| `pricing` | CNY reference range, optional launch reference and recorded history |
| `benchmarks` | Existing editorial reference scores; no price-derived scores |
| `links` | Separate document and review references with valid HTTP(S) URLs |

The schema is versioned with `schemaVersion: 1`. [Types](../src/types/hardwareCatalog.ts) and the [ingestion boundary](../src/utils/hardwareCatalog.ts) are independent of UI components.

## Evidence is attached to fields

Only an exact model identity **and matching field value** may receive `manufacturer-checked`. A source linked to one model does not verify its other fields, prices, history, benchmark scores or related models. Source facts have stable English IDs and preserve original manufacturer field names. Existing unreviewed fields receive category-qualified IDs derived from their labels; these should be migrated deliberately if labels change.

Missing power, launch prices, measurements and history remain `null` or empty. Duplicate model IDs, non-finite prices and inverted ranges fail at ingestion. Unsafe document/review URL schemes are filtered. The public TypeScript maps are read-only views; source arrays are never mutated by ingestion.

## Maintaining data

1. Edit the exact model in `src/data/hardware/` and keep units explicit.
2. Review a manufacturer source and record the model, fields, values, URL and date in `src/data/sources/verifiedHardware.ts`.
3. Keep third-party imports in `data/sources/` until manually reviewed. The ZOL importer never promotes candidate prices or images automatically.
4. Run `npm test`, `npm run build` and the Python importer tests when applicable.
5. Use the [link audit](link-audit.md) to distinguish reachability, product accuracy, search entries and inaccessible sources.

详情页消费此结构，分别展示规格核验范围、参考价格和已有跑分。价格历史为空时不会生成示意曲线，跑分为空时不会根据售价推算。第三方候选、官方核验字段与编辑参考数据分开维护，迁移期间现有搜索及配置功能继续使用兼容数组。

See [data sources](data-sources.md) for the reviewed snapshot and the limited ZOL endpoint integration.
