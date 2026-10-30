#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/build_all_3_human_benchmarks_and_send.py
Implements all 3 user-provided real-world benchmarks to eliminate AI feel 100%:
1. [Instatoon Benchmark: @berrykku_toon (베리꾸) + Korean iPad Procreate Parenting Toon Audit]
   - 2D flat chubby mochi doodle characters (`ep07_berry_01..04`) on clean warm cream background (#FFFDF8)
   - Handwritten Korean lettering (`Gaegu-Bold.ttf`) with pastel crayon highlighter underlines and hand-drawn pointer lines
   - Zero computer pill bubbles, zero dark-blue QR ad banner on Cut 4
2. [Blog & Cafe Benchmark: m.blog.naver.com/0_bean_/224449376030 ('직접 써본 육아용품 추천·비추천 솔직 리스트')]
   - Rewrites the Blog & Cafe post bank (`src/data/overnight-upgraded-blog-cafe-bank.json`) into authentic Korean mom
     '내돈내산 N개월 정착 추천 vs 당근행 비추천 솔직 비교 후기' format with zero AI formatting.
3. [YouTube Shorts Benchmark: youtube.com/shorts/Mq8qoO-sYNc ('팡팡쀼 — 육아는 장비빨! 필수 육아템 5가지 추천')]
   - Generates a 9:16 vertical YouTube Shorts / Reels / Clip video with natural conversational Korean neural voice (`edge_tts`
     `ko-KR-SunHiNeural` tuned with conversational prosody + warm acoustic BGM ducking) and bold pop-up item recommendation cards.
"""

import asyncio
import json
import math
import shutil
import subprocess
import sys
import wave
from datetime import datetime
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
import edge_tts

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
BRAIN_DIR = Path(r"C:\Users\jjang\.gemini\antigravity\brain\e6c1bb34-f211-4899-a864-42850c85ae86")
WEBTOON_ROOT_KO = ROOT / "웹툰_모음"
WEBTOON_SAMPLE_DIR = ROOT / "samples" / "8_insta_threads_webtoon_pack"
CLIP_OUT_KO = ROOT / "네이버클립_웹툰영상_모음"
UPGRADED_BANK_JSON = ROOT / "src" / "data" / "overnight-upgraded-blog-cafe-bank.json"


def get_hand_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        str(ROOT / "src" / "fonts" / "Gaegu-Bold.ttf"),
        str(ROOT / "src" / "fonts" / "NanumSquareRoundEB.ttf"),
        "C:/Windows/Fonts/malgunbd.ttf",
    ]
    for fp in candidates:
        if Path(fp).exists():
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()


def get_round_font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    candidates = [
        str(ROOT / "src" / "fonts" / ("NanumSquareRoundEB.ttf" if bold else "NanumSquareRoundB.ttf")),
        "C:/Windows/Fonts/malgunbd.ttf",
    ]
    for fp in candidates:
        if Path(fp).exists():
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()


# ==============================================================================
# 1. @berrykku_toon (베리꾸) STYLE HAND-DRAWN INSTATOON RENDERER
# ==============================================================================
def draw_berrykku_handwritten_dialogue(
    canvas: Image.Image,
    center_xy: tuple[int, int],
    pointer_from_to: tuple[tuple[int, int], tuple[int, int]] | None,
    lines: list[str],
    highlight_line_idx: int = 0,
    highlight_rgb: tuple[int, int, int] = (254, 240, 138),
    font_size: int = 48,
) -> Image.Image:
    """
    Renders @berrykku_toon style hand-lettered Korean dialogue directly on the warm cream canvas:
    - Uses Gaegu-Bold handwriting font (no rigid geometric computer boxes!)
    - Draws a soft pastel crayon highlighter bar behind `highlight_line_idx`
    - Draws a short, organic curved hand-drawn pen pointer line toward the speaker
    """
    overlay = canvas.convert("RGBA")
    draw = ImageDraw.Draw(overlay)
    f_hand = get_hand_font(font_size)

    line_bboxes = [draw.textbbox((0, 0), ln, font=f_hand) for ln in lines]
    line_ws = [bb[2] - bb[0] for bb in line_bboxes]
    line_hs = [bb[3] - bb[1] for bb in line_bboxes]
    line_gap = 14
    total_h = sum(line_hs) + line_gap * max(0, len(lines) - 1)

    cx, cy = center_xy
    cur_y = cy - total_h // 2

    ink_rgb = (58, 42, 34, 255)  # Warm dark brown Procreate pen ink

    for idx, ln in enumerate(lines):
        tw = line_ws[idx]
        th = line_hs[idx]
        lx = cx - tw // 2
        if idx == highlight_line_idx:
            # Soft pastel crayon highlighter bar underneath the text
            hl_y1 = cur_y + int(th * 0.42)
            hl_y2 = cur_y + th + 8
            draw.rounded_rectangle(
                [(lx - 10, hl_y1), (lx + tw + 10, hl_y2)],
                radius=10,
                fill=highlight_rgb + (215,),
            )
        draw.text((lx, cur_y), ln, font=f_hand, fill=ink_rgb)
        cur_y += th + line_gap

    # Hand-drawn short pointer line (꼬리선) from text toward character
    if pointer_from_to:
        (px1, py1), (px2, py2) = pointer_from_to
        # Slightly curved 3-point stroke
        mx = (px1 + px2) // 2 + (8 if px2 >= px1 else -8)
        my = (py1 + py2) // 2
        draw.line([(px1, py1), (mx, my), (px2, py2)], fill=ink_rgb, width=5, joint="curve")

    return overlay.convert("RGB")


def render_berrykku_5th_summary_card() -> Image.Image:
    """
    Renders the 5th Instagram Carousel Summary Card in warm @berrykku_toon hand-drawn notebook doodle style
    (warm cream #FFFDF8 paper, brown monoline doodle border, Gaegu-Bold handwriting, pastel highlighter bars).
    """
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), (255, 253, 248))
    draw = ImageDraw.Draw(img)
    ink = (58, 42, 34)

    # Outer hand-drawn style notebook frame
    draw.rounded_rectangle([(36, 36), (W - 36, H - 36)], radius=36, fill=(255, 253, 248), outline=ink, width=6)
    draw.rounded_rectangle([(52, 52), (W - 52, H - 52)], radius=28, outline=(228, 218, 205), width=2)

    f_badge = get_hand_font(36)
    f_title = get_hand_font(54)
    f_pt_head = get_hand_font(42)
    f_pt_sub = get_round_font(28, bold=False)
    f_foot = get_hand_font(32)

    # Top doodle pill tag
    tag_txt = "[저장 필수] 오늘 저녁 바로 써먹는 육아팁!"
    tb = draw.textbbox((0, 0), tag_txt, font=f_badge)
    tw = tb[2] - tb[0]
    draw.rounded_rectangle([(540 - tw // 2 - 28, 84), (540 + tw // 2 + 28, 146)], radius=26, fill=(254, 240, 138), outline=ink, width=4)
    draw.text((540 - tw // 2, 92), tag_txt, font=f_badge, fill=ink)

    # Main Title
    t_txt = "학원 다녀오면 까먹는 아이 '3분 처방전'"
    ttb = draw.textbbox((0, 0), t_txt, font=f_title)
    ttw = ttb[2] - ttb[0]
    draw.rounded_rectangle([(540 - ttw // 2 - 12, 208), (540 + ttw // 2 + 12, 242)], radius=10, fill=(221, 214, 254))
    draw.text((540 - ttw // 2, 174), t_txt, font=f_title, fill=ink)

    points = [
        (
            "1. 눈으로 다시 읽기는 멈추기!",
            "책을 보며 '아~ 아는 거네!' 하는 건 뇌의 익숙함 착각이에요",
            (254, 226, 226),
        ),
        (
            "2. 책을 덮고 빈 종이에 핵심 3개만 그리기!",
            "힌트 없이 머릿속에서 꺼내볼 때 장기기억이 3배 단단해져요",
            (209, 250, 229),
        ),
        (
            "3. 엄마/아빠한테 1분 '일일 선생님 놀이'!",
            "말로 설명하다가 막히는 부분이 바로 진짜 모르는 구멍이에요",
            (254, 240, 138),
        ),
    ]

    y_cur = 285
    for p_title, p_sub, hl_col in points:
        draw.rounded_rectangle([(82, y_cur), (W - 82, y_cur + 195)], radius=28, fill=(255, 255, 255), outline=ink, width=4)
        pb = draw.textbbox((0, 0), p_title, font=f_pt_head)
        pw = pb[2] - pb[0]
        draw.rounded_rectangle([(116, y_cur + 56), (124 + pw, y_cur + 84)], radius=8, fill=hl_col)
        draw.text((118, y_cur + 28), p_title, font=f_pt_head, fill=ink)
        draw.text((118, y_cur + 114), p_sub, font=f_pt_sub, fill=(90, 75, 65))
        y_cur += 222

    # Bottom soft note
    foot_txt = "프로필 링크(@kids_fit1)에서 우리 아이 두뇌/키 1분 무료 체크!"
    fb = draw.textbbox((0, 0), foot_txt, font=f_foot)
    fw = fb[2] - fb[0]
    draw.text((540 - fw // 2, 962), foot_txt, font=f_foot, fill=(124, 58, 237))

    return img


def build_berrykku_episode7_pack():
    raw_sources = [
        BRAIN_DIR / "ep07_berry_01_1793275063748.jpg",
        BRAIN_DIR / "ep07_berry_02_1793275973579.jpg",
        BRAIN_DIR / "ep07_berry_03_1793276648083.jpg",
        BRAIN_DIR / "ep07_berry_04_1793277303146.jpg",
    ]

    cuts_dialogue = [
        {
            "top_lines": ['"이상하다... 학원에서 설명 들을 땐', '분명 다 알았는데 혼자 풀려니 백지예요 ㅠㅠ"'],
            "top_hl": 1,
            "top_color": (221, 214, 254),
            "top_ptr": ((360, 195), (380, 325)),
            "bot_lines": ["(내 피 같은 학원비... 방금 학원 차에서 내렸잖아... 땀 삐질)"],
            "bot_hl": 0,
            "bot_color": (254, 240, 138),
            "bot_ptr": None,
        },
        {
            "top_lines": ["눈으로만 다시 읽으면 뇌는 '안다'고 착각해요!", "책을 덮고 스스로 꺼내보는 '인출 연습'이 핵심!"],
            "top_hl": 1,
            "top_color": (254, 240, 138),
            "top_ptr": None,
            "bot_lines": ['"아하! 문제집만 여러 권 풀릴 게 아니라', '오늘 배운 걸 입 밖으로 꺼내보게 해야 하는구나!"'],
            "bot_hl": 1,
            "bot_color": (209, 250, 229),
            "bot_ptr": ((660, 895), (680, 825)),
        },
        {
            "top_lines": ['"자~ 일일 선생님 수업 시작합니다!', '오늘 배운 핵심 3가지는 이 별표가 포인트예요!"'],
            "top_hl": 0,
            "top_color": (254, 226, 226),
            "top_ptr": ((260, 195), (245, 315)),
            "bot_lines": ['"우와~ 우리 딸이 칠판에 그리면서 설명해 주니까', '아빠랑 곰돌이도 단번에 이해됐어요! 짝짝짝!"'],
            "bot_hl": 0,
            "bot_color": (254, 240, 138),
            "bot_ptr": ((670, 895), (680, 825)),
        },
        {
            "top_lines": ['"아빠! 어제 일일 선생님 놀이로 설명했던 문제', '오늘 단원평가에 그대로 나와서 다 맞았어요!!"'],
            "top_hl": 1,
            "top_color": (254, 240, 138),
            "top_ptr": ((350, 195), (350, 325)),
            "bot_lines": ["문제집 열 장보다 '하루 3분 일일 선생님 놀이'가 최고네!"],
            "bot_hl": 0,
            "bot_color": (209, 250, 229),
            "bot_ptr": None,
        },
    ]

    rendered_cuts = []
    f_ep_stamp = get_hand_font(30)

    for idx, (src_p, d_cfg) in enumerate(zip(raw_sources, cuts_dialogue), start=1):
        base = Image.open(src_p).convert("RGB").resize((1080, 1080), Image.Resampling.LANCZOS)
        # Small subtle hand-lettered top-left stamp on Cut 1
        if idx == 1:
            dr = ImageDraw.Draw(base)
            dr.text((42, 24), "베리꾸 감성 육아/공부툰 #7화", font=f_ep_stamp, fill=(140, 120, 105))

        base = draw_berrykku_handwritten_dialogue(
            base,
            center_xy=(540, 125),
            pointer_from_to=d_cfg["top_ptr"],
            lines=d_cfg["top_lines"],
            highlight_line_idx=d_cfg["top_hl"],
            highlight_rgb=d_cfg["top_color"],
            font_size=46,
        )
        base = draw_berrykku_handwritten_dialogue(
            base,
            center_xy=(540, 965),
            pointer_from_to=d_cfg["bot_ptr"],
            lines=d_cfg["bot_lines"],
            highlight_line_idx=d_cfg["bot_hl"],
            highlight_rgb=d_cfg["bot_color"],
            font_size=44,
        )
        rendered_cuts.append(base)

    summary_card = render_berrykku_5th_summary_card()

    # Build 2x2 grid for Threads
    grid = Image.new("RGB", (2160, 2160), (255, 253, 248))
    positions = [(0, 0), (1080, 0), (0, 1080), (1080, 1080)]
    for c_img, (px, py) in zip(rendered_cuts, positions):
        grid.paste(c_img, (px, py))
    g_draw = ImageDraw.Draw(grid)
    g_draw.line([(1080, 0), (1080, 2160)], fill=(230, 220, 208), width=6)
    g_draw.line([(0, 1080), (2160, 1080)], fill=(230, 220, 208), width=6)
    grid_1080 = grid.resize((1080, 1080), Image.Resampling.LANCZOS)

    folder_name = "7화_학원다녀오면까먹는아이백지복습_웹툰"
    for base_dir in [WEBTOON_ROOT_KO, WEBTOON_SAMPLE_DIR]:
        f_dir = base_dir / folder_name
        f_dir.mkdir(parents=True, exist_ok=True)
        for idx, c_img in enumerate(rendered_cuts, start=1):
            c_img.save(f_dir / f"0{idx}_{idx}컷.png", "PNG")
        summary_card.save(f_dir / "05_5컷_핵심요약저장카드.png", "PNG")
        grid_1080.save(f_dir / "00_전체_4컷_한눈에보기_합본.png", "PNG")

    print("✅ [1/3] @berrykku_toon (베리꾸) 스타일 손그림·손글씨 7화 웹툰 5장 + 쓰레드 합본 생성 완료!")
    return rendered_cuts, summary_card, grid_1080


# ==============================================================================
# 2. 0_bean_ BENCHMARK STYLE ('직접 써본 추천·비추천 솔직 리스트') BLOG & CAFE BANK
# ==============================================================================
def rebuild_0bean_style_blog_and_cafe_bank():
    """
    Rewrites `src/data/overnight-upgraded-blog-cafe-bank.json` in the exact benchmark style of
    https://m.blog.naver.com/0_bean_/224449376030:
    - Real Korean mom 'N개월 직접 겪어본 추천·비추천 솔직 비교 리스트'
    - Zero AI numbering ('■ 1.', '[리포트 #N]'), zero corporate greetings
    """
    posts = [
        {
            "theme_id": "BEAN-01",
            "blog_category": "월령별 두뇌·소근육 발달",
            "cafe_board": "두뇌·소근육·학습 질문방",
            "blog_title": "초등 입학 후 사모은 공부·집중력 육아용품 리스트｜6개월 써본 찐 추천·비추천 솔직 정리",
            "cafe_title": "초등 들어가서 사줬던 공부·집중력 육아템들... 6개월 써보고 정착한 추천 vs 비추천 나눠봐요 ㅎㅎ",
            "points": [
                "비추천: 눈으로만 읽는 요약집 & 소리 나는 알람 시계",
                "추천 1: 빨간 면적이 줄어드는 무소음 시각 타이머",
                "추천 2: 거실 미니 화이트보드 & 3분 일일 선생님 놀이",
            ],
            "blog_body": """아이가 초등학교에 들어가기 전에는 주변 엄마들이 좋다는 문제집이나 공부 아이템을 보면 불안한 마음에 무조건 장바구니에 담곤 했어요 ㅎㅎ

막상 입학하고 한 학기 넘게 매일 저녁 식탁에서 아이랑 부딪혀보니, 사놓고 당근마켓으로 보낸 비추천 아이템도 있고 반대로 지금까지 매일 쓰고 있는 찐 추천 정착템도 확실히 갈리더라구요. 혹시 저처럼 시행착오 줄이고 싶으신 분들을 위해 솔직하게 추천·비추천 리스트를 정리해 볼게요!

먼저 아쉬웠던 비추천(실패담)부터 적어볼게요 ㅠㅠ

첫 번째 비추천은 '빽빽한 전과식 개념 요약집 여러 권 사주기'였어요.
학원에서 돌아오면 다 이해했다고 하길래 개념서를 다시 읽게 했는데, 나중에 알고 보니 눈으로 글자만 훑으면서 '아 이거 아는 내용이야' 하고 넘어가는 익숙함 착각 때문이더라구요. 막상 단원평가 시험지를 마주하면 머릿속이 하얘져서 별표만 잔뜩 쳐오는데 속이 타들어 갔습니다.

두 번째 비추천은 '째깍째깍 소리 나는 일반 주방 타이머'였어요.
집중 시간 재주려고 샀는데 초침 소리에 아이가 더 예민해지고 알람이 갑자기 크게 울리면 깜짝 놀라서 오히려 역효과가 나더라구요.

반대로 6개월째 매일 저녁 본전 뽑고 있는 찐 추천 정착템 3가지예요!

첫 번째 추천은 '미니 화이트보드(또는 빈 스케치북) + 3분 일일 선생님 놀이'예요.
문제집 한 권 더 풀리는 대신 책을 딱 덮고 "오늘 배운 핵심 3가지만 칠판에 그려서 아빠랑 곰돌이한테 일일 선생님처럼 설명해 줄래?" 해봤거든요. 아이가 신나서 장난감 안경 쓰고 설명하다가 어버버 막히는 부분이 나오는데, 거기가 바로 아이가 진짜 모르는 구멍이더라구요! 그 부분만 별표 치고 한 번 더 봐주니 시험 점수가 거짓말처럼 달라졌어요.

두 번째 추천은 '빨간 눈금이 줄어드는 무소음 시각 타이머'예요.
유튜브 볼 때나 문제 풀 때 엄마가 소리 지르는 대신 아이 손으로 직접 20분을 맞추게 했더니, 빨간 면적이 사라지는 게 눈에 보여서 그런지 스스로 약속을 지키는 힘이 훨씬 좋아졌어요.

세 번째 추천은 '30도 각도조절 원목 독서대'예요.
평평한 책상에 책을 놓으면 10분 만에 고개가 책 속으로 들어가던 아이가 독서대 하나로 등허리를 펴고 앉는 시간이 두 배 가까이 늘었답니다.

혹시 우리 아이가 지금 연령대에 비해 키·몸무게 백분위는 어느 정도인지, 그리고 두뇌 학습 성향(작업기억·집중력)은 어떤 타입인지 궁금하신 분들은 제가 매달 체크할 때 쓰는 질병관리청 기준 무료 도표 남겨둘 테니 가볍게 테스트해 보세요 ㅎㅎ
https://kidsfit.co.kr""",
            "cafe_body": """초등 입학하기 전엔 남들 좋다는 문제집이랑 책상 아이템 사주면 알아서 공부 잘할 줄 알았는데ㅋㅋ 막상 한 학기 겪어보니 돈만 쓰고 방치한 비추천 템들이 꽤 많았어요 ㅠㅠ

맘님들은 저처럼 시행착오 겪지 마시라고 제가 6개월 동안 직접 겪어본 추천 vs 비추천 솔직하게 남겨봐요!

[솔직 비추천 2가지]
1. 눈으로만 읽는 두꺼운 요약집 여러 권 돌리기
애가 학원 다녀와서 "엄마 나 다 알아!" 하길래 믿었는데 막상 시험 보면 다 틀려오더라구요 ㅠㅠ 눈으로 읽으면 아는 것 같아도 막상 빈 종이 앞에선 기억이 안 나는 거였어요.

2. 소리 시끄러운 일반 타이머
째깍거리는 소리 때문에 애가 더 산만해져서 결국 서랍행 했네요 ㅎㅎ

[정착한 찐 추천 2가지]
1. 작은 화이트보드(빈 공책) + 3분 일일 선생님 놀이
책 딱 덮고 "오늘 배운 거 3가지만 인형이랑 엄마한테 선생님처럼 알려줘~" 했더니 자기가 설명하다가 막히는 부분을 스스로 찾더라구요! 문제집 열 장 풀리는 것보다 이게 진짜 대박이었어요.

2. 빨간 눈금 무소음 시각 타이머 + 원목 독서대
아이 손으로 직접 20분 맞추게 하니 미디어 끄라고 실랑이할 일이 확 줄고 독서대로 거북목도 많이 잡혔어요 ㅎㅎ

혹시 애들 개월 수별 키 백분위랑 두뇌 공부 성향 무료로 체크해보실 분들은 제가 매달 돌려보는 사이트인데 로그인도 없어서 편하더라구요 👇
https://kidsfit.co.kr""",
            "tags": ["초등육아템", "육아용품추천", "초등공부법", "백지복습", "시각타이머", "원목독서대", "내돈내산", "키즈핏"],
        },
        {
            "theme_id": "BEAN-02",
            "blog_category": "우리 아이 키성장·성조숙증",
            "cafe_board": "우리아이 키성장·성조숙증",
            "blog_title": "아이 키 성장 위해 해봤던 밤 루틴 & 영양제 리스트｜1년 겪어본 추천·비추천 솔직 후기",
            "cafe_title": "애 키 크려고 1년 동안 해봤던 것들 중에 효과 본 추천 vs 후회한 비추천 정리해봤어요!",
            "points": [
                "비추천: 자기 직전 우유 한 잔 & 무작정 사준 고가 영양제",
                "추천 1: 취침 2시간 전 공복 유지 & 밤 10시 암막 소등",
                "추천 2: 저녁 식후 구연산 칼슘·D3·아연 & 5분 다리 마사지",
            ],
            "blog_body": """또래보다 아이 키가 조금 작다 보니 주변에서 키에 좋다는 음식이나 영양제 이야기를 들으면 귀가 팔랑거려서 이것저것 참 많이도 해봤어요 ㅎㅎ

1년 넘게 매달 키를 재면서 기록해보니 오히려 키 성장을 방해했던 비추천 습관도 있었고, 돈 안 들이고도 키 크는 속도를 확 끌어올려 준 찐 추천 루틴도 있었는데요. 솔직하게 정리해 볼게요!

먼저 후회했던 비추천 습관 2가지예요.

첫 번째 비추천은 '잠들기 직전에 키 크라고 먹인 우유 한 잔과 과일 야식'이었어요.
자기 전에 배고프다고 하면 우유나 과일을 챙겨줬는데, 밤에 혈당과 인슐린이 올라가면 정작 밤 10시 깊은 잠에서 나와야 할 성장호르몬이 제대로 안 나온다고 하더라구요 ㅠㅠ 게다가 우유 먹고 배가 꾸르륵거리니 밤새 뒤척여서 수면의 질도 나빴어요.

두 번째 비추천은 '아이 몸무게나 식습관 안 따지고 남들 먹는 영양제 따라 사기'였어요.
알이 크거나 신맛이 강하면 아이가 입에도 안 대서 유통기한 지나 버린 게 한두 통이 아니었답니다.

반대로 바꾸고 나서 6개월 만에 성장 속도가 눈에 띄게 달라진 찐 추천 3가지예요!

첫 번째 추천은 '취침 2시간 전 공복 유지 + 밤 10시 암막 소등'이에요.
저녁밥을 7시 전에 든든히 먹이고 잠들기 2시간 전부터는 따뜻한 물만 마시게 했더니 밤 10시 전에 깊게 잠들고 아침에 기지개 켜며 일어나는 모습부터 달라졌어요.

두 번째 추천은 '잠들기 전 5분 따뜻한 물수건 종아리 찜질 & 문틀 철봉 매달리기'예요.
낮 동안 책상에 앉아 눌려 있던 척추와 무릎 성장판을 자기 전에 살살 풀어주니 밤에 다리 아프다고 깨는 일도 사라졌습니다.

세 번째 추천은 '저녁 식사 직후 챙기는 흡수율 높은 칼슘·비타민D3·아연'이에요.
우유 대신 두부·멸치 반찬과 함께 아이 체중에 맞춘 칼슘·아연을 챙겨주니 편식도 줄고 밥맛도 훨씬 좋아졌어요.

우리 아이가 지금 질병관리청 성장도표 기준으로 또래 상위 몇 %인지, 부모 유전키 대비 숨은 키 잠재력은 몇 cm나 더 클 수 있는지 궁금하신 분들은 제가 매달 기록할 때 쓰는 무료 계산기 남겨둘 테니 1분 만에 확인해 보세요 ㅎㅎ
https://kidsfit.co.kr""",
            "cafe_body": """또래보다 애가 좀 작아서 지난 1년 동안 키에 좋다는 건 다 해봤는데요 ㅎㅎ 직접 겪어보니 오히려 독이 됐던 비추천 습관이랑 효과 제대로 본 추천 루틴이 확실히 나뉘더라구요!

[후회한 비추천 2가지]
1. 자기 직전에 우유 한 컵 먹여서 재우기
키 크라고 매일 밤 9시 반에 우유 데워줬는데, 자기 직전에 음식 들어가면 인슐린 때문에 밤 10시 성장호르몬이 안 나온대요 ㅠㅠ 우유 끊고 나서 오히려 밤잠을 훨씬 깊게 자요!

2. 후기만 보고 무작정 산 대용량 영양제
애 입맛에 안 맞으면 한 포 먹고 그대로 당근행이더라구요 ㅠㅠ

[효과 톡톡히 본 찐 추천 3가지]
1. 잠들기 2시간 전 공복 + 밤 9시 반 거실 조명 어둡게 하기
2. 저녁 샤워 후 실내 문틀 철봉 10초 매달리기 + 종아리 5분 마사지
3. 저녁밥 먹고 바로 챙겨주는 구연산 칼슘·비타민D3·아연

이렇게 딱 세 가지만 지켰는데도 반년 만에 키 크는 속도가 확 붙어서 넘 신기했어요 ㅎㅎ 우리 아이 현재 키 백분위랑 3단 예상키 무료로 계산해보실 맘님들은 여기 들어가서 생년월일이랑 키만 넣어보세요 👇
https://kidsfit.co.kr""",
            "tags": ["아이키성장", "어린이영양제추천", "밤10시수면", "어린이칼슘", "어린이아연", "예상키계산기", "내돈내산후기", "키즈핏"],
        },
    ]

    UPGRADED_BANK_JSON.parent.mkdir(parents=True, exist_ok=True)
    UPGRADED_BANK_JSON.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    print("✅ [2/3] 0_bean_ 블로그 벤치마크 스타일('직접 써본 추천·비추천 솔직 리스트') 블로그 & 카페 원고 뱅크 개편 완료!")
    return posts


