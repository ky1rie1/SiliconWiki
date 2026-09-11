"""Bounded public YouTube oEmbed title checks, separate from playback verification.

Run after audit_links.py. This uses the provider's ordinary embed metadata endpoint;
no account, private API, cookie, proxy or access-control bypass is used. An oEmbed
failure does NOT establish that the video itself has been deleted.
"""
import concurrent.futures
import datetime
import json
import threading
import time
import urllib.parse
import urllib.request

import audit_links

def main():
    payload = json.loads(audit_links.OUT.read_text(encoding='utf-8'))
    candidates = [r for r in payload['links'] if urllib.parse.urlsplit(r['url']).hostname == 'www.youtube.com' and urllib.parse.urlsplit(r['url']).path == '/watch' and not r.get('oembed')]
    state = {'consecutiveFailures': 0, 'completed': 0}
    lock = threading.Lock()
    def verify(record):
        with lock:
            if state['consecutiveFailures'] >= 3:
                record['oembed'] = {'result': 'accuracy_unverified', 'reason': 'Metadata endpoint stopped after three consecutive failures; no bypass.'}
                return
        url = 'https://www.youtube.com/oembed?' + urllib.parse.urlencode({'url': record['url'], 'format': 'json'})
        result = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url': url, 'maxBodyBytes': 8192}
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'SiliconWiki-LinkAudit/1.0'}), timeout=9) as response:
                data = json.loads(response.read(8192))
                result.update(status=response.status, result='title_metadata_available', title=data.get('title'), author=data.get('author_name'))
                if not result['title']:
                    raise ValueError('No title supplied by metadata endpoint')
            with lock:
                state['consecutiveFailures'] = 0
                record.setdefault('check', {})['title'] = result['title']
                record['check']['titleSource'] = 'public_youtube_oembed'
        except Exception as error:
            result.update(result='accuracy_unverified', error=f'{type(error).__name__}: {error}')
            with lock:
                state['consecutiveFailures'] += 1
        record['oembed'] = result
        with lock:
            state['completed'] += 1
            if state['completed'] % 25 == 0:
                print(f"{state['completed']} metadata responses checked", flush=True)
                audit_links.write(payload['links'], payload['summary']['hardwareItems'])
        time.sleep(0.25)
    print(f'{len(candidates)} public metadata checks queued; max 3 concurrent requests', flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        list(executor.map(verify, candidates))
    audit_links.write(payload['links'], payload['summary']['hardwareItems'])
    print(f"Finished: {state['completed']} metadata requests", flush=True)

if __name__ == '__main__':
    main()
