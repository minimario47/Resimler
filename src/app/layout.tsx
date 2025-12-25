import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Özlem & Zübeyir — Nusaybin Anıları",
  description: "Özlem ve Zübeyir'in Nusaybin'deki düğün haftasından fotoğraf ve video arşivi",
  keywords: ["düğün", "nusaybin", "özlem", "zübeyir", "fotoğraf", "video", "arşiv"],
  authors: [{ name: "Düğün Arşivi" }],
  openGraph: {
    title: "Özlem & Zübeyir — Nusaybin Anıları",
    description: "Düğün haftasından özel anlar",
    type: "website",
    locale: "tr_TR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F6F0EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" dir="ltr">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
