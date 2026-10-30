# -*- coding: utf-8 -*-
"""
scripts/rebuild_ep7_and_send_telegram.py
Rebuilds Episode 7 ("7화: 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 — 하루 3분 파인만 백지복습법")
using the 4 brand-new, completely distinct warm watercolor character illustrations
(10-year-old ponytail girl in yellow cardigan + living room mini-whiteboard 1-Minute Teacher roleplay with mom & dad),
renders the 16s 3D Page-Flip + Soothing Acoustic Piano BGM MP4 video (NO TTS),
and dispatches the complete @kids_fit1 package (Instagram -> Threads -> Reels/Clip) to Telegram!
"""

import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from generate_webtoon_and_cardnews_packs import (
    ARTIFACTS_DIR,
    RAW_EP23_DIR,
    THREADS_BRIDGE_URL,
    WEBTOON_ROOT_KO,
    WEBTOON_SAMPLE_DIR,
    build_grid_2x2,
    build_vertical_strip,
    render_insta_5th_summary_card,
    render_webtoon_cut,
)
from generate_pageflip_webtoons_and_insta_profiles import (
    CLIP_OUT_KO,
    CLIP_SAMPLE_DIR,
    render_pageflip_video,
)


def main():
    RAW_EP23_DIR.mkdir(parents=True, exist_ok=True)
    mapping_ep7 = {
        "ep07_cut_01.png": "ep07_cut_01_new_v2_1793268739092.jpg",
        "ep07_cut_02.png": "ep07_cut_02_new_1793268766701.jpg",
        "ep07_cut_03.png": "ep07_cut_03_new_1793268793854.jpg",
        "ep07_cut_04.png": "ep07_cut_04_new_1793268819666.jpg",
    }
    for dst_name, src_name in mapping_ep7.items():
        src = ARTIFACTS_DIR / src_name
        dst = RAW_EP23_DIR / dst_name
        if src.exists():
            shutil.copy2(src, dst)
            print(f"✅ Copied new EP07 raw illustration: {dst_name}")
        else:
            raise FileNotFoundError(f"Missing raw illustration: {src}")

    ep7 = {
        "ep_num": 7,
        "folder_name": "7화_학원다녀오면까먹는아이백지복습_웹툰",
        "ep_badge": "키즈핏 학습툰 EP.07",
        "title": "7화: 학원 다녀오면 다 안다는데 시험만 보면 틀리는 아이 (3분 파인만 백지복습법)",
        "accent": (79, 70, 229),
        "summary_card_title": "장기기억 90% 코팅 '3분 파인만 복습'",
        "summary_card_sub": "오른쪽 아래 [저장하기] 눌러두고 오늘 저녁 학원 다녀온 뒤 바로 해보세요!",
        "summary_points": [
            ("눈으로만 다시 읽는 '가짜 복습' 멈추기", "형광펜 친 책을 눈으로만 보면 뇌는 '이미 안다'고 착각해 하루 만에 70%를 잊어버려요"),
            ("책 덮고 '오늘 배운 핵심 단어 3개' 적기", "백지 한 장을 다 채우려 하지 말고 핵심 키워드 딱 3개만 스스로 꺼내 적게 해주세요"),
            ("엄마·아빠에게 '1분 일일 선생님' 놀이", "내가 적은 3단어를 부모님께 1분만 설명하면 해마 장기기억 보존율이 90%까지 폭발합니다"),
        ],
        "cuts": [
            {
                "raw": RAW_EP23_DIR / "ep07_cut_01.png",
                "step": "1 / 4 (갈등)",
                "bubbles": [
                    {
                        "speaker": "풀이 죽은 지아",
                        "color": (234, 88, 12),
                        "box": (32, 28, 595, 180),
                        "tail": (285, 290),
                        "text": "학원 선생님이 설명해 줄 땐 다 알았는데\n막상 시험 보니까 기억이 하나도 안 나요…",
                    },
                    {
                        "speaker": "고민하는 엄마·아빠",
                        "color": (79, 70, 229),
                        "box": (385, 865, 1044, 1025),
                        "tail": (640, 740),
                        "text": "숙제도 다 하고 인강도 열심히 들었는데\n왜 시험지만 보면 머릿속이 하얘질까?",
                    },
                ],
            },
            {
                "raw": RAW_EP23_DIR / "ep07_cut_02.png",
                "step": "2 / 4 (뇌과학 팩트)",
                "bubbles": [
                    {
                        "speaker": "인지심리학 팩트",
                        "color": (79, 70, 229),
                        "box": (28, 26, 540, 178),
                        "tail": (260, 260),
                        "text": "눈으로만 다시 읽으면 ‘친숙성 착각’ 발생!\n24시간 뒤 70%가 비눗방울처럼 증발!",
                    },
                    {
                        "speaker": "장기기억의 열쇠",
                        "color": (13, 148, 136),
                        "box": (410, 865, 1044, 1025),
                        "tail": (780, 760),
                        "text": "책을 덮고 스스로 꺼내보는 ‘인출 연습’이\n해마 장기기억 보물상자를 여는 황금 열쇠!",
                    },
                ],
            },
            {
                "raw": RAW_EP23_DIR / "ep07_cut_03.png",
                "step": "3 / 4 (1분 선생님 놀이)",
                "bubbles": [
                    {
                        "speaker": "일일 선생님 지아",
                        "color": (234, 88, 12),
                        "box": (32, 28, 600, 180),
                        "tail": (285, 285),
                        "text": "자~ 오늘 배운 핵심 단어 딱 3개 적었어요!\n일일 선생님이 1분 만에 설명해 드릴게요!",
                    },
                    {
                        "speaker": "학생이 된 엄마·아빠",
                        "color": (13, 148, 136),
                        "box": (385, 865, 1044, 1025),
                        "tail": (650, 740),
                        "text": "선생님 질문 있어요! 왜 그렇게 되는 거예요?\n우와~ 설명 듣다 보니 귀에 쏙쏙 들어오네!",
                    },
                ],
            },
            {
                "raw": RAW_EP23_DIR / "ep07_cut_04.png",
                "step": "4 / 4 (메타인지 완성)",
                "bubbles": [
                    {
                        "speaker": "자신감 폭발 지아",
                        "color": (234, 88, 12),
                        "box": (32, 26, 595, 176),
                        "tail": (285, 280),
                        "text": "엄마 아빠에게 1분 설명했을 뿐인데\n시험 볼 때 내 목소리가 그대로 떠올랐어요!",
                    },
                    {
                        "speaker": "뿌듯한 엄마·아빠",
                        "color": (79, 70, 229),
                        "box": (420, 748, 1044, 898),
                        "tail": (660, 680),
                        "text": "하루 3분 파인만 백지복습의 기적!\n우리 딸 메타인지와 공부 자존감 최고야♥",
                    },
                ],
            },
        ],
        "insta_caption": """"선생님이 설명해 줄 땐 다 알았는데, 막상 시험 보니까 하나도 기억이 안 나요…" 😭
학원도 성실히 다니고 숙제도 꼬박꼬박 해가는데, 단원평가만 보면 엉뚱한 실수를 해오는 아이 보며 속상하셨던 적 있으시죠?

저도 처음엔 아이가 수업 시간에 딴생각을 했나 싶었어요.
그런데 인지심리학과 뇌과학 논문을 찾아보고 복습 방식 자체가 완전히 잘못되었다는 걸 깨달았습니다.

🧠 학원 다녀와서 눈으로만 다시 읽는 복습이 위험한 이유,
노벨물리학상 수상자 리처드 파인만(Feynman)과 인지심리학 연구에 따르면, 형광펜이 쳐진 교재나 필기 노트를 눈으로만 다시 읽으면 뇌는 '글자가 익숙한 것'을 '내가 완전히 이해한 것'으로 착각하는 [친숙성 착각(Illusion of Competence)]에 빠집니다!
스스로 머릿속에서 꺼내보는 과정이 없으면 24시간 뒤에 무려 70%가 비눗방울처럼 날아가 버리는 거였죠.

💡 오늘 저녁부터 거부감 0% [하루 3분 파인만 백지복습 놀이]로 이렇게만 바꿔보세요:

1️⃣ 눈으로만 읽기 대신 [책을 덮고 오늘 배운 '핵심 단어 딱 3개'만 적기]
👉 처음부터 하얀 종이 한 장을 다 채우라고 하면 아이가 도망갑니다. 작은 보드나 포스트잇에 오늘 배운 키워드 딱 3개만 기억해서 적어보게 하세요!

2️⃣ 문제집 추가 풀이 대신 [엄마·아빠에게 '1분 일일 선생님' 되어 설명하기]
👉 "지아 선생님, 오늘 배운 이 단어는 무슨 뜻이에요?" 하고 부모님이 학생처럼 손들고 질문해 주세요. 아이가 내 말로 바꾸어 설명하는 순간 해마 장기기억 보존율이 90%까지 치솟습니다!

3️⃣ 막히는 부분은 혼내지 않고 [보물찾기 찬스!]
👉 설명하다 막히는 부분이야말로 시험에 나올 진짜 약점입니다. "우와, 숨어 있던 보물을 찾았네! 책 펴서 10초만 확인해 볼까?" 하고 격려해 주세요.

우리 아이의 메타인지·장기기억·작업기억·문해력 5대 학습 역량(LQ)은 지금 몇 점인지 궁금하시다면?

📌 지금 프로필 상단 링크(@kids_fit1)에서
질병관리청 성장도표 & 두뇌·학습 논문 3,894편 기반
[우리 아이 1:1 신체 성장 × 두뇌 학습 마스터 리포트]와 [A4 파인만 3줄 백지복습 코넬노트]를 1분 만에 무료로 확인해 보세요! 💌

(오늘 저녁 아이와 '1분 선생님 놀이' 해보실 분들은 오른쪽 아래 [저장 🔖] 꾹 눌러두세요! ♥)

#백지복습 #메타인지 #초등공부법 #파인만학습법 #자기주도학습 #코넬노트 #문해력 #초등맘 #육아툰 #인스타툰 #두뇌발달 #키즈핏""",
        "threads_post_1": """학원 다녀오면 "엄마 오늘 배운 거 다 이해했어!" 해놓고, 막상 단원평가만 보면 기억이 안 난다며 틀려오는 아이 보며 답답해본 엄빠들 계시죠? 😭

저도 애가 집중을 안 하나 싶었는데, 인지심리학 논문을 보고 완전히 반성했습니다. 눈으로만 교재를 다시 읽으면 뇌가 '글자가 익숙한 것'을 '내가 아는 것'으로 착각해서 하루 만에 70%가 날아간대요!

백지 한 장 다 쓰라고 하면 싫어하길래, 거실에 미니 화이트보드 하나 두고 오늘 배운 '핵심 단어 딱 3개'만 적어서 엄마 아빠한테 [1분 일일 선생님]처럼 설명해 달라고 손들고 질문해 줬더니, 세상에… 시험 볼 때 자기 목소리가 그대로 떠올랐다며 100점 시험지를 들고 오는데 어찌나 기특하던지요🥹""",
        "threads_reply_2": f"""오늘 저녁엔 학원 다녀온 아이에게 "숙제 다 했어?" 대신 "오늘 배운 거 엄마한테 1분만 선생님처럼 알려줄래?" 하고 손 번쩍 들어주자고요 ♥

💡 우리 아이 메타인지·작업기억·문해력 5대 학습 역량(LQ) 점수랑 집에서 바로 뽑아 쓰는 [A4 파인만 3줄 백지복습 코넬노트]는 제가 참고한 무료 리포트에서 회원가입 없이 1분 만에 확인하실 수 있어요!
👉 {THREADS_BRIDGE_URL}""",
    }

    folder_name = ep7["folder_name"]
    for base_dir in [WEBTOON_ROOT_KO, WEBTOON_SAMPLE_DIR]:
        f_dir = base_dir / folder_name
        f_dir.mkdir(parents=True, exist_ok=True)

        rendered_cuts = []
        for idx, cut_cfg in enumerate(ep7["cuts"], start=1):
            c_img = render_webtoon_cut(
                raw_path=cut_cfg["raw"],
                ep_badge=ep7["ep_badge"],
                step_badge=cut_cfg["step"],
                bubbles=cut_cfg["bubbles"],
                accent_color=ep7["accent"],
                is_cut_4=(idx == 4),
            )
            c_img.save(f_dir / f"0{idx}_{idx}컷.png", "PNG")
            rendered_cuts.append(c_img)

        summary_card = render_insta_5th_summary_card(ep7)
        summary_card.save(f_dir / "05_5컷_핵심요약저장카드.png", "PNG")

        grid_img = build_grid_2x2(rendered_cuts)
        grid_img.save(f_dir / "00_전체_4컷_한눈에보기_합본.png", "PNG")

        vstrip_img = build_vertical_strip(rendered_cuts)
        vstrip_img.save(f_dir / "00_전체_4컷_세로연속보기_스크롤합본.png", "PNG")

        threads_p1 = ep7["threads_post_1"]
        threads_r2 = ep7["threads_reply_2"]
        threads_combined = (
            f"【쓰레드 1번째 본문 (00_전체_4컷_한눈에보기_합본.png 1장과 함께 그대로 붙여넣기)】\n"
            f"{threads_p1}\n\n"
            f"──────────────────────────────────\n"
            f"【쓰레드 2번째 이어쓰기 답글 (내 글 바로 아래 댓글로 그대로 붙여넣기)】\n"
            f"{threads_r2}"
        )
        (f_dir / "05_인스타그램_본문_해시태그.txt").write_text(ep7["insta_caption"] + "\n", encoding="utf-8")
        (f_dir / "06_쓰레드_1번째본문_4컷합본용.txt").write_text(threads_p1 + "\n", encoding="utf-8")
        (f_dir / "07_쓰레드_2번째이어쓰기_링크댓글용.txt").write_text(threads_r2 + "\n", encoding="utf-8")

        zip_path = base_dir / f"{folder_name}_전체파일.zip"
        try:
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for file_p in sorted(f_dir.glob("*")):
                    if file_p.is_file() and not file_p.name.endswith(".zip"):
                        zf.write(file_p, arcname=f"{folder_name}/{file_p.name}")
        except OSError:
            pass

    print("✅ Rebuilt Episode 7 4-cut webtoon + 5th summary card + 2x2 grid!")

    # Render 16-second 3D Page-Flip + Soothing Acoustic Piano BGM MP4 video for Episode 7
    CLIP_OUT_KO.mkdir(parents=True, exist_ok=True)
    CLIP_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    ep7_folder = WEBTOON_ROOT_KO / folder_name
    ep7_video_cuts = [
        {
            "img_path": ep7_folder / "01_1컷.png",
            "sub": "설명 들을 땐 다 알았는데 시험만 보면 백지?\n아이의 집중력 부족이 아니라 복습법 차이입니다!",
            "badge": "키즈핏 교육웹툰 7화 · 3분 파인만 백지복습",
            "header_title": "학원 다녀오면 다 까먹는 아이\n하루 3분 백지복습의 기적!",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
            "step_label": "1 / 4",
        },
        {
            "img_path": ep7_folder / "02_2컷.png",
            "sub": "눈으로만 읽는 복습은 24시간 뒤 70% 증발!\n책을 덮고 꺼내보는 ‘인출’이 장기기억 열쇠!",
            "badge": "키즈핏 교육웹툰 7화 · 3분 파인만 백지복습",
            "header_title": "학원 다녀오면 다 까먹는 아이\n하루 3분 백지복습의 기적!",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
            "step_label": "2 / 4",
        },
        {
            "img_path": ep7_folder / "03_3컷.png",
            "sub": "오늘 배운 핵심 단어 딱 3개만 적고\n엄마·아빠에게 ‘1분 일일 선생님’ 되어 설명하기!",
            "badge": "키즈핏 교육웹툰 7화 · 3분 파인만 백지복습",
            "header_title": "학원 다녀오면 다 까먹는 아이\n하루 3분 백지복습의 기적!",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
            "step_label": "3 / 4",
        },
        {
            "img_path": ep7_folder / "04_4컷.png",
            "sub": "해마 장기기억 보존율 90% 폭발!\n키즈핏(kidsfit.co.kr)에서 백지복습 노트를 뽑아보세요",
            "badge": "키즈핏 교육웹툰 7화 · 3분 파인만 백지복습",
            "header_title": "학원 다녀오면 다 까먹는 아이\n하루 3분 백지복습의 기적!",
            "accent": (79, 70, 229),
            "bg_top": (238, 242, 255),
            "step_label": "4 / 4",
        },
    ]

    mp4_name = "07_네이버클립_웹툰7화_학원다녀오면까먹는아이백지복습.mp4"
    out_mp4 = CLIP_OUT_KO / mp4_name
    render_pageflip_video(ep7_video_cuts, out_mp4, cut_dur=4.0, flip_dur=0.65, fps=24)
    shutil.copy2(out_mp4, CLIP_SAMPLE_DIR / mp4_name)
    print(f"✅ Rebuilt Episode 7 16s Page-Flip Acoustic Piano BGM video: {out_mp4}")

    # Dispatch complete Episode 7 package (@kids_fit1 format) to Telegram
    subprocess.run(["node", str(ROOT_DIR / "scripts" / "send_daily_6am_insta_threads.js"), "--ep=7"], check=True)
    print("✅ Dispatched newly rebuilt Episode 7 package to Telegram!")


if __name__ == "__main__":
    main()
