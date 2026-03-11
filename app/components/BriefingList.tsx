"use client";

import { useState } from "react";
import { Calendar, X, FileText, ChevronRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function BriefingList({ briefings }: { briefings: any[] }) {
    const [selectedBriefing, setSelectedBriefing] = useState<any | null>(null);

    // Handle styling for Markdown content matching the emerald/dark theme
    const MarkdownComponents: any = {
        h1: ({ node, ...props }: any) => <h1 className="text-xl md:text-2xl font-bold mt-8 mb-4 tracking-tight text-white" {...props} />,
        h2: ({ node, ...props }: any) => <h2 className="text-lg md:text-xl font-bold text-emerald-400 mt-8 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2" {...props} />,
        h3: ({ node, ...props }: any) => <h3 className="text-base md:text-lg font-bold text-zinc-200 mt-6 mb-3" {...props} />,
        p: ({ node, ...props }: any) => <p className="text-zinc-400 mb-6 leading-relaxed text-[15px] break-keep" {...props} />,
        ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-6 space-y-3 text-zinc-400 marker:text-zinc-600" {...props} />,
        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-6 space-y-3 text-zinc-400 marker:text-zinc-600" {...props} />,
        li: ({ node, ...props }: any) => <li className="pl-1 leading-relaxed" {...props} />,
        strong: ({ node, ...props }: any) => <strong className="font-bold text-white bg-white/5 px-1 rounded" {...props} />,
        blockquote: ({ node, ...props }: any) => (
            <blockquote className="border-l-4 border-emerald-500/50 pl-4 py-1 my-6 italic bg-emerald-500/5 rounded-r-lg" {...props} />
        ),
        a: ({ node, ...props }: any) => <a className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {briefings?.map((briefing) => (
                    <article
                        key={briefing.id}
                        onClick={() => setSelectedBriefing(briefing)}
                        className="bg-[#111] border border-[#333] rounded-3xl p-6 md:p-8 shadow-2xl transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-[#1a1a1f] group flex flex-col h-full relative overflow-hidden"
                    >
                         {/* Card highlight accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <header className="mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                                        {briefing.title || `마켓 브리핑`}
                                    </h2>
                                    <time className="text-zinc-500 text-xs mt-1 block flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(briefing.created_at).toISOString().split('T')[0]}
                                    </time>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 relative overflow-hidden mb-4">
                            <div className="text-zinc-400 text-sm line-clamp-4 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                {/* Strip markdown for preview text easily or just let it raw cut off */}
                                {briefing.content?.replace(/[*#>`_-]/g, '').substring(0, 150)}...
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent group-hover:from-[#1a1a1f] transition-colors" />
                        </div>

                        <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between text-sm font-bold text-emerald-400 group-hover:text-emerald-300">
                            Read Full Briefing
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                    </article>
                ))}
            </div>

            {/* Modal for full reading */}
            {selectedBriefing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 bg-black/80 backdrop-blur-sm">
                    <div
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => setSelectedBriefing(null)}
                    />

                    <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#111113] border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Fixed */}
                        <div className="shrink-0 p-6 border-b border-zinc-800 flex items-center justify-between bg-[#151515]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-inner">
                                    <Calendar className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                        {selectedBriefing.title || `마켓 브리핑`}
                                    </h2>
                                    <time className="text-zinc-500 text-sm mt-0.5 block flex items-center gap-1">
                                        AI Generated Intelligence • {selectedBriefing.date}
                                    </time>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBriefing(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                            <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-p:text-zinc-300">
                                <ReactMarkdown components={MarkdownComponents}>
                                    {selectedBriefing.content || ""}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
