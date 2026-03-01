import { Shield, BrainCircuit, LineChart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 mb-20">

            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-800">
                        About MarketTruth
                    </h1>
                    <p className="text-xl md:text-2xl text-emerald-400 font-mono tracking-widest uppercase font-bold">
                        Institutional-Grade Forensic Analysis
                    </p>
                </div>

                {/* Core Message */}
                <div className="bg-black/40 border border-[#333] p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-sm text-left relative overflow-hidden group hover:border-[#00FF41]/50 transition-colors duration-500">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00FF41] to-emerald-900 group-hover:w-2 transition-all duration-300"></div>

                    <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
                        MarketTruth eliminates human bias and emotional trading by providing deep, algorithmic insights into global equities. We analyze fundamentals, technical trends, and institutional momentum to uncover the true value of the market.
                    </p>
                    <p className="mt-6 text-zinc-500 font-mono text-sm leading-relaxed">
                        Built for proprietary traders, hedge funds, and serious retail investors who demand pure data over narrative. Our multi-agent AI framework dissects SEC filings, earnings transcripts, and real-time Tape data to generate a unified <span className="text-emerald-400 font-bold">Investment Risk Score</span>.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                        <BrainCircuit className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">AI Precision</h3>
                        <p className="text-sm text-zinc-500">Emotionless multi-model LLM analysis extracting hidden alpha from unstructured market noise.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                        <LineChart className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">Smart Money</h3>
                        <p className="text-sm text-zinc-500">Advanced technical tracking of institutional accumulation and distribution phases.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors">
                        <Shield className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">Risk Assesment</h3>
                        <p className="text-sm text-zinc-500">Rigorous 0-100 scoring matrix weighing fundamental health against current valuation.</p>
                    </div>
                </div>

                {/* CTA Removed for AdSense */}

            </div>
        </div>
    );
}
