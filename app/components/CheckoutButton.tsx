"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import AuthModal from "./AuthModal";

export default function CheckoutButton() {
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setEmail(session?.user?.email ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setEmail(session?.user?.email ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubscribeClick = () => {
        if (!email) {
            setIsAuthModalOpen(true);
            return;
        }

        // Redirect to Pricing Page for user to select a plan
        window.location.href = "/pricing";
    };

    return (
        <>
            <button
                onClick={handleSubscribeClick}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 flex items-center justify-center group active:scale-95 disabled:opacity-75"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Now"}
                {!loading && <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />}
            </button>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
