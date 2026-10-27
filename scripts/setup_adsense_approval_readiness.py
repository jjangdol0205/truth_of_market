#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/setup_adsense_approval_readiness.py
Prepares https://kidsfit.co.kr for 100% Google AdSense Approval Readiness
based on 2026 Google AdSense Publisher Guidelines & Deposible (디파서블) AtoZ Approval Checklist:
1. Creates 4 mandatory E-E-A-T & Legal standalone pages:
   - /about.html (키즈핏 아동발달·성장 연구소 소개 및 편집 윤리 가이드라인)
   - /privacy.html (개인정보처리방침 — Google AdSense DoubleClick DART 쿠키 명시)
   - /terms.html (서비스 이용약관 및 의학적 면책 고지)
   - /contact.html (제휴 및 독자 문의하기)
2. Creates /qna/index.html (4대 카테고리별 전문 칼럼 아카이브 43선 디렉토리 허브)
   so Mediapartners-Google can crawl all 43 long-form articles within 1 click from index.html.
3. Updates robots.txt with explicit `User-agent: Mediapartners-Google` & `AdsBot-Google` Allow rules.
4. Injects crawlable Category Navigation & Legal Footer links into index.html and all qna/*.html pages.
5. Updates sitemap.xml to include /about.html, /privacy.html, /terms.html, /contact.html, and /qna/index.html.
"""

import re
import sys
from datetime import datetime
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
QNA_DIR = ROOT / "qna"


def build_common_layout(title: str, desc: str, canonical_path: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | 키즈핏(KidsFit) 아동발달·성장 연구소</title>
  <meta name="description" content="{desc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://kidsfit.co.kr{canonical_path}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <style>
    body {{ margin: 0; padding: 0; background: #F8FAFC; color: #0F172A; font-family: 'Pretendard Variable', Pretendard, -apple-system, sans-serif; line-height: 1.75; }}
    header.site-nav {{ background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 14px 20px; position: sticky; top: 0; z-index: 50; }}
    .nav-inner {{ max-width: 920px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }}
    .brand {{ font-weight: 900; font-size: 18px; color: #1D4ED8; text-decoration: none; }}
    .nav-links {{ display: flex; gap: 14px; flex-wrap: wrap; font-size: 14px; font-weight: 700; }}
    .nav-links a {{ color: #334155; text-decoration: none; }}
    .nav-links a:hover {{ color: #1D4ED8; }}
    main {{ max-width: 880px; margin: 28px auto 60px; padding: 0 18px; }}
    .card {{ background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04); margin-bottom: 24px; }}
    h1 {{ font-size: 26px; font-weight: 900; color: #0F172A; margin: 0 0 14px 0; line-height: 1.35; }}
    h2 {{ font-size: 19px; font-weight: 800; color: #1E3A8A; margin: 26px 0 10px 0; border-left: 4px solid #1D4ED8; padding-left: 10px; }}
    p, li {{ font-size: 15px; color: #334155; }}
    footer.site-footer {{ background: #0F172A; color: #94A3B8; padding: 36px 20px; font-size: 13.5px; }}
    .footer-inner {{ max-width: 920px; margin: 0 auto; }}
    .footer-links {{ display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 14px; }}
    .footer-links a {{ color: #E2E8F0; text-decoration: none; font-weight: 700; }}
  </style>
</head>
<body>
  <header class="site-nav">
    <div class="nav-inner">
      <a class="brand" href="https://kidsfit.co.kr/">📏 키즈핏(KidsFit) 아동발달·성장 연구소</a>
      <nav class="nav-links" aria-label="주요 메뉴">
        <a href="https://kidsfit.co.kr/">홈·무료진단</a>
        <a href="https://kidsfit.co.kr/qna/index.html">성장·두뇌 칼럼 아카이브(43선)</a>
        <a href="https://kidsfit.co.kr/qna/monthly-curation.html">월령별 맞춤 가이드</a>
        <a href="https://kidsfit.co.kr/qna/free-worksheets.html">무료 활동지</a>
        <a href="https://kidsfit.co.kr/about.html">연구소 소개</a>
      </nav>
    </div>
  </header>
  <main>
    {body_html}
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a href="https://kidsfit.co.kr/">홈으로</a>
        <a href="https://kidsfit.co.kr/qna/index.html">칼럼 전체보기</a>
        <a href="https://kidsfit.co.kr/about.html">연구소 소개 및 편집원칙</a>
        <a href="https://kidsfit.co.kr/privacy.html">개인정보처리방침</a>
        <a href="https://kidsfit.co.kr/terms.html">이용약관</a>
        <a href="https://kidsfit.co.kr/contact.html">문의하기</a>
      </div>
      <p style="margin:0;color:#64748B;">© 2026 KidsFit Growth &amp; Development Studio (kidsfit.co.kr). 본 사이트의 모든 콘텐츠는 질병관리청(KDCA) 2017 소아청소년 성장도표, K-DST 영유아발달선별검사 및 보건복지부 한국인 영양소 섭취기준(KDRIs) 공공데이터와 국제 학술논문 3,894편을 바탕으로 작성된 교육·정보 제공 목적의 자료입니다.</p>
    </div>
  </footer>
</body>
</html>
"""


def generate_legal_and_eeat_pages():
    # 1. /about.html
    about_body = """
    <article class="card">
      <h1>키즈핏(KidsFit) 아동발달·성장 연구소 소개 및 편집 윤리 가이드라인</h1>
      <p><strong>키즈핏(KidsFit, https://kidsfit.co.kr)</strong>은 대한민국 만 1세(생후 12개월)부터 만 18세(생후 216개월) 자녀를 둔 학부모님들께 과학적이고 객관적인 <strong>신체 성장(키·체중·자세·영양·수면)</strong> 및 <strong>두뇌·학습 발달(작업기억·문해력·메타인지·소근육)</strong> 가이드를 무상으로 제공하는 아동 발달 데이터 연구 플랫폼입니다.</p>

      <h2>1. 6대 국가 공인 공공데이터 및 3,894편 학술논문 기반 팩트체크 (E-E-A-T 원칙)</h2>
      <p>키즈핏의 모든 진단 알고리즘과 육아·교육 칼럼은 출처가 불분명한 속설이나 카더라 통신을 배제하고, 다음의 공인 기관 데이터와 동료 심사(Peer-Reviewed)를 거친 국내외 학술논문 3,894편을 교차 검증하여 작성됩니다.</p>
      <ul>
        <li><strong>질병관리청(KDCA) &amp; 대한소아과학회</strong>: 2017 소아청소년 표준 성장도표 LMS 백분위수 및 Z-Score 수식 적용</li>
        <li><strong>질병관리청 K-DST(영유아발달선별검사)</strong>: 대근육·소근육·인지·언어·사회성·자조 등 6대 핵심 발달 영역 월령별 루브릭</li>
        <li><strong>보건복지부 &amp; 한국영양학회</strong>: 2020 한국인 영양소 섭취기준(KDRIs) 연령·체중별 칼슘, 비타민D3, 아연, 마그네슘, 철분 권장섭취량</li>
        <li><strong>교육부 2022 개정 교육과정 &amp; 인지뇌과학</strong>: 전두엽 작업기억(Working Memory), 파인만 백지복습, 하브루타 질문독서 및 메타인지 학습법</li>
      </ul>

      <h2>2. 콘텐츠 작성 및 팩트체크 프로세스</h2>
      <p>키즈핏에 게시되는 모든 Q&amp;A 칼럼과 월령별 발달 리포트는 ① 한국 학부모의 실제 양육 고민 정의 → ② 소아내분비학·소아정형외과학·인지발달심리학 논문 근거 대조 → ③ 가정에서 비용 없이 오늘 저녁 바로 실천할 수 있는 구체적 행동 루틴 제시의 3단계 원칙을 준수합니다.</p>

      <h2>3. 의료적 면책 고지 (Medical Disclaimer)</h2>
      <p>본 웹사이트에서 제공하는 예상키 시뮬레이션, 발달 리포트 및 건강·영양 칼럼은 학부모의 올바른 양육 환경 조성을 돕기 위한 교육 및 참고 정보이며, 전문 의료인의 대면 진료·진단·처방을 대신할 수 없습니다. 자녀의 급격한 성장 지연, 성조숙증 의심 징후 또는 질환이 의심되는 경우 반드시 소아청소년과 전문의와 상담하시기 바랍니다.</p>
    </article>
    """
    (ROOT / "about.html").write_text(
        build_common_layout(
            "연구소 소개 및 편집 윤리 가이드라인",
            "질병관리청(KDCA) 성장도표, K-DST 발달검사 및 학술논문 3,894편을 기반으로 운영되는 키즈핏 아동발달·성장 연구소 소개 및 편집 원칙입니다.",
            "/about.html",
            about_body,
        ),
        encoding="utf-8",
    )

    # 2. /privacy.html (Explicit Google AdSense & DART Cookie Disclosure!)
    privacy_body = """
    <article class="card">
      <h1>개인정보처리방침 (Privacy Policy)</h1>
      <p>시행일자: 2026년 1월 1일 (최종 개정: 2026년 10월 28일)</p>
      <p><strong>키즈핏(KidsFit, 이하 '사이트', https://kidsfit.co.kr)</strong>은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 그리고 구글 애드센스(Google AdSense) 게시자 정책을 준수합니다.</p>

      <h2>1. 수집하는 개인정보 항목 및 처리 원칙</h2>
      <p>본 사이트는 별도의 회원가입 없이 무료로 이용할 수 있으며, 성장·발달 진단 시 입력하시는 자녀의 생년월일(월령), 성별, 키, 체중, 생활습관 정보는 이름·전화번호·주소 등 개인식별정보(PII) 없이 익명화된 통계 처리 목적으로만 활용됩니다.</p>

      <h2>2. 쿠키(Cookie)의 운용 및 구글 애드센스(Google AdSense) 광고 고지</h2>
      <ul>
        <li>Google을 포함한 제3자 광고 사업자는 쿠키(Cookie)를 사용하여 이용자가 본 사이트나 다른 웹사이트에 이전 방문한 기록을 바탕으로 맞춤형 광고를 게재할 수 있습니다.</li>
        <li>Google의 광고 쿠키(DoubleClick DART 쿠키 등) 사용으로 인해 Google 및 파트너사는 이용자의 본 사이트 및 인터넷상의 다른 사이트 방문 기록에 기반하여 적절한 광고를 제공할 수 있습니다.</li>
        <li>이용자는 언제든지 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">구글 광고 설정(Google Ads Settings)</a> 페이지에 접속하여 개인 맞춤형 광고를 해제(Opt-out)할 수 있으며, 또는 <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>를 방문하여 제3자 광고 사업자의 맞춤형 광고 쿠키 사용을 차단할 수 있습니다.</li>
      </ul>

      <h2>3. 로그 분석 및 제휴 링크 고지</h2>
      <p>사이트의 서비스 품질 향상 및 방문 통계 분석을 위해 접속 브라우저 종류, 유입 경로(Referrer), 방문 일시 등의 비식별 접속 로그가 수집될 수 있습니다. 또한 사이트 내 일부 추천 상품 링크는 쿠팡 파트너스 및 제휴 마케팅 활동의 일환으로 제공되며, 이용자에게는 어떠한 추가 비용도 발생하지 않습니다.</p>

      <h2>4. 개인정보 보호책임자 및 문의처</h2>
      <p>개인정보 처리와 관련한 문의, 불만 처리 및 피해 구제에 관한 사항은 <a href="https://kidsfit.co.kr/contact.html">문의하기(/contact.html)</a> 페이지에 안내된 공식 이메일(expertise333@naver.com)로 연락해 주시면 신속히 답변드리겠습니다.</p>
    </article>
    """
    (ROOT / "privacy.html").write_text(
        build_common_layout(
            "개인정보처리방침 (Privacy Policy)",
            "키즈핏(KidsFit) 개인정보처리방침 및 Google AdSense 쿠키(DART) 운용 정책 안내입니다.",
            "/privacy.html",
            privacy_body,
        ),
        encoding="utf-8",
    )

    # 3. /terms.html
    terms_body = """
    <article class="card">
      <h1>서비스 이용약관 (Terms of Service)</h1>
      <p>본 약관은 키즈핏(KidsFit, https://kidsfit.co.kr)이 제공하는 아동 신체 성장·두뇌 발달 진단 시뮬레이션 및 육아·교육 칼럼 아카이브 서비스의 이용 조건과 절차를 규정합니다.</p>

      <h2>제1조 (목적 및 서비스의 성격)</h2>
      <p>키즈핏은 질병관리청(KDCA) 2017 소아청소년 성장도표, K-DST 영유아발달선별검사, 보건복지부 한국인 영양소 섭취기준(KDRIs) 및 국내외 학술논문 데이터를 바탕으로 아동·청소년의 성장 백분위 계산과 가정 내 양육 가이드를 무상으로 제공합니다.</p>

      <h2>제2조 (의학적·교육적 면책 사항)</h2>
      <p>본 사이트에서 산출되는 3단 예상키(유전키·현재추세키·최대잠재키) 및 발달 분석 결과는 통계적 모델에 기반한 참고 지표이며, 의학적 진단이나 치료를 대체하지 않습니다. 구체적인 의학적 판단은 반드시 소아청소년과 전문의의 진료를 통해 확인하셔야 합니다.</p>

      <h2>제3조 (지식재산권 및 저작권 보호)</h2>
      <p>본 사이트에 게시된 모든 텍스트 칼럼, 인포그래픽, 일러스트 웹툰, 카드뉴스 및 소프트웨어 코드의 저작권은 키즈핏 연구소에 귀속됩니다. 사전 서면 동의 없이 상업적 목적으로 무단 복제, 크롤링 또는 재배포하는 행위를 금지합니다.</p>

      <h2>제4조 (제휴 마케팅 및 외부 링크 고지)</h2>
      <p>본 사이트는 독자의 편의를 위해 식약처 인증 영양제, KC 인증 교구, 도서 등 외부 전자상거래 사이트로의 링크를 포함할 수 있으며, 공정거래위원회 추천·보증 등에 관한 표시·광고 심사지침에 따라 제휴 수수료 제공 가능성을 투명하게 고지합니다.</p>
    </article>
    """
    (ROOT / "terms.html").write_text(
        build_common_layout(
            "서비스 이용약관 (Terms of Service)",
            "키즈핏(KidsFit) 아동발달·성장 연구소 서비스 이용약관 및 저작권·면책 안내입니다.",
            "/terms.html",
            terms_body,
        ),
        encoding="utf-8",
    )

    # 4. /contact.html
    contact_body = """
    <article class="card">
      <h1>문의하기 및 연구소 소통 창구 (Contact Us)</h1>
      <p>키즈핏(KidsFit) 아동발달·성장 연구소의 콘텐츠 내용에 대한 학술적 질의, 오류 제보, 저작권 문의 및 광고·제휴 제안은 아래 공식 채널을 통해 접수하실 수 있습니다.</p>

      <h2>1. 공식 연락처 및 운영 정보</h2>
      <ul>
        <li><strong>서비스명</strong>: 키즈핏 (KidsFit Growth &amp; Brain Development Studio)</li>
        <li><strong>공식 웹사이트</strong>: <a href="https://kidsfit.co.kr">https://kidsfit.co.kr</a></li>
        <li><strong>공식 이메일</strong>: <a href="mailto:expertise333@naver.com">expertise333@naver.com</a></li>
        <li><strong>공식 네이버 블로그</strong>: <a href="https://blog.naver.com/expertise333" target="_blank" rel="noopener noreferrer">https://blog.naver.com/expertise333</a></li>
        <li><strong>공식 인스타그램 / 쓰레드</strong>: <code>@kids_fit1</code></li>
      </ul>

      <h2>2. 답변 안내</h2>
      <p>보내주신 이메일 문의는 영업일 기준 24~48시간 이내에 담당 연구원 및 에디터가 검토 후 회신해 드립니다.</p>
    </article>
    """
    (ROOT / "contact.html").write_text(
        build_common_layout(
            "문의하기 (Contact Us)",
            "키즈핏(KidsFit) 아동발달·성장 연구소 공식 이메일 및 제휴·콘텐츠 문의 창구입니다.",
            "/contact.html",
            contact_body,
        ),
        encoding="utf-8",
    )


def generate_qna_archive_hub():
    """Creates /qna/index.html listing all 43 long-form clinical articles organized by 4 categories."""
    articles = []
    for p in sorted(QNA_DIR.glob("*.html")):
        if p.name in ("index.html", "monthly-curation.html", "free-worksheets.html"):
            continue
        raw = p.read_text(encoding="utf-8", errors="ignore")
        m_title = re.search(r"<title>(.*?)</title>", raw, re.S)
        m_desc = re.search(r'<meta\s+name="description"\s+content="(.*?)"', raw, re.I)
        title = (m_title.group(1).split("|")[0].strip() if m_title else p.stem)
        desc = (m_desc.group(1).strip() if m_desc else "질병관리청 성장도표 및 학술논문 3,894편 기반 심층 분석 칼럼입니다.")
        cat = "신체성장·키·성조숙증·수면"
        if any(k in title for k in ("수학", "문장제", "문해력", "공부", "복습", "집중력", "타이머", "가베", "소근육", "박물관", "나들이")):
            cat = "두뇌발달·작업기억·문해력·학습법"
        elif any(k in title for k in ("거북목", "자세", "척추", "책상", "독서대", "철봉", "줄넘기", "성장통")):
            cat = "바른자세·척추생체역학·성장운동"
        elif any(k in title for k in ("칼슘", "비타민D", "아연", "철분", "아르기닌", "영양제", "편식", "단백질", "우유", "HT042")):
            cat = "소아영양·체중별 권장섭취량(KDRIs)"
        articles.append({"href": f"/qna/{p.name}", "title": title, "desc": desc, "cat": cat})

    cats_order = [
        "신체성장·키·성조숙증·수면",
        "소아영양·체중별 권장섭취량(KDRIs)",
        "바른자세·척추생체역학·성장운동",
        "두뇌발달·작업기억·문해력·학습법",
    ]
    sections_html = []
    for c_name in cats_order:
        c_items = [a for a in articles if a["cat"] == c_name]
        if not c_items:
            continue
        li_html = "\n".join(
            [
                f'<li style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px dashed #E2E8F0;">'
                f'<a href="https://kidsfit.co.kr{a["href"]}" style="font-size:16px;font-weight:800;color:#1D4ED8;text-decoration:none;display:block;margin-bottom:4px;">{a["title"]}</a>'
                f'<span style="font-size:13.5px;color:#475569;display:block;line-height:1.5;">{a["desc"][:140]}</span>'
                f"</li>"
                for a in c_items
            ]
        )
        sections_html.append(
            f"""
            <section class="card">
              <h2 style="margin-top:0;">📂 {c_name} ({len(c_items)}편)</h2>
              <ul style="list-style:none;padding:0;margin:0;">
                {li_html}
              </ul>
            </section>
            """
        )

    hub_body = f"""
    <div class="card">
      <h1>📚 키즈핏 아동발달·성장 연구소 학술 팩트체크 칼럼 아카이브 (전 {len(articles)}편)</h1>
      <p>질병관리청(KDCA) 2017 소아청소년 성장도표, K-DST 영유아발달선별검사, 보건복지부 한국인 영양소 섭취기준(KDRIs) 및 국내외 동료심사 학술논문 3,894편을 바탕으로 집필된 4대 영역 심층 칼럼 전체 목록입니다.</p>
    </div>
    {''.join(sections_html)}
    """
    (QNA_DIR / "index.html").write_text(
        build_common_layout(
            f"아동 신체성장·두뇌발달 학술 칼럼 아카이브 ({len(articles)}선)",
            "질병관리청 성장도표 및 논문 3,894편 기반 어린이 키성장, 성조숙증, 칼슘·비타민D, 거북목 자세교정, 초등 문해력·작업기억 전문 칼럼 모음입니다.",
            "/qna/index.html",
            hub_body,
        ),
        encoding="utf-8",
    )
    return len(articles)


def update_robots_and_sitemap():
    robots_p = ROOT / "robots.txt"
    if robots_p.exists():
        rtxt = robots_p.read_text(encoding="utf-8")
        if "Mediapartners-Google" not in rtxt:
            adsense_block = (
                "User-agent: Mediapartners-Google\nAllow: /\n\n"
                "User-agent: AdsBot-Google\nAllow: /\n\n"
            )
            rtxt = adsense_block + rtxt
            robots_p.write_text(rtxt, encoding="utf-8")

    sitemap_p = ROOT / "sitemap.xml"
    if sitemap_p.exists():
        stxt = sitemap_p.read_text(encoding="utf-8")
        today = datetime.now().strftime("%Y-%m-%d")
        new_urls = [
            "https://kidsfit.co.kr/about.html",
            "https://kidsfit.co.kr/privacy.html",
            "https://kidsfit.co.kr/terms.html",
            "https://kidsfit.co.kr/contact.html",
            "https://kidsfit.co.kr/qna/index.html",
            "https://kidsfit.co.kr/qna/monthly-curation.html",
        ]
        entries = []
        for u in new_urls:
            if u not in stxt:
                entries.append(
                    f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>"
                )
        if entries and "</urlset>" in stxt:
            stxt = stxt.replace("</urlset>", "\n".join(entries) + "\n</urlset>")
            sitemap_p.write_text(stxt, encoding="utf-8")


def inject_adsense_navigation_into_index_and_qna():
    # 1. Inject Crawlable Editorial Column Directory + Legal Footer Links into index.html
    index_p = ROOT / "index.html"
    if index_p.exists():
        itxt = index_p.read_text(encoding="utf-8")
        if "ADSENSE_EEAT_DIRECTORY_HUB" not in itxt and "<footer" in itxt:
            eeat_hub_html = """
    <!-- ADSENSE_EEAT_DIRECTORY_HUB -->
    <section aria-label="아동발달 및 신체성장 학술 칼럼 아카이브" style="max-width: 980px; margin: 2rem auto 1.5rem; padding: 0 1rem;">
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 1.35rem 1.5rem; box-shadow: 0 4px 14px rgba(15,23,42,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.85rem;">
          <h2 style="font-size: 1.08rem; font-weight: 900; color: #0F172A; margin: 0;">📚 키즈핏 아동발달·성장 연구소 4대 영역 학술 칼럼 아카이브</h2>
          <a href="/qna/index.html" style="font-size: 0.84rem; font-weight: 800; color: #1D4ED8; text-decoration: none;">전체 칼럼 43편 디렉토리 보기 →</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.75rem; font-size: 0.83rem; line-height: 1.6;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 0.9rem;">
            <div style="font-weight: 900; color: #1E3A8A; margin-bottom: 0.35rem;">📏 신체성장·예상키·수면의학</div>
            <a href="/qna/topic-01.html" style="display:block;color:#334155;text-decoration:none;">• 부모 유전키(MPH) vs 후천적 숨은 키 +7cm</a>
            <a href="/qna/topic-03.html" style="display:block;color:#334155;text-decoration:none;">• 밤 10시 성장호르몬 골든타임과 수면 환경</a>
            <a href="/qna/topic-14.html" style="display:block;color:#334155;text-decoration:none;">• 야간 성장통 5분 온찜질 &amp; 스트레칭 해법</a>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 0.9rem;">
            <div style="font-weight: 900; color: #1E3A8A; margin-bottom: 0.35rem;">🥗 소아영양·KDRIs 권장섭취량</div>
            <a href="/qna/topic-02.html" style="display:block;color:#334155;text-decoration:none;">• 체중별 칼슘·마그네슘·비타민D3 흡수율 기준</a>
            <a href="/qna/topic-06.html" style="display:block;color:#334155;text-decoration:none;">• 편식 심한 아이 미각세포 아연(Zinc) 솔루션</a>
            <a href="/qna/topic-17.html" style="display:block;color:#334155;text-decoration:none;">• 어린이 키성장 영양제 성분 팩트체크</a>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 0.9rem;">
            <div style="font-weight: 900; color: #1E3A8A; margin-bottom: 0.35rem;">🪑 바른자세·척추생체역학</div>
            <a href="/qna/topic-05.html" style="display:block;color:#334155;text-decoration:none;">• 초등 거북목·라운드숄더 교정과 숨은 키 2cm</a>
            <a href="/qna/topic-12.html" style="display:block;color:#334155;text-decoration:none;">• 성장판 자극 점프 운동 vs 실내 철봉 감압 루틴</a>
            <a href="/qna/monthly-curation.html" style="display:block;color:#334155;text-decoration:none;">• 생후 12~216개월 월령별 맞춤 준비물 가이드</a>
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0.75rem 0.9rem;">
            <div style="font-weight: 900; color: #1E3A8A; margin-bottom: 0.35rem;">🧠 두뇌발달·작업기억·문해력</div>
            <a href="/qna/topic-04.html" style="display:block;color:#334155;text-decoration:none;">• 초등 문장제 수학 실수와 전두엽 작업기억 훈련</a>
            <a href="/qna/topic-07.html" style="display:block;color:#334155;text-decoration:none;">• 학원 다녀오면 까먹는 아이 3분 파인만 백지복습</a>
            <a href="/qna/topic-08.html" style="display:block;color:#334155;text-decoration:none;">• 스마트폰 과몰입 예방 무소음 시각타이머 법칙</a>
          </div>
        </div>
        <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid #E2E8F0; display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; font-size: 0.79rem; font-weight: 700;">
          <a href="/about.html" style="color: #475569; text-decoration: none;">연구소 소개 및 편집원칙</a>
          <a href="/privacy.html" style="color: #475569; text-decoration: none;">개인정보처리방침(Google AdSense 쿠키 고지)</a>
          <a href="/terms.html" style="color: #475569; text-decoration: none;">이용약관</a>
          <a href="/contact.html" style="color: #475569; text-decoration: none;">문의하기</a>
          <a href="/qna/index.html" style="color: #1D4ED8; text-decoration: none;">칼럼 전체 목록(43선)</a>
        </div>
      </div>
    </section>
"""
            itxt = itxt.replace("<footer", eeat_hub_html + "\n    <footer", 1)
            index_p.write_text(itxt, encoding="utf-8")

    # 2. Ensure all qna/*.html pages include footer links to /about.html, /privacy.html, /terms.html, /contact.html, /qna/index.html
    patched_qna = 0
    for p in sorted(QNA_DIR.glob("*.html")):
        if p.name == "index.html":
            continue
        raw = p.read_text(encoding="utf-8", errors="ignore")
        if "/privacy.html" not in raw and "</body>" in raw:
            legal_bar = """
<nav aria-label="사이트 법적 고지 및 아카이브 안내" style="max-width:860px;margin:24px auto 32px;padding:14px 18px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;font-size:13px;color:#475569;text-align:center;">
  <a href="https://kidsfit.co.kr/" style="color:#1D4ED8;font-weight:800;text-decoration:none;margin:0 8px;">홈·무료진단</a> |
  <a href="https://kidsfit.co.kr/qna/index.html" style="color:#1D4ED8;font-weight:800;text-decoration:none;margin:0 8px;">전체 칼럼 아카이브(43선)</a> |
  <a href="https://kidsfit.co.kr/about.html" style="color:#475569;text-decoration:none;margin:0 8px;">연구소 소개</a> |
  <a href="https://kidsfit.co.kr/privacy.html" style="color:#475569;text-decoration:none;margin:0 8px;">개인정보처리방침</a> |
  <a href="https://kidsfit.co.kr/terms.html" style="color:#475569;text-decoration:none;margin:0 8px;">이용약관</a> |
  <a href="https://kidsfit.co.kr/contact.html" style="color:#475569;text-decoration:none;margin:0 8px;">문의하기</a>
</nav>
"""
            raw = raw.replace("</body>", legal_bar + "\n</body>", 1)
            p.write_text(raw, encoding="utf-8")
            patched_qna += 1
    return patched_qna


def update_build_js_for_legal_pages():
    build_p = ROOT / "scripts" / "build.js"
    if build_p.exists():
        btxt = build_p.read_text(encoding="utf-8")
        if "'about.html'" not in btxt:
            target = "'bb7865143f912a88c04d31d3921a0988.txt'"
            replacement = "'bb7865143f912a88c04d31d3921a0988.txt',\n    'about.html',\n    'privacy.html',\n    'terms.html',\n    'contact.html'"
            if target in btxt:
                btxt = btxt.replace(target, replacement)
                build_p.write_text(btxt, encoding="utf-8")


if __name__ == "__main__":
    generate_legal_and_eeat_pages()
    art_cnt = generate_qna_archive_hub()
    update_robots_and_sitemap()
    patched = inject_adsense_navigation_into_index_and_qna()
    update_build_js_for_legal_pages()
    print(f"[AdSense Approval Readiness] Generated 4 legal/E-E-A-T pages, Q&A Hub ({art_cnt} articles), and patched {patched} Q&A pages.")
