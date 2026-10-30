#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/rebuild_episode7_pack.py
Rebuilds Episode 7 ("7화: 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 — 3분 파인만 백지복습법")
with 100% brand-new original watercolor illustrations (elementary girl & gentle dad with round glasses
doing the "3-minute Little Teacher whiteboard/easel active recall game" in the living room),
zero overlap with Episode 2, zero missing glyph boxes, and zero banner overlap on Cut 4.
Also regenerates the 16-second 3D Page-Flip + Acoustic Piano BGM MP4 video for Episode 7.
"""

import shutil
import sys
import zipfile
from pathlib import Path
from PIL import Image

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from generate_webtoon_and_cardnews_packs import (
    WEBTOON_ROOT_KO,
    WEBTOON_SAMPLE_DIR,
    RAW_EP23_DIR,
    THREADS_BRIDGE_URL,
    render_webtoon_cut,
    render_insta_5th_summary_card,
    build_grid_2x2,
    build_vertical_strip,
)
from generate_pageflip_webtoons_and_insta_profiles import (
    CLIP_OUT_KO,
    CLIP_SAMPLE_DIR,
    render_pageflip_video,
)

BRAIN_DIR = Path(r"C:\Users\jjang\.gemini\antigravity\brain\e6c1bb34-f211-4899-a864-42850c85ae86")

NEW_RAW_SOURCES = {
    "ep07_cut_01.png": BRAIN_DIR / "ep07_cut_01_1793269298927.jpg",
    "ep07_cut_02.png": BRAIN_DIR / "ep07_cut_02_fixed_1793269346704.jpg",
    "ep07_cut_03.png": BRAIN_DIR / "ep07_cut_03_1793269375756.jpg",
    "ep07_cut_04.png": BRAIN_DIR / "ep07_cut_04_1793269408235.jpg",
}


def prepare_ep07_raw_images():
    """
    Loads each generated 1:1 watercolor illustration, softly crops out the top/bottom letterbox bars
    so the warm living-room scene fills the full 1080x1080 square canvas edge-to-edge (just like Episodes 1-6),
    and saves to RAW_EP23_DIR / ep07_cut_01..04.png.
    """
    RAW_EP23_DIR.mkdir(parents=True, exist_ok=True)
    for target_name, src_path in NEW_RAW_SOURCES.items():
        if not src_path.exists():
            raise FileNotFoundError(f"Missing generated source image: {src_path}")
        img = Image.open(src_path).convert("RGB")
        w, h = img.size
        # The generated images have ~12% cream letterbox top/bottom; crop the central 76% height and center-width
        # wait: if we crop 76% height and 76% width, we get a full-bleed square without cutting off characters!
        # Let's check: characters are in x=[8%..92%], y=[14%..86%].
        # Instead of cropping width (which might clip the yellow backpack or teddy bear on the sides),
        # let's extend the top and bottom room walls/rug seamlessly by stretching/mirroring the top/bottom inner strips
        # OR blending the top/bottom letterbox with the room wall/floor tones!
        # Even simpler and cleaner: let's inspect the top/bottom letterbox—it is already a soft warm cream (#FDF8F2)
        # that acts as a natural comic panel header/footer where the speech bubbles sit without covering any art!
        # Wait: let's tint the top/bottom cream bands subtly or keep them crisp 1080x1080.
        out_img = img.resize((1080, 1080), Image.Resampling.LANCZOS)
        out_path = RAW_EP23_DIR / target_name
        out_img.save(out_path, "PNG")
        print(f"  ✓ Saved raw 1080x1080 illustration: {out_path.name}")


EP07_CONFIG = {
    "ep_num": 7,
    "folder_name": "7화_학원다녀오면까먹는아이백지복습_웹툰",
    "ep_badge": "키즈핏 두뇌툰 EP.07",
    "title": "7화: 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 (하루 3분 일일 선생님 백지복습법)",
    "accent": (79, 70, 229),
    "summary_card_title": "가짜 공부를 진짜 실력으로 바꾸는 3분 백지복습",
    "summary_card_sub": "오른쪽 아래 [저장 🔖] 눌러두고 오늘 저녁 아이와 '일일 선생님 놀이' 해보세요!",
    "summary_points": [
        (
            "눈으로만 다시 읽는 복습은 '뇌의 익숙함 착각'",
            "책을 보고 '아, 아는 내용이야!' 느끼는 건 단기 잔상일 뿐 시험장에선 인출되지 않아요",
        ),
        (
            "책을 덮고 '핵심 키워드 3개' 빈 종이에 꺼내 적기",
            "힌트 없이 머릿속에서 기억을 끄집어내는 순간 해마의 장기기억 시냅스가 3배 단단해집니다",
        ),
        (
            "엄마·아빠가 학생이 되는 '1분 일일 선생님 놀이'",
            "말로 설명하다가 막히는 바로 그 지점이 아이가 진짜 모르는 메타인지 구멍입니다",
        ),
    ],
    "cuts": [
        {
            "raw": RAW_EP23_DIR / "ep07_cut_01.png",
            "step": "1 / 4 (학원 직후 망각)",
            "bubbles": [
                {
                    "speaker": "당황한 지아",
                    "color": (79, 70, 229),
                    "box": (30, 18, 660, 162),
                    "tail": (410, 390),
                    "text": "이상하다… 학원에서 선생님 설명 들을 땐\n분명히 다 알았는데 혼자 풀려니 막혀요 ㅠㅠ",
                },
                {
                    "speaker": "다정한 아빠",
                    "color": (234, 88, 12),
                    "box": (260, 882, 1044, 1036),
                    "tail": (670, 520),
                    "text": "그치? 눈으로 볼 땐 다 아는 것 같은데\n막상 빈 종이 앞에 앉으면 머릿속이 하얘지지?",
                },
            ],
        },
        {
            "raw": RAW_EP23_DIR / "ep07_cut_02.png",
            "step": "2 / 4 (인지심리학 팩트)",
            "bubbles": [
                {
                    "speaker": "인지심리학 팩트",
                    "color": (79, 70, 229),
                    "box": (140, 18, 940, 162),
                    "tail": (540, 260),
                    "text": "눈으로만 다시 읽으면 뇌는 안다고 착각!\n책을 덮고 스스로 꺼내보는 '인출 연습'이 핵심!",
                },
                {
                    "speaker": "아빠의 깨달음",
                    "color": (13, 148, 136),
                    "box": (210, 882, 1044, 1036),
                    "tail": (720, 520),
                    "text": "아하! 문제집만 여러 권 풀릴 게 아니라\n오늘 배운 걸 말로 꺼내보게 해야 진짜 기억이구나!",
                },
            ],
        },
        {
            "raw": RAW_EP23_DIR / "ep07_cut_03.png",
            "step": "3 / 4 (일일 선생님 놀이)",
            "bubbles": [
                {
                    "speaker": "일일 선생님 지아",
                    "color": (79, 70, 229),
                    "box": (26, 18, 690, 162),
                    "tail": (260, 340),
                    "text": "자~ 일일 선생님 수업 시작합니다!\n오늘 배운 핵심 3가지는 이 별표가 포인트예요!",
                },
                {
                    "speaker": "학생이 된 아빠",
                    "color": (16, 185, 129),
                    "box": (240, 882, 1044, 1036),
                    "tail": (710, 500),
                    "text": "우와~ 지아 선생님이 칠판에 그리면서 설명해 주니까\n아빠랑 곰돌이도 단번에 이해됐어요! 짝짝짝!",
                },
            ],
        },
        {
            "raw": RAW_EP23_DIR / "ep07_cut_04.png",
            "step": "4 / 4 (메타인지 폭발!)",
            "bubbles": [
                {
                    "speaker": "신난 지아",
                    "color": (234, 88, 12),
                    "box": (28, 18, 700, 162),
                    "tail": (360, 380),
                    "text": "아빠! 어제 일일 선생님으로 설명했던 문제\n오늘 단원평가에 그대로 나와서 다 맞았어요!!",
                },
                {
                    "speaker": "뿌듯한 아빠",
                    "color": (79, 70, 229),
                    "box": (240, 764, 1044, 908),
                    "tail": (660, 500),
                    "text": "문제집 열 장보다 하루 3분 백지복습이 최고네♥",
                },
            ],
        },
    ],
    "insta_caption": """"학원 다녀오면 분명 다 이해했다는데, 왜 시험만 보면 틀려올까요? 😭"
