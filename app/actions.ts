"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./lib/supabase";

export async function analyzeTicker(ticker: string, reportType: "research" | "earnings" = "research", quarter: string = "") {
    // PRE-VALIDATION: Check if ticker exists via Yahoo Finance API
    try {
        const queryTicker = ticker === "LNK" ? "LINK-USD" : ticker;
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const data = await res.json();
        if (data?.chart?.error?.code === "Not Found" || data?.chart?.error?.description?.includes("delisted")) {
            return "Error: Invalid Ticker. The specified ticker does not exist or is delisted.";
        }
    } catch (err) {
        console.error("Ticker validation fetch failed, proceeding anyway...", err);
    }

    // 1. 비밀 금고(.env.local)에서 키 꺼내기
    const apiKey = process.env.GEMINI_API_KEY;
    // Add dynamically current Date to anchor the AI to the live present timeline
    const today = new Date().toISOString().split('T')[0];
    if (!apiKey) return "Error: API Key not found.";

    // 2. 제미나이 연결
    const genAI = new GoogleGenerativeAI(apiKey);

    // Google Search Grounding 도구 설정
    const tools: any = [
        {
            googleSearch: {} // New standard for 2.5 Flash and newer models
        },
    ];

    // Priority Model List
    const modelsToTry = [
        "gemini-2.5-flash"
    ];

    // Log to capture errors for each model
    let errorLog: string[] = [];

    // Dual-Mode Prompt Definitions
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
    Immediately below the JSON block, write the 10-chapter Detailed Report in standard Markdown.
    - Provide deep, expansive analysis, analogies, and specific data points. (Aim for 150-200 words per chapter).
    - **CRITICAL FORMATTING INSTRUCTIONS (Readability)**: 
      1. Format the report to look like a premium **Wall Street Journal** newsletter.
      2. You MUST use frequent **DOUBLE NEWLINES** to break apart paragraphs. Never write giant walls of text. Make the text highly readable for subscribers constraint to 3-4 sentences per paragraph.
      3. Use rich markdown: **Bold** key metrics, utilize bullet point lists, and use blockquotes (\`>\`) to highlight key takeaways.
    - **Chapter 8**: Identify EMAs, Base Building, 4-Stage Cycle, and Bear Traps concisely.
    - **CRITICAL**: The output MUST be strictly in ENGLISH.

    # Table of Contents
    Prologue: Welcome to the World of Investing
    ## Chapter 1. Financial Health Checkup
    ## Chapter 2. Industry Analysis
    ## Chapter 3. Why This Company?
    ## Chapter 4. 10-K Breakdown
    ## Chapter 5. Business Model Analysis
    ## Chapter 6. Core Competitive Advantage
    ## Chapter 7. Top Catalysts
    ## Chapter 8. Technical Analysis: Smart Money Tracks 🎯
    ## Chapter 9. Potential Risks
    ## Chapter 10. Valuation
    [Outro] Epilogue: Investing with Conviction
    `;

    const earningsPrompt = `
    You are a top-tier Wall Street Equity Research Analyst focusing on earnings performance.
    Your goal is to parse and evaluate the specific ${quarter} earnings report for the target company: ${ticker}.
    The analyst needs critical Q-o-Q, Y-o-Y growth numbers, and Forward Guidance immediately summarized without hallucinations.
    
    **STRICT TEMPORAL ANCHOR (CRITICAL)**:
    - **TODAY IS ${today}. YOU ARE IN THE YEAR 2026.**
    - Only report on the absolutely most recently closed Quarter before ${today}.
    
    **STRICT SOURCE REQUIREMENT**:
    - Use \`Google Search\` to pull the exact Wall Street consensus estimates AND the resulting actual figures for the ${quarter} earnings release for ${ticker}.

    **OUTPUT CONSTRAINTS (CRITICAL)**:
    - Output strictly in valid **JSON format**. NO MARKDOWN OUTSIDE THE JSON BLOCK.
    - DO NOT generate a 10-chapter markdown report for this task.
    - Ensure all numbers are precise strings (e.g. "1.24", "$25.4B").
    - **CRITICAL: You are writing JSON. YOU MUST ESCAPE ALL NEWLINES AS \\n AND ALL DOUBLE QUOTES AS \\" INSIDE STRING VALUES! DO NOT USE LITERAL NEWLINES IN THE MARKDOWN FIELD!**
    
    **OUTPUT JSON STRUCTURE:**
    {
        "actual_eps": 1.25,
        "est_eps": 1.10,
        "actual_rev": "25.1B",
        "est_rev": "24.5B",
        "guidance_summary": "Management raised full-year guidance by 150 basis points citing accelerated AI adoption.",
        "ai_interpretation": "BULLISH SIGNAL. The strong double-beat combined with raised guidance indicates durable pricing power.",
        "verdict": "BUY",
        "executive_summary": "Double beat on EPS and Revenue with strong forward guidance raised.",
        "investment_score": { "total": 90 }
    }
    
    CRITICAL INSTRUCTION: You must output ONLY valid, raw JSON. Do NOT wrap the JSON in markdown formatting or code blocks. Do NOT include any conversational text or explanations outside the JSON.
    `;

    const prompt = reportType === "earnings" ? earningsPrompt : researchPrompt;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Trying model: ${modelName}...`);

            // Remove incompatible generationConfig for tools
            const currentModel = genAI.getGenerativeModel({
                model: modelName,
                tools: tools,
            }, { apiVersion: "v1beta" });

            const result = await currentModel.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Debug logging
            console.log(`Model ${modelName} raw response length:`, text.length);

            let jsonString = "";
            let finalMarkdown = "";

            if (reportType === "research") {
                // Safely extract the JSON block from the mixed response
                const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("No JSON block found in research response");
                }

                jsonString = jsonMatch[1] || jsonMatch[0];

                // Extract everything that IS NOT the JSON string to form the robust markdown body
                finalMarkdown = text.replace(jsonMatch[0], '').trim();

            } else {
                // Earnings are entirely JSON, use robust cleanup
                let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                const start = cleanText.indexOf('{');
                const end = cleanText.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    cleanText = cleanText.substring(start, end + 1);
                }
                const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("No JSON found in earnings response");
                jsonString = jsonMatch[0];
            }

            if (jsonString.includes("SOURCE_DATA_MISSING")) {
                return "Error: SOURCE_DATA_MISSING. (Cannot find latest data. Please check ticker.)";
            }

            let analysis;
            try {
                analysis = JSON.parse(jsonString);
                console.log(`Parsed JSON keys:`, Object.keys(analysis)); // Validating keys

                if (reportType === "research") {
                    if (!analysis.executive_summary) {
                        throw new Error("Missing executive_summary");
                    }
                    // Handle edge cases where LLM ignored instructions and put markdown inside JSON
                    if (analysis.detailed_report_markdown && finalMarkdown.length < 100) {
                        finalMarkdown = analysis.detailed_report_markdown;
                    }
                    // Append the dynamic scores directly to the safe markdown payload
                    finalMarkdown += '\n\n<!-- SCORE_BREAKDOWN: ' + JSON.stringify(analysis.investment_score) + ' -->';
                } else {
                    if (!analysis.actual_eps || !analysis.guidance_summary) {
                        throw new Error("Missing required earnings fields");
                    }
                }
            } catch (e: any) {
                console.error(`JSON Parse/Validation Error (${modelName}):`, e);
                console.error("Failed JSON Text snippet:", jsonString.substring(0, 300));
                errorLog.push(`${modelName}: JSON Parse error - ${e.message}`);
                continue;
            }

            const { error } = await supabase
                .from('reports')
                .insert({
                    ticker: ticker.toUpperCase(),
                    risk_score: analysis.investment_score?.total || 50,
                    verdict: analysis.verdict || "HOLD",
                    one_line_summary: analysis.executive_summary,
                    detailed_report: finalMarkdown,
                    analysis_text: JSON.stringify(analysis),
                    report_type: reportType,
                    quarter: quarter || null
                });

            if (error) {
                console.error("Supabase Save Error:", error);
                return `Error: Failed to save to Database - ${error.message}`;
            }

            return JSON.stringify(analysis);

        } catch (error: any) {
            console.error(`Model ${modelName} failed:`, error.message);
            errorLog.push(`${modelName}: ${error.message}`);

            if (error.message?.includes("API key")) {
                return "Error: API Key Invalid.";
            }

            if (!error.message?.includes("429")) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            continue;
        }
    }

    // Return detailed error log to user
    return `Error: All models failed to analyze.\n\n[Details]\n${errorLog.join("\n")}`;
}

export async function autoGenerateBriefing() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { error: "API Key not found." };

    const genAI = new GoogleGenerativeAI(apiKey);
    const today = new Date().toISOString().split('T')[0];

    let indexContext = "";
    try {
        const symbols = ['^GSPC', '^IXIC', '^DJI'];
        const indexData = await Promise.all(symbols.map(async (sym) => {
            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await res.json();
            const result = data?.chart?.result?.[0];
            if (result) {
                const name = result.meta.shortName;
                const price = result.meta.regularMarketPrice;
                const prevClose = result.meta.chartPreviousClose;
                const change = price - prevClose;
                const changePercent = (change / prevClose) * 100;
                return `${name}: ${price.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}, ${change > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
            }
            return "";
        }));
        indexContext = `\nREAL-TIME INDEX DATA FOR TODAY:\n${indexData.filter(Boolean).join('\n')}\n(You MUST use these exact numbers when mentioning the indices.)\n`;
    } catch (err) {
        console.error("Failed to fetch index data for briefing:", err);
    }

    const prompt = `
    You are the Chief Market Strategist for an elite AI-powered investment platform.
    Your task is to write the "Daily Market Briefing" for today, ${today}.
    ${indexContext}
    Using Google Search, find the top 3-4 most important financial news stories, market indices performance (S&P 500, Nasdaq, Dow Jones), and key sector movements that happened over the last 24 hours.
    
    Output strictly in the following JSON format.
    
    {
       "title": "A punchy, exciting Wall Street Journal style headline (e.g. 'Tech Rally Falters as Bond Yields Spike')",
       "content": "A beautifully formatted string of normal text. Start with a short executive summary.\\n\\nThen summarize the 3-4 key market events using clean bullet points."
    }
    
    CRITICAL INSTRUCTION: You MUST output valid JSON. Do not include raw newlines inside the strings, use \\n for line breaks. Escape all double quotes inside the content string. Your response should parse successfully with JSON.parse().
    
    CRITICAL FORMATTING INSTRUCTION: 
    - DO NOT use Markdown headers like "### ".
    - DO NOT use Markdown bolding like "**text**".
    - Simply write the text cleanly as plain text with standard line breaks and bullet points.
    - Example of a clean bullet point: "- Tech Sector: Apple surged due to..."
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }] as any,
        }, { apiVersion: "v1beta" });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            cleanText = cleanText.substring(start, end + 1);
        }

        const data = JSON.parse(cleanText);

        if (!data.title || !data.content) {
            throw new Error("Missing title or content in AI response");
        }

        return { title: data.title, content: data.content };
    } catch (e: any) {
        console.error("Auto-generate briefing failed:", e);
        return { error: e.message || "Failed to generate briefing." };
    }
}