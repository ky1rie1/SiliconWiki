# Hardware data sources

Last investigated: **2026-09-11**. The app uses committed data and makes no ZOL requests from the browser.

## Reviewed manufacturer specifications

`src/data/sources/verifiedHardware.ts` is the reviewed source manifest and specification snapshot. `src/types/hardwareSources.ts` defines stable field IDs independently of the Chinese display labels. Each fact retains its original source-table field, readable value, source URL, model identity, and check date.

| Exact catalog model | Primary source | Reviewed fields |
| --- | --- | --- |
| AMD Ryzen 7 9800X3D | [AMD specifications](https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html) | Cores/threads, clocks, L3, default TDP, socket, standard memory speeds, CPU/I/O manufacturing process |
| AMD Ryzen 7 7800X3D | [AMD specifications](https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html) | Same fields |
| AMD Ryzen 9 9950X | [AMD specifications](https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-9-9950x.html) | Same fields |
| NVIDIA GeForce RTX 5090 | [NVIDIA specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/) | Memory configuration, CUDA cores, boost clock, TGP, Tensor generation, manufacturer AI TOPS |
| NVIDIA GeForce RTX 5080 | [NVIDIA specifications](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/) | Memory configuration, CUDA cores, boost clock, TGP, Tensor generation |

The overlay requires both an exact internal ID and an exact model name. It updates only listed specifications and the power summary. Examples: RTX 5090 reference TGP **575 W**, RTX 5080 **360 W**; 9800X3D standard memory **DDR5-5600 for two DIMMs**, not a guaranteed EXPO overclock. GPU data refers to the reference/Founders Edition design; AMD TDP is not measured game consumption. Maximum boost is not a sustained all-core clock.

The catalog's combined **RTX 4090 / 4090D** record was deliberately excluded because these are different models. A manufacturer source link does not validate an entire record. Prices, price histories, benchmark scores, recommendations, other specifications and remaining products have **not** been verified by this snapshot. Source pages can also contain inconsistent marketing/compatibility text; the audited NVIDIA values come specifically from the full specification table.

## ZOL interface discovery

This is a **publicly referenced but undocumented website endpoint**, not a documented open API. No authentication, captcha solving, private endpoints, publishing or bulk scraping was used. Its continued availability, reuse terms, CORS behavior and stability are not guaranteed.

Observed requests:

| Resource | Result | Meaning |
| --- | --- | --- |
| [DIY homepage](https://diy.zol.com.cn/) | HTTP 200; `text/html; charset=gbk`; 674,472 bytes | Editorial homepage, links to the PC builder |
| [PC builder](https://zj.zol.com.cn/) | HTTP 200; `text/html; charset=GBK`; 43,620 bytes | Public product selection UI |
| [Public builder script](https://s.zol-img.com.cn/d/Diy/Diy_DiyZj.js?v=52498) | HTTP 200; JavaScript; 152,642 bytes | `diyZj.getParam` builds the GET query; `diyZj.clGood` consumes the result |
| Product query below | HTTP 200; `text/html`; 3,668 bytes | Actual body is JSON with Unicode escapes and an HTML fragment; one matching CPU |

Verified request shape, reproduced from that script:

```text
GET https://zj.zol.com.cn/index.php
  ?c=Ajax_ParamResponse
  &a=GetGoods
  &subcateId=28
  &type=0
  &priceId=noPrice
  &page=1
  &paramStr=
  &keyword=9800X3D
  &locationId=1
  &queryType=
  &time=1111
```

`subcateId=28` is the observed CPU category. `locationId=1`, empty `queryType`, `type=0` and `time=1111` reproduce the observed site defaults; their broader semantics are not inferred. Other category codes are not implemented without verification. The server returned keys `maxPage`, `allNum`, `page`, `data`, and `sta`, with numeric metadata encoded as strings. `data` contains HTML, **not** a clean hardware schema.

The one-result response, recorded at `2026-09-11T12:40:59Z` (download timestamp and response Date), identifies **AMD Ryzen 7 9800X3D**, product ID **2113342**, with [product page](https://detail.zol.com.cn/cpu/index2113342.shtml), [parameter-page link](https://detail.zol.com.cn/2114/2113342/param.shtml), AM5, 4.7 GHz base clock, 5.2 GHz boost, 96 MB L3 and 8 cores / 16 threads. These core fields agree with AMD's reviewed specification. The ZOL links were extracted from the actual response; the adapter does not infer product IDs or fabricate detail paths.

The candidate records the response's main listed quote, **¥3,799**, independently from embedded merchant prices. This is a dated website quote, not a transaction price, current market range, launch MSRP or price-history observation. It is not applied to the application's price fields. The included image URL is a small product thumbnail candidate; it is not automatically downloaded, hotlinked in the UI, or claimed as a licensed image asset.

The DIY homepage also references `https://dynamic.zol.com.cn/channel/index.php` with `c=Ajax_Price&a=PriceList&cid=182&size=12&callback=citylist`, using JSONP. The callback consumes `flag` and `dataArr` entries with `title`/`url` for city links. This was observed in page source, **not requested or validated as a hardware database API**, and is not used by the adapter.

## Single-page candidate import

Requires Python 3.10+; uses only its standard library. From the repository root:

```powershell
python scripts/import_zol.py --keyword 9800X3D --output data/sources/zol-9800x3d-new-check.json
python -m unittest discover -s scripts -p test_import_zol.py
```

Offline reproduction from an independently saved endpoint response:

```powershell
python scripts/import_zol.py --keyword 9800X3D --input saved-response.json --observed-at 2026-09-11T12:40:59Z --output data/sources/zol-offline-review.json
```

The output must be a new filename. The script performs one request, with a timeout and response-size limit, no automatic pagination/retries and no redirected requests. Offline import requires the original observation timestamp; import time is not substituted for it. Schema/layout failures stop the import rather than producing a misleading empty catalog.

The HTML is parsed into an inert standard-library tree. Only bounded plain-text fields and allowlisted HTTPS product/image links are emitted; scripts/styles and merchant affiliate links are discarded. Product URLs must match the response's product ID. The raw HTML is never rendered or executed. `data/sources/zol-9800x3d-2026-09-11.json` is the committed one-product candidate snapshot.

To promote a candidate, compare the complete model name and variant against the catalog, check each proposed field against the manufacturer's specification, then add only reviewed facts to the manifest with stable field IDs and source labels. Keep quote provenance separate. Do not automatically merge fuzzy name matches, retail bundles, regional variants or board-partner overclocked models. Update the date only after a fresh successful source check.
