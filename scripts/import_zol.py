"""Read one public ZOL CPU search page into a review-only snapshot (stdlib only)."""
import argparse
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler

ENDPOINT = 'https://zj.zol.com.cn/index.php'
MAX_BYTES = 1_000_000


def build_query(keyword):
    keyword = keyword.strip()
    if not 1 <= len(keyword) <= 80 or any(ord(c) < 32 for c in keyword):
        raise ValueError('Provide a model keyword of 1–80 printable characters.')
    return ENDPOINT + '?' + urlencode({
        'c': 'Ajax_ParamResponse', 'a': 'GetGoods', 'subcateId': '28',
        'type': '0', 'priceId': 'noPrice', 'page': '1', 'paramStr': '',
        'keyword': keyword, 'locationId': '1', 'queryType': '', 'time': '1111',
    })


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def text(self):
        if self.tag in ('script', 'style'):
            return ''
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)

    def find(self, tag=None, cls=None):
        for child in self.children:
            if isinstance(child, Node):
                if (tag is None or child.tag == tag) and (cls is None or cls in child.attrs.get('class', '').split()):
                    yield child
                yield from child.find(tag, cls)


class FragmentParser(HTMLParser):
    """Inert tree: no browser, scripts, styles, networking or HTML rendering."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in ('img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'embed', 'col', 'param', 'track'):
            self.stack.append(node)
            if len(self.stack) > 64:
                raise ValueError('HTML nesting exceeds the supported limit.')

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def clean(value):
    result = ' '.join(value.split())
    if not result or len(result) > 240 or any(c in result for c in '<>\x00'):
        raise ValueError('Invalid plain text field.')
    return result


def product_link(value, product_id, parameter=False):
    url = urlsplit(urljoin('https://detail.zol.com.cn/', value))
    pattern = rf'/\d+/{product_id}/param\.shtml' if parameter else rf'/cpu/index{product_id}\.shtml'
    if url.scheme != 'https' or url.netloc != 'detail.zol.com.cn' or url.query or url.fragment or not re.fullmatch(pattern, url.path):
        raise ValueError('Unexpected product URL or model identity.')
    return url.geturl()


def parse_response(payload):
    if not isinstance(payload, dict) or str(payload.get('sta')) != '1' or not isinstance(payload.get('data'), str):
        raise ValueError('ZOL response is not a successful product response.')
    counts = {}
    for key in ('page', 'maxPage', 'allNum'):
        value = str(payload.get(key, ''))
        if not re.fullmatch(r'\d{1,7}', value):
            raise ValueError('Invalid pagination metadata.')
        counts[key] = int(value)
    if counts['page'] != 1 or len(payload['data']) > MAX_BYTES:
        raise ValueError('Only one bounded first-page response is supported.')
    parser = FragmentParser()
    parser.feed(payload['data'])
    cards = list(parser.root.find('div', 'pitem'))
    if len(cards) > 30 or (counts['allNum'] > 0 and not cards) or len(cards) > counts['allNum']:
        raise ValueError('Product layout changed; review source HTML before adapting the parser.')
    products, seen = [], set()
    for card in cards:
        product_id = card.attrs.get('reldate', '')
        if not re.fullmatch(r'\d{1,10}', product_id) or product_id in seen:
            raise ValueError('Invalid or duplicate product ID.')
        seen.add(product_id)
        heading = next(card.find('h3'), None)
        anchor = next(heading.find('a'), None) if heading else None
        parameters = next(card.find('div', 'paramet'), None)
        more = next(parameters.find('a', 'morep'), None) if parameters else None
        if anchor is None or more is None:
            raise ValueError('Required product name or parameter link missing.')
        product = {
            'productId': product_id, 'name': clean(anchor.text()),
            'productUrl': product_link(anchor.attrs.get('href', ''), product_id),
            'parameterUrl': product_link(more.attrs.get('href', ''), product_id, True),
            'parameters': {},
        }
        for span in parameters.find('span'):
            value = next(span.find('em'), None)
            if value is not None:
                label = clean(span.text().split('：', 1)[0].split(':', 1)[0])
                product['parameters'][label] = clean(value.text())
        for img in card.find('img'):
            candidate = urlsplit(urljoin('https://zj.zol.com.cn/', img.attrs.get('src', '')))
            if candidate.scheme == 'https' and not candidate.username and not candidate.password and candidate.hostname and candidate.hostname.endswith('.zol-img.com.cn') and candidate.port in (None, 443) and candidate.path.startswith('/product/'):
                product['imageUrl'] = candidate.geturl()
                break
        price = next(card.find('span', 'price'), None)
        if price is not None:
            match = re.fullmatch(r'[￥¥]\s*(\d{1,7}(?:\.\d{1,2})?)', price.text().strip())
            if match:
                product['listedPriceRmb'] = float(match[1])
        products.append(product)
    return {**counts, 'products': products}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Redirect received; review the public endpoint before continuing.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--keyword', required=True, help='CPU model keyword; one page only')
    parser.add_argument('--input', type=Path, help='Parse a previously saved response instead of requesting it')
    parser.add_argument('--output', type=Path, required=True, help='New candidate JSON file; existing files are never overwritten')
    parser.add_argument('--observed-at', help='ISO timestamp for a saved response (required with --input)')
    args = parser.parse_args()
    url = build_query(args.keyword)
    if args.output.exists():
        parser.error('Output exists. Use a new dated candidate filename.')
    if args.input:
        if not args.observed_at:
            parser.error('--input requires --observed-at; import time is not observation time.')
        observed = datetime.fromisoformat(args.observed_at.replace('Z', '+00:00'))
        if observed.tzinfo is None:
            parser.error('--observed-at must include a timezone.')
        with args.input.open('rb') as handle:
            raw = handle.read(MAX_BYTES + 1)
    else:
        with build_opener(NoRedirect).open(Request(url, headers={'User-Agent': 'SiliconWiki-SourceCheck/1.0'}), timeout=20) as response:
            raw = response.read(MAX_BYTES + 1)
        observed = datetime.now(timezone.utc)
    if len(raw) > MAX_BYTES:
        raise ValueError('Response too large.')
    # Observed endpoint returns ASCII/UTF-8 JSON with Unicode escapes, despite text/html headers.
    parsed = parse_response(json.loads(raw.decode('utf-8')))
    snapshot = {
        'schemaVersion': 1, 'source': 'zol-internal-page-endpoint', 'status': 'candidate',
        'sourceUrl': url, 'observedAt': observed.isoformat(),
        'query': {'category': 'cpu', 'subcateId': 28, 'keyword': args.keyword, 'page': 1},
        'notice': '未文档化网页接口的单页候选快照；报价不是成交价。未自动导入规格、价格或图片。',
        **parsed,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open('x', encoding='utf-8') as handle:
        json.dump(snapshot, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    print(f'Saved {len(parsed["products"])} candidate product(s) to {args.output}')


if __name__ == '__main__':
    main()
