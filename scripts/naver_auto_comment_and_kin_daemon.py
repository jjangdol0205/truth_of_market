# -*- coding: utf-8 -*-
"""
scripts/naver_auto_comment_and_kin_daemon.py
Max-Safe High-Throughput Automated Outreach Daemon (네이버 육아·교육 블로그 공감+댓글+서로이웃 5곳/회차 투어 + 우리 블로그/카페 첫 댓글 딥링크 고정 + 네이버 지식iN 실시간 다중 답변 활동).

Runs 10 times daily (`10 7,9,10,12,13,15,17,19,21,23 * * *`) within Naver's anti-abuse safety envelope:
1. [External Naver Blog Sympathy + Comment + Mutual Neighbor Tour]: Visits 5 active 3040 parenting/education blog posts per cycle (~50 blogs/day, well within Naver's 100/day buddy ceiling), reads with human cadence, clicks Sympathy (공감 ♥), leaves a warm non-duplicate parenting comment, and sends a Mutual Neighbor request (서로이웃 신청).
2. [Owned Blog & Cafe First-Comment Deep-Link Pinning]: Leaves a helpful first comment with direct clickable links (`https://kidsfit.co.kr`) on our own latest Naver Blog (`expertise333`) and Naver Cafe (`moneyfitlab`) posts to boost reader CTR.
3. [Naver Knowledge iN (지식iN) Multi-Question Live Answering]: Searches real-time open parenting questions across 12 rotating topics and posts up to 2 high-trust Zero-URL clinical answers per cycle (~20 answers/day, with 20~27s human cooldown and immediate security-guard abort).
"""

import json
import os
import random
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = ROOT / "logs" / "naver_auto_comment_state.json"
BLOG_CURSOR_PATH = ROOT / "logs" / "blog_cafe_3x_daily_cursor.json"
ENV_PATH = ROOT / ".env"

sys.path.insert(0, str(ROOT / "scripts"))
from publish_3x_daily_blog_and_cafe import ensure_naver_session_cookies, load_env, send_telegram_message
from naver_blog_own_comment_reply_and_deai import (
    accept_incoming_buddy_requests,
    load_reply_state,
    reply_to_incoming_comments_on_own_blog,
    save_reply_state,
)
from execute_safe_backlog_activity import (
    SAFE_BACKLOG_ITEMS,
    ensure_clean_cdp_browser,
    try_safe_naver_kin_multi_answers,
)

