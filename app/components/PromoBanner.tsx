"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function PromoBanner() {
    const [isVisible, setIsVisible] = useState(true);

    // Simple session storage to hide banner if user closed it
    useEffect(() => {
        const hideBanner = sessionStorage.getItem("hidePromoBanner");
        if (hideBanner === "true") {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem("hidePromoBanner", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-black py-2 px-4 flex justify-between items-center relative z-50 overflow-hidden shadow-lg border-b border-emerald-900">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-white/20 w-1/4 skew-x-12 -translate-x-[200%] animate-[shimmer_3s_infinite_ease-in-out]"></div>

            <div className="flex-grow text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm font-bold tracking-tight">
                <span className="flex items-center gap-2">
                    <span className="animate-bounce">🔥</span>
                    LIMITED TIME LAUNCH OFFER:
                </span>
                <span>
                    Save 16% on the Pro Yearly Plan.
                </span>
                <Link href="/pricing" className="underline underline-offset-2 decoration-black/50 hover:text-white transition-colors ml-2 bg-black/10 px-2 py-0.5 rounded">
                    Claim Discount Now &rarr;
                </Link>
            </div>
            <button
                onClick={handleClose}
                className="text-black/70 hover:text-black hover:bg-black/10 p-1 rounded-full transition-colors ml-2 shrink-0"
                aria-label="Close promo banner"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
