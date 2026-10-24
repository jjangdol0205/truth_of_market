#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/update_qna_pages.py
Updates all 31 SEO Q&A landing pages in qna/:
1. Replaces legacy domain kidsfit.co.kr with truthofmarket.com across all tags (canonical, og:url, og:image, links)
2. Injects / updates Top 1-Click Diagnostic Bridge Widget (utm_source=qna_top)
3. Injects / updates Bottom 1-Click Diagnostic Bridge Widget (utm_source=qna_bottom)
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
QNA_DIR = ROOT_DIR / "qna"
PRODUCTION_DOMAIN = "truthofmarket.com"
LEGACY_DOMAIN = "kidsfit.co.kr"

def process_file(html_file: Path):
    content = html_file.read_text(encoding="utf-8")
    slug = html_file.stem  # e.g., topic-01, index, post-seq-001

    # 1. Domain replacements
    content = content.replace(f"https://{LEGACY_DOMAIN}", f"https://{PRODUCTION_DOMAIN}")
    content = content.replace(f"http://{LEGACY_DOMAIN}", f"https://{PRODUCTION_DOMAIN}")

    top_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}"
    bottom_url = f"https://{PRODUCTION_DOMAIN}/?utm_source=qna_bottom&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}"

    # 2. Top Bridge Widget
    # Look for top banner or inject right inside <div class="wrap">
    top_widget_html = f"""<!-- TOP 1-CLICK DIAGNOSTIC BRIDGE WIDGET -->
    <div class="diagnostic-bridge-top-widget" style="background:linear-gradient(135deg,#EEF2FF 0%,#F0FDF4 100%);border:2px solid #6366F1;border-radius:16px;padding:0.9rem 1.1rem;margin-bottom:1.1rem;box-shadow:0 4px 14px rgba(99,102,241,0.12);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.6rem;">
        <div>
          <div style="font-size:0.8rem;font-weight:900;color:#4338CA;margin-bottom:0.2rem;">⚡ 회원가입 0초 · 질병관리청 &amp; K-DST 기준 1분 맞춤 리포트 발급</div>
          <div style="font-size:1.02rem;font-weight:900;color:#0F172A;">내 아이 예상키 + 두뇌·학습 골든타임 1분 무료 진단</div>
        </div>
        <a href="{top_url}" style="background:#4F46E5;color:#FFFFFF;text-decoration:none;font-weight:900;font-size:0.88rem;padding:0.55rem 1.1rem;border-radius:12px;box-shadow:0 4px 12px rgba(79,70,229,0.25);white-space:nowrap;">1-Click 무료 진단 시작 →</a>
      </div>
      <div style="margin-top:0.55rem;padding-top:0.55rem;border-top:1px dashed #C7D2FE;display:flex;flex-wrap:wrap;gap:0.35rem;align-items:center;">
        <span style="font-size:0.75rem;font-weight:800;color:#4B5563;">연령별 빠른 진단:</span>
        <a href="https://{PRODUCTION_DOMAIN}/?preset=infant_1&amp;utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:800;color:#1E293B;text-decoration:none;">🍼 만 1세</a>
        <a href="https://{PRODUCTION_DOMAIN}/?preset=toddler_2_3&amp;utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:800;color:#1E293B;text-decoration:none;">👶 만 2~3세</a>
        <a href="https://{PRODUCTION_DOMAIN}/?preset=child_4_5&amp;utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:800;color:#1E293B;text-decoration:none;">🧒 만 4~5세</a>
        <a href="https://{PRODUCTION_DOMAIN}/?preset=elem_low&amp;utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:800;color:#1E293B;text-decoration:none;">👧 초등 저학년</a>
        <a href="https://{PRODUCTION_DOMAIN}/?preset=elem_high&amp;utm_source=qna_top&amp;utm_medium=organic_search&amp;utm_campaign=kidsfit_diagnosis&amp;utm_content={slug}" style="background:#FFFFFF;border:1px solid #C7D2FE;border-radius:999px;padding:0.2rem 0.6rem;font-size:0.75rem;font-weight:800;color:#1E293B;text-decoration:none;">👦 초등 고학년</a>
      </div>
    </div>"""

    # If old preset div exists, replace it; otherwise inject before first <article or after nav
    if '<div style="background:linear-gradient(135deg,#EEF2FF 0%,#F0FDF4 100%);border:1.5px solid #A5B4FC;' in content:
        # replace existing banner
        pattern = r'<div style="background:linear-gradient\(135deg,#EEF2FF 0%,#F0FDF4 100%\);border:1\.5px solid #A5B4FC;.*?</div>\s*</div>'
        content = re.sub(pattern, top_widget_html, content, count=1, flags=re.DOTALL)
    elif "diagnostic-bridge-top" not in content and "utm_source=qna_top" not in content:
        if "<article" in content:
            content = content.replace("<article", f"{top_widget_html}\n    <article", 1)
        elif '<div class="wrap">' in content:
            content = content.replace('<div class="wrap">', f'<div class="wrap">\n    {top_widget_html}', 1)
        elif '<main' in content:
            content = re.sub(r'(<main[^>]*>)', rf'\1\n    {top_widget_html}', content, count=1)

    # 3. Bottom Bridge Widget
    bottom_widget_html = f"""<!-- BOTTOM 1-CLICK DIAGNOSTIC BRIDGE WIDGET -->
    <div class="diagnostic-bridge-bottom-widget" style="background:#FFFFFF;border:2px solid #4F46E5;border-radius:20px;padding:1.4rem 1.3rem;box-shadow:0 8px 24px rgba(79,70,229,0.12);margin-top:1.2rem;margin-bottom:1.2rem;">
      <span style="display:inline-block;background:#EEF2FF;color:#4F46E5;font-size:0.78rem;font-weight:900;padding:0.24rem 0.75rem;border-radius:9999px;margin-bottom:0.5rem;">🔬 질병관리청(KDCA) 2017 성장도표 &amp; 보건복지부 K-DST 기준</span>
      <h3 style="font-size:1.15rem;font-weight:900;color:#0F172A;margin:0 0 0.4rem;line-height:1.4;">우리 아이 잠재 성장키 + 두뇌 학습 5대 역량 1분 무료 정밀 진단</h3>
      <p style="font-size:0.88rem;color:#475569;margin:0 0 0.9rem;line-height:1.55;">질병관리청 소아청소년 백분위 성장도표 및 펜필드 뇌지도 기준 1:1 맞춤 정밀 리포트를 회원가입 없이 즉시 확인하세요.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.6rem;margin-bottom:1rem;">
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.75rem;">
          <div style="font-size:0.8rem;font-weight:900;color:#1D4ED8;">📏 신체 성장 3단 진단</div>
          <div style="font-size:0.75rem;color:#64748B;margin-top:0.2rem;">현재 키 백분위 · 예상키 · 성장판 골든타임</div>
        </div>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:0.75rem;">
          <div style="font-size:0.8rem;font-weight:900;color:#059669;">🧠 5대 두뇌 역량(LQ)</div>
          <div style="font-size:0.75rem;color:#64748B;margin-top:0.2rem;">작업기억 · 어휘력 · 메타인지 · 수면 루틴</div>
        </div>
      </div>
      <a href="{bottom_url}" style="display:block;text-align:center;background:#1D4ED8;color:#FFFFFF;text-decoration:none;font-weight:900;font-size:0.98rem;padding:0.9rem 1.2rem;border-radius:14px;box-shadow:0 6px 18px rgba(29,78,216,0.22);">👉 내 아이 1분 무료 정밀 진단 리포트 발급받기 →</a>
    </div>"""

    if "diagnostic-bridge-bottom" not in content and "utm_source=qna_bottom" not in content:
        # Update existing cta-btn inside article if present
        content = re.sub(
            r'<a href="/\?mode=growth" class="cta-btn">',
            f'<a href="{bottom_url}" class="cta-btn">',
            content
        )
        # Inject bottom widget before related questions card or closing wrap
        if '<div class="card">' in content and "</article>" in content:
            # Inject right before the next card after article
            content = content.replace("</article>\n    <div class=\"card\">", f"</article>\n    {bottom_widget_html}\n    <div class=\"card\">")
            content = content.replace("</article>\r\n    <div class=\"card\">", f"</article>\r\n    {bottom_widget_html}\r\n    <div class=\"card\">")
        elif "</div>\n</body>" in content:
            content = content.replace("</div>\n</body>", f"  {bottom_widget_html}\n  </div>\n</body>")
        elif "</div>\r\n</body>" in content:
            content = content.replace("</div>\r\n</body>", f"  {bottom_widget_html}\r\n  </div>\r\n</body>")
        elif "</body>" in content:
            content = content.replace("</body>", f"  {bottom_widget_html}\n</body>")

    html_file.write_text(content, encoding="utf-8")
    print(f"Updated: {html_file.name}")

def main():
    html_files = sorted(list(QNA_DIR.glob("*.html")))
    print(f"Found {len(html_files)} HTML files in {QNA_DIR}")
    for hf in html_files:
        process_file(hf)
    print("All Q&A pages updated successfully!")

if __name__ == "__main__":
    main()