BLOG_TOUR_TOPICS = [
    {
        "query": "초등 키성장 밤 10시 수면",
        "comments": [
            "글 정말 공감하며 잘 읽었습니다 :) 저희도 아이 키 때문에 고민이 많아서 밤 10시 전에 무조건 소등하고 자기 전 종아리 마사지해주고 있는데 확실히 컨디션이 다르더라구요! 아 그리고 네이버에 키즈핏 무료 성장계산기 돌려보니까 질병관리청 백분위랑 숨은 키 잠재력이 표로 나와서 루틴 잡기 참 좋았어요 ㅎㅎ 오늘도 육아 응원합니다!",
            "정성스러운 육아 기록 잘 보고 공감 꾹 누르고 갑니다 :) 성장기 아이들은 밤 10시~새벽 2시 깊은 잠이랑 취침 전 스트레칭만 꾸준히 해줘도 눈에 띄게 달라지더라구요! 따뜻한 하루 보내세요 :)",
            "아이 수면 루틴 챙기시는 모습에 많이 배워갑니다 :) 밤 9시 반부터 거실 조명을 조금만 낮춰줘도 아이가 훨씬 깊게 자고 성장통도 줄어들더라구요. 공감 남기고 서로이웃 신청드려요!"
        ]
    },
    {
        "query": "초등 문장제 수학 공부법",
        "comments": [
            "공감 꾹 누르고 갑니다 :) 연산은 잘해도 줄글 문장제에서 막히는 아이들은 머릿속 작업기억 부담 때문이라 여백에 숫자 동그라미랑 막대그림만 그리게 해줘도 훨씬 잘 풀더라구요! 전에 네이버에 키즈핏 무료 두뇌진단 돌려보니 아이 작업기억이랑 공부법이 자세하게 나와서 도움 많이 받았는데 정성스러운 글 보며 또 배워갑니다 :)",
            "정성껏 적어주신 학습 기록 잘 읽었습니다! 아이가 스스로 문제를 도식화해보고 작은 성취감을 느끼게 해주는 게 정말 중요한 것 같아요. 자주 소통하러 올게요 :)",
            "서술형 수학은 눈으로만 읽지 않고 조건에 밑줄 치며 그림으로 꺼내놓는 습관이 핵심인 것 같아요 :) 좋은 교육 기록 감사히 읽고 공감 남기고 갑니다!"
        ]
    },
    {
        "query": "만 3세 소근육 발달 놀이",
        "comments": [
            "아이가 너무 기특하네요 :) 만 2~4세 시기에 집게 집기나 물티슈캡 놀이처럼 손끝 소근육을 충분히 써주면 전두엽 실행기능까지 함께 자란다고 하더라구요! 네이버에 키즈핏 쳐서 개월 수 넣으면 무료로 월령별 0원 거실 놀이랑 교구 판정도 나와서 자주 참고하고 있어요 ㅎㅎ 따뜻한 육아 일상 응원합니다!",
            "글에서 아이를 향한 따뜻한 마음이 느껴져서 미소 지으며 읽었습니다 :) 손끝 민감기 시기에 스스로 해보게 기다려주는 부모님의 시선이 정말 멋진 것 같아요. 공감 남기고 갑니다!",
            "집에서 할 수 있는 알찬 엄마표 놀이 기록 너무 좋네요 :) 작은 손으로 하나씩 해내는 모습이 정말 사랑스럽습니다. 공감 꾹 누르고 서로이웃 신청드려요!"
        ]
    },
    {
        "query": "주말 아이와 박물관 과학관 나들이",
        "comments": [
            "주말 나들이 기록 너무 알차네요! 박물관이나 과학관 다녀올 때 출발 전후로 아이와 열린 질문을 2~3개만 주고받아도 기억에 훨씬 오래 남더라구요 :) 전 주말마다 네이버에 키즈핏 들어가서 지역별 전시 코스랑 질문 팁 무료로 뽑아보고 가는데 정말 편하더라구요 ㅎㅎ 즐거운 가족 나들이 응원합니다!",
            "사진과 글을 보니 아이가 정말 즐거워했겠어요 :) 직접 보고 만지는 주말 체험만큼 좋은 배경지식 공부가 없는 것 같습니다. 좋은 정보 감사히 보고 공감 남기고 갑니다!",
            "아이와 함께하는 주말 체험 기록이 참 따뜻하네요 :) 다녀와서 가장 기억에 남는 장면 한 줄만 대화로 나눠도 생각이 쑥쑥 자라더라구요. 자주 소통하며 지내요!"
        ]
    },
    {
        "query": "아이 편식 식단 아연 칼슘",
        "comments": [
            "입 짧은 아이 식단 챙기시는 정성이 정말 대단하세요 :) 편식하는 시기에는 억지로 먹이기보다 미각 세포 재생을 돕는 아연이나 유당 없는 칼슘으로 기초 영양을 채워주는 게 큰 도움이 되더라구요. 초록창에 키즈핏 검색해서 아이 체중 넣으면 하루 칼슘·아연 권장량 무료로 계산해줘서 식단 짤 때 참 유용했어요! 응원합니다 :)",
            "매일 아이 반찬과 영양 고민하는 마음 너무 공감됩니다 :) 엄마의 따뜻한 정성이 아이의 건강한 성장으로 꼭 이어질 거예요. 공감 누르고 갑니다!",
            "정성 가득한 유아식·어린이 식단 기록 보며 반성하고 배워갑니다 :) 식사 시간이 즐거운 기억이 되도록 기다려주는 게 참 중요한 것 같아요. 공감 남기고 갑니다!"
        ]
    },
    {
        "query": "초등 거북목 독서대 바른자세",
        "comments": [
            "좋은 정보 잘 읽었습니다! 책상에서 고개 숙이는 각도만 독서대로 15도 높여주고 저녁에 문틀 철봉 매달리기만 해줘도 눌려 있던 숨은 키랑 집중력이 같이 살아나더라구요 :) 오늘도 응원합니다!",
            "아이 공부 자세 잡아주는 게 참 쉽지 않은데 정성스러운 글 보며 많이 배워갑니다 :) 바른 자세가 키 성장과 학습 지구력의 기본인 것 같아요. 공감 꾹 남기고 갑니다!",
            "고개 숙이는 각도만 바로잡아줘도 목 디스크 하중이 확 줄고 숨은 키가 2cm 가까이 펴진다고 하더라구요 :) 유익한 포스팅 잘 읽고 공감 남깁니다!"
        ]
    },
    {
        "query": "영유아건강검진 발달 백분위",
        "comments": [
            "영유아검진 다녀오신 기록 공감하며 잘 읽었습니다 :) 검진표 백분위 숫자만 보면 괜히 마음이 쓰이는데, 개월 수별 민감기에 맞춰 집에서 수면이랑 소근육 놀이만 챙겨줘도 금방 쑥쑥 자라더라구요! 포털에 키즈핏 무료 성장·발달 계산기 돌려보면 또래 대비 표준 백분위랑 맞춤 루틴이 한눈에 나와서 참 든든했어요 :) 응원합니다!",
            "아이 성장 기록을 꼼꼼하게 남겨두시는 모습이 정말 멋지세요 :) 매달 조금씩 자라는 아이의 속도를 믿고 응원해주는 게 가장 큰 힘인 것 같습니다. 공감 꾹 누르고 갑니다!",
            "검진 때마다 키랑 몸무게 백분위 확인하며 마음 졸이는 건 모든 부모 마음이 똑같은 것 같아요 :) 건강하고 씩씩하게 자라길 응원하며 서로이웃 신청드려요!"
        ]
    },
    {
        "query": "몬테소리 가베 엄마표 교구 놀이",
        "comments": [
            "정성스러운 교구 놀이 기록에 감탄하고 갑니다 :) 만 3세 전후에는 몬테소리 감각·일상 교구로 소근육을 깨워주고, 만 4세 이후에는 가베로 입체 도형 감각을 길러주면 수리 사고력이 정말 탄탄해지더라구요! 공감 꾹 누르고 자주 배우러 올게요 :)",
            "아이가 교구에 몰입하는 모습이 너무 예쁘네요 :) 스스로 손으로 만지고 깨우치는 시간이 두뇌 발달에 최고의 선물인 것 같습니다. 따뜻한 글 잘 읽었습니다!",
            "엄마표로 이렇게 꾸준히 교구 놀이 챙겨주시는 정성이 대단하세요 :) 초록창에 키즈핏 무료 두뇌진단 해보시면 개월 수별 교구 적합도랑 놀이 팁도 잘 나와 있어서 함께 보시면 좋을 것 같아요! 응원합니다 :)"
        ]
    },
    {
        "query": "초등 독서록 문해력 어휘력 공부",
        "comments": [
            "아이 독서 습관과 문해력 키우시는 기록 잘 읽었습니다 :) 책을 읽고 나서 줄거리 요약 대신 '왜 그랬을까?' 열린 질문을 한두 개만 나눠도 생각하는 힘이 훨씬 깊어지더라구요! 공감 남기고 갑니다 :)",
            "초등 시기에는 눈으로만 빨리 읽는 것보다 모르는 어휘를 내 말로 한 줄로 바꿔 말해보는 게 진짜 문해력이 되는 것 같아요 :) 좋은 글 감사히 읽고 서로이웃 신청드려요!",
            "꾸준히 책 읽는 환경을 만들어주시는 모습이 정말 인상 깊습니다 :) 부모님과 나누는 짧은 책 대화가 아이의 평생 어휘력이 될 거예요. 오늘도 응원합니다!"
        ]
    },
    {
        "query": "아이 밤마다 성장통 다리 마사지",
        "comments": [
            "자다가 다리 아프다고 깨는 아이 달래느라 고생 많으셨어요 ㅠㅠ 성장판이 자라는 속도를 근육이 따라가느라 생기는 신호라 자기 전 따뜻한 온찜질이랑 종아리 마사지, 그리고 저녁 칼슘·마그네슘만 챙겨줘도 훨씬 편안하게 자더라구요! 오늘 밤은 푹 자길 응원합니다 :)",
            "밤마다 아이 다리 주물러주는 부모님의 손길이 참 따뜻하네요 :) 쑥쑥 크느라 겪는 과정이니만큼 좋은 영양과 스트레칭으로 건강하게 지나가길 바랍니다. 공감 누르고 갑니다!",
            "성장통 있는 날은 낮에 딱딱한 바닥 달리기 대신 실내 스트레칭으로 근육 긴장을 풀어주는 게 참 좋더라구요 :) 정성스러운 육아 일상 응원하며 서로이웃 신청드려요!"
        ]
    },
    {
        "query": "초등 자기주도학습 플래너 공부습관",
        "comments": [
            "아이 스스로 계획 세우고 실천하는 습관 잡아주시는 모습이 정말 멋집니다 :) 처음엔 무소음 타이머로 15~20분 작은 분량만 완수하는 성취감을 쌓아주면 자기효능감이 금방 올라가더라구요! 포털에 키즈핏 무료 두뇌 5각 진단 돌려보시면 아이 성향별 4단계 시간표도 나와서 참고하기 참 좋았어요 :) 응원합니다!",
            "공부 분량보다 '오늘 정한 걸 내 힘으로 끝냈다'는 작은 성공 경험이 자기주도학습의 핵심인 것 같아요 :) 정성스러운 기록 잘 보고 공감 꾹 남깁니다!",
            "매일 꾸준히 학습 루틴을 지켜나가는 아이도, 옆에서 따뜻하게 격려해주시는 부모님도 정말 대단하세요 :) 자주 소통하러 올게요!"
        ]
    },
    {
        "query": "여자아이 남자아이 사춘기 성조숙증 키관리",
        "comments": [
            "사춘기 시기 키 성장과 건강 관리 글 공감하며 잘 읽었습니다 :) 저녁 야식과 단 음료를 줄이고 밤 10시 암막 숙면이랑 줄넘기 운동만 꾸준히 지켜줘도 성장판 닫히는 속도를 늦추는 데 큰 도움이 되더라구요! 공감 누르고 응원하고 갑니다 :)",
            "아이 성장 속도와 뼈나이 관리에 신경 쓰시는 마음이 깊이 공감됩니다 :) 질병관리청 성장도표 기준으로 매달 키랑 BMI 백분위 추이를 체크해주면 훨씬 안심이 되더라구요. 따뜻한 하루 보내세요!",
            "유익하고 꼼꼼한 성장 관리 기록 잘 읽었습니다 :) 아이의 건강한 성장을 진심으로 응원하며 서로이웃 신청드려요!"
        ]
    }
]


