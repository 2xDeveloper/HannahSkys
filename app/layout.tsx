import type { Metadata } from "next";
import { Caveat, Nunito, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "HannahSkys",
  description: "Exclusive photos, films, and private messages from HannahSkys",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${nunito.variable} ${playfair.variable} ${caveat.variable} ${jakarta.className} relative min-h-screen bg-bp-black text-gray-100 antialiased`}
      >
        <SiteAtmosphere />
        <AgeGate />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
