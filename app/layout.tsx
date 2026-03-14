import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; // Changed font
import "./globals.css";
import TopNav from "./components/TopNav";
import DisableCopy from "@/components/DisableCopy";
import PromoBanner from "./components/PromoBanner";
import Script from "next/script";
import Link from "next/link";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] }); // Initialize font

export const metadata: Metadata = {
  title: "Truth of Market | Wall Street Lies Exposed",
  description: "Data-driven financial analysis powered by AI.",
  verification: {
    google: "KjkX-zWjuxmckvBpxZXF-DSQyDpIWvZPNuV7YrNBxjk",
  },
};

import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="alternate" type="application/rss+xml" title="Truth of Market RSS Feed" href="/rss.xml" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4633321310054654"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vpuatcf091");
          `}
        </Script>
      </head>
      <GoogleTagManager gtmId="GTM-W9538SHJ" />
      <body className={`${jetbrainsMono.className} bg-black text-white antialiased`}>
        <DisableCopy />
        <div className="min-h-screen flex flex-col">
          <div className="hidden">
            <PromoBanner />
          </div>
          {/* Header */}
          <TopNav />

          {/* Main Content */}
          <main className="flex-grow p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-[#333] py-8 text-center bg-[#0a0a0a]">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4">
              <Link href="/privacy" className="text-gray-400 hover:text-emerald-500 transition-colors text-sm font-mono">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-emerald-500 transition-colors text-sm font-mono">Terms of Service</Link>
              <Link href="/contact" className="text-gray-400 hover:text-emerald-500 transition-colors text-sm font-mono">Contact Us</Link>
            </div>
            <p className="text-xs text-zinc-600 font-mono">
              © 2026 Truth of Market. Not Financial Advice.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}