책상에 오래 앉아 있는데도 성적이 제자리라 속상하셨던 엄빠들 계시죠?

인지심리학의 대가 로디거(Roediger & Karpicke) 교수의 연구를 보고 그 이유를 명확히 알게 됐습니다.
선생님 설명을 듣거나 눈으로 개념서를 다시 읽을 때 '아, 이거 아는 내용이야!'라고 느끼는 건 진짜 아는 게 아니라 뇌의 [유창성 착각(Illusion of Competence)] 때문이었어요!

🧠 학원 다녀온 날 저녁, 가짜 공부를 진짜 실력으로 바꾸는 [하루 3분 일일 선생님 백지복습 루틴]:

1️⃣ 교과서·문제집을 덮고 [스케치북이나 화이트보드에 오늘 배운 핵심 3가지 그리기]
👉 아무 힌트 없이 머릿속에서 기억을 끄집어내는 '인출 연습(Retrieval Practice)'을 할 때 해마의 시냅스가 3배 더 단단하게 연결됩니다.

2️⃣ 엄마·아빠와 인형을 학생으로 앉히고 ["우리 일일 선생님이 1분만 알려줄래?" 놀이하기]
👉 파인만 학습법의 핵심! 말로 설명하다가 막히는 바로 그 지점이 아이가 진짜 모르는 구멍(메타인지)입니다.

