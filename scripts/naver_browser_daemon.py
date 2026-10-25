# -*- coding: utf-8 -*-
"""
Naver Browser Daemon (scripts/naver_browser_daemon.py)
Spawns Chrome directly on the interactive user desktop (WinSta0\\Default) with remote debugging port 9222,
pre-checks '로그인 상태 유지' (#keep / nvlong=on) on nid.naver.com, backs up NID_AUT + NID_SES cookies,
and triggers immediate catch-up publishing when a fresh login is detected.
"""

import ctypes
from ctypes import wintypes
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"d:\키즈핏")
PROFILE_DIR = ROOT / ".naver-browser-profile"
PROFILE_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_COOKIES_FILE = PROFILE_DIR / "naver_cookies_backup.json"


def load_env_secret(key: str) -> str:
    val = os.environ.get(key, "").strip()
    if val:
        return val
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            if k.strip() == key:
                return v.strip().strip('"').strip("'")
    return ""


class STARTUPINFOW(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD),
        ("lpReserved", wintypes.LPWSTR),
        ("lpDesktop", wintypes.LPWSTR),
        ("lpTitle", wintypes.LPWSTR),
        ("dwX", wintypes.DWORD),
        ("dwY", wintypes.DWORD),
        ("dwXSize", wintypes.DWORD),
        ("dwYSize", wintypes.DWORD),
        ("dwXCountChars", wintypes.DWORD),
        ("dwYCountChars", wintypes.DWORD),
        ("dwFillAttribute", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("wShowWindow", wintypes.WORD),
        ("cbReserved2", wintypes.WORD),
        ("lpReserved2", ctypes.POINTER(wintypes.BYTE)),
        ("hStdInput", wintypes.HANDLE),
        ("hStdOutput", wintypes.HANDLE),
        ("hStdError", wintypes.HANDLE),
    ]


class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("hProcess", wintypes.HANDLE),
        ("hThread", wintypes.HANDLE),
        ("dwProcessId", wintypes.DWORD),
        ("dwThreadId", wintypes.DWORD),
    ]


def launch_chrome_on_default_desktop():
    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    target_url = "https://nid.naver.com/nidlogin.login?mode=form&url=https%3A%2F%2Fwww.naver.com"
    cmd = (
        f'"{chrome_exe}" '
        f'--user-data-dir="{PROFILE_DIR}" '
        f'--remote-debugging-port=9222 '
        f'--start-maximized '
        f'--no-first-run '
        f'--no-default-browser-check '
        f'--disable-blink-features=AutomationControlled '
        f'"{target_url}"'
    )

    si = STARTUPINFOW()
    si.cb = ctypes.sizeof(STARTUPINFOW)
    si.lpDesktop = "WinSta0\\Default"
    si.dwFlags = 1  # STARTF_USESHOWWINDOW
    si.wShowWindow = 3  # SW_SHOWMAXIMIZED

    pi = PROCESS_INFORMATION()
    cmd_buf = ctypes.create_unicode_buffer(cmd)

    ok = ctypes.windll.kernel32.CreateProcessW(
        None,
        cmd_buf,
        None,
        None,
        False,
        0,
        None,
        None,
        ctypes.byref(si),
        ctypes.byref(pi),
    )
    if not ok:
        err = ctypes.windll.kernel32.GetLastError()
        raise RuntimeError(f"CreateProcessW failed with error {err}")

    print(f"✅ Launched Chrome on WinSta0\\Default (PID={pi.dwProcessId})", flush=True)
    return pi.dwProcessId


def main():
    pid = launch_chrome_on_default_desktop()
    for _ in range(15):
        try:
            with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                print(f"✅ CDP Port 9222 Ready: {data.get('Browser')}", flush=True)
                break
        except Exception:
            time.sleep(1)

    was_logged_in = False
    while True:
        try:
            with sync_playwright() as p:
                browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222", timeout=10000)
                ctx = browser.contexts[0]
                if not ctx.pages:
                    launch_chrome_on_default_desktop()
                    time.sleep(3)
                    continue

                # Pre-fill or auto-login using credentials from gitignored .env
                naver_id = load_env_secret("NAVER_LOGIN_ID")
                naver_pw = load_env_secret("NAVER_LOGIN_PW")
                for pg in ctx.pages:
                    if "nidlogin.login" in pg.url:
                        try:
                            pg.evaluate("""(uid) => {
                                const keep = document.getElementById('keep');
                                if (keep && keep.getAttribute('aria-checked') !== 'true' && !keep.checked) {
                                    keep.click();
                                }
                                const nvlong = document.getElementById('nvlong');
                                if (nvlong) nvlong.value = 'on';
                                const idInput = document.getElementById('id');
                                if (idInput && !idInput.value && uid) {
                                    idInput.value = uid;
                                    idInput.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }""", naver_id)
                            if naver_id and naver_pw:
                                id_box = pg.locator("#id")
                                pw_box = pg.locator("#pw")
                                if id_box.count() > 0 and pw_box.count() > 0:
                                    id_box.click()
                                    pg.keyboard.press("Control+A")
                                    pg.keyboard.type(naver_id, delay=50)
                                    pw_box.click()
                                    pg.keyboard.press("Control+A")
                                    pg.keyboard.type(naver_pw, delay=50)
                                    pg.keyboard.press("Enter")
                                    time.sleep(3)
                        except Exception:
                            pass

                cks = ctx.cookies("https://www.naver.com")
                names = {c["name"] for c in cks}
                if {"NID_AUT", "NID_SES"} <= names:
                    all_ck = [ck for ck in ctx.cookies() if "naver.com" in ck.get("domain", "")]
                    exp_365 = int(time.time()) + 365 * 86400
                    for ck in all_ck:
                        if ck.get("expires", -1) <= 0:
                            ck["expires"] = exp_365
                    ctx.add_cookies(all_ck)
                    BACKUP_COOKIES_FILE.write_text(json.dumps(all_ck, ensure_ascii=False, indent=2), encoding="utf-8")
                    if not was_logged_in:
                        was_logged_in = True
                        print("🎉 [Naver Login Detected] NID_AUT + NID_SES saved! Triggering immediate Blog & Cafe publish...", flush=True)
                        subprocess.Popen(
                            [sys.executable, str(ROOT / "scripts" / "publish_3x_daily_blog_and_cafe.py")],
                            cwd=str(ROOT),
                        )
                else:
                    was_logged_in = False
        except Exception as e:
            print(f"⚠️ Daemon loop warn: {e}", flush=True)
        time.sleep(6)


if __name__ == "__main__":
    main()
