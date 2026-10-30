# -*- coding: utf-8 -*-
"""
scripts/send_daily_6am_insta_briefing.py
매일 오전 06:00 KST:
대표님 지침("https://www.instagram.com/kids_fit1 이것보다 더 괜찮으면 나한테 보내고 아니면 기존대로 해")에 따라,
@kids_fit1 계정에 검증된 기존 고화질 수채화 일러스트 웹툰 + 어쿠스틱 피아노 BGM 3D 책넘김 영상 +
원터치 순수 복붙 말풍선 3단계 시퀀스(`1순서 인스타용 5장` -> `2순서 쓰레드용 합본` -> `3순서 릴스·클립용 영상`)를
발송하는 `scripts/send_daily_6am_insta_threads.js --advance` 파이프라인으로 일원화합니다.
(12시간 이내 중복 발송 방지 가드가 내장되어 있어 브릿지 데몬과 중복 발송되지 않습니다.)
"""

import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"d:\사업아이템")


def main():
    script_path = ROOT / "scripts" / "send_daily_6am_insta_threads.js"
    res = subprocess.run(
        ["node", str(script_path), "--advance"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore",
    )
    if res.stdout:
        print(res.stdout.strip())
    if res.returncode != 0 and res.stderr:
        print(res.stderr.strip(), file=sys.stderr)
        sys.exit(res.returncode)


if __name__ == "__main__":
    main()
