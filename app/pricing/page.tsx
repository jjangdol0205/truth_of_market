import { Check, X } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Pricing | Truth of Market",
    description: "Upgrade to Truth of Market Pro for Wall Street level deep analytics.",
};

export default function PricingPage() {
    return (
        <div className="max-w-6xl mx-auto py-16 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-mono tracking-tight text-white">
                    Institutional Grade Data, <span className="text-emerald-500">Retail Price.</span>
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                    Discover the real fundamental signals Wall Street tries to hide. <br />
                    The most certain investment to protect your portfolio.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {/* Tier 1: Daily */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative">
                    <h3 className="text-xl font-bold text-white mb-2">Daily Pass</h3>
                    <p className="text-zinc-400 text-sm mb-6 h-10">Get unlimited access to deep analysis reports for all stocks for 24 hours.</p>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-white">$9.99</span>
                        <span className="text-zinc-500">/day</span>
                    </div>
                    <Link href="/api/checkout/daily" className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors mb-8">
                        Get 24h Access
                    </Link>
                    <ul className="space-y-4 text-sm text-zinc-300">
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> Real-time Trending Stocks</li>
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> AI Analytics Reports Access</li>
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> Pro Scores (Divergence, Insider, etc.)</li>
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> 10K/10Q Financial Trends</li>
                        <li className="flex gap-3 text-zinc-500"><X className="text-zinc-600 w-5 h-5 shrink-0" /> 10-Step Infographic Downloads (Limit 10/day)</li>
                        <li className="flex gap-3 text-zinc-500"><X className="text-zinc-600 w-5 h-5 shrink-0" /> Watchlist Push Notifications</li>
                    </ul>
                </div>

                {/* Tier 2: Monthly (Highlighted - Decoy Effect) */}
                <div className="bg-black border-2 border-emerald-500 rounded-2xl p-8 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                        MOST POPULAR
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">Pro Monthly</h3>
                    <p className="text-zinc-400 text-sm mb-6 h-10">Perfectly hedge your risk for less than the cost of a coffee, just $1 a day.</p>
                    <div className="mb-6">
                        <span className="text-5xl font-extrabold text-white">$29.99</span>
                        <span className="text-zinc-500">/mo</span>
                    </div>
                    <Link href="/api/checkout/monthly" className="block w-full text-center bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl transition-colors mb-8 shadow-lg shadow-emerald-500/25">
                        Start Pro Monthly
                    </Link>
                    <ul className="space-y-4 text-sm text-zinc-300 font-medium">
                        <li className="flex gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> Real-time Trending Stocks</li>
                        <li className="flex gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> AI Analytics Reports Access</li>
                        <li className="flex gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> Pro Scores (Divergence, Insider, etc.)</li>
                        <li className="flex gap-3"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> 10K/10Q Financial Trends</li>
                        <li className="flex gap-3 font-bold text-white"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> Unlimited 10-Step Infographic Downloads</li>
                        <li className="flex gap-3 font-bold text-white"><Check className="text-emerald-400 w-5 h-5 shrink-0" /> Real-time Watchlist Push Notifications</li>
                    </ul>
                </div>

                {/* Tier 3: Yearly */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative">
                    <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                        Save 16%
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Pro Yearly</h3>
                    <p className="text-zinc-400 text-sm mb-6 h-10">The best choice for long-term investors. Save the cost of 2 months.</p>
                    <div className="mb-6 flex flex-col">
                        <span className="text-zinc-500 line-through text-sm mb-1">$359.88</span>
                        <div>
                            <span className="text-4xl font-extrabold text-white">$299.99</span>
                            <span className="text-zinc-500">/yr</span>
                        </div>
                    </div>
                    <Link href="/api/checkout/yearly" className="block w-full text-center bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-xl transition-colors mb-8">
                        Get Yearly Access
                    </Link>
                    <ul className="space-y-4 text-sm text-zinc-300">
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> <strong>All features of Pro Monthly</strong></li>
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> Bulk PDF Report Downloads</li>
                        <li className="flex gap-3"><Check className="text-emerald-500 w-5 h-5 shrink-0" /> Priority Support</li>
                        <li className="flex gap-3 opacity-0 hidden md:block"><Check className="w-5 h-5 shrink-0" /> Spacer</li>
                        <li className="flex gap-3 opacity-0 hidden md:block"><Check className="w-5 h-5 shrink-0" /> Spacer</li>
                        <li className="flex gap-3 opacity-0 hidden md:block"><Check className="w-5 h-5 shrink-0" /> Spacer</li>
                    </ul>
                </div>

            </div>

            {/* Security & Support Footer */}
            <div className="mt-20 text-center border-t border-zinc-900 pt-10">
                <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                    🔒 Secure payments processed by <strong className="text-zinc-300">Lemon Squeezy</strong>. Cancel anytime.
                </p>
            </div>
        </div>
    );
}
