"use client";

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ValuationChart({ historicalPE, forwardPE, ticker }: { historicalPE: any[], forwardPE: number | null, ticker: string }) {
  const data = useMemo(() => {
    return (historicalPE || []).map(row => ({
      date: typeof row.date === 'string' ? row.date.substring(5) : row.date,
      pe: row.trailing_pe
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [historicalPE]);
  
  if (data.length === 0) return null;

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📊</span> Valuation Check
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-1">1-YEAR TRAILING P/E BANDS</p>
        </div>
        {forwardPE && (
          <div className="text-right">
             <div className="text-xs text-blue-400 font-mono">FWD P/E</div>
             <div className="text-2xl font-black text-white">{forwardPE.toFixed(1)}</div>
          </div>
        )}
      </div>

      <div className="h-[250px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
               itemStyle={{ color: '#60a5fa' }}
            />
            <Area type="monotone" dataKey="pe" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPE)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
