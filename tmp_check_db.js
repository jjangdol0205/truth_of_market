const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('market_summaries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error(error);
    } else {
        console.log("TITLE:");
        console.log(data[0].title);
        console.log("\nCONTENT:");
        console.log(JSON.stringify(data[0].content)); // to see if there are literal \n
        console.log("\nRAW:");
        console.log(data[0].content);
    }
}

check();
