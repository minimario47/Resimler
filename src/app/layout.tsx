import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

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
      <head>
        <link rel="preconnect" href="https://wedding-photos.xaco47.workers.dev" />
        <link rel="dns-prefetch" href="https://wedding-photos.xaco47.workers.dev" />
        <link rel="preconnect" href="https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev" />
      </head>
      <body className="antialiased min-h-screen">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
