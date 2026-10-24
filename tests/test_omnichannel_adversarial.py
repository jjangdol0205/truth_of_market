#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests/test_omnichannel_adversarial.py
Adversarial Challenge & Stress Test Suite for Omnichannel Inflow Bridges,
QA Fact-Check Agent, and Publishing Pipeline.

Authored by: challenger_omnichannel (critic, specialist)
Roles: EMPIRICAL CHALLENGER
"""

import os
import sys
import re
import json
import unittest
import urllib.parse
from pathlib import Path
import numpy as np
import cv2

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

PRODUCTION_DOMAIN = "truthofmarket.com"
LEGACY_DOMAIN = "kidsfit.co.kr"


def load_image_unicode(p: Path):
    """Loads image safely across Unicode/Korean paths on Windows"""
    if not p.exists():
        return None
    try:
        data = np.fromfile(str(p), dtype=np.uint8)
        return cv2.imdecode(data, cv2.IMREAD_COLOR)
    except Exception:
        return None


def decode_qr_code(image_path: Path) -> tuple[str, str]:
    """Decodes QR code from image path using OpenCV QRCodeDetector with crop fallback"""
    if not image_path.exists():
        return "", f"FILE_NOT_FOUND: {image_path}"
    img = load_image_unicode(image_path)
    if img is None:
        return "", f"CANNOT_READ: {image_path}"
    
    detector = cv2.QRCodeDetector()
    val, _, _ = detector.detectAndDecode(img)
    if val:
        return val, "SUCCESS_FULL"
    
    # Try crop bottom half / bottom right where callout QR is placed
    h, w = img.shape[:2]
    crop_bottom = img[int(h * 0.5):, :]
    val, _, _ = detector.detectAndDecode(crop_bottom)
    if val:
        return val, "SUCCESS_CROP_BOTTOM"

    crop_br = img[int(h * 0.5):, int(w * 0.5):]
    val, _, _ = detector.detectAndDecode(crop_br)
    if val:
        return val, "SUCCESS_CROP_BR"

    return "", "NO_QR_DETECTED"


class TestLegacyDomainLeaks(unittest.TestCase):
    """
    Challenge 1: Are there ANY remaining instances of legacy domain kidsfit.co.kr
    in Blog/Cafe publishing scripts, Webtoon/Card News copy, Q&A landing pages, or sitemap?
    """

    def test_cname_files_do_not_contain_legacy_domain(self):
        """Verify CNAME and dist/CNAME point strictly to truthofmarket.com, not kidsfit.co.kr"""
        cname_paths = [ROOT_DIR / "CNAME", ROOT_DIR / "dist" / "CNAME"]
        for cp in cname_paths:
            if cp.exists():
                content = cp.read_text(encoding="utf-8").strip()
                self.assertNotIn(
                    LEGACY_DOMAIN,
                    content,
                    f"CRITICAL LEAK: {cp} contains legacy domain '{LEGACY_DOMAIN}'! Must be '{PRODUCTION_DOMAIN}'."
                )
                self.assertEqual(
                    content,
                    PRODUCTION_DOMAIN,
                    f"{cp} must equal '{PRODUCTION_DOMAIN}', found '{content}'"
                )

    def test_sitemaps_do_not_contain_legacy_domain(self):
        """Verify sitemap.xml and dist/sitemap.xml do not contain kidsfit.co.kr"""
        sitemaps = [ROOT_DIR / "sitemap.xml", ROOT_DIR / "dist" / "sitemap.xml"]
        for sm in sitemaps:
            if sm.exists():
                content = sm.read_text(encoding="utf-8")
                self.assertNotIn(
                    LEGACY_DOMAIN,
                    content,
                    f"LEAK: {sm} contains legacy domain '{LEGACY_DOMAIN}'"
                )
                self.assertIn(
                    f"https://{PRODUCTION_DOMAIN}/",
                    content,
                    f"{sm} must contain production domain https://{PRODUCTION_DOMAIN}/"
                )

    def test_qna_landing_pages_do_not_contain_legacy_domain(self):
        """Verify all qna/*.html pages do not contain kidsfit.co.kr"""
        qna_dir = ROOT_DIR / "qna"
        qna_files = list(qna_dir.glob("*.html"))
        self.assertGreater(len(qna_files), 0, "No Q&A pages found in qna/")
        leaking_pages = []
        for qp in qna_files:
            content = qp.read_text(encoding="utf-8")
            if LEGACY_DOMAIN.lower() in content.lower():
                leaking_pages.append(qp.name)
        self.assertEqual(
            leaking_pages,
            [],
            f"LEAK: Found legacy domain '{LEGACY_DOMAIN}' in Q&A pages: {leaking_pages}"
        )

    def test_feed_json_does_not_contain_legacy_domain(self):
        """Verify feed.json does not syndicate legacy domain kidsfit.co.kr"""
        feed_path = ROOT_DIR / "feed.json"
        if feed_path.exists():
            content = feed_path.read_text(encoding="utf-8")
            self.assertNotIn(
                LEGACY_DOMAIN,
                content,
                f"LEAK: feed.json contains legacy domain '{LEGACY_DOMAIN}'"
            )

    def test_webtoon_copy_files_do_not_contain_legacy_domain(self):
        """Verify webtoon copy text files in 웹툰_모음/ do not contain kidsfit.co.kr"""
        webtoon_dir = ROOT_DIR / "웹툰_모음"
        if not webtoon_dir.exists():
            self.skipTest("웹툰_모음 directory not found")
        
        txt_files = list(webtoon_dir.glob("**/*.txt"))
        leaks = []
        for tf in txt_files:
            content = tf.read_text(encoding="utf-8", errors="replace")
            if LEGACY_DOMAIN.lower() in content.lower():
                leaks.append(str(tf.relative_to(ROOT_DIR)))
        
        self.assertEqual(
            leaks,
            [],
            f"LEAK: Webtoon copy files contain legacy domain '{LEGACY_DOMAIN}': {leaks}"
        )

    def test_cardnews_copy_files_do_not_contain_legacy_domain(self):
        """Verify card news copy text files in 카드뉴스_모음/ do not contain kidsfit.co.kr"""
        cardnews_dir = ROOT_DIR / "카드뉴스_모음"
        if not cardnews_dir.exists():
            self.skipTest("카드뉴스_모음 directory not found")

        txt_files = list(cardnews_dir.glob("**/*.txt"))
        leaks = []
        for tf in txt_files:
            content = tf.read_text(encoding="utf-8", errors="replace")
            if LEGACY_DOMAIN.lower() in content.lower():
                leaks.append(str(tf.relative_to(ROOT_DIR)))

        self.assertEqual(
            leaks,
            [],
            f"LEAK: Card news copy files contain legacy domain '{LEGACY_DOMAIN}': {leaks}"
        )

    def test_insta_threads_profile_copy_does_not_contain_legacy_domain(self):
        """Verify 인스타_쓰레드_프로필_모음/ copy text does not contain kidsfit.co.kr"""
        profile_dir = ROOT_DIR / "인스타_쓰레드_프로필_모음"
        if not profile_dir.exists():
            self.skipTest("인스타_쓰레드_프로필_모음 directory not found")

        txt_files = list(profile_dir.glob("**/*.txt"))
        leaks = []
        for tf in txt_files:
            content = tf.read_text(encoding="utf-8", errors="replace")
            if LEGACY_DOMAIN.lower() in content.lower():
                leaks.append(str(tf.relative_to(ROOT_DIR)))

        self.assertEqual(
            leaks,
            [],
            f"LEAK: Instagram/Threads profile copy files contain legacy domain '{LEGACY_DOMAIN}': {leaks}"
        )

    def test_blog_cafe_archives_do_not_contain_legacy_domain(self):
        """Verify archived 네이버블로그_글모음 and 네이버카페_글모음 do not contain kidsfit.co.kr"""
        blog_dir = ROOT_DIR / "네이버블로그_글모음"
        cafe_dir = ROOT_DIR / "네이버카페_글모음"

        leaks = []
        for d in [blog_dir, cafe_dir]:
            if d.exists():
                for tf in d.glob("**/*.txt"):
                    content = tf.read_text(encoding="utf-8", errors="replace")
                    if LEGACY_DOMAIN.lower() in content.lower():
                        leaks.append(str(tf.relative_to(ROOT_DIR)))

        self.assertEqual(
            leaks,
            [],
            f"LEAK: Blog/Cafe post archives contain legacy domain '{LEGACY_DOMAIN}': {leaks}"
        )

    def test_active_publishing_scripts_do_not_contain_legacy_domain(self):
        """Verify active publishing scripts do not reference kidsfit.co.kr"""
        active_scripts = [
            ROOT_DIR / "scripts" / "publish_enhanced_naver_blog.py",
            ROOT_DIR / "scripts" / "publish_enhanced_naver_cafe.py",
            ROOT_DIR / "scripts" / "generate_webtoon_and_cardnews_packs.py",
            ROOT_DIR / "scripts" / "send_branding_and_daily_assets_telegram.py",
            ROOT_DIR / "scripts" / "unified_parenting_scheduler_daemon.py",
            ROOT_DIR / "scripts" / "qa_fact_check_agent.py",
        ]
        leaks = []
        for s in active_scripts:
            if s.exists():
                content = s.read_text(encoding="utf-8")
                # Exclude definitions like LEGACY_DOMAIN = "kidsfit.co.kr" used for checking
                lines = content.splitlines()
                for idx, line in enumerate(lines, 1):
                    if LEGACY_DOMAIN in line and "LEGACY_DOMAIN" not in line and "kidsfit.co.kr" not in line.replace(f'"{LEGACY_DOMAIN}"', ""):
                        leaks.append(f"{s.name}:{idx} -> {line.strip()}")

        self.assertEqual(
            leaks,
            [],
            f"LEAK: Active publishing scripts contain legacy domain: {leaks}"
        )


