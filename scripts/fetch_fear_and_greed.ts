import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase Config Error: Missing environment variables. Make sure .env.local exists.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchFearAndGreed() {
  try {
    const response = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const latestData = data.fear_and_greed;

    console.log('--- CNN Fear and Greed Index ---');
    console.log(`Date: ${new Date(latestData.timestamp).toLocaleString()}`);
    console.log(`Score: ${Math.round(latestData.score)} / 100`);
    console.log(`Rating: ${latestData.rating.toUpperCase()}`);

    // Supabase에 저장
    const { error } = await supabase.from('fear_and_greed').insert({
      timestamp: new Date(latestData.timestamp).toISOString(),
      score: latestData.score,
      rating: latestData.rating
    });
    
    if (error) {
      console.error("Supabase Save Error:", error.message);
    } else {
      console.log(`\n✅ DB(fear_and_greed)에 저장 완료!`);
    }

  } catch (err) {
    console.error('Failed to fetch Fear and Greed index:', err);
  }
}

fetchFearAndGreed();
