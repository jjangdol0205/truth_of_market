import { Shield, Brain, Zap } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="mb-20 pb-10 border-b border-zinc-900">
            <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-white mb-4">How It Works</h3>
                <p className="text-zinc-400">Institutional-grade deep research, simplified by AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-[40px] left-[15%] w-[70%] h-0.5 bg-gradient-to-r from-zinc-800 via-emerald-500/20 to-zinc-800 -z-10"></div>

                {/* Step 1 */}
                <div className="bg-[#09090b] border border-zinc-800 p-8 rounded-2xl text-center relative hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4 font-mono font-bold text-6xl text-zinc-900/50 pointer-events-none">1</div>
                    <h4 className="text-xl font-bold text-white mb-3">Data Harvesting</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        We scan 10,000+ SEC filings, recent 10-Q/10-K forms, insider trading blocks, and real-time Dark Pool volumes that retail investors miss.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-[#09090b] border border-zinc-800 p-8 rounded-2xl text-center relative hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] relative z-10">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4 font-mono font-bold text-6xl text-zinc-900/50 pointer-events-none">2</div>
                    <h4 className="text-xl font-bold text-white mb-3">AI Processing</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Our specialized Wall Street algorithmic persona cross-references the raw fundamental facts against technical chart structures (Elliott Wave, Stage Analysis).
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-[#09090b] border border-zinc-800 p-8 rounded-2xl text-center relative hover:border-emerald-500/50 transition-colors">
                    <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] relative z-10">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div className="absolute top-0 right-0 p-4 font-mono font-bold text-6xl text-zinc-900/50 pointer-events-none">3</div>
                    <h4 className="text-xl font-bold text-white mb-3">Actionable Output</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Receive a brutally honest verdict (BUY/SELL) with explicit Bull & Bear cases stripped of corporate spin, generated in just 10 seconds.
                    </p>
                </div>
            </div>
        </section>
    );
}