class TestCommercialAffiliateLeaks(unittest.TestCase):
    """
    Challenge 2: Can any commercial affiliate codes (AF7865143, A100708867)
    leak into external blog or cafe posts?
    """

    def setUp(self):
        self.banned_codes = ["AF7865143", "A100708867", "4d31d3", "lptag=", "click.linkprice.com", "link.coupang.com"]

    def test_active_publishers_contain_no_hardcoded_affiliate_links(self):
        """Verify enhanced publishers contain 0 hardcoded affiliate codes"""
        scripts = [
            ROOT_DIR / "scripts" / "publish_enhanced_naver_blog.py",
            ROOT_DIR / "scripts" / "publish_enhanced_naver_cafe.py",
            ROOT_DIR / "scripts" / "generate_webtoon_and_cardnews_packs.py",
            ROOT_DIR / "scripts" / "send_branding_and_daily_assets_telegram.py",
        ]
        for s in scripts:
            content = s.read_text(encoding="utf-8")
            for code in self.banned_codes:
                self.assertNotIn(
                    code,
                    content.replace('"AF" + "7865143"', "").replace('"A100" + "708867"', "").replace('"4d3" + "1d3"', "").replace('"lptag" + "="', "").replace('"linkprice" + ".com"', ""),
                    f"Direct affiliate code '{code}' found in {s.name}"
                )

    def test_blog_validation_rejects_adversarial_affiliate_injections(self):
        """Test validate_blog_content rigorously catches adversarial affiliate injections"""
        from scripts.publish_enhanced_naver_blog import validate_blog_content, DEEP_PARENTING_TOPICS

        topic = DEEP_PARENTING_TOPICS[0]
        dummy_img = ROOT_DIR / "samples" / "enhanced_blog_images" / "blog_001_1_thumbnail.png"
        img_paths = [str(dummy_img), str(dummy_img), str(dummy_img)]

        # Payload with Coupang partners code
        adversarial_body = topic["body"] + "\n추천인: AF7865143\n"
        is_valid, issues = validate_blog_content(
            title=topic["title"],
            body=adversarial_body,
            image_paths=img_paths,
            category=topic["category"]
        )
        self.assertFalse(is_valid, "validate_blog_content must reject body with AF7865143")
        self.assertTrue(any("affiliate" in iss.lower() for iss in issues))

        # Payload with Linkprice code
        adversarial_body2 = topic["body"] + "\n제휴코드 A100708867 등록\n"
        is_valid2, issues2 = validate_blog_content(
            title=topic["title"],
            body=adversarial_body2,
            image_paths=img_paths,
            category=topic["category"]
        )
        self.assertFalse(is_valid2, "validate_blog_content must reject body with A100708867")


