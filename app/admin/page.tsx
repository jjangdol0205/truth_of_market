"use client";

import { useState, useEffect } from "react";
import { Search, Upload, AlertTriangle, Loader2, Trash2, Database, ShieldAlert, Folder, FolderOpen, ChevronRight, FileText, TrendingUp, Calendar, Users, Star, UserCircle, BadgeCheck, MessageSquare, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analyzeTicker, autoGenerateBriefing } from "../actions";
import TerminalLoader from "../components/TerminalLoader";
import { createClient } from "../../utils/supabase/client";

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    const [ticker, setTicker] = useState("");
    const [reportType, setReportType] = useState<"research" | "earnings">("research");
    const [quarter, setQuarter] = useState("Q4 2025");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    // For Daily Briefing Editor
    const [briefings, setBriefings] = useState<any[]>([]);
    const [fetchingBriefings, setFetchingBriefings] = useState(true);
    const [editingBriefingId, setEditingBriefingId] = useState<any>(null);
    const [briefingTitle, setBriefingTitle] = useState("");
    const [briefingContent, setBriefingContent] = useState("");
    const [briefingDate, setBriefingDate] = useState(new Date().toISOString().split('T')[0]);
    const [publishingBriefing, setPublishingBriefing] = useState(false);
    const [generatingBriefing, setGeneratingBriefing] = useState(false);

    // For reports list
    const [reports, setReports] = useState<any[]>([]);
    const [fetchingReports, setFetchingReports] = useState(true);
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

    // For user management
    const [profiles, setProfiles] = useState<any[]>([]);
    const [fetchingProfiles, setFetchingProfiles] = useState(true);

    // For company requests
    const [companyRequests, setCompanyRequests] = useState<any[]>([]);
    const [fetchingRequests, setFetchingRequests] = useState(true);

    const toggleFolder = (t: string) => {
        setOpenFolders(prev => ({ ...prev, [t]: !prev[t] }));
    };

    const fetchReports = async () => {
        setFetchingReports(true);
        const { data, error } = await supabase
            .from('reports')
            .select('id, ticker, risk_score, created_at, report_type, quarter')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReports(data);
        }
        setFetchingReports(false);
    };

    const fetchBriefings = async () => {
        setFetchingBriefings(true);
        const { data, error } = await supabase
            .from('market_summaries')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBriefings(data);
        }
        setFetchingBriefings(false);
    };

    useEffect(() => {
        // Enforce Admin Security
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const email = session?.user?.email;

            if (email === "beable9489@gmail.com") {
                setIsAuthorized(true);
                fetchReports();
                fetchBriefings();

                // Fetch Users
                setFetchingProfiles(true);
                try {
                    const res = await fetch('/api/admin/users');
                    const data = await res.json();
                    if (data.users) setProfiles(data.users);
                } catch (e) {
                    console.error("Failed to fetch users");
                }
                setFetchingProfiles(false);

                // Fetch Company Requests
                setFetchingRequests(true);
                try {
                    const { data: reqData } = await supabase
                        .from('company_requests')
                        .select('id, company_name, ticker, status, created_at')
                        .order('created_at', { ascending: false });
                    if (reqData) setCompanyRequests(reqData);
                } catch (e) {
                    console.error("Failed to fetch company requests", e);
                }
                setFetchingRequests(false);
            } else {
                setIsAuthorized(false);
                setTimeout(() => {
                    router.push("/");
                }, 1500); // Small delay to let them read the "Access Denied" message
            }
        };

        checkAuth();
    }, [router]);

    // Don't render the dashboard until auth is resolved completely
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-emerald-500">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-black text-rose-500 space-y-4">
                <ShieldAlert className="w-20 h-20" />
                <h1 className="text-4xl font-black uppercase tracking-widest">Access Denied</h1>
                <p className="text-zinc-400">Your email address is not authorized for server-level access.</p>
                <p className="text-zinc-600 text-sm animate-pulse">Redirecting to public zone...</p>
            </div>
        );
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this report?")) return;

        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchReports(); // Refresh the list
        } else {
            console.error("Failed to delete report", error);
            alert("삭제 실패 (Delete failed): \nSupabase Row Level Security (RLS) 정책 때문일 가능성이 높습니다. Supabase 대시보드에서 'reports' 테이블의 Delete 권한 정책을 허용하거나 RLS를 활성화/수정해주세요.");
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!confirm("Are you sure you want to delete this company request?")) return;

        const { error } = await supabase
            .from('company_requests')
            .delete()
            .eq('id', id);

        if (!error) {
            setCompanyRequests(prev => prev.filter(r => r.id !== id));
        } else {
            console.error("Failed to delete request", error);
            alert("삭제 실패: 권한 문제일 수 있습니다. (SQL Editor에서 추가한 Delete Policy 실행 필요)");
        }
    };

    const handleAnalyze = async () => {
        if (!ticker) return;
        if (reportType === "earnings" && !quarter) {
            alert("Please enter a specific quarter (e.g. Q4 2025) for earnings reports.");
            return;
        }

        setLoading(true);
        setResult(""); // Reset result

        try {
            const aiResponse = await analyzeTicker(ticker, reportType, quarter);

            if (aiResponse.startsWith("Error:")) {
                setResult(aiResponse);
            } else {
                setResult(aiResponse + "\n\n[System] Saved to DB ✅");
                fetchReports(); // Refresh the list after successful creation
            }
        } catch (e) {
            setResult("Error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handlePublishBriefing = async () => {
        if (!briefingTitle || !briefingContent) {
            alert("Title and content are required.");
            return;
        }
        setPublishingBriefing(true);
        let error;

        if (editingBriefingId) {
            const { error: updateError } = await supabase
                .from('market_summaries')
                .update({
                    title: briefingTitle,
                    content: briefingContent,
                    date: briefingDate,
                })
                .eq('id', editingBriefingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('market_summaries').insert([
                {
                    title: briefingTitle,
                    content: briefingContent,
                    date: briefingDate,
                }
            ]);
            error = insertError;
        }

        if (error) {
            alert((editingBriefingId ? "Failed to update briefing. " : "Failed to publish briefing. ") + "It might be due to RLS policies. " + error.message);
        } else {
            alert(editingBriefingId ? "Daily Market Briefing updated successfully!" : "Daily Market Briefing published successfully!");
            setBriefingTitle("");
            setBriefingContent("");
            setEditingBriefingId(null);
            fetchBriefings();
        }
        setPublishingBriefing(false);
    };

    const handleDeleteBriefing = async (id: any) => {
        if (!confirm("Are you sure you want to delete this briefing?")) return;

        const { error } = await supabase
            .from('market_summaries')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchBriefings();
            if (editingBriefingId === id) {
                setBriefingTitle("");
                setBriefingContent("");
                setEditingBriefingId(null);
            }
        } else {
            console.error("Failed to delete briefing", error);
            alert("삭제 실패: RLS 정책 등을 확인하세요.");
        }
    };

    const handleAutoGenerateBriefing = async () => {
        setGeneratingBriefing(true);
        try {
            const result = await autoGenerateBriefing();
            if (result.error) {
                alert("Failed to generate: " + result.error);
            } else if (result.title && result.content) {
                setBriefingTitle(result.title);
                setBriefingContent(result.content);
            }
        } catch (e: any) {
            alert("An error occurred during generation.");
        } finally {
            setGeneratingBriefing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 space-y-8 p-4 font-sans text-gray-100 mb-20">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-3xl font-bold text-[#00FF41]">ADMIN_DASHBOARD</h1>
                <span className="bg-gray-800 text-xs px-2 py-1 rounded border border-gray-600">INTERNAL ONLY</span>
            </div>

            {/* Main Action Section: Generator */}
            <div className="bg-[#111] p-6 border border-[#333] rounded-xl space-y-6 shadow-2xl">
                <h2 className="text-xl font-bold flex items-center text-white">
                    <Upload className="w-5 h-5 mr-2 text-[#00FF41]" />
                    Initialize New Analysis
                </h2>

                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    <span className="text-zinc-500 font-mono text-xs flex items-center mr-2">RECOMMENDED:</span>
                    {["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "PLTR", "SOUN", "SMCI"].map(t => (
                        <button key={t} onClick={() => setTicker(t)} className="px-2.5 py-1 bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 hover:border-emerald-500/50 border border-transparent text-xs text-zinc-300 rounded font-mono transition-all">
                            {t}
                        </button>
                    ))}
                </div>

                {/* Report Type Toggle */}
                <div className="flex bg-black rounded-lg p-1 border border-[#333] w-fit">
                    <button
                        onClick={() => setReportType("research")}
                        className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${reportType === "research" ? "bg-[#00FF41] text-black" : "text-zinc-500 hover:text-white"}`}
                    >
                        Deep Research
                    </button>
                    <button
                        onClick={() => setReportType("earnings")}
                        className={`px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all ${reportType === "earnings" ? "bg-amber-400 text-black" : "text-zinc-500 hover:text-white"}`}
                    >
                        Earnings & Guidance
                    </button>
                </div>

                <div className="flex gap-4 flex-wrap md:flex-nowrap">
                    <input
                        type="text"
                        placeholder="Enter Ticker (e.g. TSLA, NVDA)"
                        className="flex-1 min-w-[200px] w-full bg-black border border-[#333] p-4 rounded-lg text-white focus:border-emerald-500 outline-none font-mono uppercase transition-all"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />

                    {/* Conditional Quarter Dropdown */}
                    {reportType === "earnings" && (
                        <select
                            className="w-full md:w-64 bg-black border border-[#333] p-4 rounded-lg text-amber-400 focus:border-amber-400 outline-none font-mono uppercase transition-all animate-in slide-in-from-left-2 duration-300 appearance-none cursor-pointer"
                            value={quarter}
                            onChange={(e) => setQuarter(e.target.value)}
                        >
                            {[
                                "Q4 2025",
                                "Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026",
                                "Q1 2027", "Q2 2027", "Q3 2027", "Q4 2027"
                            ].map(q => (
                                <option key={q} value={q}>{q}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`w-full md:w-auto text-black font-bold px-8 py-4 rounded-lg disabled:opacity-50 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap ${reportType === "research" ? "bg-[#00FF41] hover:bg-green-400" : "bg-amber-400 hover:bg-amber-300"}`}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <Search className="w-5 h-5 mr-2" />}
                        {loading ? "PROCESSING..." : "GENERATE"}
                    </button>
                </div>
            </div>

            {/* AI Output Terminal */}
            <div className={`bg-black border border-[#333] rounded-xl p-6 transition-all duration-500 font-mono text-sm shadow-inner shadow-gray-900 ${loading || result ? 'block opacity-100 min-h-[300px]' : 'hidden opacity-0 h-0 pointer-events-none'}`}>
                <div className="text-gray-500 border-b border-[#333] pb-3 mb-4 flex justify-between tracking-widest text-xs font-bold">
                    <span>AI_VERDICT_OUTPUT</span>
                    <span className={`text-[#00FF41] ${loading ? 'animate-pulse' : ''}`}>{loading ? "● LIVE" : "● READY"}</span>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <TerminalLoader />
                    </div>
                ) : result.startsWith("Error") ? (
                    <div className="text-red-400 whitespace-pre-line bg-red-950/20 p-4 border border-red-900 rounded">{result}</div>
                ) : result ? (
                    <div className="w-full">
                        <div className="p-4 bg-[#111] border border-[#333] rounded mb-4">
                            <h3 className="text-[#00FF41] font-bold mb-4">ANALYSIS PREVIEW</h3>
                            {(() => {
                                try {
                                    const analysisStr = result.split("\\n\\n[System]")[0]; // remove saved tag before parse
                                    const analysis = JSON.parse(analysisStr);
                                    return (
                                        <div className="space-y-6 text-sm font-mono">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-wrap">
                                                <div className="p-4 border border-[#333] rounded bg-black">
                                                    <strong className="block text-gray-500 mb-2">CEO CLAIM</strong>
                                                    <span className="text-gray-300 leading-relaxed">&quot;{analysis.ceo_claim}&quot;</span>
                                                </div>
                                                <div className="p-4 border border-[#333] rounded bg-black">
                                                    <strong className="block text-[#00FF41] mb-2">REALITY</strong>
                                                    <span className="text-white leading-relaxed">{analysis.reality_check}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-700 p-4 rounded gap-4">
                                                <span>VERDICT: <strong className={analysis.verdict === 'SELL' ? 'text-red-500' : 'text-[#00FF41]'}>{analysis.verdict}</strong></span>
                                                <span>RISK SCORE: <strong className="text-white">{analysis.investment_score?.total || analysis.risk_score}</strong></span>
                                            </div>
                                            <div className="text-gray-400 italic p-4 border-l-2 border-emerald-900 bg-emerald-950/10">
                                                &quot;{analysis.executive_summary || analysis.one_line_summary}&quot;
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    return <div className="whitespace-pre-line text-gray-200">{result}</div>;
                                }
                            })()}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Daily Market Briefing Editor */}
            <div id="briefing-editor" className="bg-[#111] p-6 border border-[#333] rounded-xl space-y-6 shadow-2xl mt-12 scroll-mt-24">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <FileText className="w-5 h-5 mr-2 text-emerald-500" />
                        {editingBriefingId ? "Edit Daily Market Briefing" : "Create Daily Market Briefing"}
                    </h2>
                    <button
                        onClick={handleAutoGenerateBriefing}
                        disabled={generatingBriefing}
                        className="bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all disabled:opacity-50"
                    >
                        {generatingBriefing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {generatingBriefing ? "GENERATING..." : "AUTO GENERATE"}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-widest block">Briefing Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Market Rallies After Earnings Surprises..."
                                className="w-full bg-black border border-[#333] p-3 rounded-lg text-white focus:border-emerald-500 outline-none transition-all"
                                value={briefingTitle}
                                onChange={(e) => setBriefingTitle(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48 space-y-2">
                            <label className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-widest block">Date</label>
                            <input
                                type="date"
                                className="w-full bg-black border border-[#333] p-3 rounded-lg text-white focus:border-emerald-500 outline-none transition-all font-mono"
                                value={briefingDate}
                                onChange={(e) => setBriefingDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-widest block">Markdown Content</label>
                        <textarea
                            placeholder="Write your briefing content here... Use markdown for formatting (**bold**, - bullets, etc.)"
                            className="w-full h-64 bg-black border border-[#333] p-4 rounded-lg text-zinc-300 focus:border-emerald-500 outline-none transition-all font-sans leading-relaxed resize-y"
                            value={briefingContent}
                            onChange={(e) => setBriefingContent(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        {editingBriefingId && (
                            <button
                                onClick={() => {
                                    setBriefingTitle("");
                                    setBriefingContent("");
                                    setEditingBriefingId(null);
                                    setBriefingDate(new Date().toISOString().split('T')[0]);
                                }}
                                className="text-zinc-400 font-bold px-8 py-3 rounded-lg flex items-center transition-all bg-zinc-900 border border-zinc-700 hover:text-white"
                            >
                                CANCEL
                            </button>
                        )}
                        <button
                            onClick={handlePublishBriefing}
                            disabled={publishingBriefing}
                            className="text-black font-bold px-8 py-3 rounded-lg flex items-center transition-all bg-[#00FF41] hover:bg-green-400 disabled:opacity-50"
                        >
                            {publishingBriefing ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : <Upload className="w-5 h-5 mr-2" />}
                            {editingBriefingId ? "UPDATE BRIEFING" : "PUBLISH BRIEFING"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Published Briefings List */}
            <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-2xl mt-12 mb-12">
                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <FileText className="w-5 h-5 mr-3 text-emerald-500" />
                        Published Briefings
                    </h2>
                    <span className="text-zinc-500 font-mono text-sm">{briefings.length} Briefings</span>
                </div>
                <div className="bg-[#09090b]">
                    {fetchingBriefings ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            Loading briefings...
                        </div>
                    ) : briefings.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-4 opacity-50 text-emerald-500" />
                            No briefings found.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {briefings.map((b) => (
                                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors gap-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-white font-bold">{b.title}</h3>
                                        <span className="text-zinc-500 font-mono text-xs mt-1">
                                            {b.date || new Date(b.created_at).toISOString().split('T')[0]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setBriefingTitle(b.title);
                                                setBriefingContent(b.content);
                                                setBriefingDate(b.date || new Date(b.created_at).toISOString().split('T')[0]);
                                                setEditingBriefingId(b.id);
                                                window.location.hash = '#briefing-editor';
                                            }}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 text-xs text-zinc-300 rounded font-bold transition-all border border-zinc-700 hover:border-emerald-500/50"
                                        >
                                            EDIT
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBriefing(b.id)}
                                            className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                                            title="Delete Briefing"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Archive Management Table -> Folder Tree Overhaul */}
            <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-2xl mt-12 mb-20">
                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <Database className="w-5 h-5 mr-3 text-emerald-500" />
                        Report Archive Database
                    </h2>
                    <span className="text-zinc-500 font-mono text-sm">{reports.length} Total Records</span>
                </div>

                <div className="bg-[#09090b]">
                    {fetchingReports ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            Loading database records...
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-4 opacity-50 text-rose-500" />
                            No reports found in the archive.
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/50">
                            {(() => {
                                // Group reports by ticker
                                const grouped = reports.reduce((acc, r) => {
                                    const t = r.ticker;
                                    if (!acc[t]) acc[t] = { research: [], earnings: [] };
                                    if (r.report_type === "earnings") acc[t].earnings.push(r);
                                    else acc[t].research.push(r);
                                    return acc;
                                }, {} as Record<string, { research: any[], earnings: any[] }>);

                                return Object.keys(grouped).map(ticker => {
                                    const isOpen = !!openFolders[ticker];
                                    const folderData = grouped[ticker];
                                    const totalCount = folderData.research.length + folderData.earnings.length;

                                    return (
                                        <div key={ticker} className="flex flex-col">
                                            {/* Folder Header */}
                                            <button
                                                onClick={() => toggleFolder(ticker)}
                                                className="flex items-center justify-between p-5 hover:bg-zinc-900 transition-colors w-full text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-90 text-emerald-500" : ""}`} />
                                                    {isOpen ? <FolderOpen className="w-6 h-6 text-emerald-400" /> : <Folder className="w-6 h-6 text-emerald-500/70" />}
                                                    <span className="text-xl font-black text-white">{ticker} <span className="text-zinc-500 font-normal text-sm ml-2 font-mono">WORKSPACE</span></span>
                                                </div>
                                                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 font-mono text-xs font-bold rounded-full">
                                                    {totalCount} ITEMS
                                                </span>
                                            </button>

                                            {/* Folder Contents (Tree Branches) */}
                                            {isOpen && (
                                                <div className="bg-[#0f0f12] pl-[52px] border-t border-zinc-900">
                                                    {/* Category: Deep Research */}
                                                    {folderData.research.length > 0 && (
                                                        <div className="py-4 border-l border-zinc-800 ml-3 pl-6 relative">
                                                            <div className="absolute top-8 -left-px w-4 h-px bg-zinc-800"></div>
                                                            <h4 className="flex items-center gap-2 text-zinc-400 font-bold text-sm tracking-widest uppercase mb-4">
                                                                <FileText className="w-4 h-4 text-zinc-500" /> Deep Research Scans
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {folderData.research.map((r: any) => (
                                                                    <div key={r.id} className="flex items-center justify-between p-3 bg-black border border-zinc-800 rounded-lg hover:border-emerald-500/50 group transition-all mr-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <span className={`px-2 py-1 flex items-center justify-center font-mono font-bold text-xs rounded border ${r.risk_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : r.risk_score <= 40 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                                                                                {r.risk_score} SCORE
                                                                            </span>
                                                                            <span className="text-zinc-300 font-mono text-xs flex items-center gap-2">
                                                                                <Calendar className="w-3 h-3 text-zinc-600" />
                                                                                {new Date(r.created_at).toISOString().split('T')[0]}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                            <Link href={`/report/${r.id}`} className="text-xs font-bold px-3 py-1.5 bg-zinc-800 hover:bg-emerald-900/50 hover:text-emerald-400 rounded text-zinc-300 transition-colors">
                                                                                VIEW
                                                                            </Link>
                                                                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors">
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Category: Earnings */}
                                                    {folderData.earnings.length > 0 && (
                                                        <div className="py-4 border-l border-zinc-800 ml-3 pl-6 relative">
                                                            <div className="absolute top-8 -left-px w-4 h-px bg-zinc-800"></div>
                                                            <h4 className="flex items-center gap-2 text-amber-500/70 font-bold text-sm tracking-widest uppercase mb-4">
                                                                <TrendingUp className="w-4 h-4 text-amber-500/50" /> Earnings & Guidance
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {folderData.earnings.map((r: any) => (
                                                                    <div key={r.id} className="flex items-center justify-between p-3 bg-black border border-zinc-800 rounded-lg hover:border-amber-500/50 group transition-all mr-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <span className="px-2 py-1 flex items-center justify-center font-mono font-bold text-xs rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                                                                                {r.quarter || "N/A"}
                                                                            </span>
                                                                            <span className="text-zinc-500 font-mono text-xs">
                                                                                ID: {r.id}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors">
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Company Requests Database */}
            <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-2xl mb-12">
                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <MessageSquare className="w-5 h-5 mr-3 text-blue-500" />
                        User Company Requests
                    </h2>
                    <span className="text-zinc-500 font-mono text-sm">{companyRequests.length} Requests</span>
                </div>

                <div className="bg-[#09090b]">
                    {fetchingRequests ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            Loading requests...
                        </div>
                    ) : companyRequests.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <CheckCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                            No incoming requests at the moment.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#18181b] border-b border-[#333]">
                                    <tr>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Company Name</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Ticker</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Status</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Requested On</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {companyRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4 text-white font-bold">{req.company_name}</td>
                                            <td className="px-6 py-4 font-mono text-zinc-400">{req.ticker || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider">
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-zinc-500 font-mono text-xs">
                                                    {new Date(req.created_at).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteRequest(req.id)} className="p-1.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Delete Request">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* User Management Database */}
            <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-2xl mb-20">
                <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <Users className="w-5 h-5 mr-3 text-amber-500" />
                        User Management & Subscriptions
                    </h2>
                    <span className="text-zinc-500 font-mono text-sm">{profiles.length} Registered Users</span>
                </div>

                <div className="bg-[#09090b]">
                    {fetchingProfiles ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                            Loading user profiles...
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <UserCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                            No user records found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#18181b] border-b border-[#333]">
                                    <tr>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">User Email</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Status</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold">Subscription ID</th>
                                        <th className="px-6 py-4 font-mono text-zinc-500 uppercase tracking-widest text-xs font-bold text-right">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {profiles.map((user) => (
                                        <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                                            <td className="px-6 py-4 text-white flex items-center gap-3">
                                                <UserCircle className={`w-5 h-5 ${user.is_pro ? 'text-amber-500' : 'text-zinc-500'}`} />
                                                <span className="font-bold">{user.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.is_pro ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-xs uppercase tracking-wider">
                                                        <Star className="w-3 h-3 fill-amber-400" /> Pro Member
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                                                        Free Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-zinc-500 font-mono text-xs">{user.subscription_id || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-zinc-400 font-mono text-xs border border-zinc-800 bg-black px-2 py-1 rounded">
                                                    {new Date(user.created_at).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pt-8 pb-12">
                <Link href="/" className="text-zinc-500 hover:text-[#00FF41] hover:underline font-mono text-sm transition-colors">
                    &larr; Return to Public Dashboard
                </Link>
            </div>
        </div>
    );
}