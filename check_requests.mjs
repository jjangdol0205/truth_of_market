import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('company_requests')
        .select('ticker')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Error fetching:', error);
        return;
    }
    
    const countMap = {};
    for (const req of data) {
        if (req.ticker) {
            countMap[req.ticker] = (countMap[req.ticker] || 0) + 1;
        }
    }
    
    // sorting map
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    console.log("Top requested tickers:");
    console.log(sorted.slice(0, 10));
    
    console.log("\nTotal raw requests:", data.length);
}

check();
