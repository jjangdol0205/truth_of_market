import os
import json
import sys

# Reconfigure stdout to use utf-8 to prevent CP949 encoding errors on Windows
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVE_FILE = os.path.join(ROOT_DIR, 'news-archive.json')

limit = 30
if '--limit' in sys.argv:
    try:
        idx = sys.argv.index('--limit')
        limit = int(sys.argv[idx + 1])
    except (ValueError, IndexError):
        pass

if os.path.exists(ARCHIVE_FILE):
    with open(ARCHIVE_FILE, 'r', encoding='utf-8') as f:
        archive = json.load(f)
    
    unsummarized = [a for a in archive.values() if not a.get('aiAnalysis')]
    # Sort by date descending
    unsummarized.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    print(f"Total unsummarized: {len(unsummarized)}")
    print(f"Top {limit} most recent unsummarized articles:")
    
    for i, a in enumerate(unsummarized[:limit]):
        print(f"--- ARTICLE {i+1} ---")
        print(f"ID: {a.get('id')}")
        print(f"Title: {a.get('title')}")
        print(f"Lang: {a.get('lang')}")
        print(f"Source: {a.get('sourceName')}")
        print(f"Date: {a.get('date')}")
        desc = a.get('description') or ''
        desc = desc.replace('\xa0', ' ')
        print(f"Description: {desc}")
        print()
else:
    print("Archive file not found.")
