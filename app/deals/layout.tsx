import React from "react";
import Link from "next/link";
import { Search, Bell, User, ArrowLeft } from "lucide-react";

export default function DealsLayout({ children }: { children: React.ReactNode }) {
    return (
        // Overlays the RootLayout perfectly to simulate an entirely isolated application
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0F19] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
            {/* Top Navigation Bar / Header */}
            <header className="h-14 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Back</span>
                    </Link>
                    <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                    <span className="font-bold text-lg tracking-tight text-blue-400 whitespace-nowrap">
                        Market Intelligence
                    </span>
                </div>
                
                <div className="flex flex-1 max-w-xl mx-8 items-center bg-[#1E293B] rounded-md px-3 border border-slate-700 focus-within:border-blue-500/50 transition-colors hidden md:flex">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search global news, mergers, or SEC filings..." 
                        className="w-full bg-transparent font-sans border-none outline-none text-sm text-slate-200 py-1.5 px-3 placeholder-slate-500" 
                    />
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">⌘K</span>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                    <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider hidden sm:block shadow-sm">
                        🔴 Free Live Stream
                    </span>
                    <button className="hover:text-white transition-colors"><Bell className="w-4 h-4" /></button>
                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800 shadow-sm">
                        <User className="w-3 h-3" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden w-full">
                {/* Main Content Area (Full Width Single Panel) */}
                <main className="flex-1 overflow-y-auto bg-[#0B0F19] scroll-smooth w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
