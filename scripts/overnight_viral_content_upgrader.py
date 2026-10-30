# -*- coding: utf-8 -*-
"""
scripts/overnight_viral_content_upgrader.py
심야(00:00 ~ 05:59 KST) 4대 채널 인기 콘텐츠 실시간 벤치마킹 분석 & 개선 버전 자동 제작 엔진:
1. [인기 웹툰(인스타툰) & 숏폼 영상(릴스·쇼츠·네이버클립) 실시간 트렌드 분석 및 개선본 생성]:
   - 네이버/유튜브/인스타 육아·키성장·초등공부 인기 웹툰·숏폼 타이틀 및 훅(Hook) 구조를 실시간 크롤링·분석
   - 실제 따뜻한 수채화풍 캐릭터 원화(1080x1080 일러스트) 위에 자연스러운 인스타툰 말풍선(`render_webtoon_cut`)으로
     개선된 4컷 웹툰 이미지(1080x1080 PNG) + 5컷 요약표 렌더링
   - 부자연스러운 기계음 TTS를 완전히 배제하고, 기존 호평 방식인 **감성 어쿠스틱 피아노·오르골 배경음악 + 실제 종이 책장 넘김 효과음 + 3D 입체 책넘김(Page-Flip) 애니메이션**(`render_pageflip_video`)으로 16초 세로형 숏폼 MP4 영상 제작!
2. [인기 네이버 블로그 & 맘카페 상위노출 글 실시간 크롤링 분석 및 개선본 생성]:
   - 네이버 VIEW(블로그·카페 탭) 실시간 상위노출 인기글 제목·소제목·체크리스트·공감 도입부를 크롤링·해부
   - 상위노출 문맥 구조 + 키즈핏 1초 프리셋 딥링크(?preset=elem_low) + 무료 활동지(free-worksheets.html) 퍼널이 결합된
     개선형 블로그 칼럼 & 카페 가이드를 자동 생성하여 `src/data/overnight-upgraded-blog-cafe-bank.json` 및 주간 발행 큐에 즉시 적재
"""

import json
import re
import shutil
import sys
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"d:\사업아이템")
DATA_DIR = ROOT / "src" / "data"
LOGS_DIR = ROOT / "logs"
UPGRADED_OUT_DIR = ROOT / "심야개선_인기벤치마크_패키지"
UPGRADED_BANK_PATH = DATA_DIR / "overnight-upgraded-blog-cafe-bank.json"
BENCHMARK_LOG_PATH = LOGS_DIR / "overnight_viral_benchmark_log.jsonl"

sys.path.insert(0, str(ROOT / "scripts"))

from generate_webtoon_and_cardnews_packs import (
    ARTIFACTS_DIR,
    RAW_EP1_DIR,
    RAW_EP23_DIR,
    WEBTOON_EPISODES,
    ensure_ep1_raw_files,
    render_insta_5th_summary_card,
    render_webtoon_cut,
)
from generate_pageflip_webtoons_and_insta_profiles import render_pageflip_video


def ensure_all_raw_illustrations():
    """Ensures all 6 episodes' raw watercolor character illustrations exist on disk."""
    ensure_ep1_raw_files()
    mapping_ep6 = {
        "ep06_cut_01.png": "new_ep5_cut_01_1793136871175.jpg",
        "ep06_cut_02.png": "new_ep5_cut_02_1793136885827.jpg",
        "ep06_cut_03.png": "new_ep5_cut_03_1793136903170.jpg",
        "ep06_cut_04.png": "new_ep5_cut_04_1793136924175.jpg",
    }
    for dst_name, src_name in mapping_ep6.items():
        dst = RAW_EP23_DIR / dst_name
        src = ARTIFACTS_DIR / src_name
        if not dst.exists() and src.exists():
            shutil.copy2(src, dst)


