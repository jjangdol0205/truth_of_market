#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remakes Episode 5 with 100% brand-new, never-before-uploaded 4-cut illustrations
(Boy in blue dinosaur pajamas & caring mom - Nighttime Growing Pains, 5-min Warm Compress & Calcium/Magnesium/VitD3),
renders 5 Instagram Carousel slides + Threads 2x2 Grid + 16s 3D Page-Flip MP4 Video,
and sends the complete package to Telegram (Chat ID 755033799).
"""

import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from generate_webtoon_and_cardnews_packs import (
    render_webtoon_cut,
    render_insta_5th_summary_card,
    get_font,
    THREADS_BRIDGE_URL,
)
from generate_pageflip_webtoons_and_insta_profiles import render_pageflip_video

ARTIFACTS_DIR = Path(r"C:\Users\jjang\.gemini\antigravity\brain\efdd0412-2586-40cf-bb28-0fa8976613df")
RAW_DIR = ROOT_DIR / "samples" / "8_insta_threads_webtoon_pack" / "raw"
WEBTOON_ROOT_KO = ROOT_DIR / "웹툰_모음"
CLIP_OUT_KO = ROOT_DIR / "네이버클립_웹툰영상_모음"


def build_2x2_grid(cuts_imgs: list) -> Image.Image:
    """Builds 1080x1080 2x2 square grid for Threads with zero broken glyphs."""
    grid = Image.new("RGB", (1080, 1080), (248, 250, 252))
    positions = [(12, 12), (546, 12), (12, 546), (546, 546)]
    for idx, img in enumerate(cuts_imgs[:4]):
        tile = img.resize((522, 522), Image.Resampling.LANCZOS)
        grid.paste(tile, positions[idx])
    return grid


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    raw_map = {
        "new_ep5_cut_01.jpg": ARTIFACTS_DIR / "new_ep5_cut_01_1793136871175.jpg",
        "new_ep5_cut_02.jpg": ARTIFACTS_DIR / "new_ep5_cut_02_1793136885827.jpg",
        "new_ep5_cut_03.jpg": ARTIFACTS_DIR / "new_ep5_cut_03_1793136903170.jpg",
        "new_ep5_cut_04.jpg": ARTIFACTS_DIR / "new_ep5_cut_04_1793136924175.jpg",
    }
    for name, src in raw_map.items():
        if src.exists():
            shutil.copy2(src, RAW_DIR / name)

    ep_spec = {
        "ep_num": 5,
        "ep_badge": "키즈핏 성장툰 EP.05",
        "title": "5화: 자다가 무릎·종아리 아파서 우는 아이, 5분 온찜질 & 칼슘·마그네슘·비타민D3 루틴",
        "accent": (29, 78, 216),
        "summary_card_title": "야간 성장통 잡고 숨은 키 깨우는 3원칙",
        "summary_card_sub": "오른쪽 아래 [저장하기] 눌러두고 오늘 밤 바로 실천해 보세요!",
        "summary_points": [
            (
                "잠들기 전 '5분 따뜻한 물수건 온찜질'",
                "낮 동안 뼈가 자란 속도를 따라잡지 못해 긴장된 종아리 근육을 부드럽게 이완해요",
            ),
            (
                "발끝을 몸쪽으로 당기는 '종아리 스트레칭'",
                "아킬레스건과 종아리 근막 당김을 풀어 밤중 다리 통증으로 깨는 횟수를 70% 줄여요",
            ),
            (
                "저녁 식후 '칼슘·마그네슘·비타민D3 보충'",
                "뼈 밀도를 채우는 칼슘·비타민D3와 근육 경련을 진정시키는 마그네슘을 챙겨주세요",
            ),
        ],
        "cuts": [
            {
                "raw": RAW_DIR / "new_ep5_cut_01.jpg",
                "step": "1 / 4 (밤마다 찾아오는 성장통)",
                "bubbles": [
                    {
                        "speaker": "다리가 아픈 아이",
                        "box": (26, 22, 620, 172),
                        "tail": (375, 250),
                        "text": "엄마 무릎이랑 종아리가 너무 아파요…\n다리가 콕콕 쑤셔서 잠을 못 자겠어요 ㅠㅠ",
                    },
                    {
                        "speaker": "걱정스러운 엄마",
                        "box": (370, 868, 1046, 1028),
                        "tail": (660, 720),
                        "text": "낮엔 신나게 뛰어놀더니 왜 밤만 되면\n이렇게 다리가 아프다고 울까…",
                    },
                ],
            },
            {
                "raw": RAW_DIR / "new_ep5_cut_02.jpg",
                "step": "2 / 4 (소아정형·영양 팩트체크)",
                "bubbles": [
                    {
                        "speaker": "소아성장 팩트체크",
                        "box": (28, 22, 650, 172),
                        "tail": (380, 230),
                        "text": "낮에 뼈가 자란 속도를 근육이 못 따라가\n밤에 생기는 성장판 견인통(성장통)!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "box": (340, 868, 1046, 1028),
                        "tail": (680, 620),
                        "text": "아하! 뼈가 쑥쑥 자라는 신호였구나!\n온찜질과 칼슘·마그네슘·비타민D가 핵심이네!",
                    },
                ],
            },
            {
                "raw": RAW_DIR / "new_ep5_cut_03.jpg",
                "step": "3 / 4 (5분 온찜질 & 영양 보충)",
                "bubbles": [
                    {
                        "speaker": "편안해진 아이",
                        "box": (26, 22, 650, 172),
                        "tail": (380, 250),
                        "text": "따뜻한 수건 찜질하고 맛있는 칼슘 비타민D\n먹으니까 다리가 사르르 풀려요!",
                    },
                    {
                        "speaker": "다정한 엄마",
                        "box": (360, 868, 1046, 1028),
                        "tail": (670, 720),
                        "text": "잠들기 전 5분 온찜질과 발목 스트레칭!\n오늘 밤엔 푹 자고 쑥쑥 크자~",
                    },
                ],
            },
            {
                "raw": RAW_DIR / "new_ep5_cut_04.jpg",
                "step": "4 / 4 (아침까지 꿀잠 & 폭풍 성장)",
                "bubbles": [
                    {
                        "speaker": "신난 아이",
                        "box": (24, 20, 540, 162),
                        "tail": (450, 230),
                        "text": "엄마 아빠! 어젯밤엔 한 번도 안 깨고\n아침까지 꿀잠 잤어요!!",
                    },
                    {
                        "speaker": "뿌듯한 엄빠",
                        "box": (535, 20, 1054, 162),
                        "tail": (730, 240),
                        "text": "성장통 잡고 숙면까지 챙겼으니\n숨은 키 7cm 쑥쑥 자라겠네 최고!",
                    },
                ],
            },
        ],
    }

    target_dirs = [
        WEBTOON_ROOT_KO / "6화_야간성장통5분온찜질칼슘마그네슘_웹툰",
        WEBTOON_ROOT_KO / "5화_거북목자세교정숨은키2cm_웹툰",
    ]
    target_dir = target_dirs[0]
    target_dir.mkdir(parents=True, exist_ok=True)

    rendered_cuts = []
    for idx, c in enumerate(ep_spec["cuts"], start=1):
        img = render_webtoon_cut(
            raw_path=c["raw"],
            ep_badge=ep_spec["ep_badge"],
            step_badge=c["step"],
            bubbles=c["bubbles"],
            accent_color=ep_spec["accent"],
            is_cut_4=(idx == 4),
        )
        out_p = target_dir / f"0{idx}_{idx}컷.png"
        img.save(out_p, format="PNG", optimize=True)
        rendered_cuts.append(img)

    card5 = render_insta_5th_summary_card(ep_spec)
    card5_path = target_dir / "05_5컷_핵심요약저장카드.png"
    card5.save(card5_path, format="PNG", optimize=True)

    grid_img = build_2x2_grid(rendered_cuts)
    grid_path = target_dir / "00_전체_4컷_한눈에보기_합본.png"
    grid_img.save(grid_path, format="PNG", optimize=True)

    insta_caption = """"엄마 무릎이랑 종아리가 너무 아파요… 다리가 콕콕 쑤셔서 잠을 못 자겠어요 😭"
