import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tenggol Coral Beach Resort | MIDE 2026 Quotation Calculator",
  description: "Official MIDE 2026 expo package rates calculator for Tenggol Coral Beach Resort. Instantly generate, customize, and share holiday proposals via WhatsApp and Email.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
      <body className="font-sans antialiased h-full flex flex-col selection:bg-cyan-400/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
