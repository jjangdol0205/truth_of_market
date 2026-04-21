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
    You MUST output strictly in valid JSON wrapped in a \`\`\`json code block.
    The JSON object must have exactly these keys:
    - "title": A catchy, professional, SEO-friendly headline (under 80 characters).
    - "excerpt": A 2-sentence summary designed to drive clicks and set the tone (under 200 characters).
    - "content": The full blog post written in standard Markdown format (at least 1000 words).
    - "read_time": Estimated reading time (e.g., "7 min read").

    **CONTENT GUIDELINES (MARKDOWN)**:
    1. The content must be deeply educational, exposing "Wall Street Secrets" or hidden mechanics. 
    2. Format the markdown with proper H2 (##) and H3 (###) headers, bullet points, and bold text for readability.
    3. Use frequent paragraph breaks (every 3-4 sentences max).
    4. Maintain an authoritative, objective, and institutional tone. No emojis in the main text.
    5. At the very end of the markdown content, you MUST include a short disclaimer line stating:
       "*Disclaimer: The information provided in this article is for educational purposes only and does not constitute financial advice. Always do your own research.*"

    \`\`\`json
    {
      "title": "...",
      "excerpt": "...",
      "content": "...",
      "read_time": "..."
    }
    \`\`\`
    `;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: tools,
        }, { apiVersion: "v1beta" });

        const result = await model.generateContent(blogPrompt);
        const text = await result.response.text();

        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error(`No JSON block found for topic: ${topic}`);
        }

        const jsonString = jsonMatch[1] || jsonMatch[0];
        const postData = JSON.parse(jsonString);

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
        "How Quantitative Tightening is Secretly Draining Retail Liquidity",
        "The Anatomy of a Bear Trap: How Institutions Shake Out Retail Investors",
        "Why Traditional P/E Ratios Are Dead in the AI Era"
    ];
    
    // For this run, we'll pick a random topic from the list
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    await generateBlogPost(randomTopic);
    
    console.log("Blog generation complete!");
    process.exit(0);
}

runBlogGeneration();
