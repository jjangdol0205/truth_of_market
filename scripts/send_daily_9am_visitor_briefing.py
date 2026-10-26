# -*- coding: utf-8 -*-
import json
import sys
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT / ".env"

def load_env():
    env = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

def main():
    env = load_env()
    token = env.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = env.get("TELEGRAM_CHAT_ID", "755033799")
    try:
        with urllib.request.urlopen("https://kidsfit.co.kr/api/stats", timeout=10) as r:
            st = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        st = {"error": str(e)}

    tot = st.get("total", {})
    td = st.get("today", {})
    tdate = st.get("todayDate", "2026-10-25")
    uv_td, pv_td, hm_td = td.get("uniqueVisitors", 0), td.get("pageviews", 0), td.get("humanViews", 0)
    uv_tot, pv_tot = tot.get("uniqueVisitors", 0), tot.get("pageviews", 0)
    diag_tot, aff_tot = tot.get("diagnosesTotal", 0), tot.get("affiliateClicksTotal", 0)

    msg = (
        f"📊 <b>[키즈핏 09:00 AM 일일 방문자 & 퍼널 브리핑]</b>\n"
        f"• 기준일: {tdate} 09:00 KST\n\n"
        f"<b>1️⃣ 실시간 홈페이지 유입 현황 (kidsfit.co.kr / kidsfit.co.kr)</b>\n"
        f"• 오늘 순방문자(UV): <b>{uv_td}명</b> / 페이지뷰(PV): <b>{pv_td}회</b> (실유입: {hm_td}회)\n"
        f"• 누적 순방문자(UV): <b>{uv_tot}명</b> / 누적 페이지뷰(PV): <b>{pv_tot}회</b>\n"
        f"• 누적 진단 완료: <b>{diag_tot}건</b> / 제휴·결제 클릭: <b>{aff_tot}건</b>\n\n"
        f"<b>2️⃣ 오늘 오전 홍보 가동 현황</b>\n"
        f"• 06:00 인스타·쓰레드(@kids_fit1) 웹툰·카드뉴스 패키지 발송 완료\n"
        f"• 06:00 네이버 블로그 & 카페 1차 발행 완료\n"
        f"• 06:30 탈네이버 6대 채널 시퀀스 아티클 발행 완료\n"
        f"• 07:10 육아블로그 공감·댓글 투어 & 지식iN 실시간 답변 완료\n"
        f"• 09:00 네이버 블로그 & 카페 2차 발행 가동"
    )

    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=json.dumps({"chat_id": chat_id, "text": msg, "parse_mode": "HTML"}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"✅ [09:00 AM Visitor Briefing] Sent to Telegram ({chat_id}): HTTP {resp.status}")

if __name__ == "__main__":
    main()
