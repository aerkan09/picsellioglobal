import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "./contexts/I18nContext";
import ParallaxWrapper from "./components/ParallaxWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Picsellio | Güvenilir Ticaret, Global Pazar",
  description: "Yerel emeği yapay zeka ile doğrularız, dünyaya açarız. AI Verified ürünler, global satış vitrini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <ParallaxWrapper>{children}</ParallaxWrapper>
        </I18nProvider>
      </body>
    </html>
  );
}
