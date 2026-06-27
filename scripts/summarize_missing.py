import os
import json
import time
import sys
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, '.env'))

ARCHIVE_FILE = os.path.join(ROOT_DIR, 'news-archive.json')
CACHE_FILE = os.path.join(ROOT_DIR, 'ai-cache.json')
BUDGET_FILE = os.path.join(ROOT_DIR, 'api-budget.json')

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("[Error] GEMINI_API_KEY is missing in .env file.")
    sys.exit(1)

genai.configure(api_key=api_key)

# Parse command line arguments
limit = None
if '--limit' in sys.argv:
    try:
        limit_idx = sys.argv.index('--limit')
        limit = int(sys.argv[limit_idx + 1])
    except (ValueError, IndexError):
        pass

ignore_budget = '--ignore-budget' in sys.argv

# Load data
news_archive = {}
ai_cache = {}
api_budget = {
    "monthlyBudgetLimit": 75.0,
    "currentMonth": time.strftime("%Y-%m"),
    "monthlyAccumulatedCost": 0.0,
    "totalApiCalls": 0
}

if os.path.exists(ARCHIVE_FILE):
    with open(ARCHIVE_FILE, 'r', encoding='utf-8') as f:
        news_archive = json.load(f)

if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, 'r', encoding='utf-8') as f:
        ai_cache = json.load(f)

if os.path.exists(BUDGET_FILE):
    with open(BUDGET_FILE, 'r', encoding='utf-8') as f:
        api_budget = json.load(f)

# Set model
model = genai.GenerativeModel(
    'gemini-flash-latest',
    generation_config={"response_mime_type": "application/json"}
)

def analyze_article_with_retry(article, attempt=1):
    title = article.get('title', '')
    description = article.get('description', '') or ''
    lang = article.get('lang', 'ko')

    prompt = f"""
    You are an expert investment analyst and premium translator.
    Your task is to analyze the following news article for an investor's study archive.
    
    If the article is in English (lang='en'), you MUST translate the title and content into natural, professional, high-quality financial Korean.
    If the article is in Korean (lang='ko'), refine the title to make it professional and clear.

    Generate the output strictly in JSON format with the following keys:
    1. "translatedTitle": A beautiful Korean translation of the title. Make it engaging for an investor.
    2. "summary": Exactly 3 detailed bullet points in Korean summarizing the core event, financial data, or facts.
    3. "implications": Exactly 2 detailed bullet points in Korean explaining the investment implications (why this matters to investors, potential market/sector impact, opportunities or risks to watch).

    Article Info:
    - Language: {lang}
    - Title: {title}
    - Content/Description: {description}

    Output JSON Format:
    {{
      "translatedTitle": "Korean title here",
      "summary": ["summary bullet 1 in Korean", "summary bullet 2 in Korean", "summary bullet 3 in Korean"],
      "implications": ["implication bullet 1 in Korean", "implication bullet 2 in Korean"]
    }}
    """

    try:
        response = model.generate_content(prompt)
        result_json = json.loads(response.text)

        # Estimate tokens and cost (Gemini 1.5 Flash rates)
        input_tokens = len(prompt) * 1.3
        output_tokens = len(response.text) * 1.3
        cost = (input_tokens * 0.075 / 1000000) + (output_tokens * 0.30 / 1000000)

        api_budget["monthlyAccumulatedCost"] += cost
        api_budget["totalApiCalls"] += 1

        return {"success": True, "data": result_json, "cost": cost}
    except Exception as e:
        err_msg = str(e)
        print(f"[Warning] [Attempt {attempt}] API Call Error (ID: {article['id']}): {err_msg}")
        
        # Check for rate limits (429)
        if "429" in err_msg or "resource exhausted" in err_msg.lower() or "rate limit" in err_msg.lower():
            wait_time = attempt * 15
            print(f"[Wait] Rate limit hit. Retrying in {wait_time} seconds...")
            time.sleep(wait_time)
            return analyze_article_with_retry(article, attempt + 1)
        
        if attempt < 3:
            print("[Wait] General error. Retrying in 5 seconds...")
            time.sleep(5)
            return analyze_article_with_retry(article, attempt + 1)
            
        return {"success": False, "error": err_msg}

def save_data():
    with open(ARCHIVE_FILE, 'w', encoding='utf-8') as f:
        json.dump(news_archive, f, indent=2, ensure_ascii=False)
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(ai_cache, f, indent=2, ensure_ascii=False)
    with open(BUDGET_FILE, 'w', encoding='utf-8') as f:
        json.dump(api_budget, f, indent=2, ensure_ascii=False)

def run():
    print("=================================================")
    print("Batch News Summarization Pipeline (Python)")
    print("Model: gemini-flash-latest")
    print("=================================================")

    unsummarized = [a for a in news_archive.values() if not a.get('aiAnalysis')]
    print(f"Total articles needing summaries: {len(unsummarized)}")

    if not unsummarized:
        print("All articles are already summarized.")
        return

    list_to_process = unsummarized[:limit] if limit else unsummarized
    print(f"Processing target: {len(list_to_process)} articles" + (f" (limit: {limit})" if limit else ""))

    success_count = 0
    fail_count = 0

    for i, article in enumerate(list_to_process):
        # Prevent terminal crash on printing Korean characters in some cmd configurations by handling exceptions or simple prints
        try:
            print(f"\n[{i + 1}/{len(list_to_process)}] Analyzing: {article['title'][:40]}... (ID: {article['id']})")
        except UnicodeEncodeError:
            print(f"\n[{i + 1}/{len(list_to_process)}] Analyzing article (ID: {article['id']})")

        # Budget Check
        if not ignore_budget and api_budget["monthlyAccumulatedCost"] >= api_budget["monthlyBudgetLimit"]:
            print(f"[Alert] Budget limit reached ({api_budget['monthlyBudgetLimit']}). Stopping.")
            break

        result = analyze_article_with_retry(article)

        if result["success"]:
            print(f"[Success] Cost: ${result['cost']:.5f}")
            
            # Update database
            updated_article = article.copy()
            updated_article["aiAnalysis"] = result["data"]

            news_archive[article['id']] = updated_article
            ai_cache[article['id']] = updated_article
            success_count += 1

            # Save immediately to prevent data loss
            save_data()
        else:
            print(f"[Failure] Error: {result['error']}")
            fail_count += 1

        # Safe delay for free tier (15 RPM)
        if i < len(list_to_process) - 1:
            print("[Wait] Delaying 4.5s for rate limit safety...")
            time.sleep(4.5)

    print("\n=================================================")
    print("Batch Job Complete!")
    print(f"Success: {success_count}")
    print(f"Failure: {fail_count}")
    print(f"Accumulated Cost: ${api_budget['monthlyAccumulatedCost']:.5f}")
    print("=================================================")

if __name__ == "__main__":
    run()
