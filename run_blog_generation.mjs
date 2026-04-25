import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Helper function to create a URL-friendly slug
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

async function generateBlogPost(topic) {
    console.log(`\n--- Generating Blog Post for Topic: ${topic} ---`);
    const today = new Date().toISOString().split('T')[0];
    const tools = [ { googleSearch: {} } ];

    const blogPrompt = `
    You are an expert Wall Street proprietary trader, quantitative analyst, and senior financial writer for "Truth of Market."
    Your objective is to write a highly engaging, SEO-optimized, and deeply insightful financial blog post on the following topic:
    TOPIC: "${topic}"

    **CURRENT DATE (CRITICAL): The current date today is ${today}. All data, examples, and market context MUST reflect the reality up to and including ${today}.**

    **OUTPUT FORMAT (CRITICAL)**:
    You MUST output the metadata in a JSON block, followed by the content in a Markdown block.

    \`\`\`json
    {
      "title": "A catchy, professional, SEO-friendly headline (under 80 characters).",
      "excerpt": "A 2-sentence summary designed to drive clicks and set the tone.",
      "read_time": "Estimated reading time (e.g., 7 min read)"
    }
    \`\`\`

    \`\`\`markdown
    # [Title]
    [The full blog post written in standard Markdown format (at least 1000 words). Format the markdown with proper H2 and H3 headers, bullet points, and bold text for readability. Use frequent paragraph breaks (every 3-4 sentences max).]

    *Disclaimer: The information provided in this article is for educational purposes only and does not constitute financial advice. Always do your own research.*
    \`\`\`
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: tools,
        }, { apiVersion: "v1beta" });

        let result;
        let retries = 3;
        while (retries > 0) {
            try {
                result = await model.generateContent(blogPrompt);
                break;
            } catch (apiErr) {
                if (apiErr.message.includes('503') || apiErr.message.includes('429') || apiErr.message.includes('500')) {
                    console.warn(`API overloaded or rate limited. Retrying in 30 seconds... (${retries - 1} retries left)`);
                    await new Promise(r => setTimeout(r, 30000));
                    retries--;
                    if (retries === 0) throw apiErr;
                } else {
                    throw apiErr;
                }
            }
        }
        const text = await result.response.text();

        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) {
            throw new Error(`No JSON block found for topic: ${topic}`);
        }

        const jsonString = jsonMatch[1] || jsonMatch[0];
        const postData = JSON.parse(jsonString);

        const markdownMatch = text.match(/```(?:markdown)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch) {
            postData.content = markdownMatch[1];
        } else {
            postData.content = text.replace(jsonMatch[0], '').trim();
        }

        const slug = generateSlug(postData.title);

        const { error } = await supabase
            .from('blog_posts')
            .insert({
                slug: slug,
                title: postData.title,
                excerpt: postData.excerpt,
                content: postData.content,
                author: "Truth of Market Research Team",
                read_time: postData.read_time
            });

        if (error) {
            console.error(`Supabase Save Error for topic ${topic}:`, error);
        } else {
            console.log(`✅ Successfully generated and saved blog post: ${postData.title} (${slug})`);
        }

    } catch (e) {
        console.error(`Failed to generate blog post:`, e.message);
    }
}

async function runBlogGeneration() {
    const topics = [
        "The Hidden Danger of High Dividend Yields: Spotting Value Traps",
        "Decoding the VIX: What the Fear Gauge Actually Measures",
        "The 4 Stages of a Market Cycle: How to Accumulate Like Institutions",
        "Options Flow Anomalies: How to Spot Massive Institutional Bets",
        "Why Free Cash Flow is the Ultimate Measure of Corporate Health",
        "The Dark Side of Share Buybacks: Financial Engineering vs True Growth",
        "Understanding Market Breadth: Why the Indices are Lying to You",
        "How to Read an Earnings Transcript Like a Hedge Fund Analyst",
        "The Death of the 60/40 Portfolio in the Modern Macro Environment",
        "Inflation Dynamics: How Supply Chain Shocks Reshape Corporate Margins",
        "Decoding Insider Selling: When Should You Actually Panic?",
        "The Liquidity Illusion: How Central Banks Manipulate Asset Prices",
        "Sector Rotation Strategies: Following the Smart Money Across Industries",
        "Failure to Deliver (FTD): The Hidden Mechanics of Short Squeezes",
        "Navigating Earnings Season: How Options Pricing Predicts Volatility"
    ];
    
    for (let i = 0; i < topics.length; i++) {
        console.log(`\nProcessing topic ${i + 1}/${topics.length}`);
        await generateBlogPost(topics[i]);
        // Wait 10 seconds between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    console.log("Blog generation complete!");
    process.exit(0);
}

runBlogGeneration();
