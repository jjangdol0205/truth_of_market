#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/restore_and_sync_truthofmarket.py
Restores and locks full-funnel kidsfit.co.kr domain unification, Q&A top/bottom bridges,
Korean default homepage configuration, and unified diagnosis telemetry across all scripts and assets.
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fix_publisher_and_qa_scripts():
    # 1. publish_enhanced_naver_blog.py
    blog_py = ROOT / "scripts" / "publish_enhanced_naver_blog.py"
    if blog_py.exists():
        txt = blog_py.read_text(encoding="utf-8")
        txt = txt.replace('PRODUCTION_DOMAIN = "kidsfit.co.kr"', 'PRODUCTION_DOMAIN = "kidsfit.co.kr"')
        txt = txt.replace('ROOT = Path(r"d:\\키즈핏")', 'ROOT = Path(__file__).resolve().parent.parent')
        blog_py.write_text(txt, encoding="utf-8")

    # 2. publish_enhanced_naver_cafe.py
    cafe_py = ROOT / "scripts" / "publish_enhanced_naver_cafe.py"
    if cafe_py.exists():
        txt = cafe_py.read_text(encoding="utf-8")
        txt = txt.replace('PRODUCTION_DOMAIN = "kidsfit.co.kr"', 'PRODUCTION_DOMAIN = "kidsfit.co.kr"')
        txt = txt.replace('ROOT = Path(r"d:\\키즈핏")', 'ROOT = Path(__file__).resolve().parent.parent')
        cafe_py.write_text(txt, encoding="utf-8")

    # 3. send_branding_and_daily_assets_telegram.py
    tg_py = ROOT / "scripts" / "send_branding_and_daily_assets_telegram.py"
    if tg_py.exists():
        txt = tg_py.read_text(encoding="utf-8")
        txt = txt.replace('PRODUCTION_DOMAIN = "kidsfit.co.kr"', 'PRODUCTION_DOMAIN = "kidsfit.co.kr"')
        txt = txt.replace("https://kidsfit.co.kr", "https://kidsfit.co.kr")
        txt = txt.replace("kidsfit.co.kr", "kidsfit.co.kr")
        if "utm_source=instagram" not in txt:
            txt = txt.replace("utm_source=instagram_bio", "utm_source=instagram")
        tg_py.write_text(txt, encoding="utf-8")

    # 4. qa_fact_check_agent.py
    qa_py = ROOT / "scripts" / "qa_fact_check_agent.py"
    if qa_py.exists():
        txt = qa_py.read_text(encoding="utf-8")
        txt = txt.replace('PRODUCTION_DOMAIN = "kidsfit.co.kr"', 'PRODUCTION_DOMAIN = "kidsfit.co.kr"')
        txt = txt.replace(
            "const hasBridge = links.some(l => l.includes('kidsfit.co.kr') && l.includes('utm_source'));",
            "const hasBridge = links.some(l => l.includes('kidsfit.co.kr') && l.includes('utm_source'));"
        )
        qa_py.write_text(txt, encoding="utf-8")

    # 5. Also update generator scripts that might overwrite Q&A or sitemap
    for script_name in [
        "update_qna_pages.py",
        "apply_alphamale_cclass_and_advisor_daemon.py",
        "auto_seo_promotion_engine.py",
        "omni_channel_promotion_engine.py",
    ]:
        sp = ROOT / "scripts" / script_name
        if sp.exists():
            stxt = sp.read_text(encoding="utf-8")
            stxt = stxt.replace("https://kidsfit.co.kr", "https://kidsfit.co.kr")
            stxt = stxt.replace("'kidsfit.co.kr'", "'kidsfit.co.kr'")
            stxt = stxt.replace('"kidsfit.co.kr"', '"kidsfit.co.kr"')
            sp.write_text(stxt, encoding="utf-8")


def fix_cname_and_sitemap():
    cname = ROOT / "CNAME"
    cname.write_text("kidsfit.co.kr\n", encoding="utf-8")

    for sm_rel in ["sitemap.xml", "dist/sitemap.xml", "rss.xml", "feed.json"]:
        sm = ROOT / sm_rel
        if sm.exists():
            txt = sm.read_text(encoding="utf-8")
            txt = txt.replace("https://kidsfit.co.kr", "https://kidsfit.co.kr")
            txt = txt.replace("kidsfit.co.kr", "kidsfit.co.kr")
            sm.write_text(txt, encoding="utf-8")


