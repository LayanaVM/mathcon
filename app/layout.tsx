import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import BackgroundLattice from "@/components/BackgroundLattice";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IWCMPQC 2027 — International Workshop & Conference on Mathematical Models for Post-Quantum Cryptography and its Applications",
  description: "International Workshop (22–24 Feb 2027 at GRI, Tamil Nadu) and Conference (25–27 Feb 2027 at CUSAT, Kerala) on Mathematical Models for Post-Quantum Cryptography and its Applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${ebGaramond.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-[#d4e5dc] font-sans antialiased selection:bg-[#3ddc84]/30 selection:text-white relative">
        <BackgroundLattice />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
