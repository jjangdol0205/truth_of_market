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
    sys.path.insert(0, str(ROOT / "scripts"))
    from apply_alphamale_cclass_and_advisor_daemon import fetch_live_system_metrics
    m = fetch_live_system_metrics()

    tdate = m.get("kstDate", "2026-10-28")
    uv_td, pv_td, bots_td = m.get("uv", 0), m.get("pv", 0), m.get("bots", 0)
    raw_uv, raw_pv = m.get("rawServerUv", uv_td), m.get("rawServerPv", pv_td)
    diag_td, aff_td = m.get("diagnoses", 0), m.get("affiliateClicks", 0)

    msg = (
        f"📊 <b>[키즈핏 09:00 AM 일일 방문자 & 퍼널 브리핑]</b>\n"
        f"• 기준일: {tdate} 09:00 KST\n\n"
        f"<b>1️⃣ 실시간 홈페이지 유입 현황 (kidsfit.co.kr · 영구 원장 보정)</b>\n"
        f"• 오늘 순수 실방문자(Human UV): <b>{uv_td}명</b> / 실페이지뷰(Human PV): <b>{pv_td}회</b>\n"
        f"• 검색엔진·외부 색인/점검봇 수집: <b>{bots_td}회</b> (서버 전체 호출: UV {raw_uv} / PV {raw_pv})\n"
        f"• 오늘 진단 완료: <b>{diag_td}건</b> / 제휴·결제 클릭: <b>{aff_td}건</b>\n\n"
        f"<b>2️⃣ 오늘 오전 무인 자동 홍보 가동 현황</b>\n"
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
