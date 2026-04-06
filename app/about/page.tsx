import { Shield, BrainCircuit, LineChart, Globe, Scale, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 mb-20">
            {/* Background Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

            <div className="max-w-4xl w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-12">
                
                {/* Header */}
                <div className="space-y-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-800">
                        About Truth of Market
                    </h1>
                    <p className="text-xl md:text-2xl text-emerald-400 font-mono tracking-widest uppercase font-bold">
                        Uncovering Reality in a Noisy Market
                    </p>
                </div>

                {/* Our Philosophy & Story */}
                <div className="space-y-12">
                    <section className="bg-black/40 border border-[#333] p-8 md:p-12 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden group hover:border-[#00FF41]/50 transition-colors duration-500">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00FF41] to-emerald-900 group-hover:w-2 transition-all duration-300"></div>
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-3">
                            <Scale className="text-emerald-400" /> Our Founding Philosophy
                        </h2>
                        <div className="space-y-6 text-lg text-zinc-300 leading-relaxed font-light">
                            <p>
                                The financial markets today are flooded with noise. Between clickbait headlines, emotional social media sentiment, and opaque institutional moves, the average investor is left navigating a maze of misinformation. <strong>Truth of Market</strong> was born out of a stark realization: the retail market needs a source of truth that is completely devoid of human bias, emotion, and hidden agendas.
                            </p>
                            <p>
                                We believe that market data shouldn't be a privilege reserved for Wall Street's elite. Our mission is to democratize institutional-grade forensic analysis, bringing the unvarnished reality of global equities directly to you. We don't sell narratives; we expose the math.
                            </p>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 border border-[#333] p-8 md:p-12 rounded-3xl relative overflow-hidden">
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-3">
                            <Users className="text-emerald-400" /> Who is Responsible?
                        </h2>
                        <div className="space-y-6 text-lg text-zinc-300 leading-relaxed font-light">
                            <p>
                                While <strong>Truth of Market</strong> leverages cutting-edge Artificial Intelligence to process millions of data points, read SEC filings, and calculate forward trajectories, <strong>the ultimate responsibility lies with human experts.</strong>
                            </p>
                            <p>
                                Our platform is meticulously engineered, maintained, and rigorously audited by a dedicated team of financial software developers and quantitative analysts. AI is our engine, but humans steer the ship. We take full responsibility for the data aggregation pipelines, the integrity of the algorithms, and the ethical presentation of our findings. We constantly tune our models to prevent hallucinations and ensure that our "Investment Risk Scores" strictly reflect empirical reality.
                            </p>
                        </div>
                    </section>

                    <section className="bg-zinc-900/40 border border-[#333] p-8 md:p-12 rounded-3xl relative overflow-hidden">
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-3">
                            <Globe className="text-emerald-400" /> Our Commitment to Transparency
                        </h2>
                        <div className="space-y-6 text-lg text-zinc-300 leading-relaxed font-light">
                            <p>
                                Trust is earned, never given. At Truth of Market, our commitment is absolute transparency. Our analytical models are transparent about what they see: be it trailing P/E anomalies, excessive corporate insider selling, or bearish technical patterns. We do not offer personalized financial advice; we offer an objective lens.
                            </p>
                            <p>
                                Every brief, every market overview, and every risk score is generated to empower you to make your own informed decisions. We stand behind our system as an analytical tool, and we welcome scrutiny, feedback, and open dialogue from our community.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <BrainCircuit className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">AI Precision</h3>
                        <p className="text-sm text-zinc-500">Emotionless multi-model analysis extracting hidden alpha from unstructured market noise.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <LineChart className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">Smart Money</h3>
                        <p className="text-sm text-zinc-500">Advanced technical tracking of institutional accumulation and distribution phases.</p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <Shield className="w-8 h-8 text-[#00FF41] mb-4" />
                        <h3 className="text-white font-bold mb-2 font-mono uppercase tracking-wider">Risk Assesment</h3>
                        <p className="text-sm text-zinc-500">Rigorous scoring matrix weighing fundamental health against current valuation.</p>
                    </div>
                </div>

                {/* Contact Section for extra AdSense Trust */}
                <div className="text-center pt-8 border-t border-zinc-800">
                    <p className="text-zinc-400 mb-4 font-mono text-sm">Have questions about our methodology or want to get in touch?</p>
                    <Link href="/contact" className="inline-block bg-zinc-800 text-white font-mono px-6 py-3 rounded-lg text-sm border border-zinc-700 hover:bg-zinc-700 transition-colors">
                        Contact Our Team
                    </Link>
                </div>
            </div>
        </div>
    );
}