TOP_BRIDGE_HTML = """<!-- diagnostic-bridge-top -->
<div class="diagnostic-bridge-top" style="background:linear-gradient(135deg,#EEF2FF 0%,#F0FDF4 100%);border:1.5px solid #A5B4FC;border-radius:16px;padding:0.9rem 1rem;margin-bottom:1.1rem;">
  <div style="font-size:0.82rem;font-weight:900;color:#3730A3;margin-bottom:0.5rem;">⚡ 내 아이 연령대 1초 빠른 무료 진단 바로가기 (클릭 시 즉시 계산)</div>
  <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
    <a href="https://kidsfit.co.kr/?preset=infant_1&amp;utm_source=qna_top&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.32rem 0.72rem;font-size:0.78rem;font-weight:800;color:#1E293B;text-decoration:none;">🍼 만 1세(12~23개월)</a>
    <a href="https://kidsfit.co.kr/?preset=toddler_2_3&amp;utm_source=qna_top&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.32rem 0.72rem;font-size:0.78rem;font-weight:800;color:#1E293B;text-decoration:none;">👶 만 2~3세 소근육·성장</a>
    <a href="https://kidsfit.co.kr/?preset=child_4_5&amp;utm_source=qna_top&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.32rem 0.72rem;font-size:0.78rem;font-weight:800;color:#1E293B;text-decoration:none;">🧒 만 4~5세 편식·가베</a>
    <a href="https://kidsfit.co.kr/?preset=elem_low&amp;utm_source=qna_top&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.32rem 0.72rem;font-size:0.78rem;font-weight:800;color:#1E293B;text-decoration:none;">👧 초등 저학년(7~9세)</a>
    <a href="https://kidsfit.co.kr/?preset=elem_high&amp;utm_source=qna_top&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.32rem 0.72rem;font-size:0.78rem;font-weight:800;color:#1E293B;text-decoration:none;">👦 초등 고학년(10~13세)</a>
  </div>
</div>
"""

BOTTOM_BRIDGE_HTML = """<!-- diagnostic-bridge-bottom -->
<div class="diagnostic-bridge-bottom" style="margin:24px 0;padding:22px;border-radius:18px;background:linear-gradient(135deg,#1E3A8A 0%,#312E81 100%);color:#FFFFFF;text-align:center;">
  <div style="font-size:1.05rem;font-weight:900;margin-bottom:8px;">📊 우리 아이 키 백분위 &amp; 5대 두뇌학습역량(LQ) 1분 통합 무료 진단</div>
  <p style="margin:0 0 14px 0;font-size:0.88rem;color:#E0E7FF;">질병관리청(KDCA) 성장도표와 보건복지부 K-DST 기준 맞춤 리포트를 지금 바로 확인하세요.</p>
  <a href="https://kidsfit.co.kr/?mode=both&amp;utm_source=qna_bottom&amp;utm_medium=seo_qna&amp;utm_campaign=kidsfit_diagnosis" style="display:inline-block;background:#10B981;color:#FFFFFF;font-weight:900;font-size:0.95rem;padding:12px 24px;border-radius:999px;text-decoration:none;">🚀 1분 통합 진단 무료 시작하기 →</a>
</div>
"""


def fix_qna_pages():
    for qna_folder in [ROOT / "qna", ROOT / "dist" / "qna"]:
        if not qna_folder.exists():
            continue
        for hf in qna_folder.glob("*.html"):
            txt = hf.read_text(encoding="utf-8")
            txt = txt.replace("https://kidsfit.co.kr", "https://kidsfit.co.kr")
            txt = txt.replace("'kidsfit.co.kr'", "'kidsfit.co.kr'")
            txt = txt.replace('"kidsfit.co.kr"', '"kidsfit.co.kr"')

            if "utm_source=qna_top" not in txt and "diagnostic-bridge-top" not in txt:
                if "<body" in txt:
                    txt = re.sub(r"(<body[^>]*>)", r"\1\n" + TOP_BRIDGE_HTML, txt, count=1)
                else:
                    txt = TOP_BRIDGE_HTML + "\n" + txt

            if "utm_source=qna_bottom" not in txt and "diagnostic-bridge-bottom" not in txt:
                if "</body>" in txt:
                    txt = txt.replace("</body>", BOTTOM_BRIDGE_HTML + "\n</body>")
                else:
                    txt = txt + "\n" + BOTTOM_BRIDGE_HTML

            hf.write_text(txt, encoding="utf-8")


