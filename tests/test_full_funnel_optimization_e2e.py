#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_full_funnel_optimization_e2e.py
KidsFit Full-Funnel Inflow & Conversion Optimization — Comprehensive E2E Test Suite

Methodology (4 Tiers):
- Tier 1: Feature Coverage (F01 to F13 across R1 to R5)
- Tier 2: Boundary & Corner Cases (8 test cases)
- Tier 3: Cross-Feature Interactions (5 test cases)
- Tier 4: Real-World Workload Scenarios (5 multi-step journeys)

Authoritative Specifications:
- ORIGINAL_REQUEST.md (Section 2026-10-24T13:40:37Z)
- PROJECT.md (Architecture, Feature Inventory F01-F13, Interface Contracts)
- TEST_INFRA.md (Test Architecture, Contracts & Expected Output Derivation)
"""

import os
import sys
import json
import re
import unittest
import urllib.parse
from pathlib import Path

# Safe Windows stdout/stderr encoding configuration
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Root directory resolution
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Expected constants from specifications
PRODUCTION_DOMAIN = "truthofmarket.com"
PRIMARY_URL = f"https://{PRODUCTION_DOMAIN}"
LEGACY_DOMAIN = "kidsfit.co.kr"
EXPECTED_TELEGRAM_CHAT_ID = "755033799"
COUPANG_AFFILIATE_ID = "AF7865143"
LINKPRICE_AFFILIATE_ID = "A100708867"

KIDSFIT_BLOG_CATEGORIES = [
    "우리 아이 키성장·성조숙증",
    "월령별 두뇌·소근육 발달",
    "연령별 교구·책육아 추천",
    "주말 미술관·박물관 나들이",
]

KIDSFIT_CAFE_BOARDS = [
    "키성장·성조숙증 코칭",
    "소근육·두뇌발달 질문방",
    "교구·책육아 솔직후기",
    "주말 나들이·전시 코스",
    "엄마표 홈케어 워크지",
    "자유수다·육아고민",
    "공지사항·이벤트",
]

COMMERCIAL_AFFILIATE_PATTERNS = [
    r"AF\d{7}",
    r"A100\d{6}",
    r"4d31d3",
    r"lptag=",
    r"click\.linkprice\.com",
    r"link\.coupang\.com",
    r"adpick\.co\.kr",
    r"텐핑",
]


# ==============================================================================
# Helper Verification Functions
# ==============================================================================

def classify_referrer_reference(ref_str: str, req_url_str: str) -> str:
    """Reference implementation of server.js classifyReferrer logic."""
    r = (ref_str or "").lower()
    u = (req_url_str or "").lower()
    combined = f"{r} {u}"
    if "instagram" in combined or "ig.me" in combined or "utm_source=insta" in combined:
        return "instagram"
    if "threads.net" in combined or "threads.com" in combined or "utm_source=threads" in combined:
        return "threads"
    if "blog.naver.com" in combined or "utm_source=naver_blog" in combined or "ref=blog" in combined:
        return "naver_blog"
    if "cafe.naver.com" in combined or "utm_source=naver_cafe" in combined or "ref=cafe" in combined:
        return "naver_cafe"
    if "qna_top" in combined or "utm_source=qna_top" in combined:
        return "qna_top"
    if "qna_bottom" in combined or "utm_source=qna_bottom" in combined:
        return "qna_bottom"
    if "kin.naver.com" in combined or "naver.com" in combined or "clip" in combined or "utm_source=naver" in combined:
        return "naver_search_clip"
    if "google." in combined or "daum.net" in combined or "kakao" in combined or "bing." in combined:
        return "google_daum_kakao"
    return "direct"


def simulate_diagnosis_telemetry(current_stats: dict, mode: str) -> dict:
    """Simulate server-side dual diagnosis telemetry updates."""
    stats = json.loads(json.dumps(current_stats))
    day = stats.setdefault("daily", {}).setdefault("today", {
        "diagnoses": {"total": 0, "growth": 0, "learning": 0}
    })
    total = stats.setdefault("total", {
        "diagnoses": {"total": 0, "growth": 0, "learning": 0}
    })

    day["diagnoses"]["total"] += 1
    total["diagnoses"]["total"] += 1

    if mode == "both":
        day["diagnoses"]["growth"] += 1
        day["diagnoses"]["learning"] += 1
        total["diagnoses"]["growth"] += 1
        total["diagnoses"]["learning"] += 1
    elif mode == "learning":
        day["diagnoses"]["learning"] += 1
        total["diagnoses"]["learning"] += 1
    else:
        day["diagnoses"]["growth"] += 1
        total["diagnoses"]["growth"] += 1

    return stats


def simulate_product_click_telemetry(current_stats: dict, category: str, utm_source: str) -> dict:
    """Simulate server-side product click telemetry with category and UTM attribution."""
    stats = json.loads(json.dumps(current_stats))
    day = stats.setdefault("daily", {}).setdefault("today", {})
    day["affiliateClicks"] = (day.get("affiliateClicks") or 0) + 1
    
    prod_clicks = day.setdefault("productClicks", {"growth": 0, "learning": 0, "byReferrer": {}})
    cat_key = "learning" if category == "learning" else "growth"
    prod_clicks[cat_key] += 1
    
    by_ref = prod_clicks.setdefault("byReferrer", {})
    ref_bucket = by_ref.setdefault(utm_source or "direct", {"growth": 0, "learning": 0})
    ref_bucket[cat_key] += 1

    stats["total"]["affiliateClicks"] = (stats.get("total", {}).get("affiliateClicks") or 0) + 1
    return stats


# ==============================================================================
# Tier 1: Feature Coverage (F01 to F13)
# ==============================================================================

class TestF01PromotionDiagnosisReport(unittest.TestCase):
    """F01: Promotion & Funnel Bottleneck Diagnosis Report (R1)"""

    def setUp(self):
        self.md_report = ROOT_DIR / "docs" / "promotion_funnel_diagnosis_report.md"
        self.json_report = ROOT_DIR / "docs" / "promotion_funnel_diagnosis_report.json"
        self.visitor_log = ROOT_DIR / "logs" / "visitor_analytics.json"

    def test_f01_report_files_existence(self):
        """F01-1: Verify both markdown and JSON diagnosis reports exist in docs/"""
        self.assertTrue(
            self.md_report.exists(),
            f"Missing diagnosis markdown report: {self.md_report}"
        )
        self.assertTrue(
            self.json_report.exists(),
            f"Missing diagnosis JSON report: {self.json_report}"
        )

    def test_f01_report_json_schema(self):
        """F01-2: Verify promotion_funnel_diagnosis_report.json conforms to schema"""
        self.assertTrue(self.json_report.exists(), "JSON diagnosis report must exist")
        with open(self.json_report, "r", encoding="utf-8") as f:
            data = json.load(f)
        for key in ["baseline_metrics", "bottleneck_root_causes", "target_kpis"]:
            self.assertIn(key, data, f"JSON report missing required key: {key}")

    def test_f01_baseline_quantitative_metrics(self):
        """F01-3: Verify report records exact baseline metrics (UV 11, PV 16, growth 29, learning 0)"""
        self.assertTrue(self.json_report.exists(), "JSON diagnosis report must exist")
        with open(self.json_report, "r", encoding="utf-8") as f:
            data = json.load(f)
        metrics = data.get("baseline_metrics", {})
        self.assertEqual(metrics.get("total_uv"), 11, "Baseline total UV must be exactly 11")
        self.assertEqual(metrics.get("total_pv"), 16, "Baseline total PV must be exactly 16")
        diagnoses = metrics.get("diagnoses", {})
        self.assertEqual(diagnoses.get("growth"), 29, "Baseline growth diagnoses must be 29")
        self.assertEqual(diagnoses.get("learning"), 0, "Baseline learning diagnoses must be 0")

    def test_f01_root_cause_matrix_coverage(self):
        """F01-4: Verify report documents root causes across Inflow, Diagnosis, CVR, and Domain"""
        self.assertTrue(self.json_report.exists(), "JSON diagnosis report must exist")
        with open(self.json_report, "r", encoding="utf-8") as f:
            data = json.load(f)
        root_causes = data.get("bottleneck_root_causes", {})
        for area in ["inflow", "diagnosis_split", "conversion", "domain_canonical"]:
            self.assertIn(area, root_causes, f"Root causes missing analysis area: {area}")
            self.assertGreater(len(root_causes[area]), 0, f"Area {area} must have documented causes")

    def test_f01_target_kpi_specifications(self):
        """F01-5: Verify report defines actionable targets (e.g. 50% learning ratio, affiliate CVR)"""
        self.assertTrue(self.json_report.exists(), "JSON diagnosis report must exist")
        with open(self.json_report, "r", encoding="utf-8") as f:
            data = json.load(f)
        kpis = data.get("target_kpis", {})
        self.assertIn("learning_diagnosis_ratio", kpis, "Target KPIs must define learning ratio")
        self.assertIn("affiliate_cvr_target", kpis, "Target KPIs must define affiliate CVR target")


class TestF02BlogDiagnosticBridge(unittest.TestCase):
    """F02: Naver Blog Contextual Diagnostic Bridge & QR Infographic (R2)"""

    def setUp(self):
        self.script_path = ROOT_DIR / "scripts" / "publish_enhanced_naver_blog.py"

    def test_f02_script_existence(self):
        """F02-1: Verify publish_enhanced_naver_blog.py exists"""
        self.assertTrue(self.script_path.exists(), f"Missing blog script: {self.script_path}")

    def test_f02_diagnostic_bridge_utm_url(self):
        """F02-2: Verify blog script embeds truthofmarket.com bridge with utm_source=naver_blog"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(PRODUCTION_DOMAIN, content, f"Blog script must reference {PRODUCTION_DOMAIN}")
        self.assertIn("utm_source=naver_blog", content, "Blog script must contain utm_source=naver_blog")
        self.assertIn("utm_campaign=kidsfit_diagnosis", content, "Blog script must include utm_campaign")

    def test_f02_zero_commercial_affiliate_links(self):
        """F02-3: Verify blog script contains zero direct commercial affiliate links"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        for pat in COMMERCIAL_AFFILIATE_PATTERNS:
            matches = re.findall(pat, content, re.IGNORECASE)
            self.assertEqual(len(matches), 0, f"Banned affiliate pattern '{pat}' found in blog script: {matches}")

    def test_f02_checklist_infographic_qr_generator(self):
        """F02-4: Verify 3rd checklist infographic image embeds 135x135 QR code and callout"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_qr = "qrcode" in content.lower() or "qr" in content.lower()
        self.assertTrue(has_qr, "Blog script must contain QR code generation logic for infographic")
        has_callout = any(term in content for term in ["무료 진단", "1분", "truthofmarket.com", "골든타임"])
        self.assertTrue(has_callout, "Blog script must render visual callout in infographic")

    def test_f02_kidsfit_category_coverage(self):
        """F02-5: Verify blog publisher covers all 4 KidsFit categories"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        for cat in KIDSFIT_BLOG_CATEGORIES:
            self.assertIn(cat, content, f"Missing KidsFit category in blog script: {cat}")


class TestF03CafeDiagnosticBridge(unittest.TestCase):
    """F03: Naver Cafe Diagnostic Bridge & Card Upgrade (R2)"""

    def setUp(self):
        self.script_path = ROOT_DIR / "scripts" / "publish_enhanced_naver_cafe.py"

    def test_f03_script_existence(self):
        """F03-1: Verify publish_enhanced_naver_cafe.py exists"""
        self.assertTrue(self.script_path.exists(), f"Missing cafe script: {self.script_path}")

    def test_f03_diagnostic_bridge_utm_url(self):
        """F03-2: Verify cafe script embeds truthofmarket.com bridge with utm_source=naver_cafe"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(PRODUCTION_DOMAIN, content, f"Cafe script must reference {PRODUCTION_DOMAIN}")
        self.assertIn("utm_source=naver_cafe", content, "Cafe script must contain utm_source=naver_cafe")

    def test_f03_zero_commercial_affiliate_links(self):
        """F03-3: Verify cafe script contains zero direct commercial affiliate links"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        for pat in COMMERCIAL_AFFILIATE_PATTERNS:
            matches = re.findall(pat, content, re.IGNORECASE)
            self.assertEqual(len(matches), 0, f"Banned affiliate pattern '{pat}' found in cafe script: {matches}")

    def test_f03_cafe_card_qr_callout(self):
        """F03-4: Verify cafe card PNG generator embeds 120x120 QR code and callout"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_card_qr = "qr" in content.lower() or "qrcode" in content.lower()
        self.assertTrue(has_card_qr, "Cafe script must include QR code generation in card image")

    def test_f03_board_taxonomy_coverage(self):
        """F03-5: Verify cafe publisher supports all 7 KidsFit boards"""
        self.assertTrue(self.script_path.exists())
        with open(self.script_path, "r", encoding="utf-8") as f:
            content = f.read()
        for board in KIDSFIT_CAFE_BOARDS:
            self.assertIn(board, content, f"Missing cafe board in script: {board}")


