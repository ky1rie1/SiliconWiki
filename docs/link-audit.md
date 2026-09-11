# External link audit

Generated: 2026-09-11T13:35:36.510975+00:00

The inventory contains **1428 unique URLs** and actual links generated for **152 hardware records**.

HTTP 200 proves that an endpoint responds. It does not prove that a page covers the named product, that a video can be played, or that its claims are correct. Unresolved content checks explicitly retain `accuracy_unverified`.

## Coverage and method

Tracked and unignored source/docs plus runtime hardware/build URLs. Excludes tests, audit tools/results, and package-lock dependency tarballs.

Normal public GET requests use at most 3 workers, one sequential queue per host, a 9-second socket timeout, and a 64 KiB response limit (256 KiB maximum decompressed metadata). Only titles and response metadata are retained, not page copies. After three consecutive access restrictions/network failures on a host, remaining URLs are marked `host_access_unverified`. No login, CAPTCHA bypass, alternate identities or proxy rotation is used.

Shopping and review search queries are inventoried individually; requests are grouped by endpoint. A query can be structurally correct without establishing the existence or accuracy of any merchant listing or review. Templates, example domains, SVG namespaces and preconnect origins are not navigation defects.

| Result | URLs |
| --- | ---: |
| `access_restricted` | 17 |
| `grouped_search_endpoint` | 507 |
| `host_access_unverified` | 26 |
| `http_error` | 39 |
| `network_unverified` | 8 |
| `not_applicable` | 23 |
| `reachable` | 808 |

## Corrections in this change

50 exact URL mappings correct manufacturer paths and confirmed product database IDs. The implementation removed 109 invalid or unrelated hardware/ranking references and replaced all five fabricated assembly-video cards with explicitly labeled topic searches. Two video creator labels and one title/description were also corrected from public metadata. Removed citations were not replaced with invented product pages.

The initial network snapshot observed 82 actual HTTP 404 destinations (excluding two preconnect origins) and one soft 404. Title review also identified 57 wrong TechPowerUp numeric product IDs, five invalid/unrelated assembly videos and eleven wrong-model hardware videos. These categories describe original findings and may overlap; they are not totals to add together.

All 281 original YouTube watch URLs supplied title/author metadata through the ordinary public oEmbed endpoint. These results establish metadata identity only, not playback availability or benchmark validity. Bilibili page titles were decoded normally from gzip. The snapshot retains the source of each title.

## Interpretation and evidence

- `confirmed_not_found`: the destination returned HTTP 404/410.
- `soft_not_found`: the title indicates a missing page/video even when HTTP is 200.
- `confirmed_product_mismatch`: the numeric TechPowerUp ID resolves to a different exact model than the URL slug.
- `model_title_matches_url` and `declared_title_matches_page_title`: title-level checks only; specifications and playback are not certified.
- `access_restricted`, `host_access_unverified`, `network_unverified` and 5xx `http_error`: unavailable evidence, not confirmed broken links.
- A brand homepage is not a model specification sheet; the inventory flags that distinction.

[Current machine-readable inventory](link-audit.json) records each URL, its source/runtime references, status, final URL, title and semantic checks. [Repair mappings](link-repairs.json) record exact old/new URLs and evidence. [Semantic findings](link-semantic-findings.json) retain confirmed wrong destinations. [Initial HTTP evidence](link-audit-before-repairs.json) retains removed/replaced URL observations.

## Current confirmed defects

| URL | Evidence |
| --- | --- |
| None in the current inventory | This does not certify the unresolved content checks. |

## Repeat

Run from the project root after `npm install` (the exporter uses Vite’s existing esbuild dependency):

```powershell
python scripts/audit_links.py --inventory-only
python scripts/audit_links.py --check
python scripts/audit_links.py --check --resume
python scripts/audit_youtube_metadata.py
```

`--resume` keeps observed statuses for unchanged URLs and checks only new URLs. An inventory-only refresh does not make network requests. The optional oEmbed check uses up to three concurrent requests, 8 KiB responses and a circuit breaker; metadata errors are not classified as deleted videos. Results are a dated snapshot; errors may be transient. The audit intentionally excludes tests, audit artifacts, audit tools and dependency tarball URLs in package-lock.json. Runtime export uses the same `hardwareDocumentLinks` function as the UI, including its catalog fallback and actual five assembly-guide searches. Local share URLs are covered by the project share-query unit tests; they are not external network destinations.
