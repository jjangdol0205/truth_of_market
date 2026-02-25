"use client";

import { Link as LinkIcon, Twitter, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
    url: string;
    title: string;
    description: string;
}

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const handleTwitterShare = () => {
        const text = encodeURIComponent(`🚨 ${title}\n${description}\n\n#주식 #투자 #TruthOfMarket\n`);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-zinc-500 text-sm font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4" /> SHARE:
            </span>

            <button
                onClick={handleTwitterShare}
                className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
                <Twitter className="w-4 h-4" /> Post on X
            </button>

            <button
                onClick={handleCopy}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
                <LinkIcon className="w-4 h-4" /> {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}
