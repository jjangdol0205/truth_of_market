# -*- coding: utf-8 -*-
"""
scripts/build_ep6_to_10_pageflip_videos.py
Generates the 16-second (4 cuts x 4.0s) 3D Page-Flip + Soothing Acoustic Piano BGM MP4 videos
(NO TTS voice) for Episodes 6, 7, 8, 9, and 10 in `네이버클립_웹툰영상_모음/` and `samples/10_naver_clip_videos/`,
and sends the Episode 8 video + Reels/Clip captions to Telegram so Episode 8 is also 100% complete!
"""

import shutil
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from generate_pageflip_webtoons_and_insta_profiles import (
    CLIP_OUT_KO,
    CLIP_SAMPLE_DIR,
    WEBTOON_ROOT_KO,
    render_pageflip_video,
)
from send_daily_6am_insta_briefing import send_telegram_multipart_file
from publish_3x_daily_blog_and_cafe import send_telegram_message

EP6_TO_10_SPECS = [
    {
        "ep_id": "ep06",
        "filename": "06_네이버클립_웹툰6화_야간성장통5분온찜질칼슘마그네슘.mp4",
        "badge": "키즈핏 성장웹툰 6화 · 야간 성장통 5분 루틴",
        "header_title": "자다가 다리 아파서 우는 아이,\n키가 자라는 골든타임 신호!",
        "accent": (37, 99, 235),
        "bg_top": (239, 246, 255),
        "folder": WEBTOON_ROOT_KO / "6화_야간성장통5분온찜질칼슘마그네슘_웹툰",
        "cuts": [
            {"img": "01_1컷.png", "sub": "밤마다 무릎·종아리가 아프다며 깨는 아이,\n단순 꾀병이 아니라 성장판 신호입니다!"},
            {"img": "02_2컷.png", "sub": "밤사이 뼈가 자란 속도를 근육이 못 따라갈 때\n칼슘·마그네슘 부족 시 당김 통증 심화!"},
            {"img": "03_3컷.png", "sub": "잠들기 전 5분 따뜻한 수건 온찜질과\n부드러운 종아리 이완 마사지를 해주세요"},
            {"img": "04_4컷.png", "sub": "질병관리청 성장도표 기준 우리 아이 키 백분위 &\n3단 예상키 무료 진단 ▶ kidsfit.co.kr"},
        ],
    },
    {
        "ep_id": "ep08",
        "filename": "08_네이버클립_웹툰8화_스마트폰유튜브과몰입전두엽타이머.mp4",
        "badge": "키즈핏 두뇌웹툰 8화 · 시각 타이머 20분 법칙",
        "header_title": "스마트폰 끄라고 하면 우는 아이,\n‘시각 타이머 20분 법칙’으로 해결!",
        "accent": (234, 88, 12),
        "bg_top": (255, 247, 237),
        "folder": WEBTOON_ROOT_KO / "8화_스마트폰유튜브과몰입전두엽타이머_웹툰",
        "cuts": [
            {"img": "01_1컷.png", "sub": "유튜브 끄라고 하면 바닥에 드러누워 우는 아이,\n억지로 뺏으면 전두엽 저항만 커집니다!"},
            {"img": "02_2컷.png", "sub": "강제로 화면을 끄면 도파민 급락 쇼크 발생!\n아이 뇌는 남은 시간 감각이 아직 미성숙해요"},
            {"img": "03_3컷.png", "sub": "시청 전 아이 손으로 직접 빨간 면적이 줄어드는\n‘무소음 시각 타이머 20분’을 맞추게 해주세요"},
            {"img": "04_4컷.png", "sub": "알람이 울리면 스스로 끄는 자기조절력 완성!\n전두엽 집중력 1분 무료 진단 ▶ kidsfit.co.kr"},
        ],
    },
    {
        "ep_id": "ep09",
        "filename": "09_네이버클립_웹툰9화_박물관다녀와도기억못하는하브루타.mp4",
        "badge": "키즈핏 체험웹툰 9화 · 박물관 하브루타 3단 질문",
        "header_title": "주말마다 박물관 데려가도\n기억 못 하는 진짜 이유!",
        "accent": (13, 148, 136),
        "bg_top": (240, 253, 250),
        "folder": WEBTOON_ROOT_KO / "9화_박물관다녀와도기억못하는하브루타_웹툰",
        "cuts": [
            {"img": "01_1컷.png", "sub": "주말마다 과학관·박물관 열심히 데려갔는데\n집에 오면 “기억 안 나” 한마디뿐이라면?"},
            {"img": "02_2컷.png", "sub": "전시물 100개를 수동적으로 구경만 하면\n전두엽 호기심 스위치가 켜지지 않습니다!"},
            {"img": "03_3컷.png", "sub": "출발 전 차 안에서 ‘오늘 찾을 탐정 미션 1개’만\n정해주면 관찰력과 장기기억이 3배 폭발!"},
            {"img": "04_4컷.png", "sub": "우리 지역 맞춤 주말 나들이 코스 & 두뇌 리포트\n1분 무료 진단 ▶ kidsfit.co.kr"},
        ],
    },
    {
        "ep_id": "ep10",
        "filename": "10_네이버클립_웹툰10화_사춘기급성장기숨은키7cm골든타임.mp4",
        "badge": "키즈핏 성장웹툰 10화 · 숨은 키 +7cm 골든타임",
        "header_title": "엄마 아빠 키가 작아도 괜찮아요!\n후천적 관리로 ‘숨은 키 +7cm’",
        "accent": (79, 70, 229),
        "bg_top": (238, 242, 255),
        "folder": WEBTOON_ROOT_KO / "10화_사춘기급성장기숨은키7cm골든타임_웹툰",
        "cuts": [
            {"img": "01_1컷.png", "sub": "엄마 아빠 키가 작아서 우리 아이도 작을까 봐\n미리 걱정하고 포기하셨나요?"},
            {"img": "02_2컷.png", "sub": "유전키(MPH)는 기준점일 뿐! 수면·운동·영양으로\n최종 성인키는 +5~8cm 더 자랄 수 있습니다!"},
            {"img": "03_3컷.png", "sub": "밤 10시 서파수면 + 줄넘기·철봉 성장판 자극 +\n체중 비례 칼슘·비타민D3·아연 3박자 루틴!"},
            {"img": "04_4컷.png", "sub": "질병관리청 성장도표 기준 우리 아이 3단 예상키\n1분 무료 진단 ▶ kidsfit.co.kr"},
        ],
    },
]


