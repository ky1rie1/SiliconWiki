"""Inventory source and generated links; bounded public GET checks, no scraping/bypass.

python scripts/audit_links.py --inventory-only
python scripts/audit_links.py --check
python scripts/audit_links.py --check --resume
Search-result URLs are structurally checked individually and network checked once per
endpoint: a response cannot verify a merchant listing or a particular search result.
"""
import argparse
import concurrent.futures
import collections
import datetime
import html
import json
from pathlib import Path
import re
import subprocess
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'link-audit.json'
WRITE_LOCK = threading.Lock()
URL_RE = re.compile(r'https?://[^\s\x22\x27`<>\\]+')
SEARCH_HOSTS = {'search.jd.com', 's.taobao.com', 'mobile.yangkeduo.com',
                'search.bilibili.com'}

def classify(url):
    p = urllib.parse.urlsplit(url)
    if p.hostname in {'www.w3.org', 'silicon-wiki.local', 'yourdomain.com', 'localhost', '127.0.0.1'}:
        return 'namespace_or_example'
    if '${' in url:
        return 'template'
    if p.hostname == 'fonts.googleapis.com' and p.path.startswith('/css'):
        return 'stylesheet'
    if p.path.lower().endswith('.pdf'):
        return 'document'
    if p.path.lower().endswith('.js'):
        return 'script_asset'
    if p.hostname in SEARCH_HOSTS or (p.hostname == 'www.youtube.com' and p.path == '/results'):
        return 'search_endpoint'
    if p.hostname in {'images.unsplash.com', 'i.ytimg.com'} or re.search(r'\.(jpg|jpeg|png|gif|webp|svg)$', p.path, re.I):
        return 'image'
    if p.hostname in {'www.youtube.com', 'youtu.be', 'www.bilibili.com'}:
        return 'video'
    if p.hostname in {'registry.npmjs.org', 'opencollective.com', 'github.com', 'feross.org', 'www.patreon.com', 'tidelift.com'}:
        return 'development_or_repository'
    return 'page'