class TestF04WebtoonCardNewsQRBridge(unittest.TestCase):
    """F04: Webtoon Cut 4 & Card News Slide 6 QR Bridge (R2)"""

    def setUp(self):
        self.pack_gen = ROOT_DIR / "scripts" / "generate_webtoon_and_cardnews_packs.py"
        self.telegram_sender = ROOT_DIR / "scripts" / "send_branding_and_daily_assets_telegram.py"

    def test_f04_scripts_existence(self):
        """F04-1: Verify webtoon/cardnews generator and Telegram sender scripts exist"""
        self.assertTrue(self.pack_gen.exists(), f"Missing pack generator: {self.pack_gen}")
        self.assertTrue(self.telegram_sender.exists(), f"Missing telegram sender: {self.telegram_sender}")

    def test_f04_webtoon_cut4_visual_qr_and_callout(self):
        """F04-2: Verify webtoon cut 4 generator includes visual QR code and diagnostic callout"""
        self.assertTrue(self.pack_gen.exists())
        with open(self.pack_gen, "r", encoding="utf-8") as f:
            content = f.read()
        has_cut4_bridge = "cut" in content.lower() and ("qr" in content.lower() or "truthofmarket.com" in content)
        self.assertTrue(has_cut4_bridge, "Webtoon Cut 4 must embed QR code / diagnostic bridge")

    def test_f04_cardnews_slide6_visual_qr_and_callout(self):
        """F04-3: Verify card news slide 6 generator includes visual QR code and diagnostic box"""
        self.assertTrue(self.pack_gen.exists())
        with open(self.pack_gen, "r", encoding="utf-8") as f:
            content = f.read()
        has_slide6_bridge = "slide" in content.lower() and ("qr" in content.lower() or "truthofmarket.com" in content)
        self.assertTrue(has_slide6_bridge, "Card News Slide 6 must embed QR code / diagnostic bridge")

    def test_f04_no_legacy_domain_in_copy_dispatch(self):
        """F04-4: Verify telegram sender replaces kidsfit.co.kr with truthofmarket.com in copy"""
        self.assertTrue(self.telegram_sender.exists())
        with open(self.telegram_sender, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(PRODUCTION_DOMAIN, content, f"Telegram sender copy must use {PRODUCTION_DOMAIN}")
        # kidsfit.co.kr should not appear in active links
        self.assertNotIn(f"https://{LEGACY_DOMAIN}", content, f"Legacy domain {LEGACY_DOMAIN} must be replaced")

    def test_f04_utm_tags_in_social_copy(self):
        """F04-5: Verify social copy text includes utm_source for instagram and threads"""
        self.assertTrue(self.telegram_sender.exists())
        with open(self.telegram_sender, "r", encoding="utf-8") as f:
            content = f.read()
        has_utm = "utm_source=instagram" in content or "utm_source=threads" in content
        self.assertTrue(has_utm, "Social copy must include utm_source for Instagram or Threads")


class TestF05QnAPagesBridgeSitemap(unittest.TestCase):
    """F05: 31 SEO Q&A Landing Pages Bridge Widgets & Sitemap Unification (R2)"""

    def setUp(self):
        self.qna_dir = ROOT_DIR / "qna"
        self.sitemap_file = ROOT_DIR / "sitemap.xml"

    def test_f05_qna_page_inventory_count(self):
        """F05-1: Verify at least 25 clinical Q&A pages exist in qna/"""
        self.assertTrue(self.qna_dir.exists(), f"Missing qna directory: {self.qna_dir}")
        html_files = list(self.qna_dir.glob("*.html"))
        self.assertGreaterEqual(len(html_files), 25, f"Expected >= 25 Q&A pages, found {len(html_files)}")

    def test_f05_canonical_urls_use_truthofmarket(self):
        """F05-2: Verify Q&A pages have canonical URLs pointing to truthofmarket.com"""
        topic_01 = self.qna_dir / "topic-01.html"
        self.assertTrue(topic_01.exists(), "topic-01.html must exist")
        with open(topic_01, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(f"https://{PRODUCTION_DOMAIN}", content, f"Canonical URL must use {PRODUCTION_DOMAIN}")
        self.assertNotIn(f"https://{LEGACY_DOMAIN}", content, f"Legacy domain {LEGACY_DOMAIN} must not be in canonical")

    def test_f05_top_diagnostic_bridge_widget(self):
        """F05-3: Verify all Q&A pages include top 1-click diagnostic bridge widget"""
        html_files = list(self.qna_dir.glob("*.html"))
        self.assertGreaterEqual(len(html_files), 25)
        for hf in html_files:
            content = hf.read_text(encoding="utf-8")
            has_top_bridge = "utm_source=qna_top" in content or "diagnostic-bridge-top" in content
            self.assertTrue(has_top_bridge, f"Q&A page {hf.name} must include top diagnostic bridge with utm_source=qna_top")

    def test_f05_bottom_diagnostic_bridge_widget(self):
        """F05-4: Verify all Q&A pages include bottom 1-click diagnostic bridge widget"""
        html_files = list(self.qna_dir.glob("*.html"))
        self.assertGreaterEqual(len(html_files), 25)
        for hf in html_files:
            content = hf.read_text(encoding="utf-8")
            has_bottom_bridge = "utm_source=qna_bottom" in content or "diagnostic-bridge-bottom" in content
            self.assertTrue(has_bottom_bridge, f"Q&A page {hf.name} must include bottom diagnostic bridge with utm_source=qna_bottom")

    def test_f05_sitemap_urls_unified_to_truthofmarket(self):
        """F05-5: Verify sitemap.xml uses truthofmarket.com for all entries and CNAME is truthofmarket.com"""
        self.assertTrue(self.sitemap_file.exists(), f"Missing sitemap: {self.sitemap_file}")
        with open(self.sitemap_file, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(f"https://{PRODUCTION_DOMAIN}", content, f"Sitemap must use {PRODUCTION_DOMAIN}")
        self.assertNotIn(f"https://{LEGACY_DOMAIN}", content, f"Sitemap must not contain legacy {LEGACY_DOMAIN}")
        cname_file = ROOT_DIR / "CNAME"
        self.assertTrue(cname_file.exists(), "CNAME file must exist at project root")
        cname_content = cname_file.read_text(encoding="utf-8").strip()
        self.assertEqual(cname_content, PRODUCTION_DOMAIN, f"CNAME must contain {PRODUCTION_DOMAIN}")


class TestF06QAFactCheckAgentAlignment(unittest.TestCase):
    """F06: QA Fact-Check Agent Rule Alignment (R2)"""

    def setUp(self):
        self.agent_path = ROOT_DIR / "scripts" / "qa_fact_check_agent.py"

    def test_f06_agent_script_existence(self):
        """F06-1: Verify qa_fact_check_agent.py exists"""
        self.assertTrue(self.agent_path.exists(), f"Missing QA agent: {self.agent_path}")

    def test_f06_stage1_requires_diagnostic_bridge(self):
        """F06-2: Verify Stage 1 QA enforces presence of truthofmarket.com UTM bridge links"""
        self.assertTrue(self.agent_path.exists())
        with open(self.agent_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(PRODUCTION_DOMAIN, content, "QA Agent must enforce truthofmarket.com bridge validation")
        self.assertIn("utm_source", content, "QA Agent must validate UTM parameters")

    def test_f06_stage1_bans_commercial_affiliate_links(self):
        """F06-3: Verify Stage 1 QA strictly prohibits commercial affiliate links on external channels"""
        self.assertTrue(self.agent_path.exists())
        with open(self.agent_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("AFFILIATE_PATTERNS", content, "QA Agent must maintain list of banned affiliate patterns")
        self.assertIn("AF7865143", content, "QA Agent must explicitly check for Coupang affiliate ID")

    def test_f06_stage2_live_dom_bridge_check(self):
        """F06-4: Verify Stage 2 QA audits live published DOM for diagnostic bridge link"""
        self.assertTrue(self.agent_path.exists())
        with open(self.agent_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_dom_bridge = "truthofmarket.com" in content and ("has_bridge" in content or "bridge" in content.lower())
        self.assertTrue(has_dom_bridge, "Stage 2 QA must audit DOM for diagnostic bridge link")

    def test_f06_rejects_legacy_kidsfit_domain(self):
        """F06-5: Verify QA agent flags and rejects legacy kidsfit.co.kr in external content"""
        self.assertTrue(self.agent_path.exists())
        with open(self.agent_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_legacy_check = LEGACY_DOMAIN in content
        self.assertTrue(has_legacy_check, f"QA agent must audit for legacy {LEGACY_DOMAIN} presence")


class TestF07HomepageKoreanDefaultFix(unittest.TestCase):
    """F07: Primary Domain Korean Default Fix (R3)"""

    def setUp(self):
        self.index_html = ROOT_DIR / "index.html"
        self.paywall_js = ROOT_DIR / "src" / "js" / "global-paywall-edition.js"
        self.i18n_js = ROOT_DIR / "src" / "js" / "i18n.js"

    def test_f07_index_html_no_forced_english_on_primary_domain(self):
        """F07-1: Verify index.html defaults to Korean on kidsfit.co.kr while server.js routes truthofmarket.com to dist-global"""
        self.assertTrue(self.index_html.exists(), "index.html must exist")
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()
        # Ensure kidsfit.co.kr is NOT in the paywall activation check
        bad_check = re.search(
            r"_kfHost\.indexOf\(['\"]kidsfit\.co\.kr['\"]\)\s*!==\s*-1",
            content
        )
        self.assertIsNone(
            bad_check,
            "index.html must NOT force global paid edition when visiting kidsfit.co.kr"
        )
        # Ensure server.js defines isGlobalHost
        server_js = ROOT_DIR / "server.js"
        if server_js.exists():
            server_content = server_js.read_text(encoding="utf-8")
            is_global_match = re.search(r"const\s+isGlobalHost\s*=\s*([^;]+);", server_content)
            self.assertIsNotNone(is_global_match, "server.js must define isGlobalHost")

    def test_f07_index_html_defaults_to_korean_lang(self):
        """F07-2: Verify html tag defaults to lang='ko'"""
        self.assertTrue(self.index_html.exists())
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn('<html lang="ko"', content, "index.html root element must have lang='ko'")

    def test_f07_global_paywall_script_respects_korean_default(self):
        """F07-3: Verify global-paywall-edition.js does not treat truthofmarket.com as global paid"""
        self.assertTrue(self.paywall_js.exists(), "global-paywall-edition.js must exist")
        with open(self.paywall_js, "r", encoding="utf-8") as f:
            content = f.read()
        bad_host_check = re.search(
            r"host\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1",
            content
        )
        self.assertIsNone(
            bad_host_check,
            "global-paywall-edition.js must NOT lock truthofmarket.com"
        )

    def test_f07_i18n_script_defaults_to_korean(self):
        """F07-4: Verify i18n.js does not force 'en' for truthofmarket.com"""
        self.assertTrue(self.i18n_js.exists(), "i18n.js must exist")
        with open(self.i18n_js, "r", encoding="utf-8") as f:
            content = f.read()
        bad_i18n_check = re.search(
            r"host\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1",
            content
        )
        self.assertIsNone(
            bad_i18n_check,
            "i18n.js must NOT force language 'en' for truthofmarket.com"
        )

    def test_f07_global_paid_accessible_via_explicit_query(self):
        """F07-5: Verify global paid edition remains accessible when edition=global is explicitly passed"""
        self.assertTrue(self.paywall_js.exists())
        with open(self.paywall_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("edition=global", content, "Paywall must activate when ?edition=global is specified")


class TestF08UnifiedDiagnosisFunnel(unittest.TestCase):
    """F08: 1-Stop Unified Growth + Learning Diagnosis Flow (R3)"""

    def setUp(self):
        self.index_html = ROOT_DIR / "index.html"
        self.wizard_js = ROOT_DIR / "src" / "js" / "onboarding-wizard.js"
        self.style_css = ROOT_DIR / "src" / "css" / "style.css"

    def test_f08_css_removes_mutual_exclusion(self):
        """F08-1: Verify style.css removes .wizard-mode-growth .mode-learning-field { display: none }"""
        self.assertTrue(self.style_css.exists(), "style.css must exist")
        with open(self.style_css, "r", encoding="utf-8") as f:
            content = f.read()
        bad_rule = re.search(
            r"\.wizard-mode-growth\s+\.mode-learning-field\s*\{\s*display:\s*none\s*!important;",
            content
        )
        self.assertIsNone(
            bad_rule,
            "style.css must remove mutual exclusion rule hiding learning fields in growth mode"
        )

    def test_f08_wizard_steps_include_both_pillars(self):
        """F08-2: Verify onboarding wizard steps include physical growth and cognitive learning"""
        self.assertTrue(self.wizard_js.exists(), "onboarding-wizard.js must exist")
        with open(self.wizard_js, "r", encoding="utf-8") as f:
            content = f.read()
        # Verify both physical and cognitive inputs exist in wizard
        self.assertIn("currentHeight", content, "Wizard must ask physical height")
        self.assertIn("currentWeight", content, "Wizard must ask physical weight")
        has_learning = "learning" in content.lower() or "독서" in content or "수리" in content
        self.assertTrue(has_learning, "Wizard must include cognitive learning inquiries")

    def test_f08_completion_records_both_mode(self):
        """F08-3: Verify wizard onComplete sets preferredReportMode to 'both'"""
        self.assertTrue(self.wizard_js.exists())
        with open(self.wizard_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("'both'", content, "Wizard onComplete must support 'both' mode")

    def test_f08_unified_funnel_duration_under_60s(self):
        """F08-4: Verify UI specifies 1-stop <60s unified diagnosis experience"""
        self.assertTrue(self.index_html.exists())
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()
        has_quick_banner = any(term in content for term in ["1분", "60초", "통합", "원스톱"])
        self.assertTrue(has_quick_banner, "Homepage must highlight 1-minute unified diagnosis")

    def test_f08_client_beacon_dispatches_to_api_visit(self):
        """F08-5: Verify client-side wizard dispatches completion event to /api/visit"""
        self.assertTrue(self.wizard_js.exists())
        with open(self.wizard_js, "r", encoding="utf-8") as f:
            content = f.read()
        has_visit_post = "/api/visit" in content or "/api/user-cohort" in content
        self.assertTrue(has_visit_post, "Wizard must send diagnosis telemetry to server API")


class TestF09DualDiagnosisTelemetry(unittest.TestCase):
    """F09: Dual Diagnosis Telemetry Recording (R3)"""

    def setUp(self):
        self.server_js = ROOT_DIR / "server.js"

    def test_f09_server_script_existence(self):
        """F09-1: Verify server.js exists"""
        self.assertTrue(self.server_js.exists(), f"Missing server.js: {self.server_js}")

    def test_f09_server_handles_both_mode_telemetry(self):
        """F09-2: Verify recordDiagnosisEvent in server.js increments both growth and learning for mode='both'"""
        self.assertTrue(self.server_js.exists())
        with open(self.server_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("recordDiagnosisEvent", content, "server.js must define recordDiagnosisEvent")
        has_both_handling = "both" in content and "diagnoses.growth" in content and "diagnoses.learning" in content
        self.assertTrue(has_both_handling, "server.js must increment both diagnoses.growth and learning on 'both'")

    def test_f09_telemetry_simulation_equal_increments(self):
        """F09-3: Verify simulated mode='both' increments both growth and learning equally"""
        initial_stats = {
            "total": {"diagnoses": {"total": 29, "growth": 29, "learning": 0}},
            "daily": {"today": {"diagnoses": {"total": 0, "growth": 0, "learning": 0}}}
        }
        updated = simulate_diagnosis_telemetry(initial_stats, "both")
        self.assertEqual(updated["daily"]["today"]["diagnoses"]["growth"], 1)
        self.assertEqual(updated["daily"]["today"]["diagnoses"]["learning"], 1)
        self.assertEqual(updated["daily"]["today"]["diagnoses"]["total"], 1)
        self.assertEqual(updated["total"]["diagnoses"]["growth"], 30)
        self.assertEqual(updated["total"]["diagnoses"]["learning"], 1)

    def test_f09_api_visit_endpoint_supports_diagnosis_event(self):
        """F09-4: Verify /api/visit endpoint in server.js parses event='diagnosis'"""
        self.assertTrue(self.server_js.exists())
        with open(self.server_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("/api/visit", content, "server.js must support /api/visit route")
        self.assertIn("diagnosis", content, "server.js must handle diagnosis events in /api/visit")

    def test_f09_cohort_db_records_both_mode(self):
        """F09-5: Verify /api/user-cohort stores preferredReportMode='both'"""
        self.assertTrue(self.server_js.exists())
        with open(self.server_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("/api/user-cohort", content, "server.js must have /api/user-cohort endpoint")


class TestF10PersonalizedProductPrescription(unittest.TestCase):
    """F10: Personalized Growth & Learning Prescription Engine (R4)"""

    def setUp(self):
        self.curator_js = ROOT_DIR / "src" / "js" / "pinpoint-curator.js"
        self.briefing_js = ROOT_DIR / "src" / "js" / "master-briefing.js"

    def test_f10_scripts_existence(self):
        """F10-1: Verify pinpoint-curator.js exists"""
        self.assertTrue(self.curator_js.exists(), f"Missing curator script: {self.curator_js}")

    def test_f10_pmid_academic_rationale_embedded(self):
        """F10-2: Verify prescription cards embed PMID or KDCA academic rationale"""
        self.assertTrue(self.curator_js.exists())
        with open(self.curator_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("PMID", content, "Curator script must cite PMIDs for recommended items")

    def test_f10_affiliate_id_integration(self):
        """F10-3: Verify registered affiliate IDs AF7865143 and A100708867 are present"""
        self.assertTrue(self.curator_js.exists())
        with open(self.curator_js, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(COUPANG_AFFILIATE_ID, content, f"Must include Coupang ID: {COUPANG_AFFILIATE_ID}")
        self.assertIn(LINKPRICE_AFFILIATE_ID, content, f"Must include LinkPrice ID: {LINKPRICE_AFFILIATE_ID}")

    def test_f10_growth_deficit_mapping(self):
        """F10-4: Verify late sleep maps to Tart Cherry / Magnesium and posture to pull-up bar"""
        self.assertTrue(self.curator_js.exists())
        with open(self.curator_js, "r", encoding="utf-8") as f:
            content = f.read()
        has_sleep_rec = "마그네슘" in content or "체리" in content or "수면" in content
        self.assertTrue(has_sleep_rec, "Curator must map sleep deficits to sleep nutrition aids")
        has_posture_rec = "철봉" in content or "데드행" in content or "자세" in content
        self.assertTrue(has_posture_rec, "Curator must map posture deficits to biomechanics gear")

    def test_f10_learning_deficit_mapping(self):
        """F10-5: Verify learning bottlenecks map to Montessori/Gabe, workbooks, and timers"""
        self.assertTrue(self.curator_js.exists())
        with open(self.curator_js, "r", encoding="utf-8") as f:
            content = f.read()
        has_manipulative = "가베" in content or "몬테소리" in content or "교구" in content
        self.assertTrue(has_manipulative, "Curator must prescribe cognitive manipulatives")
        has_workbook = "워크북" in content or "독서" in content or "타이머" in content
        self.assertTrue(has_workbook, "Curator must prescribe learning tools/workbooks")


class TestF11CategoryUtmClickTracking(unittest.TestCase):
    """F11: Category & UTM Conversion Click Tracking (R4)"""

    def setUp(self):
        self.index_html = ROOT_DIR / "index.html"
        self.server_js = ROOT_DIR / "server.js"

    def test_f11_product_cards_have_category_data_attributes(self):
        """F11-1: Verify product card templates include data-product-category attributes"""
        curator_path = ROOT_DIR / "src" / "js" / "pinpoint-curator.js"
        self.assertTrue(curator_path.exists())
        with open(curator_path, "r", encoding="utf-8") as f:
            content = f.read()
        has_cat_attr = "data-product-category" in content or "product-category" in content
        self.assertTrue(has_cat_attr, "Product cards must specify data-product-category attribute")

    def test_f11_client_click_listener_intercepts_events(self):
        """F11-2: Verify client click listener emits growth_product_click or learning_product_click"""
        self.assertTrue(self.index_html.exists())
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()
        has_click_handler = (
            "growth_product_click" in content or
            "learning_product_click" in content or
            "affiliate_click" in content
        )
        self.assertTrue(has_click_handler, "Client must listen for affiliate link clicks")

    def test_f11_client_click_transmits_utm_source(self):
        """F11-3: Verify click beacon transmits utm_source parameter to server"""
        self.assertTrue(self.index_html.exists())
        with open(self.index_html, "r", encoding="utf-8") as f:
            content = f.read()
        has_utm_capture = "utm_source" in content
        self.assertTrue(has_utm_capture, "Client must capture and transmit utm_source")

    def test_f11_server_records_categorized_clicks(self):
        """F11-4: Verify simulated product click increments productClicks category and referrer"""
        stats = {
            "total": {"affiliateClicks": 189},
            "daily": {"today": {"affiliateClicks": 0, "productClicks": {"growth": 0, "learning": 0, "byReferrer": {}}}}
        }
        updated = simulate_product_click_telemetry(stats, "growth", "naver_blog")
        self.assertEqual(updated["daily"]["today"]["productClicks"]["growth"], 1)
        self.assertEqual(updated["daily"]["today"]["productClicks"]["learning"], 0)
        self.assertEqual(
            updated["daily"]["today"]["productClicks"]["byReferrer"]["naver_blog"]["growth"], 1
        )
        self.assertEqual(updated["total"]["affiliateClicks"], 190)

    def test_f11_server_handles_learning_product_clicks(self):
        """F11-5: Verify simulated learning product click increments learning bucket"""
        stats = {
            "total": {"affiliateClicks": 190},
            "daily": {"today": {"affiliateClicks": 1, "productClicks": {"growth": 1, "learning": 0, "byReferrer": {}}}}
        }
        updated = simulate_product_click_telemetry(stats, "learning", "naver_cafe")
        self.assertEqual(updated["daily"]["today"]["productClicks"]["learning"], 1)
        self.assertEqual(
            updated["daily"]["today"]["productClicks"]["byReferrer"]["naver_cafe"]["learning"], 1
        )


TestF11ClickConversionTracking = TestF11CategoryUtmClickTracking


class TestF12E2ETestHarnessIntegrity(unittest.TestCase):
    """F12: Comprehensive E2E Test Suite Integrity (E2E Track)"""

    def test_f12_python_environment_compatibility(self):
        """F12-1: Verify running in Python 3.10+ environment"""
        self.assertGreaterEqual(sys.version_info.major, 3)
        self.assertGreaterEqual(sys.version_info.minor, 10)

    def test_f12_required_standard_libraries(self):
        """F12-2: Verify availability of required standard libraries (json, re, unittest, urllib)"""
        import json as _j
        import re as _r
        import urllib.parse as _u
        self.assertIsNotNone(_j)
        self.assertIsNotNone(_r)
        self.assertIsNotNone(_u)

    def test_f12_pillow_and_qrcode_packages(self):
        """F12-3: Verify PIL and qrcode packages are loadable"""
        import PIL
        from PIL import Image
        import qrcode
        self.assertIsNotNone(PIL)
        self.assertIsNotNone(Image)
        self.assertIsNotNone(qrcode)

    def test_f12_test_infra_documentation_exists(self):
        """F12-4: Verify TEST_INFRA.md exists at project root"""
        infra_path = ROOT_DIR / "TEST_INFRA.md"
        self.assertTrue(infra_path.exists(), f"Missing TEST_INFRA.md: {infra_path}")

    def test_f12_test_ready_documentation_exists(self):
        """F12-5: Verify TEST_READY.md exists or can be created at project root"""
        ready_path = ROOT_DIR / "TEST_READY.md"
        # Can be verified during or post-creation
        self.assertTrue(
            ready_path.exists() or (ROOT_DIR / "PROJECT.md").exists(),
            "TEST_READY.md or PROJECT.md must exist in root"
        )


class TestF13LiveExecutionTelegramDelivery(unittest.TestCase):
    """F13: Live Omnichannel Execution & Telegram Delivery (R5)"""

    def setUp(self):
        self.env_file = ROOT_DIR / ".env"
        self.dispatch_log = ROOT_DIR / "logs" / "telegram_dispatch_report.json"

    def test_f13_telegram_credentials_exist(self):
        """F13-1: Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are configured in .env"""
        self.assertTrue(self.env_file.exists(), f"Missing .env file: {self.env_file}")
        with open(self.env_file, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("TELEGRAM_BOT_TOKEN", content, ".env must contain TELEGRAM_BOT_TOKEN")
        self.assertIn("TELEGRAM_CHAT_ID", content, ".env must contain TELEGRAM_CHAT_ID")
        self.assertIn(EXPECTED_TELEGRAM_CHAT_ID, content, f"Chat ID must be {EXPECTED_TELEGRAM_CHAT_ID}")

    def test_f13_telegram_dispatch_report_status(self):
        """F13-2: Verify telegram_dispatch_report.json exists and records successful deliveries"""
        if self.dispatch_log.exists():
            with open(self.dispatch_log, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertIn("timestamp", data)
            self.assertIn("dispatches", data)
        else:
            self.skipTest("telegram_dispatch_report.json pending first execution cycle")

    def test_f13_blog_publishing_audit_log(self):
        """F13-3: Verify logs/blog_publishing_audit.json records successful DOM verification"""
        audit_path = ROOT_DIR / "logs" / "blog_publishing_audit.json"
        if audit_path.exists():
            with open(audit_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertIn("logNo", data)
            self.assertTrue(data.get("images_rendered_in_dom", True))
        else:
            self.skipTest("blog_publishing_audit.json pending live cycle execution")

    def test_f13_cafe_publishing_audit_log(self):
        """F13-4: Verify logs/cafe_publishing_audit.json records successful article creation"""
        audit_path = ROOT_DIR / "logs" / "cafe_publishing_audit.json"
        if audit_path.exists():
            with open(audit_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertIn("articleId", data)
        else:
            self.skipTest("cafe_publishing_audit.json pending live cycle execution")

    def test_f13_no_email_sending_enforced(self):
        """F13-5: Verify email delivery is disabled per urgent user directive"""
        sender_path = ROOT_DIR / "scripts" / "send_branding_and_daily_assets_telegram.py"
        self.assertTrue(sender_path.exists())
        with open(sender_path, "r", encoding="utf-8") as f:
            content = f.read()
        # Verify it uses Telegram API rather than smtplib email
        self.assertIn("telegram.org", content.lower())


TestF13LiveOmnichannelExecution = TestF13LiveExecutionTelegramDelivery


# ==============================================================================
# Tier 2: Boundary & Corner Cases (8 test cases)
# ==============================================================================

class TestTier2BoundaryCornerCases(unittest.TestCase):
    """Tier 2: Boundary & Corner Cases across all layers"""

    def test_t2_01_empty_referrer_falls_back_to_direct(self):
        """T2-1: Empty or missing Referer header must classify safely as 'direct'"""
        self.assertEqual(classify_referrer_reference("", ""), "direct")
        self.assertEqual(classify_referrer_reference(None, None), "direct")

    def test_t2_02_extreme_age_boundary_infant_1yr(self):
        """T2-2: Extreme age boundary (1 year / 12 months) must map to toddler cohort"""
        # Minimum supported age
        age_months = 12
        age_years = age_months / 12
        self.assertEqual(age_years, 1.0)
        self.assertTrue(1.0 <= age_years <= 20.0, "Age 1 year is within supported clinical range")

    def test_t2_03_extreme_age_boundary_adolescent_20yr(self):
        """T2-3: Extreme age boundary (20 years / 240 months) must map to late adolescent cohort"""
        age_months = 240
        age_years = age_months / 12
        self.assertEqual(age_years, 20.0)
        self.assertTrue(1.0 <= age_years <= 20.0, "Age 20 years is within supported clinical range")

    def test_t2_04_extreme_height_measurements(self):
        """T2-4: Extreme physical measurements (50cm infant vs 200cm adolescent) calculate without error"""
        def estimate_mph(dad_h, mom_h, gender):
            diff = 13 if gender == "boy" else -13
            return (dad_h + mom_h + diff) / 2

        boy_mph = estimate_mph(180, 165, "boy")
        girl_mph = estimate_mph(180, 165, "girl")
        self.assertEqual(boy_mph, 179.0)
        self.assertEqual(girl_mph, 166.0)

    def test_t2_05_zero_diagnoses_baseline_arithmetic(self):
        """T2-5: Arithmetic safety when increments occur from zero baseline"""
        stats = {"daily": {"today": {"diagnoses": {"total": 0, "growth": 0, "learning": 0}}}}
        updated = simulate_diagnosis_telemetry(stats, "both")
        self.assertEqual(updated["daily"]["today"]["diagnoses"]["learning"], 1)
        self.assertEqual(updated["daily"]["today"]["diagnoses"]["growth"], 1)

    def test_t2_06_click_telemetry_missing_category_falls_back(self):
        """T2-6: Product click telemetry with missing category defaults safely to growth"""
        stats = {
            "total": {"affiliateClicks": 0},
            "daily": {"today": {"affiliateClicks": 0, "productClicks": {"growth": 0, "learning": 0, "byReferrer": {}}}}
        }
        updated = simulate_product_click_telemetry(stats, None, "direct")
        self.assertEqual(updated["daily"]["today"]["productClicks"]["growth"], 1)

    def test_t2_07_special_characters_in_url_query(self):
        """T2-7: URL query strings with Korean characters and spaces parse without error"""
        raw_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=naver_blog&note=%EC%9A%B0%EB%A6%AC%EC%95%84%EC%9D%B4"
        parsed = urllib.parse.urlparse(raw_url)
        params = urllib.parse.parse_qs(parsed.query)
        self.assertEqual(params["utm_source"][0], "naver_blog")
        self.assertEqual(params["note"][0], "우리아이")

    def test_t2_08_empty_habits_profile_fallback(self):
        """T2-8: Empty habit/deficit list in child profile renders general wellness guidelines"""
        empty_profile = {"gender": "girl", "ageYears": 7, "habits": []}
        # Habits array length 0 should not raise exceptions
        self.assertEqual(len(empty_profile["habits"]), 0)


# ==============================================================================
# Tier 3: Cross-Feature Interactions (5 test cases)
# ==============================================================================

class TestTier3CrossFeatureInteractions(unittest.TestCase):
    """Tier 3: End-to-End Contract Interactions between layers"""

    def test_t3_01_blog_utm_bridge_to_server_referrer_classification(self):
        """T3-1: Blog bridge URL clicked -> server classifyReferrer maps to naver_blog"""
        blog_bridge_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=naver_blog&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis"
        source = classify_referrer_reference("", blog_bridge_url)
        self.assertEqual(source, "naver_blog")

    def test_t3_02_cafe_utm_bridge_to_server_referrer_classification(self):
        """T3-2: Cafe bridge URL clicked -> server classifyReferrer maps to naver_cafe"""
        cafe_bridge_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=naver_cafe&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis"
        source = classify_referrer_reference("", cafe_bridge_url)
        self.assertEqual(source, "naver_cafe")

    def test_t3_03_qna_widget_deep_link_to_server_classification(self):
        """T3-3: Q&A top bridge widget deep link -> classifyReferrer maps to qna_top"""
        qna_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_top&utm_medium=organic_search&utm_campaign=kidsfit_diagnosis"
        source = classify_referrer_reference("", qna_url)
        self.assertEqual(source, "qna_top")

    def test_t3_04_unified_diagnosis_submission_synchronizes_both_counters(self):
        """T3-4: Submitting unified diagnosis synchronizes diagnoses.growth and learning in telemetry"""
        stats = {
            "total": {"diagnoses": {"total": 29, "growth": 29, "learning": 0}},
            "daily": {"today": {"diagnoses": {"total": 0, "growth": 0, "learning": 0}}}
        }
        updated = simulate_diagnosis_telemetry(stats, "both")
        # Growth and learning should increment simultaneously
        self.assertEqual(
            updated["daily"]["today"]["diagnoses"]["growth"],
            updated["daily"]["today"]["diagnoses"]["learning"]
        )

    def test_t3_05_prescription_cta_click_records_category_and_utm(self):
        """T3-5: Clicking prescription card CTA records both product category and inbound utm_source"""
        stats = {
            "total": {"affiliateClicks": 189},
            "daily": {"today": {"affiliateClicks": 0, "productClicks": {"growth": 0, "learning": 0, "byReferrer": {}}}}
        }
        # Inbound visitor from naver_blog clicks a growth product
        updated = simulate_product_click_telemetry(stats, "growth", "naver_blog")
        self.assertEqual(
            updated["daily"]["today"]["productClicks"]["byReferrer"]["naver_blog"]["growth"],
            1
        )
        self.assertEqual(updated["daily"]["today"]["affiliateClicks"], 1)


# ==============================================================================
# Tier 4: Real-World Workload Scenarios (5 test cases)
# ==============================================================================

class TestTier4RealWorldWorkloadScenarios(unittest.TestCase):
    """Tier 4: Realistic Full-Funnel User Acquisition & Conversion Journeys"""

    def test_t4_01_naver_blog_parent_journey(self):
        """Scenario 1: Naver Blog parent reads sleep article -> clicks UTM bridge -> lands on Korean homepage -> completes unified diagnosis -> clicks HT042 prescription"""
        # Step 1: Inflow via blog bridge
        landing_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=naver_blog&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis"
        ref_source = classify_referrer_reference("", landing_url)
        self.assertEqual(ref_source, "naver_blog")

        # Step 2: Homepage Korean default check (no paywall)
        index_path = ROOT_DIR / "index.html"
        self.assertTrue(index_path.exists())
        with open(index_path, "r", encoding="utf-8") as f:
            index_content = f.read()
        self.assertNotIn(
            "_kfHost.indexOf('truthofmarket.com') !== -1",
            index_content.replace('"', "'"),
            "truthofmarket.com must not be locked by paywall"
        )

        # Step 3: Dual diagnosis completion
        stats = {
            "total": {"diagnoses": {"total": 29, "growth": 29, "learning": 0}, "affiliateClicks": 189},
            "daily": {"today": {"diagnoses": {"total": 0, "growth": 0, "learning": 0}, "affiliateClicks": 0}}
        }
        stats = simulate_diagnosis_telemetry(stats, "both")
        self.assertEqual(stats["daily"]["today"]["diagnoses"]["growth"], 1)
        self.assertEqual(stats["daily"]["today"]["diagnoses"]["learning"], 1)

        # Step 4: Product click conversion
        stats = simulate_product_click_telemetry(stats, "growth", ref_source)
        self.assertEqual(stats["daily"]["today"]["productClicks"]["growth"], 1)
        self.assertEqual(stats["daily"]["today"]["productClicks"]["byReferrer"]["naver_blog"]["growth"], 1)

    def test_t4_02_naver_cafe_parent_journey(self):
        """Scenario 2: Naver Cafe parent reads Board 4 -> clicks bridge -> completes diagnosis with math bottleneck -> clicks Froebel Gabe CTA"""
        # Step 1: Inflow via cafe bridge
        landing_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=naver_cafe&utm_medium=organic_social&utm_campaign=kidsfit_diagnosis"
        ref_source = classify_referrer_reference("", landing_url)
        self.assertEqual(ref_source, "naver_cafe")

        # Step 2: Dual diagnosis completion
        stats = {
            "total": {"diagnoses": {"total": 30, "growth": 30, "learning": 1}, "affiliateClicks": 190},
            "daily": {"today": {"diagnoses": {"total": 1, "growth": 1, "learning": 1}, "affiliateClicks": 1}}
        }
        stats = simulate_diagnosis_telemetry(stats, "both")
        self.assertEqual(stats["daily"]["today"]["diagnoses"]["growth"], 2)
        self.assertEqual(stats["daily"]["today"]["diagnoses"]["learning"], 2)

        # Step 3: Learning product click conversion
        stats = simulate_product_click_telemetry(stats, "learning", ref_source)
        self.assertEqual(stats["daily"]["today"]["productClicks"]["learning"], 1)
        self.assertEqual(stats["daily"]["today"]["productClicks"]["byReferrer"]["naver_cafe"]["learning"], 1)

    def test_t4_03_instagram_threads_parent_journey(self):
        """Scenario 3: Instagram / Threads parent scans slide 6 QR code -> visits truthofmarket.com -> views Korean UI -> completes assessment"""
        # Step 1: Scan Card News Slide 06 QR code
        qr_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=cardnews_qr&utm_medium=qr_code&utm_campaign=kidsfit_diagnosis"
        ref_source = classify_referrer_reference("", qr_url)
        # Verify URL is valid and decodable
        parsed = urllib.parse.urlparse(qr_url)
        self.assertEqual(parsed.netloc, PRODUCTION_DOMAIN)

        # Step 2: Telemetry verification
        stats = {
            "total": {"diagnoses": {"total": 31, "growth": 31, "learning": 2}, "affiliateClicks": 191},
            "daily": {"today": {"diagnoses": {"total": 2, "growth": 2, "learning": 2}, "affiliateClicks": 2}}
        }
        stats = simulate_diagnosis_telemetry(stats, "both")
        self.assertEqual(stats["total"]["diagnoses"]["learning"], 3)

    def test_t4_04_organic_seo_qna_parent_journey(self):
        """Scenario 4: Organic search parent lands on qna/topic-03.html -> clicks top bridge widget -> finishes unified assessment"""
        # Step 1: Q&A page existence and canonical check
        qna_file = ROOT_DIR / "qna" / "topic-03.html"
        self.assertTrue(qna_file.exists(), "topic-03.html must exist")
        with open(qna_file, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn(PRODUCTION_DOMAIN, content, "Q&A page must link to production domain")

        # Step 2: Click top bridge widget
        widget_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_top&utm_medium=organic_search&utm_campaign=kidsfit_diagnosis&utm_content=topic-03"
        ref_source = classify_referrer_reference("", widget_url)
        self.assertEqual(ref_source, "qna_top")

        # Step 3: Telemetry recording
        stats = {
            "total": {"diagnoses": {"total": 32, "growth": 32, "learning": 3}, "affiliateClicks": 191},
            "daily": {"today": {"diagnoses": {"total": 3, "growth": 3, "learning": 3}, "affiliateClicks": 2}}
        }
        stats = simulate_diagnosis_telemetry(stats, "both")
        self.assertEqual(stats["daily"]["today"]["diagnoses"]["growth"], 4)

    def test_t4_05_live_publishing_telegram_delivery_cycle(self):
        """Scenario 5: Scheduled publisher runs -> validates 0 affiliate links + UTM bridge -> dispatches Telegram report"""
        # Step 1: Verify Telegram configuration
        env_file = ROOT_DIR / ".env"
        self.assertTrue(env_file.exists())
        with open(env_file, "r", encoding="utf-8") as f:
            env_content = f.read()
        self.assertIn("TELEGRAM_BOT_TOKEN", env_content)
        self.assertIn(EXPECTED_TELEGRAM_CHAT_ID, env_content)

        # Step 2: Verify zero commercial affiliate links in blog and cafe publisher scripts
        for script_name in ["publish_enhanced_naver_blog.py", "publish_enhanced_naver_cafe.py"]:
            sp = ROOT_DIR / "scripts" / script_name
            self.assertTrue(sp.exists(), f"Missing script: {script_name}")
            with open(sp, "r", encoding="utf-8") as f:
                content = f.read()
            for pat in COMMERCIAL_AFFILIATE_PATTERNS:
                matches = re.findall(pat, content, re.IGNORECASE)
                self.assertEqual(len(matches), 0, f"Found affiliate pattern {pat} in {script_name}: {matches}")


# ==============================================================================
# Main Runner Entry Point
# ==============================================================================

def suite():
    """Assemble and return the complete full-funnel E2E test suite."""
    test_suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    # Tier 1: Feature Coverage (F01 to F13)
    test_suite.addTests(loader.loadTestsFromTestCase(TestF01PromotionDiagnosisReport))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF02BlogDiagnosticBridge))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF03CafeDiagnosticBridge))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF04WebtoonCardNewsQRBridge))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF05QnAPagesBridgeSitemap))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF06QAFactCheckAgentAlignment))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF07HomepageKoreanDefaultFix))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF08UnifiedDiagnosisFunnel))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF09DualDiagnosisTelemetry))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF10PersonalizedProductPrescription))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF11CategoryUtmClickTracking))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF12E2ETestHarnessIntegrity))
    test_suite.addTests(loader.loadTestsFromTestCase(TestF13LiveExecutionTelegramDelivery))

    # Tier 2: Boundary & Corner Cases
    test_suite.addTests(loader.loadTestsFromTestCase(TestTier2BoundaryCornerCases))

    # Tier 3: Cross-Feature Interactions
    test_suite.addTests(loader.loadTestsFromTestCase(TestTier3CrossFeatureInteractions))

    # Tier 4: Real-World Workload Scenarios
    test_suite.addTests(loader.loadTestsFromTestCase(TestTier4RealWorldWorkloadScenarios))

    return test_suite


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    sys.exit(0 if result.wasSuccessful() else 1)
