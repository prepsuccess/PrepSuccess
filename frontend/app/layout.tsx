import type { Metadata } from "next";
import Script from "next/script";
import { Inter_Tight, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { PencilDefs } from "@/components/ui/PencilDefs";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { accentBootScript } from "@/lib/themes";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PrepSuccess — Know where you stand for placements",
  description:
    "PrepSuccess is an AI placement coach for college students: chat with the AI, prove your skills, and see exactly what to work on next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${interTight.variable} ${geistMono.variable} ${caveat.variable}`}
    >
      <body className="relative min-h-screen">
        {/* Before paint: flag JS (so GSAP-driven elements don't flash) and apply any saved accent colour. */}
        <Script id="boot" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js');${accentBootScript}`}
        </Script>
        <PencilDefs />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
