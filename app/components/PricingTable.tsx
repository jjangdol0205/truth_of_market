"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function PricingTable() {
    const [billingCycle, setBillingCycle] = useState<"daily" | "monthly" | "yearly">("monthly");
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserEmail(session?.user?.email ?? null);
        });
    }, []);

    const plans = {
        daily: {
            title: "Daily Pass",
            price: "$9.99",
            period: "/ day",
            url: "/api/checkout/daily",
            desc: "Full access for 24 hours."
        },
        monthly: {
            title: "Pro Monthly",
            price: "$29.99",
            period: "/ month",
            url: "/api/checkout/monthly",
            desc: "Unrestricted access to Wall Street intelligence."
        },
        yearly: {
            title: "Pro Yearly",
            price: "$299.99",
            period: "/ year",
            url: "/api/checkout/yearly",
            desc: "Best value. Secure your alpha for the entire year."
        }
    };

    const currentPlan = plans[billingCycle];

    let finalCheckoutUrl = currentPlan.url;

    return (
        <div className="flex flex-col items-center">
            {/* Billing Toggle */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-full mb-10 w-fit shrink-0 overflow-x-auto text-sm sm:text-base">
                <button
                    onClick={() => setBillingCycle("daily")}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${billingCycle === "daily" ? "bg-zinc-700 text-white shadow-md" : "text-zinc-500 hover:text-white"}`}
                >
                    Daily
                </button>
                <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${billingCycle === "monthly" ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "text-zinc-500 hover:text-white"}`}
                >
                    Monthly (Save 68%)
                </button>
                <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${billingCycle === "yearly" ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "text-zinc-500 hover:text-white"}`}
                >
                    Yearly (Best Value)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="bg-[#111] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-between shadow-xl">
                    <div className="text-center w-full">
                        <h4 className="text-2xl font-bold text-white mb-2">Basic</h4>
                        <p className="text-zinc-500 text-sm mb-6">Perfect for trying out the AI accuracy.</p>
                        <div className="text-5xl font-black text-white mb-8 flex justify-center items-end">
                            $0 <span className="text-lg text-zinc-600 font-medium ml-2">/ forever</span>
                        </div>

                        <ul className="space-y-4 text-left w-full mb-8">
                            <li className="flex items-center text-zinc-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                                <span><strong>1 Free Deep Research Report</strong></span>
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                                <span>Basic Company Information</span>
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                                <span>Live Price Updates</span>
                            </li>
                            <li className="flex items-center text-zinc-600">
                                <X className="w-5 h-5 text-zinc-700 mr-3 shrink-0" />
                                <span>Unlimited Full Reports</span>
                            </li>
                            <li className="flex items-center text-zinc-600">
                                <X className="w-5 h-5 text-zinc-700 mr-3 shrink-0" />
                                <span>Earnings Breakdown & AI Interpretation</span>
                            </li>
                        </ul>
                    </div>

                    <Link href="#" className="w-full block py-4 px-6 rounded-xl border-2 border-zinc-700 text-white font-bold text-center hover:bg-zinc-800 transition-colors">
                        Sign Up for Free
                    </Link>
                </div>

                {/* Dynamic Pro Plan */}
                <div className="bg-[#09090b] border border-amber-500/50 rounded-3xl p-8 flex flex-col items-center justify-between shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden transition-all">
                    {billingCycle !== "daily" && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                            Most Popular
                        </div>
                    )}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[50px] rounded-full transition-all"></div>

                    <div className="text-center w-full relative z-10 transition-all">
                        <h4 className="text-2xl font-bold text-amber-400 mb-2">{currentPlan.title}</h4>
                        <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">{currentPlan.desc}</p>
                        <div className="text-5xl font-black text-white mb-8 flex justify-center items-end">
                            {currentPlan.price} <span className="text-lg text-zinc-500 font-medium ml-2">{currentPlan.period}</span>
                        </div>

                        <ul className="space-y-4 text-left w-full mb-8">
                            <li className="flex items-center text-zinc-200">
                                <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                                <span><strong>Unlimited Deep Research Reports</strong></span>
                            </li>
                            <li className="flex items-center text-zinc-200">
                                <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                                <span><strong>Earnings & Guidance Analysis</strong></span>
                            </li>
                            <li className="flex items-center text-zinc-200">
                                <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                                <span>Technical Stage Analysis (Smart Money)</span>
                            </li>
                            <li className="flex items-center text-zinc-200">
                                <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                                <span>Direct Email & VIP Telegram Group</span>
                            </li>
                            <li className="flex items-center text-zinc-200">
                                <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                                <span>Cancel anytime</span>
                            </li>
                        </ul>
                    </div>

                    <a href={finalCheckoutUrl} className="w-full relative z-10 block py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-center hover:scale-105 transition-transform shadow-xl shadow-orange-500/20">
                        Unlock Full Access
                    </a>
                </div>
            </div>
        </div>
    );
}
