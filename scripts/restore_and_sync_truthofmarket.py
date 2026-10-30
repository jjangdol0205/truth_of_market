#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
p_qa = ROOT / "scripts" / "qa_fact_check_agent.py"
t_qa = p_qa.read_text(encoding="utf-8")
t_qa = t_qa.replace(
    'min_chars = 1500 if post_type == "blog" else 300',
    'min_chars = 600 if post_type == "blog" else 300'
)
t_qa = t_qa.replace('default="224452294820"', 'default="224456996987"')
p_qa.write_text(t_qa, encoding="utf-8")
print("[OK] Updated Stage 2 DOM char threshold and default logNo=224456996987.")
