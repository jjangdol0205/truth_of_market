import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import ScoreGauge from "../../../components/ScoreGauge";
import TradingViewWidget from "../../../components/TradingViewWidget";
import CheckoutButton from "../../components/CheckoutButton";
import { createClient } from "../../../utils/supabase/server";
import ShareButtons from "../../components/ShareButtons";
import LeadMagnet from "../../components/LeadMagnet";
import CompanyLogo from "../../../components/CompanyLogo";

// Force dynamic rendering since we are fetching data that changes
export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch report from Supabase
    const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Extract JSON Breakdown from markdown if it exists
    let scoreObj = { total: report.risk_score, breakdown: [] };
    let cleanMarkdown = report.detailed_report || '';

    if (cleanMarkdown.includes('<!-- SCORE_BREAKDOWN:')) {
        const match = cleanMarkdown.match(/<!--\s*SCORE_BREAKDOWN:\s*(\{[\s\S]*?\})\s*-->/);
        if (match && match[1]) {
            try {
                scoreObj = JSON.parse(match[1]);
            } catch (e) {
                console.error("Failed to parse SCORE_BREAKDOWN", e);
            }
        }
    }

    // Remove all HTML comments completely from the markdown to prevent any leaks
    cleanMarkdown = cleanMarkdown.replace(/<!--[\s\S]*?-->/g, '');

    // Determine color based on risk_score (acts as investment score)
    let scoreColor = "text-gray-400";
    if (scoreObj.total >= 80) scoreColor = "text-[#00FF41]"; // High score is good/buy
    else if (scoreObj.total <= 30) scoreColor = "text-red-500"; // Low score is bad/sell

    // Check if the current user is the admin to bypass the paywall
    const supabaseServer = await createClient();
    const { data: { session } } = await supabaseServer.auth.getSession();
    const isAdmin = session?.user?.email === "beable9489@gmail.com";

    // Query profiles table for matching user
    let isDbPro = false;
    if (session?.user?.id) {
        const { data: profile } = await supabaseServer
            .from('profiles')
            .select('is_pro')
            .eq('id', session.user.id)
            .single();
        if (profile?.is_pro) isDbPro = true;
    }

    // Regular Paywall logic + Admin Bypass + NVDA Free Sample (OVERRIDDEN FOR ADSENSE APPROVAL)
    const isProUser = true;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 space-y-8 mb-20">
            <Link href="/" className="flex items-center text-gray-400 hover:text-white transition group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                BACK TO LIST
            </Link>

            <header className="border-b border-[#333] pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <CompanyLogo
                                ticker={report.ticker}
                                className="w-16 h-16 rounded-full object-contain bg-white p-1 shadow-lg shrink-0"
                            />
                            <h1 className="text-6xl font-black tracking-tighter">
                                {report.ticker === 'TSLA' ? 'TESLA' : report.ticker} <span className="text-4xl text-zinc-600">({report.ticker})</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                            ANALYSIS REPORT #{report.id} • {new Date(report.created_at).toISOString().split('T')[0]}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="inline-block px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md">
                                <p className="text-sm text-zinc-400 mb-1">Verdict</p>
                                <p className={`text-xl font-bold ${report.verdict === 'BUY' ? 'text-[#00FF41]' : report.verdict === 'SELL' ? 'text-red-500' : 'text-yellow-500'}`}>
                                    {report.verdict || "N/A"}
                                </p>
                            </div>

                            {/* Share Buttons (Viral Loop) */}
                            <ShareButtons
                                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://truthofmarket.com'}/report/${report.id}`}
                                title={`${report.ticker} AI Deep Analysis Report | Truth of Market`}
                                description={report.one_line_summary || "Wall street lies exposed."}
                            />
                        </div>
                    </div>
                    {/* Pass isPro to any premium components if added later */}
                    <ScoreGauge scoreObj={scoreObj} scoreColor={scoreColor} />
                </div>
            </header>

            {/* Always Visible: Executive Summary */}
            <section className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-emerald-500 font-mono text-sm mb-4 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    EXECUTIVE SUMMARY
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed font-medium">
                    {report.one_line_summary || "No executive summary available."}
                </p>
            </section>

            {/* Bull vs Bear Split */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#09090b] rounded-xl border border-emerald-900/30 p-6 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></div>
                    <h4 className="text-emerald-500 font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        THE BULL CASE
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {report.bull_case_summary || report.ceo_claim || (() => {
                            try {
                                const parsed = JSON.parse(report.analysis_text);
                                return parsed.bull_case_summary || parsed.ceo_claim;
                            } catch { }
                            return "No data available.";
                        })()}
                    </p>
                </div>

                <div className="bg-[#09090b] rounded-xl border border-rose-900/30 p-6 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent opacity-50"></div>
                    <h4 className="text-rose-500 font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        THE BEAR CASE
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {report.bear_case_summary || report.reality_check || (() => {
                            try {
                                const parsed = JSON.parse(report.analysis_text);
                                return parsed.bear_case_summary || parsed.reality_check;
                            } catch { }
                            return "No data available.";
                        })()}
                    </p>
                </div>
            </section>

            {/* Always Visible: TradingView Chart */}
            <section className="w-full h-[500px] rounded-xl overflow-hidden border border-zinc-800 bg-[#131722] shadow-2xl relative pt-16 pb-4 px-4">
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                    <span className="text-xs text-emerald-400 font-mono">TECHNICAL ANALYSIS: STAGE ANALYSIS</span>
                </div>
                <div className="w-full h-full border border-zinc-900/50 rounded overflow-hidden">
                    <TradingViewWidget ticker={report.ticker} />
                </div>
            </section>

            {/* The Paywall Logic */}
            <section className="mt-12">
                {!isProUser ? (
                    // FREE USER STATE: Render a fake blurred background behind the CTA
                    <div className="relative w-full bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden mt-8">
                        {/* Fake Blurred Content Background */}
                        <div className="absolute inset-0 pointer-events-none select-none blur-[6px] opacity-40 px-10 py-12">
                            <div className="prose prose-invert prose-lg max-w-none">
                                <h1 className="text-gray-200">Deep Research & Institutional Flow Breakdown</h1>
                                <h2>1. Insider Divergence Metrics</h2>
                                <p className="text-gray-400">Our deep analysis indicates severe divergence between institutional block trades and retail volume. Over the past 72 hours, dark pool distribution has surged by 450%, indicating quiet off-loading by smart money.</p>
                                <div className="w-full h-32 bg-zinc-800 rounded-lg animate-pulse my-6"></div>
                                <h2>2. 10Q Financial Irregularities</h2>
                                <p className="text-gray-400">Scanning the latest SEC filings, we found 3 critical red flags regarding inventory turnover and accounts receivable that the CEO deliberately minimized during the latest earnings call...</p>
                                <ul>
                                    <li className="text-gray-400 font-mono text-sm bg-zinc-900 p-2 border border-zinc-800 rounded mt-2">Divergence Alert: Q3 Operating Margins...</li>
                                    <li className="text-gray-400 font-mono text-sm bg-zinc-900 p-2 border border-zinc-800 rounded mt-2">Smart Money Index (SMI): Neutral/Bearish...</li>
                                    <li className="text-gray-400 font-mono text-sm bg-zinc-900 p-2 border border-zinc-800 rounded mt-2">Volume Profile: Heavy resistance at...</li>
                                </ul>
                            </div>
                        </div>

                        {/* Top CTA Overlay */}
                        <div className="relative z-10 w-full flex flex-col items-center justify-center p-12 min-h-[500px] bg-gradient-to-b from-transparent via-[#111]/80 to-[#111]">
                            <div className="bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700 p-10 rounded-2xl max-w-xl text-center shadow-2xl w-full transform transition-all hover:scale-[1.02]">
                                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                                    <Lock className="w-10 h-10 text-black shadow-inner" />
                                </div>

                                <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-orange-400 mb-4 tracking-tight">
                                    🔓 Unlock Premium Analysis
                                </h3>

                                <p className="text-zinc-400 mb-8 text-lg leading-relaxed font-medium">
                                    Subscribe to instantly reveal the hidden institutional flow, 10-step fundamental Breakdown, and 10Q reality checks.<br />
                                    <span className="text-zinc-500 text-sm mt-4 block font-normal flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                        Don't trade blind. See what Wall Street sees.
                                    </span>
                                </p>

                                <Link href="/pricing" className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all text-lg mb-4">
                                    View Pro Plans (From $9.99)
                                </Link>
                                <p className="text-zinc-500 text-xs text-center">Cancel anytime. Instant access guaranteed.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // PRO USER STATE: Render beautiful markdown
                    <div className="bg-[#111] rounded-2xl border border-[#333] p-10 shadow-2xl">
                        <div className="prose prose-invert prose-lg max-w-none prose-headings:mt-10 prose-headings:font-black prose-h1:text-5xl prose-h2:text-4xl prose-p:leading-loose prose-p:text-gray-300 prose-p:mb-8 prose-li:mb-3">
                            {cleanMarkdown ? (
                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>{cleanMarkdown}</ReactMarkdown>
                            ) : (
                                <pre className="font-mono text-gray-300 whitespace-pre-wrap">
                                    {report.analysis_text}
                                </pre>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Newsletter Subscription (Retention Loop) */}
            <section className="mt-20">
                <LeadMagnet />
            </section>
        </div>
    );
}
