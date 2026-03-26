import React from "react";
import { Filter, Download, Activity, DollarSign, TrendingUp, AlertTriangle, ExternalLink, Globe } from "lucide-react";

async function fetchLiveNews(query: string = "merger acquisition", count: number = 8) {
    try {
        const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=${count}`, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 60 }
        });
        const data = await res.json();
        return data.news || [];
    } catch (e) {
        console.error("YF News Error", e);
        return [];
    }
}

async function fetchMarketIndex(symbol: string) {
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 60 }
        });
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;
        
        const price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose;
        const change = price - prev;
        const changePct = (change / prev) * 100;
        return { price, change, changePct };
    } catch (e) {
        return null;
    }
}

export default async function DealsDashboard() {
    // 1. Fetch Real Live Market Indices
    const [sp500, nasdaq, dji, vix] = await Promise.all([
        fetchMarketIndex('^GSPC'),
        fetchMarketIndex('^IXIC'),
        fetchMarketIndex('^DJI'),
        fetchMarketIndex('^VIX')
    ]);

    // 2. Fetch Real Live News for Tables
    // For Deals: We search for global mergers, acquisitions, and buyouts.
    const dealsNews = await fetchLiveNews("merger acquisition buyout stock", 10);
    // For Filings/Alerts: We search for SEC filings, earnings, and financial reports.
    const marketUpdates = await fetchLiveNews("SEC filing earnings report guidance", 15);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
            
            {/* Dashboard Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Market Intelligence
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest mt-1">
                            LIVE YAHOO FINANCE DATA 📡
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time Global M&A Intelligence, Market Indices, and Earnings updates.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded text-sm text-white font-medium hover:bg-blue-500 transition-colors shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]">
                        <Download className="w-3.5 h-3.5" /> Export Data
                    </button>
                </div>
            </div>

            {/* Top Metrics Cards - Real Live Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard 
                    title="S&P 500" 
                    value={sp500?.price ? sp500.price.toFixed(2) : "Loading..."} 
                    change={sp500?.changePct ? `${sp500.change > 0 ? '+' : ''}${sp500.changePct.toFixed(2)}%` : "N/A"} 
                    icon={<Activity className="w-5 h-5 text-emerald-400" />} 
                />
                <MetricCard 
                    title="NASDAQ Composite" 
                    value={nasdaq?.price ? nasdaq.price.toFixed(2) : "Loading..."} 
                    change={nasdaq?.changePct ? `${nasdaq.change > 0 ? '+' : ''}${nasdaq.changePct.toFixed(2)}%` : "N/A"} 
                    icon={<TrendingUp className="w-5 h-5 text-blue-400" />} 
                />
                <MetricCard 
                    title="Dow Jones Ind." 
                    value={dji?.price ? dji.price.toFixed(2) : "Loading..."} 
                    change={dji?.changePct ? `${dji.change > 0 ? '+' : ''}${dji.changePct.toFixed(2)}%` : "N/A"} 
                    icon={<DollarSign className="w-5 h-5 text-amber-400" />} 
                />
                <MetricCard 
                    title="CBOE Volatility (VIX)" 
                    value={vix?.price ? vix.price.toFixed(2) : "Loading..."} 
                    change={vix?.changePct ? `${vix.change > 0 ? '+' : ''}${vix.changePct.toFixed(2)}%` : "N/A"} 
                    icon={<AlertTriangle className="w-5 h-5 text-rose-400" />} 
                    reverseColors={true} // VIX up is bad (red)
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Data Table Area (2/3 width) */}
                <div id="deals-section" className="lg:col-span-2 space-y-6 scroll-mt-20">
                    <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#111827]">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-400" /> Real-time M&A and Market News
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">Powered by Yahoo Finance</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0B0F19] text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Time (UTC)</th>
                                        <th className="px-5 py-3 font-medium">Headline</th>
                                        <th className="px-5 py-3 font-medium">Source</th>
                                        <th className="px-5 py-3 font-medium text-right">Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {dealsNews.length === 0 && (
                                        <tr><td colSpan={4} className="text-center p-8 text-slate-500 font-mono text-xs">No live M&A data found...</td></tr>
                                    )}
                                    {dealsNews.map((news: any) => (
                                        <tr key={news.uuid} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-5 py-4 text-slate-400 font-mono text-[11px] w-32">
                                                {new Date(news.providerPublishTime * 1000).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                                            </td>
                                            <td className="px-5 py-4 text-white font-medium group-hover:text-blue-400 transition-colors whitespace-normal break-words max-w-sm leading-tight">
                                                {news.title}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                <span className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                                                    {news.publisher}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <a href={news.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition-colors">
                                                    READ
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Widget (1/3 width) */}
                <div id="filings-section" className="space-y-6 scroll-mt-20">
                    {/* Live Filings Feed */}
                    <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#111827]">
                            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-rose-500 animate-pulse`}></span>
                                Corporate Earnings & Filings
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-800/50 max-h-[660px] overflow-y-auto">
                            {marketUpdates.map((update: any) => (
                                <a key={update.uuid} href={update.link || "#"} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-slate-800/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] text-slate-500 font-mono">{new Date(update.providerPublishTime * 1000).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                                    </div>
                                    <h3 className="text-sm text-slate-200 font-medium group-hover:text-white mb-2 leading-snug">{update.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded bg-slate-800 uppercase">
                                            {update.publisher}
                                        </span>
                                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, icon, reverseColors = false }: { title: string, value: string, change: string, icon: React.ReactNode, reverseColors?: boolean }) {
    const isPositive = change.startsWith('+');
    let changeColorClass = 'text-slate-400';
    if (change !== "N/A") {
        if (reverseColors) {
            changeColorClass = isPositive ? 'text-rose-400' : 'text-emerald-400';
        } else {
            changeColorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
        }
    }
    
    return (
        <div className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                {icon}
            </div>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{title}</h3>
            <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <span className={`text-[11px] font-bold ${changeColorClass}`}>{change}</span>
            </div>
        </div>
    );
}
