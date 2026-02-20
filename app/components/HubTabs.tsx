"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FileText, TrendingUp, Calendar, ChevronDown, CheckCircle, XCircle, BrainCircuit, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface HubTabsProps {
    ticker: string;
    reports: any[];
}

export default function HubTabs({ ticker, reports }: HubTabsProps) {
    const [activeTab, setActiveTab] = useState<"archive" | "earnings">("archive");
    const [openQuarter, setOpenQuarter] = useState<string>("Q3 2024");
    const [openReport, setOpenReport] = useState<number | null>(null);

    const activeReports = reports || [];
    const researchReports = activeReports.filter(r => !r.report_type || r.report_type === "research");
    const earningsReports = activeReports.filter(r => r.report_type === "earnings");

    // We can remove the mock data since we are now mapping actual `earningsReports`

    return (
        <div className="w-full mt-12 bg-black/40 border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
            {/* Tab Navigation */}
            <div className="flex border-b border-[#333] bg-[#09090b]">
                <button
                    onClick={() => setActiveTab("archive")}
                    className={`flex-1 p-5 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === "archive" ? "bg-zinc-900 text-[#00FF41] border-b-2 border-[#00FF41]" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"}`}
                >
                    <FileText className="w-5 h-5" />
                    Deep Research Archive
                </button>
                <button
                    onClick={() => setActiveTab("earnings")}
                    className={`flex-1 p-5 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === "earnings" ? "bg-zinc-900 text-[#00FF41] border-b-2 border-[#00FF41]" : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"}`}
                >
                    <TrendingUp className="w-5 h-5" />
                    Earnings & Guidance
                </button>
            </div>

            {/* Tab Content Area */}
            <div className="p-6 md:p-10 bg-[#111]">
                {/* -------------------- TAB A: ARCHIVE -------------------- */}
                {activeTab === "archive" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-white">Historical AI Reports</h3>
                            <span className="text-zinc-500 font-mono text-sm">{researchReports.length} Records</span>
                        </div>

                        {researchReports.length === 0 ? (
                            <div className="p-12 text-center border border-zinc-800 border-dashed rounded-xl bg-black/50">
                                <p className="text-zinc-500 font-mono">No analysis records found for {ticker} in the database.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {researchReports.map((report) => {
                                    const score = report.risk_score;
                                    const isGood = score >= 80;
                                    const isBad = score <= 40;
                                    const isOpen = openReport === report.id;

                                    let cleanMarkdown = report.detailed_report || '';
                                    cleanMarkdown = cleanMarkdown.replace(/<!--[\s\S]*?-->/g, '');

                                    return (
                                        <Link key={report.id} href={`/report/${report.id}`} className="block border border-zinc-800 rounded-xl overflow-hidden bg-black transition-all hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] group">
                                            <div className="w-full text-left bg-zinc-900/40 group-hover:bg-zinc-800/80 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Calendar className="w-4 h-4 text-emerald-500/50" />
                                                        <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">
                                                            REPORT #{report.id} • {new Date(report.created_at).toISOString().split('T')[0]}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                                                        Deep Research: {report.ticker} Architecture
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs text-zinc-500 mb-1 font-mono uppercase tracking-widest">Verdict</p>
                                                        <p className={`font-black font-mono tracking-widest ${report.verdict === 'BUY' ? 'text-emerald-400' : report.verdict === 'SELL' ? 'text-rose-500' : 'text-yellow-500'}`}>
                                                            {report.verdict || "HOLD"}
                                                        </p>
                                                    </div>
                                                    <div className={`p-4 rounded-lg border flex flex-col items-center justify-center min-w-[90px] ${isGood ? 'bg-emerald-950/30 border-emerald-500/30' : isBad ? 'bg-rose-950/30 border-rose-500/30' : 'bg-yellow-950/30 border-yellow-500/30'}`}>
                                                        <span className={`text-2xl font-black font-mono leading-none ${isGood ? 'text-emerald-400' : isBad ? 'text-rose-500' : 'text-yellow-500'}`}>{score}</span>
                                                        <span className="text-[10px] text-zinc-500 uppercase mt-1 font-bold">Score</span>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* -------------------- TAB B: EARNINGS -------------------- */}
                {activeTab === "earnings" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-white">Earnings Timeline <span className="text-sm font-medium text-emerald-500 ml-2 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">Live DB Data</span></h3>
                            <span className="text-zinc-500 font-mono text-sm">{earningsReports.length} Records</span>
                        </div>

                        {earningsReports.length === 0 ? (
                            <div className="p-12 text-center border border-zinc-800 border-dashed rounded-xl bg-black/50">
                                <p className="text-zinc-500 font-mono">No earnings reports generated for {ticker} yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {earningsReports.map((report) => {
                                    let parsed = {} as any;
                                    try {
                                        if (report.analysis_text) {
                                            parsed = JSON.parse(report.analysis_text);
                                        }
                                    } catch (e) {
                                        return null;
                                    }

                                    const quarterLabel = report.quarter || "N/A";
                                    const isOpen = openQuarter === quarterLabel;

                                    // Parse numeric values safely
                                    const epsAct = parseFloat(String(parsed.actual_eps || 0));
                                    const epsEst = parseFloat(String(parsed.est_eps || 0));
                                    const epsBeat = epsAct >= epsEst;

                                    // Revenue beats are harder to parse safely if they include letters like 'B', fallback to simple string comparison if nan
                                    const revActStr = String(parsed.actual_rev || "");
                                    const revEstStr = String(parsed.est_rev || "");

                                    const parseNumeric = (str: string) => parseFloat(str.replace(/[^0-9.-]/g, ''));
                                    const revActNum = parseNumeric(revActStr);
                                    const revEstNum = parseNumeric(revEstStr);

                                    // Default to string match if parsing yields NaN, otherwise compare numerically
                                    const revBeat = (!isNaN(revActNum) && !isNaN(revEstNum))
                                        ? revActNum >= revEstNum
                                        : revActStr >= revEstStr; // Basic fallback

                                    return (
                                        <div key={report.id} className="border border-zinc-800 rounded-xl overflow-hidden bg-black transition-all">
                                            {/* Accordion Header */}
                                            <button
                                                onClick={() => setOpenQuarter(isOpen ? "" : quarterLabel)}
                                                className="w-full p-6 flex items-center justify-between bg-zinc-900 border-b border-zinc-800/0 hover:bg-zinc-800 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <h4 className="text-xl font-black text-white">{quarterLabel}</h4>
                                                    <div className="flex gap-2">
                                                        {epsBeat && revBeat ? (
                                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-wider">Double Beat</span>
                                                        ) : !epsBeat && !revBeat ? (
                                                            <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold uppercase tracking-wider">Double Miss</span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs font-bold uppercase tracking-wider">Mixed</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            {/* Accordion Body */}
                                            {isOpen && (
                                                <div className="p-6 bg-[#0a0a0a] border-t border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                                    {/* Wall Street Metrics */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                                        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center justify-between">
                                                                EPS Actual
                                                                {epsBeat ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                                                            </p>
                                                            <p className={`text-2xl font-mono font-bold ${epsBeat ? 'text-emerald-400' : 'text-rose-400'}`}>${epsAct.toFixed(2)}</p>
                                                            <p className="text-xs text-zinc-600 mt-1">Est: ${epsEst.toFixed(2)}</p>
                                                        </div>
                                                        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                                            <p className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center justify-between">
                                                                Rev Actual
                                                                {revBeat ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-rose-500" />}
                                                            </p>
                                                            <p className={`text-2xl font-mono font-bold ${revBeat ? 'text-emerald-400' : 'text-rose-400'}`}>{revActStr.includes('$') ? '' : '$'}{revActStr}</p>
                                                            <p className="text-xs text-zinc-600 mt-1">Est: {revEstStr}</p>
                                                        </div>
                                                    </div>

                                                    {/* Forward Guidance & AI Interpretation */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Forward Guidance</h5>
                                                            <p className="text-zinc-400 text-sm leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 border-l-4 border-l-blue-500 italic">
                                                                &quot;{parsed.guidance_summary}&quot;
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                <BrainCircuit className="w-4 h-4" />
                                                                AI Interpretation
                                                            </h5>
                                                            <p className="text-emerald-100 text-sm leading-relaxed bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50 relative overflow-hidden flex flex-col justify-between h-full">
                                                                <span className="relative z-10">{parsed.ai_interpretation}</span>
                                                                <span className="relative z-10 w-fit mt-4 px-2 py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase rounded">
                                                                    AI VERDICT: {parsed.verdict || report.verdict}
                                                                </span>
                                                                <span className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
