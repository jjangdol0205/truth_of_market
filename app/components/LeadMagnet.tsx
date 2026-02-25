"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function LeadMagnet() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus("error");
            setMessage("Please enter a valid email address.");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'footer_magnet' })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message === 'Already subscribed'
                    ? "You are already subscribed!"
                    : "Successfully subscribed. Check your inbox daily!");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "An error occurred during subscription.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Unable to communicate with the server.");
        }
    };

    return (
        <div className="w-full bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-emerald-400">
                <Mail className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-black text-white tracking-tight mb-3">
                Unlock the <span className="text-emerald-400">Top 10 High-Growth AI Stocks</span> for 2026.
            </h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Enter your email to instantly download our exclusive PDF report. Get the exact fundamental data that Wall Street tries to hide.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-md relative z-10">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        disabled={status === "loading" || status === "success"}
                        className="flex-1 bg-[#111] border border-zinc-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={status === "loading" || status === "success"}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-8 py-4 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        {status === "loading" ? "Sending..." : "Download Free PDF"}
                    </button>
                </div>

                {status === "success" && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 font-medium text-sm animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {message}
                    </div>
                )}
                {status === "error" && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-rose-400 font-medium text-sm animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="w-4 h-4" />
                        {message}
                    </div>
                )}
            </form>

            <p className="text-zinc-600 text-xs mt-6 font-mono">
                * We do not send spam. You can unsubscribe at any time.
            </p>
        </div>
    );
}