# ==============================================================================
# 3. PANGPANG_COUPLE (Mq8qoO-sYNc) BENCHMARK STYLE HUMAN-VOICE SHORTS GENERATOR
# ==============================================================================
async def synthesize_natural_korean_voice_mp3(out_mp3: Path, script_lines: list[str]):
    """
    Uses Microsoft Edge Neural TTS (`ko-KR-SunHiNeural`) with conversational rate (+10%)
    and warm pitch (+2Hz) to produce a bright, natural Korean creator voiceover (팡팡쀼 쇼츠 톤).
    Falls back automatically to Google Translate Korean TTS + ffmpeg warm prosody filter
    if Microsoft Edge WebSocket returns 403.
    """
    import email.utils
    import urllib.parse
    import urllib.request
    from datetime import datetime as dt, timezone as tz
    from edge_tts.drm import DRM

    try:
        req = urllib.request.Request("https://www.bing.com", method="HEAD")
        with urllib.request.urlopen(req, timeout=10) as resp:
            date_hdr = resp.headers.get("Date")
            if date_hdr:
                server_ts = email.utils.parsedate_to_datetime(date_hdr).timestamp()
                local_ts = dt.now(tz.utc).timestamp()
                DRM.clock_skew_seconds = server_ts - local_ts
    except Exception:
        pass

    full_text = " ... ".join(script_lines)
    try:
        communicate = edge_tts.Communicate(text=full_text, voice="ko-KR-SunHiNeural", rate="+10%", pitch="+2Hz")
        await communicate.save(str(out_mp3))
        if out_mp3.exists() and out_mp3.stat().st_size > 1000:
            return
    except Exception as e:
        print(f"  [TTS Notice] edge_tts fallback triggered ({e}) -> using Google Korean Neural Voice + ffmpeg warm prosody")

    raw_mp3 = out_mp3.parent / "_tmp_gtts_raw.mp3"
    chunks = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    for seg in script_lines:
        q = urllib.parse.quote(seg)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q={q}"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as r:
            chunks.append(r.read())
    raw_mp3.write_bytes(b"".join(chunks))

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run(
        [
            ffmpeg_exe, "-y",
            "-i", str(raw_mp3),
            "-af", "atempo=1.18,equalizer=f=240:width_type=o:width=2:g=3",
            "-c:a", "libmp3lame", "-b:a", "192k",
            str(out_mp3),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        raw_mp3.unlink()
    except Exception:
        pass


def build_pangpang_style_human_voice_shorts(rendered_cuts: list[Image.Image]) -> Path:
    """
    Builds a 9:16 vertical YouTube Shorts / Reels / Naver Clip video modeled after
    https://youtube.com/shorts/Mq8qoO-sYNc ("육아는 장비빨! 필수 육아템 추천"):
    - Natural Korean creator voiceover (`ko-KR-SunHiNeural` +10% conversational speed)
    - Mixed with soft background piano melody at low volume (-18dB) so voice is crystal clear
    - Dynamic item recommendation badges ("추천 꿀템 1", "추천 꿀템 2", "추천 꿀템 3") + bold pop-up subtitles
    """
    CLIP_OUT_KO.mkdir(parents=True, exist_ok=True)
    voice_mp3 = CLIP_OUT_KO / "_tmp_pangpang_voice.mp3"
    bgm_wav = CLIP_OUT_KO / "_tmp_pangpang_bgm.wav"
    mixed_aac = CLIP_OUT_KO / "_tmp_pangpang_mixed.m4a"
    out_mp4 = CLIP_OUT_KO / "07_유튜브쇼츠_육아는장비빨_초등공부자세필수템추천_실제음성버전.mp4"

    script_segments = [
        "육아는 장비빨! 학원 다녀와도 까먹는 아이, 공부 집중력 살려준 내돈내산 필수 꿀템 세 가지 바로 알려드릴게요!",
        "첫 번째, 눈으로만 읽는 요약집은 이제 그만! 작은 미니 칠판 하나 두고 엄마한테 일분 동안 일일 선생님처럼 설명하게 해보세요.",
        "두 번째, 빨간 눈금이 줄어드는 무소음 시각 타이머와 원목 독서대! 잔소리 없이도 고개가 반듯하게 펴지고 이십 분 집중력이 살아납니다.",
        "세 번째, 우리 아이 정확한 키 백분위와 두뇌 학습 성향은 프로필 링크 키즈핏에서 일분 만에 무료로 확인해 보세요!",
    ]

    asyncio.run(synthesize_natural_korean_voice_mp3(voice_mp3, script_segments))

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    # Probe duration of voice_mp3 via ffmpeg or set 16.0s
    from generate_pageflip_webtoons_and_insta_profiles import generate_soothing_lullaby_piano_wav, render_page_flip_card
    total_dur = 16.0
    generate_soothing_lullaby_piano_wav(bgm_wav, total_dur + 0.5, 44100)

    # Mix voice_mp3 (volume 1.35) + bgm_wav (volume 0.16) into mixed_aac
    subprocess.run(
        [
            ffmpeg_exe, "-y",
            "-i", str(voice_mp3),
            "-i", str(bgm_wav),
            "-filter_complex", "[0:a]volume=1.4[v];[1:a]volume=0.16[b];[v][b]amix=inputs=2:duration=longest:dropout_transition=2[aout]",
            "-map", "[aout]",
            "-c:a", "aac", "-b:a", "192k",
            "-t", str(total_dur),
            str(mixed_aac),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    VW, VH = 1080, 1920
    fps = 24
    cut_dur = 4.0
    flip_dur = 0.55
    n_frames_per_cut = int(round(cut_dur * fps))
    n_flip_frames = int(round(flip_dur * fps))
    total_frames = n_frames_per_cut * 4

    f_top_pill = get_round_font(30, bold=True)
    f_hook = get_hand_font(62)
    f_item_tag = get_round_font(32, bold=True)
    f_sub = get_round_font(38, bold=True)
    f_cta = get_round_font(28, bold=True)

    slides_meta = [
        {
            "top_pill": "[육아는 장비빨!] 초등 공부/집중력 필수템 TOP 3",
            "hook": "학원 다녀오면 까먹는 아이?\n정착한 '공부 꿀템' 3가지!",
            "item_badge": "[비추천] 눈으로만 읽는 두꺼운 요약집",
            "item_color": (225, 29, 72),
            "sub": "학원 차에서 내리면 백지가 되는 이유!\n'익숙함 착각'을 깨는 장비가 필요해요",
        },
        {
            "top_pill": "[육아는 장비빨!] 초등 공부/집중력 필수템 TOP 3",
            "hook": "꿀템 1. 거실 미니 칠판 &\n'3분 일일 선생님 놀이'",
            "item_badge": "[추천 꿀템 01] 메타인지 미니 화이트보드",
            "item_color": (79, 70, 229),
            "sub": "책을 덮고 빈 칠판에 3가지만 그리며\n엄마한테 설명하면 장기기억 3배 폭발!",
        },
        {
            "top_pill": "[육아는 장비빨!] 초등 공부/집중력 필수템 TOP 3",
            "hook": "꿀템 2. 무소음 시각 타이머 &\n30도 각도조절 원목 독서대",
            "item_badge": "[추천 꿀템 02] 무소음 타이머 + 원목 독서대",
            "item_color": (16, 185, 129),
            "sub": "아이 손으로 직접 20분 타이머 맞추기!\n거북목도 펴지고 스스로 책상에 앉아요",
        },
        {
            "top_pill": "[육아는 장비빨!] 초등 공부/집중력 필수템 TOP 3",
            "hook": "꿀템 3. 우리 아이 맞춤\n키 백분위 & 두뇌 역량 진단기",
            "item_badge": "[추천 꿀템 03] 키즈핏 1분 무료 진단 리포트",
            "item_color": (234, 88, 12),
            "sub": "프로필 링크(kidsfit.co.kr)에서 로그인 없이\n우리 아이 예상키와 공부법을 확인하세요!",
        },
    ]

    cmd = [
        ffmpeg_exe, "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{VW}x{VH}",
        "-pix_fmt", "rgb24",
        "-r", str(fps),
        "-i", "-",
        "-i", str(mixed_aac),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "17",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        str(out_mp4),
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    card_w, card_h = 980, 980
    card_x, card_y = 50, 355
    loaded_cards = [c.resize((card_w, card_h), Image.Resampling.LANCZOS) for c in rendered_cuts]

    global_f = 0
    for idx, meta in enumerate(slides_meta):
        curr_base = loaded_cards[idx]
        next_base = loaded_cards[idx + 1] if (idx + 1) < len(loaded_cards) else None

        for f_idx in range(n_frames_per_cut):
            prog = f_idx / float(max(1, n_frames_per_cut - 1))
            g_prog = global_f / float(max(1, total_frames - 1))
            global_f += 1

            frame = Image.new("RGB", (VW, VH), (255, 253, 248))
            draw = ImageDraw.Draw(frame)

            # Top warm header band
            draw.rectangle((0, 0, VW, 325), fill=(254, 249, 195))
            draw.line([(0, 325), (VW, 325)], fill=(58, 42, 34), width=5)

            # Top pill
            tp = meta["top_pill"]
            bb_p = draw.textbbox((0, 0), tp, font=f_top_pill)
            pw = (bb_p[2] - bb_p[0]) + 48
            draw.rounded_rectangle(((VW - pw) // 2, 36, (VW + pw) // 2, 92), radius=28, fill=(58, 42, 34))
            draw.text(((VW - (bb_p[2] - bb_p[0])) // 2, 48 - bb_p[1]), tp, font=f_top_pill, fill=(254, 240, 138))

            # Hook lines in Gaegu-Bold
            ty = 112
            for hline in meta["hook"].split("\n"):
                bb_h = draw.textbbox((0, 0), hline, font=f_hook)
                hw = bb_h[2] - bb_h[0]
                draw.text(((VW - hw) // 2, ty - bb_h[1]), hline, font=f_hook, fill=(58, 42, 34))
                ty += 68

            # Center card with page-flip
            frames_left = n_frames_per_cut - f_idx
            if next_base is not None and frames_left <= n_flip_frames:
                flip_p = 1.0 - (frames_left / float(max(1, n_flip_frames)))
                card_img = render_page_flip_card(curr_base, next_base, flip_p)
            else:
                zoom = 1.0 + 0.02 * math.sin(prog * math.pi)
                zw, zh = int(card_w * zoom), int(card_h * zoom)
                resized = curr_base.resize((zw, zh), Image.Resampling.BILINEAR)
                cx = (zw - card_w) // 2
                cy = (zh - card_h) // 2
                card_img = resized.crop((cx, cy, cx + card_w, cy + card_h))

            frame.paste(card_img, (card_x, card_y))
            draw.rounded_rectangle((card_x, card_y, card_x + card_w, card_y + card_h), radius=28, outline=(58, 42, 34), width=6)

            # Floating item recommendation badge overlapping bottom of card
            ib_txt = meta["item_badge"]
            bb_ib = draw.textbbox((0, 0), ib_txt, font=f_item_tag)
            ib_w = (bb_ib[2] - bb_ib[0]) + 64
            draw.rounded_rectangle(((VW - ib_w) // 2, 1300, (VW + ib_w) // 2, 1366), radius=33, fill=meta["item_color"], outline=(255, 255, 255), width=4)
            draw.text(((VW - (bb_ib[2] - bb_ib[0])) // 2, 1316 - bb_ib[1]), ib_txt, font=f_item_tag, fill=(255, 255, 255))

            # Pop-up Subtitle Card at y=1390..1610
            draw.rounded_rectangle((45, 1390, VW - 45, 1610), radius=28, fill=(30, 27, 75), outline=(254, 240, 138), width=4)
            sy = 1438
            for sline in meta["sub"].split("\n"):
                bb_s = draw.textbbox((0, 0), sline, font=f_sub)
                sw = bb_s[2] - bb_s[0]
                draw.text(((VW - sw) // 2, sy - bb_s[1]), sline, font=f_sub, fill=(255, 255, 255))
                sy += 62

            # Bottom CTA Bar
            draw.rounded_rectangle((45, 1640, VW - 45, 1735), radius=24, fill=(254, 240, 138), outline=(58, 42, 34), width=4)
            cta_txt = "[무료 진단] 우리 아이 예상키 & 두뇌 성향 1분 체크 -> kidsfit.co.kr"
            bb_c = draw.textbbox((0, 0), cta_txt, font=f_cta)
            cw = bb_c[2] - bb_c[0]
            draw.text(((VW - cw) // 2, 1672 - bb_c[1]), cta_txt, font=f_cta, fill=(58, 42, 34))

            # Progress bar
            pb_y = 1770
            draw.rounded_rectangle((45, pb_y, VW - 45, pb_y + 18), radius=9, fill=(228, 218, 205))
            bar_w = int((VW - 90) * min(1.0, g_prog))
            if bar_w > 12:
                draw.rounded_rectangle((45, pb_y, 45 + bar_w, pb_y + 18), radius=9, fill=meta["item_color"])

            proc.stdin.write(frame.tobytes())

    proc.stdin.close()
    proc.wait()

    # Also update 07_네이버클립_웹툰7화_학원다녀오면까먹는아이백지복습.mp4 with this new @berrykku_toon + human voice version!
    ep7_clip = CLIP_OUT_KO / "07_네이버클립_웹툰7화_학원다녀오면까먹는아이백지복습.mp4"
    shutil.copy2(out_mp4, ep7_clip)

    voice_mp3.unlink(missing_ok=True)
    bgm_wav.unlink(missing_ok=True)
    mixed_aac.unlink(missing_ok=True)
    print(f"✅ [3/3] 팡팡쀼(Mq8qoO-sYNc) 스타일 실제 한국인 음성 육아템 추천 쇼츠 영상 생성 완료 -> {out_mp4.name}")
    return out_mp4


if __name__ == "__main__":
    cuts, summary_card, grid_1080 = build_berrykku_episode7_pack()
    rebuild_0bean_style_blog_and_cafe_bank()
    build_pangpang_style_human_voice_shorts(cuts)
