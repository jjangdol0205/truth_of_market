import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const recommended = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "PLTR", "SOUN", "SMCI"];
    
    // Check if each ticker has a report created today
    const { data, error } = await supabase
        .from('reports')
        .select('ticker, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
        
    if (error) {
        console.error("Error fetching reports:", error);
        return;
    }
    
    // Check today's date
    const today = new Date().toISOString().split('T')[0];
    
    let foundCount = 0;
    for (const ticker of recommended) {
        const r = data.find(d => d.ticker === ticker && d.created_at.startsWith(today));
        if (r) {
            console.log(`✅ Verified report for ${ticker} created at ${r.created_at}`);
            foundCount++;
        } else {
            console.log(`❌ Missing report for ${ticker} today`);
        }
    }
    console.log(`\nVerification Summary: ${foundCount}/${recommended.length} found.`);
}

verify();