def inventory():
    records = {}
    def add(url, ref):
        if not isinstance(url, str) or not url.startswith(('https://', 'http://')):
            return
        url = html.unescape(url)
        rec = records.setdefault(url, {'url': url, 'kind': classify(url), 'references': []})
        if ref not in rec['references']:
            rec['references'].append(ref)
    files = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard'], cwd=ROOT).decode().splitlines()
    for filename in sorted(set(files)):
        path = ROOT / filename
        if filename.startswith(('scripts/', 'docs/link-')) or '__tests__' in filename or path.suffix not in {'.ts', '.tsx', '.md', '.html', '.css', '.svg', '.json', '.js'}:
            continue
        if filename == 'package-lock.json':
            continue  # dependency tarballs are package-manager infrastructure, not project links
        for lineno, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
            for match in URL_RE.finditer(line):
                raw = match.group()
                if path.suffix == '.md' and line[max(0, match.start() - 2):match.start()] == '](':
                    depth = 1
                    for offset, char in enumerate(raw):
                        depth += (char == '(') - (char == ')')
                        if depth == 0:
                            raw = raw[:offset]
                            break
                url = raw.rstrip('),.;}。；，') if '${' not in raw else raw
                add(url, {'file': filename, 'line': lineno, 'usage': 'literal'})
                if 'preconnect' in line or 'dns-prefetch' in line:
                    records[html.unescape(url)]['kind'] = 'connection_hint'
    data = json.loads(subprocess.check_output(['node', 'scripts/link_inventory.mjs'], cwd=ROOT).decode('utf-8'))
    for video in data['bilibiliVideos']:
        add(video['url'], {'itemId': video['id'], 'usage': 'assemblyGuide', 'title': video['title']})
    for guide in data.get('bilibiliSearchGuides', []):
        add('https://search.bilibili.com/all?keyword=' + urllib.parse.quote(guide['query'], safe="~()*!.'-"), {'itemId': guide['id'], 'usage': 'assemblyGuideSearch', 'title': guide['title'], 'query': guide['query']})
    for item in data['hardwareList']:
        base = {'itemId': item['id'], 'itemName': item['name']}
        for field in ['docsLinks', 'reviewLinks']:
            for link in item.get(field, []):
                add(link['url'], {**base, 'usage': field, 'title': link['title'], 'platform': link.get('platform'), 'author': link.get('author')})
        for field in ['imageUrl', 'sourceUrl', 'geekerwanUrl']:
            if item.get(field):
                add(item[field], {**base, 'usage': field})
        for field, endpoint in [('jdSearchQuery','https://search.jd.com/Search?keyword='), ('tbSearchQuery','https://s.taobao.com/search?q='), ('pddSearchQuery','https://mobile.yangkeduo.com/search_result.html?search_key=')]:
            if item.get(field):
                add(endpoint + urllib.parse.quote(item[field], safe="~()*!.'-"), {**base, 'usage': field, 'query': item[field]})
        if not item.get('reviewLinks'):
            for endpoint, suffix in [('https://www.youtube.com/results?search_query=', 'review benchmark'), ('https://search.bilibili.com/all?keyword=', '评测')]:
                query = f"{item['brand']} {item['name']} {suffix}"
                add(endpoint + urllib.parse.quote(query, safe="~()*!.'-"), {**base, 'usage': 'fallbackReviewSearch', 'query': query})
    for build in data['recommendedBuilds']:
        for part in build.get('parts', []) + build.get('upgradeOptions', []):
            if part.get('jdQuery'):
                add('https://search.jd.com/Search?keyword=' + urllib.parse.quote(part['jdQuery'], safe="~()*!.'-"), {'usage': 'buildShoppingSearch', 'buildId': build['id'], 'query': part['jdQuery']})
    return sorted(records.values(), key=lambda x: (x['kind'], x['url'])), len(data['hardwareList'])

def check(url):
    started = time.monotonic()
    result = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'method': 'GET', 'maxBodyBytes': 65536}
    request = urllib.request.Request(url, headers={'User-Agent': 'SiliconWiki-LinkAudit/1.0', 'Accept': 'text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5'})
    try:
        with urllib.request.urlopen(request, timeout=9) as response:
            result.update(status=response.status, finalUrl=response.url, contentType=response.headers.get('Content-Type', ''))
            body = response.read(65536)
            result['contentEncoding'] = response.headers.get('Content-Encoding', '')
            if result['contentEncoding'] == 'gzip':
                body = zlib.decompressobj(16 + zlib.MAX_WBITS).decompress(body, 262144)
            elif result['contentEncoding'] == 'deflate':
                body = zlib.decompressobj().decompress(body, 262144)
            encoding = response.headers.get_content_charset() or 'utf-8'
            page = body.decode(encoding, errors='replace')
            match = re.search(r'<title[^>]*>(.*?)</title>', page, re.I | re.S)
            result['title'] = html.unescape(re.sub(r'\s+', ' ', match.group(1)).strip()) if match else None
            result['availability'] = 'reachable'
            if re.search(r'access denied|just a moment|security verification|automated bot check|验证中心|安全验证|人机验证', (result['title'] or ''), re.I):
                result['availability'] = 'access_restricted'
            elif re.search(r'404|page not found|页面不存在|页面未找到|视频去哪了|视频不见了|视频已删除|视频不存在', result['title'] or '', re.I):
                result['availability'] = 'soft_not_found'
            original, final = urllib.parse.urlsplit(url), urllib.parse.urlsplit(response.url)
            result['redirected'] = response.url != url
            result['accuracy'] = 'accuracy_unverified'
            if original.hostname != final.hostname:
                result['accuracy'] = 'redirect_host_review'
            if original.path not in ('', '/') and final.path in ('', '/'):
                result['accuracy'] = 'redirect_to_home'
    except urllib.error.HTTPError as error:
        result.update(status=error.code, finalUrl=error.url, availability='confirmed_not_found' if error.code in (404,410) else 'access_restricted' if error.code in (401,403,412,418,429,451,472) else 'http_error', error=str(error))
    except Exception as error:
        result.update(availability='network_unverified', error=f'{type(error).__name__}: {error}')
    result['elapsedSeconds'] = round(time.monotonic() - started, 2)
    return result