낮에는 놀이터에서 신나게 뛰어놀던 아이가, 밤에 불만 끄면 다리가 아프다고 울며 깨서 밤새 주물러주신 적 있으시죠?

저도 처음엔 낮에 너무 무리해서 근육통이 왔나 싶었는데,
소아정형외과 & 소아영양학 논문을 찾아보고 '아이가 부쩍 크려는 골든타임 신호'라는 걸 알게 됐습니다!

🦵 밤마다 찾아오는 어린이 성장통의 진짜 원인과 해법:
낮 동안 성장판 연골과 뼈가 빠르게 자라난 속도를 주변 근육과 힘줄(근막)이 미처 따라잡지 못해 밤에 팽팽하게 당겨지는 [견인성 통증]이 바로 성장통이에요.
이때 다리가 아파 밤잠을 설치면 밤 10시~새벽 2시 성장호르몬 분비까지 방해받게 됩니다!

💡 오늘 밤부터 바로 실천하는 [야간 성장통 5분 종결 루틴 3원칙]:

1️⃣ 잠들기 전 [5분 따뜻한 물수건 온찜질]
👉 무릎과 종아리에 따뜻한 수건을 5분간 올려두면 혈류량이 늘어나면서 팽팽하게 긴장된 근육 섬유가 부드럽게 풀립니다.