def fix_frontend_files():
    # 1. src/js/global-paywall-edition.js
    paywall_js = ROOT / "src" / "js" / "global-paywall-edition.js"
    if paywall_js.exists():
        txt = paywall_js.read_text(encoding="utf-8")
        # Remove host.indexOf('kidsfit.co.kr') !== -1 from paywall trigger
        txt = re.sub(
            r"if\s*\(\s*host\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1\s*\)\s*return\s+true;",
            "// Primary domain kidsfit.co.kr defaults to Korean free edition unless ?edition=global is passed",
            txt
        )
        # Default fallback in isGlobalPaidEdition() should be false unless edition=global or paywall=1
        txt = txt.replace(
            "        if (search.indexOf('edition=global') !== -1 || search.indexOf('paywall=1') !== -1) return true;\n        // Primary domain kidsfit.co.kr defaults to Korean free edition unless ?edition=global is passed\n      }\n      return true;",
            "        if (search.indexOf('edition=global') !== -1 || search.indexOf('paywall=1') !== -1) return true;\n        // Primary domain kidsfit.co.kr defaults to Korean free edition unless ?edition=global is passed\n      }\n      return false;"
        )
        paywall_js.write_text(txt, encoding="utf-8")

    # 2. src/js/i18n.js
    i18n_js = ROOT / "src" / "js" / "i18n.js"
    if i18n_js.exists():
        txt = i18n_js.read_text(encoding="utf-8")
        txt = re.sub(
            r"host\.indexOf\(['\"]truthofmarket\.com['\"]\)\s*!==\s*-1",
            "host.indexOf('en.kidsfit.co.kr') !== -1",
            txt
        )
        i18n_js.write_text(txt, encoding="utf-8")

    # 3. src/css/style.css
    style_css = ROOT / "src" / "css" / "style.css"
    if style_css.exists():
        txt = style_css.read_text(encoding="utf-8")
        txt = re.sub(
            r"\.wizard-mode-growth\s+\.mode-learning-field\s*\{\s*display:\s*none\s*!important;\s*\}",
            "/* Unified 1-Stop Growth + Learning funnel: both fields active */\n.wizard-mode-growth .mode-learning-field { display: block; }",
            txt
        )
        style_css.write_text(txt, encoding="utf-8")

    # 4. src/js/onboarding-wizard.js
    wizard_js = ROOT / "src" / "js" / "onboarding-wizard.js"
    if wizard_js.exists():
        txt = wizard_js.read_text(encoding="utf-8")
        if "/api/visit" not in txt:
            telemetry_snippet = """
    // Dispatch unified diagnosis completion telemetry to /api/visit & /api/user-cohort
    try {
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        const urlParams = new URLSearchParams(window.location.search || '');
        const utmSource = urlParams.get('utm_source') || 'direct';
        window.fetch('/api/visit', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'diagnosis',
            mode: 'both',
            preferredReportMode: 'both',
            utm_source: utmSource
          })
        }).catch(function () {});
        window.fetch('/api/user-cohort', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferredReportMode: 'both',
            utm_source: utmSource
          })
        }).catch(function () {});
      }
    } catch (_) {}
"""
            # Inject right before completeOnboarding(profile) or onComplete
            if "if (typeof onCompleteCallback === 'function')" in txt:
                txt = txt.replace(
                    "if (typeof onCompleteCallback === 'function')",
                    telemetry_snippet + "\n    if (typeof onCompleteCallback === 'function')"
                )
            else:
                txt += "\n" + telemetry_snippet
            wizard_js.write_text(txt, encoding="utf-8")


if __name__ == "__main__":
    fix_publisher_and_qa_scripts()
    fix_cname_and_sitemap()
    fix_qna_pages()
    fix_frontend_files()
    print("[OK] Restored full-funnel kidsfit.co.kr configuration and Q&A bridges.")
