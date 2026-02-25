import React from 'react';

interface FinancialTableProps {
    data: {
        [key: string]: string;
    };
}

// Helper to format keys like "revenue_trend" -> "Revenue Trend"
const formatKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function FinancialTable({ data, isPro = false }: FinancialTableProps & { isPro?: boolean }) {
    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="relative overflow-x-auto rounded-xl border border-[#27272a]">
            {!isPro && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[6px] rounded-xl">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
                        <div className="mx-auto w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Detailed Financials Locked</h4>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                            이 계좌의 진짜 재무 건전성(Revenue/DCF 트렌드)을 확인하려면 Pro 구독이 필요합니다.
                        </p>
                        <a href="/pricing" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-lg transition-colors">
                            Unlock Analytics ($29.99/mo)
                        </a>
                    </div>
                </div>
            )}

            <table className="w-full text-sm text-left font-mono">
                <thead className="text-xs text-zinc-500 uppercase bg-[#09090b] border-b border-[#27272a]">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-bold tracking-wider">Metric</th>
                        <th scope="col" className="px-6 py-4 font-bold tracking-wider text-right">Value / Trend</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a] bg-[#18181b]">
                    {Object.entries(data).map(([key, value]) => {
                        // Determine color based on content (simple heuristic)
                        const isPositive = typeof value === 'string' && (value.includes('+') || value.toLowerCase().includes('up') || value.toLowerCase().includes('expand'));
                        const isNegative = typeof value === 'string' && (value.includes('-') || value.toLowerCase().includes('down') || value.toLowerCase().includes('contract') || value.toLowerCase().includes('high'));

                        const textColor = isPositive ? 'text-emerald-400' : (isNegative ? 'text-rose-400' : 'text-zinc-300');

                        return (
                            <tr key={key} className="hover:bg-[#27272a] transition-colors">
                                <td className="px-6 py-4 font-medium text-zinc-400">
                                    {formatKey(key)}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${textColor}`}>
                                    {value as React.ReactNode}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