class TestBridgeURLAndUTMParameters(unittest.TestCase):
    """
    Challenge 3: Do all bridge URLs have valid syntax and correct UTM parameters?
    """

    def setUp(self):
        from scripts.publish_enhanced_naver_blog import (
            BLOG_DIAGNOSTIC_BRIDGE_URL,
            BLOG_DIAGNOSTIC_BRIDGE_QR_URL
        )
        from scripts.publish_enhanced_naver_cafe import (
            CAFE_DIAGNOSTIC_BRIDGE_URL,
            CAFE_DIAGNOSTIC_BRIDGE_QR_URL
        )
        from scripts.generate_webtoon_and_cardnews_packs import (
            WEBTOON_QR_URL,
            CARDNEWS_QR_URL,
            THREADS_BRIDGE_URL,
            INSTAGRAM_BRIDGE_URL
        )
        from scripts.send_branding_and_daily_assets_telegram import INSTAGRAM_BIO_URL

        self.url_map = {
            "blog_bridge": BLOG_DIAGNOSTIC_BRIDGE_URL,
            "blog_qr": BLOG_DIAGNOSTIC_BRIDGE_QR_URL,
            "cafe_bridge": CAFE_DIAGNOSTIC_BRIDGE_URL,
            "cafe_qr": CAFE_DIAGNOSTIC_BRIDGE_QR_URL,
            "webtoon_qr": WEBTOON_QR_URL,
            "cardnews_qr": CARDNEWS_QR_URL,
            "threads_bridge": THREADS_BRIDGE_URL,
            "instagram_bridge": INSTAGRAM_BRIDGE_URL,
            "instagram_bio": INSTAGRAM_BIO_URL,
        }

    def test_all_bridge_urls_target_production_domain(self):
        """Verify all bridge URLs strictly target https://truthofmarket.com/"""
        for name, url_str in self.url_map.items():
            parsed = urllib.parse.urlparse(url_str)
            self.assertEqual(parsed.scheme, "https", f"{name} must use HTTPS scheme")
            self.assertEqual(parsed.netloc, PRODUCTION_DOMAIN, f"{name} netloc must be {PRODUCTION_DOMAIN}")
            self.assertNotIn(LEGACY_DOMAIN, url_str, f"{name} must not contain legacy {LEGACY_DOMAIN}")

    def test_all_bridge_urls_have_valid_utm_parameters(self):
        """Verify all bridge URLs contain well-formed utm_source, utm_medium, utm_campaign"""
        for name, url_str in self.url_map.items():
            parsed = urllib.parse.urlparse(url_str)
            params = urllib.parse.parse_qs(parsed.query)

            self.assertIn("utm_source", params, f"{name} missing utm_source")
            self.assertIn("utm_medium", params, f"{name} missing utm_medium")
            self.assertIn("utm_campaign", params, f"{name} missing utm_campaign")

            self.assertEqual(params["utm_campaign"][0], "kidsfit_diagnosis")
            self.assertGreater(len(params["utm_source"][0]), 0)
            self.assertGreater(len(params["utm_medium"][0]), 0)

    def test_qna_bridge_widgets_urls_valid(self):
        """Verify 31 Q&A pages have valid UTM bridge widget deep-links"""
        qna_dir = ROOT_DIR / "qna"
        qna_files = list(qna_dir.glob("topic-*.html"))
        self.assertGreaterEqual(len(qna_files), 10)

        for qp in qna_files:
            content = qp.read_text(encoding="utf-8")
            self.assertIn(f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_top", content, f"{qp.name} missing qna_top link")
            self.assertIn(f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_bottom", content, f"{qp.name} missing qna_bottom link")


class TestQRCodeDecodabilityEmpirical(unittest.TestCase):
    """
    Challenge 4: Do the generated QR codes actually encode valid truthofmarket.com URLs with UTM tags?
    Empirically decoded using OpenCV cv2.QRCodeDetector!
    """

    def test_blog_checklist_qr_code_decodes_correctly(self):
        """Verify Blog Image 3 (checklist infographic) QR code decodes to truthofmarket.com with UTM"""
        from scripts.publish_enhanced_naver_blog import DEEP_PARENTING_TOPICS, generate_all_blog_images

        # Generate fresh blog images
        imgs = generate_all_blog_images(DEEP_PARENTING_TOPICS[0], seq_num=777)
        img3_path = Path(imgs[2])

        decoded_val, status = decode_qr_code(img3_path)
        
        # Cleanup
        for p in imgs:
            if Path(p).exists():
                Path(p).unlink()

        self.assertTrue(status.startswith("SUCCESS"), f"Blog img 3 QR decode status: {status}")
        self.assertTrue(decoded_val.startswith(f"https://{PRODUCTION_DOMAIN}/"), f"Decoded QR '{decoded_val}' must start with production domain")
        self.assertIn("utm_source=naver_blog_qr", decoded_val)
        self.assertIn("utm_medium=qr_code", decoded_val)

    def test_cafe_card_qr_code_decodes_correctly(self):
        """Verify Cafe summary card QR code decodes to truthofmarket.com with UTM"""
        from scripts.publish_enhanced_naver_cafe import generate_cafe_card_png

        test_card = ROOT_DIR / "samples" / "enhanced_blog_images" / "test_adv_cafe_qr.png"
        generate_cafe_card_png(
            out_path=test_card,
            board_badge="[테스트] 키즈핏 가이드",
            title="소근육 발달과 조기 교육의 진실",
            points=["포인트 1: 일상 감각 자극", "포인트 2: 서파수면 10시 루틴", "포인트 3: 하브루타 대화"]
        )

        decoded_val, status = decode_qr_code(test_card)
        if test_card.exists():
            test_card.unlink()

        self.assertTrue(status.startswith("SUCCESS"), f"Cafe card QR decode status: {status}")
        self.assertTrue(decoded_val.startswith(f"https://{PRODUCTION_DOMAIN}/"), f"Decoded QR '{decoded_val}' must start with production domain")
        self.assertIn("utm_source=naver_cafe_qr", decoded_val)
        self.assertIn("utm_medium=qr_code", decoded_val)

    def test_webtoon_cut_4_qr_code_decodes_correctly(self):
        """Verify Webtoon Cut 4 QR code decodes to truthofmarket.com with UTM"""
        cut4_path = ROOT_DIR / "웹툰_모음" / "1화_만3세소근육민감기_웹툰" / "04_4컷.png"
        if not cut4_path.exists():
            self.skipTest(f"{cut4_path} not found")

        decoded_val, status = decode_qr_code(cut4_path)
        self.assertTrue(status.startswith("SUCCESS"), f"Webtoon cut 4 QR decode status: {status}")
        self.assertTrue(decoded_val.startswith(f"https://{PRODUCTION_DOMAIN}/"), f"Decoded QR '{decoded_val}' must start with production domain")
        self.assertIn("utm_source=instagram_webtoon_qr", decoded_val)

    def test_cardnews_slide_6_qr_code_decodes_correctly(self):
        """Verify Card News Slide 6 QR code decodes to truthofmarket.com with UTM"""
        slide6_path = ROOT_DIR / "카드뉴스_모음" / "1탄_만3세고집과소근육발달_카드뉴스" / "06_카드뉴스_6장.png"
        if not slide6_path.exists():
            self.skipTest(f"{slide6_path} not found")

        decoded_val, status = decode_qr_code(slide6_path)
        self.assertTrue(status.startswith("SUCCESS"), f"Card news slide 6 QR decode status: {status}")
        self.assertTrue(decoded_val.startswith(f"https://{PRODUCTION_DOMAIN}/"), f"Decoded QR '{decoded_val}' must start with production domain")
        self.assertIn("utm_source=cardnews_qr", decoded_val)


class TestQAFactCheckAgentVulnerabilities(unittest.TestCase):
    """
    Challenge 5: Does scripts/qa_fact_check_agent.py catch defective posts
    missing UTM bridge links or containing forbidden affiliate links?
    """

    def setUp(self):
        from scripts.qa_fact_check_agent import audit_pre_publish
        self.audit_pre_publish = audit_pre_publish

    def test_qa_agent_catches_missing_diagnostic_bridge_in_pre_publish(self):
        """
        STRESS TEST / ADVERSARIAL PROBE:
        Does audit_pre_publish set is_valid = False when a post is MISSING the UTM bridge link?
        """
        post_missing_bridge = {
            "type": "blog",
            "title": "정상적인 소아 성장 칼럼 제목",
            "body": "질병관리청(KDCA) 2017 소아청소년 성장도표에 따르면 아이 키 성장은 수면과 영양이 중요합니다. " * 35, # >1500 chars
            "images": ["samples/enhanced_blog_images/blog_001_1_thumbnail.png"] * 3,
            "category": "우리 아이 키성장·성조숙증"
        }

        is_valid, sanitized, issues = self.audit_pre_publish(post_missing_bridge)
        # An adversarial check: A defective post missing the required bridge link MUST NOT pass QA!
        bridge_issue_reported = any("diagnostic bridge" in iss for iss in issues)
        self.assertTrue(bridge_issue_reported, "QA Agent must report an issue when diagnostic bridge link is missing")
        
        # PROBE: Is is_valid actually set to False?
        # If is_valid is True despite the missing bridge link, that is a QA bypass vulnerability!
        self.assertFalse(
            is_valid,
            "VULNERABILITY DETECTED: audit_pre_publish returned is_valid=True despite missing required diagnostic bridge link! "
            "Defective post bypassed Stage 1 QA check."
        )

    def test_qa_agent_catches_affiliate_links_and_flags_defect(self):
        """
        STRESS TEST / ADVERSARIAL PROBE:
        When a draft contains a forbidden affiliate link (AF7865143), does audit_pre_publish flag it as defective?
        """
        post_with_affiliate = {
            "type": "blog",
            "title": "소아 성장 칼럼",
            "body": "질병관리청 KDCA 2017 성장도표 안내입니다. 쿠팡 파트너스 AF7865143 https://link.coupang.com/a/test " + ("내용입니다. " * 200) + f" https://{PRODUCTION_DOMAIN}/?utm_source=naver_blog",
            "images": ["samples/enhanced_blog_images/blog_001_1_thumbnail.png"] * 3,
            "category": "우리 아이 키성장·성조숙증"
        }

        is_valid, sanitized, issues = self.audit_pre_publish(post_with_affiliate)
        affiliate_issue_reported = any("affiliate" in iss.lower() for iss in issues)
        self.assertTrue(affiliate_issue_reported, "QA Agent must report affiliate issue")
        # Ensure sanitized body does not have affiliate code
        self.assertNotIn("AF7865143", sanitized["body"])
        self.assertNotIn("link.coupang.com", sanitized["body"])

    def test_qa_agent_catches_legacy_domain_and_flags_defect(self):
        """
        STRESS TEST / ADVERSARIAL PROBE:
        When a draft contains legacy domain kidsfit.co.kr, does audit_pre_publish flag it?
        """
        post_with_legacy = {
            "type": "blog",
            "title": "소아 성장 칼럼",
            "body": f"질병관리청 KDCA 2017 성장도표 안내입니다. https://{LEGACY_DOMAIN}/qna/topic-01.html " + ("내용입니다. " * 200) + f" https://{PRODUCTION_DOMAIN}/?utm_source=naver_blog",
            "images": ["samples/enhanced_blog_images/blog_001_1_thumbnail.png"] * 3,
            "category": "우리 아이 키성장·성조숙증"
        }

        is_valid, sanitized, issues = self.audit_pre_publish(post_with_legacy)
        legacy_issue_reported = any(LEGACY_DOMAIN in iss for iss in issues)
        self.assertTrue(legacy_issue_reported, f"QA Agent must report {LEGACY_DOMAIN} issue")
        # Ensure sanitized body replaced legacy domain
        self.assertNotIn(LEGACY_DOMAIN, sanitized["body"])


if __name__ == "__main__":
    unittest.main()