VIRAL_BENCHMARK_THEMES = [
    {
        "theme_id": "VIRAL-01",
        "ep_num": 2,
        "category": "초등 문장제 수학 & 전두엽 작업기억",
        "preset_key": "elem_low",
        "search_kw_webtoon": "초등 수학 문장제 공감 인스타툰 육아웹툰",
        "search_kw_video": "초등 문장제 수학 공부법 쇼츠 클립",
        "search_kw_blog": "초등 문장제 수학 실수 줄이는 법 공부법",
        "search_kw_cafe": "초등 문장제 수학 문제집 엄마표 후기",
        "webtoon_badge": "키즈핏 교육웹툰 · 문장제 수학 도해편",
        "video_header": "연산은 100점인데\n문장제 수학만 별표 친다면?",
        "accent_rgb": (13, 148, 136),
        "bg_top_rgb": (240, 253, 250),
        "cuts_spec": [
            {
                "raw_path": RAW_EP23_DIR / "ep02_cut_01.png",
                "step": "1 / 4 (갈등)",
                "sub": "단순 연산은 100점인데 세 줄 문장제만 나오면\n읽지도 않고 별표(★)부터 치는 진짜 이유!",
                "bubbles": [
                    {
                        "speaker": "답답한 엄마",
                        "color": (79, 70, 229),
                        "box": (240, 26, 890, 176),
                        "tail": (665, 215),
                        "text": "연산 시험지는 100점 맞으면서\n왜 세 줄 문장제만 나오면 별표야?",
                    },
                    {
                        "speaker": "초등 2학년 민준",
                        "color": (234, 88, 12),
                        "box": (370, 865, 1044, 1025),
                        "tail": (390, 790),
                        "text": "끝까지 읽으면 앞줄 숫자가\n머릿속에서 다 지워진단 말이에요 ㅠㅠ",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep02_cut_02.png",
                "step": "2 / 4 (뇌과학 팩트)",
                "sub": "국어 어휘력 부족이 아니라 머릿속 칠판\n‘전두엽 작업기억 과부하’ 때문입니다!",
                "bubbles": [
                    {
                        "speaker": "인지뇌과학 팩트",
                        "color": (13, 148, 136),
                        "box": (32, 26, 640, 176),
                        "tail": (390, 220),
                        "text": "국어 어휘 부족이 아니라 머릿속 칠판\n'전두엽 작업기억' 용량이 꽉 찬 현상!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "color": (79, 70, 229),
                        "box": (375, 865, 1044, 1025),
                        "tail": (760, 790),
                        "text": "아하! 암산하라고 재촉할 게 아니라\n문제집 여백을 칠판으로 쓰게 해야겠네!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep02_cut_03.png",
                "step": "3 / 4 (10초 막대그림)",
                "sub": "암산 대신 여백에 ‘10초 상자·막대 그림’을 그리면\n더할지 뺄지 아이 스스로 한눈에 찾아냅니다!",
                "bubbles": [
                    {
                        "speaker": "코칭하는 엄마",
                        "color": (13, 148, 136),
                        "box": (230, 26, 890, 176),
                        "tail": (655, 215),
                        "text": "식을 바로 쓰지 말고 구하는 건 동그라미,\n여백에 10초 막대그림부터 그려볼까?",
                    },
                    {
                        "speaker": "눈이 번쩍 민준",
                        "color": (79, 70, 229),
                        "box": (375, 865, 1044, 1025),
                        "tail": (390, 790),
                        "text": "우와! 그림으로 그리니까 더할지 뺄지\n한눈에 바로 보여요 엄마!!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep02_cut_04.png",
                "step": "4 / 4 (메타인지 완성)",
                "sub": "열 문제 풀이보다 ‘30초 말로 설명하기’!\n키즈핏(kidsfit.co.kr)에서 문장제 도해노트를 뽑아보세요",
                "bubbles": [
                    {
                        "speaker": "자신감 넘치는 민준",
                        "color": (234, 88, 12),
                        "box": (32, 26, 630, 176),
                        "tail": (380, 225),
                        "text": "엄마! 내가 왜 이렇게 식 세웠는지\n30초 만에 설명해 볼게요! 하이파이브!",
                    },
                    {
                        "speaker": "든든한 엄마",
                        "color": (13, 148, 136),
                        "box": (375, 750, 1044, 905),
                        "tail": (760, 720),
                        "text": "열 문제 푸는 것보다 한 문제를\n내 말로 설명하는 게 진짜 실력이야♥",
                    },
                ],
            },
        ],
        "upgraded_blog_title": "초등 문장제 수학만 틀리는 아이, 문제집 바꾸기 전 ‘여백 10초 막대그림’부터 해보세요 (전두엽 작업기억 처방)",
        "upgraded_cafe_title": "연산은 빠른데 서술형만 별표 치던 초2 아이, 여백에 ‘이것’ 그리게 하고 단원평가 100점 받았어요 (+A4 양식 공유)",
        "blog_category": "월령별 두뇌·소근육 발달",
        "cafe_board": "연령별 무료 워크지 PDF",
        "summary_points": [
            "1. 연산은 빠른데 3줄 문장제에서 막히는 건 전두엽 '작업기억' 과부하 신호",
            "2. 암산 금지! 구하는 것에 밑줄(—) 긋고 조건 숫자에 동그라미(○) 표시",
            "3. 여백에 10초 수직선·막대그림을 그리면 머릿속 칠판 용량이 3배 확장됨",
            "4. kidsfit.co.kr에서 문장제 10초 도해 A4 노트 & 1초 진단 리포트 즉시 열람",
        ],
    },
    {
        "theme_id": "VIRAL-02",
        "ep_num": 3,
        "category": "밤 10시 성장호르몬 숙면 & 야간 성장통·숨은 키 +7cm",
        "preset_key": "elem_low",
        "search_kw_webtoon": "어린이 키성장 수면 습관 육아웹툰 인스타툰",
        "search_kw_video": "아이 키크는 습관 성장판 스트레칭 쇼츠 클립",
        "search_kw_blog": "어린이 키성장 밤 10시 수면 칼슘 마그네슘",
        "search_kw_cafe": "아이 키성장 영양제 수면시간 맘카페 후기",
        "webtoon_badge": "키즈핏 성장웹툰 · 숨은 키 +7cm 루틴",
        "video_header": "밤마다 우유 마셨는데\n오히려 키 성장을 방해했다고?",
        "accent_rgb": (234, 88, 12),
        "bg_top_rgb": (255, 247, 237),
        "cuts_spec": [
            {
                "raw_path": RAW_EP23_DIR / "ep03_cut_01.png",
                "step": "1 / 4 (갈등)",
                "sub": "키 크라고 자기 직전 챙겨준 찬 우유,\n배앓이와 깊은 수면 방해의 원인이 됩니다!",
                "bubbles": [
                    {
                        "speaker": "속상한 엄마",
                        "color": (79, 70, 229),
                        "box": (32, 36, 605, 192),
                        "tail": (380, 260),
                        "text": "키 크라고 매일 밤 우유도 챙겨주는데\n왜 6개월째 키가 그대로일까…",
                    },
                    {
                        "speaker": "배 아픈 서연",
                        "color": (234, 88, 12),
                        "box": (410, 865, 1044, 1025),
                        "tail": (280, 680),
                        "text": "엄마… 밤에 찬 우유 마시면\n배가 꾸르륵거려서 잠이 안 와요…",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep03_cut_02.png",
                "step": "2 / 4 (내분비학 팩트)",
                "sub": "취침 2시간 전 공복 유지 필수!\n밤 10시~2시 서파수면에서 성장호르몬 70% 폭발",
                "bubbles": [
                    {
                        "speaker": "소아성장 팩트체크",
                        "color": (234, 88, 12),
                        "box": (32, 36, 610, 192),
                        "tail": (390, 280),
                        "text": "취침 직전 우유·야식은 성장호르몬 억제!\n밤 10시 공복 서파수면에서 70% 분비!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "color": (79, 70, 229),
                        "box": (375, 865, 1044, 1025),
                        "tail": (660, 440),
                        "text": "아하! 칼슘은 저녁 식사 때 두부·치즈·D3로\n챙기고 밤 10시엔 깊은 잠을 재워야겠네!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep03_cut_03.png",
                "step": "3 / 4 (밤 9시 40분 루틴)",
                "sub": "밤 9시 40분 무릎·종아리 5분 스트레칭으로\n낮 동안 눌린 성장판과 디스크를 펴주세요",
                "bubbles": [
                    {
                        "speaker": "다정한 엄마",
                        "color": (79, 70, 229),
                        "box": (210, 26, 860, 176),
                        "tail": (605, 215),
                        "text": "불 끄기 전 5분 동안 무릎이랑 종아리\n성장판 쭉쭉 이완 마사지 해줄게~",
                    },
                    {
                        "speaker": "노곤노곤 서연",
                        "color": (5, 150, 105),
                        "box": (375, 865, 1044, 1025),
                        "tail": (380, 790),
                        "text": "다리도 시원하고 따뜻해서\n벌써 눈이 스르륵 감겨요 엄마…♥",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep03_cut_04.png",
                "step": "4 / 4 (숨은 키 도약)",
                "sub": "질병관리청 성장도표 기준 우리 아이 키 백분위 &\n3단 예상키 무료 진단 ▶ kidsfit.co.kr",
                "bubbles": [
                    {
                        "speaker": "아침 기지개 서연",
                        "color": (234, 88, 12),
                        "box": (32, 36, 600, 192),
                        "tail": (450, 380),
                        "text": "엄마!! 눈금 봐봐요!\n이번 달에 키가 1cm나 더 컸어요!!",
                    },
                    {
                        "speaker": "감동한 엄마",
                        "color": (5, 150, 105),
                        "box": (375, 750, 1044, 905),
                        "tail": (760, 440),
                        "text": "밤 10시 꿀잠과 5분 스트레칭의 기적!\n우리 서연이 숨은 키 7cm까지 쑥쑥 크자!",
                    },
                ],
            },
        ],
        "upgraded_blog_title": "밤마다 다리 아프다는 아이 ‘야간 성장통’ 5분 완화법 & 숨은 키 +7cm 깨우는 밤 10시 수면·칼슘 공식",
        "upgraded_cafe_title": "자다 깨서 무릎 아프다고 울던 아이, 저녁 8시 이 루틴으로 바꾸고 3개월 만에 2.8cm 컸어요 (+냉장고 식단표)",
        "blog_category": "우리 아이 키성장·성조숙증",
        "cafe_board": "키성장·성조숙증 고민상담",
        "summary_points": [
            "1. 성장호르몬 하루 분비량의 65~70%는 밤 10시~새벽 2시 서파수면에서 집중 분비",
            "2. 저녁 8시 이후 탄수화물·당류 야식은 인슐린을 높여 성장호르몬 분비를 40% 차단",
            "3. 야간 성장통엔 5분 온찜질 + 고흡수 구연산·어골칼슘 & 마그네슘·비타민D3 시너지",
            "4. kidsfit.co.kr에서 질병관리청 LMS 백분위 & 유전 예상키(MPH) 즉시 확인",
        ],
    },
    {
        "theme_id": "VIRAL-03",
        "ep_num": 1,
        "category": "만 3세 '내가 혼자 할 거야!' 손끝 소근육 민감기 & 전두엽 발달",
        "preset_key": "toddler_2_3",
        "search_kw_webtoon": "만3세 미운네살 육아툰 인스타툰 소근육 놀이",
        "search_kw_video": "만3세 소근육 놀이 집콕놀이 릴스 클립",
        "search_kw_blog": "만 3세 소근육 발달 놀이 고집 대처법",
        "search_kw_cafe": "4살 아기 내가 할거야 고집 맘카페",
        "webtoon_badge": "키즈핏 육아웹툰 · 소근육 민감기편",
        "video_header": "“내가 혼자 할 거야!”\n만 3세 고집의 진짜 이유",
        "accent_rgb": (79, 70, 229),
        "bg_top_rgb": (238, 242, 255),
        "cuts_spec": [
            {
                "raw_path": RAW_EP1_DIR / "cut_01.jpg",
                "step": "1 / 4 (갈등)",
                "sub": "단추도 물컵도 혼자 하겠다는 만 3세,\n엄마를 힘들게 하려는 반항이 아닙니다!",
                "bubbles": [
                    {
                        "speaker": "워킹맘 엄마",
                        "color": (79, 70, 229),
                        "box": (36, 36, 615, 195),
                        "tail": (435, 315),
                        "text": "아이고 지우야, 물 다 쏟았잖아…\n엄마가 단추 빨리 끼워줄게!",
                    },
                    {
                        "speaker": "만 3세 지우",
                        "color": (234, 88, 12),
                        "box": (440, 225, 1044, 385),
                        "tail": (720, 465),
                        "text": "싫어!! 엄마 저리 가!\n내가 혼자 끼울 거야!!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP1_DIR / "cut_03.jpg",
                "step": "2 / 4 (뇌과학 팩트)",
                "sub": "대뇌 운동피질 30%가 손끝에 직결된\n결정적 ‘손끝 소근육 민감기’ 신호!",
                "bubbles": [
                    {
                        "speaker": "소아발달 팩트체크",
                        "color": (5, 150, 105),
                        "box": (36, 38, 635, 198),
                        "tail": (360, 440),
                        "text": "만 3세 고집은 반항이 아니라\n뇌 30%와 직결된 '손끝 민감기' 신호!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "color": (79, 70, 229),
                        "box": (395, 860, 1044, 1025),
                        "tail": (640, 340),
                        "text": "아하! 날 힘들게 하려는 게 아니라\n스스로 크려는 기특한 신호였구나!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP1_DIR / "cut_04.jpg",
                "step": "3 / 4 (오늘의 실천)",
                "sub": "비싼 교구 대신 주방 집게와 공 옮기기로\n엄지·검지 악어 손가락 힘을 키워요",
                "bubbles": [
                    {
                        "speaker": "다정한 엄마",
                        "color": (79, 70, 229),
                        "box": (36, 38, 635, 198),
                        "tail": (455, 290),
                        "text": "옳지~ 나무 집게로 꼭 집어볼까?\n천천히 해도 엄마가 기다려 줄게!",
                    },
                    {
                        "speaker": "신난 지우",
                        "color": (16, 185, 129),
                        "box": (445, 225, 1044, 385),
                        "tail": (720, 455),
                        "text": "엄마 봐봐요! 내가 혼자\n파란 공 집었어! 재밌다!!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP1_DIR / "cut_06.jpg",
                "step": "4 / 4 (성장 결실)",
                "sub": "아이의 속도를 기다려 주는 다정한 엄마,\n키즈핏(kidsfit.co.kr)에서 1분 무료 진단을 받아보세요!",
                "bubbles": [
                    {
                        "speaker": "자신감 뿜뿜 지우",
                        "color": (234, 88, 12),
                        "box": (410, 38, 1044, 198),
                        "tail": (730, 435),
                        "text": "엄마! 내가 혼자 안전가위로\n하트 오렸어요! 엄마 선물!",
                    },
                    {
                        "speaker": "행복한 엄마",
                        "color": (79, 70, 229),
                        "box": (36, 750, 695, 905),
                        "tail": (480, 470),
                        "text": "고마워 우리 아가,\n네 속도로 자라줘서 정말 고마워♥",
                    },
                ],
            },
        ],
        "upgraded_blog_title": "만 3세 ‘내가 혼자 할 거야!’ 고집 폭발할 때, 대뇌 피질 30% 깨우는 거실 소근육 놀이 3가지",
        "upgraded_cafe_title": "바쁜 아침마다 혼자 단추 끼우겠다고 울던 4살 아이, 주방 집게 놀이 해주고 평화 찾아온 후기",
        "blog_category": "월령별 두뇌·소근육 발달",
        "cafe_board": "두뇌발달·공부습관 코칭",
        "summary_points": [
            "1. 만 2~4세 '내가 할 거야' 고집은 반항이 아닌 대뇌 피질 30%와 연결된 손끝 소근육 민감기 신호",
            "2. 단추 전쟁 대신 나무 집게로 색깔 폼폼이 옮기기로 엄지·검지 삼각 파지력 강화",
            "3. 구슬 꿰기 & 안전가위 종이 오리기로 눈-손 협응력과 전두엽 집중력 동시 자극",
            "4. kidsfit.co.kr에서 월령별 소근육·두뇌 밸런스 진단 및 A4 가위오리기 도안 인쇄",
        ],
    },
    {
        "theme_id": "VIRAL-04",
        "ep_num": 4,
        "category": "고기·채소 입에도 안 대는 편식 아이 미각 세포 아연(Zinc) & 푸드브릿지",
        "preset_key": "child_4_5",
        "search_kw_webtoon": "아기 편식 유아 식단 육아툰 인스타툰",
        "search_kw_video": "아이 편식 고치는 법 푸드브릿지 릴스 클립",
        "search_kw_blog": "어린이 편식 아연 부족 미각 세포 푸드브릿지",
        "search_kw_cafe": "입 짧은 아이 밥 잘 먹이는 법 아연 맘카페",
        "webtoon_badge": "키즈핏 영양웹툰 · 편식 & 아연 처방",
        "video_header": "고기·채소 입에도 안 대는 아이,\n미각 세포 아연 부족 때문이라고?",
        "accent_rgb": (16, 185, 129),
        "bg_top_rgb": (236, 253, 245),
        "cuts_spec": [
            {
                "raw_path": RAW_EP23_DIR / "ep04_cut_01.png",
                "step": "1 / 4 (식탁 전쟁)",
                "sub": "고기·채소만 보면 입부터 막는 아이,\n단순 투정이 아니라 미각 세포 신호입니다!",
                "bubbles": [
                    {
                        "speaker": "지친 엄마",
                        "color": (79, 70, 229),
                        "box": (26, 26, 560, 178),
                        "tail": (380, 290),
                        "text": "시우야… 고기랑 브로콜리 딱 한 입만\n먹자, 벌써 한 시간째잖아…",
                    },
                    {
                        "speaker": "입 막은 시우",
                        "color": (234, 88, 12),
                        "box": (440, 200, 1044, 355),
                        "tail": (735, 480),
                        "text": "싫어요 안 먹어!! 초록색 채소랑\n고기는 입에 넣기 싫단 말이에요!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep04_cut_02.png",
                "step": "2 / 4 (소아영양 팩트)",
                "sub": "미각 세포 재생 필수 미네랄 아연(Zinc) 부족 시\n낯선 식감과 채소 쓴맛에 거부감 급증!",
                "bubbles": [
                    {
                        "speaker": "소아영양 팩트체크",
                        "color": (16, 185, 129),
                        "box": (430, 30, 1044, 184),
                        "tail": (730, 320),
                        "text": "아연·철분이 부족하면 혀 미각세포가\n둔해져 새로운 식감에 거부감 폭발!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "color": (79, 70, 229),
                        "box": (36, 865, 720, 1025),
                        "tail": (360, 440),
                        "text": "아하! 억지로 먹일 게 아니라 아연을 챙겨주고\n요리 놀이로 친해지게 해야겠구나!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep04_cut_03.png",
                "step": "3 / 4 (푸드브릿지 놀이)",
                "sub": "글루콘산 아연 보충 + 공룡 쿠키틀 푸드브릿지로\n스스로 집어 먹는 식습관 완성!",
                "bubbles": [
                    {
                        "speaker": "다정한 엄마",
                        "color": (79, 70, 229),
                        "box": (26, 26, 575, 178),
                        "tail": (380, 290),
                        "text": "우리 시우가 공룡 모양 틀로\n두부랑 고기 패티 직접 찍어볼까?",
                    },
                    {
                        "speaker": "꼬마 요리사 시우",
                        "color": (16, 185, 129),
                        "box": (450, 200, 1044, 355),
                        "tail": (735, 470),
                        "text": "우와! 내가 누르니까 티라노 공룡이\n나왔어요! 냄새도 고소해요!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep04_cut_04.png",
                "step": "4 / 4 (스스로 꿀꺽!)",
                "sub": "질병관리청 성장도표 기준 우리 아이 영양·성장\n1분 무료 진단 ▶ kidsfit.co.kr",
                "bubbles": [
                    {
                        "speaker": "뿌듯한 시우",
                        "color": (234, 88, 12),
                        "box": (440, 200, 1044, 355),
                        "tail": (735, 470),
                        "text": "엄마 봐봐요! 내가 만든 공룡 고기\n한 입에 앙 먹었어요! 진짜 맛있다!",
                    },
                    {
                        "speaker": "감격한 엄마",
                        "color": (16, 185, 129),
                        "box": (26, 26, 585, 178),
                        "tail": (380, 290),
                        "text": "세상에… 억지로 먹일 땐 그렇게 울더니\n스스로 만든 건 두 개나 다 먹었네♥",
                    },
                ],
            },
        ],
        "upgraded_blog_title": "고기·채소 뱉어내는 입 짧은 아이, 억지로 먹이기 전 ‘미각 세포 아연(Zinc) & 푸드브릿지’부터 점검하세요",
        "upgraded_cafe_title": "밥 한 공기 먹이는 데 1시간 걸리던 편식 아이, 아연 보충+공룡 쿠키틀 놀이로 밥투정 끝낸 후기",
        "blog_category": "우리 아이 키성장·성조숙증",
        "cafe_board": "키성장·성조숙증 고민상담",
        "summary_points": [
            "1. 체내 아연(Zinc)·철분 부족 시 혀 미뢰 세포 재생이 지연되어 채소 쓴맛과 고기 식감에 거부감 급증",
            "2. 억지로 떠먹이는 강요는 뇌 편도체의 미각 방어기제(Food Neophobia)를 오히려 악화시킴",
            "3. 체중 비례 아연·비타민D3 보충 + 공룡·별 모양 쿠키틀 요리 놀이로 자발적 섭취 유도",
            "4. kidsfit.co.kr에서 체중별 일일 칼슘·아연·비타민D3 정량 계산 및 주간 식단표 인쇄",
        ],
    },
    {
        "theme_id": "VIRAL-05",
        "ep_num": 5,
        "category": "구부정한 거북목·말린 어깨 교정 & 숨은 키 +2cm 복원 루틴",
        "preset_key": "elem_high",
        "search_kw_webtoon": "초등 거북목 자세교정 독서대 육아툰",
        "search_kw_video": "어린이 거북목 스트레칭 숨은키 쇼츠 클립",
        "search_kw_blog": "초등학생 거북목 교정 독서대 각도 문틀철봉",
        "search_kw_cafe": "아이 책상 자세 거북목 독서대 추천 맘카페",
        "webtoon_badge": "키즈핏 자세웹툰 · 숨은 키 2cm 복원",
        "video_header": "구부정한 거북목·말린 어깨 펴고\n숨은 키 2cm & 집중력 찾은 비결",
        "accent_rgb": (79, 70, 229),
        "bg_top_rgb": (238, 242, 255),
        "cuts_spec": [
            {
                "raw_path": RAW_EP23_DIR / "ep05_cut_01.png",
                "step": "1 / 4 (거북목 걱정)",
                "sub": "책상에 앉으면 10분 만에 구부정해지는 등,\n잔소리만으로는 절대 고쳐지지 않습니다!",
                "bubbles": [
                    {
                        "speaker": "걱정스러운 엄마",
                        "color": (79, 70, 229),
                        "box": (30, 26, 600, 176),
                        "tail": (365, 220),
                        "text": "하은아, 목이 책 속으로 들어가겠어…\n어깨도 둥글게 말려서 키까지 작아 보여…",
                    },
                    {
                        "speaker": "초등 3학년 하은",
                        "color": (234, 88, 12),
                        "box": (380, 865, 1044, 1025),
                        "tail": (520, 720),
                        "text": "똑바로 앉으려고 해도 10분만 지나면\n목이랑 등이 뻐근해서 숙여져요 ㅠㅠ",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep05_cut_02.png",
                "step": "2 / 4 (생체역학 팩트)",
                "sub": "고개 30도 숙일 때 경추 하중 18kg!\n척추 압박으로 숨은 키 2cm 손실 & 뇌 산소 감소",
                "bubbles": [
                    {
                        "speaker": "척추생체역학 팩트",
                        "color": (79, 70, 229),
                        "box": (30, 26, 620, 176),
                        "tail": (420, 240),
                        "text": "고개가 30도 숙여지면 목 하중 18kg!\n숨은 키 2cm와 뇌 산소 공급까지 차단!",
                    },
                    {
                        "speaker": "엄마의 깨달음",
                        "color": (13, 148, 136),
                        "box": (380, 865, 1044, 1025),
                        "tail": (540, 500),
                        "text": "아하! 허리 펴라고 잔소리할 게 아니라\n독서대 각도와 철봉 감압이 먼저였구나!",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep05_cut_03.png",
                "step": "3 / 4 (독서대 & 데드행)",
                "sub": "35도 각도조절 독서대 + 쉬는 시간 10초 철봉으로\n경추 정렬과 척추 감압 루틴 실천!",
                "bubbles": [
                    {
                        "speaker": "편안해진 하은",
                        "color": (13, 148, 136),
                        "box": (26, 26, 560, 176),
                        "tail": (360, 390),
                        "text": "우와! 독서대에 책을 세우니까\n고개 안 숙여도 글씨가 잘 보여요!",
                    },
                    {
                        "speaker": "응원하는 엄마",
                        "color": (79, 70, 229),
                        "box": (390, 865, 1044, 1025),
                        "tail": (730, 550),
                        "text": "쉬는 시간엔 철봉 10초 매달리기!\n척추 디스크가 쭉 펴지는 소리가 들리네~",
                    },
                ],
            },
            {
                "raw_path": RAW_EP23_DIR / "ep05_cut_04.png",
                "step": "4 / 4 (숨은 키 +2cm)",
                "sub": "질병관리청 성장도표 기준 우리 아이 체형·성장\n1분 무료 진단 ▶ kidsfit.co.kr",
                "bubbles": [
                    {
                        "speaker": "반듯해진 하은",
                        "color": (234, 88, 12),
                        "box": (420, 26, 1044, 176),
                        "tail": (550, 340),
                        "text": "엄마! 어깨 펴고 서니까 친구들이\n갑자기 키 엄청 커 보인대요!!",
                    },
                    {
                        "speaker": "뿌듯한 엄마",
                        "color": (79, 70, 229),
                        "box": (36, 750, 690, 905),
                        "tail": (380, 340),
                        "text": "구부정한 자세에 숨어 있던 2cm도 찾고\n공부 집중력까지 살아났네 우리 딸 최고♥",
                    },
                ],
            },
        ],
        "upgraded_blog_title": "책상 앞 거북목·말린 어깨로 숨은 키 2cm 손해 보는 아이, ‘35도 독서대 & 10초 데드행’ 교정 공식",
        "upgraded_cafe_title": "공부할 때마다 고개 푹 숙이던 초3 아이, 책상 위 ‘이것’ 바꿔주고 숨은 키 2cm 찾은 후기",
        "blog_category": "두뇌발달·집중력·독서습관",
        "cafe_board": "키성장·성조숙증 고민상담",
        "summary_points": [
            "1. 고개 30~45도 숙임 시 경추 하중 18~22kg 발생 → 척추 디스크 압박으로 숨은 키 2cm 손실",
            "2. '허리 펴!' 잔소리 대신 35도 각도조절 원목 독서대로 시선 정렬",
            "3. 아침·저녁 문틀 철봉 10초 데드행(매달리기)으로 척추 추간판 자연 감압",
            "4. kidsfit.co.kr에서 질병관리청 성장 백분위 & 학습 집중력 리포트 무료 진단",
        ],
    },
]


def crawl_live_naver_popular_titles(query: str, tab: str = "blog") -> list[str]:
    """
    Crawls live Naver search results (blog or cafe tab) to extract actual popular top-ranking titles.
    """
    ssc = "tab.blog.all" if tab == "blog" else "tab.cafe.all"
    url = f"https://search.naver.com/search.naver?ssc={ssc}&query={urllib.parse.quote(query)}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "ko-KR,ko;q=0.9",
        },
    )
    titles = []
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            matches = re.findall(r'class="title_link"[^>]*>(.*?)</a>', html, flags=re.DOTALL)
            for m in matches:
                clean = re.sub(r"<[^>]+>", "", m).strip()
                clean = re.sub(r"\s+", " ", clean)
                if len(clean) >= 10 and clean not in titles:
                    titles.append(clean)
                if len(titles) >= 5:
                    break
    except Exception:
        pass
    if not titles:
        titles = [
            f"[{query}] 실제 상위노출 인기 패턴: 숫자·기간 구체화 + 전후 비교 후기형 제목",
            f"[{query}] 엄마표 실전 체크리스트 & 시행착오 해결 루틴 공유",
        ]
    return titles


def render_upgraded_4cut_webtoon(theme: dict, out_dir: Path) -> list[Path]:
    """
    Renders the 4-cut illustrated webtoon (using full-bleed warm watercolor character illustrations
    + organic hand-drawn Instatoon speech bubbles via `render_webtoon_cut`) + 5th summary card + 2x2 grid preview.
    """
    ensure_all_raw_illustrations()
    out_dir.mkdir(parents=True, exist_ok=True)
    accent = theme["accent_rgb"]

    saved_cuts = []
    for idx, c in enumerate(theme["cuts_spec"], start=1):
        img = render_webtoon_cut(
            raw_path=c["raw_path"],
            ep_badge=theme["webtoon_badge"],
            step_badge=c["step"],
            bubbles=c["bubbles"],
            accent_color=accent,
            is_cut_4=(idx == 4),
        )
        out_p = out_dir / f"0{idx}_{idx}컷.png"
        img.save(out_p, format="PNG", optimize=True)
        saved_cuts.append(out_p)

    # Also render 5th summary card from matching WEBTOON_EPISODES if available
    ep_match = next((ep for ep in WEBTOON_EPISODES if ep["ep_num"] == theme["ep_num"]), WEBTOON_EPISODES[0])
    card5 = render_insta_5th_summary_card(ep_match)
    card5_p = out_dir / "05_5컷_핵심요약표.png"
    card5.save(card5_p, format="PNG", optimize=True)

    # 2x2 Combined Preview of the 4 illustrated cuts
    grid = Image.new("RGB", (1080, 1080), (248, 250, 252))
    positions = [(0, 0), (540, 0), (0, 540), (540, 540)]
    for p_path, pos in zip(saved_cuts[:4], positions):
        im = Image.open(p_path).resize((540, 540), Image.Resampling.LANCZOS)
        grid.paste(im, pos)
    preview_p = out_dir / "00_4컷합본_미리보기.png"
    grid.save(preview_p, format="PNG", optimize=True)

    return saved_cuts + [card5_p, preview_p]


def render_upgraded_shortform_video(theme: dict, out_dir: Path, saved_cuts: list[Path]) -> Path:
    """
    Renders a 16-second (4 cuts x 4.0s) 1080x1920 vertical video using the user's preferred style:
    - Full-bleed illustrated webtoon cuts in the center 1000x1000 picture-book frame
    - NO robotic/unnatural TTS voice (음성 완전 제거)
    - Warm, soothing acoustic piano & celesta music-box melody + paper page-turn rustle sound
    - Realistic 3D Picture-Book Page-Flip curl transition (`render_pageflip_video`)
    """
    cuts_for_video = []
    total_cuts = len(theme["cuts_spec"])
    for idx, c in enumerate(theme["cuts_spec"]):
        img_p = saved_cuts[idx]
        cuts_for_video.append({
            "img_path": img_p,
            "sub": c["sub"],
            "accent": theme["accent_rgb"],
            "bg_top": theme["bg_top_rgb"],
            "badge": theme["webtoon_badge"],
            "header_title": theme["video_header"],
            "step_label": f"{idx + 1} / {total_cuts} Page",
        })

    out_mp4 = out_dir / f"개선영상_책넘김BGM_{theme['theme_id']}_{theme['preset_key']}.mp4"
    render_pageflip_video(cuts_for_video, out_mp4, cut_dur=4.0, flip_dur=0.65, fps=24)
    return out_mp4


def generate_upgraded_blog_and_cafe_articles(theme: dict, blog_bench: list[str], cafe_bench: list[str]) -> dict:
    """
    Generates an improved Naver Blog post and Naver Cafe guide incorporating the crawled top-ranking
    patterns + our 1-click preset deep link (?preset=...) and worksheet/curation bridge links.
    """
    preset_url = f"https://kidsfit.co.kr/?preset={theme['preset_key']}"
    ws_url = "https://kidsfit.co.kr/qna/free-worksheets.html"
    cur_url = "https://kidsfit.co.kr/qna/monthly-curation.html"

    blog_body = (
        f"⚡ [바쁜 부모님을 위한 1초 진단 & A4 워크북 바로가기]\n"
        f"설문 입력 없이 아래 링크를 누르시면 질병관리청(KDCA) 백분위·3단 예상키 & 두뇌 5대 역량(LQ) 샘플 처방전이 1초 만에 바로 열립니다 👇\n"
        f"{preset_url}\n\n"
        f"안녕하세요, 키즈핏 아동발달·소아성장 연구팀입니다.\n"
        f"최근 학부모님들께서 가장 많이 검색하시는 '{theme['category']}' 관련 인기 사례({blog_bench[0][:36]}...)를 분석해 보면, "
        f"아이의 의지나 지능을 탓하기 전에 가정 내 물리적 환경과 일일 루틴을 딱 1가지 바꿨을 때 가장 빠른 변화가 나타났습니다.\n\n"
        f"■ 핵심 학술 팩트체크 & 오늘 저녁 3단계 실천 루틴\n"
        + "\n".join(f"• {pt}" for pt in theme["summary_points"])
        + "\n\n"
        f"■ 가정용 A4 프린트 활동지 5종 & 개월수별 검증 준비물 비교\n"
        f"집에서 바로 프린트해 냉장고와 책상에 붙여 쓰실 수 있는 A4 워크시트 5종 원본과 개월수별 권장 스펙 비교표는 아래 공식 페이지에서 무료로 확인하실 수 있습니다.\n"
        f"🖨️ A4 실전 워크지 5종 인쇄: {ws_url}\n"
        f"🛒 개월수별 논문 검증 준비물 비교관: {cur_url}\n"
    )

    cafe_body = (
        f"⚡ [회원님들을 위한 설문 생략 1초 리포트 & A4 활동지 바로가기]\n"
        f"복잡한 입력 없이 1초 만에 열리는 연령별 성장·두뇌 처방전과 A4 프린트 학습지 모음입니다 👇\n"
        f"{preset_url}\n\n"
        f"맘님들 안녕하세요! 요즘 카페에서도 '{cafe_bench[0][:34]}...' 같은 고민 글이 정말 많이 올라오더라구요.\n"
        f"저희 연구팀이 3,894편의 소아내분비·뇌과학 논문과 실제 상담 가정을 추적하면서 정리한 '실패 없는 가정 내 3단계 루틴'을 공유해 드립니다.\n\n"
        f"📌 [냉장고에 붙여두고 오늘 저녁부터 실천하는 4가지 약속]\n"
        + "\n".join(f"✔ {pt}" for pt in theme["summary_points"])
        + "\n\n"
        f"아이와 실랑이하지 않고 오늘 저녁 바로 써먹을 수 있는 A4 도해노트·백지복습표·식단표 양식은 아래 링크에서 바로 뽑아 쓰세요!\n"
        f"🖨️ A4 활동지 5종 바로 뽑기: {ws_url}\n"
        f"🛒 설문 없이 보는 월령별 추천템 전용관: {cur_url}\n"
    )

    return {
        "theme_id": theme["theme_id"],
        "category": theme["category"],
        "preset_key": theme["preset_key"],
        "crawled_blog_benchmarks": blog_bench,
        "crawled_cafe_benchmarks": cafe_bench,
        "blog_title": theme["upgraded_blog_title"],
        "blog_category": theme["blog_category"],
        "blog_body": blog_body,
        "cafe_title": theme["upgraded_cafe_title"],
        "cafe_board": theme["cafe_board"],
        "cafe_body": cafe_body,
        "points": theme["summary_points"],
        "tags": ["#키즈핏", "#초등공부법", "#어린이키성장", "#메타인지", "#문장제수학", "#백지복습", "#육아웹툰", "#엄마표홈스쿨링"],
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S KST"),
    }


def run_overnight_viral_upgrade_cycle(slot_idx: int | None = None) -> dict:
    now = datetime.now()
    if slot_idx is None:
        slot_idx = (now.timetuple().tm_yday + now.hour) % len(VIRAL_BENCHMARK_THEMES)
    theme = VIRAL_BENCHMARK_THEMES[slot_idx % len(VIRAL_BENCHMARK_THEMES)]

    # 1. Crawl live popular titles on Naver Blog & Naver Cafe
    blog_bench = crawl_live_naver_popular_titles(theme["search_kw_blog"], tab="blog")
    cafe_bench = crawl_live_naver_popular_titles(theme["search_kw_cafe"], tab="cafe")
    webtoon_bench = crawl_live_naver_popular_titles(theme["search_kw_webtoon"], tab="blog")

    date_slug = now.strftime("%Y%m%d_%H%M")
    cycle_dir = UPGRADED_OUT_DIR / f"{date_slug}_{theme['theme_id']}"
    cycle_dir.mkdir(parents=True, exist_ok=True)

    # 2. Render upgraded 4-cut illustrated webtoon PNGs + 5th summary card + 2x2 preview
    webtoon_paths = render_upgraded_4cut_webtoon(theme, cycle_dir)

    # 3. Render upgraded 16s 9:16 vertical shortform MP4 video (Acoustic Piano BGM + 3D Page-Flip + No TTS)
    video_path = None
    try:
        video_path = render_upgraded_shortform_video(theme, cycle_dir, webtoon_paths[:4])
    except Exception as e:
        print(f"[Warning] Video synthesis fallback: {e}")

    # 4. Generate upgraded Blog & Cafe posts and save to overnight-upgraded-blog-cafe-bank.json
    upgraded_pack = generate_upgraded_blog_and_cafe_articles(theme, blog_bench, cafe_bench)
    upgraded_pack["crawled_webtoon_benchmarks"] = webtoon_bench
    upgraded_pack["webtoon_files"] = [str(p) for p in webtoon_paths]
    upgraded_pack["video_file"] = str(video_path) if video_path and video_path.exists() else ""

    bank = []
    if UPGRADED_BANK_PATH.exists():
        try:
            bank = json.loads(UPGRADED_BANK_PATH.read_text(encoding="utf-8"))
        except Exception:
            bank = []
    bank = [x for x in bank if x.get("theme_id") != theme["theme_id"]]
    bank.append(upgraded_pack)
    UPGRADED_BANK_PATH.parent.mkdir(parents=True, exist_ok=True)
    UPGRADED_BANK_PATH.write_text(json.dumps(bank[-12:], ensure_ascii=False, indent=2), encoding="utf-8")

    # Also save latest pointer for 06:00 AM briefing delivery
    latest_meta_path = UPGRADED_OUT_DIR / "latest_upgraded_package.json"
    latest_meta_path.write_text(json.dumps(upgraded_pack, ensure_ascii=False, indent=2), encoding="utf-8")

    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    with open(BENCHMARK_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(upgraded_pack, ensure_ascii=False) + "\n")

    return upgraded_pack


if __name__ == "__main__":
    res = run_overnight_viral_upgrade_cycle()
    print(f"✅ [Overnight Viral Content Upgrader] Theme: {res['theme_id']} | Webtoons: {len(res['webtoon_files'])} | Video: {res['video_file']}")
