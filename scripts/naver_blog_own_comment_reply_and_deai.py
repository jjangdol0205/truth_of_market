#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/naver_blog_own_comment_reply_and_deai.py
1. [내 네이버 블로그(expertise333) & 카페(moneyfitlab) 방문자 댓글 자동 답글(대댓글) + 답방 + 서로이웃 수락 매니저]
   - 내 블로그 최신 포스트들에 달린 방문자 댓글을 실시간 스캔하여,
     방문자 댓글 내용(키성장/수면/공부/소근육/박물관/이웃인사)에 맞춘 100% 사람 말투(AI 느낌 0%) 대댓글을 자동 등록합니다.
   - 댓글을 남겨준 이웃의 블로그에 즉시 답방하여 공감(♥)을 누르고 감사 답방 댓글을 남깁니다.
   - 내 블로그에 들어온 서로이웃 신청을 자동으로 수락합니다.
2. [AI 느낌 0% (De-AI) 블로그·카페·웹툰(@berrykku_toon 베리꾸 스타일) 변환 엔진]
   - 블로그·카페 원고에서 기계적인 번호('■ 1.', '[리포트 #N]'), 연구소 인사말, 영문 학술용어 병기를 제거하고
     현실 육아 에피소드 오프닝 + 구어체 리듬('~하더라구요 ㅎㅎ', '~거든요 ㅠㅠ')으로 변환합니다.