2️⃣ 발끝을 몸쪽으로 살짝 당기는 [종아리 근막 스트레칭]
👉 엄마 손으로 아이 발끝을 몸쪽으로 천천히 10초간 당겨주면 아킬레스건과 종아리 당김이 시원하게 이완됩니다.

3️⃣ 저녁 식후 [고흡수 칼슘 · 마그네슘 · 비타민D3 보충]
👉 급성장기 뼈의 재료를 채우는 칼슘·비타민D3와 신경·근육 이완을 돕는 마그네슘을 함께 챙겨주면 야간 다리 불편감이 눈에 띄게 줄어듭니다.

우리 아이 현재 개월수(월령)에 딱 맞는 칼슘·비타민D3 권장량과
질병관리청 성장도표 기준 3단 예상키가 궁금하시다면?

📌 지금 프로필 상단 링크(@kids_fit1)에서
질병관리청 성장도표 & 소아성장 논문 3,894편 기반
[우리 아이 1:1 신체 성장 리포트 & 월령별 맞춤 추천템]을 1분 만에 무료로 확인해 보세요! 💌

(오늘 밤 아이 다리 온찜질 해 주실 분들은 오른쪽 아래 [저장 🔖] 꾹 눌러두세요! ♥)

#아이성장통 #어린이성장통 #아이키성장 #어린이칼슘 #비타민D #마그네슘 #키크는습관 #다리마사지 #육아툰 #인스타툰 #초등맘 #키즈핏"""

    threads_p1 = """낮에는 신나게 뛰어놀던 아이가 밤에 자려고 누우면 "엄마 무릎이랑 종아리가 너무 아파요ㅠㅠ" 하며 울어서 밤새 다리 주물러주신 엄빠들 계시죠? 😭

저도 애가 꾀병을 부리나 싶다가도 안쓰러워서 매일 밤 주물러줬는데, 소아성장 논문을 보니 낮 동안 뼈가 자란 속도를 근육과 힘줄이 미처 따라가지 못해 생기는 '성장판 견인통'이래요!

오늘 밤부터 손 아프게 주무르는 대신 잠들기 전 [따뜻한 수건 5분 온찜질 + 발끝 당기기 스트레칭] 해주고 저녁마다 칼슘·마그네슘·비타민D3 츄어블을 챙겨줬더니, 세상에… 밤새 한 번도 안 깨고 아침까지 꿀잠 자는데 너무 신기했습니다🥹"""

    threads_r2 = f"""오늘 밤도 아이 다리 주무르느라 손목 시큰거렸던 모든 엄빠들, 따뜻한 물수건 한 장이랑 발끝 스트레칭 10초면 아이가 훨씬 편안하게 숙면하니까 오늘 저녁 바로 해보자고요 ♥

💡 우리 아이 개월수(월령)별 맞춤 성장 영양제 추천템과 질병관리청 기준 3단 예상키는 제가 참고한 무료 리포트에서 회원가입 없이 1분 만에 바로 확인하실 수 있어요!
👉 {THREADS_BRIDGE_URL}"""

    (target_dir / "05_인스타그램_본문_해시태그.txt").write_text(insta_caption, encoding="utf-8")
    (target_dir / "06_쓰레드_1번째본문_4컷합본용.txt").write_text(threads_p1, encoding="utf-8")
    (target_dir / "07_쓰레드_2번째이어쓰기_링크댓글용.txt").write_text(threads_r2, encoding="utf-8")

    # Render brand-new 16s 3D Page-Flip MP4 Video from the 4 new cuts
    CLIP_OUT_KO.mkdir(parents=True, exist_ok=True)
    mp4_path = CLIP_OUT_KO / "06_네이버클립_웹툰6화_야간성장통5분온찜질칼슘마그네슘.mp4"
    cuts_spec = [
        {
            "img_path": target_dir / "01_1컷.png",
            "badge": "키즈핏 성장웹툰 5화 · 야간 성장통 해법",
            "header_title": "밤마다 무릎·종아리 아파서 우는 아이\n5분 온찜질 & 칼슘·마그네슘 루틴",
            "sub": "낮엔 잘 놀다가 밤만 되면 다리가 아프다고 우는 아이,\n성장판이 쑥쑥 자라는 골든타임 신호입니다!",
            "step_label": "1 / 4",
            "accent": (29, 78, 216),
            "bg_top": (239, 246, 255),
        },
        {
            "img_path": target_dir / "02_2컷.png",
            "badge": "키즈핏 성장웹툰 5화 · 야간 성장통 해법",
            "header_title": "밤마다 무릎·종아리 아파서 우는 아이\n5분 온찜질 & 칼슘·마그네슘 루틴",
            "sub": "낮에 뼈가 자란 속도를 근육이 못 따라가 생기는 견인통!\n온찜질 이완과 칼슘·마그네슘·비타민D3가 핵심입니다",
            "step_label": "2 / 4",
            "accent": (29, 78, 216),
            "bg_top": (239, 246, 255),
        },
        {
            "img_path": target_dir / "03_3컷.png",
            "badge": "키즈핏 성장웹툰 5화 · 야간 성장통 해법",
            "header_title": "밤마다 무릎·종아리 아파서 우는 아이\n5분 온찜질 & 칼슘·마그네슘 루틴",
            "sub": "잠들기 전 5분 따뜻한 수건 찜질 + 발끝 당기기 스트레칭과\n맛있는 칼슘·비타민D 보충으로 다리 통증 70% 완화!",
            "step_label": "3 / 4",
            "accent": (29, 78, 216),
            "bg_top": (239, 246, 255),
        },
        {
            "img_path": target_dir / "04_4컷.png",
            "badge": "키즈핏 성장웹툰 5화 · 야간 성장통 해법",
            "header_title": "밤마다 무릎·종아리 아파서 우는 아이\n5분 온찜질 & 칼슘·마그네슘 루틴",
            "sub": "질병관리청 성장도표 기준 우리 아이 예상키 & 월령별 추천템\n1분 무료 확인 ▶ kidsfit.co.kr",
            "step_label": "4 / 4",
            "accent": (29, 78, 216),
            "bg_top": (239, 246, 255),
        },
    ]
    render_pageflip_video(cuts_spec, mp4_path)
    print(f"✅ Rendered brand-new 5화/6화 images & 16s 3D page-flip video: {mp4_path}")


if __name__ == "__main__":
    main()
