import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MiniNav } from "@/components/ui/MiniNav";
import { Grain } from "@/components/fx/Grain";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { Preloader } from "@/components/fx/Preloader";

const display = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const num = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-num",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://artel-protocol.vercel.app"),
  title: "ARTEL: ROSCA Protocol on Stellar",
  description:
    "The story of ARTEL: arisan, the centuries-old savings circle, brought on-chain on Stellar. Trustless ROSCA with 125% collateral, triple yield, and gacha jackpot.",
  // Favicon comes from app/icon.png (Next.js file convention) — no `icons` block here to avoid duplicate <link rel=icon>.
  openGraph: {
    title: "ARTEL: ROSCA Protocol on Stellar",
    description:
      "Arisan, the centuries-old savings circle, brought on-chain on Stellar. Triple yield. Gacha jackpot. No treasurer needed.",
    images: ["/og-image.png"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${num.variable} ${body.variable}`}>
      <body suppressHydrationWarning>
        <Preloader />
        <Grain />
        <CustomCursor />
        <LocaleProvider>
          <SmoothScroll>
            <MiniNav />
            {children}
          </SmoothScroll>
        </LocaleProvider>
      </body>
    </html>
  );
}
