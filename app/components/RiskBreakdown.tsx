import React from 'react';

interface ComponentProps {
    breakdown: {
        divergence: number;
        solvency: number;
        insider: number;
        valuation: number;
    };
    isPro?: boolean;
}

const RiskBreakdown: React.FC<ComponentProps> = ({ breakdown, isPro = false }) => {
    if (!breakdown) return null;

    const maxScores = {
        divergence: 40,
        solvency: 30,
        insider: 20,
        valuation: 10
    };

    const getColor = (score: number, max: number) => {
        const ratio = score / max;
        if (ratio > 0.7) return "bg-red-500"; // High Risk
        if (ratio > 0.3) return "bg-yellow-500"; // Medium Risk
        return "bg-[#00FF41]"; // Low Risk
    };

    return (
        <div className="relative mt-4 font-mono text-xs">
            {!isPro && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[4px] rounded-lg">
                    <a href="/pricing" className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-white hover:bg-zinc-800 transition-colors">
                        <span className="text-emerald-500">🔒</span> PRO 모델로 리스크 점수 보기
                    </a>
                </div>
            )}

            <div className="space-y-3">
                {Object.entries(breakdown).map(([key, score]) => {
                    const max = maxScores[key as keyof typeof maxScores] || 100;
                    const color = getColor(score, max);
                    const width = `${(score / max) * 100}%`;

                    return (
                        <div key={key}>
                            <div className="flex justify-between mb-1 text-gray-400 uppercase">
                                <span>{key} Analysis</span>
                                <span className={score > max / 2 ? 'text-red-400' : 'text-gray-400'}>
                                    {isPro ? `${score} / ${max}` : `?? / ${max}`}
                                </span>
                            </div>
                            <div className="w-full bg-[#111] h-2 rounded overflow-hidden border border-[#333]">
                                <div
                                    className={`h-full ${isPro ? color : 'bg-zinc-700'} transition-all duration-1000`}
                                    style={{ width: isPro ? width : '50%' }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RiskBreakdown;