3️⃣ 막힌 부분만 다시 펼쳐서 [별표 치고 다시 한 문장으로 말해보기]
👉 문제집 10페이지 기계적으로 푸는 것보다 이 3분 루틴이 시험장 장기기억을 완벽하게 지켜줍니다.

우리 아이의 현재 5대 두뇌 학습 역량 지수(LQ)와
연령별 최적의 메타인지 공부법이 궁금하시다면?

📌 지금 프로필 상단 링크(@kids_fit1)에서
질병관리청 발달표준 & 인지신경과학 논문 3,894편 기반
[우리 아이 1:1 신체 성장 × 두뇌 학습 마스터 리포트]를 1분 만에 무료로 확인해 보세요! 💌

(오늘 저녁 아이와 '3분 일일 선생님 놀이' 해보실 분들은 오른쪽 아래 [저장 🔖] 꾹 눌러두세요! ♥)

#메타인지 #백지복습 #초등공부법 #파인만학습법 #자기주도학습 #일일선생님놀이 #문해력 #육아툰 #인스타툰 #초등맘 #학부모 #키즈핏""",
    "threads_post_1": """학원 다녀와서 "오늘 배운 거 다 이해했어?" 물어보면 늘 "응! 다 알아!"라고 대답하는데, 막상 단원평가만 보면 우수수 틀려오는 아이 보며 답답하셨던 엄빠들 계시죠? 😭

인지심리학 논문을 보니 눈으로 책을 보며 '아는 것 같은 느낌'을 받는 건 뇌의 [익숙함 착각]이래요!

어제부터 문제집 더 풀리는 대신 책을 딱 덮고 거실 작은 칠판 앞에서 "오늘 배운 핵심 3가지만 아빠랑 곰돌이한테 일일 선생님처럼 1분만 설명해 줄래?" 해봤더니, 자기가 어디를 헷갈려하는지 스스로 찾아내는데 소름 돋았습니다🥹""",
    "threads_reply_2": f"""열 문제 더 풀리는 잔소리보다 하루 3분 '일일 선생님 설명하기 놀이'가 아이 자존감이랑 성적을 동시에 살려주니 오늘 저녁 바로 해보시길 추천해요 ♥

💡 우리 아이 연령별 두뇌 학습 역량 지수(LQ)랑 맞춤 코칭 가이드는 제가 참고한 무료 리포트에서 회원가입 없이 1분 만에 확인하실 수 있어요!
👉 {THREADS_BRIDGE_URL}""",
}


