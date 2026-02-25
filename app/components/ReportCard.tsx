"use client";

import { useState } from "react";
import InvestmentGauge from "./InvestmentGauge";
import ReactMarkdown from 'react-markdown';
import TradingViewWidget from "../../components/TradingViewWidget";
import FinancialTable from "./FinancialTable";

interface ReportCardProps {
    report: {
        id: number;
        ticker: string;
        investment_score?: number;
        risk_score?: number;
        verdict: string;
        one_line_summary: string;
        created_at: string;
        bull_case_summary?: string;
        bear_case_summary?: string;
        ceo_claim?: string;
        reality_check?: string;
        detailed_report?: string;
        financial_table?: any;
        analysis_text?: string;
    };
}

export default function ReportCard({ report }: ReportCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [isScoreOpen, setIsScoreOpen] = useState(false);
    const score = report.investment_score ?? report.risk_score ?? 50;

    let scoreBreakdown: any[] = [];

    // First, try extracting from the detailed_report HTML comment
    if (report.detailed_report) {
        const match = report.detailed_report.match(/<!--\s*SCORE_BREAKDOWN:\s*(\{[\s\S]*?\})\s*-->/);
        if (match && match[1]) {
            try {
                const parsed = JSON.parse(match[1]);
                if (parsed && parsed.breakdown) {
                    scoreBreakdown = parsed.breakdown;
                }
            } catch (e) {
                console.error("Failed to parse SCORE_BREAKDOWN", e);
            }
        }
    }

    // Fallback: parse analysis_text directly if comment regex fails
    let parsedAnalysis: any = {};
    if (report.analysis_text) {
        try {
            parsedAnalysis = typeof report.analysis_text === 'string' ? JSON.parse(report.analysis_text) : report.analysis_text;
            if (scoreBreakdown.length === 0 && parsedAnalysis?.investment_score?.breakdown) {
                scoreBreakdown = parsedAnalysis.investment_score.breakdown;
            }
        } catch (e) {
            console.error("Failed to parse analysis_text", e);
        }
    }

    const bullCase = report.bull_case_summary || parsedAnalysis?.bull_case_summary || report.ceo_claim || parsedAnalysis?.ceo_claim || "No data available.";
    const bearCase = report.bear_case_summary || parsedAnalysis?.bear_case_summary || report.reality_check || parsedAnalysis?.reality_check || "No data available.";

    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl font-sans mb-8 transition-all hover:border-[#3f3f46]">
            {/* Header: Ticker & Badges */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#27272a]">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white tracking-tight">{report.ticker}</span>
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        {new Date(report.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-full tracking-wide ${report.verdict === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    report.verdict === 'SELL' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                    {report.verdict}
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Top Left: Investment Gauge (Span 4) */}
                <div
                    className="md:col-span-4 bg-[#09090b] rounded-xl border border-[#27272a] p-6 flex flex-col items-center justify-center relative min-h-[200px] cursor-pointer hover:border-[#3f3f46] transition-colors group"
                    onClick={() => setIsScoreOpen(true)}
                >
                    <InvestmentGauge score={score} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                        View Breakdown ↗
                    </div>
                </div>

                {/* Score Modal Overlay */}
                {isScoreOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-xl shadow-2xl relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsScoreOpen(false); }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-white mb-6">Investment Score Breakdown</h3>

                            {scoreBreakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {scoreBreakdown.map((item, idx) => (
                                        <div key={idx} className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-zinc-200">{item.category}</h4>
                                                <span className={`font-mono font-bold ${item.score >= (item.max_score * 0.7) ? 'text-emerald-500' : item.score <= (item.max_score * 0.4) ? 'text-rose-500' : 'text-yellow-500'}`}>
                                                    {item.score} <span className="text-zinc-500 text-sm">/ {item.max_score}</span>
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${item.score >= (item.max_score * 0.7) ? 'bg-emerald-500' : item.score <= (item.max_score * 0.4) ? 'bg-rose-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${(item.score / item.max_score) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                {item.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    No breakdown data available for this report.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Top Right: Analyst Summary (Span 8) */}
                <div className="md:col-span-8 bg-[#09090b] rounded-xl border border-[#27272a] p-6 flex flex-col justify-center">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Analyst Verdict</h4>
                    <p className="text-zinc-100 text-lg font-medium leading-relaxed">
                        {report.one_line_summary}
                    </p>
                </div>

                {/* 3. Middle: Chart (Span 12) */}
                <div className="md:col-span-12 h-[350px] bg-[#09090b] rounded-xl border border-[#27272a] overflow-hidden relative">
                    <TradingViewWidget ticker={report.ticker} />
                </div>

                {/* 4. Bottom Split: Bull vs Bear (Span 6 each) */}
                <div className="md:col-span-6 bg-[#09090b] rounded-xl border border-emerald-900/30 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></div>
                    <h4 className="text-emerald-500 font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        THE BULL CASE
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {bullCase}
                    </p>
                </div>

                <div className="md:col-span-6 bg-[#09090b] rounded-xl border border-rose-900/30 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent opacity-50"></div>
                    <h4 className="text-rose-500 font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        THE BEAR CASE
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {bearCase}
                    </p>
                </div>

                {/* 5. Financials (Span 12) */}
                {report.financial_table && (
                    <div className="md:col-span-12">
                        <FinancialTable data={report.financial_table} />
                    </div>
                )}

            </div>

        </div >
    );
}
