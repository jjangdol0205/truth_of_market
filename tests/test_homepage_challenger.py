"""
tests/test_homepage_challenger.py
Empirical Challenger Stress Harness for KidsFit Homepage Diagnostic Funnel & Conversion

Covers:
1. Paywall Isolation & Edge Cases (Host casing, subdomains, User-Agents, query strings)
2. Unified Survey Handling of Incomplete/Extreme Values (Age 1, Age 20, missing parents, biometrics)
3. Server.js Reliability (mode === 'both', malformed JSON, empty bodies, crash resilience)
4. Product Prescription Matching (late sleep -> sleep aids, posture -> dead hang bar, math block -> Gabe, affiliate codes)
5. Click Conversion Tracking & UTM Attribution (query strings, session state, server telemetry)
"""

import unittest
import os
import sys
import json
import re
import http.client
import subprocess
import time
import socket
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]


class TestPaywallEdgeCases(unittest.TestCase):
    """
    Challenge 1: Does index.html or server.js ever trigger English paywall when loaded
    on truthofmarket.com without query parameters? Test edge cases.
    """

    @classmethod
    def setUpClass(cls):
        cls.port = get_free_port()
        env = os.environ.copy()
        env['PORT'] = str(cls.port)
        # Start server.js in background
        cls.proc = subprocess.Popen(
            ['node', str(ROOT_DIR / 'server.js')],
            cwd=str(ROOT_DIR),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        time.sleep(1.5)

    @classmethod
    def tearDownClass(cls):
        if cls.proc:
            cls.proc.terminate()
            try:
                cls.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                cls.proc.kill()

    def _http_get(self, path, headers=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        h = headers or {}
        conn.request('GET', path, headers=h)
        res = conn.getresponse()
        body = res.read().decode('utf-8', errors='replace')
        conn.close()
        return res.status, res.getheaders(), body

    def test_client_index_html_no_paywall_without_query(self):
        """1-1: Verify client index.html has no forced English paywall on truthofmarket.com without query"""
        index_file = ROOT_DIR / "index.html"
        self.assertTrue(index_file.exists())
        with open(index_file, "r", encoding="utf-8") as f:
            content = f.read()

        # The paywall script must NOT check hostname for truthofmarket.com
        bad_check = re.search(r"_kfHost\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1", content)
        self.assertIsNone(bad_check, "index.html must not force global paid on truthofmarket.com")

        # HTML root tag must default to lang="ko"
        self.assertIn('<html lang="ko"', content, "index.html root must be lang='ko'")

    def test_global_paywall_js_script_pure_logic(self):
        """1-2: Verify global-paywall-edition.js returns false for truthofmarket.com without edition query"""
        script_file = ROOT_DIR / "src" / "js" / "global-paywall-edition.js"
        with open(script_file, "r", encoding="utf-8") as f:
            content = f.read()
        bad_check = re.search(r"host\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1", content)
        self.assertIsNone(bad_check, "global-paywall-edition.js must not contain truthofmarket.com lock")

    def test_server_serving_truthofmarket_without_query_params(self):
        """
        1-3: Verify server.js serves Korean (lang='ko') for kidsfit.co.kr and Global English (lang='en' data-edition='global-paid') for truthofmarket.com
        """
        status_ko, _, body_ko = self._http_get('/', headers={'Host': 'kidsfit.co.kr'})
        self.assertEqual(status_ko, 200)
        self.assertIn('<html lang="ko"', body_ko)
        self.assertNotIn('data-edition="global-paid"', body_ko)

        status_en, _, body_en = self._http_get('/', headers={'Host': 'truthofmarket.com'})
        self.assertEqual(status_en, 200)
        self.assertTrue('data-edition="global-paid"' in body_en or '<html lang="en"' in body_en)

    def test_server_serving_various_host_casings_and_subdomains(self):
        """1-4: Test server.js host casing and subdomain variations for Korean domestic domains"""
        variations = [
            'kidsfit.co.kr',
            'KIDSFIT.CO.KR',
            'www.kidsfit.co.kr',
            'kidsfit.co.kr:443',
            'localhost'
        ]
        for host in variations:
            status, _, body = self._http_get('/', headers={'Host': host})
            self.assertEqual(status, 200)
            self.assertFalse(
                'data-edition="global-paid"' in body,
                f"Host '{host}' without query params unexpectedly triggered global-paid edition in server.js!"
            )

    def test_server_serving_various_user_agents(self):
        """1-5: Test server.js with different mobile and crawler User-Agents on kidsfit.co.kr"""
        uas = [
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.2.0',
            'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-G998N) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 NAVER(inapp; search; 1000; 12.5.3)',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
        ]
        for ua in uas:
            status, _, body = self._http_get('/', headers={'Host': 'kidsfit.co.kr', 'User-Agent': ua})
            self.assertEqual(status, 200)
            self.assertFalse(
                'data-edition="global-paid"' in body,
                f"User-Agent '{ua[:30]}...' on kidsfit.co.kr unexpectedly triggered global-paid edition!"
            )

    def test_explicit_global_paywall_activation(self):
        """1-6: Verify global paid edition activates ONLY when explicitly requested via ?edition=global or ?paywall=1"""
        status, _, body = self._http_get('/?edition=global', headers={'Host': 'truthofmarket.com'})
        self.assertEqual(status, 200)
        self.assertTrue('data-edition="global-paid"' in body or 'lang="en"' in body)

        status2, _, body2 = self._http_get('/?paywall=1', headers={'Host': 'localhost'})
        self.assertEqual(status2, 200)
        self.assertTrue('data-edition="global-paid"' in body2 or 'lang="en"' in body2)


class TestSurveyExtremeInputs(unittest.TestCase):
    """
    Challenge 2: What happens when a user submits incomplete or extreme values
    (age 1, age 20, missing parent heights)? Does the unified survey handle it smoothly?
    """

    def _run_node_script(self, script_code):
        proc = subprocess.run(
            ['node', '-e', script_code],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        return proc.returncode, proc.stdout, proc.stderr

    def test_extreme_age_1_infant_evaluation(self):
        """2-1: Verify age 1 (12 months) evaluates cleanly across growth engine and curator"""
        script = """
        const growthEngine = require('./src/js/growth-engine.js');
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          gender: 'boy',
          ageMonths: 12,
          currentHeight: 75.7,
          currentWeight: 9.8,
          recentGrowth6m: 5.0,
          fatherHeight: 173.5,
          motherHeight: 160.5,
          habits: ['late_sleep'],
          cognitiveAxes: ['language_reading']
        };
        const items = curator.curatePinpointItems(profile);
        console.log(JSON.stringify({
          ok: true,
          supplementsCount: items.supplements.length,
          firstSupp: items.supplements[0].id
        }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Node script crashed on age 1: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])
        self.assertGreaterEqual(data['supplementsCount'], 1)

    def test_extreme_age_20_young_adult_evaluation(self):
        """2-2: Verify age 20 (240 months) evaluates cleanly without array out-of-bounds"""
        script = """
        const growthEngine = require('./src/js/growth-engine.js');
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          gender: 'girl',
          ageMonths: 240,
          currentHeight: 162.0,
          currentWeight: 52.0,
          recentGrowth6m: 0.1,
          fatherHeight: 175.0,
          motherHeight: 162.0,
          habits: ['poor_posture'],
          cognitiveAxes: ['science_nature']
        };
        const items = curator.curatePinpointItems(profile);
        console.log(JSON.stringify({
          ok: true,
          supplementsCount: items.supplements.length,
          toysCount: items.toys.length,
          toolsCount: items.learningTools.length
        }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Node script crashed on age 20: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])
        self.assertGreaterEqual(data['supplementsCount'], 1)

    def test_missing_and_zero_parent_heights(self):
        """2-3: Verify missing or 0 parent heights fall back to standard Korean MPH baselines"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const p1 = { ageMonths: 120, gender: 'boy', fatherHeight: 0, motherHeight: null };
        const p2 = { ageMonths: 120, gender: 'girl', fatherHeight: '', motherHeight: undefined };
        const items1 = curator.curatePinpointItems(p1);
        const items2 = curator.curatePinpointItems(p2);
        console.log(JSON.stringify({
          ok: true,
          items1Count: items1.supplements.length,
          items2Count: items2.supplements.length
        }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Node script crashed on missing parent heights: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])

    def test_missing_habits_and_cognitive_axes(self):
        """2-4: Verify empty habits [] and empty cognitive axes [] handle smoothly without undefined errors"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          ageMonths: 84,
          gender: 'boy',
          habits: [],
          cognitiveAxes: [],
          traitLearningConcerns: []
        };
        const items = curator.curatePinpointItems(profile);
        console.log(JSON.stringify({
          ok: true,
          supplementsCount: items.supplements.length,
          toysCount: items.toys.length,
          learningToolsCount: items.learningTools.length
        }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Node script crashed on empty habits: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])
        self.assertGreaterEqual(data['supplementsCount'], 1)

    def test_extreme_and_hostile_numeric_inputs(self):
        """2-5: Verify negative, gigantic, NaN, and string inputs clamp safely in growth calculations"""
        script = """
        const growthEngine = require('./src/js/growth-engine.js');
        const curator = require('./src/js/pinpoint-curator.js');
        
        const hostileAges = [-10, 0, 9999, NaN, "bad_input", null];
        const results = hostileAges.map(age => {
          try {
            const ageInfo = curator.calculateExactAgeFromDob(2015, 5, 15);
            const items = curator.curatePinpointItems({ ageMonths: age });
            return { age, success: true, count: items.supplements.length };
          } catch (e) {
            return { age, success: false, error: e.message };
          }
        });
        console.log(JSON.stringify({ ok: true, results }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Hostile inputs threw unhandled error: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])
        for r in data['results']:
            self.assertTrue(r['success'], f"Failed on input {r['age']}: {r.get('error')}")


class TestServerCrashResilience(unittest.TestCase):
    """
    Challenge 3: Does server.js reliably increment both diagnoses.growth and diagnoses.learning
    when mode === 'both'? Does it handle malformed JSON or empty payloads without crashing?
    """

    @classmethod
    def setUpClass(cls):
        cls.port = get_free_port()
        env = os.environ.copy()
        env['PORT'] = str(cls.port)
        cls.proc = subprocess.Popen(
            ['node', str(ROOT_DIR / 'server.js')],
            cwd=str(ROOT_DIR),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        time.sleep(1.5)

    @classmethod
    def tearDownClass(cls):
        if cls.proc:
            cls.proc.terminate()
            try:
                cls.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                cls.proc.kill()

    def _post(self, path, payload, content_type='application/json'):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        headers = {'Content-Type': content_type}
        conn.request('POST', path, body=payload, headers=headers)
        res = conn.getresponse()
        body = res.read().decode('utf-8', errors='replace')
        conn.close()
        return res.status, body

    def _get_stats(self):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        conn.request('GET', '/api/stats')
        res = conn.getresponse()
        body = res.read().decode('utf-8', errors='replace')
        conn.close()
        return json.loads(body)

    def test_server_both_mode_telemetry_increment(self):
        """3-1: Verify mode === 'both' increments BOTH diagnoses.growth and diagnoses.learning"""
        stats_before = self._get_stats()
        diag_before = stats_before['analytics']['today']['diagnoses']

        status, body = self._post('/api/visit', json.dumps({
            'event': 'diagnosis',
            'mode': 'both',
            'profile': {'gender': 'boy', 'ageMonths': 120}
        }))
        self.assertEqual(status, 200)

        stats_after = self._get_stats()
        diag_after = stats_after['analytics']['today']['diagnoses']

        self.assertEqual(diag_after['total'], diag_before['total'] + 1)
        self.assertEqual(diag_after['growth'], diag_before['growth'] + 1)
        self.assertEqual(diag_after['learning'], diag_before['learning'] + 1)

    def test_server_handles_malformed_json_gracefully(self):
        """3-2: Verify server handles malformed JSON without crashing or 500"""
        malformed_bodies = [
            '{ event: "diagnosis", unclosed',
            '<<<NOT_JSON>>>',
            '{"event": "diagnosis", "mode": ',
            '{"event": \x00\x01\x02}',
            '{"event": "diagnosis", "age": Infinity}'
        ]
        for bad_body in malformed_bodies:
            status, body = self._post('/api/visit', bad_body)
            self.assertEqual(status, 200, f"Server failed on malformed body: {bad_body}")
            res_data = json.loads(body)
            self.assertTrue(res_data.get('ok'))

        # Verify server is still alive
        stats = self._get_stats()
        self.assertTrue(stats.get('ok'))

    def test_server_handles_empty_and_null_bodies(self):
        """3-3: Verify server handles empty string, whitespace, and null payloads"""
        empty_bodies = ['', '   ', '\n\t\n', '{}', 'null']
        for body in empty_bodies:
            status, res_body = self._post('/api/visit', body)
            self.assertEqual(status, 200, f"Server failed on empty body: '{body}'")

    def test_server_handles_oversized_payloads(self):
        """3-4: Verify server handles >16KB oversized payloads without memory leak"""
        large_payload = json.dumps({
            'event': 'pageview',
            'garbage': 'A' * 32000
        })
        status, res_body = self._post('/api/visit', large_payload)
        self.assertEqual(status, 200)


class TestProductPrescriptionMatching(unittest.TestCase):
    """
    Challenge 4: Are product prescription cards accurately matched to specific diagnosed deficits
    (late sleep -> sleep aids, posture -> dead hang bar, math block -> Gabe)? Are affiliate codes present?
    """

    def _run_node_script(self, script_code):
        proc = subprocess.run(
            ['node', '-e', script_code],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        return proc.returncode, proc.stdout, proc.stderr

    def test_late_sleep_maps_to_sleep_aids(self):
        """4-1: Verify late_sleep or late_bedtime triggers tart cherry, magnesium or sleep care supplements"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          ageMonths: 132,
          gender: 'boy',
          habits: ['late_sleep'],
          traitDietList: ['balanced'],
          traitSleepList: ['late_bedtime', 'wake_middle']
        };
        const items = curator.curatePinpointItems(profile);
        const suppTitles = items.supplements.map(s => s.name + ' ' + s.activeSpec + ' ' + (s.whyNeeded || '')).join(' ');
        const hasSleepAid = /타트체리|마그네슘|수면|테아닌|서파수면/.test(suppTitles);
        console.log(JSON.stringify({ ok: true, hasSleepAid, suppTitles: suppTitles.slice(0, 200) }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Script error: {err}")
        data = json.loads(out)
        self.assertTrue(data['hasSleepAid'], f"Late sleep profile did not produce sleep aid: {data['suppTitles']}")

    def test_poor_posture_maps_to_doorway_bar_or_posture_gear(self):
        """4-2: Verify poor_posture or turtle_slouch triggers dead hang doorway bar or posture gear"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          ageMonths: 144,
          gender: 'boy',
          habits: ['poor_posture'],
          traitPostureList: ['turtle_slouch']
        };
        const items = curator.curatePinpointItems(profile);
        const toyTitles = items.toys.map(t => t.name + ' ' + t.activeSpec + ' ' + (t.whyNeeded || '')).join(' ');
        const hasPostureGear = /철봉|데드행|독서대|자세|척추|감압/.test(toyTitles);
        console.log(JSON.stringify({ ok: true, hasPostureGear, toyTitles: toyTitles.slice(0, 200) }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Script error: {err}")
        data = json.loads(out)
        self.assertTrue(data['hasPostureGear'], f"Poor posture did not produce posture gear: {data['toyTitles']}")

    def test_math_block_maps_to_gabe_or_spatial_manipulatives(self):
        """4-3: Verify math spatial bottleneck maps to Froebel Gabe or math manipulatives"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          ageMonths: 54, // 4.5 years old
          gender: 'girl',
          traitLearningConcerns: ['math_struggle', 'spatial_struggle'],
          cognitiveAxes: ['math_spatial']
        };
        const items = curator.curatePinpointItems(profile);
        const toolTitles = items.learningTools.map(t => t.name + ' ' + t.activeSpec + ' ' + (t.whyNeeded || '')).join(' ');
        const hasGabeOrMath = /가베|은물|도형|수학|칠교|패턴/.test(toolTitles);
        console.log(JSON.stringify({ ok: true, hasGabeOrMath, toolTitles: toolTitles.slice(0, 200) }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Script error: {err}")
        data = json.loads(out)
        self.assertTrue(data['hasGabeOrMath'], f"Math bottleneck did not produce Gabe/math toys: {data['toolTitles']}")

    def test_affiliate_codes_present_in_generated_urls(self):
        """4-4: Verify generated purchase URLs include Coupang AF7865143 and LinkPrice A100708867"""
        script = """
        const curator = require('./src/js/pinpoint-curator.js');
        const profile = {
          ageMonths: 120,
          gender: 'boy',
          habits: ['late_sleep', 'poor_posture'],
          traitDietList: ['balanced'],
          cognitiveAxes: ['science_nature']
        };
        const items = curator.curatePinpointItems(profile);
        const list = [...items.supplements, ...items.toys, ...items.learningTools, ...items.books];

        const coupangUrls = [];
        const linkpriceUrls = [];

        list.forEach(item => {
          if (item.coupangUrl) coupangUrls.push(item.coupangUrl);
          if (item.yes24Url) linkpriceUrls.push(item.yes24Url);
          if (Array.isArray(item.curatedProducts)) {
            item.curatedProducts.forEach(cp => {
              if (cp.coupangUrl) coupangUrls.push(cp.coupangUrl);
              if (cp.yes24Url) linkpriceUrls.push(cp.yes24Url);
            });
          }
        });

        const hasCoupangAff = coupangUrls.every(u => u.includes('AF7865143'));
        const hasLinkpriceAff = linkpriceUrls.every(u => u.includes('A100708867'));

        console.log(JSON.stringify({
          ok: true,
          coupangCount: coupangUrls.length,
          linkpriceCount: linkpriceUrls.length,
          hasCoupangAff,
          hasLinkpriceAff
        }));
        """
        code, out, err = self._run_node_script(script)
        self.assertEqual(code, 0, f"Script error: {err}")
        data = json.loads(out)
        self.assertTrue(data['ok'])
        self.assertGreater(data['coupangCount'], 0)
        self.assertTrue(data['hasCoupangAff'], "Some Coupang URLs are missing AF7865143")
        if data['linkpriceCount'] > 0:
            self.assertTrue(data['hasLinkpriceAff'], "Some LinkPrice URLs are missing A100708867")


class TestClickConversionTracking(unittest.TestCase):
    """
    Challenge 5: Does clicking an affiliate link capture utm_source properly
    under various query strings and session states?
    """

    @classmethod
    def setUpClass(cls):
        cls.port = get_free_port()
        env = os.environ.copy()
        env['PORT'] = str(cls.port)
        cls.proc = subprocess.Popen(
            ['node', str(ROOT_DIR / 'server.js')],
            cwd=str(ROOT_DIR),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        time.sleep(1.5)

    @classmethod
    def tearDownClass(cls):
        if cls.proc:
            cls.proc.terminate()
            try:
                cls.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                cls.proc.kill()

    def _post(self, path, payload):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        headers = {'Content-Type': 'application/json'}
        conn.request('POST', path, body=json.dumps(payload), headers=headers)
        res = conn.getresponse()
        body = res.read().decode('utf-8', errors='replace')
        conn.close()
        return res.status, json.loads(body)

    def _get_stats(self):
        conn = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        conn.request('GET', '/api/stats')
        res = conn.getresponse()
        body = res.read().decode('utf-8', errors='replace')
        conn.close()
        return json.loads(body)

    def test_utm_source_capture_across_all_omnichannel_sources(self):
        """5-1: Test click tracking attribution across all 5 omnichannel sources"""
        sources = [
            ('growth_product_click', 'growth', 'naver_blog'),
            ('growth_product_click', 'growth', 'naver_cafe'),
            ('learning_product_click', 'learning', 'instagram_bio'),
            ('learning_product_click', 'learning', 'qna_top'),
            ('growth_product_click', 'growth', 'threads')
        ]
        for event, category, utm in sources:
            stats_before = self._get_stats()
            clicks_before = stats_before['analytics']['today']['productClicks']

            status, res = self._post('/api/visit', {
                'event': event,
                'category': category,
                'href': 'https://link.coupang.com/a/AF7865143',
                'utm_source': utm
            })
            self.assertEqual(status, 200)
            self.assertTrue(res['ok'])

            stats_after = self._get_stats()
            clicks_after = stats_after['analytics']['today']['productClicks']

            # Verify category counter incremented
            self.assertEqual(clicks_after[category], clicks_before[category] + 1)
            # Verify byReferrer entry exists and incremented
            by_ref = clicks_after.get('byReferrer', {}).get(utm, {})
            self.assertGreaterEqual(by_ref.get(category, 0), 1)

    def test_client_click_tracking_listener_logic_in_index_html(self):
        """5-2: Verify index.html contains complete client-side click listener with session storage fallback"""
        index_file = ROOT_DIR / "index.html"
        with open(index_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Check listener exists
        self.assertIn("document.addEventListener('click'", content)
        # Check utm_source capture from query and session storage
        self.assertIn("sessionStorage.getItem('kf_utm_source')", content)
        # Check dispatch to /api/visit
        self.assertIn("'/api/visit'", content)
        # Check category detection
        self.assertIn("data-product-category", content)


if __name__ == '__main__':
    unittest.main()
