import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateAndPublishBriefing() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Starting Daily Market Briefing automation for ${today}...`);

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
    
    CRITICAL INSTRUCTION: You MUST output your response EXACTLY in the following format. Do not use JSON.
    
    ---TITLE---
    A punchy, exciting Wall Street Journal style headline
    ---CONTENT---
    A beautifully formatted string of normal text with bullet points...
    
    The "content" field MUST summarize the key market events cleanly and safely.
    At the very end of "content", append a section titled "**10 Trending Stocks to Watch Today**". Use Google Search to identify 10 trending, high-interest US stocks showing massive volume or huge news today, and list their tickers.
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }]
        }, { apiVersion: "v1beta" });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        let title = "";
        let content = "";

        const titleMatch = text.match(/---TITLE---\s*([\s\S]*?)\s*---CONTENT---/i);
        const contentMatch = text.match(/---CONTENT---\s*([\s\S]+)/i);

        if (titleMatch && contentMatch) {
            title = titleMatch[1].trim();
            content = contentMatch[1].trim();
        } else {
            console.error("RAW AI OUTPUT:\\n", text);
            throw new Error("Failed to parse AI response. Missing ---TITLE--- or ---CONTENT--- markers.");
        }

        if (!title || !content) {
            throw new Error("Missing title or content in AI response");
        }
        
        console.log("Briefing successfully generated. Inserting into Supabase...");
        
        const { error } = await supabase.from('market_summaries').upsert([
            {
                title: title,
                content: content,
                date: today,
            }
        ], { onConflict: 'date' });
        
        if (error) {
            throw new Error(error.message);
        }
        
        console.log("✅ Successfully generated and saved the daily market briefing to the database.");
        
    } catch (e) {
        console.error("❌ Auto-generate briefing failed:", e);
        process.exit(1);
    }
}

generateAndPublishBriefing().then(() => {
    process.exit(0);
});
