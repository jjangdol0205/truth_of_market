import Link from 'next/link';
import { Database, BrainCircuit, LineChart, Cpu, Search, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Our AI Methodology | Truth of Market',
  description: 'Learn how our proprietary artificial intelligence models analyze fundamental, technical, and institutional data to generate investment risk scores.',
};

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 mb-20 text-gray-200">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm mb-6">
          PROPRIETARY ALGORITHMS
        </div>
        <h1 className="text-5xl font-black mb-6 tracking-tighter">
          Our <span className="text-emerald-500">Methodology</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Truth of Market does not rely on subjective human opinions or emotional trading. We use a multi-layered artificial intelligence pipeline to process millions of unstructured data points, providing objective, institutional-grade risk analysis.
        </p>
      </div>

      <div className="space-y-16">
        {/* Step 1 */}
        <section className="bg-zinc-900/50 p-8 md:p-12 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-black font-black">1</span>
            Data Aggregation & Ingestion
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed text-lg font-light">
            <p>
              The foundation of our analysis is clean, comprehensive data. Unlike simple stock screeners that only look at trailing P/E ratios, our ingestion engines pull from a vast array of sources:
            </p>
            <ul className="space-y-3 mt-4 text-base font-normal">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>SEC Filings (10-K, 10-Q, 8-K):</strong> We ingest the raw text of corporate disclosures, tracking changes in "Risk Factors" and "Management Discussion & Analysis" quarter over quarter.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Earnings Transcripts:</strong> Natural Language Processing (NLP) is applied to quarterly earnings calls to measure management sentiment, evasiveness, and forward-looking optimism.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Institutional Order Flow:</strong> We analyze historical options chain data, dark pool block trades, and failure-to-deliver (FTD) metrics to gauge "Smart Money" positioning.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Step 2 */}
        <section className="bg-zinc-900/50 p-8 md:p-12 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-black font-black">2</span>
            AI Processing & Sentiment Extraction
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed text-lg font-light">
            <p>
              Once the raw data is ingested, it passes through our custom-trained Large Language Models (LLMs). These models are specifically tuned on a corpus of historical financial crises, accounting frauds, and massive bull runs.
            </p>
            <p>
              The AI does not predict the future; rather, it looks for statistical similarities between the current state of a company and historical precedents. If a CEO uses the exact same defensive language that preceded a 40% drop in a similar company three years ago, our model flags it. We extract both a "Bull Case" and a "Bear Case" based purely on these objective findings, ignoring Wall Street analyst upgrades or downgrades.
            </p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="bg-zinc-900/50 p-8 md:p-12 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <LineChart className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-black font-black">3</span>
            The Investment Risk Score Matrix
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed text-lg font-light">
            <p>
              The final output of our pipeline is the <strong>Truth of Market Risk Score (0-100)</strong>. This score is a weighted composite of several sub-metrics:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-emerald-400 font-bold mb-2">Fundamental Health (40%)</h4>
                <p className="text-sm text-zinc-400">Evaluates Free Cash Flow yield, debt-to-equity ratios, return on invested capital, and margin expansion/contraction.</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-emerald-400 font-bold mb-2">Valuation Reality (30%)</h4>
                <p className="text-sm text-zinc-400">Compares current forward multiples against historical averages and sector peers to identify severe overvaluation or deep value.</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-emerald-400 font-bold mb-2">Institutional Flow (20%)</h4>
                <p className="text-sm text-zinc-400">Measures the divergence between retail sentiment and actual institutional accumulation/distribution.</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-emerald-400 font-bold mb-2">Technical Stage (10%)</h4>
                <p className="text-sm text-zinc-400">Identifies whether the asset is in Stage 1 (Accumulation), Stage 2 (Markup), Stage 3 (Distribution), or Stage 4 (Decline).</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center border-t border-zinc-800 pt-12">
        <h3 className="text-2xl font-bold text-white mb-4">Experience the Truth</h3>
        <p className="text-zinc-400 mb-8">Stop relying on CNBC headlines. Start looking at the raw data.</p>
        <Link href="/" className="inline-block bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors">
          Analyze a Stock Now
        </Link>
      </div>
    </div>
  );
}
