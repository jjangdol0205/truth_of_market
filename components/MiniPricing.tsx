import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function MiniPricing() {
    return (
        <section className="mt-24 mb-10">
            <div className="max-w-3xl mx-auto bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Stop Trading Blind.</h3>
                <p className="text-zinc-400 mb-8 max-w-xl mx-auto text-lg">
                    Wall Street institutions spend millions on alternative data. You can get the exact same edge for the price of a coffee.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Cancel Anytime</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Unlimited Reports</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all">
                        Daily Pass ($9.99)
                    </Link>
                    <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105">
                        Get Pro Access (Best Value)
                    </Link>
                </div>
            </div>
        </section>
    );
}
