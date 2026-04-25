import Link from "next/link";
import { TrendingUp, Gift } from "lucide-react";

export default function AffiliateBanner({ ticker }: { ticker?: string }) {
    // In a real scenario, this would be your actual affiliate tracking link
    const affiliateLink = "https://www.webull.com/ko-kr"; 
    const displayTicker = ticker || "Stocks";

    return (
        <div className="w-full bg-gradient-to-r from-[#000000] to-[#1a1a2e] border border-[#2e2e48] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 my-8 group hover:border-[#4a4a75] transition-colors">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>

            <div className="flex items-center gap-6 z-10">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <Gift className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        Trade {displayTicker} with Zero Commission
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">SPONSORED</span>
                    </h4>
                    <p className="text-zinc-400 text-sm">
                        Open an account with Webull today and get up to <strong className="text-white">20 free fractional shares</strong>.
                    </p>
                </div>
            </div>

            <a 
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] whitespace-nowrap flex items-center justify-center gap-2 z-10"
            >
                Claim Free Stock
                <TrendingUp className="w-4 h-4" />
            </a>
        </div>
    );
}
