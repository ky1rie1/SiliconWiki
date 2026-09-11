import unittest

from import_zol import build_query, parse_response


HTML = '''<style>.pitem{color:red}</style><div class="plist">
<div class="pitem clearfix" reldate="2113342">
<div class="pic"><img src="https://2e.zol-img.com.cn/product/270_120x90/154/ceUXdJKblVKvc.jpg"></div>
<div class="price-box"><span class="price">￥3799</span></div>
<div class="pro-intro"><h3><a href="//detail.zol.com.cn/cpu/index2113342.shtml">AMD Ryzen 7 9800X3D</a><i>1641</i></h3>
<div class="paramet"><span title="Socket AM5">插槽类型：<em>Socket AM5</em></span>
<span title="4.7GHz">CPU主频：<em>4.7GHz</em></span>
<a class="morep" href="//detail.zol.com.cn/2114/2113342/param.shtml">详细参数</a></div>
<script>alert('ignored')</script></div></div></div>'''


def payload(html=HTML):
    return {'maxPage': '1', 'allNum': '1', 'page': '1', 'sta': '1', 'data': html}


class ZolImportTests(unittest.TestCase):
    def test_extracts_plain_facts_and_separates_observed_quote(self):
        result = parse_response(payload())
        item = result['products'][0]
        self.assertEqual(item['productId'], '2113342')
        self.assertEqual(item['name'], 'AMD Ryzen 7 9800X3D')
        self.assertEqual(item['parameters'], {'插槽类型': 'Socket AM5', 'CPU主频': '4.7GHz'})
        self.assertEqual(item['listedPriceRmb'], 3799)
        self.assertEqual(item['parameterUrl'], 'https://detail.zol.com.cn/2114/2113342/param.shtml')
        self.assertIn('zol-img.com.cn/product/', item['imageUrl'])
        self.assertNotIn('alert', str(result))
        self.assertNotIn('<', str(result))

    def test_rejects_changed_response_or_login_html(self):
        for value in ['<html>login</html>', {}, payload(HTML.replace('pitem clearfix', 'new-layout')), {**payload(), 'sta': '0'}]:
            with self.subTest(value=str(value)[:30]), self.assertRaises(ValueError):
                parse_response(value)

    def test_rejects_unsafe_or_mismatched_product_links(self):
        for url in ['javascript:alert(1)', 'https://detail.zol.com.cn.evil.test/cpu/index2113342.shtml', '//detail.zol.com.cn/cpu/index999.shtml']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                parse_response(payload(HTML.replace('//detail.zol.com.cn/cpu/index2113342.shtml', url)))

    def test_drops_untrusted_image_hosts(self):
        result = parse_response(payload(HTML.replace('2e.zol-img.com.cn', 'evil.test')))
        self.assertNotIn('imageUrl', result['products'][0])

    def test_keeps_zero_results_distinct_from_schema_failure(self):
        result = parse_response({'maxPage': '0', 'allNum': '0', 'page': '1', 'sta': '1', 'data': '<div class="plist"></div>'})
        self.assertEqual(result['products'], [])

    def test_encodes_query_as_one_page_and_blocks_empty_keyword(self):
        self.assertIn('keyword=Ryzen+7+9800X3D', build_query('Ryzen 7 9800X3D'))
        self.assertIn('page=1', build_query('9800X3D'))
        with self.assertRaises(ValueError):
            build_query(' ')


if __name__ == '__main__':
    unittest.main()
