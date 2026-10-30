# -*- coding: utf-8 -*-
import re
import sys
import urllib.request
import json

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
}

print("=== 1. Inspecting Naver Blog: https://m.blog.naver.com/0_bean_/224449376030 ===")
try:
    req = urllib.request.Request("https://m.blog.naver.com/0_bean_/224449376030", headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        title_m = re.search(r'<meta property="og:title" content="([^"]+)"', html)
        desc_m = re.search(r'<meta property="og:description" content="([^"]+)"', html)
        print("OG Title:", title_m.group(1) if title_m else "N/A")
        print("OG Desc:", desc_m.group(1) if desc_m else "N/A")
        # Extract text paragraphs from se-main-container
        paras = re.findall(r'<span class="se-fs-[^"]*"[^>]*>(.*?)</span>', html, re.S)
        clean_paras = []
        for p in paras:
            t = re.sub(r"<[^>]+>", "", p).strip()
            if t and len(t) > 1:
                clean_paras.append(t)
        print("Sample paragraphs (first 25):")
        for line in clean_paras[:25]:
            print("  |", line)
except Exception as e:
    print("Blog fetch error:", e)

print("\n=== 2. Inspecting YouTube Shorts: https://www.youtube.com/shorts/Mq8qoO-sYNc ===")
try:
    oembed_url = "https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/Mq8qoO-sYNc&format=json"
    req2 = urllib.request.Request(oembed_url, headers=headers)
    with urllib.request.urlopen(req2, timeout=15) as resp2:
        data = json.loads(resp2.read().decode("utf-8", errors="ignore"))
        print("YouTube oEmbed:", json.dumps(data, ensure_ascii=False, indent=2))
except Exception as e:
    print("YouTube oEmbed error:", e)

print("\n=== 3. Checking installed TTS packages ===")
for pkg in ["edge_tts", "gtts", "pyttsx3", "openai", "elevenlabs"]:
    try:
        __import__(pkg)
        print(f"  [INSTALLED] {pkg}")
    except ImportError:
        print(f"  [missing] {pkg}")