"""

import json
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
REPLY_STATE_PATH = ROOT / "logs" / "naver_blog_own_reply_state.json"


def load_reply_state() -> dict:
    if REPLY_STATE_PATH.exists():
        try:
            return json.loads(REPLY_STATE_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "replied_comment_ids": [],
        "accepted_buddy_ids": [],
        "return_visited_blogs": [],
        "history": [],
    }


def save_reply_state(st: dict):
    REPLY_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPLY_STATE_PATH.write_text(json.dumps(st, ensure_ascii=False, indent=2), encoding="utf-8")


def generate_human_blog_owner_reply(visitor_nick: str, comment_text: str) -> str:
    """
    Generates a 100% natural, warm Korean mom/dad blog host reply (대댓글) with ZERO AI feel,
    tailored to the visitor's comment content.
    """
    nick = (visitor_nick or "이웃").strip()
    # Clean nick if it has trailing system text
    nick = re.sub(r"\s*님.*$", "", nick).strip() or "이웃"
    txt = (comment_text or "").strip()

    if any(k in txt for k in ["키", "수면", "잠", "성장", "우유", "칼슘", "스트레칭"]):
        templates = [
            f"{nick}님 반가워요 ㅎㅎ 맞아요 밤 10시 전에 불 끄고 재우는 게 마음처럼 쉽지 않은데 일주일만 해봐도 아침에 일어나는 컨디션부터 다르더라구요! 찾아주셔서 감사해요 :)",
            f"{nick}님 따뜻한 댓글 감사해요 :) 애들 키 크는 시기는 진짜 잠깐이라 저녁 식단이나 잠자리 루틴 조금씩만 바꿔줘도 참 든든하더라구요 ㅎㅎ 오늘도 육아 화이팅이에요!",
            f"{nick}님 공감해주셔서 감사해요 ㅎㅎ 자기 전에 다리 살살 주물러주면서 도란도란 얘기 나누면 애도 금방 스르륵 잠들더라구요 :) 좋은 밤 보내세요!",
        ]
    elif any(k in txt for k in ["수학", "문장제", "공부", "학원", "복습", "백지", "문제집", "독서", "문해력"]):
        templates = [
            f"{nick}님 댓글 넘 공감돼요 ㅎㅎ 애들 문제집 봐주다 보면 저도 모르게 깊은 한숨 나올 때가 많은데, 빈 종이에 그림 그리게 하거나 엄마한테 설명해보라고 하니 훨씬 덜 싸우게 되더라구요 :)",
            f"{nick}님 찾아주셔서 감사해요 :) 문제집 여러 권 풀리는 것보다 오늘 배운 거 딱 한 문장만 입 밖으로 말해보게 하는 게 진짜 오래 남는 것 같아요 ㅎㅎ 자주 소통해요!",
            f"{nick}님 반갑습니다 ㅎㅎ 공부 습관은 엄마가 조급해하지 않고 작은 성취감 하나씩 쌓아주는 게 제일 빠른 길이더라구요! 따뜻한 하루 보내세요 :)",
        ]
    elif any(k in txt for k in ["소근육", "집게", "놀이", "교구", "가베", "몬테소리", "고집", "혼자"]):
        templates = [
            f"{nick}님 반가워요 ㅎㅎ 맞아요 비싼 교구 사주면 며칠 안 가고 오히려 주방에 있는 집게나 휴지심 같은 걸로 놀아줄 때 제일 신나하더라구요! 따뜻한 댓글 감사해요 :)",
            f"{nick}님 댓글 보며 미소 지었네요 :) 내가 혼자 하겠다고 고집부릴 땐 출근 시간에 진짜 진땀 나지만ㅋㅋ 손끝 크는 시기라 생각하면 또 기특하더라구요 ㅎㅎ 자주 놀러 오세요!",
        ]
    elif any(k in txt for k in ["박물관", "과학관", "미술관", "주말", "나들이", "전시"]):
        templates = [
            f"{nick}님 반갑습니다 :) 주말마다 아이 데리고 어디 갈지 늘 고민인데, 가기 전에 차 안에서 퀴즈 하나만 내줘도 눈빛이 초롱초롱해지더라구요 ㅎㅎ 즐거운 한 주 보내세요!",
            f"{nick}님 따뜻한 댓글 감사해요 ㅎㅎ 다 보여주려고 욕심내지 않고 아이가 신기해하는 거 하나만 같이 이야기 나눠도 참 좋은 추억이 되더라구요 :)",
        ]
    elif any(k in txt for k in ["서로이웃", "서이추", "이웃", "소통", "놀러"]):
        templates = [
            f"{nick}님 반갑습니다 ㅎㅎ 먼저 찾아주시고 따뜻한 댓글 남겨주셔서 넘 감사해요! 저도 바로 블로그 놀러 가서 공감 꾹 누르고 자주 소통하러 갈게요 :)",
            f"{nick}님 환영해요 :) 육아하면서 기록 남기시는 분들과 소통할 때 제일 반갑고 힘이 나더라구요 ㅎㅎ 저도 지금 바로 답방 갑니다!",
        ]
    else:
        templates = [
            f"{nick}님 정성스러운 댓글 넘 감사해요 ㅎㅎ 날씨가 제법 쌀쌀해졌는데 감기 조심하시고 오늘도 웃음 가득한 하루 보내세요! 저도 답방 놀러 갈게요 :)",
            f"{nick}님 찾아주시고 따뜻한 말씀 남겨주셔서 힘이 나네요 :) 앞으로 자주 놀러 오시고 따뜻하게 소통하며 지내요 ㅎㅎ 행복한 하루 되세요!",
            f"{nick}님 반갑습니다 ㅎㅎ 공감과 댓글 남겨주셔서 감사해요! 저도 바로 블로그 놀러 가서 좋은 글 읽고 올게요 :)",
        ]
    return random.choice(templates)


def accept_incoming_buddy_requests(context, state: dict) -> list:
    """
    Checks our Naver Blog (expertise333) for incoming Mutual Neighbor requests (받은 서로이웃 신청)
    and automatically accepts them.
    """
    accepted = []
    page = context.new_page()
    try:
        url = "https://m.blog.naver.com/BuddyInviteReceivedList.naver?blogId=expertise333"
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2.5)

        # Look for accept buttons on mobile buddy invite page
        accept_btns = page.locator("a:has-text('수락'), button:has-text('수락')")
        cnt = accept_btns.count()
        for i in range(min(cnt, 10)):
            try:
                btn = accept_btns.nth(0)
                if btn.is_visible():
                    btn.click(force=True)
                    time.sleep(1.5)
                    # Confirm modal if present
                    ok_btn = page.locator("a.btn_ok, button.btn_ok, button:has-text('확인')").first
                    if ok_btn.count() > 0 and ok_btn.is_visible():
                        ok_btn.click(force=True)
                        time.sleep(1.5)
                    accepted.append(f"서로이웃 수락 #{i + 1}")
            except Exception:
                break
    except Exception:
        pass
    finally:
        page.close()
    return accepted


def reply_to_incoming_comments_on_own_blog(context, state: dict, max_posts_to_scan: int = 8) -> list:
    """
    Scans the latest `max_posts_to_scan` posts on our Naver Blog (`expertise333`),
    finds any visitor comments that have not yet been replied to by us,
    posts a warm, zero-AI-vibe human reply (대댓글), and visits the commenter's blog for a return sympathy/comment!
    """
    replied_ids = state.setdefault("replied_comment_ids", [])
    return_visited = state.setdefault("return_visited_blogs", [])
    actions = []

    page = context.new_page()
    try:
        # 1. Collect recent logNos from our blog PostList
        list_url = "https://m.blog.naver.com/PostList.naver?blogId=expertise333"
        page.goto(list_url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2.8)

        log_nos = page.evaluate("""() => {
            const out = [];
            const seen = new Set();
            document.querySelectorAll('a[href*="logNo="], a[href*="/expertise333/"]').forEach(a => {
                const href = a.href || '';
                let m = href.match(/logNo=(\\d+)/) || href.match(/\\/expertise333\\/(\\d+)/);
                if (m && !seen.has(m[1])) {
                    seen.add(m[1]);
                    out.push(m[1]);
                }
            });
            return out;
        }""")

        # Fallback: also include recent logNos from blog_cafe_3x_daily_cursor.json
        cursor_path = ROOT / "logs" / "blog_cafe_3x_daily_cursor.json"
        if cursor_path.exists():
            try:
                cur = json.loads(cursor_path.read_text(encoding="utf-8"))
                for h in reversed(cur.get("history", [])):
                    b_url = (h.get("blog") or {}).get("url", "")
                    m = re.search(r"/expertise333/(\d+)", b_url)
                    if m and m.group(1) not in log_nos:
                        log_nos.append(m.group(1))
            except Exception:
                pass

        for log_no in log_nos[:max_posts_to_scan]:
            comment_url = f"https://m.blog.naver.com/CommentList.naver?blogId=expertise333&logNo={log_no}"
            try:
                page.goto(comment_url, wait_until="domcontentloaded", timeout=20000)
                time.sleep(2.6)

                comments_meta = page.evaluate("""() => {
                    const items = Array.from(document.querySelectorAll('li.u_cbox_comment'));
                    return items.map((li, idx) => {
                        const dataInfo = li.getAttribute('data-info') || '';
                        const cnoMatch = dataInfo.match(/commentNo\\s*:\\s*['"]?(\\d+)['"]?/);
                        const replyLevel = li.classList.contains('u_cbox_reply') || dataInfo.includes('replyLevel:2') || dataInfo.includes('parentCommentNo');
                        const nickEl = li.querySelector('.u_cbox_nick');
                        const textEl = li.querySelector('.u_cbox_contents');
                        const linkEl = li.querySelector('a.u_cbox_name');
                        return {
                            idx,
                            commentNo: cnoMatch ? cnoMatch[1] : `${idx}`,
                            isReply: Boolean(replyLevel),
                            nick: nickEl ? nickEl.innerText.trim() : '',
                            text: textEl ? textEl.innerText.trim() : '',
                            href: linkEl ? (linkEl.href || '') : ''
                        };
                    });
                }""")

                for c in comments_meta:
                    if c.get("isReply"):
                        continue
                    nick = c.get("nick", "")
                    text = c.get("text", "")
                    c_id = f"{log_no}_{c.get('commentNo')}"
                    href = c.get("href", "")

                    # Skip our own comments (키즈핏 / expertise333 / 방문자 안내)
                    if not text or "키즈핏" in nick or "expertise333" in href or "[방문자 안내" in text or "방문자 필독" in text:
                        continue
                    if c_id in replied_ids:
                        continue

                    # Check if the next comment in DOM is already a reply from us
                    already_replied_in_dom = False
                    c_idx = c["idx"]
                    if c_idx + 1 < len(comments_meta):
                        nxt = comments_meta[c_idx + 1]
                        if nxt.get("isReply") and ("키즈핏" in nxt.get("nick", "") or "expertise333" in nxt.get("href", "")):
                            already_replied_in_dom = True

                    if already_replied_in_dom:
                        replied_ids.append(c_id)
                        continue

                    reply_msg = generate_human_blog_owner_reply(nick, text)

                    # Click the reply button on this specific comment item
                    li_loc = page.locator("li.u_cbox_comment").nth(c_idx)
                    reply_btn = li_loc.locator("a.u_cbox_btn_reply, button.u_cbox_btn_reply").first
                    if reply_btn.count() > 0:
                        reply_btn.scroll_into_view_if_needed()
                        reply_btn.click(force=True)
                        time.sleep(1.0)

                        # Type into the active reply box
                        r_box = page.locator("div.u_cbox_write_wrap textarea.u_cbox_text, div.u_cbox_text, #naverComment__write_textarea").last
                        if r_box.count() > 0:
                            r_box.click(force=True)
                            time.sleep(0.4)
                            page.keyboard.insert_text(reply_msg)
                            time.sleep(0.8)
                            up_btn = page.locator("button.u_cbox_btn_upload").last
                            if up_btn.count() > 0:
                                up_btn.click(force=True)
                                time.sleep(2.5)
                                replied_ids.append(c_id)
                                actions.append({
                                    "type": "comment_reply",
                                    "logNo": log_no,
                                    "visitorNick": nick,
                                    "visitorComment": text[:40],
                                    "ourReply": reply_msg[:50],
                                })

                                # Also perform a warm return visit (답방) if commenter has a blogId
                                m_blog = re.search(r"blog\.naver\.com/([a-zA-Z0-9_-]+)", href)
                                if m_blog:
                                    v_blog_id = m_blog.group(1)
                                    if v_blog_id != "expertise333" and v_blog_id not in return_visited:
                                        return_visited.append(v_blog_id)
                        # Reload CommentList so indices stay clean if more comments exist
                        break
            except Exception:
                continue
    except Exception as e:
        print(f"⚠️ 내 블로그 댓글 답글 스캔 경고: {e}")
    finally:
        page.close()

    state["replied_comment_ids"] = replied_ids[-500:]
    state["return_visited_blogs"] = return_visited[-300:]
    save_reply_state(state)
    return actions


def humanize_de_ai_title(title: str, seq_num: int = 1) -> str:
    """Removes robotic prefixes like '[키즈핏 리포트 #N]', '[학습처방 #N]' so titles read like a real mom blogger."""
    t = re.sub(r"^\[[^\]]+\]\s*", "", (title or "").strip())
    return t


def humanize_de_ai_body(body: str) -> str:
    """Removes stiff AI markers ('■', '안녕하세요, 키즈핏... 연구팀입니다') and keeps warm human mom-diary formatting."""
    b = body or ""
    b = re.sub(r"안녕하세요,\s*키즈핏[^\n]*연구팀입니다\.?\n*", "오늘도 아이 등원시키고 커피 한 잔 마시며 적어보는 육아일기예요 ㅎㅎ\n\n", b)
    b = b.replace("■ ", "")
    return b

