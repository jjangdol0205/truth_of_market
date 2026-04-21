import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const blogPosts = [
  {
    slug: 'how-institutional-investors-use-dark-pools',
    title: 'How Institutional Investors Use Dark Pools to Hide Their Trades (And How You Can Track Them)',
    excerpt: 'Dark pools account for over 40% of all stock market trades today. Here is a deep dive into how smart money hides their accumulation and distribution phases from retail investors.',
    author: 'Truth of Market Research Team',
    read_time: '8 min read',
    created_at: new Date('2024-04-18').toISOString(),
    content: `
# Understanding the Shadow Market: Dark Pools

The financial markets you see on your broker's screen represent only a fraction of the actual volume being traded daily. According to recent estimates, over 40% of all US equity trading volume takes place off-exchange, primarily in "dark pools." But what exactly are they, and why do institutions use them?

## What is a Dark Pool?

A dark pool is a privately organized financial forum or exchange for trading securities. Unlike public exchanges such as the NYSE or NASDAQ, dark pools allow institutional investors to trade without exposing their orders to the public until after the trade has been executed.

This lack of transparency is by design. If a massive mutual fund wants to buy 5 million shares of Apple (AAPL), placing that order on a public exchange would cause a massive spike in demand, driving the price up before their order could be fully filled. This phenomenon, known as "market impact," costs institutions millions of dollars.

By using dark pools, these institutions can match large buy and sell orders anonymously, securing a better average price without alerting high-frequency trading (HFT) algorithms to their intentions.

## The Problem for Retail Investors

While dark pools serve a legitimate purpose for institutional liquidity, they create a severe informational disadvantage for retail investors. 

When you look at a standard stock chart, you are only seeing the "lit" exchanges. You might see a stock breaking out on seemingly low volume, completely unaware that millions of shares are being quietly distributed (sold) off-exchange. Conversely, a stock might appear dead, while institutions are aggressively accumulating shares in the dark.

This is why retail traders often feel like they are the last to know, buying exactly when the "smart money" is selling.

## How to Track the Unseen

At Truth of Market, our core philosophy is built around bridging this informational gap. While we cannot see the exact orders sitting in a dark pool (no one can, that's why they are dark), we can analyze the *prints* after they happen and look for statistical anomalies.

1. **Volume Divergence**: When a stock experiences a massive surge in volume but the price barely moves, this is a classic sign of dark pool activity. It indicates a massive transfer of shares from one party to another at an agreed-upon price.
2. **Block Trade Analysis**: Tracking individual trades that exceed 10,000 shares or $200,000 in value can provide clues about institutional sentiment.
3. **Options Flow**: Often, institutions will hedge their dark pool trades in the options market, which is publicly visible. Anomalous options flow (like massive out-of-the-money put buying) can signal that an institution is protecting a massive, hidden long position.

By aggregating these data points using advanced AI models, we can reverse-engineer institutional sentiment. You don't need to see the exact order book; you just need to follow the footprints they leave behind.
    `
  },
  {
    slug: 'the-flaws-of-the-pe-ratio',
    title: 'Why the P/E Ratio is Often a Trap for Value Investors',
    excerpt: 'The Price-to-Earnings ratio is the most popular valuation metric, but relying on it blindly can lead to devastating losses. Here is what you should be looking at instead.',
    author: 'Truth of Market Research Team',
    read_time: '6 min read',
    created_at: new Date('2024-04-15').toISOString(),
    content: `
# The Value Trap: Misunderstanding P/E

If you ask a beginner investor how they decide if a stock is cheap, 9 times out of 10, they will mention the Price-to-Earnings (P/E) ratio. It's the ultimate shorthand for valuation: how much are you paying for $1 of earnings?

A stock with a P/E of 10 is considered cheap, while one with a P/E of 50 is considered expensive. However, Wall Street is rarely that simple. Relying solely on the P/E ratio is one of the most common ways retail investors fall into "value traps."

## The Problem with the 'E' (Earnings)

The biggest flaw of the P/E ratio lies in the denominator: Earnings. 

Earnings (Net Income) is an accounting figure, not a cash figure. Due to Generally Accepted Accounting Principles (GAAP), companies have significant leeway in how they report earnings. They can use non-cash items like depreciation, amortization, and one-time write-offs to massage the final number.

A company might report a massive profit, resulting in a low P/E ratio, but actually be burning through cash. Conversely, a rapidly growing tech company might reinvest all its cash flow into R&D, showing zero profit (and an infinite P/E), despite fundamentally growing intrinsic value.

## Trailing vs. Forward P/E

Another critical distinction is whether you are looking backwards or forwards.
- **Trailing P/E** uses the earnings from the past 12 months. This is looking in the rearview mirror. The market, however, is a forward-looking mechanism.
- **Forward P/E** uses estimated earnings for the next 12 months. The problem here? These estimates are provided by Wall Street analysts, who are notoriously optimistic and often revise their estimates downward when trouble arises.

A stock might look cheap because its Trailing P/E is 8. But if its core business is in secular decline (think of blockbuster video in the mid-2000s), its future earnings will collapse. You bought it thinking it was cheap, but it was actually a value trap.

## Better Alternatives to P/E

At Truth of Market, our AI scoring models do not rely on isolated P/E ratios. Instead, we analyze a holistic matrix of valuation metrics:

1. **Free Cash Flow Yield (FCF Yield)**: Cash doesn't lie. This metric looks at the actual cash generated by the business after capital expenditures, divided by the market cap.
2. **EV/EBITDA**: This metric accounts for the company's debt (Enterprise Value) and looks at earnings before accounting manipulation (EBITDA), making it far superior for comparing companies in capital-intensive industries.
3. **Return on Invested Capital (ROIC)**: This tells you how efficiently a company uses its capital to generate profits. A high ROIC often justifies a higher P/E ratio.

Stop buying stocks just because they have a low P/E. Dive deeper into the cash flow statement, or let our AI do the heavy lifting for you.
    `
  },
  {
    slug: 'ai-in-financial-analysis',
    title: 'How Artificial Intelligence is Revolutionizing Fundamental Analysis',
    excerpt: 'Reading a 200-page 10-Q filing used to take hours. Now, AI can extract critical risk factors, management sentiment, and hidden accounting red flags in seconds.',
    author: 'Truth of Market Research Team',
    read_time: '7 min read',
    created_at: new Date('2024-04-10').toISOString(),
    content: `
# The End of the Analyst Intern

For decades, the grunt work of Wall Street was done by first-year analysts. Their job? Read through hundreds of pages of SEC filings (10-Ks, 10-Qs), listen to hours of earnings calls, and manually input data into massive Excel spreadsheets.

Today, this paradigm is shifting dramatically due to the advent of Large Language Models (LLMs) and advanced AI. At Truth of Market, we are at the forefront of this revolution.

## The Power of Unstructured Data

Traditional quantitative models excel at parsing structured data (numbers in a spreadsheet). They can easily calculate moving averages or sort stocks by revenue growth.

However, the most valuable insights are often buried in *unstructured* data:
- The specific phrasing a CEO uses when discussing supply chain issues on an earnings call.
- A sudden change in the "Risk Factors" section of a 10-K filing.
- The tone of a press release announcing a sudden executive departure.

Historically, only human analysts could interpret these nuances. Now, AI can do it at scale, instantly.

## How Truth of Market Uses AI

Our proprietary system leverages AI not to replace fundamental analysis, but to supercharge it.

1. **Sentiment Analysis**: Our models read every word of an earnings transcript and measure the sentiment. Is management becoming more defensive? Are they using vague language when asked about forward guidance? The AI picks up on these subtle shifts long before the numbers reflect them.
2. **Risk Factor Extraction**: Companies are legally required to disclose risks in their SEC filings. Often, they bury new, critical risks deep within a 200-page document. Our AI scans these documents, compares them to previous quarters, and highlights exactly what has changed.
3. **Accounting Anomaly Detection**: By training our models on historical instances of corporate fraud, the AI can flag unusual discrepancies between cash flow and reported earnings, warning investors of potential accounting manipulation.

## Democratizing Wall Street

The most exciting aspect of this technology is democratization. The massive hedge funds have had access to sentiment-scraping algorithms for years, paying millions for the privilege. 

By building Truth of Market, we are bringing that exact same level of sophisticated, institutional-grade forensic analysis to the retail investor. The playing field is finally leveling.
    `
  }
];

async function migrate() {
    console.log("Migrating static blog posts to Supabase...");
    
    for (const post of blogPosts) {
        const { error } = await supabase
            .from('blog_posts')
            .upsert({
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                author: post.author,
                read_time: post.read_time,
                created_at: post.created_at
            }, { onConflict: 'slug' });
            
        if (error) {
            console.error(\`Failed to migrate \${post.slug}:\`, error.message);
        } else {
            console.log(\`✅ Migrated \${post.slug}\`);
        }
    }
    
    console.log("Migration complete!");
}

migrate();
