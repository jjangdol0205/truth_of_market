# -*- coding: utf-8 -*-
import json
import re
import subprocess
import sys
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

# 1. Inspect Naver Blog: https://m.blog.naver.com/0_bean_/224449376030
try:
    req = urllib.request.Request(
        "https://m.blog.naver.com/0_bean_/224449376030",
        headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"},
    )
    html = urllib.request.urlopen(req, timeout=12).read().decode("utf-8", errors="ignore")
    title_m = re.search(r'<meta property="og:title" content="([^"]+)"', html)
    desc_m = re.search(r'<meta property="og:description" content="([^"]+)"', html)
    print("=== BLOG 0_bean_ ===")
    print("Title:", title_m.group(1) if title_m else "N/A")
    print("Desc:", desc_m.group(1) if desc_m else "N/A")
    spans = re.findall(r'<span[^>]*class="se-fs-[^"]*"[^>]*>(.*?)</span>', html, flags=re.DOTALL)
    lines = []
    for s in spans:
        t = re.sub(r"<[^>]+>", "", s).strip()
        if t and len(t) > 2:
            lines.append(t)
    print("Sample lines (first 30):")
    for ln in lines[:30]:
        print("  |", ln)
except Exception as e:
    print("Blog fetch error:", e)

# 2. Inspect YouTube Shorts: https://youtube.com/shorts/Mq8qoO-sYNc
try:
    req2 = urllib.request.Request(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=Mq8qoO-sYNc&format=json",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    yt = json.loads(urllib.request.urlopen(req2, timeout=12).read().decode("utf-8"))
    print("\n=== YOUTUBE SHORTS Mq8qoO-sYNc ===")
    print("Title:", yt.get("title"))
    print("Author:", yt.get("author_name"))
except Exception as e:
    print("YT oembed error:", e)

# Also fetch page meta description / title from youtube watch page
try:
    req3 = urllib.request.Request(
        "https://www.youtube.com/watch?v=Mq8qoO-sYNc",
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "ko-KR,ko;q=0.9"},
    )
    yhtml = urllib.request.urlopen(req3, timeout=12).read().decode("utf-8", errors="ignore")
    ydesc = re.search(r'"shortDescription":"((?:\\.|[^"\\])*)"', yhtml)
    if ydesc:
        print("YT ShortDescription:", bytes(ydesc.group(1), "utf-8").decode("unicode_escape", errors="ignore")[:500])
except Exception as e:
    print("YT watch error:", e)

# 3. Ensure edge-tts is installed for ultra-natural Korean human neural voice
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "edge-tts"], check=False)
print("\n=== edge-tts ready ===")
