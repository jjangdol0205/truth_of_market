"use client";
import Link from "next/link";
import React from "react";
import CompanyLogo from "./CompanyLogo";

interface StockCardProps {
    ticker: string;
    name: string;
    price: string | number;
    changePercent: number;
    isFreeSample?: boolean;
}

export default function StockCard({ ticker, name, price, changePercent, isFreeSample }: StockCardProps) {
    const isPositive = changePercent >= 0;
    const colorClass = isPositive ? "text-emerald-400" : "text-rose-400";
    const sign = isPositive ? "+" : "";

    return (
        <Link href={`/hub/${ticker}`}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:scale-105 transition-transform duration-300 hover:border-zinc-600 cursor-pointer shadow-lg flex justify-between items-center group">
                <div className="flex items-center gap-4">
                    <CompanyLogo
                        ticker={ticker}
                        className="w-12 h-12 rounded-full object-contain bg-white p-1 shrink-0"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-amber-400 transition-colors">
                                {name}
                            </h3>
                            {isFreeSample && (
                                <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-widest animate-pulse whitespace-nowrap">
                                    Free Sample
                                </span>
                            )}
                        </div>
                        <p className="text-zinc-500 font-mono text-sm">{ticker}</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-mono text-xl font-bold text-white">{typeof price === 'number' ? `$${price.toFixed(2)}` : price}</p>
                    <p className={`font-mono text-sm font-medium ${colorClass}`}>
                        {sign}{typeof changePercent === 'number' ? changePercent.toFixed(2) : changePercent}%
                    </p>
                </div>
            </div>
        </Link>
    );
}
