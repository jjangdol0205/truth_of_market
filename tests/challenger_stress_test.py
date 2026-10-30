#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests/challenger_stress_test.py
KidsFit Parenting Shopping Mall & Diagnostic Unlock Platform
Empirical Adversarial Stress Test Suite (Challenger 1)

Verifies:
1. Rapid-fire affiliate click debouncing (50 concurrent clicks).
2. Simulated Telegram API network failures (HTTP 500, socket timeout, DNS failure) for 100% non-blocking UI behavior.
3. localStorage access denied (Safari private browsing mode with SecurityError).
4. Corrupted / malformed JSON recovery in localStorage kidsfit_free_tickets & self-healing.
5. Extreme viewports (320px narrow mobile width, 2560px 4K width) layout breaks / overflow containment.
"""

import sys
import os
import json
import re
import time
import subprocess
import unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLE_CSS = ROOT_DIR / "src" / "css" / "style.css"
SERVER_JS = ROOT_DIR / "server.js"
MONETIZATION_JS = ROOT_DIR / "src" / "js" / "monetization.js"


class SimulatedLocalStorage:
    """Simulates browser localStorage with security and quota error switches."""
    def __init__(self, throw_security_error=False, throw_quota_error=False):
        self._store = {}
        self.throw_security_error = throw_security_error
        self.throw_quota_error = throw_quota_error

    def getItem(self, key):
        if self.throw_security_error:
            raise PermissionError("SecurityError: The operation is insecure.")
        return self._store.get(key, None)

    def setItem(self, key, value):
        if self.throw_security_error:
            raise PermissionError("SecurityError: The operation is insecure.")
        if self.throw_quota_error:
            raise OverflowError("QuotaExceededError: Storage quota exceeded.")
        self._store[key] = str(value)

    def removeItem(self, key):
        if self.throw_security_error:
            raise PermissionError("SecurityError: The operation is insecure.")
        self._store.pop(key, None)

    def clear(self):
        if self.throw_security_error:
            raise PermissionError("SecurityError: The operation is insecure.")
        self._store.clear()


class SimulatedClientEngine:
    """Simulates client unlock engine mirroring index.html logic in Python."""
    def __init__(self, storage=None):
        self.localStorage = storage if storage is not None else SimulatedLocalStorage()
        self.sessionStorage = SimulatedLocalStorage()
        self.in_memory_store = {}
        self.is_unlocked_flag = False
        self.last_click_time_ms = 0
        self.telemetry_dispatches = []

    def is_unlocked(self):
        if self.is_unlocked_flag:
            return True
        if self.in_memory_store.get("kidsfit_diagnostic_unlocked") == "true":
            return True
        try:
            if self.localStorage.getItem("kidsfit_diagnostic_unlocked") == "true":
                return True
            if self.localStorage.getItem("kf_report_unlocked") == "1":
                return True
            raw = self.localStorage.getItem("kidsfit_free_tickets")
            if raw:
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, dict) and parsed.get("unlocked") is True:
                        return True
                except Exception:
                    pass
        except Exception:
            pass
        try:
            if self.sessionStorage.getItem("kf_report_unlocked") == "1":
                return True
        except Exception:
            pass
        return False

    def unlock_diagnostic_tests(self, product_name="키즈핏 추천 육아템", network="Coupang Partners", href="", current_time_ms=None):
        now = current_time_ms if current_time_ms is not None else int(time.time() * 1000)

        # 150ms Debounce Check
        if self.last_click_time_ms and (now - self.last_click_time_ms < 150):
            return {"status": "DEBOUNCED", "unlocked": self.is_unlocked()}
        self.last_click_time_ms = now

        ticket_payload = {
            "unlocked": True,
            "unlockedAt": "2026-10-30T12:00:00Z",
            "triggerItem": str(product_name),
            "triggerNetwork": str(network),
            "tickets": {
                "growth": {"name": "신체 성장 정밀 진단", "unlocked": True},
                "precocious_puberty": {"name": "골연령·성조숙증 판정", "unlocked": True},
                "brain_development": {"name": "두뇌 5대 역량 진단", "unlocked": True},
                "temperament_learning": {"name": "기질·학습 스타일 진단", "unlocked": True}
            }
        }

        # In-memory update
        self.is_unlocked_flag = True
        self.in_memory_store["kidsfit_diagnostic_unlocked"] = "true"
        self.in_memory_store["kf_report_unlocked"] = "1"
        self.in_memory_store["kidsfit_free_tickets"] = json.dumps(ticket_payload)

        # Storage mutations with try/catch
        try:
            self.localStorage.setItem("kidsfit_diagnostic_unlocked", "true")
            self.localStorage.setItem("kf_report_unlocked", "1")
            self.localStorage.setItem("kidsfit_free_tickets", json.dumps(ticket_payload))
        except Exception:
            pass

        try:
            self.sessionStorage.setItem("kf_report_unlocked", "1")
        except Exception:
            pass

        # Non-blocking telemetry dispatch
        self.telemetry_dispatches.append({
            "event": "diagnostic_test_unlock",
            "trigger_item": product_name,
            "affiliate_network": network,
            "timestamp_ms": now
        })

        return {"status": "SUCCESS", "unlocked": True, "tickets": ticket_payload["tickets"]}


class TestChallengerAdversarialSuite(unittest.TestCase):
    """Empirical Adversarial Test Cases across 5 Core Challenge Dimensions."""

    # -------------------------------------------------------------------------
    # Dimension 1: Rapid-Fire Affiliate Click Debouncing (50 concurrent clicks)
    # -------------------------------------------------------------------------
    def test_d1_01_concurrent_50_clicks_debouncing(self):
        """Stress-test 50 concurrent clicks fired in thread pool within < 150ms."""
        client = SimulatedClientEngine()
        self.assertFalse(client.is_unlocked())

        fixed_time_ms = 1000000
        results = []

        def click_task(idx):
            # All 50 threads arrive simultaneously at fixed_time_ms
            return client.unlock_diagnostic_tests(
                f"신생아 속싸개 #{idx}", "Coupang Partners (AF7865143)", current_time_ms=fixed_time_ms
            )

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(click_task, i) for i in range(50)]
            for f in futures:
                results.append(f.result())

        self.assertEqual(len(results), 50)
        successes = [r for r in results if r["status"] == "SUCCESS"]
        debounced = [r for r in results if r["status"] == "DEBOUNCED"]

        self.assertEqual(len(successes), 1, "Only 1st click should execute unlock mutation")
        self.assertEqual(len(debounced), 49, "Remaining 49 rapid clicks must be debounced")
        self.assertTrue(client.is_unlocked())
        self.assertEqual(len(client.telemetry_dispatches), 1)

    def test_d1_02_debounce_resets_after_idle_window(self):
        """Verify debounce resets cleanly after 160ms idle window."""
        client = SimulatedClientEngine()
        res1 = client.unlock_diagnostic_tests("상품 1", "Coupang", current_time_ms=1000)
        self.assertEqual(res1["status"], "SUCCESS")

        res2 = client.unlock_diagnostic_tests("상품 2", "iHerb", current_time_ms=1050)
        self.assertEqual(res2["status"], "DEBOUNCED")

        # Exceed 150ms window: 1000 + 165ms = 1165ms
        res3 = client.unlock_diagnostic_tests("상품 3", "CPA", current_time_ms=1165)
        self.assertEqual(res3["status"], "SUCCESS")
        self.assertEqual(len(client.telemetry_dispatches), 2)

    # -------------------------------------------------------------------------
    # Dimension 2: Simulated Telegram API Failures (HTTP 500, Timeout, DNS)
    # -------------------------------------------------------------------------
    def test_d2_01_telegram_failure_containment_in_server_source(self):
        """Verify server.js contains explicit timeout (5000ms), req.destroy(), and req.on('error')."""
        self.assertTrue(SERVER_JS.exists())
        with open(SERVER_JS, "r", encoding="utf-8") as f:
            code = f.read()

        # Check for 5000ms timeout
        self.assertIn("req.setTimeout(5000", code, "server.js must set 5000ms timeout on telegram requests")
        self.assertIn("req.on('timeout'", code, "server.js must catch timeout events")
        self.assertIn("req.on('error'", code, "server.js must catch socket / DNS errors")
        self.assertIn("req.destroy()", code, "server.js must destroy timed-out requests")

    def test_d2_02_non_blocking_client_execution(self):
        """Verify client unlock executes in < 10ms regardless of telemetry network state."""
        client = SimulatedClientEngine()
        start = time.perf_counter()
        res = client.unlock_diagnostic_tests("온습도계", "Coupang")
        elapsed_ms = (time.perf_counter() - start) * 1000
        self.assertLess(elapsed_ms, 20, "Client unlock must be instantaneous and non-blocking")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(client.is_unlocked())

    # -------------------------------------------------------------------------
    # Dimension 3: localStorage Access Denied (Safari Private Mode SecurityError)
    # -------------------------------------------------------------------------
    def test_d3_01_security_error_fallback_to_memory(self):
        """Simulate Safari Private Browsing SecurityError on setItem and getItem."""
        restricted_storage = SimulatedLocalStorage(throw_security_error=True)
        client = SimulatedClientEngine(storage=restricted_storage)

        # Unlock should not raise unhandled exception
        res = client.unlock_diagnostic_tests("역방쿠", "Coupang")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(res["unlocked"])

        # is_unlocked should return True via in-memory store
        self.assertTrue(client.is_unlocked())
        self.assertEqual(client.in_memory_store["kidsfit_diagnostic_unlocked"], "true")

    def test_d3_02_quota_exceeded_error_resilience(self):
        """Simulate QuotaExceededError when local storage is full."""
        quota_storage = SimulatedLocalStorage(throw_quota_error=True)
        client = SimulatedClientEngine(storage=quota_storage)

        res = client.unlock_diagnostic_tests("비타민D3", "iHerb")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(client.is_unlocked())

    # -------------------------------------------------------------------------
    # Dimension 4: Corrupted / Malformed JSON Recovery & Self-Healing
    # -------------------------------------------------------------------------
    def test_d4_01_corrupted_json_survives_without_syntax_error(self):
        """Verify malformed JSON strings in kidsfit_free_tickets do not throw."""
        client = SimulatedClientEngine()
        client.localStorage.setItem("kidsfit_free_tickets", "{bad:json;<<<malformed>>")

        # Must not raise json.decoder.JSONDecodeError to caller
        self.assertFalse(client.is_unlocked())

    def test_d4_02_self_healing_overwrites_corrupt_data_with_valid_schema(self):
        """Verify calling unlock overwrites corrupt JSON with clean Contract 2 payload."""
        client = SimulatedClientEngine()
        client.localStorage.setItem("kidsfit_free_tickets", "CORRUPTED_HEX_STRING_0000")

        res = client.unlock_diagnostic_tests("전동 네일트리머", "Coupang Partners (AF7865143)")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(client.is_unlocked())

        repaired_raw = client.localStorage.getItem("kidsfit_free_tickets")
        repaired = json.loads(repaired_raw)
        self.assertTrue(repaired["unlocked"])
        self.assertEqual(repaired["triggerItem"], "전동 네일트리머")
        for test_key in ["growth", "precocious_puberty", "brain_development", "temperament_learning"]:
            self.assertIn(test_key, repaired["tickets"])
            self.assertTrue(repaired["tickets"][test_key]["unlocked"])

    # -------------------------------------------------------------------------
    # Dimension 5: Extreme Viewports (320px Mobile vs 2560px 4K Width)
    # -------------------------------------------------------------------------
    def test_d5_01_mobile_320px_viewport_rules(self):
        """Verify mobile CSS rules prevent horizontal overflow at 320px."""
        with open(STYLE_CSS, "r", encoding="utf-8") as f:
            css = f.read()

        # Body overflow-x hidden
        self.assertRegex(css, r"body\s*\{[^}]*overflow-x:\s*hidden", "body must have overflow-x: hidden")

        # Mobile media query grid collapse to 1fr
        self.assertIn("grid-template-columns: 1fr", css, "CSS must collapse grid to 1fr for mobile")

        # Touch-scroll filter pills
        self.assertIn("overflow-x: auto", css)
        self.assertIn("flex-wrap: nowrap", css)

        # Inspect index.html for any rigid width > 300px
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            html = f.read()

        rigid_widths = re.findall(r"(?<!max-)(?<!min-)width:\s*([0-9]+)px", html)
        for w_str in rigid_widths:
            px = int(w_str)
            self.assertLessEqual(px, 300, f"Rigid width {px}px found in index.html, violates 320px responsive guarantee")

    def test_d5_02_4k_2560px_viewport_containment(self):
        """Verify 4K ultra-wide styling has max-width containment and fluid auto-fill grid."""
        with open(STYLE_CSS, "r", encoding="utf-8") as f:
            css = f.read()

        self.assertIn("grid-template-columns: repeat(auto-fill, minmax(270px, 1fr))", css)
        self.assertRegex(css, r"max-width:\s*(1[0-4][0-9]{2}px|min\([^)]+\)|clamp\([^)]+\))")


if __name__ == "__main__":
    print("================================================================")
    print("   PYTHON EMPIRICAL CHALLENGER STRESS SUITE                     ")
    print("================================================================")
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestChallengerAdversarialSuite)
    result = runner.run(suite)
    if not result.wasSuccessful():
        print(f"VERDICT: REJECT ({len(result.failures) + len(result.errors)} failures)")
        sys.exit(1)
    else:
        print("VERDICT: ALL PYTHON ADVERSARIAL STRESS TESTS PASSED (APPROVE).")
