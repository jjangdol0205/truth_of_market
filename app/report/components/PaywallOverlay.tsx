import Link from "next/link";
import { Lock } from "lucide-react";

export default function PaywallOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-2xl p-6 text-center border border-zinc-800">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-emerald-400">
                <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                Unlock Institutional Data
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
                You've reached the limit of free analysis. Upgrade to Truth of Market Pro to unlock real-time Technical Analysis, Dark Pool money flow, and final verdicts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/pricing" className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-8 py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                    View Pricing Plans
                </Link>
                <Link href="/login" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-4 rounded-xl transition-all whitespace-nowrap">
                    Log in
                </Link>
            </div>
        </div>
    );
}
