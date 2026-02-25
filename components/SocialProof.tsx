import { TrendingUp, Award, Users } from "lucide-react";

export default function SocialProof() {
    return (
        <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">87.4%</div>
                        <div className="text-xs text-zinc-500 font-mono">WIN RATE (Q3 2025)</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">10M+</div>
                        <div className="text-xs text-zinc-500 font-mono">DATA POINTS SCANNED</div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-white">4,200+</div>
                        <div className="text-xs text-zinc-500 font-mono">ACTIVE PRO TRADERS</div>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🎯</span> Recent AI Masterpieces
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#09090b] border border-zinc-800 p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">PLTR</span>
                            <span className="bg-emerald-500/20 text-emerald-500 text-xs px-2 py-1 rounded font-bold">BUY RATED</span>
                        </div>
                        <span className="text-emerald-500 font-mono font-bold">+18.4%</span>
                    </div>
                    <p className="text-sm text-zinc-400 italic">"Detected massive dark pool accumulation 48 hours before the DoD contract leak. Retail was completely blind to the inflow."</p>
                    <div className="mt-4 text-xs text-zinc-600 font-mono">Generated: 3 days ago</div>
                </div>

                <div className="bg-[#09090b] border border-zinc-800 p-6 rounded-xl hover:border-rose-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-white">LULU</span>
                            <span className="bg-rose-500/20 text-rose-500 text-xs px-2 py-1 rounded font-bold">SELL RATED</span>
                        </div>
                        <span className="text-rose-500 font-mono font-bold">-12.1%</span>
                    </div>
                    <p className="text-sm text-zinc-400 italic">"Flagged severe inventory backlog in the 10-Q footnotes that the CEO attempted to gloss over during the earnings call."</p>
                    <div className="mt-4 text-xs text-zinc-600 font-mono">Generated: 1 week ago</div>
                </div>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-6">* Past performance is not indicative of future results. Not financial advice.</p>
        </section>
    );
}
