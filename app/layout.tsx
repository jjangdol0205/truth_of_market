import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google"; // Changed font
import "./globals.css";
import TopNav from "./components/TopNav";
import DisableCopy from "@/components/DisableCopy";
import PromoBanner from "./components/PromoBanner";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] }); // Initialize font

export const metadata: Metadata = {
  title: "Truth of Market | Wall Street Lies Exposed",
  description: "Data-driven financial analysis powered by AI.",
};

import { GoogleTagManager } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <GoogleTagManager gtmId="GTM-W9538SHJ" />
      <body className={`${jetbrainsMono.className} bg-black text-white antialiased`}>
        <DisableCopy />
        <div className="min-h-screen flex flex-col">
          <PromoBanner />
          {/* Header */}
          <TopNav />

          {/* Main Content */}
          <main className="flex-grow p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-[#333] py-6 text-center text-xs text-gray-500">
            © 2026 Truth of Market. Not Financial Advice.
          </footer>
        </div>
      </body>
    </html>
  );
}