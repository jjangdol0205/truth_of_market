import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 mb-20">
            <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none text-zinc-300">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Truth of Market. We respect your privacy and are committed to protecting your personal data.</p>

                <h2>2. Information We Collect</h2>
                <p>We may collect data such as your IP address, browser type, and interaction with our website using tools like Google Analytics and server logs.</p>

                <h2>3. Use of Information</h2>
                <p>We use your information to provide and improve our services, and to analyze traffic and user behavior on our platform.</p>

                <h2>4. Third-Party Services & Advertising</h2>
                <p>We use third-party advertising companies, such as Google AdSense, to serve ads when you visit our website. These companies may use aggregated information (not including your name, address, email address or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
                <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.</p>

                <h2>5. Cookies</h2>
                <p>We use cookies to enhance your experience. You can choose to disable cookies through your browser settings.</p>

                <h2>6. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us via our <Link href="/contact" className="text-emerald-500 hover:underline">Contact Page</Link>.</p>
            </div>
        </div>
    );
}
