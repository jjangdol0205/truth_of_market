import Link from 'next/link';

interface ScreenerStock {
  ticker: string;
  forward_pe: number;
  current_price: number;
}

export default function ValuationScreener({ stocks }: { stocks: ScreenerStock[] }) {
  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 h-full hover:border-zinc-700 transition-colors shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
      
      <h3 className="text-xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
        <span>💎</span> Undervalued Picks
      </h3>
      <p className="text-xs text-zinc-500 mb-6 font-mono uppercase">Lowest Forward P/E Radar</p>
      
      <div className="space-y-3">
        {stocks.map((stock, i) => (
          <div key={stock.ticker} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-800 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-zinc-600 font-mono text-xs">#{i + 1}</span>
              <div>
                <div className="text-white font-bold">{stock.ticker}</div>
                <div className="text-zinc-500 text-xs">${stock.current_price}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-purple-400 font-mono font-bold text-sm">P/E {stock.forward_pe.toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
