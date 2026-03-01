"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSearch() {
    const [ticker, setTicker] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticker.trim()) {
            router.push(`/hub/${ticker.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-8 flex flex-col items-center gap-4">
            <form onSubmit={handleSearch} className="w-full relative shadow-2xl">
                <input
                    type="text"
                    placeholder="Enter Ticker (e.g. AAPL, TSLA, NVDA)"
                    className="w-full bg-[#111] border border-[#333] rounded-full py-4 pl-6 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-lg uppercase"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    maxLength={6}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-black p-2 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center w-12"
                >
                    <Search className="w-5 h-5 font-bold" />
                </button>
            </form>
            <p className="text-zinc-500 text-sm mt-0 mb-2">* Note: Currently only companies listed in the Trending Companies board below are available for search.</p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto px-4 sm:px-0">
                <button
                    onClick={() => router.push('/hub/NVDA')}
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgb(0,0,0,39%)] text-white transition-all hover:-translate-y-0.5"
                >
                    🎁 VIEW NVDA FULL ANALYSIS
                </button>
                {/* Unlock All Reports button restored but hidden */}
                <button
                    onClick={() => router.push('/pricing')}
                    className="hidden w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black px-6 py-2.5 rounded-full text-sm font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-0.5"
                >
                    🚀 UNLOCK ALL REPORTS
                </button>
            </div>
        </div>
    );
}