def main():
    CLIP_OUT_KO.mkdir(parents=True, exist_ok=True)
    CLIP_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

    for ep in EP6_TO_10_SPECS:
        folder = ep["folder"]
        if not folder.exists():
            print(f"[Skip] Folder not found: {folder}")
            continue
        ep_cuts = []
        total_c = len(ep["cuts"])
        for idx, c in enumerate(ep["cuts"], start=1):
            img_p = folder / c["img"]
            if not img_p.exists():
                continue
            ep_cuts.append({
                "img_path": img_p,
                "sub": c["sub"],
                "badge": ep["badge"],
                "header_title": ep["header_title"],
                "accent": ep["accent"],
                "bg_top": ep["bg_top"],
                "step_label": f"{idx} / {total_c}",
            })
        if len(ep_cuts) == 4:
            out_mp4 = CLIP_OUT_KO / ep["filename"]
            print(f"🎬 Rendering 16s Page-Flip BGM video: {out_mp4.name} ...")
            render_pageflip_video(ep_cuts, out_mp4, cut_dur=4.0, flip_dur=0.65, fps=24)
            shutil.copy2(out_mp4, CLIP_SAMPLE_DIR / ep["filename"])
            print(f"✅ Completed: {out_mp4.name} ({out_mp4.stat().st_size:,} bytes)")

    # Also send Episode 8's newly rendered 16s Page-Flip BGM video to Telegram
    ep8_mp4 = CLIP_OUT_KO / "08_네이버클립_웹툰8화_스마트폰유튜브과몰입전두엽타이머.mp4"
    if ep8_mp4.exists():
        send_telegram_multipart_file(
            "sendVideo",
            "video",
            ep8_mp4,
            caption="🎬 [3순서 · 릴스 & 네이버 클립용 세로 영상 — 제8화 (16초 어쿠스틱 피아노 BGM + 3D 책넘김 효과음)]\n(위 제7화 풀세트(웹툰+영상)에 이어 제8화 16초 책넘김 영상도 함께 보내드립니다!)",
        )
        send_telegram_message(
            "스마트폰·유튜브 끄라고 하면 우는 아이, 시각 타이머 20분 법칙으로 해결하세요! ⏰✨\n강제로 폰을 뺏으면 도파민이 급락해 짜증이 폭발합니다. 시청 전 아이 손으로 직접 빨간 면적이 줄어드는 시각 타이머를 맞추게 해주세요!\n📌 프로필 링크(@kids_fit1)에서 우리 아이 전두엽 집중력 & 성장 백분위를 1분 만에 무료로 확인해 보세요!\n#시각타이머 #아이집중력 #전두엽발달 #스마트폰약속 #자기조절력 #육아툰 #인스타툰 #육아릴스 #키즈핏"
        )


if __name__ == "__main__":
    main()
