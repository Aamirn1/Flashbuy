import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash Buy - Flash USDT | Instant Crypto at Unbeatable Prices",
  description:
    "Buy Flash USDT instantly. 1000 Flash USDT = $10. Secure, fast, and global crypto transfers via TRC20 and BEP20. The #1 platform for Flash USDT purchases.",
  keywords: [
    "Flash Buy",
    "Flash USDT",
    "USDT",
    "crypto",
    "TRC20",
    "BEP20",
    "instant transfer",
    "buy USDT",
    "crypto marketplace",
    "flash crypto",
  ],
  icons: {
    icon: [
      { url: "/favicon-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-icon.png", sizes: "64x64", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon-icon.png" }],
  },
  openGraph: {
    title: "Flash Buy - Instant Flash USDT at Unbeatable Prices",
    description:
      "Get Flash USDT instantly. 1000 Flash USDT = $10. Secure TRC20 & BEP20 transfers. The fastest way to buy crypto.",
    url: "https://flashbuy.io",
    siteName: "Flash Buy",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Flash Buy - Instant Flash USDT | 1000 = $10",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flash Buy - Instant Flash USDT at Unbeatable Prices",
    description:
      "Get Flash USDT instantly. 1000 Flash USDT = $10. Secure TRC20 & BEP20 transfers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#34d399" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
