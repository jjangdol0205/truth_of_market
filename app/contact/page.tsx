import React from 'react';

export default function Contact() {
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 mb-20 text-center">
            <h1 className="text-4xl font-black mb-8">Contact Us</h1>
            <p className="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto">
                Have a question, feedback, or need support? We&apos;d love to hear from you.
                Our team usually responds within 24-48 business hours.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 inline-block shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-emerald-400">Email Support</h2>
                <p className="text-zinc-400 font-mono text-xl mb-4">
                    support@truthofmarket.com
                </p>
                <p className="text-sm text-zinc-500">
                    (Or reply directly to any of our newsletter emails)
                </p>
            </div>
        </div>
    );
}
