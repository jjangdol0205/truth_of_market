import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Financial Disclaimer | Truth of Market',
  description: 'Important legal information and financial disclaimers regarding the use of Truth of Market data and analysis.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 mb-20">
      <h1 className="text-4xl md:text-5xl font-black mb-8 border-b border-zinc-800 pb-6 text-white">
        Financial <span className="text-rose-500">Disclaimer</span>
      </h1>
      
      <div className="prose prose-invert max-w-none text-zinc-300 prose-headings:text-white prose-headings:font-bold prose-p:leading-relaxed">
        <p className="font-mono text-sm text-zinc-500 mb-8">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-rose-950/20 border border-rose-900/50 p-6 rounded-xl mb-10">
          <h2 className="text-rose-500 mt-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Strictly Educational & Informational
          </h2>
          <p className="text-rose-200/80 mb-0">
            <strong>Truth of Market is NOT a registered investment advisor, broker/dealer, financial analyst, financial bank, securities broker or financial planner.</strong> All content provided on this website, including but not limited to AI-generated risk scores, reports, blogs, and technical analysis, is for informational and educational purposes only.
          </p>
        </div>

        <h2>1. No Investment Advice</h2>
        <p>
          The information contained on Truth of Market (including all reports, data, scores, and articles) does not constitute financial advice, investment advice, trading advice, or any other sort of advice. You should not treat any of the website's content as such. Truth of Market does not recommend that any cryptocurrency, stock, or other financial instrument should be bought, sold, or held by you.
        </p>
        <p>
          Always conduct your own due diligence and consult your financial advisor before making any investment decisions.
        </p>

        <h2>2. Accuracy of Information</h2>
        <p>
          Truth of Market uses Artificial Intelligence and automated data ingestion to compile its reports and risk scores from various third-party sources (e.g., SEC filings, Yahoo Finance, institutional order flow data). While we strive to ensure the information is accurate and up to date, we make no representations, warranties, or guarantees, whether express or implied, that the content on our site is accurate, complete, or current.
        </p>
        <p>
          AI models can "hallucinate" or misinterpret data. Financial data can be delayed. You bear the sole responsibility for verifying any information before relying on it.
        </p>

        <h2>3. High Risk of Trading</h2>
        <p>
          Trading in financial markets, especially equities, options, and cryptocurrencies, is a highly speculative activity that carries a high level of risk. It is possible to lose all of your initial capital. You should only invest money that you can afford to lose. Past performance of any trading system, methodology, or specific asset is not indicative of future results.
        </p>

        <h2>4. Affiliate and Advertising Disclosure</h2>
        <p>
          Truth of Market may contain links to affiliate websites, and we receive an affiliate commission for any purchases made by you on the affiliate website using such links. 
        </p>
        <p>
          We also use third-party advertising services (such as Google AdSense) to serve ads when you visit our website. These companies may use information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you. Truth of Market is not responsible for the content of these advertisements.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          In no event shall Truth of Market, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content.
        </p>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <p>
            By using Truth of Market, you hereby consent to our disclaimer and agree to its terms. If you require any more information or have any questions about our site's disclaimer, please feel free to <Link href="/contact" className="text-emerald-500 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
