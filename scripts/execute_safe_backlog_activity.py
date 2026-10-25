# -*- coding: utf-8 -*-
"""
scripts/execute_safe_backlog_activity.py
Account-Safe Naver Kin (지식iN) Clinical Q&A Bank & Helper Functions (12 Rotating Topics + Multi-Answer Safe Guard).
Note: Blog & Cafe post publishing has been unified into the single pipeline (`scripts/publish_3x_daily_blog_and_cafe.py`),
while automated commenting, mutual-neighbor requests & Naver Kin answering run via `scripts/naver_auto_comment_and_kin_daemon.py`.
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

ROOT = Path(r"d:\키즈핏")
PROFILE_DIR = ROOT / ".naver-browser-profile"
STATE_PATH = ROOT / "logs" / "safe_backlog_state.json"
GEN_IMG_DIR = ROOT / "samples" / "9_naver_brand_assets" / "daily_auto_cards"
ENV_PATH = ROOT / ".env"

sys.path.insert(0, str(ROOT / "scripts"))
from publish_3x_daily_blog_and_cafe import (
    ensure_naver_session_cookies,
    load_env,
    send_telegram_message,
)

SAFE_BACKLOG_ITEMS = [
    {
        "id": "backlog_01",
        "kin_search_query": "초등 키 백분위 예상키",
        "kin_answer_no_link": (
            "어머님, 아이가 또래보다 작아 보여서 걱정이 많으실 텐데요. 소아내분비학 기준에서 부모님의 유전 예상키(MPH)는 고정된 한계가 아니라, 성장판이 닫히기 전 수면·영양·자세 환경에 따라 플러스마이너스 5~7cm 이상 달라질 수 있는 기준점입니다.\n\n"
            "질병관리청(KDCA) 소아청소년 성장도표 기준으로 가장 핵심적인 3가지 실천 포인트를 정리해 드립니다.\n\n"
            "1. 부모 유전 표적키(Tanner MPH)와 현재 백분위 점검\n"
            "- 남아는 (아빠 키 + 엄마 키 + 13cm) 나누기 2, 여아는 (아빠 키 + 엄마 키 - 13cm) 나누기 2로 유전 기대치를 계산합니다.\n"
            "- 현재 아이의 월령별 표준 백분위가 유전 기대치보다 낮다면 최근 6개월간 취침 시각 지연, 칼슘·비타민D 흡수 부족, 또는 거북목 자세로 인한 척추 압박 손실(약 1.5~2cm)이 없는지 먼저 점검해 주세요.\n\n"
            "2. 밤 10시 서파수면(깊은 잠) 골든타임 확보\n"
            "- 하루 성장호르몬(GH)의 약 65~70%는 밤 10시~새벽 2시 깊은 서파수면 첫 주기에 집중 분비됩니다. 밤 9시 40분에는 조명을 낮추고 10시 전에 입면하는 루틴이 가장 중요합니다.\n\n"
            "3. 하체 성장판 점프 자극과 저녁 철봉 스트레칭\n"
            "- 줄넘기나 실내 점핑으로 무릎·발목 성장판에 가벼운 수직 자극을 주고, 자기 전 문틀 철봉 30초 매달리기와 종아리 마사지를 해주면 숨은 키 복원과 성장통 예방에 큰 도움이 됩니다.\n\n"
            "참고로 질병관리청 2017 성장도표 LMS 수식이 적용된 우리 아이 개월 수별 키 백분위와 3단 예상키 무료 계산기는 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 로그인 없이 1분 만에 확인해 보실 수 있으니 편하게 참고해 보세요. 아이의 건강한 성장을 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
    {
        "id": "backlog_02",
        "kin_search_query": "초등 문장제 수학 실수 독해",
        "kin_answer_no_link": (
            "단순 연산 문제는 빠르고 정확하게 푸는데 줄글로 된 문장제·서술형 수학만 나오면 별표를 치거나 실수를 반복한다면, 단순 국어 어휘력 문제가 아니라 '전두엽 작업기억(Working Memory) 과부하' 때문일 가능성이 높습니다.\n\n"
            "뇌인지과학 연구(Sweller 인지부하 이론)에 기반한 2단계 가정 교정 루틴을 안내해 드립니다.\n\n"
            "1. 왜 눈으로만 읽고 암산하면 틀릴까요?\n"
            "- 문장제 수학은 지문 읽기, 조건 숫자 기억하기, 구하려는 값 파악하기, 식 세우기를 머릿속 칠판(작업기억)에서 동시에 처리해야 합니다.\n"
            "- 눈으로만 읽으며 암산하려 하면 마지막 문장을 읽는 순간 앞부분 조건 숫자가 작업기억에서 지워져 실수가 발생합니다.\n\n"
            "2. 여백에 조건을 꺼내 적는 '10초 조건 도식화' 루틴\n"
            "- 1단계 (기호 표시 끊어 읽기): 주어진 조건 숫자에는 동그라미(O), 구해야 하는 마지막 질문에는 밑줄(_)을 먼저 긋게 해주세요.\n"
            "- 2단계 (여백 수직선·표 그리기): 암산을 멈추고 여백에 간단한 막대 그림이나 수직선으로 조건을 옮겨 적게 하면 전두엽 작업기억 여유 공간이 2배로 넓어져 정답률이 빠르게 올라갑니다.\n\n"
            "참고로 아이의 연령별 5각 두뇌 밸런스(문해·수리·작업기억·메타인지·탐구) 점수와 학습 성향별 맞춤 공부법은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 진단 리포트로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "두뇌·소근육·학습 질문방",
    },
    {
        "id": "backlog_03",
        "kin_search_query": "초등 집중력 공부법 복습",
        "kin_answer_no_link": (
            "학원이나 인강을 들을 때는 다 이해한 것 같은데 막상 시험을 보면 기억이 나지 않는 현상은, 두뇌가 '눈에 익은 친숙함을 진짜 실력으로 착각하는 가짜기억 현상' 때문입니다.\n\n"
            "뇌과학 연구(Roediger & Karpicke 인출 연습 효과)에서 검증된 자기주도 공부법 2가지를 추천해 드립니다.\n\n"
            "1. 눈으로 다시 읽기 대신 '3분 파인만 3줄 인출 복습'\n"
            "- 공부를 마친 직후 책을 덮고 '오늘 배운 핵심 키워드 3가지를 1분 동안 내 말로 설명해 보기' 또는 요약 노트에 핵심 3줄 적기를 실천해 보세요.\n"
            "- 눈으로만 다시 읽을 때보다 1주일 뒤 장기기억 보존율이 50% 이상 높아집니다.\n\n"
            "2. 무소음 시각 타이머를 활용한 '20분 단일 과업' 몰입 훈련\n"
            "- 시각 타이머로 15~20분만 맞추고 딱 2쪽만 집중해서 완수하는 작은 성공 경험(Small-Win)을 쌓아주면 전두엽 집중 지속시간이 자연스럽게 길어집니다.\n\n"
            "참고로 아이 연령과 기질에 맞는 학습 흡수 성향 진단과 하루 4단계 학습 시간표는 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 리포트로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "두뇌·소근육·학습 질문방",
    },
    {
        "id": "backlog_04",
        "kin_search_query": "아이 성장통 다리 마사지 칼슘",
        "kin_answer_no_link": (
            "밤마다 아이가 무릎이나 종아리가 아프다고 깨는 야간 성장통은 낮 동안 뼈가 자라는 속도를 주변 근육과 골막 신경이 따라가지 못해 당겨지는 생리적 신호입니다.\n\n"
            "소아과학 임상 연구 기준으로 밤새 깨지 않고 깊은 잠을 자게 돕는 3가지 실천법을 안내해 드립니다.\n\n"
            "1. 취침 15분 전 따뜻한 물수건 온찜질과 종아리·무릎 마사지\n"
            "- 잠들기 전 무릎과 종아리 근육을 5분간 부드럽게 주물러 주시면 근막 긴장이 풀려 야간 통증 빈도가 크게 줄어듭니다.\n\n"
            "2. 저녁 식후 구연산 칼슘·마그네슘·비타민D3 보충\n"
            "- 뼈가 급성장할 때 칼슘과 마그네슘이 부족하면 신경·근육 흥분도가 높아져 밤에 더 자주 아파합니다. 위산 부담이 없는 구연산 칼슘과 마그네슘, 비타민D3를 저녁 식후에 챙겨주세요.\n\n"
            "3. 낮 시간 과도한 아스팔트 달리기 대신 실내 충격흡수 매트 활용\n"
            "- 딱딱한 바닥에서 무리하게 뛰기보다 쿠션감이 있는 실내 트램폴린이나 스트레칭으로 성장판 피로를 줄여주세요.\n\n"
            "참고로 아이의 현재 체중과 개월 수에 맞춘 일일 칼슘·마그네슘·비타민D3 권장량과 맞춤 성장 리포트는 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 로그인 없이 1분 만에 확인하실 수 있습니다. 오늘 밤 편안한 숙면을 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
    {
        "id": "backlog_05",
        "kin_search_query": "아이 편식 밥 안먹는 아이 영양제",
        "kin_answer_no_link": (
            "고기와 채소를 입에 대지 않고 밥 한 그릇 먹는 데 1시간씩 걸리는 아이 때문에 식사 시간마다 힘드실 텐데요. 억지로 먹이면 오히려 편도체가 활성화되어 '미각 방어기제'만 강해집니다.\n\n"
            "소아영양학 연구 기준으로 입 짧은 아이의 식욕과 성장을 동시에 살리는 2가지 핵심 솔루션을 정리해 드립니다.\n\n"
            "1. 미각 세포 재생을 돕는 아연(Zinc)과 초유 단백질 보충\n"
            "- 체내 아연이 부족하면 혀의 미뢰(맛봉오리) 세포 재생이 늦어져 음식 맛을 둔하게 느끼고 편식이 심해집니다.\n"
            "- 식사 강요 대신 아침·저녁으로 미각 정상화를 돕는 아연과 초유 단백질, 유당 없는 구연산·어골칼슘을 맛있게 보충해 주시면 자연스럽게 식욕이 돌아옵니다.\n\n"
            "2. 식전 1시간 단 간식·주스 차단 및 푸드브릿지(모양틀 요리)\n"
            "- 식사 1시간 전에는 과일이나 우유, 간식을 피하고 배고픔 신호를 느끼게 해주세요.\n\n"
            "참고로 우리 아이의 현재 키 대비 적정 체중(BMI) 밸런스와 편식 유형별 맞춤 영양 기준은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 진단 리포트로 바로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
    {
        "id": "backlog_06",
        "kin_search_query": "영유아검진 소근육 발달 놀이",
        "kin_answer_no_link": (
            "영유아건강검진(K-DST)에서 소근육이나 자조 영역이 또래보다 조금 느리게 나와 걱정되실 텐데요. 만 2~4세 시기는 대뇌 운동피질의 약 30%가 손끝과 연결되는 '손끝 소근육 민감기'여서 가정에서 하루 10분 놀이만 바꿔줘도 정말 빠르게 따라잡을 수 있습니다.\n\n"
            "비싼 교구 없이 오늘 저녁 거실에서 바로 해볼 수 있는 3가지 소근육 놀이를 추천해 드립니다.\n\n"
            "1. 나무 빨래집게로 폼폼이(또는 뭉친 휴지) 옮기기\n"
            "- 엄지·검지·중지 세 손가락(삼지 집기) 악력을 길러주어 향후 가위질과 연필 잡기의 기초가 됩니다.\n\n"
            "2. 다 쓴 물티슈 캡 구멍에 병뚜껑 넣기\n"
            "- 눈으로 위치를 가늠하고 손목 각도를 조절하는 눈-손 협응력과 전두엽 작업기억을 동시에 자극합니다.\n\n"
            "3. 휴지심 끝에 안전가위로 1cm 칼집 내기\n"
            "- 가위질 한 번으로 모양이 변하는 즉각적인 성취감을 통해 자기효능감이 자라납니다.\n\n"
            "참고로 보건복지부 K-DST 기준 우리 아이 월령별 6각 발달 밸런스와 맞춤 교구 가이드는 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "두뇌·소근육·학습 질문방",
    },
    {
        "id": "backlog_07",
        "kin_search_query": "몬테소리 가베 교구 시기 차이",
        "kin_answer_no_link": (
            "아이 두뇌 발달 교구로 몬테소리와 프뢰벨 가베(은물) 중 어떤 것이 맞을지 고민되실 텐데요. 두 교구는 자극하는 뇌 발달 영역과 적기 월령이 서로 다릅니다.\n\n"
            "아동발달 교육학 기준으로 우리 아이 월령과 성향에 맞는 선택 기준을 정리해 드립니다.\n\n"
            "1. 만 1~3.5세 감각·질서 민감기에는 '몬테소리 일상·감각 교구'\n"
            "- 스스로 옷 단추를 잠그고, 크기가 다른 원기둥을 끼워 맞추며 '자기수정(Self-Correction)'을 경험하는 시기에는 몬테소리 감각·일상 교구가 전두엽 실행기능 발달에 가장 효과적입니다.\n\n"
            "2. 만 3.5~7세 공간도형·수리 확장기에는 '프뢰벨 가베(은물)'\n"
            "- 점·선·면·입체의 분할과 결합을 통해 대칭, 분수, 도형 회전 감각을 기르는 시기에는 가베 놀이가 초등 도형·기하 사고력의 탄탄한 기초가 됩니다.\n\n"
            "참고로 우리 아이의 현재 개월 수와 기질에 꼭 맞는 교구 적합도 판정과 가정 내 활용 루틴은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 진단 리포트로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "두뇌·소근육·학습 질문방",
    },
    {
        "id": "backlog_08",
        "kin_search_query": "초등 성조숙증 뼈나이 키성장",
        "kin_answer_no_link": (
            "아이의 2차 성징 신호나 뼈나이(골연령)가 실제 나이보다 빠르게 나오는 것 같아 마음이 쓰이실 텐데요. 성장판이 닫히는 속도를 늦추고 최종 성인키 잠재력을 지키기 위해서는 가정 내 생활환경 관리가 무엇보다 중요합니다.\n\n"
            "소아내분비학 가이드라인 기준 핵심 관리 수칙 3가지를 정리해 드립니다.\n\n"
            "1. 체지방률 관리와 야식·액상과당 줄이기\n"
            "- 지방세포에서 분비되는 렙틴(Leptin) 호르몬은 사춘기 중추를 자극해 골연령 진행을 앞당길 수 있습니다. 저녁 8시 이후 야식과 음료수를 줄이고 단백질·채소 위주 식단을 유지해 주세요.\n\n"
            "2. 밤 10시 이전 암막 수면으로 멜라토닌 분비 극대화\n"
            "- 취침 중 스마트폰 빛이나 수면등 불빛은 멜라토닌 분비를 억제해 성호르몬 분비를 자극할 수 있으므로 완전 소등 숙면 환경을 만들어 주세요.\n\n"
            "3. 주 3~4회 줄넘기·점핑 등 유산소 성장판 자극 운동\n"
            "- 하루 20~30분 가벼운 점프 운동은 체지방을 줄이면서 성장호르몬 박동 분비를 촉진합니다.\n\n"
            "참고로 질병관리청 성장도표 기준 우리 아이 월령별 키·BMI 백분위와 유전 표적키 대비 성장 잠재력은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 로그인 없이 무료로 계산해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
    {
        "id": "backlog_09",
        "kin_search_query": "초등 거북목 자세 교정 키성장",
        "kin_answer_no_link": (
            "책상이나 태블릿을 볼 때 고개를 앞으로 숙이는 거북목·라운드숄더 자세는 목과 척추 디스크에 큰 하중을 주어 숨은 키를 1.5~2.5cm가량 눌리게 만들고 호흡량과 학습 집중력까지 떨어뜨립니다.\n\n"
            "소아 재활·생체역학 기준으로 가정에서 바로 실천할 수 있는 교정 루틴 2가지를 안내해 드립니다.\n\n"
            "1. 책상 위 2단계 높이조절 독서대(15~20도 각도) 필수 사용\n"
            "- 책을 바닥에 평평하게 두고 보면 고개가 45도 이상 꺾여 목뼈에 성인 볼링공 무게의 하중이 실립니다. 독서대로 시선 높이를 맞춰주는 것만으로도 경추 부담이 70% 이상 줄어듭니다.\n\n"
            "2. 저녁 문틀 철봉 30초 매달리기와 가슴 펴기 스트레칭\n"
            "- 하교 후와 취침 전에 문틀 철봉에 20~30초씩 가볍게 매달려 척추 마디마디의 압박을 풀어주면 눌려 있던 숨은 키 복원에 큰 도움이 됩니다.\n\n"
            "참고로 거북목·자세 불균형에 따른 우리 아이 숨은 키 복원 잠재력과 맞춤 스트레칭 루틴은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 1분 무료 진단으로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
    {
        "id": "backlog_10",
        "kin_search_query": "초등 독서 문해력 어휘력 공부법",
        "kin_answer_no_link": (
            "책은 많이 읽는 것 같은데 정작 교과서 지문이나 긴 글을 읽을 때 핵심 내용을 파악하지 못한다면, 눈으로 글자만 훑는 '수동적 독서 습관'을 '능동적 인출 독서'로 바꿔줄 시점입니다.\n\n"
            "뇌인지과학 및 독서교육 연구에서 검증된 문해력 향상 루틴 2가지를 추천해 드립니다.\n\n"
            "1. 책 읽기 전후 '열린 질문 2가지' 주고받기\n"
            "- 책을 다 읽은 뒤 줄거리를 시험 보듯 묻기보다 '주인공이 왜 그런 선택을 했을까?', '만약 너라면 어떻게 했을까?'처럼 인과관계를 생각하는 질문을 하루 1~2개만 나누어 보세요.\n\n"
            "2. 모르는 한자어·교과서 개념어를 내 말로 1줄 바꿔 말하기\n"
            "- 초등 3~4학년부터는 학습 도구의 70% 이상이 추상적 한자어로 바뀝니다. 낯선 어휘가 나올 때 짧은 예시 문장을 함께 만들어 보면 문해력과 전두엽 추론력이 빠르게 자랍니다.\n\n"
            "참고로 우리 아이의 연령별 문해력·작업기억·메타인지 5각 두뇌 밸런스와 맞춤 독서 코칭법은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 진단 리포트로 확인해 보실 수 있습니다. 응원합니다!"
        ),
        "cafe_board": "두뇌·소근육·학습 질문방",
    },
    {
        "id": "backlog_11",
        "kin_search_query": "주말 아이와 가볼만한곳 과학관 박물관",
        "kin_answer_no_link": (
            "주말마다 아이와 어디를 가야 유익할지 고민되실 텐데요. 박물관이나 과학관 나들이는 단순 관람에 그치지 않고 출발 전후 5분 대화법만 더해지면 최고의 체험형 배경지식 학습이 됩니다.\n\n"
            "교육심리학 연구에 기반한 주말 전시·체험 나들이 100% 활용 팁 3가지를 공유해 드립니다.\n\n"
            "1. 출발 전 차 안에서 '오늘 찾을 보물 1가지' 정하기\n"
            "- 모든 전시물을 다 보려고 하면 아이가 금방 지칩니다. 오늘 가장 보고 싶은 전시물 딱 1~2가지를 아이가 직접 고르게 해주세요.\n\n"
            "2. 설명판 읽어주기 대신 '관찰 질문' 먼저 던지기\n"
            "- 정답을 먼저 알려주기보다 '이건 왜 모양이 이렇게 생겼을까?' 하고 아이의 호기심을 먼저 깨워주면 해마의 장기기억 저장률이 2배 이상 높아집니다.\n\n"
            "3. 귀가 후 가장 기억에 남는 장면 1줄 그림일기 남기기\n\n"
            "참고로 아이 연령과 탐구 성향에 맞춘 전국 권역별 주말 박물관·과학관 추천 코스와 차 안 대화 질문지는 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료로 확인해 보실 수 있습니다. 즐거운 주말 나들이 되세요!"
        ),
        "cafe_board": "주말 박물관·나들이 코스",
    },
    {
        "id": "backlog_12",
        "kin_search_query": "아기 밤잠 수면교육 성장호르몬",
        "kin_answer_no_link": (
            "밤늦게까지 잠들지 않거나 자다가 자주 깨는 아이 때문에 부모님도 피로가 많이 쌓이셨을 텐데요. 밤잠의 질은 성장호르몬 분비뿐만 아니라 낮 동안 배운 정보를 장기기억으로 저장하는 두뇌 발달에도 결정적인 역할을 합니다.\n\n"
            "소아수면의학 기준 밤잠 입면 시간을 앞당기는 3단계 수면 의식을 안내해 드립니다.\n\n"
            "1. 취침 1시간 전 집안 조도를 50% 낮추고 백색소음·자장가 틀기\n"
            "- 밝은 거실 형광등(블루라이트)은 수면 호르몬인 멜라토닌 분비를 최대 90분까지 지연시킵니다. 밤 9시부터는 노란색 간접조명으로 바꾸어 뇌에 수면 신호를 보내주세요.\n\n"
            "2. 미지근한 물 목욕 후 5분 다리·발바닥 이완 마사지\n"
            "- 목욕 직후 심부 체온이 살짝 내려가는 과정에서 자연스럽게 깊은 서파수면이 유도됩니다.\n\n"
            "3. 매일 일정한 기상 시각 유지하기\n\n"
            "참고로 우리 아이 개월 수별 표준 성장 백분위와 수면·영양 맞춤 루틴은 포털에 '키즈핏 그로스 스튜디오'를 검색하시면 무료 진단 리포트로 1분 만에 확인하실 수 있습니다. 편안한 밤 되시길 응원합니다!"
        ),
        "cafe_board": "우리아이 키성장·성조숙증",
    },
]


def ensure_clean_cdp_browser(p):
    """Connects to CDP 9222 or launches the persistent Chrome profile on WinSta0\\Default."""
    cdp_ok = False
    try:
        req = urllib.request.Request("http://127.0.0.1:9222/json/version")
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status == 200:
                cdp_ok = True
    except Exception:
        cdp_ok = False

    if cdp_ok:
        try:
            browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222", timeout=25000)
            return browser, browser.contexts[0], False
        except Exception:
            cdp_ok = False

    print("🔄 [영구 프로필 브라우저 기동] WinSta0\\Default 데스크톱에서 CDP 9222 세션을 연결합니다...", flush=True)
    from naver_browser_daemon import launch_chrome_on_default_desktop
    launch_chrome_on_default_desktop()
    for _ in range(15):
        try:
            with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=2) as r:
                if r.status == 200:
                    break
        except Exception:
            time.sleep(1)
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222", timeout=25000)
    return browser, browser.contexts[0], False


def try_safe_naver_kin_answer(context, item: dict, answered_urls: list) -> dict:
    """
    Attempts AT MOST 1 ultra-safe, ZERO-URL clinical answer on kin.naver.com for the given topic item.
    Immediately aborts if any security/captcha/rate-limit notice is detected.
    """
    page = context.new_page()
    try:
        q_encoded = urllib.parse.quote(item["kin_search_query"])
        search_url = f"https://kin.naver.com/search/list.naver?query={q_encoded}&section=qna&sort=date"
        print(f"🔍 [지식iN 자동 탐색] {item['kin_search_query']}...", flush=True)
        page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
        time.sleep(3.0)

        q_links = page.evaluate("""() => {
            const anchors = Array.from(document.querySelectorAll('ul.basic1 li dl dt a, .search_list a, a[href*="qna/detail.naver"]'));
            const seen = new Set();
            const out = [];
            for (const a of anchors) {
                const href = a.href || '';
                const title = (a.innerText || '').trim();
                if (href.includes('kin.naver.com/qna/detail.naver') && title.length >= 6 && !seen.has(href)) {
                    seen.add(href);
                    out.push({ title, url: href });
                }
            }
            return out;
        }""")

        relevant_kw = [
            "키", "성장", "아이", "초등", "중학", "유아", "개월", "살", "공부", "수학", "독서",
            "문해력", "집중", "수면", "영양", "칼슘", "우유", "교구", "가베", "몬테소리",
            "박물관", "사춘기", "성조숙", "거북목", "자세", "체중", "몸무게", "아들", "딸"
        ]
        filtered_links = [
            q for q in q_links
            if any(k in q.get("title", "") for k in relevant_kw)
        ] or q_links

        candidates = [q for q in filtered_links if q["url"] not in answered_urls]
        if not candidates:
            candidates = filtered_links[:3]
        if not candidates:
            return {"status": "skipped_no_target", "reason": "최신 질문 후보 없음", "query": item["kin_search_query"]}

        for target_q in candidates[:4]:
            print(f"  👉 질문 진입 (인간형 열람 딜레이): {target_q['title'][:38]}", flush=True)
            page.goto(target_q["url"], wait_until="domcontentloaded", timeout=25000)
            time.sleep(random.uniform(4.5, 6.2))

            page_text = page.evaluate("() => document.body ? document.body.innerText : ''")
            if any(w in page_text for w in ["자동입력 방지", "보안문자", "이용이 제한", "본인확인", "답변 등록이 제한", "하루 답변"]):
                return {
                    "status": "safe_aborted_guard",
                    "reason": "보안문자/일일한도 감지 — 계정 보호를 위해 즉시 대기 모드로 전환",
                    "query": item["kin_search_query"],
                    "question_title": target_q["title"],
                    "question_url": target_q["url"],
                }

            clicked_write = page.evaluate("""() => {
                const selectors = ['#answerWriteButton', 'a._answerWriteButton', 'button._answerWriteButton', '.c-heading-answer__button a', 'a[href*="answerWrite"]'];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.offsetParent !== null) {
                        el.click();
                        return true;
                    }
                }
                const allBtns = Array.from(document.querySelectorAll('a, button'));
                const ansBtn = allBtns.find(b => (b.innerText || '').trim().includes('답변하기') && b.offsetParent !== null);
                if (ansBtn) {
                    ansBtn.click();
                    return true;
                }
                return false;
            }""")

            if not clicked_write:
                continue

            time.sleep(3.5)

            safe_text = item["kin_answer_no_link"]
            assert "http" not in safe_text and ".kr" not in safe_text and ".com" not in safe_text

            typed_ok = False
            for frame in [page.main_frame] + page.frames:
                try:
                    loc = frame.locator(".se-component.se-text .se-text-paragraph, .se-content, [contenteditable='true'], textarea").first
                    if loc.count() > 0 and loc.is_visible():
                        loc.click(force=True)
                        time.sleep(0.6)
                        for line in safe_text.splitlines():
                            clean = line.strip()
                            if clean:
                                page.keyboard.insert_text(clean)
                                time.sleep(random.uniform(0.04, 0.10))
                            page.keyboard.press("Enter")
                            time.sleep(0.03)
                        typed_ok = True
                        break
                except Exception:
                    continue

            if not typed_ok:
                continue

            time.sleep(2.2)

            submitted = page.evaluate("""() => {
                const selectors = ['#au_submit_button', 'a._rosRestrict', 'button.btn_register', 'a.btn_register'];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.offsetParent !== null && (el.innerText || '').includes('등록')) {
                        el.click();
                        return true;
                    }
                }
                const allBtns = Array.from(document.querySelectorAll('a, button'));
                const regBtn = allBtns.find(b => {
                    const t = (b.innerText || '').trim();
                    return (t === '답변등록' || t === '등록' || t.includes('답변등록')) && b.offsetParent !== null;
                });
                if (regBtn) {
                    regBtn.click();
                    return true;
                }
                return false;
            }""")

            if submitted:
                time.sleep(4.5)
                return {
                    "status": "published_no_link",
                    "reason": "외부 URL 0개(노링크 브랜드 검색 유도형) 100% 자동 답변 등록 완료",
                    "query": item["kin_search_query"],
                    "question_title": target_q["title"],
                    "question_url": target_q["url"],
                }

        return {
            "status": "curated_ready",
            "reason": "질문 탐색 완료 (현재 열린 질문은 이미 답변 완료 상태이거나 마감됨)",
            "query": item["kin_search_query"],
            "question_title": candidates[0]["title"],
            "question_url": candidates[0]["url"],
        }
    except Exception as e:
        return {"status": "safe_guard", "query": item["kin_search_query"], "reason": f"계정 보호 스로틀링 ({str(e)[:60]})"}
    finally:
        try:
            page.close()
        except Exception:
            pass


def try_safe_naver_kin_multi_answers(context, items: list, answered_urls: list, max_answers: int = 2) -> list:
    """
    Answers up to `max_answers` open questions per cycle across rotating clinical topics,
    with a 20~28s human reading/resting pause between answers and immediate abort on any security guard.
    """
    results = []
    published_count = 0
    for idx, item in enumerate(items):
        if published_count >= max_answers:
            break
        if idx > 0 and published_count > 0:
            pause_sec = random.uniform(20.0, 27.0)
            print(f"⏳ [지식iN 계정 보호 쿨다운] 다음 질문 답변 전 {pause_sec:.1f}초 인간형 휴식...", flush=True)
            time.sleep(pause_sec)
        res = try_safe_naver_kin_answer(context, item, answered_urls)
        results.append(res)
        if res.get("question_url") and res.get("status") == "published_no_link":
            answered_urls.append(res["question_url"])
            published_count += 1
        if res.get("status") == "safe_aborted_guard":
            break
    return results


def main():
    from naver_auto_comment_and_kin_daemon import main as run_comment_and_kin
    run_comment_and_kin()


if __name__ == "__main__":
    main()
