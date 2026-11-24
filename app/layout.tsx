import type { Metadata } from "next";
import Script from "next/script";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inner Orbit",
  description: "Discover the universe within.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}<SiteFooter/><a href="/library?ledger=1" className="native-ledger-link">Inner Ledger</a><Script src="/account-sync.js?v=3" type="module" strategy="afterInteractive" /></body>
    </html>
  );
}
