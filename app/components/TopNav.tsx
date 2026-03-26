"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import AuthModal from "./AuthModal";
import RequestCompanyModal from "./RequestCompanyModal";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function TopNav() {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const supabase = createClient();

    const fetchProfile = async (user: User) => {
        if (user.email === "beable9489@gmail.com") {
            setIsPro(true);
            return;
        }
        const { data } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
        setIsPro(!!data?.is_pro);
    };

    useEffect(() => {
        // Automatically open modal if redirected from checkout
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('login') === 'true') {
                setIsAuthModalOpen(true);
            }
        }
    }, []);

    useEffect(() => {
        // Initialize active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchProfile(currentUser);
        });

        // Listen for Auth changes globally
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser);
                setIsAuthModalOpen(false); // Make sure modal closes if logging in via magic link/other windows
            } else {
                setIsPro(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <>
            <header className="border-b border-[#333] py-4 px-6 flex justify-between items-center bg-[#0a0a0a]">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-[#00FF41] hover:opacity-80 transition-opacity">
                        TRUTH_OF_MARKET
                    </Link>
                    <span
                        className="text-xl font-bold text-[#00FF41] animate-pulse cursor-pointer"
                        onDoubleClick={() => setIsAuthModalOpen(true)}
                    >_</span>
                </div>
                <nav className="flex items-center text-sm text-gray-400 font-medium font-mono gap-6">
                    <Link href="/" className="cursor-pointer hover:text-white transition-colors hidden md:inline">HOME</Link>
                    <Link href="/briefings" className="cursor-pointer hover:text-white transition-colors hidden md:inline">BRIEFINGS</Link>
                    <Link href="/pricing" className="cursor-pointer hover:text-white transition-colors hidden">PRICING</Link>
                    <Link href="/about" className="cursor-pointer hover:text-white transition-colors hidden md:inline">ABOUT</Link>
                    <Link href="/deals" className="cursor-pointer text-blue-400 hover:text-blue-300 font-bold transition-colors hidden md:inline">DEALS (BETA)</Link>

                    {/* Hidden Pricing/Pro elements */}
                    <Link href="/pricing" className="hidden bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-4 py-1.5 rounded-full items-center gap-1">
                        <span className="text-lg leading-none">👑</span> UPGRADE TO PRO
                    </Link>

                    <div className="w-px h-4 bg-zinc-700 mx-2 hidden"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-300 hidden sm:inline" title={user.email || ""}>
                                {user.email?.split("@")[0]}
                            </span>
                            {/* Admin Page Link for beable9489@gmail.com */}
                            {user.email === "beable9489@gmail.com" && (
                                <Link href="/admin" className="text-emerald-400 hover:text-emerald-300 font-bold ml-2">
                                    ADMIN DASHBOARD
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-rose-500 hover:bg-rose-500/10 px-3 py-1 rounded">Logout</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="hidden bg-white text-black font-bold px-4 py-1.5 rounded"
                        >
                            Login
                        </button>
                    )}
                </nav>
            </header>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            <RequestCompanyModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
            />
        </>
    );
}
