import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import YahooFinance from 'yahoo-finance2';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^["']|["']$/g, '').trim();
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/^["']|["']$/g, '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase Config Error: Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const yahooFinance = new YahooFinance();

async function fetchStrategyA() {
  console.log('=== 전략 A: 매일 홈페이지 등재 기업의 선행 지표 수집 (Supabase) ===');
  
  // 홈페이지(DB)에 존재하는 종목 전체 가져오기
  const { data: reports, error: fetchErr } = await supabase
    .from('reports')
    .select('ticker')
    .limit(500);

  if (fetchErr) {
    console.error("Failed to fetch tickers from Supabase:", fetchErr.message);
    process.exit(1);
  }

  // 중복 제거
  const uniqueTickers = Array.from(new Set((reports || []).map(r => r.ticker))).filter(Boolean);
  console.log(`홈페이지에서 분석된 ${uniqueTickers.length}개 종목 대상을 조회했습니다: ${uniqueTickers.join(', ')}`);

  const todayStr = new Date().toISOString().split('T')[0];

  for (const ticker of uniqueTickers) {
    try {
      const quoteDetails = await yahooFinance.quoteSummary(ticker, {
        modules: ['defaultKeyStatistics', 'financialData', 'price']
      });

      const forwardPE = quoteDetails.defaultKeyStatistics?.forwardPE;
      const forwardEps = quoteDetails.defaultKeyStatistics?.forwardEps;
      const currentPrice = quoteDetails.price?.regularMarketPrice;

      console.log(`[${ticker}] 주가: $${currentPrice}, 선행 EPS: ${forwardEps}, 선행 PE: ${forwardPE}`);

      // DB insert (Upsert 기반)
      if (forwardPE || forwardEps) {
        const { error: insertErr } = await supabase.from('forward_metrics').upsert({
          date: todayStr,
          ticker: ticker,
          forward_eps: forwardEps || null,
          forward_pe: forwardPE || null,
          current_price: currentPrice || null
        }, { onConflict: 'date,ticker' });

        if (insertErr) {
            console.error(`[${ticker}] DB 저장 실패:`, insertErr.message);
        }
      }
      
    } catch (err) {
      console.error(`[${ticker}] 스크래핑/저장 실패:`, err);
    }
  }
  
  console.log(`\n✅ 전략 A 완료! Supabase DB(forward_metrics)에 매일 기록 데이터가 수집/업데이트 되었습니다.`);
}

fetchStrategyA();