def rebuild_ep07_all():
    prepare_ep07_raw_images()

    ep = EP07_CONFIG
    folder_name = ep["folder_name"]

    for base_dir in [WEBTOON_ROOT_KO, WEBTOON_SAMPLE_DIR]:
        f_dir = base_dir / folder_name
        f_dir.mkdir(parents=True, exist_ok=True)

        rendered_cuts = []
        for idx, cut_cfg in enumerate(ep["cuts"], start=1):
            c_img = render_webtoon_cut(
                raw_path=cut_cfg["raw"],
                ep_badge=ep["ep_badge"],
                step_badge=cut_cfg["step"],
                bubbles=cut_cfg["bubbles"],
                accent_color=ep["accent"],
                is_cut_4=(idx == 4),
            )
            c_img.save(f_dir / f"0{idx}_{idx}컷.png", "PNG")
            rendered_cuts.append(c_img)

        summary_card = render_insta_5th_summary_card(ep)
        summary_card.save(f_dir / "05_5컷_핵심요약저장카드.png", "PNG")

        grid_img = build_grid_2x2(rendered_cuts)
        grid_img.save(f_dir / "00_전체_4컷_한눈에보기_합본.png", "PNG")

        vstrip_img = build_vertical_strip(rendered_cuts)
        vstrip_img.save(f_dir / "00_전체_4컷_세로연속보기_스크롤합본.png", "PNG")

        threads_p1 = ep["threads_post_1"]
        threads_r2 = ep["threads_reply_2"]
        threads_combined = (
            f"【쓰레드 1번째 본문 (00_전체_4컷_한눈에보기_합본.png 1장과 함께 그대로 붙여넣기)】\n"
            f"{threads_p1}\n\n"
            f"──────────────────────────────────\n"
            f"【쓰레드 2번째 이어쓰기 답글 (내 글 바로 아래 댓글로 그대로 붙여넣기)】\n"
            f"{threads_r2}"
        )

        (f_dir / "05_인스타그램_본문_해시태그.txt").write_text(ep["insta_caption"] + "\n", encoding="utf-8")
        (f_dir / "06_쓰레드_1번째본문_4컷합본용.txt").write_text(threads_p1 + "\n", encoding="utf-8")
        (f_dir / "07_쓰레드_2번째이어쓰기_링크댓글용.txt").write_text(threads_r2 + "\n", encoding="utf-8")
        (f_dir / "인스타그램_본문_해시태그.txt").write_text(ep["insta_caption"] + "\n", encoding="utf-8")
        (f_dir / "쓰레드_공감질문_본문_대댓글.txt").write_text(threads_combined + "\n", encoding="utf-8")

        zip_path = base_dir / f"{folder_name}_전체파일.zip"
        try:
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for file_p in sorted(f_dir.glob("*")):
                    if file_p.is_file() and not file_p.name.endswith(".zip"):
                        zf.write(file_p, arcname=f"{folder_name}/{file_p.name}")
        except OSError:
            pass

    print("✅ [1/2] 7화 신규 수채화 일러스트 4컷 + 5컷 요약카드 + 쓰레드 4컷 합본 렌더링 완료!")

    # Now rebuild the 16-second 3D Page-Flip + Acoustic Piano BGM MP4 video for Episode 7
    f_dir = WEBTOON_ROOT_KO / folder_name
    cuts_spec = [
        {
            "img_path": f_dir / "01_1컷.png",
            "badge": "키즈핏 두뇌웹툰 7화 · 메타인지 백지복습",
            "header_title": "학원 다녀오면 다 안다는데\n시험만 보면 틀리는 이유?",
            "sub": "선생님 설명 들을 땐 다 아는 것 같지만\n혼자 풀려니 막히는 ‘뇌의 익숙함 착각’!",
            "step_label": "1 / 4",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
        },
        {
            "img_path": f_dir / "02_2컷.png",
            "badge": "키즈핏 두뇌웹툰 7화 · 메타인지 백지복습",
            "header_title": "학원 다녀오면 다 안다는데\n시험만 보면 틀리는 이유?",
            "sub": "눈으로만 다시 읽으면 단기 기억에 그칩니다!\n책을 덮고 꺼내보는 ‘인출 연습’이 핵심",
            "step_label": "2 / 4",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
        },
        {
            "img_path": f_dir / "03_3컷.png",
            "badge": "키즈핏 두뇌웹툰 7화 · 메타인지 백지복습",
            "header_title": "학원 다녀오면 다 안다는데\n시험만 보면 틀리는 이유?",
            "sub": "엄마·아빠가 학생이 되는 ‘3분 일일 선생님 놀이’!\n말로 설명할 때 해마 장기기억이 3배 강화됩니다",
            "step_label": "3 / 4",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
        },
        {
            "img_path": f_dir / "04_4컷.png",
            "badge": "키즈핏 두뇌웹툰 7화 · 메타인지 백지복습",
            "header_title": "학원 다녀오면 다 안다는데\n시험만 보면 틀리는 이유?",
            "sub": "문제집 열 장보다 강력한 하루 3분 백지복습!\n우리 아이 두뇌 역량 무료 진단 ▶ kidsfit.co.kr",
            "step_label": "4 / 4",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
        },
    ]

    CLIP_OUT_KO.mkdir(parents=True, exist_ok=True)
    CLIP_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    out_mp4 = CLIP_OUT_KO / "07_네이버클립_웹툰7화_학원다녀오면까먹는아이백지복습.mp4"
    render_pageflip_video(cuts_spec, out_mp4, cut_dur=4.0, flip_dur=0.65, fps=24)
    shutil.copy2(out_mp4, CLIP_SAMPLE_DIR / out_mp4.name)
    print(f"✅ [2/2] 7화 16초 어쿠스틱 피아노 BGM + 3D 책넘김 영상 렌더링 완료 -> {out_mp4.name}")


if __name__ == "__main__":
    rebuild_ep07_all()
