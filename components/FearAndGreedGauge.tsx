"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// react-gauge-component must be dynamically imported with ssr: false if it relies on window
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

export default function FearAndGreedGauge({ score, rating }: { score: number, rating: string }) {
  // Map CNN score (0-100) to gauge
  const numScore = score || 50;
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#111] border border-[#333] rounded-2xl shadow-2xl h-full w-full hover:border-zinc-700 transition-colors relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1 h-full bg-orange-500"></div>
      
      <h3 className="text-xl font-black text-white mb-2 tracking-tight">Market Sentiment</h3>
      <div className="text-zinc-500 text-xs font-mono mb-4">CNN FEAR & GREED INDEX</div>

      <div className="w-full max-w-[280px]">
        <GaugeComponent
            type="semicircle"
            arc={{
              colorArray: ['#EA4228', '#F5CD19', '#5BE12C'],
              padding: 0.02,
              width: 0.15
            }}
            pointer={{
              type: "blob",
              animationDelay: 0
            }}
            value={numScore}
            minValue={0}
            maxValue={100}
            labels={{
                valueLabel: { style: { fill: '#fff', textShadow: 'none' } },
                tickLabels: {
                    type: "outer",
                    ticks: [
                        { value: 25 }, { value: 50 }, { value: 75 }
                    ]
                }
            }}
        />
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-black uppercase tracking-wider" style={{ color: numScore < 40 ? '#EA4228' : numScore > 60 ? '#5BE12C' : '#F5CD19'}}>{rating}</div>
      </div>
    </div>
  );
}