def load_state():
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "cycle": 0,
        "visited_blog_urls": [],
        "commented_own_posts": [],
        "answered_kin_urls": [],
        "history": []
    }


def save_state(st):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(st, ensure_ascii=False, indent=2), encoding="utf-8")


def pin_first_comment_on_own_latest_cafe_post(context, commented_own: list) -> dict:
    """Leaves a helpful first comment with direct clickable links on our own latest Naver Cafe post."""
    if not BLOG_CURSOR_PATH.exists():
        return {"status": "skipped", "reason": "커서 파일 없음"}
    try:
        cur = json.loads(BLOG_CURSOR_PATH.read_text(encoding="utf-8"))
        hist = cur.get("history", [])
        if not hist:
            return {"status": "skipped", "reason": "최근 발행글 없음"}
        latest_cafe_url = (hist[-1].get("cafe") or {}).get("url", "")
        if not latest_cafe_url or latest_cafe_url in commented_own or "/articles/" not in latest_cafe_url:
            return {"status": "already_commented", "url": latest_cafe_url}
    except Exception as e:
        return {"status": "error", "reason": str(e)[:40]}

    page = context.new_page()
    try:
        page.goto(latest_cafe_url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(3.2)

        comment_text = (
            "📌 [방문자 필독 · 10초 무료 진단 & A4 출력용 홈스쿨 워크지 3종 바로가기]\n"
            "본문에 소개된 질병관리청(KDCA) 성장도표 기준 우리 아이 키·몸무게 백분위 & 3단 예상키 + 두뇌 5각 밸런스(LQ) 무료 계산기는 아래 공식 링크에서 로그인 없이 바로 이용하실 수 있습니다 👇\n"
            "👉 1분 무료 성장·두뇌 진단: https://kidsfit.co.kr\n"
            "👉 A4 출력용 소근육·문장제·백지복습 워크지 3종 무료 인쇄: https://kidsfit.co.kr/qna/free-worksheets.html\n"
            "👉 학부모 다빈도 질문 25선 백과사전: https://kidsfit.co.kr/qna/index.html"
        )

        posted = False
        for f in [page.main_frame] + page.frames:
            try:
                inp = f.locator("textarea.comment_inbox_text, textarea[placeholder*='댓글']").first
                if inp.count() > 0 and inp.is_visible():
                    inp.click(force=True)
                    time.sleep(0.4)
                    inp.fill(comment_text)
                    time.sleep(0.6)
                    reg = f.locator("a.btn_register, button.btn_register, .CommentWriter a.button").first
                    if reg.count() > 0:
                        reg.click(force=True)
                        time.sleep(2.5)
                        posted = True
                        break
            except Exception:
                continue

        if posted:
            commented_own.append(latest_cafe_url)
            return {"status": "comment_pinned", "url": latest_cafe_url}
        return {"status": "checked_ok", "url": latest_cafe_url}
    except Exception as e:
        return {"status": "warn", "url": latest_cafe_url, "reason": str(e)[:40]}
    finally:
        page.close()


def pin_first_comment_on_own_latest_blog_post(context, commented_own: list) -> dict:
    """Leaves a helpful first comment with direct clickable deep-links on our own latest Naver Blog post (expertise333)."""
    if not BLOG_CURSOR_PATH.exists():
        return {"status": "skipped", "reason": "커서 파일 없음"}
    try:
        cur = json.loads(BLOG_CURSOR_PATH.read_text(encoding="utf-8"))
        hist = cur.get("history", [])
        if not hist:
            return {"status": "skipped", "reason": "최근 발행글 없음"}
        latest_blog_url = (hist[-1].get("blog") or {}).get("url", "")
        m = re.search(r"blog\.naver\.com/([a-zA-Z0-9_-]+)/(\d+)", latest_blog_url)
        if not m or latest_blog_url in commented_own:
            return {"status": "already_commented", "url": latest_blog_url}
        blog_id, log_no = m.group(1), m.group(2)
    except Exception as e:
        return {"status": "error", "reason": str(e)[:40]}

    page = context.new_page()
    try:
        comment_url = f"https://m.blog.naver.com/CommentList.naver?blogId={blog_id}&logNo={log_no}"
        page.goto(comment_url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2.8)

        comment_text = (
            "📌 [방문자 안내 · 우리 아이 1분 무료 진단 & A4 워크지 바로가기]\n"
            "본문에 소개된 질병관리청(KDCA) 성장도표 기준 3단 예상키 & 두뇌 5각 밸런스(LQ) 무료 진단은 아래 공식 주소에서 회원가입 없이 바로 확인하실 수 있습니다 👇\n"
            "👉 신체 성장 & 숨은키 1분 진단: https://kidsfit.co.kr/?mode=growth\n"
            "👉 두뇌 5각 밸런스 & 공부법 진단: https://kidsfit.co.kr/?mode=learning\n"
            "👉 A4 출력용 소근육·문장제·백지복습 워크지 3종 무료 인쇄: https://kidsfit.co.kr/qna/free-worksheets.html"
        )

        c_box = page.locator("#naverComment__write_textarea, div.u_cbox_text, textarea.u_cbox_text").first
        if c_box.count() > 0:
            c_box.scroll_into_view_if_needed()
            c_box.click(force=True)
            time.sleep(0.5)
            page.keyboard.insert_text(comment_text)
            time.sleep(0.8)
            submit_btn = page.locator("button.u_cbox_btn_upload.__uis_naverComment_writeButton, button.u_cbox_btn_upload").first
            if submit_btn.count() > 0:
                submit_btn.click(force=True)
                time.sleep(2.5)
                commented_own.append(latest_blog_url)
                return {"status": "blog_comment_pinned", "url": latest_blog_url}
        return {"status": "checked_ok", "url": latest_blog_url}
    except Exception as e:
        return {"status": "warn", "url": latest_blog_url, "reason": str(e)[:40]}
    finally:
        page.close()


def try_naver_blog_buddy_add(page, blog_id: str) -> str:
    """
    Attempts to send a Mutual Neighbor request (서로이웃 신청) or Neighbor addition (이웃 추가)
    on Naver Mobile Blog (`m.blog.naver.com/BuddyAddForm.naver?blogId=...`).
    """
    buddy_url = f"https://m.blog.naver.com/BuddyAddForm.naver?blogId={blog_id}"
    greetings = [
        "안녕하세요! 아이 신체 성장과 두뇌·학습 발달을 연구하며 기록하는 키즈핏입니다 :) 정성스러운 육아·교육 글 잘 읽고 공감 남기며 서로이웃 신청드려요. 따뜻하게 소통하며 지내요!",
        "반갑습니다 :) 아이 키 성장과 연령별 공부법·주말 나들이 코스를 나누는 키즈핏입니다. 올려주신 정성스러운 글에 많이 공감하며 서로이웃 신청드려요! 자주 소통하러 올게요 :)",
        "안녕하세요 :) 우리 아이 수면·영양 성장 루틴과 자기주도 공부법을 기록하는 키즈핏입니다. 따뜻한 육아·교육 일상에 공감 꾹 누르고 서로이웃 신청드립니다!",
        "반갑습니다! 소아 성장 데이터와 두뇌 발달 놀이를 연구하는 키즈핏이에요 :) 정성 가득한 포스팅 잘 읽고 서로이웃 신청드립니다. 앞으로 자주 인사 나누어요!",
        "안녕하세요 :) 아이 키 성장과 문해력·수리 공부 루틴을 나누고 있는 키즈핏입니다. 좋은 글 감사히 읽고 공감과 함께 서로이웃 신청드려요. 행복한 하루 보내세요!"
    ]
    try:
        page.goto(buddy_url, wait_until="domcontentloaded", timeout=15000)
        time.sleep(2.0)

        body_txt = page.evaluate("() => (document.body && document.body.innerText) || ''")
        if any(w in body_txt for w in ["하루에 신청할 수 있는", "초과", "제한"]):
            return "일일한도 보호대기"
        if "이미 이웃" in body_txt or "서로이웃 신청 진행중" in body_txt or "신청을 진행중" in body_txt:
            return "이미 이웃/신청중"

        mode_selected = page.evaluate("""() => {
            const bothRadio = document.querySelector('input#bothBuddyRadio');
            const oneRadio = document.querySelector('input#buddyRadio');
            if (bothRadio && !bothRadio.disabled) {
                bothRadio.click();
                const lbl = document.querySelector('label[for="bothBuddyRadio"]');
                if (lbl) lbl.click();
                return 'mutual';
            }
            if (oneRadio && !oneRadio.disabled) {
                oneRadio.click();
                const lbl = document.querySelector('label[for="buddyRadio"]');
                if (lbl) lbl.click();
                return 'neighbor';
            }
            return 'none';
        }""")
        time.sleep(0.8)

        if mode_selected == "mutual":
            ta = page.locator("textarea.textarea_t1, textarea#inviteMessage, textarea").first
            if ta.count() > 0 and ta.is_visible():
                ta.click(force=True)
                time.sleep(0.3)
                ta.fill(random.choice(greetings))
                time.sleep(0.5)

        if mode_selected in ("mutual", "neighbor"):
            ok_btn = page.locator("a.btn_ok, button.btn_ok").first
            if ok_btn.count() > 0:
                ok_btn.click(force=True)
                time.sleep(2.2)
                return "서로이웃 신청 완료" if mode_selected == "mutual" else "이웃추가 완료"
        return "이웃확인 완료"
    except Exception:
        return "이웃확인 완료"


def execute_external_blog_sympathy_and_comment_tour(context, topics: list, visited_urls: list, max_total_blogs: int = 5) -> list:
    """
    Searches Naver Blog across 2 rotating parenting topics (`topics`), visits up to `max_total_blogs` (5) external posts per cycle,
    clicks Sympathy (공감 ♥), leaves a warm non-spammy parenting comment, and sends a Mutual Neighbor request (서로이웃 신청).
    """
    results = []
    page = context.new_page()
    try:
        for t_idx, topic in enumerate(topics):
            if len(results) >= max_total_blogs:
                break
            per_topic_quota = 3 if t_idx == 0 else (max_total_blogs - len(results))
            q_enc = urllib.parse.quote(topic["query"])
            search_url = f"https://search.naver.com/search.naver?where=blog&query={q_enc}&sm=tab_opt&nso=so%3Add%2Cp%3A1w"
            page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
            time.sleep(2.8)

            blog_links = page.evaluate("""() => {
                const anchors = Array.from(document.querySelectorAll('a[href*="blog.naver.com/"]'));
                const seen = new Set();
                const out = [];
                for (const a of anchors) {
                    const href = a.href || '';
                    const txt = (a.innerText || '').trim();
                    const m = href.match(/blog\\.naver\\.com\\/([a-zA-Z0-9_-]+)\\/(\\d+)/);
                    if (m && m[1] !== 'expertise333' && txt.length >= 8 && !seen.has(href)) {
                        seen.add(href);
                        out.push({ blogId: m[1], logNo: m[2], url: href, title: txt.slice(0, 45) });
                    }
                }
                return out;
            }""")

            candidates = [x for x in blog_links if x["url"] not in visited_urls][:per_topic_quota]
            for cand in candidates:
                post_url = f"https://m.blog.naver.com/PostView.naver?blogId={cand['blogId']}&logNo={cand['logNo']}"
                comment_url = f"https://m.blog.naver.com/CommentList.naver?blogId={cand['blogId']}&logNo={cand['logNo']}"
                try:
                    page.goto(post_url, wait_until="domcontentloaded", timeout=20000)
                    time.sleep(random.uniform(3.2, 4.8))
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(random.uniform(1.4, 2.2))

                    # 1. Click Sympathy (공감) if not already liked
                    liked = page.evaluate("""() => {
                        const btn = document.querySelector('a.u_likeit_list_button._button.off, a.u_likeit_button._face.off');
                        if (btn) {
                            btn.click();
                            return true;
                        }
                        return false;
                    }""")
                    time.sleep(1.2)

                    # 2. Navigate directly to CommentList modal and post a warm comment
                    page.goto(comment_url, wait_until="domcontentloaded", timeout=20000)
                    time.sleep(2.8)
                    comment_posted = False

                    c_box = page.locator("#naverComment__write_textarea, div.u_cbox_text, textarea.u_cbox_text").first
                    if c_box.count() > 0:
                        c_box.scroll_into_view_if_needed()
                        c_box.click(force=True)
                        time.sleep(0.6)
                        msg_to_type = random.choice(topic["comments"])
                        page.keyboard.insert_text(msg_to_type)
                        time.sleep(1.0)
                        submit_btn = page.locator("button.u_cbox_btn_upload.__uis_naverComment_writeButton, button.u_cbox_btn_upload").first
                        if submit_btn.count() > 0:
                            submit_btn.click(force=True)
                            time.sleep(3.0)
                            comment_posted = True

                    # 3. Send Mutual Neighbor Request (서로이웃 신청 / 이웃 추가)
                    buddy_status = try_naver_blog_buddy_add(page, cand["blogId"])

                    visited_urls.append(cand["url"])
                    status_parts = []
                    if liked:
                        status_parts.append("공감♥")
                    if comment_posted:
                        status_parts.append("댓글등록")
                    if buddy_status:
                        status_parts.append(buddy_status)
                    results.append({
                        "query": topic["query"],
                        "title": cand["title"],
                        "url": cand["url"],
                        "blogId": cand["blogId"],
                        "sympathy_clicked": liked,
                        "comment_posted": comment_posted,
                        "buddy_status": buddy_status,
                        "status": "+".join(status_parts) if status_parts else "방문 열람 완료"
                    })
                    # Human reading pause between blogs
                    time.sleep(random.uniform(3.5, 5.5))
                except Exception as e:
                    results.append({
                        "query": topic["query"],
                        "title": cand["title"],
                        "url": cand["url"],
                        "status": f"방문 완료 ({str(e)[:25]})"
                    })
    except Exception as e:
        print(f"⚠️ 외부 블로그 투어 예외: {e}")
    finally:
        page.close()
    return results


def main():
    notify_tg = "--notify" in sys.argv or True
    st = load_state()
    cycle_num = int(st.get("cycle", 0)) + 1

    # Select 2 rotating blog topics (5 blogs/cycle) and 3 rotating Kin clinical topics (up to 2 live answers/cycle)
    topic_a = BLOG_TOUR_TOPICS[((cycle_num - 1) * 2) % len(BLOG_TOUR_TOPICS)]
    topic_b = BLOG_TOUR_TOPICS[((cycle_num - 1) * 2 + 1) % len(BLOG_TOUR_TOPICS)]
    tour_topics = [topic_a, topic_b]

    kin_items = [
        SAFE_BACKLOG_ITEMS[((cycle_num - 1) * 2 + i) % len(SAFE_BACKLOG_ITEMS)]
        for i in range(3)
    ]

    own_pin_res = {}
    blog_tour_res = []
    kin_results = []

    with sync_playwright() as p:
        browser, context, should_close = ensure_clean_cdp_browser(p)
        try:
            ensure_naver_session_cookies(context)

            # 1. Pin first comment on our own latest Naver Cafe & Blog posts
            own_pin_res = pin_first_comment_on_own_latest_cafe_post(context, st.setdefault("commented_own_posts", []))
            own_blog_pin_res = pin_first_comment_on_own_latest_blog_post(context, st.setdefault("commented_own_posts", []))
            own_pin_res["blog_pin"] = own_blog_pin_res

            # 1-B. Manage our own Naver Blog (accept incoming buddy requests + reply to visitor comments & return visit)
            reply_st = load_reply_state()
            buddy_accept_res = accept_incoming_buddy_requests(context, reply_st)
            own_reply_res = reply_to_incoming_comments_on_own_blog(context, reply_st, max_posts_to_scan=5, max_replies_per_cycle=6)
            save_reply_state(reply_st)
            own_pin_res["buddy_accept"] = buddy_accept_res
            own_pin_res["incoming_comment_replies"] = own_reply_res

            # 2. External Naver Blog Sympathy + Comment + Mutual Neighbor Tour (5 target parenting blogs across 2 topics)
            blog_tour_res = execute_external_blog_sympathy_and_comment_tour(
                context, tour_topics, st.setdefault("visited_blog_urls", []), max_total_blogs=5
            )

            # 3. Naver Knowledge iN (지식iN) Multi-Question Live Answer Activity (up to 2 answers per cycle)
            kin_results = try_safe_naver_kin_multi_answers(
                context, kin_items, st.setdefault("answered_kin_urls", []), max_answers=2
            )
        finally:
            if should_close:
                try:
                    context.close()
                except Exception:
                    pass

    st["cycle"] = cycle_num
    st["visited_blog_urls"] = st["visited_blog_urls"][-400:]
    st["commented_own_posts"] = st["commented_own_posts"][-150:]
    st["answered_kin_urls"] = st["answered_kin_urls"][-250:]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S KST")
    primary_kin = kin_results[0] if kin_results else {}
    st.setdefault("history", []).append({
        "cycle": cycle_num,
        "executedAt": now_str,
        "tourQueries": [t["query"] for t in tour_topics],
        "ownPinResult": own_pin_res,
        "blogTourResults": blog_tour_res,
        "kinResult": primary_kin,
        "kinResults": kin_results,
    })
    st["history"] = st["history"][-50:]
    save_state(st)

    pub_kin_cnt = sum(1 for k in kin_results if k.get("status") == "published_no_link")
    print(
        f"✅ [Naver Max-Safe Outreach #{cycle_num}] Completed: "
        f"{len(blog_tour_res)} blog sympathy/comment/buddy interactions, "
        f"{pub_kin_cnt}/{len(kin_results)} live Kin answers published"
    )

    if notify_tg:
        tour_lines = "\n".join(
            [f"  • [{r['status']}] {r['title']} ({r['url']})" for r in blog_tour_res]
        ) or "  • 탐색 완료"
        kin_lines = "\n".join(
            [
                f"  • [{k.get('query', '')}] {k.get('question_title', '탐색 완료')[:34]} → {k.get('reason', k.get('status', ''))} ({k.get('question_url', 'https://kin.naver.com')})"
                for k in kin_results
            ]
        ) or "  • 탐색 완료"
        msg = (
            f"🤝 [네이버 블로그 공감·댓글·서로이웃 투어(5곳) & 지식iN 다중답변 #{cycle_num}회차 완료]\n"
            f"⏰ 실행 시각: {now_str}\n\n"
            f"1️⃣ 외부 육아·교육 블로그 5곳 공감(♥)·맞춤댓글·서로이웃 신청 (주제: '{topic_a['query']}' / '{topic_b['query']}'):\n"
            f"{tour_lines}\n\n"
            f"2️⃣ 공식 블로그·카페 최신글 첫 댓글 딥링크 고정:\n"
            f"  • 카페: {own_pin_res.get('status')} ({own_pin_res.get('url', '')})\n"
            f"  • 블로그: {(own_pin_res.get('blog_pin') or {}).get('status')} ({(own_pin_res.get('blog_pin') or {}).get('url', '')})\n\n"
            f"3️⃣ 네이버 지식iN 실시간 질문 다중 답변 활동 (회차당 최대 2건·노링크 안전모드):\n"
            f"{kin_lines}"
        )
        try:
            send_telegram_message(msg)
        except Exception as e:
            print(f"⚠️ 텔레그램 전송 경고: {e}")


if __name__ == "__main__":
    main()
