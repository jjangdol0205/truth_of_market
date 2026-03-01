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

export default function FinancialTable({ data }: FinancialTableProps) {
    const isPro = true;
    if (!data || Object.keys(data).length === 0) return null;

    return (
        <div className="relative overflow-x-auto rounded-xl border border-[#27272a]">
            {/* Paywall overlay removed */}

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
