import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function analyzeTicker(ticker) {
    try {
        const queryTicker = ticker === "LNK" ? "LINK-USD" : ticker;
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const data = await res.json();
        if (data?.chart?.error?.code === "Not Found" || data?.chart?.error?.description?.includes("delisted")) {
            console.error(`Skipping ${ticker}: Invalid or delisted.`);
            return;
        }
    } catch (err) {
        console.error("Ticker validation fetch failed, proceeding anyway...", err);
    }

    const today = new Date().toISOString().split('T')[0];
    const tools = [ { googleSearch: {} } ];

    const researchPrompt = `
    You are a top-tier Wall Street proprietary trader and analyst who perfectly combines Fundamental Analysis with Technical Analysis (Tracking Smart Money).
    Your goal is to assign an "Investment Score" (0-100) to the target company: ${ticker}.

    **STRICT TEMPORAL ANCHOR (CRITICAL)**:
    **CURRENT DATE (CRITICAL): The current date today is ${today}. All data, financial analysis, quarter reports, and trend projections MUST be calculated up to ${today}. Do NOT use 2024 data. YOU ARE IN THE YEAR 2026. USE THE LATEST AVAILABLE DATA UP TO ${today}.**
    - **TODAY IS ${today}. YOU ARE IN THE YEAR 2026.**
    - All of your analytics, fundamental health checks, trailing twelves months (TTM), and macro context MUST reflect the reality up to and including **${today}**.
    - DO NOT use old data from 2024. Pull the most recent earnings, the most recent product releases, and the absolute latest market conditions.

    **STRICT SOURCE REQUIREMENT**:
    - Use \`Google Search\` to find the absolute latest real-time data and news for ${ticker} up to ${today}.

    **OUTPUT FORMAT (CRITICAL)**:
    You MUST structure your response into TWO distinct parts to completely prevent JSON parsing errors.

    **PART 1: JSON METRICS**
    Provide the scores and summary strictly in valid JSON wrapped in a \`\`\`json code block. Do NOT include the detailed report in this JSON.
    **CRITICAL INVESTOR FRAMEWORK SCORING**:
    You MUST break down the \`investment_score\` into exactly 4 categories summarizing: Valuation, Fundamental Health, Technical Trend, and Sentiment.
    Calculate these carefully based on real peer-comparison metrics.
    \`\`\`json
    {
      "investment_score": {
        "total": 85,
        "breakdown": [
          { "category": "Valuation (vs Peers)", "score": 22, "max_score": 30, "reason": "P/E is expanding but justified by 45% EPS growth." },
          { "category": "Fundamental Health & FCF", "score": 28, "max_score": 30, "reason": "Debt-to-equity below 0.5, expanding gross margins, robust FCF." },
          { "category": "Technical Trend & Smart Money", "score": 18, "max_score": 20, "reason": "Consistent volume accumulation above 50-day EMA." },
          { "category": "Catalysts & Market Sentiment", "score": 17, "max_score": 20, "reason": "Upcoming product cycle driving institutional upgrades." }
        ]
      },
      "verdict": "BUY",
      "executive_summary": "4 high-impact bullet points summarizing the core fundamental thesis.",
      "bull_case_summary": "2 sharp sentences on why this stock will explode upwards.",
      "bear_case_summary": "2 sharp sentences on the existential threat that could crush this stock."
    }
    \`\`\`

    **PART 2: DETAILED REPORT (MARKDOWN)**
    Immediately below the JSON block, write a comprehensive, data-driven analysis report in standard Markdown.
    - Provide deep, expansive analysis, analogies, and specific data points.
    - **CRITICAL FORMATTING INSTRUCTIONS (Readability & E-E-A-T)**: 
      1. Format the report to look like a premium **Wall Street Quant Analyst** newsletter. Write with authority, expertise, and a highly analytical tone.
      2. You MUST use frequent **DOUBLE NEWLINES** to break apart paragraphs. Never write giant walls of text. Make the text highly readable for subscribers constraint to 3-4 sentences per paragraph.
      3. Use rich markdown: **Bold** key metrics, utilize bullet point lists, and use blockquotes (\`>\`) to highlight key takeaways.
      4. **TABLES ARE MANDATORY**: You MUST include at least TWO Markdown Tables in your report (e.g., Peer Comparison, Key Financial Metrics, or Valuation Multiples) to make the data visually digestible.
    - **DYNAMIC STRUCTURE (CRITICAL)**: DO NOT use generic chapter titles like "Chapter 1", "Chapter 2" or "Table of Contents". You MUST create highly engaging, specific, click-worthy \`##\` (H2) and \`###\` (H3) subtitles tailored to the company's current narrative and financial situation (e.g., "The iPhone 16 Supercycle: A Margin Expanding Reality", "Technical Breakout or Bear Trap?"). Every report must have a unique flow and structure.
    - **CRITICAL**: The output MUST be strictly in ENGLISH.
    `;

    try {
        console.log(`\n--- Fetching Deep Research for ${ticker} ---`);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: tools,
        }, { apiVersion: "v1beta" });

        const result = await model.generateContent(researchPrompt);
        const text = await result.response.text();

        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error(`No JSON block found for ${ticker}`);
        }

        const jsonString = jsonMatch[1] || jsonMatch[0];
        let finalMarkdown = text.replace(jsonMatch[0], '').trim();

        if (jsonString.includes("SOURCE_DATA_MISSING")) {
            console.error(`${ticker}: SOURCE_DATA_MISSING`);
            return;
        }

        const analysis = JSON.parse(jsonString);

        if (!analysis.executive_summary) {
            throw new Error(`Missing executive_summary for ${ticker}`);
        }
        
        if (analysis.detailed_report_markdown && finalMarkdown.length < 100) {
            finalMarkdown = analysis.detailed_report_markdown;
        }
        finalMarkdown += '\n\n<!-- SCORE_BREAKDOWN: ' + JSON.stringify(analysis.investment_score) + ' -->';

        const { error } = await supabase
            .from('reports')
            .insert({
                ticker: ticker.toUpperCase(),
                risk_score: analysis.investment_score?.total || 50,
                verdict: analysis.verdict || "HOLD",
                one_line_summary: analysis.executive_summary,
                detailed_report: finalMarkdown,
                analysis_text: JSON.stringify(analysis),
                report_type: "research",
                quarter: null
            });

        if (error) {
            console.error(`Supabase Save Error for ${ticker}:`, error);
        } else {
            console.log(`✅ successfully saved research for ${ticker} to database.`);
        }

    } catch (e) {
        console.error(`Failed to analyze ${ticker}:`, e.message);
    }
}

async function runBatch() {
    const recommended = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "PLTR", "SOUN", "SMCI"];
    for (const t of recommended) {
        await analyzeTicker(t);
        // Wait 3 seconds between requests to avoid rate limit issues
        await new Promise(r => setTimeout(r, 3000));
    }
    console.log("All batch processing complete!");
    process.exit(0);
}

runBatch();