def write(records, hardware_count):
    findings_file = ROOT / 'docs' / 'link-semantic-findings.json'
    manual_findings = {r['url']: r for r in json.loads(findings_file.read_text(encoding='utf-8')).get('findings', [])} if findings_file.exists() else {}
    for rec in records:
        parsed = urllib.parse.urlsplit(rec['url'])
        if rec.get('check'):
            rec['check'].setdefault('accuracy', 'accuracy_unverified')
            if rec['check']['accuracy'] == 'requires_content_review':
                rec['check']['accuracy'] = 'accuracy_unverified'
        observed_title = rec.get('check', {}).get('title') or ''
        if rec.get('check') and re.search(r'视频去哪了|视频不见了|视频已删除|视频不存在', observed_title):
            rec['check']['availability'] = 'soft_not_found'
        if rec['url'] in manual_findings and rec.get('check'):
            rec['check']['accuracy'] = 'confirmed_content_mismatch'
            rec['check']['accuracyEvidence'] = manual_findings[rec['url']]['reason']
        if re.search(r'automated bot check', observed_title, re.I):
            rec['check']['availability'] = 'access_restricted'
        if parsed.hostname == 'www.techpowerup.com' and re.search(r'/(cpu|gpu)-specs/.+\.c\d+$', parsed.path) and ' Specs | TechPowerUp' in observed_title:
            expected_model = parsed.path.rsplit('/', 1)[-1].rsplit('.c', 1)[0]
            actual_model = observed_title.split(' Specs |')[0]
            normalize_model = lambda value: re.sub(r'[^a-z0-9]', '', re.sub(r'^(AMD|NVIDIA|Intel)\s+', '', value, flags=re.I).casefold())
            rec['check']['accuracy'] = 'model_title_matches_url' if normalize_model(expected_model) == normalize_model(actual_model) else 'confirmed_product_mismatch'
        rec['semantic'] = []
        for ref in rec['references']:
            if ref.get('usage') in {'docsLinks', 'reviewLinks', 'assemblyGuide'}:
                finding = {'itemId': ref['itemId'], 'declaredTitle': ref['title'], 'result': 'unverified_content'}
                observed = rec.get('check', {}).get('title') or ''
                normalize = lambda value: re.sub(r'\W+', '', value).casefold()
                if observed and normalize(ref['title']) in normalize(observed):
                    finding['result'] = 'declared_title_matches_page_title'
                if parsed.path in ('', '/') and ref['usage'] == 'docsLinks':
                    finding['result'] = 'homepage_not_model_specification'
                if rec['kind'] == 'search_endpoint':
                    finding['result'] = 'search_not_direct_product_or_review'
                rec['semantic'].append(finding)
    summary = {'uniqueUrls': len(records), 'hardwareItems': hardware_count,
               'kinds': dict(collections.Counter(r['kind'] for r in records)),
               'availability': dict(collections.Counter(r.get('check', {}).get('availability', 'not_checked') for r in records))}
    payload = {'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'scope': 'Tracked and unignored source/docs plus runtime hardware/build URLs. Excludes tests, audit tools/results, and package-lock dependency tarballs.', 'policy': 'At most 3 workers, one sequential queue per host, 9s socket timeout, 64KiB maximum response body, no anti-bot bypass; search URL checks grouped by endpoint.', 'summary': summary, 'links': records}
    OUT.parent.mkdir(exist_ok=True)
    with WRITE_LOCK:
        OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        render_report(payload)
    return summary

def render_report(payload):
    records = payload['links']
    summary = payload['summary']
    lines = ['# External link audit', '', f"Generated: {payload['generatedAt']}", '',
             f"The inventory contains **{summary['uniqueUrls']} unique URLs** and actual links generated for **{summary['hardwareItems']} hardware records**.", '',
             'HTTP 200 proves that an endpoint responds. It does not prove that a page covers the named product, that a video can be played, or that its claims are correct. Unresolved content checks explicitly retain `accuracy_unverified`.', '',
             '## Coverage and method', '', payload['scope'], '',
             'Normal public GET requests use at most 3 workers, one sequential queue per host, a 9-second socket timeout, and a 64 KiB response limit (256 KiB maximum decompressed metadata). Only titles and response metadata are retained, not page copies. After three consecutive access restrictions/network failures on a host, remaining URLs are marked `host_access_unverified`. No login, CAPTCHA bypass, alternate identities or proxy rotation is used.', '',
             'Shopping and review search queries are inventoried individually; requests are grouped by endpoint. A query can be structurally correct without establishing the existence or accuracy of any merchant listing or review. Templates, example domains, SVG namespaces and preconnect origins are not navigation defects.', '',
             '| Result | URLs |', '| --- | ---: |']
    lines.extend(f'| `{key}` | {value} |' for key, value in sorted(summary['availability'].items()))
    lines += ['', '## Corrections in this change', '',
              '50 exact URL mappings correct manufacturer paths and confirmed product database IDs. The implementation removed 109 invalid or unrelated hardware/ranking references and replaced all five fabricated assembly-video cards with explicitly labeled topic searches. Two video creator labels and one title/description were also corrected from public metadata. Removed citations were not replaced with invented product pages.', '',
              'The initial network snapshot observed 82 actual HTTP 404 destinations (excluding two preconnect origins) and one soft 404. Title review also identified 57 wrong TechPowerUp numeric product IDs, five invalid/unrelated assembly videos and eleven wrong-model hardware videos. These categories describe original findings and may overlap; they are not totals to add together.', '',
              'All 281 original YouTube watch URLs supplied title/author metadata through the ordinary public oEmbed endpoint. These results establish metadata identity only, not playback availability or benchmark validity. Bilibili page titles were decoded normally from gzip. The snapshot retains the source of each title.', '',
              '## Interpretation and evidence', '',
              '- `confirmed_not_found`: the destination returned HTTP 404/410.',
              '- `soft_not_found`: the title indicates a missing page/video even when HTTP is 200.',
              '- `confirmed_product_mismatch`: the numeric TechPowerUp ID resolves to a different exact model than the URL slug.',
              '- `model_title_matches_url` and `declared_title_matches_page_title`: title-level checks only; specifications and playback are not certified.',
              '- `access_restricted`, `host_access_unverified`, `network_unverified` and 5xx `http_error`: unavailable evidence, not confirmed broken links.',
              '- A brand homepage is not a model specification sheet; the inventory flags that distinction.', '',
              '[Current machine-readable inventory](link-audit.json) records each URL, its source/runtime references, status, final URL, title and semantic checks. [Repair mappings](link-repairs.json) record exact old/new URLs and evidence. [Semantic findings](link-semantic-findings.json) retain confirmed wrong destinations. [Initial HTTP evidence](link-audit-before-repairs.json) retains removed/replaced URL observations.', '',
              '## Current confirmed defects', '', '| URL | Evidence |', '| --- | --- |']
    failures = [r for r in records if r.get('check', {}).get('availability') in {'confirmed_not_found', 'soft_not_found'} or r.get('check', {}).get('accuracy') in {'confirmed_product_mismatch', 'confirmed_content_mismatch'}]
    if failures:
        for rec in failures:
            check_result = rec['check']
            evidence = str(check_result.get('title') or check_result.get('status') or check_result['availability']).replace('|', '\\|')
            lines.append(f"| {rec['url']} | {evidence} |")
    else:
        lines.append('| None in the current inventory | This does not certify the unresolved content checks. |')
    lines += ['', '## Repeat', '', 'Run from the project root after `npm install` (the exporter uses Vite’s existing esbuild dependency):', '', '```powershell', 'python scripts/audit_links.py --inventory-only', 'python scripts/audit_links.py --check', 'python scripts/audit_links.py --check --resume', 'python scripts/audit_youtube_metadata.py', '```', '', '`--resume` keeps observed statuses for unchanged URLs and checks only new URLs. An inventory-only refresh does not make network requests. The optional oEmbed check uses up to three concurrent requests, 8 KiB responses and a circuit breaker; metadata errors are not classified as deleted videos. Results are a dated snapshot; errors may be transient. The audit intentionally excludes tests, audit artifacts, audit tools and dependency tarball URLs in package-lock.json. Runtime export uses the same `hardwareDocumentLinks` function as the UI, including its catalog fallback and actual five assembly-guide searches. Local share URLs are covered by the project share-query unit tests; they are not external network destinations.', '']
    (ROOT / 'docs' / 'link-audit.md').write_text('\n'.join(lines), encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory-only', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--resume', action='store_true')
    parser.add_argument('--refresh-metadata', action='store_true', help='With --resume, recheck reachable HTML whose compressed or truncated metadata was unreadable.')
    args = parser.parse_args()
    previous = json.loads(OUT.read_text(encoding='utf-8')) if args.resume and OUT.exists() else {}
    records, count = inventory()
    old = {r['url']: r.get('check') for r in previous.get('links', [])}
    old_metadata = {r['url']: r['oembed'] for r in previous.get('links', []) if r.get('oembed')}
    endpoints = {}
    queues = collections.defaultdict(list)
    for rec in records:
        if rec['url'] in old_metadata:
            rec['oembed'] = old_metadata[rec['url']]
        if old.get(rec['url']):
            rec['check'] = old[rec['url']]
            if args.refresh_metadata and rec['check'].get('availability') == 'reachable' and not rec['check'].get('title') and 'text/html' in rec['check'].get('contentType', ''):
                del rec['check']
        if rec['kind'] in {'template', 'namespace_or_example', 'connection_hint'}:
            rec['check'] = {'availability': 'not_applicable', 'accuracy': 'template_or_non_navigation_identifier'}
        elif rec['kind'] == 'search_endpoint':
            parsed = urllib.parse.urlsplit(rec['url'])
            key = (parsed.hostname, parsed.path, tuple(sorted(urllib.parse.parse_qs(parsed.query))))
            if key in endpoints:
                rec['check'] = {'availability': 'grouped_search_endpoint', 'representativeUrl': endpoints[key], 'accuracy': 'search_query_only_not_a_verified_product_or_review'}
            else:
                endpoints[key] = rec['url']
        if 'check' not in rec:
            queues[urllib.parse.urlsplit(rec['url']).hostname].append(rec)
    print(json.dumps(write(records, count), ensure_ascii=True), flush=True)
    if not args.check:
        return
    def host_queue(items):
        restricted = 0
        for index, rec in enumerate(items):
            if restricted >= 3:
                rec['check'] = {'availability': 'host_access_unverified', 'reason': 'Stopped after three consecutive access restrictions or network failures on this host; no bypass or further requests.', 'representativeUrl': last_url}
                continue
            rec['check'] = check(rec['url'])
            last_url = rec['url']
            restricted = restricted + 1 if rec['check']['availability'] in {'access_restricted', 'network_unverified'} else 0
            if index % 10 == 9:
                write(records, count)
            time.sleep(0.25)
        return len(items)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(host_queue, items): host for host, items in sorted(queues.items(), key=lambda x: -len(x[1]))}
        for future in concurrent.futures.as_completed(futures):
            print(f'{futures[future]}: {future.result()} checked', flush=True)
            write(records, count)
    print(json.dumps(write(records, count), ensure_ascii=True), flush=True)

if __name__ == '__main__':
    main()
