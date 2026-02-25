import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const dateStr = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
        .from('market_summaries')
        .upsert({
            date: dateStr,
            title: 'Market Briefing: S&P 500 Hits Resistance',
            content: '### Executive Summary & Indices\nToday, the broader US equity market experienced increased volatility amidst renewed inflation concerns. The indices closed mixed as investors rotated out of mega-cap tech into defensive sectors and small caps ahead of tomorrow’s CPI print.\n\n*   **S&P 500:** 5,123.45 (-0.45%)\n*   **NASDAQ:** 16,085.11 (-1.12%)\n*   **Dow Jones:** 38,722.69 (+0.15%)\n\n### Top 3 Market Drivers\n*   **Unexpected Retail Sales Beat:** Consumer spending came in hotter than expected, sparking fears that the Federal Reserve may delay interest rate cuts until Q3.\n*   **Semiconductor Sell-off:** Profit-taking hit major chipmakers after a downgrade from a prominent Wall Street analyst citing valuation concerns.\n*   **Energy Sector Rally:** Crude oil prices surged 2% on rising geopolitical tensions in the Middle East, lifting standard energy equities.\n\n### The AI Verdict\nPrepare for near-term chop; use the tech pullback to strategically accumulate high-conviction AI infrastructure names before the next earnings cycle.'
        }, { onConflict: 'date' })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
