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

async function fetchStrategyB() {
  console.log('=== 전략 B: 과거 주가 및 실적 기반 Trailing P/E 시뮬레이션 (Supabase) ===');
  
  // 홈페이지(DB)에 존재하는 종목 전체 가져오기
  const { data: reports, error: fetchErr } = await supabase
    .from('reports')
    .select('ticker')
    .limit(500);

  if (fetchErr) {
    console.error("Failed to fetch tickers from Supabase:", fetchErr.message);
    process.exit(1);
  }

  const uniqueTickers = Array.from(new Set((reports || []).map(r => r.ticker))).filter(Boolean);
  console.log(`대상 종목 ${uniqueTickers.length}개 처리 예정.`);

  for (const ticker of uniqueTickers) {
    try {
      // 1. 최근 4개 분기 실적 및 지표 요약 가져오기
      const quote = await yahooFinance.quoteSummary(ticker, { modules: ['earningsHistory', 'defaultKeyStatistics'] });
      const history = quote.earningsHistory?.history || [];
      
      let ttmEps = 0;
      for(const q of history) {
          ttmEps += q.epsActual || 0;
      }
      
      if (ttmEps === 0 && quote.defaultKeyStatistics?.trailingEps) {
          ttmEps = quote.defaultKeyStatistics.trailingEps;
      }
      
      console.log(`[${ticker}] 추출된 TTM EPS: $${parseFloat((ttmEps).toString()).toFixed(2)}`);

      if (ttmEps <= 0) {
        console.log(`  -> EPS가 마이너스이거나 0이어서 P/E 계산 불가`);
        continue;
      }

      // 2. 과거 1년치 주가 일별 데이터를 조회합니다.
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const historicalPrices = await yahooFinance.historical(ticker, {
        period1: oneYearAgo.toISOString().split('T')[0],
        period2: new Date().toISOString().split('T')[0]
      });

      console.log(`[${ticker}] 과거 ${historicalPrices.length}일 데이터 DB 저장 중...`);

      const rowsToInsert = historicalPrices.map((daily) => {
        const price = daily.close;
        const pe = price / ttmEps;
        return {
            date: daily.date.toISOString().split('T')[0],
            ticker: ticker,
            close_price: parseFloat(price.toFixed(2)),
            trailing_eps: parseFloat(ttmEps.toFixed(2)),
            trailing_pe: parseFloat(pe.toFixed(2))
        };
      });

      // 대량 INSERT 처리 (데이터가 많으므로 chunk 단위로 넣을 수도 있지만, 보통 250일이면 1 쿼리로 충분합니다)
      const { error: insertErr } = await supabase.from('trailing_pe').upsert(rowsToInsert, { onConflict: 'date,ticker' });
      
      if (insertErr) {
        console.error(`[${ticker}] DB 대량 저장 실패:`, insertErr.message);
      } else {
        console.log(`[${ticker}] ✅ 1년치 Trailing DB 적재 성공`);
      }
      
    } catch (err) {
      console.error(`[${ticker}] 전략 B 처리 실패`, err);
    }
  }

  console.log(`\n✅ 전략 B 완료! 모든 대상 종목의 Trailing PE 계산 및 DB 적재가 완료되었습니다.`);
}

fetchStrategyB();
