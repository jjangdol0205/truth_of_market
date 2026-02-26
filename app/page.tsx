import Link from "next/link";
import { supabase } from "./lib/supabase";
import ReportCard from "./components/ReportCard";
import StockCard from "../components/StockCard";
import LeadMagnet from "./components/LeadMagnet";
import DailyBriefing from "../components/DailyBriefing";
import HeroSearch from "../components/HeroSearch";
import SocialProof from "../components/SocialProof";
import HowItWorks from "../components/HowItWorks";
import MiniPricing from "../components/MiniPricing";

// 30초마다 데이터 갱신 (ISR)
export const revalidate = 0;

export default async function Home() {
  // 1. Fetch reports from Supabase
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reports:", JSON.stringify(error, null, 2));
  }

  // Determine Unique Tickers from DB
  const uniqueTickers = Array.from(new Set((reports || []).map(r => r.ticker)));

  // Fetch Latest Daily Market Summary
  const { data: globalSummaries } = await supabase
    .from('market_summaries')
    .select('*')
    .order('date', { ascending: false })
    .limit(1);

  const dailySummary = globalSummaries && globalSummaries.length > 0 ? globalSummaries[0] : null;

  // 2. Fetch Live Quotes from Yahoo Finance Native API for Dynamic Output
  let quotesData: any[] = [];
  if (uniqueTickers.length > 0) {
    try {
      const fetchPromises = uniqueTickers.map(async (ticker) => {
        // Handle crypto edge-cases gracefully if needed
        const queryTicker = ticker === "LNK" ? "LINK-USD" : ticker;
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}?interval=1d&range=1d`;

        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } });
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (meta) {
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose;
            const changePercent = ((price - previousClose) / previousClose) * 100;
            return { symbol: ticker, price, changePercent };
          }
        } catch (e) {
          console.error(`Failed to fetch ${ticker}`, e);
        }
        return { symbol: ticker, price: 0, changePercent: 0 };
      });

      quotesData = await Promise.all(fetchPromises);
    } catch (err) {
      console.error("Error fetching live quotes:", err);
    }
  }

  // Merge the fetched data with our dynamic watchlist details
  const trendingStocks = uniqueTickers.map(ticker => {
    const liveData = quotesData.find(q => q.symbol === ticker);
    return {
      ticker: ticker,
      name: ticker, // Fallback name to Ticker string
      price: liveData?.price || 0,
      changePercent: liveData?.changePercent || 0
    };
  });

  // Sort by daily return rate descending, but keep NVDA at the top
  trendingStocks.sort((a, b) => {
    if (a.ticker === 'NVDA') return -1;
    if (b.ticker === 'NVDA') return 1;
    return b.changePercent - a.changePercent;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 mt-10 p-4 font-mono text-gray-100">
      {/* Grand Hero Section */}
      <section className="text-center space-y-4 mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          AI-Powered Deep Stock Analysis
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Generate Wall Street-level fundamental and technical analysis in just 10 seconds.
        </p>

        <HeroSearch />

        <div className="flex flex-wrap justify-center gap-4 mt-12 px-2">
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500 flex items-center shadow-lg shadow-black/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            SYSTEM ONLINE
          </span>
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500 shadow-lg shadow-black/50">
            {reports?.length || 0} REPORTS FILED
          </span>
        </div>
      </section>

      {/* Daily Briefing (FREE CONTENT) */}
      <DailyBriefing summary={dailySummary} />

      {/* Trending Stocks Grid (New Dashboard Section) */}
      <section className="mb-20">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
          🔥 Trending Companies
        </h3>
        {trendingStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingStocks.map((stock) => (
              <StockCard
                key={stock.ticker}
                ticker={stock.ticker}
                name={stock.name}
                price={stock.price}
                changePercent={stock.changePercent}
                isFreeSample={stock.ticker === 'NVDA'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border border-zinc-800 rounded-xl bg-black/50 text-zinc-500 font-mono text-sm">
            NO AVAILABLE COMPANIES DETECTED IN DATABASE.
          </div>
        )}
      </section>

      {/* Social Proof & Track Record */}
      <SocialProof />

      {/* Product Education */}
      <HowItWorks />

      {/* Final Pricing Anchor */}
      <MiniPricing />

      {/* Lead Magnet Section */}
      <section className="mb-20">
        <LeadMagnet />
      </section>

    </div>
  );
}