import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 mb-20">
            <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
            <div className="prose prose-invert max-w-none text-zinc-300">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Truth of Market, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h2>2. Not Financial Advice</h2>
                <p className="font-bold text-rose-400">The content provided on Truth of Market, including all reports, metrics, and analyses, is for informational and educational purposes only. It should not be construed as financial advice, investment advice, trading advice, or any other sort of advice.</p>
                <p>You should not make any decision, financial, investment, trading or otherwise, based on any of the information presented on this website without undertaking independent due diligence and consultation with a professional broker or financial advisory.</p>

                <h2>3. Accuracy of Information</h2>
                <p>While we strive to provide accurate and up-to-date data, we make no warranties regarding the accuracy, reliability, or completeness of the information on our website. The markets are volatile, and information can become outdated quickly.</p>

                <h2>4. Intellectual Property</h2>
                <p>All content, features, and functionality on the website are the exclusive property of Truth of Market and its licensors.</p>

                <h2>5. Limitation of Liability</h2>
                <p>In no event shall Truth of Market, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

                <h2>6. Changes to Terms</h2>
                <p>We reserve the right to modify or replace these Terms at any time. Continued use of the website after any such changes shall constitute your consent to such changes.</p>

                <h2>7. Contact</h2>
                <p>If you have any questions about these Terms, please <Link href="/contact" className="text-emerald-500 hover:underline">contact us</Link>.</p>
            </div>
        </div>
    );
}
