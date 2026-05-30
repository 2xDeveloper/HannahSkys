import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindomVids.xyz",
  description: "Creator gallery and community",
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
        className={`${inter.className} min-h-screen bg-bp-black text-gray-100 antialiased`}
      >
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
